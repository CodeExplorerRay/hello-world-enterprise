# Manual Cloud Build Setup Commands

If the PowerShell script doesn't work, run these commands manually in your terminal:

```powershell
# Enable required APIs
gcloud services enable cloudbuild.googleapis.com
gcloud services enable run.googleapis.com
gcloud services enable artifactregistry.googleapis.com

# Create Artifact Registry repository
gcloud artifacts repositories create hello-world-enterprise-images `
    --repository-format=docker `
    --location=us-central1 `
    --description="Docker images for Hello World Enterprise"

# Set up IAM permissions for Cloud Build service account
$PROJECT_ID = "hello-world-enterprise-edition"
$SERVICE_ACCOUNT = "serviceAccount:${PROJECT_ID}@cloudbuild.gserviceaccount.com"

gcloud projects add-iam-policy-binding $PROJECT_ID `
    --member=$SERVICE_ACCOUNT `
    --role=roles/cloudbuild.builds.builder

gcloud projects add-iam-policy-binding $PROJECT_ID `
    --member=$SERVICE_ACCOUNT `
    --role=roles/run.admin

gcloud projects add-iam-policy-binding $PROJECT_ID `
    --member=$SERVICE_ACCOUNT `
    --role=roles/artifactregistry.writer

gcloud projects add-iam-policy-binding $PROJECT_ID `
    --member=$SERVICE_ACCOUNT `
    --role=roles/artifactregistry.reader
```

## Next Steps

1. Go to https://console.cloud.google.com/cloud-build/triggers
2. Create a new trigger connected to your GitHub repository
3. Set the trigger to run on pushes to 'master' branch
4. Point to configuration file: `infrastructure/cloudbuild.yaml`
5. Add substitution variable: `_GEMINI_API_KEY = your_actual_key`
6. Save and run the trigger manually to test

## If builds still fail

Check the Cloud Build logs for specific errors. Common issues:
- Missing GEMINI_API_KEY
- Repository not connected properly
- Insufficient IAM permissions
- Docker build failures