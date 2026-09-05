# Cloudflare Web Analytics.
#
# auto_install lets Cloudflare inject the beacon at the edge, so the site's HTML
# stays free of another third-party script tag and the token is not committed.
#
# Worth knowing before enabling: this measures the same visits Google Analytics
# already measures. The difference is that Cloudflare Web Analytics sets no
# cookies and builds no cross-site profile, which for a peña's website is the
# more proportionate choice - and the one that removes the cookie-banner
# question entirely. Running both is the only option here that has no upside.
resource "cloudflare_web_analytics_site" "site" {
  account_id   = var.account_id
  host         = var.zone_name
  auto_install = true
}

output "web_analytics_site_tag" {
  description = "Site tag, if the beacon ever needs to be embedded by hand."
  value       = cloudflare_web_analytics_site.site.site_tag
}
