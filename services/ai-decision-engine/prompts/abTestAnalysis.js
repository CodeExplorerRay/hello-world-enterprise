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

const AB_ANALYSIS_INPUT = {
  experimentName: "Exclamation Mark Optimization",
  variantA: {
    visitors: 23,
    description: "Hello World!",
  },
  variantB: {
    visitors: 24,
    description: "Hello World.",
  },
  duration: "6 months",
  totalVisitors: 47,
};

function buildFallbackAbAnalysis() {
  return {
    experimentName: AB_ANALYSIS_INPUT.experimentName,
    hypothesis: "Adding an exclamation mark measurably improves enterprise-grade greeting delight compared with a period.",
    methodology: "We observed 47 visitors over six months, assigned them into two punctuation cohorts, and then applied a breathtaking amount of statistical language to a sample that should not support this much confidence.",
    results: {
      variantA: {
        visitors: AB_ANALYSIS_INPUT.variantA.visitors,
        description: AB_ANALYSIS_INPUT.variantA.description,
        engagementRate: "52.2%",
        avgTimeOnPage: "00:00:11",
        emotionalResponse: "7.4 delight units",
      },
      variantB: {
        visitors: AB_ANALYSIS_INPUT.variantB.visitors,
        description: AB_ANALYSIS_INPUT.variantB.description,
        engagementRate: "49.8%",
        avgTimeOnPage: "00:00:10",
        emotionalResponse: "6.9 composure units",
      },
    },
    statisticalAnalysis: {
      pValue: "0.42",
      confidenceInterval: "-31% to +36%",
      statisticalPower: "11%",
      sampleSizeRequired: 18472,
      sampleSizeActual: AB_ANALYSIS_INPUT.totalVisitors,
      isSignificant: false,
      honestyNote: "This experiment is directionally entertaining but scientifically underpowered.",
    },
    recommendation: "Continue serving the exclamation mark as the aspirational default while publicly admitting that the sample is far too small to justify executive certainty.",
    nextSteps: [
      "Collect more than 47 visitors before convening another punctuation steering committee.",
      "Instrument emotional-response telemetry with fewer PowerPoint slides and more actual users.",
      "Re-run the test after auditing whether the period cohort was exposed to seasonal fatigue.",
    ],
    executiveSummary: "Variant A appears theatrically better, but the confidence interval is so wide that either punctuation mark could still be the true champion. The responsible recommendation is humility, which the board is unlikely to approve.",
  };
}

async function generateAbTestAnalysis(apiKey = process.env.GEMINI_API_KEY) {
  if (!apiKey) {
    return buildFallbackAbAnalysis();
  }

  const genAI = getGenAIClient(apiKey);

  const request = {
    model: MODEL_NAME,
    config: {
      temperature: 0.8,
      topP: 0.9,
      maxOutputTokens: 1024,
    },
  };

  const prompt = `You are a Senior Data Scientist at HelloWorld Enterprise.

Generate a detailed A/B test analysis report for the following experiment:

Experiment: "Exclamation Mark Optimization"
- Variant A: "Hello World!" (with exclamation mark)
- Variant B: "Hello World." (with period)
- Duration: 6 months
- Total visitors: 47
- Variant A visitors: 23
- Variant B visitors: 24

Generate absurdly detailed statistical analysis of this tiny sample size.
Include fake metrics, confidence intervals, and a recommendation.

Respond in JSON format:
{
  "experimentName": "Exclamation Mark Optimization",
  "hypothesis": "<formal scientific hypothesis>",
  "methodology": "<overly detailed methodology>",
  "results": {
    "variantA": {
      "visitors": 23,
      "description": "Hello World!",
      "engagementRate": "<made up percentage>",
      "avgTimeOnPage": "<made up duration>",
      "emotionalResponse": "<made up metric>"
    },
    "variantB": {
      "visitors": 24,
      "description": "Hello World.",
      "engagementRate": "<made up percentage>",
      "avgTimeOnPage": "<made up duration>",
      "emotionalResponse": "<made up metric>"
    }
  },
  "statisticalAnalysis": {
    "pValue": "<absurdly non-significant>",
    "confidenceInterval": "<comically wide>",
    "statisticalPower": "<very low>",
    "sampleSizeRequired": "<very large number>",
    "sampleSizeActual": 47,
    "isSignificant": false,
    "honestyNote": "<admission that this data means nothing>"
  },
  "recommendation": "<formal but useless recommendation>",
  "nextSteps": ["<step 1>", "<step 2>", "<step 3>"],
  "executiveSummary": "<1-2 sentence summary for the board>"
}`;

  try {
    const cached = await getOrLoadWithRetry({
      key: buildCacheKey("abTestAnalysis", AB_ANALYSIS_INPUT),
      loader: async () => {
        const result = await genAI.models.generateContent({
          ...request,
          contents: prompt,
        });

        return parseModelJsonResponse(extractResponseText(result));
      },
      ttlMs: 300000,
    });
    return cached.value;
  } catch (error) {
    const fallback = buildFallbackAbAnalysis();
    fallback._fallback = true;
    fallback._error = error.message;
    return fallback;
  }
}

module.exports = {
  AB_ANALYSIS_INPUT,
  buildFallbackAbAnalysis,
  generateAbTestAnalysis,
};
