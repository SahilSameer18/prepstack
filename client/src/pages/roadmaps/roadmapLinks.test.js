import { describe, it, expect } from "vitest";
import { practiceLink, projectLink } from "./roadmapLinks";

describe("roadmap step links", () => {
  it("a notes practice entry opens that notes section", () => {
    expect(practiceLink({ kind: "notes", target: "os:os-deadlocks", label: "OS notes: Deadlocks" })).toEqual({ path: "/notes/os/os-deadlocks", label: "OS notes: Deadlocks" });
  });
  it("a sheet practice entry opens that sheet", () => {
    expect(practiceLink({ kind: "sheet", target: "blind-75:graph", label: "Graph problems" })).toEqual({ path: "/dsa/blind-75", label: "Graph problems" });
  });
  it("the mini-project opens the AI generator with the stack filled in, written safely", () => {
    expect(projectLink({ brief: "b", stack: "MERN Stack" })).toBe("/ai-projects?stack=MERN%20Stack");
    expect(projectLink({ brief: "b", stack: "Java / Spring Boot" })).toBe("/ai-projects?stack=Java%20%2F%20Spring%20Boot");
  });
});
