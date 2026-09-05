# Maintaining svqtriana.com

Orientation for whoever — human or agent — picks this up next. The site is
static and changes a handful of times a year; most of what follows is about not
breaking things that are already working.

## Start here

```sh
scripts/serve.py 8000     # NOT python3 -m http.server, see README Traps
scripts/check_pages.py    # what CI will check
```

Read [`README.md`](../../README.md) first, especially the *Traps* section. Two of
those traps have already caused live bugs.

---

## Job 1: the new season poster

The recurring job. Once a year, around July.

1. **Drop the master in `images/`** as `cartel-NN.jpg`, where `NN` is the second
   year of the season (`cartel-27.jpg` for 2026/27).

2. **Convert it:**
   ```sh
   scripts/to-webp.py images/cartel-28.jpg
   ```
   Expect around 150-200K out. The script refuses if two masters would produce
   the same `.webp`.

3. **Update `index.html`** — all five places:
   - the `<h1>`: `TEMPORADA 27/28`
   - the `<img src>` and its `alt`, and the `width`/`height` to the new
     dimensions (the converter prints them)
   - `<link rel="preload" as="image">` in the head
   - `og:image` and `twitter:image` — **point these at the `.jpg`, not the
     `.webp`.** WhatsApp and Facebook scrapers handle WebP inconsistently, and
     this is the image people share.
   - `og:image:width` / `og:image:height` to the JPEG's real dimensions
   - the `image` field in the `SportsClub` JSON-LD

4. **If the membership prices changed**, update them in the `alt` text. They are
   currently only in the poster's pixels, which is deliberate — see *Open
   questions*.

5. **Bump `CACHE_VERSION` in `sw.js`, and restamp the `?v=`.** Not optional.
   HTML is cached for a day and images for a week, cache-first, so without the
   bump members who visited recently keep seeing last season's poster.

   ```sh
   scripts/bump-version.py        # v2.5 -> v2.6, everywhere it appears
   ```

   It moves four things that must agree: `CACHE_VERSION`, the `?v=` on every
   `css/` and `js/` URL, the footer stamp, and its `aria-label`.
   `scripts/check_pages.py` fails while any of them disagree, so a half-done
   bump cannot reach `main`.

6. **`lastmod` in `sitemap.xml`.**

7. Check it: `scripts/serve.py 8000`, then `scripts/check_pages.py`.

## Job 2: a new video

1. Get the real title — do not retype it:
   ```sh
   curl -s "https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=VIDEO_ID&format=json" \
     | python3 -m json.tool
   ```

2. Take the thumbnail from YouTube and trim its padding. `maxresdefault.jpg`
   usually exists; fall back to `sddefault` then `hqdefault`. YouTube pads
   stills into 16:9 with black bars, and `background-size: cover` would show
   them:
   ```sh
   curl -sfL -o images/video7.jpg "https://i.ytimg.com/vi/VIDEO_ID/maxresdefault.jpg"
   # crop the bars, then:
   scripts/to-webp.py images/video7.jpg
   ```

3. Add `.video-preview.item-7_video` to `css/style.css` alongside the others.

4. Add the card to `media.html` — **first**, newest at the top — and add a
   matching `VideoObject` to the `ItemList` JSON-LD in the same file. The card
   carries the video's own name as `<h2 class="video-title">` and the season as
   `<p class="video-season">`.

5. `scripts/bump-version.py`, as in Job 1 step 5.

## Job 3: prices or products change

`productos.html` holds the prices twice: in the visible card markup and in the
`hasOfferCatalog` JSON-LD in the head. **Change both**, or search engines will
advertise a price the page does not show.

## Job 4: re-pruning css/bootstrap.css

Only needed if a page starts using a Bootstrap class it did not use before —
the pruned stylesheet no longer contains that rule.

**`scripts/prune-bootstrap.py` reads the file it rewrites**, so running it
again prunes the already-pruned copy and restores nothing. Always start from
the complete stylesheet in git history:

```sh
git show f12cc73:css/bootstrap.css > css/bootstrap.css
scripts/prune-bootstrap.py --write
```

Then prove nothing moved, which is the only check that means anything here:

```sh
git show f12cc73:css/bootstrap.css > /tmp/bootstrap-original.css
scripts/compare-render.py /tmp/bootstrap-original.css
```

It renders all five pages at five widths under both stylesheets and compares
the computed style and box of every element — 3613 of them. Expect
`no computed-style or box differences`; it reports 644 when a single used rule
goes missing, so a pass is worth something.

## Job 5: changing the Cloudflare configuration

Applied 2026-09-05. See [`infra/cloudflare/README.md`](../../infra/cloudflare/README.md).
Change the code, then plan and apply — never click it in the dashboard.

Two things there that will bite if skipped:

- **Web Analytics is already enabled.** Applying `analytics.tf` as a create
  would register a duplicate site. Import first. It is gated behind
  `manage_web_analytics`, defaulting to false, for exactly this reason.
- **A CSP can break the site**, unlike the other headers, which merely fail to
  protect it. After applying, open every page with the console open and look for
  `Refused to load`. The likeliest casualties are the Google Maps embed on
  `/encuentro` and the product slider.

`.htaccess` was deleted in the same change; it never did anything here.

---

## How to check you have not broken it

```sh
scripts/check_pages.py       # titles, canonicals, nav, header/footer drift
```

Then, with `scripts/serve.py` running:

```sh
# every route resolves
for p in "" nosotros productos media encuentro; do
  echo "/$p $(curl -s -o /dev/null -w '%{http_code}' http://localhost:8000/$p)"
done

# the nav is in the served HTML, not built by JavaScript
curl -s http://localhost:8000/ | grep -c 'nav-link'   # expect 4
```

That last one matters more than it looks. The nav used to be built by
`document.createElement`, so the raw HTML contained no internal links at all.
Google renders JavaScript and saw it; the AI crawlers that increasingly answer
"where do I find X" mostly do not, and saw a page with no navigation and no
contact details. If that grep ever returns 0 again, that regression is back.

## Open questions someone should decide

- **The membership prices exist only as pixels** inside the poster image. They
  are in the `alt` text and `llms.txt`, but not as visible page text, so Google
  cannot show them and a screen reader gets them only via the alt. Adding them
  as HTML was offered and declined; worth revisiting.
- **jQuery and Bootstrap load on all five pages** to power one mobile menu
  toggle. Only `/productos` genuinely needs jQuery, for bxSlider. Replacing the
  collapse with a few lines of vanilla JS would drop ~90KB sitewide.
- **`js/performance.js` is mostly dead.** `lazyLoadImages` finds no
  `img[data-src]`, `loadDeferredCSS` matches nothing, and `preloadCriticalResources`
  runs too late to preload anything. Only the footer-year line still does work.
- **The service worker precaches into the wrong cache.** `install` puts pages,
  fonts and images into `STATIC_CACHE`, but `handleRequest` looks them up in
  `DYNAMIC`/`FONT`/`IMAGE`, so the precache never gets used and the offline
  fallback has no page to serve.
- **`css/style.css` has dead rules** referencing four images that do not exist.
  Harmless — nothing matches those selectors — but confusing.
- **No templating.** Five copies of the header and footer, kept honest by
  `check_pages.py`. If the site grows past five pages, that trade stops paying.
