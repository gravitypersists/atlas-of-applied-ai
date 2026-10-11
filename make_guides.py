"""Generate one deep-dive research guide per applied region, plus one for the Old World, from backbone.yaml.

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

# Candidate Old World landmarks for the Old World guide to evaluate (include, fold into an anchor, or reject).
# Several are AI ideas currently cited only as external: parents.
OLD_WORLD_LEADS = [
    ("Dropout, batch/layer normalization and Adam: the deep-learning training toolkit (one node or several?)", None),
    ("GPUs and CUDA as the enabler of deep learning (or fold into alexnet)", None),
    ("Deep belief nets / greedy layer-wise pretraining (2006), the start of the deep-learning revival", None),
    ("Hopfield networks and Boltzmann machines", None),
    ("n-gram language models and Shannon's information theory of language", None),
    ("Statistical machine translation (IBM models), the data-driven turn in NLP", None),
    ("Hidden Markov models and CTC for speech recognition (ancestor of speech-recognition)", None),
    ("Contextual embeddings (ELMo) and BERT-style masked pretraining: separate from pretrained-language-models?", None),
    ("GPT-3 and in-context learning: Old World landmark, or already covered by few-shot-prompting?", None),
    ("Bayesian networks and probabilistic graphical models", None),
    ("Support vector machines and kernel methods", None),
    ("Actor-critic methods and TD-Gammon", None),
    ("Logic programming (Prolog) and automated theorem proving (ancestor of verifiers and formal-methods work)", None),
    ("Ontologies, description logics and the Semantic Web", None),
    ("PageRank and learning to rank", None),
    ("Promote AI externals to anchors: adaptive-mixtures-of-local-experts (1991), sparse-transformers (2019), semantic-parsing, named-entity-recognition, network-pruning (Optimal Brain Damage), predictive-uncertainty / calibration, nonequilibrium-thermodynamics-generative-modeling (diffusion's origin, 2015), preference-learning", None),
]


def ref_str(ref):
    s = ref["title"]
    if ref.get("arxiv"):
        s += f" — arXiv:{ref['arxiv']}"
    elif ref.get("url"):
        s += f" — {ref['url']}"
    return s


def node_spec(region_ids, rel_lines, tier_lines):
    """Section 2 of every guide: the node YAML shape, field rules, enums and parent rules."""
    return f"""Return every node — existing anchors (with any corrections) and new ones — as one YAML list:

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
- Cross-region edges are the most valuable part of the dataset. Record them whenever they're real."""


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
{node_spec(region_ids, rel_lines, tier_lines)}

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

    # ---- The Old World: one guide for every root province ----
    roots = [r for r in regions.values() if r["kind"] == "root"]
    root_ids = {r["id"] for r in roots}
    ow_nodes = [n for n in nodes if n["region"] in root_ids]
    province_lines = []
    for r in roots:
        ns = [n for n in ow_nodes if n["region"] == r["id"]]
        province_lines.append(f"### {r['name']} (`{r['id']}`)\n{r['definition']}\n" + "\n".join(
            f"- `{n['id']}` — {n['name']} ({n['date']}, maturity {n['maturity']}"
            + ("; has summary" if n.get("summary") else "") + ("" if (n["ref"].get("arxiv") or n["ref"].get("url")) else "; ref has no link")
            + ")" for n in ns))
    ow_rules = [b for b in data["boundary_rules"] if any(rid in str(b["home"]) for rid in root_ids) or "Old World" in str(b["concept"])]
    ow_rule_lines = "\n".join(f"- {b['concept']} → {b['home']}: {b['rule']}" for b in ow_rules)
    ow_lead_lines = "\n".join(f"- {t}" + (f" (arXiv:{a})" if a else "") for t, a in OLD_WORLD_LEADS)
    ow_bridges = sorted(
        f"{n['id']} --{p['rel']}--> {p['id']}"
        for n in nodes if n["region"] not in root_ids
        for p in n.get("parents") or [] if p["id"] in by_id and by_id[p["id"]]["region"] in root_ids
    )
    ow_externals = sorted({p["id"] for n in nodes for p in n.get("parents") or [] if p["id"].startswith("external:")})
    nl = "\n"

    ow_prompt = f"""I'm building a lineage graph of applied AI engineering that will be rendered as an interactive map. The map has a New World of applied regions (prompting, RAG, agents, post-training and so on) and, across an ocean to the west, **the Old World**: the AI history that led to the 2020s explosion built on the transformer. Each Old World province is an older discipline; each node is a landmark idea; edges record what each node was built on. A backbone of stable ids already exists. This run ENRICHES the Old World: it writes reader content for the landmarks that are already there, fixes their facts, and fills only the obvious gaps.

## Scope
- The Old World holds AI history that led to the transformer-era explosion. It is not a general computing history. Ancestors from outside AI (software engineering, systems security, classic HCI, law and standards) stay as `external:` parents and never become nodes, even when they are real ancestors.
- The line between Old World and New World is "what fed the explosion" versus "the explosion itself". It is a judgment call. Where an existing anchor seems to sit on the wrong side (several post-2020 architecture nodes live here), say so in Amendments rather than moving it.
- Readers are engineers who know today's tools and want to know how we got here. Write for them, not for historians: why the idea mattered, what it unlocked, and where it shows up in today's systems.
- A node is an idea, method or landmark result. Products, datasets, libraries and benchmarks are NOT nodes (list them under `examples`), with one allowed kind of exception: a landmark result that changed the field's direction (AlexNet, AlphaGo) can be a node, named for the result.
- Add new nodes sparingly: about 10–20 across all provinces in total, only for ideas a well-read AI engineer would be surprised to find missing. Before adding one, check the backbone index at the end (ids, names and aliases across ALL regions); never re-create an existing concept under a new id.

Boundary rules (apply these exactly; if you disagree, say so in Amendments):
{ow_rule_lines}

## The provinces and their current landmarks (keep these ids; you may correct their fields)
{(nl + nl).join(province_lines)}

## What to do for every existing landmark
- Write a `summary` (2–3 plain-language sentences) where it has none, and check the ones that exist.
- Check `date`. Use the date of the idea's origin, not of a later popular version, and when the anchor is named for a later landmark, say so in `maturity_note`. Flag disagreements in Section 4.
- Give `ref` a link: an arXiv id, a DOI URL (https://doi.org/...) or a publisher or author page you opened. Many current refs are title-only.
- Give 2–4 `resources`: a readable retrospective or explainer, a recorded lecture or talk where one exists (well-known course lectures and Turing Award lectures count), and the primary paper only if it is readable and not already the `ref`.
- Check each anchor's parents, and add Old World parents that are missing. Don't remove an existing edge without arguing for it in Amendments.

## Questions to answer
- For each province: what were its 3–5 turning points, which ideas were superseded, and what did it hand to the transformer era?
- Which threads run between provinces (for example backpropagation into vision and RL, search into game-playing and reasoning, retrieval into question answering)?
- Which Old World ideas are being rediscovered by today's applied regions under new names?

## Leads to evaluate
For each: add it as a node, fold it into an existing anchor as an alias or example, or reject it with a reason.
{ow_lead_lines}

## Output

Sections 1 and 2 are parsed by a script. Put each in ONE fenced ```yaml block, exactly in the shapes below, with nothing else inside the block. Prose goes outside the blocks.

### Section 1: The Old World and its provinces (for map readers)
First, 150–250 words on the Old World as a whole: how these disciplines, many of them decades old, converged into the deep-learning revival and then the transformer explosion. Then, for each province, 120–200 words of overview and a learning path of 3–5 resources in the order a newcomer should take them.

```yaml
old_world:
  overview: "<150–250 words>"
provinces:
  - id: <province id>
    overview: "<120–200 words>"
    learning_path:
      - {{kind: <paper | talk | blog | docs | tutorial | code>, title: "<title>", by: "<author or org>", year: <YYYY>, url: "<url>", why: "<one sentence: what the reader gets from it>"}}
```

### Section 2: Nodes
{node_spec(region_ids, rel_lines, tier_lines)}
Old World specifics:
- `region` is a province id: {", ".join(r["id"] for r in roots)}. New nodes go in an existing province unless you argue for a new one in Amendments.
- Old World landmarks are usually `core` and maturity 5 (they are settled history). Use `detail` only for minor refinements.
- `also` may name an applied region when an Old World idea is still a live, configurable choice there.

### Section 3: Backbone amendments
Anchors to split, merge, rename, re-home or re-date; provinces that are too thin to stand alone (Knowledge Representation and Human-Computer Interaction have 2 landmarks each) or should be renamed; anchors on the wrong side of the Old World / New World line; and `external:` ancestors (listed below) that are really AI and deserve a landmark. Give a reason for each.

### Section 4: Contested history
Cases where credit or dating is disputed (for example backpropagation, attention, LSTM versus earlier recurrent work, who invented the transformer's pieces). Present each side with sources.

### Section 5: Self-check
Report honestly; this output will be verified mechanically afterward.
- every parent id is a backbone id (listed below), a node in this run, or `external:`
- every parent edge has a non-empty `src`
- no new node duplicates an existing backbone node (check names and aliases, not just ids)
- no new node is a non-AI idea
- every `also` value is a region id
- every resource and ref URL was opened, or is marked [unverified]
- every rel value is one of the six allowed
- no child is dated earlier than its parent

Prefer primary sources (papers, author pages, publisher DOIs, university course pages, recorded lectures) over aggregators. Mark anything you could not verify. Do not invent citations.

## Current external: ancestors (real lineage with no landmark yet)
{", ".join(ow_externals)}

## Backbone index (all regions: id, then name and aliases; use these ids for cross-region parents)
{id_index}
"""

    ow_doc = f"""# Deep dive: The Old World

Backbone v{data['meta']['version']} · {len(roots)} provinces · {len(ow_nodes)} landmarks · {len(ow_bridges)} edges into the New World

An enrichment pass rather than a coverage pass: summaries, dates, linked refs and resources for the existing landmarks, province overviews and learning paths, and only the obvious missing history.

## How to use
1. Paste everything between **Research prompt** and the horizontal rule into a deep-research run (Gemini, Claude Research, etc.). It is long; if the tool truncates, run it once per group of provinces and say so in the prompt.
2. Save the output and hand it to a Claude agent for merging per `MERGING.md`: validate ids, enums and date order with `validate.py`, then fold Section 3 amendments into `backbone.yaml` by hand.
3. Section 1 goes on the root regions (`overview`, `learning_path`). Each node's `summary` and `resources` are the content for the map's side panel.

## Research prompt

{ow_prompt}
---

## Reference: edges from the Old World into the New World
""" + "\n".join(f"- {b}" for b in ow_bridges) + "\n"
    (OUT / "old-world.md").write_text(ow_doc)
    index_rows.insert(0, ("The Old World (all root provinces)", "old-world.md", len(ow_nodes), len(ow_bridges)))

    readme = ["# Deep-dive guides", "", "One guide per applied region, plus one for the Old World's root provinces, generated from `backbone.yaml` by `make_guides.py`. Re-run the script after changing the backbone so anchor lists and id indexes stay current.", "", "| Region | Guide | Anchors | Cross-region edges |", "|---|---|---|---|"]
    for name, f, a, b in index_rows:
        readme.append(f"| {name} | [{f}]({f}) | {a} | {b} |")
    (OUT / "README.md").write_text("\n".join(readme) + "\n")
    print("\n".join(readme))


if __name__ == "__main__":
    main()
