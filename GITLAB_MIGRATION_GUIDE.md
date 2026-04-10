# Cost-Controlled GitLab CI/CD Setup

## Overview

This guide describes how to use GitLab CI/CD for HelloWorld Enterprise without accidentally triggering provider billing. Pricing and free-tier terms change, so this repository keeps GitLab CI opt-in by default.

The current `.gitlab-ci.yml` will not run automatically unless the GitLab variable `RUN_COMPLIANCE_CI` is set to `true`.

## Recommended Default

- Keep GitHub and GitLab as source-control mirrors.
- Run local checks before pushing:

```bash
npm run compliance:check
node services/api-gateway/smoke-test.js
```

- Use provider-managed deploys, such as Railway for backend services and Vercel for the frontend, only when you have confirmed billing and quotas.
- Enable GitLab CI only for branches or projects where minutes and deployment costs are intentionally approved.

## Enabling GitLab CI Intentionally

In GitLab project settings, add this CI/CD variable only when you want the pipeline to run:

| Variable | Value | Purpose |
|----------|-------|---------|
| `RUN_COMPLIANCE_CI` | `true` | Allows `.gitlab-ci.yml` to run |

If deploying through the included GitLab jobs, configure only the tokens you actually use:

| Variable | Description |
|----------|-------------|
| `RAILWAY_TOKEN_PRIMARY` | Railway project token for primary backend services |
| `RAILWAY_TOKEN_SECONDARY` | Railway project token for secondary backend services |
| `RAILWAY_TOKEN_TERTIARY` | Railway project token for tertiary backend services |
| `VERCEL_TOKEN` | Vercel deployment token |
| `NETLIFY_AUTH_TOKEN` | Netlify token only if using the optional Netlify path |
| `GEMINI_API_KEY` | Optional AI provider key |

## Backend Platform Notes

Railway, Vercel, Netlify, GitLab, GitHub, and Google Cloud can all change pricing, quotas, and product limits. Before enabling automation:

1. Confirm current pricing in the provider dashboard.
2. Set spending alerts or hard limits where available.
3. Use least-privilege deployment tokens.
4. Store secrets as masked CI/CD variables or platform secrets.
5. Disable unused deploy jobs and tokens.

## Manual Deployment Flow

If you want to avoid CI minutes entirely:

1. Deploy backend services through the Railway dashboard or Railway CLI.
2. Set downstream service URLs on the `api-gateway` service.
3. Set `API_GATEWAY_ORIGIN` in Vercel.
4. Run smoke checks against the deployed gateway:

```bash
curl -fsS "$API_GATEWAY_URL/health"
curl -fsS -H "Content-Type: application/json" \
  -d '{"recipient":"World","channel":"web","locale":"en-US","preferredGreeting":"auto"}' \
  "$API_GATEWAY_URL/api/greet"
```

## GitLab Pipeline Stages

When explicitly enabled, the GitLab pipeline can:

- validate repository compliance checks
- build backend service images
- deploy backend services
- smoke test the deployed gateway
- deploy the frontend through configured providers

Treat this as an intentional production automation path, not a free default.

## Rollback Plan

If a pipeline or deploy causes billing or deployment problems:

1. Remove or unset `RUN_COMPLIANCE_CI`.
2. Revoke unused deploy tokens.
3. Disable provider-side automatic deploy hooks.
4. Roll back to the last known-good Railway or Vercel deployment.
5. Record the incident and follow-up action in `INCIDENT_REPORTS/` or your incident tracker.
