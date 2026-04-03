const fs = require("fs");
const path = require("path");
const {
  adrTopics,
} = require("../services/ai-decision-engine/prompts/promptRegistry");

const OFFLINE = process.argv.includes("--offline");
const OUTPUT_DIR = path.join(__dirname, "..", "ARCHITECTURE_DECISION_RECORDS");

function slugify(value) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function relatedAdrs(index) {
  const first = String(Math.max(1, index)).padStart(3, "0");
  const second = String(Math.min(47, index + 2)).padStart(3, "0");
  return [`ADR-${first}`, `ADR-${second}`];
}

function buildOfflineAdr(number, topic) {
  const padded = String(number).padStart(3, "0");
  const today = new Date().toISOString().slice(0, 10);
  const [relatedA, relatedB] = relatedAdrs(number);

  return `# ADR-${padded}: ${topic}

## Status
Accepted

## Date
${today}

## Context
HelloWorld Enterprise exists to display "Hello World" on a webpage, but the organization has elected to treat this responsibility as if it were a multinational critical platform. This has resulted in nine microservices, six programming languages, an AI greeting authority, and a teapot-based health check that is technically standards-compliant and strategically unhelpful.

The topic of "${topic}" emerged because leadership concluded that even a small greeting platform deserves governance artifacts, committee review, and a persuasive amount of architectural theater. Documenting this decision allows future engineers to understand not just what we chose, but how seriously we were willing to overthink it.

## Decision
We will adopt "${topic}" as a formally governed architectural position within the HelloWorld Enterprise platform. This decision is to be treated as foundational to the long-term safety, scalability, and emotional stability of the greeting pipeline, regardless of how suspiciously small the actual product surface may appear.

## Consequences

### Positive
- The architecture remains consistent with the organization's preference for highly ceremonial technical decisions.
- Future contributors inherit a written rationale instead of relying on hallway folklore and slide decks.
- Stakeholders can point to a durable record whenever someone suggests replacing this with a simple function call.

### Negative
- The operational overhead of maintaining this decision may exceed the business value of the greeting itself.
- Engineers may spend more time citing the ADR than implementing the underlying behavior.
- Governance enthusiasm may encourage additional committees with increasingly specific charters.

### Risks
- A competing school of thought could reopen the debate and trigger a multi-quarter review cycle for a problem that still fits on one screen.
- Excessive confidence in the ADR corpus could lead leadership to believe the system is more battle-tested than it really is.

## Related ADRs
- ${relatedA}
- ${relatedB}

## Approved By
- Enterprise Greeting Architecture Review Board
- Cross-Functional Microservice Stewardship Council
- The Strategic Punctuation and Messaging Committee
`;
}

async function callGemini(topic, number) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || OFFLINE) {
    return null;
  }

  const prompt = `Write Architecture Decision Record #${number} for the following topic:

Topic: "${topic}"

Context for this ADR:
- Our application displays "Hello World" on a webpage
- We have 9 microservices across 6 programming languages
- We use Gemini AI to decide the greeting word
- Our health check is an HTCPCP teapot that returns HTTP 418
- We have an A/B test running on whether to use "!" or "."
- We deployed everything on Google Cloud Run
- We take everything extremely seriously

Write the ADR in markdown with the sections Title, Status, Date, Context, Decision, Consequences, Related ADRs, and Approved By.`;

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
          text: "You are the Chief Architect at HelloWorld Enterprise. You write Architecture Decision Records with extreme seriousness and corporate formality, despite the fact that every decision is absurdly over-engineered for such a trivial application. Respond in valid markdown format.",
        }],
      },
    }),
  });

  if (!response.ok) {
    throw new Error(`Gemini ADR generation failed with status ${response.status}`);
  }

  const payload = await response.json();
  return payload.candidates?.[0]?.content?.parts?.[0]?.text || null;
}

async function main() {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });

  for (let index = 0; index < adrTopics.length; index += 1) {
    const number = index + 1;
    const topic = adrTopics[index];
    let content = buildOfflineAdr(number, topic);

    try {
      const generated = await callGemini(topic, number);
      if (generated) {
        content = generated;
      }
    } catch (error) {
      content = `${content}\n<!-- Offline fallback used: ${error.message} -->\n`;
    }

    const fileName = `ADR-${String(number).padStart(3, "0")}-${slugify(topic)}.md`;
    fs.writeFileSync(path.join(OUTPUT_DIR, fileName), `${content.trim()}\n`);
    console.log(`Generated ${fileName}`);
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
