# Security Policy

## Scope

This repository is intended to meet a normal production-grade engineering baseline for:

- source control hygiene
- secrets handling
- authenticated production access
- dependency and artifact hygiene
- documented incident reporting

This is not a formal certification statement for SOC 2, ISO 27001, HIPAA, PCI DSS, or GDPR. Those programs require infrastructure, process, legal, and evidence reviews outside the repository itself.

## Supported Deployment Model

The supported internet-facing production model is:

- `services/frontend` exposed to end users
- `services/api-gateway` exposed to end users
- downstream backend services reachable only through private networking or authenticated service-to-service calls

Direct public exposure of internal backend services is not considered a hardened production deployment.

## Reporting a Vulnerability

Please do not open public issues for suspected secrets exposure, authentication bypasses, or remotely exploitable vulnerabilities.

Report findings privately to the repository maintainers with:

- affected file or endpoint
- reproduction steps
- impact assessment
- proposed mitigation if available

If the issue involves exposed credentials:

1. rotate the credential immediately
2. remove the credential from source control and CI logs
3. document the rotation in the incident record

## Repository Controls

The repository baseline expects:

- no tracked `.env` files
- no tracked `node_modules` or build artifacts
- gateway hardening for CORS, request size limits, and security headers
- optional API key enforcement for `/api/*` via `API_GATEWAY_API_KEY`
- local and opt-in CI policy checks for tracked-file hygiene and secret-pattern detection

## Deployment Controls

Production deployments should use:

- environment-scoped secrets management
- least-privilege service identities
- authenticated service-to-service calls for private backend services
- one public backend entry point
- change-reviewed and reproducible container images

## Incident Handling

Severity guidelines:

- Critical: remote code execution, auth bypass, credential exposure, public data exposure
- High: public internal service exposure, missing authentication on sensitive paths, persistent secret leakage
- Medium: documentation drift, missing hardening headers, weak container defaults
- Low: policy gaps that do not directly expose systems

For material incidents:

1. contain exposure
2. rotate affected credentials
3. restore a safe deployment state
4. capture root cause and remediation actions
5. add or update automated checks to prevent recurrence
