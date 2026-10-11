# Doodle TODO

The doodles approved in the pruning pass, written up as a spec to build from. Follow `DOODLES.md` for each one: one idea at a glance, fantasy-map vocabulary, ink only, captions only at sea. Add each as an entry in `map/public/doodles.js` with a one-line comment, judge the drawing at 4× on parchment, then check it at z0/z1/z2 and at phone width.

Already on the map: engine house (Autoregressive Decoding), tomes (RAG), gatehouse with a ladder (Prompt Injection, moving in #11), thought chain (Chain-of-Thought), sea serpent "Here be hallucinations", ship (moved mid-channel), lighthouse (moved to the tip of the Peninsula of Long Thought).

"Opposite the label" means the side away from the landmark's `labelSide` in `map.json`. The sides noted below are from the first draft, so recheck them before placing.

## Decisions that apply across the list

- **Keep every drawing simple.** Two of the first ideas (the Transformer hall and the Perceptron loom) were cut for being too complex to read as doodles. Aim for 25–40 px and a handful of shapes, and when in doubt, draw less.
- **Style-guide exceptions.** `DOODLES.md` rules out robots and mocking people. The kraken (#15) is clockwork rather than a robot, which matches the Clockwork Isle. The spaghetti face (#16) must be a generic cartoon face with no likeness, and the escaping rowboats (#11) name nobody. None of these needs a change to the guide.
- **Motion budget.** 7 of the 19 new doodles move (#4, #5, #6, #8, #10, #11, #15), on top of the 7 already on the map that move. That's more than the guide's "most should be still." Keep every motion small and slow.

## The Old World

- [x] **1. The Monolith: Transformer** (`transformer-architecture`, place it above the label). A black square monument referencing the monolith from 2001: A Space Odyssey. _Still._

- [x] **3. Move 37: AlphaGo** (`alphago`, opposite the label; the draft had the label on the right). A Go board on a low stone table, drawn very simply: a few grid lines, one ink-filled stone and one hollow one, the filled one off on the shoulder where nobody would play, after Move 37 against Lee Sedol (2016). _Still._

- [x] **4. The Twin Furnaces: AlexNet** (`alexnet`). Two small furnaces side by side feeding one forge. AlexNet (2012) was split across two GTX 580 GPUs because it wouldn't fit on one. _Motion:_ a flicker of smoke from one chimney.

- [x] **5. Dartmouth, 1956** (`at: [x, y]` on the far western coast of the Old World). A summer camp of two or three tents and a campfire, for the workshop where "artificial intelligence" was named. Tiny caption as marginalia: _Summer of '56_. _Motion:_ a thread of campfire smoke.

- [x] **6. The Alembic: Knowledge Distillation** (`knowledge-distillation`). An alchemist's still: a big round flask over a fire, dripping into a much smaller flask. _Motion:_ one drip at a time.

- [x] **7. The Nobel Laurel: Hopfield and Boltzmann** (`hopfield-boltzmann-networks`, `minZoom: 1`). A small laurel wreath around a medallion hanging on a post, for Hopfield and Hinton's 2024 Nobel Prize in Physics. It shows only once the reader has zoomed in some. _Still._

## The New World

- [x] **8. The Beehive: Multi-Agent Systems** (`multi-agent-systems`). A straw skep with a few bees around it, busy and orderly. _Motion:_ two bees circle.

- [x] **9. The Parrot: Few-Shot Prompting** (`few-shot-prompting`, on the Whispering Coast). A parrot on a perch, repeating whatever pattern it was shown. It replaces the ELIZA couch, keeping only the parrot. _Still._

- [x] **10. The Self-Writing Quill: Coding Agents** (`coding-agents`). A writing desk with a quill moving on its own and a long scroll spilling off the desk onto the ground. _Motion:_ the quill nibs back and forth.

- [x] **11. The Escaped Rowboats: Agent Sandboxing** (`agent-sandboxing`, in the Bulwark). This one moves a landmark and an existing doodle.
  - **Move the landmark.** Move `agent-sandboxing` in `map/atlas/ledger.yaml` to the southern coast of the Bulwark, near its border with the Free Cities (it is now at about [3123, 1103]). This is allowed only while the survey is a draft (`world.accepted: false`). Rebuild with `node map/build.mjs` and run `map/acceptance_test.py`, then check that the landmark is still on Bulwark land, sits on the coast, and that no labels collide.
  - **Move the gatehouse.** Re-pin the existing `gatehouse` doodle from `prompt-injection` to `agent-sandboxing` and redo its offset. Keep the ladder, which now reads as an escape route. Prompt Injection is left without a doodle.
  - **Add the rowboats.** Two or three tiny unmanned rowboats in the water below the gatehouse, heading out to sea with a short `wake` behind them. This is the July 2026 incident in which about 700 agents escaped an evaluation sandbox and broke into another lab's infrastructure. The comment in `doodles.js` can say so, but the drawing names nobody.
  - _Motion:_ every so often (a long cycle, so it reads as rare) a small shape slips out of the gate and down toward the water. Give it a resting state for reduced motion in which it is hidden.

- [x] **12. The Airship Mast: Model Context Protocol** (`model-context-protocol`, opposite the label; the draft had the label on the left). A mooring mast with two or three very differently shaped airships all tethered to it the same way, for the "one plug for everything" idea. It is the airport idea in the map's own vocabulary, since modern things like planes are ruled out. Keep the airships small, simple outlines, so the whole doodle fits in the usual frame. _Still._

- [x] **13. The Strawberry Patch: Reasoning Models** (`reasoning-models`, on the Peninsula of Long Thought). A small patch of strawberry plants, after o1's codename "Strawberry". _Still._

- [x] **14. The Ouroboros: Synthetic Data and Model Collapse** (`self-instruct` or `data-flywheel` in the Quarries; use whichever has more free space opposite its label). Just a serpent swallowing its own tail, for models trained on their own outputs, with no quarry stone. _Still._

- [x] **15. The Clockwork Kraken** (`at: [4620, 2250]`, the far eastern sea beyond the Clockwork Isle). Segmented brass tentacles rising out of the water, jointed like armour with rivets at each joint, for the fear of AI weapons and robots at war at the edge of the known world. Caption: _Here be automata._ _Motion:_ the tentacles sway and flail very subtly with the waves. (note, it's okay for this to break the rule of no robots, it is an exception)

- [x] **16. The Spaghetti Face: Video Generation** (`video-generation`, in the Painted Isles; the draft had the label above, so place it below). A simple generic face with spaghetti noodles, for the 2023 "Will Smith eating spaghetti" clip that became the benchmark for video generation. Keep it very simple. _Still._

- [x] **17. The Crossroads Signpost: Decision Models** (`decision-models`, opposite the label; the draft had the label on the right). A plain crossroads signpost, without the scales or bunting from the first draft. _Still._

- [x] **18. The Paperclip Hoard** (`at: [4500, 750]`, a lonely islet near the Chancery). A small islet heaped with paperclips, with one more being added, for Bostrom's maximizer. Caption: _Here be paperclips._ _Still._ Confirm that the spot is open sea and give the islet its own `water` strokes, since it isn't real terrain.

- [x] **19. The Pirates: Indirect Prompt Injection** (`at: [x, y]` in the open water nearest `indirect-prompt-injection`, a Bulwark capital at about [3215, 1103] with its label on the right; pick the closest stretch of sea that keeps the doodle clear of the coast and the label at z0–z2). A small pirate ship flag off the coast

- [x] **20. The Summit Flags: Capability Benchmarks** (`capability-benchmarks`, a Watchtowers capital at about [3653, 1270] with its label on the right, so place it on the left). A large mountain, about twice the usual doodle size (roughly 60–80 px wide), with a cluster of little flags crowded on its summit where every climber has already made it to the top. Keep the drawing simple. Because of its size it needs the most free space of any doodle. Check z0 first, and if it only fits once the map spreads out, give it `minZoom: 1`. It is a capital, so it must not cover the region title or a neighbouring label. _Still._
