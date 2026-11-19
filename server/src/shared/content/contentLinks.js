// Checks that the links between notes, roadmaps and DSA sheets point at things that exist. Pure: it gets the data, no database.
//
//   notes      { os: { sections: [{ id, links: { sheetTopics: ["blind-75:graph"], roadmapSteps: ["backend:nodejs-fundamentals"], next: "os-memory-management" } }] }, ... }
//   sheets     [{ slug: "blind-75", topics: [{ id: "graph" }] }]
//   roadmaps   [{ slug: "backend", steps: [{ id: "nodejs-fundamentals", practice: [{ kind: "notes" | "sheet", target: "os:os-deadlocks" | "blind-75:graph" }] }] }]
//
// A link is "<container>:<item>": sheet:topic, roadmap:step, subject:section. Returns a list of problems (empty = every link works).
const checkContentLinks = ({ notes, sheets, roadmaps }) => {
  const problems = [];
  const sheetTopics = new Set(sheets.flatMap((s) => s.topics.map((t) => `${s.slug}:${t.id}`)));
  const roadmapSteps = new Set(roadmaps.flatMap((r) => r.steps.map((s) => `${r.slug}:${s.id}`)));
  const sections = new Set(Object.entries(notes).flatMap(([subject, n]) => n.sections.map((s) => `${subject}:${s.id}`)));

  for (const [subject, data] of Object.entries(notes)) {
    for (const section of data.sections) {
      const from = `notes ${subject} / ${section.id}`;
      const links = section.links;
      if (!links) continue;
      for (const target of links.sheetTopics || []) if (!sheetTopics.has(target)) problems.push(`${from}: sheet topic "${target}" does not exist`);
      for (const target of links.roadmapSteps || []) if (!roadmapSteps.has(target)) problems.push(`${from}: roadmap step "${target}" does not exist`);
      if (links.next) {
        if (links.next === section.id) problems.push(`${from}: next points at the section itself`);
        else if (!sections.has(`${subject}:${links.next}`)) problems.push(`${from}: next section "${links.next}" is not in ${subject}`);
      }
    }
  }

  for (const roadmap of roadmaps) {
    for (const step of roadmap.steps) {
      for (const entry of step.practice || []) {
        const from = `roadmap ${roadmap.slug} / ${step.id}`;
        const known = entry.kind === 'notes' ? sections : entry.kind === 'sheet' ? sheetTopics : null;
        if (!known) problems.push(`${from}: practice kind "${entry.kind}" is not notes or sheet`);
        else if (!known.has(entry.target)) problems.push(`${from}: ${entry.kind} link "${entry.target}" does not exist`);
      }
    }
  }
  return problems;
};

module.exports = { checkContentLinks };
