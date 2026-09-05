#!/usr/bin/env python3
"""Cut css/bootstrap.css down to the rules this site's markup can actually match.

Bootstrap ships 1512 class definitions; the five pages between them use a few
dozen. Rewriting the needed rules by hand is how layouts break, so this keeps
Bootstrap's own declarations byte-for-byte and only drops the rules nothing can
select. Whether it worked is decided by comparing rendered pages, not by reading
the output — see scripts/compare-render.py.

    scripts/prune-bootstrap.py            # report only
    scripts/prune-bootstrap.py --write    # rewrite css/bootstrap.css
"""

import argparse
import re
import sys
from pathlib import Path

REPO = Path(__file__).resolve().parent.parent
SOURCE = REPO / "css" / "bootstrap.css"

# Selectors with no class at all (html, body, *, ::before, [hidden]…) are kept
# unconditionally: they are the reset, and dropping them changes everything.
CLASS_RE = re.compile(r"\.(-?[_a-zA-Z][\w-]*)")


def used_classes() -> set[str]:
    used: set[str] = set()
    for page in REPO.glob("*.html"):
        text = page.read_text(encoding="utf-8")
        for group in re.findall(r'class="([^"]*)"', text):
            used.update(group.split())
        # Classes this site's own JS adds at runtime, which no markup shows.
        used.update({"show", "font-loading", "font-loaded"})
    return used


def split_top_level(css: str) -> list[str]:
    """Split a stylesheet into top-level chunks (rules and at-rules)."""
    chunks, depth, start, in_str = [], 0, 0, ""
    i = 0
    while i < len(css):
        c = css[i]
        if in_str:
            if c == "\\":
                i += 2
                continue
            if c == in_str:
                in_str = ""
        elif c in "\"'":
            in_str = c
        elif c == "/" and css[i:i + 2] == "/*":
            end = css.find("*/", i)
            i = len(css) if end == -1 else end + 2
            continue
        elif c == "{":
            depth += 1
        elif c == "}":
            depth -= 1
            if depth == 0:
                chunks.append(css[start:i + 1])
                start = i + 1
        i += 1
    tail = css[start:].strip()
    if tail:
        chunks.append(tail)
    return chunks


def selector_kept(selector: str, used: set[str]) -> bool:
    """Keep a selector when every class it names is one the markup uses."""
    classes = CLASS_RE.findall(selector)
    if not classes:
        return True                      # reset / element / attribute rules
    return all(c in used for c in classes)


def prune_rule(chunk: str, used: set[str]) -> str | None:
    head, _, body = chunk.partition("{")
    selectors = [s.strip() for s in head.split(",") if s.strip()]
    kept = [s for s in selectors if selector_kept(s, used)]
    if not kept:
        return None
    return ",\n".join(kept) + " {" + body


def prune(css: str, used: set[str]) -> str:
    out = []
    for chunk in split_top_level(css):
        stripped = chunk.strip()
        if not stripped:
            continue
        if stripped.startswith("@media") or stripped.startswith("@supports"):
            head, _, rest = stripped.partition("{")
            inner = rest.rstrip()[:-1]           # drop the closing brace
            inner_kept = [r for r in (prune_rule(c, used) for c in split_top_level(inner)) if r]
            if inner_kept:
                out.append(head + "{\n" + "\n".join(inner_kept) + "\n}")
        elif stripped.startswith("@"):
            out.append(stripped)                 # @charset, @font-face, @keyframes
        else:
            kept = prune_rule(stripped, used)
            if kept:
                out.append(kept)
    return "\n".join(out) + "\n"


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--write", action="store_true", help="rewrite css/bootstrap.css in place")
    args = parser.parse_args()

    css = SOURCE.read_text(encoding="utf-8")
    used = used_classes()
    pruned = prune(css, used)

    before, after = len(css), len(pruned)
    print(f"{SOURCE.relative_to(REPO)}: {before // 1024}K -> {after // 1024}K "
          f"({100 * (before - after) // before}% smaller), "
          f"{len(css.splitlines())} -> {len(pruned.splitlines())} lines")

    if args.write:
        SOURCE.write_text(pruned, encoding="utf-8")
        print("written - now run scripts/compare-render.py to prove nothing moved")
    else:
        print("dry run; pass --write to apply")
    return 0


if __name__ == "__main__":
    sys.exit(main())
