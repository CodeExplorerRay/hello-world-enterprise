# Cloud Run Backend Deployment

This repo now expects the backend microservices to deploy to Google Cloud Run, while the frontend deploys separately to Vercel.

## Target architecture

- `services/frontend` -> Vercel
- backend services -> Cloud Run
- backend deployment automation -> Google Cloud Build trigger

## Backend services deployed to Cloud Run

- `api-gateway`
- `ai-decision-engine`
- `teapot-service`
- `punctuation-service`
- `feature-flag-service`
- `ab-testing-service`
- `concatenation-service`
- `capitalization-service`

## Required Google Cloud setup

1. Create or choose a Google Cloud project.
2. Enable these APIs:
   - `run.googleapis.com`
   - `cloudbuild.googleapis.com`
   - `artifactregistry.googleapis.com`
3. Authenticate locally:

```bash
gcloud auth login
gcloud config set project YOUR_PROJECT_ID
gcloud services enable run.googleapis.com cloudbuild.googleapis.com artifactregistry.googleapis.com
```

## Required backend secret

- `GEMINI_API_KEY`
  Used by:
  - `ai-decision-engine`
  - `teapot-service`

## Cloud Build trigger setup

In Google Cloud:

1. Open `Cloud Build` -> `Triggers`.
2. Create a trigger connected to your GitHub repository.
3. Point the trigger at:

```text
infrastructure/cloudbuild.yaml
```

4. Recommended branch filter:

```text
^master$
```

5. Add a substitution for the Gemini key:

```text
_GEMINI_API_KEY=your_real_key_here
```

6. Save the trigger and run it once manually.

This trigger will:

1. Build backend images.
2. Deploy backend services to Cloud Run in dependency order.
3. Capture the live service URLs.
4. Deploy the `api-gateway` with those URLs.
5. Run backend smoke tests.

## Service ports

Cloud Run is configured to match the service defaults used in local development:

- `api-gateway`: `8080`
- `ai-decision-engine`: `8081`
- `teapot-service`: `8082`
- `punctuation-service`: `8083`
- `feature-flag-service`: `8084`
- `ab-testing-service`: `8085`
- `concatenation-service`: `8086`
- `capitalization-service`: `8087`

## Manual backend deploy flow

Deploy the backend services first and capture their URLs:

```bash
export REGION=us-central1
export GEMINI_API_KEY=your_real_key_here
```

```bash
AI_DECISION_ENGINE_URL=$(gcloud run deploy ai-decision-engine \
  --source services/ai-decision-engine \
  --region "$REGION" \
  --allow-unauthenticated \
  --port 8081 \
  --set-env-vars "GEMINI_API_KEY=${GEMINI_API_KEY}" \
  --format='value(status.url)')
```

```bash
TEAPOT_SERVICE_URL=$(gcloud run deploy teapot-service \
  --source services/teapot-service \
  --region "$REGION" \
  --allow-unauthenticated \
  --port 8082 \
  --set-env-vars "GEMINI_API_KEY=${GEMINI_API_KEY}" \
  --format='value(status.url)')
```

```bash
PUNCTUATION_SERVICE_URL=$(gcloud run deploy punctuation-service \
  --source services/punctuation-service \
  --region "$REGION" \
  --allow-unauthenticated \
  --port 8083 \
  --format='value(status.url)')
```

```bash
FEATURE_FLAG_SERVICE_URL=$(gcloud run deploy feature-flag-service \
  --source services/feature-flag-service \
  --region "$REGION" \
  --allow-unauthenticated \
  --port 8084 \
  --format='value(status.url)')
```

```bash
AB_TESTING_SERVICE_URL=$(gcloud run deploy ab-testing-service \
  --source services/ab-testing-service \
  --region "$REGION" \
  --allow-unauthenticated \
  --port 8085 \
  --format='value(status.url)')
```

```bash
CONCATENATION_SERVICE_URL=$(gcloud run deploy concatenation-service \
  --source services/concatenation-service \
  --region "$REGION" \
  --allow-unauthenticated \
  --port 8086 \
  --format='value(status.url)')
```

```bash
CAPITALIZATION_SERVICE_URL=$(gcloud run deploy capitalization-service \
  --source services/capitalization-service \
  --region "$REGION" \
  --allow-unauthenticated \
  --port 8087 \
  --format='value(status.url)')
```

Then deploy the gateway with those service URLs:

```bash
API_GATEWAY_URL=$(gcloud run deploy api-gateway \
  --source services/api-gateway \
  --region "$REGION" \
  --allow-unauthenticated \
  --port 8080 \
  --set-env-vars "AI_DECISION_ENGINE_URL=${AI_DECISION_ENGINE_URL},TEAPOT_SERVICE_URL=${TEAPOT_SERVICE_URL},PUNCTUATION_SERVICE_URL=${PUNCTUATION_SERVICE_URL},FEATURE_FLAG_SERVICE_URL=${FEATURE_FLAG_SERVICE_URL},AB_TESTING_SERVICE_URL=${AB_TESTING_SERVICE_URL},CONCATENATION_SERVICE_URL=${CONCATENATION_SERVICE_URL},CAPITALIZATION_SERVICE_URL=${CAPITALIZATION_SERVICE_URL}" \
  --format='value(status.url)')
```

## Post-deploy backend smoke checks

```bash
curl -fsS "${API_GATEWAY_URL}/health"
curl -fsS "${AI_DECISION_ENGINE_URL}/health"
curl -fsS "${PUNCTUATION_SERVICE_URL}/health"
curl -fsS -H "Content-Type: application/json" \
  -d '{"recipient":"World","channel":"web","locale":"en-US","preferredGreeting":"auto"}' \
  "${API_GATEWAY_URL}/api/greet"
```

## After backend deploy

Once the Cloud Run backend is healthy:

1. Copy the deployed `api-gateway` URL.
2. Set that value as `API_GATEWAY_ORIGIN` in Vercel.
3. Deploy or redeploy the frontend through Vercel.

See [docs/vercel-frontend-deployment.md](./vercel-frontend-deployment.md) for the frontend setup.
