# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

A data project, not an application: the **Applied AI Engineering Atlas** backbone, a taxonomy of AI-engineering techniques shown as a lineage graph. It will eventually be drawn as a fantasy-style map (see `STRATEGY.md`). There is no build system and there are no tests. The repo holds one YAML source of truth and two Python scripts (dependency: `pyyaml`).

## Commands

```sh
python3 validate.py      # check backbone.yaml; writes backbone.json + validation-report.txt; exits 1 on errors
python3 make_guides.py   # regenerate deep-dives/*.md (incl. deep-dives/README.md) from backbone.yaml
```

After any edit to `backbone.yaml`, run both scripts. `validate.py` must report 0 errors.

## Data flow

- `backbone.yaml` is the only file to edit by hand. `backbone.json`, `validation-report.txt`, and everything in `deep-dives/` are generated, so never edit them directly.
- `backbone.json` is what the map renderer consumes. `validate.py` adds an `external_ancestors` list to it.
- The `LEADS` dict in `make_guides.py` is hand-maintained. It lists candidate concepts per region that aren't anchors yet; each guide asks the deep-research run to evaluate them.

## backbone.yaml model

Top-level keys: `meta` (relationship enum, maturity tiers), `regions`, `boundary_rules`, `nodes`.

- **Regions** have `kind: root` (pre-LLM ancestor disciplines) or `kind: applied`. Every applied region needs ≥ 8 nodes (`MIN_APPLIED` in `validate.py`).
- **Nodes** have one home `region`, an optional `also` (secondary regions), `parents`, `maturity` 1–5, `date` (`"YYYY"` or `"YYYY-MM"`, quoted), a `ref` (title + `arxiv` or `url`; required), and `status` (`kept` | `repaired` | `added`).
- **Edges** exist only as `parents[]` on the child: `{id, rel, why, src}`. `rel` must be in `meta.relationship_types` (extends, specializes, combines, applies, replaces, counters). A missing `src` produces a warning.
- `parents[].id` may be `external:<name>` for a real ancestor that isn't anchored yet. These ancestors are skipped by the resolution and date checks, and they count as candidates for the next revision, not as errors.
- Hard constraints: a child can't be dated before any parent (month precision only when both dates have months), and the graph has no cycles. Edges connect nodes, never regions.
- `boundary_rules` decide which region owns ambiguous concepts (e.g. function calling → Agents, prompt caching → Inference, RLVR → Adaptation). Check them before placing a node.

## Semantics that matter for edits (from STRATEGY.md)

The map gives these fields meaning, so treat them carefully:
- Lineage edges set position: descendants are placed near their parents. Once a node is placed, its position is permanent (see `SPEC.md`), so new nodes settle near their parents and never move existing ones.
- Maturity and cross-region edges raise a hidden elevation field, and a sea level cuts it into land and sea. Maturity 1–2 nodes start as islets and join the mainland as they mature. Strongly connected regions end up sharing land.
- Dates are approximate (sometimes the paper, sometimes the first product). They're good enough for layout and replay, not for presenting as precise.

## Deep-dive workflow (from README.md)

1. Run a guide's research prompt (`deep-dives/<region>.md`) in a deep-research tool.
2. Parse the output's Section 2 (nodes) into YAML, merge it into `backbone.yaml`, and run `validate.py`.
3. Section 3 (backbone amendments) gets human review before any structural change is accepted. Don't apply it automatically.
4. Re-run `make_guides.py` so later guides see the updated ids.

Known limits: most arXiv ids come from model knowledge and only a few were spot-checked. Edges marked `confidence: medium` are the most debatable lineage claims.
