# svqtriana.com

Website of **PS SVQ Triana**, a Sevilla FC supporters' club founded on 27 July
2019 in the Triana district of Seville.

Static site generated with **Astro 7** and **Tailwind CSS v4**, published on
GitHub Pages and served through Cloudflare. No UI framework, no jQuery, no
third-party scripts in the build output.

Two scripts are injected by the Cloudflare zone at the edge, not by this
repository: `beacon.min.js` (Web Analytics) and `email-decode.min.js` (Email
Address Obfuscation). `infra/cloudflare/csp.txt` is the intended allow-list for
what the edge may load; it is not live yet, because applying it is blocked on the
missing Terraform state backend
([#37](https://github.com/mlorentedev/svqtriana.github.io/issues/37)).

## Getting started

Requires **Node 24 LTS** (Astro 7.4 requires `>=22.23.4`; the project pins 24 in
`.nvmrc` and in `engines`).

```sh
npm ci
npm run dev        # http://localhost:4321
```

| Command | What it does |
|---|---|
| `npm run dev` | Dev server with reload. |
| `npm run build` | Emits `dist/` with the 4 pages, `404.html`, `sitemap.xml` and `llms.txt`. |
| `npm run preview` | Serves `dist/` the way Astro would. |
| `npm run check` | `astro check`: types and diagnostics. |
| `npm run check:dist` | Invariants over `dist/` (titles, canonical, JSON-LD, assets, CSP, version). |
| `npm run check:harness` | The reviewer registries still agree with the workflows they describe. |
| `npm run test:e2e` | Playwright: accessibility, mobile menu, routes and mobile overflow. |
| `npm run test:lighthouse` | Mobile Lighthouse CI over `dist/`. |
| `npm run verify` | `check` + `build` + `check:dist` + `check:harness` + `test:e2e`. |

`npm run preview` (and `scripts/serve-dist.mjs`, which the tests use) resolve
`/nosotros` to `nosotros.html`, the same way GitHub Pages does.

## Layout

| Path | What it is |
|---|---|
| `src/pages/` | The four pages, `404.astro`, `sitemap.xml.ts` and `llms.txt.ts`. |
| `src/layouts/BaseLayout.astro` | Shared `<head>`, header, footer and the site's only script. |
| `src/components/` | Header, mobile nav, footer, cards, galleries, timeline and decorative motifs. |
| `src/data/` | All literal content: site, season, products, videos, history, JSON-LD. |
| `src/assets/` | Image masters processed by `astro:assets` (AVIF + WebP). |
| `src/styles/global.css` | Tailwind v4 tokens, typefaces and local utilities. |
| `src/scripts/nav.ts` | Mobile menu and product galleries. |
| `public/` | Files served as-is: `CNAME`, `ads.txt`, `robots.txt`, `sw.js`, icons, fonts and the OG image. |
| `tests/` | Playwright: `a11y`, `mobile-nav`, `routes`, `overflow`. |
| `scripts/` | `check-dist.mjs`, `check-harness.mjs`, `serve-dist.mjs` and `convert-pulsera.mjs`. |
| `harness/` | Reviewer pool, review-attestation registry and the enforced rules. See [`harness/README.md`](harness/README.md). |
| `infra/cloudflare/` | Headers, cache and analytics as Terraform. |
| `docs/` | Runbooks and lessons. |

## The seasonal work

Once a year the poster changes. That is almost all the maintenance the site
needs: [`docs/runbooks/maintenance.md`](docs/runbooks/maintenance.md).

## Checks

```sh
npm run verify
terraform -chdir=infra/cloudflare validate
```

CI (`.github/workflows/checks.yml`) runs types, build, `dist/` invariants,
Playwright, Lighthouse, `terraform validate` and the repository guards
(`check-harness.mjs`, `check-lessons.sh`, `check-actions-pinned.sh`) on every
pull request and every push to `main`. `deploy.yml` runs on every push to
`main`, so **merging publishes**: there is no separate release step. It also
accepts `workflow_dispatch` for a manual re-publish. Every check exists because
something really did break in the previous site.

`npm audit --omit=dev` comes back clean: what gets published is static files,
with no runtime dependencies. The advisories the full `npm audit` reports live
in the `@lhci/cli` -> `lighthouse` -> `puppeteer-core` chain and only affect the
machine running the tests, not the site.

## Reviewing a change before it is published

The site **is deployed**: <https://svqtriana.com>. A pull request is reviewed by
building it locally (`npm run build && npm run preview`) and by CI, which runs
Playwright and Lighthouse on the PR itself.

The isolated Cloudflare Pages path (`*.pages.dev`, `noindex`, production CSP)
described in
[`docs/runbooks/preview-cloudflare.md`](docs/runbooks/preview-cloudflare.md) is
**not in use**. `*.pages.dev` is unreachable from some Spanish ISPs, which is the
same reachability problem that decided the hosting topology in
[ADR-001](docs/adr/adr-001-github-pages-origin-cloudflare-in-front.md). A preview
that part of the audience cannot open is worse than no preview. The runbook is
kept as the procedure of record and carries a `Status: not in use` header.

## Traps

Things that look like mistakes and are not, or that look harmless and are not.

- **`build.format: 'file'` is not a whim.** It emits `dist/nosotros.html`, which
  GitHub Pages serves as `/nosotros` with no trailing slash. With the default
  format (`directory`) canonicals and the sitemap would end in a slash, and the
  previous site did not.
- **`sw.js` is still published even though the site registers no service
  worker.** It is the kill-switch for the old one: it unregisters, deletes the
  `svq-triana-*` caches and reloads. It has to stay at the root for at least six
  months after the cutover. See [`docs/root-files.md`](docs/root-files.md).
- **No executable inline `<script>`.** Cloudflare's CSP carries no
  `'unsafe-inline'`, so Astro compiles to external files
  (`inlineStylesheets: 'never'` and `vite.build.assetsInlineLimit: 0`).
  `check:dist` fails if one comes back. JSON-LD is inline on purpose: it is
  `application/ld+json`, it does not execute, and the CSP does not block it.
- **No `style=""` either.** `check:dist` forbids it, which is why `style-src`
  can go without `'unsafe-inline'`.
- **There are no iframes on any page.** The CSP carries `frame-src 'none'` and
  `check:dist` fails on an `<iframe>`, so nothing is requested from a third party
  when the page loads.
- **Videos are links, not embeds.** No YouTube iframes means no third-party
  cookies and no `frame-src` for youtube.com.
- **The footer version comes from `CHANGELOG.md`.** `version.ts` reads the first
  `## vYYYYMMDD` entry at build time. If it does not match the footer,
  `check:dist` fails.
- **`compressHTML` is on by default.** Do not turn it off to "fix" the HTML: it
  changes whitespace, not the DOM, and only inflates the file.
- **Paths are case-sensitive in production.** Not on Windows or macOS. An asset
  that resolves locally can 404 on Pages because of case alone.
- **Headers come from Cloudflare, not the repo.** GitHub Pages cannot send them.
  They live in `infra/cloudflare/` and are applied with Terraform.

## Where the decisions live

- [`docs/adr/`](docs/adr/) — the architectural decisions. Start with [`adr-001`](docs/adr/adr-001-github-pages-origin-cloudflare-in-front.md): why GitHub Pages serves the site and Cloudflare sits in front of it.
- [`docs/root-files.md`](docs/root-files.md) — why certain files live in `public/` and why `sw.js` is still there.
- [`docs/lessons/_index.md`](docs/lessons/_index.md) — what broke, the mechanism, and what catches it now.
- [`docs/runbooks/maintenance.md`](docs/runbooks/maintenance.md) — the recurring work.
- [`infra/cloudflare/README.md`](infra/cloudflare/README.md) — why the headers live at the edge.
- [`CHANGELOG.md`](CHANGELOG.md) — what changes in each deploy.