# Deep dive: Planning and Reasoning

Backbone v0.2 · 20 anchors · 22 cross-region edges

## How to use
1. Paste everything between **Research prompt** and the horizontal rule into a deep-research run (Gemini, Claude Research, etc.).
2. Save the output and hand it to a Claude agent for merging: validate ids, enums, and date order with `validate.py`, then fold Section 3 amendments into `backbone.yaml` by hand.
3. Section 1 (overview and learning path) and each node's `summary` and `resources` are the content for the map's side panel. `layer: detail` nodes appear only when zoomed in.

## Research prompt

I'm building a lineage graph of applied AI engineering that will be rendered as an interactive map. Each region of the map is a discipline; each node is a technique, pattern, or method; edges record what each node was built on. This run is a DEEP DIVE into one region: **Planning and Reasoning**. A backbone of stable ids already exists — attach everything you find to it.

## The region
Structured problem solving — the chain-of-thought lineage, search over reasoning, test-time compute and reasoning models, self-reflection, and neuro-symbolic planning with external solvers and verifiers.

Boundary with neighboring regions: Concerns how a solution is derived, not whether actions are taken (vs. Agents). Training methods that produce reasoning (RLVR, GRPO) live in Adaptation.

Boundary rules (apply these exactly; if you disagree, say so in Amendments rather than breaking them):
- Tree of Thoughts / tree search → planning-and-reasoning: Searches over generated reasoning paths without changing the world → Reasoning.
- Reflexion / self-reflection → planning-and-reasoning: Improves a solution via critique, even when the loop runs in an agent → Reasoning.
- Process reward models → planning-and-reasoning: Primarily used to score steps for search and verification → Reasoning (secondary: Adaptation).
- Reasoning budget control → planning-and-reasoning: How long a reasoning model thinks → Reasoning, alongside test-time compute scaling, even when set as an API parameter (secondary: Inference).

## Perspective and scope
- Take the view of a practicing AI engineer building products and systems, not a model researcher.
- Cover the field through 2026. 2024–2026 work is easy to under-represent — look for it deliberately.
- A node is a technique, pattern, method, or discipline. Products, libraries, frameworks, benchmarks, and companies are NOT nodes; list them under `examples`.
- Target 15–30 nodes for this region in total, counting the existing anchors below. Quality over count: leave out research-only ideas that no practitioner would meet unless they're real ancestors of something that matters.
- Before adding a node, check the backbone index at the end (ids, names, and aliases across ALL regions). If the concept already exists anywhere, even in another region or under an alias, attach to that id (correct it, or add an alias or example). Never re-create it under a new id.

## Existing anchors in this region (keep these ids; you may correct their fields)
- `scratchpads` — Scratchpads (maturity 4, 2021-11)
- `chain-of-thought` — Chain-of-Thought (maturity 5, 2022-01)
- `self-consistency` — Self-Consistency (maturity 4, 2022-03)
- `tree-of-thoughts` — Tree Search over Reasoning (maturity 2, 2023-05)
- `reflexion` — Self-Reflection (maturity 3, 2023-03)
- `process-reward-models` — Process Reward Models (maturity 2, 2023-05)
- `test-time-compute-scaling` — Test-Time Compute Scaling (maturity 4, 2024-08)
- `reasoning-models` — Reasoning Models (maturity 4, 2024-09)
- `llm-plus-p` — LLM+P (maturity 1, 2023-04)
- `llm-modulo` — LLM-Modulo (maturity 2, 2024-02)
- `program-aided-reasoning` — Program-Aided Reasoning (maturity 4, 2022-11)
- `reasoning-via-planning` — Reasoning via Planning (maturity 1, 2023-05)
- `graph-of-thoughts` — Graph of Thoughts (maturity 1, 2023-08)
- `step-back-prompting` — Step-Back Prompting (maturity 2, 2023-10)
- `language-agent-tree-search` — Language Agent Tree Search (maturity 1, 2023-10)
- `math-shepherd` — Automatic Process Supervision (maturity 2, 2023-12)
- `quiet-star` — Quiet-STaR (maturity 1, 2024-03)
- `latent-reasoning` — Latent Reasoning (maturity 1, 2024-12)
- `cot-monitoring` — CoT Monitoring (maturity 2, 2025-03)
- `reasoning-budget-control` — Reasoning Budget Control (maturity 3, 2025-01)

Nodes homed elsewhere that also touch this region:
- `zero-shot-cot` — Zero-Shot Chain-of-Thought (home: prompting-and-context-engineering)
- `decomposed-prompting` — Decomposed Prompting (home: prompting-and-context-engineering)
- `react-agent-loop` — ReAct Agent Loop (home: agents-and-orchestration)
- `rlvr` — RL with Verifiable Rewards (home: adaptation-and-post-training)
- `reasoning-trace-display` — Reasoning Trace Display (home: ai-product-and-interaction-design)
- `latent-world-models` — Latent World Models (home: embodied-ai-and-world-models)
- `llm-robot-planning` — LLM Task Planning for Robots (home: embodied-ai-and-world-models)

## Questions to answer
- Neuro-symbolic planning — LLM+P, LLM-Modulo, LLM-generated PDDL, verifier-in-the-loop systems
- Test-time compute strategies and when they pay for themselves
- Faithfulness of reasoning traces and what that means for engineers
- What are the major sub-areas of this region, and what is the lineage within each?
- Which techniques here were superseded, and by what?
- Where does this region draw on other regions, and where do other regions draw on it?

## Leads from earlier research runs to evaluate
For each: add it as a node, fold it into an existing anchor as an alias or example, or reject it with a reason.
- STaR (self-taught reasoner; iterative fine-tuning on self-generated rationales) as an anchor (arXiv:2203.14465)
- Portfolio Beam Search and diversity-aware search under PRM uncertainty (single blog source; verify adoption)

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
- `also`: allowed values are information-retrieval, deep-learning-nlp, symbolic-ai-planning, reinforcement-learning, knowledge-representation, human-computer-interaction, computer-vision, robotics-and-control, inference-and-serving, prompting-and-context-engineering, retrieval-and-knowledge, agents-and-orchestration, planning-and-reasoning, adaptation-and-post-training, data-and-synthetic-data, evaluation-and-observability, safety-and-security, ai-product-and-interaction-design, multimodal-applied, embodied-ai-and-world-models, governance-and-compliance.
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
- information-retrieval: bm25 (BM25; Okapi BM25; sparse retrieval; TF-IDF ranking), approximate-nearest-neighbor-search (Approximate Nearest Neighbor Search; ANN; HNSW; vector indexing), open-domain-qa (Open-Domain Question Answering; retriever-reader QA; DrQA), tf-idf (TF-IDF; inverse document frequency; IDF; term weighting)
- deep-learning-nlp: attention-mechanism (Attention Mechanism; neural attention), sequence-to-sequence-learning (Sequence-to-Sequence Learning; seq2seq; encoder-decoder), transformer-architecture (Transformer; transformers), pretrained-language-models (Pretrained Language Models; LLMs; foundation models; generative pretraining), transfer-learning-fine-tuning (Transfer Learning and Fine-Tuning; fine-tuning; ULMFiT), knowledge-distillation (Knowledge Distillation; teacher-student training), mixture-of-experts (Mixture of Experts; MoE; sparse MoE), state-space-models (State-Space Models; SSMs; S4; Mamba; linear-time sequence models), subword-tokenization (Subword Tokenization; tokenization; BPE; byte-pair encoding; tokenizers; SentencePiece; token counting), rotary-position-embeddings (Rotary Position Embeddings; RoPE; RoFormer; rotary embeddings), sparse-attention (Sparse Attention; NSA; Native Sparse Attention; DSA; DeepSeek Sparse Attention; MoBA; block-sparse attention; trainable sparse attention), perceptron (Perceptron; artificial neuron; Rosenblatt perceptron), backpropagation (Backpropagation; backprop; gradient descent through layers; reverse-mode differentiation), lstm (Long Short-Term Memory; LSTM; recurrent neural networks; RNN; GRU), neural-language-models (Neural Language Models; neural probabilistic language model; NPLM), word-embeddings (Word Embeddings; word2vec; GloVe; word vectors; distributed representations), scaling-laws (Scaling Laws; neural scaling laws; Chinchilla scaling; compute-optimal training)
- symbolic-ai-planning: heuristic-search (Heuristic Search; A*; best-first search; state-space search), strips-planning (STRIPS Planning; classical planning), pddl (PDDL; Planning Domain Definition Language), expert-systems (Expert Systems; rule-based systems; production systems), monte-carlo-tree-search (Monte Carlo Tree Search; MCTS; UCT), classical-multi-agent-systems (Multi-Agent Systems; intelligent agents; BDI agents; agent communication languages; distributed AI)
- reinforcement-learning: markov-decision-process (Markov Decision Process; MDP), policy-gradient-methods (Policy Gradient Methods; REINFORCE; actor-critic), ppo (Proximal Policy Optimization; PPO), q-learning (Q-Learning; temporal-difference learning; TD learning; value-based RL), deep-q-networks (Deep Q-Networks; DQN; deep reinforcement learning; Atari DQN), alphago (AlphaGo; AlphaZero; MuZero; self-play)
- knowledge-representation: semantic-networks (Semantic Networks; ontologies; frames), knowledge-graphs (Knowledge Graphs; property graphs)
- human-computer-interaction: conversational-agents (Conversational Agents; chatbots; dialogue systems), mixed-initiative-interaction (Mixed-Initiative Interaction; human-AI collaboration; intelligent assistance)
- computer-vision: convolutional-neural-networks (Convolutional Neural Networks; CNN; ConvNet; LeNet), alexnet (AlexNet and the ImageNet Moment; AlexNet; ImageNet; GPU-trained deep networks; deep learning revolution), residual-networks (Residual Networks; ResNet; residual connections; skip connections), variational-autoencoders (Variational Autoencoders; VAE; VQ-VAE; latent variable models), generative-adversarial-networks (Generative Adversarial Networks; GAN; StyleGAN; adversarial training), vision-transformer (Vision Transformer; ViT)
- robotics-and-control: behavior-cloning (Behavior Cloning; imitation learning; learning from demonstration; ALVINN), dagger (DAgger; dataset aggregation; interactive imitation learning; on-policy imitation), physics-simulation (Physics Simulation for Robotics; robot simulators; MuJoCo; rigid-body simulation)
- inference-and-serving: autoregressive-decoding (Autoregressive Decoding; next-token generation; sampling), kv-cache (KV Cache; key-value cache; incremental decoding), paged-attention (PagedAttention; paged KV cache), continuous-batching (Continuous Batching; in-flight batching; iteration-level scheduling), speculative-decoding (Speculative Decoding; assisted generation; draft-and-verify), weight-quantization (Weight Quantization; INT8; INT4; FP8; GPTQ; AWQ), kv-cache-quantization (KV Cache Quantization; KIVI; compressed KV cache), prompt-caching (Prompt Caching; prefix caching; RadixAttention), constrained-decoding (Constrained Decoding; grammar-constrained generation; guided decoding; JSON mode; grammar automata), model-routing (Model Routing and Cascades; LLM routing; FrugalGPT; model cascades), prefill-decode-disaggregation (Prefill-Decode Disaggregation; disaggregated serving; split-level inference), local-inference (Local and On-Device Inference; llama.cpp; edge inference; on-device models), llm-watermarking (LLM Watermarking; text watermarking; green-list watermarking), io-aware-attention (FlashAttention; IO-aware attention; FlashAttention-2; FlashAttention-3; fused attention kernels; FlashInfer), grouped-query-attention (Grouped-Query Attention; GQA; multi-query attention; MQA), multi-head-latent-attention (Multi-Head Latent Attention; MLA; DeepSeek MLA), chunked-prefill (Chunked Prefill; Sarathi; stall-free batching; piggybacked decodes), kv-cache-offloading (KV Cache Offloading; tiered KV cache; KV cache pool; KV-centric serving), multi-lora-serving (Multi-LoRA Serving; S-LoRA; Punica; adapter serving), draft-heads (Speculative Draft Heads; EAGLE; Medusa; self-speculative decoding; draft trees), microscaling-formats (Microscaling Formats; MXFP4; NVFP4; FP4; block-scaled quantization), semantic-caching (Semantic Caching; response caching; GPTCache; embedding-based caching), llm-gateways (LLM Gateways; AI gateway; LLM proxy; model fallback; rate limiting; cost budgets; LiteLLM), context-window-extension (Context Window Extension; RoPE scaling; position interpolation; YaRN; NTK-aware scaling; long-context extension), model-parallelism (Tensor, Pipeline and Expert Parallelism; model parallelism; tensor parallelism; pipeline parallelism; expert parallelism; TP; PP; EP; Megatron), diffusion-language-models (Diffusion Language Models; dLLMs; text diffusion; masked diffusion language models; LLaDA; Mercury; Gemini Diffusion)
- prompting-and-context-engineering: zero-shot-prompting (Zero-Shot Prompting; direct prompting; instruction prompting), few-shot-prompting (Few-Shot Prompting; in-context learning; ICL), system-prompts (System Prompts; system messages; custom instructions; developer messages), prompt-templating (Prompt Templating; prompt templates), prompt-chaining (Prompt Chaining; LLM chains; pipelines of prompts; AI chains), structured-outputs (Structured Outputs; JSON outputs; schema-constrained outputs), context-compaction (Context Compaction; prompt compression; summarization of history), context-engineering (Context Engineering; context management), automatic-prompt-optimization (Automatic Prompt Optimization; APO; APE; prompt search), declarative-prompt-compilation (Declarative Prompt Compilation; DSPy; LM programs), zero-shot-cot (Zero-Shot Chain-of-Thought; zero-shot CoT; Let's think step by step), dynamic-few-shot-selection (Dynamic Few-Shot Selection; example selection; prompt retrieval; kNN prompting; KATE), decomposed-prompting (Decomposed Prompting; DECOMP; task decomposition prompting), textual-gradients (Textual Gradients; TextGrad; textual gradient descent), context-ordering (Context Ordering; position engineering; context reordering; lost-in-the-middle mitigation), progressive-disclosure (Progressive Disclosure; just-in-time context; lazy-loaded context)
- retrieval-and-knowledge: text-embeddings (Text Embeddings; embedding models; sentence embeddings), dense-retrieval (Dense Retrieval; vector search; semantic search; DPR), retrieval-augmented-generation (Retrieval-Augmented Generation; RAG; naive RAG), chunking-strategies (Chunking Strategies; text splitting; semantic chunking), hybrid-search (Hybrid Search; sparse + dense retrieval; reciprocal rank fusion), cross-encoder-reranking (Cross-Encoder Reranking; rerankers; retrieve-and-rerank; multi-stage retrieval), query-rewriting (Query Rewriting and HyDE; query expansion; HyDE; Rewrite-Retrieve-Read), contextual-retrieval (Contextual Retrieval; contextual chunking), graph-rag (GraphRAG; knowledge-graph RAG), self-rag (Self-RAG; self-reflective RAG), corrective-rag (Corrective RAG; CRAG), agentic-rag (Agentic RAG; agentic search; iterative retrieval), parent-document-retrieval (Parent-Document Retrieval; small-to-big retrieval; ParentDocumentRetriever; sentence-window retrieval; auto-merging retrieval), late-interaction (Late Interaction; ColBERT; multi-vector retrieval; MaxSim), learned-sparse-retrieval (Learned Sparse Retrieval; SPLADE; neural sparse retrieval), propositional-chunking (Propositional Chunking; Dense X Retrieval; proposition indexing), late-chunking (Late Chunking; post-embedding chunking), active-retrieval (Active Retrieval; FLARE; forward-looking active retrieval), speculative-rag (Speculative RAG; draft-then-verify RAG), lightweight-graph-rag (Lightweight GraphRAG; LightRAG; LazyGraphRAG), long-context-routing (RAG vs. Long-Context Routing; Self-Route; Pre-Route), text-to-sql (Text-to-SQL; natural language to SQL; NL2SQL; structured-data QA; table question answering), embedding-compression (Embedding Compression; Matryoshka embeddings; MRL; binary embeddings; embedding quantization; truncatable embeddings), embedding-fine-tuning (Embedding Fine-Tuning; domain adaptation of embedders; fine-tuning embedding models; GPL; synthetic query generation for retrieval)
- agents-and-orchestration: mrkl-systems (MRKL Systems; modular reasoning; neuro-symbolic routing), tool-learning (Tool Learning; Toolformer; self-taught tool use), function-calling (Function Calling; tool use; tool calling), react-agent-loop (ReAct Agent Loop; reason and act; agent loop), workflow-state-machines (Workflow Graphs and State Machines; graph-based agents; agent workflows), model-context-protocol (Model Context Protocol; MCP), agent-memory (Agent Memory; long-term memory; episodic memory; MemGPT; structured note-taking), multi-agent-systems (Multi-Agent Systems; orchestrator-worker; subagents; agent teams), coding-agents (Coding Agents; software engineering agents; SWE-agent), computer-use-agents (Computer-Use Agents; GUI agents; browser agents), deep-research-agents (Deep Research Agents; research agents), agent-skills (Agent Skills; skills; packaged procedures), decision-models (Decision Models; System One models; typed decision models; calibrated classifiers for agents), semantic-routing (Semantic Routing; embedding-based intent routing; Semantic Router), mcp-code-execution (Code Execution with MCP; Code Mode; tools as code APIs), long-running-agent-harness (Long-Running Agent Harnesses; multi-session agents; initializer agent pattern; progress files), context-aware-mcp (Context-Aware MCP; CA-MCP; shared context store), agent-to-agent-protocols (Agent-to-Agent Protocols; A2A; Agent2Agent; agent interoperability protocols; agent cards), spec-driven-development (Spec-Driven Development; SDD; spec-first development; specs; Spec Kit; requirements-first agent coding), agent-continual-learning (Continual Learning for Agents; sleep-time compute; sleep-time agents; learning from experience; self-improving agents; memory consolidation; evolving playbooks; Agentic Context Engineering; ACE)
- planning-and-reasoning: scratchpads (Scratchpads; intermediate computation), chain-of-thought (Chain-of-Thought; CoT; step-by-step reasoning), self-consistency (Self-Consistency; majority voting; best-of-n), tree-of-thoughts (Tree Search over Reasoning; Tree of Thoughts; ToT; search-based decoding), reflexion (Self-Reflection; Reflexion; self-critique; self-refine; evaluator-optimizer), process-reward-models (Process Reward Models; PRMs; step-level verifiers; process supervision), test-time-compute-scaling (Test-Time Compute Scaling; inference-time scaling; search against verifiers), reasoning-models (Reasoning Models; thinking models; extended thinking; o1-class models), llm-plus-p (LLM+P; LLM-to-PDDL translation; LLM + classical planner), llm-modulo (LLM-Modulo; generate-test-critique; verifier-in-the-loop planning), program-aided-reasoning (Program-Aided Reasoning; PAL; Program of Thoughts; PoT; program-aided language models), reasoning-via-planning (Reasoning via Planning; RAP; MCTS over reasoning), graph-of-thoughts (Graph of Thoughts; GoT), step-back-prompting (Step-Back Prompting; abstraction prompting), language-agent-tree-search (Language Agent Tree Search; LATS), math-shepherd (Automatic Process Supervision; Math-Shepherd; Monte Carlo step labels), quiet-star (Quiet-STaR; learned internal rationales; think before speaking), latent-reasoning (Latent Reasoning; Coconut; Chain of Continuous Thought; continuous thought), cot-monitoring (CoT Monitoring; CoT faithfulness; chain-of-thought monitorability; reasoning trace monitoring), reasoning-budget-control (Reasoning Budget Control; budget forcing; s1; thinking budget; reasoning effort; adaptive thinking; overthinking; efficient reasoning)
- adaptation-and-post-training: supervised-fine-tuning (Supervised Fine-Tuning; SFT; instruction tuning), parameter-efficient-fine-tuning (Parameter-Efficient Fine-Tuning; PEFT; adapters), low-rank-adaptation (LoRA; low-rank adaptation; QLoRA), rlhf (RLHF; reinforcement learning from human feedback; reward modeling; InstructGPT pipeline; SFT-RM-PPO), direct-preference-optimization (Direct Preference Optimization; DPO; IPO; SimPO), constitutional-ai (Constitutional AI and RLAIF; RLAIF; AI feedback), rlvr (RL with Verifiable Rewards; RLVR), grpo (Group Relative Policy Optimization; GRPO), llm-distillation (LLM Distillation; reasoning distillation; distilled CoT; small language models; SLM), dora (DoRA; weight-decomposed low-rank adaptation), reft (Representation Fine-Tuning; ReFT; LoReFT), kto (Kahneman-Tversky Optimization; KTO), orpo (Odds Ratio Preference Optimization; ORPO), online-preference-optimization (Online Preference Optimization; online DPO; iterative DPO; OAIF), model-merging (Model Merging; task arithmetic; task vectors; model soups; TIES-Merging; SLERP merging), structured-pruning (Structured Pruning; LLM pruning; width and depth pruning; Minitron; Sheared LLaMA), on-policy-distillation (On-Policy Distillation; generalized knowledge distillation; GKD; MiniLLM), continued-pretraining (Continued Pretraining; domain-adaptive pretraining; DAPT; continual pretraining; task-adaptive pretraining; TAPT), agentic-rl (Agentic RL; multi-turn RL; agent RL; RL in environments; tool-integrated RL; Search-R1; RAGEN; agentic RFT)
- data-and-synthetic-data: self-instruct (Self-Instruct; synthetic instruction generation), evol-instruct (Evol-Instruct; instruction evolution), synthetic-textbook-data (Synthetic Pretraining Data; textbook-quality data; synthetic corpora), human-instruction-datasets (Crowdsourced Instruction Data; human-written demonstrations; OpenAssistant), llm-annotation (LLM-Assisted Annotation; LLM labeling; model-as-annotator), data-deduplication (Data Deduplication; near-duplicate removal; MinHash dedup), data-decontamination (Data Decontamination; test-set leakage prevention), data-quality-filtering (Data Quality Filtering; corpus curation; classifier-based filtering), golden-eval-sets (Golden and Eval Sets; golden datasets; eval datasets; test sets; reference sets), data-flywheel (Data Flywheel; production data loop; trace mining), synthetic-rag-data (Synthetic RAG Test Sets; RAG testset generation; synthetic question-answer pairs), instruction-backtranslation (Instruction Backtranslation; Humpback; self-alignment with backtranslation), instruction-data-selection (Instruction Data Selection; instruction-following difficulty; IFD; SFT data pruning), agent-trajectory-synthesis (Agent Trajectory Synthesis; agent RL environments; SWE-Gym; trajectory harvesting), pii-redaction (PII Redaction; PII scrubbing; data anonymization)
- evaluation-and-observability: capability-benchmarks (Capability Benchmarks; static benchmarks; MMLU-style evals), long-context-evals (Long-Context Evals; needle in a haystack; NIAH), agent-benchmarks (Agent Benchmarks; SWE-bench; environment-based evals), llm-as-a-judge (LLM-as-a-Judge; model-graded evals; autoevals), pairwise-preference-eval (Pairwise Preference Evaluation; arena evals; Elo leaderboards), rag-evaluation (RAG Evaluation; faithfulness and context-relevance metrics; RAGAS), eval-driven-development (Eval-Driven Development; EDD; offline evals; prompt regression testing; assertion-based testing), llm-tracing (LLM Tracing; LLM observability; agent traces; OpenTelemetry GenAI conventions; gen_ai spans), online-evaluation (Online Evaluation and Monitoring; production evals; drift monitoring), judge-bias-mitigation (Judge Bias Mitigation; position-swap evaluation; length-controlled judging), probabilistic-judge-scoring (Probabilistic Judge Scoring; G-Eval; logprob-weighted scoring), fine-tuned-evaluators (Fine-Tuned Evaluators; judge models; open-weight judges; evaluator LMs), judge-score-correction (Judge Score Correction; prediction-powered inference; PPI; confidence intervals for judges), agent-trajectory-evaluation (Agent Trajectory Evaluation; step-level agent evals; trajectory grading; progress rate), static-context-scoring (Static Context Scoring; context quality scoring; preflight context evaluation), hallucination-detection (Hallucination Detection; semantic entropy; SelfCheckGPT; groundedness checks; faithfulness checks; uncertainty estimation; confabulation detection), bias-and-fairness-evals (Bias and Fairness Evals; bias benchmarks; fairness testing; BBQ; demographic bias evaluation; counterfactual fairness tests)
- safety-and-security: prompt-injection (Prompt Injection; instruction injection), indirect-prompt-injection (Indirect Prompt Injection; data poisoning of context; tool-output injection; XPIA), jailbreaks (Jailbreaks; adversarial prompts; GCG), red-teaming (AI Red Teaming; adversarial testing), guardrails (Guardrails and Safety Classifiers; input/output filters; content moderation; Llama Guard), injection-defenses (Prompt Injection Defenses; instruction hierarchy; injection detection), agent-sandboxing (Agent Sandboxing and Permissions; secure code execution; tool permissions; least-privilege agents), interpretability (Mechanistic Interpretability; circuits; interpretability), sparse-autoencoders (Sparse Autoencoders; SAEs; dictionary learning; monosemantic features), representation-engineering (Representation Engineering; RepE; activation steering), circuit-breakers (Circuit Breakers; representation rerouting), automated-jailbreak-generation (Automated Jailbreak Generation; PAIR; TAP; Tree of Attacks with Pruning), spotlighting (Spotlighting; datamarking; input delimiting), dual-llm-pattern (Dual LLM Pattern; privileged and quarantined LLMs), machine-unlearning (Machine Unlearning; LLM unlearning; targeted forgetting; RMU), agent-authorization (Agent Identity and Delegated Authorization; OAuth for agents; delegated authorization; agent identity; scoped credentials; on-behalf-of access; non-human identity), tool-poisoning (Tool Poisoning; MCP tool poisoning; tool description injection; MCP rug pulls; MCP supply-chain attacks), sycophancy (Sycophancy; model sycophancy; telling users what they want to hear; agreement bias), data-poisoning (Backdoors and Data Poisoning; training data poisoning; backdoor attacks; sleeper agents; trigger phrases)
- ai-product-and-interaction-design: human-ai-interaction-guidelines (Human-AI Interaction Guidelines; HAI guidelines; AI UX principles), chat-interfaces (Chat Interfaces; conversational UI; chat assistants), streaming-responses (Streaming Responses; token streaming; server-sent events), copilots (Copilots and Inline Assistance; inline completion; AI pair programming), citation-ux (Citation and Grounding UX; source attribution; inline citations), human-in-the-loop-approval (Human-in-the-Loop Approval; HITL; tool confirmation; permission prompts; interrupts; agent breakpoints), generative-ui (Generative UI; server-driven UI from models), canvas-artifacts (Canvases and Artifacts; side-by-side editing; artifacts; canvas), reasoning-trace-display (Reasoning Trace Display; thinking UI; thought summaries; reasoning visualization), plan-preview (Plan Preview; plan mode; plan approval; intent preview), agent-action-trace (Agent Action Trace; activity feed; tool call display; action log), mid-run-steering (Mid-Run Steering; active execution participation; mid-flight intervention; agent steering), trust-calibration (Trust Calibration; appropriate reliance; uncertainty display; confidence indicators; overreliance mitigation), voice-turn-taking (Turn-Taking and Barge-In; barge-in; voice interruption handling; semantic VAD; endpointing), background-agents (Background Agents; asynchronous agents; cloud agents; agent delegation; assign-and-review)
- multimodal-applied: contrastive-image-text-pretraining (Contrastive Image-Text Pretraining; CLIP; joint embeddings), vision-language-models (Vision-Language Models; VLMs; multimodal LLMs; visual instruction tuning; LLaVA), document-understanding (Document Understanding; PDF parsing; OCR-free parsing; layout understanding), visual-document-retrieval (Visual Document Retrieval; ColPali; page-image retrieval; visual late interaction), speech-recognition (Speech Recognition; ASR; speech-to-text; Whisper), realtime-voice (Realtime Voice Agents; speech-to-speech; voice mode), diffusion-models (Diffusion Models; DDPM; denoising diffusion), text-to-image (Text-to-Image Generation; latent diffusion; image generation), video-generation (Video Generation; text-to-video), dynamic-resolution-encoding (Dynamic Resolution Encoding; native resolution; AnyRes; image tiling; M-RoPE), video-understanding (Video Understanding; video VLMs; video-LLMs; spatiotemporal vision encoding), audio-language-models (Audio Language Models; neural codec language models; codec TTS; zero-shot TTS; AudioLM; VALL-E), full-duplex-voice (Full-Duplex Voice Models; simultaneous listening and speaking; multi-stream speech models; Moshi), diffusion-transformers (Diffusion Transformers; DiT), flow-matching (Flow Matching; rectified flow), spatial-conditioning (Spatial Conditioning; ControlNet; T2I-Adapter; controllable generation), spatial-vlms (Spatial Reasoning VLMs; SpatialVLM; embodied reasoning models; metric spatial reasoning; 3D spatial reasoning), image-personalization (Image Personalization; DreamBooth; subject-driven generation; diffusion LoRA; style LoRA; textual inversion), instruction-image-editing (Instruction-Based Image Editing; InstructPix2Pix; text-guided image editing; edit by instruction), unified-multimodal-generation (Unified Multimodal Generation; native image generation; any-to-any models; mixed-modal models; Chameleon; Transfusion; BAGEL; GPT-4o image generation; Nano Banana)
- embodied-ai-and-world-models: sim-to-real-transfer (Sim-to-Real Transfer; domain randomization; sim2real; real-to-sim-to-real), latent-world-models (Latent World Models; model-based RL; Dreamer; learning in imagination; World Models (Ha & Schmidhuber)), llm-robot-planning (LLM Task Planning for Robots; SayCan; Code as Policies; language model programs; language-conditioned task planning; hierarchical robot control), diffusion-policy (Diffusion Policy; action diffusion; visuomotor diffusion policy), action-chunking (Action Chunking and Low-Cost Teleoperation; ACT; ALOHA; action chunking with transformers; teleoperation data collection), vision-language-action-models (Vision-Language-Action Models; VLA; VLAs; RT-2; OpenVLA; robot foundation models; generalist robot policies), cross-embodiment-training (Cross-Embodiment Training; Open X-Embodiment; RT-X; pooled robot datasets), interactive-world-models (Interactive World Models; generative interactive environments; action-conditioned video models; world foundation models; Genie), human-video-pretraining (Human Video Pretraining; R3M; VIP; VC-1; egocentric video pretraining; learning from human video; latent action pretraining), flow-matching-policy (Flow-Matching Action Heads; flow-matching policy; π0 action expert; action flow matching), generative-sim-to-real (Generative Sim-to-Real; LucidSim; generative augmentation; generative digital twins), dual-system-vlas (Dual-System VLAs; System 1 / System 2 robot models; slow-fast VLAs; hierarchical VLAs; Helix), vla-reinforcement-learning (RL Fine-Tuning of VLAs; VLA online RL; ReinFlow; flow policy RL)
- governance-and-compliance: model-documentation (Model and System Cards; model cards; system cards; transparency documentation), ai-risk-management (AI Risk Management Frameworks; NIST AI RMF; AI risk assessment; ISO/IEC 23894), ai-management-systems (AI Management Systems (ISO/IEC 42001); ISO 42001; AIMS; AI management system certification), eu-ai-act (EU AI Act; Regulation (EU) 2024/1689; risk-based AI regulation; AI Act), gpai-code-of-practice (General-Purpose AI Code of Practice; GPAI Code of Practice; EU code of practice for general-purpose AI), dangerous-capability-evals (Dangerous Capability Evaluations; frontier risk evals; extreme-risk evaluation; CBRN and cyber evals; uplift studies), frontier-safety-frameworks (Frontier Safety Frameworks; responsible scaling policies; RSP; Preparedness Framework; if-then commitments), content-provenance (Content Provenance and Credentials; C2PA; Content Credentials; provenance metadata), training-data-licensing (Training Data Licensing and Opt-Outs; data provenance; AI crawler opt-outs; robots.txt for AI; data licensing), ai-bill-of-materials (AI Bill of Materials; AIBOM; AI-BOM; ML-BOM; SBOM for AI), ai-impact-assessment (AI Impact Assessments; fundamental rights impact assessment; FRIA; algorithmic impact assessment; ISO/IEC 42005)

---

## Reference: seed sources for this region
Key references currently attached to the anchors (from the backbone runs; arXiv ids spot-checked, not exhaustively verified):
- Scratchpads: Show Your Work: Scratchpads for Intermediate Computation with Language Models (Nye et al.) — arXiv:2112.00114
- Chain-of-Thought: Chain-of-Thought Prompting Elicits Reasoning in Large Language Models (Wei et al.) — arXiv:2201.11903
- Self-Consistency: Self-Consistency Improves Chain of Thought Reasoning in Language Models (Wang et al.) — arXiv:2203.11171
- Tree Search over Reasoning: Tree of Thoughts: Deliberate Problem Solving with Large Language Models (Yao et al.) — arXiv:2305.10601
- Self-Reflection: Reflexion: Language Agents with Verbal Reinforcement Learning (Shinn et al.) — arXiv:2303.11366
- Process Reward Models: Let's Verify Step by Step (Lightman et al.) — arXiv:2305.20050
- Test-Time Compute Scaling: Scaling LLM Test-Time Compute Optimally can be More Effective than Scaling Model Parameters (Snell et al.) — arXiv:2408.03314
- Reasoning Models: Learning to reason with LLMs (OpenAI, o1) — https://openai.com/index/learning-to-reason-with-llms/
- LLM+P: LLM+P: Empowering Large Language Models with Optimal Planning Proficiency (Liu et al.) — arXiv:2304.11477
- LLM-Modulo: LLMs Can't Plan, But Can Help Planning in LLM-Modulo Frameworks (Kambhampati et al.) — arXiv:2402.01817
- Program-Aided Reasoning: PAL: Program-aided Language Models (Gao et al.) — arXiv:2211.10435
- Reasoning via Planning: Reasoning with Language Model is Planning with World Model (Hao et al.) — arXiv:2305.14992
- Graph of Thoughts: Graph of Thoughts: Solving Elaborate Problems with Large Language Models (Besta et al.) — arXiv:2308.09687
- Step-Back Prompting: Take a Step Back: Evoking Reasoning via Abstraction in Large Language Models (Zheng et al.) — arXiv:2310.06117
- Language Agent Tree Search: Language Agent Tree Search Unifies Reasoning Acting and Planning in Language Models (Zhou et al.) — arXiv:2310.04406
- Automatic Process Supervision: Math-Shepherd: Verify and Reinforce LLMs Step-by-step without Human Annotations (Wang et al.) — arXiv:2312.08935
- Quiet-STaR: Quiet-STaR: Language Models Can Teach Themselves to Think Before Speaking (Zelikman et al.) — arXiv:2403.09629
- Latent Reasoning: Training Large Language Models to Reason in a Continuous Latent Space (Hao et al.) — arXiv:2412.06769
- CoT Monitoring: Monitoring Reasoning Models for Misbehavior and the Risks of Promoting Obfuscation (Baker et al.) — arXiv:2503.11926
- Reasoning Budget Control: s1: Simple test-time scaling (Muennighoff et al.) — arXiv:2501.19393

## Reference: cross-region edges touching this region
- agent-continual-learning --applies--> test-time-compute-scaling
- agent-continual-learning --extends--> reflexion
- chain-of-thought --extends--> few-shot-prompting
- cot-monitoring --applies--> llm-as-a-judge
- hallucination-detection --applies--> self-consistency
- language-agent-tree-search --applies--> monte-carlo-tree-search
- language-agent-tree-search --extends--> react-agent-loop
- llm-plus-p --combines--> pddl
- llm-plus-p --combines--> pretrained-language-models
- process-reward-models --specializes--> rlhf
- program-aided-reasoning --specializes--> mrkl-systems
- quiet-star --applies--> policy-gradient-methods
- react-agent-loop --combines--> chain-of-thought
- reasoning-models --applies--> policy-gradient-methods
- reasoning-trace-display --applies--> reasoning-models
- reasoning-via-planning --applies--> monte-carlo-tree-search
- reflexion --extends--> react-agent-loop
- scratchpads --applies--> pretrained-language-models
- step-back-prompting --combines--> retrieval-augmented-generation
- test-time-compute-scaling --extends--> scaling-laws
- tree-of-thoughts --combines--> heuristic-search
- zero-shot-cot --specializes--> chain-of-thought
