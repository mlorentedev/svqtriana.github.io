# Merging a stacked PR bottom-first orphans everything above it

**2026-09-04.** Three stacked PRs: #5 (feat -> main), #6 (chore -> feat),
#7 (infra -> chore). Each was reviewable on its own and the stack was the right
shape for review.

#5 was merged into main first. GitHub then merged #6 into
`feat/season-2026-27-poster` and #7 into `chore/seo-and-asset-cleanup`, branches
that had already been merged and abandoned. All three PRs showed MERGED, every
check was green, and nothing reported a problem. But main contained only #5's
commit: two PRs' worth of work sat on dead branches. The failure is silent by
construction, because merging into an already-merged branch is a legal
operation GitHub has no reason to warn about.

**Merge a stack top-down, or retarget as you go.** Merge the topmost PR into
its parent until only the bottom one remains, then merge that into main. If the
bottom goes first, every remaining PR must be retargeted to main before merging.

**Verify by consequence, not by PR state.** After merging a stack, check that a
file introduced by the top PR exists on main:

```sh
git cat-file -e main:path/to/file
```

MERGED only means the head reached its base, and that base may be a branch
nobody will merge again.
