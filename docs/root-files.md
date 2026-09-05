# Why these files sit in the repository root

Every file listed here looks like clutter and is not. Each one is fetched from a
fixed path by something we do not control, so moving it into a folder breaks it
silently — no error, no log, just a feature that stops working.

| File | Fetched by | What moving it breaks |
|---|---|---|
| `sw.js` | The browser, via `navigator.serviceWorker.register('/sw.js')` | Its **scope**. A service worker may only control URLs beneath the directory it is served from, so `/js/sw.js` would control `/js/*` and nothing else — the pages would stop being cached. Widening the scope requires a `Service-Worker-Allowed` response header, and GitHub Pages does not let us set headers. The root is the only option on this host. |
| `ads.txt` | Google AdSense crawler, at `/ads.txt` | Ad verification. Note the lowercase: GitHub Pages is case-sensitive, and the file shipped as `Ads.txt` for a year, so `/ads.txt` returned 404 in production while `/Ads.txt` returned 200. |
| `robots.txt` | Every crawler, at `/robots.txt` | Nothing reads it anywhere else. |
| `sitemap.xml` | Search engines, pointed at by `robots.txt` | It is referenced by absolute URL, so it could move — but there is no reason to. |
| `llms.txt` | Proposed convention for LLM crawlers, at `/llms.txt` | See the note below. |
| `CNAME` | GitHub Pages itself | The custom domain. |
| `favicon.ico` | Browsers, which probe `/favicon.ico` when no `<link rel=icon>` matches | The tab icon fallback. |

## On `llms.txt`

Added deliberately, with low expectations. It is a proposal
([llmstxt.org](https://llmstxt.org), late 2024) and **no major AI crawler is
known to consume it** — not OpenAI, not Anthropic, not Google. It costs a few
lines and may pay off later.

What actually determines whether an answer engine can describe this site is
whether the content is in the served HTML at all. AI crawlers largely do not
execute JavaScript, so anything this site builds at runtime is invisible to
them, no matter what `llms.txt` says.

## Hosting constraints worth remembering

GitHub Pages serves static files and **cannot set response headers**. Two
consequences the repository has already tripped over:

- `.htaccess` is inert here. It is an Apache file and GitHub Pages does not run
  Apache, so every `Header set` line in it has never taken effect. Response
  headers have to come from the CDN in front of the origin.
- Paths are **case-sensitive**, unlike a local macOS or Windows checkout. A file
  that resolves locally can 404 in production purely on capitalisation.

GitHub Pages does serve extensionless URLs: `/nosotros` resolves to
`nosotros.html`. Both forms return 200, so the site picks the extensionless one
everywhere (canonical, `og:url`, sitemap, nav) to avoid duplicate content.
`scripts/serve.py` reproduces that fallback locally; the stock
`python3 -m http.server` does not, and will report the nav as broken.
