# Lessons

What broke here, why, and what prevents it now. Most recent first. Recurring
traps are summarised in the *Traps* section of the README; these are the full
accounts.

| Date | Lesson |
|---|---|
| 2026-11-09 | [A budget set at its own ceiling never fires](2026-11-09-a-budget-at-its-own-ceiling-never-fires.md) |
| 2026-11-09 | [A fork PR is reviewed by nobody](2026-11-09-a-fork-pr-is-reviewed-by-nobody.md) |
| 2026-11-09 | [A guard whose glob matches nothing passes forever](2026-11-09-a-guard-that-matches-nothing-passes.md) |
| 2026-11-08 | [A grid column grows to the longest word](2026-11-08-grid-column-grows-to-longest-word.md) |
| 2026-11-05 | [Astro inlines what the CSP forbids](2026-11-05-astro-inlines-what-the-csp-forbids.md) |
| 2026-11-05 | [Astro's sitemap is an index, not a sitemap](2026-11-05-sitemap-index-is-not-a-sitemap.md) |
| 2026-11-05 | [A fallback heavier than the original](2026-11-05-picture-fallback-heavier-than-source.md) |
| 2026-11-05 | [The Astro preview is not GitHub Pages](2026-11-05-preview-is-not-pages.md) |
| 2026-11-05 | [An `aria-label` replaces the visible text, it does not complete it](2026-11-05-aria-label-hides-visible-text.md) |
| 2026-11-05 | [80 % white on red does not reach 4,5:1](2026-11-05-alpha-white-on-brand-red.md) |
| 2026-09-05 | [The pruner read the licence banner as a selector list](2026-09-05-pruner-dropped-the-licence.md) |
| 2026-09-05 | [A gate that is its own job status can only answer once](2026-09-05-report-verdicts-through-the-checks-api.md) |
| 2026-09-05 | [Turning off a parent feature does not turn off what it turned on](2026-09-05-parent-toggle-does-not-undo-child.md) |
| 2026-09-05 | [The edge modifies your response after you write it](2026-09-05-the-edge-rewrites-your-response.md) |
| 2026-09-05 | [A guard verified only against the case its author had in mind is not verified](2026-09-05-assert-the-discovery-step.md) |
| 2026-09-05 | [A UI check must assert visibility, and run at the width where the answer can be no](2026-09-05-ui-check-must-assert-visibility.md) |
| 2026-09-04 | [Merging a stacked PR bottom-first orphans everything above it](2026-09-04-stacked-prs-merge-top-down.md) |

## Adding one

One file per lesson, `YYYY-MM-DD-slug.md`, dated when it was learned. Explain
the mechanism, not only the symptom, and end with what detects it now: a check,
a workflow, a line in a runbook. A lesson that changed nothing is a diary page.
