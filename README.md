# svqtriana.com

Website of **PS SVQ Triana**, a Sevilla FC supporters' club founded on 27 July
2019 in the Triana district of Seville.

Five hand-written HTML pages, no build step, no framework. Hosted on GitHub
Pages, served through Cloudflare.

## Running it locally

```sh
scripts/serve.py 8000     # then open http://localhost:8000
```

**Use this rather than `python3 -m http.server`.** GitHub Pages resolves
`/nosotros` to `nosotros.html`; the stock server does not, so it returns 404 for
every link in the nav and makes the site look broken when it is not.

## Layout

| Path | What it is |
|---|---|
| `*.html` | The five pages. Each is standalone: its own `<head>`, its own inlined critical CSS, and a copy of the shared header and footer. |
| `css/` | `style.css` is the real stylesheet, hand-edited. There is no SASS build. |
| `js/` | `performance.js` (nav toggle, footer year), and bxSlider plus `slider.js`, which only `/productos` loads. No Bootstrap JS — see *Traps*. |
| `images/` | Masters. `images/webp/` holds the optimised copies the site actually serves. |
| `infra/cloudflare/` | Response headers, cache rules and analytics, as Terraform. |
| `scripts/` | `serve.py`, `to-webp.py`, `check_pages.py`, `bump-version.py`; `prune-bootstrap.py` and `compare-render.py` for the rare re-prune (runbook Job 4). |
| `docs/` | Runbooks, the notes explaining decisions that look odd, and `docs/lessons/`: what broke, why, and what now catches it. |
| `CHANGELOG.md` | What changed on each deploy. The footer version links here. |

## The seasonal job

Once a year the poster changes. That is most of the maintenance this site ever
needs — see [`docs/runbooks/maintenance.md`](docs/runbooks/maintenance.md) for
the full checklist, but the short version:

```sh
cp ~/Downloads/cartel-28.jpg images/
scripts/to-webp.py images/cartel-28.jpg
# then update index.html: heading, <img>, og:image, twitter:image, JSON-LD
scripts/bump-version.py   # or nobody sees the new poster
```

## Checks

```sh
scripts/check_pages.py                          # page invariants
terraform -chdir=infra/cloudflare validate      # infrastructure
```

CI runs both on every pull request, along with a route check and an asset check.
Every one of those exists because the corresponding thing broke here at least
once.

## Traps

Things that look like mistakes and are not, or look fine and are not.

- **`sw.js` must stay in the repository root.** A service worker can only
  control URLs beneath the directory it is served from. In `js/` it would
  control `js/` and nothing else. Widening the scope needs a
  `Service-Worker-Allowed` header, and GitHub Pages cannot send headers.
  Same reasoning for `ads.txt`, `robots.txt`, `llms.txt`, `CNAME`.
  Full list: [`docs/root-files.md`](docs/root-files.md).
- **Paths are case-sensitive in production.** `Ads.txt` sat in this repository
  for a year while AdSense fetched `/ads.txt` and got a 404.
- **There is no SASS build, and adding one back is a trap.** `css/style.scss`
  and `css/style.css.map` used to sit beside `style.css` and had drifted to
  1433 lines against 680; recompiling would have silently deleted half the
  stylesheet. They were deleted for that reason. `style.css` is hand-edited.
- **Changing a stylesheet or a script is not enough on its own.** Two caches
  serve the old file under the same name: the service worker's, 30 days and
  cache-first, and Cloudflare's edge, 7 days. Run `scripts/bump-version.py`:
  it moves `CACHE_VERSION`, the `?v=` on every `css/` and `js/` URL, and the
  footer stamp together, and stamps today's date as the version. Then write the
  `CHANGELOG.md` entry by hand — `scripts/check_pages.py` fails until all five
  agree, the changelog included.
  The query string is what makes it a new cache key for both, so no purge is
  needed.

  This paragraph used to say only "bump `CACHE_VERSION`", and the very next
  change that moved rules out of an inline `<style>` and into `style.css`
  forgot to. A documented knob is not a mechanism; the check is.
- **The service worker caches your local edits too.** While `scripts/serve.py`
  is running, editing `css/style.css` without changing the `?v=` leaves the
  browser serving the copy the worker already holds — the edit looks like it
  did nothing. Unregister it in DevTools → Application, or run in the console:

  ```js
  navigator.serviceWorker.getRegistrations().then(r => r.forEach(x => x.unregister()));
  caches.keys().then(k => k.forEach(c => caches.delete(c)));
  ```

  This cost real minutes here: a correct stylesheet change looked broken.
- **The header and footer are copy-pasted across five files.** That is the cost
  of having no templating; they used to be built in JavaScript, which hid the
  whole nav from crawlers that do not run JS. `scripts/check_pages.py` fails if
  the five copies drift apart.
- **Do not add Bootstrap's JavaScript back without checking its major version.**
  `css/bootstrap.css` is v4.3.1. The JS that used to ship alongside it was
  v3.4.1, which toggles the v3 class `in` while the v4 CSS hides via
  `.collapse:not(.show)` — the mobile menu was dead on every page for exactly
  that reason. Nothing in the site uses a Bootstrap JS component now.
- **Response headers come from Cloudflare, not from this repository.** GitHub
  Pages cannot send them. They are defined in `infra/cloudflare/` and applied
  with Terraform. There used to be an `.htaccess` here setting them; it never
  did anything, because Pages does not run Apache, and it was deleted once the
  Cloudflare rules went live.

## Where the decisions are written down

- [`docs/root-files.md`](docs/root-files.md) — why the root is not tidier
- [`docs/lessons/_index.md`](docs/lessons/_index.md) — what broke, the mechanism, and what now catches it
- [`docs/runbooks/maintenance.md`](docs/runbooks/maintenance.md) — the recurring jobs
- [`docs/runbooks/dns.md`](docs/runbooks/dns.md) — the request path, and what is safe to publish
- [`infra/cloudflare/README.md`](infra/cloudflare/README.md) — why the headers live at the edge
