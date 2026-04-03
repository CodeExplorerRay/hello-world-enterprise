const {
  MODEL_NAME,
  extractResponseText,
  getGenAIClient,
} = require("./genaiClient");
const { parseModelJsonResponse } = require("./parseModelJsonResponse");
const {
  buildCacheKey,
  getOrLoadWithRetry,
} = require("./runtimeModelSupport");

function buildFallbackSystemHealthNarrative(statuses = {}) {
  const lastGreeting = statuses.aiDecisionEngine?.lastGreeting || "Hello";
  const startupMs = statuses.capitalizationService?.startupMs || 4200;

  return {
    narrative: `The Gateway holds the line while the greeting quest pushes forward through a thicket of feature flags and punctuation politics. The AI oracle has most recently spoken '${lastGreeting}', and the punctuation forge remains steady enough to turn one tiny symbol into an operational milestone. The teapot continues its noble refusal at HTTP 418, while the Spring Boot citadel rises slowly, stretching every millisecond into dramatic tension. Still, the kingdom remains one orchestration away from rendering Hello World yet again.`,
    overallMood: "Cautiously epic",
    heroOfTheHour: "The Punctuation Service, for delivering precise symbolism without demanding philosophical recognition.",
    villainOfTheHour: `The Capitalization Service, because ${startupMs}ms is a bold amount of ceremony for uppercasing a single letter.`,
    teapotWisdom: "Refusal is not downtime when your entire identity is ceremonial non-compliance.",
    questStatus: "The quest is viable, dramatic, and one successful API round-trip away from completion.",
  };
}

async function generateSystemHealthNarrative(statuses, apiKey = process.env.GEMINI_API_KEY) {
  if (!apiKey) {
    return buildFallbackSystemHealthNarrative(statuses);
  }

  const genAI = getGenAIClient(apiKey);
  const request = {
    model: MODEL_NAME,
    config: {
      systemInstruction: `You are a dramatic narrator who describes the operational status of a microservices system as if it were an epic saga. Each microservice is a character in your story. The system displays "Hello World" but you treat this as an epic quest.

Respond in valid JSON.`,
      temperature: 1.4,
      topP: 0.95,
      topK: 50,
      maxOutputTokens: 768,
    },
  };

  const prompt = `Generate a dramatic status narrative for our HelloWorld Enterprise system.

Current service statuses:
- API Gateway: ${statuses.apiGateway?.status || "UNKNOWN"} (response time: ${statuses.apiGateway?.responseTimeMs || 0}ms)
- AI Decision Engine: ${statuses.aiDecisionEngine?.status || "UNKNOWN"} (last decision: "${statuses.aiDecisionEngine?.lastGreeting || "Hello"}")
- Teapot Health Check: ${statuses.teapotService?.status || "HTTP 418"} (always)
- Punctuation Service: ${statuses.punctuationService?.status || "UNKNOWN"}
- Capitalization Service: ${statuses.capitalizationService?.status || "UNKNOWN"} (Spring Boot startup: ${statuses.capitalizationService?.startupMs || 0}ms)
- Concatenation Service: ${statuses.concatenationService?.status || "UNKNOWN"}
- Feature Flag Service: ${statuses.featureFlagService?.status || "UNKNOWN"} (active flags: ${statuses.featureFlagService?.flagCount || 0})
- A/B Testing Service: ${statuses.abTestingService?.status || "UNKNOWN"} (current variant: ${statuses.abTestingService?.variant || "A"})
- Frontend: ${statuses.frontend?.status || "UNKNOWN"}

Respond in JSON:
{
  "narrative": "<3-5 sentence epic narrative about the system status>",
  "overallMood": "<the emotional state of the system>",
  "heroOfTheHour": "<which service is performing best and why>",
  "villainOfTheHour": "<which service is struggling and why>",
  "teapotWisdom": "<a one-sentence wisdom from the teapot>",
  "questStatus": "<how close are we to displaying Hello World?>"
}`;

  try {
    const cached = await getOrLoadWithRetry({
      key: buildCacheKey("systemHealthNarrative", statuses),
      loader: async () => {
        const result = await genAI.models.generateContent({
          ...request,
          contents: prompt,
        });

        return parseModelJsonResponse(extractResponseText(result));
      },
      ttlMs: 30000,
    });
    return cached.value;
  } catch (error) {
    const fallback = buildFallbackSystemHealthNarrative(statuses);
    fallback._fallback = true;
    fallback._error = error.message;
    return fallback;
  }
}

module.exports = {
  buildFallbackSystemHealthNarrative,
  generateSystemHealthNarrative,
};
