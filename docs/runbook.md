# HelloWorld Enterprise Runbook

## Overview

This runbook provides operational procedures for maintaining the HelloWorld Enterprise greeting infrastructure. Our SLA guarantees 99.9% uptime for displaying "Hello World".

## Table of Contents

1. [Daily Operations](#daily-operations)
2. [Monitoring](#monitoring)
3. [Incident Response](#incident-response)
4. [Deployment Procedures](#deployment-procedures)
5. [Backup & Recovery](#backup--recovery)
6. [Performance Tuning](#performance-tuning)

## Daily Operations

### Morning Check (9:00 AM UTC)

1. **Health Check Verification**
   ```bash
   # Check all services
   curl -I https://api.helloworld-enterprise.com/health
   curl -I https://teapot.helloworld-enterprise.com/health

   # Verify greeting functionality
   curl https://api.helloworld-enterprise.com/api/greet
   ```

2. **Resource Monitoring**
   - Check Cloud Run instance counts
   - Verify CPU/memory usage < 80%
   - Confirm billing is within budget

3. **Log Review**
   - Check for error patterns
   - Verify AI service token usage
   - Confirm rate limiting is working

### Business Hours Monitoring

- Response time alerts: < 30 seconds
- Error rate alerts: < 0.1%
- AI token budget monitoring

## Monitoring

### Key Metrics

#### Application Metrics
- **Greeting Response Time**: Target < 15 seconds (with animation)
- **AI Decision Confidence**: Target > 80%
- **Microservice Availability**: Target 99.9%
- **Rate Limit Hits**: Monitor for abuse

#### Infrastructure Metrics
- **CPU Usage**: Target < 70%
- **Memory Usage**: Target < 80%
- **Request Count**: Monitor trends
- **Error Count**: Alert on > 5/minute

#### Business Metrics
- **Monthly Cost**: Target < $20
- **Token Usage**: Monitor Gemini API costs
- **User Satisfaction**: (Impossible to measure)

### Alert Configuration

#### Critical Alerts (Page immediately)
- Greeting service down
- AI service returning errors
- Teapot returning non-418 status
- Response time > 60 seconds

#### Warning Alerts (Monitor closely)
- Response time > 30 seconds
- Memory usage > 85%
- Token usage > 80% of budget

#### Info Alerts (Log for review)
- New deployment completed
- Configuration changes
- Performance degradation trends

## Incident Response

### Incident Severity Levels

| Level | Description | Response Time | Communication |
|-------|-------------|---------------|---------------|
| P0 | Greeting displays wrong text | 5 minutes | Immediate page + Slack |
| P1 | Greeting takes > 60 seconds | 15 minutes | Slack notification |
| P2 | Teapot returns 200 | 30 minutes | Email stakeholders |
| P3 | Documentation outdated | 4 hours | Internal ticket |

### Response Process

#### 1. Detection
- Monitoring alerts trigger
- User reports via support channels
- Automated health checks fail

#### 2. Assessment (5 minutes)
- Confirm incident scope
- Determine severity level
- Notify on-call engineer

#### 3. Investigation (15 minutes)
- Check service logs
- Verify infrastructure status
- Identify root cause

#### 4. Resolution
- Implement fix or rollback
- Test functionality
- Monitor for 30 minutes

#### 5. Communication
- Update stakeholders
- Document incident
- Schedule post-mortem

### 3 AM Survival Checklist

When "Hello World" goes down at 3 AM:

1. Confirm the greeting is actually wrong and not merely stylistically controversial.
2. Check the API gateway response payload for `orchestrationError`, `featureFlags`, `experiment`, and `aiTokensUsed`.
3. Verify whether Gemini is unavailable, quota limited, or returning malformed output.
4. Confirm the teapot still returns `418`, because if that breaks too the night is cursed.
5. Decide whether to roll back to the fallback greeting path or fix the live service.
6. Write the incident report before coffee wears off.

### Common Issues & Solutions

#### Issue: AI Service Returns Errors
**Symptoms**: Greeting shows fallback text
**Cause**: Gemini API key issues or quota exceeded
**Solution**:
```bash
# Check API key
echo $GEMINI_API_KEY

# Restart AI service
kubectl rollout restart deployment/ai-decision-engine

# Check quota in Google Cloud Console
```

#### Issue: Teapot Returns 200
**Symptoms**: Health checks show 200 OK
**Cause**: Code deployment error
**Solution**:
```bash
# Rollback to previous version
kubectl rollout undo deployment/teapot-service

# Verify RFC 2324 compliance
curl -X BREW https://teapot.helloworld-enterprise.com/brew
```

#### Issue: Slow Response Times
**Symptoms**: Greeting takes > 30 seconds
**Cause**: AI service overloaded or network issues
**Solution**:
```bash
# Scale up AI service
kubectl scale deployment ai-decision-engine --replicas=3

# Check network connectivity
ping api.helloworld-enterprise.com
```

## Deployment Procedures

### Standard Deployment

1. **Pre-deployment Checks**
   ```bash
   # Run tests
   npm test

   # Check linting
   npm run lint

   # Verify build
   npm run build
   ```

2. **Deploy to Staging**
   ```bash
   # Deploy to staging environment
   gcloud run deploy api-gateway-staging --source .
   ```

3. **Staging Testing**
   ```bash
   # Test staging endpoint
   curl https://api-gateway-staging.example.com/api/greet

   # Verify all microservices
   ./test-suite.sh staging
   ```

4. **Production Deployment**
   ```bash
   # Deploy to production
   gcloud run deploy api-gateway --source .

   # Update load balancer
   gcloud compute url-maps update hello-world-lb --default-service api-gateway
   ```

5. **Post-deployment Monitoring**
   - Monitor error rates for 1 hour
   - Verify response times
   - Check log patterns

### Rollback Procedure

```bash
# Immediate rollback
gcloud run deploy api-gateway --source gs://backups/api-gateway-v1.0.0.tar.gz

# Gradual rollback (canary)
kubectl set image deployment/api-gateway api-gateway=api-gateway:v1.0.0
```

## Backup & Recovery

### Data Backup
- **Firestore**: Automatic daily backups
- **Configuration**: Git-based version control
- **Logs**: 30-day retention in Cloud Logging

### Recovery Procedures

#### Service Recovery
```bash
# Restart failed service
kubectl rollout restart deployment/<service-name>

# Scale up if needed
kubectl scale deployment <service-name> --replicas=2
```

#### Data Recovery
```bash
# Restore Firestore from backup
gcloud firestore import gs://backups/firestore-backup-2026-04-01

# Verify data integrity
./verify-data-integrity.sh
```

## Performance Tuning

### Optimization Strategies

#### AI Service Optimization
- Cache common greeting decisions
- Optimize prompts for token efficiency
- Implement request batching

#### Database Optimization
- Index frequently queried fields
- Implement read replicas
- Cache feature flag values

#### Network Optimization
- Implement CDN for static assets
- Optimize service-to-service calls
- Use service mesh for traffic management

### Capacity Planning

#### Current Capacity
- 100 requests/minute (rate limited)
- 99.9% uptime SLA
- $15/month cloud costs

#### Scaling Triggers
- CPU > 70% for 5 minutes
- Memory > 80% for 5 minutes
- Response time > 20 seconds

---

*This runbook is updated quarterly. Last updated: April 2, 2026*
