# Zone-level settings that were left at Cloudflare's defaults.
#
# Each is one `cloudflare_zone_setting` resource in provider v5 - there is no
# single "zone settings" block any more. Only settings this project has a
# reason to change are declared; everything else stays under Cloudflare's own
# defaults rather than being pinned here by accident.

# TLS 1.0 and 1.1 are deprecated (RFC 8996) and are what SSL Labs and
# securityheaders-style scanners flag first. The zone was serving 1.0.
#
# 1.2 rather than 1.3: 1.3 would exclude clients that only speak 1.2, and this
# is a peña's public website - the visitor on an older phone matters more here
# than the marginal handshake gain. Cloudflare negotiates 1.3 with anything
# that supports it regardless of this floor.
resource "cloudflare_zone_setting" "min_tls_version" {
  zone_id    = var.zone_id
  setting_id = "min_tls_version"
  value      = "1.2"
}

# Deliberately NOT declared, and the reasons are worth keeping:
#
# ssl = "strict"
#   Would break the site. Full (strict) validates that the origin certificate
#   covers the requested hostname, and GitHub Pages presents *.github.io here:
#
#     $ openssl s_client -connect 185.199.108.153:443 -servername svqtriana.com \
#         </dev/null | openssl x509 -noout -subject
#     subject=CN=*.github.io
#
#   GitHub would present a certificate for svqtriana.com if it could complete
#   the ACME challenge, but the challenge is answered by Cloudflare's proxy,
#   not by Pages. That is the same fact as Pages' "Enforce HTTPS" being off in
#   the repository settings - not an oversight, and turning it on does not
#   help. always_use_https already redirects at the edge, which is the
#   protection Enforce HTTPS would have provided.
#
# rocket_loader
#   Off, and must stay off: it injects an INLINE script, which the CSP in
#   headers.tf blocks now that script-src carries no 'unsafe-inline'. Left
#   undeclared rather than pinned to "off" so that turning it on fails visibly
#   in the browser rather than being silently reverted by the next apply.
#
# email_obfuscation
#   On, and compatible: it injects /cdn-cgi/scripts/.../email-decode.min.js,
#   which is same-origin and therefore covered by script-src 'self'.
#
# Bot Fight Mode / JavaScript Detections
#   MUST STAY OFF, and this is the one that is not obvious. It injects an
#   INLINE script - not a file - that bootstraps
#   /cdn-cgi/challenge-platform/scripts/jsd/main.js:
#
#     <script>(function(){...window.__CF$cv$params={r:'a3674e1ec9a0fd76',
#      t:'MTc4ODYzMzAyNg=='}...})();</script>
#
#   The r and t values change on every request, so no hash and no nonce can
#   ever allow it. Turning it back on means either a console error on every
#   page or putting 'unsafe-inline' back into script-src, which is the finding
#   this configuration exists to close.
#
#   Turning it off also helps the thing the site was optimised for: Bot Fight
#   Mode challenges non-browser traffic, and the AI crawlers that increasingly
#   answer "where is this peña" are non-browser traffic.
#
#   Not declared here because the Free-plan bot settings are not exposed to
#   this provider, and reading them needs a Bot Management token permission
#   this project's token deliberately does not carry. It is a dashboard
#   setting: Security > Bots > Bot Fight Mode. If a CSP violation for an
#   inline script ever appears in production, check this first.
