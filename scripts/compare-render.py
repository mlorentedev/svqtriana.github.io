#!/usr/bin/env python3
"""Prove that pruning css/bootstrap.css did not move anything on the page.

scripts/prune-bootstrap.py drops rules whose selectors nothing in the markup
can match. That reasoning is sound and still worth checking against a browser,
because the question is not "is the CSS smaller" but "does every element still
compute the same style". This renders each page under the original stylesheet
and under the pruned one and compares the computed style of every element.

    # 1. put the original back, so there is something to compare against
    git show <base>:css/bootstrap.css > /tmp/bootstrap-original.css

    # 2. compare
    scripts/compare-render.py /tmp/bootstrap-original.css

Exits non-zero and prints the first differences if anything moved.

Requires Chrome or Chromium on PATH and the `websockets` package; both are
checked for up front. No other dependency, which is why this talks to the
DevTools protocol directly rather than through Playwright.

Why this exists: the prune's headline claim - 187K down to 12K with no
rendering change - was made in a pull request that referenced this file
without shipping it. The claim happened to be true; a reader had no way to
establish that. A verification script that is cited but absent is worse than
none, because it reads as evidence.
"""

import argparse
import asyncio
import http.server
import json
import shutil
import socketserver
import subprocess
import sys
import tempfile
import threading
import time
from pathlib import Path

REPO = Path(__file__).resolve().parent.parent
TARGET = REPO / "css" / "bootstrap.css"
PAGES = ["index.html", "nosotros.html", "productos.html", "media.html", "encuentro.html"]
WIDTHS = [375, 768, 1024, 1440, 1920]

# Every property that layout or visual regression would show up in. Comparing
# the full computed style instead would report hundreds of no-op differences
# in properties nothing here sets.
PROPERTIES = [
    "display", "position", "top", "right", "bottom", "left", "float", "clear",
    "width", "height", "min-width", "max-width", "min-height", "max-height",
    "margin-top", "margin-right", "margin-bottom", "margin-left",
    "padding-top", "padding-right", "padding-bottom", "padding-left",
    "border-top-width", "border-right-width", "border-bottom-width", "border-left-width",
    "border-radius", "box-sizing", "overflow-x", "overflow-y",
    "flex-direction", "flex-wrap", "justify-content", "align-items", "align-self",
    "flex-grow", "flex-shrink", "flex-basis", "order", "gap",
    "font-family", "font-size", "font-weight", "font-style", "line-height",
    "letter-spacing", "text-align", "text-transform", "text-decoration-line",
    "color", "background-color", "background-image", "background-size",
    "background-position", "background-repeat",
    "opacity", "visibility", "z-index", "transform", "box-shadow",
    "list-style-type", "vertical-align", "white-space",
]

PROBE = """
(() => {
  const props = %s;
  const out = [];
  const nodes = document.querySelectorAll('*');
  for (let i = 0; i < nodes.length; i++) {
    const el = nodes[i];
    const cs = getComputedStyle(el);
    const r = el.getBoundingClientRect();
    const row = {
      i,
      tag: el.tagName,
      cls: el.className && el.className.baseVal !== undefined
             ? el.className.baseVal : (el.className || ''),
      box: [Math.round(r.x), Math.round(r.y), Math.round(r.width), Math.round(r.height)],
      s: {}
    };
    for (const p of props) row.s[p] = cs.getPropertyValue(p);
    out.push(row);
  }
  return JSON.stringify(out);
})()
""" % json.dumps(PROPERTIES)


class Handler(http.server.SimpleHTTPRequestHandler):
    """Serves the repository, resolving /nosotros to nosotros.html like Pages."""

    def translate_path(self, path: str) -> str:
        resolved = Path(super().translate_path(path))
        if not resolved.exists() and not resolved.suffix and not path.rstrip("?").endswith("/"):
            candidate = resolved.with_suffix(".html")
            if candidate.is_file():
                return str(candidate)
        return str(resolved)

    def log_message(self, *args):
        pass


def serve(directory: Path) -> tuple[socketserver.TCPServer, int]:
    handler = lambda *a, **kw: Handler(*a, directory=str(directory), **kw)
    httpd = socketserver.TCPServer(("127.0.0.1", 0), handler)
    threading.Thread(target=httpd.serve_forever, daemon=True).start()
    return httpd, httpd.server_address[1]


def find_chrome() -> str:
    for name in ("google-chrome", "chromium", "chromium-browser", "google-chrome-stable"):
        path = shutil.which(name)
        if path:
            return path
    sys.exit("no Chrome or Chromium on PATH; this script needs one to render")


async def probe_all(port: int, chrome: str) -> dict[tuple[str, int], list]:
    import websockets

    profile = tempfile.mkdtemp(prefix="compare-render-")
    proc = subprocess.Popen(
        [chrome, "--headless=new", "--disable-gpu", "--no-first-run",
         "--remote-debugging-port=0", f"--user-data-dir={profile}", "about:blank"],
        stdout=subprocess.DEVNULL, stderr=subprocess.PIPE, text=True)

    ws_url = None
    deadline = time.time() + 30
    while time.time() < deadline:
        line = proc.stderr.readline()
        if not line:
            if proc.poll() is not None:
                sys.exit("Chrome exited before reporting a DevTools endpoint")
            continue
        if "ws://" in line:
            ws_url = line[line.index("ws://"):].strip()
            break
    if not ws_url:
        proc.terminate()
        sys.exit("timed out waiting for Chrome's DevTools endpoint")

    results: dict[tuple[str, int], list] = {}
    try:
        async with websockets.connect(ws_url, max_size=None) as browser:
            msg_id = 0

            async def send(method, params=None, session=None):
                nonlocal msg_id
                msg_id += 1
                frame = {"id": msg_id, "method": method, "params": params or {}}
                if session:
                    frame["sessionId"] = session
                await browser.send(json.dumps(frame))
                while True:
                    reply = json.loads(await browser.recv())
                    if reply.get("id") == msg_id:
                        if "error" in reply:
                            raise RuntimeError(f"{method}: {reply['error']}")
                        return reply.get("result", {})

            target = await send("Target.createTarget", {"url": "about:blank"})
            attached = await send("Target.attachToTarget",
                                  {"targetId": target["targetId"], "flatten": True})
            session = attached["sessionId"]
            await send("Page.enable", session=session)

            for page in PAGES:
                for width in WIDTHS:
                    await send("Emulation.setDeviceMetricsOverride",
                               {"width": width, "height": 900, "deviceScaleFactor": 1,
                                "mobile": width < 768},
                               session=session)
                    await send("Page.navigate",
                               {"url": f"http://127.0.0.1:{port}/{page}"}, session=session)
                    # No load event to wait on over a flat session without more
                    # plumbing; the pages are local and tiny, and the probe is
                    # retried until the document has elements.
                    for _ in range(40):
                        await asyncio.sleep(0.1)
                        got = await send("Runtime.evaluate",
                                         {"expression": PROBE, "returnByValue": True},
                                         session=session)
                        rows = json.loads(got["result"]["value"])
                        if len(rows) > 5:
                            break
                    results[(page, width)] = rows
    finally:
        proc.terminate()
        proc.wait(timeout=10)
        shutil.rmtree(profile, ignore_errors=True)
    return results


def compare(before: dict, after: dict, limit: int) -> int:
    differences = 0
    for key in sorted(before):
        page, width = key
        rows_a, rows_b = before[key], after.get(key, [])
        if len(rows_a) != len(rows_b):
            print(f"FAIL {page} @{width}px: {len(rows_a)} elements before, "
                  f"{len(rows_b)} after")
            differences += 1
            continue
        for a, b in zip(rows_a, rows_b):
            label = f"{a['tag'].lower()}" + (f".{a['cls'].split()[0]}" if a["cls"] else "")
            if a["box"] != b["box"]:
                differences += 1
                if differences <= limit:
                    print(f"FAIL {page} @{width}px {label}: box {a['box']} -> {b['box']}")
            for prop, value in a["s"].items():
                if b["s"].get(prop) != value:
                    differences += 1
                    if differences <= limit:
                        print(f"FAIL {page} @{width}px {label}: "
                              f"{prop} {value!r} -> {b['s'].get(prop)!r}")
    return differences


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__,
                                     formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("original", type=Path,
                        help="the unpruned css/bootstrap.css to compare against")
    parser.add_argument("--limit", type=int, default=20,
                        help="how many differences to print before summarising")
    args = parser.parse_args()

    if not args.original.is_file():
        sys.exit(f"{args.original}: not a file")

    chrome = find_chrome()
    try:
        import websockets  # noqa: F401
    except ImportError:
        sys.exit("this script needs the websockets package: pip install websockets")

    pruned = TARGET.read_text(encoding="utf-8")
    original = args.original.read_text(encoding="utf-8")
    if pruned == original:
        sys.exit("css/bootstrap.css and the reference are identical; nothing to compare")

    httpd, port = serve(REPO)
    try:
        print(f"rendering {len(PAGES)} pages x {len(WIDTHS)} widths under the original CSS")
        TARGET.write_text(original, encoding="utf-8")
        before = asyncio.run(probe_all(port, chrome))

        print("rendering the same under the pruned CSS")
        TARGET.write_text(pruned, encoding="utf-8")
        after = asyncio.run(probe_all(port, chrome))
    finally:
        # Always leave the pruned stylesheet in place, including on Ctrl-C:
        # exiting with the original restored would look like the prune had
        # been reverted.
        TARGET.write_text(pruned, encoding="utf-8")
        httpd.shutdown()

    differences = compare(before, after, args.limit)
    combos = len(PAGES) * len(WIDTHS)
    if differences:
        print(f"\n{differences} difference(s) across {combos} page/width combinations")
        return 1
    elements = sum(len(v) for v in before.values())
    print(f"\nok: {combos} page/width combinations, {elements} elements, "
          f"no computed-style or box differences")
    return 0


if __name__ == "__main__":
    sys.exit(main())
