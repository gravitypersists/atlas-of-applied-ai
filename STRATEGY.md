# Taxonomy → Map: Strategy

How the `backbone.yaml` taxonomy becomes a browsable, fantasy-style map of applied AI engineering. This document covers what the map *means* and how it should feel. `SPEC.md` covers how it's built.

## Goal and guiding principles

The goal is a map someone can wander casually. They should be able to see where a technique lives, what it grew out of, and what's new, then click through to learn more.

1. **Low cognitive load comes first.** A first-time viewer should understand the map within seconds and never need a legend. When fidelity to the data competes with legibility, legibility wins.
2. **It's a map, not a visualization.** Once a landmark is placed, it never moves. The same goes for land: once it exists, it stays. The map grows by accretion, the way a real atlas gains new coastline and settlements across editions.
3. **The data suggests and the procedure decides.** Lineage, maturity, and region tags shape the terrain. Nothing forces a particular outcome, and a human can override anything during curation.
4. **One interaction model.** Pan, zoom, and click a landmark. Everything else hangs off the click.
5. **It grows by zooming.** The 141 backbone nodes make up the overview. Deep-dive content appears as finer detail at higher zoom.

## The terrain model

The map is flat when you look at it. Underneath, it runs on a hidden **elevation field** that is never drawn. A single **sea level** cuts that field into land and water. Everything the viewer sees comes from that cut: coastlines, islands, isthmuses, straits.

### What raises the land

The elevation field is a sum of non-negative contributions:

| Contribution | Comes from | Effect |
|---|---|---|
| **Settlement uplift** | Each landmark, with height and spread set by maturity | Mature work builds broad, high ground. Research builds a small rise. |
| **Lineage ridges** | Edges between landmarks that are both maturity ≥ 3, raised along the line between them; cross-region ridges are scaled by how connected the two regions are. Edges that cross between the Old World and the New World raise no ridge. | Strongly connected regions end up joined by land. Weakly connected ones stay separated by water. The ocean between the worlds stays open. |
| **Ancient bedrock** | A low, fixed noise field from a seed | Natural, irregular coasts and the odd stray islet. |
| **Ocean basin** | Falloff toward the edge of the world | Keeps the world bounded by sea. |

### Sea level sets the character of the world

A single sea level decides how much of the world is above water:

- a **high sea level** gives an archipelago, with most regions on their own island
- a **low sea level** gives one continent with peninsulas
- **somewhere in between** gives a few landmasses, with regions that share a lot of lineage joined by isthmuses and loosely related ones separated by straits

Sea level is chosen once, by eye, during the founding survey. The build can report how many landmasses each candidate level produces to help with the choice.

### Why growth and topology fit together

Every contribution to the field is non-negative, and every one of them only gets stronger over time. A new node adds uplift. A maturity increase adds uplift. A new edge adds a ridge. Meanwhile, sea level can only stay the same or drop. That gives one invariant:

> **Land only ever grows.** The coastline advances, straits close, and islands join the mainland. Nothing sinks.

As a safety net, the land mask is also persisted as a high-water mark. Even if data changes in a way that lowers elevation (a node is retired, a maturity is corrected downward), land that already exists stays land.

### The story this tells

- **Frontier work starts offshore.** A maturity 1–2 landmark has only a small rise of its own, and it gets no lineage ridges, so it sits on its own islet.
- **Frontier islands join the mainland as they mature.** When a frontier technique reaches maturity 3, its lineage ridges switch on and the islet connects to its parents' land. Watching that happen is part of the fun, and over time the map shows the frontier settling.
- **Land bridges come out of the data.** An isthmus appears where regions really do share lineage. Nobody draws one by hand.

## Regions as territories

Regions are **territories on the land**, not islands. A region might occupy part of a continent, a whole island, or a coastal strip plus some islets.

- **Claims are permanent.** When a land cell first appears, it's claimed by the region of the landmark that reaches it first (usually the nearest; some landmarks get a head start so borders don't always fall midway), and it keeps that owner forever. Borders are as fixed as positions.
- **Borders inside a landmass** are drawn as faint dashed lines. Where a region is a whole island, the coast is its border.
- **The Old World** is the 8 root disciplines. It's a continent of its own in the west, kept as a reference. It carries one shared title, "The Old World", with each discipline as a province.

## West to east: the Old World and the New World

Time runs roughly west to east, which makes the map read like a world atlas rather than a radial diagram.

- **The Old World** sits in the far west as a reference continent. It holds the pre-LLM ancestor disciplines, ordered loosely by age, with Deep Learning on its eastern shore facing the New World.
- **The ocean** separates the two worlds. In this edition, lineage that crosses the ocean plays no part in the layout. Each world is laid out on its own terms, so an applied technique is placed by its applied relatives: GraphRAG sits next to RAG, not next to knowledge graphs. Cross-ocean lineage is still in the data and still shows in a landmark's panel and routes.
- **The New World** holds the applied regions, with Prompting and Context Engineering on its west coast. Prompting was the first land LLMs conquered: few-shot prompting (GPT-3, 2020) worked on a bare pretrained model before fine-tuning, retrieval, or agents became common practice. Other regions are ordered by recency. Within each region, older landmarks lean west and newer ones lean east.
- **Curated anchors.** Median dates can't capture "first conquered" (the applied regions' medians span barely a year), so the west–east order takes a few hand-written hints in `map/curation.yaml`: Deep Learning at the Old World's east edge, Prompting at the New World's west edge. Only the founding survey reads them.
- **Later editions** may bring cross-ocean lineage back, for example as islets in the strait for frontier work that grows straight from the old disciplines (a neuro-symbolic island nation). It's left out for now because it pulled applied work out of place.

## Placement: founding survey, then settlement

**Founding survey (one time).** A force-directed layout (d3-force) places the initial 141 nodes:
- the two worlds are kept apart, west and east, with an ocean between them, and each world is levelled north–south
- descendants are pulled near their parents within each world; lineage across the ocean is ignored
- each region is pulled toward its own centroid and toward its west–east target (curated anchors pull hardest)
- regions with many shared edges are pulled toward each other
- mature nodes are pulled toward the region's interior, and frontier nodes toward the open sea

The survey leaves generous space around hubs, because they'll attract settlers. The result is curated by hand once and then **written to the ledger, where it's fixed permanently**.

**Settlement (every later build).** A new node is not placed by a global layout. It goes through a local search for the best open site near its parents, judged on how close it is to the parents, whether there's room, whether it's in its own region's territory, and whether the site suits its maturity: frontier nodes go just offshore, everything else goes along the coast. Its uplift then raises land in place, so new technology settles at the frontier and pushes the coast outward.

Ledger order sets placement, not date. A 2019 paper found by a deep dive in 2027 still settles at today's frontier near its parents. The map records when something was charted. The date is only used for time replay.

## Core semantics (soft)

| Map feature | What drives it |
|---|---|
| Position | Lineage, through the founding survey and local settlement. Fixed once placed. |
| Land vs. sea | Elevation (maturity and connectivity) relative to sea level. Only grows. |
| Contiguous land vs. strait | How strongly regions are connected by lineage. |
| Territory borders | Region of the landmark that reached a cell first when it became land (usually the nearest). Permanent. |
| Islets | Frontier landmarks (maturity 1–2) that haven't joined the mainland yet. |
| Landmark prominence | Maturity × degree. Drives symbol and label weight. |
| Lineage lines | `parents[]`, shown only for the selected landmark. |

## Symbology (deliberately simple)

No drawn art for now. The marks are basic geometric glyphs in ink on parchment.

| Symbol | Meaning |
|---|---|
| ★ star in a circle | **Capital:** the most central landmark of each region |
| ● large dot | **City:** maturity 4–5 with several descendants |
| • small dot | **Town:** other maturity 3–5 landmarks |
| ○ hollow circle | **Frontier outpost:** maturity 1–2 |
| ■ small square | **Old World landmark:** a root-discipline node |
| ┄ dotted line | **Lineage route:** shown only for the selected landmark |

- Each region gets one muted territory tint, and everything else is ink.
- The region **title** is in large spaced caps with the **subtitle** in small italics beneath it.
- Doodles can come later as pure decoration.

## The viewing experience: a slippy map

The map is a full-screen, Google Maps-style canvas.

- **Pan and zoom.** Pan, zoom, and fit-to-world.
- **Semantic zoom.**
  - **World:** coasts, territory titles, and capitals.
  - **Region:** cities and towns appear.
  - **Local:** every landmark appears.
  - **Later:** deep-dive detail appears at finer zoom.
- **Click a landmark** to open a side panel (a bottom sheet on mobile):
  - the description and maturity
  - examples and a source link
  - "Built on" and "Led to" chips that fly the map to the related landmark
  - dotted lineage routes drawn on the map
- **Search** by name and alias, plus **deep links**.
- **Not in v1:** hover tooltips, time replay, minimap, edge-type styling.
- **Time replay** is a natural extension later. Replaying the ledger in date order regrows the land.

## Region names (draft)

| Title | Subtitle |
|---|---|
| **The Old World** | Ancestral Disciplines |
| **The Engine Works** | Inference and Serving |
| **The Whispering Coast** | Prompting and Context Engineering |
| **The Archival Reach** | Retrieval and Knowledge |
| **The Free Cities** | Agents and Orchestration |
| **The Peninsula of Long Thought** | Planning and Reasoning |
| **The Tempering Grounds** | Adaptation and Post-Training |
| **The Quarries** | Data and Synthetic Data |
| **The Watchtowers** | Evaluation and Observability |
| **The Bulwark** | Safety, Security and Governance |
| **The Agora** | AI Product and Interaction Design |
| **The Painted Isles** | Multimodal |

These now live as `title` on each applied region in `backbone.yaml`. The titles can drift in style, and "Isles" may stop being literal once sea level is chosen. The subtitle is what keeps the map honest.

## Content gaps to keep in mind

- **The frontier is thin.** Only 14 nodes are maturity 1–2, and only 2 are dated 2025, so there will be few islets at first. The map will make that visible, which can guide which deep dives to run first.
- **Maturity is skewed.** 98 of 141 nodes are maturity 4–5, so uplift should depend on maturity *rank* as well as raw tier. Otherwise everything rises equally.
- **External ancestors (15)** stay off the map. They appear in the panel as "beyond the map's edge."

## Settled decisions

1. A free-form world, with backbone semantics as soft guidance.
2. An interactive slippy map. Landmarks are the only clickable things.
3. Each region gets a fun title plus a serious subtitle.
4. Simple geometric symbology for now.
5. Start from the current 141 nodes. Deep-dive content grows in at deeper zoom.
6. Positions and land are permanent. The map only grows.
7. Hidden elevation plus a single sea level decide what is contiguous land and what is island.
8. The Old World is its own continent in the west. Time runs roughly west to east, and an ocean separates the Old World from the New World.
