import { describe, it, expect } from "vitest";
import { refLink } from "./reportLinks";

describe("refLink", () => {
  const titles = { "notes:os:os-deadlocks": "Deadlocks", "dsa:blind-75:arrays-hashing": "Arrays & Hashing" };

  it("shows the readable title for a ref made of ids, and links to its notes section, the sheet or the roadmap page", () => {
    expect(refLink("notes:os:os-deadlocks", titles)).toEqual({ path: "/notes/os/os-deadlocks", label: "OS notes: Deadlocks" });
    expect(refLink("dsa:blind-75:arrays-hashing", titles)).toEqual({ path: "/dsa/blind-75", label: "Blind 75: Arrays & Hashing" });
    expect(refLink("roadmap:backend", titles)).toEqual({ path: "/roadmaps/backend", label: "Backend roadmap" });
  });

  it("still reads a report saved before ids were used: the text after the last colon is the title", () => {
    expect(refLink("notes:os:Deadlocks")).toEqual({ path: "/notes/os", label: "OS notes: Deadlocks" });
    expect(refLink("notes:os:Processes: Threads", {})).toEqual({ path: "/notes/os", label: "OS notes: Processes: Threads" });
    expect(refLink("dsa:Arrays")).toEqual({ path: "/dsa/blind-75", label: "Blind 75: Arrays" });
  });

  it("opens the sheet a dsa ref names, not always Blind 75", () => {
    expect(refLink("dsa:neetcode-150:advanced-graphs", { "dsa:neetcode-150:advanced-graphs": "Advanced Graphs" })).toEqual({ path: "/dsa/neetcode-150", label: "NeetCode 150: Advanced Graphs" });
    expect(refLink("dsa:striver-a2z:introduction-to-dp")).toEqual({ path: "/dsa/striver-a2z", label: "Striver A2Z: introduction-to-dp" });
    expect(refLink("dsa:love-babbar:array", { "dsa:love-babbar:array": "Array" })).toEqual({ path: "/dsa/love-babbar", label: "Love Babbar: Array" });
  });

  it("knows the behavioral and project kinds a plan item can have", () => {
    expect(refLink("behavioral:7", { "behavioral:7": "Tell me about a conflict" })).toEqual({ path: "/behavioral", label: "Behavioral question: Tell me about a conflict" });
    expect(refLink("behavioral:7")).toEqual({ path: "/behavioral", label: "Behavioral question: 7" });
    expect(refLink("project:backend:os-networking-basics", { "project:backend:os-networking-basics": "OS & Networking Basics" })).toEqual({ path: "/roadmaps/backend#os-networking-basics", label: "Backend project: OS & Networking Basics" });
    expect(refLink("project:backend:os-networking-basics")).toEqual({ path: "/roadmaps/backend#os-networking-basics", label: "Backend project: os-networking-basics" });
  });

  it("a mock block has no page, so it gives nothing", () => {
    expect(refLink("mock:4")).toBeNull();
  });

  it("gives nothing for an empty or unknown ref", () => {
    expect(refLink("")).toBeNull();
    expect(refLink(undefined)).toBeNull();
    expect(refLink("nothing:here")).toBeNull();
  });
});
