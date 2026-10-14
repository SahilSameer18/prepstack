import { GoogleGenAI } from "@google/genai";
// import { z } from "zod";
// import { zodToJsonSchema } from "zod-to-json-schema";

const ai = new GoogleGenAI({
  apiKey: process.env.GOOGLE_GENAI_API_KEY,
});

async function generateInterviewReport({
  resume,
  jobDescription,
}) {
  const prompt = `You are an expert technical interviewer and career coach. Generate a comprehensive interview report for a candidate with the following details:
                        Resume: ${resume}
                        Job Description: ${jobDescription}

                        CRITICAL INSTRUCTIONS:
                        You MUST return a valid JSON object matching this exact structure:
                        {
                            "matchScore": <number between 0 and 100>,
                            "technicalQuestions": [
                                { "question": "<string>", "intention": "<string>", "answer": "<string>" },
                                ... generate at least 5 technical questions
                            ],
                            "behavioralQuestions": [
                                { "question": "<string>", "intention": "<string>", "answer": "<string>" },
                                ... generate at least 5 behavioral questions
                            ],
                            "skillGaps": [
                                { "skill": "<string>", "severity": "<'low' | 'medium' | 'high'>" },
                                ... identify at least 3 skill gaps
                            ],
                            "preparationPlan": [
                                { "day": <number>, "focus": "<string>", "tasks": ["<string>", "<string>"] },
                                ... generate a plan spanning at least 10 days
                            ],
                            "title": "<string> job title"
                        }
                        
                        DO NOT RETURN EMPTY ARRAYS. All arrays MUST be populated with high-quality content tailored to the candite and job description!
`;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
    },
  });

  return JSON.parse(response.text);
}

export { generateInterviewReport };