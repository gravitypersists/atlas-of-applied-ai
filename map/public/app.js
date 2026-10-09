// Atlas viewer: terrain plus debug landmarks (milestone 2).
// Terrain paths are in world units and drawn inside one transformed group. Symbols and text are
// placed in screen space on every zoom so they stay a constant size.

const ZOOM_LEVELS = [2, 5];     // k thresholds for z1, z2 (SPEC §5.2), relative to fit-to-world
const K_RANGE = [0.8, 12];

const svg = d3.select("#map");
const terrainLayer = svg.append("g").attr("class", "terrain");
const routeLayer = svg.append("g").attr("class", "routes");
const landmarkLayer = svg.append("g");
const labelLayer = svg.append("g");

let fitK = 1;

// no-store: the map is rebuilt often during curation, and a stale cached copy hides layout changes.
d3.json("map.json", { cache: "no-store" }).then(init);

function init(map) {
  document.getElementById("edition").textContent = `${map.stage === "accepted" ? "Edition" : "Survey draft"} · ${map.built}`;
  const byId = new Map(map.landmarks.map((l) => [l.id, l]));
  const territoryById = new Map(map.territories.map((t) => [t.id, t]));
  const ink = (regionId) => territoryById.get(regionId)?.ink ?? "#3b2f20";

  // Terrain, bottom to top: shallows, land, territory tints, coastline.
  if (map.shallows) terrainLayer.append("path").attr("class", "shallows").attr("d", map.shallows);
  if (map.coast) terrainLayer.append("path").attr("class", "land").attr("d", map.coast);
  terrainLayer.selectAll("path.territory").data(map.territories.filter((t) => t.fill)).join("path")
    .attr("class", (d) => `territory ${d.group}`)
    .attr("d", (d) => d.fill)
    .attr("fill", (d) => d.tint);
  if (map.coast) terrainLayer.append("path").attr("class", "coast").attr("d", map.coast);

  // Lineage routes are a debug overlay until selection arrives (milestone 5): press "l" to toggle.
  const routes = routeLayer.selectAll("line").data(map.routes).join("line")
    .attr("class", (d) => `route${d.cross ? " cross" : ""}`);
  window.addEventListener("keydown", (e) => { if (e.key === "l") svg.classed("show-routes", !svg.classed("show-routes")); });

  const landmarks = landmarkLayer.selectAll("g").data(map.landmarks).join("g")
    .attr("class", (d) => `landmark${d.maturity <= 2 ? " outpost" : ""}`);
  landmarks.append("circle")
    .attr("r", (d) => 2 + d.maturity)
    .attr("fill", (d) => ink(d.region))
    .style("stroke", (d) => (d.maturity <= 2 ? ink(d.region) : null));
  landmarks.append("text")
    .attr("x", (d) => 5 + d.maturity)
    .attr("dy", "0.35em")
    .text((d) => d.name);
  landmarks.append("title").text((d) => `${d.name} · ${d.maturityLabel}`);

  const territories = labelLayer.selectAll("text").data(map.territories.filter((t) => t.label)).join("text")
    .attr("class", (d) => `territory-label ${d.group}`)
    .attr("fill", (d) => d.ink);
  territories.append("tspan").attr("class", "title").text((d) => (d.title ?? d.subtitle).toUpperCase());
  territories.filter((d) => d.title).append("tspan").attr("class", "subtitle").attr("x", 0).attr("dy", "1.4em").text((d) => d.subtitle);

  const zoom = d3.zoom().on("zoom", ({ transform: t }) => {
    terrainLayer.attr("transform", t);
    routes
      .attr("x1", (d) => t.applyX(byId.get(d.from).x)).attr("y1", (d) => t.applyY(byId.get(d.from).y))
      .attr("x2", (d) => t.applyX(byId.get(d.to).x)).attr("y2", (d) => t.applyY(byId.get(d.to).y));
    landmarks.attr("transform", (d) => `translate(${t.applyX(d.x)},${t.applyY(d.y)})`);
    territories.attr("transform", (d) => `translate(${t.applyX(d.label[0])},${t.applyY(d.label[1])})`);
    const rel = t.k / fitK;
    const level = rel < ZOOM_LEVELS[0] ? 0 : rel < ZOOM_LEVELS[1] ? 1 : 2;
    svg.classed("z0", level === 0).classed("z1", level === 1).classed("z2", level === 2);
  });
  svg.call(zoom).on("dblclick.zoom", null);

  // "Fit world" frames the charted land, not the whole bounds; the open sea is room to grow.
  // Screen-space margin, so wide region titles at the edges stay on screen.
  const MARGIN = { x: 150, y: 60 };
  const cx0 = d3.min(map.landmarks, (d) => d.x), cx1 = d3.max(map.landmarks, (d) => d.x);
  const cy0 = d3.min(map.landmarks, (d) => d.y), cy1 = d3.max(map.landmarks, (d) => d.y);

  function fitTransform() {
    const { width, height } = svg.node().getBoundingClientRect();
    fitK = Math.min((width - 2 * MARGIN.x) / (cx1 - cx0), (height - 2 * MARGIN.y) / (cy1 - cy0));
    zoom.scaleExtent([fitK * K_RANGE[0], fitK * K_RANGE[1]]);
    return d3.zoomIdentity
      .translate(width / 2 - ((cx0 + cx1) / 2) * fitK, height / 2 - ((cy0 + cy1) / 2) * fitK)
      .scale(fitK);
  }

  svg.call(zoom.transform, fitTransform());
  window.addEventListener("resize", () => svg.call(zoom.transform, fitTransform()));
  document.getElementById("zoom-in").onclick = () => svg.transition().duration(250).call(zoom.scaleBy, 1.6);
  document.getElementById("zoom-out").onclick = () => svg.transition().duration(250).call(zoom.scaleBy, 1 / 1.6);
  document.getElementById("zoom-fit").onclick = () => svg.transition().duration(400).call(zoom.transform, fitTransform());
}
