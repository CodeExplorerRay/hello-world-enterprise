param(
    [Parameter(Mandatory = $true)]
    [string]$ProjectId
)

$ErrorActionPreference = 'Stop'
$Region = 'us-central1'
$Repository = 'hello-world-enterprise-images'
$ServiceAccount = "serviceAccount:$ProjectId@cloudbuild.gserviceaccount.com"

Write-Host "🔧 Setting up Cloud Build for project: $ProjectId"

function Get-GcloudPath {
    $gcloud = Get-Command gcloud -ErrorAction SilentlyContinue
    if ($gcloud) {
        return $gcloud.Source
    }

    $candidatePaths = @(
        "$env:LOCALAPPDATA\Google\Cloud SDK\google-cloud-sdk\bin\gcloud.cmd",
        "$env:PROGRAMFILES\Google\Cloud SDK\google-cloud-sdk\bin\gcloud.cmd",
        "$env:PROGRAMFILES(X86)\Google\Cloud SDK\google-cloud-sdk\bin\gcloud.cmd"
    )

    foreach ($path in $candidatePaths) {
        if (Test-Path $path) {
            return $path
        }
    }

    return $null
}

$GcloudPath = Get-GcloudPath
if (-not $GcloudPath) {
    Write-Host "❌ gcloud CLI not found. Install the Google Cloud SDK and reopen PowerShell."
    Write-Host "   https://cloud.google.com/sdk/docs/install"
    exit 1
}

Write-Host "📋 Found gcloud at: $GcloudPath"

# Skip auth and config since user is already logged in

Write-Host "🔌 Enabling required GCP APIs..."
& "$GcloudPath" services enable cloudbuild.googleapis.com
if ($LASTEXITCODE -ne 0) { throw 'Failed to enable cloudbuild.googleapis.com' }
& "$GcloudPath" services enable run.googleapis.com
if ($LASTEXITCODE -ne 0) { throw 'Failed to enable run.googleapis.com' }
& "$GcloudPath" services enable artifactregistry.googleapis.com
if ($LASTEXITCODE -ne 0) { throw 'Failed to enable artifactregistry.googleapis.com' }

Write-Host "📦 Creating Artifact Registry repository..."
$describeResult = & "$GcloudPath" artifacts repositories describe $Repository --location=$Region 2>$null
if ($LASTEXITCODE -ne 0) {
    & "$GcloudPath" artifacts repositories create $Repository `
        --repository-format=docker `
        --location=$Region `
        --description="Docker images for Hello World Enterprise"
    if ($LASTEXITCODE -ne 0) { throw 'Failed to create Artifact Registry repository' }
} else {
    Write-Host "Repository $Repository already exists"
}

Write-Host "🔑 Setting up IAM permissions..."
& "$GcloudPath" projects add-iam-policy-binding $ProjectId `
    --member=$ServiceAccount `
    --role=roles/cloudbuild.builds.builder
if ($LASTEXITCODE -ne 0) { throw 'Failed to grant cloudbuild.builds.builder' }

& "$GcloudPath" projects add-iam-policy-binding $ProjectId `
    --member=$ServiceAccount `
    --role=roles/run.admin
if ($LASTEXITCODE -ne 0) { throw 'Failed to grant run.admin' }

& "$GcloudPath" projects add-iam-policy-binding $ProjectId `
    --member=$ServiceAccount `
    --role=roles/artifactregistry.writer
if ($LASTEXITCODE -ne 0) { throw 'Failed to grant artifactregistry.writer' }

& "$GcloudPath" projects add-iam-policy-binding $ProjectId `
    --member=$ServiceAccount `
    --role=roles/artifactregistry.reader
if ($LASTEXITCODE -ne 0) { throw 'Failed to grant artifactregistry.reader' }

Write-Host "✅ Cloud Build setup complete!"
Write-Host ``
Write-Host "📋 Next steps:"
Write-Host "1. Go to https://console.cloud.google.com/cloud-build/triggers"
Write-Host "2. Create a new trigger connected to your GitHub repository"
Write-Host "3. Set the trigger to run on pushes to 'master' branch"
Write-Host "4. Point to configuration file: infrastructure/cloudbuild.yaml"
Write-Host "5. Add substitution variable: _GEMINI_API_KEY = your_actual_key"
Write-Host "6. Save and run the trigger manually to test"
Write-Host ``
Write-Host "🔍 If builds still fail, check the Cloud Build logs for specific errors"