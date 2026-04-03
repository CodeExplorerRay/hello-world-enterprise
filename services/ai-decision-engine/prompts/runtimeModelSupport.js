const successCache = new Map();
const failureCache = new Map();
const inFlightLoads = new Map();

function buildCacheKey(namespace, payload) {
  return `${namespace}:${JSON.stringify(payload)}`;
}

function readCache(cache, key) {
  const entry = cache.get(key);
  if (!entry) {
    return null;
  }

  if (entry.expiresAt <= Date.now()) {
    cache.delete(key);
    return null;
  }

  return entry.value;
}

function writeCache(cache, key, value, ttlMs) {
  cache.set(key, {
    expiresAt: Date.now() + ttlMs,
    value,
  });
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function isRetryableError(error) {
  const message = String(error?.message || error || "");

  return [
    "429",
    "500",
    "502",
    "503",
    "504",
    "RESOURCE_EXHAUSTED",
    "UNAVAILABLE",
    "fetch failed",
    "timed out",
    "ECONNRESET",
  ].some((pattern) => message.includes(pattern));
}

async function getOrLoadWithRetry({
  baseDelayMs = 350,
  failureTtlMs = 5000,
  key,
  loader,
  retries = 2,
  ttlMs,
}) {
  const cachedValue = readCache(successCache, key);
  if (cachedValue) {
    return {
      attempts: 0,
      cacheStatus: "hit",
      value: cachedValue,
    };
  }

  const cachedError = readCache(failureCache, key);
  if (cachedError) {
    throw cachedError;
  }

  if (inFlightLoads.has(key)) {
    return inFlightLoads.get(key);
  }

  const loadPromise = (async () => {
    let attempts = 0;
    let lastError = null;

    while (attempts <= retries) {
      try {
        attempts += 1;
        const value = await loader();
        writeCache(successCache, key, value, ttlMs);

        return {
          attempts,
          cacheStatus: "miss",
          value,
        };
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        lastError.attempts = attempts;

        if (attempts > retries || !isRetryableError(lastError)) {
          writeCache(failureCache, key, lastError, failureTtlMs);
          throw lastError;
        }

        await sleep(baseDelayMs * attempts);
      }
    }

    writeCache(failureCache, key, lastError, failureTtlMs);
    throw lastError;
  })();

  inFlightLoads.set(key, loadPromise);

  try {
    return await loadPromise;
  } finally {
    if (inFlightLoads.get(key) === loadPromise) {
      inFlightLoads.delete(key);
    }
  }
}

module.exports = {
  buildCacheKey,
  getOrLoadWithRetry,
};
