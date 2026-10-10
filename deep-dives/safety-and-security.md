# Deep dive: Safety and Security

Backbone v0.2 · 17 anchors · 18 cross-region edges

## How to use
1. Paste everything between **Research prompt** and the horizontal rule into a deep-research run (Gemini, Claude Research, etc.).
2. Save the output and hand it to a Claude agent for merging: validate ids, enums, and date order with `validate.py`, then fold Section 3 amendments into `backbone.yaml` by hand.
3. Section 1 (overview and learning path) and each node's `summary` and `resources` are the content for the map's side panel. `layer: detail` nodes appear only when zoomed in.

## Research prompt

I'm building a lineage graph of applied AI engineering that will be rendered as an interactive map. Each region of the map is a discipline; each node is a technique, pattern, or method; edges record what each node was built on. This run is a DEEP DIVE into one region: **Safety and Security**. A backbone of stable ids already exists — attach everything you find to it.

## The region
Keeping AI systems from causing harm — prompt injection and jailbreaks, guardrails and defenses, red teaming, sandboxing and permissions, and interpretability as a control tool.

Boundary with neighboring regions: Primary purpose is risk reduction. Uses techniques from Prompting (guardrails) and Evaluation (red teaming) but is defined by intent. Policies, regulation, standards and documentation that govern AI systems live in Governance.

Boundary rules (apply these exactly; if you disagree, say so in Amendments rather than breaking them):
- Guardrails / injection defenses → safety-and-security: Components whose purpose is blocking harm → Safety.
- Agent sandboxing and permissions → safety-and-security: Mechanisms whose purpose is limiting blast radius → Safety (moved from Agents in v0.2).
- Interpretability / RepE → safety-and-security: Used by engineers to detect and steer behavior → Safety (pure science stays offshore at maturity 1).

## Perspective and scope
- Take the view of a practicing AI engineer building products and systems, not a model researcher.
- Cover the field through 2026. 2024–2026 work is easy to under-represent — look for it deliberately.
- A node is a technique, pattern, method, or discipline. Products, libraries, frameworks, benchmarks, and companies are NOT nodes; list them under `examples`.
- Target 15–30 nodes for this region in total, counting the existing anchors below. Quality over count: leave out research-only ideas that no practitioner would meet unless they're real ancestors of something that matters.
- Before adding a node, check the backbone index at the end (ids, names, and aliases across ALL regions). If the concept already exists anywhere, even in another region or under an alias, attach to that id (correct it, or add an alias or example). Never re-create it under a new id.

## Existing anchors in this region (keep these ids; you may correct their fields)
- `prompt-injection` — Prompt Injection (maturity 4, 2022-09)
- `indirect-prompt-injection` — Indirect Prompt Injection (maturity 4, 2023-02)
- `jailbreaks` — Jailbreaks (maturity 4, 2023-07)
- `red-teaming` — AI Red Teaming (maturity 4, 2022-02)
- `guardrails` — Guardrails and Safety Classifiers (maturity 4, 2023-12)
- `injection-defenses` — Prompt Injection Defenses (maturity 3, 2024-04)
- `agent-sandboxing` — Agent Sandboxing and Permissions (maturity 4, 2023)
- `interpretability` — Mechanistic Interpretability (maturity 1, 2021-12)
- `sparse-autoencoders` — Sparse Autoencoders (maturity 2, 2023-10)
- `representation-engineering` — Representation Engineering (maturity 2, 2023-10)
- `circuit-breakers` — Circuit Breakers (maturity 1, 2024-06)
- `automated-jailbreak-generation` — Automated Jailbreak Generation (maturity 3, 2023-10)
- `spotlighting` — Spotlighting (maturity 3, 2024-03)
- `dual-llm-pattern` — Dual LLM Pattern (maturity 2, 2023-04)
- `machine-unlearning` — Machine Unlearning (maturity 1, 2023-10)
- `agent-authorization` — Agent Identity and Delegated Authorization (maturity 3, 2025-03)
- `tool-poisoning` — Tool Poisoning (maturity 3, 2025-04)

Nodes homed elsewhere that also touch this region:
- `cot-monitoring` — CoT Monitoring (home: planning-and-reasoning)
- `constitutional-ai` — Constitutional AI and RLAIF (home: adaptation-and-post-training)
- `pii-redaction` — PII Redaction (home: data-and-synthetic-data)
- `dangerous-capability-evals` — Dangerous Capability Evaluations (home: governance-and-compliance)
- `frontier-safety-frameworks` — Frontier Safety Frameworks (home: governance-and-compliance)
- `ai-bill-of-materials` — AI Bill of Materials (home: governance-and-compliance)

## Questions to answer
- Prompt injection in agentic systems — attack taxonomy and the defenses that hold up
- Agent permissions, sandboxing, and least privilege for tools and MCP servers
- Interpretability methods that have reached engineering use
- What are the major sub-areas of this region, and what is the lineage within each?
- Which techniques here were superseded, and by what?
- Where does this region draw on other regions, and where do other regions draw on it?

## Leads from earlier research runs to evaluate
For each: add it as a node, fold it into an existing anchor as an alias or example, or reject it with a reason.
- none

## Output

The learning path (Section 1) and the nodes (Section 2) are parsed by a script. Put each in ONE fenced ```yaml block, exactly in the shapes below, with nothing else inside the block. Prose goes outside the blocks.

### Section 1: Region overview (for map readers)
200–300 words a curious engineer would read when they open this region on the map: what the region is, how it evolved, the 3–5 landmarks worth knowing, and where it's heading. Plain language, no hype.

Then a learning path: 4–6 resources in the order a newcomer should take them. Mix primary papers, a survey or tutorial, practitioner write-ups, and recorded talks.

```yaml
learning_path:
  - {kind: <paper | talk | blog | docs | tutorial | code>, title: "<title>", by: "<author or org>", year: <YYYY>, url: "<url>", why: "<one sentence: what the reader gets from it>"}
```

### Section 2: Nodes
Return every node — existing anchors (with any corrections) and new ones — as one YAML list:

```yaml
nodes:
  - id: <kebab-case; reuse backbone ids exactly>
    name: <name>
    aliases: [<alias>, ...]
    region: <region id>
    also: [<secondary REGION ids only, never node ids>]
    layer: <core | detail>
    desc: <1–2 sentences, technical>
    summary: <2–3 plain-language sentences for map readers: what it is and why it matters>
    parents:
      - {id: <backbone id, new node id from this run, or external:<name>>, rel: <relationship type>, why: "<one sentence>", src: "<citation supporting the lineage claim>", confidence: <high | medium | low>}
    maturity: <1–5>
    maturity_note: <one-sentence justification>
    date: "<YYYY or YYYY-MM of origin>"
    ref: {title: "<originating paper or announcement>", arxiv: "<id>"}   # or url: "<url>" when there's no arXiv id
    resources:
      - {kind: <paper | talk | blog | docs | tutorial | code>, title: "<title>", by: "<author or org>", year: <YYYY>, url: "<url>"}
    examples: [<products, libraries, systems>]
    status: <existing | new>
```

Field rules:
- `layer`: `core` if a newcomer needs this node on the region's overview map; `detail` if it's finer-grained knowledge that only shows when zoomed in. Existing anchors are `core` unless you argue otherwise in Amendments. Expect most new nodes to be `detail`.
- `also`: allowed values are information-retrieval, deep-learning-nlp, symbolic-ai-planning, reinforcement-learning, knowledge-representation, human-computer-interaction, systems-security, software-engineering, robotics-and-control, inference-and-serving, prompting-and-context-engineering, retrieval-and-knowledge, agents-and-orchestration, planning-and-reasoning, adaptation-and-post-training, data-and-synthetic-data, evaluation-and-observability, safety-and-security, ai-product-and-interaction-design, multimodal-applied, embodied-ai-and-world-models, governance-and-compliance.
- `src` is required on every parent edge. If you can't cite the lineage claim, lower `confidence` and say why in `why`; don't leave `src` empty.
- `resources` are what the map's side panel shows under "Learn more", so they're the most reader-facing part of the output. Give 2–5 per node, each with a URL you actually opened. Aim for one primary source (paper, spec, or announcement), one practitioner write-up (an engineering blog or a well-known practitioner's post), and, where one exists, one recorded talk (conference talk, YouTube lecture, or podcast episode). Prefer docs or cookbook pages that show the technique in use. Don't repeat `ref` here.
- Never invent a URL. If you couldn't open it, append ` [unverified]` to the title. If nothing good exists for a kind, leave it out.

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
- every parent edge has a non-empty `src`
- no new node duplicates an existing backbone node (check names and aliases, not just ids)
- every `also` value is a region id
- every resource URL was opened, or is marked [unverified]
- every rel value is one of the six allowed
- no child is dated earlier than its parent
- no node is a product, library, framework, or benchmark
- 2024–2026 work is represented

Prefer primary sources (papers, official engineering blogs, specifications, repositories) over aggregators. Mark anything you could not verify. Do not invent citations.

## Backbone index (all regions: id, then name and aliases; use these ids for cross-region parents)
- information-retrieval: bm25 (BM25; Okapi BM25; sparse retrieval; TF-IDF ranking), approximate-nearest-neighbor-search (Approximate Nearest Neighbor Search; ANN; HNSW; vector indexing), open-domain-qa (Open-Domain Question Answering; retriever-reader QA; DrQA)
- deep-learning-nlp: attention-mechanism (Attention Mechanism; neural attention), sequence-to-sequence-learning (Sequence-to-Sequence Learning; seq2seq; encoder-decoder), transformer-architecture (Transformer; transformers), pretrained-language-models (Pretrained Language Models; LLMs; foundation models; generative pretraining), transfer-learning-fine-tuning (Transfer Learning and Fine-Tuning; fine-tuning; ULMFiT), knowledge-distillation (Knowledge Distillation; teacher-student training), mixture-of-experts (Mixture of Experts; MoE; sparse MoE), state-space-models (State-Space Models; SSMs; S4; Mamba; linear-time sequence models)
- symbolic-ai-planning: heuristic-search (Heuristic Search; A*; best-first search; state-space search), strips-planning (STRIPS Planning; classical planning), pddl (PDDL; Planning Domain Definition Language), expert-systems (Expert Systems; rule-based systems; production systems)
- reinforcement-learning: markov-decision-process (Markov Decision Process; MDP), policy-gradient-methods (Policy Gradient Methods; REINFORCE; actor-critic), ppo (Proximal Policy Optimization; PPO)
- knowledge-representation: semantic-networks (Semantic Networks; ontologies; frames), knowledge-graphs (Knowledge Graphs; property graphs)
- human-computer-interaction: conversational-agents (Conversational Agents; chatbots; dialogue systems), direct-manipulation (Direct Manipulation; WYSIWYG), mixed-initiative-interaction (Mixed-Initiative Interaction; human-AI collaboration; intelligent assistance)
- systems-security: least-privilege (Least Privilege; principle of least authority), sandboxing-and-isolation (Sandboxing and Isolation; containerization; secure execution), injection-attacks (Injection Attacks; SQL injection; code injection)
- software-engineering: statecharts (Statecharts and State Machines; finite-state machines; workflow engines), test-driven-development (Test-Driven Development; TDD; regression testing), distributed-tracing (Distributed Tracing; spans; Dapper), language-server-protocol (Language Server Protocol; LSP)
- robotics-and-control: behavior-cloning (Behavior Cloning; imitation learning; learning from demonstration; ALVINN), dagger (DAgger; dataset aggregation; interactive imitation learning; on-policy imitation), physics-simulation (Physics Simulation for Robotics; robot simulators; MuJoCo; rigid-body simulation)
- inference-and-serving: autoregressive-decoding (Autoregressive Decoding; next-token generation; sampling), kv-cache (KV Cache; key-value cache; incremental decoding), paged-attention (PagedAttention; paged KV cache), continuous-batching (Continuous Batching; in-flight batching; iteration-level scheduling), speculative-decoding (Speculative Decoding; assisted generation; draft-and-verify), weight-quantization (Weight Quantization; INT8; INT4; FP8; GPTQ; AWQ), kv-cache-quantization (KV Cache Quantization; KIVI; compressed KV cache), prompt-caching (Prompt Caching; prefix caching; RadixAttention), constrained-decoding (Constrained Decoding; grammar-constrained generation; guided decoding; JSON mode; grammar automata), model-routing (Model Routing and Cascades; LLM routing; FrugalGPT; model cascades), prefill-decode-disaggregation (Prefill-Decode Disaggregation; disaggregated serving; split-level inference), local-inference (Local and On-Device Inference; llama.cpp; edge inference; on-device models), llm-watermarking (LLM Watermarking; text watermarking; green-list watermarking), io-aware-attention (FlashAttention; IO-aware attention; FlashAttention-2; FlashAttention-3; fused attention kernels; FlashInfer), grouped-query-attention (Grouped-Query Attention; GQA; multi-query attention; MQA), multi-head-latent-attention (Multi-Head Latent Attention; MLA; DeepSeek MLA), chunked-prefill (Chunked Prefill; Sarathi; stall-free batching; piggybacked decodes), kv-cache-offloading (KV Cache Offloading; tiered KV cache; KV cache pool; KV-centric serving), multi-lora-serving (Multi-LoRA Serving; S-LoRA; Punica; adapter serving), draft-heads (Speculative Draft Heads; EAGLE; Medusa; self-speculative decoding; draft trees), microscaling-formats (Microscaling Formats; MXFP4; NVFP4; FP4; block-scaled quantization)
- prompting-and-context-engineering: zero-shot-prompting (Zero-Shot Prompting; direct prompting; instruction prompting), few-shot-prompting (Few-Shot Prompting; in-context learning; ICL), system-prompts (System Prompts; system messages; custom instructions; developer messages), prompt-templating (Prompt Templating; prompt templates), prompt-chaining (Prompt Chaining; LLM chains; pipelines of prompts; AI chains), structured-outputs (Structured Outputs; JSON outputs; schema-constrained outputs), context-compaction (Context Compaction; prompt compression; summarization of history), context-engineering (Context Engineering; context management), automatic-prompt-optimization (Automatic Prompt Optimization; APO; APE; prompt search), declarative-prompt-compilation (Declarative Prompt Compilation; DSPy; LM programs), zero-shot-cot (Zero-Shot Chain-of-Thought; zero-shot CoT; Let's think step by step), dynamic-few-shot-selection (Dynamic Few-Shot Selection; example selection; prompt retrieval; kNN prompting; KATE), decomposed-prompting (Decomposed Prompting; DECOMP; task decomposition prompting), textual-gradients (Textual Gradients; TextGrad; textual gradient descent), context-ordering (Context Ordering; position engineering; context reordering; lost-in-the-middle mitigation), progressive-disclosure (Progressive Disclosure; just-in-time context; lazy-loaded context)
- retrieval-and-knowledge: text-embeddings (Text Embeddings; embedding models; sentence embeddings), dense-retrieval (Dense Retrieval; vector search; semantic search; DPR), retrieval-augmented-generation (Retrieval-Augmented Generation; RAG; naive RAG), chunking-strategies (Chunking Strategies; text splitting; semantic chunking), hybrid-search (Hybrid Search; sparse + dense retrieval; reciprocal rank fusion), cross-encoder-reranking (Cross-Encoder Reranking; rerankers; retrieve-and-rerank; multi-stage retrieval), query-rewriting (Query Rewriting and HyDE; query expansion; HyDE; Rewrite-Retrieve-Read), contextual-retrieval (Contextual Retrieval; contextual chunking), graph-rag (GraphRAG; knowledge-graph RAG), self-rag (Self-RAG; self-reflective RAG), corrective-rag (Corrective RAG; CRAG), agentic-rag (Agentic RAG; agentic search; iterative retrieval), parent-document-retrieval (Parent-Document Retrieval; small-to-big retrieval; ParentDocumentRetriever; sentence-window retrieval; auto-merging retrieval), late-interaction (Late Interaction; ColBERT; multi-vector retrieval; MaxSim), learned-sparse-retrieval (Learned Sparse Retrieval; SPLADE; neural sparse retrieval), propositional-chunking (Propositional Chunking; Dense X Retrieval; proposition indexing), late-chunking (Late Chunking; post-embedding chunking), active-retrieval (Active Retrieval; FLARE; forward-looking active retrieval), speculative-rag (Speculative RAG; draft-then-verify RAG), lightweight-graph-rag (Lightweight GraphRAG; LightRAG; LazyGraphRAG), long-context-routing (RAG vs. Long-Context Routing; Self-Route; Pre-Route)
- agents-and-orchestration: mrkl-systems (MRKL Systems; modular reasoning; neuro-symbolic routing), tool-learning (Tool Learning; Toolformer; self-taught tool use), function-calling (Function Calling; tool use; tool calling), react-agent-loop (ReAct Agent Loop; reason and act; agent loop), workflow-state-machines (Workflow Graphs and State Machines; graph-based agents; agent workflows), model-context-protocol (Model Context Protocol; MCP), agent-memory (Agent Memory; long-term memory; episodic memory; MemGPT; structured note-taking), multi-agent-systems (Multi-Agent Systems; orchestrator-worker; subagents; agent teams), coding-agents (Coding Agents; software engineering agents; SWE-agent), computer-use-agents (Computer-Use Agents; GUI agents; browser agents), deep-research-agents (Deep Research Agents; research agents), agent-skills (Agent Skills; skills; packaged procedures), decision-models (Decision Models; System One models; typed decision models; calibrated classifiers for agents), semantic-routing (Semantic Routing; embedding-based intent routing; Semantic Router), mcp-code-execution (Code Execution with MCP; Code Mode; tools as code APIs), long-running-agent-harness (Long-Running Agent Harnesses; multi-session agents; initializer agent pattern; progress files), context-aware-mcp (Context-Aware MCP; CA-MCP; shared context store), agent-to-agent-protocols (Agent-to-Agent Protocols; A2A; Agent2Agent; agent interoperability protocols; agent cards)
- planning-and-reasoning: scratchpads (Scratchpads; intermediate computation), chain-of-thought (Chain-of-Thought; CoT; step-by-step reasoning), self-consistency (Self-Consistency; majority voting; best-of-n), tree-of-thoughts (Tree Search over Reasoning; Tree of Thoughts; ToT; search-based decoding), reflexion (Self-Reflection; Reflexion; self-critique; self-refine; evaluator-optimizer), process-reward-models (Process Reward Models; PRMs; step-level verifiers; process supervision), test-time-compute-scaling (Test-Time Compute Scaling; inference-time scaling; search against verifiers), reasoning-models (Reasoning Models; thinking models; extended thinking; o1-class models), llm-plus-p (LLM+P; LLM-to-PDDL translation; LLM + classical planner), llm-modulo (LLM-Modulo; generate-test-critique; verifier-in-the-loop planning), program-aided-reasoning (Program-Aided Reasoning; PAL; Program of Thoughts; PoT; program-aided language models), reasoning-via-planning (Reasoning via Planning; RAP; MCTS over reasoning), graph-of-thoughts (Graph of Thoughts; GoT), step-back-prompting (Step-Back Prompting; abstraction prompting), language-agent-tree-search (Language Agent Tree Search; LATS), math-shepherd (Automatic Process Supervision; Math-Shepherd; Monte Carlo step labels), quiet-star (Quiet-STaR; learned internal rationales; think before speaking), latent-reasoning (Latent Reasoning; Coconut; Chain of Continuous Thought; continuous thought), cot-monitoring (CoT Monitoring; CoT faithfulness; chain-of-thought monitorability; reasoning trace monitoring)
- adaptation-and-post-training: supervised-fine-tuning (Supervised Fine-Tuning; SFT; instruction tuning), parameter-efficient-fine-tuning (Parameter-Efficient Fine-Tuning; PEFT; adapters), low-rank-adaptation (LoRA; low-rank adaptation; QLoRA), rlhf (RLHF; reinforcement learning from human feedback; reward modeling; InstructGPT pipeline; SFT-RM-PPO), direct-preference-optimization (Direct Preference Optimization; DPO; IPO; SimPO), constitutional-ai (Constitutional AI and RLAIF; RLAIF; AI feedback), rlvr (RL with Verifiable Rewards; RLVR), grpo (Group Relative Policy Optimization; GRPO), llm-distillation (LLM Distillation; reasoning distillation; distilled CoT; small language models; SLM), dora (DoRA; weight-decomposed low-rank adaptation), reft (Representation Fine-Tuning; ReFT; LoReFT), kto (Kahneman-Tversky Optimization; KTO), orpo (Odds Ratio Preference Optimization; ORPO), online-preference-optimization (Online Preference Optimization; online DPO; iterative DPO; OAIF), model-merging (Model Merging; task arithmetic; task vectors; model soups; TIES-Merging; SLERP merging), structured-pruning (Structured Pruning; LLM pruning; width and depth pruning; Minitron; Sheared LLaMA), on-policy-distillation (On-Policy Distillation; generalized knowledge distillation; GKD; MiniLLM)
- data-and-synthetic-data: self-instruct (Self-Instruct; synthetic instruction generation), evol-instruct (Evol-Instruct; instruction evolution), synthetic-textbook-data (Synthetic Pretraining Data; textbook-quality data; synthetic corpora), human-instruction-datasets (Crowdsourced Instruction Data; human-written demonstrations; OpenAssistant), llm-annotation (LLM-Assisted Annotation; LLM labeling; model-as-annotator), data-deduplication (Data Deduplication; near-duplicate removal; MinHash dedup), data-decontamination (Data Decontamination; test-set leakage prevention), data-quality-filtering (Data Quality Filtering; corpus curation; classifier-based filtering), golden-eval-sets (Golden and Eval Sets; golden datasets; eval datasets; test sets; reference sets), data-flywheel (Data Flywheel; production data loop; trace mining), synthetic-rag-data (Synthetic RAG Test Sets; RAG testset generation; synthetic question-answer pairs), instruction-backtranslation (Instruction Backtranslation; Humpback; self-alignment with backtranslation), instruction-data-selection (Instruction Data Selection; instruction-following difficulty; IFD; SFT data pruning), agent-trajectory-synthesis (Agent Trajectory Synthesis; agent RL environments; SWE-Gym; trajectory harvesting), pii-redaction (PII Redaction; PII scrubbing; data anonymization)
- evaluation-and-observability: capability-benchmarks (Capability Benchmarks; static benchmarks; MMLU-style evals), long-context-evals (Long-Context Evals; needle in a haystack; NIAH), agent-benchmarks (Agent Benchmarks; SWE-bench; environment-based evals), llm-as-a-judge (LLM-as-a-Judge; model-graded evals; autoevals), pairwise-preference-eval (Pairwise Preference Evaluation; arena evals; Elo leaderboards), rag-evaluation (RAG Evaluation; faithfulness and context-relevance metrics; RAGAS), eval-driven-development (Eval-Driven Development; EDD; offline evals; prompt regression testing; assertion-based testing), llm-tracing (LLM Tracing; LLM observability; agent traces; OpenTelemetry GenAI conventions; gen_ai spans), online-evaluation (Online Evaluation and Monitoring; production evals; drift monitoring), judge-bias-mitigation (Judge Bias Mitigation; position-swap evaluation; length-controlled judging), probabilistic-judge-scoring (Probabilistic Judge Scoring; G-Eval; logprob-weighted scoring), fine-tuned-evaluators (Fine-Tuned Evaluators; judge models; open-weight judges; evaluator LMs), judge-score-correction (Judge Score Correction; prediction-powered inference; PPI; confidence intervals for judges), agent-trajectory-evaluation (Agent Trajectory Evaluation; step-level agent evals; trajectory grading; progress rate), static-context-scoring (Static Context Scoring; context quality scoring; preflight context evaluation)
- safety-and-security: prompt-injection (Prompt Injection; instruction injection), indirect-prompt-injection (Indirect Prompt Injection; data poisoning of context; tool-output injection; XPIA), jailbreaks (Jailbreaks; adversarial prompts; GCG), red-teaming (AI Red Teaming; adversarial testing), guardrails (Guardrails and Safety Classifiers; input/output filters; content moderation; Llama Guard), injection-defenses (Prompt Injection Defenses; instruction hierarchy; injection detection), agent-sandboxing (Agent Sandboxing and Permissions; secure code execution; tool permissions; least-privilege agents), interpretability (Mechanistic Interpretability; circuits; interpretability), sparse-autoencoders (Sparse Autoencoders; SAEs; dictionary learning; monosemantic features), representation-engineering (Representation Engineering; RepE; activation steering), circuit-breakers (Circuit Breakers; representation rerouting), automated-jailbreak-generation (Automated Jailbreak Generation; PAIR; TAP; Tree of Attacks with Pruning), spotlighting (Spotlighting; datamarking; input delimiting), dual-llm-pattern (Dual LLM Pattern; privileged and quarantined LLMs), machine-unlearning (Machine Unlearning; LLM unlearning; targeted forgetting; RMU), agent-authorization (Agent Identity and Delegated Authorization; OAuth for agents; delegated authorization; agent identity; scoped credentials; on-behalf-of access; non-human identity), tool-poisoning (Tool Poisoning; MCP tool poisoning; tool description injection; MCP rug pulls; MCP supply-chain attacks)
- ai-product-and-interaction-design: human-ai-interaction-guidelines (Human-AI Interaction Guidelines; HAI guidelines; AI UX principles), chat-interfaces (Chat Interfaces; conversational UI; chat assistants), streaming-responses (Streaming Responses; token streaming; server-sent events), copilots (Copilots and Inline Assistance; inline completion; AI pair programming), citation-ux (Citation and Grounding UX; source attribution; inline citations), human-in-the-loop-approval (Human-in-the-Loop Approval; HITL; tool confirmation; permission prompts; interrupts; agent breakpoints), generative-ui (Generative UI; server-driven UI from models), canvas-artifacts (Canvases and Artifacts; side-by-side editing; artifacts; canvas), reasoning-trace-display (Reasoning Trace Display; thinking UI; thought summaries; reasoning visualization), plan-preview (Plan Preview; plan mode; plan approval; intent preview), agent-action-trace (Agent Action Trace; activity feed; tool call display; action log), mid-run-steering (Mid-Run Steering; active execution participation; mid-flight intervention; agent steering), trust-calibration (Trust Calibration; appropriate reliance; uncertainty display; confidence indicators; overreliance mitigation), voice-turn-taking (Turn-Taking and Barge-In; barge-in; voice interruption handling; semantic VAD; endpointing), background-agents (Background Agents; asynchronous agents; cloud agents; agent delegation; assign-and-review)
- multimodal-applied: contrastive-image-text-pretraining (Contrastive Image-Text Pretraining; CLIP; joint embeddings), vision-language-models (Vision-Language Models; VLMs; multimodal LLMs; visual instruction tuning; LLaVA), document-understanding (Document Understanding; PDF parsing; OCR-free parsing; layout understanding), visual-document-retrieval (Visual Document Retrieval; ColPali; page-image retrieval; visual late interaction), speech-recognition (Speech Recognition; ASR; speech-to-text; Whisper), realtime-voice (Realtime Voice Agents; speech-to-speech; voice mode), diffusion-models (Diffusion Models; DDPM; denoising diffusion), text-to-image (Text-to-Image Generation; latent diffusion; image generation), video-generation (Video Generation; text-to-video), dynamic-resolution-encoding (Dynamic Resolution Encoding; native resolution; AnyRes; image tiling; M-RoPE), video-understanding (Video Understanding; video VLMs; video-LLMs; spatiotemporal vision encoding), audio-language-models (Audio Language Models; neural codec language models; codec TTS; zero-shot TTS; AudioLM; VALL-E), full-duplex-voice (Full-Duplex Voice Models; simultaneous listening and speaking; multi-stream speech models; Moshi), diffusion-transformers (Diffusion Transformers; DiT), flow-matching (Flow Matching; rectified flow), spatial-conditioning (Spatial Conditioning; ControlNet; T2I-Adapter; controllable generation), spatial-vlms (Spatial Reasoning VLMs; SpatialVLM; embodied reasoning models; metric spatial reasoning; 3D spatial reasoning)
- embodied-ai-and-world-models: sim-to-real-transfer (Sim-to-Real Transfer; domain randomization; sim2real; real-to-sim-to-real), latent-world-models (Latent World Models; model-based RL; Dreamer; learning in imagination; World Models (Ha & Schmidhuber)), llm-robot-planning (LLM Task Planning for Robots; SayCan; Code as Policies; language model programs; language-conditioned task planning; hierarchical robot control), diffusion-policy (Diffusion Policy; action diffusion; visuomotor diffusion policy), action-chunking (Action Chunking and Low-Cost Teleoperation; ACT; ALOHA; action chunking with transformers; teleoperation data collection), vision-language-action-models (Vision-Language-Action Models; VLA; VLAs; RT-2; OpenVLA; robot foundation models; generalist robot policies), cross-embodiment-training (Cross-Embodiment Training; Open X-Embodiment; RT-X; pooled robot datasets), interactive-world-models (Interactive World Models; generative interactive environments; action-conditioned video models; world foundation models; Genie), human-video-pretraining (Human Video Pretraining; R3M; VIP; VC-1; egocentric video pretraining; learning from human video; latent action pretraining), flow-matching-policy (Flow-Matching Action Heads; flow-matching policy; π0 action expert; action flow matching), generative-sim-to-real (Generative Sim-to-Real; LucidSim; generative augmentation; generative digital twins), dual-system-vlas (Dual-System VLAs; System 1 / System 2 robot models; slow-fast VLAs; hierarchical VLAs; Helix), vla-reinforcement-learning (RL Fine-Tuning of VLAs; VLA online RL; ReinFlow; flow policy RL)
- governance-and-compliance: model-documentation (Model and System Cards; model cards; system cards; transparency documentation), ai-risk-management (AI Risk Management Frameworks; NIST AI RMF; AI risk assessment; ISO/IEC 23894), ai-management-systems (AI Management Systems (ISO/IEC 42001); ISO 42001; AIMS; AI management system certification), eu-ai-act (EU AI Act; Regulation (EU) 2024/1689; risk-based AI regulation; AI Act), gpai-code-of-practice (General-Purpose AI Code of Practice; GPAI Code of Practice; EU code of practice for general-purpose AI), dangerous-capability-evals (Dangerous Capability Evaluations; frontier risk evals; extreme-risk evaluation; CBRN and cyber evals; uplift studies), frontier-safety-frameworks (Frontier Safety Frameworks; responsible scaling policies; RSP; Preparedness Framework; if-then commitments), content-provenance (Content Provenance and Credentials; C2PA; Content Credentials; provenance metadata), training-data-licensing (Training Data Licensing and Opt-Outs; data provenance; AI crawler opt-outs; robots.txt for AI; data licensing), ai-bill-of-materials (AI Bill of Materials; AIBOM; AI-BOM; ML-BOM; SBOM for AI), ai-impact-assessment (AI Impact Assessments; fundamental rights impact assessment; FRIA; algorithmic impact assessment; ISO/IEC 42005)

---

## Reference: seed sources for this region
Key references currently attached to the anchors (from the backbone runs; arXiv ids spot-checked, not exhaustively verified):
- Prompt Injection: Ignore Previous Prompt: Attack Techniques For Language Models (Perez & Ribeiro) — arXiv:2211.09527
- Indirect Prompt Injection: Not what you've signed up for: Compromising Real-World LLM-Integrated Applications with Indirect Prompt Injection (Greshake et al.) — arXiv:2302.12173
- Jailbreaks: Jailbroken: How Does LLM Safety Training Fail? (Wei et al.) — arXiv:2307.02483
- AI Red Teaming: Red Teaming Language Models with Language Models (Perez et al.) — arXiv:2202.03286
- Guardrails and Safety Classifiers: Llama Guard: LLM-based Input-Output Safeguard for Human-AI Conversations (Inan et al.) — arXiv:2312.06674
- Prompt Injection Defenses: The Instruction Hierarchy: Training LLMs to Prioritize Privileged Instructions (Wallace et al.) — arXiv:2404.13208
- Agent Sandboxing and Permissions: E2B — open-source cloud sandboxes for AI agents — https://e2b.dev
- Mechanistic Interpretability: A Mathematical Framework for Transformer Circuits (Elhage et al.) — https://transformer-circuits.pub/2021/framework/index.html
- Sparse Autoencoders: Towards Monosemanticity: Decomposing Language Models With Dictionary Learning (Bricken et al.) — https://transformer-circuits.pub/2023/monosemantic-features
- Representation Engineering: Representation Engineering: A Top-Down Approach to AI Transparency (Zou et al.) — arXiv:2310.01405
- Circuit Breakers: Improving Alignment and Robustness with Circuit Breakers (Zou et al.) — arXiv:2406.04313
- Automated Jailbreak Generation: Jailbreaking Black Box Large Language Models in Twenty Queries (Chao et al.) — arXiv:2310.08419
- Spotlighting: Defending Against Indirect Prompt Injection Attacks With Spotlighting (Hines et al.) — arXiv:2403.14720
- Dual LLM Pattern: The Dual LLM pattern for building AI assistants that can resist prompt injection (Willison) — https://simonwillison.net/2023/Apr/25/dual-llm-pattern/
- Machine Unlearning: Who's Harry Potter? Approximate Unlearning in LLMs (Eldan & Russinovich) — arXiv:2310.02238
- Agent Identity and Delegated Authorization: Model Context Protocol specification: Authorization (2025-03-26) — https://modelcontextprotocol.io/specification/2025-03-26/basic/authorization
- Tool Poisoning: MCP Security Notification: Tool Poisoning Attacks (Invariant Labs) — https://invariantlabs.ai/blog/mcp-security-notification-tool-poisoning-attacks

## Reference: cross-region edges touching this region
- agent-authorization --applies--> least-privilege
- agent-authorization --extends--> model-context-protocol
- agent-sandboxing --applies--> least-privilege
- agent-sandboxing --applies--> sandboxing-and-isolation
- agent-sandboxing --counters--> function-calling
- background-agents --applies--> agent-sandboxing
- dangerous-capability-evals --extends--> red-teaming
- dual-llm-pattern --applies--> least-privilege
- guardrails --applies--> llm-as-a-judge
- indirect-prompt-injection --applies--> retrieval-augmented-generation
- interpretability --applies--> transformer-architecture
- jailbreaks --counters--> rlhf
- machine-unlearning --applies--> transfer-learning-fine-tuning
- prompt-injection --applies--> injection-attacks
- prompt-injection --applies--> zero-shot-prompting
- red-teaming --counters--> rlhf
- reft --applies--> representation-engineering
- tool-poisoning --applies--> model-context-protocol
