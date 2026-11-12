---
id: lesson-013-sitemap-index-is-not-a-sitemap
type: lesson
status: active
created: "2026-11-05"
owner: manu
tags: [svqtriana, lesson]
---

# Astro's sitemap is an index, not a sitemap

## What happened

`@astrojs/sitemap` was installed expecting to get `dist/sitemap.xml`, which is
the URL `robots.txt` and Google Search Console have advertised for years. The
integration generates `sitemap-index.xml` and `sitemap-0.xml`. The build was
correct and the file existed, but at another path: `/sitemap.xml` would have
returned 404 in production.

## Mechanism

The integration assumes the sitemap index format so it can paginate when there
are more than 50 000 URLs or several sitemaps. On a five-page site the index is
an unnecessary indirection, and changing the published URL would have broken the
`robots.txt` reference and the submission already made to Search Console.

## What prevents it now

`src/pages/sitemap.xml.ts` generates the sitemap directly, with the five URLs
without a trailing slash and their `lastmod`. `scripts/check-dist.mjs` checks
that `dist/sitemap.xml` exists, that it has exactly those five `<loc>` and five
`<lastmod>`, and `tests/routes.spec.ts` that it returns 200.
