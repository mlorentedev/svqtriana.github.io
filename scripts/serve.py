#!/usr/bin/env python3
"""Serve the site the way GitHub Pages serves it.

`python3 -m http.server` 404s on /nosotros because there is no such file, but
GitHub Pages falls back to nosotros.html. Testing against the stock server
therefore says the nav is broken when it is not - and, worse, would say nothing
if it really were. This server does the same fallback, plus the 404.html page,
so a local check means something.

    scripts/serve.py [port]
"""

import functools
import http.server
import socketserver
import sys
from pathlib import Path

REPO = Path(__file__).resolve().parent.parent


class PagesHandler(http.server.SimpleHTTPRequestHandler):
    def translate_path(self, path: str) -> str:
        resolved = Path(super().translate_path(path))
        # /nosotros -> nosotros.html, the GitHub Pages "pretty URL" fallback.
        if not resolved.exists() and not resolved.suffix:
            candidate = resolved.with_suffix(".html")
            if candidate.is_file():
                return str(candidate)
        return str(resolved)

    def send_error(self, code, message=None, explain=None):
        custom = REPO / "404.html"
        if code == 404 and custom.is_file():
            body = custom.read_bytes()
            self.send_response(404)
            self.send_header("Content-Type", "text/html; charset=utf-8")
            self.send_header("Content-Length", str(len(body)))
            self.end_headers()
            if self.command != "HEAD":
                self.wfile.write(body)
            return
        super().send_error(code, message, explain)

    def end_headers(self):
        # Never let a stale asset survive an edit during local development.
        self.send_header("Cache-Control", "no-store")
        super().end_headers()

    def log_message(self, fmt, *args):
        sys.stderr.write("%s %s\n" % (self.address_string(), fmt % args))


def main() -> int:
    port = int(sys.argv[1]) if len(sys.argv) > 1 else 8000
    handler = functools.partial(PagesHandler, directory=str(REPO))
    socketserver.TCPServer.allow_reuse_address = True
    with socketserver.TCPServer(("", port), handler) as httpd:
        print(f"serving {REPO} on http://localhost:{port} (GitHub Pages URL rules)")
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\nstopped")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
