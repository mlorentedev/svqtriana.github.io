---
id: lesson-017-a-fork-pr-is-reviewed-by-nobody
type: lesson
status: active
created: "2026-11-09"
owner: manu
tags: [svqtriana, lesson]
---

# A fork PR reaches the maintainer with no review at all

## What happened

PR #35 arrived from a fork with 244 changed files and zero reviews, and the one
red check was `report`. The assumption in the workflow's own comment — "this
repository has no forks" — had stopped being true, and nothing had noticed.

Two independent guards produced the same silence:

- `pr-agent.yml` runs only when `github.event.pull_request.head.repo.fork ==
  false`, so a fork PR never reaches the reviewer.
- `review-attested.yml` publishes its verdict through the Checks API with
  `POST /check-runs`. On a `pull_request` event from a fork the token is
  read-only, the POST returns 403, and the job fails — which reads as "the
  review gate rejected this" when the truth is "the gate could not speak".

CodeRabbit does not cover it either: it skips repositories under ten stars.

## Mechanism

A fork PR is not a smaller version of a branch PR. GitHub runs the **base
branch's** workflow definitions, not the PR's, and it withholds write
permissions from `GITHUB_TOKEN` because the code is untrusted. Every mechanism
this repository uses to say something about a PR — the review, the check run,
the annotations — is a write. So a fork PR is not "reviewed less"; it is
reviewed by nobody, and the failure is reported as a red check that a maintainer
learns to ignore.

The tempting fix is `pull_request_target`, which does get a write token. It also
runs the base branch's workflow against the PR's code with that token, which
turns "no review" into "arbitrary code execution with write access". The blind
spot is the cheaper problem.

## What prevents it now

- `review-attested.yml` distinguishes the two failures. A `403` or `Resource not
  accessible` emits `::warning::` annotations carrying the verdict and exits 0 —
  advisory on a fork, enforcing everywhere else. Any other POST failure stays
  `::error::` with exit 1, so a real breakage is still red.
- The red `report` check on PR #35 was therefore a permissions fact, not a
  finding about the diff. Nothing was wrong with the change.
- `harness/enforced/pr-stewardship.md` states the consequence: a review this
  repository cannot get is a stated gap, and the maintainer reviews by hand
  instead of merging on green.
