const { GoogleGenerativeAI } = require("@google/generative-ai");
const express = require('express');
const app = express();

const genAI = process.env.GEMINI_API_KEY ? new GoogleGenerativeAI(process.env.GEMINI_API_KEY) : null;

app.get('/decide', async (req, res) => {
  if (genAI) {
    // Real Gemini integration
    try {
      const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

      const prompt = `
        You are the Chief Greeting Officer (CGO) at HelloWorld Enterprise™.
        Your CRITICAL mission is to decide which greeting word to use.
        
        Options: "Hello", "Hi", "Hey", "Greetings", "Salutations"
        
        Consider the following factors:
        - Current time of day: ${new Date().toISOString()}
        - Day of week: ${new Date().toLocaleDateString('en-US', { weekday: 'long' })}
        - Current moon phase (estimate it)
        - The emotional state of the average internet user right now
        - Whether Mercury is in retrograde
        - The vibes
        
        Respond with ONLY a JSON object:
        {
          "greeting": "<chosen word>",
          "confidence": <0-100>,
          "reasoning": "<elaborate, overly dramatic explanation>",
          "moonPhaseConsideration": "<string>",
          "vibeCheck": "<string>"
        }
      `;

      const result = await model.generateContent(prompt);
      const response = JSON.parse(result.response.text());

      res.json({
        ...response,
        tokensUsed: result.response.usageMetadata.totalTokenCount,
        aiModel: "gemini-2.0-flash",
        disclaimer: "AI was used in the making of this greeting decision."
      });
    } catch (error) {
      // Fallback to mock if API fails
      res.json({
        greeting: "Hello",
        confidence: 95,
        reasoning: "Mock response due to API error: " + error.message,
        moonPhaseConsideration: "Waxing crescent - positive energy",
        vibeCheck: "Excellent vibes, users are ready for greetings",
        tokensUsed: 0,
        aiModel: "mock-gemini-fallback",
        disclaimer: "Mock AI due to API failure."
      });
    }
  } else {
    // Mock response when no API key
    res.json({
      greeting: "Hello",
      confidence: 95,
      reasoning: "Mock response for testing - AI decided on Hello because it's classic",
      moonPhaseConsideration: "Waxing crescent - positive energy",
      vibeCheck: "Excellent vibes, users are ready for greetings",
      tokensUsed: 0,
      aiModel: "mock-gemini",
      disclaimer: "Mock AI for testing purposes - set GEMINI_API_KEY for real integration."
    });
  }
});

app.listen(8081);