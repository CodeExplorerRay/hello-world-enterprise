# Platform Controls Checklist

These controls cannot be fully enforced from repository code because they live in GitHub, GitLab, Railway, Vercel, Google Cloud, or the organization account settings. Use this checklist before treating the app as production-ready.

## Source Control

- Protect `master` from direct pushes.
- Require at least one review before merge.
- Require status checks only after a billing-approved CI runner is available.
- Enable provider-native secret scanning where available.
- Enable dependency vulnerability alerts where available.
- Restrict repository admin access to maintainers who need it.

## CI And Billing

- Keep GitHub Actions manual-only unless a budget owner approves automatic runs.
- Keep GitLab CI disabled unless `RUN_COMPLIANCE_CI=true` is intentionally set.
- Configure spending alerts in every provider account used by the project.
- Disable unused deployment hooks and webhooks.
- Review CI minutes and build minutes weekly while automation is enabled.

## Secrets

- Store deploy tokens in provider secret stores, not local files.
- Mask CI variables that contain tokens or API keys.
- Scope deployment tokens to the minimum project and environment.
- Rotate tokens after staff changes, suspected exposure, or provider incidents.
- Remove stale tokens for providers that are no longer part of the deployment path.

## Runtime Access

- Keep only the frontend and `api-gateway` public.
- Keep downstream services private or protected by authenticated service-to-service access.
- Confirm `API_GATEWAY_API_KEY` is set when direct API access should be restricted.
- Confirm `API_GATEWAY_ALLOWED_ORIGINS` matches the live frontend domains.
- Confirm `GCP_SERVICE_TO_SERVICE_AUTH=true` when using authenticated Cloud Run downstream services.

## Deployment Verification

- Run `npm run compliance:check` before release.
- Run `node services/api-gateway/smoke-test.js` before release.
- Run `npm run containers:build` after Docker Desktop or the Docker daemon is available.
- Smoke test the live gateway after deployment:

```bash
curl -fsS "$API_GATEWAY_URL/health"
curl -fsS -H "Content-Type: application/json" \
  -d '{"recipient":"World","channel":"web","locale":"en-US","preferredGreeting":"auto"}' \
  "$API_GATEWAY_URL/api/greet"
```

## Incident Readiness

- Assign an owner for vulnerability intake.
- Decide where private vulnerability reports should be sent.
- Record material incidents in `INCIDENT_REPORTS/` or the team incident tracker.
- Confirm credential rotation steps are documented for every active provider.
- Confirm rollback steps are known for Railway, Vercel, and any Cloud Run deployment.
