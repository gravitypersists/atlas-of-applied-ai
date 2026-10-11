# Atlas of Applied AI

An atlas of applied AI engineering: the techniques and approaches, and where each one came from.

**[Open the atlas →](https://gravitypersists.github.io/atlas-of-applied-ai/)**

The atlas is drawn as a fantasy map. Each technique is a landmark, placed near the ideas it grew out of. Each field of applied AI is a territory: retrieval is the Archival Reach, agents are the Free Cities, inference is the Engine Works. The older disciplines they descend from make up the Old World, across the ocean to the west. Established techniques sit inland, and new research sits on islands offshore. Click any landmark to see what it's built on, what it led to, and where to learn more.

## How it's made

Everything on the map comes from one hand-edited file, `backbone.yaml`. It lists the regions, the techniques, and the lineage between them. A Node build turns that file into the map, and a static page in `map/public/` displays it.

```
backbone.yaml ──validate.py──▶ backbone.json ──map/build.mjs──▶ map/public/map.json ──▶ viewer
```

The geography is permanent. Once a landmark is on the map it keeps its place, and land only grows. Adding a technique settles it near its parents and leaves everything else where it was.

## Running it locally

You'll need Python 3 and Node 22.

```sh
git clone git@github.com:gravitypersists/atlas-of-applied-ai.git
cd atlas-of-applied-ai
pip install pyyaml
(cd map && npm install)

python3 map/serve.py 8000       # then open http://localhost:8000
```

That serves the map as it's committed. After changing anything, rebuild it:

```sh
python3 validate.py             # checks backbone.yaml and writes backbone.json; must report 0 errors
python3 make_guides.py          # regenerates the research guides in deep-dives/
node map/build.mjs              # settles new landmarks and redraws map/public/map.json
```

Then reload the page. The dev server turns off caching, so you'll see the change straight away.

## Quick guides

### Add a resource link

Resources are the "Learn more" links in a landmark's panel: papers, talks, blog posts, docs, tutorials and code.

1. Find the landmark in `backbone.yaml`. Every node has an `id:` (e.g. `graph-rag`), and the URL shows it too: `…/#graph-rag`.
2. Add an entry to its `resources` list, or add the list if it doesn't have one:

   ```yaml
   resources:
     - {kind: talk, title: "GraphRAG methods to create optimized LLM context windows", by: "Jonathan Larson (Microsoft)", year: 2025, url: "https://www.youtube.com/watch?v=c5qJHr3DnT4"}
   ```

   `kind` is one of `paper`, `talk`, `blog`, `docs`, `tutorial` or `code`.
3. Run `python3 validate.py` and `node map/build.mjs`, then check the panel in the browser.

Please open every link you add and make sure it's the right page. A good resource is one you'd send a colleague who's new to the technique.

### Add a new landmark

1. **Pick its region.** The regions are listed under `regions:` near the top of `backbone.yaml`. If it could fit in more than one, check `boundary_rules:`, which decides the ambiguous cases (e.g. function calling belongs to Agents, prompt caching to Inference).
2. **Make sure it isn't already there.** Search `backbone.yaml` for the name and its common aliases. It may already exist under another name.
3. **Add a node** under `nodes:`. Copy a nearby one as a template:

   ```yaml
   - id: my-technique                 # lowercase, hyphenated, unique
     name: My Technique
     aliases: [other name it goes by]
     region: retrieval-and-knowledge  # its home region
     desc: One sentence on what it is.
     summary: "Two or three plain-language sentences for the panel: what it does, and why it matters."
     parents:
       - {id: retrieval-augmented-generation, rel: extends, why: "What it takes from the parent.", src: "Paper or source for the claim"}
     maturity: 2                      # 1 research · 2 emerging · 3 maturing · 4 established · 5 foundational
     date: "2024-06"                  # when it appeared, quoted; "YYYY" is fine too
     ref: {title: "The paper that introduced it (Author et al.)", arxiv: "2406.01234"}   # or url: instead of arxiv
     status: added
   ```

   - **Parents matter most.** They decide where the landmark lands on the map. Choose the techniques it actually builds on. `rel` is one of `extends`, `specializes`, `combines`, `applies`, `replaces` or `counters`. If the true ancestor isn't on the map, use `id: external:<name>`.
   - **A landmark can't be dated before any of its parents.** `validate.py` checks this.
   - **Maturity** sets how it's drawn: 1–2 become offshore islands, 3 and up sit on the mainland.
4. **Rebuild:** run `python3 validate.py`, `python3 make_guides.py` and `node map/build.mjs`. The build prints where the new landmark settled. Look it up in the browser by searching its name.
5. **Commit everything the build changed**, including `map/atlas/ledger.yaml`, `map/atlas/terrain.json` and `map/public/map.json`. The ledger is the map's permanent record of where each landmark was placed.

If the landmark is drawn somewhere awkward, you can move its symbol within its own territory without touching the terrain: add `my-technique: {at: [x, y]}` under `nodes:` in `map/curation.yaml`. Never edit the ledger by hand.

### Add a doodle

Doodles are the small ink drawings scattered around the map, like the engine house puffing out tokens or the serpent marked "Here be hallucinations".

1. Read [`DOODLES.md`](DOODLES.md) first. It's short, and it keeps every doodle looking like it came from the same pen: ink only, fantasy-map objects, one idea per drawing.
2. Add an entry to `window.DOODLES` in `map/public/doodles.js`, pinned to a landmark:

   ```js
   // The Archival Reach, beside GraphRAG: a web of strings pinned between books.
   {
     id: "string-web", at: "graph-rag", dx: 12, dy: 4,
     svg: `
       <path class="ground" d="M-2 0.4 Q10 -0.5 24 0.3"/>
       <path class="solid" d="..."/>`,
   },
   ```

   Draw in screen pixels with the base line at `y = 0`, around 25–40 px across. `dx` and `dy` nudge the doodle into empty space beside its landmark.
3. Run `node map/build.mjs`, then check the doodle at world, region and local zoom, and at a phone-sized width.

### Add a new region

Adding a region is a big job, and most proposals for one are better as a few landmarks in an existing region. A new region needs at least 8 landmarks, a title and subtitle, and its own territory on the map. The geography is permanent, so finding room for a whole new territory means redrawing the coast by hand.

If you think a field of applied AI is missing, **please open an issue first** describing the region and the landmarks it would hold. We can work out together whether it should be a new region or a few additions to existing ones.

## Contributing

Contributions are welcome, especially new resource links, missing techniques, and corrections to dates, references or lineage. Open a pull request with your change and the rebuilt files, and say briefly why. `validate.py` must report 0 errors.

## More reading

| File | What's in it |
|---|---|
| [`STRATEGY.md`](STRATEGY.md) | What the map means: why it looks the way it does |
| [`SPEC.md`](SPEC.md) | How the map is built, in detail |
| [`DOODLES.md`](DOODLES.md) | The doodle style guide |
| [`MERGING.md`](MERGING.md) | How deep-research reports get merged into the backbone |
| [`BACKBONE.md`](BACKBONE.md) | The backbone's contents, the shape of the graph, and its revision history |
| `deep-dives/` | One research prompt per region, used to grow the atlas |

## License

[MIT](LICENSE)
