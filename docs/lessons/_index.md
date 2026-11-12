# Lessons

What broke here, why, and what prevents it now. Most recent first. Recurring
traps are summarised in the *Traps* section of the README; these are the full
accounts.

| Date | Lesson |
|---|---|
| 2026-11-09 | [A check that runs before the deploy measures the deploy](lesson-016-a-check-that-runs-before-the-deploy.md) |
| 2026-11-09 | [A budget set at its own ceiling never fires](lesson-015-a-budget-at-its-own-ceiling-never-fires.md) |
| 2026-11-09 | [A fork PR is reviewed by nobody](lesson-017-a-fork-pr-is-reviewed-by-nobody.md) |
| 2026-11-09 | [A guard whose glob matches nothing passes forever](lesson-018-a-guard-that-matches-nothing-passes.md) |
| 2026-11-08 | [A grid column grows to the longest word](lesson-014-grid-column-grows-to-longest-word.md) |
| 2026-11-05 | [Astro inlines what the CSP forbids](lesson-010-astro-inlines-what-the-csp-forbids.md) |
| 2026-11-05 | [Astro's sitemap is an index, not a sitemap](lesson-013-sitemap-index-is-not-a-sitemap.md) |
| 2026-11-05 | [A fallback heavier than the original](lesson-011-picture-fallback-heavier-than-source.md) |
| 2026-11-05 | [The Astro preview is not GitHub Pages](lesson-012-preview-is-not-pages.md) |
| 2026-11-05 | [An `aria-label` replaces the visible text, it does not complete it](lesson-009-aria-label-hides-visible-text.md) |
| 2026-11-05 | [80 % white on red does not reach 4,5:1](lesson-008-alpha-white-on-brand-red.md) |
| 2026-09-05 | [The pruner read the licence banner as a selector list](lesson-004-pruner-dropped-the-licence.md) |
| 2026-09-05 | [A gate that is its own job status can only answer once](lesson-005-report-verdicts-through-the-checks-api.md) |
| 2026-09-05 | [Turning off a parent feature does not turn off what it turned on](lesson-003-parent-toggle-does-not-undo-child.md) |
| 2026-09-05 | [The edge modifies your response after you write it](lesson-006-the-edge-rewrites-your-response.md) |
| 2026-09-05 | [A guard verified only against the case its author had in mind is not verified](lesson-002-assert-the-discovery-step.md) |
| 2026-09-05 | [A UI check must assert visibility, and run at the width where the answer can be no](lesson-007-ui-check-must-assert-visibility.md) |
| 2026-09-04 | [Merging a stacked PR bottom-first orphans everything above it](lesson-001-stacked-prs-merge-top-down.md) |

## Adding one

One file per lesson, `YYYY-MM-DD-slug.md`, dated when it was learned. Explain
the mechanism, not only the symptom, and end with what detects it now: a check,
a workflow, a line in a runbook. A lesson that changed nothing is a diary page.
