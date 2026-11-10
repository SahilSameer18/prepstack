// Checks that the outside links in PrepStack still answer: roadmap resources, skill catalog resources and the resume guide tools.
// Status codes only. It cannot tell whether a page is any good, only that the address responds.
//
//   node scripts/check-links.js          (or: npm run check:links)
//
// Run it by hand before a release; it is not part of `npm test` because it needs the network. It sends about 350 small requests,
// at most 4 at a time with a short pause, and identifies itself in the User-Agent so site owners can see what it is.
//   ok       the address answered (200 to 399)
//   blocked  the site refused a script (401, 403, 429): open it yourself in a browser to be sure
//   broken   404, 410, a server error, no answer in 10 seconds, or the address could not be reached
const path = require('node:path');
const { pathToFileURL } = require('node:url');

const CONCURRENCY = 4;
const PAUSE_MS = 150;
const TIMEOUT_MS = 10000;
const USER_AGENT = 'PrepStack-link-check/1.0 (checks that learning links still work)';

const classify = (status) => {
  if (status >= 200 && status < 400) return 'ok';
  if (status === 401 || status === 403 || status === 429) return 'blocked';
  return 'broken';
};

// One entry per web address, with every place that uses it: [{ url, where: ["roadmap frontend / html-basics", ...] }]
const collectUrls = ({ roadmaps, catalog, tools }) => {
  const byUrl = new Map();
  const add = (url, where) => {
    if (!/^https?:\/\//.test(url)) return;
    if (!byUrl.has(url)) byUrl.set(url, new Set());
    byUrl.get(url).add(where);
  };
  for (const r of roadmaps) for (const s of r.steps) for (const res of s.resources || []) add(res.url, `roadmap ${r.slug} / ${s.id}`);
  for (const skill of catalog) for (const res of skill.resources || []) add(res.url, `skill ${skill.name}`);
  for (const tool of tools || []) add(tool.url, `resume guide tool ${tool.name}`);
  return [...byUrl].map(([url, where]) => ({ url, where: [...where] }));
};

// Asks the address for its status. HEAD is lighter, but some sites refuse it or wrongly answer 404 (Google support and Kaggle do),
// so any answer of 400 or more is asked again with a normal GET before the link is called broken.
const checkUrl = async (url, fetchImpl = fetch) => {
  const ask = (method) => fetchImpl(url, { method, redirect: 'follow', headers: { 'User-Agent': USER_AGENT }, signal: AbortSignal.timeout(TIMEOUT_MS) });
  try {
    let res = await ask('HEAD');
    if (res.status >= 400) res = await ask('GET');
    res.body?.cancel?.();
    return { status: res.status, result: classify(res.status) };
  } catch (err) {
    return { status: null, result: 'broken', reason: err.name === 'TimeoutError' ? 'no answer in 10 seconds' : (err.cause?.code || err.message) };
  }
};

// Runs checkUrl over every entry, a few at a time, with a short pause between requests
const checkAll = async (entries, check = checkUrl) => {
  const results = new Array(entries.length);
  let next = 0;
  const worker = async () => {
    while (next < entries.length) {
      const i = next++;
      results[i] = { ...entries[i], ...(await check(entries[i].url)) };
      await new Promise((r) => setTimeout(r, PAUSE_MS));
    }
  };
  await Promise.all(Array.from({ length: Math.min(CONCURRENCY, entries.length) }, worker));
  return results;
};

module.exports = { classify, collectUrls, checkUrl, checkAll };

if (require.main === module) {
  (async () => {
    const clientData = path.join(__dirname, '..', '..', 'client', 'src', 'data');
    const { roadmaps } = await import(pathToFileURL(path.join(clientData, 'roadmaps.js')).href);
    const { tools } = await import(pathToFileURL(path.join(clientData, 'resumeGuide.js')).href);
    const catalog = require('../src/data/skillCatalog.json');
    const entries = collectUrls({ roadmaps, catalog, tools });
    console.log(`Checking ${entries.length} different addresses (this takes a minute or two)...`);
    const results = await checkAll(entries);
    const show = (title, list) => {
      if (!list.length) return;
      console.log(`\n${title} (${list.length})`);
      for (const r of list) console.log(`  ${r.status ?? 'no answer'}${r.reason ? ` (${r.reason})` : ''}  ${r.url}\n      used in: ${r.where.join('; ')}`);
    };
    const by = (kind) => results.filter((r) => r.result === kind);
    show('BROKEN: fix or replace these', by('broken'));
    show('BLOCKED: the site refused a script, check these in a browser', by('blocked'));
    console.log(`\nok ${by('ok').length}, blocked ${by('blocked').length}, broken ${by('broken').length}`);
    process.exitCode = by('broken').length > 0 ? 1 : 0;
  })().catch((err) => {
    console.error('Link check failed:', err.message);
    process.exit(1);
  });
}
