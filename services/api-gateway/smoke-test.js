const assert = require('node:assert/strict');

const {
  buildServiceUrls,
  normalizeGreetRequest,
  stableBucket,
} = require('./greeting-orchestrator');
const {
  buildCorsOptions,
  DEFAULT_ALLOWED_ORIGINS,
  isApiKeyAuthorized,
  isApiKeyProtectionEnabled,
  isOriginAllowed,
  resolveAllowedOrigins,
} = require('./security-config');
const {
  decodeJwtExpiry,
  isServiceToServiceAuthEnabled,
  shouldAttachServiceAuth,
} = require('./service-auth');

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

assert.deepEqual(resolveAllowedOrigins({}), DEFAULT_ALLOWED_ORIGINS);
assert.deepEqual(
  resolveAllowedOrigins({
    API_GATEWAY_ALLOWED_ORIGINS: 'https://app.example.com, https://preview.example.com/',
  }),
  ['https://app.example.com', 'https://preview.example.com'],
);
assert.equal(isOriginAllowed(undefined, DEFAULT_ALLOWED_ORIGINS), true);
assert.equal(isOriginAllowed('http://localhost:3000', DEFAULT_ALLOWED_ORIGINS), true);
assert.equal(isOriginAllowed('https://evil.example.com', DEFAULT_ALLOWED_ORIGINS), false);

assert.equal(isApiKeyProtectionEnabled({}), false);
assert.equal(isApiKeyProtectionEnabled({ API_GATEWAY_API_KEY: 'top-secret' }), true);
assert.equal(isApiKeyAuthorized('top-secret', { API_GATEWAY_API_KEY: 'top-secret' }), true);
assert.equal(isApiKeyAuthorized('wrong-secret', { API_GATEWAY_API_KEY: 'top-secret' }), false);

assert.equal(isServiceToServiceAuthEnabled({}), false);
assert.equal(isServiceToServiceAuthEnabled({ GCP_SERVICE_TO_SERVICE_AUTH: 'true' }), true);
assert.equal(shouldAttachServiceAuth('https://service.example.com', { GCP_SERVICE_TO_SERVICE_AUTH: 'true' }), true);
assert.equal(shouldAttachServiceAuth('http://localhost:8081', { GCP_SERVICE_TO_SERVICE_AUTH: 'true' }), false);
assert.equal(
  decodeJwtExpiry('eyJhbGciOiJub25lIn0.eyJleHAiOjIwMDAwMDAwMDB9.signature'),
  2000000000 * 1000,
);

const corsOptions = buildCorsOptions({
  API_GATEWAY_ALLOWED_ORIGINS: 'https://app.example.com',
});

let allowedOriginResult = null;
corsOptions.origin('https://app.example.com', (error, allowed) => {
  assert.equal(error, null);
  allowedOriginResult = allowed;
});
assert.equal(allowedOriginResult, true);

let blockedOriginError = null;
corsOptions.origin('https://evil.example.com', (error) => {
  blockedOriginError = error;
});
assert.match(blockedOriginError.message, /Origin not allowed/);

console.log('API gateway smoke tests passed.');
