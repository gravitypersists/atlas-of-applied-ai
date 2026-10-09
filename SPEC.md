# Atlas Map: v1 Spec

This turns `STRATEGY.md` into something buildable. The strategy owns intent: what the map means and why. This spec owns contracts: file formats, algorithms, behavior, and what "done" means. When they disagree, fix whichever is wrong instead of letting them drift apart.

## 1. Scope

**In v1:**
- A **founding survey**: a one-time layout of the current 141 nodes that becomes the permanent ledger.
- A **settle build**: places any new nodes, raises terrain, grows land, and emits the viewer data. Existing positions, land, and territory claims are never changed.
- A static, full-screen slippy-map viewer: pan and zoom, semantic zoom, a click-to-open landmark panel, search, and deep links.

**Not in v1:**
- doodles or art
- hover tooltips
- time replay (the data supports it, but there's no UI)
- minimap
- edge-type styling
- deep-dive zoom levels (z3+)
- editing in the viewer
- dark mode (parchment is the design)

## 2. Architecture

```
backbone.yaml ─validate.py─▶ backbone.json ─┐
map/curation.yaml (cartography choices) ────┤
map/atlas/ledger.yaml (positions, sea level)┼─▶ map/build.mjs ─▶ map/public/map.json ─▶ viewer
map/atlas/terrain.json (land + claims grid) ┘        │
                                                     └─▶ ledger.yaml, terrain.json (append-only updates)
```

**Decisions**, open to review:
- **Build in Node.** `d3-force`, `d3-contour`, and `d3-delaunay` are native to it, and Node 22 is available. Python still owns data validation.
- **Viewer is SVG plus `d3-zoom`.** That's sufficient for about 500 landmarks and a few dozen coast paths. It gives crisp text at every zoom level, native click targets, and CSS-driven semantic zoom. Revisit canvas if the map passes about 2,000 nodes.
- **No viewer build step.** Plain `index.html`, `app.js`, and `style.css`, with d3 from cdnjs and fonts from Google Fonts.

### Files

| Path | Kind | Purpose |
|---|---|---|
| `map/package.json` | hand | `d3-force`, `d3-contour`, `d3-delaunay`, `d3-polygon`, `js-yaml` |
| `map/build.mjs` | hand | `survey`, `settle`, and `sea` commands (section 4) |
| `map/curation.yaml` | hand | Cartography choices: labels, tiers, titles. Freely editable. |
| `map/atlas/ledger.yaml` | **permanent record**, committed | World constants plus the position of every settled landmark |
| `map/atlas/terrain.json` | **permanent record**, committed | Land mask and territory claims (the high-water mark) |
| `map/public/index.html`, `app.js`, `style.css` | hand | Viewer |
| `map/public/map.json` | generated | Everything the viewer draws |

The two files under `map/atlas/` are the map's geography. The build appends to them and never rewrites existing entries. Changing them by hand is a deliberate cartographic act, so do it in a reviewed commit.

### Commands
```sh
python3 validate.py && node map/build.mjs              # settle: the normal build
node map/build.mjs settle --dry-run                     # report what would be settled or grown, write nothing
node map/build.mjs survey                               # one-time founding survey (refuses if a ledger exists)
node map/build.mjs survey --redo                        # only before the survey is accepted: discard and resurvey
node map/build.mjs sea --sweep [--levels 0.3,0.4,0.5]   # landmass stats per sea level; preview SVGs in map/.preview/
node map/build.mjs sea --set 0.4                        # set sea level (only lower, once accepted)
python3 map/serve.py 8000                               # view (no-cache dev server)
```

## 3. Data contracts

### 3.1 `backbone.yaml` additions

Applied regions get a `title`, which is the fun name. The existing `name` serves as the subtitle. `validate.py` warns when an applied region has no `title`.

```yaml
  - id: retrieval-and-knowledge
    kind: applied
    name: Retrieval and Knowledge        # subtitle
    title: The Archive Reach             # NEW
```

### 3.2 `map/atlas/ledger.yaml` (permanent)

```yaml
world:
  seed: 7
  bounds: [0, 0, 4800, 3000]           # world units; fixed at survey
  cell: 4                              # world units per terrain grid cell; fixed at survey
  sea_level: 0.42                      # may only ever be lowered
  surveyed: "2026-10-08"
settlements:                           # append-only; order = settlement order
  - {id: bm25, x: 812.4, y: 1430.0, settled: "2026-10-08"}
  - {id: graph-rag, x: 1904.2, y: 655.8, settled: "2026-10-08"}
retired: []                            # ids removed from the backbone; their positions stay reserved, their land stays
```

### 3.3 `map/atlas/terrain.json` (permanent)

```jsonc
{
  "width": 1000, "height": 750,                // grid dimensions = bounds / cell
  "land": "<RLE>",                             // 1 = land; high-water mark, bits only ever flip 0→1
  "owner": "<RLE>",                            // region index per land cell; set when the cell first becomes land, never changed
  "regions": ["information-retrieval", "…"]    // index → region id; append-only
}
```

### 3.4 `map/curation.yaml` (freely editable)

```yaml
old_world: {title: The Old World, subtitle: Ancestral Disciplines}
survey:                                # read only by `survey`; inert once the survey is accepted
  west_east:                           # 0 = west edge, 1 = east edge of the region's own world
    deep-learning-nlp: 1.0
    prompting-and-context-engineering: 0.0
nodes:
  bm25: {label: left}                  # label side: right (default) | left | above | below
  react-agent-loop: {tier: capital}    # force a symbol tier
regions:
  retrieval-and-knowledge: {label: [1820, 700]}   # territory label position override
```

Curation never touches settled geography. The `survey` block only shapes the founding survey. To move a settled landmark you edit the ledger, as described in 3.2.

### 3.5 `map/public/map.json` (viewer contract)

```jsonc
{
  "version": 1, "built": "2026-10-08", "bounds": [0, 0, 4000, 3000],
  "coast": "M…Z",                // SVG path: all land at sea level (contour of the land mask)
  "shallows": "M…Z",             // SVG path: contour slightly below sea level (hints at near-connections)
  "territories": [{
    "id": "retrieval-and-knowledge", "title": "The Archive Reach", "subtitle": "Retrieval and Knowledge",
    "tint": "#d9c9a3", "ink": "#6d8c4f",      // territory fill colour; symbol and label colour
    "fill": "M…Z",                            // owned land cells as a path; drawn with a dashed outline, which forms the borders
    "label": [x, y], "group": "applied"       // "old-world" for root provinces
  }],
  "oldWorld": {"title": "The Old World", "subtitle": "Ancestral Disciplines", "label": [x, y]},
  "landmarks": [{
    "id": "graph-rag", "name": "GraphRAG", "region": "retrieval-and-knowledge",
    "x": 0, "y": 0, "tier": "outpost", "minZoom": 2, "labelSide": "right",
    "desc": "…", "maturity": 2, "maturityLabel": "Emerging", "maturityNote": "…",
    "date": "2024-04", "aliases": […], "examples": […],
    "ref": {"title": "…", "href": "https://arxiv.org/abs/2404.16130"},
    "parents": [{"id": "…", "rel": "combines", "why": "…"}],
    "external": [{"name": "minhash", "why": "…"}],
    "children": ["…"]
  }],
  "routes": [{"from": "…", "to": "…", "path": "M…"}]
}
```

- `ref.href` is built from `arxiv` (`https://arxiv.org/abs/<id>`) or taken from `url`.
- Retired landmarks are left out.

## 4. Build

The build is deterministic: the same inputs always produce byte-identical outputs. All randomness goes through one PRNG (mulberry32), seeded from `world.seed` plus a per-purpose salt, so adding a node doesn't shift any other random stream.

### 4.1 Elevation field E(p)

E is evaluated on the terrain grid. It is never stored, because it's recomputed from the ledger and backbone each build.

```
E(p) = 1 − exp(−(Σ uplift(node, p) + Σ ridge(edge, p))) + bedrock(p) − basin(p)
```

The saturating sum keeps dense interiors near 1, so coasts form where influence fades out and the bedrock noise is large enough to shape them. It stays monotonic: more uplift never lowers E. Constants live in `TERRAIN` at the top of `map/terrain.mjs`.

- **Settlement uplift.**
  - Shape: a Gaussian bump `h · exp(−d²/2σ²)`.
  - Height and spread: `h` and `σ` grow with maturity, and they also grow with the node's maturity rank across the whole backbone. Rank keeps the 4–5 skew from flattening everything.
  - Root nodes get a modest bonus, so the Old World reads as a solid continent.
  - Organic shape: distance `d` is measured in a domain-warped space, `p + A·fbm(p)` with several octaves, which makes shapes irregular.
- **Lineage ridge.**
  - Which edges: every edge where both endpoints are maturity ≥ 3 and on the same side of the ocean. Edges between the Old World and the New World raise no ridge, so the ocean stays open.
  - Shape: a ridge along the parent→child segment, with height following a smoothed profile `r · exp(−dist_to_segment²/2w²)`.
  - Height: for cross-region edges, `r` scales with the number of edges between that region pair, normalized by the strongest pair. Strong connections clear sea level and weak ones don't.
  - In-region edges use a constant `r`, which keeps each territory internally contiguous.
- **Bedrock.** Seeded fBm at two scales: a broad one that pushes land out into peninsulas and pulls it back into bays independently of the landmarks, and a fine one (`detail`) that gives coasts their raggedness, coves, and small rocks.
- **Basin.** A smooth falloff in the outer margin of `bounds`, so the world ends in sea.

Uplift and ridges are non-negative, and bedrock and basin are fixed per location. Adding nodes, raising maturity, or adding edges can therefore only raise E.

### 4.2 Land and claims

While the survey is a draft (`world.accepted: false`), `terrain.json` is regenerated from scratch on every build, so sea level and terrain constants can be tuned freely. Once the survey is accepted, the previous `terrain.json` is the high-water mark and every rule below applies.

Each build:
1. Compute E.
2. Set `newLand = E > sea_level AND NOT land`, then `land |= newLand`. This is the high-water mark.
3. **Guarantee:** every landmark's cell must be land. For an outpost, that land is usually its own islet. If one isn't, add uplift at that node until it is (up to 3 passes), then fail and name the node.
4. **Claims:** each `newLand` cell is owned by the region of its nearest landmark, measured by distance through land (BFS over land cells from all landmarks). That way claims don't jump across water. Cells that already had an owner keep it.
5. **Invariant checks.** Fail the build if any of the following happened:
   - a land bit flipped 1→0
   - an existing owner changed
   - a ledger position changed
   - `sea_level` rose

### 4.3 Founding survey (`survey`, runs once)

0. **Oceanic edges.** An edge between a root-region node and an applied-region node is *oceanic*. The survey ignores oceanic edges entirely: no links, no region weights, no `descends_from` weight. They still appear in `map.json` as routes and in panels.
1. **West–east targets.** Survey space has three x bands: `oldWorld`, `ocean`, and `newWorld` (in `CONFIG.region`). Within its world's band, each region's target comes from a curated hint in `curation.yaml` `survey.west_east` (0 = west edge, 1 = east edge) if there is one. Otherwise it comes from the rank of the region's median node date, oldest furthest west.
2. **Region seeds.** A `d3-force` simulation over 19 region bodies (8 root and 11 applied), run for `trials` seeded restarts. The restart with the lowest energy is kept.
   - **Links** between region pairs, with strength proportional to their shared (non-oceanic) edge count. Every pair of root regions also gets a `rootKinship` link, which holds the Old World together.
   - **Collide** by `sqrt(nodeCount)`, plus a gap of sea.
   - **Spread:** mild many-body repulsion. Lower values let regions clump, leaving inland seas between groups.
   - **x pull** toward each region's west–east target, at `hintPull` (firm) for hinted regions and `xPull` (a gentle recency bias) otherwise. A hint spans the whole band, so 0 is the coast itself. The Old World has a y pull toward the equator.
   - **New World well:** elliptical gravity centred on the `newWorld` band, `newWorldGravity` east–west and `newWorldGravity · newWorldAspect²` north–south. Collisions push regions out sideways, so the New World settles into an oval (about `newWorldAspect` wide to 1 tall) by physics rather than by placement. The well is strong enough to dominate the region links, so the links decide neighbours and the well decides overall shape.
   - **Level:** each world is translated so its north–south midpoint sits on y = 0. Without this, the worlds drift apart vertically.
   - **Divide:** a hard constraint that keeps root bodies west of the ocean and applied bodies east of it.
   - **Energy** is the weighted gap between linked bodies beyond touching distance.
3. **Landmarks.** One `d3-force` simulation over all 141 nodes, seeded at their region centroids:
   - **link** along non-oceanic lineage edges, with strength `1 / max(deg)` so hubs don't collapse their neighbors. Cross-region links are weaker still.
   - **cluster pull** toward the node's region centroid, stronger for root regions
   - **recency lean:** within a region, a node is pulled west or east of the centroid by its date relative to the region median, saturating at `recencySpanYears`
   - **maturity pull:** mature nodes go toward the region interior (by maturity rank), and maturity 1–2 go outward, away from the New World's centre, toward open sea
   - **divide:** the same hard constraint as for regions. Outposts are exempt.
   - **collide** with radius = symbol + label allowance, plus `growthRoom · log2(1 + childCount)` so hubs keep space for future settlers
3. Write `ledger.yaml` with `settled` = the survey date. Then run 4.1 and 4.2 to create `terrain.json`.
4. Run `sea --sweep` and pick `sea_level` by eye (see 4.5). The target is a few landmasses, isthmuses between strongly linked regions, and straits elsewhere.
5. Do any hand curation by editing the ledger, then commit. `survey --redo` stops working once the user marks the survey as accepted, via `world.accepted: true`.

Set `ATLAS_DEBUG=1` to print each region body's final and target position.

### 4.4 Settlement (`settle`, every build)

For each backbone node that isn't in the ledger, in backbone file order:
1. **Candidates.** Sample a seeded Poisson-disk set of sites within radius `R` of the centroid of its parents that are already in the ledger. If it has no placed parents, use its region's territory centroid instead.
2. **Score each site.** Lower is better. Then choose the best site.
   - distance to the parent centroid
   - a crowding penalty that applies inside `minSpacing` of any landmark, which is a hard reject
   - a territory penalty if the cell is owned by another region
   - a hard reject for sites on the wrong side of the ocean
   - a site-type penalty, which depends on maturity:
     - maturity 1–2: the site must be water, near the coast, and facing away from other regions' land
     - maturity ≥ 3: the site should be on land within `coastBand` of the coast, or in shallow water next to it
3. If no site is acceptable, double `R` and try again, up to 3 times. If that still fails, the build fails and names the node.
4. Append `{id, x, y, settled: today}` to the ledger. The node's uplift and ridges grow land in step 4.2.

Nodes that have disappeared from the backbone move to `retired`. Their entry stays and their land stays. A node whose `region` changes keeps its position, and the build prints a warning for human review.

### 4.5 Sea level (`sea --sweep`)

This prints a table of candidate sea levels. For each level it shows the land fraction, the number of landmasses (connected land components above `minLandmassCells`), the landmarks at sea before the guarantee repairs them, the outposts on islets of their own, whether any landmass bridges the ocean between the worlds, and which applied regions share a landmass. It also writes a preview SVG per level to `map/.preview/` (gitignored).

`sea_level` is set in the ledger once, at survey time. Afterwards it may only be lowered.

### 4.6 Coastline geometry

- Contour the land mask with `d3-contour` at 0.5, after a small blur so cell edges don't show, to get `coast`.
- Contour E at `sea_level − shallowsBelow`, unioned with land, to get `shallows`.
- Territory fills come from contouring each region's owner mask. The viewer draws them with a dashed outline under the solid coast, so the dashes show only where two territories meet.
- Paths are simplified to a tolerance of `cell / 2`.

### 4.7 Symbol tiers

Within each region, `score = maturity + log2(1 + childCount)`. The rules below run in order, and any curation `tier` overrides them.

| Tier | Rule |
|---|---|
| `old` | Root-region node. Size is still scaled by score. |
| `capital` | The highest score in each applied region. Exactly one per region. |
| `outpost` | maturity ≤ 2 |
| `city` | maturity ≥ 4 and childCount ≥ 2 |
| `town` | everything else |

### 4.8 Label zoom thresholds (`minZoom`)

Labels are cartography, not geography, so they can change between builds. Even so, labels that are already placed have priority, which keeps them stable.

- **Placement.** Labels are placed greedily for z = 0, 1, 2.
- **Order.** Landmarks are taken in tier order (capital > city > town > outpost), then by `settled` (oldest first), then by score.
- **Eligibility by zoom.** z0 shows capitals only; z1 adds cities and towns; z2 shows everything.
- **Fitting.** For each landmark, try its curated side first, then right, left, above, below. `minZoom` is the first zoom level at which a side fits without colliding.
- **Build report.** z2 collisions are listed in the build report.

### 4.9 Routes

Each lineage edge becomes a gently curved dotted path, a quadratic curve whose bend side is chosen by the seed.

### 4.10 Build report

The build prints:
- how many new settlements were added, and where
- how many land cells grew, and which landmasses merged ("The Archive Reach joined The Free Cities")
- invariant check results
- label collisions
- warnings: changed regions, retired nodes

## 5. Viewer (`map/public/`)

### 5.1 Screen

- The map fills the viewport. Sea and land are two parchment tones, and territories carry their muted tints.
- **Top left:** search box.
- **Bottom right:** + / − / fit-world buttons.
- **Side panel:** 360px, on the right. On screens 640px wide or narrower it becomes a bottom sheet.
- **Bottom left:** a small cartouche reading "Applied AI Engineering Atlas" with the edition date. There is no legend.

### 5.2 Semantic zoom

Zoom is measured as d3-zoom `k` relative to fit-to-world, clamped to [0.8, 12].

| Level | `k` | Shown |
|---|---|---|
| z0 World | < 2 | coast, territory titles and subtitles, the Old World title, capitals with labels |
| z1 Region | 2–5 | adds city and town symbols, and labels where `minZoom ≤ 1` |
| z2 Local | ≥ 5 | adds outposts, all labels, Old World province names, and internal borders at full strength |

- Territory titles fade between z1 and z2.
- Symbols and text stay a constant screen size.
- The zoom level is set as a class on the root SVG, and CSS handles visibility with a 150ms fade.

### 5.3 Selection

Clicking or tapping a symbol or its label selects it. The hit target is at least 24px.

When a landmark is selected:
- the panel opens
- its parent routes are drawn in dark ink and its child routes in light ink
- related landmarks get a halo and their labels are forced on
- everything else dims to about 60%

**Panel contents:**
1. The territory title and subtitle as a small header, then the name.
2. A maturity pill (e.g. "Emerging"), plus "c. 2024" in muted text.
3. The description, then the maturity note in italics.
4. Example chips.
5. **Built on:** parent chips, each with its `why` underneath. External ancestors appear as non-clickable "beyond the map" chips.
6. **Led to:** child chips.
7. "Read the source ↗"

**Chip behavior:** clicking a chip flies there (600ms, eased, to at least z1) and selects that landmark.

**Clearing selection:** Esc, the × button, or clicking empty map.

### 5.4 Search

- Matching is case-insensitive substring on name and aliases, plus territory titles and subtitles.
- It shows up to 8 results, each with its territory title.
- Arrow keys and Enter work. Choosing a landmark flies to it and selects it. Choosing a territory fits the view to that territory.

### 5.5 Deep links

`#graph-rag` opens the map focused on that landmark with it selected. Selection changes update the hash with `replaceState`.

### 5.6 Visual tokens

- **Fonts:** an old-style serif for titles (e.g. IM Fell English SC) and a readable serif for labels and the panel (e.g. EB Garamond).
- **Ink:** one dark sepia for all lines and text.
- **Territory tints:** 19 muted, low-saturation tints, distinct in hue and close in lightness. Root provinces use a shared, slightly darker family of tints.
- **Coast:** about 1.5px ink stroke, with a faint inner hachure. Shallows are a pale band. Internal borders are 0.75px dashed.
- **Symbols:** sizes on screen are capital 14px, city 10px, town 6px, outpost 7px (hollow), old 7px (square).

## 6. Acceptance criteria (v1 done)

1. `python3 validate.py && node map/build.mjs` runs cleanly from a fresh clone after `npm install` in `map/`.
2. Two consecutive builds produce byte-identical outputs. A build with no backbone changes writes nothing to `map/atlas/`.
3. **Permanence.** Add a test node to the backbone, settle, and diff:
   - no existing ledger position changes
   - no land bit goes 1→0
   - no existing owner changes
   - the new node sits near its parents

   The build's invariant checks pass, and the build report shows the change.
4. **Growth.** Raising a test node's maturity from 2 to 3 grows land around it. If its parent is close enough, its islet joins the mainland.
5. Every landmark with maturity ≥ 3 sits on land. At z0 and z1, no labels overlap.
6. At the chosen sea level there are a few landmasses. At least one isthmus joins strongly connected regions, and at least one strait separates weakly connected ones.
7. All 141 landmarks can be found through search and open a complete panel. Deep links work on reload.
8. At fit-to-world zoom, the viewer sees landmass shapes, about 12 titles, and the capitals, and nothing else competes for attention.
9. On mobile, pinch, tap, and the bottom sheet all work. Pan and zoom are smooth on a mid-range laptop.

## 7. Milestones

1. **Survey.** `package.json`, region seeds, and the landmark force layout writing a draft ledger. A debug viewer shows plain dots and labels with pan and zoom, to check that the layout is sensible.
2. **Terrain.** The elevation field, `sea --sweep` with previews, land mask and claims, coast, shallows, territories, and borders. Choose sea level, curate, and accept the survey.
3. **Settlement.** `settle` with invariant checks and the build report. Exercise it with acceptance tests 3 and 4 using throwaway test nodes.
4. **Legibility.** Tiers, symbology, `minZoom` labels, and semantic-zoom CSS.
5. **Interaction.** Panel, routes, dimming, search, fly-to, deep links, and the mobile sheet.
6. **Polish.** Titles in `backbone.yaml`, a CLAUDE.md update, and publishing.

Each milestone ends with a screenshot review before the next begins.

## 8. Open items

- **Tuning constants.** These live in one `CONFIG` block at the top of `build.mjs`:
  - **uplift and ridges:** uplift `h`/`σ` per maturity and rank, ridge `r`/`w`
  - **noise:** warp `A`, bedrock amplitude
  - **settlement:** `growthRoom`, `minSpacing`, `coastBand`, settlement `R`
  - **thresholds:** shallows `δ`, zoom thresholds
- **Terrain resolution versus future zoom.** A grid cell of 4 units supports z0–z2. If deep-dive detail at z3+ needs finer coastlines, we'd add a second, finer terrain layer for the zoomed-in view. That layer would derive from the base land mask and never contradict it. Not needed for v1.
- **Root nodes as frontier.** Root nodes never become frontier. If a root discipline gains a new low-maturity node, it settles like any other node.
- **Hosting.** Publish as a claude.ai artifact (page plus `map.json`, `app.js`, `style.css`), or host elsewhere.
