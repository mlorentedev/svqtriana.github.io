# Security response headers.
#
# The repository has an .htaccess that sets all of these. It has never once
# taken effect: GitHub Pages does not run Apache and cannot send custom
# response headers at all, so the only place these can come from is the CDN in
# front of the origin. securityheaders.com grades response headers, which is why
# it has been reporting nothing.
#
# A <meta http-equiv> tag is not a substitute. It works for Content-Security-
# Policy only, and not for frame-ancestors; X-Frame-Options, HSTS and
# Permissions-Policy have no meta equivalent whatsoever.

locals {
  # Derived from what the pages actually load, not from a template:
  #   - inline <script> and <style> blocks on every page (critical CSS, the
  #     gtag bootstrap, the slider init), hence 'unsafe-inline'
  #   - jQuery from code.jquery.com, Font Awesome and Owl Carousel from cdnjs
  #   - Google Analytics from googletagmanager, reporting to google-analytics
  #   - the Cloudflare Web Analytics beacon, injected by Cloudflare itself
  #   - encuentro embeds a Google Maps iframe
  #   - the membership form posts to docs.google.com
  content_security_policy = join("; ", [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' https://code.jquery.com https://cdnjs.cloudflare.com https://www.googletagmanager.com https://static.cloudflareinsights.com",
    "style-src 'self' 'unsafe-inline' https://cdnjs.cloudflare.com https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com",
    "img-src 'self' data: https://www.google-analytics.com",
    "connect-src 'self' https://www.google-analytics.com https://cloudflareinsights.com",
    "frame-src https://www.google.com https://www.youtube.com",
    "frame-ancestors 'self'",
    "form-action 'self' https://docs.google.com",
    "base-uri 'self'",
    "object-src 'none'",
    "upgrade-insecure-requests",
  ])

  permissions_policy = join(", ", [
    "accelerometer=()",
    "camera=()",
    "geolocation=()",
    "gyroscope=()",
    "magnetometer=()",
    "microphone=()",
    "payment=()",
    "usb=()",
  ])

  security_headers = merge(
    {
      "Content-Security-Policy" = local.content_security_policy
      "Permissions-Policy"      = local.permissions_policy
      "Referrer-Policy"         = "strict-origin-when-cross-origin"
      "X-Content-Type-Options"  = "nosniff"
      "X-Frame-Options"         = "SAMEORIGIN"
    },
    var.enable_hsts ? {
      # No preload: getting onto the preload list is a one-way door that lives
      # in the browsers themselves, not in this config.
      "Strict-Transport-Security" = "max-age=31536000; includeSubDomains"
    } : {},
  )
}

resource "cloudflare_ruleset" "security_headers" {
  zone_id = var.zone_id
  name    = "Security response headers"
  kind    = "zone"
  phase   = "http_response_headers_transform"

  rules = [
    {
      ref         = "security_headers_all_responses"
      description = "Set the security headers GitHub Pages cannot send"
      expression  = "true"
      action      = "rewrite"
      enabled     = true

      action_parameters = {
        headers = {
          for name, value in local.security_headers :
          name => {
            operation = "set"
            value     = value
          }
        }
      }
    },
  ]
}
