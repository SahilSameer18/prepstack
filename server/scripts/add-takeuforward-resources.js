// Adds takeUforward's video lecture and article to the problems of the Blind 75, NeetCode 150 and Love Babbar seeds that are also on his pages.
// A problem matches only when its LeetCode address is the same address his page gives for the problem, so no title guessing is involved.
// Run: cd server && node scripts/add-takeuforward-resources.js      (needs internet; edits the three seed files; safe to run again)
// Then seed as usual:  node src/modules/sheets/seeds/masterSeed.js
const fs = require('node:fs');
const path = require('node:path');
const { extractRows, buildOutline, fetchSheetPage } = require('./lib/takeuforward');

const DIR = path.join(__dirname, '../src/modules/sheets/seeds/sheetSeeds');
const FILES = ['blind75.js', 'neetCodeSeed.js', 'loveBabbarSeed.js'];
// Earlier pages win; a later page only fills in a video or article that is still missing.
const PAGES = [
  'https://takeuforward.org/prep-hub/strivers-150-master-patterns-in-dsa',
  'https://takeuforward.org/prep-hub/strivers-180-master-dsa-patterns',
  'https://takeuforward.org/prep-hub/strivers-a2z-dsa-sheet',
  'https://takeuforward.org/prep-hub/strivers-sde-sheet',
  'https://takeuforward.org/prep-hub/blind-75',
];

const leetcodeSlug = (url) => {
  const match = /leetcode\.com\/problems\/([^/?#]+)/i.exec(url || '');
  return match ? match[1].toLowerCase() : null;
};

async function buildLookup() {
  const lookup = new Map();
  for (const url of PAGES) {
    for (const module of buildOutline(extractRows(await fetchSheetPage(url)))) {
      for (const section of module.sections) {
        for (const item of section.items) {
          const slug = leetcodeSlug(item.external);
          if (!slug || item.kind !== 'practice' || (!item.video && !item.article)) continue;
          const have = lookup.get(slug) || {};
          lookup.set(slug, { video: have.video || item.video, article: have.article || item.article });
        }
      }
    }
  }
  return lookup;
}

// A problem is one line: { title: "...", link: "...", difficulty: "...", tags: [...] },  Existing video/article fields are replaced, so a rerun does not duplicate them.
function addResources(text, lookup) {
  let added = 0;
  const lines = text.split('\n').map((line) => {
    const match = /^(\s*\{ title: .*?link: "([^"]+)".*?)(, video: "[^"]*")?(, article: "[^"]*")?( \},?\r?)$/.exec(line);
    if (!match) return line;
    const found = lookup.get(leetcodeSlug(match[2]));
    const extras = found ? `${found.video ? `, video: ${JSON.stringify(found.video)}` : ''}${found.article ? `, article: ${JSON.stringify(found.article)}` : ''}` : '';
    if (extras) added += 1;
    return match[1] + extras + match[5];
  });
  return { text: lines.join('\n'), added };
}

(async () => {
  const lookup = await buildLookup();
  for (const file of FILES) {
    const full = path.join(DIR, file);
    const { text, added } = addResources(fs.readFileSync(full, 'utf8'), lookup);
    fs.writeFileSync(full, text);
    console.log(`${file}: ${added} problems now have a takeUforward video or article`);
  }
})().catch((error) => { console.error(error.message); process.exit(1); });
