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

    for href in PAGE_CSS.get(name, REQUIRED_CSS):
        check(f'href="{href}"' in text, f"{name}: missing stylesheet {href}")

    nav_links = re.findall(r'<a class="nav-link" href="([^"]+)"', text)
    check(len(nav_links) == 4,
          f"{name}: expected 4 static nav links in the served HTML, found {len(nav_links)}")
    check(all(not link.endswith(".html") for link in nav_links),
          f"{name}: a nav link still carries .html ({nav_links})")

    check("svqtriana@gmail.com" in text,
          f"{name}: contact address missing from the served HTML")

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

if failures:
    for message in failures:
        print(f"FAIL {message}")
    sys.exit(1)

print(f"ok: {len(PAGES)} pages consistent")
