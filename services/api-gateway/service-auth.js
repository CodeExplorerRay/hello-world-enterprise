const METADATA_IDENTITY_ENDPOINT = 'http://metadata.google.internal/computeMetadata/v1/instance/service-accounts/default/identity';
const TOKEN_TTL_FALLBACK_MS = 5 * 60 * 1000;
const TOKEN_REFRESH_BUFFER_MS = 60 * 1000;

const tokenCache = new Map();

function isServiceToServiceAuthEnabled(env = process.env) {
  return String(env.GCP_SERVICE_TO_SERVICE_AUTH || '').toLowerCase() === 'true';
}

function shouldAttachServiceAuth(url, env = process.env) {
  if (!isServiceToServiceAuthEnabled(env)) {
    return false;
  }

  try {
    const parsed = new URL(url);
    return parsed.protocol === 'https:';
  } catch (_error) {
    return false;
  }
}

function decodeJwtExpiry(token) {
  try {
    const [, payload] = String(token).split('.');
    if (!payload) {
      return 0;
    }

    const normalizedPayload = payload
      .replace(/-/g, '+')
      .replace(/_/g, '/')
      .padEnd(Math.ceil(payload.length / 4) * 4, '=');

    const parsedPayload = JSON.parse(Buffer.from(normalizedPayload, 'base64').toString('utf8'));
    return Number(parsedPayload.exp || 0) * 1000;
  } catch (_error) {
    return 0;
  }
}

async function getServiceIdentityToken(audience, env = process.env) {
  if (!shouldAttachServiceAuth(audience, env)) {
    return null;
  }

  const cachedToken = tokenCache.get(audience);
  if (cachedToken && cachedToken.expiresAt - Date.now() > TOKEN_REFRESH_BUFFER_MS) {
    return cachedToken.token;
  }

  const metadataUrl = new URL(METADATA_IDENTITY_ENDPOINT);
  metadataUrl.searchParams.set('audience', audience);
  metadataUrl.searchParams.set('format', 'full');

  const response = await fetch(metadataUrl, {
    headers: { 'Metadata-Flavor': 'Google' },
  });

  if (!response.ok) {
    throw new Error(`Unable to mint identity token for ${audience}: ${response.status}`);
  }

  const token = await response.text();
  const expiresAt = decodeJwtExpiry(token) || (Date.now() + TOKEN_TTL_FALLBACK_MS);
  tokenCache.set(audience, { expiresAt, token });
  return token;
}

async function buildAuthorizedHeaders(url, headers, env = process.env) {
  const requestHeaders = new Headers(headers || {});

  if (!requestHeaders.has('Authorization') && shouldAttachServiceAuth(url, env)) {
    const token = await getServiceIdentityToken(url, env);
    if (token) {
      requestHeaders.set('Authorization', `Bearer ${token}`);
    }
  }

  return requestHeaders;
}

module.exports = {
  buildAuthorizedHeaders,
  decodeJwtExpiry,
  getServiceIdentityToken,
  isServiceToServiceAuthEnabled,
  shouldAttachServiceAuth,
};
