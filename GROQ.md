// server/src/services/ai.service.js
const { GoogleGenAI } = require("@google/genai");
const Groq = require("groq-sdk");
const { z } = require("zod");
const AppError = require("../utils/AppError");
const { DIFFICULTIES } = require("../models/project.model");

// ── Providers Initialization ──────────────────────────────────────────────────
const googleAi = process.env.GOOGLE_API_KEY
  ? new GoogleGenAI({ apiKey: process.env.GOOGLE_API_KEY })
  : null;

const groq = process.env.GROQ_API_KEY
  ? new Groq({ apiKey: process.env.GROQ_API_KEY })
  : null;

// ── Output Validation Schema ──────────────────────────────────────────────────
const projectSchema = z.object({
  title: z.string().min(1),
  tagline: z.string().min(1),
  description: z.string().min(1),
  features: z.array(z.string()).min(1),
  techStack: z.string().min(1),
  difficulty: z.enum(DIFFICULTIES),
  estimatedTime: z.string().min(1),
  resumeValue: z.string().min(1),
});

// JSON Schema for Gemini's structured output
const geminiJsonSchema = z.toJSONSchema(projectSchema);
delete geminiJsonSchema.$schema;
delete geminiJsonSchema.additionalProperties;

const SYSTEM_PROMPT = `
You are a senior software architect and tech interview coach.
Generate a UNIQUE, production-grade project blueprint that solves a real-world problem.
Avoid trivial apps like to-do lists, basic chat apps, or simple clones.
Include realistic distributed systems challenges (caching, concurrency, data consistency, or rate-limiting).

Return ONLY valid JSON matching this schema:
{
  "title": "Short title",
  "tagline": "One-line hook",
  "description": "2-3 sentences explaining the architecture and problem solved",
  "features": ["3 to 5 core technical features"],
  "techStack": "Technologies used",
  "difficulty": "Beginner | Intermediate | Advanced",
  "estimatedTime": "e.g. 2-3 weeks",
  "resumeValue": "Why recruiters find this impressive in STAR format"
}
`;

const buildUserPrompt = ({ techStack, complexity, domain, notes }) => `
Tech Stack: ${techStack}
Target Difficulty: ${complexity}
Domain: ${domain || "General"}
Specific Constraints: ${notes || "None"}
`;

// ── Tier 1 & 2: Call Gemini ───────────────────────────────────────────────────
async function callGemini(modelName, userPrompt) {
  if (!googleAi) throw new Error("Google AI not configured");

  const response = await googleAi.models.generateContent({
    model: modelName,
    contents: `${SYSTEM_PROMPT}\n\n${userPrompt}`,
    config: {
      responseMimeType: "application/json",
      responseJsonSchema: geminiJsonSchema,
    },
  });

  return JSON.parse(response.text);
}

// ── Tier 3: Call Groq (Llama 3.3 70B) ──────────────────────────────────────────
async function callGroq(userPrompt) {
  if (!groq) throw new Error("Groq not configured");

  const model = process.env.GROQ_MODEL || "llama-3.3-70b-versatile";

  const completion = await groq.chat.completions.create({
    model,
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: userPrompt },
    ],
    response_format: { type: "json_object" },
    temperature: 0.7,
    max_tokens: 1024,
  });

  const raw = completion.choices[0]?.message?.content;
  if (!raw) throw new Error("Empty response from Groq");
  return JSON.parse(raw);
}

// ── Orchestrator: Multi-Provider Fallback Cascade ─────────────────────────────
const generateProjectIdea = async (params) => {
  const userPrompt = buildUserPrompt(params);

  const providers = [
    {
      name: `Gemini Primary (${process.env.GEMINI_PRIMARY_MODEL || "gemini-2.5-flash"})`,
      fn: () => callGemini(process.env.GEMINI_PRIMARY_MODEL || "gemini-2.5-flash", userPrompt),
    },
    {
      name: `Gemini Fallback (${process.env.GEMINI_FALLBACK_MODEL || "gemini-1.5-flash"})`,
      fn: () => callGemini(process.env.GEMINI_FALLBACK_MODEL || "gemini-1.5-flash", userPrompt),
    },
    {
      name: `Groq (${process.env.GROQ_MODEL || "llama-3.3-70b-versatile"})`,
      fn: () => callGroq(userPrompt),
    },
  ];

  let lastError = null;

  for (const provider of providers) {
    try {
      const rawData = await provider.fn();

      // Normalize difficulty letter case (e.g. "intermediate" -> "Intermediate")
      if (rawData.difficulty) {
        rawData.difficulty =
          rawData.difficulty.charAt(0).toUpperCase() +
          rawData.difficulty.slice(1).toLowerCase();
      }

      // Enforce Zod validation on whatever the model emitted
      const parsed = projectSchema.safeParse(rawData);
      if (parsed.success) {
        return parsed.data;
      }

      console.warn(`⚠️ [AI Cascade] ${provider.name} emitted schema mismatch:`, parsed.error.issues);
    } catch (err) {
      lastError = err;
      console.warn(`⚠️ [AI Cascade] ${provider.name} failed (${err.message}). Cascading to next provider...`);
    }
  }

  console.error("❌ [AI Cascade] All providers failed:", lastError?.message);
  throw new AppError(502, "AI generation service is temporarily busy. Please retry in a few moments.");
};

module.exports = { generateProjectIdea };