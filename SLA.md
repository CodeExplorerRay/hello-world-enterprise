# Service Level Agreement (SLA)

## Overview

This Service Level Agreement ("SLA") governs the use of Hello World Enterprise Edition ("Service") provided by CodeExplorerRay ("Provider").

**Effective Date**: April 2, 2026

## Service Availability

### Uptime Guarantee
- **Target Availability**: 99.9% uptime
- **Measurement Period**: Monthly
- **Excluded Downtime**: Scheduled maintenance, force majeure events

### Availability Calculation
```
Availability % = (Total Time - Downtime) / Total Time × 100
```

## Service Level Objectives (SLOs)

### Response Time
- **API Response Time**: < 30 seconds for greeting generation
- **Page Load Time**: < 5 seconds for frontend rendering

### Error Rates
- **API Error Rate**: < 0.1% of requests
- **Frontend Error Rate**: < 0.01% of page loads

## Service Credits

If we fail to meet our uptime guarantee, you'll receive service credits as follows:

| Monthly Uptime Percentage | Service Credit |
|---------------------------|----------------|
| 99.0% - 99.9%            | 10%            |
| 95.0% - 98.9%            | 25%            |
| < 95.0%                  | 50%            |

### How to Claim Credits
- Credits are applied as a discount on future usage
- Must be claimed within 30 days of the incident
- Requires documented evidence of the outage
- If no billable usage exists, the customer is entitled to a formal written apology and a solemn commitment to do better next sprint

## Maintenance Windows

### Scheduled Maintenance
- **Frequency**: Bi-weekly
- **Duration**: Maximum 4 hours per window
- **Notification**: 48 hours advance notice via GitHub issues
- **Time Windows**: Tuesdays 2:00 AM - 6:00 AM UTC

## Incident Response

### Severity Levels

| Severity | Description | Response Time | Resolution Time |
|----------|-------------|---------------|-----------------|
| Critical | Service completely down | < 15 minutes | < 1 hour |
| High | Major functionality impaired | < 30 minutes | < 4 hours |
| Medium | Minor functionality issues | < 2 hours | < 24 hours |
| Low | Cosmetic issues | < 24 hours | < 1 week |

### Communication
- Status updates via GitHub Issues
- Incident postmortem reports within 5 business days

## Exclusions

This SLA does not apply to:
- Beta features or services
- Third-party integrations (Gemini API, etc.)
- Issues caused by user error
- Force majeure events
- Scheduled maintenance

## Termination

Either party may terminate this SLA with 30 days written notice.

## Contact Information

For SLA-related inquiries:
- **Email**: sla@helloworld-enterprise.example.com
- **GitHub Issues**: Use the "SLA" label

## Disclaimer

This SLA is provided for demonstration purposes only. In a real enterprise environment, SLAs would include:
- Financial penalties
- Detailed measurement methodologies
- Escalation procedures
- Legal recourse options

The "Hello World" service has never actually failed, so we've never had to test this SLA.
