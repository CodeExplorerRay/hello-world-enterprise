'use client';
import { useState, useEffect } from 'react';

export default function Home() {
  const [greeting, setGreeting] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingStage, setLoadingStage] = useState('');
  const [metadata, setMetadata] = useState(null);

  const loadingStages = [
    "Initializing API Gateway...",
    "Consulting feature flags (awaiting board approval)...",
    "Asking Gemini AI what greeting to use...",
    "Gemini is considering the moon phase...",
    "Gemini is checking the vibes...",
    "Routing to Greeting Selection Service...",
    "Punctuation Microservice is adding '!'...",
    "Deploying Rust binary for a single character...",
    "Spring Boot is starting up (this takes a while)...",
    "Still starting Spring Boot...",
    "Capitalizing first letter (enterprise-grade)...",
    ".NET is concatenating two strings...",
    "Running A/B test on exclamation mark...",
    "Checking teapot health status (HTTP 418)...",
    "Consulting Architecture Decision Record #47...",
    "Almost there...",
    "Preparing to display 2 words...",
    "Rendering...",
  ];

  useEffect(() => {
    let stageIndex = 0;
    const stageInterval = setInterval(() => {
      if (stageIndex < loadingStages.length) {
        setLoadingStage(loadingStages[stageIndex]);
        stageIndex++;
      }
    }, 800);

    // Actual API call
    fetch('http://localhost:8080/api/greet')
      .then(res => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then(data => {
        // Wait for loading animation to finish even if API is fast
        setTimeout(() => {
          clearInterval(stageInterval);
          setGreeting(data.greeting || 'Hello World!');
          setMetadata(data.metadata || {});
          setLoading(false);
        }, loadingStages.length * 800);
      })
      .catch(err => {
        console.error('API fetch failed:', err);
        // Fallback: show greeting anyway after animation
        setTimeout(() => {
          clearInterval(stageInterval);
          setGreeting('Hello World!');
          setMetadata({
            error: 'API not available - showing fallback greeting',
            processingTimeMs: 0,
            microservicesInvoked: 0,
            aiTokensUsed: 0,
            teapotStatus: 418,
            architectureDecisionRecordsConsulted: 47,
            wasItWorthIt: false
          });
          setLoading(false);
        }, loadingStages.length * 800);
      });

    return () => clearInterval(stageInterval);
  }, []);

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner" />
        <p className="loading-stage">{loadingStage}</p>
        <div className="loading-bar">
          <div className="loading-bar-fill" />
        </div>
        <p className="loading-footnote">
          ⚡ Powered by 9 microservices across 6 programming languages
        </p>
      </div>
    );
  }

  return (
    <div className="greeting-container">
      <h1 className="greeting">{greeting}</h1>
      
      <pre className="architecture-diagram">
{`
                                    THE ARCHITECTURE NOBODY ASKED FOR
                                    ==================================

    ┌─────────────┐     ┌──────────────────┐     ┌─────────────────────┐
    │   End User  │───▶│  Cloud Load      │────▶│  API Gateway        │
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
              │  Database       │           │  Cache           │    │  "I'm a teapot"    │
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
`}
      </pre>
      
      <details className="metadata">
        <summary>🔍 Infrastructure Details (click to expand)</summary>
        <pre>{JSON.stringify(metadata, null, 2)}</pre>
      </details>

      <div className="architecture-badge">
        <p>🏗️ This greeting was brought to you by:</p>
        <ul>
          <li>9 microservices</li>
          <li>6 programming languages</li>
          <li>1 AI model (Gemini 2.0 Flash)</li>
          <li>1 teapot (HTTP 418)</li>
          <li>47 Architecture Decision Records</li>
          <li>0 real-world problems solved</li>
        </ul>
      </div>
    </div>
  );
}