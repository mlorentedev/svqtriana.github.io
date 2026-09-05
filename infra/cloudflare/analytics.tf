# Cloudflare Web Analytics.
#
# ALREADY ENABLED, with automatic injection. Verified 2026-09-04: the beacon is
# present in the served HTML, but only for browser User-Agents - Cloudflare does
# not inject it for a default curl request, which is why a naive check says it
# is missing:
#
#   $ curl -s https://svqtriana.com/ | grep -c cloudflareinsights
#   0
#   $ curl -sA 'Mozilla/5.0 ... Chrome/131.0' https://svqtriana.com/ \
#       | grep -o 'cloudflareinsights[^"]*'
#   cloudflareinsights.com/beacon.min.js/v31edd6df95cf4e85bb4c19e7a9bdbcba...
#
# So this resource is declared for the record, not to create anything, and it is
# gated behind a variable that defaults to false. Applying it as a create would
# register a SECOND site for the same host rather than adopting the existing one.
#
# To bring the existing site under Terraform, import it first, then set
# manage_web_analytics = true:
#
#   dotf secrets run --only CLOUDFLARE_API_TOKEN -- \
#     terraform import cloudflare_web_analytics_site.site[0] '<account_id>/<site_tag>'
#
# The site tag is the path segment after beacon.min.js in the snippet above, or
# from the Web Analytics tab in the dashboard.
#
# Worth knowing: this measures the same visits Google Analytics already measures.
# Cloudflare's sets no cookies and builds no cross-site profile, which for a
# peña's website is the more proportionate choice - and the one that removes the
# cookie-banner question. Running both is the only option with no upside.

variable "manage_web_analytics" {
  description = <<-EOT
    Whether Terraform owns the Web Analytics site.

    Set false until the existing site has been imported, true after.

    Deliberately has NO default. With one, forgetting to pass the variable
    after an import silently resolves count to 0, and Terraform plans to
    DESTROY the site it just adopted. Being forced to state it is cheaper than
    that.
  EOT
  type        = bool
}

resource "cloudflare_web_analytics_site" "site" {
  count = var.manage_web_analytics ? 1 : 0

  account_id   = var.account_id
  host         = var.zone_name
  auto_install = true
}

output "web_analytics_site_tag" {
  description = "Site tag, once Terraform manages the site."
  value       = one(cloudflare_web_analytics_site.site[*].site_tag)
}
