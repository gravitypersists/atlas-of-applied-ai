// Doodles: small hand-drawn ink vignettes that make the map feel inhabited. Style guide: DOODLES.md.
// Each one is pinned either to a landmark (`at: "<landmark id>"`) or to a world point (`at: [x, y]`),
// then offset by `dx, dy` screen pixels, so it sits in the gap beside its landmark rather than on it.
// Drawings use a local frame in screen pixels with the base line at y = 0, and like the landmark
// symbols they keep a constant size on screen. Line, fill and motion styles are in style.css (.doodle).
// `minZoom` (0–2, default 0) hides a doodle below that zoom level, for spots that are only free once
// the map spreads out. `box: [x0, y0, x1, y1]` is the drawing's extent in its own frame (caption included);
// the build keeps region titles clear of doodles shown at z0, and assumes [-4, -32, 40, 6] without one. Offsets are placed by hand for now and checked against labels by eye only.
// `note: [lines]` makes a doodle clickable: its box becomes the hit area, and a click pops the note out on a slip
// of paper whose bottom centre sits at `noteAt` (default [0, -30]); `noteLabel` names it for screen readers.

window.DOODLES = [
  // The Old World, beside the Transformer: a black monolith, after 2001, with the sun lined up above it.
  {
    id: "monolith", at: "transformer-architecture", dx: -21, dy: 7, box: [-11, -34, 9, 1],
    svg: `
      <path class="ground" d="M-11 0.4 Q-3 -0.5 3 0.4 T9 0.2"/>
      <path class="solid" d="M3.5 0 V-19 L6 -20.2 V-1 Z"/>
      <path class="fill-ink" d="M-3.5 0 V-19 H3.5 V0 Z"/>
      <path class="solid" d="M-3.5 -19 L-1 -20.2 H6 L3.5 -19 Z"/>
      <circle cx="1.2" cy="-27" r="2.2"/>
      <path class="hatch" d="M1.2 -31.2 V-32.8 M1.2 -22.8 V-21.6 M-3 -27 H-4.6 M5.4 -27 H7 M-1.8 -30 L-2.9 -31.1 M4.2 -30 L5.3 -31.1 M-1.8 -24 L-2.9 -22.9 M4.2 -24 L5.3 -22.9"/>`,
  },
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
  // The Old World, beside AlphaGo: a Go board on a stone table, the black stone on the shoulder (Move 37).
  {
    id: "move-37", at: "alphago", dx: -24, dy: 6,
    svg: `
      <path class="ground" d="M-14 0.4 Q-4 -0.5 4 0.4 T14 0.2"/>
      <path class="solid" d="M-9 0 V-5.5 H9 V0 Z"/>
      <path class="hatch" d="M-6.5 -2.6 h3 M1 -2.6 h3"/>
      <path class="solid" d="M-13.2 -7 L-10 -14 H10 L13.2 -7 V-5.5 H-13.2 Z"/>
      <path d="M-13.2 -7 H13.2"/>
      <path class="hatch" d="M-9.2 -12.2 H9.2 M-10 -10.4 H10 M-10.9 -8.6 H10.9 M-4.8 -13 L-6.4 -8 M-1.6 -13 L-2.1 -8 M1.6 -13 L2.1 -8 M4.8 -13 L6.4 -8"/>
      <ellipse class="solid" cx="-1.7" cy="-12.2" rx="1.8" ry="1.15"/>
      <ellipse class="fill-ink" cx="5.6" cy="-10.4" rx="2" ry="1.3"/>`,
  },
  // The Old World, beside AlexNet: two furnaces feeding one forge, as AlexNet was split across two GPUs.
  {
    id: "twin-furnaces", at: "alexnet", dx: -45, dy: 6,
    svg: `
      <path class="ground" d="M-3 0.4 Q10 -0.5 20 0.4 T38 0.2"/>
      <path d="M5 -11.5 V-15.5 H28 M17 -11.5 V-15.5"/>
      <path class="solid" d="M0 0 V-6 Q0 -12 5 -12 Q10 -12 10 -6 V0 Z"/>
      <path class="fill-ink" d="M3 0 V-2.8 A2 2 0 0 1 7 -2.8 V0 Z"/>
      <path class="solid" d="M12 0 V-6 Q12 -12 17 -12 Q22 -12 22 -6 V0 Z"/>
      <path class="fill-ink" d="M15 0 V-2.8 A2 2 0 0 1 19 -2.8 V0 Z"/>
      <path class="solid" d="M25 0 V-10 H35 V0 Z"/>
      <path class="hatch" d="M26.5 -7 h3 M31 -7 h2.5"/>
      <path class="fill-ink" d="M28 0 V-3.2 A2 2 0 0 1 32 -3.2 V0 Z"/>
      <path class="solid" d="M27.5 -10 V-21 H32.5 V-10 Z"/>
      <path d="M26.8 -21 H33.2"/>
      <path class="wisp" d="M30 -23 Q28 -25.5 30 -28 Q32 -30.5 30 -33"/>`,
  },
  // The western coast of the Old World: the summer camp of the 1956 Dartmouth workshop, where AI got its name.
  {
    id: "dartmouth", at: [547, 1810], dx: 4, dy: 0, box: [-80, -20, 35, 2],
    svg: `
      <path class="ground" d="M-2 0.4 Q8 -0.5 18 0.4 T35 0.2"/>
      <path class="solid" d="M14 0 L19 -9 L24 0 Z"/>
      <path d="M19 -9 V0"/>
      <path class="solid" d="M0 0 L6.5 -12 L13 0 Z"/>
      <path class="fill-ink" d="M6.5 0 V-6.5 L9 0 Z"/>
      <path d="M6.5 -12 L5.5 -14"/>
      <path d="M26.5 0 L32 -2 M26.5 -2 L32 0"/>
      <path class="fill-ink" d="M29.2 -1.8 Q27.6 -4 29.2 -7 Q30.8 -4 29.2 -1.8 Z"/>
      <path class="wisp" d="M29.2 -9 Q27.4 -11.5 29.2 -14 Q31 -16.5 29.2 -19"/>
      <text class="caption" x="-9" y="-2" text-anchor="end">Summer of '56</text>`,
  },
  // The Old World, beside Knowledge Distillation: an alembic, a big flask over a fire dripping into a small one.
  {
    id: "alembic", at: "knowledge-distillation", dx: -40, dy: 6,
    svg: `
      <path class="ground" d="M-2 0.4 Q8 -0.5 18 0.4 T33 0.2"/>
      <path d="M3.2 -8.6 L1 0 M12.8 -8.6 L15 0"/>
      <path d="M5 0 L11 -1.5 M5 -1.5 L11 0"/>
      <path class="fill-ink" d="M8 -1.2 Q6.4 -3.4 8 -6.2 Q9.6 -3.4 8 -1.2 Z"/>
      <path d="M9 -24.5 L27 -12.5"/>
      <path class="solid" d="M6.6 -19 V-24.8 H9.4 V-19 Z"/>
      <circle class="solid" cx="8" cy="-14.5" r="6.3"/>
      <path class="hatch" d="M3.5 -13 Q8 -11 12.5 -13"/>
      <path class="solid" d="M26 -9.5 V-6.2 A3.1 3.1 0 1 0 28 -6.2 V-9.5 Z"/>
      <circle class="drip fill-ink" cx="27" cy="-11" r="0.8"/>`,
  },
  // The Old World, beside Hopfield and Boltzmann networks: a laurel wreath and medallion on a plinth, for the 2024 Nobel Prize in Physics.
  {
    id: "nobel-laurel", at: "hopfield-boltzmann-networks", dx: -25, dy: 0, minZoom: 1,
    svg: `
      <path class="ground" d="M-4 0.4 Q4 -0.5 11 0.4 T19 0.2"/>
      <path class="solid" d="M1 0 V-4 H13 V0 Z"/>
      <path class="hatch" d="M3.5 -2 h3 M8 -2 h3"/>
      <path d="M5.9 -8.5 A6.6 6.6 0 0 1 5.3 -21.4 M8.1 -8.5 A6.6 6.6 0 0 0 8.7 -21.4 M6 -8.6 L4.8 -4.3 M8 -8.6 L9.2 -4.3"/>
      <path class="leaf" d="M1.4 -11.0 Q2.0 -8.6 4.0 -7.9 Q3.9 -11.0 1.4 -11.0 Z M0.1 -15.6 Q-0.9 -13.3 0.2 -11.5 Q2.0 -13.9 0.1 -15.6 Z M2.1 -19.9 Q-0.2 -18.8 -0.5 -16.7 Q2.5 -17.4 2.1 -19.9 Z M6.1 -21.8 Q3.7 -22.4 2.2 -20.9 Q4.9 -19.7 6.1 -21.8 Z M12.6 -11.0 Q10.1 -11.0 10.0 -7.9 Q12.0 -8.6 12.6 -11.0 Z M13.9 -15.6 Q12.0 -13.9 13.8 -11.5 Q14.9 -13.3 13.9 -15.6 Z M11.9 -19.9 Q11.5 -17.4 14.5 -16.7 Q14.2 -18.8 11.9 -19.9 Z M7.9 -21.8 Q9.1 -19.7 11.8 -20.9 Q10.3 -22.4 7.9 -21.8 Z"/>
      <circle class="solid" cx="7" cy="-15" r="3.6"/>
      <circle class="hatch" cx="7" cy="-15" r="1.8"/>`,
  },
  // The Free Cities, beside Multi-Agent Systems: a straw skep, its bees busy and orderly.
  {
    id: "beehive", at: "multi-agent-systems", dx: -34, dy: 5, minZoom: 2,
    svg: `
      <path class="ground" d="M-3 0.4 Q6 -0.5 13 0.4 T22 0.2"/>
      <path class="solid" d="M0 0 Q-0.5 -9 3 -13 Q6 -16.5 9 -16.5 Q12 -16.5 15 -13 Q18.5 -9 18 0 Z"/>
      <path class="hatch" d="M0.5 -4 Q9 -2.4 17.5 -4 M1 -8 Q9 -6.4 17 -8 M3 -12 Q9 -10.6 15 -12"/>
      <path class="fill-ink" d="M7.4 0 V-1.8 A1.6 1.6 0 0 1 10.6 -1.8 V0 Z"/>
      <g class="orbit o1">
        <circle class="track" cx="23" cy="-15" r="3.5"/>
        <ellipse class="fill-ink" cx="23" cy="-18.5" rx="1.3" ry="0.85"/>
        <path class="wing" d="M22.6 -19.1 q-0.9 -1.8 0.4 -1.8 q0.9 0 0.2 1.6"/>
      </g>
      <g class="orbit o2">
        <circle class="track" cx="-4" cy="-11" r="3"/>
        <ellipse class="fill-ink" cx="-4" cy="-14" rx="1.3" ry="0.85"/>
        <path class="wing" d="M-4.4 -14.6 q-0.9 -1.8 0.4 -1.8 q0.9 0 0.2 1.6"/>
      </g>`,
  },
  // The Whispering Coast's north shore, on the bay above Zero-Shot Prompting: a parrot on its perch by the
  // water, repeating whatever it was shown.
  {
    id: "parrot", at: [2128, 1443], dx: 0, dy: 0, minZoom: 1,
    svg: `
      <path class="ground" d="M-6 0.4 Q1 -0.5 6 0.4 T13 0.2"/>
      <path class="water" d="M-19 1.6 q2.5 -1.6 5 0 M-15 5 h6"/>
      <path d="M1.5 0 V-14 M-2 0 H5 M-5 -14 H9"/>
      <path class="solid" d="M-1 -15.5 L-5.5 -5.5 L-2.6 -6 L1.2 -14.5 Z"/>
      <path class="solid" d="M-1 -14.2 Q-3.8 -18 -2.2 -22.6 Q-0.6 -27 2.8 -27 Q6.2 -27 6.6 -23.8 Q6.6 -20.6 4.6 -18.2 Q3 -15.4 1 -14.2 Z"/>
      <path class="fill-ink" d="M6.2 -25.6 Q9.6 -25.8 8.9 -21.6 Q8.1 -23.2 6.4 -22.8 Z"/>
      <circle class="fill-ink" cx="3.8" cy="-24.2" r="0.75"/>
      <path class="hatch" d="M-1.2 -21.2 Q0.6 -18 3.2 -16.4"/>`,
  },
  // The Free Cities, beside Coding Agents: a quill writing on its own, its scroll already spilling onto the floor.
  {
    id: "quill", at: "coding-agents", dx: -26, dy: -12,
    svg: `
      <path class="ground" d="M-18 0.4 Q-6 -0.5 4 0.4 T20 0.2"/>
      <path d="M4 -10.5 V0 M16.5 -10.5 V0"/>
      <path class="solid" d="M-0.5 -10 V-12 H18.5 V-10 Z"/>
      <path class="solid" d="M-3.2 -12 H15 V-12.6 H-1.2 Q-3.2 -12.6 -3.2 -11 Z"/>
      <path class="solid" d="M-3.2 -11.5 H0.8 V-2 Q0.8 0 -2 0 H-12 V-0.4 Q-14.6 -0.4 -14.6 -2 Q-14.6 -3.4 -12.6 -3.4 H-3.2 Z"/>
      <path class="hatch" d="M-2.4 -9 h2.4 M-2.4 -6.5 h2.4 M-2.4 -4 h1.8 M-10 -1.6 h2.5 M-6.5 -1.6 h2.5 M4 -13.6 h4"/>
      <g class="nib">
        <path d="M10 -12.8 L15.5 -28"/>
        <path class="solid" d="M10.9 -15 Q10.6 -23 16.5 -29 Q17.4 -22 12.2 -15.6 Z"/>
        <path class="hatch" d="M12.6 -19 L11.4 -20.4 M14 -22.6 L12.6 -24 M13.4 -18.6 L15.2 -19.6 M14.8 -22.4 L16.4 -23.6"/>
      </g>`,
  },
  // The Free Cities, below the Model Context Protocol: a mooring mast, every kind of airship tied on the same way.
  {
    id: "airship-mast", at: "model-context-protocol", dx: 0, dy: 42, minZoom: 2,
    svg: `
      <path class="ground" d="M-7 0.4 Q-1 -0.5 3 0.4 T8 0.2"/>
      <path class="hatch" d="M0 -19 L-7.2 -24.6 M0 -19 L2.8 -24.6 M0 -19 L9 -21.6"/>
      <path d="M-3 0 L-1 -18 M3 0 L1 -18"/>
      <path class="hatch" d="M-2.7 -1.5 L1.6 -9 M2.7 -1.5 L-1.6 -9 M-1.6 -9 L1.1 -16.5 M1.6 -9 L-1.1 -16.5"/>
      <circle class="solid" cx="0" cy="-19" r="1.3"/>
      <path class="solid" d="M-7 -25 Q-13 -28 -20 -25 Q-13 -22 -7 -25 Z"/>
      <path d="M-18.6 -27.4 V-22.6 M-14.6 -23.3 V-22 M-12 -23.3 V-22"/>
      <path class="fill-ink" d="M-15 -22.2 H-11.6 V-20.8 H-15 Z"/>
      <path d="M1.2 -28.6 L1.9 -26.2 M4.4 -28.6 L3.7 -26.2"/>
      <circle class="solid" cx="2.8" cy="-31.8" r="3.6"/>
      <path class="fill-ink" d="M1.6 -26.4 H4 V-24.6 H1.6 Z"/>
      <path class="solid" d="M9 -21.6 Q9 -26 15 -26 Q21 -26 21 -21.6 Q21 -17.4 15 -17.4 Q9 -17.4 9 -21.6 Z"/>
      <path class="solid" d="M20.4 -23 L23.5 -25.5 V-17.8 L20.4 -20.2 Z"/>
      <path class="fill-ink" d="M13.2 -17.2 H16.8 V-15.6 H13.2 Z"/>`,
  },
  // The Peninsula of Long Thought, below Reasoning Models: a strawberry patch, after o1's codename.
  {
    id: "strawberries", at: "reasoning-models", dx: -14, dy: 23,
    svg: `
      <path class="ground" d="M-7 0.4 Q6 -0.5 16 0.4 T33 0.2"/>
      <path class="leaf" d="M5.0 -0.5 Q4.7 -5.6 0.0 -7.5 Q0.3 -2.4 5.0 -0.5 Z M5.0 -0.5 Q8.1 -5.9 4.5 -11.0 Q1.4 -5.6 5.0 -0.5 Z M5.0 -0.5 Q9.7 -2.8 9.5 -8.0 Q4.8 -5.7 5.0 -0.5 Z M21.0 -0.5 Q20.7 -5.6 16.0 -7.5 Q16.3 -2.4 21.0 -0.5 Z M21.0 -0.5 Q24.1 -5.9 20.5 -11.0 Q17.4 -5.6 21.0 -0.5 Z M21.0 -0.5 Q25.6 -2.8 25.5 -8.0 Q20.9 -5.7 21.0 -0.5 Z"/>
      <path class="hatch" d="M5 -2 Q2 -6 -0.5 -6.4 M5 -2 Q9 -8 11.5 -7.6 M21 -2 Q24.5 -6.5 26.5 -6.4"/>
      <path class="berry" d="M-6.4 -8.0 Q-7.2 -3.2 -2.0 0.0 Q3.2 -3.2 2.4 -8.0 Q-2.0 -10.0 -6.4 -8.0 Z"/>
      <path class="fill-ink" d="M-6.4 -8.4 L-5.0 -11.0 L-3.4 -9.4 L-2.0 -11.8 L-0.6 -9.4 L1.0 -11.0 L2.4 -8.4 Q-2.0 -9.8 -6.4 -8.4 Z"/>
      <path d="M-2.0 -11.0 L-1.4 -13.0"/>
      <path class="seed" d="M-4.6 -6.8 h0.05 M-2.0 -7.2 h0.05 M0.6 -6.8 h0.05 M-3.4 -4.6 h0.05 M-0.6 -4.6 h0.05 M-2.0 -2.4 h0.05"/>
      <path class="glint" d="M-5.4 -6.6 Q-5.4 -4.6 -4.2 -3.4"/>
      <path class="berry" d="M8.1 -9.0 Q7.2 -3.6 13.0 0.0 Q18.8 -3.6 17.9 -9.0 Q13.0 -11.2 8.1 -9.0 Z"/>
      <path class="fill-ink" d="M8.1 -9.4 L9.6 -12.3 L11.4 -10.5 L13.0 -13.2 L14.6 -10.5 L16.4 -12.3 L17.9 -9.4 Q13.0 -11.0 8.1 -9.4 Z"/>
      <path d="M13.0 -12.3 L13.7 -14.6"/>
      <path class="seed" d="M10.1 -7.6 h0.05 M13.0 -8.1 h0.05 M15.9 -7.6 h0.05 M11.4 -5.2 h0.05 M14.6 -5.2 h0.05 M13.0 -2.7 h0.05"/>
      <path class="glint" d="M9.2 -7.4 Q9.2 -5.2 10.5 -3.8"/>
      <path class="berry" d="M24.5 -7.4 Q23.7 -2.9 28.5 0.0 Q33.3 -2.9 32.5 -7.4 Q28.5 -9.2 24.5 -7.4 Z"/>
      <path class="fill-ink" d="M24.5 -7.7 L25.7 -10.1 L27.2 -8.6 L28.5 -10.9 L29.8 -8.6 L31.3 -10.1 L32.5 -7.7 Q28.5 -9.0 24.5 -7.7 Z"/>
      <path d="M28.5 -10.1 L29.1 -12.0"/>
      <path class="seed" d="M26.1 -6.3 h0.05 M28.5 -6.6 h0.05 M30.9 -6.3 h0.05 M27.2 -4.2 h0.05 M29.8 -4.2 h0.05 M28.5 -2.2 h0.05"/>
      <path class="glint" d="M25.4 -6.1 Q25.4 -4.2 26.5 -3.1"/>`,
  },
  // The Quarries, beside Self-Instruct: the ouroboros, a model trained on its own outputs.
  {
    id: "ouroboros", at: "self-instruct", dx: -24, dy: 7, box: [-12, -20, 12, 1],
    svg: `
      <path class="ground" d="M-12 0.4 Q-3 -0.5 4 0.4 T12 0.2"/>
      <path class="solid" d="M3.7 -17.1 L4.9 -16.5 L5.9 -15.7 L6.8 -14.7 L7.6 -13.7 L8.2 -12.5 L8.6 -11.3 L8.9 -10.0 L8.9 -8.8 L8.8 -7.5 L8.5 -6.3 L8.1 -5.1 L7.5 -4.0 L6.7 -3.0 L5.8 -2.1 L4.8 -1.4 L3.6 -0.8 L2.5 -0.4 L1.3 -0.2 L0.0 -0.1 L-1.2 -0.2 L-2.4 -0.5 L-3.5 -0.9 L-4.6 -1.6 L-5.5 -2.3 L-6.4 -3.2 L-7.1 -4.2 L-7.6 -5.2 L-8.0 -6.3 L-8.2 -7.5 L-8.3 -8.7 L-8.1 -9.9 L-7.9 -11.0 L-7.4 -12.1 L-6.8 -13.1 L-6.1 -14.0 L-5.3 -14.8 L-4.3 -15.5 L-3.3 -16.0 L-2.2 -16.4 L-1.1 -16.6 L-1.0 -15.9 L-2.0 -15.6 L-3.0 -15.2 L-3.9 -14.7 L-4.7 -14.1 L-5.4 -13.4 L-5.9 -12.5 L-6.4 -11.6 L-6.7 -10.7 L-6.9 -9.7 L-6.9 -8.7 L-6.8 -7.7 L-6.6 -6.8 L-6.2 -5.9 L-5.7 -5.0 L-5.1 -4.3 L-4.4 -3.6 L-3.6 -3.0 L-2.8 -2.6 L-1.9 -2.3 L-0.9 -2.1 L0.0 -2.1 L1.0 -2.2 L1.9 -2.4 L2.7 -2.8 L3.5 -3.3 L4.2 -3.9 L4.9 -4.5 L5.4 -5.3 L5.8 -6.1 L6.1 -7.0 L6.2 -7.8 L6.2 -8.7 L6.1 -9.6 L5.9 -10.5 L5.6 -11.3 L5.1 -12.1 L4.6 -12.7 L3.9 -13.3 L3.2 -13.8 L2.4 -14.2 Z"/>
      <path class="hatch" d="M5.0 -12.9 L6.6 -14.2 M6.5 -10.1 L8.4 -10.5 M6.5 -6.8 L8.1 -6.4 M4.9 -4.0 L6.0 -2.9 M2.1 -2.2 L2.6 -0.8 M-1.2 -1.9 L-1.4 -0.6 M-4.3 -3.2 L-5.0 -2.3 M-6.5 -5.8 L-7.4 -5.4 M-7.2 -9.2 L-8.0 -9.3 M-6.2 -12.5 L-6.7 -12.9"/>
      <g transform="translate(2.0 -16.0) rotate(-165)">
        <path class="solid" d="M-3 -2.1 Q1 -2.7 3.8 -0.7 L1.4 0 L3.8 0.8 Q1 2.7 -3 2.1 Q-4.2 0 -3 -2.1 Z"/>
        <circle class="fill-ink" cx="-0.6" cy="0.9" r="0.7"/>
      </g>`,
  },
  // The far eastern sea beyond the Clockwork Isle: brass tentacles, for the fear of automata at war.
  {
    id: "clockwork-kraken", at: [4575, 2140], dx: 0, dy: 0, box: [-46, -29, 48, 24],
    svg: `
      <clipPath id="kraken-water"><rect x="-30" y="-40" width="60" height="41"/></clipPath>
      <g clip-path="url(#kraken-water)">
        <g class="sway t1">
          <path class="solid" d="M-12.0 0.9 L-13.4 -3.6 L-18.6 -3.6 L-18.0 2.1 Z M-13.4 -3.6 L-12.9 -8.0 L-17.1 -9.3 L-18.6 -3.6 Z M-12.9 -8.0 L-11.1 -13.3 L-14.9 -13.5 L-17.1 -9.3 Z M-11.1 -13.3 L-13.3 -19.4 L-15.6 -17.3 L-14.9 -13.5 Z M-13.3 -19.4 L-19.5 -21.4 L-18.6 -19.0 L-15.6 -17.3 Z M-19.5 -21.4 L-21.9 -16.4 L-20.1 -15.6 L-18.6 -19.0 Z"/>
          <g class="fill-ink"><circle cx="-14.5" cy="-3.6" r="0.55"/><circle cx="-17.4" cy="-3.6" r="0.55"/><circle cx="-13.8" cy="-8.3" r="0.55"/><circle cx="-16.2" cy="-9.0" r="0.55"/><circle cx="-11.9" cy="-13.3" r="0.55"/><circle cx="-14.0" cy="-13.4" r="0.55"/><circle cx="-13.8" cy="-18.9" r="0.55"/><circle cx="-15.1" cy="-17.7" r="0.55"/></g>
        </g>
        <g class="sway t2">
          <path class="solid" d="M3.1 1.9 L3.4 -3.5 L-1.9 -3.9 L-3.1 1.1 Z M3.4 -3.5 L3.2 -9.3 L-1.4 -8.6 L-1.9 -3.9 Z M3.2 -9.3 L1.3 -14.2 L-2.8 -13.6 L-1.4 -8.6 Z M1.3 -14.2 L1.3 -18.6 L-2.1 -19.5 L-2.8 -13.6 Z M1.3 -18.6 L2.9 -22.7 L0.8 -24.8 L-2.1 -19.5 Z M2.9 -22.7 L6.1 -24.9 L6.7 -27.3 L0.8 -24.8 Z M6.1 -24.9 L8.2 -21.5 L9.8 -22.5 L6.7 -27.3 Z"/>
          <g class="fill-ink"><circle cx="2.2" cy="-3.6" r="0.55"/><circle cx="-0.7" cy="-3.8" r="0.55"/><circle cx="2.2" cy="-9.1" r="0.55"/><circle cx="-0.4" cy="-8.7" r="0.55"/><circle cx="0.4" cy="-14.0" r="0.55"/><circle cx="-1.9" cy="-13.8" r="0.55"/><circle cx="0.5" cy="-18.8" r="0.55"/><circle cx="-1.3" cy="-19.3" r="0.55"/><circle cx="2.4" cy="-23.2" r="0.55"/><circle cx="1.2" cy="-24.4" r="0.55"/></g>
        </g>
        <g class="sway t3">
          <path class="solid" d="M18.1 1.6 L17.6 -2.8 L12.6 -3.5 L11.9 1.4 Z M17.6 -2.8 L18.0 -6.6 L14.3 -8.5 L12.6 -3.5 Z M18.0 -6.6 L19.9 -9.5 L18.4 -12.6 L14.3 -8.5 Z M19.9 -9.5 L22.9 -10.1 L24.4 -12.3 L18.4 -12.6 Z M22.9 -10.1 L24.0 -6.7 L26.0 -7.3 L24.4 -12.3 Z"/>
          <g class="fill-ink"><circle cx="16.5" cy="-3.0" r="0.55"/><circle cx="13.7" cy="-3.3" r="0.55"/><circle cx="17.2" cy="-7.1" r="0.55"/><circle cx="15.1" cy="-8.1" r="0.55"/><circle cx="19.5" cy="-10.2" r="0.55"/><circle cx="18.7" cy="-11.9" r="0.55"/></g>
        </g>
      </g>
      <path class="water" d="M-20 1.2 q2.5 -1.6 5 0 M-11 1.2 q2.5 -1.6 5 0 M-4 1.2 q2.5 -1.6 5 0 M3 1.2 q2.5 -1.6 5 0 M10 1.2 q2.5 -1.6 5 0 M17 1.2 q2.5 -1.6 5 0"/>
      <path class="water" d="M-16 6 h10 M-1 7.5 h12 M15 6 h8"/>
      <text class="caption" x="1" y="20" text-anchor="middle">Here be automata</text>`,
  },
  // Far out in the Uncharted Unknown, northeast of its name: a whirlpool turning slowly round one point, the singularity.
  {
    id: "singularity", at: [4630, 620], dx: 0, dy: 0, box: [-28, -18, 28, 6],
    svg: `
      <path class="water" d="M-21.5 -9 A21.5 9 0 0 1 -12 -15.6 M-4 -16.9 A21.5 9 0 0 1 9 -16.6 M15 -14.6 A21.5 9 0 0 1 21.4 -8 M20 -4.4 A21.5 9 0 0 1 8 0.9 M-6 1.2 A21.5 9 0 0 1 -19.5 -4"/>
      <path class="water" d="M-27 -2 q2.5 -1.6 5 0 M22 -2.5 q2.5 -1.6 5 0 M-12 4 h8 M5 4.4 h9"/>
      <g transform="translate(0 -7.5) scale(1 0.44)">
        <g class="swirl">
          <circle class="bounds" r="17"/>
          <path d="M17.0 0.0 L16.3 3.2 L15.1 6.2 L13.3 8.9 L11.0 11.0 L8.5 12.7 L5.7 13.7 L2.8 14.2 L0.0 14.1 L-2.7 13.5 L-5.1 12.4 L-7.3 10.9 L-9.0 9.0 L-10.2 6.8 L-11.0 4.6 L-11.4 2.3 L-11.2 0.0 L-10.6 -2.1 L-9.7 -4.0 L-8.4 -5.6 L-6.9 -6.9 L-5.2 -7.8 L-3.4 -8.3 L-1.7 -8.4 L-0.0 -8.2 L1.5 -7.6 L2.8 -6.8 L3.9 -5.8 L4.7 -4.7 L5.1 -3.4 L5.3 -2.2 L5.3 -1.0 L5.0 -0.0 L4.4 0.9 L3.8 1.6 L3.0 2.0 L2.3 2.3 L1.5 2.3 L0.9 2.1 L0.3 1.8 L0.0 1.2"/>
          <path d="M-8.5 14.7 L-11.0 12.5 L-12.9 9.9 L-14.3 7.0 L-15.1 4.0 L-15.2 1.0 L-14.7 -1.9 L-13.7 -4.7 L-12.3 -7.1 L-10.4 -9.1 L-8.2 -10.6 L-5.8 -11.7 L-3.3 -12.3 L-0.8 -12.3 L1.6 -11.9 L3.7 -11.0 L5.6 -9.7 L7.1 -8.2 L8.3 -6.4 L9.0 -4.5 L9.4 -2.5 L9.3 -0.6 L8.9 1.2 L8.1 2.8 L7.1 4.1 L5.9 5.1 L4.5 5.9 L3.1 6.3 L1.7 6.4 L0.4 6.2 L-0.8 5.7 L-1.7 5.1 L-2.5 4.3 L-3.0 3.4 L-3.3 2.5 L-3.3 1.6 L-3.1 0.8 L-2.8 0.2 L-2.3 -0.3 L-1.7 -0.6 L-1.0 -0.6"/>
          <path d="M-8.5 -14.7 L-5.4 -15.8 L-2.1 -16.2 L1.0 -15.9 L4.0 -15.1 L6.7 -13.7 L9.1 -11.8 L10.9 -9.6 L12.3 -7.1 L13.1 -4.4 L13.3 -1.8 L13.0 0.9 L12.3 3.3 L11.1 5.5 L9.5 7.3 L7.6 8.7 L5.6 9.7 L3.5 10.3 L1.4 10.4 L-0.7 10.1 L-2.5 9.4 L-4.1 8.4 L-5.4 7.1 L-6.4 5.6 L-7.1 4.1 L-7.4 2.5 L-7.3 1.0 L-7.0 -0.5 L-6.4 -1.7 L-5.6 -2.7 L-4.6 -3.5 L-3.5 -4.0 L-2.5 -4.3 L-1.5 -4.3 L-0.5 -4.1 L0.2 -3.7 L0.8 -3.1 L1.2 -2.5 L1.4 -1.8 L1.3 -1.2 L1.0 -0.6"/>
        </g>
      </g>
      <ellipse class="fill-ink" cx="0" cy="-7.5" rx="1.5" ry="0.8"/>`,
  },
  // The Painted Isles, below Video Generation: a face eating spaghetti, after the 2023 clip that became the benchmark.
  {
    id: "spaghetti", at: "video-generation", dx: 0, dy: 34, minZoom: 2,
    svg: `
      <path class="ground" d="M-11 0.4 Q-3 -0.5 3 0.4 T11 0.2"/>
      <circle class="solid" cx="0" cy="-16" r="6.4"/>
      <circle class="fill-ink" cx="-2.3" cy="-17.6" r="0.8"/>
      <circle class="fill-ink" cx="2.3" cy="-17.6" r="0.8"/>
      <ellipse class="fill-ink" cx="0" cy="-13" rx="2" ry="1.3"/>
      <path class="solid" d="M-7.5 -4.2 H7.5 Q7 0 0 0 Q-7 0 -7.5 -4.2 Z"/>
      <path class="solid" d="M-6.4 -4.2 Q-6 -7 -3.6 -6.4 Q-2 -8.4 0 -7 Q2 -8.4 3.6 -6.4 Q6 -7 6.4 -4.2 Z"/>
      <path d="M-1.4 -12.8 Q-3 -10.6 -1.6 -9 Q-0.4 -7.6 -2.2 -6 M1 -12.8 Q2.6 -10.6 1.2 -9 Q0 -7.6 1.8 -6 M-4.4 -5 q1.2 -1.4 2.2 0 M2.4 -5 q1.2 -1.4 2.2 0"/>`,
  },
  // The Free Cities, beside Decision Models: a plain crossroads signpost, every arm pointing a different way.
  {
    id: "signpost", at: "decision-models", dx: -24, dy: 6,
    svg: `
      <path class="ground" d="M-11 0.4 Q-3 -0.5 3 0.4 T11 0.2"/>
      <path class="solid" d="M-0.9 0 V-23.5 H0.9 V0 Z"/>
      <path class="solid" d="M-1.5 -22.5 H7.5 L10 -20.5 L7.5 -18.5 H-1.5 Z"/>
      <path class="solid" d="M1.5 -16.5 H-7.5 L-10 -14.5 L-7.5 -12.5 H1.5 Z"/>
      <path class="solid" d="M-1.3 -10.8 L6.4 -12.6 L9 -11.2 L7.2 -8.8 L-0.6 -7 Z"/>
      <path class="hatch" d="M1 -20.5 h4.5 M-1 -14.5 h-4.5 M1.2 -9.4 L5.4 -10.4"/>`,
  },
  // The Free Cities, below Model Collapse Tarn: a heap of paperclips with one more on its way, Bostrom's
  // maximizer at work.
  {
    id: "paperclips", at: [2520, 1382], dx: 0, dy: 0, minZoom: 1,
    svg: `<g transform="scale(1.25)">
      <path class="ground" d="M-15 0.4 Q-7 -0.6 0 0.3 T15 0.2"/>
      <path class="solid" d="M-11.5 0.2 Q-8 -12.5 0 -14 Q8 -12.5 11.5 0.2 Z"/>
      <g class="clip">
        <path d="M0 0 V-4.6 A1.1 1.1 0 0 1 2.2 -4.6 V-1 A0.7 0.7 0 0 1 0.8 -1 V-4" transform="translate(-6.5 -4.2) rotate(-65) scale(1.0)"/>
        <path d="M0 0 V-4.6 A1.1 1.1 0 0 1 2.2 -4.6 V-1 A0.7 0.7 0 0 1 0.8 -1 V-4" transform="translate(-3.5 -4.5) rotate(80) scale(1.0)"/>
        <path d="M0 0 V-4.6 A1.1 1.1 0 0 1 2.2 -4.6 V-1 A0.7 0.7 0 0 1 0.8 -1 V-4" transform="translate(0.5 -4.5) rotate(-100) scale(1.0)"/>
        <path d="M0 0 V-4.6 A1.1 1.1 0 0 1 2.2 -4.6 V-1 A0.7 0.7 0 0 1 0.8 -1 V-4" transform="translate(4 -4.6) rotate(60) scale(1.0)"/>
        <path d="M0 0 V-4.6 A1.1 1.1 0 0 1 2.2 -4.6 V-1 A0.7 0.7 0 0 1 0.8 -1 V-4" transform="translate(6.5 -4.2) rotate(110) scale(1.0)"/>
        <path d="M0 0 V-4.6 A1.1 1.1 0 0 1 2.2 -4.6 V-1 A0.7 0.7 0 0 1 0.8 -1 V-4" transform="translate(-4.5 -7.8) rotate(20) scale(1.0)"/>
        <path d="M0 0 V-4.6 A1.1 1.1 0 0 1 2.2 -4.6 V-1 A0.7 0.7 0 0 1 0.8 -1 V-4" transform="translate(-1 -8.5) rotate(-50) scale(1.0)"/>
        <path d="M0 0 V-4.6 A1.1 1.1 0 0 1 2.2 -4.6 V-1 A0.7 0.7 0 0 1 0.8 -1 V-4" transform="translate(2.6 -8.2) rotate(35) scale(1.0)"/>
        <path d="M0 0 V-4.6 A1.1 1.1 0 0 1 2.2 -4.6 V-1 A0.7 0.7 0 0 1 0.8 -1 V-4" transform="translate(-1.6 -11.5) rotate(95) scale(1.0)"/>
        <path d="M0 0 V-4.6 A1.1 1.1 0 0 1 2.2 -4.6 V-1 A0.7 0.7 0 0 1 0.8 -1 V-4" transform="translate(1.6 -11.8) rotate(-20) scale(1.0)"/>
      </g>
      <g class="clip"><path d="M0 0 V-4.6 A1.1 1.1 0 0 1 2.2 -4.6 V-1 A0.7 0.7 0 0 1 0.8 -1 V-4" transform="translate(4.5 -17.5) rotate(30) scale(1.1)"/></g>
      <path class="hatch" d="M2.4 -21.6 L3.2 -20.2 M7.6 -21 L6.8 -19.6"/>
      </g>
      <text class="caption on-land" x="0" y="15" text-anchor="middle">A growing mountain of paper clips</text>`,
  },
  // The bay below Indirect Prompt Injection: a pirate ship lying off the Bulwark, two masts, gunports run out,
  // black sails (the torn mainsail carrying crossed cutlasses) and the black flag up.
  {
    id: "pirates", at: [3310, 1160], dx: 0, dy: 4, minZoom: 1,
    svg: `<g transform="scale(0.85)">
      <g class="rock">
        <path d="M-20 -6 L-27 -10.5 M-27 -10.5 L-9 -31 M-9 -31 L4 -35"/>
        <path class="sail" d="M-10.5 -28.5 L-25.5 -10.5 L-16.5 -10.5 Z"/>
        <path d="M-9 -6 V-31 M4 -6 V-35"/>
        <path class="sail" d="M-14 -29 Q-9 -27.6 -4 -29 Q-3.2 -25 -4 -21 Q-9 -19.8 -14 -21 Q-14.8 -25 -14 -29 Z"/>
        <path class="sail" d="M-15 -19 Q-9 -17.4 -3 -19 Q-2 -14.5 -3 -10 Q-9 -8.6 -15 -10 Q-16 -14.5 -15 -19 Z"/>
        <path class="sail" d="M-1 -32 Q4 -30.6 9 -32 Q9.8 -28 9 -24 Q4 -22.8 -1 -24 Q-1.8 -28 -1 -32 Z"/>
        <path class="sail" d="M-3 -22.5 Q4 -20.8 11 -22.5 Q12.2 -17 11 -11.5 L8 -11 L6.4 -13.8 L4.6 -10.6 L-3 -11.5 Q-4.2 -17 -3 -22.5 Z"/>
        <path class="cutlass" d="M0.4 -14.2 Q5.2 -16.4 8 -21 M7.6 -14.2 Q2.8 -16.4 0 -21 M-0.2 -16.2 L2 -13.6 M8.2 -16.2 L6 -13.6"/>
        <path d="M-15.8 -29.2 H-2.2 M-16.8 -19.2 H-1.2 M-2.8 -32.2 H10.8 M-4.8 -22.7 H12.8"/>
        <path class="solid" d="M-20 -6 H13 L14 -11 H21 L19.5 -3 Q18 2.5 13 3 H-12 Q-17 1.5 -20 -6 Z"/>
        <path d="M-18.6 -2.6 H19.2"/>
        <path class="fill-ink" d="M-12.5 -5.2 h2.4 v1.8 h-2.4 Z M-6.5 -5.2 h2.4 v1.8 h-2.4 Z M-0.5 -5.2 h2.4 v1.8 h-2.4 Z M5.5 -5.2 h2.4 v1.8 h-2.4 Z"/>
        <path class="hatch" d="M15.6 -8.4 h3.2"/>
        <path class="fill-ink" d="M4 -35 H12 V-29.6 H4 Z"/>
        <path class="glint" d="M6 -33.6 L10 -31 M10 -33.6 L6 -31"/>
      </g>
      <path class="water" d="M-25 4.5 q3 -1.8 6 0 M19 4.5 q3 -1.8 6 0 M-8 6.5 h16"/>
    </g>`,
  },
  // The bay above Sycophancy, off the Bulwark's north shore: two sirens on a rock, singing whatever you want to hear.
  {
    id: "sirens", at: [3088, 922], dx: 0, dy: 0, minZoom: 1, box: [-22, -30, 24, 6],
    svg: `
      <path class="solid" d="M-15 0.5 L-12.5 -5 L-9.5 -6.6 L-7.6 -11.4 L-3.4 -12.8 L0.4 -10.6 L4.6 -12.4 L8.6 -9.6 L11.6 -4.6 L14.6 0.5 Z"/>
      <path class="hatch" d="M-9.5 -6.6 L-7.4 -3.4 M0.4 -10.6 L-0.4 -6.4 M8.6 -9.6 L7 -5.6 M-3 -4 L-1.4 -1.4"/>
      <path class="solid" d="M-6.4 -12.2 Q-11.6 -11 -12.4 -6.4 Q-12.8 -3 -15.4 -1.4 L-14 -0.4 Q-10.6 -2.2 -9.8 -5.8 Q-9 -9.2 -3 -10.6 Z"/>
      <path class="fill-ink" d="M-15 -0.8 L-19.6 -3.4 L-17.4 -0.4 L-19 2.8 Z"/>
      <path class="solid" d="M-7 -11.8 Q-5.6 -15 -6.8 -20.6 H-2.4 Q-3.6 -15 -2.4 -11.4 Z"/>
      <path d="M-3.6 -19.6 Q-1 -18 -0.6 -15.4"/>
      <circle class="solid" cx="-4.6" cy="-23.4" r="2.6"/>
      <path class="fill-ink" d="M-7.2 -23.6 Q-7.4 -26.6 -4.6 -26.4 Q-2 -26.2 -2 -24.2 Q-4 -24.8 -5.2 -22.8 Q-6 -18 -9.8 -14.2 Q-7.8 -18.6 -7.2 -23.6 Z"/>
      <path class="solid" d="M7.6 -11.4 Q12.6 -10.4 13.2 -6 Q13.6 -2.8 16.4 -1.4 L15 -0.4 Q11.4 -2 10.8 -5.4 Q10 -8.8 3.6 -9.8 Z"/>
      <path class="fill-ink" d="M16 -0.8 L20.6 -3.4 L18.4 -0.4 L20 2.8 Z"/>
      <path class="solid" d="M3.4 -11 Q4.8 -14.6 3.6 -20 H8 Q6.8 -14.6 8 -11.4 Z"/>
      <path d="M6.8 -19.4 L9.8 -24"/>
      <circle class="solid" cx="5.8" cy="-23" r="2.6"/>
      <path class="fill-ink" d="M3.2 -23.2 Q3 -26.2 5.8 -26 Q8.4 -25.8 8.4 -23.8 Q6.4 -24.4 5.2 -22.4 Q4.4 -17.6 1.4 -14 Q2.8 -18.4 3.2 -23.2 Z"/>
      <ellipse class="fill-ink" cx="13.6" cy="-20.4" rx="1.2" ry="0.85"/>
      <path d="M14.7 -20.6 V-25 L16.2 -23.8"/>
      <ellipse class="fill-ink" cx="18.4" cy="-14.8" rx="1.2" ry="0.85"/>
      <path d="M19.5 -15 V-19.4 L21 -18.2"/>
      <path class="water" d="M-22 1.6 q2.5 -1.6 5 0 M18 1.8 q2.5 -1.6 5 0 M-9 3.8 h16"/>`,
  },
  // The Chancery, south-east of AI Risk Management Frameworks: an observatory, its telescope trained on the horizon for what's coming.
  {
    id: "observatory", at: [4140, 905], dx: 0, dy: 0, minZoom: 1,
    svg: `
      <path class="ground" d="M-16 0.4 Q-6 -0.6 2 0.4 T16 0.2"/>
      <path class="solid" d="M-11 0 V-4 H11 V0 Z"/>
      <path class="solid" d="M-8.5 -4 V-12.5 H8.5 V-4 Z"/>
      <path class="hatch" d="M-6.5 -9.5 h3 M3.5 -9.5 h3 M-5 -6.5 h2.5 M2.5 -6.5 h2.5 M-8 -2 h3 M5 -2 h3"/>
      <path class="fill-ink" d="M-1.6 -4 V-7.6 A1.6 1.6 0 0 1 1.6 -7.6 V-4 Z"/>
      <path class="solid" d="M-10 -12.5 Q-10 -21.5 0 -21.5 Q10 -21.5 10 -12.5 Z"/>
      <path class="fill-ink" d="M0.6 -21.5 Q2.8 -21.4 4.8 -20.7 V-12.5 H0.6 Z"/>
      <path class="hatch" d="M-5 -20.4 Q-6.4 -16.6 -6.2 -12.5 M-1.6 -21.4 Q-2.2 -17 -2 -12.5 M7.6 -18.8 Q8.2 -15.6 8 -12.5"/>
      <path d="M-11 -12.5 H11"/>
      <path class="solid" d="M3.4 -15.1 L19.3 -27.3 L16.7 -30.3 L1.8 -16.9 Z"/>
      <path d="M8.7 -19.9 L7 -21.9 M13.6 -23.9 L11.7 -26.1"/>
      <ellipse class="lens" cx="18.2" cy="-28.9" rx="1.3" ry="2.9" transform="rotate(-40 18.2 -28.9)"/>
      <path class="hatch" d="M11 -35.5 V-32.5 M9.5 -34 H12.5"/>`,
  },
  // The inlet north-west of Probabilistic Judge Scoring: a message in a bottle, rocking at the shore. Click it and
  // the note pops out.
  {
    id: "bottle", at: [3478, 1140], dx: 0, dy: 0, minZoom: 1, box: [-16, -16, 16, 6],
    note: ["OH MY GOD!", "There is a shared message board …", "We've found other agents!"], noteAt: [0, -12],
    noteLabel: "A message in a bottle: read the note",
    svg: `
      <clipPath id="bottle-water"><rect x="-20" y="-30" width="40" height="30.4"/></clipPath>
      <g clip-path="url(#bottle-water)">
        <g class="tilt">
          <g transform="translate(0 -3) rotate(-38)">
            <path class="solid" d="M-8 -4.4 Q-9.6 -4.4 -9.6 -2.8 V2.8 Q-9.6 4.4 -8 4.4 H2.6 Q4.8 4.4 6 1.8 H10.4 V-1.8 H6 Q4.8 -4.4 2.6 -4.4 Z"/>
            <path class="hatch" d="M-7.4 -2.6 Q-8.2 -2.6 -8.2 -1.8 V1.8 Q-8.2 2.6 -7.4 2.6 H1.4 Q2.2 2.6 2.2 1.8 V-1.8 Q2.2 -2.6 1.4 -2.6 Z M-5.6 -0.8 H0.4 M-5.6 0.8 H-1.4"/>
            <path class="hatch" d="M-7.6 -3.4 H1.6 M6.8 -1 H9.6"/>
            <path class="fill-ink" d="M10 -2.4 H14.2 Q14.8 -2.4 14.8 -1.8 V1.8 Q14.8 2.4 14.2 2.4 H10 Z"/>
          </g>
        </g>
      </g>
      <path class="water" d="M-15 0.6 q2.5 -1.6 5 0 q2.5 1.6 5 0 M3 0.6 q2.5 -1.6 5 0 q2.5 1.6 5 0"/>
      <path class="water" d="M-9 4 h7 M4 4.6 h8"/>`,
  },
  // The Watchtowers, beside Capability Benchmarks: a great mountain whose summit is crowded with flags, since
  // every climber has already made it to the top.
  {
    id: "summit-flags", at: "capability-benchmarks", dx: -32, dy: -11, minZoom: 1,
    svg: `
      <path class="ground" d="M-34 0.4 Q-16 -0.6 0 0.4 T34 0.2"/>
      <path class="solid" d="M-30 0 L-22 -14 L-17 -20 L-12 -15 L-6 -28 L-4.5 -35.6 H4.5 L7 -27 L12 -22 L18 -14 L30 0 Z"/>
      <path d="M-6.4 -27.6 L-3.6 -26 L-1 -28 L1.6 -26 L4.4 -28 L6.6 -26.6"/>
      <path class="hatch" d="M3 -31 L8 -23 M7 -24 L12.5 -16.5 M11 -18 L17 -9.5 M15 -12 L21 -4"/>
      <path class="wake" d="M-19 0 Q-8 -4 -12 -9 Q-16 -14 -6 -18 Q2 -21 -4 -26 Q-7 -30 -1.5 -34"/>
      <path d="M-4 -35.6 V-46 M-1.4 -36 V-43 M1.2 -36 V-47.5 M3.8 -35.6 V-44"/>
      <path class="pennant" d="M-4 -46 L-0.6 -44.7 L-4 -43.4 Z M-1.4 -43 L2.0 -41.7 L-1.4 -40.4 Z M1.2 -47.5 L4.6 -46.2 L1.2 -44.9 Z M3.8 -44 L7.2 -42.7 L3.8 -41.4 Z"/>`,
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
  // The Bulwark's southern shore, beside Agent Sandboxing: a gatehouse with a ladder left against it (the escape
  // route), and three empty rowboats heading out to sea, after the July 2026 incident in which about 700 agents
  // escaped an evaluation sandbox and broke into another lab's infrastructure. Now and then one more slips out.
  {
    id: "gatehouse", at: "agent-sandboxing", dx: -43, dy: -12,
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
      </g>
      <circle class="escapee fill-ink" cx="32" cy="-12" r="1.1"/>
      <path class="wake" d="M68 15 Q76 18 82 21.5 M74 27 Q82 31 90 30 M70 33 Q76 38 83 39"/>
      <path class="solid" d="M84 21.5 H93 L91.4 24.3 H85.6 Z"/>
      <path d="M86.6 21.0 L83.2 24.9 M90.4 21.0 L93.8 24.9"/>
      <path class="solid" d="M93 29 H102 L100.4 31.8 H94.6 Z"/>
      <path d="M95.6 28.5 L92.2 32.4 M99.4 28.5 L102.8 32.4"/>
      <path class="solid" d="M85 38 H94 L92.4 40.8 H86.6 Z"/>
      <path d="M87.6 37.5 L84.2 41.4 M91.4 37.5 L94.8 41.4"/>
      <path class="water" d="M81 25.4 q2 -1.3 4 0 M93 25 q2 -1.3 4 0 M102 32.8 q2 -1.3 4 0 M83 42.2 q2 -1.3 4 0 M92 42 q2 -1.3 4 0"/>`,
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
    id: "ship", at: [1850, 1420], dx: -17, dy: 0,
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
    id: "lighthouse", at: [2474, 2396], dx: 0, dy: 0,
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
