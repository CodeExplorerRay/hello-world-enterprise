const express = require('express');
const app = express();

function parseRolloutPercentage(value, fallback) {
  const parsed = Number.parseInt(value, 10);

  if (Number.isNaN(parsed)) {
    return fallback;
  }

  return Math.max(0, Math.min(100, parsed));
}

const SHORT_GREETING_ROLLOUT_PERCENTAGE = parseRolloutPercentage(
  process.env.SHORT_GREETING_ROLLOUT_PERCENTAGE,
  5,
);
const AI_GREETING_ROLLOUT_PERCENTAGE = parseRolloutPercentage(
  process.env.AI_GREETING_ROLLOUT_PERCENTAGE,
  100,
);

function stableBucket(seed = 'anonymous') {
  let hash = 0;

  for (let index = 0; index < seed.length; index += 1) {
    hash = ((hash << 5) - hash) + seed.charCodeAt(index);
    hash |= 0;
  }

  return Math.abs(hash) % 100;
}

function normalizeContext(query = {}) {
  const userId = typeof query.userId === 'string' && query.userId.trim() ? query.userId.trim() : 'anonymous-web';
  const locale = typeof query.locale === 'string' && query.locale.trim() ? query.locale.trim() : 'en-US';
  const channel = typeof query.channel === 'string' && query.channel.trim() ? query.channel.trim().toLowerCase() : 'web';
  const preferredGreeting = typeof query.preferredGreeting === 'string' && query.preferredGreeting.trim()
    ? query.preferredGreeting.trim().toLowerCase()
    : 'auto';

  return { channel, locale, preferredGreeting, userId };
}

function evaluateFlag(flagName, context) {
  const baseResponse = {
    approvedBy: 'Mock Architecture Review Board',
    changeRequestId: 'CR-MOCK-123',
    evaluatedContext: context,
    flag: flagName,
    lastModified: new Date().toISOString(),
  };

  if (flagName === 'greeting-word') {
    let value = 'Hello';
    let note = 'Default enterprise-approved greeting.';

    if (context.locale.toLowerCase().startsWith('en-gb')) {
      value = 'Greetings';
      note = 'Locale-aware greeting selected for UK users.';
    } else if (context.channel === 'mobile') {
      value = 'Hey';
      note = 'Mobile users receive a slightly more casual greeting.';
    } else if (stableBucket(`${context.userId}:greeting-word`) < SHORT_GREETING_ROLLOUT_PERCENTAGE) {
      value = 'Hi';
      note = `Progressive rollout is testing a shorter greeting for ${SHORT_GREETING_ROLLOUT_PERCENTAGE}% of users.`;
    }

    return {
      ...baseResponse,
      enabled: true,
      note,
      rolloutPercentage: 100,
      value,
    };
  }

  if (flagName === 'ai-greeting-enabled') {
    const rolloutPercentage = AI_GREETING_ROLLOUT_PERCENTAGE;
    const enabled = context.preferredGreeting === 'auto'
      && context.channel === 'web'
      && stableBucket(`${context.userId}:ai-greeting-enabled`) < rolloutPercentage;

    return {
      ...baseResponse,
      enabled,
      note: enabled
        ? 'AI-assisted greeting selection is enabled for this request.'
        : 'AI greeting selection is disabled for this request. Falling back to feature flags.',
      rolloutPercentage,
      value: enabled,
    };
  }

  return {
    ...baseResponse,
    approvedBy: 'Gateway compatibility fallback',
    enabled: false,
    note: 'Unknown flag requested.',
    rolloutPercentage: 0,
    value: null,
  };
}

app.get('/flags/:flagName', async (req, res) => {
  const context = normalizeContext(req.query);
  res.json(evaluateFlag(req.params.flagName, context));
});

const port = Number(process.env.PORT || 8084);
app.listen(port);
