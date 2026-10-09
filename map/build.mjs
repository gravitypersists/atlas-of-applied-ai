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
import {
  forceSimulation, forceLink, forceManyBody, forceCollide, forceX, forceY,
} from "d3-force";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, "..");
const PATHS = {
  backbone: path.join(ROOT, "backbone.json"),
  curation: path.join(HERE, "curation.yaml"),
  ledger: path.join(HERE, "atlas", "ledger.yaml"),
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
  const ledger = {
    world: { seed: CONFIG.seed, bounds: CONFIG.bounds, cell: CONFIG.cell, sea_level: null, surveyed: date, accepted: false },
    settlements: model.bb.nodes.map((n) => {
      const p = fit(nodes.find((m) => m.id === n.id));
      return { id: n.id, x: p.x, y: p.y, settled: date };
    }),
    retired: [],
  };
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

function render(model, curation) {
  const ledger = readYaml(PATHS.ledger, null);
  if (!ledger) fail("No ledger yet. Run `node build.mjs survey` first.");
  const { bb, byId, regionById, edges, children } = model;
  const placed = new Map(ledger.settlements.map((s) => [s.id, s]));
  const unplaced = bb.nodes.filter((n) => !placed.has(n.id));
  if (unplaced.length) {
    console.warn(`warning: ${unplaced.length} backbone node(s) not in the ledger (settlement arrives in milestone 3): ${unplaced.map((n) => n.id).join(", ")}`);
  }

  const landmarks = bb.nodes.filter((n) => placed.has(n.id)).map((n) => {
    const s = placed.get(n.id);
    return {
      id: n.id, name: n.name, region: n.region, x: s.x, y: s.y,
      maturity: n.maturity, maturityLabel: MATURITY_LABEL[n.maturity], maturityNote: n.maturity_note ?? null,
      desc: n.desc ?? null, date: n.date ?? null, aliases: n.aliases ?? [], examples: n.examples ?? [],
      ref: n.ref ? { title: n.ref.title, href: hrefFor(n.ref) } : null,
      parents: (n.parents ?? []).filter((p) => byId.has(p.id)).map((p) => ({ id: p.id, rel: p.rel, why: p.why ?? null })),
      external: (n.parents ?? []).filter((p) => !byId.has(p.id)).map((p) => ({ name: p.id.replace(/^external:/, ""), why: p.why ?? null })),
      children: children.get(n.id),
    };
  });

  const territories = bb.regions.map((r) => {
    const members = landmarks.filter((l) => l.region === r.id);
    const label = members.length
      ? [round1(members.reduce((a, l) => a + l.x, 0) / members.length), round1(members.reduce((a, l) => a + l.y, 0) / members.length)]
      : null;
    const cur = curation.regions?.[r.id] ?? {};
    return {
      id: r.id, title: r.title ?? null, subtitle: r.name, group: r.kind === "root" ? "old-world" : "applied",
      label: cur.label ?? label,
    };
  });

  const out = {
    version: 1,
    built: ledger.world.surveyed,
    bounds: ledger.world.bounds,
    stage: "survey-debug",
    oldWorld: curation.old_world ?? { title: "The Old World", subtitle: "Ancestral Disciplines" },
    territories,
    landmarks,
    routes: edges.filter((e) => placed.has(e.source) && placed.has(e.target)).map((e) => ({ from: e.source, to: e.target, cross: e.cross })),
  };
  fs.writeFileSync(PATHS.mapJson, JSON.stringify(out, null, 1) + "\n");
  console.log(`wrote ${path.relative(ROOT, PATHS.mapJson)}: ${landmarks.length} landmarks, ${out.routes.length} routes`);
  return out;
}

// ---------------------------------------------------------------- debug preview
const DEBUG_PALETTE = [
  "#8c6d46", "#7a5c3a", "#9a7b4f", "#6e5a43", "#a08060", "#857055", "#76624a", "#93785a", // roots: sepia family
  "#4f7a8c", "#8c4f6d", "#6d8c4f", "#b0773c", "#5b5fa0", "#3c9a8a", "#a05b5b", "#7f6aa8", "#4c8f4c", "#b05a8c", "#2f7fb0",
];
function regionColors(bb) {
  const roots = bb.regions.filter((r) => r.kind === "root"), applied = bb.regions.filter((r) => r.kind !== "root");
  const m = new Map();
  roots.forEach((r, i) => m.set(r.id, DEBUG_PALETTE[i % 8]));
  applied.forEach((r, i) => m.set(r.id, DEBUG_PALETTE[8 + (i % 11)]));
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

if (cmd === "survey") survey(model, curation, { redo: args.includes("--redo") });
else if (cmd !== "settle") fail(`unknown command: ${cmd}`);

const map = render(model, curation);
if (preview) writePreview(model, map, preview);
