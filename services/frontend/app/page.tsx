'use client';

import { useEffect, useState } from 'react';

type GreetingDecision = {
  reason?: string;
  source?: string;
  word?: string;
};

type FeatureFlag = {
  enabled?: boolean;
  note?: string;
  rolloutPercentage?: number;
  value?: boolean | string | null;
};

type AiDecision = {
  confidence?: number;
  riskAssessment?: string;
  boardApproval?: string;
  reasoning?: string;
  _fallback?: boolean;
};

type SystemNarrative = {
  heroOfTheHour?: string;
  narrative?: string;
  overallMood?: string;
  questStatus?: string;
  teapotWisdom?: string;
  villainOfTheHour?: string;
};

type AbAnalysis = {
  experimentName?: string;
  executiveSummary?: string;
  recommendation?: string;
  statisticalAnalysis?: {
    honestyNote?: string;
  };
};

type MetadataPayload = {
  abAnalysis?: AbAnalysis;
  aiDecision?: AiDecision;
  aiTokensUsed?: number;
  architectureDecisionRecordsConsulted?: number;
  error?: string;
  featureFlags?: {
    aiGreetingEnabled?: FeatureFlag;
    greetingWord?: FeatureFlag;
  };
  greetingDecision?: GreetingDecision;
  microservicesInvoked?: number;
  processingTimeMs?: number;
  systemNarrative?: SystemNarrative;
  teapotStatus?: number;
  teapotWisdom?: {
    musing?: string;
  } | null;
  wasItWorthIt?: boolean;
};

const loadingStages = [
  'Initializing API Gateway...',
  'Consulting feature flags...',
  'Asking the Chief Greeting Officer...',
  'Checking the moon phase and the vibes...',
  'Preparing punctuation governance...',
  'Waiting for Spring Boot to warm up...',
  'Concatenating enterprise-approved strings...',
  'Checking teapot health status (HTTP 418)...',
  'Reviewing Architecture Decision Record #47...',
  'Rendering two words with uncommon seriousness...',
];

function humanizeSource(source?: string) {
  switch (source) {
    case 'ai-decision-engine':
      return 'Chief Greeting Officer AI';
    case 'ai-decision-engine-fallback':
      return 'Chief Greeting Officer Fallback';
    case 'feature-flag-service':
      return 'Feature Flag Council';
    case 'gateway-fallback':
      return 'Gateway Emergency Protocol';
    case 'user-input':
      return 'Direct User Request';
    default:
      return 'Greeting Governance Layer';
  }
}

function sourceTone(source?: string) {
  switch (source) {
    case 'ai-decision-engine':
      return 'live';
    case 'ai-decision-engine-fallback':
      return 'fallback';
    case 'feature-flag-service':
      return 'policy';
    case 'gateway-fallback':
      return 'fallback';
    case 'user-input':
      return 'manual';
    default:
      return 'neutral';
  }
}

export default function Home() {
  const [greeting, setGreeting] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingStage, setLoadingStage] = useState('');
  const [metadata, setMetadata] = useState<MetadataPayload | null>(null);

  useEffect(() => {
    let stageIndex = 0;
    const stageInterval = setInterval(() => {
      setLoadingStage(loadingStages[stageIndex % loadingStages.length]);
      stageIndex += 1;
    }, 700);

    fetch('/api/greet', { method: 'POST' })
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }

        return response.json();
      })
      .then((data) => {
        setTimeout(() => {
          clearInterval(stageInterval);
          setGreeting(data.greeting || 'Hello World!');
          setMetadata(data.metadata || {});
          setLoading(false);
        }, 1200);
      })
      .catch((error) => {
        console.error('API fetch failed:', error);

        setTimeout(() => {
          clearInterval(stageInterval);
          setGreeting('Hello World!');
          setMetadata({
            error: 'API not available. Showing the enterprise-approved fallback greeting.',
            greetingDecision: {
              reason: 'Frontend fallback engaged after an API fetch failure.',
              source: 'gateway-fallback',
              word: 'Hello',
            },
            microservicesInvoked: 0,
            aiTokensUsed: 0,
            teapotStatus: 418,
            architectureDecisionRecordsConsulted: 47,
            wasItWorthIt: false,
          });
          setLoading(false);
        }, 1200);
      });

    return () => clearInterval(stageInterval);
  }, []);

  if (loading) {
    return (
      <main className="shell loading-shell">
        <section className="loading-card">
          <div className="pulse-orb" />
          <p className="eyebrow">HelloWorld Enterprise</p>
          <h1>Preparing your greeting.</h1>
          <p className="loading-stage">{loadingStage}</p>
          <div className="progress-track">
            <div className="progress-fill" />
          </div>
          <p className="footnote">Powered by 9 microservices, 6 languages, and one deeply committed teapot.</p>
        </section>
        <style jsx>{styles}</style>
      </main>
    );
  }

  const decision = metadata?.greetingDecision;
  const aiDecision = metadata?.aiDecision;
  const aiFlag = metadata?.featureFlags?.aiGreetingEnabled;
  const greetingTone = sourceTone(decision?.source);
  const showLiveAiPanel = decision?.source === 'ai-decision-engine' && aiDecision && !aiDecision._fallback;
  const showAiFallbackPanel = decision?.source === 'ai-decision-engine-fallback' && aiDecision;

  return (
    <main className="shell">
      <section className="hero-card">
        <p className="eyebrow">HelloWorld Enterprise</p>
        <h1 className="greeting">{greeting}</h1>
        <p className={`authority-pill authority-pill-${greetingTone}`}>
          {humanizeSource(decision?.source)} selected "{decision?.word || 'Hello'}"
        </p>
        <p className="subcopy">
          {decision?.reason || 'The greeting pipeline completed without filing an incident.'}
        </p>

        <div className="hero-grid">
          <article className="decision-card">
            <p className="card-label">Greeting Authority</p>
            <h2>{humanizeSource(decision?.source)}</h2>
            <p>
              {showLiveAiPanel
                ? 'The CGO path is live for this request.'
                : showAiFallbackPanel
                  ? 'The CGO was consulted, but the response came from emergency fallback logic.'
                  : 'This request followed a non-AI governance path.'}
            </p>

            <div className="metric-row">
              <div>
                <span className="metric-label">AI rollout</span>
                <strong>{aiFlag?.rolloutPercentage ?? 0}%</strong>
              </div>
              <div>
                <span className="metric-label">AI enabled</span>
                <strong>{aiFlag?.value ? 'Yes' : 'No'}</strong>
              </div>
              <div>
                <span className="metric-label">Latency</span>
                <strong>{metadata?.processingTimeMs ?? 0}ms</strong>
              </div>
            </div>
          </article>

          <article className="decision-card">
            <p className="card-label">CGO Briefing</p>
            <h2>{showLiveAiPanel ? 'Live executive reasoning' : showAiFallbackPanel ? 'Fallback executive reasoning' : 'Governance fallback'}</h2>
            <p>
              {showLiveAiPanel || showAiFallbackPanel
                ? aiDecision.reasoning
                : aiFlag?.note || metadata?.error || 'No AI briefing was attached to this response.'}
            </p>

            <div className="metric-row">
              <div>
                <span className="metric-label">Confidence</span>
                <strong>{showLiveAiPanel || showAiFallbackPanel ? `${aiDecision.confidence ?? 0}%` : 'N/A'}</strong>
              </div>
              <div>
                <span className="metric-label">Risk</span>
                <strong>{showLiveAiPanel || showAiFallbackPanel ? (aiDecision.riskAssessment || 'unknown') : 'managed'}</strong>
              </div>
              <div>
                <span className="metric-label">Fallback</span>
                <strong>{aiDecision?._fallback ? 'Yes' : 'No'}</strong>
              </div>
            </div>

            {showLiveAiPanel && aiDecision.boardApproval ? (
              <p className="board-note">{aiDecision.boardApproval}</p>
            ) : null}
          </article>
        </div>
      </section>

      {metadata?.systemNarrative ? (
        <section className="content-card">
          <p className="card-label">System Health Saga</p>
          <h2>Operational drama, rendered in prose.</h2>
          <p>{metadata.systemNarrative.narrative}</p>
          <div className="detail-grid">
            <p><strong>Overall mood:</strong> {metadata.systemNarrative.overallMood}</p>
            <p><strong>Hero of the hour:</strong> {metadata.systemNarrative.heroOfTheHour}</p>
            <p><strong>Villain of the hour:</strong> {metadata.systemNarrative.villainOfTheHour}</p>
            <p><strong>Teapot wisdom:</strong> {metadata.systemNarrative.teapotWisdom}</p>
            <p><strong>Quest status:</strong> {metadata.systemNarrative.questStatus}</p>
          </div>
        </section>
      ) : null}

      {metadata?.abAnalysis ? (
        <section className="content-card">
          <p className="card-label">A/B Test Analysis</p>
          <h2>{metadata.abAnalysis.experimentName || 'Punctuation governance report'}</h2>
          <p>{metadata.abAnalysis.executiveSummary}</p>
          <div className="detail-grid">
            <p><strong>Recommendation:</strong> {metadata.abAnalysis.recommendation}</p>
            <p>
              <strong>Statistical honesty:</strong>{' '}
              {metadata.abAnalysis.statisticalAnalysis?.honestyNote || 'No honesty note available.'}
            </p>
          </div>
        </section>
      ) : null}

      {metadata?.teapotWisdom?.musing ? (
        <section className="content-card teapot-card">
          <p className="card-label">Teapot Philosophy</p>
          <h2>HTTP 418 remains spiritually available.</h2>
          <p>{metadata.teapotWisdom.musing}</p>
          <p><strong>Status code:</strong> {metadata.teapotStatus ?? 418}</p>
        </section>
      ) : null}

      <section className="content-card infrastructure-card">
        <p className="card-label">Infrastructure Posture</p>
        <h2>The architecture nobody asked for.</h2>
        <div className="metric-row">
          <div>
            <span className="metric-label">Microservices</span>
            <strong>{metadata?.microservicesInvoked ?? 0}</strong>
          </div>
          <div>
            <span className="metric-label">AI tokens</span>
            <strong>{metadata?.aiTokensUsed ?? 0}</strong>
          </div>
          <div>
            <span className="metric-label">ADRs consulted</span>
            <strong>{metadata?.architectureDecisionRecordsConsulted ?? 47}</strong>
          </div>
        </div>
        <details className="metadata-drawer">
          <summary>Inspect raw orchestration metadata</summary>
          <pre>{JSON.stringify(metadata, null, 2)}</pre>
        </details>
      </section>

      <style jsx>{styles}</style>
    </main>
  );
}

const styles = `
  :global(body) {
    margin: 0;
    background:
      radial-gradient(circle at top, rgba(255, 209, 102, 0.18), transparent 30%),
      linear-gradient(180deg, #f7f2e9 0%, #efe6d8 48%, #e5d6c3 100%);
    color: #1e1a17;
    font-family: Georgia, 'Times New Roman', serif;
  }

  * {
    box-sizing: border-box;
  }

  .shell {
    min-height: 100vh;
    padding: 32px 20px 48px;
  }

  .loading-shell {
    display: grid;
    place-items: center;
  }

  .hero-card,
  .content-card,
  .loading-card {
    max-width: 1100px;
    margin: 0 auto 24px;
    border: 1px solid rgba(30, 26, 23, 0.1);
    border-radius: 28px;
    background: rgba(255, 250, 242, 0.86);
    box-shadow: 0 24px 60px rgba(80, 53, 24, 0.12);
    backdrop-filter: blur(10px);
  }

  .hero-card,
  .content-card {
    padding: 28px;
  }

  .loading-card {
    width: min(680px, 100%);
    padding: 40px 28px;
    text-align: center;
  }

  .eyebrow,
  .card-label {
    margin: 0 0 10px;
    font-size: 0.78rem;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    color: #7b5a39;
  }

  .greeting {
    margin: 0;
    font-size: clamp(3.5rem, 8vw, 7rem);
    line-height: 0.94;
    letter-spacing: -0.04em;
  }

  .subcopy,
  .loading-stage,
  .content-card p,
  .decision-card p {
    font-size: 1.02rem;
    line-height: 1.7;
  }

  .authority-pill {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    margin: 18px 0 12px;
    padding: 10px 16px;
    border-radius: 999px;
    font-size: 0.92rem;
    font-weight: 700;
    letter-spacing: 0.02em;
  }

  .authority-pill-live {
    background: #173f35;
    color: #f4f1e8;
  }

  .authority-pill-policy {
    background: #3f2e1f;
    color: #fff4e4;
  }

  .authority-pill-fallback {
    background: #7a2f2f;
    color: #fff3f3;
  }

  .authority-pill-manual,
  .authority-pill-neutral {
    background: #45556c;
    color: #f4f7fb;
  }

  .hero-grid,
  .detail-grid,
  .metric-row {
    display: grid;
    gap: 16px;
  }

  .hero-grid {
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    margin-top: 24px;
  }

  .decision-card {
    padding: 22px;
    border-radius: 22px;
    background: #fffdf8;
    border: 1px solid rgba(30, 26, 23, 0.08);
  }

  .decision-card h2,
  .content-card h2,
  .loading-card h1 {
    margin: 0 0 10px;
    font-size: clamp(1.6rem, 4vw, 2.4rem);
    line-height: 1.08;
  }

  .metric-row {
    grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
    margin-top: 18px;
  }

  .metric-row > div {
    padding: 14px;
    border-radius: 18px;
    background: #f5ede1;
  }

  .metric-label {
    display: block;
    margin-bottom: 6px;
    font-size: 0.72rem;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: #8b6742;
  }

  strong {
    color: #17120f;
  }

  .board-note {
    margin-top: 16px;
    padding-top: 16px;
    border-top: 1px solid rgba(30, 26, 23, 0.08);
    color: #57402a;
  }

  .detail-grid {
    grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
    margin-top: 16px;
  }

  .teapot-card {
    background: linear-gradient(180deg, rgba(255, 250, 242, 0.96), rgba(246, 236, 219, 0.96));
  }

  .infrastructure-card {
    margin-bottom: 0;
  }

  .metadata-drawer {
    margin-top: 20px;
    padding: 18px 20px;
    border-radius: 18px;
    background: #f5ede1;
  }

  .metadata-drawer summary {
    cursor: pointer;
    font-weight: 700;
  }

  pre {
    overflow: auto;
    margin: 14px 0 0;
    padding: 16px;
    border-radius: 14px;
    background: #201a16;
    color: #f7f1e8;
    font-size: 0.86rem;
    line-height: 1.45;
  }

  .pulse-orb {
    width: 72px;
    height: 72px;
    margin: 0 auto 18px;
    border-radius: 50%;
    background:
      radial-gradient(circle at 30% 30%, #fff4c7 0%, #f3bc64 40%, #9b5f26 100%);
    box-shadow: 0 0 0 0 rgba(243, 188, 100, 0.45);
    animation: pulse 1.8s infinite;
  }

  .progress-track {
    width: 100%;
    height: 10px;
    margin-top: 20px;
    overflow: hidden;
    border-radius: 999px;
    background: rgba(46, 31, 18, 0.1);
  }

  .progress-fill {
    width: 40%;
    height: 100%;
    border-radius: inherit;
    background: linear-gradient(90deg, #9b5f26, #e3a446, #f3bc64);
    animation: glide 1.6s infinite ease-in-out;
  }

  .footnote {
    margin-top: 16px;
    color: #6a5236;
  }

  @keyframes pulse {
    0% {
      box-shadow: 0 0 0 0 rgba(243, 188, 100, 0.45);
      transform: scale(1);
    }
    70% {
      box-shadow: 0 0 0 24px rgba(243, 188, 100, 0);
      transform: scale(1.04);
    }
    100% {
      box-shadow: 0 0 0 0 rgba(243, 188, 100, 0);
      transform: scale(1);
    }
  }

  @keyframes glide {
    0% {
      transform: translateX(-120%);
    }
    50% {
      transform: translateX(110%);
    }
    100% {
      transform: translateX(240%);
    }
  }

  @media (max-width: 720px) {
    .shell {
      padding: 18px 14px 28px;
    }

    .hero-card,
    .content-card,
    .loading-card {
      border-radius: 22px;
    }

    .hero-card,
    .content-card {
      padding: 20px;
    }

    .loading-card {
      padding: 28px 20px;
    }
  }
`;
