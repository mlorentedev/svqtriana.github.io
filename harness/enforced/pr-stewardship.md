> Elaborates Definition of Done §4: what you owe a PR after you push it.

**What binds is the disposition, not the waiting.** Before calling a change done,
disposition every PR check and reviewer output: apply, ticket, or decline with a reason.
Absent a project signal saying when to look back, stay until the first actionable
reviewer comment or ten minutes after checks settle (a new push reopens the window).

**"Hand the PR over; don't watch CI" is this rule's escape, not a contradiction:** where
the project's signal is "the human reviews and reports a red build", no window opens.
Never watch CI in a loop, but still disposition reviewer output.

**A comment is not a review; green checks are not the end of one.** A notice that no
review ran (limit, quota) leaves the PR unreviewed. Tell them apart by content, not
author: a review names files, lines or claims; a notice talks about the review itself.
Proceeding unreviewed is allowed, proceeding silently is not: disclose it ("merged
unreviewed, reviewer quota exhausted").

- **`## Review triage` comment**: record the dispositions on the PR under that heading,
  even "CI green, no review findings". Unwritten reads as nobody having looked.
- **Draft while iterating**: open the PR as a draft (`gh pr create --draft`) while you
  are still pushing to it, and mark it ready (`gh pr ready`) when it is. Reviewers skip
  drafts, so the review reads the finished change, not each intermediate push.
- **A review this repository cannot get is a stated gap.** `pr-agent.yml` guards on
  `head.repo.fork == false`, so a PR from a fork reaches the maintainer with no review
  at all. That is the moment to review by hand, not to merge on green.
