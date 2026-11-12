---
id: lesson-016-a-check-that-runs-before-the-deploy
type: lesson
status: active
created: "2026-11-09"
owner: manu
tags: [svqtriana, lesson]
---

# A check that runs before the deploy measures the deploy

## What happened

`edge-drift.yml` compared what production served against what the repository
contained. It triggered on `push` to `main`, with a `paths` filter over the
content files. `deploy.yml` triggers on the same `push` to `main`.

The merge landed at `05:59:53`. The drift job started at `06:00:02` and
compared `public/robots.txt` against a production that was still serving the
previous Jekyll build, so it reported drift on a `robots.txt` that was simply
not deployed yet. The deployment went live at `06:00:53`, 51 seconds later.
Re-running the identical job against the identical commit passed.

The workflow's own header explained the push trigger as catching the opposite
mistake — editing one of these files and never deploying it. That is a real
mistake, and this trigger could not detect it. Editing and not deploying means
either editing outside `main`, which never fires this trigger, or merging to
`main` and having the deploy fail, which does fire it — but fires it *before*
the deploy has had the chance to fail, so the comparison is against the previous
deployment either way.

## Mechanism

A verification that fires on the same event as the operation it verifies
measures the state before the operation, not after. The window is not a race
condition to be narrowed with a `sleep`; it is structural. Whatever ordering the
two jobs happen to get is the runner's business, and on a busy morning the check
wins.

It reads as a content bug, which is the expensive part: the failure named a
stale `robots.txt`, and the first hour went into diffing the file and the edge
cache before anyone looked at the timestamps.

The mirror image is a check that passes for the same reason. It would have gone
green if the deploy had been faster, which is not the same as being correct.

## What prevents it now

- `edge-drift.yml` triggers on `workflow_run: workflows: [deploy], types:
  [completed]` with `if: github.event.workflow_run.conclusion == 'success'`, so
  it runs after the deployment lands and a failed deploy skips the comparison
  instead of blaming the edge for it. `schedule` and `workflow_dispatch` are
  unchanged.
- The `paths` filter went with the push trigger. It existed to avoid checking
  when the files had not changed, but the check costs seconds and a silent edge
  rewrite is not worth sampling — the scheduled run cannot use a path filter
  anyway.
- Checkout uses `github.event.workflow_run.head_sha`, not `github.ref`, so a
  second merge landing mid-run cannot make the check diff a newer tree against
  an older deployment.
- A `concurrency` group with `cancel-in-progress: true` pairs with that: two
  deploys inside one run's lifetime would otherwise queue two runs, and the
  older one would diff its own tree against a production the newer one already
  replaced — the same false positive in the opposite direction. The newest
  deploy cancels the rest.
- The same run also failed `checks` on `terraform`, for an unrelated reason:
  `github.com` returned 504 three times inside the 30-second retry window and
  recovered a minute later. That loop now backs off exponentially over roughly
  four minutes, and the provider cache gained `restore-keys` so a lock-file
  change does not lose the warm copy. Same principle, different axis: a gate
  tuned for a blip fails on an outage.
