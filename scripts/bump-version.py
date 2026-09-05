#!/usr/bin/env python3
"""Bump the site version everywhere it appears, in one command.

The version is the deploy date: `vYYYYMMDD`, with `.N` appended for a second
deploy on the same day. Calendar versioning rather than semantic, because
nothing here is a dependency anyone pins - there is no API to break, and the
question a version actually answers on this site is "how current is what I am
looking at". `v20260905` answers that to a visitor and to whoever is debugging
a stale cache. `v2.5` answered it to nobody.

It lives in five places that must agree:

  1. CACHE_VERSION in sw.js          - names the service worker's caches
  2. sw.js's PRECACHE_URLS           - ?v= on the css/js entries
  3. the ?v= on every css/js URL     - the cache key the browser and
     in the five pages                 Cloudflare actually see
  4. the footer stamp and its        - what a visitor can read back to you,
     aria-label                        including through a screen reader
  5. the newest CHANGELOG.md heading - what that version actually changed

They agree because check_pages.py fails when they do not, and they are easy to
keep in agreement because of this script. That combination is deliberate: the
README carried "bump CACHE_VERSION" as a written instruction for a year, and
the first change that needed it forgot anyway.

Usage:
    scripts/bump-version.py            # today's date
    scripts/bump-version.py 20261101   # explicit

It does not write the CHANGELOG entry - that is the one part a human has to
think about, and generating "various fixes" would defeat the point.
"""
from datetime import date
from pathlib import Path
import re
import sys

REPO = Path(__file__).resolve().parent.parent
PAGES = ["index.html", "nosotros.html", "productos.html", "media.html", "encuentro.html"]

sw_path = REPO / "sw.js"
sw = sw_path.read_text(encoding="utf-8")

found = re.search(r"const CACHE_VERSION = 'v([^']+)';", sw)
if not found:
    sys.exit("sw.js: CACHE_VERSION not found")
old = found.group(1)

if len(sys.argv) > 1:
    new = sys.argv[1].lstrip("v")
else:
    today = date.today().strftime("%Y%m%d")
    # A second deploy on the same day still has to change the cache key, so the
    # date grows a counter rather than colliding. Without this the second
    # deploy of a day would ship new HTML against yesterday's cached CSS - the
    # exact failure the versioning exists to prevent.
    if old == today:
        new = f"{today}.1"
    elif old.startswith(f"{today}."):
        new = f"{today}.{int(old.split('.')[1]) + 1}"
    else:
        new = today

if new == old:
    sys.exit(f"already at v{old}")

if not re.fullmatch(r"\d{8}(\.\d+)?", new):
    sys.exit(f"v{new} is not a deploy date: expected vYYYYMMDD or vYYYYMMDD.N")

# Everything is rewritten in memory and checked before anything reaches disk.
# Writing sw.js first and validating the pages afterwards left the tree holding
# a bumped service worker beside pages still on the old stamp whenever a page
# did not match - a state check_pages.py rejects and nothing here would undo.
pending: list[tuple[Path, str]] = [
    (sw_path, sw.replace(f"const CACHE_VERSION = 'v{old}';",
                         f"const CACHE_VERSION = 'v{new}';", 1)),
]
report: list[str] = [f"sw.js: v{old} -> v{new}"]

for name in PAGES:
    p = REPO / name
    t = p.read_text(encoding="utf-8")
    t, urls = re.subn(rf"\?v={re.escape(old)}\b", f"?v={new}", t)
    t, stamp = re.subn(rf'(<a class="footer-version"[^>]*>)v{re.escape(old)}(</a>)',
                       rf"\g<1>v{new}\g<2>", t)
    t, label = re.subn(rf'(aria-label="Versión )v{re.escape(old)}', rf"\g<1>v{new}", t)
    # The aria-label counts too. It is the version a screen-reader user is
    # given, and check_pages.py compares it, so accepting zero replacements
    # here just moves the failure one command later.
    if not (urls and stamp and label):
        sys.exit(f"{name}: expected asset URLs, a footer stamp and an aria-label "
                 f"at v{old}; found {urls}, {stamp} and {label}. Nothing written.")
    pending.append((p, t))
    report.append(f"{name}: {urls} asset URLs, footer stamp, aria-label")

for path, text in pending:
    path.write_text(text, encoding="utf-8")
for line in report:
    print(line)

# The precache list interpolates ASSET_VERSION, so it needs no edit - but say
# so, rather than leaving the reader to wonder whether it was missed.
print("sw.js: PRECACHE_URLS interpolate ASSET_VERSION, nothing to change")
print("\nNow run: python3 scripts/check_pages.py")
