// Atlas viewer: terrain, tiered symbols, zoom-dependent labels, and interaction (milestone 5).
// Terrain and lineage routes are world-unit paths inside transformed groups. Symbols and text are placed
// in screen space on every zoom so they stay a constant size. Which labels show at which zoom is
// decided by the build (minZoom), so the viewer only toggles classes. See SPEC.md §5.

const K_RANGE = [0.8, 12];
const FLY_MS = 600;
const MIN_MARK_SCALE = 0.55;
const SHEET_BREAKPOINT = 640;   // at or below this width the panel is a bottom sheet
const MAX_RESULTS = 8;

const svg = d3.select("#map");
const defs = svg.append("defs");
const terrainLayer = svg.append("g").attr("class", "terrain");
const routeLayer = svg.append("g").attr("class", "routes");
const titleLayer = svg.append("g").attr("class", "titles");
const doodleLayer = svg.append("g").attr("class", "doodles");
const landmarkLayer = svg.append("g").attr("class", "landmarks");

let fitK = 1;

// no-store: the map is rebuilt often during curation, and a stale cached copy hides layout changes.
d3.json("map.json", { cache: "no-store" }).then(init);

// Five-pointed star centred on 0,0 with outer radius r.
function starPath(r) {
  const pts = [];
  for (let i = 0; i < 10; i++) {
    const a = -Math.PI / 2 + (i * Math.PI) / 5, rr = i % 2 ? r * 0.45 : r;
    pts.push(`${(Math.cos(a) * rr).toFixed(2)},${(Math.sin(a) * rr).toFixed(2)}`);
  }
  return `M${pts.join("L")}Z`;
}

// Symbol per tier (SPEC §5.6): capital 14px star in a ring, city 10px dot, town 6px dot,
// outpost 7px hollow ring, hamlet (deep-dive detail) 5px soft dot, Old World 7px square. A halo ring sits behind, shown when related.
function drawSymbol(g, tier) {
  g.append("circle").attr("class", "halo").attr("r", SYMBOL_R[tier] + 5);
  if (tier === "capital") {
    g.append("circle").attr("class", "sym-ring").attr("r", 7);
    g.append("path").attr("class", "sym-star").attr("d", starPath(5));
  } else if (tier === "city") g.append("circle").attr("class", "sym-fill").attr("r", 5);
  else if (tier === "town") g.append("circle").attr("class", "sym-fill").attr("r", 3);
  else if (tier === "outpost") g.append("circle").attr("class", "sym-hollow").attr("r", 3.5);
  else if (tier === "hamlet") g.append("circle").attr("class", "sym-fill sym-soft").attr("r", 2.5);
  else g.append("rect").attr("class", "sym-fill").attr("x", -3.5).attr("y", -3.5).attr("width", 7).attr("height", 7);
  g.append("circle").attr("class", "hit").attr("r", 12); // ≥ 24px tap target
}

const SYMBOL_R = { capital: 7, city: 5, town: 3, outpost: 3.5, hamlet: 2.5, old: 3.5 };
const GAP = 4;

function placeLabel(text, d) {
  const off = SYMBOL_R[d.tier] + GAP;
  if (d.labelSide === "left") text.attr("x", -off).attr("y", 0).attr("dy", "0.35em").attr("text-anchor", "end");
  else if (d.labelSide === "above") text.attr("x", 0).attr("y", -off).attr("dy", "-0.15em").attr("text-anchor", "middle");
  else if (d.labelSide === "below") text.attr("x", 0).attr("y", off).attr("dy", "0.85em").attr("text-anchor", "middle");
  else text.attr("x", off).attr("y", 0).attr("dy", "0.35em").attr("text-anchor", "start");
}

const yearOf = (date) => (date ? String(date).slice(0, 4) : null);
// Keeps the URL in step with the selection. Sandboxed frames (e.g. a published artifact) may refuse
// history updates; selection must keep working regardless.
function setHash(url) {
  try { history.replaceState(null, "", url); } catch { /* not allowed here; deep links still work on load */ }
}

function init(map) {
  document.getElementById("edition").textContent = `${map.stage === "accepted" ? "Edition" : "Survey draft"} · ${map.built}`;
  const byId = new Map(map.landmarks.map((l) => [l.id, l]));
  const territoryById = new Map(map.territories.map((t) => [t.id, t]));
  const margin = map.view?.margin ?? { x: 150, y: 60 };
  // Labels were placed collision-free at these absolute scales (px per world unit) for a reference
  // screen. Zoom levels switch at the same scales on every screen, and below the reference scale the
  // marks shrink in proportion, so a smaller screen shows the same layout, just smaller.
  const scales = map.view?.scales ?? null;

  // ---------------------------------------------------------------- terrain
  // Bottom to top: shallows, land, territory tints, inner coast hachure, coastline.
  if (map.coast) defs.append("clipPath").attr("id", "land-clip").append("path").attr("d", map.coast);
  if (map.shallows) terrainLayer.append("path").attr("class", "shallows").attr("d", map.shallows);
  if (map.coast) terrainLayer.append("path").attr("class", "land").attr("d", map.coast);
  terrainLayer.selectAll("path.territory").data(map.territories.filter((t) => t.fill)).join("path")
    .attr("class", (d) => `territory ${d.group}`)
    .attr("d", (d) => d.fill)
    .attr("fill", (d) => d.tint);
  if (map.coast) {
    terrainLayer.append("path").attr("class", "coast-hachure").attr("d", map.coast).attr("clip-path", "url(#land-clip)");
    terrainLayer.append("path").attr("class", "coast").attr("d", map.coast);
  }

  // ---------------------------------------------------------------- titles
  const titled = [
    ...map.territories.filter((t) => t.group === "applied" && t.label).map((t) => ({ ...t, kind: "title" })),
    ...(map.oldWorld?.label ? [{ ...map.oldWorld, id: "old-world", kind: "title old-world-title", ink: null }] : []),
    ...map.territories.filter((t) => t.group === "old-world" && t.label).map((t) => ({ ...t, kind: "province" })),
  ];
  const titles = titleLayer.selectAll("text").data(titled).join("text")
    .attr("class", (d) => `territory-label ${d.kind}`)
    .style("fill", (d) => d.ink);
  // Applied titles open their region's panel (SPEC §5.3).
  titles.filter((d) => d.kind === "title").on("click", (event, d) => { event.stopPropagation(); selectRegion(d.id); });
  titles.each(function (d) {
    const t = d3.select(this);
    if (d.kind === "province") { t.append("tspan").attr("class", "province-name").text(d.subtitle.toUpperCase()); return; }
    const lines = d.titleLines ?? [(d.title ?? d.subtitle).toUpperCase()];
    lines.forEach((line, i) => t.append("tspan").attr("class", "title-line").attr("x", 0).attr("dy", i ? "1.1em" : 0).text(line));
    if (d.title) t.append("tspan").attr("class", "subtitle").attr("x", 0).attr("dy", "1.45em").text(d.subtitle);
  });

  // ---------------------------------------------------------------- landmarks
  const landmarks = landmarkLayer.selectAll("g").data(map.landmarks).join("g")
    .attr("class", (d) => `landmark ${d.tier} lz${d.minZoom}`)
    .attr("tabindex", -1);
  landmarks.each(function (d) { drawSymbol(d3.select(this), d.tier); });
  landmarks.append("text").attr("class", "label").text((d) => d.name).each(function (d) { placeLabel(d3.select(this), d); });

  // ---------------------------------------------------------------- doodles (doodles.js)
  // A doodle pinned to a landmark shows only when that landmark does, so it inherits the zoom tier.
  const doodles = doodleLayer.selectAll("g").data((window.DOODLES ?? [])
    .map((d) => ({ ...d, pin: typeof d.at === "string" ? byId.get(d.at) : { x: d.at[0], y: d.at[1] } }))
    .filter((d) => d.pin)).join("g")
    .attr("class", (d) => `doodle doodle-${d.id} dz${d.minZoom ?? 0}${d.pin.tier ? ` ${d.pin.tier}` : ""}`)
    .attr("aria-hidden", "true")
    .html((d) => `<g transform="translate(${d.dx ?? 0},${d.dy ?? 0})" filter="url(#doodle-wobble)">${d.svg}</g>`);
  // A slight wobble in every line, so the doodles read as drawn by hand rather than as icons.
  const wobble = defs.append("filter").attr("id", "doodle-wobble").attr("x", "-10%").attr("y", "-10%").attr("width", "120%").attr("height", "120%");
  wobble.append("feTurbulence").attr("type", "fractalNoise").attr("baseFrequency", 0.09).attr("numOctaves", 2).attr("seed", 7);
  wobble.append("feDisplacementMap").attr("in", "SourceGraphic").attr("scale", 1.1).attr("xChannelSelector", "R").attr("yChannelSelector", "G");

  // ---------------------------------------------------------------- zoom
  let transform = d3.zoomIdentity;
  const zoom = d3.zoom().on("zoom", ({ transform: t }) => {
    transform = t;
    terrainLayer.attr("transform", t);
    routeLayer.attr("transform", t);
    const f = scales ? Math.max(MIN_MARK_SCALE, Math.min(1, t.k / scales[0])) : 1;
    landmarks.attr("transform", (d) => `translate(${t.applyX(d.x)},${t.applyY(d.y)}) scale(${f})`);
    doodles.attr("transform", (d) => `translate(${t.applyX(d.pin.x)},${t.applyY(d.pin.y)}) scale(${f})`);
    titles.attr("transform", (d) => `translate(${t.applyX(d.label[0])},${t.applyY(d.label[1])}) scale(${f})`);
    const level = scales
      ? (t.k < scales[1] ? 0 : t.k < scales[2] ? 1 : 2)
      : (t.k / fitK < 2 ? 0 : t.k / fitK < 5 ? 1 : 2);
    svg.classed("z0", level === 0).classed("z1", level === 1).classed("z2", level === 2);
  });
  svg.call(zoom).on("dblclick.zoom", null);

  // "Fit world" frames the charted land, not the whole bounds; the open sea is room to grow.
  const cx0 = d3.min(map.landmarks, (d) => d.x), cx1 = d3.max(map.landmarks, (d) => d.x);
  const cy0 = d3.min(map.landmarks, (d) => d.y), cy1 = d3.max(map.landmarks, (d) => d.y);
  const viewport = () => svg.node().getBoundingClientRect();

  // The part of the screen not covered by the panel: on desktop the panel takes the right edge, on
  // phones the bottom sheet takes the lower part. Fly-to targets centre on this area.
  function openArea() {
    const { width, height } = viewport();
    const panel = document.getElementById("panel");
    if (panel.hidden) return { x: width / 2, y: height / 2, width, height };
    if (width <= SHEET_BREAKPOINT) {
      const sheet = panel.getBoundingClientRect().height;
      return { x: width / 2, y: (height - sheet) / 2, width, height: height - sheet };
    }
    const w = width - panel.getBoundingClientRect().width;
    return { x: w / 2, y: height / 2, width: w, height };
  }

  // Marks shrink with the map only down to MIN_MARK_SCALE; below that, text would outgrow the gaps the
  // build left for it. So zooming out stops at that scale, and a small screen (a phone) opens there and
  // pans, rather than shrinking the whole world into illegible, overlapping labels.
  const legibleK = scales ? scales[0] * MIN_MARK_SCALE : 0;
  function updateFit() {
    const { width, height } = viewport();
    const mx = Math.min(margin.x, width * 0.08), my = Math.min(margin.y, height * 0.06);
    fitK = Math.min((width - 2 * mx) / (cx1 - cx0), (height - 2 * my) / (cy1 - cy0));
    zoom.scaleExtent([Math.max(fitK * K_RANGE[0], legibleK), Math.max(fitK, legibleK) * K_RANGE[1]]);
  }
  function fitTransform() {
    updateFit();
    const { width, height } = viewport();
    const k = Math.max(fitK, legibleK);
    return d3.zoomIdentity.translate(width / 2 - ((cx0 + cx1) / 2) * k, height / 2 - ((cy0 + cy1) / 2) * k).scale(k);
  }
  // Centre a world point in the open area at scale k.
  function centredOn(x, y, k) {
    const a = openArea();
    return d3.zoomIdentity.translate(a.x - x * k, a.y - y * k).scale(k);
  }
  function flyTo(x, y, k, ms = FLY_MS) {
    svg.transition().duration(ms).ease(d3.easeCubicInOut).call(zoom.transform, centredOn(x, y, k));
  }
  // Fit a world box into the open area, stopping short of local zoom (z2) so a region keeps its title,
  // and never below region zoom (z1), so its towns show. On a phone the box may overflow; it pans.
  function fitBox(x0, y0, x1, y1, ms = FLY_MS) {
    const a = openArea(), pad = Math.min(80, a.width * 0.08);
    const cap = scales ? scales[2] * 0.85 : fitK * K_RANGE[1];
    const floor = scales ? scales[1] * 1.05 : fitK * K_RANGE[0];
    const k = Math.max(floor, Math.min(cap, (a.width - 2 * pad) / Math.max(1, x1 - x0), (a.height - 2 * pad) / Math.max(1, y1 - y0)));
    flyTo((x0 + x1) / 2, (y0 + y1) / 2, k, ms);
  }

  svg.call(zoom.transform, fitTransform());
  // On resize keep the current view; only the fit scale (and so the zoom limits) changes.
  window.addEventListener("resize", () => updateFit());
  document.getElementById("zoom-in").onclick = () => svg.transition().duration(250).call(zoom.scaleBy, 1.6);
  document.getElementById("zoom-out").onclick = () => svg.transition().duration(250).call(zoom.scaleBy, 1 / 1.6);
  document.getElementById("zoom-fit").onclick = () => svg.transition().duration(400).call(zoom.transform, fitTransform());

  // ---------------------------------------------------------------- selection (SPEC §5.3)
  const routesFor = (id) => map.routes.filter((r) => r.from === id || r.to === id);
  let selected = null;

  function select(id, { fly = true, instant = false } = {}) {
    if (territoryById.get(id)?.group === "applied") { selectRegion(id, { instant }); return; }
    const l = byId.get(id);
    if (!l) return;
    selected = l;
    const related = new Set([...l.parents.map((p) => p.id), ...l.children]);
    svg.classed("has-selection", true);
    landmarks
      .classed("selected", (d) => d === l)
      .classed("related", (d) => related.has(d.id));
    doodles.classed("lit", (d) => d.pin === l || related.has(d.pin.id));
    routeLayer.selectAll("path").data(routesFor(id), (r) => `${r.from}>${r.to}`).join("path")
      .attr("class", (r) => `route ${r.to === id ? "ancestor" : "descendant"}${r.oceanic ? " oceanic" : ""}`)
      .attr("d", (r) => r.path);
    renderPanel(l);
    setHash(`#${encodeURIComponent(id)}`);
    if (fly) {
      // At least region zoom, so the landmark and its neighbours are labelled.
      const k = Math.max(transform.k, scales ? scales[1] * 1.15 : fitK * 2.3);
      flyTo(l.x, l.y, k, instant ? 0 : FLY_MS);
    }
  }

  // A region: its panel (overview, learning path, landmarks), framed on the map. Landmarks stay undimmed.
  function selectRegion(id, { instant = false } = {}) {
    const t = territoryById.get(id);
    if (!t) return;
    clearSelection();
    selected = t;
    renderRegionPanel(t);
    setHash(`#${encodeURIComponent(id)}`);
    const members = map.landmarks.filter((l) => l.region === id);
    fitBox(d3.min(members, (l) => l.x), d3.min(members, (l) => l.y), d3.max(members, (l) => l.x), d3.max(members, (l) => l.y), instant ? 0 : FLY_MS);
  }

  function clearSelection() {
    if (!selected) return;
    selected = null;
    svg.classed("has-selection", false);
    landmarks.classed("selected", false).classed("related", false);
    doodles.classed("lit", false);
    routeLayer.selectAll("path").remove();
    document.getElementById("panel").hidden = true;
    setHash(location.pathname + location.search);
  }

  landmarks.on("click", (event, d) => { event.stopPropagation(); select(d.id); });
  svg.on("click", () => clearSelection()); // d3-zoom suppresses the click that ends a drag
  document.getElementById("panel-close").onclick = () => clearSelection();
  window.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && document.activeElement !== searchInput) clearSelection();
  });

  // ---------------------------------------------------------------- panel
  const el = (id) => document.getElementById(id);
  function chip(text, id) {
    const b = document.createElement(id ? "button" : "span");
    b.className = "chip";
    b.textContent = text;
    if (id) b.onclick = () => select(id);
    return b;
  }
  function placeName(l) {
    const t = territoryById.get(l.region);
    if (t.group === "old-world") return `${map.oldWorld?.title ?? "The Old World"} · ${t.subtitle}`;
    return t.title ? `${t.title} · ${t.subtitle}` : t.subtitle;
  }

  // "Learn more" and "Start here" entries: a kind tag in its own column, then the linked title, who
  // and when, and an optional line on what the reader gets from it.
  const KIND_LABEL = { source: "Source", paper: "Paper", talk: "Talk", blog: "Blog", docs: "Docs", tutorial: "Tutorial", code: "Code" };
  function resourceItem(r) {
    const li = document.createElement("li");
    const kind = document.createElement("span"); kind.className = `kind kind-${r.kind}`; kind.textContent = KIND_LABEL[r.kind] ?? r.kind;
    const body = document.createElement("div"); body.className = "res-body";
    const title = document.createElement(r.url ? "a" : "span"); title.className = "res-title"; title.textContent = r.title;
    if (r.url) { title.href = r.url; title.target = "_blank"; title.rel = "noopener"; }
    body.append(title);
    const by = [r.by, r.year].filter(Boolean).join(", ");
    if (by) { const p = document.createElement("div"); p.className = "res-by"; p.textContent = by; body.append(p); }
    if (r.why) { const p = document.createElement("p"); p.className = "why"; p.textContent = r.why; body.append(p); }
    li.append(kind, body);
    return li;
  }
  function fillResources(listId, sectionId, items) {
    el(listId).replaceChildren(...(items ?? []).map(resourceItem));
    el(sectionId).hidden = !(items ?? []).length;
  }
  // Footer rows scroll sideways: the mouse wheel scrolls them too, and a faded edge shows there's more.
  function fadeEdges(row) {
    row.classList.toggle("more-left", row.scrollLeft > 1);
    row.classList.toggle("more-right", row.scrollLeft + row.clientWidth < row.scrollWidth - 1);
  }
  for (const id of ["panel-parents", "panel-children"]) {
    const row = el(id);
    row.addEventListener("scroll", () => fadeEdges(row), { passive: true });
    row.addEventListener("wheel", (e) => {
      if (Math.abs(e.deltaY) <= Math.abs(e.deltaX) || row.scrollWidth <= row.clientWidth) return;
      e.preventDefault();
      row.scrollLeft += e.deltaY;
    }, { passive: false });
  }
  // Sections that belong to only one of the two panel kinds.
  const LANDMARK_ONLY = ["panel-meta", "panel-examples", "panel-learn-section", "panel-lineage-section", "panel-nav"];
  const REGION_ONLY = ["panel-path-section", "panel-members-section"];
  const openPanel = () => {
    const panel = el("panel");
    panel.hidden = false;
    panel.querySelector(".panel-body").scrollTop = 0;
  };

  function renderRegionPanel(t) {
    for (const id of LANDMARK_ONLY) el(id).hidden = true;
    for (const id of REGION_ONLY) el(id).hidden = false;
    el("panel-where").textContent = t.title ? `Region · ${t.subtitle}` : "Region";
    el("panel-name").textContent = t.title ?? t.subtitle;
    el("panel-summary").textContent = t.about ?? "";
    el("panel-summary").hidden = !t.about;
    fillResources("panel-path", "panel-path-section", t.learningPath);
    // Core landmarks first (the overview), deep-dive detail after; each group oldest first.
    const members = map.landmarks.filter((l) => l.region === t.id)
      .sort((a, b) => (a.layer === "detail") - (b.layer === "detail") || String(a.date).localeCompare(String(b.date)));
    el("panel-members").replaceChildren(...members.map((l) => {
      const c = chip(l.name, l.id);
      if (l.layer === "detail") c.classList.add("detail");
      return c;
    }));
    el("panel-members-section").hidden = !members.length;
    openPanel();
  }

  function renderPanel(l) {
    for (const id of REGION_ONLY) el(id).hidden = true;
    el("panel-meta").hidden = false;
    el("panel-nav").hidden = false;
    el("panel-where").textContent = placeName(l);
    el("panel-name").textContent = l.name;
    el("panel-maturity").textContent = l.maturityLabel;
    el("panel-maturity").dataset.maturity = l.maturity;
    el("panel-date").textContent = yearOf(l.date) ? `c. ${yearOf(l.date)}` : "";
    el("panel-note").textContent = l.maturityNote ?? "";
    el("panel-note").hidden = !l.maturityNote;
    // The plain-language summary supersedes the shorter technical description when there is one.
    const about = l.summary ?? l.desc ?? "";
    el("panel-summary").textContent = about;
    el("panel-summary").hidden = !about;

    // Examples are names only (no links yet), so they read as a line of text, not as buttons.
    const ex = el("panel-examples");
    ex.replaceChildren();
    if (l.examples?.length) {
      const label = document.createElement("span"); label.className = "label"; label.textContent = "In practice: ";
      ex.append(label, l.examples.join(", "));
    }
    ex.hidden = !l.examples?.length;

    // Learn more leads with the node's own source, then the curated resources.
    const source = l.ref?.title ? [{ kind: "source", title: l.ref.title, url: l.ref.href }] : [];
    fillResources("panel-learn", "panel-learn-section", [...source, ...(l.resources ?? [])]);

    // Lineage in the body explains each parent; the footer below is just for walking the graph.
    const explained = [
      ...l.parents.map((p) => ({ name: byId.get(p.id)?.name ?? p.id, id: p.id, why: p.why })),
      ...l.external.map((x) => ({ name: x.name.replace(/-/g, " "), why: x.why })),
    ].filter((p) => p.why);
    el("panel-lineage").replaceChildren(...explained.map((p) => {
      const li = document.createElement("li");
      const name = document.createElement(p.id ? "button" : "span");
      name.className = p.id ? "link" : "beyond";
      name.textContent = p.name;
      if (p.id) name.onclick = () => select(p.id);
      else name.title = "Beyond the map's edge: an ancestor not charted yet";
      const why = document.createElement("p"); why.className = "why"; why.textContent = p.why;
      li.append(name, why);
      return li;
    }));
    el("panel-lineage-section").hidden = !explained.length;

    // The footer keeps a fixed height and place, so its chips don't move as the reader walks the graph.
    const navChips = (rowId, chips) => {
      const row = el(rowId);
      if (!chips.length) { const none = document.createElement("span"); none.className = "nav-none"; none.textContent = "none charted"; chips = [none]; }
      row.replaceChildren(...chips);
      row.scrollLeft = 0;
    };
    navChips("panel-parents", [
      ...l.parents.map((p) => chip(byId.get(p.id)?.name ?? p.id, p.id)),
      ...l.external.map((x) => {
        const c = chip(x.name.replace(/-/g, " "));
        c.classList.add("beyond");
        c.title = "Beyond the map's edge: an ancestor not charted yet";
        return c;
      }),
    ]);
    navChips("panel-children", l.children.map((id) => chip(byId.get(id)?.name ?? id, id)));

    openPanel();
    fadeEdges(el("panel-parents"));
    fadeEdges(el("panel-children"));
  }

  // ---------------------------------------------------------------- search (SPEC §5.4)
  const searchInput = el("search");
  const resultsEl = el("search-results");
  const territoryEntries = map.territories.map((t) => ({
    kind: "territory", id: t.id, name: t.group === "old-world" ? t.subtitle : (t.title ?? t.subtitle),
    sub: t.group === "old-world" ? (map.oldWorld?.title ?? "The Old World") : (t.title ? t.subtitle : ""),
    haystack: [t.title, t.subtitle].filter(Boolean).join(" ").toLowerCase(),
  }));
  const landmarkEntries = map.landmarks.map((l) => ({
    kind: "landmark", id: l.id, name: l.name, sub: placeName(l).split(" · ")[0],
    nameLower: l.name.toLowerCase(),
    aliases: (l.aliases ?? []).map((a) => [a, a.toLowerCase()]),
    examples: (l.examples ?? []).map((x) => [x, x.toLowerCase()]),
    prose: [l.summary, l.desc, l.maturityNote].filter(Boolean),
  }));
  let results = [], active = -1;

  // A short excerpt of prose around the match, for the result's "why" line.
  function excerpt(text, i, len) {
    const from = Math.max(0, i - 24), to = Math.min(text.length, i + len + 36);
    return `${from > 0 ? "…" : ""}${text.slice(from, to).trim()}${to < text.length ? "…" : ""}`;
  }
  const escapeRe = (q) => q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

  // How a landmark matches the query, best first: name prefix (0), name (1), alias (2), example (3),
  // description or maturity note (4, queries of 3+ characters, matched at a word start). Null if none.
  function matchLandmark(e, q) {
    if (e.nameLower.startsWith(q)) return { rank: 0 };
    if (e.nameLower.includes(q)) return { rank: 1 };
    const alias = e.aliases.find(([, lower]) => lower.includes(q));
    if (alias) return { rank: 2, why: `Also called ${alias[0]}` };
    const example = e.examples.find(([, lower]) => lower.includes(q));
    if (example) return { rank: 3, why: `Example: ${example[0]}` };
    if (q.length >= 3) {
      const re = new RegExp(`\\b${escapeRe(q)}`, "i");
      for (const text of e.prose) {
        const m = re.exec(text);
        if (m) return { rank: 4, why: excerpt(text, m.index, q.length) };
      }
    }
    return null;
  }

  function search(q) {
    q = q.trim().toLowerCase();
    if (!q) return [];
    const lm = landmarkEntries
      .map((e) => ({ e, m: matchLandmark(e, q) }))
      .filter(({ m }) => m)
      .sort((a, b) => a.m.rank - b.m.rank || a.e.name.localeCompare(b.e.name))
      .map(({ e, m }) => ({ ...e, rank: m.rank, why: m.why ?? null }));
    const tr = territoryEntries.filter((e) => e.haystack.includes(q));
    // Regions go after name, alias and example matches, but before matches found only in descriptions.
    return [...lm.filter((r) => r.rank < 4), ...tr, ...lm.filter((r) => r.rank === 4)].slice(0, MAX_RESULTS);
  }
  function renderResults() {
    resultsEl.replaceChildren(...results.map((r, i) => {
      const li = document.createElement("li");
      li.setAttribute("role", "option");
      li.id = `result-${i}`;
      li.className = `result ${r.kind}${i === active ? " active" : ""}`;
      li.setAttribute("aria-selected", i === active);
      const head = document.createElement("div"); head.className = "result-head";
      const name = document.createElement("span"); name.className = "result-name"; name.textContent = r.name;
      const sub = document.createElement("span"); sub.className = "result-sub"; sub.textContent = r.kind === "territory" ? `Region${r.sub ? ` · ${r.sub}` : ""}` : r.sub;
      head.append(name, sub);
      li.append(head);
      if (r.why) { const why = document.createElement("div"); why.className = "result-why"; why.textContent = r.why; li.append(why); }
      li.onmousedown = (e) => { e.preventDefault(); choose(r); };
      return li;
    }));
    resultsEl.hidden = !results.length;
    searchInput.setAttribute("aria-expanded", String(results.length > 0));
    searchInput.setAttribute("aria-activedescendant", active >= 0 ? `result-${active}` : "");
  }
  function choose(r) {
    searchInput.value = "";
    results = []; active = -1; renderResults();
    searchInput.blur();
    if (r.kind === "landmark" || territoryById.get(r.id)?.group === "applied") { select(r.id); return; }
    clearSelection();
    const members = map.landmarks.filter((l) => l.region === r.id);
    fitBox(d3.min(members, (l) => l.x), d3.min(members, (l) => l.y), d3.max(members, (l) => l.x), d3.max(members, (l) => l.y));
  }
  searchInput.addEventListener("input", () => { results = search(searchInput.value); active = results.length ? 0 : -1; renderResults(); });
  searchInput.addEventListener("keydown", (e) => {
    if (e.key === "ArrowDown" && results.length) { active = (active + 1) % results.length; renderResults(); e.preventDefault(); }
    else if (e.key === "ArrowUp" && results.length) { active = (active - 1 + results.length) % results.length; renderResults(); e.preventDefault(); }
    else if (e.key === "Enter" && active >= 0) { choose(results[active]); e.preventDefault(); }
    else if (e.key === "Escape") { searchInput.value = ""; results = []; active = -1; renderResults(); searchInput.blur(); }
  });
  searchInput.addEventListener("blur", () => { resultsEl.hidden = true; searchInput.setAttribute("aria-expanded", "false"); });
  searchInput.addEventListener("focus", () => { if (results.length) { resultsEl.hidden = false; searchInput.setAttribute("aria-expanded", "true"); } });
  // "/" focuses search, as on many map and docs sites.
  window.addEventListener("keydown", (e) => { if (e.key === "/" && document.activeElement !== searchInput) { e.preventDefault(); searchInput.focus(); } });

  // ---------------------------------------------------------------- deep links (SPEC §5.5)
  const fromHash = () => decodeURIComponent(location.hash.slice(1));
  const linkable = (id) => byId.has(id) || territoryById.get(id)?.group === "applied";
  if (linkable(fromHash())) select(fromHash(), { instant: true });
  window.addEventListener("hashchange", () => { if (linkable(fromHash()) && fromHash() !== selected?.id) select(fromHash()); });

  // Debug hook: atlas.zoomTo(rel, x, y) jumps to a zoom relative to fit-to-world, centred on a world point.
  window.atlas = {
    zoomTo(rel, x = (cx0 + cx1) / 2, y = (cy0 + cy1) / 2) {
      const { width, height } = viewport();
      svg.call(zoom.transform, d3.zoomIdentity.translate(width / 2 - x * fitK * rel, height / 2 - y * fitK * rel).scale(fitK * rel));
    },
    select, clearSelection,
  };
}
