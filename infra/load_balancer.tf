resource "google_compute_global_address" "default" {
  name = "lb-ip-address"
}

resource "google_compute_managed_ssl_certificate" "default" {
  name = "managed-ssl-cert"

  managed {
    domains = [var.domain_name]
  }

  lifecycle {
    prevent_destroy = true
  }
}

resource "google_compute_region_network_endpoint_group" "default" {
  provider              = google-beta
  name                  = "cloudrun-neg"
  network_endpoint_type = "SERVERLESS"
  region                = var.region
  cloud_run {
    service = google_cloud_run_service.default.name
  }

  depends_on = [
    google_cloud_run_service.default
  ]
}

# LB Backends

# Backend Service
resource "google_compute_backend_service" "cloudrun" {
  name                  = "lb-backend-service"
  load_balancing_scheme = "EXTERNAL_MANAGED"
  protocol              = "HTTP"
  port_name             = "http"
  timeout_sec           = 30

  backend {
    group = google_compute_region_network_endpoint_group.default.id
  }
}

# Backend Bucket
resource "google_compute_backend_bucket" "static" {
  name        = "static-asset-backend-bucket"
  bucket_name = google_storage_bucket.frontend.name
  enable_cdn  = false
}

# URL Map
resource "google_compute_url_map" "default" {
  name            = "http-lb"
  description     = "URL map"
  default_service = google_compute_backend_bucket.static.id

  host_rule {
    hosts        = ["*"]
    path_matcher = "main"
  }

  path_matcher {
    name            = "main"
    default_service = google_compute_backend_bucket.static.id

    path_rule {
      paths   = ["/api/*"]
      service = google_compute_backend_service.cloudrun.id
    }
  }
}

# HTTPS Proxy
resource "google_compute_target_https_proxy" "default" {
  name = "lb-https-proxy"

  url_map          = google_compute_url_map.default.id
  ssl_certificates = [google_compute_managed_ssl_certificate.default.id]
}

# Forward Port 443 traffic to HTTPS Proxy
resource "google_compute_global_forwarding_rule" "default" {
  name                  = "lh-fwd-rule"
  load_balancing_scheme = "EXTERNAL_MANAGED"
  target                = google_compute_target_https_proxy.default.id
  port_range            = "443"
  ip_address            = google_compute_global_address.default.address
}

# HTTP-to-HTTPS resources

resource "google_compute_url_map" "https_redirect" {
  name = "lb-https-redirect"

  default_url_redirect {
    https_redirect         = true
    redirect_response_code = "MOVED_PERMANENTLY_DEFAULT"
    strip_query            = false
  }
}

resource "google_compute_target_http_proxy" "https_redirect" {
  name    = "lb-http-proxy"
  url_map = google_compute_url_map.https_redirect.id
}

resource "google_compute_global_forwarding_rule" "https_redirect" {
  name                  = "lb-fwd-rule-http"
  load_balancing_scheme = "EXTERNAL_MANAGED"
  target                = google_compute_target_http_proxy.https_redirect.id
  port_range            = "80"
  ip_address            = google_compute_global_address.default.address
}

# Outputs

output "load_balancer_ip" {
  value = google_compute_global_address.default.address
}
