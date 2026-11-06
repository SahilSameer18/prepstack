const { GoogleGenAI } = require("@google/genai");
const { z } = require('zod');
const AppError = require('../utils/AppError');

const ai = new GoogleGenAI({
  apiKey: process.env.GOOGLE_API_KEY
});

// Same values the client renders (AIProjectIdeas.jsx) and the form offers
const DIFFICULTIES = ['Beginner', 'Intermediate', 'Advanced'];

const projectSchema = z.object({
  title: z.string().min(1),
  tagline: z.string().min(1),
  description: z.string().min(1),
  features: z.array(z.string()),
  techStack: z.string().min(1),
  difficulty: z.enum(DIFFICULTIES),
  estimatedTime: z.string(),
  resumeValue: z.string(),
});

// zod v4 builds the JSON schema natively (the old zod-to-json-schema package returns an empty
// schema for zod v4). Gemini only needs the plain shape, so drop the two keys it may reject.
const responseJsonSchema = z.toJSONSchema(projectSchema);
delete responseJsonSchema.$schema;
delete responseJsonSchema.additionalProperties;

const generateProjectIdea = async ({ techStack, complexity, domain, notes }) => {

  const prompt = `
  You are an expert career coach and a senior software engineer.

  Generate a UNIQUE startup-level project idea that solves a real-world problem.
  Avoid generic ideas like todo apps, chat apps, or clones.

  Return ONLY valid JSON with this structure:
  {
    "title": "",
    "tagline": "",
    "description": "",
    "features": [],
    "techStack": "",
    "difficulty": "",
    "estimatedTime": "",
    "resumeValue": ""
  }

  Rules:
  - No markdown
  - No explanations
  - No extra text
  - Strict JSON only

  Criteria:
  - Techstack: ${techStack}
  - Complexity: ${complexity}
  - Domain: ${domain || "General"}
  - Extra Notes: ${notes || "None"}
  Also include:
  - real-world problem it solves
  - why it's impressive for recruiters
  `;

  let response;
  try {
    response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseJsonSchema
      },
    });
  } catch (err) {
    console.error('Gemini request failed:', err.message);
    throw new AppError(502, 'AI service is unavailable right now. Please try again.');
  }

  let data;
  try {
    data = JSON.parse(response.text);
  } catch {
    throw new AppError(502, 'AI service returned an invalid response. Please try again.');
  }

  // Never save model output that does not match the schema (wrong types, missing fields, bad difficulty)
  const parsed = projectSchema.safeParse(data);
  if (!parsed.success) {
    throw new AppError(502, 'AI service returned an incomplete response. Please try again.');
  }

  return parsed.data;
}


module.exports = { generateProjectIdea }