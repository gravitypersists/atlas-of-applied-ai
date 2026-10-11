# Deep dive: The Old World

Backbone v0.2 · 8 provinces · 54 landmarks · 82 edges into the New World

An enrichment pass rather than a coverage pass: summaries, dates, linked refs and resources for the existing landmarks, province overviews and learning paths, and only the obvious missing history.

## How to use
1. Paste everything between **Research prompt** and the horizontal rule into a deep-research run (Gemini, Claude Research, etc.). It is long; if the tool truncates, run it once per group of provinces and say so in the prompt.
2. Save the output and hand it to a Claude agent for merging per `MERGING.md`: validate ids, enums and date order with `validate.py`, then fold Section 3 amendments into `backbone.yaml` by hand.
3. Section 1 goes on the root regions (`overview`, `learning_path`). Each node's `summary` and `resources` are the content for the map's side panel.

## Research prompt

I'm building a lineage graph of applied AI engineering that will be rendered as an interactive map. The map has a New World of applied regions (prompting, RAG, agents, post-training and so on) and, across an ocean to the west, **the Old World**: the AI history that led to the 2020s explosion built on the transformer. Each Old World province is an older discipline; each node is a landmark idea; edges record what each node was built on. A backbone of stable ids already exists. This run ENRICHES the Old World: it writes reader content for the landmarks that are already there, fixes their facts, and fills only the obvious gaps.

## Scope
- The Old World holds AI history that led to the transformer-era explosion. It is not a general computing history. Ancestors from outside AI (software engineering, systems security, classic HCI, law and standards) stay as `external:` parents and never become nodes, even when they are real ancestors.
- The line between Old World and New World is "what fed the explosion" versus "the explosion itself". It is a judgment call. Where an existing anchor seems to sit on the wrong side (several post-2020 architecture nodes live here), say so in Amendments rather than moving it.
- Readers are engineers who know today's tools and want to know how we got here. Write for them, not for historians: why the idea mattered, what it unlocked, and where it shows up in today's systems.
- A node is an idea, method or landmark result. Products, datasets, libraries and benchmarks are NOT nodes (list them under `examples`), with one allowed kind of exception: a landmark result that changed the field's direction (AlexNet, AlphaGo) can be a node, named for the result.
- Add new nodes sparingly: about 10–20 across all provinces in total, only for ideas a well-read AI engineer would be surprised to find missing. Before adding one, check the backbone index at the end (ids, names and aliases across ALL regions); never re-create an existing concept under a new id.

Boundary rules (apply these exactly; if you disagree, say so in Amendments):
- Old World scope (non-AI ancestors) → external:: The Old World holds the AI history that led to the 2020s transformer explosion. Ancestors from outside AI (software engineering, systems security, classic HCI, law and standards) stay as external: parents with a why, never as landmarks.
- Architectures (MoE, SSMs) → deep-learning-nlp: Model internals stay in the root unless engineers configure them at serving time.
- Position encodings and context extension → deep-learning-nlp (RoPE); inference-and-serving (context extension): The architecture choice → the root. Rescaling it to run past the training length, set in model and serving configs → Inference (secondary: Adaptation for the fine-tune).

## The provinces and their current landmarks (keep these ids; you may correct their fields)
### Information Retrieval (`information-retrieval`)
Finding relevant material in large collections. Origin of ranking, indexing, and question answering over corpora.
- `bm25` — BM25 (1994, maturity 5; has summary)
- `approximate-nearest-neighbor-search` — Approximate Nearest Neighbor Search (2016-03, maturity 5; has summary)
- `open-domain-qa` — Open-Domain Question Answering (2017-04, maturity 4; has summary)
- `tf-idf` — TF-IDF (1972, maturity 5; has summary)
- `learning-to-rank` — Learning to Rank (2005, maturity 5; has summary)

### Deep Learning and NLP (`deep-learning-nlp`)
Neural networks for language — attention, sequence models, pretraining, transfer learning — that produced the transformer and LLMs. Also holds the few architecture choices engineers actually make (MoE, SSMs).
- `attention-mechanism` — Attention Mechanism (2014-09, maturity 5; has summary)
- `sequence-to-sequence-learning` — Sequence-to-Sequence Learning (2014-09, maturity 5; has summary)
- `transformer-architecture` — Transformer (2017-06, maturity 5; has summary)
- `pretrained-language-models` — Pretrained Language Models (2018-06, maturity 5; has summary)
- `transfer-learning-fine-tuning` — Transfer Learning and Fine-Tuning (2018-01, maturity 5; has summary)
- `knowledge-distillation` — Knowledge Distillation (2015-03, maturity 5; has summary)
- `mixture-of-experts` — Mixture of Experts (2017-01, maturity 4; has summary)
- `state-space-models` — State-Space Models (2021-10, maturity 3; has summary)
- `subword-tokenization` — Subword Tokenization (2015-08, maturity 5; has summary)
- `rotary-position-embeddings` — Rotary Position Embeddings (2021-04, maturity 5; has summary)
- `sparse-attention` — Sparse Attention (2025-02, maturity 3; has summary)
- `perceptron` — Perceptron (1958, maturity 5; has summary)
- `backpropagation` — Backpropagation (1986-10, maturity 5; has summary)
- `lstm` — Long Short-Term Memory (1997-11, maturity 5; has summary)
- `neural-language-models` — Neural Language Models (2003, maturity 5; has summary)
- `word-embeddings` — Word Embeddings (2013-01, maturity 5; has summary)
- `scaling-laws` — Scaling Laws (2020-01, maturity 5; has summary)
- `n-gram-language-models` — N-gram Language Models (1948-07, maturity 5; has summary)
- `statistical-machine-translation` — Statistical Machine Translation (1993, maturity 5; has summary)
- `hidden-markov-models` — Hidden Markov Models for Speech (1975, maturity 5; has summary)
- `hopfield-boltzmann-networks` — Hopfield Networks and Boltzmann Machines (1982-04, maturity 5; has summary)
- `deep-belief-networks` — Deep Belief Networks (2006-07, maturity 5; has summary)

### Symbolic AI and Planning (`symbolic-ai-planning`)
Explicit representations, search, and formal planning. Ancestor of tool use, planning-with-verifiers, and neuro-symbolic hybrids.
- `heuristic-search` — Heuristic Search (1968, maturity 5; has summary)
- `strips-planning` — STRIPS Planning (1971, maturity 5; has summary)
- `pddl` — PDDL (1998, maturity 4; has summary)
- `expert-systems` — Expert Systems (1976, maturity 5; has summary)
- `monte-carlo-tree-search` — Monte Carlo Tree Search (2006, maturity 5; has summary)
- `classical-multi-agent-systems` — Multi-Agent Systems (1995-06, maturity 5; has summary)
- `automated-theorem-proving` — Automated Theorem Proving (1965-01, maturity 5; has summary)

### Reinforcement Learning (`reinforcement-learning`)
Learning from reward through interaction. Ancestor of every preference- and verifier-based post-training method.
- `markov-decision-process` — Markov Decision Process (1957, maturity 5; has summary)
- `policy-gradient-methods` — Policy Gradient Methods (1999, maturity 5; has summary)
- `ppo` — Proximal Policy Optimization (2017-07, maturity 5; has summary)
- `q-learning` — Q-Learning (1992-05, maturity 5; has summary)
- `deep-q-networks` — Deep Q-Networks (2013-12, maturity 5; has summary)
- `alphago` — AlphaGo (2016-01, maturity 5; has summary)

### Knowledge Representation (`knowledge-representation`)
Structured, machine-usable models of facts and relations — semantic networks, ontologies, knowledge graphs.
- `semantic-networks` — Semantic Networks (1968, maturity 5; has summary)
- `knowledge-graphs` — Knowledge Graphs (2012-05, maturity 5; has summary)
- `bayesian-networks` — Bayesian Networks (1988, maturity 5; has summary)

### Human-Computer Interaction (`human-computer-interaction`)
How people work with computational systems. Ancestor of conversational UX, copilots, and human oversight patterns.
- `conversational-agents` — Conversational Agents (1966, maturity 5; has summary)
- `mixed-initiative-interaction` — Mixed-Initiative Interaction (1999, maturity 4; has summary)

### Computer Vision (`computer-vision`)
Teaching machines to see — convolutional networks, the ImageNet breakthrough, and the generative models that learned to draw. Ancestor of vision-language models, image generation, and the deep-learning toolkit itself.
- `convolutional-neural-networks` — Convolutional Neural Networks (1989-12, maturity 5; has summary)
- `alexnet` — AlexNet and the ImageNet Moment (2012, maturity 5; has summary)
- `residual-networks` — Residual Networks (2015-12, maturity 5; has summary)
- `variational-autoencoders` — Variational Autoencoders (2013-12, maturity 5; has summary)
- `generative-adversarial-networks` — Generative Adversarial Networks (2014-06, maturity 5; has summary)
- `vision-transformer` — Vision Transformer (2020-10, maturity 5; has summary)

### Robotics and Control (`robotics-and-control`)
Getting machines to sense and move in the physical world — control, physics simulation, and learning from demonstration. Ancestor of robot foundation models, sim-to-real transfer, and imitation-based training.
- `behavior-cloning` — Behavior Cloning (1989, maturity 5; has summary)
- `dagger` — DAgger (2010-11, maturity 4; has summary)
- `physics-simulation` — Physics Simulation for Robotics (2012, maturity 5; has summary)

## What to do for every existing landmark
- Write a `summary` (2–3 plain-language sentences) where it has none, and check the ones that exist.
- Check `date`. Use the date of the idea's origin, not of a later popular version, and when the anchor is named for a later landmark, say so in `maturity_note`. Flag disagreements in Section 4.
- Give `ref` a link: an arXiv id, a DOI URL (https://doi.org/...) or a publisher or author page you opened. Many current refs are title-only.
- Give 2–4 `resources`: a readable retrospective or explainer, a recorded lecture or talk where one exists (well-known course lectures and Turing Award lectures count), and the primary paper only if it is readable and not already the `ref`.
- Check each anchor's parents, and add Old World parents that are missing. Don't remove an existing edge without arguing for it in Amendments.

## Questions to answer
- For each province: what were its 3–5 turning points, which ideas were superseded, and what did it hand to the transformer era?
- Which threads run between provinces (for example backpropagation into vision and RL, search into game-playing and reasoning, retrieval into question answering)?
- Which Old World ideas are being rediscovered by today's applied regions under new names?

## Leads to evaluate
For each: add it as a node, fold it into an existing anchor as an alias or example, or reject it with a reason.
- none

## Output

Sections 1 and 2 are parsed by a script. Put each in ONE fenced ```yaml block, exactly in the shapes below, with nothing else inside the block. Prose goes outside the blocks.

### Section 1: The Old World and its provinces (for map readers)
First, 150–250 words on the Old World as a whole: how these disciplines, many of them decades old, converged into the deep-learning revival and then the transformer explosion. Then, for each province, 120–200 words of overview and a learning path of 3–5 resources in the order a newcomer should take them.

```yaml
old_world:
  overview: "<150–250 words>"
provinces:
  - id: <province id>
    overview: "<120–200 words>"
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
Old World specifics:
- `region` is a province id: information-retrieval, deep-learning-nlp, symbolic-ai-planning, reinforcement-learning, knowledge-representation, human-computer-interaction, computer-vision, robotics-and-control. New nodes go in an existing province unless you argue for a new one in Amendments.
- Old World landmarks are usually `core` and maturity 5 (they are settled history). Use `detail` only for minor refinements.
- `also` may name an applied region when an Old World idea is still a live, configurable choice there.

### Section 3: Backbone amendments
Anchors to split, merge, rename, re-home or re-date; provinces that are too thin to stand alone (Knowledge Representation and Human-Computer Interaction have 2 landmarks each) or should be renamed; anchors on the wrong side of the Old World / New World line; and `external:` ancestors (listed below) that are really AI and deserve a landmark. Give a reason for each.

### Section 4: Contested history
Cases where credit or dating is disputed (for example backpropagation, attention, LSTM versus earlier recurrent work, who invented the transformer's pieces). Present each side with sources.

### Section 5: Self-check
Report honestly; this output will be verified mechanically afterward.
- every parent id is a backbone id (listed below), a node in this run, or `external:`
- every parent edge has a non-empty `src`
- no new node duplicates an existing backbone node (check names and aliases, not just ids)
- no new node is a non-AI idea
- every `also` value is a region id
- every resource and ref URL was opened, or is marked [unverified]
- every rel value is one of the six allowed
- no child is dated earlier than its parent

Prefer primary sources (papers, author pages, publisher DOIs, university course pages, recorded lectures) over aggregators. Mark anything you could not verify. Do not invent citations.

## Current external: ancestors (real lineage with no landmark yet)
external:adaptive-mixtures-of-local-experts, external:algorithmic-fairness, external:api-gateways, external:backdoor-attacks, external:byte-pair-encoding-compression, external:content-moderation-classifiers, external:control-theory-state-space, external:copyright-and-licensing, external:crowdsourcing, external:data-protection-impact-assessment, external:datasheets-and-documentation, external:digital-signatures, external:digital-watermarking, external:direct-manipulation, external:distributed-tracing, external:elo-rating, external:enterprise-risk-management, external:fasttext-classifiers, external:gdpr, external:held-out-test-sets, external:injection-attacks, external:iso-27001-information-security-management, external:language-server-protocol, external:least-privilege, external:minhash, external:n-gram-overlap-detection, external:named-entity-recognition, external:network-pruning, external:neural-audio-codecs, external:nonequilibrium-thermodynamics-generative-modeling, external:oauth, external:ocr, external:prediction-powered-inference, external:predictive-uncertainty, external:preference-learning, external:prompt-to-prompt, external:requirements-engineering, external:sandboxing-and-isolation, external:security-red-teaming, external:semantic-parsing, external:shared-task-benchmarks, external:software-bill-of-materials, external:sparse-transformers, external:star-self-taught-reasoner, external:statecharts, external:template-engines, external:test-driven-development, external:trust-in-automation, external:web-caching, external:weight-averaging

## Backbone index (all regions: id, then name and aliases; use these ids for cross-region parents)
- information-retrieval: bm25 (BM25; Okapi BM25; sparse retrieval; TF-IDF ranking), approximate-nearest-neighbor-search (Approximate Nearest Neighbor Search; ANN; HNSW; vector indexing), open-domain-qa (Open-Domain Question Answering; retriever-reader QA; DrQA), tf-idf (TF-IDF; inverse document frequency; IDF; term weighting), learning-to-rank (Learning to Rank; LTR; RankNet; LambdaMART; ranking models)
- deep-learning-nlp: attention-mechanism (Attention Mechanism; neural attention), sequence-to-sequence-learning (Sequence-to-Sequence Learning; seq2seq; encoder-decoder), transformer-architecture (Transformer; transformers), pretrained-language-models (Pretrained Language Models; LLMs; foundation models; generative pretraining; BERT; ELMo; masked language modeling), transfer-learning-fine-tuning (Transfer Learning and Fine-Tuning; fine-tuning; ULMFiT), knowledge-distillation (Knowledge Distillation; teacher-student training), mixture-of-experts (Mixture of Experts; MoE; sparse MoE), state-space-models (State-Space Models; SSMs; S4; Mamba; linear-time sequence models), subword-tokenization (Subword Tokenization; tokenization; BPE; byte-pair encoding; tokenizers; SentencePiece; token counting), rotary-position-embeddings (Rotary Position Embeddings; RoPE; RoFormer; rotary embeddings), sparse-attention (Sparse Attention; NSA; Native Sparse Attention; DSA; DeepSeek Sparse Attention; MoBA; block-sparse attention; trainable sparse attention), perceptron (Perceptron; artificial neuron; Rosenblatt perceptron), backpropagation (Backpropagation; backprop; gradient descent through layers; reverse-mode differentiation), lstm (Long Short-Term Memory; LSTM; recurrent neural networks; RNN; GRU), neural-language-models (Neural Language Models; neural probabilistic language model; NPLM), word-embeddings (Word Embeddings; word2vec; GloVe; word vectors; distributed representations), scaling-laws (Scaling Laws; neural scaling laws; Chinchilla scaling; compute-optimal training), n-gram-language-models (N-gram Language Models; statistical language models; Markov language models; Shannon's model of English), statistical-machine-translation (Statistical Machine Translation; SMT; IBM models; phrase-based translation; noisy-channel translation), hidden-markov-models (Hidden Markov Models for Speech; HMM; HMM-GMM acoustic models; Baum-Welch; Viterbi decoding), hopfield-boltzmann-networks (Hopfield Networks and Boltzmann Machines; Hopfield network; Boltzmann machine; restricted Boltzmann machine; RBM; energy-based models), deep-belief-networks (Deep Belief Networks; DBN; greedy layer-wise pretraining; unsupervised pretraining)
- symbolic-ai-planning: heuristic-search (Heuristic Search; A*; best-first search; state-space search), strips-planning (STRIPS Planning; classical planning), pddl (PDDL; Planning Domain Definition Language), expert-systems (Expert Systems; rule-based systems; production systems), monte-carlo-tree-search (Monte Carlo Tree Search; MCTS; UCT), classical-multi-agent-systems (Multi-Agent Systems; intelligent agents; BDI agents; agent communication languages; distributed AI), automated-theorem-proving (Automated Theorem Proving; resolution; logic programming; Prolog; formal verification; proof assistants)
- reinforcement-learning: markov-decision-process (Markov Decision Process; MDP), policy-gradient-methods (Policy Gradient Methods; REINFORCE; actor-critic), ppo (Proximal Policy Optimization; PPO), q-learning (Q-Learning; temporal-difference learning; TD learning; value-based RL), deep-q-networks (Deep Q-Networks; DQN; deep reinforcement learning; Atari DQN), alphago (AlphaGo; AlphaZero; MuZero; self-play)
- knowledge-representation: semantic-networks (Semantic Networks; ontologies; frames), knowledge-graphs (Knowledge Graphs; property graphs; Semantic Web; RDF; OWL; description logics), bayesian-networks (Bayesian Networks; probabilistic graphical models; belief networks; causal graphs)
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

## Reference: edges from the Old World into the New World
- action-chunking --applies--> transformer-architecture
- action-chunking --extends--> behavior-cloning
- agent-to-agent-protocols --replaces--> classical-multi-agent-systems
- audio-language-models --applies--> pretrained-language-models
- autoregressive-decoding --applies--> pretrained-language-models
- chat-interfaces --extends--> conversational-agents
- context-compaction --applies--> pretrained-language-models
- context-window-extension --applies--> transfer-learning-fine-tuning
- context-window-extension --extends--> rotary-position-embeddings
- continued-pretraining --extends--> pretrained-language-models
- continued-pretraining --specializes--> transfer-learning-fine-tuning
- contrastive-image-text-pretraining --applies--> transformer-architecture
- contrastive-image-text-pretraining --applies--> vision-transformer
- copilots --applies--> mixed-initiative-interaction
- copilots --applies--> pretrained-language-models
- cross-embodiment-training --applies--> transfer-learning-fine-tuning
- cross-encoder-reranking --applies--> pretrained-language-models
- cross-encoder-reranking --extends--> bm25
- cross-encoder-reranking --extends--> learning-to-rank
- decision-models --specializes--> pretrained-language-models
- dense-retrieval --combines--> approximate-nearest-neighbor-search
- dense-retrieval --replaces--> bm25
- diffusion-models --replaces--> generative-adversarial-networks
- diffusion-policy --extends--> behavior-cloning
- diffusion-transformers --applies--> transformer-architecture
- document-understanding --applies--> transformer-architecture
- embedding-compression --applies--> approximate-nearest-neighbor-search
- graph-rag --combines--> knowledge-graphs
- grouped-query-attention --specializes--> transformer-architecture
- grpo --specializes--> ppo
- human-ai-interaction-guidelines --extends--> mixed-initiative-interaction
- human-in-the-loop-approval --applies--> mixed-initiative-interaction
- human-video-pretraining --applies--> transfer-learning-fine-tuning
- hybrid-search --combines--> bm25
- interpretability --applies--> transformer-architecture
- io-aware-attention --applies--> transformer-architecture
- language-agent-tree-search --applies--> monte-carlo-tree-search
- latent-world-models --applies--> policy-gradient-methods
- latent-world-models --applies--> variational-autoencoders
- latent-world-models --extends--> markov-decision-process
- learned-sparse-retrieval --applies--> pretrained-language-models
- learned-sparse-retrieval --extends--> bm25
- llm-distillation --applies--> knowledge-distillation
- llm-plus-p --combines--> pddl
- llm-plus-p --combines--> pretrained-language-models
- llm-robot-planning --applies--> pretrained-language-models
- llm-robot-planning --replaces--> strips-planning
- machine-unlearning --applies--> transfer-learning-fine-tuning
- model-parallelism --applies--> mixture-of-experts
- model-parallelism --applies--> transformer-architecture
- model-routing --applies--> mixture-of-experts
- mrkl-systems --applies--> expert-systems
- mrkl-systems --combines--> pretrained-language-models
- multi-agent-systems --applies--> classical-multi-agent-systems
- on-policy-distillation --applies--> dagger
- parameter-efficient-fine-tuning --specializes--> transfer-learning-fine-tuning
- prompt-chaining --applies--> mixed-initiative-interaction
- quiet-star --applies--> policy-gradient-methods
- realtime-voice --combines--> pretrained-language-models
- reasoning-models --applies--> policy-gradient-methods
- reasoning-via-planning --applies--> monte-carlo-tree-search
- retrieval-augmented-generation --combines--> pretrained-language-models
- retrieval-augmented-generation --extends--> open-domain-qa
- rlhf --applies--> policy-gradient-methods
- rlvr --applies--> ppo
- scratchpads --applies--> pretrained-language-models
- semantic-caching --applies--> approximate-nearest-neighbor-search
- sim-to-real-transfer --applies--> physics-simulation
- sim-to-real-transfer --applies--> policy-gradient-methods
- speech-recognition --applies--> sequence-to-sequence-learning
- speech-recognition --replaces--> hidden-markov-models
- supervised-fine-tuning --specializes--> transfer-learning-fine-tuning
- test-time-compute-scaling --extends--> scaling-laws
- text-embeddings --extends--> word-embeddings
- text-embeddings --specializes--> pretrained-language-models
- text-to-sql --specializes--> open-domain-qa
- tree-of-thoughts --combines--> heuristic-search
- video-generation --applies--> transformer-architecture
- vision-language-models --combines--> pretrained-language-models
- vla-reinforcement-learning --applies--> ppo
- weight-quantization --applies--> transformer-architecture
- zero-shot-prompting --applies--> pretrained-language-models
