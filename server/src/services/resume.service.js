// Turning a resume (an uploaded PDF or pasted text) into the clean text the analyzer sends to the AI.
// The resume is personal data, so this file also removes contact details. The text is only held in memory for the length of
// one request: nothing here writes it to a database or a log.
const { PDFParse } = require('pdf-parse');
const AppError = require('../utils/AppError');

const MAX_PDF_BYTES = 3 * 1024 * 1024; // also enforced by the upload middleware
const MAX_PAGES = 5; // a resume longer than this is not a resume
const PARSE_TIMEOUT_MS = 10_000; // a hostile PDF must not hold the server
const MIN_WORDS = 30; // under this the PDF is probably a scan (an image with no text)
const MAX_RESUME_CHARS = 6000; // a token budget for the AI call, not a quality choice

// ── contact details ──
// Removed before anything reaches the AI: e-mail addresses, phone numbers and links. Names and work history stay (the
// report needs them to be useful), so this lowers the privacy risk but cannot remove it.
const EMAIL = /[A-Z0-9._%+-]+@[A-Z0-9-]+(?:\.[A-Z0-9-]+)+/gi;
const URL_WITH_SCHEME = /\b(?:https?:\/\/|www\.)[^\s)>\]]+/gi;
const SOCIAL_SITE = /\b(?:[a-z0-9-]+\.)?(?:linkedin|github|gitlab|bitbucket|twitter|x|instagram|facebook|medium|leetcode|codeforces|codechef|hackerrank|kaggle|behance|dribbble|stackoverflow)\.(?:com|net|org|io)\b(?:\/[^\s)>\]]*)?/gi;
const DOMAIN_WITH_PATH = /\b[a-z0-9-]+(?:\.[a-z0-9-]+)*\.(?:com|org|net|in|dev|me|app)\/[^\s)>\]]*/gi;
// A run of digits and the usual separators. It is a phone number when it has 10 or more digits, or starts with "+" and has
// 8 or more. A run made only of years ("2019 2020 2021") is not.
const DIGIT_RUN = /[+(]?\d[\d\s().-]{7,}\d/g;
const isYear = (group) => /^(?:19|20)\d{2}$/.test(group);

const redactContactDetails = (text) => {
  const redacted = text
    .replace(EMAIL, ' ')
    .replace(URL_WITH_SCHEME, ' ')
    .replace(SOCIAL_SITE, ' ')
    .replace(DOMAIN_WITH_PATH, ' ')
    .replace(DIGIT_RUN, (run) => {
      const digits = run.replace(/\D/g, '');
      const groups = run.split(/[^\d]+/).filter(Boolean);
      if (groups.length && groups.every(isYear)) return run;
      const phone = digits.length >= 10 || (run.trim().startsWith('+') && digits.length >= 8);
      return phone ? ' ' : run;
    });
  return redacted;
};

// ── cleaning ──
const normalise = (raw) => String(raw ?? '')
  .replace(/\0/g, '') // null bytes
  // eslint-disable-next-line no-control-regex
  .replace(/[\u0001-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, ' ') // other control characters (keep tab and newline)
  .replace(/--\s*\d+\s*(?:of|\/)\s*\d+\s*--/gi, ' ') // "-- 1 of 2 --" page markers
  .replace(/[ \t]+/g, ' ')
  .replace(/ *\n+ */g, '\n')
  .trim();

const countWords = (text) => text.split(/\s+/).filter((w) => w.length > 1 && /[a-z0-9]/i.test(w)).length;

/**
 * Raw resume text (from a PDF or pasted) -> { text, truncated, words }. Throws a 400 AppError when there is too little text
 * (a scan, or an empty paste). The returned text has no contact details and fits the AI budget.
 */
const prepareResumeText = (raw) => {
  const cleaned = normalise(raw);
  const words = countWords(cleaned);
  if (words < MIN_WORDS) {
    throw new AppError(400, 'We could not find enough text in your resume. If it is a scanned image PDF, paste the text instead.');
  }
  // Removing a phone number or link can leave "Delhi, India | |" behind: tidy the separators it left
  const redacted = normalise(redactContactDetails(cleaned)
    .replace(/(?:\s*\|\s*){2,}/g, ' | ')
    .replace(/^\s*\|\s*|\s*\|\s*$/gm, ''));
  const truncated = redacted.length > MAX_RESUME_CHARS;
  return { text: truncated ? redacted.slice(0, MAX_RESUME_CHARS) : redacted, truncated, words };
};

// ── PDF ──
const isPdf = (buffer) => Buffer.isBuffer(buffer) && buffer.subarray(0, 1024).toString('latin1').includes('%PDF-');

const withTimeout = (promise, ms) => new Promise((resolve, reject) => {
  const timer = setTimeout(() => reject(new AppError(400, 'Reading the PDF took too long. Please paste your resume text instead.')), ms);
  promise.then((v) => { clearTimeout(timer); resolve(v); }, (e) => { clearTimeout(timer); reject(e); });
});

/** An uploaded PDF (a Buffer) -> raw text. The browser-supplied file type is not trusted: the bytes must start like a PDF. */
const extractPdfText = async (buffer) => {
  if (!buffer || !buffer.length) throw new AppError(400, 'The uploaded file is empty.');
  if (buffer.length > MAX_PDF_BYTES) throw new AppError(413, 'The PDF is too large. The limit is 3 MB.');
  if (!isPdf(buffer)) throw new AppError(400, 'The uploaded file is not a PDF.');
  // verbosity 0: the PDF library prints font warnings for most real resumes, which only adds noise to the server log
  const parser = new PDFParse({ data: new Uint8Array(buffer), verbosity: 0 });
  try {
    const result = await withTimeout(parser.getText({ first: MAX_PAGES }), PARSE_TIMEOUT_MS);
    if (result.total > MAX_PAGES) throw new AppError(400, `The PDF has ${result.total} pages. A resume should be at most ${MAX_PAGES}.`);
    return result.text;
  } catch (err) {
    if (err instanceof AppError) throw err;
    throw new AppError(400, 'We could not read this PDF. Please check it opens normally, or paste your resume text instead.');
  } finally {
    parser.destroy?.().catch?.(() => {}); // free the parser's memory; ignore errors
  }
};

module.exports = { extractPdfText, prepareResumeText, redactContactDetails, normalise, countWords, isPdf, MAX_PDF_BYTES, MAX_PAGES, MAX_RESUME_CHARS, MIN_WORDS };
