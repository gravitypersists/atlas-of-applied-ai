# Backbone coverage TODO

Working list from the coverage review of 2026-10-10. It checks the backbone against what a practicing AI engineer meets in 2025–26. Items are grouped by the order to tackle them. Each one ends in either a `backbone.yaml` edit (then `validate.py`, `make_guides.py`, `node map/build.mjs`) or a `LEADS` entry in `make_guides.py` for the next deep-research run. Tick items off here as they land, and note the commit.

The review's main finding: the 2022–24 applied core is dense, but the 2025–26 frontier is thin. Of roughly 200 nodes, about 10 are dated 2025 or later, and several of those are single-source niche items. Meanwhile, widely adopted shifts have no node at all.

## 1. Embodied AI and World Models: new region (before survey acceptance)

Adding a region after acceptance means settling around permanent borders, so this one goes first.

- [x] Region `embodied-ai-and-world-models` ("The Clockwork Marches") in `backbone.yaml`, with `node_target: "10–18"`, smaller than the default 15–30
- [x] Boundary rules: physical vs. digital agents, world models vs. video generation, robot policy training
- [x] 8 seed anchors, arXiv ids checked against the arXiv API: sim-to-real transfer, latent world models, LLM task planning for robots, diffusion policy, action chunking, VLAs, cross-embodiment training, interactive world models
- [x] `make_guides.py` reads an optional region `node_target`; guide generated at `deep-dives/embodied-ai-and-world-models.md`
- [x] Map: seeds hand-laid in the ledger south of the Painted Isles (the automatic settle scattered them, e.g. pulling diffusion policy into the Painted Isles); a 12th applied color added to `build.mjs`
- [x] Run the guide through deep research
- [x] Merge the report per `MERGING.md`: nodes, then a resources pass, then summaries; region `overview` and `learning_path`. Added human video pretraining, flow-matching action heads, generative sim-to-real, dual-system VLAs (not in the report; from its practitioner section) and RL fine-tuning of VLAs; Spatial Reasoning VLMs homed in Multimodal under a new boundary rule; Code as Policies folded into `llm-robot-planning`. 53 resources and a 6-item learning path from a background pass, spot-checked.
- [x] Decide: add a **Robotics and Control** root to the Old World? Yes: `robotics-and-control` with behavior cloning, DAgger (replacing `external:dagger` under on-policy distillation) and physics simulation, hand-placed south of Reinforcement Learning. MPC and classical control left out until something applied descends from them.
- [x] Decide the terrain style: archipelago (like the Painted Isles) or let it join land as nodes mature. It's 5 islands now because no in-region edge links two maturity ≥ 3 nodes. My answer: archipelago, but like a long linear island, sort of like Crete in Greece. Done with a curated west–east spine in `curation.yaml`; landmarks laid along it by date, title pinned offshore to the south.
- [ ] Re-check the title "The Clockwork Marches" once the region has content (now has 13 landmarks; still fits, your call)

## 2. Agent security and protocols (cheap; clearly mature by 2025)

- [x] Agent-to-agent protocols (A2A, 2025-04) in Agents, beside `model-context-protocol`: `agent-to-agent-protocols`, detail, m2 (settles as an offshore islet south of the Free Cities)
- [x] Tool poisoning / MCP supply-chain attacks in Safety, parents `indirect-prompt-injection` and `model-context-protocol`: `tool-poisoning`, detail, m3
- [x] Agent identity and delegated authorization (OAuth for agents, scoped credentials) in Safety, parent `least-privilege`: `agent-authorization`, core, m3, also parented on `agent-sandboxing`. It settles on the Bulwark's west margin; its label reads among the Tempering Grounds at local zoom, so consider nudging it during the curation pass.
- [x] Background / async agent delegation: already in `LEADS` (Product); land it or fold it into `coding-agents`: `background-agents`, core, m3, in Product; lead removed from `LEADS`

## 3. Governance deep dive and missing roots

- [x] Governance is one node (`model-documentation`). Candidates: regulatory compliance (EU AI Act, NIST AI RMF, ISO 42001), frontier safety frameworks and dangerous-capability evals, content provenance (C2PA; only text watermarking exists today), data licensing and copyright. Done as its own small region instead of a Safety re-run: `governance-and-compliance` ("The Chancery", `node_target: "8–14"`), with `model-documentation` moved in and 8 seeds (AI risk management, ISO/IEC 42001, EU AI Act, GPAI Code of Practice, dangerous-capability evals, frontier safety frameworks, content provenance, training-data licensing); refs opened and checked. Safety renamed to `safety-and-security` ("Safety and Security"). Four boundary rules added. Seeds hand-laid in the ledger as one island NE of the Bulwark; a 13th applied color in `build.mjs`.
- [x] Run `deep-dives/governance-and-compliance.md` through deep research and merge it per `MERGING.md` (summaries, overview, learning path, resources; dates and obligations move fast here). Merged: summaries for all anchors, region overview and 6-item learning path, 30 resources (all opened); two new detail nodes, `ai-bill-of-materials` and `ai-impact-assessment` (the report's FRIA, widened); ISO/IEC 42001 raised to m3. Kept the existing anchors' parents (the report dropped several and used invalid ids). The report's August 2026 OpenAI Astra training pause checked against OpenAI's own posts and noted on `frontier-safety-frameworks`.
- [ ] **Computer Vision** root: CLIP and VLMs hang directly off `transformer-architecture`; a ViT/CNN ancestor is missing
- [ ] Other missing ancestors, as root nodes or `external:`: virtual-memory paging (→ `paged-attention`), databases (→ text-to-SQL, caching), formal methods (→ verifiers, `llm-modulo`), statistics (calibration, A/B testing, `external:prediction-powered-inference`), scaling laws (→ `test-time-compute-scaling`)

## 4. Practitioner staples (core nodes)

Landed 2026-10-10: 16 nodes with summaries, arXiv refs checked against the arXiv API (GPTCache and LiteLLM refs opened), five boundary rules. No `resources` yet; they need the separate resources pass from `MERGING.md`. `text-to-sql`, `semantic-caching`, `hallucination-detection` and `image-personalization` were hand-placed in the ledger (their parents' centroid fell in other regions), and `continued-pretraining`, `data-poisoning` and `instruction-image-editing` were nudged so their labels show at z1. Titles of the Engine Works and the Watchtowers pinned at their old spots.

- [x] Text-to-SQL / structured-data QA (Retrieval): `text-to-sql`, core, m3, parents RAG, open-domain QA, few-shot prompting and `external:semantic-parsing`
- [x] Hallucination detection and mitigation: grounding checks, semantic entropy, uncertainty estimation (Evaluation): `hallucination-detection`, core, m3; mitigation stays with RAG and citation UX (new boundary rule)
- [x] Semantic caching (Inference): `semantic-caching`, core, m3
- [x] LLM gateways: fallback, rate limits, cost budgets (Inference; currently only `model-routing`): `llm-gateways`, core, m4, child of `model-routing`
- [x] Long-context extension: RoPE scaling, YaRN (Inference or DL-NLP root): `rotary-position-embeddings` in the root (m5), `context-window-extension` in Inference (m4, `also` DL-NLP and Adaptation)
- [x] Tokenization as a practical concern: cost, token counting (DL-NLP root): `subword-tokenization` (BPE, m5); the summary carries the cost and counting angle
- [x] Embedding practice: Matryoshka / binary embeddings, domain fine-tuning of embedders (Retrieval): `embedding-compression` and `embedding-fine-tuning`, both detail, m3
- [x] Continued / domain-adaptive pretraining (Adaptation): `continued-pretraining`, core, m4
- [x] Image personalization and editing: DreamBooth/LoRA for diffusion, instruction-based editing (Multimodal): `image-personalization` and `instruction-image-editing`, core, m4
- [x] Serving parallelism: tensor, pipeline and expert parallelism (Inference): `model-parallelism`, core, m4
- [x] Sycophancy; backdoors and data poisoning; bias and fairness evals (Safety / Evaluation): `sycophancy` and `data-poisoning` in Safety, `bias-and-fairness-evals` in Evaluation, all core, m3

## 5. 2025–26 frontier

Landed 2026-10-10: 7 nodes with summaries, arXiv ids checked against the arXiv API (Kiro and GitHub Spec Kit pages opened), four boundary rules. No `resources` yet; they need the separate resources pass from `MERGING.md`. `diffusion-language-models`, `agent-continual-learning` and `spec-driven-development` were hand-placed in the ledger (the automatic settle put them offshore near the Painted Isles and the Archival Reach).

- [x] Agentic / multi-turn RL: training agents in environments (Adaptation; `agent-trajectory-synthesis` covers only the environment side): `agentic-rl`, core, m3, `also` Agents, parents `rlvr`, `agent-trajectory-synthesis`, `grpo`
- [x] Reasoning budget control: budget forcing (s1), adaptive thinking effort, overthinking mitigation (Reasoning or Inference): `reasoning-budget-control` in Reasoning, core, m3, `also` Inference
- [x] Sleep-time compute / continual learning for agents (Agents or Adaptation): `agent-continual-learning` in Agents, detail, m2; weight-level continual learning goes to Adaptation (boundary rule)
- [x] Diffusion language models (Inference): `diffusion-language-models`, core, m2, `also` DL-NLP
- [x] Sparse attention (NSA, DSA) (DL-NLP root, `also` Inference): `sparse-attention`, m3, parent `external:sparse-transformers`
- [x] Unified multimodal generation: native image generation and editing in LLMs (Multimodal): `unified-multimodal-generation`, core, m3, dated to Chameleon (2024-05)
- [x] Spec-driven development (Agents): `spec-driven-development`, core, m2, parents `coding-agents` and `plan-preview`

## 6. Prune or re-justify niche nodes

Check against the guides' bar ("leave out research-only ideas that no practitioner would meet"):

- [ ] `context-aware-mcp` (m1, single paper)
- [ ] `static-context-scoring` (m1, single paper)
- [ ] `decision-models` (only ref is a vendor launch post)
