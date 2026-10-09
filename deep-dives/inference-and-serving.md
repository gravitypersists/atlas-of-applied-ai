# Deep dive: Inference and Serving

Backbone v0.2 · 12 anchors · 7 cross-region edges

## How to use
1. Paste everything between **Research prompt** and the horizontal rule into a deep-research run (Gemini, Claude Research, etc.).
2. Save the output and hand it to a Claude agent for merging: validate ids, enums, and date order with `validate.py`, then fold Section 3 amendments into `backbone.yaml` by hand.
3. Section 1 and the `reader_summary` / `further_reading` fields are the content for this region's panel on the map.

## Research prompt

I'm building a lineage graph of applied AI engineering that will be rendered as an interactive map. Each region of the map is a discipline; each node is a technique, pattern, or method; edges record what each node was built on. This run is a DEEP DIVE into one region: **Inference and Serving**. A backbone of stable ids already exists — attach everything you find to it.

## The region
Running models efficiently and cheaply — memory management, batching, quantization, decoding acceleration, caching, and routing between models.

Boundary with neighboring regions: Treats weights as fixed (vs. Adaptation) and works below the prompt/API layer (vs. Prompting). Decoding-time mechanisms like constrained decoding live here; the practices built on them live in Prompting.

Boundary rules (apply these exactly; if you disagree, say so in Amendments rather than breaking them):
- Prompt caching → inference-and-serving: KV reuse is an infrastructure optimization regardless of how APIs expose it.

## Perspective and scope
- Take the view of a practicing AI engineer building products and systems, not a model researcher.
- Cover the field through 2026. 2024–2026 work is easy to under-represent — look for it deliberately.
- A node is a technique, pattern, method, or discipline. Products, libraries, frameworks, benchmarks, and companies are NOT nodes; list them under `examples`.
- Target 25–45 nodes for this region in total, counting the existing anchors below.

## Existing anchors in this region (keep these ids; you may correct their fields)
- `autoregressive-decoding` — Autoregressive Decoding (maturity 5, 2018-06)
- `kv-cache` — KV Cache (maturity 5, 2019-11)
- `paged-attention` — PagedAttention (maturity 4, 2023-09)
- `continuous-batching` — Continuous Batching (maturity 4, 2022-07)
- `speculative-decoding` — Speculative Decoding (maturity 4, 2022-11)
- `weight-quantization` — Weight Quantization (maturity 4, 2022-08)
- `kv-cache-quantization` — KV Cache Quantization (maturity 3, 2024-02)
- `prompt-caching` — Prompt Caching (maturity 4, 2023-12)
- `constrained-decoding` — Constrained Decoding (maturity 4, 2022-01)
- `model-routing` — Model Routing and Cascades (maturity 3, 2023-05)
- `prefill-decode-disaggregation` — Prefill-Decode Disaggregation (maturity 3, 2024-01)
- `local-inference` — Local and On-Device Inference (maturity 4, 2023-03)

Nodes homed elsewhere that also touch this region:
- `mixture-of-experts` — Mixture of Experts (home: deep-learning-nlp)
- `decision-models` — Decision Models (home: agents-and-orchestration)
- `test-time-compute-scaling` — Test-Time Compute Scaling (home: planning-and-reasoning)
- `streaming-responses` — Streaming Responses (home: ai-product-and-interaction-design)

## Questions to answer
- The 2025–2026 serving stack (disaggregation, KV offload, multi-tier caching) and which techniques became defaults
- Cost/latency engineering from the application side — routing, cascades, caching APIs
- Local and on-device inference
- What are the major sub-areas of this region, and what is the lineage within each?
- Which techniques here were superseded, and by what?
- Where does this region draw on other regions, and where do other regions draw on it?

## Leads from earlier research runs to evaluate
For each: add it as a node, fold it into an existing anchor as an alias or example, or reject it with a reason.
- FlashAttention / FlashAttention-3 (IO-aware attention kernels) (arXiv:2205.14135; 2407.08608)
- Grouped-query attention (KV cache size vs. quality) (arXiv:2305.13245)
- Staged / asynchronous speculative decoding (arXiv:2308.04623)
- Mixture-of-Depths (dynamic per-token compute) (arXiv:2404.02258)
- RoPE and context-length extension (arXiv:2104.09864)

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
- agents-and-orchestration: mrkl-systems, tool-learning, function-calling, react-agent-loop, workflow-state-machines, model-context-protocol, agent-memory, multi-agent-systems, coding-agents, computer-use-agents, deep-research-agents, agent-skills, decision-models
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
- Autoregressive Decoding: Improving Language Understanding by Generative Pre-Training (Radford et al.)
- KV Cache: Fast Transformer Decoding: One Write-Head is All You Need (Shazeer) — arXiv:1911.02150
- PagedAttention: Efficient Memory Management for Large Language Model Serving with PagedAttention (Kwon et al.) — arXiv:2309.06180
- Continuous Batching: Orca: A Distributed Serving System for Transformer-Based Generative Models (Yu et al., OSDI 2022)
- Speculative Decoding: Fast Inference from Transformers via Speculative Decoding (Leviathan et al.) — arXiv:2211.17192
- Weight Quantization: LLM.int8(): 8-bit Matrix Multiplication for Transformers at Scale (Dettmers et al.) — arXiv:2208.07339
- KV Cache Quantization: KIVI: A Tuning-Free Asymmetric 2bit Quantization for KV Cache (Liu et al.) — arXiv:2402.02750
- Prompt Caching: SGLang: Efficient Execution of Structured Language Model Programs (Zheng et al.) — arXiv:2312.07104
- Constrained Decoding: Synchromesh: Reliable Code Generation from Pre-trained Language Models (Poesia et al.) — arXiv:2201.11227
- Model Routing and Cascades: FrugalGPT: How to Use Large Language Models While Reducing Cost and Improving Performance (Chen et al.) — arXiv:2305.05176
- Prefill-Decode Disaggregation: DistServe: Disaggregating Prefill and Decoding for Goodput-optimized LLM Serving (Zhong et al.) — arXiv:2401.09670
- Local and On-Device Inference: llama.cpp (Gerganov) — https://github.com/ggml-org/llama.cpp

## Reference: cross-region edges touching this region
- autoregressive-decoding --applies--> pretrained-language-models
- decision-models --extends--> model-routing
- decision-models --replaces--> constrained-decoding
- model-routing --applies--> mixture-of-experts
- streaming-responses --applies--> autoregressive-decoding
- structured-outputs --combines--> constrained-decoding
- weight-quantization --applies--> transformer-architecture
