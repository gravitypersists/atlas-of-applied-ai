"""Dev server for the atlas viewer: like `python3 -m http.server`, but sends no-cache headers.

The plain server sends no caching headers, so browsers cache map.json, app.js and style.css
heuristically and keep showing a stale layout after a rebuild.

    python3 map/serve.py [port]      # default 8000; serves map/public
"""

import functools
import http.server
import sys
from pathlib import Path

PUBLIC = Path(__file__).resolve().parent / "public"


class NoCacheHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header("Cache-Control", "no-store")
        super().end_headers()


if __name__ == "__main__":
    port = int(sys.argv[1]) if len(sys.argv) > 1 else 8000
    handler = functools.partial(NoCacheHandler, directory=str(PUBLIC))
    print(f"serving {PUBLIC} at http://localhost:{port}")
    http.server.ThreadingHTTPServer(("", port), handler).serve_forever()
