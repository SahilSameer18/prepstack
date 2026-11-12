const { z } = require('zod');

// Rules for the notes data in server/src/data/notes/*.js (see docs/content/NOTES_TEMPLATE.md).
//
// Always enforced: every section has a unique id (<subject>-<words>, never changed) and a title, and topics is a list.
// Enforced only on a section that has lastChecked: the full template. A section gets lastChecked only when it has been
// rewritten and reviewed, so the strict check turns on one section at a time while older sections stay as they are.

const ID_PATTERN = /^[a-z0-9]+(-[a-z0-9]+)*$/;
const wordCount = (text) => text.trim().split(/\s+/).filter(Boolean).length;
const text = (what) => z.string({ error: `${what} is required` }).trim().min(1, `${what} must not be empty`);

const topicSchema = z.looseObject({
  name: text('topic name'),
  definition: text('topic definition'),
  why: text('topic "why it matters"'),
  example: text('topic example'),
  failure: text('topic "how it fails"'),
});

const questionSchema = z.looseObject({ question: text('question'), answer: text('answer') });

const quizItemSchema = z.looseObject({
  question: text('quiz question'),
  options: z.array(text('quiz option')).length(4, 'a quiz question needs exactly 4 options')
    .refine((o) => new Set(o).size === o.length, 'quiz options must be different from each other'),
  answer: z.number().int().min(0, 'quiz answer must be 0 to 3').max(3, 'quiz answer must be 0 to 3'),
  explanation: text('quiz explanation'),
});

// A link to another place is "<sheetSlug>:<topicId>" or "<roadmapSlug>:<stepId>"; the internal-link test checks that it resolves.
const targetId = (what) => z.string({ error: `${what} is required` }).regex(/^[a-z0-9]+(-[a-z0-9]+)*:[a-z0-9]+(-[a-z0-9]+)*$/, `${what} must look like "blind-75:graph"`);
const linksSchema = z.looseObject({
  sheetTopics: z.array(targetId('sheet topic link')),
  roadmapSteps: z.array(targetId('roadmap step link')),
  next: z.string().regex(ID_PATTERN, 'next must be a section id').nullable(),
}).refine((l) => l.sheetTopics.length + l.roadmapSteps.length > 0, 'links must point to at least one sheet topic or roadmap step');

// A diagram is plain data drawn by one SVG component in the client (kinds: flow, layers, graph, sequence), always with a text caption.
const MAX_DIAGRAMS = 3;
const MAX_DIAGRAMS_HLD = 6;
const NODE_SHAPES = ['box', 'database', 'queue', 'cache', 'client', 'external'];
const coordinate = z.number({ error: 'node x and y are required' }).min(0, 'node x and y must be 0 to 100').max(100, 'node x and y must be 0 to 100');
const diagramSchema = z.discriminatedUnion('kind', [
  z.looseObject({ kind: z.literal('flow'), caption: text('diagram caption'), steps: z.array(z.looseObject({ label: text('step label') })).min(2, 'a flow needs 2 to 8 steps').max(8, 'a flow needs 2 to 8 steps') }),
  z.looseObject({ kind: z.literal('layers'), caption: text('diagram caption'), layers: z.array(z.looseObject({ label: text('layer label') })).min(2, 'layers need 2 to 8 entries').max(8, 'layers need 2 to 8 entries') }),
  z.looseObject({
    kind: z.literal('graph'),
    caption: text('diagram caption'),
    // shape: how a node is drawn (database = cylinder, queue, cache, client = rounded, external = dashed); group: the id of a zone box drawn around nodes
    nodes: z.array(z.looseObject({
      id: text('node id'), label: text('node label'), x: coordinate, y: coordinate,
      shape: z.enum(NODE_SHAPES, { error: `node shape must be one of ${NODE_SHAPES.join(', ')}` }).optional(),
      group: z.string().optional(),
    })).min(2, 'a graph needs 2 to 14 nodes').max(14, 'a graph needs 2 to 14 nodes'),
    // step: the number shown on an arrow (the order of a request path); dashed: an asynchronous or optional path
    edges: z.array(z.looseObject({
      from: text('edge from'), to: text('edge to'),
      step: z.number().int().min(1, 'edge step must be 1 to 20').max(20, 'edge step must be 1 to 20').optional(),
      dashed: z.boolean({ error: 'edge dashed must be true or false' }).optional(),
    })),
    groups: z.array(z.looseObject({ id: text('group id'), label: text('group label') })).max(3, 'a graph can have at most 3 groups').optional(),
  }).superRefine((g, ctx) => {
    const ids = g.nodes.map((n) => n.id);
    if (new Set(ids).size !== ids.length) ctx.addIssue({ code: 'custom', message: 'graph node ids must be different from each other' });
    for (const e of g.edges) if (e.from === e.to) ctx.addIssue({ code: 'custom', message: `graph edge ${e.from} cannot point to itself` });
    for (const e of g.edges) if (!ids.includes(e.from) || !ids.includes(e.to)) ctx.addIssue({ code: 'custom', message: `graph edge ${e.from} to ${e.to} uses a node that does not exist` });
    const groupIds = (g.groups || []).map((x) => x.id);
    if (new Set(groupIds).size !== groupIds.length) ctx.addIssue({ code: 'custom', message: 'graph group ids must be different from each other' });
    for (const n of g.nodes) if (n.group !== undefined && !groupIds.includes(n.group)) ctx.addIssue({ code: 'custom', message: `graph node ${n.id} uses a group that does not exist` });
    for (const id of groupIds) if (!g.nodes.some((n) => n.group === id)) ctx.addIssue({ code: 'custom', message: `graph group ${id} has no nodes` });
  }),
  // messages between actors over time (Raft, two-phase commit, retries); drawn top to bottom in the order given
  z.looseObject({
    kind: z.literal('sequence'),
    caption: text('diagram caption'),
    actors: z.array(z.looseObject({ id: text('actor id'), label: text('actor label') })).min(2, 'a sequence needs 2 to 5 actors').max(5, 'a sequence needs 2 to 5 actors'),
    messages: z.array(z.looseObject({
      from: text('message from'), to: text('message to'),
      label: text('message label').refine((s) => s.length <= 40, 'a message label must be 40 characters or fewer'),
      dashed: z.boolean({ error: 'message dashed must be true or false' }).optional(),
    })).min(1, 'a sequence needs 1 to 12 messages').max(12, 'a sequence needs 1 to 12 messages'),
  }).superRefine((s, ctx) => {
    const ids = s.actors.map((a) => a.id);
    if (new Set(ids).size !== ids.length) ctx.addIssue({ code: 'custom', message: 'sequence actor ids must be different from each other' });
    for (const m of s.messages) if (m.from === m.to) ctx.addIssue({ code: 'custom', message: `sequence message ${m.from} cannot go to itself` });
    for (const m of s.messages) if (!ids.includes(m.from) || !ids.includes(m.to)) ctx.addIssue({ code: 'custom', message: `sequence message ${m.from} to ${m.to} uses an actor that does not exist` });
  }),
]);

const isRealDate = (s) => !Number.isNaN(Date.parse(s)) && new Date(s).toISOString().slice(0, 10) === s;

// The full template, for a section with lastChecked.
const templateSchema = z.looseObject({
  lastChecked: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'lastChecked must look like 2026-11-09').refine(isRealDate, 'lastChecked must be a real date'),
  overview: z.array(text('overview line')).refine((lines) => {
    const n = wordCount(lines.join(' '));
    return n >= 60 && n <= 120;
  }, 'overview must be 60 to 120 words'),
  topics: z.array(topicSchema).min(4, 'a section needs 4 to 8 topics').max(8, 'a section needs 4 to 8 topics'),
  questions: z.array(questionSchema).min(3, 'a section needs 3 to 5 interview questions').max(5, 'a section needs 3 to 5 interview questions'),
  mistakes: z.array(text('mistake')).min(2, 'a section needs 2 to 3 common mistakes').max(3, 'a section needs 2 to 3 common mistakes'),
  quiz: z.array(quizItemSchema).length(5, 'a section needs exactly 5 quiz questions'),
  links: linksSchema,
  diagrams: z.array(diagramSchema).max(MAX_DIAGRAMS_HLD, `at most ${MAX_DIAGRAMS_HLD} diagrams per section`).optional(),
});

// Checks one subject (slug: os, dbms, cn, oops; data: { subject, sections }). Returns a list of problems (empty = fine).
const checkNotesSubject = (slug, data) => {
  const problems = [];
  const add = (where, message) => problems.push(`${slug} ${where}: ${message}`);

  if (!data || typeof data.subject !== 'string' || !data.subject.trim()) add('subject', 'name is required');
  if (!data || !Array.isArray(data.sections) || data.sections.length === 0) {
    add('sections', 'at least one section is required');
    return problems;
  }

  const seen = new Set();
  data.sections.forEach((section, i) => {
    const where = `section ${i + 1} ("${section && section.title}")`;
    if (!section || typeof section.title !== 'string' || !section.title.trim()) add(where, 'title is required');
    if (!section || typeof section.id !== 'string' || !ID_PATTERN.test(section.id)) {
      add(where, 'id is required, lower-case words joined by "-"');
    } else {
      if (!section.id.startsWith(`${slug}-`)) add(where, `id must start with "${slug}-"`);
      if (seen.has(section.id)) add(where, `id "${section.id}" is used twice`);
      seen.add(section.id);
    }
    if (!section || !Array.isArray(section.topics)) add(where, 'topics must be a list');
    if (section && section.lastChecked !== undefined) {
      const result = templateSchema.safeParse(section);
      if (!result.success) result.error.issues.forEach((issue) => add(where, `${issue.path.join('.') || 'section'}: ${issue.message}`));
      // system design sections carry architecture pictures, so they may have more diagrams than the other subjects
      if (slug !== 'hld' && Array.isArray(section.diagrams) && section.diagrams.length > MAX_DIAGRAMS) add(where, `diagrams: at most ${MAX_DIAGRAMS} diagrams per section`);
    }
  });
  return problems;
};

module.exports = { checkNotesSubject, ID_PATTERN };
