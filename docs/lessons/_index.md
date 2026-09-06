# Lessons

What went wrong here, why, and what now prevents it. Newest first. The
recurring traps are summarised in the README's *Traps* section; these are the
full accounts.

| Date | Lesson |
|---|---|
| 2026-09-05 | [The pruner read the licence banner as a selector list](2026-09-05-pruner-dropped-the-licence.md) |
| 2026-09-05 | [A gate that is its own job status can only answer once](2026-09-05-report-verdicts-through-the-checks-api.md) |
| 2026-09-05 | [Turning off a parent feature does not turn off what it turned on](2026-09-05-parent-toggle-does-not-undo-child.md) |
| 2026-09-05 | [The edge modifies your response after you write it](2026-09-05-the-edge-rewrites-your-response.md) |
| 2026-09-05 | [A guard verified only against the case its author had in mind is not verified](2026-09-05-assert-the-discovery-step.md) |
| 2026-09-05 | [A UI check must assert visibility, and run at the width where the answer can be no](2026-09-05-ui-check-must-assert-visibility.md) |
| 2026-09-04 | [Merging a stacked PR bottom-first orphans everything above it](2026-09-04-stacked-prs-merge-top-down.md) |

## Adding one

One file per lesson, `YYYY-MM-DD-slug.md`, dated by when it was learned. State
the mechanism, not just the symptom, and end with what now catches it: a check,
a workflow, a line in a runbook. A lesson that changed nothing is a diary entry.
