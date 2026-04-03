const assert = require('node:assert/strict');

const {
  buildServiceUrls,
  normalizeGreetRequest,
  stableBucket,
} = require('./greeting-orchestrator');

const request = normalizeGreetRequest({});
assert.equal(request.recipient, 'World');
assert.equal(request.channel, 'web');
assert.equal(request.locale, 'en-US');
assert.equal(request.preferredGreeting, 'auto');
assert.match(request.userId, /world-web-en-us/);

const firstBucket = stableBucket('audit-user');
const secondBucket = stableBucket('audit-user');
assert.equal(firstBucket, secondBucket);
assert.ok(firstBucket >= 0 && firstBucket < 100);

const urls = buildServiceUrls({
  AI_DECISION_ENGINE_URL: 'http://ai.internal:9001',
  FEATURE_FLAG_SERVICE_URL: 'http://flags.internal:9004',
});
assert.equal(urls.aiDecisionEngine, 'http://ai.internal:9001');
assert.equal(urls.featureFlagService, 'http://flags.internal:9004');
assert.equal(urls.punctuationService, 'http://localhost:8083');

console.log('API gateway smoke tests passed.');
