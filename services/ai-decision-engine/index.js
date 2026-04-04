const express = require("express");
const {
  safeGreetingDecision,
} = require("./prompts/greetingDecision");
const {
  generateAbTestAnalysis,
} = require("./prompts/abTestAnalysis");
const {
  generateSystemHealthNarrative,
} = require("./prompts/systemHealthNarrative");
const {
  promptRegistry,
} = require("./prompts/promptRegistry");

const app = express();
const port = Number(process.env.PORT || 8081);

app.use(express.json());

function buildDecisionContext(req) {
  const input = req.method === "GET" ? req.query : req.body || {};

  return {
    abVariant: input.abVariant || input.variant || "A",
    greetingCount: Number(input.greetingCount || input.totalGreetings || 0),
    lastGreeting: input.lastGreeting || "none - first greeting of the day",
    teapotStatus: input.teapotStatus || "HTTP 418 I'm a Teapot (nominal)",
  };
}

app.get("/decide", async (req, res) => {
  const decision = await safeGreetingDecision(buildDecisionContext(req));
  const meta = decision._meta || {};

  res.json({
    ...decision,
    aiModel: meta.model || "emergency-greeting-protocol",
    disclaimer: "AI was used in the making of this greeting decision.",
    tokensUsed: meta.tokensUsed || 0,
  });
});

app.get("/ab-analysis", async (_req, res) => {
  const analysis = await generateAbTestAnalysis();
  res.json(analysis);
});

app.post("/status-narrative", async (req, res) => {
  const narrative = await generateSystemHealthNarrative(req.body || {});
  res.json(narrative);
});

app.get("/prompt-registry", (_req, res) => {
  res.json({
    prompts: promptRegistry,
    runtimePromptCount: promptRegistry.filter((prompt) => prompt.runtime).length,
  });
});

app.get("/health", (_req, res) => {
  res.json({
    model: process.env.GEMINI_MODEL || "gemini-flash-lite-latest",
    port,
    promptRegistryEntries: promptRegistry.length,
    status: "ok",
  });
});

app.listen(port);
