resource "google_container_registry" "this" {
  location = var.container_registry_location
}
