# Cache lifetimes at the edge.
#
# GitHub Pages sends Cache-Control: max-age=600 for everything, which is right
# for HTML and wasteful for hashed assets.
#
# Note the asymmetry: fingerprinted assets are cached hard because a stale one
# can never be requested - the filename changes with the content - while HTML
# stays short because that is how a new poster reaches members the day it goes
# up.
resource "cloudflare_ruleset" "cache_settings" {
  zone_id = var.zone_id
  name    = "Cache settings"
  kind    = "zone"
  phase   = "http_request_cache_settings"

  rules = [
    {
      # Astro writes every generated CSS, JS, font and image under /_astro/
      # with a content hash in the filename. A year plus a changing name is
      # what `Cache-Control: immutable` would express; the Cache Rules API has
      # no immutable flag, but the hash makes the effect identical.
      #
      # This rule must stay first: cache rules run in order and the first match
      # wins, so a later extension rule must not shadow it.
      ref         = "cache_astro_fingerprinted"
      description = "Hashed assets under /_astro/ never change in place"
      expression  = "(starts_with(http.request.uri.path, \"/_astro/\"))"
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
      expression  = "(http.request.uri.path.extension in {\"webp\" \"avif\" \"jpg\" \"jpeg\" \"png\" \"gif\" \"svg\" \"ico\"})"
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
      ref         = "no_cache_service_worker"
      description = "sw.js is the kill-switch for the old worker, so it must never be the stale file"
      expression  = "(http.request.uri.path eq \"/sw.js\")"
      action      = "set_cache_settings"
      enabled     = true

      action_parameters = {
        cache = false
      }
    },
  ]
}
