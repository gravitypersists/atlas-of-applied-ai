"""Writes the viewer as a claude.ai artifact page: index.html without its document skeleton.

    python3 map/artifact_page.py <out.html>

Artifacts wrap the published page in their own <!doctype>/<html>/<head>/<body>, so the page itself must
not carry them. Everything else (title, font and stylesheet links, markup, scripts) is kept as is, and
app.js, style.css and map.json are published alongside it as supporting files (SPEC.md §8, Hosting).
"""

import re
import sys
from pathlib import Path

src = (Path(__file__).resolve().parent / "public" / "index.html").read_text()
head = re.search(r"<head>(.*)</head>", src, re.S).group(1)
body = re.search(r"<body>(.*)</body>", src, re.S).group(1)
# The artifact skeleton supplies charset and viewport metas.
head = "\n".join(line for line in head.splitlines() if "<meta" not in line)
page = f"{head.strip()}\n{body.strip()}\n"
out = Path(sys.argv[1])
out.parent.mkdir(parents=True, exist_ok=True)
out.write_text(page)
print(f"wrote {sys.argv[1]}")
