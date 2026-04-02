# Incident Report: INC-001

## Summary

On April 1, 2026, at 14:23 UTC, the HelloWorld Enterprise greeting service returned "Hi World" instead of the expected "Hello World".

## Impact

- Severity: Low
- Affected Users: 1 (internal testing)
- Duration: 5 minutes
- Business Impact: Mild confusion during demo

## Timeline

- 14:20: Feature flag for greeting variation enabled in production
- 14:23: User reports incorrect greeting
- 14:25: Incident declared
- 14:28: Feature flag rolled back
- 14:30: Service restored

## Root Cause

The feature flag "greeting-style" was set to "Hi" without proper A/B testing validation. The flag was approved through the fast-track process without staging verification.

## Resolution

- Immediately rolled back the feature flag to default "Hello"
- Added additional validation in the feature flag service
- Updated on-call runbook to include feature flag monitoring

## Lessons Learned

- Always validate feature flags in staging for at least 24 hours
- Add monitoring alerts for unexpected greeting variations
- Consider adding circuit breakers for AI decision engine

## Action Items

- [ ] Implement feature flag validation in CI/CD
- [ ] Add greeting monitoring dashboard
- [ ] Train team on feature flag best practices
- [ ] Schedule post-mortem meeting (already held)