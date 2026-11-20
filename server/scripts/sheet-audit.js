// Checks the DSA sheet seed files without touching the database: counts, duplicates, missing fields, link hosts.
// Run: cd server && node scripts/sheet-audit.js
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const DIR = path.join(__dirname, '../src/modules/sheets/seeds/sheetSeeds');
// The size each sheet's own page states (checked 20 Nov 2026): Striver's 180 page reports 179 problems; the A2Z page reports 495 topics, of which 453 are problems and 42 are theory lessons.
const STATED = { 'blind-75': 75, 'neetcode-150': 150, 'striver-sde': 179, 'striver-a2z': 453, 'love-babbar': 450 };

// Each seed file holds one `const something = { ... };` data object; read it without running the seeding code.
function readData(file) {
  const src = fs.readFileSync(path.join(DIR, file), 'utf8');
  const start = src.search(/const \w+\s*=\s*\{/);
  const open = src.indexOf('{', start);
  let depth = 0;
  let i = open;
  for (; i < src.length; i += 1) {
    if (src[i] === '{') depth += 1;
    else if (src[i] === '}') { depth -= 1; if (depth === 0) break; }
  }
  return vm.runInNewContext('(' + src.slice(open, i + 1) + ')');
}

const norm = (t) => String(t || '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
const host = (link) => { try { return new URL(link).hostname.replace(/^www\./, ''); } catch { return 'INVALID'; } };

let problems = 0;
for (const file of fs.readdirSync(DIR).filter((f) => f.endsWith('.js'))) {
  const sheet = readData(file);
  const all = (sheet.topics || []).flatMap((t) => (t.problems || []).map((p) => ({ ...p, topic: t.title })));
  const links = new Map();
  const titles = new Map();
  const hosts = {};
  const levels = {};
  const issues = [];
  for (const p of all) {
    if (!p.title) issues.push(`no title in "${p.topic}"`);
    if (!p.link) issues.push(`no link: ${p.title}`);
    else if (host(p.link) === 'INVALID') issues.push(`bad link: ${p.title} -> ${p.link}`);
    if (!p.difficulty) issues.push(`no difficulty: ${p.title}`);
    if (!p.tags || p.tags.length === 0) issues.push(`no tags: ${p.title}`);
    hosts[host(p.link)] = (hosts[host(p.link)] || 0) + 1;
    levels[p.difficulty || 'none'] = (levels[p.difficulty || 'none'] || 0) + 1;
    if (p.link) links.set(p.link, (links.get(p.link) || 0) + 1);
    titles.set(norm(p.title), (titles.get(norm(p.title)) || 0) + 1);
  }
  const dupLinks = [...links].filter(([, n]) => n > 1);
  const dupTitles = [...titles].filter(([, n]) => n > 1);
  const emptyTopics = (sheet.topics || []).filter((t) => !t.problems || t.problems.length === 0).map((t) => t.title);
  const stated = STATED[sheet.slug];
  problems += all.length;

  console.log(`\n== ${sheet.name} (${sheet.slug})`);
  console.log(`entries ${all.length} | unique links ${links.size} | topics ${(sheet.topics || []).length} | stated by its author ${stated ?? '?'} | gap ${stated ? stated - links.size : '?'}`);
  console.log('difficulty', JSON.stringify(levels));
  console.log('link hosts', JSON.stringify(hosts));
  if (emptyTopics.length) console.log('empty topics:', emptyTopics.join(', '));
  console.log(`same link used more than once: ${dupLinks.length} | same title more than once: ${dupTitles.length}`);
  for (const issue of issues.slice(0, 8)) console.log('  issue:', issue);
  if (issues.length > 8) console.log(`  ... and ${issues.length - 8} more issues`);
}
console.log(`\ntotal entries ${problems}`);
