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
    title: { size: 16, em: 0.9, caps: 0.9, lineHeight: 1.1 },   // IM Fell English SC, spaced caps
    subtitle: { size: 11, em: 0.5, caps: 0.68 },                // EB Garamond italic
    province: { size: 10.5, em: 0.88, caps: 0.88 },             // spaced caps
  },
  titleWrap: 14,                    // titles longer than this many characters break onto two lines
  symbol: { capital: 7, city: 5, town: 3, outpost: 3.5, hamlet: 2.5, old: 3.5 },   // radius in px
  gap: 4,                           // px between a symbol and its label
  pad: 1.5,                         // px of clearance around every box
};

const TIER_ORDER = { capital: 0, city: 1, town: 2, old: 2, outpost: 3, hamlet: 3 };
// Tiers that appear only at local zoom (z2): the frontier, and deep-dive detail.
const LOCAL_ONLY = new Set(["outpost", "hamlet"]);
const SIDES = ["right", "left", "above", "below"];

// ---------------------------------------------------------------- tiers (§4.7)
// score = maturity + log2(1 + childCount). Root nodes are `old`; each applied region has exactly one
// capital (highest score, then most children, then oldest, then id); then outposts, hamlets (deep-dive
// `layer: detail` nodes, which never compete with the backbone on the overview), cities, towns.
export function assignTiers(landmarks, overrides = {}) {
  const score = (l) => l.maturity + Math.log2(1 + l.children.length);
  const capitals = new Map();
  for (const l of landmarks) {
    if (l.group === "old-world" || l.layer === "detail") continue;
    const c = capitals.get(l.region);
    const better = !c || score(l) > score(c) ||
      (score(l) === score(c) && (l.children.length > c.children.length ||
        (l.children.length === c.children.length && (String(l.date) < String(c.date) || (String(l.date) === String(c.date) && l.id < c.id)))));
    if (better) capitals.set(l.region, l);
  }
  for (const l of landmarks) {
    l.score = Math.round(score(l) * 100) / 100;
    l.tier = overrides[l.id]?.tier ??
      (l.group === "old-world" ? "old"
        : capitals.get(l.region) === l ? "capital"
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
  const st = LABELS.text.title, sub = LABELS.text.subtitle;
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
export function placeLabels({ landmarks, territories, oldWorld, terrain, overrides = {} }) {
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
  const z1Symbols = landmarks.filter((l) => !LOCAL_ONLY.has(l.tier));
  const titled = [
    ...applied.map((t) => ({ t, titleLines: titleLines(t.title ?? t.subtitle), subtitleText: t.title ? t.subtitle : null, size: landmarks.filter((l) => l.region === t.id).length })),
    { t: oldWorld, id: "old-world", titleLines: titleLines(oldWorld.title), subtitleText: oldWorld.subtitle, size: Infinity },
  ].sort((a, b) => b.size - a.size);
  const placedTitles = [];
  for (const item of titled) {
    const id = item.id ?? item.t.id;
    const cands = candidates.get(id);
    if (!cands.length) continue;
    const curated = item.t.labelCurated;
    // Hard: no overlap with placed titles or capitals at z0. Soft: cover as few z1 symbols as possible,
    // breaking ties toward the more interior candidate (candidates come most interior first).
    let chosen = null, chosenBox = null, fewest = Infinity;
    for (const c of curated ? [curated] : cands) {
      const box = titleBox({ ...item, label: c }, s0);
      if (!curated && (placedTitles.some((b) => overlaps(b, box)) || capitals.some((l) => overlaps(symbolBox(l, s0), box)))) continue;
      const box1 = titleBox({ ...item, label: c }, s1);
      const covered = z1Symbols.filter((l) => overlaps(symbolBox(l, s1), box1)).length;
      if (covered < fewest) { chosen = c; chosenBox = box; fewest = covered; }
      if (covered === 0 || curated) break;
    }
    if (!chosen) {
      chosen = cands[0]; chosenBox = titleBox({ ...item, label: chosen }, s0);
      report.titleOverlaps.push(id);
    }
    if (fewest > 0 && fewest < Infinity) report.titleCovers.push(`${id} (${fewest})`);
    item.t.label = chosen;
    item.t.titleLines = item.titleLines;
    placedTitles.push(chosenBox);
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

  // Old World province names show only at z2: each takes its most interior point that clears every
  // landmark label and symbol at that scale, and the province names already placed.
  const s2 = scales[2], st = LABELS.text.province;
  const z2Boxes = [...landmarks.map((l) => labelBox(l, l.labelSide, s2)), ...landmarks.map((l) => symbolBox(l, s2))];
  const provinceBox = (t, c) => {
    const w = textWidth(t.subtitle, st) / 2 + LABELS.pad, h = st.size / 2 + LABELS.pad;
    return { x0: c[0] - w / s2, x1: c[0] + w / s2, y0: c[1] - (h + st.size * 0.3) / s2, y1: c[1] + (h - st.size * 0.3) / s2 };
  };
  for (const t of provinces) {
    const cands = candidates.get(t.id);
    if (t.labelCurated) { t.label = t.labelCurated; z2Boxes.push(provinceBox(t, t.label)); continue; }
    const c = cands.find((c) => !z2Boxes.some((b) => overlaps(b, provinceBox(t, c)))) ?? cands[0] ?? null;
    if (c && c === cands[0] && z2Boxes.some((b) => overlaps(b, provinceBox(t, c)))) report.unplaced.push(`province ${t.id}`);
    t.label = c;
    if (c) z2Boxes.push(provinceBox(t, c));
  }
  return report;
}
