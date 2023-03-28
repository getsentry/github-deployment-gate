variable "credentials_file" {
  description = "Path to GCP credentials file"
}

variable "project" {
  description = "GCP project ID"
}

variable "region" {}

variable "frontend_gcs_bucket" {
  description = "GCS bucket for web frontend"
}

variable "container_registry_location" {
  description = "GCR location"
  default     = "US"
}

# use terraform.tfvars to override this with your app image
# see terraform.tfvars.example
variable "cloud_run_service" {
  default = {
    name         = "api"
    location     = "US"
    docker_image = "us-docker.pkg.dev/cloudrun/container/hello"
  }
}

variable "sentry_polling_api" {}

variable "domain_name" {
  description = "domain/subdomain name to be used for the load balancer"
}

variable "secrets" {}
