import { describe, it, expect } from "vitest";
import { layoutDiagram } from "./diagramLayout";

const inside = (layout) => layout.boxes.every((b) => b.x >= 0 && b.y >= 0 && b.x + b.w <= layout.width && b.y + b.h <= layout.height);

describe("flow diagram layout", () => {
  const flow = { kind: "flow", caption: "c", steps: [{ label: "New" }, { label: "Ready" }, { label: "Running" }] };

  it("puts a short flow in one row, left to right, with an arrow between each pair of steps", () => {
    const l = layoutDiagram(flow);
    expect(l.boxes.map((b) => b.label)).toEqual(["New", "Ready", "Running"]);
    expect(new Set(l.boxes.map((b) => b.y)).size).toBe(1);
    expect(l.boxes[0].x).toBeLessThan(l.boxes[1].x);
    expect(l.boxes[1].x).toBeLessThan(l.boxes[2].x);
    expect(l.arrows).toHaveLength(2);
    expect(l.arrows[0].x1).toBe(l.boxes[0].x + l.boxes[0].w);
    expect(l.arrows[0].x2).toBe(l.boxes[1].x);
    expect(inside(l)).toBe(true);
  });

  it("stacks a flow that is too wide for one row, top to bottom", () => {
    const long = { kind: "flow", caption: "c", steps: Array.from({ length: 8 }, (_, i) => ({ label: `A fairly long step name ${i}` })) };
    const l = layoutDiagram(long);
    expect(new Set(l.boxes.map((b) => b.x)).size).toBe(1);
    expect(l.boxes.map((b) => b.y)).toEqual([...l.boxes.map((b) => b.y)].sort((a, b) => a - b));
    expect(l.arrows).toHaveLength(7);
    expect(inside(l)).toBe(true);
  });

  it("a longer label makes a wider box", () => {
    const l = layoutDiagram({ kind: "flow", caption: "c", steps: [{ label: "A" }, { label: "A much longer label here" }] });
    expect(l.boxes[1].w).toBeGreaterThan(l.boxes[0].w);
  });
});

describe("layers diagram layout", () => {
  it("stacks the layers top to bottom, all the same width, without arrows", () => {
    const l = layoutDiagram({ kind: "layers", caption: "c", layers: [{ label: "Application" }, { label: "Transport" }, { label: "Network" }] });
    expect(l.boxes.map((b) => b.label)).toEqual(["Application", "Transport", "Network"]);
    expect(new Set(l.boxes.map((b) => b.w)).size).toBe(1);
    expect(l.boxes[0].y).toBeLessThan(l.boxes[1].y);
    expect(l.arrows).toEqual([]);
    expect(inside(l)).toBe(true);
  });
});

describe("graph diagram layout", () => {
  const graph = {
    kind: "graph",
    caption: "c",
    nodes: [{ id: "a", label: "P1", x: 10, y: 20 }, { id: "b", label: "P2", x: 90, y: 20 }, { id: "c", label: "P3", x: 50, y: 90 }],
    edges: [{ from: "a", to: "b" }, { from: "b", to: "a" }, { from: "b", to: "c", label: "waits" }],
  };

  it("places each node at its position, left to right and top to bottom", () => {
    const l = layoutDiagram(graph);
    const [a, b, c] = l.boxes;
    expect(a.x + a.w / 2).toBeLessThan(b.x + b.w / 2);
    expect(c.y).toBeGreaterThan(a.y);
    expect(inside(l)).toBe(true);
  });

  it("starts and ends each arrow on the edge of a box, not in its middle", () => {
    const l = layoutDiagram(graph);
    const [a, b] = l.boxes;
    const arrow = l.arrows[2];
    const c = l.boxes[2];
    expect(arrow.label).toBe("waits");
    expect(arrow.y1).toBeCloseTo(b.y + b.h, 0);
    expect(arrow.y2).toBeCloseTo(c.y, 0);
    expect(a.x + a.w).toBeLessThan(l.arrows[0].x2 + 1);
  });

  it("draws two edges between the same nodes side by side so both are visible", () => {
    const l = layoutDiagram(graph);
    expect(l.arrows[0].y1).not.toBeCloseTo(l.arrows[1].y1, 1);
  });

  it("a one-way edge is not shifted", () => {
    const l = layoutDiagram({ ...graph, edges: [{ from: "a", to: "b" }] });
    const [a, b] = l.boxes;
    expect(l.arrows[0].y1).toBeCloseTo(a.y + a.h / 2, 5);
    expect(l.arrows[0].y2).toBeCloseTo(b.y + b.h / 2, 5);
  });
});

describe("graph diagram layout: shapes, zones, numbered and dashed arrows", () => {
  const arch = {
    kind: "graph",
    caption: "c",
    groups: [{ id: "dc", label: "Data centre" }],
    nodes: [
      { id: "u", label: "User", x: 8, y: 50, shape: "client" },
      { id: "s", label: "Service", x: 40, y: 50, group: "dc" },
      { id: "d", label: "Database", x: 75, y: 30, shape: "database", group: "dc" },
      { id: "q", label: "Queue", x: 75, y: 75, shape: "queue", group: "dc" },
    ],
    edges: [{ from: "u", to: "s", step: 1 }, { from: "s", to: "d", step: 2 }, { from: "s", to: "q", dashed: true }],
  };

  it("keeps the shape of each node and defaults to a box", () => {
    const l = layoutDiagram(arch);
    expect(l.boxes.map((b) => b.shape)).toEqual(["client", "box", "database", "queue"]);
  });

  it("wraps the nodes of a zone in one box with room for its label, and every box stays inside the picture", () => {
    const l = layoutDiagram(arch);
    expect(l.groups).toHaveLength(1);
    const g = l.groups[0];
    const members = l.boxes.filter((b) => ["s", "d", "q"].includes(b.key));
    members.forEach((b) => {
      expect(b.x).toBeGreaterThan(g.x);
      expect(b.x + b.w).toBeLessThan(g.x + g.w);
      expect(b.y).toBeGreaterThan(g.y + 16);
      expect(b.y + b.h).toBeLessThan(g.y + g.h);
    });
    expect(g.x).toBeGreaterThanOrEqual(0);
    expect(g.y).toBeGreaterThanOrEqual(0);
    expect(g.x + g.w).toBeLessThanOrEqual(l.width);
    expect(g.y + g.h).toBeLessThanOrEqual(l.height);
    expect(inside(l)).toBe(true);
  });

  it("carries the step number and the dashed style onto the arrows", () => {
    const l = layoutDiagram(arch);
    expect(l.arrows.map((a) => a.step)).toEqual([1, 2, undefined]);
    expect(l.arrows.map((a) => !!a.dashed)).toEqual([false, false, true]);
  });

  it("a graph with no zones returns an empty list of zones, and one with more than 8 nodes gets a taller canvas", () => {
    expect(layoutDiagram({ kind: "graph", caption: "c", nodes: [{ id: "a", label: "A", x: 0, y: 0 }, { id: "b", label: "B", x: 100, y: 100 }], edges: [] }).groups).toEqual([]);
    const nodes = (n) => Array.from({ length: n }, (_, i) => ({ id: `n${i}`, label: `N${i}`, x: (i % 4) * 30, y: i < n / 2 ? 0 : 100 }));
    const small = layoutDiagram({ kind: "graph", caption: "c", nodes: nodes(8), edges: [] });
    const big = layoutDiagram({ kind: "graph", caption: "c", nodes: nodes(12), edges: [] });
    expect(big.height).toBeGreaterThan(small.height);
  });
});

describe("sequence diagram layout", () => {
  const seq = {
    kind: "sequence",
    caption: "c",
    actors: [{ id: "c", label: "Client" }, { id: "s", label: "Server" }, { id: "d", label: "Database" }],
    messages: [{ from: "c", to: "s", label: "Request" }, { from: "s", to: "d", label: "Query" }, { from: "d", to: "s", label: "Rows", dashed: true }, { from: "s", to: "c", label: "Response" }],
  };

  it("puts the actors left to right with one lifeline each, and the messages top to bottom in the order given", () => {
    const l = layoutDiagram(seq);
    expect(l.boxes.map((b) => b.label)).toEqual(["Client", "Server", "Database"]);
    expect(l.lifelines).toHaveLength(3);
    expect(l.lifelines[0].x).toBeLessThan(l.lifelines[1].x);
    const ys = l.arrows.map((a) => a.y1);
    expect(ys).toEqual([...ys].sort((a, b) => a - b));
    expect(new Set(ys).size).toBe(4);
    expect(l.arrows.every((a) => a.y1 === a.y2)).toBe(true);
  });

  it("starts each message on the lifeline of its sender and ends it on the lifeline of its receiver", () => {
    const l = layoutDiagram(seq);
    expect(l.arrows[0].x1).toBe(l.lifelines[0].x);
    expect(l.arrows[0].x2).toBe(l.lifelines[1].x);
    expect(l.arrows[2].x1).toBe(l.lifelines[2].x);
    expect(l.arrows[2].x2).toBe(l.lifelines[1].x);
  });

  it("numbers the messages in the label and keeps the dashed style", () => {
    const l = layoutDiagram(seq);
    expect(l.arrows.map((a) => a.label)).toEqual(["1. Request", "2. Query", "3. Rows", "4. Response"]);
    expect(l.arrows.map((a) => !!a.dashed)).toEqual([false, false, true, false]);
  });

  it("makes the columns wide enough for a long label, and the lifelines end inside the picture", () => {
    const longMsg = { ...seq, messages: [{ from: "c", to: "s", label: "A message label that is quite long indeed" }] };
    const l = layoutDiagram(longMsg);
    const gap = l.lifelines[1].x - l.lifelines[0].x;
    expect(gap).toBeGreaterThan("1. A message label that is quite long indeed".length * 6.6);
    expect(l.lifelines.every((x) => x.y2 < l.height)).toBe(true);
    expect(inside(l)).toBe(true);
  });
});
