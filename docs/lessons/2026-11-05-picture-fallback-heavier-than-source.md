# A fallback heavier than the original

## What happened

The wristband only had a 386 px WebP master. `astro:assets` with
`<Picture formats={['avif', 'webp']}>` uses the source file's format as the
fallback for browsers without AVIF or WebP, so the fallback was generated as
PNG: 275 kB for a 21 kB image. A browser that supported neither AVIF nor WebP
downloaded thirteen times more than necessary, and Lighthouse noticed.

## Mechanism

`<Picture>` does not choose the fallback by size but by format: it derives it
from the import's `ImageMetadata`. A WebP master forces the fallback to PNG. The
fix is not to touch the component but to convert the master to JPEG, which every
browser understands and which `sharp` compresses well.

## What prevents it now

- `src/assets/productos/pulsera.jpg` is the import `productos.ts` uses;
  `scripts/convert-pulsera.mjs` documents where it came from.
- `scripts/check-dist.mjs` fails if **any** PNG appears in `dist/_astro/`. Every
  master in the site is JPEG or WebP, so a PNG can only come from this fallback.
  A generic kB budget would not have worked: the poster and several stickers
  legitimately weigh more than 250 kB.
