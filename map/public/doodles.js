// Doodles: small hand-drawn ink vignettes that make the map feel inhabited. Style guide: DOODLES.md.
// Each one is pinned either to a landmark (`at: "<landmark id>"`) or to a world point (`at: [x, y]`),
// then offset by `dx, dy` screen pixels, so it sits in the gap beside its landmark rather than on it.
// Drawings use a local frame in screen pixels with the base line at y = 0, and like the landmark
// symbols they keep a constant size on screen. Line, fill and motion styles are in style.css (.doodle).
// `minZoom` (0–2, default 0) hides a doodle below that zoom level, for spots that are only free once
// the map spreads out. Offsets are placed by hand for now and checked against labels by eye only.

window.DOODLES = [
  // The Engine Works: an engine house whose chimney puffs out one token at a time.
  {
    id: "engine-house", at: "autoregressive-decoding", dx: 14, dy: 4,
    svg: `
      <path class="ground" d="M-3 0.4 Q8 -0.6 16 0.5 T33 0.2"/>
      <path class="solid" d="M0 0 V-9.5 L5.5 -15 V-9.5 L11 -15 V-9.5 L16.5 -15 V-9.5 L18.6 -9.5 V0 Z"/>
      <path class="hatch" d="M2 -3 h3 M7.5 -3 h3 M13 -3 h3 M3 -6.5 h2.5 M9 -6.5 h2.5"/>
      <path class="solid" d="M20.5 0 V-24 H25.5 V0 Z"/>
      <path d="M19.8 -24 H26.2 M21 -19 H25 M21 -14 H25"/>
      <circle class="puff" cx="23" cy="-28.5" r="2.4"/>
      <circle class="puff" cx="23" cy="-28.5" r="2.4"/>
      <circle class="puff" cx="23" cy="-28.5" r="2.4"/>`,
  },
  // The Archival Reach: a stack of tomes, and a magnifying glass still searching them.
  {
    id: "tomes", at: "retrieval-augmented-generation", dx: -20, dy: 30,
    svg: `
      <path class="ground" d="M-2 0.4 Q10 -0.4 20 0.5 T38 0.3"/>
      <path class="solid" d="M0 0 V-6 H24 V0 Z"/>
      <path d="M3 -6 V0 M21 -6 V0"/>
      <path class="solid" d="M2.5 -6 L3.5 -11.5 L23 -10.5 L22 -6 Z"/>
      <path d="M6 -11.2 L5.2 -6.1"/>
      <path class="solid" d="M1 -11.5 V-16.5 H19 V-11.5 Z"/>
      <path d="M4 -16.5 V-11.5 M16 -16.5 V-11.5"/>
      <path class="ribbon" d="M13 -11.5 V-7.5 L14.2 -8.6 L15.4 -7.5 V-11.5"/>
      <g class="magnifier">
        <path d="M31 -2 L35.5 4" class="handle"/>
        <circle class="lens" cx="28.5" cy="-6" r="4.6"/>
        <path class="glint" d="M26.3 -8.2 Q27.3 -9.3 28.6 -9.2"/>
      </g>`,
  },
  // The Bulwark: a gatehouse tower and wall, with a ladder someone has quietly left against it.
  {
    id: "gatehouse", at: "prompt-injection", dx: -50, dy: -6, minZoom: 1,
    svg: `
      <path class="ground" d="M-4 0.4 Q10 -0.5 20 0.4 T38 0.2"/>
      <path class="solid" d="M14 0 V-11 H16 V-13.5 H19 V-11 H21 V-13.5 H24 V-11 H26 V-13.5 H29 V-11 H31 V0 Z"/>
      <path class="hatch" d="M17 -4 h3 M23 -4 h3 M20 -7.5 h3"/>
      <path class="solid" d="M1 0 V-21 H-1 V-26.5 H2 V-24 H5 V-26.5 H8 V-24 H11 V-26.5 H14 V-21 H12 V0 Z"/>
      <path class="fill-ink" d="M4.5 0 V-4.5 A2 2 0 0 1 8.5 -4.5 V0 Z"/>
      <path d="M6.5 -15.5 V-11.5"/>
      <path d="M6.5 -26.5 V-37"/>
      <path class="flag" d="M6.5 -37 Q9.5 -38 12.5 -36.2 Q15 -35 17 -35.6 L15.4 -33.2 L17 -31 Q15 -30.5 12.5 -31.6 Q9.5 -33 6.5 -32.2 Z"/>
      <g class="ladder">
        <path d="M33.5 0.3 L28.6 -13.2 M37 0.3 L32.1 -13.2"/>
        <path d="M34.3 -2.6 H36.4 M33.2 -5.7 H35.3 M32.1 -8.8 H34.2 M31 -11.8 H33.1"/>
      </g>`,
  },
  // The Peninsula of Long Thought: a thought that takes its time, one step after another.
  {
    id: "thought-chain", at: "chain-of-thought", dx: -9, dy: -8, minZoom: 1,
    svg: `
      <circle class="solid step s1" cx="0" cy="0" r="1.4"/>
      <circle class="solid step s2" cx="-5" cy="-6" r="2.1"/>
      <circle class="solid step s3" cx="-11.5" cy="-13" r="2.8"/>
      <g class="step s4">
        <path class="solid" d="M-28 -21 Q-31 -26 -26 -28.5 Q-24 -34 -17.5 -32 Q-13 -36 -9 -31.5 Q-3.5 -31.5 -4.5 -26 Q-2 -21 -8 -19.5 Q-11 -16.5 -16 -18.5 Q-21 -16 -24 -18.5 Q-29 -17.5 -28 -21 Z"/>
        <circle class="fill-ink" cx="-21" cy="-24.6" r="0.9"/>
        <circle class="fill-ink" cx="-16.3" cy="-24.6" r="0.9"/>
        <circle class="fill-ink" cx="-11.6" cy="-24.6" r="0.9"/>
      </g>`,
  },
  // The open ocean between the Old World and the New: the classic warning, updated.
  {
    id: "sea-serpent", at: [1800, 2320], dx: -36, dy: 0,
    svg: `
      <clipPath id="serpent-water"><rect x="-30" y="-40" width="110" height="40.6"/></clipPath>
      <g clip-path="url(#serpent-water)">
        <g class="bob">
          <path class="solid" d="M-10 1 C-9 -7 -1 -7 0 1 L-3 1 C-3.5 -3.5 -6.5 -3.5 -7 1 Z"/>
          <path class="solid" d="M6 1 C7 -13 22 -13 23 1 L18.5 1 C18 -7 11 -7 10.5 1 Z"/>
          <path class="solid" d="M29 1 C30 -15 46 -15 47 1 L42.5 1 C42 -8 34 -8 33.5 1 Z"/>
          <path class="fill-ink" d="M11 -9.3 L13 -13 L14.3 -10.5 L16.6 -13.4 L17.6 -10 Z M34.2 -10.8 L36.4 -15 L37.8 -12.2 L40.2 -15.4 L41.2 -11.6 Z"/>
          <path class="solid" d="M53 1 C52 -12 55 -22 63 -24 C68 -25.5 72 -23 71.5 -19.5 C71 -17 68 -17 65 -17.2 C61 -17 58.5 -12 58.5 1 Z"/>
          <path d="M60 -22.5 L57.5 -27.5 L62.8 -24.3"/>
          <circle class="fill-ink" cx="66" cy="-21.2" r="0.95"/>
          <path class="tongue" d="M71.5 -18.6 L75 -18 L76.5 -19.4 M75 -18 L76.2 -16.4"/>
        </g>
      </g>
      <path class="water" d="M-14 1 q2.5 -1.6 5 0 M-1 1 q2.5 -1.6 5 0 M22 1 q2.5 -1.6 5 0 M46 1 q2.5 -1.6 5 0 M57 1 q2.5 -1.6 5 0 M64 1 q2.5 -1.6 5 0"/>
      <path class="water" d="M-6 6 h9 M12 7.5 h14 M35 6 h10 M54 7.5 h8"/>
      <text class="caption" x="22" y="21" text-anchor="middle">Here be hallucinations</text>`,
  },
  // Crossing from the Old World to the New: a ship with the wind behind it.
  {
    id: "ship", at: [1750, 1330], dx: -17, dy: 0,
    svg: `
      <g class="rock">
        <path class="solid" d="M-1 -3 H35 L30.5 3.5 H3.5 Z"/>
        <path d="M2.5 0.3 H32"/>
        <path class="solid" d="M13 -31 L33.5 -4.5 H19.5 Z"/>
        <path d="M12 -3 V-33"/>
        <path class="solid" d="M3.5 -29.5 Q12 -26.5 20.5 -29.5 Q22 -20.5 20.5 -11 Q12 -8 3.5 -11 Q2 -20.5 3.5 -29.5 Z"/>
        <path d="M6 -24.5 Q12 -22.5 18 -24.5 M6 -16.5 Q12 -14.5 18 -16.5"/>
        <path class="flag" d="M12 -33 Q14.5 -34 17.5 -32.8 L15 -31.6 L17.5 -30.4 Q14.5 -29.8 12 -31 Z"/>
      </g>
      <path class="water" d="M-5 5 q3 -1.8 6 0 M31 5 q3 -1.8 6 0 M8 7 h18"/>
      <path class="wake" d="M-7 3 Q-14 1.5 -21 3.5 Q-28 5.5 -35 3.5"/>`,
  },
  // The tip of the Peninsula of Long Thought: a light for anyone still thinking at sea.
  {
    id: "lighthouse", at: [3095, 2440], dx: 0, dy: 0,
    svg: `
      <path class="beam left" d="M0 -27.5 L-24 -33 L-24 -22 Z"/>
      <path class="beam right" d="M0 -27.5 L24 -33 L24 -22 Z"/>
      <path class="solid" d="M-9 1 Q-7 -3.5 -2 -3 Q3 -4.5 8.5 -1.5 Q10 0 9.5 1 Z"/>
      <path class="solid" d="M-4.5 -2.5 L-3 -23 H3 L4.5 -2.5 Z"/>
      <path class="fill-ink" d="M-4.2 -8 L-3.85 -12.5 H3.85 L4.2 -8 Z M-3.55 -16.5 L-3.25 -20.5 H3.25 L3.55 -16.5 Z"/>
      <path class="solid" d="M-4.2 -23 H4.2 V-24.5 H-4.2 Z"/>
      <path class="lamp" d="M-2.6 -24.5 V-30 H2.6 V-24.5 Z"/>
      <path class="solid" d="M-3.8 -30 L0 -34.5 L3.8 -30 Z"/>
      <path class="water" d="M-15 2.5 q3 -1.8 6 0 M11 2.5 q3 -1.8 6 0"/>`,
  },
];
