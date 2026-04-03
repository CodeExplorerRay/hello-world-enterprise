const { GoogleGenAI } = require("@google/genai");

const MODEL_NAME = "gemini-flash-lite-latest";

function getGenAIClient(apiKey = process.env.GEMINI_API_KEY) {
  if (!apiKey) {
    return null;
  }

  return new GoogleGenAI({ apiKey });
}

function extractResponseText(response) {
  if (!response) {
    return "";
  }

  if (typeof response.text === "function") {
    return response.text();
  }

  return String(response.text || "");
}

module.exports = {
  MODEL_NAME,
  extractResponseText,
  getGenAIClient,
};
