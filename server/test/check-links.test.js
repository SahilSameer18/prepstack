// The parts of the external link check that need no network: sorting answers, collecting addresses, and the request logic with a fake fetch.
const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const { classify, collectUrls, checkUrl, checkAll } = require('../scripts/check-links');

describe('classify', () => {
  it('2xx and 3xx are ok', () => {
    for (const s of [200, 204, 301, 302, 399]) assert.equal(classify(s), 'ok', String(s));
  });
  it('401, 403 and 429 are "blocked" (a site refusing a script says nothing about the page)', () => {
    for (const s of [401, 403, 429]) assert.equal(classify(s), 'blocked', String(s));
  });
  it('404, 410 and server errors are broken', () => {
    for (const s of [400, 404, 410, 500, 503]) assert.equal(classify(s), 'broken', String(s));
  });
});

describe('collectUrls', () => {
  const roadmaps = [{ slug: 'frontend', steps: [{ id: 'html-basics', resources: [{ url: 'https://a.dev/x' }, { url: 'https://b.dev/y' }] }] }];
  const catalog = [{ name: 'React', resources: [{ url: 'https://a.dev/x' }, { url: 'https://c.dev/z' }] }, { name: 'Soft skill', resources: [] }];
  const tools = [{ name: 'Overleaf', url: 'https://d.dev/' }];

  it('lists every address once, with every place that uses it', () => {
    const found = collectUrls({ roadmaps, catalog, tools });
    assert.deepEqual(found.map((f) => f.url).sort(), ['https://a.dev/x', 'https://b.dev/y', 'https://c.dev/z', 'https://d.dev/']);
    assert.deepEqual(found.find((f) => f.url === 'https://a.dev/x').where.sort(), ['roadmap frontend / html-basics', 'skill React']);
  });
  it('skips anything that is not a web address, and works without a tools list', () => {
    const found = collectUrls({ roadmaps: [{ slug: 'x', steps: [{ id: 's', resources: [{ url: 'mailto:a@b.c' }, { url: '/notes/os' }, { url: 'https://ok.dev' }] }] }], catalog: [] });
    assert.deepEqual(found.map((f) => f.url), ['https://ok.dev']);
  });
});

describe('checkUrl', () => {
  const answering = (status, calls = []) => async (url, opts) => { calls.push(opts.method); return { status, body: { cancel() {} } }; };

  it('asks with HEAD first and reports the status', async () => {
    const calls = [];
    assert.deepEqual(await checkUrl('https://a.dev', answering(200, calls)), { status: 200, result: 'ok' });
    assert.deepEqual(calls, ['HEAD']);
  });
  it('asks again with GET when HEAD is refused (405) or wrongly says not found (404), and trusts the GET', async () => {
    const headFails = (headStatus, getStatus) => async (url, opts) => ({ status: opts.method === 'HEAD' ? headStatus : getStatus, body: { cancel() {} } });
    assert.deepEqual(await checkUrl('https://a.dev', headFails(404, 200)), { status: 200, result: 'ok' });
    assert.deepEqual(await checkUrl('https://a.dev', headFails(403, 200)), { status: 200, result: 'ok' });
    assert.deepEqual(await checkUrl('https://a.dev', headFails(404, 404)), { status: 404, result: 'broken' });
  });
  it('asks again with GET when the server does not accept HEAD', async () => {
    const calls = [];
    const fake = async (url, opts) => { calls.push(opts.method); return { status: opts.method === 'HEAD' ? 405 : 200, body: { cancel() {} } }; };
    assert.deepEqual(await checkUrl('https://a.dev', fake), { status: 200, result: 'ok' });
    assert.deepEqual(calls, ['HEAD', 'GET']);
  });
  it('reports a dead page as broken, a refusing one as blocked', async () => {
    assert.equal((await checkUrl('https://a.dev', answering(404))).result, 'broken');
    assert.equal((await checkUrl('https://a.dev', answering(403))).result, 'blocked');
  });
  it('reports an address that cannot be reached as broken, with the reason', async () => {
    const refused = async () => { throw Object.assign(new TypeError('fetch failed'), { cause: { code: 'ENOTFOUND' } }); };
    assert.deepEqual(await checkUrl('https://nope.invalid', refused), { status: null, result: 'broken', reason: 'ENOTFOUND' });
  });
  it('reports no answer within the time limit as broken', async () => {
    const slow = async () => { throw Object.assign(new Error('timed out'), { name: 'TimeoutError' }); };
    assert.match((await checkUrl('https://slow.dev', slow)).reason, /no answer in 10 seconds/);
  });
  it('identifies itself and follows redirects', async () => {
    let seen;
    await checkUrl('https://a.dev', async (url, opts) => { seen = opts; return { status: 200, body: { cancel() {} } }; });
    assert.match(seen.headers['User-Agent'], /PrepStack-link-check/);
    assert.equal(seen.redirect, 'follow');
  });
});

describe('checkAll', () => {
  it('checks every entry, keeps the order, and never runs more than 4 at once', async () => {
    let running = 0; let most = 0;
    const check = async (url) => { running++; most = Math.max(most, running); await new Promise((r) => setTimeout(r, 20)); running--; return { status: 200, result: 'ok' }; };
    const entries = Array.from({ length: 12 }, (_, i) => ({ url: `https://a.dev/${i}`, where: ['x'] }));
    const results = await checkAll(entries, check);
    assert.deepEqual(results.map((r) => r.url), entries.map((e) => e.url));
    assert.ok(results.every((r) => r.result === 'ok' && r.where[0] === 'x'));
    assert.ok(most <= 4, `ran ${most} at once`);
    assert.ok(most > 1, 'should run several at once');
  });
  it('an empty list is fine', async () => {
    assert.deepEqual(await checkAll([]), []);
  });
});
