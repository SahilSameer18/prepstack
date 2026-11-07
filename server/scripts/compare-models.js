// One-off helper: sends the SAME request to every configured AI provider, one at a time, and prints what each one
// answers, so you can compare the quality of the project ideas. Uses the real service code (same prompt, same format
// check). Costs one request on each provider's free quota. Never prints a key. Does not touch the database.
//
//   node scripts/compare-models.js                      default request (MERN, intermediate, FinTech)
//   node scripts/compare-models.js "Go + Postgres" advanced Healthcare "keep it small"
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env'), quiet: true });
const { buildPrompt, buildProviders, parseIdea } = require('../src/services/ai.service');

const [techStack = 'MERN', complexity = 'intermediate', domain = 'FinTech', notes = ''] = process.argv.slice(2);
const params = { techStack, complexity, domain, notes };

(async () => {
  const providers = buildProviders();
  if (!providers.length) return console.log('No AI provider is configured (set GOOGLE_API_KEY and/or GROQ_API_KEY in server/.env).');
  console.log(`Request sent to every model: techStack="${techStack}", complexity="${complexity}", domain="${domain}", notes="${notes}"`);
  const prompt = buildPrompt(params);
  for (const p of providers) {
    const started = Date.now();
    console.log(`\n${'='.repeat(78)}\n${p.name}`);
    try {
      const raw = await p.run(prompt, AbortSignal.timeout(60_000));
      const ms = Date.now() - started;
      const idea = parseIdea(raw); // the same format check the real service applies
      const words = (idea.description + ' ' + idea.resumeValue + ' ' + idea.features.join(' ')).split(/\s+/).length;
      console.log(`passed the format check | ${ms} ms | about ${words} words | ${idea.features.length} features | difficulty ${idea.difficulty} | ${idea.estimatedTime}`);
      console.log(`\nTITLE:    ${idea.title}\nTAGLINE:  ${idea.tagline}\nTECH:     ${idea.techStack}\n\nDESCRIPTION:\n${idea.description}\n\nFEATURES:\n${idea.features.map((f, i) => `  ${i + 1}. ${f}`).join('\n')}\n\nRESUME VALUE:\n${idea.resumeValue}`);
    } catch (err) {
      console.log(`FAILED after ${Date.now() - started} ms: ${err.status ?? err.name ?? ''} ${String(err.message).replace(/\s+/g, ' ').slice(0, 200)}`);
    }
  }
})();
