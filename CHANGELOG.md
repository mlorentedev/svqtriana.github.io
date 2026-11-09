# Changelog

What changes on [svqtriana.com](https://svqtriana.com), newest first.

The version is the deploy date: `vYYYYMMDD`, with `.N` for a second deploy the
same day. It is the same string the footer shows and the one the build reads
from the first entry in this file.

---

## v20261109

Review of the migration before it lands. The site keeps its four sections; what
changes is what ships, what the crawlers are told, and what CI checks.

### The site

- **`/encuentro` is gone.** The venue page is not part of the redesign and the
  route disappears with it. It was never indexed (`noindex, follow`), so no
  redirect is needed.
- **The `/llms.txt` gained an FAQ block**: eight answerable questions about the
  peña, the season, the material and how to join, phrased so an assistant can
  quote them. `public/robots.txt` now says in words that crawlers are welcome.

### Under the hood

- **The dead Google Maps loader is out of `nav.ts`.** It looked for a
  `[data-map-load]` element the templates no longer render, so it never ran.
- **One version mechanism, not two.** The build reads the version from this
  file's first entry; the `PUBLIC_SITE_VERSION` step in `deploy.yml` is gone.
- **The reviewer harness is a repository artifact**, not tribal knowledge:
  `harness/` holds the pool and the review-attestation registry, and
  `scripts/check-harness.mjs` fails when either drifts from the workflow that
  reads it.
- **`edge-drift.yml` checks the files that exist**, on real paths, and its
  `push` filter no longer names paths that were deleted in the migration.

---

## v20261108

Page and component redesign. The copy, the URLs and the club's data do not
change; what changes is how they are laid out and how they look.

### The site

- **Header with the name**: the crest now sits beside "SVQ Triana · Peña
  Sevillista", and the active section is underlined in albero.
- **Dark page headers** on `/nosotros`, `/productos` and `/media`, with the
  azulejo behind them, matching the home page.
- **The Triana bridge, redrawn**: arches, rings that shrink towards the
  keystone, piers and lampposts. It no longer distorts with the viewport width.
  It appears over the river below the hero, in the footer and at the end of the
  history page.
- **Red-and-white stripes** from the crest, only in the footer and at the end of
  `/nosotros`.
- **Home page**: "Hazte socio" in two columns, "La peña" as a mosaic with large
  photos, and the Triana quote given more room.
- **Nuestra historia**: reading-width text, dates that fit their label, full
  photos in album format, and the last milestone as a closing panel with the
  join button.
- **Material**: four cards per row on desktop and full photos, with the stickers
  and the flag no longer cropped.
- **Galería**: the featured video spans two rows and the next two stack beside
  it, with no gaps.
- **Footer** in three columns: brand and socials, contact, sections.
- **The hero no longer clips on narrow phones**, nor with the system font
  enlarged: "TEMPORADA", the kicker and the buttons always fit on screen. A new
  test (`tests/overflow.spec.ts`) checks it on all four pages.

### Performance and accessibility

Mobile Lighthouse over `dist/`, with Lighthouse CI:

| Page | Performance | Accessibility | Best Practices | SEO | CLS |
|---|---:|---:|---:|---:|---:|
| `/` | 95 | 100 | 100 | 100 | 0 |
| `/nosotros` | 100 | 100 | 100 | 100 | 0 |
| `/productos` | 94 | 100 | 100 | 100 | 0 |
| `/media` | 96 | 100 | 100 | 100 | 0 |

---

## v20261105

Migration of the site to Astro 7 and Tailwind CSS v4. The content, the URLs and
the club's data do not change; what changes is how the site is generated and
served.

### The site

- **The four sections keep their URL**, with no `.html` and no trailing slash:
  `/`, `/nosotros`, `/productos` and `/media`.
- **`/encuentro` is retired**: the page is not migrated, and it leaves the menu,
  `sitemap.xml`, `llms.txt` and the precache. It was never indexed
  (`noindex, follow`), so it leaves no dead links to redirect.
- **Videos link out to YouTube**, with no iframes and no third-party cookies.
- **No iframes on any page**: no embed survives, the map included.
- **Material with no cart**, as before: it is ordered by Instagram or email.
- **New design** with the neighbourhood's motifs (azulejo, the Triana bridge and
  the river), Fraunces for headings and Glacial Indifference for body text.

### Performance and accessibility

- Static HTML, with no jQuery, Bootstrap or third-party carousels.
- Minimal first-party JavaScript: the mobile menu and the product galleries.
- AVIF and WebP images through `astro:assets`; local WOFF2 fonts.
- No executable inline scripts: compatible with a CSP that has no
  `'unsafe-inline'`.
- Mobile Lighthouse over `dist/`, with Lighthouse CI:

  | Page | Performance | Accessibility | Best Practices | SEO | CLS |
  |---|---:|---:|---:|---:|---:|
  | `/` | 96 | 100 | 100 | 100 | 0 |
  | `/nosotros` | 100 | 100 | 100 | 100 | 0 |
  | `/productos` | 95 | 100 | 100 | 100 | 0 |
  | `/media` | 96 | 100 | 100 | 100 | 0 |

  CI fails if Performance drops below 90, Accessibility or SEO below 100, Best
  Practices below 95, or CLS goes above 0.02.

### Infrastructure

- Published with GitHub Actions and GitHub Pages (no change of provider); the
  actions are pinned by SHA.
- `sw.js` is kept as the kill-switch for the old service worker.
- The CSP narrows: jQuery gone, `'unsafe-inline'` gone from `style-src`, YouTube
  gone from `frame-src`. `frame-src` is now `'none'`, because the map went with
  the redesign.
- Hashed `/_astro/*` assets are cached for a year at the edge and in the
  browser. `sw.js` is still not cached.
- `terraform validate` and `terraform fmt -check` run in CI; `apply` remains a
  human act at cutover.

### Before the migration

Last production measurement of the previous site (`v20260905`), per its own
CHANGELOG: Performance 82, Accessibility 100, CLS 0, TBT 0 ms, 436 KB and 19
requests.

---

## History before the migration

Entries from the hand-written HTML site, exactly as they stood in this
repository before the move to Astro. Kept unchanged.
### v20260905

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

### Before v20260905

The site was unmaintained for roughly a year. Its history is in the commit log;
this file starts where the versioning does.
