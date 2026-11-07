// The resume service: reading a PDF, rejecting bad input, and removing contact details. Uses the real PDF reader and real
// (generated) PDFs. No database and no AI.
const t = require('./helpers/setup');
const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const r = require('../src/services/resume.service');

const LINES = [
  'Priya Example, Software Developer',
  'Built TaskFlow, a task manager, with React hooks and a Node.js REST API. Stored data in MongoDB with indexes.',
  'Fixed 14 UI bugs as a web development intern and added two Express.js endpoints with validation and tests.',
  'Skills: JavaScript, React, Node.js, Express.js, MongoDB, Git. Solved 220 problems on LeetCode this year.',
];
const status = async (promise) => { try { await promise; return 200; } catch (e) { return e.statusCode ?? 500; } };

describe('extractPdfText: reading a PDF', () => {
  it('reads the text of a real PDF', async () => {
    const text = await r.extractPdfText(t.makePdf([LINES]));
    assert.match(text, /Built TaskFlow, a task manager, with React hooks/);
    assert.match(text, /Solved 220 problems/);
  });
  it('refuses an empty upload (400)', async () => {
    assert.equal(await status(r.extractPdfText(Buffer.alloc(0))), 400);
    assert.equal(await status(r.extractPdfText(undefined)), 400);
  });
  it('checks the real bytes, not the file name or type: a text file renamed .pdf is refused (400)', async () => {
    // the message says "not a PDF": it is refused before the PDF reader ever sees the bytes
    await assert.rejects(r.extractPdfText(Buffer.from('this is just a text file pretending to be a PDF')), (e) => e.statusCode === 400 && /not a PDF/.test(e.message));
    await assert.rejects(r.extractPdfText(Buffer.from('MZ\u0090\u0000 an executable')), (e) => e.statusCode === 400 && /not a PDF/.test(e.message));
  });
  it('refuses a broken PDF with a friendly message, not a crash (400)', async () => {
    const broken = Buffer.from('%PDF-1.4\n1 0 obj << /garbage >> endobj\ntrailer << >>\n%%EOF');
    await assert.rejects(r.extractPdfText(broken), (e) => e.statusCode === 400 && /could not read this PDF/.test(e.message));
  });
  it('refuses a file over 3 MB (413) before reading it', async () => {
    const big = Buffer.concat([Buffer.from('%PDF-1.4\n'), Buffer.alloc(r.MAX_PDF_BYTES)]);
    assert.equal(await status(r.extractPdfText(big)), 413);
  });
  it('refuses a PDF with more than 5 pages (400) and says how many it has', async () => {
    await assert.rejects(r.extractPdfText(t.makePdf(Array(6).fill(LINES))), (e) => e.statusCode === 400 && /6 pages/.test(e.message));
  });
  it('accepts a 5-page PDF', async () => {
    assert.match(await r.extractPdfText(t.makePdf(Array(5).fill(LINES))), /Built TaskFlow/);
  });
});

describe('prepareResumeText: cleaning and limits', () => {
  it('rejects a scanned PDF (no text) with a message that says to paste the text', async () => {
    const raw = await r.extractPdfText(t.makePdf([[]]));
    assert.throws(() => r.prepareResumeText(raw), (e) => e.statusCode === 400 && /paste the text/.test(e.message));
  });
  it('rejects too little text (fewer than 30 real words), empty and missing input', () => {
    for (const bad of ['', '   ', undefined, null, 'I like to learn new things.']) {
      assert.throws(() => r.prepareResumeText(bad), (e) => e.statusCode === 400);
    }
  });
  it('accepts a real resume and counts its words', () => {
    const out = r.prepareResumeText(LINES.join('\n'));
    assert.ok(out.words >= 30);
    assert.equal(out.truncated, false);
  });
  it('removes null bytes and control characters, and page markers', () => {
    const out = r.prepareResumeText(`${LINES.join('\n')}\0\u0007 -- 1 of 2 --`);
    assert.ok(!out.text.includes('\0') && !out.text.includes('\u0007') && !/-- 1 of 2 --/.test(out.text));
  });
  it('cuts text longer than the AI budget and says it did', () => {
    const out = r.prepareResumeText(`${LINES.join('\n')}\n${'Worked on interesting backend projects with many teams. '.repeat(400)}`);
    assert.equal(out.truncated, true);
    assert.ok(out.text.length <= r.MAX_RESUME_CHARS);
  });
});

describe('redactContactDetails: removing what identifies how to reach someone', () => {
  const clean = (s) => r.redactContactDetails(s);
  it('removes e-mail addresses', () => {
    assert.ok(!/@/.test(clean('Mail me: first.last+jobs@sub.example.co.in or other@x.org today')));
  });
  it('removes phone numbers in common formats', () => {
    for (const phone of ['+91-7701913282', '+1 (415) 555-2671', '9876543210', '(011) 2345 6789', '+44 20 7946 0958']) {
      assert.equal(clean(`Call ${phone} now`).replace(/\s+/g, ' ').trim(), 'Call now', `phone not removed cleanly: ${phone}`);
    }
  });
  it('removes links, with or without https, and social profile addresses', () => {
    const out = clean('https://github.com/someone www.mysite.dev/about linkedin.com/in/some-one leetcode.com/u/me example.com/portfolio');
    assert.ok(!/github|mysite|linkedin|leetcode|example\.com/i.test(out));
  });
  it('keeps what a resume is about: years, ranges, percentages, scores, sizes and technology names', () => {
    const text = 'Studied 2021 - 2025 and 2018-2020 (2019 2020 2021 2022). CGPA 8.1, cut load time by 31 percent, 100MB uploads. Used Socket.IO, Next.js, Node.js, ASP.NET, Vue.js and C++ with 220 problems solved.';
    assert.equal(clean(text), text);
  });
  it('tidies the separators it leaves behind', () => {
    const out = r.prepareResumeText(`Delhi, India | +91-7701913282 | a@b.com | https://x.com/me\n${LINES.join('\n')}`);
    assert.ok(!/\|\s*\|/.test(out.text) && !/^\s*\|/m.test(out.text));
  });
  it('works on a real PDF: nothing that identifies how to reach the person survives', async () => {
    const pdf = t.makePdf([['Sam Tester, Developer', 'Delhi, India | +91-7701913282 | sam.tester@example.com | github.com/samtester', ...LINES]]);
    const out = r.prepareResumeText(await r.extractPdfText(pdf));
    assert.ok(!/sam\.tester|@|7701913282|github/i.test(out.text));
    assert.match(out.text, /Built TaskFlow/); // the useful content is still there
  });
});
