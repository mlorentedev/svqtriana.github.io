---
id: lesson-010-astro-inlines-what-the-csp-forbids
type: lesson
status: active
created: "2026-11-05"
owner: manu
tags: [svqtriana, lesson]
---

# Astro inlines what the CSP forbids

## What happened

The first build of the migration had a `<script>` with the mobile menu and the
galleries inside every HTML. We did not write it inline: Astro compiled the
`<script>` from `BaseLayout` into a chunk and Vite embedded it again because it
weighed less than `build.assetsInlineLimit` (4 KB by default). The build was
green; the failure would only have appeared in production, with
`script-src 'self'` and no `'unsafe-inline'`: the browser would have blocked the
script and the mobile menu would not have opened.

The same with CSS. `build.inlineStylesheets` is `'auto'` by default and embeds
small stylesheets in `<style>`, which `style-src 'self'` also blocks.

## Mechanism

The decision to inline is not Astro's but Vite's: `shouldInlineAsset` compares
the chunk size with `assetsInlineLimit`. A 2 KB script gets inlined even if the
component declares it as an external module. There is no warning; the served
HTML is not the one you expected.

## What prevents it now

- `astro.config.mjs` sets `vite.build.assetsInlineLimit: 0` and
  `inlineStylesheets: 'never'`.
- `scripts/check-dist.mjs` fails if any HTML contains a `<script>` without `src`
  that is not `application/ld+json`, a `<style>` block or a `style=""`
  attribute.
- The CSP in `infra/cloudflare/headers.tf` carries `'unsafe-inline'` neither in
  `script-src` nor in `style-src`, so the failure cannot be papered over by
  accident.
