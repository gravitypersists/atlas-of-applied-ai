# Deep dive: Agents and Orchestration

Backbone v0.2 · 12 anchors · 17 cross-region edges

## How to use
1. Paste everything between **Research prompt** and the horizontal rule into a deep-research run (Gemini, Claude Research, etc.).
2. Save the output and hand it to a Claude agent for merging: validate ids, enums, and date order with `validate.py`, then fold Section 3 amendments into `backbone.yaml` by hand.
3. Section 1 and the `reader_summary` / `further_reading` fields are the content for this region's panel on the map.

## Research prompt

I'm building a lineage graph of applied AI engineering that will be rendered as an interactive map. Each region of the map is a discipline; each node is a technique, pattern, or method; edges record what each node was built on. This run is a DEEP DIVE into one region: **Agents and Orchestration**. A backbone of stable ids already exists — attach everything you find to it.

## The region
Models acting in environments — tool use, agent loops, workflows vs. autonomous agents, multi-agent systems, memory, protocols, and coding, computer-use, and research agents.

Boundary with neighboring regions: Changes environment state or runs multi-step control flow (vs. Retrieval, which reads). Reasoning techniques that don't act live in Planning and Reasoning.

Boundary rules (apply these exactly; if you disagree, say so in Amendments rather than breaking them):
- ReAct → agents-and-orchestration: Defined by acting in an environment via tools → Agents.
- Agentic RAG / deep research → retrieval-and-knowledge (agentic RAG); agents-and-orchestration (deep research agents): Information goal over a corpus → Retrieval. Open-ended, multi-source research as a product capability → Agents.
- Agent memory → agents-and-orchestration: Memory that persists across agent sessions → Agents, even when implemented with retrieval.
- Function calling → agents-and-orchestration: The primitive for requesting external execution → Agents.
- MCP / Agent skills → agents-and-orchestration: Protocols and packaging for capabilities agents use → Agents.

## Perspective and scope
- Take the view of a practicing AI engineer building products and systems, not a model researcher.
- Cover the field through 2026. 2024–2026 work is easy to under-represent — look for it deliberately.
- A node is a technique, pattern, method, or discipline. Products, libraries, frameworks, benchmarks, and companies are NOT nodes; list them under `examples`.
- Target 25–45 nodes for this region in total, counting the existing anchors below.

## Existing anchors in this region (keep these ids; you may correct their fields)
- `mrkl-systems` — MRKL Systems (maturity 4, 2022-05)
- `tool-learning` — Tool Learning (maturity 4, 2023-02)
- `function-calling` — Function Calling (maturity 5, 2023-06)
- `react-agent-loop` — ReAct Agent Loop (maturity 4, 2022-10)
- `workflow-state-machines` — Workflow Graphs and State Machines (maturity 4, 2024-01)
- `model-context-protocol` — Model Context Protocol (maturity 4, 2024-11)
- `agent-memory` — Agent Memory (maturity 3, 2023-10)
- `multi-agent-systems` — Multi-Agent Systems (maturity 3, 2023-08)
- `coding-agents` — Coding Agents (maturity 4, 2024-05)
- `computer-use-agents` — Computer-Use Agents (maturity 2, 2024-10)
- `deep-research-agents` — Deep Research Agents (maturity 3, 2024-12)
- `agent-skills` — Agent Skills (maturity 2, 2025-10)

Nodes homed elsewhere that also touch this region:
- `model-routing` — Model Routing and Cascades (home: inference-and-serving)
- `prompt-chaining` — Prompt Chaining (home: prompting-and-context-engineering)
- `context-engineering` — Context Engineering (home: prompting-and-context-engineering)
- `agentic-rag` — Agentic RAG (home: retrieval-and-knowledge)
- `tree-of-thoughts` — Tree Search over Reasoning (home: planning-and-reasoning)
- `reflexion` — Self-Reflection (home: planning-and-reasoning)
- `agent-benchmarks` — Agent Benchmarks (home: evaluation-and-observability)
- `indirect-prompt-injection` — Indirect Prompt Injection (home: safety-security-and-governance)
- `agent-sandboxing` — Agent Sandboxing and Permissions (home: safety-security-and-governance)
- `human-in-the-loop-approval` — Human-in-the-Loop Approval (home: ai-product-and-interaction-design)

## Questions to answer
- Tool-use lineage from MRKL and Toolformer through function calling to MCP and skills
- Agent harness design (loops, subagents, memory, long-horizon task management)
- Where production systems sit on the workflow-to-autonomy spectrum in 2026
- What are the major sub-areas of this region, and what is the lineage within each?
- Which techniques here were superseded, and by what?
- Where does this region draw on other regions, and where do other regions draw on it?

## Leads from earlier research runs to evaluate
For each: add it as a node, fold it into an existing anchor as an alias or example, or reject it with a reason.
- Semantic routing (embedding-based intent routing to sub-agents)
- Language Agent Tree Search (LATS) (arXiv:2310.04406)
- Context-Aware MCP / shared-context-store MCP variants (claimed 2026 paper — verify it exists)

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
- MRKL Systems: MRKL Systems: A modular, neuro-symbolic architecture that combines large language models, external knowledge sources and discrete reasoning (Karpas et al.) — arXiv:2205.00445
- Tool Learning: Toolformer: Language Models Can Teach Themselves to Use Tools (Schick et al.) — arXiv:2302.04761
- Function Calling: Function calling and other API updates (OpenAI, June 2023)
- ReAct Agent Loop: ReAct: Synergizing Reasoning and Acting in Language Models (Yao et al.) — arXiv:2210.03629
- Workflow Graphs and State Machines: Building effective agents (Anthropic, December 2024) — https://www.anthropic.com/engineering/building-effective-agents
- Model Context Protocol: Model Context Protocol specification — https://modelcontextprotocol.io
- Agent Memory: MemGPT: Towards LLMs as Operating Systems (Packer et al.) — arXiv:2310.08560
- Multi-Agent Systems: AutoGen: Enabling Next-Gen LLM Applications via Multi-Agent Conversation (Wu et al.) — arXiv:2308.08155
- Coding Agents: SWE-agent: Agent-Computer Interfaces Enable Automated Software Engineering (Yang et al.) — arXiv:2405.15793
- Computer-Use Agents: Introducing computer use (Anthropic, October 2024)
- Deep Research Agents: How we built our multi-agent research system (Anthropic) — https://www.anthropic.com/engineering/built-multi-agent-research-system
- Agent Skills: Equipping agents for the real world with Agent Skills (Anthropic) — https://www.anthropic.com/engineering/equipping-agents-for-the-real-world-with-agent-skills

## Reference: cross-region edges touching this region
- agent-memory --applies--> retrieval-augmented-generation
- agent-memory --combines--> context-compaction
- agent-sandboxing --counters--> function-calling
- agent-skills --applies--> context-engineering
- agentic-rag --combines--> react-agent-loop
- computer-use-agents --combines--> vision-language-models
- deep-research-agents --extends--> agentic-rag
- function-calling --combines--> structured-outputs
- human-in-the-loop-approval --applies--> function-calling
- model-context-protocol --applies--> language-server-protocol
- mrkl-systems --applies--> expert-systems
- mrkl-systems --combines--> pretrained-language-models
- react-agent-loop --combines--> chain-of-thought
- reflexion --extends--> react-agent-loop
- tool-learning --applies--> few-shot-prompting
- workflow-state-machines --applies--> statecharts
- workflow-state-machines --extends--> prompt-chaining
