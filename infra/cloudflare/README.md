# Cloudflare configuration for svqtriana.com

Everything Cloudflare does for this site is defined here, not clicked in the
dashboard. Change the code, run a plan, apply.

## Why this directory exists at all

The site is hosted on GitHub Pages, which serves static files and **cannot send
custom response headers**. The repository carried an `.htaccess` from 2025 to
2026-09-05 setting a Content-Security-Policy, HSTS, `X-Frame-Options` and the
rest. None of it ever took effect — GitHub Pages does not run Apache, so the
file was inert. It was deleted once these rules were applied and verified. That is why <https://securityheaders.com/?q=https%3A%2F%2Fsvqtriana.com>
has been reporting a bare response, and why issue #2 could not be fixed inside
the repository.

Cloudflare is already proxying the domain, which makes it the one place that
*can* set them:

```
$ curl -sI https://svqtriana.com/
HTTP/2 200
server: cloudflare          <- proxy is on
x-github-request-id: ...    <- origin is GitHub Pages
```

## What it manages

| File | What it sets |
|---|---|
| `headers.tf` | The security response headers, derived from what the pages actually load. |
| `caching.tf` | Edge and browser cache lifetimes. This is what the deleted `.htaccess` `Expires` block was reaching for. |
| `analytics.tf` | Cloudflare Web Analytics, injected at the edge. |

## Running it

The API token is never written to a file and never passed on the command line.
It is injected into the Terraform process only:

```sh
cd infra/cloudflare
dotf secrets run --only CLOUDFLARE_API_TOKEN -- terraform init
dotf secrets run --only CLOUDFLARE_API_TOKEN -- terraform plan
dotf secrets run --only CLOUDFLARE_API_TOKEN -- terraform apply
```

`zone_id` and `account_id` are not secret, but they are account-specific, so
pass them at plan time or put them in a local `terraform.tfvars` (gitignored):

```hcl
zone_id    = "..."
account_id = "..."
```

Both are on the zone's Overview page in the dashboard, or from the API:

```sh
dotf secrets run --only CLOUDFLARE_API_TOKEN -- sh -c \
  'curl -s -H "Authorization: Bearer $CLOUDFLARE_API_TOKEN" \
   "https://api.cloudflare.com/client/v4/zones?name=svqtriana.com"' \
  | python3 -m json.tool
```

## Before the first apply

**The token in the secrets store is not valid.** Verified 2026-09-04:

```
$ ...tokens/verify
success: False
error 1000 - Invalid API Token
```

Mint a new one in the Cloudflare dashboard (My Profile → API Tokens) with these
permissions on the `svqtriana.com` zone, then store it with
`dotf secrets set CLOUDFLARE_API_TOKEN`:

- Zone → Zone → Read
- Zone → Zone Settings → Edit
- Zone → Cache Rules → Edit
- Zone → Config Rules / Transform Rules → Edit
- Account → Account Settings → Read **and** Write *(only for `analytics.tf`; this is what the v5 provider's `cloudflare_web_analytics_site` actually checks, not the Analytics permission the dashboard suggests)*

## If Web Analytics is already registered

Cloudflare shows two different things under "Analytics", and only one of them
needs anything from this repository:

- **Zone Analytics** — requests, bandwidth, threats. Measured by the proxy
  itself, always on for a proxied zone, no beacon involved. This is almost
  certainly what is already visible.
- **Web Analytics** — page views, visits, referrers, Core Web Vitals. Measured
  in the browser, and it needs the beacon. **Already enabled here**, with
  Cloudflare injecting the beacon at the edge.

**Check it with a browser User-Agent.** Cloudflare does not inject the beacon
for a default `curl` request, so the obvious check reports it missing on a site
where it is working:

```sh
curl -s  https://svqtriana.com/ | grep -c cloudflareinsights          # 0
curl -sA 'Mozilla/5.0 ... Chrome/131.0' https://svqtriana.com/ \
  | grep -o 'cloudflareinsights[^"]*'                                 # present
```

If `svqtriana.com` already appears under the *Web Analytics* tab, do not apply
`analytics.tf` blind: it would create a second site entry. Import the existing
one first:

```sh
dotf secrets run --only CLOUDFLARE_API_TOKEN -- \
  terraform import cloudflare_web_analytics_site.site '<account_id>/<site_tag>'
```

## Two decisions left open on purpose

**HSTS is off** (`enable_hsts = false`). It is the one setting here that is hard
to walk back: once a browser has seen the header it refuses plain HTTP for the
whole `max-age`, and undoing it early means serving `max-age=0` and waiting for
every visitor to return. The apex and `www` both serve HTTPS today, so turning
it on is safe — but it should be a deliberate flip, not a side effect of the
first apply. Preload stays off regardless; that list lives in the browsers.

**Web Analytics overlaps Google Analytics.** Both count the same visits. The
difference is that Cloudflare's sets no cookies and builds no cross-site
profile, which for a peña's website is the more proportionate choice and drops
the cookie-banner question entirely. Running both is the only option with no
upside — pick one.

## Order matters: apply after the site deploys, not before

The CSP describes what the *pages* load, so tightening it before the matching
pages are live breaks the site. This has already been demonstrated once:
`script-src` lost `'unsafe-inline'` while the deployed pages still carried three
inline `<script>` blocks, which would have stopped the service worker
registering and the product slider initialising.

So: merge the code, wait for the Pages deployment to finish, and only then
apply. If a change must go the other way round - a page starting to load
something new - widen the policy first, deploy, then narrow it again.

## Verifying an apply

Check the consequence, not the config:

```sh
curl -sI https://svqtriana.com/ | grep -iE \
  'content-security-policy|x-frame-options|x-content-type|referrer-policy|permissions-policy'
```

Then re-run <https://securityheaders.com/?q=https%3A%2F%2Fsvqtriana.com>.

A CSP is the one header here that can break the site rather than merely fail to
protect it. After applying, load every page with the browser console open and
confirm there are no `Refused to load` messages — the slider, the Google Maps
embed on `/encuentro` and the analytics beacon are the parts most likely to trip
it.

## Applied

Applied 2026-09-05: `Plan: 2 to add, 0 to change, 0 to destroy`. Verified live
with the curl above, and by loading every page against the CSP with the console
open. `.htaccess` was deleted in the same change.
