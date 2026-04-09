'use client';

import { Fragment, startTransition, useEffect, useRef, useState, type ReactNode } from 'react';
import styles from './page.module.css';

type GreetingDecision = {
  reason?: string;
  source?: string;
  word?: string;
};

type FeatureFlag = {
  approvedBy?: string;
  changeRequestId?: string;
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
type RequestMode = 'canonical' | 'ai-preview';

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

const serviceChain = [
  { id: 'gateway', name: 'API Gateway', tech: 'Node' },
  { id: 'flags', name: 'Feature Flags', tech: 'Node' },
  { id: 'ai', name: 'AI Decision', tech: 'Gemini' },
  { id: 'caps', name: 'Capitalization', tech: 'Spring' },
  { id: 'concat', name: 'Concatenation', tech: '.NET' },
  { id: 'punct', name: 'Punctuation', tech: 'Rust' },
  { id: 'teapot', name: 'Teapot Health', tech: 'Go' },
];

const serviceTechnologyCount = new Set(serviceChain.map((service) => service.tech)).size;

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
      return 'Canonical Homepage Policy';
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
      return 'policy';
    default:
      return 'neutral';
  }
}

function isFlagEnabled(value?: boolean | string | null) {
  return value === true || value === 'true';
}

function formatOptionalValue(value?: boolean | string | number | null) {
  if (value === undefined) return 'Unavailable';
  if (value === null) return 'None';
  if (typeof value === 'boolean') return value ? 'True' : 'False';
  if (value === '') return 'Empty';
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

function ServiceFlowVisualization({
  architectureDecisionRecordsConsulted,
  greetingTone,
  microservicesInvoked,
  teapotStatus,
}: {
  architectureDecisionRecordsConsulted: number;
  greetingTone: Tone;
  microservicesInvoked: number;
  teapotStatus: number;
}) {
  const activeCount = Math.max(0, Math.min(microservicesInvoked, serviceChain.length));
  const isFallback = greetingTone === 'fallback';
  const isError = activeCount === 0;

  return (
    <section className={styles.serviceFlowFrame}>
      <div className={styles.serviceFlowHeader}>
        <div>
          <p className={styles.eyebrow}>Service mesh</p>
          <h2 className={styles.sectionTitle}>Request flow visualization</h2>
        </div>
        <span className={styles.serviceFlowCount}>{activeCount} / {serviceChain.length} services</span>
      </div>

      <div className={styles.serviceFlowNodes}>
        {serviceChain.map((svc, i) => {
          const isActive = i < activeCount;
          const isTeapot = svc.id === 'teapot';
          const dotClass = isError
            ? styles.svcDot
            : isTeapot && isActive
              ? styles.svcDotSpecial
              : isActive && isFallback
                  ? styles.svcDotFallback
                  : isActive
                    ? styles.svcDotActive
                    : styles.svcDot;
          const nameClass = isActive ? styles.svcNameActive : '';
          const connectorClass = i < activeCount - 1
            ? isFallback
              ? styles.svcConnectorFallback
              : styles.svcConnectorActive
            : '';

          return (
            <Fragment key={svc.id}>
              <div className={styles.svcNode}>
                <div className={cx(styles.svcDot, dotClass)} />
                <span className={cx(styles.svcName, nameClass)}>{svc.name}</span>
                <span className={styles.svcTech}>{svc.tech}</span>
              </div>
              {i < serviceChain.length - 1 && (
                <div className={cx(styles.svcConnector, connectorClass)} />
              )}
            </Fragment>
          );
        })}
      </div>

      <div className={styles.serviceFlowStats}>
        <div className={styles.flowStat}>
          <span className={styles.flowStatValue}>{activeCount}</span>
          <span className={styles.flowStatLabel}>Services invoked</span>
        </div>
        <div className={styles.flowStat}>
          <span className={styles.flowStatValue}>{serviceTechnologyCount}</span>
          <span className={styles.flowStatLabel}>Technologies involved</span>
        </div>
        <div className={styles.flowStat}>
          <span className={styles.flowStatValue}>{architectureDecisionRecordsConsulted}</span>
          <span className={styles.flowStatLabel}>ADRs consulted</span>
        </div>
        <div className={styles.flowStat}>
          <span className={styles.flowStatValue} style={{ color: 'var(--rose)' }}>{teapotStatus}</span>
          <span className={styles.flowStatLabel}>Teapot status</span>
        </div>
      </div>
    </section>
  );
}

export default function Home() {
  const [greeting, setGreeting] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingStage, setLoadingStage] = useState(loadingStages[0]);
  const [metadata, setMetadata] = useState<MetadataPayload | null>(null);
  const [requestMode, setRequestMode] = useState<RequestMode>('canonical');
  const [refreshingMode, setRefreshingMode] = useState<RequestMode | null>(null);
  const requestControllerRef = useRef<AbortController | null>(null);
  const loadingStageIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  async function requestGreeting(mode: RequestMode, options?: { initial?: boolean }) {
    const isInitial = Boolean(options?.initial);
    const controller = new AbortController();
    const payload = {
      channel: 'web',
      locale: 'en-US',
      preferredGreeting: mode === 'canonical' ? 'hello' : 'auto',
      recipient: 'World',
      userId: mode === 'canonical' ? 'homepage-canonical' : 'homepage-ai-preview',
    };

    requestControllerRef.current?.abort();
    requestControllerRef.current = controller;

    if (!isInitial) {
      setRefreshingMode(mode);
    }

    try {
      const response = await fetch('/api/greet', {
        method: 'POST',
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json() as GreetingApiResponse;
      if (controller.signal.aborted) {
        return;
      }

      startTransition(() => {
        setGreeting(data.greeting || 'Hello World!');
        setMetadata(data.metadata || {});
        setRequestMode(mode);
        setLoading(false);
      });
    } catch (error: unknown) {
      if (controller.signal.aborted) {
        return;
      }

      console.error('API fetch failed:', error);
      startTransition(() => {
        setGreeting('Hello World!');
        setMetadata(buildFallbackMetadata());
        setRequestMode(mode);
        setLoading(false);
      });
    } finally {
      if (loadingStageIntervalRef.current) {
        clearInterval(loadingStageIntervalRef.current);
        loadingStageIntervalRef.current = null;
      }
      if (requestControllerRef.current === controller) {
        requestControllerRef.current = null;
      }
      if (!controller.signal.aborted) {
        setRefreshingMode(null);
      }
    }
  }

  useEffect(() => {
    let stageIndex = 1;

    loadingStageIntervalRef.current = setInterval(() => {
      setLoadingStage(loadingStages[stageIndex % loadingStages.length]);
      stageIndex += 1;
    }, 700);

    void requestGreeting('canonical', { initial: true });

    return () => {
      requestControllerRef.current?.abort();
      if (loadingStageIntervalRef.current) {
        clearInterval(loadingStageIntervalRef.current);
        loadingStageIntervalRef.current = null;
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
  const operatingMode = requestMode === 'canonical'
    ? 'Compliance-approved baseline'
    : showLiveAiPanel
      ? 'Live AI routing'
      : showAiFallbackPanel
        ? 'Fallback AI routing'
        : greetingTone === 'policy'
          ? 'Policy-governed path'
          : resolvedMetadata.error
            ? 'Emergency fallback'
            : 'AI preview';
  const executiveSource = humanizeSource(decision?.source);
  const heroNarrative = requestMode === 'canonical'
    ? 'The homepage intentionally opens on the canonical Hello World baseline because it is the lowest-risk, board-friendly greeting. AI routing stays visible in the governance panels and can be previewed on demand without changing the approved default.'
    : decision?.reason ||
      'The AI preview completed without returning an explicit routing rationale.';
  const boardPosture =
    requestMode === 'canonical'
      ? 'Yes. Canonical Hello World is the continuity-plan greeting and remains approved for first render.'
      : aiDecision?.boardApproval || 'No board directive was attached to this request.';
  const confidenceLabel =
    showLiveAiPanel || showAiFallbackPanel ? `${aiDecision?.confidence ?? 0}%` : 'N/A';
  const riskLabel =
    requestMode === 'canonical'
      ? 'Low'
      : showLiveAiPanel || showAiFallbackPanel
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
  const approvalAuthority =
    greetingWordFlag?.approvedBy ||
    aiFlag?.approvedBy ||
    'Mock Architecture Review Board';
  const changeRequestLabel =
    greetingWordFlag?.changeRequestId ||
    aiFlag?.changeRequestId ||
    'Unavailable';
  const teapotComplianceLabel =
    (resolvedMetadata.teapotStatus ?? 418) === 418
      ? 'RFC 2324 aligned'
      : 'Protocol drift detected';
  const complianceStatus = requestMode === 'canonical'
    ? 'Approved'
    : showLiveAiPanel || showAiFallbackPanel
      ? 'Conditional review'
      : resolvedMetadata.error
        ? 'Fallback controls'
        : 'Governed';
  const actionLabel = requestMode === 'canonical'
    ? 'Preview live AI routing'
    : 'Restore canonical Hello World';
  const actionMode: RequestMode = requestMode === 'canonical' ? 'ai-preview' : 'canonical';
  const actionNote = requestMode === 'canonical'
    ? 'This runs one live AI-selected request without changing the approved homepage baseline.'
    : 'Return to the intentionally boring baseline that judges will see first.';

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

  const complianceRows: DetailRow[] = [
    {
      label: 'Compliance posture',
      note: 'How the homepage should be interpreted from a governance standpoint.',
      value: requestMode === 'canonical'
        ? 'Approved baseline for first render'
        : 'Preview mode with discretionary AI involvement',
    },
    {
      label: 'Approval authority',
      note: 'The authority currently backing the greeting control path.',
      value: approvalAuthority,
    },
    {
      label: 'Change request',
      note: 'Mock governance ticket associated with the active control set.',
      value: changeRequestLabel,
    },
    {
      label: 'Risk posture',
      note: 'The currently reported or inferred operational risk for this mode.',
      value: riskLabel,
    },
    {
      label: 'Standards check',
      note: 'Ceremonial teapot protocol doubles as a standards sanity check.',
      value: teapotComplianceLabel,
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

        <section className={styles.heroFrame}>
          <div className={styles.heroHeaderRow}>
            <div>
              <p className={styles.heroKicker}>Live orchestration outcome</p>
              <h2 className={styles.heroDisplay}>
                <span className={styles.heroGlow} />
                {resolvedGreeting}
              </h2>
            </div>

            <div className={styles.heroStamp}>
              <span className={styles.heroStampLabel}>Routing authority</span>
              <strong className={styles.heroStampValue}>{executiveSource}</strong>
            </div>
          </div>

          <p className={styles.heroNarrative}>
            {heroNarrative}
          </p>

          <div className={styles.heroActions}>
            <button
              type='button'
              className={styles.heroAction}
              disabled={Boolean(refreshingMode)}
              onClick={() => {
                void requestGreeting(actionMode);
              }}
            >
              {refreshingMode === actionMode ? 'Refreshing...' : actionLabel}
            </button>
            <p className={styles.heroActionNote}>{actionNote}</p>
          </div>

          <div className={styles.heroMetricGrid}>
            {heroMetrics.map((metric) => (
              <MetricTile key={metric.label} {...metric} />
            ))}
          </div>
        </section>

        <ServiceFlowVisualization
          architectureDecisionRecordsConsulted={
            resolvedMetadata.architectureDecisionRecordsConsulted ?? 47
          }
          microservicesInvoked={resolvedMetadata.microservicesInvoked ?? 0}
          greetingTone={greetingTone}
          teapotStatus={resolvedMetadata.teapotStatus ?? 418}
        />

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
            eyebrow='Governance and compliance'
            title='Control and compliance matrix'
            description='Feature controls and compliance evidence are grouped here instead of being scattered across the page.'
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
              <div className={styles.controlChip}>
                <span className={styles.controlChipLabel}>Compliance</span>
                <strong className={styles.controlChipValue}>{complianceStatus}</strong>
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

              <article className={styles.controlCard}>
                <h3 className={styles.inlineTitle}>Compliance evidence</h3>
                <FactList items={complianceRows} />
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
