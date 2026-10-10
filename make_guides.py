"""Generate one deep-dive research guide per applied region from backbone.yaml.

Each guide is a ready-to-paste research prompt plus a reference appendix. Guides
are regenerated from the backbone, so re-run this after any backbone change.
"""
from pathlib import Path

import yaml

HERE = Path(__file__).parent
OUT = HERE / "deep-dives"

# Leads surfaced by the two Gemini runs that are not backbone anchors.
# The deep dive should evaluate each: include as a node, fold into an anchor, or reject.
LEADS = {
    "planning-and-reasoning": [
        ("STaR (self-taught reasoner; iterative fine-tuning on self-generated rationales) as an anchor", "2203.14465"),
        ("Portfolio Beam Search and diversity-aware search under PRM uncertainty (single blog source; verify adoption)", None),
    ],
    "ai-product-and-interaction-design": [
        ("Checkpoints, rewind and collaborative repair (\"The Collaboration Gap in Human-AI Work\")", "2604.18096"),
        ("Impact previews and staged execution for consequential agent actions", None),
    ],
}


def ref_str(ref):
    s = ref["title"]
    if ref.get("arxiv"):
        s += f" — arXiv:{ref['arxiv']}"
    elif ref.get("url"):
        s += f" — {ref['url']}"
    return s


def main():
    data = yaml.safe_load((HERE / "backbone.yaml").read_text())
    regions = {r["id"]: r for r in data["regions"]}
    nodes = data["nodes"]
    by_id = {n["id"]: n for n in nodes}
    rels = data["meta"]["relationship_types"]
    tiers = data["meta"]["maturity_tiers"]
    OUT.mkdir(exist_ok=True)

    def index_entry(n):
        names = [n["name"], *(n.get("aliases") or [])]
        return f"{n['id']} ({'; '.join(names)})"

    id_index = "\n".join(
        f"- {rid}: " + ", ".join(index_entry(n) for n in nodes if n["region"] == rid)
        for rid in regions
    )
    region_ids = ", ".join(regions)
    rel_lines = "\n".join(f"- {k}: {v}" for k, v in rels.items())
    tier_lines = "\n".join(f"{k} {v}" for k, v in tiers.items())

    index_rows = []
    for rid, r in regions.items():
        if r["kind"] != "applied":
            continue
        anchors = [n for n in nodes if n["region"] == rid]
        guests = [n for n in nodes if rid in (n.get("also") or []) and n["region"] != rid]
        rules = [b for b in data["boundary_rules"] if rid in str(b["home"])]
        # cross-region bridges touching this region
        bridges = []
        for n in nodes:
            for p in n.get("parents") or []:
                if p["id"] not in by_id:
                    continue
                a, b = by_id[p["id"]], n
                if (a["region"] == rid) != (b["region"] == rid):
                    bridges.append(f"{b['id']} --{p['rel']}--> {a['id']}")

        anchor_lines = "\n".join(
            f"- `{n['id']}` — {n['name']} (maturity {n['maturity']}, {n['date']})"
            for n in anchors
        )
        guest_lines = "\n".join(
            f"- `{n['id']}` — {n['name']} (home: {n['region']})" for n in guests
        ) or "- none"
        rule_lines = "\n".join(f"- {b['concept']} → {b['home']}: {b['rule']}" for b in rules) or "- none specific to this region"
        focus = "\n".join(f"- {f}" for f in r.get("deep_dive_focus", []))
        leads = LEADS.get(rid, [])
        lead_lines = "\n".join(
            f"- {t}" + (f" (arXiv:{a})" if a else "") for t, a in leads
        ) or "- none"
        seed_sources = "\n".join(f"- {n['name']}: {ref_str(n['ref'])}" for n in anchors)

        prompt = f"""I'm building a lineage graph of applied AI engineering that will be rendered as an interactive map. Each region of the map is a discipline; each node is a technique, pattern, or method; edges record what each node was built on. This run is a DEEP DIVE into one region: **{r['name']}**. A backbone of stable ids already exists — attach everything you find to it.

## The region
{r['definition']}

Boundary with neighboring regions: {r.get('distinct_from', '')}

Boundary rules (apply these exactly; if you disagree, say so in Amendments rather than breaking them):
{rule_lines}

## Perspective and scope
- Take the view of a practicing AI engineer building products and systems, not a model researcher.
- Cover the field through 2026. 2024–2026 work is easy to under-represent — look for it deliberately.
- A node is a technique, pattern, method, or discipline. Products, libraries, frameworks, benchmarks, and companies are NOT nodes; list them under `examples`.
- Target {r.get('node_target', '15–30')} nodes for this region in total, counting the existing anchors below. Quality over count: leave out research-only ideas that no practitioner would meet unless they're real ancestors of something that matters.
- Before adding a node, check the backbone index at the end (ids, names, and aliases across ALL regions). If the concept already exists anywhere, even in another region or under an alias, attach to that id (correct it, or add an alias or example). Never re-create it under a new id.

## Existing anchors in this region (keep these ids; you may correct their fields)
{anchor_lines}

Nodes homed elsewhere that also touch this region:
{guest_lines}

## Questions to answer
{focus}
- What are the major sub-areas of this region, and what is the lineage within each?
- Which techniques here were superseded, and by what?
- Where does this region draw on other regions, and where do other regions draw on it?

## Leads from earlier research runs to evaluate
For each: add it as a node, fold it into an existing anchor as an alias or example, or reject it with a reason.
{lead_lines}

## Output

The learning path (Section 1) and the nodes (Section 2) are parsed by a script. Put each in ONE fenced ```yaml block, exactly in the shapes below, with nothing else inside the block. Prose goes outside the blocks.

### Section 1: Region overview (for map readers)
200–300 words a curious engineer would read when they open this region on the map: what the region is, how it evolved, the 3–5 landmarks worth knowing, and where it's heading. Plain language, no hype.

Then a learning path: 4–6 resources in the order a newcomer should take them. Mix primary papers, a survey or tutorial, practitioner write-ups, and recorded talks.

```yaml
learning_path:
  - {{kind: <paper | talk | blog | docs | tutorial | code>, title: "<title>", by: "<author or org>", year: <YYYY>, url: "<url>", why: "<one sentence: what the reader gets from it>"}}
```

### Section 2: Nodes
Return every node — existing anchors (with any corrections) and new ones — as one YAML list:

```yaml
nodes:
  - id: <kebab-case; reuse backbone ids exactly>
    name: <name>
    aliases: [<alias>, ...]
    region: <region id>
    also: [<secondary REGION ids only, never node ids>]
    layer: <core | detail>
    desc: <1–2 sentences, technical>
    summary: <2–3 plain-language sentences for map readers: what it is and why it matters>
    parents:
      - {{id: <backbone id, new node id from this run, or external:<name>>, rel: <relationship type>, why: "<one sentence>", src: "<citation supporting the lineage claim>", confidence: <high | medium | low>}}
    maturity: <1–5>
    maturity_note: <one-sentence justification>
    date: "<YYYY or YYYY-MM of origin>"
    ref: {{title: "<originating paper or announcement>", arxiv: "<id>"}}   # or url: "<url>" when there's no arXiv id
    resources:
      - {{kind: <paper | talk | blog | docs | tutorial | code>, title: "<title>", by: "<author or org>", year: <YYYY>, url: "<url>"}}
    examples: [<products, libraries, systems>]
    status: <existing | new>
```

Field rules:
- `layer`: `core` if a newcomer needs this node on the region's overview map; `detail` if it's finer-grained knowledge that only shows when zoomed in. Existing anchors are `core` unless you argue otherwise in Amendments. Expect most new nodes to be `detail`.
- `also`: allowed values are {region_ids}.
- `src` is required on every parent edge. If you can't cite the lineage claim, lower `confidence` and say why in `why`; don't leave `src` empty.
- `resources` are what the map's side panel shows under "Learn more", so they're the most reader-facing part of the output. Give 2–5 per node, each with a URL you actually opened. Aim for one primary source (paper, spec, or announcement), one practitioner write-up (an engineering blog or a well-known practitioner's post), and, where one exists, one recorded talk (conference talk, YouTube lecture, or podcast episode). Prefer docs or cookbook pages that show the technique in use. Don't repeat `ref` here.
- Never invent a URL. If you couldn't open it, append ` [unverified]` to the title. If nothing good exists for a kind, leave it out.

Relationship types (use only these):
{rel_lines}

Maturity tiers:
{tier_lines}

Rules for parents:
- Prefer the TRUE ancestor over the nearest available node. If the real ancestor isn't in the backbone or this run, use `external:<name>` — do not force an edge.
- A node may not be older than its parents. Check dates.
- Cross-region edges are the most valuable part of the dataset. Record them whenever they're real.

### Section 3: Backbone amendments
Anchors that should be split, merged, renamed, re-homed, or re-dated, and any boundary rules that don't hold up — each with a reason.

### Section 4: Contested lineage and hype
Cases where origin or parentage is disputed (present both accounts), and areas with high attention but thin evidence of production value.

### Section 5: Self-check
Report honestly; this output will be verified mechanically afterward.
- every parent id is a backbone id (listed below), a node in this run, or `external:`
- every parent edge has a non-empty `src`
- no new node duplicates an existing backbone node (check names and aliases, not just ids)
- every `also` value is a region id
- every resource URL was opened, or is marked [unverified]
- every rel value is one of the six allowed
- no child is dated earlier than its parent
- no node is a product, library, framework, or benchmark
- 2024–2026 work is represented

Prefer primary sources (papers, official engineering blogs, specifications, repositories) over aggregators. Mark anything you could not verify. Do not invent citations.

## Backbone index (all regions: id, then name and aliases; use these ids for cross-region parents)
{id_index}
"""

        doc = f"""# Deep dive: {r['name']}

Backbone v{data['meta']['version']} · {len(anchors)} anchors · {len(bridges)} cross-region edges

## How to use
1. Paste everything between **Research prompt** and the horizontal rule into a deep-research run (Gemini, Claude Research, etc.).
2. Save the output and hand it to a Claude agent for merging: validate ids, enums, and date order with `validate.py`, then fold Section 3 amendments into `backbone.yaml` by hand.
3. Section 1 (overview and learning path) and each node's `summary` and `resources` are the content for the map's side panel. `layer: detail` nodes appear only when zoomed in.

## Research prompt

{prompt}
---

## Reference: seed sources for this region
Key references currently attached to the anchors (from the backbone runs; arXiv ids spot-checked, not exhaustively verified):
{seed_sources}

## Reference: cross-region edges touching this region
""" + "\n".join(f"- {b}" for b in sorted(bridges)) + "\n"

        fname = f"{rid}.md"
        (OUT / fname).write_text(doc)
        index_rows.append((r["name"], fname, len(anchors), len(bridges)))

    readme = ["# Deep-dive guides", "", "One guide per applied region, generated from `backbone.yaml` by `make_guides.py`. Re-run the script after changing the backbone so anchor lists and id indexes stay current.", "", "| Region | Guide | Anchors | Cross-region edges |", "|---|---|---|---|"]
    for name, f, a, b in index_rows:
        readme.append(f"| {name} | [{f}]({f}) | {a} | {b} |")
    (OUT / "README.md").write_text("\n".join(readme) + "\n")
    print("\n".join(readme))


if __name__ == "__main__":
    main()
