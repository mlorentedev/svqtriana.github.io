# Verified inventory of the legacy site

Date: 2026-11-05. Source of truth: a clone of `svqtriana.github.io` in
`../svqtriana.github.io` (branch `main`, commit `ccad68d`). This document fixes
what the migration must keep; any doubt is resolved against the legacy HTML, not
against this summary.

## Routes and metadata

| Route | Legacy file | Indexable | `<title>` | Canonical / `og:url` |
|---|---|---|---|---|
| `/` | `index.html` | yes | `PS SVQ Triana \| Peña sevillista de Triana, Sevilla` | `https://svqtriana.com/` |
| `/nosotros` | `nosotros.html` | yes | `Nuestra historia \| PS SVQ Triana` | `https://svqtriana.com/nosotros` |
| `/productos` | `productos.html` | yes | `Material oficial \| PS SVQ Triana` | `https://svqtriana.com/productos` |
| `/media` | `media.html` | yes | `Galería de vídeos \| PS SVQ Triana` | `https://svqtriana.com/media` |
| `/encuentro` | `encuentro.html` | no (`noindex, follow`) | `Dónde nos vemos \| PS SVQ Triana` | `https://svqtriana.com/encuentro` |

**`/encuentro` is not migrated** (owner's decision, 2026-11-09): the route
disappears with the redesign. Because it was never indexed (`noindex, follow`),
no redirect is needed.

Current descriptions (verbatim):

- **Home:** `Peña sevillista fundada el 27 de julio de 2019 en el barrio de Triana, Sevilla. Abierta la renovación y las nuevas altas de la temporada 26/27.`
- **Nosotros:** `Historia de PS SVQ Triana: peña sevillista fundada el 27 de julio de 2019 en Triana. Conoce nuestros orígenes, crecimiento y pasión sevillista.`
- **Productos:** `Material oficial de PS SVQ Triana: camisetas, banderas, bufandas, pegatinas y más. Peña sevillista de Triana con precios especiales para socios.` → **fix**: the shirts are no longer for sale.
- **Media:** `Galería de vídeos de PS SVQ Triana: spots promocionales, pregones, desplazamientos y momentos especiales de nuestra peña sevillista.`
- **Encuentro** (legacy, not migrated): `Punto de encuentro de PS SVQ Triana: Cervecería el Punto de Triana. Ven con nosotros a ver el Sevilla en nuestro local de referencia.`

OG/Twitter: `og:image` = `https://svqtriana.com/images/cartel-27.jpg` (1131×1600, JPEG),
`og:image:alt` = `Cartel oficial de la temporada 2026/2027 de PS SVQ Triana`,
`twitter:site` = `@ps_svqtriana1`, `og:locale` = `es_ES`, `og:site_name` = `PS SVQ Triana`.

Shared: `theme-color` and `msapplication-TileColor` = `#df0606`,
`google-adsense-account` = `ca-pub-5217718596352992`, `author` = `SVQ Triana`,
`referrer` = `strict-origin-when-cross-origin`, manifest `images/site.webmanifest`.

## Identity and shared data

- Name: `PS SVQ Triana` (Peña Sevillista SVQ Triana).
- Founded: `27 de julio de 2019`, Triana, Sevilla.
- Email: `svqtriana@gmail.com`; links with `?subject=[WEB]`.
- Instagram: `https://www.instagram.com/ps_svqtriana/`.
- Facebook: `https://www.facebook.com/PS-SVQ-Triana-110014627020914`.
- X: `https://twitter.com/ps_svqtriana1`.
- TikTok: `https://www.tiktok.com/@p.s.svq.triana`.
- YouTube: `https://www.youtube.com/@svqtriana2090` (in `llms.txt`, not in the nav).
- Membership form:
  `https://docs.google.com/forms/d/e/1FAIpQLSdJ7KOc7hi-vBmWrmMwsD1zKJmmoM0TmtUd1IQ3cx_eS69azA/viewform`.
- Legacy version: `v20260905`.

Legacy nav: `INICIO` (`/#home`), `NUESTRA HISTORIA` (`/nosotros`), `MATERIAL`
(`/productos`), `GALERÍA` (`/media`) + Instagram, Facebook, X, TikTok icons. The
migration keeps those four entries: it adds none.

Footer: `Contacto`, X `@PS_SVQTRIANA1`, Instagram `@PS_SVQTRIANA`, email
`svqtriana@gmail.com`; `© {año} PS SVQ Triana - Todos los derechos reservados`;
`Desarrollado por @mlorentedev` (link to `https://github.com/mlorentedev`);
version linked to `CHANGELOG.md`.

## Content per page

### `/` — Home

- H1: `TEMPORADA 26/27`.
- CTA: `HAZTE SOCIO` → Google form (`aria-label="Formulario para hacerse socio de la peña"`).
- Poster: `images/webp/cartel-27.webp`, `width=1080 height=1528`,
  `fetchpriority=high`.
- Poster `alt`: `Cartel oficial de la temporada 2026/2027 de PS SVQ Triana: renovación 20€ (28€ con camiseta) y nueva alta 25€ (35€ con camiseta)`.
- Prices (also in `llms.txt`): renewal 20 € (28 € with shirt); new membership 25 €
  (35 € with shirt).
- JSON-LD: `SportsClub` (name, `alternateName`, description, URL, logo, image,
  `foundingDate` 2019-07-27, `foundingLocation`, `location`, `sameAs`
  Instagram/Facebook/Twitter, `sport`, `memberOf` Sevilla FC, `offers`).

### `/nosotros` — Nuestra historia

- H1: `¿QUIÉNES SOMOS?`.
- Full text in `nosotros.html` (lines 108–144). Verifiable milestones, no invented
  dates:
  - `27 de julio de 2019`: founding, hot afternoon; WhatsApp group and word of
    mouth.
  - ~`80 socios` in the first days of the season-ticket period; first scarf.
  - 19/20 spot (roughly a month live): shared by Sevilla FC on social media, TV
    and radio; doubled membership; passed `150.000 visualizaciones` in one day;
    verses of the poem on the flag.
  - `230 socios` at the close of the first year.
  - First trip by the peña, `de forma clandestina al Villamarín`.
  - `I Pregón de Navidad` in `diciembre de 2019`.
  - Coach to `Pamplona`; coach to `Getafe`.
  - Pandemic; `Sorteo Solidario` for the Comedor Social de Triana; 20/21 spot.
  - Closing line, verbatim: `Y aquí estamos con más fuerza que nunca. Igual que aquella tarde calurosa de julio.`
  - Final question: `¿Quieres seguir escribiendo la historia con nosotros?`
- Current photos and `alt`:
  - `derby19.webp` — `Aficionados de PS SVQ Triana en el derby sevillano de 2019`.
  - `getafe20.webp` — `Viaje de la peña al estadio del Getafe en 2020`.
  - `getafe20_2.webp` — `Más imágenes del viaje a Getafe en 2020`.
  - `comida19.webp` — `Comida de hermandad de la peña en 2019`.

### `/productos` — Material

Current order and data:

1. **Official red-and-black scarf** — member 10 €, non-member 12 €; image `bufanda`.
2. **Official flag** — member 10 €, non-member 12 €; image `bandera`.
3. **Official wristband** — 1 €; images `pulsera2` (alt `Pulsera oficial de la peña`)
   and `pulsera` (alt `Pulsera oficial vista alternativa`).
4. **Stickers** — pack of 6, 1 €; images `pegatina_escudo` (`Pegatina del escudo`),
   `pegatina_orilla` (`Pegatina de la orilla del río`), `pegatina_spencer`
   (`Pegatina de Spencer`), `pegatina_pancarta` (`Pegatina de pancarta`).

There is no cart and no online payment. Current JSON-LD: `Store` with
`OfferCatalog` (scarf, flag, stickers); **add the wristband** and fix the
description that mentions shirts.

### `/media` — Galería

Title ↔ thumbnail ↔ ID mapping (verified in `media.html` and its JSON-LD):

| # | Title | Season | Thumbnail | YouTube |
|---|---|---|---|---|
| 1 | El Sevilla siempre será su gente | 26/27 | `video6` | `Nz1E1GyG1EA` |
| 2 | Cita con nuestra herencia | 21/22 | `video5` | `NZbk3zVNMaY` |
| 3 | La brújula de mis sentidos | 20/21 | `video4` | `gyamGKXwkMc` |
| 4 | Desplazamientos | 19/20 | `video3` | `BQ16EOFLZEM` |
| 5 | Ya estamos aquí | 19/20 | `video1` | `0v1XvikTbIo` |
| 6 | I Pregón | Diciembre de 2019 | `video2` | `C85CSoQkVy8` |

- H1: `GALERÍA`.
- JSON-LD: `ItemList` of `VideoObject` (kept, with the local thumbnails updated).
- No iframes: link-out to `https://youtu.be/{id}` (decision 2026-11-05).

### `/encuentro` — Meeting point (legacy; **not migrated**)

- H1: `Ven con nosotros a ver el Sevilla`.
- Poster: `cartelPunto.webp`, alt `Cartel de la Cervecería el Punto de Triana, punto de encuentro de PS SVQ Triana`.
- Venue: **Cervecería el Punto de Triana**. Legacy Google Maps iframe (embed `pb=`
  with `2d-6.013321098573216`, `3d37.38654652492175`, place id
  `0xd126dcec28e1743:0x2ba12f6709ca46aa`).
- The route is removed with the migration: no page, no menu entry, no URL in
  `sitemap.xml` or `llms.txt`, and no `frame-src` for Google Maps in the CSP. The
  poster and the `cartelPunto.jpg` master stay out of the build.

## Assets

### Masters used by the content (copied to `src/assets/`)

- `images/cartel-27.jpg`. (`images/cartelPunto.jpg` is not migrated: it was the
  poster for `/encuentro`.)
- `images/derby19.jpg`, `getafe20.jpg`, `getafe20_2.jpg`, `comida19.jpg`.
- `images/bufanda.jpg`, `bandera.jpeg`, `pulsera.jpg`, `pulsera2.jpg`,
  `pegatina_escudo.jpg`, `pegatina_orilla.jpg`, `pegatina_spencer.jpg`, `pegatina_pancarta.jpg`.
- `images/video1.jpg` … `video6.jpg`.
- `images/puente3.jpg`, `noche.jpg`, `fondorsp.jpeg`.

### Fixed-path files (copied to `public/`)

`CNAME`, `ads.txt` (lowercase), `robots.txt`, `favicon.ico`, `sw.js` (kill-switch),
`site.webmanifest` (or generated), `fonts/GlacialIndifference-Regular.woff2`,
`fonts/GlacialIndifference-Bold.woff2`, `images/cartel-27.jpg`, `images/logo_192.png`,
`images/logo_512.png`, `images/logo.svg`, `images/apple-touch-icon.png`,
`images/webp/logo_192.webp`, `images/webp/logo_512.webp`.

### Not migrated

`css/`, `js/`, root `*.html`,
`scripts/{bump-version,prune-bootstrap,compare-render,to-webp,serve}.py`, Bootstrap,
jQuery and bxSlider. The unused masters (shirts, glasses, bags, hoodies, etc.) stay
out of the build unless a section needs them.

## Legacy root files

| File | Content kept |
|---|---|
| `CNAME` | `svqtriana.com` |
| `ads.txt` | `google.com, pub-5217718596352992, DIRECT, f08c47fec0942fa0` |
| `robots.txt` | `User-agent: *`, `Allow: /`, `Sitemap: https://svqtriana.com/sitemap.xml` (the stale comment about JS is removed) |
| `llms.txt` | Generated from `src/data/`; fix "camiseta oficial" |
| `sitemap.xml` | Generated in `src/pages/sitemap.xml.ts` with the site's four routes |
| `sw.js` | Kill-switch (§11 of the plan) |

## Baseline metrics (production, `v20260905`)

Mobile Lighthouse per `CHANGELOG.md`: Performance 82, Accessibility 100, CLS 0,
TBT 0 ms, weight 436 K, 19 requests.
