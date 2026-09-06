# A guard verified only against the case its author had in mind is not verified

**2026-09-05.** A check asserted that every service-worker precache URL carried
the version stamp. It matched single-quoted strings, while the same commit
rewrote those entries as backticks so they could interpolate the version. It
found `[]` and passed, on the exact file it was written to guard.

The test written to prove it worked injected a *single-quoted* unversioned
entry: the one form the regex could still see. Both halves of the work shared
the blind spot, so the test went red for a case that was never at risk and
green for the one that was.

**The fix is structural, not a wider regex.** The check now asserts it found at
least five entries *before* checking any of them. A guard that cannot say how
many things it looked at cannot tell you it looked at none.

This generalises past regexes: any check with a discovery step and an
assertion step can pass because discovery returned nothing. Assert the
discovery. The precache check in `scripts/check_pages.py` is the one that does;
the nav-link and `<h1>` checks assert exact counts, which amounts to the same.
