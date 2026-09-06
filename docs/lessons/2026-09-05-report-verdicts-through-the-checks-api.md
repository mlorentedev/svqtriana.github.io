# A gate that is its own job status can only answer once

**2026-09-05.** Four PRs (#13, #14, #16, #17) merged within minutes of a
CodeRabbit "review limit reached" notice, each carrying a green
`CodeRabbit: SUCCESS` status and zero reviews (issue #19). A status that goes
green when the check did not run is worse than no status, because it reads as
an answer. The one PR that did get a review, #15, got it 6m25s *after* the
merge, with a correct Major finding nobody read at the time.

The first gate (#20) reported through its own job's exit status, and that
pinned it to one instant: the moment its trigger fired, which is before the
notice arrives. Every later symptom traced back to that:

- **`issue_comment` cannot clear a check on a PR.** An `issue_comment` workflow
  runs against the default branch, so its implicit check run lands on `main`'s
  sha. Two green runs sat beside a red one on #22 while the PR stayed blocked,
  and the trigger had to be removed (#23).
- **It went green on #25 for the exact case it exists to catch** (issue #26):
  0 reviews, 1 notice, `attested: SUCCESS`, because the notice arrived after
  the evaluation. Re-running by hand went red, and "remember to re-run" is the
  kind of instruction that fails.

**Create the check run explicitly against the PR head sha, and let the job
always exit 0** (#27). `POST /repos/{repo}/check-runs` creates a new run each
time rather than updating one, and GitHub shows a PR the newest run of a given
name (the list endpoint defaults to `filter=latest`), so any trigger can
re-answer, `issue_comment` included: the notice arriving and the disclosure
being written both re-report by themselves. #28 carried two `attested` runs on
one head sha and showed one.
Concurrency is keyed on the PR number so a stale older run cannot overwrite a
newer verdict.

Two review findings on that change are worth keeping:

- **Fork PRs get a read-only token whatever `checks: write` says.** The POST
  would 403 and the job would die with no explanation, a gate that vanishes
  rather than reports. It now detects that and names the verdict it could not
  publish.
- **`pull_request_target` was declined** as the fix for that. It runs with a
  write token in the base repository's context and is the trigger every
  hardening guide warns about. This repository has no forks. If forks ever
  matter, the answer is `workflow_run`, which separates the untrusted build
  from the privileged report.

The gate does not forbid merging unreviewed. It forbids doing so silently.
