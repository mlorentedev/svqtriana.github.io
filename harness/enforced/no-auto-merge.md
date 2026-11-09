- **Auto-merge is forbidden.** Never run `gh pr merge --auto`, never enable
  "Auto-merge" in the GitHub UI, and keep the repo setting `allow_auto_merge=false`.
  Auto-merge lands a PR the instant CI goes green, bypassing the human review gate.
- Every PR merges deliberately, after review and with CI green. Merge is a supervised
  action, never a queued automatic one. An agent merges only when the user has
  authorized merging that specific PR.

## Merging is publishing

`.github/workflows/deploy.yml` publishes on push to `main`, so **a merge to
`main` is a deploy**. There is no staging environment and no undo button beyond
reverting the merge and letting the workflow run again, which republishes the
previous state but does not undo anything a visitor already saw.

This makes the review gate a production gate, not a formality: the merge button
is the deploy button. It also means the Pages source must already be
`GitHub Actions` before the first Astro commit lands, because the same push
would otherwise fire the legacy Jekyll build and serve a 404 for every route.
That flip is a manual operation and is never bundled into a PR merge without the
user saying so for that merge.
