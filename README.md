
<p align="center">
  <img src="https://raw.githubusercontent.com/CodeExplorerRay/hello-world-enterprise/e44149d2b130e29e892d104519f98d9ca8c8a0fb/banner.svg" alt="Hello World Enterprise Edition" width="100%"/>
</p>

<p align="center">
  <img src="https://raw.githubusercontent.com/CodeExplorerRay/hello-world-enterprise/01d0a5b0d0456547e116afa8342466f86726a206/brand.svg"/>
</p>

<p align="center">
  <img alt="build" src="https://img.shields.io/badge/build-passing-brightgreen"/>
  <img alt="deploy" src="https://img.shields.io/badge/deploy-cloud%20run-blue"/>
  <img alt="greeting audit" src="https://img.shields.io/badge/greeting--audit-weekly-success"/>
  <img alt="teapot status" src="https://img.shields.io/badge/teapot-418-critical"/>
  <img alt="ai model" src="https://img.shields.io/badge/ai-gemini--flash--lite--latest-orange"/>
  <img alt="frontend" src="https://img.shields.io/badge/frontend-next.js-black"/>
  <img alt="gateway" src="https://img.shields.io/badge/gateway-express-lightgrey"/>
  <img alt="rust" src="https://img.shields.io/badge/punctuation-rust-brown"/>
  <img alt="java" src="https://img.shields.io/badge/capitalization-spring-success"/>
  <img alt="dotnet" src="https://img.shields.io/badge/concatenation-.NET-512bd4"/>
  <img alt="python" src="https://img.shields.io/badge/ab--testing-flask-red"/>
  <img alt="feature flags" src="https://img.shields.io/badge/feature--flags-governed-blueviolet"/>
  <img alt="sla" src="https://img.shields.io/badge/SLA-99.9%25-informational"/>
  <img alt="runbook" src="https://img.shields.io/badge/on--call-3AM%20ready-yellow"/>
  <img alt="monitoring" src="https://img.shields.io/badge/grafana-dashboard%20defined-ff69b4"/>
  <img alt="cost per greeting" src="https://img.shields.io/badge/cost%20per%20greeting-needlessly%20high-important"/>
</p>




## The World's Most Over-Engineered Greeting

>"Because saying 'Hello World' should require at least 47 microservices, an AI decision engine, and a teapot."

Welcome to HelloWorld Enterprise Edition™ — the pinnacle of software over-engineering. This project demonstrates how to take the simplest possible task (displaying "Hello World") and turn it into a distributed system with 9 microservices, 6 programming languages, cloud infrastructure, CI/CD, monitoring, and 47 architecture decision records.

### Why This Exists

In the world of enterprise software, complexity is a virtue. Simplicity is for amateurs. This project proves that even "Hello World" deserves:

- A microservices architecture
- AI-powered decision making
- A/B testing for punctuation
- Feature flags for greeting words
- A teapot health check (HTTP 418)
- 24/7 monitoring and alerting
- Terraform infrastructure
- Docker containers
- Kubernetes-ready deployments
- And much more!

### Demo Highlights

- A live request form that sends user context through the API gateway
- Cost-per-greeting accounting in the frontend
- An April 1st easter egg that overrides the greeting with `APRIL FOOLS`
- A richer OpenAPI contract in [docs/api-specification.yaml](docs/api-specification.yaml)
- A Grafana dashboard asset in [monitoring/dashboard.json](monitoring/dashboard.json)
- An operations runbook in [docs/runbook.md](docs/runbook.md)
- A changelog chronicling greeting-related drama in [CHANGELOG.md](CHANGELOG.md)

### Architecture Overview

```
                                    THE ARCHITECTURE NOBODY ASKED FOR
                                    ==================================

    ┌─────────────┐     ┌──────────────────┐     ┌─────────────────────┐
    │   End User  │────▶│  Cloud Load     │────▶│  API Gateway        │
    │  (Browser)  │     │  Balancer (GCP)  │     │  (Express.js)       │
    └─────────────┘     └──────────────────┘     └────────┬────────────┘
                                                          │
                         ┌────────────────────────────────┼──────────────────────┐
                         │                                │                      │
                         ▼                                ▼                      ▼
              ┌─────────────────┐           ┌──────────────────┐    ┌────────────────────┐
              │  Greeting       │           │  Greeting AI     │    │  HTCPCP Teapot     │
              │  Selection      │           │  Decision Engine │    │  Health Check      │
              │  Service        │           │  (Gemini API)    │    │  Service           │
              │  (Python/Flask) │           │  (Node.js)       │    │  (Go)              │
              └───────┬─────────┘           └────────┬─────────┘    └────────┬───────────┘
                      │                              │                       │
                      ▼                              ▼                       ▼
              ┌─────────────────┐           ┌──────────────────┐    ┌────────────────────┐
              │  Greeting       │           │  AI Response     │    │  Returns 418       │
              │  Database       │           │  Cache           │    │  "I'm a Teapot"    │
              │  (Firestore)    │           │  (Redis)         │    │  on /brew           │
              └─────────────────┘           └──────────────────┘    └────────────────────┘
                      │
                      ▼
              ┌─────────────────┐
              │  Punctuation    │       ┌──────────────────────────────┐
              │  Microservice   │       │  Feature Flag Service        │
              │  (Rust)         │       │  (Should we say "Hello"      │
              └───────┬─────────┘       │   or "Hi" or "Hey"?)        │
                      │                 │  (Node.js + Firestore)       │
                      ▼                 └──────────────────────────────┘
              ┌─────────────────┐
              │  Capitalization │       ┌──────────────────────────────┐
              │  Service        │       │  A/B Testing Service         │
              │  (Java/Spring)  │       │  (50% get "Hello World"      │
              └───────┬─────────┘       │   50% get "Hello World!")    │
                      │                 │  (Python)                    │
                      ▼                 └──────────────────────────────┘
              ┌─────────────────┐
              ┌─────────────────┐
              │  String         │       ┌──────────────────────────────┐
              │  Concatenation  │       │  Observability Stack         │
              │  Service        │       │  (Logging, Metrics, Traces)  │
              │  (C#/.NET)      │       │  Google Cloud Monitoring     │
              └───────┬─────────┘       └──────────────────────────────┘
                      │
                      ▼
              ┌─────────────────┐
              │  Frontend       │
              │  Rendering      │
              │  Service        │
              │  (React + Next) │
              └─────────────────┘
```

### Getting Started

#### Prerequisites

- Node.js 18+
- Go 1.21+
- Rust 1.70+
- Java 25+
- .NET 7+
- Python 3.11+
- Docker
- Terraform
- Google Cloud account (for deployment)

#### Local Development

1. Clone this repo
2. Start Docker Desktop and wait until Docker is running
3. Copy `.env.example` to `.env`
4. Add your Gemini API key to `.env`
5. Run `docker compose -f infrastructure/docker-compose.yml up --build`
6. Open http://localhost:3000

#### AI API Key Setup

The AI Decision Engine reads `GEMINI_API_KEY` from the repo-root `.env` file during local Docker Compose runs.

1. Copy `.env.example` to `.env`
2. Set:
   `GEMINI_API_KEY=your_real_key_here`
3. Restart the stack with:
   `docker compose -f infrastructure/docker-compose.yml up --build`

If `GEMINI_API_KEY` is missing, the AI service falls back to mock responses automatically.

#### Production Deployment

1. Set up Google Cloud project
2. Run `terraform apply` in infrastructure/terraform
3. Deploy via Cloud Build

### Services

#### API Gateway (Node.js/Express)
Routes requests to microservices with enterprise-grade rate limiting (1 request/minute).

#### AI Decision Engine (Node.js + Gemini)
Uses Google's Gemini AI to decide between "Hello", "Hi", "Hey", etc., considering moon phases and vibes. 
**Real integration**: Set `GEMINI_API_KEY` environment variable for actual Gemini 2.5 Flash-Lite API calls.
**Demo mode**: Falls back to mock responses when no API key is provided (perfect for demos and testing).
Can also be demonstrated via Google AI Studio for the challenge submission.

#### HTCPCP Teapot Service (Go)
RFC 2324 compliant health check that returns HTTP 418 "I'm a teapot".

#### Punctuation Service (Rust)
Adds punctuation with memory safety guarantees.

#### Capitalization Service (Java/Spring Boot)
Capitalizes the first letter using enterprise Java.

#### String Concatenation Service (C#/.NET)
Concatenates strings with Microsoft-grade reliability.

#### Feature Flag Service (Node.js + Firestore)
Controls greeting variations via feature flags.

#### A/B Testing Service (Python/Flask)
Tests punctuation variants statistically.

#### Frontend (React/Next.js)
Displays the greeting with a loading animation showing all services.

### Tech Stack

| Component | Technology | Justification |
|-----------|------------|---------------|
| API Gateway | Node.js/Express | Industry standard for routing |
| AI Engine | Gemini 2.5 Flash-Lite | Critical greeting decisions (with mock fallback) |
| Teapot | Go | Fast refusal to brew coffee |
| Punctuation | Rust | Memory safety for one character |
| Capitalization | Java/Spring | Enterprise capitalization |
| Concatenation | C#/.NET | Microsoft-grade joining |
| Feature Flags | Node.js + Firestore | Governance for greetings |
| A/B Testing | Python/Flask | Data-driven punctuation |
| Frontend | React/Next.js | SSR for 2 words |
| Database | Firestore | NoSQL for greeting words |
| Cache | Redis | Caching AI vibes |
| Infra | Terraform | IaC for greetings |
| CI/CD | Cloud Build | Continuous greeting deployment |
| Monitoring | Cloud Monitoring | 24/7 observability |

### Extra Polish

- **Swagger/OpenAPI Documentation**: [docs/api-specification.yaml](docs/api-specification.yaml) now documents the greeting contract, nested metadata, fallback behavior, and cost model in painful detail.
- **Grafana Dashboard**: [monitoring/dashboard.json](monitoring/dashboard.json) includes panels for latency, AI confidence, teapot 418 counts, cost per greeting, and variant distribution.
- **SLA Document**: [SLA.md](SLA.md) formalizes our deeply unserious uptime commitment.
- **On-Call Runbook**: [docs/runbook.md](docs/runbook.md) explains what to do when "Hello World" fails at 3 AM.
- **CHANGELOG**: [CHANGELOG.md](CHANGELOG.md) records the historical consequences of greeting drift.

### Contributing

See CONTRIBUTING.md for our 14-step contribution process.

### License

This project is licensed under the "Don't Use This In Production" license.

### Disclaimer

This project solves exactly zero real-world problems. It's purely for entertainment and demonstrating the absurdity of over-engineering.

Estimated cloud cost: $15/month for "Hello World".

Was it worth it? No.

But did we have fun? Yes.
