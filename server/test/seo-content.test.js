// The search pages for the notes sections and sheets are made from two generated files in the client (client/src/seo). They must match the
// notes and sheets they were made from, and the numbers the search text claims must be true.
const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { build, render, describe: describeText, SEO_DIR, DESCRIPTION_MIN, DESCRIPTION_MAX } = require('../scripts/build-seo-content');

const { sections, body } = build();
const read = (name) => fs.readFileSync(path.join(SEO_DIR, name), 'utf8').replace(/\r\n/g, '\n');

describe('generated SEO content', () => {
  it('the client copies are up to date (run npm run build:seo-content after changing notes or sheets)', () => {
    assert.equal(read('content.js'), render(sections));
    assert.equal(read('contentBody.js'), render(body));
  });
  it('every notes section has a search description of 110 to 160 characters, and no two are the same', () => {
    const all = Object.values(sections).flat();
    assert.equal(all.length, 64);
    for (const s of all) assert.ok(s.description.length >= DESCRIPTION_MIN && s.description.length <= DESCRIPTION_MAX, `${s.id}: ${s.description.length}`);
    assert.equal(new Set(all.map((s) => s.description)).size, all.length);
    assert.equal(new Set(all.map((s) => s.id)).size, all.length);
    assert.ok(all.every((s) => s.readMinutes > 0));
  });
  it('removes the bracketed asides, cuts at a whole sentence, and pads a short text', () => {
    assert.equal(describeText('A deadlock (a standstill) stops everything. ' + 'More words here. '.repeat(10)).includes('('), false);
    const long = 'First sentence that is quite long and fills most of the room we have for it, ok. Second sentence adds more text to pass the limit by a wide margin indeed, yes. Third.';
    assert.ok(describeText(long).endsWith('.') && describeText(long).length <= DESCRIPTION_MAX);
    assert.ok(describeText('Short text.').endsWith('a short quiz.'));
  });
  it('the sheet sizes claimed in the search text are true', () => {
    const pages = fs.readFileSync(path.join(SEO_DIR, 'pages.js'), 'utf8');
    const total = (slug) => body.sheets[slug].reduce((n, t) => n + t.problems, 0);
    assert.equal(total('blind-75'), 75);
    assert.equal(total('neetcode-150'), 150);
    assert.ok(pages.includes('179 Interview Problems') && total('striver-sde') >= 179);
    assert.ok(pages.includes('450+ problems') && total('striver-a2z') >= 450);
  });
});
