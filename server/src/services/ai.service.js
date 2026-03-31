const { GoogleGenAI } = require("@google/genai");
const { z } = require('zod');
const { zodToJsonSchema } = require("zod-to-json-schema");

const ai = new GoogleGenAI({
  apiKey: process.env.GOOGLE_API_KEY
});

const projectSchema = z.object({
  title: z.string(),
  tagline: z.string(),
  description: z.string(),
  features: z.array(z.string()),
  techStack: z.string(),
  difficulty: z.string(),
  estimatedTime: z.string(),
  resumeValue: z.string(),
});

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

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseJsonSchema: zodToJsonSchema(projectSchema)
    },
  })

  // safer parsing
  const data = JSON.parse(response.text);

  return data;
}


module.exports = { generateProjectIdea }