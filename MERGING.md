# Merging a deep dive into the atlas

The playbook for turning a deep-research report (from a `deep-dives/<region>.md` guide) into atlas content. Prompting and Context Engineering was merged this way (commit a200556); use it as the worked example.

## 1. Read the report

- Gemini share links render client-side: WebFetch and curl get an empty shell. Read them with the browser (`get_page_text`).
- Check that the report is for the region you think it is.

## 2. Review before touching `backbone.yaml`

The report's own self-check is not reliable; it claimed "no duplicates" and "resources verified" when neither was true. Check these by hand:

- **Duplicates across regions.** Compare every new node against the names and aliases of all nodes, not just ids. Examples caught so far: scratchpad prompting = `scratchpads`, self-refine = `reflexion`, contextual retrieval already in Retrieval, eval-driven prompting = `eval-driven-development`, structured note-taking ≈ `agent-memory`. Fold these in as aliases or examples instead of adding nodes.
- **Anchor parents.** Runs rewrite the existing anchors' parents and drop cross-region edges (six were dropped in the Prompting run). Keep the existing parents. Take only text fields (summary, resources) and argued corrections (dates, refs) from the report.
- **Edge direction and dates.** Look for a child dated before its parent, which usually means the edge is backwards (progressive disclosure → agent skills).
- **Refs.** Spot-check arXiv ids against the title. Several were wrong or unrelated, and one wrong ref was used to justify a re-date.
- **`also` values** must be region ids, not node ids.
- **Maturity** of new nodes runs high; adjust it with judgment.
- **Layer.** `core` only for what a newcomer needs on the overview. Expect zero to two new core nodes per region; everything else is `detail`. Each new core node with maturity 3+ adds a town at z1.
- **Amendments (Section 3)** need the user's review before any structural change.

## 3. Merge

- Insert new nodes after the region's last anchor under a `# ---- deep dive (<date>) ----` comment, with `status: added`.
- Give every anchor in the region a `summary` (plain language, 2–3 sentences, no hype). The panel shows the summary *instead of* `desc`, so the summary must carry everything the desc says.
- Keep each panel field in its own role (SPEC §5.3): `maturity_note` explains the maturity, not the technique; `examples` are short names of tools or products (plain text, no URLs yet); the `ref` already appears as the first "Learn more" entry, so `resources` never repeat it.
- Region: `overview` from Section 1, edited for plain language. Leave `learning_path` for step 4.
- Remove the region's entries from `LEADS` in `make_guides.py` once the run has evaluated them.
- Run `python3 validate.py` (0 errors, 0 warnings), then `python3 make_guides.py`.

## 4. Resources pass (separate from the report)

Deep-research runs give thin resources: mostly the ref repeated, no talks, stale or unopened URLs. Fill `resources` and the region `learning_path` in a separate pass with a background agent. Brief it to:

- find 2–4 per node, not repeating the node's `ref`: one practitioner write-up (an engineering blog, docs or cookbook page, or a known practitioner's post), one recorded talk where a good one exists (search for talks deliberately), and optionally a survey or second paper;
- verify every URL: curl with a browser User-Agent and check the page `<title>`; YouTube through `https://www.youtube.com/oembed?url=…`; arXiv on the abs page. Record redirect targets and the page's own title. Never invent URLs;
- write YAML to the scratchpad (`learning_path:` plus `resources: {node-id: [...]}`), not into the repo;
- build a 4–6 item learning path, in reading order, each item with a `why`.

Spot-check a sample of its URLs yourself before inserting them.

## 5. Settle and check the map

- `node map/build.mjs settle --dry-run` first. A new node that would settle "offshore near <node in another region>" has only cross-region parents. Look for a true in-region ancestor to add (context ordering got few-shot prompting) rather than let it land in another region's sea. Maturity 1–2 islets offshore are intended.
- `node map/build.mjs`, then read the label report. A new "titles that could not avoid overlap" warning means a new z1 symbol pushed a title. Pin the displaced title in `map/curation.yaml` (`regions: {id: {label: [x, y]}}`), trying its previous position first (`git show HEAD:map/public/map.json`).
- `python3 map/acceptance_test.py`.
- Browser check (`python3 map/serve.py 8765`): the region panel (`#<region-id>`), a detail node's panel with Learn more, and a phone frame. Chrome won't shrink below desktop width, so load the page in a 390×844 iframe. Screenshots taken during a fly-to show labels mid-fade, so wait before judging.

## 6. Finish

Update `SPEC.md` if the schema or viewer changed. Commit to main, then republish the artifact (see CLAUDE.md).
