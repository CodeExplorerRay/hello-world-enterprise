const ADRS_CONSULTED = 47;
const DEFAULT_TIMEOUT_MS = 3000;
const AI_DECISION_TIMEOUT_MS = 12000;
const AI_ANALYSIS_TIMEOUT_MS = 8000;
const BASE_INFRA_COST_PER_GREETING = 0.0142;
const COST_PER_AI_TOKEN = 0.000018;

const { buildAuthorizedHeaders } = require('./service-auth');

function stableBucket(seed = 'anonymous') {
  let hash = 0;

  for (let index = 0; index < seed.length; index += 1) {
    hash = ((hash << 5) - hash) + seed.charCodeAt(index);
    hash |= 0;
  }

  return Math.abs(hash) % 100;
}

function normalizeValue(value, fallback) {
  if (typeof value !== 'string') {
    return fallback;
  }

  const trimmed = value.trim();
  return trimmed || fallback;
}

function normalizeGreetRequest(payload = {}) {
  const recipient = normalizeValue(payload.recipient || payload.name, 'World');
  const channel = normalizeValue(payload.channel, 'web').toLowerCase();
  const locale = normalizeValue(payload.locale, 'en-US');
  const preferredGreeting = normalizeValue(payload.preferredGreeting, 'auto').toLowerCase();
  const providedUserId = normalizeValue(payload.userId, '');
  const derivedUserId = providedUserId || `${recipient.toLowerCase()}-${channel}-${locale.toLowerCase()}`;

  return {
    channel,
    locale,
    preferredGreeting,
    recipient,
    userId: derivedUserId,
  };
}

function buildServiceUrls(env = process.env) {
  return {
    abTestingService: env.AB_TESTING_SERVICE_URL || 'http://localhost:8085',
    aiDecisionEngine: env.AI_DECISION_ENGINE_URL || 'http://localhost:8081',
    capitalizationService: env.CAPITALIZATION_SERVICE_URL || 'http://localhost:8087',
    concatenationService: env.CONCATENATION_SERVICE_URL || 'http://localhost:8086',
    featureFlagService: env.FEATURE_FLAG_SERVICE_URL || 'http://localhost:8084',
    punctuationService: env.PUNCTUATION_SERVICE_URL || 'http://localhost:8083',
    teapotService: env.TEAPOT_SERVICE_URL || 'http://localhost:8082',
  };
}

function buildServiceTimeouts(env = process.env) {
  const parseTimeout = (value, fallback) => {
    const parsed = Number(value);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
  };

  return {
    default: parseTimeout(env.GATEWAY_TIMEOUT_MS, DEFAULT_TIMEOUT_MS),
    aiAnalysis: parseTimeout(env.AI_ANALYSIS_TIMEOUT_MS, AI_ANALYSIS_TIMEOUT_MS),
    aiDecision: parseTimeout(env.AI_DECISION_TIMEOUT_MS, AI_DECISION_TIMEOUT_MS),
  };
}

function fallbackGreetingWord(context) {
  if (context.preferredGreeting !== 'auto') {
    return {
      reason: 'User explicitly selected a greeting word.',
      source: 'user-input',
      word: context.preferredGreeting,
    };
  }

  return {
    reason: 'Fell back to the classic enterprise default.',
    source: 'gateway-fallback',
    word: 'Hello',
  };
}

function chooseGreetingWord(context, greetingFlag, aiFlag, aiDecision) {
  if (context.preferredGreeting !== 'auto') {
    return fallbackGreetingWord(context);
  }

  const aiEnabled = Boolean(aiFlag && aiFlag.enabled && aiFlag.value);
  if (aiEnabled && aiDecision && typeof aiDecision.greeting === 'string' && aiDecision.greeting.trim()) {
    return {
      reason: aiDecision.reasoning || 'AI greeting recommendation accepted.',
      source: aiDecision._fallback ? 'ai-decision-engine-fallback' : 'ai-decision-engine',
      word: aiDecision.greeting.trim(),
    };
  }

  if (greetingFlag && typeof greetingFlag.value === 'string' && greetingFlag.value.trim()) {
    return {
      reason: greetingFlag.note || 'Greeting word chosen by feature flag evaluation.',
      source: 'feature-flag-service',
      word: greetingFlag.value.trim(),
    };
  }

  return fallbackGreetingWord(context);
}

function capitalizeWord(word) {
  if (!word) {
    return '';
  }

  const normalized = String(word).trim().toLowerCase();
  return normalized.charAt(0).toUpperCase() + normalized.slice(1);
}

function isAprilFoolsDay(date = new Date()) {
  return date.getUTCMonth() === 3 && date.getUTCDate() === 1;
}

function estimateGreetingCost(aiTokensUsed, microservicesInvoked) {
  const infraCost = BASE_INFRA_COST_PER_GREETING + (microservicesInvoked * 0.00073);
  const aiCost = aiTokensUsed * COST_PER_AI_TOKEN;
  const total = infraCost + aiCost;

  return {
    aiCostUsd: Number(aiCost.toFixed(4)),
    infraCostUsd: Number(infraCost.toFixed(4)),
    totalCostUsd: Number(total.toFixed(4)),
    whimsicalExplanation: `Approximately $${total.toFixed(4)} to render one greeting nobody asked for.`,
  };
}

function buildEmergencyGreetingResponse(payload, error) {
  const context = normalizeGreetRequest(payload);
  const selectedWord = context.preferredGreeting !== 'auto' ? context.preferredGreeting : 'hello';
  const greeting = `${capitalizeWord(selectedWord)} ${context.recipient}!`;
  const costEstimate = estimateGreetingCost(0, 0);

  return {
    greeting,
    metadata: {
      aiTokensUsed: 0,
      architectureDecisionRecordsConsulted: ADRS_CONSULTED,
      costEstimate,
      easterEgg: {
        active: false,
        note: 'Emergency fallback mode bypassed seasonal overrides.',
      },
      greetingDecision: {
        reason: 'Gateway emergency fallback response.',
        source: 'api-gateway',
        word: selectedWord,
      },
      microservicesInvoked: 0,
      orchestrationError: error.message,
      requestContext: context,
      servicesInvoked: [],
      teapotStatus: 418,
      wasItWorthIt: false,
    },
  };
}

function buildUrlWithQuery(baseUrl, path, query) {
  const url = new URL(path, `${baseUrl}/`);

  Object.entries(query).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      url.searchParams.set(key, String(value));
    }
  });

  return url.toString();
}

async function fetchJson(url, options = {}, env = process.env) {
  const controller = new AbortController();
  const timeoutMs = options.timeoutMs || DEFAULT_TIMEOUT_MS;
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const requestHeaders = await buildAuthorizedHeaders(url, options.headers, env);
    const response = await fetch(url, {
      ...options,
      headers: requestHeaders,
      signal: controller.signal,
    });

    const acceptableStatuses = options.acceptableStatuses || [200];
    if (!acceptableStatuses.includes(response.status)) {
      throw new Error(`Unexpected status ${response.status} for ${url}`);
    }

    return await response.json();
  } catch (error) {
    if (error?.name === 'AbortError') {
      throw new Error(`Timed out after ${timeoutMs}ms calling ${url}`);
    }

    throw error;
  } finally {
    clearTimeout(timeout);
  }
}

async function fetchJsonOrFallback(url, options, fallbackValue, env = process.env) {
  try {
    return await fetchJson(url, options, env);
  } catch (error) {
    return {
      ...fallbackValue,
      fallbackReason: error.message,
    };
  }
}

async function orchestrateGreeting(payload, env = process.env) {
  const startedAt = Date.now();
  const context = normalizeGreetRequest(payload);
  const urls = buildServiceUrls(env);
  const timeouts = buildServiceTimeouts(env);

  const invokedServices = [
    'feature-flag-service:greeting-word',
    'feature-flag-service:ai-greeting-enabled',
    'ab-testing-service',
    'teapot-service',
    'capitalization-service',
    'concatenation-service',
    'punctuation-service',
    'ai-decision-engine:ab-analysis',
    'ai-decision-engine:status-narrative',
  ];

  const [greetingFlag, aiFlag, experiment, teapotStatus] = await Promise.all([
    fetchJsonOrFallback(
      buildUrlWithQuery(urls.featureFlagService, '/flags/greeting-word', context),
      { timeoutMs: timeouts.default },
      {
        approvedBy: 'Gateway fallback',
        enabled: true,
        flag: 'greeting-word',
        note: 'Feature flag service unavailable. Using gateway default.',
        rolloutPercentage: 0,
        value: 'Hello',
      },
      env,
    ),
    fetchJsonOrFallback(
      buildUrlWithQuery(urls.featureFlagService, '/flags/ai-greeting-enabled', context),
      { timeoutMs: timeouts.default },
      {
        approvedBy: 'Gateway fallback',
        enabled: false,
        flag: 'ai-greeting-enabled',
        note: 'AI feature flag unavailable. Skipping AI greeting selection.',
        rolloutPercentage: 0,
        value: false,
      },
      env,
    ),
    fetchJsonOrFallback(
      buildUrlWithQuery(urls.abTestingService, '/test/punctuation-style', {
        channel: context.channel,
        locale: context.locale,
        userId: context.userId,
      }),
      { timeoutMs: timeouts.default },
      {
        experiment: 'punctuation-style',
        punctuation: '!',
        sampleSize: 1,
        statisticalSignificance: 'insufficient-data',
        style: 'excited',
        variant: stableBucket(`${context.userId}:punctuation`) < 50 ? 'A' : 'B',
        variantDescription: 'Gateway fallback punctuation.',
      },
      env,
    ),
    fetchJsonOrFallback(
      buildUrlWithQuery(urls.teapotService, '/health', {}),
      { acceptableStatuses: [200, 418], timeoutMs: timeouts.default },
      {
        httpCode: 418,
        message: 'Teapot health check unavailable, but the gateway still believes in teapots.',
        status: "I'm a teapot",
      },
      env,
    ),
  ]);

  let aiDecision = null;
  if (context.preferredGreeting === 'auto' && aiFlag.enabled && aiFlag.value) {
    invokedServices.push('ai-decision-engine');
    aiDecision = await fetchJsonOrFallback(
      buildUrlWithQuery(urls.aiDecisionEngine, '/decide', context),
      { timeoutMs: timeouts.aiDecision },
      {
        aiModel: 'gateway-fallback',
        confidence: 0,
        greeting: greetingFlag.value || 'Hello',
        _fallback: true,
        reasoning: 'AI service unavailable. Falling back to feature flag greeting.',
        tokensUsed: 0,
      },
      env,
    );
  }

  const greetingDecision = chooseGreetingWord(context, greetingFlag, aiFlag, aiDecision);
  const capitalizedGreeting = await fetchJsonOrFallback(
    buildUrlWithQuery(urls.capitalizationService, '/capitalize', {}),
    {
      body: JSON.stringify({ text: greetingDecision.word }),
      headers: { 'Content-Type': 'application/json' },
      method: 'POST',
      timeoutMs: timeouts.default,
    },
    {
      capitalized: capitalizeWord(greetingDecision.word),
      original: greetingDecision.word,
      wasSpringBootOverkill: true,
    },
    env,
  );

  const joinedText = `${capitalizedGreeting.capitalized || capitalizeWord(greetingDecision.word)} ${context.recipient}`;
  const concatenated = await fetchJsonOrFallback(
    buildUrlWithQuery(urls.concatenationService, '/Concat', {}),
    {
      body: JSON.stringify({ parts: [capitalizedGreeting.capitalized || capitalizeWord(greetingDecision.word), ' ', context.recipient] }),
      headers: { 'Content-Type': 'application/json' },
      method: 'POST',
      timeoutMs: timeouts.default,
    },
    {
      Note: 'Concatenation service unavailable. Falling back to string interpolation.',
      Result: joinedText,
    },
    env,
  );

  const punctuated = await fetchJsonOrFallback(
    buildUrlWithQuery(urls.punctuationService, '/punctuate', {}),
    {
      body: JSON.stringify({
        style: experiment.style || 'excited',
        text: concatenated.result || concatenated.Result || joinedText,
      }),
      headers: { 'Content-Type': 'application/json' },
      method: 'POST',
      timeoutMs: timeouts.default,
    },
    {
      original: concatenated.result || concatenated.Result || joinedText,
      punctuated: `${concatenated.result || concatenated.Result || joinedText}${experiment.punctuation || '!'}`,
      punctuation_applied: experiment.punctuation || '!',
    },
    env,
  );

  const aprilFoolsActive = isAprilFoolsDay();
  const aiTokensUsed = aiDecision ? aiDecision.tokensUsed || 0 : 0;
  const costEstimate = estimateGreetingCost(aiTokensUsed, invokedServices.length);
  const finalGreeting = aprilFoolsActive ? `APRIL FOOLS ${context.recipient}!` : punctuated.punctuated;
  const narrativeRequest = {
    abTestingService: {
      status: experiment.fallbackReason ? 'DEGRADED' : 'HEALTHY',
      variant: experiment.variant || 'A',
    },
    aiDecisionEngine: {
      lastGreeting: greetingDecision.word,
      status: aiDecision && aiDecision._fallback ? 'DEGRADED' : (aiFlag.enabled && aiFlag.value ? 'HEALTHY' : 'SKIPPED'),
    },
    apiGateway: {
      responseTimeMs: Date.now() - startedAt,
      status: 'HEALTHY',
    },
    capitalizationService: {
      startupMs: capitalizedGreeting.springBootStartupTimeMs || 4200,
      status: capitalizedGreeting.fallbackReason ? 'DEGRADED' : 'HEALTHY',
    },
    concatenationService: {
      status: concatenated.fallbackReason ? 'DEGRADED' : 'HEALTHY',
    },
    featureFlagService: {
      flagCount: 2,
      status: greetingFlag.fallbackReason || aiFlag.fallbackReason ? 'DEGRADED' : 'HEALTHY',
    },
    frontend: {
      status: 'READY',
    },
    punctuationService: {
      status: punctuated.fallbackReason ? 'DEGRADED' : 'HEALTHY',
    },
    teapotService: {
      status: teapotStatus.status || "HTTP 418",
    },
  };

  const [abAnalysis, systemNarrative] = await Promise.all([
    fetchJsonOrFallback(
      buildUrlWithQuery(urls.aiDecisionEngine, '/ab-analysis', {}),
      { timeoutMs: timeouts.aiAnalysis },
      {
        experimentName: 'Exclamation Mark Optimization',
        executiveSummary: 'A/B analysis unavailable. Proceeding with punctuation governance by instinct.',
        statisticalAnalysis: {
          honestyNote: 'Analysis service unavailable.',
          isSignificant: false,
        },
      },
      env,
    ),
    fetchJsonOrFallback(
      buildUrlWithQuery(urls.aiDecisionEngine, '/status-narrative', {}),
      {
        body: JSON.stringify(narrativeRequest),
        headers: { 'Content-Type': 'application/json' },
        method: 'POST',
        timeoutMs: timeouts.aiAnalysis,
      },
      {
        narrative: 'The system status narrator is unavailable, so the gateway is reluctantly speaking in plain prose.',
        overallMood: 'Operationally awkward',
        heroOfTheHour: 'The gateway fallback logic',
        villainOfTheHour: 'Narrative generation latency',
        teapotWisdom: 'Even missing poetry can still be HTTP 418 compliant.',
        questStatus: 'Hello World remains achievable.',
      },
      env,
    ),
  ]);

  return {
    greeting: finalGreeting,
    metadata: {
      abAnalysis,
      aiDecision,
      aiTokensUsed,
      architectureDecisionRecordsConsulted: ADRS_CONSULTED,
      costEstimate,
      easterEgg: {
        active: aprilFoolsActive,
        note: aprilFoolsActive
          ? 'April 1st override engaged. Corporate humor policy now supersedes all greeting governance.'
          : 'No seasonal easter eggs are active today.',
      },
      experiment,
      featureFlags: {
        aiGreetingEnabled: aiFlag,
        greetingWord: greetingFlag,
      },
      greetingDecision,
      microservicesInvoked: invokedServices.length,
      processingTimeMs: Date.now() - startedAt,
      requestContext: context,
      servicesInvoked: invokedServices,
      systemNarrative,
      teapotStatus: teapotStatus.httpCode || 418,
      teapotWisdom: teapotStatus.philosophicalMusing || null,
      wasItWorthIt: false,
    },
  };
}

module.exports = {
  buildEmergencyGreetingResponse,
  buildServiceUrls,
  normalizeGreetRequest,
  orchestrateGreeting,
  stableBucket,
};
