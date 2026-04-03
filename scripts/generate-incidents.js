const fs = require("fs");
const path = require("path");
const {
  incidentScenarios,
} = require("../services/ai-decision-engine/prompts/promptRegistry");

const OFFLINE = process.argv.includes("--offline");
const OUTPUT_DIR = path.join(__dirname, "..", "INCIDENT_REPORTS");

function slugify(value) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function buildOfflineIncident(scenario) {
  return `# Incident Report: ${scenario.id}

## Summary
${scenario.description} triggered a fully documented operational response despite the fact that the underlying product still only needed to display "Hello World." The incident was handled with admirable seriousness and a mildly disproportionate number of follow-up meetings.

## Severity & Impact
- Severity: ${scenario.severity}
- Duration: ${scenario.duration}
- Users Impacted: 1
- Greetings Lost: 1

## Timeline (all times UTC)
- 14:00 - Monitoring detected unusual greeting behavior.
- 14:01 - On-call engineer acknowledged the alert and opened a bridge call.
- 14:02 - The Greeting Governance Duty Manager declared an incident.
- 14:04 - Initial mitigation options were reviewed against the current ADR catalog.
- 14:06 - Service owners isolated the affected microservice boundary.
- 14:08 - A temporary rollback or fallback greeting policy was applied.
- 14:10 - Validation confirmed the greeting pathway had stabilized.
- 14:12 - Stakeholders were notified that the user experience had returned to acceptable dramatic levels.

## Root Cause Analysis
The platform experienced the following incident: ${scenario.description}. In practical terms, the system delivered a trivial defect. In organizational terms, the event intersected with feature flags, AI guidance, punctuation governance, and teapot observability, which created the appearance of a broad multi-service reliability event.

The immediate fault condition was amplified by process overhead. Because HelloWorld Enterprise routes a simple greeting through multiple independently governable services, a minor output deviation was able to accumulate enough procedural weight to justify incident status, stakeholder escalation, and a written narrative of unusual length.

## Resolution
The response team restored the approved greeting behavior, verified the output pathway, and documented the corrective action so that future greeting disturbances can be handled with even more institutional confidence.

## Action Items
| ID | Action | Owner | Priority | Status |
|----|--------|-------|----------|--------|
| AI-001 | Add stronger validation around approved greeting outputs | AI Platform | High | Open |
| OBS-002 | Expand dashboard coverage for punctuation and tone anomalies | Observability | Medium | Open |
| GOV-003 | Require explicit approval for casual greeting changes | Governance Board | High | Open |
| RUN-004 | Update runbook to include this failure mode | SRE | Medium | Open |
| QA-005 | Add a regression test covering the exact incident scenario | QA | High | Open |

## Lessons Learned

### What went well
- The teapot service remained emotionally consistent throughout the incident.
- The rollback path was available and well understood.
- Stakeholders were informed quickly, even if they would have preferred fewer messages.

### What went wrong
- A tiny output deviation was able to escalate into a full incident posture.
- Guardrails around greeting policy remain more aspirational than automatic.
- The system still generates too much ceremony for too little text.

### Where we got lucky
- Only one user observed the incident directly.
- The defect was embarrassing rather than destructive.

## Supporting Data
- Impact statement: ${scenario.impact}
- Deployment model: Google Cloud Run
- System context: 9 microservices, Gemini AI, HTCPCP teapot health check
`;
}

async function callGemini(scenario) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || OFFLINE) {
    return null;
  }

  const prompt = `Write a detailed incident report for the following scenario:

Incident: "${scenario.description}"

Details:
- Severity: ${scenario.severity}
- Duration: ${scenario.duration}
- Impact: ${scenario.impact}
- Our system: 9 microservices, Gemini AI, HTCPCP teapot health check
- Deployment: Google Cloud Run

Use a Google-style SRE postmortem format in markdown.`;

  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-lite-latest:generateContent?key=${apiKey}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        maxOutputTokens: 2048,
        temperature: 1.0,
        topP: 0.9,
      },
      systemInstruction: {
        parts: [{
          text: "You are the Site Reliability Engineer at HelloWorld Enterprise. You write incident postmortems with the seriousness of a major cloud provider's outage report, except every incident is about a trivial issue with a Hello World application. Write in markdown format.",
        }],
      },
    }),
  });

  if (!response.ok) {
    throw new Error(`Gemini incident generation failed with status ${response.status}`);
  }

  const payload = await response.json();
  return payload.candidates?.[0]?.content?.parts?.[0]?.text || null;
}

async function main() {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });

  for (const scenario of incidentScenarios) {
    let content = buildOfflineIncident(scenario);

    try {
      const generated = await callGemini(scenario);
      if (generated) {
        content = generated;
      }
    } catch (error) {
      content = `${content}\n<!-- Offline fallback used: ${error.message} -->\n`;
    }

    const fileName = `${scenario.id}-${slugify(scenario.description)}.md`;
    fs.writeFileSync(path.join(OUTPUT_DIR, fileName), `${content.trim()}\n`);
    console.log(`Generated ${fileName}`);
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
