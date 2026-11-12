> Binds existing rules to the moment of closing; it does not restate them.

Working code is not a finished change. Before saying done, each of these is true:

1. **Debt** — every defect noticed along the way is fixed in scope or filed as a ticket
   with its root cause. A mention in conversation is not an exit.
2. **Knowledge** — what was learned is written where it belongs, this session:
   build/operate detail in `docs/runbooks/`, failure modes in `docs/lessons/` (formatted
   with `dotf lessons fmt`; `repo-hygiene.yml` checks it with `dotf lessons fmt --check`). The PR
   names it in a `## Knowledge` section, one line each for Lesson and Runbook: a path
   the PR adds or changes, or `none: <reason>`.
3. **Board** — the ticket matches reality: picked up when you start, blocked when
   blocked, closed with the change that closed it.
4. **Review** — an open PR is not finished work. Its checks and its reviewer comments
   are triaged, and each comment is applied, ticketed, or declined with a reason.
5. **Evidence** — no completion claim without the command output that proves it,
   produced in this session. In this repository that is `npm run verify` plus
   `node scripts/check-harness.mjs`, `dotf lessons fmt --check --dir docs/lessons` and
   `bash scripts/check-actions-pinned.sh`.

Any of the five may be skipped, but only as a stated decision naming which one and why.
Silence is not a skip.
