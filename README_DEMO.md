# HelloWorld Enterprise Demo

🚀 **Live Demo**: [helloworld-enterprise.vercel.app](https://helloworld-enterprise.vercel.app)

## Quick Start

### Option 1: Docker (Recommended)
```bash
git clone https://github.com/YOUR_USERNAME/helloworld-enterprise.git
cd helloworld-enterprise
docker-compose -f infrastructure/docker-compose.yml up --build
open http://localhost:3000
```

### Option 2: Manual Setup
```bash
# Requires Node.js, Go, Rust, Java, .NET, Python
cd services/api-gateway && npm start &
cd services/frontend && npm run dev
open http://localhost:3000
```

## What You'll See
- 18-stage loading animation showing all microservices
- ASCII architecture diagram of the over-engineering
- Real metadata about the absurd complexity
- AI-powered greeting decisions (with Gemini API key)

## Prize Categories Covered
✅ **Anti-Value Proposition**: 9 microservices for 'Hello World'
✅ **Best Google AI Usage**: Gemini 2.0 Flash integration
✅ **Best Ode to Larry Masinter**: HTTP 418 teapot service
✅ **Community Favorite**: Shareable over-engineering concept

*"Because saying 'Hello World' should require at least 47 microservices, an AI decision engine, and a teapot."*

---

Built for the [DEV April Fools Challenge 2026](https://dev.to/challenges/aprilfools-2026)