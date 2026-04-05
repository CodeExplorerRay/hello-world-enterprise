# Migrating Hello World Enterprise to GitLab CI/CD (Free Tier)

## Overview

This guide explains how to migrate your deployment pipeline from GitHub Actions + Cloud Build to GitLab CI/CD using **completely free services** for open-source projects.

## Current vs New Architecture

### Current (GitHub + GCP - Requires Payment)
- **Source Control**: GitHub
- **CI**: GitHub Actions (limited, requires payment for usage)
- **CD**: Google Cloud Build (requires billing enabled)
- **Backend**: Google Cloud Run (requires billing)
- **Frontend**: Vercel

### New (GitLab + Railway - Completely Free)
- **Source Control**: GitLab
- **CI/CD**: GitLab CI/CD (400 minutes/month free)
- **Backend**: Railway (512MB RAM, 1GB disk free)
- **Frontend**: Vercel + Netlify (free for open-source)

## Prerequisites

### GitLab Setup
1. Create a GitLab repository
2. Import/migrate your code from GitHub
3. Set up the following CI/CD variables in GitLab:
   - `RAILWAY_TOKEN`: Railway CLI token
   - `VERCEL_TOKEN`: Vercel deployment token
   - `NETLIFY_AUTH_TOKEN`: Netlify access token
   - `GEMINI_API_KEY`: Gemini API key (optional, falls back to mock)

### Railway Setup (Free)
1. Sign up at https://railway.app
2. Create a new Railway project
3. Connect your GitLab repository to the project
4. Railway will auto-detect `railway.toml` and deploy all 8 services:
   - api-gateway
   - ai-decision-engine
   - teapot-service
   - punctuation-service
   - feature-flag-service
   - ab-testing-service
   - concatenation-service
   - capitalization-service
5. After first deploy, copy each service's URL and set environment variables in api-gateway

## Migration Steps

### 1. Repository Migration
```bash
# Clone from GitHub
git clone https://github.com/yourusername/hello-world-enterprise.git
cd hello-world-enterprise

# Change remote to GitLab
git remote set-url origin https://gitlab.com/yourusername/hello-world-enterprise.git

# Push to GitLab
git push -u origin main
```

### 2. Configure Railway Services
For each service in Railway:

1. **Environment Variables**:
   - `GEMINI_API_KEY`: Your Gemini API key (optional)
   - Service-specific URLs (Railway auto-generates these)

2. **Build Settings**:
   - Build Command: (leave default)
   - Start Command: (leave default)
   - Root Directory: `services/{service-name}`

3. **Domain Settings**:
   - Railway provides free `*.up.railway.app` domains
   - Note down the URLs for each service

### 3. Update API Gateway Configuration
In Railway, set these environment variables for the `api-gateway` service:

```
AI_DECISION_ENGINE_URL=https://ai-decision-engine.up.railway.app
TEAPOT_SERVICE_URL=https://teapot-service.up.railway.app
PUNCTUATION_SERVICE_URL=https://punctuation-service.up.railway.app
FEATURE_FLAG_SERVICE_URL=https://feature-flag-service.up.railway.app
AB_TESTING_SERVICE_URL=https://ab-testing-service.up.railway.app
CONCATENATION_SERVICE_URL=https://concatenation-service.up.railway.app
CAPITALIZATION_SERVICE_URL=https://capitalization-service.up.railway.app
```

### 4. Configure GitLab CI/CD Variables
In GitLab project settings → CI/CD → Variables:

| Variable | Type | Description |
|----------|------|-------------|
| `RAILWAY_TOKEN` | Variable | Railway CLI token |
| `VERCEL_TOKEN` | Variable | Vercel deployment token |
| `NETLIFY_AUTH_TOKEN` | Variable | Netlify access token |
| `GEMINI_API_KEY` | Variable | Gemini API key (optional) |

### 5. Update Frontend Configuration
Update `services/frontend/vercel.json` and `services/frontend/netlify.toml`:

Replace `https://your-api-gateway-url` with your Railway API gateway URL:
```
https://api-gateway.up.railway.app
```

### 6. Deploy
Push to the `main` branch to trigger the pipeline:

```bash
git add .
git commit -m "Migrate to free Railway + GitLab CI/CD"
git push origin main
```

## Pipeline Stages

### 1. Build Stage
- Builds all backend service Docker images
- Pushes to GitLab Container Registry
- Parallel builds for efficiency

### 2. Deploy Stage
- Deploys all services to Railway (auto-detected from railway.json)
- Each service gets its own `*.up.railway.app` URL
- Wires service URLs into API gateway environment variables
- Deploys frontend to both Vercel and Netlify

### 3. Test Stage
- Runs smoke tests against deployed services
- Validates health endpoints
- Tests greeting API functionality

## Troubleshooting

### Build Failures
- Check GitLab CI/CD logs for specific errors
- Ensure all CI/CD variables are set correctly
- Verify railway.toml is valid and in repo root
- Ensure each service section in railway.toml has correct `root` path

### Deployment Failures
- Check Railway build logs for service-specific errors
- Verify Dockerfile is in each `services/{name}/` folder
- Ensure all services have correct Node, Python, Go, Rust, Java, or C# setup
- Check Railway dashboard for service status and logs
- Verify railway.toml has `[[services]]` section for each service with correct root directory

### Frontend Deployment Issues
- Check Vercel/Netlify deployment logs
- Verify `API_GATEWAY_ORIGIN` environment variable is set
- Confirm api-gateway service URL is reachable

## Cost Comparison

### Before (Paid Services)
- **GitHub Actions**: ~$15-20/month (exceeding free tier)
- **Google Cloud Run**: Pay per request + storage
- **Cloud Build**: Pay per minute
- **Total**: $20-50/month minimum

### After (Free Services)
- **GitLab CI/CD**: 400 minutes/month free
- **Railway**: 512MB RAM, 1GB disk free
- **Vercel**: Free for open-source
- **Netlify**: Free tier available
- **Total**: $0/month

## Railway Free Tier Limits

- **RAM**: 512MB per service
- **Disk**: 1GB per service
- **Bandwidth**: 100GB/month
- **Services**: Unlimited (but each needs resources)

## Rollback Plan

If Railway deployment fails:

1. Check Railway service logs in the dashboard
2. Verify `railway.json` configuration is correct
3. Ensure Dockerfiles exist in all service folders
4. Manually redeploy individual services via Railway CLI if needed

## Benefits of Free Migration

1. **Zero Cost**: Completely free for open-source projects
2. **Unified Pipeline**: Single platform for CI/CD
3. **Better Reliability**: Railway's managed infrastructure
4. **Dual Frontend**: Deploy to both Vercel and Netlify
5. **Container Registry**: Built-in Docker registry
6. **Advanced Features**: Better artifact management

## Alternative Free Platforms

If Railway doesn't meet your needs, consider:

- **Render**: 750 hours/month free, Docker support
- **Fly.io**: 3 shared CPUs, 256MB RAM free
- **Railway**: Best Docker support for complex apps

## Next Steps

1. Test the pipeline with a feature branch
2. Monitor costs and performance
3. Consider GitLab Pages for additional frontend deployment
4. Set up GitLab environments for staging/production separation