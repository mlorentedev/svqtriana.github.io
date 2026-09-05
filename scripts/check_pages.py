#!/usr/bin/env python3
"""Assert the invariants the five pages must share, and the ones they must not.

Every check here corresponds to something that has actually gone wrong in this
repository, not to a general style preference:

- all five pages once shipped the same <title>, and every og:url claimed to be
  the home page
- replacing the loadCSS shim with static tags silently dropped a stylesheet
  from one page and Google Fonts from four
- the header and footer are copy-pasted across five files now that they are
  static markup, so nothing but a check keeps them in step

Run it directly, or let CI run it: scripts/check_pages.py
"""

import re
import sys
from pathlib import Path

REPO = Path(__file__).resolve().parent.parent
PAGES = ["index.html", "nosotros.html", "productos.html", "media.html", "encuentro.html"]

REQUIRED_CSS = ["css/fonts.css", "css/style.css", "css/bootstrap.css", "css/responsive.css"]
# productos is the only page that renders a bxSlider.
PAGE_CSS = {"productos.html": REQUIRED_CSS + ["css/jquery.bxslider.css"]}

failures: list[str] = []


def check(condition: bool, message: str) -> None:
    if not condition:
        failures.append(message)


def one(pattern: str, text: str) -> str | None:
    found = re.search(pattern, text, re.S)
    return found.group(1).strip() if found else None


def block(name: str, text: str) -> str | None:
    """The header or footer element, normalised for whitespace."""
    found = re.search(rf"<{name}\b.*?</{name}>", text, re.S)
    return re.sub(r"\s+", " ", found.group(0)) if found else None


pages = {name: (REPO / name).read_text(encoding="utf-8") for name in PAGES}

titles: dict[str, str] = {}
canonicals: dict[str, str] = {}
headers: dict[str, str] = {}
footers: dict[str, str] = {}

for name, text in pages.items():
    title = one(r"<title>(.*?)</title>", text)
    check(bool(title), f"{name}: no <title>")
    if title:
        titles[name] = title

    canonical = one(r'<link rel="canonical" href="(.*?)"', text)
    check(bool(canonical), f"{name}: no rel=canonical")
    if canonical:
        canonicals[name] = canonical
        check(not canonical.endswith(".html"),
              f"{name}: canonical still carries .html ({canonical})")

    og_url = one(r'<meta property="og:url"\s+content="(.*?)"', text)
    check(og_url == canonical,
          f"{name}: og:url ({og_url}) disagrees with canonical ({canonical})")

    check(text.count("<h1") == 1, f"{name}: expected exactly one <h1>, found {text.count('<h1')}")

    # Matched up to the query string: the hrefs carry a ?v= cache-busting
    # stamp, checked for separately at the bottom of this file.
    for href in PAGE_CSS.get(name, REQUIRED_CSS):
        check(re.search(rf'href="{re.escape(href)}(?:\?[^"]*)?"', text) is not None,
              f"{name}: missing stylesheet {href}")

    nav_links = re.findall(r'<a class="nav-link" href="([^"]+)"', text)
    check(len(nav_links) == 4,
          f"{name}: expected 4 static nav links in the served HTML, found {len(nav_links)}")
    check(all(not link.endswith(".html") for link in nav_links),
          f"{name}: a nav link still carries .html ({nav_links})")

    check("svqtriana@gmail.com" in text,
          f"{name}: contact address missing from the served HTML")

    # css/bootstrap.css is v4 and hides the menu with `.collapse:not(.show)`,
    # while js/bootstrap.min.js is v3 and toggles the v3 class `in`, which no
    # stylesheet here defines. Leaving the button on data-toggle="collapse"
    # therefore produces a menu that changes class and never appears - which is
    # exactly what shipped once, because the check asserted the class changed
    # rather than that the menu became visible.
    check('data-toggle="collapse"' not in text,
          f"{name}: the toggler is back on Bootstrap's data-toggle; the bundled "
          f"JS is v3 and the CSS is v4, so the menu will never open on mobile")

    header, footer = block("header", text), block("footer", text)
    check(bool(header), f"{name}: no <header> in the served HTML")
    check(bool(footer), f"{name}: no <footer> in the served HTML")
    if header:
        headers[name] = header
    if footer:
        footers[name] = footer

duplicates = {t for t in titles.values() if list(titles.values()).count(t) > 1}
check(not duplicates, f"pages share a <title>: {sorted(duplicates)}")

repeated = {c for c in canonicals.values() if list(canonicals.values()).count(c) > 1}
check(not repeated, f"pages share a canonical URL: {sorted(repeated)}")

# The chrome is duplicated across five files by hand; drift is the cost.
for group, label in ((headers, "header"), (footers, "footer")):
    distinct = set(group.values())
    if len(distinct) > 1:
        reference = group[PAGES[0]]
        odd = sorted(n for n, v in group.items() if v != reference)
        failures.append(f"the {label} has drifted out of sync on: {odd}")

nav_js = (REPO / "js" / "performance.js").read_text(encoding="utf-8")
check("classList.toggle('show')" in nav_js,
      "js/performance.js no longer toggles the 'show' class: the mobile menu "
      "depends on it, because the bundled Bootstrap JS and CSS are different "
      "major versions")

# Asserting that both strings exist does not connect the button to the menu.
# performance.js returns silently when getElementById misses, so a renamed id
# leaves this green and the menu dead - the same shape of hole that let the
# original breakage ship.
# Anchored on the menu declaration specifically: performance.js has more
# than one getElementById, and matching the first one found the footer year.
target = re.search(r"const menu = document\.getElementById\('([^']+)'\)", nav_js)
check(bool(target), "js/performance.js no longer looks up the menu by id")
if target:
    menu_id = target.group(1)
    for name, text in pages.items():
        check(f'id="{menu_id}"' in text,
              f"{name}: performance.js toggles #{menu_id}, which this page "
              f"does not contain - the menu would not open")
        check(f'aria-controls="{menu_id}"' in text,
              f"{name}: the toggler's aria-controls does not name #{menu_id}")

# Every local CSS/JS URL carries ?v=<CACHE_VERSION>, in the pages and in the
# Service Worker's precache list alike.
#
# This is the guard for a bug that shipped: css/style.css changed content under
# the same filename while rules were deleted from the pages' inline <style>.
# Two caches then serve the old file - the SW's STATIC_CACHE (cache-first, 30
# days) and Cloudflare's edge (7 days) - so returning visitors get new HTML with
# old CSS. A query string is a fresh cache key for both, and CACHE_VERSION is
# the one knob that moves it. Without this check the knob is merely documented,
# and the README already documented it the time it was forgotten.
sw = (REPO / "sw.js").read_text(encoding="utf-8")
declared = one(r"const CACHE_VERSION = 'v([^']+)'", sw)
check(bool(declared), "sw.js no longer declares CACHE_VERSION")

if declared:
    stamp = f"?v={declared}"
    for name, text in pages.items():
        stale = [m.group(0) for m in
                 re.finditer(r'(?:href|src)="(?:css|js)/[^"]+', text)
                 if not m.group(0).endswith(stamp)]
        check(not stale,
              f"{name}: {len(stale)} local asset URL(s) not stamped {stamp} "
              f"- bump CACHE_VERSION in sw.js and restamp: {stale[:2]}")

    # The footer shows the same value, which is the only reason it is worth
    # showing: it tells a visitor which assets they actually received, rather
    # than an abstract release number this site does not have. A version
    # string that can drift is worse than none.
    for name, text in pages.items():
        shown = one(r'<a class="footer-version"[^>]*>(v[^<]+)</a>', text)
        check(shown == f"v{declared}",
              f"{name}: footer shows {shown}, sw.js declares v{declared}")

        # The aria-label carries the version too, and it is the only form a
        # screen-reader user gets. Checking the visible text alone let a stale
        # label pass a check whose whole point is that the version cannot lie.
        spoken = one(r'<a class="footer-version"[^>]*aria-label="Versión (v[^ "]+)', text)
        check(spoken == f"v{declared}",
              f"{name}: footer aria-label says {spoken}, sw.js declares v{declared}")

    # Every css/js entry in PRECACHE_URLS, whichever way it is quoted.
    #
    # The first version of this matched single quotes only, and the same commit
    # rewrote those entries as backticks so they could interpolate
    # ASSET_VERSION. It therefore found nothing and passed for the wrong
    # reason - vacuously true, on the exact file it was written to guard. The
    # test that was meant to prove it worked injected a SINGLE-QUOTED entry,
    # which is the one form it could still see.
    #
    # So: find the entries first, assert there are some, then check each one.
    # A guard that cannot say how many things it checked cannot tell you it
    # checked nothing.
    entries = re.findall(r"[`'\"](/(?:css|js)/[^`'\"]+)[`'\"]", sw)
    check(len(entries) >= 5,
          f"sw.js precaches {len(entries)} css/js URLs; expected at least 5. "
          f"Either the precache list shrank or this check has gone blind to "
          f"the way the entries are now written")

    unversioned = [e for e in entries if "?v=" not in e]
    check(not unversioned,
          f"sw.js precaches unversioned URLs {unversioned}: the pages request "
          f"them with {stamp}, so these entries are stored under a key nothing "
          f"reads and the precache is wasted")

if failures:
    for message in failures:
        print(f"FAIL {message}")
    sys.exit(1)

print(f"ok: {len(PAGES)} pages consistent")
