import { describe, it, expect } from "vitest";
import { pageFor, indexablePages, jsonLdFor } from "./pages";

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
  it("sheets, notes, roadmaps and the behavioral guide are open to read, so they are indexable; the resume guide stays private", () => {
    const paths = indexablePages.map((item) => item.path);
    for (const open of ['/dsa/neetcode-150', '/notes/os', '/roadmaps/backend', '/behavioral']) expect(paths).toContain(open);
    expect(paths).not.toContain('/resume');
    expect(pageFor('/resume').noindex).toBe(true);
  });
  it("gives every notes section its own indexable page: its own title, description, canonical data and reading time", () => {
    const section = pageFor("/notes/os/os-deadlocks");
    expect(section.title).toBe("Deadlocks: OS Interview Notes");
    expect(section.noindex).not.toBe(true);
    expect(section.path).toBe("/notes/os/os-deadlocks");
    expect(section.parent.path).toBe("/notes/os");
    expect(section.description.length).toBeGreaterThanOrEqual(110);
    expect(jsonLdFor(section).map((x) => x["@type"])).toEqual(["LearningResource", "BreadcrumbList"]);
    expect(jsonLdFor(section)[0].timeRequired).toMatch(/^PT\d+M$/);
    const sections = indexablePages.filter((p) => /^\/notes\/[^/]+\/[^/]+$/.test(p.path));
    expect(sections).toHaveLength(64);
    expect(new Set(sections.map((p) => p.title)).size).toBe(64);
    expect(new Set(sections.map((p) => p.description)).size).toBe(64);
    expect(sections.every((p) => p.title.length <= 60)).toBe(true);
    // the subject page links to each of its sections, so crawlers can reach them
    expect(pageFor("/notes/os").links.map((l) => l.path)).toContain("/notes/os/os-deadlocks");
  });
  it("the home page leads with the study plan, which is what sets PrepStack apart", () => {
    const home = pageFor("/");
    expect(home.title).toMatch(/study plan/i);
    expect(home.description).toMatch(/study plan/i);
    expect(home.links.map((l) => l.path)).toContain("/my-plan");
  });

  it("still says 'not found' for a section of a subject that does not exist, and for other unknown paths", () => {
    expect(pageFor("/notes/nope/some-section").title).toMatch(/not found/i);
    expect(pageFor("/notes/os/no-such-section").title).toMatch(/not found/i);
    expect(pageFor("/no/such/page").title).toMatch(/not found/i);
  });
});
