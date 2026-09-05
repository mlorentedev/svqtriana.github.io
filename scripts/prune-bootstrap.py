#!/usr/bin/env python3
"""Cut css/bootstrap.css down to the rules this site's markup can actually match.

Bootstrap ships 1512 class definitions; the five pages between them use a few
dozen. Rewriting the needed rules by hand is how layouts break, so this keeps
Bootstrap's own declarations byte-for-byte and only drops the rules nothing can
select. Whether it worked is decided by comparing rendered pages, not by reading
the output — see scripts/compare-render.py.

    scripts/prune-bootstrap.py            # report only
    scripts/prune-bootstrap.py --write    # rewrite css/bootstrap.css

IT READS THE FILE IT REWRITES, so running it a second time prunes the already
pruned stylesheet. Adding a class to a page and re-running restores nothing:
the rule for that class is not in the input any more. The full stylesheet only
exists in git history, so start from there every time:

    git show f12cc73:css/bootstrap.css > css/bootstrap.css   # last unpruned copy
    scripts/prune-bootstrap.py --write

f12cc73 is the last commit that carried the complete 10043-line stylesheet.
If that hash ever goes stale, `git log --oneline -- css/bootstrap.css` finds
it again: it is the entry before the one whose message mentions pruning.
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
            end = len(css) if end == -1 else end + 2
            if depth == 0:
                # A top-level comment is emitted as its own chunk rather than
                # skipped over. Skipping advanced `i` but not `start`, so the
                # comment stayed glued to the front of the rule that followed
                # it - and the selector parser then read the Bootstrap banner
                # as a selector list: it split inside "Twitter, Inc." and
                # matched ".com" in getbootstrap.com as a class. Neither half
                # survived, so the banner AND the :root block it preceded were
                # both dropped. That shipped.
                before = css[start:i]
                if before.strip():
                    chunks.append(before)
                chunks.append(css[i:end])
                start = end
            i = end
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
        if stripped.startswith("/*"):
            # Licence banners travel with the code. MIT requires the copyright
            # and permission notice to accompany all copies or substantial
            # portions, and what this script emits is 683 lines of Bootstrap's
            # own declarations, byte for byte. `/*!` is the long-standing
            # convention for "a minifier must not strip this"; ordinary
            # comments carry no such obligation and are dropped.
            if stripped.startswith("/*!"):
                out.append(stripped)
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
