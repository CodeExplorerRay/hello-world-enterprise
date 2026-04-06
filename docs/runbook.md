# HelloWorld Enterprise Runbook

## Overview

This runbook provides operational procedures for maintaining the HelloWorld Enterprise greeting infrastructure. The current production shape is:

- Backend microservices on Railway
- Frontend on Vercel
- `api-gateway` as the public backend entry point

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
   # Railway backend
   curl -fsS https://<your-api-gateway>.up.railway.app/health
   curl -fsS https://<your-api-gateway>.up.railway.app/api/greet

   # Vercel frontend
   curl -I https://<your-frontend>.vercel.app
   ```

2. **Platform Monitoring**
   - Check Railway service health and recent deploy status
   - Verify Vercel production deployment is healthy
   - Confirm billing remains within free-tier expectations

3. **Log Review**
   - Check `api-gateway` logs for orchestration errors
   - Verify Gemini token usage in `ai-decision-engine`
   - Confirm rate limiting is working as expected

### Business Hours Monitoring

- Response time alerts: < 30 seconds
- Error rate alerts: < 0.1%
- AI token budget monitoring

## Monitoring

### Key Metrics

#### Application Metrics
- **Greeting Response Time**: Target < 15 seconds including animation
- **AI Decision Confidence**: Target > 80%
- **Microservice Availability**: Target 99.9%
- **Rate Limit Hits**: Monitor for abuse

#### Infrastructure Metrics
- **Railway Deploy Health**: No failing services
- **Vercel Deployment Health**: Production deployment ready
- **Request Count**: Monitor trends
- **Error Count**: Alert on > 5/minute

#### Business Metrics
- **Monthly Cost**: Target $0 on free tiers
- **Token Usage**: Monitor Gemini API costs
- **User Satisfaction**: Still impossible to measure

### Alert Configuration

#### Critical Alerts (Page immediately)
- Greeting service down
- AI service returning errors
- Teapot behavior regresses
- Response time > 60 seconds

#### Warning Alerts (Monitor closely)
- Response time > 30 seconds
- Railway service restart loops
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
| P2 | Teapot behavior regresses | 30 minutes | Email stakeholders |
| P3 | Documentation outdated | 4 hours | Internal ticket |

### Response Process

#### 1. Detection
- Monitoring alerts trigger
- User reports via support channels
- Automated health checks fail

#### 2. Assessment (5 minutes)
- Confirm incident scope
- Determine severity level
- Notify the on-call engineer

#### 3. Investigation (15 minutes)
- Check Railway service logs
- Verify Vercel production deployment status
- Identify the failing service or configuration change

#### 4. Resolution
- Implement fix or rollback
- Test functionality through the frontend and gateway
- Monitor for 30 minutes

#### 5. Communication
- Update stakeholders
- Document the incident
- Schedule a post-mortem if needed

### 3 AM Survival Checklist

When "Hello World" goes down at 3 AM:

1. Confirm the greeting is actually wrong and not merely stylistically controversial.
2. Check the `api-gateway` response payload for `orchestrationError`, `featureFlags`, `experiment`, and `aiTokensUsed`.
3. Verify whether Gemini is unavailable, quota limited, or returning malformed output.
4. Confirm the teapot still reports `418` semantics, because if that breaks too the night is cursed.
5. Decide whether to rely on the fallback path or fix the live dependency.
6. Write the incident report before coffee wears off.

### Common Issues & Solutions

#### Issue: AI Service Returns Errors
**Symptoms**: Greeting shows fallback text  
**Cause**: Gemini API key issues, quota exhaustion, or malformed model output  
**Solution**:
```bash
# Verify the service is healthy
curl -fsS https://<ai-decision-engine>.up.railway.app/health

# Check the configured key in Railway Variables, then redeploy the service if needed
# Review Railway logs for Gemini-related failures
```

#### Issue: Teapot Behavior Regresses
**Symptoms**: Gateway reports teapot health problems  
**Cause**: Code regression or stale deployment  
**Solution**:
```bash
# Verify the live service
curl -fsS https://<teapot-service>.up.railway.app/health
curl -X BREW https://<teapot-service>.up.railway.app/brew

# Redeploy the latest good Railway deployment if behavior changed unexpectedly
```

#### Issue: Slow Response Times
**Symptoms**: Greeting takes > 30 seconds  
**Cause**: AI service latency, downstream timeout, or Railway resource pressure  
**Solution**:
```bash
# Test the gateway directly
curl -fsS https://<your-api-gateway>.up.railway.app/api/greet

# Check api-gateway and ai-decision-engine logs in Railway
# Confirm the frontend still receives 200 responses from /api/greet in Vercel
```

## Deployment Procedures

### Standard Deployment

1. **Pre-deployment Checks**
   ```bash
   npm test
   npm run build
   ```

2. **Backend Deployment**
   - Push the desired commit to `master`
   - Deploy updated backend services in Railway
   - Verify `/health` on changed services

3. **Frontend Deployment**
   - Confirm `API_GATEWAY_ORIGIN` is set in Vercel
   - Deploy `services/frontend` in Vercel
   - Verify the homepage and `POST /api/greet`

4. **Post-deployment Monitoring**
   - Monitor Railway logs for 1 hour
   - Verify Vercel production traffic is healthy
   - Check for fallback greetings that would indicate a partial backend issue

### Rollback Procedure

1. Redeploy the previous healthy Railway deployment for the affected backend service.
2. Promote or redeploy the previous healthy Vercel deployment if the frontend is at fault.
3. Re-run `/health`, `/api/greet`, and the live frontend smoke checks.

## Backup & Recovery

### Configuration Backup
- **Source code**: Git-based version control
- **Runtime config**: Railway and Vercel environment variables
- **Logs**: Retained in platform dashboards

### Recovery Procedures

#### Service Recovery
- Redeploy the affected Railway service
- Verify the service root endpoint and `/health`
- Re-test the `api-gateway` orchestration flow

#### Frontend Recovery
- Promote the previous healthy Vercel deployment
- Confirm `/api/greet` still proxies to Railway correctly

## Performance Tuning

### Optimization Strategies

#### AI Service Optimization
- Cache common greeting decisions
- Optimize prompts for token efficiency
- Monitor fallback frequency

#### Backend Optimization
- Reduce cross-service latency inside the gateway
- Keep health and root routes lightweight
- Fail fast when downstream services are unavailable

#### Frontend Optimization
- Keep the Vercel rewrite pointed at the live gateway origin
- Monitor client-side fallback rendering
- Preserve fast page loads while the backend orchestration runs

### Capacity Planning

#### Current Capacity
- Free-tier oriented backend on Railway
- Frontend on Vercel
- Practical target cost: $0/month

#### Scaling Triggers
- Response time > 20 seconds
- Frequent Railway restarts
- Sustained Gemini usage growth beyond budget

---

*This runbook is updated quarterly. Last updated: April 7, 2026*
