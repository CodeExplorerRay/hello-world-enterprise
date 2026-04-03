const fs = require("fs");
const path = require("path");

const OFFLINE = process.argv.includes("--offline");
const OUTPUT_FILE = path.join(__dirname, "..", "SECURITY.md");

function buildOfflineSecurityAudit() {
  return `# Security Audit Report

## Executive Summary
This report documents a comprehensive security assessment of HelloWorld Enterprise, a platform that displays "Hello World" through nine microservices with a level of operational seriousness normally reserved for much larger problems. The system does not present a proportionate threat surface relative to its purpose, but it does provide an impressive number of places in which governance, configuration drift, or greeting-based confusion could occur.

## Threat Model
- External users attempting to coerce the platform into displaying an unauthorized greeting.
- Malicious insiders changing punctuation policy without proper committee approval.
- Service-to-service failures that could degrade the integrity of the final rendered greeting.
- Overly confident stakeholders making production decisions from statistically meaningless experiments.

## Vulnerability Findings

### CVE-HELLO-001: Greeting Injection
- Severity: 7.1 HIGH
- Description: An attacker could theoretically influence the greeting word and replace "Hello" with an unauthorized alternative such as "Goodbye," causing user confusion and possible executive alarm.

### CVE-HELLO-002: Punctuation Escalation
- Severity: 5.4 MEDIUM
- Description: Inadequate governance around "!" versus "." could allow emotionally elevated output without full board approval.

### CVE-HELLO-003: Teapot Identity Drift
- Severity: 8.0 HIGH
- Description: If the teapot health endpoint ever returns 200, downstream systems may mistake principled refusal for ordinary availability.

### CVE-HELLO-004: Casual Greeting Privilege Escalation
- Severity: 6.8 MEDIUM
- Description: A misconfigured feature flag could promote "Hi" or "Hey" into enterprise contexts where "Hello" is the sanctioned default.

### CVE-HELLO-005: Statistical Confidence Laundering
- Severity: 4.9 MEDIUM
- Description: Tiny sample sizes may be presented as meaningful evidence, increasing the likelihood of punctuation policy based on decorative analytics.

### CVE-HELLO-006: Microservice Ceremony Amplification
- Severity: 6.1 MEDIUM
- Description: The sheer number of services expands the blast radius for a defect that could otherwise be handled with a string literal.

### CVE-HELLO-007: AI Tone Drift
- Severity: 7.6 HIGH
- Description: Generative output could recommend a greeting outside approved governance boundaries if validation is not enforced.

### CVE-HELLO-008: Observability-Induced Overconfidence
- Severity: 3.7 LOW
- Description: Rich dashboards may create a false sense of maturity around a workload whose core responsibility remains alarmingly small.

## Recommendations
- Enforce approved greeting allowlists at the orchestration layer.
- Preserve the teapot's 418 identity with explicit regression tests.
- Treat A/B analysis as advisory until sample sizes become credible.
- Limit governance-driven complexity where it does not materially protect greeting integrity.
- Continue documenting risks so future maintainers understand which absurdities are intentional.

## Conclusion
HelloWorld Enterprise is not insecure because it says "Hello World." It is insecure in the far more interesting way that only an over-architected system can be: by transforming a trivial requirement into a distributed collection of plausible-but-ridiculous failure modes. With the recommended controls in place, the platform can continue to greet users with confidence, ceremony, and only moderate existential exposure.
`;
}

async function callGemini() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || OFFLINE) {
    return null;
  }

  const prompt = `You are a cybersecurity auditor who has been hired to perform a comprehensive security assessment of HelloWorld Enterprise, an application that displays "Hello World" using 9 microservices.

Write a formal security audit report that takes the security of displaying "Hello World" extremely seriously. Identify at least 8 vulnerabilities that are technically plausible but absurd in context.

Format as a markdown security report with:
- Executive Summary
- Threat Model
- Vulnerability Findings (with CVSS-style severity ratings)
- Recommendations
- Conclusion`;

  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-lite-latest:generateContent?key=${apiKey}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        maxOutputTokens: 2048,
        temperature: 0.8,
        topP: 0.9,
      },
    }),
  });

  if (!response.ok) {
    throw new Error(`Gemini security audit generation failed with status ${response.status}`);
  }

  const payload = await response.json();
  return payload.candidates?.[0]?.content?.parts?.[0]?.text || null;
}

async function main() {
  let content = buildOfflineSecurityAudit();

  try {
    const generated = await callGemini();
    if (generated) {
      content = generated;
    }
  } catch (error) {
    content = `${content}\n<!-- Offline fallback used: ${error.message} -->\n`;
  }

  fs.writeFileSync(OUTPUT_FILE, `${content.trim()}\n`);
  console.log(`Generated ${path.basename(OUTPUT_FILE)}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
