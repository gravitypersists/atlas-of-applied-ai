"""Acceptance tests for the atlas map build (SPEC.md §6, criteria 2–4).

    python3 map/acceptance_test.py

Runs the real build against throwaway changes and checks the permanence guarantees:

  1. determinism: two builds are byte-identical, and a no-change build writes nothing to map/atlas/
  2. permanence: settling new nodes (on a temporarily accepted survey) never moves a landmark, sinks
     land, or changes a territory claim, and new nodes land near their parents
  3. frontier: a maturity 1-2 node settles on an islet of its own
  4. growth: raising that node to maturity 3 grows land and joins it to its parent's landmass
  5. retirement: removing a node from the backbone keeps its position and land
  6. drawn positions: a curated `at` moves where a landmark is drawn and leaves the terrain alone

backbone.json, map/curation.yaml, everything under map/atlas and map/public/map.json are backed up first and always
restored, whatever happens. Needs Node (with `npm install` done in map/) and Python 3.
"""

import json
import math
import re
import shutil
import subprocess
import sys
import tempfile
from pathlib import Path

MAP = Path(__file__).resolve().parent
ROOT = MAP.parent
CURATION = MAP / "curation.yaml"
FILES = [ROOT / "backbone.json", CURATION, MAP / "atlas" / "ledger.yaml", MAP / "atlas" / "terrain.json", MAP / "public" / "map.json"]

failures = []


def check(ok, msg):
    print(f"  {'ok  ' if ok else 'FAIL'} {msg}")
    if not ok:
        failures.append(msg)


def build(*args, ok=True):
    r = subprocess.run(["node", str(MAP / "build.mjs"), *args], capture_output=True, text=True)
    if not ok:
        return r
    if r.returncode != 0:
        raise RuntimeError(f"build {' '.join(args)} failed:\n{r.stdout}{r.stderr}")
    return r.stdout


def ledger():
    entries = []
    for line in (MAP / "atlas" / "ledger.yaml").read_text().splitlines():
        if line.startswith("  - {"):
            entries.append(dict(re.findall(r'(\w+): "?([^,"}]+)"?', line)))
    return entries


def terrain():
    """Decoded land and owner grids from terrain.json, plus land components."""
    js = f"""
const T = await import({json.dumps((MAP / 'terrain.mjs').as_uri())});
const fs = (await import('fs')).default;
const t = JSON.parse(fs.readFileSync({json.dumps(str(MAP / 'atlas' / 'terrain.json'))}));
const n = t.width * t.height;
const land = T.rleDecode(t.land, n), owner = T.rleDecode(t.owner, n);
const {{ label }} = T.components({{ width: t.width, height: t.height }}, land);
process.stdout.write(JSON.stringify({{ width: t.width, cell: t.cell, regions: t.regions, land: Array.from(land), owner: Array.from(owner), label: Array.from(label) }}));
"""
    r = subprocess.run(["node", "--input-type=module", "-e", js], capture_output=True, text=True, check=True)
    return json.loads(r.stdout)


def component(t, x, y):
    return t["label"][int(y // t["cell"]) * t["width"] + int(x // t["cell"])]


def node(id, region, parents, maturity):
    return {
        "id": id, "name": id, "region": region, "maturity": maturity, "date": "2026-09", "status": "added",
        "ref": {"title": "acceptance test"},
        "parents": [{"id": p, "rel": "extends", "why": "test", "src": "test"} for p in parents],
    }


def main():
    backup = Path(tempfile.mkdtemp(prefix="atlas-acceptance-"))
    for f in FILES:
        shutil.copy(f, backup / f.name)
    try:
        print("1. determinism")
        build()
        snap = {f: f.read_bytes() for f in FILES}
        build()
        check(all(f.read_bytes() == snap[f] for f in FILES), "a second build is byte-identical")

        print("2. permanence (survey temporarily accepted)")
        y = (MAP / "atlas" / "ledger.yaml").read_text()
        (MAP / "atlas" / "ledger.yaml").write_text(y.replace("accepted: false", "accepted: true"))
        build()
        L0, T0 = ledger(), terrain()
        bb = json.loads((ROOT / "backbone.json").read_text())
        bb["nodes"] += [
            node("test-mixed", "retrieval-and-knowledge", ["graph-rag", "retrieval-augmented-generation", "knowledge-graphs"], 3),
            node("test-outpost", "agents-and-orchestration", ["react-agent-loop"], 1),
            node("test-old", "symbolic-ai-planning", ["pddl"], 4),
        ]
        (ROOT / "backbone.json").write_text(json.dumps(bb))
        build()
        L1, T1 = ledger(), terrain()
        pos = {e["id"]: (float(e["x"]), float(e["y"])) for e in L1}
        check(L1[: len(L0)] == L0, "existing ledger entries are unchanged")
        check(len(L1) == len(L0) + 3, "three nodes were appended")
        check(not any(a and not b for a, b in zip(T0["land"], T1["land"])), "no land sank")
        check(not any(a != 255 and a != b for a, b in zip(T0["owner"], T1["owner"])), "no territory claim changed")
        for t, parents in [("test-mixed", ["graph-rag", "retrieval-augmented-generation"]), ("test-old", ["pddl"])]:
            d = min(math.dist(pos[t], pos[p]) for p in parents)
            check(d < 400, f"{t} settled near its parents ({d:.0f} units from the nearest)")
        build()
        check(ledger() == L1 and terrain()["land"] == T1["land"], "a no-change rebuild changes nothing")

        print("3. frontier islet")
        c = component(T1, *pos["test-outpost"])
        others = [i for i, p in pos.items() if i != "test-outpost" and component(T1, *p) == c]
        check(c >= 0 and not others, "the maturity-1 node sits on an islet of its own")

        print("4. growth")
        for n in bb["nodes"]:
            if n["id"] == "test-outpost":
                n["maturity"] = 3
        (ROOT / "backbone.json").write_text(json.dumps(bb))
        build()
        T2 = terrain()
        check(ledger() == L1, "raising maturity moves no landmark")
        check(not any(a and not b for a, b in zip(T1["land"], T2["land"])), "no land sank")
        check(sum(T2["land"]) > sum(T1["land"]), "land grew")
        check(component(T2, *pos["test-outpost"]) == component(T2, *pos["react-agent-loop"]), "the islet joined its parent's landmass")

        print("5. retirement")
        bb["nodes"] = [n for n in bb["nodes"] if n["id"] != "test-old"]
        (ROOT / "backbone.json").write_text(json.dumps(bb))
        build()
        T3 = terrain()
        check("retired: [test-old]" in (MAP / "atlas" / "ledger.yaml").read_text(), "the node moved to the retired list")
        check(any(e["id"] == "test-old" for e in ledger()), "its ledger entry still reserves its position")
        check(not any(a and not b for a, b in zip(T2["land"], T3["land"])), "its land was kept")

        print("6. drawn positions")
        def draw_at(id, x, y):
            text = CURATION.read_text()
            assert "\nnodes:\n" in text
            CURATION.write_text(text.replace("\nnodes:\n", f"\nnodes:\n  {id}: {{at: [{x}, {y}]}}\n", 1))
        moved = "retrieval-augmented-generation"
        ax, ay = pos[moved]
        region = T3["regions"].index("retrieval-and-knowledge")
        cell = lambda x, y: int(y // T3["cell"]) * T3["width"] + int(x // T3["cell"])
        target = next(((ax + dx, ay + dy) for dx in range(40, 0, -4) for dy in (0, 20, -20)
                       if T3["owner"][cell(ax + dx, ay + dy)] == region), None)
        check(target is not None, "found a spot in the landmark's own territory to move it to")
        snap = {f: f.read_bytes() for f in FILES if f.parent.name == "atlas"}
        draw_at(moved, *target)
        build()
        m = json.loads((MAP / "public" / "map.json").read_text())
        drawn = next(l for l in m["landmarks"] if l["id"] == moved)
        check((drawn["x"], drawn["y"]) == target, "the landmark is drawn at its curated position")
        check(all(f.read_bytes() == b for f, b in snap.items()), "the ledger and terrain are byte-identical")
        check(any(r["path"].startswith(f"M{target[0]:g},{target[1]:g}Q") for r in m["routes"] if r["from"] == moved),
              "routes start from where the landmark is drawn")
        shutil.copy(backup / CURATION.name, CURATION)
        draw_at(moved, 10, 10)
        r = build(ok=False)
        check(r.returncode != 0 and "at sea" in r.stderr, "a curated position at sea fails the build")
    finally:
        for f in FILES:
            shutil.copy(backup / f.name, f)
        shutil.rmtree(backup, ignore_errors=True)
        print("restored backbone.json, map/curation.yaml, map/atlas, map/public/map.json")

    print(f"\n{'all checks passed' if not failures else f'{len(failures)} check(s) failed'}")
    sys.exit(1 if failures else 0)


if __name__ == "__main__":
    main()
