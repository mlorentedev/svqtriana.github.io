---
id: "lesson-012-preview-is-not-pages"
type: lesson
status: active
title: "The Astro preview is not GitHub Pages"
created: "2026-11-05"
owner: manu
tags: [svqtriana, lesson]
---

# The Astro preview is not GitHub Pages

## What happened

The first Playwright runs started `astro preview`. A preview server already
sitting on port 4321 made Playwright reuse the process (`reuseExistingServer`)
and test an older `dist/`. On top of that, the preview does not resolve unknown
routes the way Pages does: `/404` returned 200 because the `404.html` file
exists and is served without an extension, so the "nonexistent route" test
passed without testing anything.

## Mechanism

The preview is a development server, not the production one. GitHub Pages
resolves `/nosotros` to `nosotros.html` and serves `404.html` with status 404
for any route that does not exist; the preview has its own fallback and status
logic. Testing against it validates the generator, not the hosting.

## What prevents it now

`scripts/serve-dist.mjs` imitates Pages: optional extension, `index.html` for
directories, `dist/404.html` with status 404 and no redirects.
`playwright.config.ts` and `lighthouserc.json` use it. `tests/routes.spec.ts`
tests `/esta-pagina-no-existe`, not `/404`, precisely so the status has to be a
real 404.
