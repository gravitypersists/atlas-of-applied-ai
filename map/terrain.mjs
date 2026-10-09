// Terrain for the atlas map: the hidden elevation field, land and claims, and coastline geometry.
// See ../SPEC.md §4.1–4.2 and §4.5–4.6. Nothing here is drawn as elevation; only the cut at sea level is.

import { contours } from "d3-contour";
import { blur2 } from "d3-array";
import { geoPath } from "d3-geo";

export const TERRAIN = {
  uplift: {
    sigmaBase: 26,          // world units; nearest landmarks sit ~90 apart
    sigmaPerMaturity: 8,
    heightBase: 0.55,
    heightPerMaturity: 0.09,
    rankBonus: 0.25,        // + this × global maturity rank (counters the 4–5 skew)
    rootBonus: 1.15,        // Old World landmarks stand a little higher and broader
  },
  ridge: {
    inRegion: 0.42,         // keeps a territory contiguous
    crossMin: 0.12,         // weakest cross-region pair (same world)
    crossMax: 0.5,          // strongest cross-region pair
    width: 26,              // world units
  },
  warp: { amplitude: 120, scale: 380, octaves: 4 }, // multi-octave domain warp: peninsulas and coves
  bedrock: { amplitude: 0.32, scale: 240, octaves: 5 },
  detail: { amplitude: 0.16, scale: 38, octaves: 3 }, // fine coastal raggedness, rocks and skerries
  basin: { margin: 0.1, depth: 1.2 },           // fraction of bounds that falls off to sea
  shallowsBelow: 0.1,                           // shallows contour sits this far below sea level
  minLandmassCells: 60,                          // smaller components don't count as landmasses
  blur: 0.6,                                     // cells; softens the cell staircase in contours
  repairBoost: 0.35,                             // uplift added per guarantee pass
};

// ---------------------------------------------------------------- noise
function hash2(ix, iy, seed) {
  let h = Math.imul(ix, 374761393) ^ Math.imul(iy, 668265263) ^ Math.imul(seed, 2147483647);
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
}
const smooth = (t) => t * t * (3 - 2 * t);
function valueNoise(x, y, seed) {
  const ix = Math.floor(x), iy = Math.floor(y), fx = smooth(x - ix), fy = smooth(y - iy);
  const a = hash2(ix, iy, seed), b = hash2(ix + 1, iy, seed), c = hash2(ix, iy + 1, seed), d = hash2(ix + 1, iy + 1, seed);
  return (a + (b - a) * fx + (c - a) * fy + (a - b - c + d) * fx * fy) * 2 - 1; // [-1, 1]
}
function fbm(x, y, seed, octaves) {
  let v = 0, amp = 0.5, f = 1;
  for (let o = 0; o < octaves; o++) { v += amp * valueNoise(x * f, y * f, seed + o * 101); amp *= 0.5; f *= 2; }
  return v;
}

// ---------------------------------------------------------------- grid
export function makeGrid(world) {
  const [x0, y0, x1, y1] = world.bounds;
  const cell = world.cell;
  const width = Math.round((x1 - x0) / cell), height = Math.round((y1 - y0) / cell);
  // Cell centre in world units.
  const wx = (i) => x0 + (i + 0.5) * cell, wy = (j) => y0 + (j + 0.5) * cell;
  return { width, height, cell, x0, y0, wx, wy };
}

// ---------------------------------------------------------------- elevation
// E(p) = 1 − exp(−(Σ uplift + Σ ridge)) + bedrock − basin. Recomputed every build; never stored.
// The saturating sum keeps dense interiors near 1, so the coast sits where influence fades and the
// bedrock noise is large enough to shape it. It is still monotonic: more uplift never lowers E.
export function elevation(grid, { landmarks, ridges, seed }, boost = new Map()) {
  const T = TERRAIN;
  const { width, height, cell, wx, wy } = grid;
  const E = new Float32Array(width * height);

  // Domain warp, sampled once per cell.
  const qx = new Float32Array(width * height), qy = new Float32Array(width * height);
  for (let j = 0; j < height; j++) for (let i = 0; i < width; i++) {
    const k = j * width + i, x = wx(i), y = wy(j);
    qx[k] = x + T.warp.amplitude * fbm(x / T.warp.scale, y / T.warp.scale, seed + 11, T.warp.octaves);
    qy[k] = y + T.warp.amplitude * fbm(x / T.warp.scale, y / T.warp.scale, seed + 23, T.warp.octaves);
  }
  const reach = (r) => Math.ceil((r + T.warp.amplitude) / cell);
  const span = (x, y, r) => ({
    i0: Math.max(0, Math.floor((x - grid.x0) / cell) - reach(r)), i1: Math.min(width - 1, Math.floor((x - grid.x0) / cell) + reach(r)),
    j0: Math.max(0, Math.floor((y - grid.y0) / cell) - reach(r)), j1: Math.min(height - 1, Math.floor((y - grid.y0) / cell) + reach(r)),
  });

  for (const l of landmarks) {
    const s = l.sigma, h = l.height + (boost.get(l.id) ?? 0), r = 3 * s;
    const { i0, i1, j0, j1 } = span(l.x, l.y, r);
    for (let j = j0; j <= j1; j++) for (let i = i0; i <= i1; i++) {
      const k = j * width + i, dx = qx[k] - l.x, dy = qy[k] - l.y, d2 = dx * dx + dy * dy;
      if (d2 < r * r) E[k] += h * Math.exp(-d2 / (2 * s * s));
    }
  }

  const w = T.ridge.width;
  for (const rd of ridges) {
    const { ax, ay, bx, by, height: h } = rd;
    const { i0, i1, j0, j1 } = {
      i0: Math.min(span(ax, ay, 3 * w).i0, span(bx, by, 3 * w).i0), i1: Math.max(span(ax, ay, 3 * w).i1, span(bx, by, 3 * w).i1),
      j0: Math.min(span(ax, ay, 3 * w).j0, span(bx, by, 3 * w).j0), j1: Math.max(span(ax, ay, 3 * w).j1, span(bx, by, 3 * w).j1),
    };
    const vx = bx - ax, vy = by - ay, len2 = vx * vx + vy * vy || 1;
    for (let j = j0; j <= j1; j++) for (let i = i0; i <= i1; i++) {
      const k = j * width + i;
      const t = Math.max(0, Math.min(1, ((qx[k] - ax) * vx + (qy[k] - ay) * vy) / len2));
      const dx = qx[k] - (ax + t * vx), dy = qy[k] - (ay + t * vy), d2 = dx * dx + dy * dy;
      if (d2 < 9 * w * w) E[k] += h * Math.exp(-d2 / (2 * w * w));
    }
  }

  for (let k = 0; k < E.length; k++) E[k] = 1 - Math.exp(-E[k]);

  const [bx0, by0] = [grid.x0, grid.y0], W = width * cell, H = height * cell;
  const mx = W * T.basin.margin, my = H * T.basin.margin;
  for (let j = 0; j < height; j++) for (let i = 0; i < width; i++) {
    const k = j * width + i, x = wx(i), y = wy(j);
    E[k] += T.bedrock.amplitude * fbm(x / T.bedrock.scale, y / T.bedrock.scale, seed + 37, T.bedrock.octaves);
    E[k] += T.detail.amplitude * fbm(x / T.detail.scale, y / T.detail.scale, seed + 53, T.detail.octaves);
    // Basin: smooth falloff inside the outer margin.
    const ex = Math.min(x - bx0, bx0 + W - x) / mx, ey = Math.min(y - by0, by0 + H - y) / my;
    const e = Math.max(0, 1 - Math.min(ex, ey, 1));
    E[k] -= T.basin.depth * e * e;
  }
  return E;
}

// Per-landmark uplift parameters and per-edge ridges, from the model and settled positions.
export function terrainInputs(model, placed) {
  const T = TERRAIN;
  const { bb, byId, regionById, edges } = model;
  const isRoot = (r) => regionById.get(r).kind === "root";
  const nodes = bb.nodes.filter((n) => placed.has(n.id));
  const sorted = [...nodes].sort((a, b) => a.maturity - b.maturity);
  const rank = new Map(nodes.map((n) => [n.id, sorted.findIndex((m) => m.maturity === n.maturity) / Math.max(1, sorted.length - 1)]));
  const landmarks = nodes.map((n) => {
    const p = placed.get(n.id), root = isRoot(n.region) ? T.uplift.rootBonus : 1;
    return {
      id: n.id, x: p.x, y: p.y, region: n.region, maturity: n.maturity,
      sigma: (T.uplift.sigmaBase + T.uplift.sigmaPerMaturity * n.maturity) * root,
      height: (T.uplift.heightBase + T.uplift.heightPerMaturity * n.maturity + T.uplift.rankBonus * rank.get(n.id)) * root,
    };
  });

  // Cross-region pair strength (same world only; oceanic edges raise no ridge).
  const pairKey = (a, b) => (a < b ? `${a}|${b}` : `${b}|${a}`);
  const pairCount = new Map();
  for (const e of edges) if (e.cross && !e.oceanic) {
    const k = pairKey(byId.get(e.source).region, byId.get(e.target).region);
    pairCount.set(k, (pairCount.get(k) ?? 0) + 1);
  }
  const pmax = Math.max(1, ...pairCount.values());
  const ridges = [];
  for (const e of edges) {
    if (e.oceanic || !placed.has(e.source) || !placed.has(e.target)) continue;
    const a = byId.get(e.source), b = byId.get(e.target);
    if (a.maturity < 3 || b.maturity < 3) continue; // frontier stays an islet until it matures
    const pa = placed.get(e.source), pb = placed.get(e.target);
    const h = e.cross
      ? T.ridge.crossMin + (T.ridge.crossMax - T.ridge.crossMin) * (pairCount.get(pairKey(a.region, b.region)) / pmax)
      : T.ridge.inRegion;
    ridges.push({ ax: pa.x, ay: pa.y, bx: pb.x, by: pb.y, height: h });
  }
  return { landmarks, ridges };
}

// ---------------------------------------------------------------- land, components, claims
export function cellOf(grid, x, y) {
  const i = Math.min(grid.width - 1, Math.max(0, Math.floor((x - grid.x0) / grid.cell)));
  const j = Math.min(grid.height - 1, Math.max(0, Math.floor((y - grid.y0) / grid.cell)));
  return j * grid.width + i;
}

export function threshold(E, level) {
  const land = new Uint8Array(E.length);
  for (let k = 0; k < E.length; k++) land[k] = E[k] > level ? 1 : 0;
  return land;
}

// 4-connected components of land. Returns { label: Int32Array (−1 = sea), sizes: [] }.
export function components(grid, land) {
  const { width, height } = grid;
  const label = new Int32Array(land.length).fill(-1);
  const sizes = [];
  const stack = [];
  for (let s = 0; s < land.length; s++) {
    if (!land[s] || label[s] >= 0) continue;
    const id = sizes.length;
    let n = 0;
    label[s] = id; stack.push(s);
    while (stack.length) {
      const k = stack.pop(); n++;
      const i = k % width, j = (k / width) | 0;
      for (const q of [i > 0 ? k - 1 : -1, i < width - 1 ? k + 1 : -1, j > 0 ? k - width : -1, j < height - 1 ? k + width : -1]) {
        if (q >= 0 && land[q] && label[q] < 0) { label[q] = id; stack.push(q); }
      }
    }
    sizes.push(n);
  }
  return { label, sizes };
}

// Claims: each unowned land cell goes to the region of its nearest landmark by distance through land
// (multi-source BFS), so claims never jump water. Existing owners are kept. 255 = unclaimed.
export function claim(grid, land, owner, sources) {
  const { width, height } = grid;
  const out = owner ? Uint8Array.from(owner) : new Uint8Array(land.length).fill(255);
  const seen = new Uint8Array(land.length);
  let queue = [];
  for (const { cell, region } of sources) {
    if (!land[cell] || seen[cell]) continue;
    seen[cell] = 1;
    if (out[cell] === 255) out[cell] = region;
    queue.push(cell);
  }
  // BFS carries the source region outward; already-owned cells pass on their own owner.
  while (queue.length) {
    const next = [];
    for (const k of queue) {
      const i = k % width, j = (k / width) | 0;
      for (const q of [i > 0 ? k - 1 : -1, i < width - 1 ? k + 1 : -1, j > 0 ? k - width : -1, j < height - 1 ? k + width : -1]) {
        if (q < 0 || !land[q] || seen[q]) continue;
        seen[q] = 1;
        if (out[q] === 255) out[q] = out[k];
        next.push(q);
      }
    }
    queue = next;
  }
  for (let k = 0; k < land.length; k++) if (!land[k]) out[k] = 255;
  return out;
}

// ---------------------------------------------------------------- RLE
export function rleEncode(arr) {
  const runs = [];
  let v = arr[0], n = 0;
  for (let k = 0; k < arr.length; k++) {
    if (arr[k] === v) n++;
    else { runs.push(`${v}x${n}`); v = arr[k]; n = 1; }
  }
  runs.push(`${v}x${n}`);
  return runs.join(" ");
}
export function rleDecode(s, length) {
  const out = new Uint8Array(length);
  let k = 0;
  for (const run of s.split(" ")) {
    const [v, n] = run.split("x").map(Number);
    out.fill(v, k, k + n); k += n;
  }
  if (k !== length) throw new Error(`RLE length ${k} != ${length}`);
  return out;
}

// ---------------------------------------------------------------- geometry
const round1 = (v) => Math.round(v * 10) / 10;

// Contour a field (grid values) at a threshold and return an SVG path in world units.
export function contourPath(grid, values, level, blur = TERRAIN.blur) {
  const data = Float64Array.from(values);
  if (blur > 0) blur2({ data, width: grid.width, height: grid.height }, blur);
  const [mp] = contours().size([grid.width, grid.height]).thresholds([level])(data);
  // Grid coordinates → world units; drop near-collinear points to keep paths small.
  const toWorld = (ring) => simplify(ring.map(([i, j]) => [round1(grid.x0 + i * grid.cell), round1(grid.y0 + j * grid.cell)]), grid.cell / 3);
  const geo = { type: "MultiPolygon", coordinates: mp.coordinates.map((poly) => poly.map(toWorld)) };
  return geoPath()(geo) ?? "";
}

// Ramer–Douglas–Peucker on a closed ring.
function simplify(ring, tol) {
  if (ring.length < 8) return ring;
  const keep = new Uint8Array(ring.length);
  keep[0] = keep[ring.length - 1] = 1;
  const stack = [[0, ring.length - 1]];
  while (stack.length) {
    const [a, b] = stack.pop();
    const [ax, ay] = ring[a], [bx, by] = ring[b];
    const vx = bx - ax, vy = by - ay, len = Math.hypot(vx, vy) || 1;
    let best = -1, dmax = tol;
    for (let k = a + 1; k < b; k++) {
      const d = Math.abs((ring[k][0] - ax) * vy - (ring[k][1] - ay) * vx) / len;
      if (d > dmax) { dmax = d; best = k; }
    }
    if (best >= 0) { keep[best] = 1; stack.push([a, best], [best, b]); }
  }
  const out = ring.filter((_, k) => keep[k]);
  return out.length >= 4 ? out : ring;
}
