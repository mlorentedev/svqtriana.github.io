# Cache lifetimes at the edge.
#
# This is where the .htaccess Expires block was trying to go. GitHub Pages sends
# Cache-Control: max-age=600 for everything, which is right for HTML and wasteful
# for fingerprint-free assets that change a few times a year.
#
# Note the asymmetry: images and fonts are cached hard because a stale one is
# harmless, while HTML stays short because that is how a new poster reaches
# members the day it goes up.
resource "cloudflare_ruleset" "cache_settings" {
  zone_id = var.zone_id
  name    = "Cache settings"
  kind    = "zone"
  phase   = "http_request_cache_settings"

  rules = [
    {
      ref         = "cache_fonts_long"
      description = "Fonts never change without a new filename"
      expression  = "(http.request.uri.path.extension in {\"woff\" \"woff2\"})"
      action      = "set_cache_settings"
      enabled     = true

      action_parameters = {
        cache = true
        edge_ttl = {
          mode    = "override_origin"
          default = 31536000 # 1 year
        }
        browser_ttl = {
          mode    = "override_origin"
          default = 31536000
        }
      }
    },
    {
      ref         = "cache_images_long"
      description = "Images change by filename, not in place"
      expression  = "(http.request.uri.path.extension in {\"webp\" \"jpg\" \"jpeg\" \"png\" \"gif\" \"svg\" \"ico\"})"
      action      = "set_cache_settings"
      enabled     = true

      action_parameters = {
        cache = true
        edge_ttl = {
          mode    = "override_origin"
          default = 2592000 # 30 days
        }
        browser_ttl = {
          mode    = "override_origin"
          default = 2592000
        }
      }
    },
    {
      ref         = "cache_static_assets"
      description = "CSS and JS: long at the edge, shorter in the browser, since these have no fingerprint in the filename and a purge only reaches the edge"
      expression  = "(http.request.uri.path.extension in {\"css\" \"js\"})"
      action      = "set_cache_settings"
      enabled     = true

      action_parameters = {
        cache = true
        edge_ttl = {
          mode    = "override_origin"
          default = 604800 # 7 days
        }
        browser_ttl = {
          mode    = "override_origin"
          default = 86400 # 1 day
        }
      }
    },
    {
      ref         = "no_cache_service_worker"
      description = "sw.js decides what every other asset's freshness means, so it must never be the stale one"
      expression  = "(http.request.uri.path eq \"/sw.js\")"
      action      = "set_cache_settings"
      enabled     = true

      action_parameters = {
        cache = false
      }
    },
  ]
}
