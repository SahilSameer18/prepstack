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
