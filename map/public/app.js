// Atlas viewer: terrain, tiered symbols, and zoom-dependent labels (milestone 4).
// Terrain paths are in world units inside one transformed group. Symbols and text are placed in
// screen space on every zoom so they stay a constant size. Which labels show at which zoom is
// decided by the build (minZoom), so the viewer only toggles classes.

const K_RANGE = [0.8, 12];

const svg = d3.select("#map");
const defs = svg.append("defs");
const terrainLayer = svg.append("g").attr("class", "terrain");
const routeLayer = svg.append("g").attr("class", "routes");
const titleLayer = svg.append("g").attr("class", "titles");
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
// outpost 7px hollow ring, Old World 7px square.
function drawSymbol(g, tier) {
  if (tier === "capital") {
    g.append("circle").attr("class", "sym-ring").attr("r", 7);
    g.append("path").attr("class", "sym-star").attr("d", starPath(5));
  } else if (tier === "city") g.append("circle").attr("class", "sym-fill").attr("r", 5);
  else if (tier === "town") g.append("circle").attr("class", "sym-fill").attr("r", 3);
  else if (tier === "outpost") g.append("circle").attr("class", "sym-hollow").attr("r", 3.5);
  else g.append("rect").attr("class", "sym-fill").attr("x", -3.5).attr("y", -3.5).attr("width", 7).attr("height", 7);
}

const SYMBOL_R = { capital: 7, city: 5, town: 3, outpost: 3.5, old: 3.5 };
const GAP = 4;

function placeLabel(text, d) {
  const off = SYMBOL_R[d.tier] + GAP;
  if (d.labelSide === "left") text.attr("x", -off).attr("y", 0).attr("dy", "0.35em").attr("text-anchor", "end");
  else if (d.labelSide === "above") text.attr("x", 0).attr("y", -off).attr("dy", "-0.15em").attr("text-anchor", "middle");
  else if (d.labelSide === "below") text.attr("x", 0).attr("y", off).attr("dy", "0.85em").attr("text-anchor", "middle");
  else text.attr("x", off).attr("y", 0).attr("dy", "0.35em").attr("text-anchor", "start");
}

function init(map) {
  document.getElementById("edition").textContent = `${map.stage === "accepted" ? "Edition" : "Survey draft"} · ${map.built}`;
  const byId = new Map(map.landmarks.map((l) => [l.id, l]));
  const margin = map.view?.margin ?? { x: 150, y: 60 };
  // Labels were placed collision-free at these absolute scales (px per world unit) for a reference
  // screen. Zoom levels switch at the same scales on every screen, and below the reference scale the
  // marks shrink in proportion, so a smaller screen shows the same layout, just smaller.
  const scales = map.view?.scales ?? null;
  const MIN_MARK_SCALE = 0.55;

  // Terrain, bottom to top: shallows, land, territory tints, inner coast hachure, coastline.
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

  // Lineage routes are a debug overlay until selection arrives (milestone 5): press "l" to toggle.
  const routes = routeLayer.selectAll("line").data(map.routes).join("line")
    .attr("class", (d) => `route${d.cross ? " cross" : ""}`);
  window.addEventListener("keydown", (e) => { if (e.key === "l") svg.classed("show-routes", !svg.classed("show-routes")); });

  // Territory titles (applied regions and the Old World) and Old World province names.
  const titled = [
    ...map.territories.filter((t) => t.group === "applied" && t.label).map((t) => ({ ...t, kind: "title" })),
    ...(map.oldWorld?.label ? [{ ...map.oldWorld, id: "old-world", kind: "title old-world-title", ink: null }] : []),
    ...map.territories.filter((t) => t.group === "old-world" && t.label).map((t) => ({ ...t, kind: "province" })),
  ];
  const titles = titleLayer.selectAll("text").data(titled).join("text")
    .attr("class", (d) => `territory-label ${d.kind}`)
    .style("fill", (d) => d.ink);
  titles.each(function (d) {
    const t = d3.select(this);
    if (d.kind === "province") { t.append("tspan").attr("class", "province-name").text(d.subtitle.toUpperCase()); return; }
    const lines = d.titleLines ?? [(d.title ?? d.subtitle).toUpperCase()];
    lines.forEach((line, i) => t.append("tspan").attr("class", "title-line").attr("x", 0).attr("dy", i ? "1.1em" : 0).text(line));
    if (d.title) t.append("tspan").attr("class", "subtitle").attr("x", 0).attr("dy", "1.45em").text(d.subtitle);
  });

  // Landmarks: symbol and label, classed by tier and by the zoom at which the label appears.
  const landmarks = landmarkLayer.selectAll("g").data(map.landmarks).join("g")
    .attr("class", (d) => `landmark ${d.tier} lz${d.minZoom}`);
  landmarks.each(function (d) { drawSymbol(d3.select(this), d.tier); });
  landmarks.append("text").attr("class", "label").text((d) => d.name).each(function (d) { placeLabel(d3.select(this), d); });
  landmarks.append("title").text((d) => `${d.name} · ${d.maturityLabel}`);

  const zoom = d3.zoom().on("zoom", ({ transform: t }) => {
    terrainLayer.attr("transform", t);
    routes
      .attr("x1", (d) => t.applyX(byId.get(d.from).x)).attr("y1", (d) => t.applyY(byId.get(d.from).y))
      .attr("x2", (d) => t.applyX(byId.get(d.to).x)).attr("y2", (d) => t.applyY(byId.get(d.to).y));
    const f = scales ? Math.max(MIN_MARK_SCALE, Math.min(1, t.k / scales[0])) : 1;
    landmarks.attr("transform", (d) => `translate(${t.applyX(d.x)},${t.applyY(d.y)}) scale(${f})`);
    titles.attr("transform", (d) => `translate(${t.applyX(d.label[0])},${t.applyY(d.label[1])}) scale(${f})`);
    const level = scales
      ? (t.k < scales[1] ? 0 : t.k < scales[2] ? 1 : 2)
      : (t.k / fitK < 2 ? 0 : t.k / fitK < 5 ? 1 : 2);
    svg.classed("z0", level === 0).classed("z1", level === 1).classed("z2", level === 2);
  });
  svg.call(zoom).on("dblclick.zoom", null);

  // "Fit world" frames the charted land, not the whole bounds; the open sea is room to grow.
  // The margin matches the one the build used to place labels.
  const cx0 = d3.min(map.landmarks, (d) => d.x), cx1 = d3.max(map.landmarks, (d) => d.x);
  const cy0 = d3.min(map.landmarks, (d) => d.y), cy1 = d3.max(map.landmarks, (d) => d.y);

  function fitTransform() {
    const { width, height } = svg.node().getBoundingClientRect();
    fitK = Math.min((width - 2 * margin.x) / (cx1 - cx0), (height - 2 * margin.y) / (cy1 - cy0));
    zoom.scaleExtent([fitK * K_RANGE[0], fitK * K_RANGE[1]]);
    return d3.zoomIdentity
      .translate(width / 2 - ((cx0 + cx1) / 2) * fitK, height / 2 - ((cy0 + cy1) / 2) * fitK)
      .scale(fitK);
  }

  svg.call(zoom.transform, fitTransform());
  // Debug hook: atlas.zoomTo(rel, x, y) jumps to a zoom relative to fit-to-world, centred on a world point.
  window.atlas = {
    zoomTo(rel, x = (cx0 + cx1) / 2, y = (cy0 + cy1) / 2) {
      const { width, height } = svg.node().getBoundingClientRect();
      svg.call(zoom.transform, d3.zoomIdentity.translate(width / 2 - x * fitK * rel, height / 2 - y * fitK * rel).scale(fitK * rel));
    },
  };
  window.addEventListener("resize", () => svg.call(zoom.transform, fitTransform()));
  document.getElementById("zoom-in").onclick = () => svg.transition().duration(250).call(zoom.scaleBy, 1.6);
  document.getElementById("zoom-out").onclick = () => svg.transition().duration(250).call(zoom.scaleBy, 1 / 1.6);
  document.getElementById("zoom-fit").onclick = () => svg.transition().duration(400).call(zoom.transform, fitTransform());
}
