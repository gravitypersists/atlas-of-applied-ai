// Cartography for the atlas map: symbol tiers, territory title anchors, and collision-free label
// placement per zoom level (SPEC §4.7–4.8). Labels are cartography, not geography: unlike positions
// and land, they may change between builds.
//
// The viewer draws symbols and text at a constant screen size, so collisions depend on zoom. Placement
// works in screen pixels for a reference viewport at each zoom level's lowest scale (its most crowded
// moment), using estimated text widths.

import * as Terrain from "./terrain.mjs";

export const LABELS = {
  viewport: [1440, 860],            // reference screen for placement
  margin: { x: 150, y: 60 },        // fit-to-world margin; the viewer uses the same
  levels: [2, 5],                   // relative zoom where z1 and z2 begin; the viewer uses the same
  // Text: px size, and glyph width in em for lowercase (`em`) and capitals/digits (`caps`), letter-spacing
  // included. Measured in the browser against the real fonts and rounded up (see SPEC §4.8).
  text: {
    capital: { size: 13, em: 0.5, caps: 0.72 },
    city: { size: 12, em: 0.5, caps: 0.72 },
    town: { size: 11.5, em: 0.46, caps: 0.68 },
    outpost: { size: 11, em: 0.47, caps: 0.68 },
    hamlet: { size: 11, em: 0.46, caps: 0.68 },
    old: { size: 11.5, em: 0.46, caps: 0.68 },
    title: { size: 16, em: 0.9, caps: 0.9, lineHeight: 1.1 },   // IM Fell English SC, spaced caps; size varies, see titleSizes
    subtitle: { size: 11, em: 0.5, caps: 0.68 },                // EB Garamond italic
    province: { size: 12, em: 0.88, caps: 0.88 },               // spaced caps
  },
  titleWrap: 14,                    // titles longer than this many characters break onto two lines (or stay on one, if that fits better)
  titleSizes: [24, 22, 20, 18, 16], // px, largest first: a title grows when its territory has room
  titleInside: 0.9,                 // share of a title's box on its own territory needed to go above 16px
  provinceInside: 0.8,              // share of a province name's box (at z1) that must lie on its province
  titleCoverCost: 0.06,             // a z1 symbol under a title costs this much of that share
  symbol: { capital: 7, city: 5, town: 3, outpost: 3.5, hamlet: 2.5, old: 3.5 },   // radius in px
  gap: 4,                           // px between a symbol and its label
  pad: 1.5,                         // px of clearance around every box
  doodle: [-4, -32, 40, 6],         // px box of a doodle's drawing around its pin plus offset (doodles.js)
};

const TIER_ORDER = { capital: 0, city: 1, town: 2, old: 2, outpost: 3, hamlet: 3 };
// Tiers that appear only at local zoom (z2): the frontier, and deep-dive detail.
const LOCAL_ONLY = new Set(["outpost", "hamlet"]);
const SIDES = ["right", "left", "above", "below"];

// ---------------------------------------------------------------- tiers (§4.7)
// score = maturity + log2(1 + childCount). Every region, applied or Old World province, has exactly one
// capital (highest score, then most children, then oldest, then id). The other root nodes are `old`.
// The rest of an applied region: outposts, hamlets (deep-dive `layer: detail` nodes, which never compete
// with the backbone on the overview), cities, towns.
export function assignTiers(landmarks, overrides = {}) {
  const score = (l) => l.maturity + Math.log2(1 + l.children.length);
  const capitals = new Map();
  for (const l of landmarks) {
    if (l.layer === "detail") continue;
    const c = capitals.get(l.region);
    const better = !c || score(l) > score(c) ||
      (score(l) === score(c) && (l.children.length > c.children.length ||
        (l.children.length === c.children.length && (String(l.date) < String(c.date) || (String(l.date) === String(c.date) && l.id < c.id)))));
    if (better) capitals.set(l.region, l);
  }
  for (const l of landmarks) {
    l.score = Math.round(score(l) * 100) / 100;
    l.tier = overrides[l.id]?.tier ??
      (capitals.get(l.region) === l ? "capital"
        : l.group === "old-world" ? "old"
        : l.maturity <= 2 ? "outpost"
        : l.layer === "detail" ? "hamlet"
        : l.maturity >= 4 && l.children.length >= 2 ? "city"
        : "town");
  }
}

// ---------------------------------------------------------------- geometry helpers
const textWidth = (text, style) => {
  let ems = 0;
  for (const ch of text) ems += /[A-Z0-9]/.test(ch) ? style.caps : ch === " " ? 0.28 : style.em;
  return ems * style.size;
};

export function titleLines(title) {
  const t = title.toUpperCase();
  if (t.length <= LABELS.titleWrap) return [t];
  // Break at the space nearest the middle.
  const mid = t.length / 2;
  let best = -1;
  for (let i = 0; i < t.length; i++) if (t[i] === " " && (best < 0 || Math.abs(i - mid) < Math.abs(best - mid))) best = i;
  return best < 0 ? [t] : [t.slice(0, best), t.slice(best + 1)];
}

// Screen px per world unit at each zoom level's lowest scale, for the reference viewport.
export function levelScales(landmarks) {
  const xs = landmarks.map((l) => l.x), ys = landmarks.map((l) => l.y);
  const w = Math.max(...xs) - Math.min(...xs), h = Math.max(...ys) - Math.min(...ys);
  const [vw, vh] = LABELS.viewport;
  const fit = Math.min((vw - 2 * LABELS.margin.x) / w, (vh - 2 * LABELS.margin.y) / h);
  return [fit, fit * LABELS.levels[0], fit * LABELS.levels[1]];
}

const overlaps = (a, b) => a.x0 < b.x1 && b.x0 < a.x1 && a.y0 < b.y1 && b.y0 < a.y1;

// Box (world units) of a landmark label on a given side, at scale s (px per unit).
function labelBox(l, side, s) {
  const st = LABELS.text[l.tier], r = LABELS.symbol[l.tier], g = LABELS.gap, p = LABELS.pad;
  const w = textWidth(l.name, st), h = st.size;
  let x0, y0;
  if (side === "right") { x0 = r + g; y0 = -h / 2; }
  else if (side === "left") { x0 = -(r + g + w); y0 = -h / 2; }
  else if (side === "above") { x0 = -w / 2; y0 = -(r + g + h); }
  else { x0 = -w / 2; y0 = r + g; }
  return { x0: l.x + (x0 - p) / s, y0: l.y + (y0 - p) / s, x1: l.x + (x0 + w + p) / s, y1: l.y + (y0 + h + p) / s };
}

function symbolBox(l, s) {
  const r = LABELS.symbol[l.tier] + LABELS.pad;
  return { x0: l.x - r / s, y0: l.y - r / s, x1: l.x + r / s, y1: l.y + r / s };
}

function titleBox(t, s) {
  const st = { ...LABELS.text.title, size: t.titleSize ?? LABELS.text.title.size }, sub = LABELS.text.subtitle;
  const lines = t.titleLines;
  const w = Math.max(...lines.map((line) => textWidth(line, st)), t.subtitleText ? textWidth(t.subtitleText, sub) : 0);
  const h = lines.length * st.size * st.lineHeight + (t.subtitleText ? sub.size * 1.4 : 0);
  // Anchored at the centre of the first line's baseline region; the block extends down.
  const top = -st.size * 0.8;
  return { x0: t.label[0] - (w / 2 + LABELS.pad) / s, y0: t.label[1] + (top - LABELS.pad) / s, x1: t.label[0] + (w / 2 + LABELS.pad) / s, y1: t.label[1] + (top + h + LABELS.pad) / s };
}

// ---------------------------------------------------------------- title anchors
// Candidate anchor points inside a mask, most interior first (distance to the mask's edge).
function interiorCandidates(grid, mask, limit = 1500) {
  const owner = new Uint8Array(mask.length); // coastField needs an owner array; unused here
  const { dist } = Terrain.coastField(grid, mask, owner);
  let max = 0;
  for (let k = 0; k < mask.length; k++) if (mask[k] && dist[k] > max) max = dist[k];
  const out = [];
  for (let k = 0; k < mask.length; k += 3) if (mask[k] && dist[k] >= max * 0.15) out.push(k);
  out.sort((a, b) => dist[b] - dist[a] || a - b);
  return out.slice(0, limit).map((k) => [
    Math.round((grid.x0 + ((k % grid.width) + 0.5) * grid.cell) * 10) / 10,
    Math.round((grid.y0 + (((k / grid.width) | 0) + 0.5) * grid.cell) * 10) / 10,
  ]);
}

// ---------------------------------------------------------------- placement (§4.8)
// Places territory titles (z0–z1), Old World province names (z2), and landmark labels with a minZoom
// each. Mutates territories, oldWorld and landmarks; returns a report.
export function placeLabels({ landmarks, territories, oldWorld, terrain, overrides = {}, doodles = [] }) {
  const scales = levelScales(landmarks);
  const report = { titleOverlaps: [], titleCovers: [], unplaced: [] };
  const applied = territories.filter((t) => t.group === "applied");
  const provinces = territories.filter((t) => t.group === "old-world");

  // Title anchors from the terrain (most interior points), else landmark centroids.
  const candidates = new Map();
  const centroid = (ls) => [ls.reduce((a, l) => a + l.x, 0) / ls.length, ls.reduce((a, l) => a + l.y, 0) / ls.length].map((v) => Math.round(v * 10) / 10);
  for (const t of territories) {
    const ls = landmarks.filter((l) => l.region === t.id);
    let c = [];
    if (terrain) {
      const idx = terrain.regions.indexOf(t.id);
      c = interiorCandidates(terrain.grid, Uint8Array.from(terrain.owner, (o) => (o === idx ? 1 : 0)));
    }
    candidates.set(t.id, c.length ? c : ls.length ? [centroid(ls)] : []);
  }
  const rootIdx = new Set(provinces.map((t) => terrain?.regions.indexOf(t.id)));
  const oldLs = landmarks.filter((l) => l.group === "old-world");
  const oldCands = terrain ? interiorCandidates(terrain.grid, Uint8Array.from(terrain.owner, (o) => (rootIdx.has(o) ? 1 : 0))) : [];
  candidates.set("old-world", oldCands.length ? oldCands : [centroid(oldLs)]);

  // Titles: one fixed position each. Larger territories first; each takes its most interior candidate
  // that clears the titles already placed and the capitals at z0, and every symbol visible at z1.
  const s0 = scales[0], s1 = scales[1];
  const capitals = landmarks.filter((l) => l.tier === "capital");
  // Doodles shown at z0 (pinned to a capital or to the sea), as boxes. A doodle's drawing spans about
  // LABELS.doodle px from its pin plus offset; titles keep clear of it.
  const byId = new Map(landmarks.map((l) => [l.id, l]));
  const doodleBoxes = doodles.filter((d) => d.minZoom === 0).flatMap((d) => {
    const pin = typeof d.at === "string" ? byId.get(d.at) : { x: d.at[0], y: d.at[1], tier: null };
    if (!pin || (pin.tier && pin.tier !== "capital")) return [];
    const [x0, y0, x1, y1] = LABELS.doodle;
    return [{ x0: pin.x + (d.dx + x0) / s0, y0: pin.y + (d.dy + y0) / s0, x1: pin.x + (d.dx + x1) / s0, y1: pin.y + (d.dy + y1) / s0 }];
  });
  const z1Symbols = landmarks.filter((l) => !LOCAL_ONLY.has(l.tier));
  const titled = [
    ...applied.map((t) => ({ t, titleLines: titleLines(t.title ?? t.subtitle), subtitleText: t.title ? t.subtitle : null, size: landmarks.filter((l) => l.region === t.id).length })),
    { t: oldWorld, id: "old-world", titleLines: titleLines(oldWorld.title), subtitleText: oldWorld.subtitle, size: Infinity },
  ].sort((a, b) => b.size - a.size);
  const placedTitles = [];
  // Share of a box (world units) that lies on the cells of `owners`, from a grid of sample points.
  const insideShare = (box, owners) => {
    if (!terrain || !owners) return 1;
    const { grid } = terrain;
    let hit = 0, n = 0;
    for (let i = 0; i <= 15; i++) for (let j = 0; j <= 5; j++) {
      const x = box.x0 + ((box.x1 - box.x0) * i) / 15, y = box.y0 + ((box.y1 - box.y0) * j) / 5;
      const gi = Math.floor((x - grid.x0) / grid.cell), gj = Math.floor((y - grid.y0) / grid.cell);
      n++;
      if (gi >= 0 && gj >= 0 && gi < grid.width && gj < grid.height && owners.has(terrain.owner[gj * grid.width + gi])) hit++;
    }
    return hit / n;
  };
  for (const item of titled) {
    const id = item.id ?? item.t.id;
    const cands = candidates.get(id);
    if (!cands.length) continue;
    const curated = item.t.labelCurated;
    const owners = terrain ? (id === "old-world" ? rootIdx : new Set([terrain.regions.indexOf(id)])) : null;
    // Hard: no overlap with placed titles, capitals or doodles at z0. Soft: as much of the box as possible on
    // the territory itself, then as few z1 symbols covered as possible (each costs `titleCoverCost` of
    // share), then the most interior candidate. Sizes go largest first, each in its wrapped and one-line
    // form; a size above the smallest is taken only when its best candidate is at least `titleInside`
    // on the territory and covers at most one z1 symbol.
    const forms = item.titleLines.length > 1 ? [item.titleLines, [item.titleLines.join(" ")]] : [item.titleLines];
    let pick = null;
    for (const titleSize of LABELS.titleSizes) {
      let best = null;
      for (const titleLines of forms) {
        const it = { ...item, titleSize, titleLines };
        for (const c of curated ? [curated] : cands) {
          const box = titleBox({ ...it, label: c }, s0);
          if (!curated && (placedTitles.some((b) => overlaps(b, box)) || capitals.some((l) => overlaps(symbolBox(l, s0), box)) ||
            doodleBoxes.some((b) => overlaps(b, box)))) continue;
          const inside = insideShare(box, owners);
          const covered = z1Symbols.filter((l) => overlaps(symbolBox(l, s1), titleBox({ ...it, label: c }, s1))).length;
          const score = inside - LABELS.titleCoverCost * covered;
          if (!best || score > best.score + 1e-9) best = { c, box, covered, inside, score, opt: { titleSize, titleLines } };
        }
      }
      const smallest = titleSize === LABELS.titleSizes.at(-1);
      if (best && (smallest || (best.inside >= LABELS.titleInside && best.covered <= 1))) { pick = best; break; }
    }
    if (!pick) {
      const opt = { titleSize: LABELS.titleSizes.at(-1), titleLines: item.titleLines };
      pick = { c: cands[0], box: titleBox({ ...item, ...opt, label: cands[0] }, s0), covered: 0, opt };
      report.titleOverlaps.push(id);
    }
    if (pick.covered > 0) report.titleCovers.push(`${id} (${pick.covered})`);
    Object.assign(item, pick.opt);
    item.t.label = pick.c;
    item.t.titleLines = item.titleLines;
    item.t.titleSize = item.titleSize;
    placedTitles.push(pick.box);
  }

  // Landmark labels. Priority: tier, then settlement order (older first), then score.
  const order = [...landmarks].sort((a, b) => TIER_ORDER[a.tier] - TIER_ORDER[b.tier] || a.settledIndex - b.settledIndex || b.score - a.score);
  const eligible = [
    (l) => l.tier === "capital",
    (l) => !LOCAL_ONLY.has(l.tier),
    () => true,
  ];
  const symbolVisible = eligible; // symbols follow the same schedule as label eligibility (§5.2)
  for (const l of landmarks) { l.minZoom = null; l.labelSide = overrides[l.id]?.label ?? "right"; }
  for (let z = 0; z < 3; z++) {
    const s = scales[z];
    const placed = landmarks.filter((l) => l.minZoom !== null).map((l) => labelBox(l, l.labelSide, s));
    const symbols = landmarks.filter(symbolVisible[z]).map((l) => ({ l, box: symbolBox(l, s) }));
    const titles = z < 2 ? titled.map((item) => titleBox({ ...item, label: item.t.label }, s)) : [];
    for (const l of order) {
      if (l.minZoom !== null || !eligible[z](l)) continue;
      const curated = overrides[l.id]?.label;
      const sides = curated ? [curated, ...SIDES.filter((x) => x !== curated)] : SIDES;
      for (const side of sides) {
        const box = labelBox(l, side, s);
        const clash = placed.some((b) => overlaps(b, box)) || titles.some((b) => overlaps(b, box)) ||
          symbols.some(({ l: o, box: b }) => o !== l && overlaps(b, box));
        if (!clash) { l.minZoom = z; l.labelSide = side; placed.push(box); break; }
      }
    }
  }
  for (const l of landmarks) if (l.minZoom === null) { l.minZoom = 2; report.unplaced.push(l.id); }

  // Old World province names show from z1 where they fit, else from z2 (`labelZoom`). Each takes its
  // most interior point that keeps most of the name on its province and clears every label and symbol
  // visible from that level (at z1 also the Old World title), and the province names already placed.
  const s2 = scales[2], st = LABELS.text.province;
  const owTitle = titled.find((item) => item.id === "old-world");
  const obstacles = [
    [s1, [...landmarks.filter((l) => l.minZoom <= 1).map((l) => labelBox(l, l.labelSide, s1)), ...z1Symbols.map((l) => symbolBox(l, s1)),
      ...(owTitle?.t.label ? [titleBox({ ...owTitle, label: owTitle.t.label }, s1)] : [])]],
    [s2, [...landmarks.map((l) => labelBox(l, l.labelSide, s2)), ...landmarks.map((l) => symbolBox(l, s2))]],
  ];
  const provinceBox = (t, c, s) => {
    const w = textWidth(t.subtitle, st) / 2 + LABELS.pad, h = st.size / 2 + LABELS.pad;
    return { x0: c[0] - w / s, x1: c[0] + w / s, y0: c[1] - (h + st.size * 0.3) / s, y1: c[1] + (h - st.size * 0.3) / s };
  };
  const clearFrom = (t, c, z) => obstacles.slice(z - 1).every(([s, boxes]) => !boxes.some((b) => overlaps(b, provinceBox(t, c, s))));
  for (const t of provinces) {
    const cands = candidates.get(t.id);
    const owners = terrain ? new Set([terrain.regions.indexOf(t.id)]) : null;
    let c = t.labelCurated, z = 1;
    if (!c) {
      // Most of the name on the province if possible; a narrower province accepts more overhang.
      for (const share of [LABELS.provinceInside, LABELS.provinceInside - 0.2]) {
        c ??= cands.filter((c) => insideShare(provinceBox(t, c, s1), owners) >= share).find((c) => clearFrom(t, c, 1));
      }
      if (!c) { z = 2; c = cands.find((c) => clearFrom(t, c, 2)); }
      if (!c) { c = cands[0] ?? null; if (c) report.unplaced.push(`province ${t.id}`); }
    } else if (!clearFrom(t, c, 1)) z = 2;
    t.label = c;
    t.labelZoom = z;
    if (c) for (const [s, boxes] of obstacles) boxes.push(provinceBox(t, c, s));
  }
  return report;
}
