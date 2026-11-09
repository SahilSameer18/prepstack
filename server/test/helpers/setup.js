// Shared test harness. Every test file is its own process (node --test), so this sets up a private world per file:
//   - fake secrets and NODE_ENV=test (the real server/.env is never loaded)
//   - an in-memory MongoDB (never a real database)
//   - fake Gemini, fake Groq and fake Google sign-in (no network, no cost)
// The real rate limiters stay ON. Each request gets a unique X-Forwarded-For so tests don't share a limiter counter.
const path = require('path');
const SERVER_ROOT = path.join(__dirname, '..', '..');

process.env.NODE_ENV = process.env.NODE_ENV || 'test';
process.env.ACCESS_SECRET = 'test-access-secret-' + 'a'.repeat(32);
process.env.REFRESH_SECRET = 'test-refresh-secret-' + 'b'.repeat(32);
process.env.GOOGLE_API_KEY = 'fake-gemini-key';
process.env.GOOGLE_CLIENT_ID = 'fake-google-client-id';
for (const k of ['ALLOWED_ORIGINS', 'CLIENT_URL', 'ENABLE_CUSTOM_DNS', 'MONGO_URI', 'GROQ_API_KEY', 'GEMINI_PRIMARY_MODEL', 'GEMINI_FALLBACK_MODEL', 'GEMINI_FALLBACK_2_MODEL', 'GROQ_MODEL', 'AI_DAILY_LIMIT']) delete process.env[k];
process.env.AI_RETRY_DELAY_MS = '1'; // the AI retry wait is 1 s in real life; keep tests fast
process.env.AI_RESERVE_MS = '1'; // the time kept for the last provider is 8 s in real life; the tests that check it set their own

// ── fake AI providers (Gemini and Groq) ──
// Two ways to drive a fake:
//   simple:    set `.reply` (object or raw string) or `.error`; every model answers the same way
//   special:   `.hook = (prompt, model) => reply | undefined` answers matching prompts itself (undefined = carry on as usual)
//   per model: `.script[modelId] = [step1, step2, ...]`, used on that model's 1st, 2nd... call (the last step repeats);
//              a step is { reply } | { error } | { hang: true }, and may add { delayMs } to answer slowly
// `.models` lists the model IDs that were called, in order; `.calls` counts all calls.
const aiServicePath = path.join(SERVER_ROOT, 'src', 'services', 'ai.service.js');
const resetAiState = () => { const m = require.cache[aiServicePath]; if (m && m.exports.resetState) m.exports.resetState(); };
function makeFake() {
  return {
    reply: undefined, error: null, script: {}, hook: null, perModelCalls: {}, calls: 0, models: [], prompts: [], lastConfig: null, lastPrompt: null, lastParams: null,
    reset() {
      this.reply = undefined; this.error = null; this.script = {}; this.hook = null; this.perModelCalls = {}; this.calls = 0; this.models = []; this.prompts = [];
      this.lastConfig = null; this.lastPrompt = null; this.lastParams = null;
      resetAiState(); // the circuit breaker in ai.service remembers failures between calls
    },
    async run(model, prompt) {
      this.calls++; this.models.push(model); this.prompts.push(prompt);
      // `hook(prompt, model)` can answer some prompts specially (for example the tech-stack check); undefined = no special answer
      const special = this.hook ? this.hook(prompt, model) : undefined;
      if (special !== undefined) return typeof special === 'string' ? special : JSON.stringify(special);
      const n = (this.perModelCalls[model] = (this.perModelCalls[model] || 0) + 1);
      const steps = this.script[model];
      const step = steps ? steps[Math.min(n, steps.length) - 1] : { reply: this.reply, error: this.error };
      if (step.hang) await new Promise(() => {});
      if (step.delayMs) await new Promise((r) => setTimeout(r, step.delayMs)); // a slow but working provider
      if (step.error) throw step.error;
      const r = step.reply;
      return typeof r === 'string' || r === undefined ? r : JSON.stringify(r);
    },
  };
}
const gemini = makeFake();
const groq = makeFake();
const MODELS = { primary: 'gemini-3-flash-preview', fallback: 'gemini-3.5-flash-lite', fallback2: 'gemini-3.1-flash-lite', groq: 'openai/gpt-oss-120b' };
/** An error shaped like the real SDK errors: it carries the HTTP status. */
const apiError = (status, message = `HTTP ${status}`) => Object.assign(new Error(message), { status });

const geminiPath = require.resolve('@google/genai', { paths: [SERVER_ROOT] });
require.cache[geminiPath] = {
  id: geminiPath, filename: geminiPath, loaded: true,
  exports: {
    GoogleGenAI: class {
      constructor() {
        this.models = {
          generateContent: async ({ model, contents, config }) => {
            gemini.lastConfig = config; gemini.lastPrompt = contents;
            return { text: await gemini.run(model, contents) };
          },
        };
      }
    },
  },
};
const groqPath = require.resolve('groq-sdk', { paths: [SERVER_ROOT] });
class FakeGroq {
  constructor() {
    this.chat = {
      completions: {
        create: async (params) => {
          groq.lastParams = params; groq.lastPrompt = params.messages?.[0]?.content;
          const content = await groq.run(params.model, params.messages?.[0]?.content);
          return { choices: [{ message: { content } }], usage: { total_tokens: 10 } };
        },
      },
    };
  }
}
require.cache[groqPath] = { id: groqPath, filename: groqPath, loaded: true, exports: FakeGroq };
// ── fake email (nodemailer): nothing is ever sent; every message that would have gone out is kept in `mail.sent` ──
//   set `mail.error` to make sending fail
const nodemailerPath = require.resolve('nodemailer', { paths: [SERVER_ROOT] });
const mail = {
  sent: [], error: null, transports: 0, lastOptions: null,
  reset() { this.sent = []; this.error = null; },
};
require.cache[nodemailerPath] = {
  id: nodemailerPath, filename: nodemailerPath, loaded: true,
  exports: {
    createTransport: (options) => {
      mail.transports++; mail.lastOptions = options;
      return { sendMail: async (message) => { if (mail.error) throw mail.error; mail.sent.push(message); return { messageId: 'fake-message-id' }; } };
    },
  },
};
const goodIdea = (over = {}) => ({
  title: 'Test Idea', tagline: 'tag', description: 'desc', features: ['f1', 'f2'], techStack: 'MERN',
  difficulty: 'Intermediate', estimatedTime: '2 weeks', resumeValue: 'resume value', ...over,
});

// ── fake Google sign-in: the "idToken" in tests is just a JSON string of the Google payload ──
const google = {
  token: (payload) => JSON.stringify({ email_verified: true, picture: 'https://lh3.example/photo.jpg', name: 'Test Person', ...payload }),
};
const googleClient = require(path.join(SERVER_ROOT, 'src', 'utils', 'googleClient.js'));
googleClient.verifyIdToken = async ({ idToken }) => {
  let payload;
  try { payload = JSON.parse(idToken); } catch { throw new Error('Wrong number of segments in token'); }
  return { getPayload: () => payload };
};

const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer, MongoMemoryReplSet } = require('mongodb-memory-server');

let mongod = null;
let app = null;
const state = { ipCounter: 0 };
const nextIp = () => { const n = ++state.ipCounter; return `10.${(n >> 16) & 255}.${(n >> 8) & 255}.${n & 255}`; };

/** Set extra env BEFORE start() (e.g. ALLOWED_ORIGINS, NODE_ENV) because the app reads it when it loads. */
const env = (vars) => { for (const [k, v] of Object.entries(vars)) { if (v === undefined) delete process.env[k]; else process.env[k] = v; } };

async function start({ replSet = false } = {}) {
  mongod = replSet ? await MongoMemoryReplSet.create({ replSet: { count: 1 } }) : await MongoMemoryServer.create();
  await mongoose.connect(mongod.getUri());
  app = require(path.join(SERVER_ROOT, 'src', 'app.js'));
  const models = getModels();
  await Promise.all(Object.values(models).map((m) => m.init())); // build indexes (case-insensitive unique username etc.)
  return app;
}
async function stop() {
  try { await mongoose.disconnect(); } catch { /* already down */ }
  if (mongod) await mongod.stop();
}
const getModels = () => ({
  User: require(path.join(SERVER_ROOT, 'src', 'models', 'auth.model.js')),
  Project: require(path.join(SERVER_ROOT, 'src', 'models', 'project.model.js')),
  Progress: require(path.join(SERVER_ROOT, 'src', 'models', 'progress.model.js')),
  DSASheet: require(path.join(SERVER_ROOT, 'src', 'models', 'sheets.model.js')),
  Notes: require(path.join(SERVER_ROOT, 'src', 'models', 'notes.model.js')),
});
const resetData = async () => { await mongoose.connection.db.dropDatabase(); await Promise.all(Object.values(getModels()).map((m) => m.init())); };

// ── HTTP helper: always sends a unique client IP unless you pass one ──
const cookieHeader = (c) => Object.entries(c || {}).filter(([, v]) => v).map(([k, v]) => `${k}=${v}`).join('; ');
const parseCookies = (res) => {
  const out = {};
  for (const c of res.headers['set-cookie'] || []) { const [kv] = c.split(';'); const i = kv.indexOf('='); out[kv.slice(0, i)] = kv.slice(i + 1); }
  return out;
};
function call(method, urlPath, { cookies, body, ip, headers = {}, bearer } = {}) {
  let r = request(app)[method](urlPath).set('X-Forwarded-For', ip || nextIp());
  if (cookies) r = r.set('Cookie', cookieHeader(cookies));
  if (bearer) r = r.set('Authorization', `Bearer ${bearer}`);
  for (const [k, v] of Object.entries(headers)) r = r.set(k, v);
  return body === undefined ? r : r.send(body);
}
// A multipart form (a file upload): fields are plain text values, `file` is { buffer, filename, contentType }
function postForm(urlPath, { cookies, fields = {}, file, ip, headers = {} } = {}) {
  let r = request(app).post(urlPath).set('X-Forwarded-For', ip || nextIp());
  if (cookies) r = r.set('Cookie', cookieHeader(cookies));
  for (const [k, v] of Object.entries(headers)) r = r.set(k, v);
  for (const [k, v] of Object.entries(fields)) r = r.field(k, String(v));
  if (file) r = r.attach(file.field || 'resume', file.buffer, { filename: file.filename || 'resume.pdf', contentType: file.contentType || 'application/pdf' });
  return r;
}

// A small but REAL PDF made in memory, so the real PDF reader is exercised. `pages` is an array of pages, each an array of
// text lines. A page with no lines is drawn as a filled box only, which is what a scanned (image-only) page looks like.
function makePdf(pages) {
  const esc = (s) => s.replace(/\\/g, '\\\\').replace(/\(/g, '\\(').replace(/\)/g, '\\)');
  const objects = [];
  const add = (body) => { objects.push(body); return objects.length; };
  const catalog = add('<< /Type /Catalog /Pages 2 0 R >>');
  const pagesId = add('PAGES_PLACEHOLDER');
  const font = add('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>');
  const kids = [];
  for (const lines of pages) {
    const body = lines.length
      ? `BT /F1 11 Tf 40 780 Td 14 TL ${lines.map((l) => `(${esc(l)}) Tj T*`).join(' ')} ET`
      : '0.8 g 40 40 500 700 re f';
    const content = add(`<< /Length ${Buffer.byteLength(body)} >>\nstream\n${body}\nendstream`);
    kids.push(add(`<< /Type /Page /Parent ${pagesId} 0 R /MediaBox [0 0 595 842] /Contents ${content} 0 R /Resources << /Font << /F1 ${font} 0 R >> >> >>`));
  }
  objects[pagesId - 1] = `<< /Type /Pages /Kids [${kids.map((k) => `${k} 0 R`).join(' ')}] /Count ${kids.length} >>`;
  let out = '%PDF-1.4\n';
  const offsets = [];
  objects.forEach((body, i) => { offsets.push(Buffer.byteLength(out)); out += `${i + 1} 0 obj\n${body}\nendobj\n`; });
  const xref = Buffer.byteLength(out);
  out += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n${offsets.map((o) => `${String(o).padStart(10, '0')} 00000 n \n`).join('')}`;
  out += `trailer\n<< /Size ${objects.length + 1} /Root ${catalog} 0 R >>\nstartxref\n${xref}\n%%EOF`;
  return Buffer.from(out, 'latin1');
}

const api = { get: (p, o) => call('get', p, o), post: (p, o) => call('post', p, o), put: (p, o) => call('put', p, o), del: (p, o) => call('delete', p, o), options: (p, o) => call('options', p, o) };

// ── account helpers ──
let userCounter = 0;
const PASSWORD = 'Passw0rdX';
async function register(over = {}) {
  const n = ++userCounter;
  const username = over.username || `user_${n}_x`;
  const email = over.email || `user${n}@example.com`;
  const password = over.password || PASSWORD;
  const res = await api.post('/api/auth/register', { body: { username, email, password }, ip: over.ip, headers: over.headers });
  return { res, username, email, password, id: res.body?.data?.user?.id, cookies: parseCookies(res) };
}
async function login(account, { userAgent, ip } = {}) {
  const res = await api.post('/api/auth/login', { body: { email: account.email, password: account.password }, ip, headers: userAgent ? { 'User-Agent': userAgent } : {} });
  return { res, cookies: parseCookies(res) };
}
const UA = {
  windows: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0 Safari/537.36',
  iphone: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 Version/17.0 Mobile Safari/604.1',
  android: 'Mozilla/5.0 (Linux; Android 14) AppleWebKit/537.36 Chrome/120.0 Mobile Safari/537.36',
};

// ── data helpers ──
const L = (slug) => `https://leetcode.com/problems/${slug}/`;
async function seedSheets() {
  const { DSASheet } = getModels();
  await DSASheet.create([
    { name: 'Blind 75', slug: 'blind-75', description: 'd', topics: [
      { title: 'Arrays', problems: [
        { title: 'Two Sum', link: L('two-sum'), difficulty: 'Easy', tags: ['array', 'hashmap', 'extra'] },
        { title: '3Sum', link: L('3sum'), difficulty: 'Medium', tags: [] },
      ] },
      { title: 'Strings', problems: [
        { title: 'Valid Anagram', link: L('valid-anagram'), difficulty: 'Easy', tags: ['string'] },
        { title: '3Sum again', link: L('3sum'), difficulty: 'Medium', tags: [] }, // same link repeated in another topic
      ] },
    ] },
    { name: 'Other Sheet', slug: 'other-sheet', description: 'd', topics: [
      { title: 'Only', problems: [{ title: 'Only Problem', link: L('only-in-other'), difficulty: 'Hard', tags: [] }] },
    ] },
  ]);
}
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const countAt = async (Model, filter) => Model.countDocuments(filter);

module.exports = {
  SERVER_ROOT, env, start, stop, resetData, getModels, mongoose, gemini, groq, mail, MODELS, apiError, goodIdea, google,
  api, postForm, makePdf, register, login, parseCookies, cookieHeader, UA, PASSWORD, L, seedSheets, sleep, countAt, nextIp,
};
