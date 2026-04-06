'use client';

import type { ReactNode } from 'react';
import { startTransition, useEffect, useState } from 'react';
import styles from './page.module.css';

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

type GreetingApiResponse = {
  greeting?: string;
  metadata?: MetadataPayload;
};

type Tone = 'live' | 'fallback' | 'policy' | 'manual' | 'neutral';

type Metric = {
  label: string;
  note: string;
  value: string;
};

type DetailRow = {
  label: string;
  note?: string;
  value: string;
};

type StatusBadgeProps = {
  label: string;
  tone: Tone;
};

type SectionFrameProps = {
  children: ReactNode;
  className?: string;
  description?: string;
  eyebrow: string;
  title: string;
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

function cx(...classNames: Array<string | false | null | undefined>) {
  return classNames.filter(Boolean).join(' ');
}

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

function sourceTone(source?: string): Tone {
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

function isFlagEnabled(value?: boolean | string | null) {
  return value === true || value === 'true';
}

function buildFallbackMetadata(): MetadataPayload {
  return {
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
  };
}

function StatusBadge({ label, tone }: StatusBadgeProps) {
  const toneClassName = {
    live: styles.toneLive,
    fallback: styles.toneFallback,
    policy: styles.tonePolicy,
    manual: styles.toneManual,
    neutral: styles.toneNeutral,
  }[tone];

  return <span className={cx(styles.statusBadge, toneClassName)}>{label}</span>;
}

function MetricTile({ label, note, value }: Metric) {
  return (
    <article className={styles.metricTile}>
      <span className={styles.metricLabel}>{label}</span>
      <strong className={styles.metricValue}>{value}</strong>
      <p className={styles.metricNote}>{note}</p>
    </article>
  );
}

function FactList({ items }: { items: DetailRow[] }) {
  return (
    <div className={styles.factList}>
      {items.map((item) => (
        <div className={styles.factItem} key={item.label}>
          <span className={styles.factTerm}>{item.label}</span>
          <p className={styles.factValue}>{item.value}</p>
          {item.note ? <p className={styles.factNote}>{item.note}</p> : null}
        </div>
      ))}
    </div>
  );
}

function SectionFrame({ children, className, description, eyebrow, title }: SectionFrameProps) {
  return (
    <section className={cx(styles.sectionFrame, className)}>
      <header className={styles.sectionHeader}>
        <p className={styles.eyebrow}>{eyebrow}</p>
        <h2 className={styles.sectionTitle}>{title}</h2>
        {description ? <p className={styles.sectionDescription}>{description}</p> : null}
      </header>
      {children}
    </section>
  );
}

function LoadingExperience({ stage }: { stage: string }) {
  const activeIndex = Math.max(loadingStages.indexOf(stage), 0);
  const windowSize = 5;
  const startIndex = Math.max(0, Math.min(activeIndex - 1, loadingStages.length - windowSize));
  const visibleStages = loadingStages.slice(startIndex, startIndex + windowSize);

  return (
    <main className={styles.loadingPage}>
      <div className={styles.loadingShell}>
        <section className={styles.loadingPanel}>
          <div className={styles.loadingOrb}>{'</>'}</div>
          <p className={styles.heroKicker}>HelloWorld Enterprise</p>
          <h1 className={styles.loadingTitle}>Building the executive greeting brief.</h1>
          <p className={styles.loadingLead}>
            The platform is coordinating governance, experimentation, teapot ceremony, and
            executive judgment before it dares to render two words.
          </p>
          <div className={styles.loadingBar}>
            <div className={styles.loadingBarFill} />
          </div>
          <p className={styles.loadingFootnote}>
            Current stage: <strong>{stage}</strong>
          </p>
        </section>

        <aside className={styles.loadingSidecar}>
          <p className={styles.eyebrow}>Live orchestration feed</p>
          <div className={styles.loadingStepGrid}>
            {visibleStages.map((label, index) => {
              const sequence = startIndex + index + 1;
              const isActive = label === stage;

              return (
                <div
                  className={cx(styles.loadingStep, isActive && styles.loadingStepActive)}
                  key={label}
                >
                  <span className={styles.loadingStepIndex}>
                    {String(sequence).padStart(2, '0')}
                  </span>{' '}
                  {label}
                </div>
              );
            })}
          </div>
        </aside>
      </div>
    </main>
  );
}

export default function Home() {
  const [greeting, setGreeting] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingStage, setLoadingStage] = useState(loadingStages[0]);
  const [metadata, setMetadata] = useState<MetadataPayload | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    let stageIndex = 0;
    let completionTimer: ReturnType<typeof setTimeout> | undefined;

    const stageInterval = setInterval(() => {
      setLoadingStage(loadingStages[stageIndex % loadingStages.length]);
      stageIndex += 1;
    }, 700);

    fetch('/api/greet', { method: 'POST', signal: controller.signal })
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }

        return response.json() as Promise<GreetingApiResponse>;
      })
      .then((data) => {
        completionTimer = setTimeout(() => {
          if (controller.signal.aborted) {
            return;
          }

          startTransition(() => {
            setGreeting(data.greeting || 'Hello World!');
            setMetadata(data.metadata || {});
            setLoading(false);
          });
        }, 1200);
      })
      .catch((error: unknown) => {
        if (controller.signal.aborted) {
          return;
        }

        console.error('API fetch failed:', error);

        completionTimer = setTimeout(() => {
          if (controller.signal.aborted) {
            return;
          }

          startTransition(() => {
            setGreeting('Hello World!');
            setMetadata(buildFallbackMetadata());
            setLoading(false);
          });
        }, 1200);
      });

    return () => {
      controller.abort();
      clearInterval(stageInterval);

      if (completionTimer) {
        clearTimeout(completionTimer);
      }
    };
  }, []);

  if (loading) {
    return <LoadingExperience stage={loadingStage} />;
  }

  const resolvedMetadata: MetadataPayload = metadata ?? {};
  const resolvedGreeting = greeting || 'Hello World!';
  const decision = resolvedMetadata.greetingDecision;
  const aiDecision = resolvedMetadata.aiDecision;
  const aiFlag = resolvedMetadata.featureFlags?.aiGreetingEnabled;
  const greetingTone = sourceTone(decision?.source);
  const aiEnabled = isFlagEnabled(aiFlag?.value);
  const showLiveAiPanel = decision?.source === 'ai-decision-engine' && aiDecision && !aiDecision._fallback;
  const showAiFallbackPanel = decision?.source === 'ai-decision-engine-fallback' && aiDecision;
  const operatingMode = showLiveAiPanel
    ? 'Live AI routing'
    : showAiFallbackPanel
      ? 'Fallback AI routing'
      : greetingTone === 'policy'
        ? 'Policy-governed path'
        : resolvedMetadata.error
          ? 'Emergency fallback'
          : 'Deterministic path';
  const executiveSource = humanizeSource(decision?.source);
  const briefingNarrative =
    (showLiveAiPanel || showAiFallbackPanel) && aiDecision?.reasoning
      ? aiDecision.reasoning
      : aiFlag?.note ||
        resolvedMetadata.error ||
        'No AI briefing was attached to this response.';
  const boardPosture =
    aiDecision?.boardApproval || 'No board directive was attached to this request.';
  const confidenceLabel =
    showLiveAiPanel || showAiFallbackPanel ? `${aiDecision?.confidence ?? 0}%` : 'N/A';
  const riskLabel =
    showLiveAiPanel || showAiFallbackPanel
      ? aiDecision?.riskAssessment || 'Managed'
      : 'Managed';
  const worthItLabel =
    resolvedMetadata.wasItWorthIt === undefined
      ? 'Undisclosed'
      : resolvedMetadata.wasItWorthIt
        ? 'Apparently yes'
        : 'Respectfully no';
  const rolloutLabel = `${aiFlag?.rolloutPercentage ?? 0}%`;
  const teapotStatusLabel = `HTTP ${resolvedMetadata.teapotStatus ?? 418}`;
  const teapotWisdom =
    resolvedMetadata.teapotWisdom?.musing ||
    resolvedMetadata.systemNarrative?.teapotWisdom ||
    'The teapot remains ceremonial, compliant, and profoundly unhelpful.';

  const heroMetrics: Metric[] = [
    {
      label: 'Decision word',
      note: executiveSource,
      value: decision?.word ? `"${decision.word}"` : '"Hello"',
    },
    {
      label: 'Latency',
      note: 'Observed request duration',
      value: `${resolvedMetadata.processingTimeMs ?? 0}ms`,
    },
    {
      label: 'AI rollout',
      note: aiEnabled ? 'Flag active for this request' : 'Flag held in reserve',
      value: rolloutLabel,
    },
    {
      label: 'Microservices',
      note: 'Participating systems',
      value: String(resolvedMetadata.microservicesInvoked ?? 0),
    },
  ];

  const authorityRows: DetailRow[] = [
    {
      label: 'Authority',
      note: decision?.reason || 'No explicit routing rationale was attached.',
      value: executiveSource,
    },
    {
      label: 'Execution mode',
      note: aiEnabled ? 'Feature flag permits AI participation.' : 'The request stayed on the non-AI path.',
      value: operatingMode,
    },
    {
      label: 'Greeting word',
      note: 'The first half of the enterprise-approved sentence.',
      value: decision?.word || 'Hello',
    },
  ];

  const briefingRows: DetailRow[] = [
    {
      label: 'Confidence',
      note: 'Confidence is only reported when the AI path is engaged.',
      value: confidenceLabel,
    },
    {
      label: 'Risk posture',
      note: 'The platform keeps a default managed posture when AI is not involved.',
      value: riskLabel,
    },
    {
      label: 'Board posture',
      note: boardPosture,
      value: aiDecision?._fallback ? 'Fallback active' : 'Primary path',
    },
  ];

  const runtimeRows: DetailRow[] = [
    {
      label: 'Platform status',
      note: resolvedMetadata.error || 'No frontend fallback was required for this render.',
      value: resolvedMetadata.error ? 'Degraded but serving' : 'Nominal',
    },
    {
      label: 'Feature note',
      note: aiFlag?.note || 'No additional governance note was supplied.',
      value: aiEnabled ? 'AI capability enabled' : 'AI capability on standby',
    },
    {
      label: 'Worth it',
      note: 'An objective question the platform refuses to answer consistently.',
      value: worthItLabel,
    },
  ];

  const governanceRows: DetailRow[] = [
    {
      label: 'AI enabled',
      note: 'Reflects the live feature-flag decision returned with the request.',
      value: aiEnabled ? 'Yes' : 'No',
    },
    {
      label: 'Greeting council',
      note: 'The service currently shaping the first word.',
      value: executiveSource,
    },
    {
      label: 'Teapot status',
      note: 'Ceremonial exception telemetry remains part of the enterprise contract.',
      value: teapotStatusLabel,
    },
  ];

  const narrativeRows: DetailRow[] = [
    {
      label: 'Overall mood',
      note: 'Atmospheric reading from the system narrative.',
      value: resolvedMetadata.systemNarrative?.overallMood || 'Contained',
    },
    {
      label: 'Hero of the hour',
      note: 'The service currently perceived as carrying the stack.',
      value: resolvedMetadata.systemNarrative?.heroOfTheHour || 'No hero declared',
    },
    {
      label: 'Villain of the hour',
      note: 'The service most likely to appear in the post-incident memo.',
      value: resolvedMetadata.systemNarrative?.villainOfTheHour || 'No villain declared',
    },
    {
      label: 'Quest status',
      note: 'The current state of our two-word ambition.',
      value: resolvedMetadata.systemNarrative?.questStatus || 'Steady',
    },
  ];

  const experimentRows: DetailRow[] = [
    {
      label: 'Recommendation',
      note: 'Experiment guidance for punctuation governance.',
      value: resolvedMetadata.abAnalysis?.recommendation || 'No recommendation attached',
    },
    {
      label: 'Honesty note',
      note: 'Statistical humility, when available.',
      value:
        resolvedMetadata.abAnalysis?.statisticalAnalysis?.honestyNote ||
        'No statistical honesty note available.',
    },
  ];

  const observabilityMetrics: Metric[] = [
    {
      label: 'AI tokens',
      note: 'Reported token consumption for this request',
      value: String(resolvedMetadata.aiTokensUsed ?? 0),
    },
    {
      label: 'ADRs consulted',
      note: 'Institutional memory consumed during execution',
      value: String(resolvedMetadata.architectureDecisionRecordsConsulted ?? 47),
    },
    {
      label: 'Teapot code',
      note: 'The ceremonial exception remains spiritually intact',
      value: teapotStatusLabel,
    },
    {
      label: 'Confidence',
      note: 'AI confidence or enterprise default posture',
      value: confidenceLabel,
    },
  ];

  return (
    <main className={styles.page}>
      <div className={styles.contentWrap}>
        <header className={styles.masthead}>
          <div className={styles.brandLockup}>
            <div className={styles.brandMark}>{'</>'}</div>
            <div>
              <p className={styles.eyebrow}>HelloWorld Enterprise</p>
              <h1 className={styles.mastheadTitle}>Greeting Operations Console</h1>
              <p className={styles.mastheadCopy}>
                A live executive dashboard for observing how one greeting moves through AI,
                feature governance, experimentation, and ceremonial teapot protocol.
              </p>
            </div>
          </div>

          <div className={styles.signalRail}>
            <StatusBadge label={operatingMode} tone={greetingTone} />
            <StatusBadge
              label={aiEnabled ? 'AI flag active' : 'AI flag standby'}
              tone={aiEnabled ? 'live' : 'neutral'}
            />
            <StatusBadge label='Railway backend + Vercel shell' tone='neutral' />
          </div>
        </header>

        {resolvedMetadata.error ? (
          <div className={styles.alertBanner}>
            <strong>Degraded mode.</strong>
            <span>{resolvedMetadata.error}</span>
          </div>
        ) : null}

        <section className={styles.heroGrid}>
          <section className={styles.heroFrame}>
            <p className={styles.heroKicker}>Executive outcome</p>
            <h2 className={styles.heroDisplay}>{resolvedGreeting}</h2>
            <p className={styles.heroNarrative}>
              {decision?.reason ||
                'The greeting pipeline completed its work without generating an official incident.'}
            </p>

            <div className={styles.heroBadgeRow}>
              <StatusBadge
                label={`${executiveSource} selected ${decision?.word || 'Hello'}`}
                tone={greetingTone}
              />
              <StatusBadge label={boardPosture} tone='neutral' />
            </div>

            <div className={styles.heroMetricGrid}>
              {heroMetrics.map((metric) => (
                <MetricTile key={metric.label} {...metric} />
              ))}
            </div>
          </section>

          <aside className={styles.summaryFrame}>
            <div className={styles.summaryStack}>
              <div className={styles.summaryLead}>
                <p className={styles.eyebrow}>Current directive</p>
                <h3 className={styles.summaryLeadTitle}>Command deck summary</h3>
                <p className={styles.summaryLeadCopy}>
                  {showLiveAiPanel
                    ? 'The platform selected the live Chief Greeting Officer path and returned a fully populated briefing.'
                    : showAiFallbackPanel
                      ? 'The platform consulted the AI layer but completed the request using its fallback posture.'
                      : 'The request completed without requiring live AI escalation, which is both prudent and suspicious.'}
                </p>
              </div>

              <div className={styles.metricGrid}>
                <MetricTile
                  label='Authority'
                  note='The present owner of greeting selection'
                  value={executiveSource}
                />
                <MetricTile
                  label='Risk posture'
                  note='Risk summary returned with this request'
                  value={riskLabel}
                />
                <MetricTile
                  label='Board note'
                  note='Escalation summary for executive review'
                  value={aiDecision?._fallback ? 'Fallback active' : 'Primary path'}
                />
                <MetricTile
                  label='Worth it'
                  note='A recurring governance debate'
                  value={worthItLabel}
                />
              </div>
            </div>
          </aside>
        </section>

        <section className={styles.dashboardGrid}>
          <div className={styles.primaryColumn}>
            <SectionFrame
              description='Two synchronized views of the same request: who made the decision and how the rationale was framed.'
              eyebrow='Decision matrix'
              title='Authority and executive reasoning'
            >
              <div className={styles.dualCardGrid}>
                <article className={styles.signalCard}>
                  <p className={styles.eyebrow}>Greeting authority</p>
                  <p className={styles.signalCopy}>
                    {showLiveAiPanel
                      ? 'The Chief Greeting Officer path is active and the live model authored the guidance for this request.'
                      : showAiFallbackPanel
                        ? 'The Chief Greeting Officer was consulted, but operations fell back to the deterministic posture before final assembly.'
                        : 'This request stayed on a policy-led or fallback-led route without requiring live executive AI intervention.'}
                  </p>
                  <FactList items={authorityRows} />
                </article>

                <article className={styles.signalCard}>
                  <p className={styles.eyebrow}>Briefing package</p>
                  <p className={styles.signalCopy}>{briefingNarrative}</p>
                  <FactList items={briefingRows} />
                </article>
              </div>
            </SectionFrame>

            <div className={styles.splitGrid}>
              <SectionFrame
                description='Operational color commentary for the current request, rendered as if this greeting were a listed company.'
                eyebrow='System narrative'
                title='How the platform is feeling today'
              >
                <div className={styles.quotePanel}>
                  <p className={styles.quoteText}>
                    {resolvedMetadata.systemNarrative?.narrative ||
                      'No system narrative was attached to this request, which may be the healthiest signal available.'}
                  </p>
                  <div className={styles.quoteGrid}>
                    {narrativeRows.map((row) => (
                      <MetricTile
                        key={row.label}
                        label={row.label}
                        note={row.note || ''}
                        value={row.value}
                      />
                    ))}
                  </div>
                </div>
              </SectionFrame>

              <SectionFrame
                description='Experiment telemetry and punctuation governance for the current render.'
                eyebrow='Experiment brief'
                title={resolvedMetadata.abAnalysis?.experimentName || 'Punctuation governance'}
              >
                <div className={styles.quotePanel}>
                  <p className={styles.quoteText}>
                    {resolvedMetadata.abAnalysis?.executiveSummary ||
                      'This request did not return an explicit experiment summary, so punctuation policy remains in its default posture.'}
                  </p>
                  <FactList items={experimentRows} />
                </div>
              </SectionFrame>
            </div>

            <SectionFrame
              description='The payload beneath the velvet rope. Useful for debugging, audits, and proving that the absurdity is measurable.'
              eyebrow='Observability ledger'
              title='Runtime evidence'
            >
              <div className={styles.observabilityRow}>
                {observabilityMetrics.map((metric) => (
                  <MetricTile key={metric.label} {...metric} />
                ))}
              </div>

              <details className={styles.drawer}>
                <summary className={styles.drawerSummary}>Inspect raw orchestration metadata</summary>
                <pre className={styles.payload}>{JSON.stringify(resolvedMetadata, null, 2)}</pre>
              </details>
            </SectionFrame>
          </div>

          <aside className={styles.secondaryColumn}>
            <SectionFrame
              className={styles.sidebarCard}
              description='High-level operating signals for the live request path.'
              eyebrow='Platform posture'
              title='Operating mode'
            >
              <FactList items={runtimeRows} />
            </SectionFrame>

            <SectionFrame
              className={styles.sidebarCard}
              description='Feature, risk, and ceremonial controls that shape the final output.'
              eyebrow='Governance signals'
              title='Flags and protocol'
            >
              <FactList items={governanceRows} />
            </SectionFrame>

            <SectionFrame
              className={styles.sidebarCard}
              description='The stack continues to honor the most important status code in enterprise software.'
              eyebrow='Teapot protocol'
              title='Ceremonial exception handling'
            >
              <div className={styles.teapotPanel}>
                <StatusBadge label={teapotStatusLabel} tone='policy' />
                <p className={styles.teapotQuote}>{teapotWisdom}</p>
              </div>
            </SectionFrame>
          </aside>
        </section>
      </div>
    </main>
  );
}
