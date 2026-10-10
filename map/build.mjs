// Applied AI Engineering Atlas: map build.
//
//   node build.mjs                 settle (milestone 1: render map.json from the ledger)
//   node build.mjs survey [--redo] one-time founding survey → atlas/ledger.yaml
//   any command: --preview <file.svg> also writes a static debug SVG
//
// See ../SPEC.md for the contracts this implements.

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import yaml from "js-yaml";
import * as Terrain from "./terrain.mjs";
import { assignTiers, placeLabels, levelScales, LABELS } from "./labels.mjs";
import {
  forceSimulation, forceLink, forceManyBody, forceCollide, forceX, forceY,
} from "d3-force";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, "..");
const PATHS = {
  backbone: path.join(ROOT, "backbone.json"),
  curation: path.join(HERE, "curation.yaml"),
  ledger: path.join(HERE, "atlas", "ledger.yaml"),
  terrain: path.join(HERE, "atlas", "terrain.json"),
  previewDir: path.join(HERE, ".preview"),
  mapJson: path.join(HERE, "public", "map.json"),
};

// ---------------------------------------------------------------- config
const CONFIG = {
  seed: 7,
  bounds: [0, 0, 4800, 3000],
  cell: 4,
  margin: 0.14,               // fraction of bounds kept as open sea: the basin, and room for the frontier to grow
  region: {
    trials: 32,               // seeded restarts; keep the lowest-energy arrangement
    ticks: 500,
    radiusPerSqrtNode: 72,
    gap: 90,                  // sea between region bodies
    linkBase: 0.04,
    linkScale: 0.7,
    rootKinship: 3,           // every pair of root regions is linked with this weight: one Old World
    // West → east is old → new. Survey-space x bands (pre-fit units):
    oldWorld: [-1900, -1050],
    ocean: [-1050, -700],     // the divide between the Old World and the New World
    newWorld: [-700, 1900],
    xPull: 0.03,              // gentle recency bias toward a region's west–east target
    hintPull: 1.0,            // firm pull for regions with a curated west–east hint
    rootYPull: 0.04,          // the Old World stays one continent
    // The New World settles in an elliptical gravity well: stiffer north–south than east–west,
    // so collisions push regions out sideways into an oval rather than a disc.
    newWorldGravity: 0.4,
    newWorldAspect: 1.8,      // target width / height of the well
    spread: -1200,            // region bodies repel a little; lower values let regions clump with seas between
  },
  landmark: {
    ticks: 800,
    linkDistIn: 55,
    linkDistCross: 110,
    linkStrength: 0.7,        // divided by max endpoint degree
    clusterPull: 0.2,
    rootClusterPull: 0.45,    // root disciplines hold together as the Old World core
    crossLinkScale: 0.3,      // cross-region links pull weakly so regions don't interpenetrate
    alsoPull: 0.025,
    recencyPull: 0.04,        // within a region, older nodes lean west and newer ones east
    recencySpanYears: 4,      // years from the region median that map to ±half the region radius
    maturityPull: 0.06,
    interiorFrac: 0.8,        // most mature → centroid, least mature (≥3) → this × R
    outpostFrac: 1.3,         // maturity 1–2 → this × R, facing open sea
    collideBase: 44,
    growthRoom: 9,            // × log2(1 + childCount)
    charge: -30,
  },
};

// Settlement of new landmarks (SPEC §4.4). World units.
const SETTLE = {
  radius: 170,              // first search radius around the parents' centroid; doubles up to 3 times
  step: 14,                 // candidate spacing (jittered grid)
  minSpacing: 62,           // hard minimum distance to any landmark (survey p10 nearest neighbour is ~80)
  comfortSpacing: 95,       // soft crowding penalty below this
  coastBand: 70,            // non-frontier nodes prefer land within this distance of the coast
  shoreWater: 36,           // ...or water at most this far out (land will grow to meet them)
  isletTries: 12,           // frontier nodes: how many top sites to test by simulating the terrain
  islet: [80, 190],         // frontier nodes settle offshore at this water distance: far enough that
  isletIdeal: 110,          // their own small rise stays a separate islet until they mature
  territoryPenalty: 300,    // water facing another region's shore
  basinMargin: 0.1,         // never settle in the outer margin of the world
};

const MATURITY_LABEL = { 1: "Research", 2: "Emerging", 3: "Maturing", 4: "Established", 5: "Foundational" };

// ---------------------------------------------------------------- utilities
function mulberry32(a) {
  return function () {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
function hashString(s) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619);
  return h >>> 0;
}
// One independent stream per purpose, so adding a node never shifts another stream.
const rngFor = (seed, salt) => mulberry32((seed ^ hashString(salt)) >>> 0);

const round1 = (v) => Math.round(v * 10) / 10;
const lerp = (a, b, t) => a + (b - a) * t;
const median = (xs) => { const s = [...xs].sort((a, b) => a - b); const m = s.length >> 1; return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2; };
// "YYYY" → mid-year; "YYYY-MM" → that month.
const decimalYear = (d) => { const [y, m] = String(d).split("-").map(Number); return m ? y + (m - 1) / 12 : y + 0.5; };
// Normalized rank in [0, 1]; ties share the lower rank.
function rankNorm(values) {
  const sorted = [...values].sort((a, b) => a - b);
  return values.map((v) => (values.length > 1 ? sorted.indexOf(v) / (values.length - 1) : 0.5));
}
const log2p1 = (n) => Math.log2(1 + n);

function readYaml(file, fallback) {
  if (!fs.existsSync(file)) return fallback;
  return yaml.load(fs.readFileSync(file, "utf8")) ?? fallback;
}

// ---------------------------------------------------------------- backbone
function loadBackbone() {
  const bb = JSON.parse(fs.readFileSync(PATHS.backbone, "utf8"));
  const byId = new Map(bb.nodes.map((n) => [n.id, n]));
  const regionById = new Map(bb.regions.map((r) => [r.id, r]));
  const edges = [];
  const children = new Map(bb.nodes.map((n) => [n.id, []]));
  for (const n of bb.nodes) {
    for (const p of n.parents ?? []) {
      if (!byId.has(p.id)) continue; // external: ancestors are not placed
      const pr = byId.get(p.id).region;
      edges.push({
        source: p.id, target: n.id, cross: pr !== n.region,
        // Crosses between the Old World and the New World. Ignored by the survey in this edition.
        oceanic: (regionById.get(pr).kind === "root") !== (regionById.get(n.region).kind === "root"),
      });
      children.get(p.id).push(n.id);
    }
  }
  return { bb, byId, regionById, edges, children };
}

// ---------------------------------------------------------------- survey
function regionWeights(model) {
  const { bb, byId, edges } = model;
  const w = new Map();
  const key = (a, b) => (a < b ? `${a}|${b}` : `${b}|${a}`);
  const add = (a, b, v) => { if (a !== b) w.set(key(a, b), (w.get(key(a, b)) ?? 0) + v); };
  for (const e of edges) if (!e.oceanic) add(byId.get(e.source).region, byId.get(e.target).region, 1);
  const roots = bb.regions.filter((r) => r.kind === "root");
  for (let i = 0; i < roots.length; i++) for (let j = i + 1; j < roots.length; j++) add(roots[i].id, roots[j].id, CONFIG.region.rootKinship);
  return [...w].map(([k, v]) => { const [a, b] = k.split("|"); return { a, b, w: v }; });
}

function surveyRegions(model, hints) {
  const C = CONFIG.region;
  const { bb } = model;
  const counts = new Map(bb.regions.map((r) => [r.id, 0]));
  for (const n of bb.nodes) counts.set(n.region, counts.get(n.region) + 1);
  const pairs = regionWeights(model);
  const wmax = Math.max(...pairs.map((p) => p.w));
  const targetX = regionTargetX(model, hints);
  const xStrength = (d) => (d.id in hints ? C.hintPull : C.xPull);

  let best = null;
  for (let t = 0; t < C.trials; t++) {
    const rng = rngFor(CONFIG.seed, `regions:${t}`);
    const bodies = bb.regions.map((r) => {
      return {
        id: r.id, kind: r.kind, r: C.radiusPerSqrtNode * Math.sqrt(counts.get(r.id)),
        x: targetX.get(r.id) + (rng() - 0.5) * 400, y: (rng() - 0.5) * 1600,
      };
    });
    const byId = new Map(bodies.map((b) => [b.id, b]));
    const links = pairs.map((p) => ({ source: p.a, target: p.b, w: p.w }));
    const sim = forceSimulation(bodies)
      .randomSource(rng)
      .force("link", forceLink(links).id((d) => d.id)
        .strength((l) => C.linkBase + C.linkScale * (l.w / wmax))
        .distance((l) => l.source.r + l.target.r + C.gap))
      .force("collide", forceCollide((d) => d.r + C.gap / 2).strength(1).iterations(3))
      .force("spread", forceManyBody().strength(C.spread).distanceMax(1600))
      .force("x", forceX((d) => targetX.get(d.id)).strength(xStrength))
      .force("y", forceY(0).strength((d) => (d.kind === "root" ? C.rootYPull : 0)))
      .force("well", newWorldWell(bodies))
      .force("level", levelWorlds(bodies))
      .force("divide", divideForce(bodies, (d) => d.kind === "root", (d) => d.r))
      .stop();
    sim.tick(C.ticks);
    // Energy: weighted gap between linked bodies beyond touching distance.
    let energy = 0;
    for (const p of pairs) {
      const A = byId.get(p.a), B = byId.get(p.b);
      energy += p.w * Math.max(0, Math.hypot(A.x - B.x, A.y - B.y) - A.r - B.r);
    }
    if (!best || energy < best.energy) best = { energy, bodies, trial: t };
  }
  return { ...best, targetX };
}

// West–east target per region, within its own world. A curated hint (0 = west edge, 1 = east edge)
// wins; otherwise regions are ordered by the rank of their median node date, oldest furthest west.
function regionTargetX(model, hints) {
  const C = CONFIG.region;
  const { bb } = model;
  const out = new Map();
  for (const [kind, band, inset] of [["root", C.oldWorld, [250, 200]], ["applied", C.newWorld, [300, 300]]]) {
    const regions = bb.regions.filter((r) => (r.kind === "root") === (kind === "root"));
    const years = regions.map((r) => median(bb.nodes.filter((n) => n.region === r.id).map((n) => decimalYear(n.date))));
    rankNorm(years).forEach((t, i) => {
      const id = regions[i].id;
      // Hints span the whole band (0 is the coast itself); unhinted regions keep clear of the edges.
      out.set(id, id in hints ? lerp(band[0], band[1], hints[id]) : lerp(band[0] + inset[0], band[1] - inset[1], t));
    });
  }
  for (const id of Object.keys(hints)) if (!out.has(id)) fail(`curation survey.west_east: unknown region ${id}`);
  return out;
}

// Hard constraint: Old World bodies stay west of the ocean, New World bodies east of it.
// `exempt` lets frontier outposts sit offshore in the ocean.
function divideForce(items, isOld, radius, exempt = () => false) {
  const [west, east] = CONFIG.region.ocean;
  return () => {
    for (const d of items) {
      if (exempt(d)) continue;
      const r = radius(d);
      if (isOld(d) && d.x + r > west) { d.x = west - r; d.vx = Math.min(d.vx, 0); }
      if (!isOld(d) && d.x - r < east) { d.x = east + r; d.vx = Math.max(d.vx, 0); }
    }
  };
}

// Elliptical gravity centered on the New World's band: k east–west, k·aspect² north–south.
function newWorldWell(bodies) {
  const C = CONFIG.region;
  const cx = (C.newWorld[0] + C.newWorld[1]) / 2;
  const applied = bodies.filter((b) => b.kind !== "root");
  return (alpha) => {
    for (const b of applied) {
      b.vx += (cx - b.x) * C.newWorldGravity * alpha;
      b.vy += (0 - b.y) * C.newWorldGravity * C.newWorldAspect ** 2 * alpha;
    }
  };
}

// Keeps each world's north–south midpoint level with the equator (y = 0) by translating the
// whole world, so worlds line up without being squashed.
function levelWorlds(bodies) {
  const worlds = [bodies.filter((b) => b.kind === "root"), bodies.filter((b) => b.kind !== "root")];
  return (alpha) => {
    for (const w of worlds) {
      const mid = (Math.min(...w.map((b) => b.y - b.r)) + Math.max(...w.map((b) => b.y + b.r))) / 2;
      for (const b of w) b.vy -= mid * 0.5 * alpha;
    }
  };
}

function surveyLandmarks(model, regionLayout) {
  const C = CONFIG.landmark;
  const { bb, edges, children } = model;
  const rng = rngFor(CONFIG.seed, "landmarks");
  const body = new Map(regionLayout.bodies.map((b) => [b.id, b]));
  const appliedBodies = regionLayout.bodies.filter((b) => b.kind !== "root");
  const newCx = appliedBodies.reduce((a, b) => a + b.x, 0) / appliedBodies.length;
  const newCy = appliedBodies.reduce((a, b) => a + b.y, 0) / appliedBodies.length;
  const regionYear = new Map(bb.regions.map((r) => [r.id, median(bb.nodes.filter((n) => n.region === r.id).map((n) => decimalYear(n.date)))]));
  const isRootRegion = (id) => body.get(id).kind === "root";

  // Maturity rank within region: 0 = most mature (oldest breaks ties), 1 = least mature.
  const rank = new Map();
  for (const r of bb.regions) {
    const members = bb.nodes.filter((n) => n.region === r.id && n.maturity >= 3)
      .sort((a, b) => b.maturity - a.maturity || String(a.date).localeCompare(String(b.date)));
    members.forEach((n, i) => rank.set(n.id, members.length > 1 ? i / (members.length - 1) : 0));
  }

  const nodes = bb.nodes.map((n) => {
    const b = body.get(n.region);
    const a = rng() * Math.PI * 2, d = rng() * b.r * 0.5;
    return {
      id: n.id, region: n.region, also: n.also ?? [], maturity: n.maturity,
      root: isRootRegion(n.region),
      year: decimalYear(n.date),
      childCount: children.get(n.id).length,
      x: b.x + Math.cos(a) * d, y: b.y + Math.sin(a) * d,
    };
  });
  const worldEdges = edges.filter((e) => !e.oceanic);
  const deg = new Map(nodes.map((n) => [n.id, 0]));
  for (const e of worldEdges) { deg.set(e.source, deg.get(e.source) + 1); deg.set(e.target, deg.get(e.target) + 1); }

  // Custom force: cluster to region, weak pull to `also` regions, maturity target radius.
  function territorial(alpha) {
    for (const n of nodes) {
      const b = body.get(n.region);
      // Outposts are held more loosely so they can sit offshore.
      const pull = (b.kind === "root" ? C.rootClusterPull : C.clusterPull) * (n.maturity <= 2 ? 0.4 : 1);
      n.vx += (b.x - n.x) * pull * alpha;
      n.vy += (b.y - n.y) * pull * alpha;
      for (const r of n.also) {
        const o = body.get(r);
        if (!o) continue;
        n.vx += (o.x - n.x) * C.alsoPull * alpha;
        n.vy += (o.y - n.y) * C.alsoPull * alpha;
      }
      // Recency: within the region, older leans west and newer leans east.
      const lean = Math.max(-1, Math.min(1, (n.year - regionYear.get(n.region)) / C.recencySpanYears));
      n.vx += (b.x + lean * 0.5 * b.r - n.x) * C.recencyPull * alpha;

      let tx, ty;
      if (n.maturity <= 2) {
        // Face open sea: away from the New World's centre, through the region centroid.
        let dx = b.x - newCx, dy = b.y - newCy;
        const len = Math.hypot(dx, dy) || 1;
        dx /= len; dy /= len;
        tx = b.x + dx * b.r * C.outpostFrac;
        ty = b.y + dy * b.r * C.outpostFrac;
      } else {
        const dx = n.x - b.x, dy = n.y - b.y;
        const len = Math.hypot(dx, dy) || 1;
        const target = rank.get(n.id) * C.interiorFrac * b.r;
        tx = b.x + (dx / len) * target;
        ty = b.y + (dy / len) * target;
      }
      n.vx += (tx - n.x) * C.maturityPull * alpha;
      n.vy += (ty - n.y) * C.maturityPull * alpha;
    }
  }

  // Lineage across the ocean is ignored by the survey: each world is laid out on its own terms.
  const links = worldEdges.map((e) => ({ ...e }));
  const sim = forceSimulation(nodes)
    .randomSource(rng)
    .force("link", forceLink(links).id((d) => d.id)
      .distance((l) => (l.cross ? C.linkDistCross : C.linkDistIn))
      .strength((l) => (l.cross ? C.crossLinkScale : 1) * C.linkStrength / Math.max(deg.get(l.source.id), deg.get(l.target.id))))
    .force("charge", forceManyBody().strength(C.charge).distanceMax(200))
    .force("collide", forceCollide((d) => C.collideBase + C.growthRoom * log2p1(d.childCount)).strength(0.9).iterations(3))
    .force("territorial", territorial)
    .force("divide", divideForce(nodes, (d) => d.root, () => 0, (d) => d.maturity <= 2))
    .stop();
  sim.tick(C.ticks);
  return nodes;
}

function fitToBounds(points) {
  const [x0, y0, x1, y1] = CONFIG.bounds;
  const mx = (x1 - x0) * CONFIG.margin, my = (y1 - y0) * CONFIG.margin;
  const xs = points.map((p) => p.x), ys = points.map((p) => p.y);
  const bx0 = Math.min(...xs), bx1 = Math.max(...xs), by0 = Math.min(...ys), by1 = Math.max(...ys);
  const s = Math.min((x1 - x0 - 2 * mx) / (bx1 - bx0), (y1 - y0 - 2 * my) / (by1 - by0));
  const ox = (x0 + x1) / 2 - ((bx0 + bx1) / 2) * s, oy = (y0 + y1) / 2 - ((by0 + by1) / 2) * s;
  return (p) => ({ x: round1(p.x * s + ox), y: round1(p.y * s + oy) });
}

function writeLedger(ledger) {
  const w = ledger.world;
  // Invariant: once accepted, existing settlements are an unchanged prefix of the new list.
  if (w.accepted && fs.existsSync(PATHS.ledger)) {
    const before = readYaml(PATHS.ledger, {}).settlements ?? [];
    before.forEach((b, i) => {
      const a = ledger.settlements[i];
      if (!a || a.id !== b.id || a.x !== b.x || a.y !== b.y || a.settled !== b.settled) fail(`invariant: settled landmark ${b.id} would change`);
    });
    const retiredBefore = readYaml(PATHS.ledger, {}).retired ?? [];
    if (retiredBefore.some((id, i) => ledger.retired[i] !== id)) fail("invariant: the retired list may only grow");
  }
  const lines = [
    "# Applied AI Engineering Atlas: the permanent geography ledger.",
    "# Append-only. Positions here never change once settled (see SPEC.md §3.2).",
    "# Editing an existing entry by hand is a deliberate cartographic act: do it in a reviewed commit.",
    "world:",
    `  seed: ${w.seed}`,
    `  bounds: [${w.bounds.join(", ")}]`,
    `  cell: ${w.cell}`,
    `  sea_level: ${w.sea_level === null ? "null            # chosen in milestone 2" : w.sea_level}`,
    `  surveyed: "${w.surveyed}"`,
    `  accepted: ${w.accepted}`,
    "settlements:",
    ...ledger.settlements.map((s) => `  - {id: ${s.id}, x: ${s.x}, y: ${s.y}, settled: "${s.settled}"}`),
    `retired: [${ledger.retired.join(", ")}]`,
    "",
  ];
  fs.mkdirSync(path.dirname(PATHS.ledger), { recursive: true });
  fs.writeFileSync(PATHS.ledger, lines.join("\n"));
}

function survey(model, curation, { redo }) {
  if (fs.existsSync(PATHS.ledger)) {
    const existing = readYaml(PATHS.ledger, {});
    if (existing.world?.accepted) fail("The survey has been accepted; the ledger is permanent. Use `settle`.");
    if (!redo) fail("A ledger already exists. Pass --redo to discard it (only allowed before acceptance).");
  }
  const regions = surveyRegions(model, curation.survey?.west_east ?? {});
  if (process.env.ATLAS_DEBUG) for (const b of regions.bodies) console.log(`  ${b.id.padEnd(36)} x=${b.x.toFixed(0).padStart(6)} target=${regions.targetX.get(b.id).toFixed(0).padStart(6)} y=${b.y.toFixed(0).padStart(6)} r=${b.r.toFixed(0)}`);
  const nodes = surveyLandmarks(model, regions);
  const fit = fitToBounds(nodes);
  const date = model.bb.meta.date;
  const previous = fs.existsSync(PATHS.ledger) ? readYaml(PATHS.ledger, {}) : null;
  const ledger = {
    // A redo keeps the chosen sea level.
    world: { seed: CONFIG.seed, bounds: CONFIG.bounds, cell: CONFIG.cell, sea_level: previous?.world?.sea_level ?? null, surveyed: date, accepted: false },
    settlements: model.bb.nodes.map((n) => {
      const p = fit(nodes.find((m) => m.id === n.id));
      return { id: n.id, x: p.x, y: p.y, settled: date };
    }),
    retired: [],
  };
  // Curated spread: scale a region's landmarks out from their centroid (world units), then shift.
  for (const [region, { scale = 1, shift = [0, 0], jitter = 0 }] of Object.entries(curation.survey?.spread ?? {})) {
    const members = ledger.settlements.filter((s) => model.byId.get(s.id)?.region === region);
    if (!members.length) fail(`curation survey.spread: no landmarks in ${region}`);
    const cx = members.reduce((a, s) => a + s.x, 0) / members.length, cy = members.reduce((a, s) => a + s.y, 0) / members.length;
    for (const s of members) {
      // Seeded per landmark, so the jitter is reproducible and independent of other landmarks.
      const rng = rngFor(CONFIG.seed, `jitter:${s.id}`), a = rng() * Math.PI * 2, d = jitter * Math.sqrt(rng());
      s.x = round1(cx + (s.x - cx) * scale + shift[0] + Math.cos(a) * d);
      s.y = round1(cy + (s.y - cy) * scale + shift[1] + Math.sin(a) * d);
    }
  }
  writeLedger(ledger);
  console.log(`survey: ${ledger.settlements.length} landmarks placed (region arrangement: trial ${regions.trial}, energy ${regions.energy.toFixed(0)})`);
  console.log(`wrote ${path.relative(ROOT, PATHS.ledger)}`);
}

// ---------------------------------------------------------------- render
function hrefFor(ref) {
  if (!ref) return null;
  if (ref.arxiv) return `https://arxiv.org/abs/${ref.arxiv}`;
  return ref.url ?? null;
}

// Reader content for the panel (SPEC §5.3): one shape for node resources and region learning paths.
const resourceOf = (r) => ({ kind: r.kind, title: r.title, by: r.by ?? null, year: r.year ?? null, url: r.url, why: r.why ?? null });

function render(model, curation) {
  const ledger = readYaml(PATHS.ledger, null);
  if (!ledger) fail("No ledger yet. Run `node build.mjs survey` first.");
  const { bb, byId, regionById, edges, children } = model;
  const placed = placedOf(ledger);
  const unplaced = bb.nodes.filter((n) => !placed.has(n.id));
  if (unplaced.length) fail(`not settled: ${unplaced.map((n) => n.id).join(", ")}`);

  const settledIndex = new Map(ledger.settlements.map((s, i) => [s.id, i]));
  const landmarks = bb.nodes.filter((n) => placed.has(n.id)).map((n) => {
    const s = placed.get(n.id);
    return {
      id: n.id, name: n.name, region: n.region, x: s.x, y: s.y,
      group: regionById.get(n.region).kind === "root" ? "old-world" : "applied",
      maturity: n.maturity, maturityLabel: MATURITY_LABEL[n.maturity], maturityNote: n.maturity_note ?? null,
      desc: n.desc ?? null, summary: n.summary ?? null, date: n.date ?? null, aliases: n.aliases ?? [], examples: n.examples ?? [],
      layer: n.layer ?? "core",
      ref: n.ref ? { title: n.ref.title, href: hrefFor(n.ref) } : null,
      resources: (n.resources ?? []).map(resourceOf),
      parents: (n.parents ?? []).filter((p) => byId.has(p.id)).map((p) => ({ id: p.id, rel: p.rel, why: p.why ?? null })),
      external: (n.parents ?? []).filter((p) => !byId.has(p.id)).map((p) => ({ name: p.id.replace(/^external:/, ""), why: p.why ?? null })),
      children: children.get(n.id),
    };
  });

  const territories = bb.regions.map((r) => ({
    id: r.id, title: r.title ?? null, subtitle: r.name, group: r.kind === "root" ? "old-world" : "applied",
    about: r.overview ?? r.definition ?? null, learningPath: (r.learning_path ?? []).map(resourceOf),
    labelCurated: curation.regions?.[r.id]?.label ?? null,
  }));
  const colors = regionPalette(bb);
  for (const t of territories) Object.assign(t, colors.get(t.id));
  const oldWorld = { title: "The Old World", subtitle: "Ancestral Disciplines", ...curation.old_world };
  oldWorld.labelCurated = oldWorld.label ?? null;

  let geometry = {}, terrain = null;
  if (ledger.world.sea_level == null) {
    console.warn("warning: no sea level yet; run `node build.mjs sea --sweep`, then `sea --set <level>`");
  } else {
    terrain = buildTerrain(model, ledger);
    geometry = terrainGeometry(terrain, territories);
  }

  // Cartography: tiers, title anchors, and label zoom thresholds (SPEC §4.7–4.8).
  for (const l of landmarks) l.settledIndex = settledIndex.get(l.id);
  assignTiers(landmarks, curation.nodes ?? {});
  const labelReport = placeLabels({ landmarks, territories, oldWorld, terrain, overrides: curation.nodes ?? {} });
  for (const l of landmarks) delete l.settledIndex;
  for (const t of [...territories, oldWorld]) delete t.labelCurated;
  const tierCounts = {};
  for (const l of landmarks) tierCounts[l.tier] = (tierCounts[l.tier] ?? 0) + 1;
  const byZoom = [0, 1, 2].map((z) => landmarks.filter((l) => l.minZoom === z).length);
  console.log(`labels: tiers ${Object.entries(tierCounts).map(([k, v]) => `${k} ${v}`).join(", ")}; labels appear at z0/z1/z2: ${byZoom.join("/")}`);
  if (labelReport.titleOverlaps.length) console.warn(`warning: titles that could not avoid overlap: ${labelReport.titleOverlaps.join(", ")}`);
  if (labelReport.titleCovers.length) console.log(`labels: titles covering z1 symbols: ${labelReport.titleCovers.join(", ")}`);
  if (labelReport.unplaced.length) console.warn(`warning: labels still colliding at z2 (${labelReport.unplaced.length}): ${labelReport.unplaced.join(", ")}`);

  const out = {
    version: 1,
    built: ledger.world.surveyed,
    bounds: ledger.world.bounds,
    stage: ledger.world.accepted ? "accepted" : "survey-draft",
    // scales: px per world unit where z0, z1 and z2 begin, for the reference viewport labels were placed in.
    view: { levels: LABELS.levels, margin: LABELS.margin, scales: levelScales(landmarks).map((v) => Math.round(v * 1e6) / 1e6) },
    oldWorld,
    ...geometry,
    territories,
    landmarks,
    routes: edges.filter((e) => placed.has(e.source) && placed.has(e.target)).map((e) => routeOf(e, placed)),
  };
  fs.writeFileSync(PATHS.mapJson, JSON.stringify(out, null, 1) + "\n");
  console.log(`wrote ${path.relative(ROOT, PATHS.mapJson)}: ${landmarks.length} landmarks, ${out.routes.length} routes`);
  return out;
}

// ---------------------------------------------------------------- terrain (SPEC §4.1–4.2, §4.5–4.6)
// Muted territory tints (fills) and stronger inks (symbols). Root provinces share a sepia family.
const ROOT_COLORS = [
  ["#e3d3b4", "#8c6d46"], ["#ddcaa6", "#7a5c3a"], ["#e6d6b6", "#9a7b4f"], ["#d9c7a8", "#6e5a43"],
  ["#e8d9bd", "#a08060"], ["#dfcdb0", "#857055"], ["#dbc8aa", "#76624a"], ["#e4d2b3", "#93785a"],
  ["#ddcfb6", "#7d6a52"],
];
const APPLIED_COLORS = [
  ["#c9d9de", "#4f7a8c"], ["#e3c9d3", "#8c4f6d"], ["#d3dfc4", "#6d8c4f"], ["#ecd5bd", "#b0773c"],
  ["#d0d1e6", "#5b5fa0"], ["#c4e0da", "#3c9a8a"], ["#e8c9c4", "#a05b5b"], ["#d9cfe6", "#7f6aa8"],
  ["#cde0c8", "#4c8f4c"], ["#ead0df", "#b05a8c"], ["#c6d9e8", "#2f7fb0"], ["#dedbbd", "#857a2c"],
  ["#d6d7d2", "#5d6468"],
];
function regionPalette(bb) {
  const m = new Map();
  bb.regions.filter((r) => r.kind === "root").forEach((r, i) => m.set(r.id, { tint: ROOT_COLORS[i % ROOT_COLORS.length][0], ink: ROOT_COLORS[i % ROOT_COLORS.length][1] }));
  bb.regions.filter((r) => r.kind !== "root").forEach((r, i) => m.set(r.id, { tint: APPLIED_COLORS[i % APPLIED_COLORS.length][0], ink: APPLIED_COLORS[i % APPLIED_COLORS.length][1] }));
  return m;
}

const placedOf = (ledger) => new Map(ledger.settlements.filter((s) => !ledger.retired?.includes(s.id)).map((s) => [s.id, s]));

function loadTerrain(grid) {
  if (!fs.existsSync(PATHS.terrain)) return null;
  const t = JSON.parse(fs.readFileSync(PATHS.terrain, "utf8"));
  if (t.width !== grid.width || t.height !== grid.height) fail("terrain.json grid does not match the ledger's bounds and cell size");
  const n = t.width * t.height;
  return { ...t, land: Terrain.rleDecode(t.land, n), owner: Terrain.rleDecode(t.owner, n) };
}

// Elevation → land (high-water mark once accepted) → coverage guarantee → claims → invariants.
function buildTerrain(model, ledger, { write = true, quiet = false, level = ledger.world.sea_level } = {}) {
  const world = ledger.world;
  const grid = Terrain.makeGrid(world);
  const placed = placedOf(ledger);
  const inputs = Terrain.harbours(grid, Terrain.terrainInputs(model, placed, model.terrainStyles), world.seed, level);
  // Before the survey is accepted, terrain is a draft and regenerated from scratch every build.
  const previous = world.accepted ? loadTerrain(grid) : null;
  if (previous && level > previous.sea_level) fail(`sea level may only fall (was ${previous.sea_level}, now ${level})`);

  // Guarantee: every landmark sits on land, and a harbour at least minShore from the sea. Raise uplift
  // (or make a bay shallower) where needed, at most 5 passes.
  const boost = new Map();
  let E, land, missing = [];
  for (let pass = 0; pass <= 5; pass++) {
    E = Terrain.elevation(grid, { ...inputs, seed: world.seed }, boost);
    land = Terrain.threshold(E, level);
    if (previous) for (let k = 0; k < land.length; k++) land[k] |= previous.land[k];
    const { dist } = Terrain.coastField(grid, land, new Uint8Array(land.length));
    missing = inputs.landmarks.filter((l) => dist[Terrain.cellOf(grid, l.x, l.y)] < (l.bay ? Terrain.TERRAIN.minShore : 0));
    if (process.env.ATLAS_DEBUG) console.log(`  repair pass ${pass}: ${missing.map((l) => `${l.id}(${dist[Terrain.cellOf(grid, l.x, l.y)].toFixed(0)}, bay ${l.bay?.depth ?? 0})`).join(" ")}`);
    if (!missing.length) break;
    if (pass === 5) fail(`landmarks still at sea or on the waterline after 5 repair passes: ${missing.map((l) => l.id).join(", ")}`);
    // A harbour landmark first gets a shallower bay; others get more height.
    for (const l of missing) {
      if (l.bay?.depth > 0.15) { l.bay.depth /= 2; continue; }
      if (l.bay) l.bay.depth = 0;
      boost.set(l.id, (boost.get(l.id) ?? 0) + Terrain.TERRAIN.repairBoost);
    }
  }

  const regions = previous ? [...previous.regions] : [];
  for (const r of model.bb.regions) if (!regions.includes(r.id)) regions.push(r.id);
  const sources = inputs.landmarks.map((l) => ({ id: l.id, cell: Terrain.cellOf(grid, l.x, l.y), region: regions.indexOf(l.region), curated: l.curated }));
  const owner = Terrain.claim(grid, land, previous?.owner, Terrain.frontiers(grid, land, previous?.owner, sources));

  if (previous) {
    for (let k = 0; k < land.length; k++) {
      if (previous.land[k] && !land[k]) fail("invariant: a land cell sank");
      if (previous.owner[k] !== 255 && owner[k] !== previous.owner[k]) fail("invariant: a territory claim changed owner");
    }
  }

  const terrain = { grid, E, land, owner, regions, level, repaired: [...boost.keys()], inputs };
  if (write) {
    const grown = previous ? land.reduce((a, v, k) => a + (v && !previous.land[k] ? 1 : 0), 0) : null;
    fs.writeFileSync(PATHS.terrain, JSON.stringify({
      width: grid.width, height: grid.height, cell: grid.cell, sea_level: level, regions,
      land: Terrain.rleEncode(land), owner: Terrain.rleEncode(owner),
    }) + "\n");
    const landCells = land.reduce((a, v) => a + v, 0);
    const masses = Terrain.components(grid, land).sizes.filter((n) => n >= Terrain.TERRAIN.minLandmassCells).length;
    const before = previous ? Terrain.components(grid, previous.land).sizes.filter((n) => n >= Terrain.TERRAIN.minLandmassCells).length : null;
    console.log(`terrain: ${(100 * landCells / land.length).toFixed(1)}% land at sea level ${level}, ${masses} landmasses` +
      (before !== null && before !== masses ? ` (was ${before})` : "") +
      (grown !== null ? `, ${grown} cells grown` : " (draft: regenerated)") +
      (terrain.repaired.length ? `, uplift raised for ${terrain.repaired.join(", ")}` : ""));
  }
  return terrain;
}

// Coast, shallows, and territory fills as SVG paths in world units.
function terrainGeometry(terrain, territories) {
  const { grid, E, land, owner, regions, level } = terrain;
  const shallowsField = Float32Array.from(E, (e, k) => (land[k] ? 1 : e > level - Terrain.TERRAIN.shallowsBelow ? 0.75 : 0));
  const geometry = {
    coast: Terrain.contourPath(grid, land, 0.5),
    shallows: Terrain.contourPath(grid, shallowsField, 0.5, 2.5),
  };
  for (const t of territories) {
    const idx = regions.indexOf(t.id);
    const mask = Uint8Array.from(owner, (o) => (o === idx ? 1 : 0));
    t.fill = mask.some((v) => v) ? Terrain.contourPath(grid, mask, 0.5) : null;
  }
  return geometry;
}

// `sea --sweep`: landmass statistics per candidate sea level, plus a preview SVG for each.
function seaSweep(model, ledger, levels) {
  const grid = Terrain.makeGrid(ledger.world);
  const placed = placedOf(ledger);
  const inputs = Terrain.terrainInputs(model, placed, model.terrainStyles);
  const E = Terrain.elevation(grid, { ...inputs, seed: ledger.world.seed });
  const isRoot = (r) => model.regionById.get(r).kind === "root";
  fs.mkdirSync(PATHS.previewDir, { recursive: true });
  console.log("level  land%  landmasses  at-sea  outpost-islets  ocean-bridged  joined (applied regions sharing a landmass)");
  for (const level of levels) {
    const land = Terrain.threshold(E, level);
    const { label, sizes } = Terrain.components(grid, land);
    const masses = sizes.filter((n) => n >= Terrain.TERRAIN.minLandmassCells).length;
    const comp = new Map(inputs.landmarks.map((l) => [l.id, label[Terrain.cellOf(grid, l.x, l.y)]]));
    const atSea = inputs.landmarks.filter((l) => comp.get(l.id) < 0).length;
    const byComp = new Map();
    for (const l of inputs.landmarks) {
      const c = comp.get(l.id);
      if (c < 0) continue;
      if (!byComp.has(c)) byComp.set(c, []);
      byComp.get(c).push(l);
    }
    const islets = inputs.landmarks.filter((l) => l.maturity <= 2 && comp.get(l.id) >= 0 && byComp.get(comp.get(l.id)).length === 1).length;
    const bridged = [...byComp.values()].some((ls) => ls.some((l) => isRoot(l.region)) && ls.some((l) => !isRoot(l.region)));
    const groups = [...byComp.values()]
      .map((ls) => [...new Set(ls.filter((l) => !isRoot(l.region)).map((l) => l.region.split("-")[0]))])
      .filter((g) => g.length > 1).map((g) => g.join("+"));
    const landPct = (100 * land.reduce((a, v) => a + v, 0) / land.length).toFixed(1);
    console.log(`${String(level).padEnd(6)} ${landPct.padStart(5)}  ${String(masses).padStart(10)}  ${String(atSea).padStart(6)}  ${String(islets).padStart(14)}  ${String(bridged).padStart(13)}  ${groups.join("  ") || "—"}`);
    writeSeaPreview(model, grid, E, land, level, inputs, path.join(PATHS.previewDir, `sea-${level}.svg`));
  }
  console.log(`previews in ${path.relative(ROOT, PATHS.previewDir)}/`);
}

function writeSeaPreview(model, grid, E, land, level, inputs, file) {
  const colors = regionPalette(model.bb);
  const coast = Terrain.contourPath(grid, land, 0.5);
  const shallows = Terrain.contourPath(grid, Float32Array.from(E, (e, k) => (land[k] ? 1 : e > level - Terrain.TERRAIN.shallowsBelow ? 0.75 : 0)), 0.5, 2.5);
  const W = grid.width * grid.cell, H = grid.height * grid.cell;
  const parts = [
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${grid.x0} ${grid.y0 - (W - H) / 2} ${W} ${W}" width="${W / 2}" height="${W / 2}" font-family="Georgia, serif">`,
    `<rect x="${grid.x0}" y="${grid.y0 - (W - H) / 2}" width="${W}" height="${W}" fill="#ffffff"/>`,
    `<rect x="${grid.x0}" y="${grid.y0}" width="${W}" height="${H}" fill="#cfdcd8"/>`,
    `<path d="${shallows}" fill="#dfe8e3"/>`,
    `<path d="${coast}" fill="#efe6d2" stroke="#3b2f20" stroke-width="3"/>`,
    ...inputs.landmarks.map((l) => `<circle cx="${l.x}" cy="${l.y}" r="${l.maturity <= 2 ? 9 : 7}" fill="${l.maturity <= 2 ? "#efe6d2" : colors.get(l.region).ink}" stroke="${colors.get(l.region).ink}" stroke-width="3"/>`),
    `<text x="${grid.x0 + 40}" y="${grid.y0 + 90}" font-size="72" fill="#3b2f20">sea level ${level}</text>`,
    "</svg>",
  ];
  fs.writeFileSync(file, parts.join("\n"));
}

function setSeaLevel(ledger, level) {
  if (!Number.isFinite(level)) fail("usage: sea --set <level>");
  if (ledger.world.accepted && ledger.world.sea_level != null && level > ledger.world.sea_level) {
    fail(`the survey is accepted; sea level may only fall (currently ${ledger.world.sea_level})`);
  }
  ledger.world.sea_level = level;
  writeLedger(ledger);
  console.log(`sea level set to ${level}`);
}

// ---------------------------------------------------------------- settlement (SPEC §4.4)
// Places backbone nodes that aren't in the ledger yet, retires ledger entries that left the backbone,
// and appends both to the ledger. Existing positions are never touched.
function settle(model, ledger, { dryRun = false } = {}) {
  const { bb, byId, regionById } = model;
  const isRoot = (regionId) => regionById.get(regionId).kind === "root";
  const inLedger = new Set(ledger.settlements.map((s) => s.id));
  const retiring = ledger.settlements.map((s) => s.id).filter((id) => !byId.has(id) && !ledger.retired.includes(id));
  const pending = bb.nodes.filter((n) => !inLedger.has(n.id));
  const report = { settled: [], retired: retiring, warnings: [] };
  if (!pending.length && !retiring.length) return report;
  if (ledger.world.sea_level == null) fail("set a sea level (`sea --set`) before settling new landmarks");

  const terrain = buildTerrain(model, ledger, { write: false, quiet: true });
  const { grid, land, owner, regions } = terrain;
  const field = Terrain.coastField(grid, land, owner);

  // Current landmarks (retired ones still reserve their position).
  const pos = new Map(ledger.settlements.map((s) => [s.id, { x: s.x, y: s.y, region: byId.get(s.id)?.region ?? null }]));
  const rootXs = [...pos.values()].filter((p) => p.region && isRoot(p.region)).map((p) => p.x);
  const appliedXs = [...pos.values()].filter((p) => p.region && !isRoot(p.region)).map((p) => p.x);
  const divide = (Math.max(...rootXs) + Math.min(...appliedXs)) / 2; // the ocean between the worlds

  // Parents first: settle in rounds, each taking nodes whose in-backbone parents are all placed.
  const order = [];
  let remaining = [...pending];
  while (remaining.length) {
    const ready = remaining.filter((n) => (n.parents ?? []).every((p) => !byId.has(p.id) || pos.has(p.id) || order.includes(byId.get(p.id))));
    const take = ready.length ? ready : [remaining[0]]; // a cycle can't happen (validate.py), but never hang
    order.push(...take);
    remaining = remaining.filter((n) => !take.includes(n));
  }

  const [bx0, by0, bx1, by1] = ledger.world.bounds;
  const mx = (bx1 - bx0) * SETTLE.basinMargin, my = (by1 - by0) * SETTLE.basinMargin;
  for (const n of order) {
    const regionIdx = regions.indexOf(n.region);
    const root = isRoot(n.region);
    const parents = (n.parents ?? []).filter((p) => pos.has(p.id) && pos.get(p.id).region && isRoot(pos.get(p.id).region) === root).map((p) => pos.get(p.id));
    const kin = parents.length ? parents : [...pos.values()].filter((p) => p.region === n.region);
    if (!kin.length) fail(`cannot settle ${n.id}: no placed parents in its world and no landmarks in ${n.region}. Place it by hand in the ledger.`);
    const cx = kin.reduce((a, p) => a + p.x, 0) / kin.length, cy = kin.reduce((a, p) => a + p.y, 0) / kin.length;
    const rng = rngFor(ledger.world.seed, `settle:${n.id}`);

    // Search out to the widest radius and keep the best score overall: distance grows the score, so a
    // farther site only wins when the nearer ones carry penalties (e.g. facing another region's shore).
    let best = null;
    const ranked = [];
    for (let attempt = 0; attempt < 4; attempt++) {
      const R = SETTLE.radius * 2 ** attempt;
      const inner = attempt ? SETTLE.radius * 2 ** (attempt - 1) : 0; // each ring only adds new ground
      for (let gy = -R; gy <= R; gy += SETTLE.step) for (let gx = -R; gx <= R; gx += SETTLE.step) {
        const x = cx + gx + (rng() - 0.5) * SETTLE.step, y = cy + gy + (rng() - 0.5) * SETTLE.step;
        const dc = Math.hypot(x - cx, y - cy);
        if (dc > R || dc <= inner) continue;
        if (x < bx0 + mx || x > bx1 - mx || y < by0 + my || y > by1 - my) continue;
        if (root ? x >= divide : x <= divide) continue;
        let nearest = Infinity;
        for (const p of pos.values()) nearest = Math.min(nearest, Math.hypot(p.x - x, p.y - y));
        if (nearest < SETTLE.minSpacing) continue;
        const k = Terrain.cellOf(grid, x, y), d = field.dist[k], near = field.nearOwner[k];
        let penalty = Math.max(0, SETTLE.comfortSpacing - nearest) * 2;
        if (near !== 255 && near !== regionIdx) {
          if (d >= 0) continue; // never inside another region's territory
          penalty += SETTLE.territoryPenalty;
        }
        if (n.maturity <= 2) {
          if (d >= 0) continue;
          const w = -d;
          if (w > SETTLE.islet[1]) continue;
          if (w < SETTLE.islet[0]) continue;
          penalty += Math.abs(w - SETTLE.isletIdeal) * 0.5;
        } else if (d >= 0) {
          penalty += Math.max(0, d - SETTLE.coastBand) * 1.5;
        } else {
          if (-d > SETTLE.shoreWater) continue;
          penalty += -d * 3;
        }
        const score = dc + penalty;
        ranked.push({ x: round1(x), y: round1(y), score, water: d < 0, nearest });
      }
    }
    ranked.sort((a, b) => a.score - b.score);
    if (!ranked.length) fail(`no acceptable site for ${n.id} near its parents. Place it by hand in the ledger.`);
    best = ranked[0];
    // A frontier node must really end up on an islet of its own: near a coast the sea floor is already
    // shallow, so distance alone can't promise that. Simulate the terrain for the best few sites (with
    // the nodes settled so far) and take the first whose land touches no other landmark.
    if (n.maturity <= 2) {
      const islet = ranked.slice(0, SETTLE.isletTries).find((c) => isletAt(model, ledger, grid, pos, n.id, c));
      if (islet) best = islet;
      else report.warnings.push(`${n.id}: no site among the best ${SETTLE.isletTries} stays a separate islet; it joins nearby land`);
    }
    pos.set(n.id, { x: best.x, y: best.y, region: n.region });
    const neighbour = [...pos.entries()].filter(([id]) => id !== n.id)
      .map(([id, p]) => ({ id, d: Math.hypot(p.x - best.x, p.y - best.y) })).sort((a, b) => a.d - b.d)[0];
    report.settled.push({ id: n.id, x: best.x, y: best.y, region: n.region, offshore: best.water, near: neighbour.id });
  }

  // A settled landmark whose cell another region owns has likely changed region since it was placed.
  if (ledger.world.accepted) {
    for (const s of ledger.settlements) {
      const node = byId.get(s.id);
      if (!node) continue;
      const o = owner[Terrain.cellOf(grid, s.x, s.y)];
      if (o !== 255 && regions[o] !== node.region) report.warnings.push(`${s.id} now belongs to ${node.region} but sits in ${regions[o]} territory`);
    }
  }

  ledger.settlements.push(...report.settled.map(({ id, x, y }) => ({ id, x, y, settled: bb.meta.date })));
  ledger.retired.push(...retiring);
  if (!dryRun) writeLedger(ledger);
  return report;
}

// Would a landmark at site c sit on land that touches no other landmark? Simulates elevation with every
// current position plus the candidate, at the current sea level.
function isletAt(model, ledger, grid, pos, id, c) {
  const placed = new Map([...pos].map(([k, p]) => [k, { x: p.x, y: p.y }]));
  placed.set(id, { x: c.x, y: c.y });
  const inputs = Terrain.terrainInputs(model, placed, model.terrainStyles);
  const k = Terrain.cellOf(grid, c.x, c.y);
  // Apply the same coverage repair as buildTerrain: raise the candidate's uplift until it's on land.
  const boost = new Map();
  let land;
  for (let pass = 0; pass <= 3; pass++) {
    land = Terrain.threshold(Terrain.elevation(grid, { ...inputs, seed: ledger.world.seed }, boost), ledger.world.sea_level);
    if (land[k]) break;
    boost.set(id, (boost.get(id) ?? 0) + Terrain.TERRAIN.repairBoost);
  }
  if (!land[k]) return false;
  const { label } = Terrain.components(grid, land);
  for (const [other, p] of placed) if (other !== id && label[Terrain.cellOf(grid, p.x, p.y)] === label[k]) return false;
  return true;
}

function printSettleReport(report, dryRun) {
  const verb = dryRun ? "would settle" : "settled";
  for (const s of report.settled) console.log(`${verb} ${s.id} (${s.region}) at ${s.x}, ${s.y}: ${s.offshore ? "offshore" : "on the coast"}, near ${s.near}`);
  for (const id of report.retired) console.log(`${dryRun ? "would retire" : "retired"} ${id}: no longer in the backbone; its position and land are kept`);
  for (const w of report.warnings) console.warn(`warning: ${w}`);
  if (!report.settled.length && !report.retired.length) console.log("settle: nothing new");
}

// ---------------------------------------------------------------- routes (SPEC §4.9)
// A gently curved path from parent to child: a quadratic curve bowed to a side chosen by the edge's
// own hash (stable as the map grows). Routes across the ocean bow further, like sea lanes.
function routeOf(e, placed) {
  const a = placed.get(e.source), b = placed.get(e.target);
  const dx = b.x - a.x, dy = b.y - a.y, len = Math.hypot(dx, dy) || 1;
  const side = hashString(`${e.source}>${e.target}`) & 1 ? 1 : -1;
  const bow = (e.oceanic ? 0.22 : 0.14) * len * side;
  const cx = (a.x + b.x) / 2 - (dy / len) * bow, cy = (a.y + b.y) / 2 + (dx / len) * bow;
  return {
    from: e.source, to: e.target, cross: e.cross, oceanic: e.oceanic,
    path: `M${round1(a.x)},${round1(a.y)}Q${round1(cx)},${round1(cy)} ${round1(b.x)},${round1(b.y)}`,
  };
}

// ---------------------------------------------------------------- debug preview
const DEBUG_ROOTS = ["#8c6d46", "#7a5c3a", "#9a7b4f", "#6e5a43", "#a08060", "#857055", "#76624a", "#93785a", "#7d6a52"]; // sepia family
const DEBUG_PALETTE = [
  "#4f7a8c", "#8c4f6d", "#6d8c4f", "#b0773c", "#5b5fa0", "#3c9a8a", "#a05b5b", "#7f6aa8", "#4c8f4c", "#b05a8c", "#2f7fb0", "#857a2c", "#5d6468",
];
function regionColors(bb) {
  const roots = bb.regions.filter((r) => r.kind === "root"), applied = bb.regions.filter((r) => r.kind !== "root");
  const m = new Map();
  roots.forEach((r, i) => m.set(r.id, DEBUG_ROOTS[i % DEBUG_ROOTS.length]));
  applied.forEach((r, i) => m.set(r.id, DEBUG_PALETTE[i % DEBUG_PALETTE.length]));
  return m;
}

function writePreview(model, map, file) {
  const color = regionColors(model.bb);
  const [bx0, by0, bx1, by1] = map.bounds;
  const side = Math.max(bx1 - bx0, by1 - by0);
  const x0 = (bx0 + bx1 - side) / 2, y0 = (by0 + by1 - side) / 2, x1 = x0 + side, y1 = y0 + side;
  const pos = new Map(map.landmarks.map((l) => [l.id, l]));
  const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;");
  const parts = [
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${x0} ${y0} ${x1 - x0} ${y1 - y0}" width="${(x1 - x0) / 2}" height="${(y1 - y0) / 2}" font-family="Georgia, serif">`,
    `<rect x="${x0}" y="${y0}" width="${x1 - x0}" height="${y1 - y0}" fill="#d9e3e0"/>`,
    `<rect x="${bx0}" y="${by0}" width="${bx1 - bx0}" height="${by1 - by0}" fill="#efe6d2"/>`,
  ];
  for (const r of map.routes) {
    const a = pos.get(r.from), b = pos.get(r.to);
    parts.push(`<line x1="${a.x}" y1="${a.y}" x2="${b.x}" y2="${b.y}" stroke="${r.cross ? "#b9a888" : "#9c8a6a"}" stroke-width="${r.cross ? 1.5 : 2.5}" stroke-dasharray="${r.cross ? "6 6" : ""}"/>`);
  }
  for (const l of map.landmarks) {
    const c = color.get(l.region);
    const rad = 6 + l.maturity * 2;
    parts.push(l.maturity <= 2
      ? `<circle cx="${l.x}" cy="${l.y}" r="${rad}" fill="#efe6d2" stroke="${c}" stroke-width="3"/>`
      : `<circle cx="${l.x}" cy="${l.y}" r="${rad}" fill="${c}"/>`);
    parts.push(`<text x="${l.x + rad + 4}" y="${l.y + 6}" font-size="17" fill="#3b2f20">${esc(l.name)}</text>`);
  }
  for (const t of map.territories) {
    if (!t.label) continue;
    parts.push(`<text x="${t.label[0]}" y="${t.label[1]}" font-size="${t.group === "applied" ? 44 : 32}" text-anchor="middle" fill="${color.get(t.id)}" opacity="0.55" font-weight="bold">${esc(t.subtitle.toUpperCase())}</text>`);
  }
  parts.push("</svg>");
  fs.writeFileSync(file, parts.join("\n"));
  console.log(`wrote preview ${file}`);
}

// ---------------------------------------------------------------- main
function fail(msg) { console.error(`error: ${msg}`); process.exit(1); }

const args = process.argv.slice(2);
const cmd = args[0] && !args[0].startsWith("--") ? args[0] : "settle";
const previewIdx = args.indexOf("--preview");
const preview = previewIdx >= 0 ? args[previewIdx + 1] : null;

const model = loadBackbone();
const curation = readYaml(PATHS.curation, {});
model.terrainStyles = curation.terrain ?? {};

const argAfter = (flag) => { const i = args.indexOf(flag); return i >= 0 ? args[i + 1] : null; };

if (cmd === "survey") survey(model, curation, { redo: args.includes("--redo") });
else if (cmd === "sea") {
  const ledger = readYaml(PATHS.ledger, null);
  if (!ledger) fail("No ledger yet. Run `node build.mjs survey` first.");
  if (args.includes("--sweep")) {
    const levels = (argAfter("--levels") ?? "0.3,0.4,0.5,0.6,0.7,0.8").split(",").map(Number);
    seaSweep(model, ledger, levels);
    process.exit(0);
  }
  if (argAfter("--set") == null) fail("usage: sea --sweep [--levels a,b,c] | sea --set <level>");
  setSeaLevel(ledger, Number(argAfter("--set")));
} else if (cmd === "settle") {
  const ledger = readYaml(PATHS.ledger, null);
  if (!ledger) fail("No ledger yet. Run `node build.mjs survey` first.");
  ledger.retired ??= [];
  const dryRun = args.includes("--dry-run");
  printSettleReport(settle(model, ledger, { dryRun }), dryRun);
  if (dryRun) process.exit(0);
} else fail(`unknown command: ${cmd}`);

const map = render(model, curation);
if (preview) writePreview(model, map, preview);
