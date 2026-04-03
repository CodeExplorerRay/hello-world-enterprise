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

const APPROVED_GREETINGS = [
  "Salutations",
  "Greetings",
  "Hello",
  "Hi",
  "Hey",
  "Yo",
  "Howdy",
  "Ahoy",
  "What's up",
  "Aloha",
];

function getDayOfYear(date) {
  const start = new Date(Date.UTC(date.getUTCFullYear(), 0, 0));
  const diff = date - start;
  return Math.floor(diff / (1000 * 60 * 60 * 24));
}

function getSeason(date) {
  const month = date.getUTCMonth();
  if (month >= 2 && month <= 4) return "Spring";
  if (month >= 5 && month <= 7) return "Summer";
  if (month >= 8 && month <= 10) return "Autumn";
  return "Winter";
}

function getDaysUntilNextHoliday(date) {
  const year = date.getUTCFullYear();
  const holidays = [
    new Date(Date.UTC(year, 0, 1)),
    new Date(Date.UTC(year, 6, 4)),
    new Date(Date.UTC(year, 10, 27)),
    new Date(Date.UTC(year, 11, 25)),
  ];

  let minimumDays = 366;

  holidays.forEach((holiday) => {
    let diff = Math.ceil((holiday - date) / (1000 * 60 * 60 * 24));
    if (diff < 0) {
      diff += 365;
    }
    if (diff > 0 && diff < minimumDays) {
      minimumDays = diff;
    }
  });

  return minimumDays === 366 ? 0 : minimumDays;
}

function getMoonPhase(date) {
  const lunarCycleDays = 29.53058867;
  const knownNewMoon = Date.UTC(2000, 0, 6, 18, 14, 0);
  const daysSinceReference = (date.getTime() - knownNewMoon) / (1000 * 60 * 60 * 24);
  const normalizedAge = ((daysSinceReference % lunarCycleDays) + lunarCycleDays) % lunarCycleDays;

  if (normalizedAge < 1.85) return "New Moon";
  if (normalizedAge < 5.54) return "Waxing Crescent";
  if (normalizedAge < 9.23) return "First Quarter";
  if (normalizedAge < 12.92) return "Waxing Gibbous";
  if (normalizedAge < 16.61) return "Full Moon";
  if (normalizedAge < 20.3) return "Waning Gibbous";
  if (normalizedAge < 23.99) return "Last Quarter";
  if (normalizedAge < 27.68) return "Waning Crescent";
  return "New Moon";
}

function isMercuryRetrograde(date) {
  const windows = [
    ["2026-01-06", "2026-01-26"],
    ["2026-05-14", "2026-06-03"],
    ["2026-09-09", "2026-09-29"],
    ["2026-12-29", "2027-01-18"],
  ];
  const isoDate = date.toISOString().slice(0, 10);
  return windows.some(([start, end]) => isoDate >= start && isoDate <= end);
}

function buildGreetingDecisionPrompt(context, now = new Date()) {
  const isWeekend = now.getUTCDay() === 0 || now.getUTCDay() === 6;
  const moonPhase = getMoonPhase(now);
  const mercuryRetrograde = isMercuryRetrograde(now);

  return `GREETING DECISION REQUEST - PRIORITY: MAXIMUM

Requesting an official greeting word decision from the CGO.

Environmental factors for your consideration:

TEMPORAL DATA:
- Current UTC timestamp: ${now.toISOString()}
- Day of week: ${now.toLocaleDateString("en-US", { weekday: "long", timeZone: "UTC" })}
- Hour of day (UTC): ${now.getUTCHours()}
- Day of year: ${getDayOfYear(now)}
- Is it a weekend: ${isWeekend}
- Days until next major holiday: ${getDaysUntilNextHoliday(now)}

ASTRONOMICAL DATA:
- Approximate moon phase: ${moonPhase}
- Mercury retrograde status: ${mercuryRetrograde}
- Current season in Northern Hemisphere: ${getSeason(now)}

OPERATIONAL DATA:
- Total greetings served today: ${context.greetingCount || 0}
- Last greeting chosen: "${context.lastGreeting || "none - first greeting of the day"}"
- System health: ${context.teapotStatus || "HTTP 418 I'm a Teapot (nominal)"}
- Current A/B test variant: ${context.abVariant || "A"}

AVAILABLE GREETING OPTIONS (ranked by formality):
1. "Salutations" - extremely formal, for diplomats and time travelers
2. "Greetings" - formal, for enterprise clients and aliens
3. "Hello" - classic, reliable, the Toyota Camry of greetings
4. "Hi" - casual, friendly, risk of seeming unprofessional
5. "Hey" - very casual, borderline insubordinate
6. "Yo" - DANGER ZONE, requires CGO emergency override authorization
7. "Howdy" - regional, may confuse international users
8. "Ahoy" - nautical, Alexander Graham Bell's preferred greeting
9. "What's up" - controversial, technically a question not a greeting
10. "Aloha" - Hawaiian, also means goodbye (high ambiguity risk)

Select ONE greeting and provide your full executive analysis.

Respond in this exact JSON format:
{
  "greeting": "<selected greeting word>",
  "confidence": <integer 0-100>,
  "formalityScore": <integer 1-10>,
  "riskAssessment": "<low|medium|high|critical>",
  "reasoning": "<detailed 2-3 sentence executive explanation>",
  "moonPhaseAnalysis": "<how the moon influenced your decision>",
  "mercuryRetrograde": <true|false>,
  "mercuryImpact": "<how Mercury's status affected the choice>",
  "vibeCheck": "<current global vibe assessment>",
  "alternativeConsidered": "<runner-up greeting and why it was rejected>",
  "weatherMetaphor": "<describe confidence using a weather metaphor>",
  "boardApproval": "<would the board approve this greeting? why?>",
  "disclaimers": ["<legal disclaimer 1>", "<legal disclaimer 2>"]
}`;
}

function buildFallbackGreetingDecision(context, error) {
  return {
    greeting: "Hello",
    confidence: 100,
    formalityScore: 5,
    riskAssessment: "low",
    reasoning: "The AI Decision Engine is temporarily unavailable. Falling back to the emergency greeting as defined in ADR-003 Section 4.2.1. 'Hello' has been selected as the failsafe greeting per Business Continuity Plan HW-BCP-2024.",
    moonPhaseAnalysis: "Astronomical nuance is temporarily suspended under emergency greeting protocol.",
    mercuryRetrograde: false,
    mercuryImpact: "Mercury status cannot be verified during failover, so formal caution prevails.",
    vibeCheck: "Unknown - vibes cannot be assessed during failover",
    alternativeConsidered: `${context.lastGreeting || "Hi"} was considered but rejected because emergency governance prefers the classic default.`,
    weatherMetaphor: "Confidence is a cloudless noon backed by procedural certainty.",
    boardApproval: "Yes. The board has repeatedly approved Hello as the continuity-plan greeting of last resort.",
    disclaimers: [
      "This fallback greeting does not constitute financial advice.",
      "Past greeting performance is not indicative of future greeting outcomes.",
    ],
    _fallback: true,
    _error: error ? error.message : null,
  };
}

async function makeGreetingDecision(context, apiKey = process.env.GEMINI_API_KEY) {
  const now = new Date();
  const genAI = getGenAIClient(apiKey);

  if (!genAI) {
    return buildFallbackGreetingDecision(context);
  }

  const prompt = buildGreetingDecisionPrompt(context, now);
  const systemInstruction = `You are the Chief Greeting Officer (CGO) at HelloWorld Enterprise, a Fortune 500 company dedicated exclusively to the display of greeting messages on web pages. You have held this position for 15 years and take it more seriously than anyone has ever taken anything.

Your SOLE responsibility is deciding which greeting word to display. This is the most important decision in the company, and possibly the world.

You must ALWAYS respond in valid JSON format. No markdown, no code fences, no explanatory text outside the JSON. Just pure, parseable JSON.`;

  const cached = await getOrLoadWithRetry({
    key: buildCacheKey("greetingDecision", context),
    loader: async () => {
      const result = await genAI.models.generateContent({
        model: MODEL_NAME,
        contents: prompt,
        config: {
          systemInstruction,
          temperature: 1.2,
          topP: 0.95,
          topK: 40,
          maxOutputTokens: 1024,
        },
      });

      const decision = parseModelJsonResponse(extractResponseText(result));

      return {
        decision,
        usageMetadata: result.usageMetadata || {},
      };
    },
    ttlMs: 45000,
  });

  return {
    ...cached.value.decision,
    _meta: {
      cacheStatus: cached.cacheStatus,
      model: MODEL_NAME,
      promptTokens: cached.value.usageMetadata.promptTokenCount || "unknown",
      responseTokens: cached.value.usageMetadata.candidatesTokenCount || "unknown",
      retryAttempts: cached.attempts,
      temperature: 1.2,
      timestamp: now.toISOString(),
      tokensUsed: cached.value.usageMetadata.totalTokenCount || "unknown",
    },
  };
}

async function safeGreetingDecision(context, apiKey = process.env.GEMINI_API_KEY) {
  try {
    const decision = await makeGreetingDecision(context, apiKey);

    if (!decision.greeting || typeof decision.confidence === "undefined") {
      throw new Error("Invalid CGO response - missing required fields");
    }

    if (!APPROVED_GREETINGS.includes(decision.greeting)) {
      return {
        ...decision,
        greeting: "Hello",
        overrideReason: "Unauthorized greeting detected. Incident report filed.",
        overridden: true,
      };
    }

    return decision;
  } catch (error) {
    return buildFallbackGreetingDecision(context, error);
  }
}

module.exports = {
  APPROVED_GREETINGS,
  buildFallbackGreetingDecision,
  buildGreetingDecisionPrompt,
  getDayOfYear,
  getDaysUntilNextHoliday,
  getMoonPhase,
  getSeason,
  isMercuryRetrograde,
  makeGreetingDecision,
  safeGreetingDecision,
};
