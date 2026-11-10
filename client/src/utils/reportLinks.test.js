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

  it("gives nothing for an empty or unknown ref", () => {
    expect(refLink("")).toBeNull();
    expect(refLink(undefined)).toBeNull();
    expect(refLink("nothing:here")).toBeNull();
  });
});
