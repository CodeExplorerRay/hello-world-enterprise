const assert = require("node:assert/strict");

const gatewayBase = process.env.SMOKE_GATEWAY_URL || "http://localhost:8080";
const aiBase = process.env.SMOKE_AI_URL || "http://localhost:8081";
const teapotBase = process.env.SMOKE_TEAPOT_URL || "http://localhost:8082";
const requireLiveGemini = process.env.SMOKE_REQUIRE_LIVE_GEMINI === "true";

async function readJson(response, label) {
  const text = await response.text();

  try {
    return JSON.parse(text);
  } catch (error) {
    throw new Error(`${label} returned non-JSON payload: ${text}`);
  }
}

async function expectJson(url, label, options = {}) {
  const response = await fetch(url, options);

  if (!response.ok) {
    throw new Error(`${label} failed with HTTP ${response.status}`);
  }

  return readJson(response, label);
}

async function expectJsonWithStatus(url, label, expectedStatus, options = {}) {
  const response = await fetch(url, options);

  if (response.status !== expectedStatus) {
    throw new Error(`${label} expected HTTP ${expectedStatus} but got ${response.status}`);
  }

  return readJson(response, label);
}

async function testAiDecision() {
  const decision = await expectJson(`${aiBase}/decide?greetingCount=12&lastGreeting=Hello&abVariant=A`, "AI /decide");

  assert.equal(typeof decision.greeting, "string");
  assert.equal(typeof decision.confidence, "number");
  assert.equal(typeof decision.reasoning, "string");
  assert.ok("vibeCheck" in decision);
  console.log("Passed: AI /decide");
}

async function testAbAnalysis() {
  const analysis = await expectJson(`${aiBase}/ab-analysis`, "AI /ab-analysis");

  assert.equal(analysis.experimentName, "Exclamation Mark Optimization");
  assert.ok(analysis.results?.variantA);
  assert.ok(analysis.results?.variantB);
  assert.ok(analysis.statisticalAnalysis);
  if (requireLiveGemini) {
    assert.ok(!analysis._fallback, "AI /ab-analysis unexpectedly fell back");
  }
  console.log("Passed: AI /ab-analysis");
}

async function testStatusNarrative() {
  const narrative = await expectJson(`${aiBase}/status-narrative`, "AI /status-narrative", {
    body: JSON.stringify({
      apiGateway: { responseTimeMs: 12, status: "HEALTHY" },
      aiDecisionEngine: { lastGreeting: "Hello", status: "HEALTHY" },
      teapotService: { status: "HTTP 418" },
      punctuationService: { status: "HEALTHY" },
      capitalizationService: { status: "HEALTHY", startupMs: 4200 },
      concatenationService: { status: "HEALTHY" },
      featureFlagService: { status: "HEALTHY", flagCount: 2 },
      abTestingService: { status: "HEALTHY", variant: "A" },
      frontend: { status: "READY" },
    }),
    headers: { "Content-Type": "application/json" },
    method: "POST",
  });

  assert.equal(typeof narrative.narrative, "string");
  assert.equal(typeof narrative.overallMood, "string");
  assert.equal(typeof narrative.heroOfTheHour, "string");
  assert.equal(typeof narrative.villainOfTheHour, "string");
  assert.equal(typeof narrative.teapotWisdom, "string");
  assert.equal(typeof narrative.questStatus, "string");
  if (requireLiveGemini) {
    assert.ok(!narrative._fallback, "AI /status-narrative unexpectedly fell back");
  }
  console.log("Passed: AI /status-narrative");
}

async function testTeapotHealth() {
  const teapot = await expectJsonWithStatus(`${teapotBase}/health`, "Teapot /health", 418);

  assert.equal(teapot.httpCode, 418);
  assert.equal(typeof teapot.philosophicalMusing?.musing, "string");
  assert.equal(typeof teapot.philosophicalMusing?.coffeeOpinion, "string");
  console.log("Passed: Teapot /health");
}

async function testGatewayGreeting() {
  const payload = {
    channel: "web",
    locale: "en-US",
    recipient: "World",
    userId: "smoke-test-user",
  };
  const gateway = await expectJson(`${gatewayBase}/api/greet`, "Gateway /api/greet", {
    body: JSON.stringify(payload),
    headers: { "Content-Type": "application/json" },
    method: "POST",
  });

  assert.equal(typeof gateway.greeting, "string");
  assert.ok(gateway.metadata);
  assert.ok(gateway.metadata.greetingDecision);
  assert.ok(gateway.metadata.abAnalysis);
  assert.ok(gateway.metadata.systemNarrative);
  assert.ok("teapotWisdom" in gateway.metadata);
  if (requireLiveGemini) {
    assert.ok(!gateway.metadata.abAnalysis?._fallback, "Gateway A/B analysis unexpectedly fell back");
    assert.ok(!gateway.metadata.systemNarrative?._fallback, "Gateway system narrative unexpectedly fell back");
  }
  console.log("Passed: Gateway /api/greet");
}

async function main() {
  console.log(`Running endpoint smoke tests against:
  gateway: ${gatewayBase}
  ai: ${aiBase}
  teapot: ${teapotBase}
  requireLiveGemini: ${requireLiveGemini}`);

  await testAiDecision();
  await testAbAnalysis();
  await testStatusNarrative();
  await testTeapotHealth();
  await testGatewayGreeting();

  console.log("All endpoint smoke tests passed.");
}

main().catch((error) => {
  console.error("Endpoint smoke tests failed.");
  console.error(error.message);
  process.exit(1);
});
