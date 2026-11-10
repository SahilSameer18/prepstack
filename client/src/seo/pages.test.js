import { describe, it, expect } from "vitest";
import { pageFor } from "./pages";

describe("pageFor", () => {
  it("gives a notes section the title of its subject, kept private (noindex)", () => {
    const subject = pageFor("/notes/os");
    const section = pageFor("/notes/os/os-deadlocks");
    expect(section.title).toBe(subject.title);
    expect(section.title).not.toMatch(/not found/i);
    expect(section.noindex).toBe(true);
    expect(section.path).toBe("/notes/os/os-deadlocks");
  });

  it("still says 'not found' for a section of a subject that does not exist, and for other unknown paths", () => {
    expect(pageFor("/notes/nope/some-section").title).toMatch(/not found/i);
    expect(pageFor("/no/such/page").title).toMatch(/not found/i);
  });
});
