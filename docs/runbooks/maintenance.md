# Maintaining svqtriana.com

Guidance for whoever — person or agent — picks this up next. The site is static
and changes a few times a year; almost everything below is about not breaking
what already works.

## Getting started

```sh
npm ci
npm run dev        # http://localhost:4321
```

And before opening a PR:

```sh
npm run verify
```

Read [`README.md`](../../README.md), especially the *Traps* section. Several
have already caused production bugs.

---

## Task 1: the new season's poster

The recurring job. Once a year, around July.

1. **Save the master** as `src/assets/carteles/cartel-NN.jpg`, where `NN` are
   the last two digits of the season (`cartel-28.jpg` for 2027/28).

2. **Copy the same JPEG** to `public/images/cartel-NN.jpg`. Linking the master
   in `src/` does not work: `public/` is what gets served unprocessed and the OG
   image has to be a JPEG with an absolute URL.

3. **Edit `src/data/temporada.ts`**:
   - the poster's `import`,
   - `etiqueta` (`'27/28'`) and `etiquetaLarga` (`'2027/2028'`),
   - `precios`, if they change,
   - `formularioUrl`, if it changes.

4. **Edit `src/data/cartel.ts`**:
   - `cartelOg` → `/images/cartel-28.jpg`,
   - `cartelOgSize` → the real dimensions of the JPEG,
   - `cartelAlt` → season and prices of the new poster.

   That file feeds `og:image`, `twitter:image` and the JSON-LD `image`.
   `site.ts` already reads it from there: nothing else needs touching.

5. **Write the `CHANGELOG.md` entry**, with `## vYYYYMMDD` as the first entry in
   the file. That is the version the footer will show on the next deploy:
   `deploy.yml` reads it from there and `check:dist` fails if they disagree.

6. **Check**: `npm run build && npm run check:dist`, and open the home page in a
   browser to see the poster and the prices.

7. **PR → CI → merge.** There is no version script and no `?v=`: assets carry a
   hash in the filename and the HTML is cached briefly.

8. Optional, after the deploy: delete the previous poster from
   `public/images/`. Nothing references it any more.

## Task 2: a new video

1. **Real title**, not retyped:

   ```sh
   curl -s "https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=VIDEO_ID&format=json" \
     | python3 -m json.tool
   ```

2. **Thumbnail**: download `maxresdefault.jpg` (or `sddefault`, or
   `hqdefault`), crop the black bars and save it as
   `src/assets/videos/videoNN.jpg`.

3. **Add the entry at the top of `src/data/videos.ts`**, with
   `destacado: true` and removing it from the previous one. The featured card on
   the home page, the first one on `/media` and the JSON-LD all come from there.

4. **Check**: `npm run verify`.

Nothing is embedded: every card links to `https://youtu.be/<id>`. If an embed
were ever wanted, `frame-src` would have to be opened in
`infra/cloudflare/headers.tf` and a consent banner added.

## Task 3: prices or products

Everything lives in `src/data/productos.ts` and `src/data/temporada.ts`. The
HTML, the JSON-LD (`hasOfferCatalog`) and `llms.txt` are generated from there,
so there is no second copy that can drift.

`npm run verify` checks that the JSON-LD still lists the 4 products and that the
assets exist.

## Task 4: changing the Cloudflare configuration

Headers, cache and analytics live in [`infra/cloudflare/`](../../infra/cloudflare/README.md).
Change the code, run `plan`, apply; the dashboard is never touched.

Two things that bite if skipped:

- **Web Analytics is already active.** Applying `analytics.tf` as a creation
  would register a duplicate site. It has to be imported first; that is why it
  sits behind `manage_web_analytics`.
- **A CSP can break the site**, unlike the other headers, which merely stop
  protecting. After applying, open every page with the console open and look for
  `Refused to load`. The likely culprit is the analytics beacon.

Remember the order: the HTML that satisfies the policy is deployed first,
Terraform is applied afterwards. Never the other way round.

---

## How to check you have not broken it

```sh
npm run verify
```

That chains type checks, build, `dist/` invariants and Playwright. To look only
at the static invariants:

```sh
npm run build && npm run check:dist
```

And to see the site as GitHub Pages sees it (no redirects, with `/nosotros` →
`nosotros.html` and a real 404):

```sh
node scripts/serve-dist.mjs 4321
```

Manual checks no script covers well:

- Open `/` on a real phone: there must be no CSP errors in the console.
- Open a page with the mobile menu and close it with Escape and with an outside
  click.
- Check the result of `npm run test:lighthouse` if you touched images, fonts or
  block order.

## Open questions

- **Prices are HTML text now**, not poster pixels: they live in `temporada.ts`
  and are visible on the home page. The duplication with the printed poster
  still exists, but the HTML is the source of truth for Google and screen
  readers.
- **The service worker kill-switch** can be deleted from ~May 2027. Not before:
  see [`../root-files.md`](../root-files.md).
- **`src/assets/productos/pulsera.webp`** is the master `pulsera.jpg` was
  generated from (see `scripts/convert-pulsera.mjs`). The build serves the JPEG
  because WebP as a `<Picture>` fallback weighed more than the original.
