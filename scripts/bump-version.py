#!/usr/bin/env python3
"""Bump the site version everywhere it appears, in one command.

The version lives in four places that must agree:

  1. CACHE_VERSION in sw.js          - names the service worker's caches
  2. sw.js's PRECACHE_URLS           - ?v= on the css/js entries
  3. the ?v= on every css/js URL     - the cache key the browser and
     in the five pages                 Cloudflare actually see
  4. the footer stamp                - what a visitor can read back to you

They agree because check_pages.py fails when they do not, and they are easy to
keep in agreement because of this script. That combination is deliberate: the
README carried "bump CACHE_VERSION" as a written instruction for a year, and
the first change that needed it forgot anyway.

Usage:
    scripts/bump-version.py          # v2.5 -> v2.6
    scripts/bump-version.py 3.0      # explicit
"""
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
    # Minor bump. A major bump is a judgement call, so it is never guessed.
    parts = old.split(".")
    if len(parts) != 2 or not all(p.isdigit() for p in parts):
        sys.exit(f"cannot auto-bump {old!r}: pass the new version explicitly")
    new = f"{parts[0]}.{int(parts[1]) + 1}"

if new == old:
    sys.exit(f"already at v{old}")

sw_path.write_text(
    sw.replace(f"const CACHE_VERSION = 'v{old}';",
               f"const CACHE_VERSION = 'v{new}';", 1),
    encoding="utf-8")
print(f"sw.js: v{old} -> v{new}")

# The precache list interpolates ASSET_VERSION, so it needs no edit - but say
# so, rather than leaving the reader to wonder whether it was missed.
print("sw.js: PRECACHE_URLS interpolate ASSET_VERSION, nothing to change")

for name in PAGES:
    p = REPO / name
    t = p.read_text(encoding="utf-8")
    t, urls = re.subn(rf"\?v={re.escape(old)}\b", f"?v={new}", t)
    t, stamp = re.subn(rf'(<a class="footer-version"[^>]*>)v{re.escape(old)}(</a>)',
                       rf"\g<1>v{new}\g<2>", t)
    t, label = re.subn(rf'(aria-label="Versión )v{re.escape(old)}', rf"\g<1>v{new}", t)
    if not urls or not stamp:
        sys.exit(f"{name}: expected asset URLs and a footer stamp at v{old}, "
                 f"found {urls} and {stamp}")
    p.write_text(t, encoding="utf-8")
    print(f"{name}: {urls} asset URLs, footer stamp, aria-label ({label})")

print(f"\nNow run: python3 scripts/check_pages.py")
