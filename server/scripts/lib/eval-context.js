// The context the Role Analyzer needs (skill names, what a plan may point to), built from the files, without a database.
// Shared by scripts/analyzer-eval.js and scripts/analyzer-benchmark.js.
const fs = require("fs");
const path = require("path");
const { pathToFileURL } = require("url");
const SERVER = path.join(__dirname, "..", "..");
const skills = require("../../src/modules/analyzer/skillCatalog.json");

const readText = (p) => fs.readFileSync(path.join(SERVER, p), 'utf8');
const buildContext = async () => {
  const dsaRefs = [...readText('src/modules/sheets/seeds/sheetSeeds/blind75.js').matchAll(/\{\s*title:\s*["']([^"']+)["'],\s*problems:/g)].map((m) => `dsa:${m[1]}`);
  const notesRefs = ['os', 'dbms', 'cn', 'oops', 'hld'].flatMap((slug) => require(`../../src/modules/notes/content/${slug}.js`).sections.map((s) => `notes:${slug}:${s.title}`));
  const roadmaps = (await import(pathToFileURL(path.join(SERVER, '..', 'client', 'src', 'data', 'roadmaps.js')).href)).roadmaps;
  const bank = (await import(pathToFileURL(path.join(SERVER, '..', 'client', 'src', 'data', 'behavioralQuestions.js')).href)).behavioralQuestions;
  return {
    skillNames: skills.map((s) => s.name),
    dsaRefs: [...new Set(dsaRefs)],
    refs: [...new Set([...dsaRefs, ...notesRefs, ...roadmaps.map((r) => `roadmap:${r.slug}`)])],
    behavioral: bank.map((b) => ({ id: b.id, question: b.question })),
  };
};


module.exports = { buildContext };
