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
    overview: "…"                        # optional: 150–300 words for the region panel
    learning_path:                       # optional: the region panel's "Start here", in reading order
      - {kind: talk, title: "…", by: "…", year: 2024, url: "https://…", why: "…"}
```

Nodes get three optional reader fields, which come from the deep-dive runs (`make_guides.py`):

- `layer`: `core` (the default; the backbone overview) or `detail` (deep-dive content). Detail nodes settle and shape the land like any other node, but appear only at local zoom (§4.7).
- `summary`: 2–3 plain-language sentences. When present, the panel leads with it and shows `desc` as the technical line.
- `resources`: the panel's "Learn more" list, `[{kind, title, by, year, url}]`, where `kind` is in `meta.resource_kinds` (paper, talk, blog, docs, tutorial, code). The node's `ref` isn't repeated here.

`validate.py` checks layer values, resource kinds, titles and URLs, and duplicate URLs, and warns when a resource repeats the key reference.

### 3.2 `map/atlas/ledger.yaml` (permanent)

```yaml
world:
  seed: 7
  bounds: [0, 0, 4800, 3000]           # world units; fixed at survey
  cell: 4                              # world units per terrain grid cell; fixed at survey
  sea_level: 0.42                      # may only ever be lowered
  surveyed: "2026-10-08"
settlements:                           # append-only; order = settlement order; settled = backbone meta.date
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
  spread:                              # scale a region's landmarks out from their centroid, then shift (world units)
    multimodal-applied: {scale: 1.6, shift: [170, 0], jitter: 45}   # jitter: seeded per-landmark nudge off the even grid
terrain:                               # per-region terrain style (TERRAIN.styles in map/terrain.mjs); read every build
  multimodal-applied: archipelago      # tighter uplift and no lineage ridges: one island per landmark
  planning-and-reasoning:              # or an object: optional `style`, plus a curated spine
    spine: {points: [[2230, 1790], [2200, 1960], ...], height: 0.75, width: 45}   # height/width default to TERRAIN.spine
nodes:
  bm25: {label: left}                  # label side: right (default) | left | above | below
  react-agent-loop: {tier: capital}    # force a symbol tier
regions:
  retrieval-and-knowledge: {label: [1820, 700]}   # territory label position override
```

Curation never touches settled geography. The `survey` block only shapes the founding survey; `survey --redo` keeps the chosen sea level. The `terrain` block shapes land on every build. Once the survey is accepted, land only grows, so a style change there can add land but never remove it. To move a settled landmark you edit the ledger, as described in 3.2.

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
    "label": [x, y], "group": "applied",      // "old-world" for root provinces
    "titleLines": ["THE ISLE OF", "LONG THOUGHT"],  // applied territories only
    "about": "…", "learningPath": [{"kind": "paper", "title": "…", "by": "…", "year": 2022, "url": "…", "why": "…"}]   // region overview (falls back to the definition)
  }],
  "view": {"levels": [2, 5], "margin": {"x": 150, "y": 60}},   // zoom thresholds and fit margin used for label placement
  "oldWorld": {"title": "The Old World", "subtitle": "Ancestral Disciplines", "label": [x, y], "titleLines": ["THE OLD WORLD"]},
  "landmarks": [{
    "id": "graph-rag", "name": "GraphRAG", "region": "retrieval-and-knowledge",
    "x": 0, "y": 0, "tier": "outpost", "score": 2.58, "minZoom": 2, "labelSide": "right",
    "desc": "…", "maturity": 2, "maturityLabel": "Emerging", "maturityNote": "…",
    "date": "2024-04", "aliases": […], "examples": […],
    "layer": "core", "summary": "…",          // summary is null when the node has none
    "ref": {"title": "…", "href": "https://arxiv.org/abs/2404.16130"},
    "resources": [{"kind": "talk", "title": "…", "by": "…", "year": 2024, "url": "…", "why": null}],
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
  - Height and spread: `h` and `σ` grow with maturity, plus a fixed per-tier bonus (`tierBonus`) that steepens tiers 4–5 so the skew toward mature nodes doesn't flatten everything. Uplift depends only on the node's own data, so adding or removing other nodes never changes it.
  - Root nodes get a modest bonus, so the Old World reads as a solid continent.
  - Organic shape: distance is measured in a domain-warped space, `d = |warp(p) − warp(node)|` with `warp(p) = p + A·fbm(p)` over several octaves. Warping the landmark's own position as well keeps every bump peaked exactly on its landmark while its outline stays irregular. Ridges warp their endpoints the same way.
- **Lineage ridge.**
  - Which edges: every edge where both endpoints are maturity ≥ 3 and on the same side of the ocean. Edges between the Old World and the New World raise no ridge, so the ocean stays open.
  - Shape: a ridge along the parent→child segment, with height following a smoothed profile `r · exp(−dist_to_segment²/2w²)`.
  - Height: for cross-region edges, `r` scales with the number of edges between that region pair, normalized by the strongest pair. Strong connections clear sea level and weak ones don't.
  - In-region edges use a constant `r`, which keeps each territory internally contiguous.
- **Region styles.** A region can take a terrain style from `curation.yaml`. The Painted Isles use `archipelago`, which:
  - scales its landmarks' `σ` by `sigmaScale`
  - raises no lineage ridges into, out of, or within the region, so islands rarely fuse
  - gives each island a size factor (`size`) and a stretch along a direction (`elongation`), so islands vary from small and round to long and thin. Both are seeded by the landmark's id alone, so they never change as other landmarks arrive.
  - adds a submerged shelf: a broad, low plateau under the region (`shelf.sigma`, `shelf.height`) with fine noise (`shelf.noise`, `shelf.scale`) whose peaks break the surface as islets and rocks between the main islands. The shelf fades where other territories' uplift is rising (`shelf.fade`), so its rocks never bridge to a neighbour. That fade is the one place where adding a landmark can *lower* elevation; once the survey is accepted, the high-water mark keeps any land that already exists.
- **Spines.** A region's `terrain` entry may add a curated `spine`: a polyline in world units, raised as a broad ridge (the same profile as a lineage ridge, with its own `height` and `width`, defaulting to `TERRAIN.spine`). It holds a long landform together where the landmarks alone would break up, as with the Peninsula of Long Thought, whose young landmarks would otherwise be islets. A spine is fixed geography: it doesn't follow the landmarks, so their ledger positions are laid along it by hand.
- **Bedrock.** Seeded fBm at two scales: a broad one that pushes land out into peninsulas and pulls it back into bays independently of the landmarks, and a fine one (`detail`) that gives coasts their raggedness, coves, and small rocks.
- **Basin.** A smooth falloff in the outer margin of `bounds`, so the world ends in sea.

- **Harbours.** About half of the landmarks of maturity 3 or more that sit within `TERRAIN.harbour.reach` of the sea (chosen by a seed from the node id) get a round bay carved just seaward of them, so they sit on a cove a few units from the water instead of in the middle of their own rise. Which landmarks qualify, and which way is seaward, are measured on E without bays. A region with a curated spine gets no bays, since its outline is hand-shaped.

Uplift and ridges are non-negative, and bedrock and basin are fixed per location. Bays are the one negative term, and which landmarks get one can change as the map grows. Adding nodes, raising maturity, or adding edges can therefore lower E in places, but once the survey is accepted the high-water mark (§4.2) means no land ever sinks.

### 4.2 Land and claims

While the survey is a draft (`world.accepted: false`), `terrain.json` is regenerated from scratch on every build, so sea level and terrain constants can be tuned freely. Once the survey is accepted, the previous `terrain.json` is the high-water mark and every rule below applies.

Each build:
1. Compute E.
2. Set `newLand = E > sea_level AND NOT land`, then `land |= newLand`. This is the high-water mark.
3. **Guarantee:** every landmark's cell must be land, and a harbour landmark must sit at least `TERRAIN.minShore` from the sea. For an outpost, that land is usually its own islet. If one isn't, halve its bay's depth (dropping the bay once it is shallow) or add uplift at that node until it is (up to 5 passes), then fail and name the node.
4. **Claims:** each `newLand` cell is owned by the region of the landmark that reaches it first through land (BFS over land cells from all landmarks). That way claims don't jump across water. Cells that already had an owner keep it.
   - **Frontier towns.** Claims are first run with every landmark starting together. Then a seeded share of landmarks (`TERRAIN.frontier`) get a head start, sized so that their border ends up a set distance (12–26 units) from the nearest landmark on the other side of it. Without this, a border always falls midway between two landmarks, so no landmark ever sits near one. Head starts are accepted one at a time, each checked by re-running the claims: one that would cost any region more than `frontier.maxLoss` of its land, or split a territory, is halved, then dropped. Only landmarks on their region's main body qualify, so outlying pieces never grow. A region with a curated spine is left as it is: its landmarks get no head starts, and no head start may take any of its land. Landmarks that face each other across a border never both get a head start. The cells within `frontier.guard` of every landmark are reserved for its region, so no landmark is ever swallowed.
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

Constants live in `SETTLE` in `map/build.mjs`. New nodes are settled parents first, then in backbone file order. Each one is placed against the terrain as it stood before this build, plus the nodes settled earlier in the same build.

For each backbone node that isn't in the ledger:
1. **Candidates.** A seeded, jittered grid of sites within radius `R` of the centroid of its placed parents *in the same world*. Oceanic parents are ignored, as in the survey. If it has none, the centroid of its region's landmarks is used instead. If the region has no landmarks either, the build fails and asks for a hand placement.
2. **Score each site.** Lower is better. Then choose the best site.
   - distance to the parent centroid
   - a hard reject within `minSpacing` of any landmark, and a soft crowding penalty out to `comfortSpacing`
   - a hard reject in the outer `basinMargin` of the world
   - a hard reject on land owned by another region, and a penalty for water facing another region's shore
   - a hard reject for sites on the wrong side of the ocean
   - a site-type penalty, which depends on maturity:
     - maturity 1–2: the site must be water between `islet[0]` and `islet[1]` from the coast, ideally `isletIdeal`. That's far enough that the node's own small rise stays a separate islet until it matures.
     - maturity ≥ 3: land, penalized beyond `coastBand` inland, or water at most `shoreWater` out, since land will grow to meet it
   - Coast distances come from a two-pass chamfer distance transform (`coastField` in `map/terrain.mjs`), within a few percent of true Euclidean distance.
3. Candidates are gathered out to `8R`, in rings that double each time, and the best score overall wins. Distance is part of the score, so a farther site only wins when every nearer one carries a penalty, for example by facing another region's shore. If there is no acceptable site at all, the build fails and names the node.
   - **Frontier nodes are verified, not estimated.** Near a coast the sea floor is already shallow, so distance alone can't promise an islet. For maturity 1–2 nodes, the best `isletTries` sites are tested in order. Each test simulates the terrain with that site added, including the same coverage repair the real build applies, and the first site whose land touches no other landmark is taken. If none qualifies, the best site is used and the build warns.
4. Append `{id, x, y, settled}` to the ledger, where `settled` is the backbone's `meta.date` (the edition). Using the build date would break determinism. The node's uplift and ridges then grow land in step 4.2.
5. `settle --dry-run` prints what would be settled or retired and writes nothing.

Nodes that have disappeared from the backbone move to `retired`. Their entry stays and still reserves its position, and their land stays. A node whose `region` changes keeps its position. Once the survey is accepted, the build warns when a landmark sits in another region's territory, for human review.

**Ledger invariant.** Once the survey is accepted, `writeLedger` refuses to write unless the existing settlements are an unchanged prefix of the new list and the retired list only grows.

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
| `hamlet` | `layer: detail` (deep-dive content). Never the capital. |
| `city` | maturity ≥ 4 and childCount ≥ 2 |
| `town` | everything else |

### 4.8 Label zoom thresholds (`minZoom`)

Labels are cartography, not geography, so they can change between builds. Even so, labels that are already placed have priority, which keeps them stable. Implemented in `map/labels.mjs`. Its `LABELS` block holds the reference viewport, text sizes, and glyph-width estimates, and the CSS font sizes must match them.

- **Screen-space placement.** Symbols and text are drawn at a constant screen size, so collisions depend on zoom. Placement works in pixels for a reference 1440×860 viewport at each level's lowest scale: fit-to-world for z0, ×2 for z1, ×5 for z2. That's each level's most crowded moment. Text widths are estimated per character, with capitals and digits counted wider. The widths were measured in the browser against the real fonts and rounded up. If fonts or sizes change, re-measure and update `LABELS.text` along with `style.css`. The build writes the fit margin, the zoom thresholds, and the absolute scales (px per world unit) where z0, z1 and z2 begin to `map.json` under `view`.
- **Any screen size.** The viewer switches zoom levels at those absolute scales rather than relative to its own fit-to-world. Below the z0 reference scale, symbols, labels and titles shrink in proportion, down to 55%. A smaller screen therefore shows the same collision-free layout, just smaller. Only below 55% (phone-sized screens at full zoom-out) can marks crowd again.
- **Titles first.** Applied territories get titles; the Old World gets one title over the union of its provinces. Each title has one fixed anchor. Candidates are points inside its territory, most interior first (from a distance transform of the territory's claims). Larger territories choose first. A title may not overlap a placed title or a capital at z0, and it prefers the candidate that covers the fewest symbols visible at z1. Titles longer than 14 characters wrap onto two lines. Province names show only at z2. They're placed last, at the most interior point of their province that clears every landmark label and symbol at that scale. Curation can pin any of these with `regions.<id>.label` or `old_world.label`.

- **Placement.** Labels are placed greedily for z = 0, 1, 2.
- **Order.** Landmarks are taken in tier order (capital > city > town > outpost), then by `settled` (oldest first), then by score.
- **Eligibility by zoom.** z0 shows capitals only; z1 adds cities and towns; z2 shows everything.
- **Fitting.** For each landmark, try its curated side first, then right, left, above, below. `minZoom` is the first zoom level at which a side fits without colliding with a placed label, a title visible at that level, or a symbol visible at that level. A label that never fits still gets `minZoom: 2`, and it's reported.
- **Build report.** Tier counts, labels per zoom level, titles covering z1 symbols, and z2 collisions.

### 4.9 Routes

Each lineage edge becomes a gently curved path from parent to child: a quadratic curve bowed by 14% of its length (22% for routes across the ocean, like sea lanes) to a side chosen by a hash of the edge itself, so it never changes as the map grows. `map.json` routes carry `from`, `to`, `cross`, `oceanic` and `path`.

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
- **Side panel:** 360px, on the right; the zoom buttons move left of it while it's open. On screens 640px wide or narrower it becomes a bottom sheet up to 55% of the screen's height, the zoom buttons sit above it, and the cartouche is hidden.
- **Bottom left:** a small cartouche reading "Applied AI Engineering Atlas" with the edition date. There is no legend.

### 5.2 Semantic zoom

Zoom is the d3-zoom scale `k`, clamped to [0.8, 12] × fit-to-world. Levels switch at the absolute scales in `map.json` `view.scales`, the scales at which the build placed labels. The relative thresholds below are what those scales mean on the 1440×860 reference screen.

| Level | `k` | Shown |
|---|---|---|
| z0 World | < 2 | coast, territory titles and subtitles, the Old World title, capitals with labels |
| z1 Region | 2–5 | adds city and town symbols, and labels where `minZoom ≤ 1` |
| z2 Local | ≥ 5 | adds outposts and hamlets, all labels, Old World province names, and internal borders at full strength |

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

**Panel contents** (a scrolling body over a fixed lineage footer):
1. The territory title and subtitle as a small header, then the name.
2. A maturity pill (e.g. "Emerging") and "c. 2024" in muted text, with the maturity note in small italics directly beneath, since it explains the maturity.
3. The plain-language `summary`, or the `desc` when there is no summary. The summary supersedes the desc; the two are never shown together.
4. **In practice:** the `examples` as a plain comma-separated line. They're names without links, so they aren't styled as buttons.
5. **Learn more:** the node's `ref` first, tagged Source (linked when it has an href; classic papers often don't), then its `resources`. Each entry is a two-column grid: the kind tag (Source, Paper, Talk, Blog, Docs, Tutorial, Code) alone on the left, and the title, author and year, and optional `why` aligned on the right.
6. **Lineage:** each parent (and external ancestor) that has a `why`, as a link with its `why` beneath.
7. **Footer** (fixed height, pinned to the panel's bottom so its chips don't move as the reader walks the graph): a **Built on** row of parent chips and a **Led to** row of child chips. Each row is one line that scrolls sideways (the mouse wheel scrolls it too) and fades at the edge where more chips continue. An empty row reads "none charted". External ancestors appear as non-clickable dashed "beyond the map" chips.

**Region panel.** Clicking an applied territory title (at z0–z1), choosing a region in search, or a `#<region-id>` deep link opens the region panel and fits the view to the region. It shows "Region · subtitle", the title, the `overview` (or the definition), **Start here** (the numbered `learning_path`, each with its `why`), and **Landmarks**: chips for every landmark in the region, core first, then detail in a lighter style. The region panel has no lineage footer.

**Chip behavior:** clicking a chip flies there (600ms, eased, to at least z1) and selects that landmark.

**Fly-to** centres the target in the part of the screen the panel doesn't cover: left of the side panel on desktop, above the bottom sheet on phones.

**Routes and dimming.** The selected landmark's routes are drawn in world units with a constant on-screen dotted stroke: dark ink to ancestors, lighter ink to descendants, and wider dots across the ocean. Dimming applies to child elements and fill-opacity, so it composes with zoom-level hiding rather than overriding it. A landmark hidden at the current zoom stays hidden unless it's selected or related.

**Clearing selection:** Esc, the × button, or clicking empty map. d3-zoom suppresses the click that ends a drag, so panning never clears.

### 5.4 Search

- Matching covers everything in a landmark's panel: case-insensitive substring on name, aliases and examples, and on the description and maturity note for queries of 3+ characters (matched at a word start, so short queries don't flood the list). Territory titles and subtitles match too.
- When a result matched on something other than its name, a second line says why: "Also called …", "Example: Jev (TypeSafe AI)", or a short excerpt of the matching description.
- It shows up to 8 results, each with its territory title.
- Ranking: name prefix, then name, alias, and example matches; then regions; then description-only matches.
- Arrow keys and Enter work, Esc clears, and `/` focuses the search box. Choosing a landmark flies to it and selects it. Choosing an applied territory opens its region panel (§5.3); choosing an Old World province clears any selection and fits the view to its landmarks. Both frame the region between z1 (so its towns show) and just short of z2 (so its title stays visible). On a phone the region can be wider than the screen, and the reader pans.

### 5.5 Deep links

`#graph-rag` opens the map focused on that landmark with it selected; `#retrieval-and-knowledge` opens that region's panel. Selection changes update the hash with `replaceState`, and clearing the selection removes it. Editing the hash by hand (`hashchange`) selects the new landmark.

### 5.6 Visual tokens

- **Fonts:** an old-style serif for titles (e.g. IM Fell English SC) and a readable serif for labels and the panel (e.g. EB Garamond).
- **Ink:** one dark sepia for all lines and text.
- **Territory tints:** 19 muted, low-saturation tints, distinct in hue and close in lightness. Root provinces use a shared, slightly darker family of tints.
- **Coast:** about 1.5px ink stroke, with a faint inner hachure. Shallows are a pale band. Internal borders are 0.75px dashed.
- **Symbols:** sizes on screen are capital 14px, city 10px, town 6px, outpost 7px (hollow), hamlet 5px (soft ink), old 7px (square).

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
7. Every landmark can be found through search and opens a complete panel. Deep links work on reload.
8. At fit-to-world zoom, the viewer sees landmass shapes, about 12 titles, and the capitals, and nothing else competes for attention.
9. On mobile, pinch, tap, and the bottom sheet all work. Pan and zoom are smooth on a mid-range laptop.

## 7. Milestones

1. **Survey.** `package.json`, region seeds, and the landmark force layout writing a draft ledger. A debug viewer shows plain dots and labels with pan and zoom, to check that the layout is sensible.
2. **Terrain.** The elevation field, `sea --sweep` with previews, land mask and claims, coast, shallows, territories, and borders. Choose sea level, curate, and accept the survey.
3. **Settlement.** `settle` with invariant checks and the build report. Exercise it with acceptance tests 3 and 4 using throwaway test nodes.
4. **Legibility.** Tiers, symbology, `minZoom` labels, and semantic-zoom CSS.
5. **Interaction.** Panel, routes, dimming, search, fly-to, deep links, and the mobile sheet.
6. **Polish.** A CLAUDE.md update and publishing. (Titles moved into `backbone.yaml` during milestone 4, because label placement depends on them.)

Each milestone ends with a screenshot review before the next begins.

**Status (2026-10-09):** milestones 1–6 are done. Criteria 1–4 are checked by `map/acceptance_test.py` and by a fresh-clone build. Criteria 5, 7 and 8 were verified in the browser with real rendered text (no label overlaps at any zoom level). Criterion 6 holds at sea level 0.36, which gives 12 landmasses, isthmuses joining strongly linked regions, and straits elsewhere. Criterion 9 was checked in a 390×844 frame: the bottom sheet and taps work, and pinch zoom comes from d3-zoom's touch support. The survey is still a draft (`world.accepted: false`) until it's accepted by hand.

## 8. Open items

- **Tuning constants.** These live in one block per concern:
  - **survey forces:** `CONFIG` in `map/build.mjs`
  - **terrain:** uplift, ridges, warp, bedrock, detail, basin, shallows: `TERRAIN` in `map/terrain.mjs`
  - **settlement:** search radius, spacing, coast band, islet distances: `SETTLE` in `map/build.mjs`
  - **cartography:** reference viewport, zoom thresholds, text sizes, title wrapping: `LABELS` in `map/labels.mjs`
- **Small screens.** Labels are placed for a 1440×860 reference viewport, and marks shrink in step with the map down to 55%. Because text and distances shrink together, the layout stays collision-free down to that scale. Zooming out stops there, so a phone opens at the smallest legible scale, centred on the map, and pans to the rest instead of fitting the whole world. Desktop fit-to-world sits above the floor and is unaffected.
- **Terrain resolution versus future zoom.** A grid cell of 4 units supports z0–z2. If deep-dive detail at z3+ needs finer coastlines, we'd add a second, finer terrain layer for the zoomed-in view. That layer would derive from the base land mask and never contradict it. Not needed for v1.
- **Root nodes as frontier.** Root nodes never become frontier. If a root discipline gains a new low-maturity node, it settles like any other node.
- **Hosting.** Published as a private claude.ai artifact: https://claude.ai/artifact/1w3VzysDkBXJxvaewKsQau (share it from the page's Share menu). To republish after a rebuild, run `python3 map/artifact_page.py <out.html>`, which writes `index.html` without its document skeleton, then publish that page to the same artifact URL with `app.js`, `style.css` and `map.json` as supporting files. Any static host works too: serve `map/public/` as is.
