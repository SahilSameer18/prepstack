// Writes the size of the DSA library (sheets, problems per sheet and in total) into the client, so the home page can show
// the numbers at once without asking the server (a free-tier server can take a minute to wake up).
// A problem is counted once per sheet by its link, the same way the sheets list (sheets.controller.js) counts it.
// Run after changing a sheet seed: npm run build:home-facts
// test/home-facts.test.js fails when the client copy and the seed files differ.
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const DIR = path.join(__dirname, '..', 'src', 'modules', 'sheets', 'seeds', 'sheetSeeds');
const TARGET = path.join(__dirname, '..', '..', 'client', 'src', 'data', 'homeFacts.json');
const SHEETS = { 'blind-75': 'blind75.js', 'neetcode-150': 'neetCodeSeed.js', 'striver-sde': 'striverSDESeed.js', 'striver-a2z': 'striverA2ZSeed.js', 'love-babbar': 'loveBabbarSeed.js' };

// Each seed file holds one `const something = { ... };` data object; read it without running the seeding code.
function readData(file) {
  const src = fs.readFileSync(path.join(DIR, file), 'utf8');
  const open = src.indexOf('{', src.search(/const \w+\s*=\s*\{/));
  let depth = 0;
  let i = open;
  for (; i < src.length; i += 1) {
    if (src[i] === '{') depth += 1;
    else if (src[i] === '}') { depth -= 1; if (depth === 0) break; }
  }
  return vm.runInNewContext('(' + src.slice(open, i + 1) + ')');
}

function facts() {
  const perSheet = {};
  for (const [slug, file] of Object.entries(SHEETS)) {
    const links = new Set();
    for (const topic of readData(file).topics || []) for (const problem of topic.problems || []) links.add(problem.link);
    perSheet[slug] = links.size;
  }
  return { sheets: Object.keys(perSheet).length, problems: Object.values(perSheet).reduce((a, b) => a + b, 0), perSheet };
}

const render = () => JSON.stringify(facts(), null, 2) + '\n';

if (require.main === module) {
  fs.writeFileSync(TARGET, render());
  console.log('Wrote ' + path.relative(process.cwd(), TARGET));
}

module.exports = { TARGET, facts, render };
