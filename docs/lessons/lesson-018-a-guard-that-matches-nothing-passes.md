---
id: "lesson-018-a-guard-that-matches-nothing-passes"
type: lesson
status: active
title: "A guard whose glob matches nothing passes forever"
created: "2026-11-09"
owner: manu
tags: [svqtriana, lesson]
---

# A guard whose glob matches nothing passes forever

## What happened

`scripts/check-lessons.sh` was supposed to fail when a lesson file existed but
was missing from `docs/lessons/_index.md`. It globbed one naming scheme,
`lesson-NNN-*.md`, while every lesson in the repository is named
`YYYY-MM-DD-*.md`. The glob expanded to nothing, the loop body never ran, and
the script printed `OK (0 lessons)` — a green result that meant "I looked at no
files".

It had been green since it was written. The same shape appeared twice more in
the same review: `edge-drift.yml`'s `push.paths` named files the migration had
deleted (so the workflow never triggered), and its `[ -f "$f" ] || skip` guard
turned a missing file into a silent pass.

## Mechanism

A guard has two jobs: fail when the invariant is violated, and fail when it
cannot tell. A vacuous glob, an empty result set and a skipped file all collapse
into "no violations found", which is indistinguishable from success. The failure
mode is not a bug in the check's logic — it is that the check never reached its
logic, and nothing counted the subjects.

This is the same defect as a test that asserts nothing. It is worse, because a
test's emptiness is visible in the file and a guard's emptiness is only visible
at runtime, under conditions the author did not have in mind.

## What prevents it now

- `check-lessons.sh` accepts both naming schemes through a `LESSON_NAME_PATTERNS`
  array and a `lesson_files()` helper, and its perl index-target regexes accept
  both forms. Verified by construction, not by reading it: injecting
  `docs/lessons/2026-12-01-canary-unindexed.md` makes it fail with `not in
  docs/lessons/_index.md` and exit 1; removing the file returns it to green.
- `edge-drift.yml` asserts bytes for the static files and a `200` plus a "no
  `/encuentro`" content check for the generated ones, on real paths, with no
  skip-on-missing escape hatch.
- `scripts/check-harness.mjs` counts its subjects and names them in its output
  (`2 reviewers, 5 pool members, 3 finding classes, 9 enforced rules`), so a
  registry that stops being read is visible in the line that claims success.
