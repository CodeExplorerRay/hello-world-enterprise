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

function formatOptionalValue(value?: boolean | string | number | null) {
  if (value === undefined) {
    return 'Unavailable';
  }

  if (value === null) {
    return 'None';
  }

  if (typeof value === 'boolean') {
    return value ? 'True' : 'False';
  }

  if (value === '') {
    return 'Empty';
  }

  return String(value);
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
          <div className={styles.factContent}>
            <p className={styles.factValue}>{item.value}</p>
            {item.note ? <p className={styles.factNote}>{item.note}</p> : null}
          </div>
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
  return (
    <main className={styles.loadingPage}>
      <section className={styles.loadingPanel}>
        <div className={styles.loadingOrb}>{'</>'}</div>
        <p className={styles.loadingEyebrow}>HelloWorld Enterprise</p>
        <h1 className={styles.loadingTitle}>Preparing the orchestration brief</h1>
        <p className={styles.loadingLead}>{stage}</p>
        <div className={styles.loadingBar}>
          <div className={styles.loadingBarFill} />
        </div>
        <p className={styles.loadingFootnote}>
          Routing through AI, feature governance, experimentation, and teapot protocol.
        </p>
      </section>
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
  const greetingWordFlag = resolvedMetadata.featureFlags?.greetingWord;
  const greetingTone = sourceTone(decision?.source);
  const aiEnabled = isFlagEnabled(aiFlag?.value);
  const showLiveAiPanel =
    decision?.source === 'ai-decision-engine' && aiDecision && !aiDecision._fallback;
  const showAiFallbackPanel =
    decision?.source === 'ai-decision-engine-fallback' && aiDecision;
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
  const topLevelTeapotMusing =
    resolvedMetadata.teapotWisdom?.musing || 'No dedicated teapot musing was attached.';
  const narrativeTeapotWisdom =
    resolvedMetadata.systemNarrative?.teapotWisdom ||
    'No narrative teapot wisdom was attached.';
  const routingSummary = showLiveAiPanel
    ? 'The live Chief Greeting Officer path supplied the final executive recommendation for this request.'
    : showAiFallbackPanel
      ? 'The AI layer engaged, then the platform completed the request through its fallback posture.'
      : greetingTone === 'policy'
        ? 'The request stayed on a deterministic, policy-governed route without live AI escalation.'
        : 'The platform completed the greeting using its deterministic baseline posture.';
  const experimentTitle =
    resolvedMetadata.abAnalysis?.experimentName || 'Punctuation governance';
  const experimentSummary =
    resolvedMetadata.abAnalysis?.executiveSummary ||
    'This request did not return an explicit experiment summary.';
  const narrativeSummary =
    resolvedMetadata.systemNarrative?.narrative ||
    'No system narrative was attached to this request.';
  const aiRouteLabel = aiEnabled ? 'Enabled for this request' : 'Held in reserve';
  const greetingWordLabel = formatOptionalValue(greetingWordFlag?.value);

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
      label: 'Source',
      note: 'The system responsible for selecting the opening word.',
      value: executiveSource,
    },
    {
      label: 'Decision reason',
      note: 'The direct explanation returned with the greeting decision.',
      value: decision?.reason || 'No explicit routing rationale was attached.',
    },
    {
      label: 'Greeting word',
      note: 'The first half of the final rendered sentence.',
      value: decision?.word || 'Hello',
    },
  ];

  const briefingRows: DetailRow[] = [
    {
      label: 'Confidence',
      note: 'Confidence is only meaningful when the AI path engages.',
      value: confidenceLabel,
    },
    {
      label: 'Risk assessment',
      note: 'Executive risk posture for the request.',
      value: riskLabel,
    },
    {
      label: 'Board approval',
      note: 'Board-level direction or fallback note from the decision layer.',
      value: boardPosture,
    },
    {
      label: 'Fallback',
      note: 'Whether the final decision was served from fallback logic.',
      value: formatOptionalValue(aiDecision?._fallback),
    },
  ];

  const runtimeRows: DetailRow[] = [
    {
      label: 'Platform status',
      note: 'Overall state of the current frontend render.',
      value: resolvedMetadata.error ? 'Degraded but serving' : 'Nominal',
    },
    {
      label: 'Frontend error',
      note: 'Fallback surfaces this when the API path is unavailable.',
      value: resolvedMetadata.error || 'None',
    },
    {
      label: 'Was it worth it',
      note: 'The answer the platform reluctantly provides about itself.',
      value: worthItLabel,
    },
    {
      label: 'Processing time',
      note: 'End-to-end orchestration duration.',
      value: `${resolvedMetadata.processingTimeMs ?? 0}ms`,
    },
  ];

  const aiFlagRows: DetailRow[] = [
    {
      label: 'Enabled field',
      note: 'The raw enabled field returned by the flag payload.',
      value: formatOptionalValue(aiFlag?.enabled),
    },
    {
      label: 'Value field',
      note: 'The resolved value field used by the frontend decision path.',
      value: formatOptionalValue(aiFlag?.value),
    },
    {
      label: 'Rollout',
      note: 'Configured rollout percentage for AI greeting enablement.',
      value:
        aiFlag?.rolloutPercentage === undefined
          ? 'Unavailable'
          : `${aiFlag.rolloutPercentage}%`,
    },
    {
      label: 'Note',
      note: 'Operator note returned alongside the flag evaluation.',
      value: aiFlag?.note || 'No note attached.',
    },
  ];

  const greetingWordRows: DetailRow[] = [
    {
      label: 'Enabled field',
      note: 'The raw enabled field for the greeting word configuration.',
      value: formatOptionalValue(greetingWordFlag?.enabled),
    },
    {
      label: 'Value field',
      note: 'The raw selected word or value returned by the flag payload.',
      value: formatOptionalValue(greetingWordFlag?.value),
    },
    {
      label: 'Rollout',
      note: 'Configured rollout percentage for the greeting word flag.',
      value:
        greetingWordFlag?.rolloutPercentage === undefined
          ? 'Unavailable'
          : `${greetingWordFlag.rolloutPercentage}%`,
    },
    {
      label: 'Note',
      note: 'Operator note returned alongside the greeting word evaluation.',
      value: greetingWordFlag?.note || 'No note attached.',
    },
  ];

  const narrativeRows: DetailRow[] = [
    {
      label: 'Overall mood',
      note: 'Atmospheric readout from the system narrative layer.',
      value: resolvedMetadata.systemNarrative?.overallMood || 'Contained',
    },
    {
      label: 'Hero of the hour',
      note: 'The service presently carrying the stack.',
      value: resolvedMetadata.systemNarrative?.heroOfTheHour || 'No hero declared',
    },
    {
      label: 'Villain of the hour',
      note: 'The service most likely to appear in the postmortem.',
      value:
        resolvedMetadata.systemNarrative?.villainOfTheHour || 'No villain declared',
    },
    {
      label: 'Quest status',
      note: 'The official state of our two-word mission.',
      value: resolvedMetadata.systemNarrative?.questStatus || 'Steady',
    },
  ];

  const experimentRows: DetailRow[] = [
    {
      label: 'Recommendation',
      note: 'Experiment guidance for punctuation and output policy.',
      value: resolvedMetadata.abAnalysis?.recommendation || 'No recommendation attached',
    },
    {
      label: 'Honesty note',
      note: 'Statistical humility when the experiment layer offers it.',
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
    <main className={cx(styles.page, styles.entering)}>
      <div className={styles.contentWrap}>
        <header className={styles.masthead}>
          <div className={styles.brandLockup}>
            <div className={styles.brandMark}>{'</>'}</div>
            <div>
              <p className={styles.mastheadLabel}>HelloWorld Enterprise</p>
              <h1 className={styles.mastheadTitle}>Greeting Intelligence Workspace</h1>
            </div>
          </div>

          <div className={styles.signalRail}>
            <StatusBadge label={operatingMode} tone={greetingTone} />
          </div>
        </header>

        {resolvedMetadata.error ? (
          <div className={styles.alertBanner}>
            <strong>Degraded mode.</strong>
            <span>{resolvedMetadata.error}</span>
          </div>
        ) : null}

        <section className={styles.heroBoard}>
          <section className={styles.heroFrame}>
            <div className={styles.heroHeaderRow}>
              <div>
                <p className={styles.heroKicker}>Live orchestration outcome</p>
                <h2 className={styles.heroDisplay}>{resolvedGreeting}</h2>
              </div>

              <div className={styles.heroStamp}>
                <span className={styles.heroStampLabel}>Routing authority</span>
                <strong className={styles.heroStampValue}>{executiveSource}</strong>
              </div>
            </div>

            <p className={styles.heroNarrative}>
              {decision?.reason ||
                'The greeting pipeline completed its work without generating an official incident.'}
            </p>

            <div className={styles.heroMetricGrid}>
              {heroMetrics.map((metric) => (
                <MetricTile key={metric.label} {...metric} />
              ))}
            </div>
          </section>

          <aside className={styles.heroAside}>
            <article className={styles.asideBlock}>
              <p className={styles.eyebrow}>Routing summary</p>
              <h3 className={styles.sidecarTitle}>{executiveSource}</h3>
              <p className={styles.sidecarText}>{routingSummary}</p>

              <div className={styles.sidecarStack}>
                <div className={styles.signalRow}>
                  <span className={styles.signalLabel}>Authority</span>
                  <span className={styles.signalValue}>{executiveSource}</span>
                </div>
                <div className={styles.signalRow}>
                  <span className={styles.signalLabel}>Board posture</span>
                  <span className={styles.signalValue}>{boardPosture}</span>
                </div>
                <div className={styles.signalRow}>
                  <span className={styles.signalLabel}>Risk posture</span>
                  <span className={styles.signalValue}>{riskLabel}</span>
                </div>
                <div className={styles.signalRow}>
                  <span className={styles.signalLabel}>Worth it</span>
                  <span className={styles.signalValue}>{worthItLabel}</span>
                </div>
              </div>
            </article>

            <article className={styles.asideBlock}>
              <p className={styles.eyebrow}>Executive brief</p>
              <p className={styles.cardText}>{briefingNarrative}</p>

              <div className={styles.briefingGrid}>
                {briefingRows.map((row) => (
                  <div className={styles.briefingCard} key={row.label}>
                    <span className={styles.metaLabel}>{row.label}</span>
                    <span className={styles.briefingValue}>{row.value}</span>
                  </div>
                ))}
              </div>
            </article>
          </aside>
        </section>

        <section className={styles.detailsGrid}>
          <SectionFrame
            className={styles.span8}
            eyebrow='Narrative desk'
            title='Narrative and experiment brief'
            description='Atmosphere, experimentation, and interpretive context for the current request.'
          >
            <div className={styles.narrativeDeck}>
              <div className={styles.storyBlock}>
                <p className={styles.storyQuote}>{narrativeSummary}</p>

                <div className={styles.storyMeta}>
                  {narrativeRows.map((row) => (
                    <div className={styles.metaRow} key={row.label}>
                      <span className={styles.metaLabel}>{row.label}</span>
                      <span className={styles.metaValue}>{row.value}</span>
                    </div>
                  ))}
                </div>
              </div>

              <article className={styles.experimentPanel}>
                <p className={styles.eyebrow}>Experiment brief</p>
                <h3 className={styles.inlineTitle}>{experimentTitle}</h3>
                <p className={styles.cardText}>{experimentSummary}</p>
                <FactList items={experimentRows} />
              </article>
            </div>
          </SectionFrame>

          <div className={cx(styles.span4, styles.railStack)}>
            <SectionFrame
              eyebrow='Decision matrix'
              title='Greeting authority'
              description='Who made the call and why the route resolved this way.'
            >
              <FactList items={authorityRows} />
            </SectionFrame>

            <SectionFrame
              eyebrow='Runtime posture'
              title='Service condition'
              description='Operational state for the current render path.'
            >
              <FactList items={runtimeRows} />
            </SectionFrame>
          </div>

          <SectionFrame
            className={styles.span7}
            eyebrow='Governance signals'
            title='Control matrix'
            description='Feature controls are grouped here instead of being scattered across the page.'
          >
            <div className={styles.controlSummary}>
              <div className={styles.controlChip}>
                <span className={styles.controlChipLabel}>AI routing</span>
                <strong className={styles.controlChipValue}>{aiRouteLabel}</strong>
              </div>
              <div className={styles.controlChip}>
                <span className={styles.controlChipLabel}>Greeting word</span>
                <strong className={styles.controlChipValue}>{greetingWordLabel}</strong>
              </div>
              <div className={styles.controlChip}>
                <span className={styles.controlChipLabel}>Rollout</span>
                <strong className={styles.controlChipValue}>{rolloutLabel}</strong>
              </div>
              <div className={styles.controlChip}>
                <span className={styles.controlChipLabel}>Protocol</span>
                <strong className={styles.controlChipValue}>{teapotStatusLabel}</strong>
              </div>
            </div>

            <div className={styles.controlColumns}>
              <article className={styles.controlCard}>
                <h3 className={styles.inlineTitle}>AI greeting enablement</h3>
                <FactList items={aiFlagRows} />
              </article>

              <article className={styles.controlCard}>
                <h3 className={styles.inlineTitle}>Greeting word configuration</h3>
                <FactList items={greetingWordRows} />
              </article>
            </div>
          </SectionFrame>

          <SectionFrame
            className={styles.span5}
            eyebrow='Teapot protocol'
            title='Ceremonial exception handling'
            description='The most important status code in enterprise software remains in ceremonial service.'
          >
            <div className={styles.teapotPanel}>
              <div className={styles.teapotHeader}>
                <StatusBadge label={teapotStatusLabel} tone='policy' />
                <p className={styles.teapotNarrative}>{topLevelTeapotMusing}</p>
              </div>

              <FactList
                items={[
                  {
                    label: 'Narrative wisdom',
                    note: 'Returned by the system narrative layer.',
                    value: narrativeTeapotWisdom,
                  },
                  {
                    label: 'Dedicated musing',
                    note: 'Returned by the teapot payload itself.',
                    value: topLevelTeapotMusing,
                  },
                ]}
              />
            </div>
          </SectionFrame>

          <SectionFrame
            className={styles.span12}
            eyebrow='Observability ledger'
            title='Runtime evidence'
            description='The measurable evidence beneath the front-end polish.'
          >
            <div className={styles.observabilityGrid}>
              {observabilityMetrics.map((metric) => (
                <MetricTile key={metric.label} {...metric} />
              ))}
            </div>

            <details className={styles.drawer}>
              <summary className={styles.drawerSummary}>Inspect raw orchestration metadata</summary>
              <pre className={styles.payload}>{JSON.stringify(resolvedMetadata, null, 2)}</pre>
            </details>
          </SectionFrame>
        </section>
      </div>
    </main>
  );
}
