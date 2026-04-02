output "api_gateway_url" {
  description = "URL of the API Gateway service"
  value       = google_cloud_run_service.api_gateway.status[0].url
}

output "frontend_url" {
  description = "URL of the frontend service"
  value       = google_cloud_run_service.frontend.status[0].url
}

output "project_id" {
  description = "Google Cloud Project ID"
  value       = var.project_id
}