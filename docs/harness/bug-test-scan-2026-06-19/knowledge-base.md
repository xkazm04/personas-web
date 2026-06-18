# Knowledge Base — blended bug-hunter + test-mastery scan
> Total: 5  (Critical: 0, High: 3, Medium: 2, Low: 0)

## 1. "Reject" resolves a conflict identically to "Accept" in batch review
- **Severity**: High
- **Lens**: bug-hunter
- **Category**: state corruption / logic bug
- **File**: src/app/dashboard/knowledge/MemoriesView.tsx:48-55
- **Scenario**: A user opens the conflict-resolution modal, marks a memory conflict as **reject**, and clicks Apply.
- **Root cause**: `handleApply` iterates `Object.keys(decisions)` and unconditionally adds every id to `resolvedIds`, never inspecting the `BatchDecision` value. `BatchReviewModal` distinguishes `"accept"` vs `"reject"` (`BatchReviewModal.tsx:14`), but the consumer flattens both into "resolved → `hasConflict: false`". A reject and an accept produce the exact same outcome — the conflict silently disappears from the list and the conflict count drops.
- **Impact**: data/decision loss — the operator's reject choice is discarded; a rejected (still-conflicting) memory is presented as resolved. The whole accept/reject UI is success-theater.
- **Fix sketch**: branch on the value: `for (const [id, d] of Object.entries(decisions)) if (d === "accept") next.add(id);` (or track rejected ids separately and surface them), so only accepted conflicts are cleared.

## 2. Zero unit harness for the four business-critical pure derivation/layout/format modules
- **Severity**: High
- **Lens**: test-mastery
- **Category**: coverage gap / missing quality gate
- **File**: src/app/dashboard/knowledge/knowledge-cluster-graph/knowledgeClusterLayout.ts:4-64, knowledge-dense-table/knowledgeDenseFormat.ts:3-32, knowledge-dense-table/buildKnowledgeColumns.ts:6-19, KnowledgeDenseTable.tsx:93-118
- **Scenario**: Any refactor of cluster coordinate math, success-rate division, time/cost/duration formatting, or the dense-table comparator ships with zero automated assertions — the only runner is Playwright e2e, which never exercises these pure functions in isolation.
- **Root cause**: pure, deterministic, high-fan-out logic (`computeKnowledgeNodePositions`, `computeKnowledgeEdges`, `knowledgeSuccessRate`, `relativeKnowledgeTime`, `formatKnowledgeDuration`, `formatKnowledgeCost`, `compareKnowledgePatterns`) sits one layer below where the e2e tests stop, so every invariant (divide-by-zero guarded, sort transitive, edges symmetric/no self-loops, NaN-free positions) is unverified.
- **Impact**: false-confidence — a sort-direction flip, a `total === 0` regression, or a NaN coordinate would pass CI silently. These feed the visible table/graph the user trusts for cost/quality decisions.
- **Fix sketch**: add a unit runner (vitest) and an LLM-generatable batch asserting: success-rate=0 on 0/0; comparator is antisymmetric & handles `localeCompare`>1; `computeKnowledgeEdges` yields no self-loops and `n(n-1)/2` per persona; positions are finite for empty/degenerate dimensions.

## 3. `relativeKnowledgeTime` / `relativeTime` renders "NaNm ago" on malformed or missing timestamps
- **Severity**: Medium
- **Lens**: bug-hunter
- **Category**: silent failure / NaN in render
- **File**: src/app/dashboard/knowledge/knowledge-dense-table/knowledgeDenseFormat.ts:3-11 (+ consumers KnowledgePatternRow.tsx:58, KnowledgePatternDetailPanel.tsx:46)
- **Scenario**: In real/supabase mode, `mapSyncedPattern` sets `lastSeen: k.updatedAt` from an arbitrary synced string (useKnowledgeData.ts:74). If that field is empty/non-ISO/null, `new Date(iso).getTime()` is `NaN`.
- **Root cause**: `Date.now() - NaN = NaN`, `Math.floor(NaN/60_000) = NaN`, every branch comparison is false, so the function falls through to `${Math.floor(hours/24)}d ago` → renders the literal string `"NaNd ago"`. No validation of the parsed date. Same flaw in the shared `relativeTime`/sort path (`compareKnowledgePatterns` `lastSeen` case does `NaN - NaN`, breaking sort order for such rows).
- **Impact**: UX degradation on the real-data path — cells show `NaNd ago`; affected rows sort unpredictably because NaN comparisons are never ordered.
- **Fix sketch**: `const ms = new Date(iso).getTime(); if (!Number.isFinite(ms)) return "—";` before computing `diff`; treat negative `diff` (future) as `"now"`.

## 4. Cluster node layout collapses to a vertical line for single-member clusters and clamps spread to confidence only
- **Severity**: Medium
- **Lens**: bug-hunter
- **Category**: cluster-graph layout / coordinate math
- **File**: src/app/dashboard/knowledge/knowledge-cluster-graph/knowledgeClusterLayout.ts:31-40
- **Scenario**: A type filter (or sparse synced data) leaves a cluster with exactly 1 member, or several members share identical confidence.
- **Root cause**: `memberAngle = (index / members.length) * 2π`. For a single member that is `0` (points due east) at `dist = spreadRadius*(0.4 + confidence*0.6)`, so the node is pushed off the cluster center instead of centered. When N members share one confidence value, every node lands at the same `dist`, and because angle is evenly spaced this is usually fine — but the radial distance encodes *only* confidence, so two patterns with equal confidence but very different success rates render at indistinguishable radii. There is no de-overlap pass; with the larger `28→58px` nodes (KnowledgeGraphNode.tsx:28) and `spreadRadius = 60 + N*16`, low-N high-confidence nodes can overlap the cluster label/each other.
- **Impact**: UX degradation — single-node clusters look detached/misplaced and dense clusters overlap, undermining the graph's read.
- **Fix sketch**: center a sole member (`if (members.length === 1) place at clusterCx/clusterCy`); offset `memberAngle` by a per-cluster phase and add a small index-based radial jitter so equal-confidence nodes separate.

## 5. Quadratic edge generation has no cap — large per-persona pattern counts produce an edge/DOM explosion
- **Severity**: Medium
- **Lens**: bug-hunter
- **Category**: performance / boundary
- **File**: src/app/dashboard/knowledge/knowledge-cluster-graph/knowledgeClusterLayout.ts:46-64 (rendered at KnowledgeClusterSvg.tsx:33-56)
- **Scenario**: Real/supabase mode returns many patterns for one persona (the mock fixtures are tiny, hiding this). All patterns sharing a `personaName` get fully connected.
- **Root cause**: the inner double loop emits `n(n-1)/2` edges per persona with no upper bound; e.g. 60 patterns for one agent = 1,770 animated `<motion.line>` nodes, each running a `pathLength` 0→1 spring on mount. Edges are keyed only by `from-to` and recomputed on every filter change. There is also no guard that `from`/`to` resolve (handled defensively at SVG:35-36, but the work is already done).
- **Impact**: UX/perf degradation — mount-time animation jank and heavy SVG on dense real data; the cost is invisible in tests because fixtures never hit the threshold.
- **Fix sketch**: cap edges per persona (e.g. nearest-neighbor or top-K by shared confidence) or skip personas above a member threshold; memoize/disable the per-line mount spring beyond a count budget.
