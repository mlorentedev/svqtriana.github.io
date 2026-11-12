---
id: lesson-009-aria-label-hides-visible-text
type: lesson
status: active
created: "2026-11-05"
owner: manu
tags: [svqtriana, lesson]
---

# An `aria-label` replaces the visible text, it does not complete it

## What happened

The footer social links had `aria-label="Contactar por Instagram"` and the
visible text `@PS_SVQTRIANA`. Axe flagged `label-content-name-mismatch`: the
accessible name does not contain the visible text. A voice-control user saying
"pulsa @PS_SVQTRIANA" does not activate the link, because the name the browser
exposes is a different one. The same happened on the product card and on the
videos.

## Mechanism

The accessible name is computed by precedence: `aria-label` wins over the
content. They are not summed; the `aria-label` replaces it. WCAG 2.5.3 (Label in
Name) requires the visible text to be contained in the accessible name, so a
"cleaner" but different `aria-label` is a defect, not an improvement.

## What prevents it now

The `aria-label`s include the visible text
(`Contactar por Instagram: @PS_SVQTRIANA`, `Pídelo: <producto> por Instagram…`)
and the new-tab suffix goes in a `<span class="sr-only">`, not in an
`aria-label` that hides the rest. `tests/a11y.spec.ts` runs axe with the WCAG
2.0/2.1 A and AA tags on all five pages and fails on any `serious` or `critical`
violation.
