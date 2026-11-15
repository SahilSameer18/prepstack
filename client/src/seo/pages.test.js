import { describe, it, expect } from "vitest";
import { pageFor, indexablePages } from "./pages";

describe("pageFor", () => {
  it('the My plan builder is public, indexable and has real prerender content', () => {
    const page = pageFor('/my-plan');
    expect(page.noindex).not.toBe(true);
    expect(indexablePages.map((item) => item.path)).toContain('/my-plan');
    expect(page.description.length).toBeLessThanOrEqual(160);
    expect(page.intro.join(' ')).toContain('before creating an account');
    expect(pageFor('/my-plan/study').noindex).toBe(true);
    expect(pageFor('/my-plan/study').title).toBe('My study plan | PrepStack');
    expect(indexablePages.map((item) => item.path)).not.toContain('/my-plan/study');
  });
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
