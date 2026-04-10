# Production Compliance Baseline

This repository implements a practical production-grade baseline for a small public web app with backend services. It is not a certification package for SOC 2, ISO 27001, HIPAA, PCI DSS, or GDPR.

## Repository Controls

- Source control excludes local secrets, dependency directories, and build outputs.
- `scripts/compliance-check.js` blocks tracked or unignored `.env`, `node_modules`, `.next`, and common secret patterns.
- GitHub and GitLab validation jobs run syntax checks plus the repository compliance check.
- `SECURITY.md` defines vulnerability reporting expectations and incident handling guidance.

## Application Controls

- `services/api-gateway` is the supported public backend entry point.
- API gateway CORS defaults are explicit and configurable.
- `/api/*` routes can require `X-API-Key` when `API_GATEWAY_API_KEY` is set.
- Gateway-to-service Cloud Run identity tokens can be enabled with `GCP_SERVICE_TO_SERVICE_AUTH=true`.
- Local fallback behavior remains deterministic so unavailable downstream services do not expose stack traces to visitors.

## Container Controls

- Docker build contexts exclude local dependencies, build outputs, and environment files.
- Node images install dependencies from lockfiles with `npm ci`.
- Service containers run as non-root users where supported by the base image.

## Deployment Controls

- Cloud Run guidance keeps only `api-gateway` public and deploys downstream services with authenticated access.
- Production secrets must be supplied through platform secret management, not source files or CI logs.
- Runtime service identities should be least-privilege and scoped to the minimum services they invoke.

## Operator Responsibilities

- Enable provider-native secret scanning and dependency scanning in the hosting organization.
- Review and rotate production secrets on staff changes, suspected exposure, or vendor key rollover.
- Protect production branches with reviews and required checks before merging.
- Keep deployment credentials out of local `.env` files whenever a managed secret store is available.
- Capture incident records under `INCIDENT_REPORTS/` or the team incident tracker after material events.
