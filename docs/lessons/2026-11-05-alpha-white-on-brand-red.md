# 80 % white on red does not reach 4,5:1

## What happened

The featured price card used `text-white/80` and `text-white/85` over
`bg-sevilla-500` (#df0606). Axe computed 3,51:1 and 3,86:1. The text was small
(12 and 14 px), so the AA threshold is 4,5:1. The brand red is dark but not dark
enough: any white with alpha loses the contrast that pure white does have
(5,2:1).

## Mechanism

Contrast is computed on the **composited** colour, not the declared one. A
Tailwind `/80` is not "a soft white": it is white mixed with the background, and
the result drifts towards the red. On a card with 12 px text there is no margin.

## What prevents it now

`PriceCard.astro` uses `text-white` for the label and for the price with shirt
in the featured variant. `tests/a11y.spec.ts` runs axe on `/` and fails if
`color-contrast` comes back as `serious` or `critical`. The palette and the
verified pairs are in `src/styles/global.css`.
