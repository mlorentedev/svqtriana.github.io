# The pruner read the licence banner as a selector list

**2026-09-05.** `css/bootstrap.css` shipped without Bootstrap's MIT copyright
and permission notice, and without the `:root` custom properties that sat
directly under it. MIT requires the notice to accompany all copies or
substantial portions of the work, and 683 lines of Bootstrap's own
declarations kept byte for byte is a substantial portion.

**Mechanism.** `split_top_level()` in `scripts/prune-bootstrap.py` skipped
comments while scanning for brace depth but never advanced `start` past them,
so the leading `/*!` banner stayed glued to the front of the following chunk.
`prune_rule()` then treated

```
/*! * Bootstrap v4.3.1 (https://getbootstrap.com/) ... */
:root {
```

as a selector list, split it on the comma inside "Twitter, Inc." and matched
`.com` in `getbootstrap.com` as a class on both halves. Neither half survived,
so the whole chunk went, banner and `:root` together. It also broke the
script's own stated invariant that class-free selectors are kept
unconditionally.

**Two things to carry forward.** A render comparison proves nothing moved
visually and nothing about what else the file must contain; licence text has no
computed style. And when a tool's stated invariant can be checked cheaply
(`:root` must survive, the banner must survive), check it rather than trusting
the tool that promises it. See Job 4 in `docs/runbooks/maintenance.md` before
running the pruner again.
