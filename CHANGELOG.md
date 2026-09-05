# Changelog

What changed on [svqtriana.com](https://svqtriana.com), newest first.

The version is the deploy date — `vYYYYMMDD`, with `.N` for a second deploy the
same day. It is the same string the footer shows and the same one on every
`?v=` in the page source, so a visitor reading `v20260905` at the bottom of the
page and a maintainer debugging a stale cache are looking at the same number.

Written by hand. `scripts/bump-version.py` moves the version everywhere else,
but not this file: "various fixes" would defeat the point of having it.

---

## v20260905

The first full maintenance pass in a year, and the season 26/27 poster.

### The site

- **Season 26/27 poster** on the home page.
- **New spot in the gallery** — *El Sevilla siempre será su gente* — with the
  real YouTube titles as card headings and the season as subtitle, and proper
  thumbnails on the five older videos.
- **TikTok added** to the social links, and the Twitter bird replaced with the
  X mark — in the header, in the footer contact row, and in the accessibility
  labels a screen reader reads out.
- **Official shirts removed** from the material page (out of stock); scarf and
  flag now come first.
- **The mobile menu works again.** It had been dead on all five pages: the
  bundled Bootstrap CSS is v4 and hides with `.collapse:not(.show)`, while the
  bundled JS was v3 and toggled `in`, which no stylesheet here defines.
- **The product slider** no longer sits off-centre between black bands.
- **The background image** is anchored so the crop keeps the crowd rather than
  the edge of the frame.

### Findability

- Each page has its own `<title>`, canonical and `og:url`; all five used to
  claim to be the home page.
- **URLs lost their `.html`.** Canonical, `og:url`, sitemap, nav and the
  service worker precache list all agree now.
- **The nav and footer are in the served HTML**, not built by JavaScript.
  Grepping production for a nav link used to return 0. AI crawlers largely do
  not run JS, and they saw a page with no navigation and no contact details.
- `robots.txt` no longer blocks Googlebot from `/js/` and `/css/`, which it
  needs to render the page it is indexing.
- `/ads.txt` returns 200. The file was called `Ads.txt`, and production is
  case-sensitive, so AdSense had been fetching a 404 for a year.
- `llms.txt` added.

### Speed

Measured with Lighthouse against production, before and after:

| | Before | After |
|---|---:|---:|
| Performance | 60 | 82 |
| Accessibility | 98 | 100 |
| **Cumulative Layout Shift** | **0.827** | **0** |
| Total Blocking Time | 30 ms | 0 ms |
| Total weight | 879 K | 436 K |
| Requests | 26 | 19 |

- **1.68 MB of PNGs** were being served with unused WebP twins beside them — an
  earlier conversion had matched `*.png` and missed uppercase `.PNG`.
- **Font Awesome and Owl Carousel removed.** Owl loaded on four pages and was
  used by nothing; Font Awesome served six play glyphs. The icons are inline
  SVG now, which was forced anyway: version 4.7.0 predates both the X mark and
  TikTok.
- **`css/bootstrap.css` pruned**, 187 K to 12 K, keeping Bootstrap's own
  declarations byte for byte. Verified by rendering all five pages at five
  widths under both stylesheets and comparing every element: 3613 of them, no
  computed-style or box differences.
- **No inline scripts and no inline `<style>`** on any page.
- The poster is no longer `loading="lazy"`, which it should never have been —
  it is the largest contentful paint.

### Under the hood

- **Response headers now come from Cloudflare**, as Terraform in
  `infra/cloudflare/`: CSP, HSTS, Permissions-Policy, Referrer-Policy,
  X-Frame-Options, X-Content-Type-Options. There had been an `.htaccess` here
  for a year setting all of them, and not one line ever took effect — GitHub
  Pages does not run Apache.
- **`script-src` carries no `'unsafe-inline'`**, and TLS 1.0/1.1 are no longer
  accepted.
- **Assets carry `?v=`**, so a stylesheet change actually reaches people who
  have been here before. Without it, two caches keep serving the old file: the
  service worker's for 30 days and Cloudflare's edge for 7.
- **Bootstrap's MIT notice restored.** The pruner had been dropping it, along
  with the `:root` block underneath — it read the licence banner as a selector
  list, split it on the comma inside "Twitter, Inc." and matched `.com` in
  `getbootstrap.com` as a class.

---

## Before v20260905

The site was unmaintained for roughly a year. Its history is in the commit log;
this file starts where the versioning does.
