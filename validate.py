"""Validate backbone.yaml and emit backbone.json.

Checks: unique ids, parent resolution, relationship enum, region membership,
date order (child not older than parent), maturity range, cycles, missing
sources, per-region anchor counts, layer values, and the shape of reader
content (resources, learning paths). Exits non-zero on hard errors.
"""
import json
import sys
from collections import Counter, defaultdict
from pathlib import Path

import yaml

HERE = Path(__file__).parent
MIN_APPLIED = 8


def date_key(d):
    s = str(d)
    parts = s.split("-")
    year = int(parts[0])
    month = int(parts[1]) if len(parts) > 1 else None
    return year, month


def older(child, parent):
    """True if child date is strictly earlier than parent date."""
    cy, cm = date_key(child)
    py, pm = date_key(parent)
    if cy != py:
        return cy < py
    if cm is None or pm is None:
        return False
    return cm < pm


def check_resources(owner, items, kinds, errors, need_why=False):
    """Resources and learning-path entries: {kind, title, url, by?, year?, why?}."""
    if not isinstance(items, list):
        errors.append(f"{owner}: resources must be a list")
        return
    seen = set()
    for i, r in enumerate(items):
        where = f"{owner} resource {i + 1}"
        if not isinstance(r, dict):
            errors.append(f"{where}: not a mapping")
            continue
        if r.get("kind") not in kinds:
            errors.append(f"{where}: bad kind '{r.get('kind')}'")
        if not r.get("title"):
            errors.append(f"{where}: missing title")
        url = str(r.get("url") or "")
        if not url.startswith(("https://", "http://")):
            errors.append(f"{where}: missing or non-http url")
        elif url in seen:
            errors.append(f"{where}: duplicate url {url}")
        seen.add(url)
        if need_why and not r.get("why"):
            errors.append(f"{where}: learning-path entry needs a why")


def main():
    data = yaml.safe_load((HERE / "backbone.yaml").read_text())
    rels = set(data["meta"]["relationship_types"])
    layers = set(data["meta"]["layers"])
    kinds = set(data["meta"]["resource_kinds"])
    regions = {r["id"]: r for r in data["regions"]}
    nodes = data["nodes"]
    by_id = {}
    errors, warnings = [], []

    for n in nodes:
        if n["id"] in by_id:
            errors.append(f"duplicate id: {n['id']}")
        by_id[n["id"]] = n

    externals = set()
    for n in nodes:
        if n["region"] not in regions:
            errors.append(f"{n['id']}: unknown region {n['region']}")
        for r in n.get("also", []) or []:
            if r not in regions:
                errors.append(f"{n['id']}: unknown secondary region {r}")
        if not 1 <= int(n["maturity"]) <= 5:
            errors.append(f"{n['id']}: maturity out of range")
        if not n.get("ref", {}).get("title"):
            errors.append(f"{n['id']}: missing key reference")
        if n.get("layer", "core") not in layers:
            errors.append(f"{n['id']}: bad layer '{n.get('layer')}'")
        if "resources" in n:
            check_resources(n["id"], n["resources"], kinds, errors)
            ref = n.get("ref", {})
            ref_url = ref.get("url") or (f"https://arxiv.org/abs/{ref['arxiv']}" if ref.get("arxiv") else None)
            if ref_url and any(r.get("url") == ref_url for r in n["resources"] if isinstance(r, dict)):
                warnings.append(f"{n['id']}: a resource repeats the key reference")
        for p in n.get("parents", []) or []:
            if p["rel"] not in rels:
                errors.append(f"{n['id']}: bad relationship '{p['rel']}'")
            if not p.get("src"):
                warnings.append(f"{n['id']} <- {p['id']}: missing edge source")
            if p["id"].startswith("external:"):
                externals.add(p["id"])
                continue
            if p["id"] not in by_id:
                errors.append(f"{n['id']}: parent '{p['id']}' does not resolve")
                continue
            if older(n["date"], by_id[p["id"]]["date"]):
                errors.append(
                    f"{n['id']} ({n['date']}) predates parent {p['id']} ({by_id[p['id']]['date']})"
                )

    # cycle check
    state = {}

    def visit(nid, stack):
        state[nid] = 1
        for p in by_id[nid].get("parents", []) or []:
            pid = p["id"]
            if pid not in by_id:
                continue
            if state.get(pid) == 1:
                errors.append("cycle: " + " -> ".join(stack + [pid]))
            elif pid not in state:
                visit(pid, stack + [pid])
        state[nid] = 2

    for nid in by_id:
        if nid not in state:
            visit(nid, [nid])

    for rid, r in regions.items():
        if "learning_path" in r:
            check_resources(f"region {rid}", r["learning_path"], kinds, errors, need_why=True)

    counts = Counter(n["region"] for n in nodes)
    for rid, r in regions.items():
        if r["kind"] == "applied" and counts[rid] < MIN_APPLIED:
            errors.append(f"region {rid} has {counts[rid]} anchors (< {MIN_APPLIED})")
        if r["kind"] == "root" and counts[rid] < 2:
            warnings.append(f"root {rid} has {counts[rid]} anchors")
        if r["kind"] == "applied" and not r.get("title"):
            warnings.append(f"region {rid} has no map title")

    cross = sum(
        1
        for n in nodes
        for p in n.get("parents", []) or []
        if p["id"] in by_id and by_id[p["id"]]["region"] != n["region"]
    )
    edges = sum(len(n.get("parents", []) or []) for n in nodes)
    status = Counter(n["status"] for n in nodes)
    layer_counts = Counter(n.get("layer", "core") for n in nodes)
    with_resources = sum(1 for n in nodes if n.get("resources"))

    children = defaultdict(list)
    for n in nodes:
        for p in n.get("parents", []) or []:
            children[p["id"]].append(n["id"])

    out = {
        "meta": data["meta"],
        "regions": data["regions"],
        "boundary_rules": data["boundary_rules"],
        "nodes": nodes,
        "external_ancestors": sorted(externals),
    }
    (HERE / "backbone.json").write_text(json.dumps(out, indent=2, ensure_ascii=False))

    lines = [
        f"nodes: {len(nodes)}  edges: {edges}  cross-region edges: {cross}  external ancestors: {len(externals)}",
        f"status: {dict(status)}  layers: {dict(layer_counts)}  with resources: {with_resources}",
        "per region:",
    ]
    for rid, r in regions.items():
        lines.append(f"  {r['kind']:7} {rid:36} {counts[rid]}")
    lines.append(f"errors: {len(errors)}")
    lines += ["  " + e for e in errors]
    lines.append(f"warnings: {len(warnings)}")
    lines += ["  " + w for w in warnings]
    report = "\n".join(lines)
    (HERE / "validation-report.txt").write_text(report + "\n")
    print(report)
    sys.exit(1 if errors else 0)


if __name__ == "__main__":
    main()
