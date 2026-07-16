# Knowledge Base — ambiguity+ui scan
> Total: 5 findings (Critical: 0, High: 3, Medium: 1, Low: 1)

## 1. Real-mode mapper silently falsifies data: unknown types coerced, usage stats fabricated
- **Severity**: High
- **Agent**: ambiguity_guardian
- **Category**: silent-data-coercion
- **File**: `src/app/dashboard/knowledge/useKnowledgeData.ts:40`
- **Scenario**: In real/supabase mode, any synced pattern whose `knowledge_type` isn't one of the 5 hardcoded display tokens is silently rebranded as `tool_sequence` (`normalizeKnowledgeType`, line 40-44); unknown memory categories become `config` (line 47-51). Meanwhile `mapSyncedMemory` (lines 88-96) hardcodes `usageCount: 0`, `status: "active"`, `hasConflict: false` — and `MemoryCard.tsx:14` then renders "0 uses" as if it were a measured fact.
- **Root cause**: The desktop sync vocabulary is wider than the web display union, and the coercion strategy (default-to-first-member) plus fabricated placeholder fields were chosen without an "unknown/untracked" representation; the reasoning lives only in scattered comments.
- **Impact**: An operator dashboard that misclassifies patterns (wrong icon, wrong cluster, wrong filter bucket, wrong table grouping) and reports invented usage numbers. A `failure_pattern`-style new type shown as a cyan tool-sequence is actively misleading, not just cosmetic.
- **Fix sketch**: Add an `"other"`/`"unknown"` display bucket instead of defaulting to `tool_sequence`/`config` (config maps already exist per type — one more entry). For untracked fields, make them optional on `MemoryItem` and have `MemoryCard` omit the uses/lastUsed segment when absent rather than printing `0 uses`.

## 2. Cluster-graph legends are hardcoded to mock data and don't match what's drawn
- **Severity**: High
- **Agent**: ui_perfectionist
- **Category**: legend-data-mismatch
- **File**: `src/app/dashboard/knowledge/knowledge-cluster-graph/knowledgeClusterConfig.ts:65`
- **Scenario**: `PERSONA_COLORS` is a static map of the 5 mock persona names. In real mode, actual persona names come from `api.listPersonas()`, so every edge falls to the `#64748b` fallback (`KnowledgeClusterSvg.tsx:37`) while `KnowledgeClusterLegends.tsx:11` still renders "ResearchAgent, CodeReviewer, DataProcessor, NotifyBot, ReportGen" — personas that don't exist in the tenant. Separately, the node-size legend (`KnowledgeClusterLegends.tsx:28-38`) shows 8/14px white circles, while actual nodes are 28-58px colored circles (`KnowledgeGraphNode.tsx:28`) — and confidence is double-encoded as distance from cluster center too (`knowledgeClusterLayout.ts:35`), which the legend never mentions.
- **Root cause**: Legend content was authored against the mock fixture instead of being derived from the same data/config the renderer uses.
- **Impact**: In real mode the legend lists phantom agents and all edges are one indistinguishable gray, destroying the graph's main affordance (tracing which agent links patterns). The size legend misleads even in demo mode.
- **Fix sketch**: Derive persona→color at render time (stable hash of persona name into a palette, or assign from a palette array in first-seen order) and pass the resulting entries to the legend so legend and edges always agree. Render the size legend with the real `28 + confidence*30` formula at two sample confidences.

## 3. Cluster layout has no bounds: node positions overflow and get clipped with real data volumes
- **Severity**: High
- **Agent**: ambiguity_guardian
- **Category**: unbounded-layout-magic-numbers
- **File**: `src/app/dashboard/knowledge/knowledge-cluster-graph/knowledgeClusterLayout.ts:31`
- **Scenario**: `spreadRadius = 60 + members.length * 16` grows linearly and unbounded. The cluster center already sits at `min(w,h)*0.34` from the middle; with ~15+ patterns of one type (plausible for real synced data — mock has few), nodes land past the container edge. The parent is `overflow-hidden` (`KnowledgeClusterGraph.tsx:68`), so those nodes are clipped: invisible and unclickable, with no scroll, zoom, or pan escape hatch. The initial `{width: 800, height: 500}` fallback also renders one frame at a wrong size before ResizeObserver fires.
- **Root cause**: Layout constants (60, 16, 0.34, 0.4/0.6 confidence split) were tuned to the mock fixture size; no clamping to container bounds and no recorded assumption about maximum cluster size.
- **Impact**: In real/supabase mode the graph silently drops data — the top bar says "Nodes 40" while fewer are visible, undermining trust in the whole view.
- **Fix sketch**: Clamp `spreadRadius` so `radius + spreadRadius + nodeMaxR + labelPad <= min(w,h)/2` (scale down when exceeded), or switch member placement to concentric rings once a cluster exceeds ~8 members. Document the fixture-size assumption next to the constants.

## 4. Type config and formatters duplicated between dense-table and cluster-graph (already drifting)
- **Severity**: Medium
- **Agent**: ui_perfectionist
- **Category**: duplicated-config-modules
- **File**: `src/app/dashboard/knowledge/knowledge-dense-table/knowledgeDenseConfig.ts:5`
- **Scenario**: `KNOWLEDGE_TYPE_CONFIG` (dense table) and `KNOWLEDGE_CLUSTER_TYPE_CONFIG` (cluster graph, `knowledgeClusterConfig.ts:12`) are byte-identical except for `clusterAngle`. `knowledgeSuccessRate` exists twice (`knowledgeDenseFormat.ts:23` and `knowledgeClusterLayout.ts:4`). Relative time already drifts: the row and dense detail panel use local `relativeKnowledgeTime` (`knowledgeDenseFormat.ts:3`, English-only "5m ago") while the cluster detail panel uses the shared `relativeTime` from `@/lib/format` — two formats for the same field on the same page.
- **Root cause**: The two views were extracted into sibling folders and each grew its own copy of shared per-type styling and math instead of a common module.
- **Impact**: Any type-color/icon change or new knowledge type (see finding 1's fix) must be made in two places; a missed one produces a page where the table and the graph disagree on color/icon for the same type. The time-format drift is already user-visible.
- **Fix sketch**: Hoist one `knowledgeTypeConfig.ts` (base record + `clusterAngle` layered in by the graph), one `knowledgeSuccessRate`, and standardize both views on `@/lib/format`'s `relativeTime`/`formatCost`/`formatDuration`, deleting the local copies.

## 5. Context map drift: `derived.ts` listed for this context does not exist
- **Severity**: Low
- **Agent**: ambiguity_guardian
- **Category**: context-map-drift
- **File**: `src/app/dashboard/knowledge/derived.ts:1`
- **Scenario**: The Knowledge Base context file list includes `src/app/dashboard/knowledge/derived.ts`, but the file is absent from the repo; the other 26 listed files exist. Its apparent responsibilities (derived stats/mapping) now live in `useKnowledgeData.ts`, `knowledgeDenseFormat.ts`, and `knowledgeClusterLayout.ts`.
- **Root cause**: The context map wasn't refreshed after a refactor that removed or split `derived.ts` into the per-view folders.
- **Impact**: Automated scans and agents targeting this context waste effort or, worse, "recreate" a module the codebase deliberately dissolved; the context map under-describes actual file ownership.
- **Fix sketch**: Regenerate the Knowledge Base context entry: drop `derived.ts`, keep the current 26 files. No code change needed.
