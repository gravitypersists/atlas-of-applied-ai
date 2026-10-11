# Doodle style guide

Doodles are the small ink vignettes on the atlas: the engine house puffing tokens at Autoregressive Decoding, the serpent marked "Here be hallucinations". They make the map feel inhabited. This guide keeps new ones looking like they came from the same pen.

The drawings and their placement live in `map/public/doodles.js`. Line, fill and motion styles are in the `.doodle` section of `map/public/style.css`.

## What makes a good doodle

- **One idea, one glance.** A doodle shows the landmark's concept as a physical object or creature, not as a diagram. Autoregressive decoding becomes an engine house whose chimney puffs one token at a time. RAG becomes a stack of tomes with a magnifying glass still searching them.
- **A quiet joke beats a label.** The best doodles have a second look: a ladder someone has left against the Bulwark's wall (prompt injection), or a serpent of hallucinations in the open sea. Keep it gentle.
- **Fantasy-map vocabulary.** Towers, workshops, mills, bridges, ships, lighthouses, sea creatures, scrolls. Nothing modern: no computers, no robots, no brain icons, no logos.
- **Text is rare.** At most one short italic caption, and only for sea creatures and marginalia in the classic "here be" tradition.

## Drawing rules

- **Frame.** Draw in screen pixels, with the base line at `y = 0` and the drawing rising into negative `y`. Most doodles are 25–40 px wide and 25–40 px tall. The map keeps them at a constant size on screen, and shrinks them with the symbols on small screens.
- **Ink only.** Strokes are `--ink`, 1.1 px, with round caps and joins (the default for every `path` and `circle`). Use these classes for everything else:

  | class      | use                                                                                              |
  | ---------- | ------------------------------------------------------------------------------------------------ |
  | `solid`    | a closed shape filled with parchment, so it hides what is behind it (walls, books, sails, humps) |
  | `fill-ink` | small solid ink details: doors, eyes, stripes, spikes                                            |
  | `hatch`    | short soft lines for texture: bricks, planks, windows                                            |
  | `ground`   | a slightly uneven base line under things on land                                                 |
  | `water`    | little wave arcs and dashes under things at sea                                                  |
  | `wake`     | a dotted trail behind something moving                                                           |
  | `flag`     | a soft-ink pennant; it flutters                                                                  |
  | `caption`  | the one line of italic text                                                                      |

- **Colour.** The only colour on the map is the lighthouse's warm lamp and beam (`#f2d488`). Keep colour that rare: one small warm accent at most, and only where light is the point.
- **Draw from simple shapes.** Rectangles with crenellations, arches, bezier humps and a few hatch lines are enough. Detail below about 1.5 px disappears at world zoom, so leave it out.
- **Let the wobble do the hand-drawing.** Every doodle passes through the `doodle-wobble` filter, which roughens each line slightly. Draw clean, straight geometry; don't jitter the paths by hand.
- **Ground the doodle.** Things on land stand on a `ground` line, and things at sea sit on `water` strokes. A doodle must never float.

## Motion

- **Small and slow.** Motion should be noticed, not watched: a few pixels of travel, cycles of 4–6 s, ease-in-out.
- **Animate one part.** The smoke, the flag, the magnifier or the beam moves; the building stays still. Whole-doodle motion is only for things afloat (the ship rocks, the serpent bobs).
- **Not everything moves.** A map where everything moves is noise. As doodles are added, most should be still. Save motion for the ones where it is the joke (tokens puffing, a thought building up step by step).
- **Animate in the part's own box.** Give each animated part `transform-box: fill-box` and a `transform-origin` in percentages, so the motion stays put as the map pans and zooms.
- **Respect reduced motion.** Under `prefers-reduced-motion` all doodle animation stops. A part that is invisible at the start of its animation (puffs, thought steps) must be given a sensible resting state in that block.

## Placement

- **Pin and offset.** `at: "<landmark id>"` pins a doodle to a landmark; `at: [x, y]` pins it to a world point (sea creatures, ships, scenery). `dx, dy` then move it in screen pixels.
- **Give z0 doodles a box.** The build keeps region titles clear of every doodle shown at world zoom (one pinned to a capital or to a world point, without `minZoom`). It assumes the drawing spans `[-4, -32, 40, 6]` px around the pin plus offset, so a doodle that reaches further, or sits left of its origin, or has a caption, should give its own `box: [x0, y0, x1, y1]` in its drawing frame. Rebuild (`node map/build.mjs`) after adding or moving one.
- **Opposite the label.** A landmark doodle sits in the gap on the side away from its label (see `labelSide` in `map.json`), close enough to read as belonging to it.
- **Stay on the right surface.** A doodle on land stays on land and doesn't cross a coastline or a region title. A doodle at sea stays in open water.
- **Check every zoom level.** Look at world (z0), region (z1) and local (z2) zoom, and at a phone-sized width. If a doodle only fits once the map spreads out, give it `minZoom: 1` (or `2`) rather than squeezing it.
- **Visibility follows the landmark.** A doodle pinned to a town shows only when that town does. When a landmark is selected, its doodle and its relatives' doodles stay lit while the rest dim.

## Adding one

1. Pick the landmark or spot, and the idea. Check the area at all three zoom levels for free space first.
2. Add an entry to `window.DOODLES` in `map/public/doodles.js`, with a one-line comment saying what it is and where.
3. To judge the drawing, render it on a parchment sheet at 4×. At 1× the screenshots are too coarse to show the line work.
4. Place it, then check the map in a browser at desktop and phone widths (`python3 map/serve.py 8000`).

## Known limits

Placement is by hand and checked by eye. That works for a handful of doodles but not for one per landmark: each new node can settle a label into a doodle's gap. To cover every landmark, placement should move into the build (`map/labels.mjs`), with each doodle treated as one more box in the collision-free placement per zoom level. Drawing all of them would then work best as a set of 15–20 shared motifs with variations, plus one-off drawings for capitals.
