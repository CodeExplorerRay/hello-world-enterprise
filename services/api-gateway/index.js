const express = require('express');
const cors = require('cors');
const app = express();

// Enable CORS for all routes
app.use(cors());

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

app.get('/api/greet', async (req, res) => {
  const startTime = Date.now();
  
  // Mock all microservice calls for testing
  const greeting = "Hello World!";
  
  const totalTime = Date.now() - startTime;
  
  res.json({
    greeting: greeting,
    metadata: {
      processingTimeMs: totalTime,
      microservicesInvoked: 7,
      aiTokensUsed: 0,
      teapotStatus: 418,
      architectureDecisionRecordsConsulted: 47,
      wasItWorthIt: false
    }
  });
});

app.listen(8080);