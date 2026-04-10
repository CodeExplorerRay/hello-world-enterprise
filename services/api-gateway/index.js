const express = require('express');
const cors = require('cors');
const app = express();
const { buildEmergencyGreetingResponse, orchestrateGreeting } = require('./greeting-orchestrator');
const {
  buildCorsOptions,
  isApiKeyAuthorized,
  isApiKeyProtectionEnabled,
} = require('./security-config');

app.disable('x-powered-by');

app.use((req, res, next) => {
  res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
  res.setHeader('Cross-Origin-Resource-Policy', 'same-site');
  res.setHeader('Referrer-Policy', 'no-referrer');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');

  if (req.secure || req.get('x-forwarded-proto') === 'https') {
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  }

  next();
});

app.use(cors(buildCorsOptions(process.env)));
app.use(express.json({ limit: '16kb' }));

// Trust proxy (Railway load balancer sets X-Forwarded-For)
app.set('trust proxy', 1);

// Rate limiter: 100 requests per minute (relaxed for testing)
const rateLimit = require('express-rate-limit');
const limiter = rateLimit({
  windowMs: 60 * 1000,
  max: 100,
  message: {
    error: "Whoa there! Our Hello World infrastructure can only handle 100 greetings per minute. Please consult our SLA documentation."
  }
});

app.use(limiter);
app.use((req, res, next) => {
  if (req.method === 'OPTIONS' || !req.path.startsWith('/api/')) {
    return next();
  }

  if (!isApiKeyProtectionEnabled(process.env)) {
    return next();
  }

  if (isApiKeyAuthorized(req.get('x-api-key'), process.env)) {
    return next();
  }

  return res.status(401).json({
    error: 'Unauthorized',
    message: 'A valid X-API-Key header is required for this environment.',
  });
});

app.get('/', (_req, res) => {
  res.json({
    service: 'api-gateway',
    status: 'running',
    endpoints: {
      health: '/health',
      greetGet: '/api/greet?recipient=World&channel=web&locale=en-US',
      greetPost: '/api/greet',
    },
    usage: 'Call GET /api/greet with query params or POST /api/greet with JSON to orchestrate a greeting.',
  });
});

app.get('/health', (_req, res) => {
  res.json({
    service: 'api-gateway',
    status: 'ok',
    timestamp: new Date().toISOString(),
  });
});

async function handleGreet(req, res) {
  const payload = req.method === 'GET' ? req.query : req.body;

  try {
    const response = await orchestrateGreeting(payload, process.env);
    res.json(response);
  } catch (error) {
    console.error('Greeting orchestration failed:', error);
    res.json(buildEmergencyGreetingResponse(payload, error));
  }
}

app.get('/api/greet', handleGreet);
app.post('/api/greet', handleGreet);

app.use((error, _req, res, next) => {
  if (error && error.message === 'Origin not allowed by API gateway CORS policy.') {
    return res.status(403).json({
      error: 'Forbidden',
      message: error.message,
    });
  }

  return next(error);
});

const port = Number(process.env.PORT || 8080);
app.listen(port, () => {
  console.log(`api-gateway listening on port ${port}`);
});
