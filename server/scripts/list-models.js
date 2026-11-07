// One-off helper: prints which AI models your keys can use. Never prints a key.
//
//   node scripts/list-models.js                 list model IDs for Gemini and Groq
//   node scripts/list-models.js --probe ID ...  send ONE tiny request per ID and report whether it can
//                                               return structured JSON (uses a little of the free quota)
//
// Prefix a Groq ID with "groq:" (for example groq:openai/gpt-oss-120b); everything else is treated as a Gemini ID.
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const { GoogleGenAI } = require('@google/genai');
const Groq = require('groq-sdk');
const { z } = require('zod');

const SCHEMA = z.object({ title: z.string(), difficulty: z.enum(['Beginner', 'Intermediate', 'Advanced']) });
const jsonSchema = z.toJSONSchema(SCHEMA);
delete jsonSchema.$schema;
delete jsonSchema.additionalProperties;
const PROMPT = 'Invent a one-line project title and pick its difficulty. Reply only with JSON.';

const gemini = process.env.GOOGLE_API_KEY ? new GoogleGenAI({ apiKey: process.env.GOOGLE_API_KEY }) : null;
const groq = process.env.GROQ_API_KEY ? new Groq({ apiKey: process.env.GROQ_API_KEY }) : null;

async function listGemini() {
  if (!gemini) return console.log('Gemini: GOOGLE_API_KEY is not set, skipped.');
  const ids = [];
  for await (const m of await gemini.models.list()) {
    // keep text models that can generate content
    if (/gemini|gemma/i.test(m.name) && (!m.supportedActions || m.supportedActions.includes('generateContent'))) ids.push(m.name.replace(/^models\//, ''));
  }
  console.log(`\nGemini models (${ids.length}):`);
  ids.sort().forEach((id) => console.log('  ' + id));
}

async function listGroq() {
  if (!groq) return console.log('\nGroq: GROQ_API_KEY is not set, skipped.');
  const res = await groq.models.list();
  const ids = res.data.map((m) => m.id).sort();
  console.log(`\nGroq models (${ids.length}):`);
  ids.forEach((id) => console.log('  ' + id));
}

async function probe(id) {
  const started = Date.now();
  try {
    if (id.startsWith('groq:')) {
      if (!groq) throw new Error('GROQ_API_KEY is not set');
      const model = id.slice(5);
      let mode = 'json_schema';
      let res;
      const base = { model, messages: [{ role: 'user', content: PROMPT }], max_completion_tokens: 1500, reasoning_effort: 'low' };
      try {
        res = await groq.chat.completions.create({ ...base, response_format: { type: 'json_schema', json_schema: { name: 'idea', schema: jsonSchema } } });
      } catch (err) {
        mode = `json_object (json_schema was refused: ${err.status || ''} ${String(err.message).slice(0, 80)})`;
        res = await groq.chat.completions.create({ ...base, response_format: { type: 'json_object' } });
      }
      const ok = SCHEMA.safeParse(JSON.parse(res.choices[0].message.content)).success;
      console.log(`OK    ${id}  structured-json=${ok}  mode=${mode}  tokens=${res.usage?.total_tokens}  ${Date.now() - started}ms`);
    } else {
      if (!gemini) throw new Error('GOOGLE_API_KEY is not set');
      const res = await gemini.models.generateContent({ model: id, contents: PROMPT, config: { responseMimeType: 'application/json', responseJsonSchema: jsonSchema } });
      const ok = SCHEMA.safeParse(JSON.parse(res.text)).success;
      console.log(`OK    ${id}  structured-json=${ok}  tokens=${res.usageMetadata?.totalTokenCount}  ${Date.now() - started}ms`);
    }
  } catch (err) {
    console.log(`FAIL  ${id}  status=${err.status ?? err.code ?? '?'}  ${String(err.message).replace(/\s+/g, ' ').slice(0, 160)}`);
  }
}

(async () => {
  const args = process.argv.slice(2);
  if (args[0] === '--probe') {
    const ids = args.slice(1);
    if (!ids.length) return console.log('Give at least one model ID after --probe.');
    for (const id of ids) await probe(id); // one at a time: free limits are per minute
    return;
  }
  await listGemini().catch((e) => console.log('Gemini list failed:', String(e.message).slice(0, 160)));
  await listGroq().catch((e) => console.log('Groq list failed:', String(e.message).slice(0, 160)));
})();
