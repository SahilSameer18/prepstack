// Adds NeetCode's video for a problem to the Blind 75, NeetCode 150 and Love Babbar seeds, where the problem has no video yet.
// Where the links come from: crackedprep.com lists a video next to each NeetCode 150 problem. That page is only a pointer: every link is
// checked against YouTube itself (its oEmbed answer gives the channel and the video title) and is kept only when the channel is NeetCode and the title names the problem.
// Run: cd server && node scripts/add-neetcode-videos.js      (needs internet; edits the three seed files; safe to run again)
const fs = require('node:fs');
const path = require('node:path');

const DIR = path.join(__dirname, '../src/modules/sheets/seeds/sheetSeeds');
const FILES = ['blind75.js', 'neetCodeSeed.js', 'loveBabbarSeed.js'];
const POINTER = 'https://crackedprep.com/dsa-sheets/neetcode-150-questions';

const words = (text) => String(text).toLowerCase().replace(/&/g, ' and ').replace(/[^a-z0-9]+/g, ' ').trim().split(' ').filter((w) => w && !['the', 'a', 'an', 'in', 'of', 'to', 'and', 'ii', 'iii', 'iv', 'i'].includes(w));
const titleKey = (text) => words(text).join(' ');

// "<a href="/slug-interview-question" ...>Title</a></td><td class="sh-res-cell"><a ... href="https://www.youtube.com/watch?v=ID"
async function readPointer() {
  const html = await (await fetch(POINTER, { headers: { 'user-agent': 'Mozilla/5.0' } })).text();
  const rows = [];
  const pattern = /class="sh-link">([^<]+)<\/a><\/td><td class="sh-res-cell"><a[^>]*href="(https:\/\/www\.youtube\.com\/watch\?v=[A-Za-z0-9_-]+)"/g;
  for (const match of html.matchAll(pattern)) rows.push({ title: match[1].replace(/&amp;/g, '&').replace(/&#39;/g, "'").trim(), url: match[2] });
  return rows;
}

// YouTube answers who published a video and what it is called; nothing else is trusted about the link.
async function askYouTube(url) {
  const res = await fetch(`https://www.youtube.com/oembed?format=json&url=${encodeURIComponent(url)}`);
  if (!res.ok) return null;
  return res.json();
}

async function verified() {
  const keep = new Map();
  const dropped = [];
  for (const row of await readPointer()) {
    const info = await askYouTube(row.url);
    const need = words(row.title);
    const have = new Set(words(info ? info.title : ''));
    const named = need.length > 0 && need.filter((w) => have.has(w)).length / need.length >= 0.6;
    if (info && /neetcode/i.test(info.author_name) && named) keep.set(titleKey(row.title), row.url);
    else dropped.push(`${row.title} (${info ? `${info.author_name}: ${info.title}` : 'no answer from YouTube'})`);
  }
  return { keep, dropped };
}

// A problem is one line; only problems with no video yet get one, so takeUforward videos added earlier stay.
function addVideos(text, videos) {
  let added = 0;
  const lines = text.split('\n').map((line) => {
    const match = /^(\s*\{ title: "([^"]+)".*?)( \},?\r?)$/.exec(line);
    if (!match || /video: "/.test(line)) return line;
    const url = videos.get(titleKey(match[2]));
    if (!url) return line;
    added += 1;
    return `${match[1]}, video: ${JSON.stringify(url)}${match[3]}`;
  });
  return { text: lines.join('\n'), added };
}

(async () => {
  const { keep, dropped } = await verified();
  console.log(`${keep.size} NeetCode videos confirmed by YouTube, ${dropped.length} dropped`);
  for (const line of dropped.slice(0, 12)) console.log('  dropped:', line);
  for (const file of FILES) {
    const full = path.join(DIR, file);
    const { text, added } = addVideos(fs.readFileSync(full, 'utf8'), keep);
    fs.writeFileSync(full, text);
    console.log(`${file}: ${added} problems got a NeetCode video`);
  }
})().catch((error) => { console.error(error.message); process.exit(1); });
