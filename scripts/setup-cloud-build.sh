#!/bin/bash
# Cloud Build Setup and Troubleshooting Script
# This script helps diagnose and fix common Cloud Build deployment issues

set -euo pipefail

PROJECT_ID=${1:-}
REGION="us-central1"
REPOSITORY="hello-world-enterprise-images"

if [ -z "$PROJECT_ID" ]; then
    echo "Usage: $0 <GCP_PROJECT_ID>"
    echo "Example: $0 my-hello-world-project"
    exit 1
fi

echo "🔧 Setting up Cloud Build for project: $PROJECT_ID"

# Authenticate and set project
echo "📋 Authenticating with GCP..."
gcloud auth login --quiet
gcloud config set project "$PROJECT_ID"

# Enable required APIs
echo "🔌 Enabling required GCP APIs..."
gcloud services enable cloudbuild.googleapis.com
gcloud services enable run.googleapis.com
gcloud services enable artifactregistry.googleapis.com

# Create Artifact Registry repository
echo "📦 Creating Artifact Registry repository..."
if ! gcloud artifacts repositories describe "$REPOSITORY" --location="$REGION" >/dev/null 2>&1; then
    gcloud artifacts repositories create "$REPOSITORY" \
        --repository-format=docker \
        --location="$REGION" \
        --description="Docker images for Hello World Enterprise"
else
    echo "Repository $REPOSITORY already exists"
fi

# Set up IAM permissions for Cloud Build service account
SERVICE_ACCOUNT="serviceAccount:$PROJECT_ID@cloudbuild.gserviceaccount.com"

echo "🔑 Setting up IAM permissions..."
gcloud projects add-iam-policy-binding "$PROJECT_ID" \
    --member="$SERVICE_ACCOUNT" \
    --role="roles/cloudbuild.builds.builder"

gcloud projects add-iam-policy-binding "$PROJECT_ID" \
    --member="$SERVICE_ACCOUNT" \
    --role="roles/run.admin"

gcloud projects add-iam-policy-binding "$PROJECT_ID" \
    --member="$SERVICE_ACCOUNT" \
    --role="roles/artifactregistry.writer"

gcloud projects add-iam-policy-binding "$PROJECT_ID" \
    --member="$SERVICE_ACCOUNT" \
    --role="roles/artifactregistry.reader"

echo "✅ Cloud Build setup complete!"
echo ""
echo "📋 Next steps:"
echo "1. Go to https://console.cloud.google.com/cloud-build/triggers"
echo "2. Create a new trigger connected to your GitHub repository"
echo "3. Set the trigger to run on pushes to 'master' branch"
echo "4. Point to configuration file: infrastructure/cloudbuild.yaml"
echo "5. Add substitution variable: _GEMINI_API_KEY = your_actual_key"
echo "6. Save and run the trigger manually to test"
echo ""
echo "🔍 If builds still fail, check the Cloud Build logs for specific errors"