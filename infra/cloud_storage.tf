resource "google_storage_bucket" "frontend" {
  name          = var.frontend_gcs_bucket.name
  location      = var.frontend_gcs_bucket.location
  storage_class = "STANDARD"
  force_destroy = true

  uniform_bucket_level_access = true

  website {
    main_page_suffix = "index.html"
    not_found_page   = "index.html"
  }

  versioning {
    enabled = false
  }
}

resource "google_storage_bucket_iam_binding" "binding" {
  bucket = google_storage_bucket.frontend.name
  role   = "roles/storage.objectViewer"
  members = [
    "allUsers"
  ]
}
