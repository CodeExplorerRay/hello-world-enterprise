const { timingSafeEqual } = require('node:crypto');

const DEFAULT_ALLOWED_ORIGINS = [
  'http://localhost:3000',
  'http://127.0.0.1:3000',
];

function normalizeOrigin(origin) {
  if (typeof origin !== 'string') {
    return '';
  }

  return origin.trim().replace(/\/$/, '');
}

function resolveAllowedOrigins(env = process.env) {
  const configuredOrigins = typeof env.API_GATEWAY_ALLOWED_ORIGINS === 'string'
    ? env.API_GATEWAY_ALLOWED_ORIGINS
    : '';

  if (!configuredOrigins.trim()) {
    return [...DEFAULT_ALLOWED_ORIGINS];
  }

  return configuredOrigins
    .split(',')
    .map(normalizeOrigin)
    .filter(Boolean);
}

function isOriginAllowed(origin, allowedOrigins = DEFAULT_ALLOWED_ORIGINS) {
  if (!origin) {
    return true;
  }

  return allowedOrigins.includes(normalizeOrigin(origin));
}

function isApiKeyProtectionEnabled(env = process.env) {
  return typeof env.API_GATEWAY_API_KEY === 'string' && env.API_GATEWAY_API_KEY.trim().length > 0;
}

function isApiKeyAuthorized(candidateKey, env = process.env) {
  const expectedKey = typeof env.API_GATEWAY_API_KEY === 'string'
    ? env.API_GATEWAY_API_KEY.trim()
    : '';

  if (!expectedKey) {
    return true;
  }

  if (typeof candidateKey !== 'string') {
    return false;
  }

  const normalizedCandidateKey = candidateKey.trim();
  const expectedBuffer = Buffer.from(expectedKey);
  const candidateBuffer = Buffer.from(normalizedCandidateKey);

  if (expectedBuffer.length !== candidateBuffer.length) {
    return false;
  }

  return timingSafeEqual(expectedBuffer, candidateBuffer);
}

function buildCorsOptions(env = process.env) {
  const allowedOrigins = resolveAllowedOrigins(env);

  return {
    allowedHeaders: ['Content-Type', 'X-API-Key'],
    methods: ['GET', 'POST', 'OPTIONS'],
    optionsSuccessStatus: 204,
    origin(origin, callback) {
      if (isOriginAllowed(origin, allowedOrigins)) {
        return callback(null, true);
      }

      return callback(new Error('Origin not allowed by API gateway CORS policy.'));
    },
    maxAge: 600,
  };
}

module.exports = {
  DEFAULT_ALLOWED_ORIGINS,
  buildCorsOptions,
  isApiKeyAuthorized,
  isApiKeyProtectionEnabled,
  isOriginAllowed,
  resolveAllowedOrigins,
};
