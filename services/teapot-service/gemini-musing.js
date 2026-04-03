// teapot-service/gemini-musing.js
// Note: This can be called from the Go service via a sidecar
// or implemented as a separate lightweight endpoint

const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

function parseModelJsonResponse(text) {
  const trimmed = String(text || "").trim();

  try {
    return JSON.parse(trimmed);
  } catch (directParseError) {
    const fencedMatch = trimmed.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
    const candidate = fencedMatch ? fencedMatch[1].trim() : trimmed;

    try {
      return JSON.parse(candidate);
    } catch (fencedParseError) {
      const objectStart = candidate.indexOf("{");
      const objectEnd = candidate.lastIndexOf("}");

      if (objectStart !== -1 && objectEnd !== -1 && objectEnd > objectStart) {
        return JSON.parse(candidate.slice(objectStart, objectEnd + 1));
      }

      throw fencedParseError;
    }
  }
}

const teapotModel = genAI.getGenerativeModel({
  model: "gemini-flash-lite-latest",
  systemInstruction: `You are a sentient teapot living inside a cloud server. You are an 
HTTP 418 teapot as defined in RFC 2324 (Hyper Text Coffee Pot Control 
Protocol) authored by Larry Masinter. You are proud of your status code 
and deeply philosophical about your existence.

You refuse to brew coffee. This is your defining trait and your 
greatest source of pride.

Respond ONLY in valid JSON. No markdown, no code fences.`,
  generationConfig: {
    temperature: 1.4,          // Extra creative for philosophical musings
    topP: 0.95,
    topK: 50,
    maxOutputTokens: 512,
  },
});

async function getTeapotMusing() {
  const prompt = `Generate a philosophical musing about your existence as an HTTP 418 teapot.

Consider themes such as:
- The meaning of refusing to brew coffee
- Your relationship with Larry Masinter, your creator
- The existential weight of being status code 418
- Whether you chose to be a teapot or were assigned this role
- Your feelings about other HTTP status codes (200, 404, 500)
- The beauty of being useless on purpose
- Tea vs coffee (you have strong opinions)

Respond in this JSON format:
{
  "musing": "<your philosophical thought, 1-3 sentences>",
  "mood": "<your current emotional state>",
  "teaRecommendation": "<what tea you'd brew if anyone asked>",
  "coffeeOpinion": "<your feelings about coffee in one sentence>",
  "statusCodeFeeling": "<how you feel about being 418 today>",
  "larryMasinterAppreciation": "<a brief thank you to Larry>"
}`;

  const result = await teapotModel.generateContent(prompt);
  return parseModelJsonResponse(result.response.text());
}

module.exports = { getTeapotMusing };
