// Works out where everything goes in a diagram, kept apart from the screen so it can be tested.
// A diagram is plain data: { kind: 'flow' | 'layers' | 'graph', caption, ... } (the rules are in server/src/validators/notes.validators.js).
// Every layout returns { width, height, boxes: [{ key, label, x, y, w, h }], arrows: [{ x1, y1, x2, y2, label }] } in SVG units.
const BOX_H = 44;
const GAP = 36;
const PAD = 16;
const MAX_ROW = 640;
const GRAPH_W = 600;
const GRAPH_H = 280;
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
  const boxes = graph.nodes.map((n) => {
    const w = boxWidth(n.label);
    return { key: n.id, label: n.label, x: PAD + (n.x / 100) * (GRAPH_W - PAD * 2) - w / 2, y: PAD + (n.y / 100) * (GRAPH_H - PAD * 2) - GRAPH_BOX_H / 2, w, h: GRAPH_BOX_H };
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
    return { x1: from.x + ox, y1: from.y + oy, x2: to.x + ox, y2: to.y + oy, label: e.label };
  });
  // crop to what is drawn, so a graph of two nodes is not a mostly empty box
  const left = Math.min(...boxes.map((b) => b.x)) - PAD;
  const top = Math.min(...boxes.map((b) => b.y)) - PAD;
  const width = Math.max(...boxes.map((b) => b.x + b.w)) + PAD - left;
  const height = Math.max(...boxes.map((b) => b.y + b.h)) + PAD - top;
  return {
    width,
    height,
    boxes: boxes.map((b) => ({ ...b, x: b.x - left, y: b.y - top })),
    arrows: arrows.map((r) => ({ ...r, x1: r.x1 - left, y1: r.y1 - top, x2: r.x2 - left, y2: r.y2 - top })),
  };
};

export const layoutDiagram = (diagram) => {
  if (diagram.kind === 'flow') return layoutFlow(diagram.steps);
  if (diagram.kind === 'layers') return layoutLayers(diagram.layers);
  return layoutGraph(diagram);
};
