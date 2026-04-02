terraform {
  required_providers {
    google = {
      source  = "hashicorp/google"
      version = "~> 4.0"
    }
  }
}

provider "google" {
  project = var.project_id
  region  = var.region
}

resource "google_cloud_run_service" "api_gateway" {
  name     = "helloworld-api-gateway"
  location = var.region

  template {
    spec {
      containers {
        image = "gcr.io/${var.project_id}/helloworld-api-gateway:latest"
        ports {
          container_port = 8080
        }
        env {
          name  = "NODE_ENV"
          value = "production"
        }
      }
    }
  }

  traffic {
    percent         = 100
    latest_revision = true
  }
}

# Add similar resources for other services...

output "api_gateway_url" {
  value = google_cloud_run_service.api_gateway.status[0].url
}