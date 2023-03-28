resource "google_sql_database_instance" "default" {
  for_each         = var.use_cloud_sql ? toset(["1"]) : []
  name             = "main-db-instance"
  region           = var.region
  database_version = "POSTGRES_14"

  settings {
    tier = "db-f1-micro"
  }

  # set this to false to delete the instance when terraform destroy is run
  deletion_protection = true
}

resource "google_sql_database" "default" {
  for_each = var.use_cloud_sql ? toset(["1"]) : []
  name     = var.secrets.POSTGRES_DB.data
  instance = google_sql_database_instance.default[each.key].name
}

resource "google_sql_user" "default" {
  for_each = var.use_cloud_sql ? toset(["1"]) : []
  name     = var.secrets.POSTGRES_USER.data
  instance = google_sql_database_instance.default[each.key].name
  password = var.secrets.POSTGRES_PASSWORD.data
}
