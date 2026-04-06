# Vercel Frontend Deployment

This repo now expects the frontend to deploy on Vercel while the backend microservices deploy on Railway.

## Target architecture

- `services/frontend` -> Vercel
- `api-gateway` and all backend services -> Railway
- frontend runtime proxy -> `services/frontend/next.config.js`

## Vercel project setup

1. Import the repository into Vercel.
2. If you imported the whole monorepo, set the project root directory to `services/frontend`.
3. If you created the Vercel project from only the frontend folder, set the root directory to `.` instead.
4. Confirm the framework is detected as `Next.js`.
5. Add the environment variable:

```text
API_GATEWAY_ORIGIN=https://YOUR_API_GATEWAY_URL
```

6. Trigger a deployment.

Because the frontend uses a rewrite in [services/frontend/next.config.js](../services/frontend/next.config.js), Vercel needs `API_GATEWAY_ORIGIN` available at build time so `/api/*` routes resolve to the live Railway API gateway.

## Recommended order

1. Deploy the backend services to Railway first.
2. Confirm `api-gateway` works directly at `/health` and `/api/greet`.
3. Copy the public Railway domain for `api-gateway`.
4. Set `API_GATEWAY_ORIGIN` in Vercel.
5. Deploy or redeploy the frontend in Vercel.

## Git integration

The cleanest setup is:

- Railway watches the repo for backend deployments or receives manual `Deploy Latest Commit` actions
- Vercel watches the repo for frontend changes in `services/frontend`

This keeps the backend and frontend deploy surfaces simple while preserving preview deployments for the Next.js app.

## Smoke checks after frontend deploy

1. Open the Vercel production URL.
2. Confirm the homepage loads without the fallback error state.
3. Open browser devtools and verify `POST /api/greet` succeeds with `200`.
4. Confirm the page renders a real greeting from the backend.
5. Set the same `API_GATEWAY_ORIGIN` value for Vercel preview deployments if you want branch deploys to work too.
