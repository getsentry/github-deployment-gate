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

resource "google_cloud_scheduler_job" "renew_sentry_tokens_job" {
  name             = "renew_sentry_tokens"
  description      = "Hits our Cloud Run service every 30 minutes to renew tokens for sentry installations"
  schedule         = "*/30 * * * *"
  time_zone        = "UTC"
  attempt_deadline = "30s"

  retry_config {
    retry_count = 1
  }

  http_target {
    http_method = "POST"
    uri         = var.renew_sentry_tokens_api

    oidc_token {
      service_account_email = data.google_compute_default_service_account.default.email
    }
  }
}
