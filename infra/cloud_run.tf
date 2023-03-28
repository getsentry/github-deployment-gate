resource "google_cloud_run_service" "default" {
  name     = var.cloud_run_service.name
  project  = var.project
  location = var.region

  template {
    spec {
      containers {
        image = var.cloud_run_service.docker_image
        dynamic "env" {
          for_each = var.secrets
          content {
            name = env.key
            value_from {
              secret_key_ref {
                name = env.key
                key  = "latest"
              }
            }
          }
        }
      }
    }
  }
}

resource "google_cloud_run_service_iam_member" "default" {
  location = google_cloud_run_service.default.location
  project  = google_cloud_run_service.default.project
  service  = google_cloud_run_service.default.name
  role     = "roles/run.invoker"
  member   = "allUsers"
}

output "service_url" {
  value = google_cloud_run_service.default.status[0].url
}
