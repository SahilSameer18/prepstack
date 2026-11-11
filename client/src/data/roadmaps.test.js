import { describe, it, expect } from "vitest";
import { roadmaps } from "./roadmaps";
import { iconMap } from "../pages/roadmaps/roadmapIcons";
import { ROADMAP } from "../utils/reportLinks";
import { allPages } from "../seo/pages";

const ID = /^[a-z0-9]+(-[a-z0-9]+)*$/;
const TARGET = /^[a-z0-9]+(-[a-z0-9]+)*:[a-z0-9]+(-[a-z0-9]+)*$/;
const TEMPLATE_FIELDS = ["goal", "time", "topics", "practice", "checkpoint", "project"];
const TIME_RANGE = /^\d+ to \d+ (hours|days|weeks|months)$/;
// Sites that refuse scripts or sit behind a login or paywall; a templated step uses official docs or open material instead (decided 11 Nov 2026).
const BLOCKED_HOSTS = ["udemy.com", "datacamp.com", "towardsdatascience.com", "coursera.org"];

// Problems with one step, as a list of messages (empty = fine). The template is only required of a step that has started using it.
export const checkStep = (step) => {
  const problems = [];
  if (!ID.test(step.id || "")) problems.push("id is missing or badly written");
  if (!step.title) problems.push("title is missing");
  if (!step.desc) problems.push("desc is missing");
  if (!Array.isArray(step.resources) || step.resources.length < 2 || step.resources.length > 3) problems.push("needs 2 to 3 resources");
  for (const r of step.resources || []) {
    if (!r.label) problems.push("a resource has no label");
    if (!/^https:\/\//.test(r.url || "")) problems.push(`resource "${r.label}" must be an https link`);
  }
  if (!TEMPLATE_FIELDS.some((f) => step[f] !== undefined)) return problems;
  for (const f of TEMPLATE_FIELDS) if (step[f] === undefined) problems.push(`has started the template but "${f}" is missing`);
  if (step.goal !== undefined && !/^After this step you can /.test(step.goal)) problems.push('goal must start with "After this step you can "');
  if (step.time !== undefined && !TIME_RANGE.test(String(step.time))) problems.push('time must be a range like "20 to 30 hours"');
  for (const list of ["topics", "checkpoint"]) {
    const items = step[list] || [];
    if (items.some((x) => typeof x !== "string" || !x.trim())) problems.push(`${list} must be non-empty text`);
    if (new Set(items).size !== items.length) problems.push(`${list} repeats an item`);
  }
  const urls = (step.resources || []).map((r) => r.url);
  if (new Set(urls).size !== urls.length) problems.push("a resource link is used twice");
  for (const u of urls) if (BLOCKED_HOSTS.some((h) => new URL(u).hostname.endsWith(h))) problems.push(`resource ${u} is on a site that blocks scripts or needs a login`);
  if (step.topics !== undefined && !(step.topics.length >= 4 && step.topics.length <= 8)) problems.push("needs 4 to 8 topics");
  if (step.practice !== undefined) {
    if (!step.practice.length) problems.push("needs at least one practice link");
    for (const p of step.practice) {
      if (!["notes", "sheet"].includes(p.kind)) problems.push("a practice link must be of kind notes or sheet");
      if (!TARGET.test(p.target || "")) problems.push(`practice target "${p.target}" must look like "os:os-deadlocks"`);
      if (!p.label) problems.push("a practice link has no label");
    }
  }
  if (step.checkpoint !== undefined && !(step.checkpoint.length >= 2 && step.checkpoint.length <= 3)) problems.push("needs 2 to 3 checkpoint items");
  if (step.project !== undefined && !(step.project.brief && step.project.stack)) problems.push("project needs a brief and a stack");
  if (step.project?.brief && step.project.brief.length > 300) problems.push("project brief is longer than 300 characters");
  return problems;
};

describe("the roadmap data", () => {
  it("has at least the six first roadmaps, each with a unique slug, a known icon and a list of steps", () => {
    for (const slug of ["frontend", "backend", "fullstack", "android", "data-analytics", "machine-learning"]) expect(roadmaps.some((r) => r.slug === slug), slug).toBe(true);
    expect(new Set(roadmaps.map((r) => r.slug)).size).toBe(roadmaps.length);
    for (const r of roadmaps) {
      expect(iconMap[r.icon], r.slug).toBeTruthy();
      expect(Array.isArray(r.steps) && r.steps.length > 0, r.slug).toBe(true);
      expect(r.details, `${r.slug} still has the old details list`).toBeUndefined();
    }
  });

  it("every step follows the rules, and step ids are unique inside their roadmap", () => {
    for (const r of roadmaps) {
      const ids = r.steps.map((s) => s.id);
      expect(new Set(ids).size, `${r.slug} uses a step id twice`).toBe(ids.length);
      for (const s of r.steps) expect(checkStep(s), `${r.slug} / ${s.id}`).toEqual([]);
    }
  });

  it("the first six roadmaps keep their 52 steps (Android keeps its 8 real steps)", () => {
    const first = roadmaps.filter((r) => ["frontend", "backend", "fullstack", "android", "data-analytics", "machine-learning"].includes(r.slug));
    expect(first.reduce((n, r) => n + r.steps.length, 0)).toBe(52);
    expect(roadmaps.find((r) => r.slug === "android").steps).toHaveLength(8);
  });
});

describe("checkStep: the template is checked only for a step that has started it", () => {
  const plain = { id: "html-basics", title: "HTML", desc: "d", resources: [{ label: "a", url: "https://a.dev" }, { label: "b", url: "https://b.dev" }] };
  const full = { ...plain, goal: "After this step you can write a page.", time: "10 to 15 hours", topics: ["a", "b", "c", "d"], practice: [{ kind: "notes", target: "os:os-deadlocks", label: "OS notes" }], checkpoint: ["x", "y"], project: { brief: "A page", stack: "MERN Stack" } };

  it("accepts an old-style step and a complete one", () => {
    expect(checkStep(plain)).toEqual([]);
    expect(checkStep(full)).toEqual([]);
  });
  it("the blocked-site rule applies only to a step that has started the template", () => {
    expect(checkStep({ ...plain, resources: [plain.resources[0], { label: "u", url: "https://www.udemy.com/course/x" }] })).toEqual([]);
  });
  it("rejects a step with a bad id, 1 resource or a link that is not https", () => {
    expect(checkStep({ ...plain, id: "Html Basics" }).join()).toMatch(/id is missing/);
    expect(checkStep({ ...plain, resources: [plain.resources[0]] }).join()).toMatch(/2 to 3 resources/);
    expect(checkStep({ ...plain, resources: [plain.resources[0], { label: "b", url: "http://b.dev" }] }).join()).toMatch(/https/);
  });
  it("a step that starts the template must finish it", () => {
    expect(checkStep({ ...plain, goal: "After this step you can x." }).join()).toMatch(/"time" is missing/);
  });
  it("rejects each broken part of the template", () => {
    expect(checkStep({ ...full, goal: "Learn HTML" }).join()).toMatch(/goal must start/);
    expect(checkStep({ ...full, topics: ["a", "b", "c"] }).join()).toMatch(/4 to 8 topics/);
    expect(checkStep({ ...full, time: "a few hours" }).join()).toMatch(/must be a range/);
    expect(checkStep({ ...full, time: "20 to 30 hours" })).toEqual([]);
    expect(checkStep({ ...full, topics: ["a", "a", "c", "d"] }).join()).toMatch(/repeats an item/);
    expect(checkStep({ ...full, checkpoint: ["x", " "] }).join()).toMatch(/non-empty text/);
    expect(checkStep({ ...full, resources: [plain.resources[0], plain.resources[0]] }).join()).toMatch(/used twice/);
    expect(checkStep({ ...full, resources: [plain.resources[0], { label: "u", url: "https://www.udemy.com/course/x" }] }).join()).toMatch(/blocks scripts/);
    expect(checkStep({ ...full, project: { brief: "x".repeat(301), stack: "MERN Stack" } }).join()).toMatch(/longer than 300/);
    expect(checkStep({ ...full, topics: Array.from({ length: 9 }, (_, i) => String(i)) }).join()).toMatch(/4 to 8 topics/);
    expect(checkStep({ ...full, practice: [] }).join()).toMatch(/at least one practice/);
    expect(checkStep({ ...full, practice: [{ kind: "video", target: "os:os-deadlocks", label: "x" }] }).join()).toMatch(/notes or sheet/);
    expect(checkStep({ ...full, practice: [{ kind: "notes", target: "deadlocks", label: "x" }] }).join()).toMatch(/must look like/);
    expect(checkStep({ ...full, checkpoint: ["only one"] }).join()).toMatch(/2 to 3 checkpoint/);
    expect(checkStep({ ...full, project: { brief: "", stack: "x" } }).join()).toMatch(/brief and a stack/);
  });
});

describe("the copies of the roadmap list stay in sync with the data", () => {
  const slugs = roadmaps.map((r) => r.slug).sort();

  it("the SEO pages list exactly these roadmaps", () => {
    const seo = allPages.filter((p) => /^\/roadmaps\/[^/]+$/.test(p.path)).map((p) => p.path.split("/")[2]).sort();
    expect(seo).toEqual(slugs);
  });
  it("the report links know the name of every roadmap", () => {
    expect(Object.keys(ROADMAP).sort()).toEqual(slugs);
  });
});
