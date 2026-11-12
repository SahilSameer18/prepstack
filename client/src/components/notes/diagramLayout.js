// Works out where everything goes in a diagram, kept apart from the screen so it can be tested.
// A diagram is plain data: { kind: 'flow' | 'layers' | 'graph' | 'sequence', caption, ... } (the rules are in server/src/validators/notes.validators.js).
// Every layout returns { width, height, boxes: [{ key, label, x, y, w, h, shape? }], arrows: [{ x1, y1, x2, y2, label, step?, dashed? }] } in SVG units;
// a graph also returns groups (zone boxes) and a sequence also returns lifelines.
const BOX_H = 44;
const GAP = 36;
const PAD = 16;
const MAX_ROW = 640;
const GRAPH_W = 600;
const GRAPH_H = 280;
const GRAPH_H_BIG = 400; // a graph with more than 8 nodes gets a taller canvas
const QUEUE_EXTRA = 24; // a queue box keeps its right edge for the tick marks, so its label stays clear of them
const GROUP_PAD = 14;
const GROUP_LABEL_H = 16;
const SEQ_ACTOR_H = 36;
const SEQ_ROW = 40;
const GRAPH_BOX_H = 36;

const boxWidth = (label) => Math.max(96, Math.round(label.length * 7.5 + 28));

const layoutFlow = (steps) => {
  const widths = steps.map((s) => boxWidth(s.label));
  const rowWidth = widths.reduce((a, b) => a + b, 0) + GAP * (steps.length - 1) + PAD * 2;
  if (rowWidth <= MAX_ROW) {
    let x = PAD;
    const boxes = steps.map((s, i) => {
      const box = { key: `${i}`, label: s.label, x, y: PAD, w: widths[i], h: BOX_H };
      x += widths[i] + GAP;
      return box;
    });
    const arrows = boxes.slice(0, -1).map((b, i) => ({ x1: b.x + b.w, y1: PAD + BOX_H / 2, x2: boxes[i + 1].x, y2: PAD + BOX_H / 2 }));
    return { width: rowWidth, height: PAD * 2 + BOX_H, boxes, arrows };
  }
  // too wide for one row: stack the steps top to bottom, centred
  const w = Math.max(...widths);
  const boxes = steps.map((s, i) => ({ key: `${i}`, label: s.label, x: PAD, y: PAD + i * (BOX_H + GAP), w, h: BOX_H }));
  const arrows = boxes.slice(0, -1).map((b, i) => ({ x1: PAD + w / 2, y1: b.y + BOX_H, x2: PAD + w / 2, y2: boxes[i + 1].y }));
  return { width: w + PAD * 2, height: PAD * 2 + steps.length * BOX_H + (steps.length - 1) * GAP, boxes, arrows };
};

const layoutLayers = (layers) => {
  const w = Math.max(220, ...layers.map((l) => boxWidth(l.label)));
  const boxes = layers.map((l, i) => ({ key: `${i}`, label: l.label, x: PAD, y: PAD + i * (BOX_H + 6), w, h: BOX_H }));
  return { width: w + PAD * 2, height: PAD * 2 + layers.length * BOX_H + (layers.length - 1) * 6, boxes, arrows: [] };
};

// the point where the line from a box's centre towards (tx, ty) leaves the box
const leaveBox = (box, tx, ty) => {
  const cx = box.x + box.w / 2;
  const cy = box.y + box.h / 2;
  const dx = tx - cx;
  const dy = ty - cy;
  if (dx === 0 && dy === 0) return { x: cx, y: cy };
  const scale = 1 / Math.max(Math.abs(dx) / (box.w / 2), Math.abs(dy) / (box.h / 2));
  return { x: cx + dx * scale, y: cy + dy * scale };
};

const layoutGraph = (graph) => {
  const canvasH = graph.nodes.length > 8 ? GRAPH_H_BIG : GRAPH_H;
  const boxes = graph.nodes.map((n) => {
    const w = boxWidth(n.label) + (n.shape === 'queue' ? QUEUE_EXTRA : 0);
    return { key: n.id, label: n.label, shape: n.shape || 'box', x: PAD + (n.x / 100) * (GRAPH_W - PAD * 2) - w / 2, y: PAD + (n.y / 100) * (canvasH - PAD * 2) - GRAPH_BOX_H / 2, w, h: GRAPH_BOX_H };
  });
  const byId = Object.fromEntries(boxes.map((b) => [b.key, b]));
  const arrows = graph.edges.map((e) => {
    const a = byId[e.from];
    const b = byId[e.to];
    const reverse = graph.edges.some((o) => o.from === e.to && o.to === e.from);
    const ca = { x: a.x + a.w / 2, y: a.y + a.h / 2 };
    const cb = { x: b.x + b.w / 2, y: b.y + b.h / 2 };
    // two edges between the same nodes (one each way) are drawn side by side, so both stay visible
    const len = Math.hypot(cb.x - ca.x, cb.y - ca.y) || 1;
    const shift = reverse ? 7 : 0;
    const ox = (-(cb.y - ca.y) / len) * shift;
    const oy = ((cb.x - ca.x) / len) * shift;
    const from = leaveBox(a, cb.x + ox, cb.y + oy);
    const to = leaveBox(b, ca.x + ox, ca.y + oy);
    return { x1: from.x + ox, y1: from.y + oy, x2: to.x + ox, y2: to.y + oy, label: e.label, step: e.step, dashed: e.dashed };
  });
  // a zone box wraps the nodes that name it, with room on top for its label
  const groups = (graph.groups || []).map((g) => {
    const members = graph.nodes.map((n, i) => (n.group === g.id ? boxes[i] : null)).filter(Boolean);
    const x = Math.min(...members.map((b) => b.x)) - GROUP_PAD;
    const y = Math.min(...members.map((b) => b.y)) - GROUP_PAD - GROUP_LABEL_H;
    return { key: g.id, label: g.label, x, y, w: Math.max(...members.map((b) => b.x + b.w)) + GROUP_PAD - x, h: Math.max(...members.map((b) => b.y + b.h)) + GROUP_PAD - y };
  });
  // crop to what is drawn, so a graph of two nodes is not a mostly empty box
  const parts = [...boxes, ...groups];
  const left = Math.min(...parts.map((b) => b.x)) - PAD;
  const top = Math.min(...parts.map((b) => b.y)) - PAD;
  const width = Math.max(...parts.map((b) => b.x + b.w)) + PAD - left;
  const height = Math.max(...parts.map((b) => b.y + b.h)) + PAD - top;
  return {
    width,
    height,
    groups: groups.map((g) => ({ ...g, x: g.x - left, y: g.y - top })),
    boxes: boxes.map((b) => ({ ...b, x: b.x - left, y: b.y - top })),
    arrows: arrows.map((r) => ({ ...r, x1: r.x1 - left, y1: r.y1 - top, x2: r.x2 - left, y2: r.y2 - top })),
  };
};

// Actors across the top, one lifeline each, messages top to bottom in the order given (numbered "1. label").
// The columns are as wide as the longest message needs, so a label never runs into the next lifeline.
const layoutSequence = (seq) => {
  const index = Object.fromEntries(seq.actors.map((a, i) => [a.id, i]));
  let colW = Math.max(140, ...seq.actors.map((a) => boxWidth(a.label) + 16));
  seq.messages.forEach((m, i) => {
    const span = Math.abs(index[m.to] - index[m.from]);
    colW = Math.max(colW, Math.ceil((`${i + 1}. ${m.label}`.length * 6.6 + 24) / span));
  });
  const cx = (i) => PAD + colW * (i + 0.5);
  const boxes = seq.actors.map((a, i) => ({ key: a.id, label: a.label, x: cx(i) - (colW - 16) / 2, y: PAD, w: colW - 16, h: SEQ_ACTOR_H }));
  const firstY = PAD + SEQ_ACTOR_H + 28;
  const arrows = seq.messages.map((m, i) => {
    const y = firstY + i * SEQ_ROW;
    return { x1: cx(index[m.from]), y1: y, x2: cx(index[m.to]), y2: y, label: `${i + 1}. ${m.label}`, dashed: m.dashed };
  });
  const endY = firstY + (seq.messages.length - 1) * SEQ_ROW + 24;
  const lifelines = seq.actors.map((a, i) => ({ key: a.id, x: cx(i), y1: PAD + SEQ_ACTOR_H, y2: endY }));
  return { width: colW * seq.actors.length + PAD * 2, height: endY + PAD, boxes, arrows, lifelines };
};

export const layoutDiagram = (diagram) => {
  if (diagram.kind === 'flow') return layoutFlow(diagram.steps);
  if (diagram.kind === 'layers') return layoutLayers(diagram.layers);
  if (diagram.kind === 'sequence') return layoutSequence(diagram);
  return layoutGraph(diagram);
};
