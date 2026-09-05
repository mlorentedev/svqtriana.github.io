# Cloudflare configuration for svqtriana.com

Everything Cloudflare does for this site is defined here, not clicked in the
dashboard. Change the code, run a plan, apply.

## Why this directory exists at all

The site is hosted on GitHub Pages, which serves static files and **cannot send
custom response headers**. The repository has carried an `.htaccess` since 2025
that sets a Content-Security-Policy, HSTS, `X-Frame-Options` and the rest. None
of it has ever taken effect — GitHub Pages does not run Apache, so the file is
inert. That is why <https://securityheaders.com/?q=https%3A%2F%2Fsvqtriana.com>
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
| `caching.tf` | Edge and browser cache lifetimes. This is what the `.htaccess` `Expires` block was reaching for. |
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
- Account → Account Analytics → Edit *(only for `analytics.tf`)*

## If Web Analytics is already registered

Cloudflare shows two different things under "Analytics", and only one of them
needs anything from this repository:

- **Zone Analytics** — requests, bandwidth, threats. Measured by the proxy
  itself, always on for a proxied zone, no beacon involved. This is almost
  certainly what is already visible.
- **Web Analytics** — page views, visits, referrers, Core Web Vitals. Measured
  in the browser, and it needs the beacon. Verified absent from the served HTML
  on 2026-09-04.

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

## Once this is applied

Delete `.htaccess` from the repository root. Leaving it there implies a set of
protections that the host has never applied, which is worse than having none:
the next person to read it will believe the site is covered.
