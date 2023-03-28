resource "google_cloud_scheduler_job" "sentry_polling_job" {
  name             = "sentry_poller"
  description      = "Hits our Cloud Run service every minute to fetch new Sentry issues"
  schedule         = "* * * * *"
  time_zone        = "UTC"
  attempt_deadline = "30s"

  retry_config {
    retry_count = 1
  }

  http_target {
    http_method = "POST"
    uri         = var.sentry_polling_api

    oidc_token {
      service_account_email = data.google_compute_default_service_account.default.email
    }
  }
}
