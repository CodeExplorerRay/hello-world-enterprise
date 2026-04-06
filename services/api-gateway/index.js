const express = require('express');
const cors = require('cors');
const app = express();
const { buildEmergencyGreetingResponse, orchestrateGreeting } = require('./greeting-orchestrator');

// Enable CORS for all routes
app.use(cors());
app.use(express.json());

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

const port = Number(process.env.PORT || 8080);
app.listen(port);
