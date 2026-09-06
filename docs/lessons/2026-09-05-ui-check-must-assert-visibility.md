# A UI check must assert visibility, and run at the width where the answer can be no

**2026-09-05.** The JS-built nav was replaced with static HTML and the
hand-written toggle handler deleted, on the reasoning that Bootstrap would wire
`data-toggle="collapse"` itself once the markup was static. Verified with a
scripted click, and shipped.

The mobile menu was dead on all five pages and the check was green, for two
independent reasons, either of which alone would have sufficed:

- **It asserted the wrong property.** It read the class list, saw `collapse`
  become `collapse in`, and called that success. Changing class is not becoming
  visible: the bundled CSS was Bootstrap v4, which hides via
  `.collapse:not(.show)`, while the bundled JS was v3, toggling an `in` class no
  stylesheet defined.
- **It ran at 1568px**, where `.navbar-expand-lg .navbar-collapse` has
  `display: flex !important`, so the nav shows regardless of any class. The test
  could not have failed at that width even if the code had been deleted.

**Assert the user-visible consequence, never the mechanism:** bounding-box
height, computed `display`/`visibility`, and a count of reachable links. A class
name is an implementation detail that can change while the outcome does not.

**Run responsive checks at a width where the failure is expressible.** A
breakpoint-dependent behaviour verified above its breakpoint is not verified.
Before trusting a green check, ask whether it could have gone red, then
reintroduce the bug and watch it fail.

Adjacent trap: a vendored CSS and JS pair from the same library can be
different major versions. Check both before assuming a plugin's markup contract
holds. The site now has no Bootstrap JS at all; the toggle is a few lines of
vanilla JS in `js/performance.js`.
