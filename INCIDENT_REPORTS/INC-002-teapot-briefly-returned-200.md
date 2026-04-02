# Incident Report: INC-002

## Summary

On April 2, 2026, at 15:30 UTC, the HTCPCP Teapot Health Check Service briefly returned HTTP 200 "OK" instead of the correct HTTP 418 "I'm a teapot".

## Impact

- Severity: Medium
- Affected Systems: Health monitoring dashboards
- Duration: 2 minutes
- Business Impact: Incorrect health status displayed, potential false positive in monitoring

## Timeline

- 15:28: Deployment of new teapot service version
- 15:30: Health check returns 200 instead of 418
- 15:32: Issue detected by monitoring alert
- 15:34: Service rolled back to previous version

## Root Cause

A code change in the health check endpoint accidentally set the status code to 200 during a refactoring. The developer forgot to update the status code back to 418 after testing.

## Resolution

- Immediate rollback to the previous version
- Code review implemented to prevent status code changes without explicit approval
- Added unit tests for all HTTP status codes

## Lessons Learned

- Always test HTTP status codes in integration tests
- Implement code reviews for any changes to status codes
- Add monitoring alerts for unexpected status codes from health endpoints

## Action Items

- [x] Rollback deployment
- [x] Add unit tests for status codes
- [x] Implement code review policy for HTTP responses
- [ ] Schedule training on RFC 2324 compliance