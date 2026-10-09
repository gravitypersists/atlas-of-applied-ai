# Deep dive: Multimodal

Backbone v0.2 · 9 anchors · 8 cross-region edges

## How to use
1. Paste everything between **Research prompt** and the horizontal rule into a deep-research run (Gemini, Claude Research, etc.).
2. Save the output and hand it to a Claude agent for merging: validate ids, enums, and date order with `validate.py`, then fold Section 3 amendments into `backbone.yaml` by hand.
3. Section 1 and the `reader_summary` / `further_reading` fields are the content for this region's panel on the map.

## Research prompt

I'm building a lineage graph of applied AI engineering that will be rendered as an interactive map. Each region of the map is a discipline; each node is a technique, pattern, or method; edges record what each node was built on. This run is a DEEP DIVE into one region: **Multimodal**. A backbone of stable ids already exists — attach everything you find to it.

## The region
Vision, speech, documents, and generated media as used in applications — vision-language models, realtime voice, document understanding, image and video generation.

Boundary with neighboring regions: Covers modality-specific engineering; general orchestration of multimodal agents lives in Agents.

Boundary rules (apply these exactly; if you disagree, say so in Amendments rather than breaking them):
- none specific to this region

## Perspective and scope
- Take the view of a practicing AI engineer building products and systems, not a model researcher.
- Cover the field through 2026. 2024–2026 work is easy to under-represent — look for it deliberately.
- A node is a technique, pattern, method, or discipline. Products, libraries, frameworks, benchmarks, and companies are NOT nodes; list them under `examples`.
- Target 25–45 nodes for this region in total, counting the existing anchors below.

## Existing anchors in this region (keep these ids; you may correct their fields)
- `contrastive-image-text-pretraining` — Contrastive Image-Text Pretraining (maturity 5, 2021-02)
- `vision-language-models` — Vision-Language Models (maturity 4, 2023-04)
- `document-understanding` — Document Understanding (maturity 3, 2021-11)
- `visual-document-retrieval` — Visual Document Retrieval (maturity 2, 2024-06)
- `speech-recognition` — Speech Recognition (maturity 5, 2022-12)
- `realtime-voice` — Realtime Voice Agents (maturity 3, 2024-05)
- `diffusion-models` — Diffusion Models (maturity 5, 2020-06)
- `text-to-image` — Text-to-Image Generation (maturity 4, 2021-12)
- `video-generation` — Video Generation (maturity 3, 2024-02)

Nodes homed elsewhere that also touch this region:
- `computer-use-agents` — Computer-Use Agents (home: agents-and-orchestration)

## Questions to answer
- Document understanding pipelines (VLM parsing vs. OCR) and visual retrieval
- Realtime voice agents — latency, turn-taking, interruption
- Video understanding and generation as application building blocks
- What are the major sub-areas of this region, and what is the lineage within each?
- Which techniques here were superseded, and by what?
- Where does this region draw on other regions, and where do other regions draw on it?

## Leads from earlier research runs to evaluate
For each: add it as a node, fold it into an existing anchor as an alias or example, or reject it with a reason.
- none

## Output

### Section 1: Region overview (for map readers)
200–300 words a curious engineer would read when they open this region on the map: what the region is, how it evolved, the 3–5 landmarks worth knowing, and where it's heading. Plain language, no hype.

### Section 2: Nodes
Return every node — existing anchors (with any corrections) and new ones — using exactly this structure:

id: <kebab-case; reuse backbone ids exactly>
name: <name>
aliases: <comma-separated>
region: <region id>
also: <secondary region ids, or none>
desc: <1–2 sentences, technical>
reader_summary: <2–3 plain-language sentences for map readers: what it is and why it matters>
parents:
  - id: <backbone id, new node id from this run, or external:<name> when the true ancestor isn't in the graph>
    rel: <extends | specializes | combines | applies | replaces | counters>
    why: <one sentence>
    src: <citation supporting the lineage claim>
    confidence: <high | medium | low>
maturity: <1–5> — <one-sentence justification>
date: <YYYY or YYYY-MM of origin>
ref: <originating paper or announcement, with arXiv id or URL>
further_reading: <2–4 sources for someone going deeper: one primary source, one survey or tutorial if available, one practitioner write-up>
examples: <products, libraries, systems>
status: <existing | new>

Relationship types (use only these):
- extends: adds capability to the parent
- specializes: a narrower variant of the parent
- combines: merges two or more parents (each listed separately)
- applies: uses the parent in a new domain or for a new purpose
- replaces: supersedes the parent for the same job
- counters: a defense or mitigation against the parent (added in v0.2 for attack/defense pairs)

Maturity tiers:
1 Research — primarily in papers; few or no production uses
2 Emerging — early adopters and prototypes; patterns unsettled
3 Maturing — real production use; best practices still forming
4 Established — widely used; well-understood tradeoffs
5 Foundational — assumed infrastructure; rarely discussed as new

Rules for parents:
- Prefer the TRUE ancestor over the nearest available node. If the real ancestor isn't in the backbone or this run, use `external:<name>` — do not force an edge.
- A node may not be older than its parents. Check dates.
- Cross-region edges are the most valuable part of the dataset. Record them whenever they're real.

### Section 3: Backbone amendments
Anchors that should be split, merged, renamed, re-homed, or re-dated, and any boundary rules that don't hold up — each with a reason.

### Section 4: Contested lineage and hype
Cases where origin or parentage is disputed (present both accounts), and areas with high attention but thin evidence of production value.

### Section 5: Self-check
Report honestly; this output will be verified mechanically afterward.
- every parent id is a backbone id (listed below), a node in this run, or `external:`
- every rel value is one of the six allowed
- no child is dated earlier than its parent
- no node is a product, library, framework, or benchmark
- 2024–2026 work is represented

Prefer primary sources (papers, official engineering blogs, specifications, repositories) over aggregators. Mark anything you could not verify. Do not invent citations.

## Backbone id index (all regions; use these ids for cross-region parents)
- information-retrieval: bm25, approximate-nearest-neighbor-search, open-domain-qa
- deep-learning-nlp: attention-mechanism, sequence-to-sequence-learning, transformer-architecture, pretrained-language-models, transfer-learning-fine-tuning, knowledge-distillation, mixture-of-experts, state-space-models
- symbolic-ai-planning: heuristic-search, strips-planning, pddl, expert-systems
- reinforcement-learning: markov-decision-process, policy-gradient-methods, ppo
- knowledge-representation: semantic-networks, knowledge-graphs
- human-computer-interaction: conversational-agents, direct-manipulation, mixed-initiative-interaction
- systems-security: least-privilege, sandboxing-and-isolation, injection-attacks
- software-engineering: statecharts, test-driven-development, distributed-tracing, language-server-protocol
- inference-and-serving: autoregressive-decoding, kv-cache, paged-attention, continuous-batching, speculative-decoding, weight-quantization, kv-cache-quantization, prompt-caching, constrained-decoding, model-routing, prefill-decode-disaggregation, local-inference
- prompting-and-context-engineering: zero-shot-prompting, few-shot-prompting, system-prompts, prompt-templating, prompt-chaining, structured-outputs, context-compaction, context-engineering, automatic-prompt-optimization, declarative-prompt-compilation
- retrieval-and-knowledge: text-embeddings, dense-retrieval, retrieval-augmented-generation, chunking-strategies, hybrid-search, cross-encoder-reranking, query-rewriting, contextual-retrieval, graph-rag, self-rag, corrective-rag, agentic-rag
- agents-and-orchestration: mrkl-systems, tool-learning, function-calling, react-agent-loop, workflow-state-machines, model-context-protocol, agent-memory, multi-agent-systems, coding-agents, computer-use-agents, deep-research-agents, agent-skills
- planning-and-reasoning: scratchpads, chain-of-thought, self-consistency, tree-of-thoughts, reflexion, process-reward-models, test-time-compute-scaling, reasoning-models, llm-plus-p, llm-modulo
- adaptation-and-post-training: supervised-fine-tuning, parameter-efficient-fine-tuning, low-rank-adaptation, rlhf, direct-preference-optimization, constitutional-ai, rlvr, grpo, llm-distillation
- data-and-synthetic-data: self-instruct, evol-instruct, synthetic-textbook-data, human-instruction-datasets, llm-annotation, data-deduplication, data-decontamination, data-quality-filtering
- evaluation-and-observability: capability-benchmarks, long-context-evals, agent-benchmarks, llm-as-a-judge, pairwise-preference-eval, rag-evaluation, eval-driven-development, llm-tracing, online-evaluation
- safety-security-and-governance: prompt-injection, indirect-prompt-injection, jailbreaks, red-teaming, guardrails, injection-defenses, agent-sandboxing, interpretability, sparse-autoencoders, representation-engineering, circuit-breakers, model-documentation
- ai-product-and-interaction-design: human-ai-interaction-guidelines, chat-interfaces, streaming-responses, copilots, citation-ux, human-in-the-loop-approval, generative-ui, canvas-artifacts
- multimodal-applied: contrastive-image-text-pretraining, vision-language-models, document-understanding, visual-document-retrieval, speech-recognition, realtime-voice, diffusion-models, text-to-image, video-generation

---

## Reference: seed sources for this region
Key references currently attached to the anchors (from the backbone runs; arXiv ids spot-checked, not exhaustively verified):
- Contrastive Image-Text Pretraining: Learning Transferable Visual Models From Natural Language Supervision (Radford et al.) — arXiv:2103.00020
- Vision-Language Models: Visual Instruction Tuning (Liu et al.) — arXiv:2304.08485
- Document Understanding: OCR-free Document Understanding Transformer (Kim et al.) — arXiv:2111.15664
- Visual Document Retrieval: ColPali: Efficient Document Retrieval with Vision Language Models (Faysse et al.) — arXiv:2407.01449
- Speech Recognition: Robust Speech Recognition via Large-Scale Weak Supervision (Radford et al.) — arXiv:2212.04356
- Realtime Voice Agents: Hello GPT-4o (OpenAI, May 2024)
- Diffusion Models: Denoising Diffusion Probabilistic Models (Ho et al.) — arXiv:2006.11239
- Text-to-Image Generation: High-Resolution Image Synthesis with Latent Diffusion Models (Rombach et al.) — arXiv:2112.10752
- Video Generation: Video generation models as world simulators (OpenAI, February 2024)

## Reference: cross-region edges touching this region
- computer-use-agents --combines--> vision-language-models
- contrastive-image-text-pretraining --applies--> transformer-architecture
- document-understanding --applies--> transformer-architecture
- realtime-voice --combines--> pretrained-language-models
- speech-recognition --applies--> sequence-to-sequence-learning
- video-generation --applies--> transformer-architecture
- vision-language-models --combines--> pretrained-language-models
- visual-document-retrieval --applies--> dense-retrieval
