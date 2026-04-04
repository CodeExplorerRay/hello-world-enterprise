# Vercel Frontend Deployment

This repo now expects the frontend to deploy on Vercel while the backend microservices deploy on Google Cloud Run.

## Target architecture

- `services/frontend` -> Vercel
- `api-gateway` and all backend services -> Google Cloud Run
- backend automation -> Google Cloud Build trigger

## Vercel project setup

1. Import the GitHub repository into Vercel.
2. Set the project root directory to `services/frontend`.
3. Confirm the framework is detected as `Next.js`.
4. Add the production environment variable:

```text
API_GATEWAY_ORIGIN=https://YOUR_API_GATEWAY_URL
```

5. Trigger a deployment.

Because the frontend uses a rewrite in [services/frontend/next.config.js](../services/frontend/next.config.js), Vercel needs `API_GATEWAY_ORIGIN` available at build time so `/api/*` routes resolve to the Cloud Run API gateway.

## Recommended order

1. Deploy the backend to Cloud Run first using [infrastructure/cloudbuild.yaml](../infrastructure/cloudbuild.yaml).
2. Copy the deployed `api-gateway` URL.
3. Set `API_GATEWAY_ORIGIN` in Vercel.
4. Redeploy the frontend in Vercel.

## Git integration

The cleanest setup is:

- Google Cloud Build trigger watches the repo for backend changes
- Vercel watches the repo for frontend changes in `services/frontend`

This avoids relying on GitHub Actions billing for production deploys.

## Smoke checks after frontend deploy

1. Open the Vercel production URL.
2. Confirm the homepage loads.
3. Confirm a greeting renders.
4. Open browser devtools and verify `/api/greet` succeeds through the Vercel rewrite.
