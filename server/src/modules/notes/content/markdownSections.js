// Reads notes sections written as Markdown files and turns each one into the same data object the JS notes files use,
// so the validator, the seed and the API do not change. The format is described in docs/content/NOTES_TEMPLATE.md.
//
//   ---
//   id: dbms-normalization            (must equal the file name without .md)
//   title: Normalization
//   lastChecked: 2026-11-10           (set only after the review; omit it while the section is a draft)
//   next: dbms-transactions           (a section id of the same subject, or "none")
//   sheetTopics: blind-75:arrays-hashing, striver-sde:arrays-i
//   roadmapSteps: backend:database-design
//   ---
//   ## Overview                        paragraphs separated by a blank line
//   ## Topic: Second normal form       **Definition:** / **Why:** / **Example:** / **Failure:** (a field runs until the next one)
//   ## Questions                       ### the question   then the answer text
//   ## Mistakes                        - one wrong belief per bullet
//   ## Quiz                            ### the question   - [ ] option   - [x] the right option   Explanation: text
//   ## Diagram                         a fenced json block (see the diagram kinds in NOTES_TEMPLATE.md)
//
// Files whose name starts with "_" are ignored (templates and notes to yourself). Any mistake in the format throws an
// error that names the file and the line, and the seed stops before it touches the database.
const fs = require('fs');
const path = require('path');

const FIELDS = { definition: 'definition', why: 'why', example: 'example', failure: 'failure' };
const FIELD_LINE = /^\*\*([A-Za-z]+):\*\*\s*(.*)$/;

const fail = (file, message, line) => { throw new Error(`${file}${line ? `, line ${line}` : ''}: ${message}`); };

// Text of a block: trimmed, and the lines that only open or close a code fence are dropped (the code itself is kept).
const blockText = (lines) => lines.filter((l) => !/^\s*```/.test(l)).join('\n').trim();

const splitFrontMatter = (lines, file) => {
  if (lines[0] !== '---') fail(file, 'the file must start with a "---" line and the header', 1);
  const end = lines.indexOf('---', 1);
  if (end === -1) fail(file, 'the header is not closed with a second "---" line', 1);
  const head = {};
  lines.slice(1, end).forEach((raw, i) => {
    if (!raw.trim()) return;
    const m = /^([A-Za-z]+):\s*(.*)$/.exec(raw);
    if (!m) fail(file, `header line "${raw}" must look like "key: value"`, i + 2);
    head[m[1]] = m[2].trim();
  });
  return { head, body: lines.slice(end + 1), bodyStart: end + 2 };
};

const list = (value) => (value ? value.split(',').map((s) => s.trim()).filter(Boolean) : []);

// Splits the body into blocks that each start with a "## " heading.
const splitBlocks = (body, bodyStart, file) => {
  const blocks = [];
  let inFence = false;
  body.forEach((line, i) => {
    if (/^\s*```/.test(line)) inFence = !inFence;
    if (!inFence && /^## /.test(line)) blocks.push({ heading: line.slice(3).trim(), lines: [], line: bodyStart + i });
    else if (blocks.length) blocks[blocks.length - 1].lines.push(line);
    else if (line.trim()) fail(file, 'text before the first "## " heading', bodyStart + i);
  });
  return blocks;
};

const parseTopic = (block, file) => {
  const topic = { name: block.heading.replace(/^topic:\s*/i, '').trim() };
  let current = null;
  let inFence = false;
  const parts = {};
  block.lines.forEach((line, i) => {
    if (/^\s*```/.test(line)) inFence = !inFence;
    const m = inFence ? null : FIELD_LINE.exec(line); // a "**Why:**" inside a code block is just text
    if (m) {
      const key = FIELDS[m[1].toLowerCase()];
      if (!key) fail(file, `unknown field "${m[1]}" in topic "${topic.name}" (use Definition, Why, Example, Failure)`, block.line + 1 + i);
      if (parts[key]) fail(file, `field "${m[1]}" is used twice in topic "${topic.name}"`, block.line + 1 + i);
      current = key; parts[key] = [m[2]];
    } else if (current) parts[current].push(line);
    else if (line.trim()) fail(file, `text before the first field in topic "${topic.name}"`, block.line + 1 + i);
  });
  for (const [key, lines] of Object.entries(parts)) topic[key] = blockText(lines);
  return topic;
};

// "### heading" items inside a block: [{ title, lines }]
const subItems = (block, file) => {
  const items = [];
  let inFence = false;
  block.lines.forEach((line, i) => {
    if (/^\s*```/.test(line)) inFence = !inFence;
    if (!inFence && /^### /.test(line)) items.push({ title: line.slice(4).trim(), lines: [] });
    else if (items.length) items[items.length - 1].lines.push(line);
    else if (line.trim()) fail(file, `"${block.heading}" must start with a "### " line`, block.line + 1 + i);
  });
  return items;
};

const parseQuiz = (block, file) => subItems(block, file).map((item) => {
  const options = []; let answer = -1; const explanation = []; let inExplanation = false;
  for (const line of item.lines) {
    const opt = /^- \[( |x|X)\]\s+(.*)$/.exec(line);
    if (opt && !inExplanation) {
      if (opt[1] !== ' ') { if (answer !== -1) fail(file, `quiz question "${item.title}" has more than one [x] answer`); answer = options.length; }
      options.push(opt[2].trim());
    } else if (/^Explanation:/i.test(line)) { inExplanation = true; explanation.push(line.replace(/^Explanation:\s*/i, '')); }
    else if (inExplanation) explanation.push(line);
    else if (line.trim()) fail(file, `quiz question "${item.title}": unexpected line "${line}" (options look like "- [ ] text", the right one "- [x] text")`);
  }
  if (answer === -1) fail(file, `quiz question "${item.title}" has no [x] answer`);
  return { question: item.title, options, answer, explanation: blockText(explanation) };
});

const parseMistakes = (block, file) => {
  const items = [];
  block.lines.forEach((line, i) => {
    if (/^- /.test(line)) items.push([line.slice(2)]);
    else if (line.trim() && items.length) items[items.length - 1].push(line.trim());
    else if (line.trim()) fail(file, 'a mistake must start with "- "', block.line + 1 + i);
  });
  return items.map((l) => l.join(' ').trim());
};

const parseDiagram = (block, file) => {
  const text = block.lines.join('\n');
  const m = /```json\s*\n([\s\S]*?)\n\s*```/.exec(text);
  if (!m) fail(file, 'a "## Diagram" block needs a fenced ```json block', block.line);
  try { return JSON.parse(m[1]); } catch (e) { return fail(file, `the diagram is not valid JSON (${e.message})`, block.line); }
};

// One Markdown file's text -> a section object. fileName is only used in error messages and to check the id.
const parseSection = (source, fileName = 'section.md') => {
  const lines = String(source).replace(/\r\n?/g, '\n').split('\n');
  const { head, body: rawBody, bodyStart } = splitFrontMatter(lines, fileName);
  // <!-- notes to the author --> are dropped, but the lines are kept (blank) so error line numbers stay right
  const body = rawBody.join('\n').replace(/<!--[\s\S]*?-->/g, (c) => c.replace(/[^\n]/g, '')).split('\n');
  const section = { id: head.id, title: head.title };
  if (!section.id) fail(fileName, 'the header needs an id');
  if (!section.title) fail(fileName, 'the header needs a title');
  const expected = path.basename(fileName, '.md');
  if (fileName !== 'section.md' && section.id !== expected) fail(fileName, `the id "${section.id}" must equal the file name "${expected}"`);
  if (head.lastChecked) section.lastChecked = head.lastChecked;

  let overview = null; let questions = null; let mistakes = null; let quiz = null;
  const topics = []; const diagrams = [];
  for (const block of splitBlocks(body, bodyStart, fileName)) {
    const h = block.heading.toLowerCase();
    if (h === 'overview') {
      if (overview) fail(fileName, 'two "## Overview" blocks', block.line);
      overview = block.lines.join('\n').split(/\n\s*\n/).map((p) => blockText(p.split('\n'))).filter(Boolean);
    } else if (h.startsWith('topic:')) topics.push(parseTopic(block, fileName));
    else if (h === 'questions') {
      if (questions) fail(fileName, 'two "## Questions" blocks', block.line);
      questions = subItems(block, fileName).map((q) => ({ question: q.title, answer: blockText(q.lines) }));
    } else if (h === 'mistakes') {
      if (mistakes) fail(fileName, 'two "## Mistakes" blocks', block.line);
      mistakes = parseMistakes(block, fileName);
    } else if (h === 'quiz') {
      if (quiz) fail(fileName, 'two "## Quiz" blocks', block.line);
      quiz = parseQuiz(block, fileName);
    } else if (h === 'diagram') diagrams.push(parseDiagram(block, fileName));
    else fail(fileName, `unknown heading "## ${block.heading}" (use Overview, Topic: name, Questions, Mistakes, Quiz, Diagram)`, block.line);
  }
  section.overview = overview || [];
  section.topics = topics;
  section.questions = questions || [];
  section.mistakes = mistakes || [];
  section.quiz = quiz || [];
  section.links = { sheetTopics: list(head.sheetTopics), roadmapSteps: list(head.roadmapSteps), next: !head.next || head.next === 'none' ? null : head.next };
  if (diagrams.length) section.diagrams = diagrams;
  return section;
};

// Every *.md file in a folder (not those starting with "_"), in file-name order. A missing folder means no files.
const loadMarkdownSections = (dir) => {
  if (!fs.existsSync(dir)) return [];
  const sections = fs.readdirSync(dir).filter((f) => f.endsWith('.md') && !f.startsWith('_')).sort()
    .map((f) => parseSection(fs.readFileSync(path.join(dir, f), 'utf8'), f));
  const seen = new Set();
  for (const s of sections) { if (seen.has(s.id)) throw new Error(`${dir}: the id "${s.id}" is used by two files`); seen.add(s.id); }
  return sections;
};

// The subject data with each section that has a Markdown file replaced by it (same place in the list); a Markdown section whose
// id is not in the list is added at the end.
const withMarkdownSections = (data, dir) => {
  const written = loadMarkdownSections(dir);
  const byId = new Map(written.map((s) => [s.id, s]));
  const sections = data.sections.map((s) => byId.get(s.id) || s);
  const known = new Set(data.sections.map((s) => s.id));
  return { ...data, sections: [...sections, ...written.filter((s) => !known.has(s.id))] };
};

// Puts the sections in reading order by following their `next` links: it starts at the section that no other section points to
// and follows `next` to the end. Used for a subject that is written entirely in Markdown, where the file names give no order.
// Anything that breaks the chain (a section that nothing leads to, a second start, a loop, a `next` that is not a section of the
// subject) throws, so a mistake in a `next` link stops the seed instead of hiding a section.
const orderByNext = (sections) => {
  const byId = new Map(sections.map((s) => [s.id, s]));
  const pointedAt = new Set(sections.map((s) => s.links?.next).filter(Boolean));
  for (const s of sections) {
    const next = s.links?.next;
    if (next && !byId.has(next)) throw new Error(`${s.id}: next section "${next}" is not in this subject`);
  }
  const starts = sections.filter((s) => !pointedAt.has(s.id));
  if (starts.length !== 1) throw new Error(`the next links must form one chain, but ${starts.length} sections have nothing leading to them (${starts.map((s) => s.id).join(', ') || 'a loop'})`);
  const ordered = [];
  for (let s = starts[0]; s; s = byId.get(s.links?.next)) {
    if (ordered.includes(s)) throw new Error(`the next links loop at "${s.id}"`);
    ordered.push(s);
  }
  if (ordered.length !== sections.length) throw new Error('the next links do not reach every section');
  return ordered;
};

module.exports = { parseSection, loadMarkdownSections, withMarkdownSections, orderByNext };
