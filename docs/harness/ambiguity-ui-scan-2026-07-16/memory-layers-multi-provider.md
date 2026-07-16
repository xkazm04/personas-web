# Memory Layers & Multi-Provider AI — ambiguity+ui scan
> Total: 5 findings (Critical: 0, High: 3, Medium: 2, Low: 0)

## 1. Reduced-motion users get a permanently empty, idle Persona Matrix with no way to reveal content
- **Severity**: High
- **Agent**: ui_perfectionist
- **Category**: reduced-motion-content-blackout
- **File**: `src/components/feature-sections/designMatrixShared.tsx:107`
- **Scenario**: A visitor with `prefers-reduced-motion` enabled scrolls to the Design Engine section. The IntersectionObserver effect returns early (`if (prefersReducedMotion || hasRun.current) return;`), so `runBuild()` never fires: all 8 cells stay `pending` (skeleton bars), the header dot stays grey "idle", the counter reads "0/8 cells resolved", and the intent box shows only the placeholder. The "replay" escape hatch is also unreachable because it renders only when `phase === "done"` (`design-engine-matrix/index.tsx:69`).
- **Root cause**: Reduced motion was implemented as "never run the build" instead of "skip the animation but show the result". No static end-state fallback exists, and the only manual trigger is gated behind the state that can only be reached by the animation.
- **Impact**: The section's entire informational payload — the 8 dimension values, the ask/answer interplay, the "deploy-ready" resolution — is withheld from reduced-motion users forever. They see a broken-looking skeleton, not a calmer version of the same content. This is a genuine accessibility regression, not a graceful degradation.
- **Fix sketch**: In `usePersonaMatrixBuild`, when `prefersReducedMotion` is true, synchronously set `userTyped = USER_PROMPT`, all statuses to `filled` (and `answered` cells resolved), and `phase = "done"` on first intersection — no timeouts. Keep the replay button working by making `replay` run this instant path too (or show replay whenever `phase !== "running"`).

## 2. The Importance/depth axis asserts a mapping the visualization doesn't have
- **Severity**: High
- **Agent**: ambiguity_guardian
- **Category**: axis-contradicts-data-model
- **File**: `src/components/feature-sections/memory-layers-stack/components/DepthScale.tsx:13`
- **Scenario**: The left rail renders a vertical "Importance" scale ticked 10→8→6→4→2 with an "↓ depth" arrow, spanning the four stacked layers. A viewer reads this as "top layer = importance 10, bottom layer = importance 2". But the layers are fixed *categories* (learning/preference/technical/constraint in `CATEGORIES` order): the importance-10 memory ("Deploy window: Tue–Thu…", constraint) sits in the *deepest* layer, while the top learning layer holds 6–8s. Importance only orders pills *horizontally within* a layer (`GeologicalLayer.tsx:69`).
- **Root cause**: The geological metaphor changed from importance-stratified to category-stratified at some point, but the depth scale (and the section copy "Important lessons rise to the top" in `MemoryLayers.tsx:36`) still describe the old model. No recorded decision explains what the vertical axis means.
- **Impact**: The diagram teaches the wrong mental model of the actual memory system — anyone reading the numbers sees a 10-importance item plotted at the "2" end of the axis, which reads as either a bug or a dishonest visualization on a page whose whole point is credibility.
- **Fix sketch**: Either (a) relabel the rail to what is true — e.g. rotate label to "Memory layers", drop numeric ticks, keep the depth arrow — or (b) actually stratify: order layers by max/mean importance per category and keep the numeric scale. Align the `MemoryLayers.tsx` intro sentence with whichever is chosen.

## 3. Memory feed evicts by recency (not importance) and its cycling pool produces duplicate pills
- **Severity**: High
- **Agent**: ambiguity_guardian
- **Category**: eviction-contradicts-pitch
- **File**: `src/components/feature-sections/memoryShared.tsx:94`
- **Scenario**: Leave the section on screen. `addMemory` fires every 5.5–8s, drawing from a 5-item pool with `poolIdxRef.current % newMemoryPool.length` — the pool cycles forever. Pruning keeps only the 3 *newest* per category (`sort((a,b) => b.addedAt - a.addedAt)` then `slice(0, 3)`). After ~1 pool cycle (~35s) the importance-10 "Deploy window" memory is evicted by an importance-9 newcomer; after ~2 cycles a layer shows two or three pills with *identical titles* (same template, new ids), e.g. "No deploys on Friday after 2pm" twice in the constraint layer.
- **Root cause**: The retention rule (keep 3 newest per category) and the infinite modulo cycle are unstated implementation shortcuts; nothing records why recency wins over importance in a demo whose headline is "Important lessons rise to the top", and nothing deduplicates re-drawn templates.
- **Impact**: A visitor who actually watches the flagship diagram sees the system throw away its most important memory and then hoard duplicates — the demo visibly contradicts the product claim it illustrates.
- **Fix sketch**: Evict by lowest importance (tie-break oldest) instead of oldest — one-line sort change — and either stop the interval after the pool is exhausted or replace evicted entries only with not-currently-shown templates (filter pool by titles present). Name the `3` (`MAX_PER_LAYER`) with a comment stating the retention rule.

## 4. The matrix build is a ~42-second choreography of unexplained magic timings, with completion states most users never reach
- **Severity**: Medium
- **Agent**: ambiguity_guardian
- **Category**: undocumented-choreography-timings
- **File**: `src/components/feature-sections/designMatrixShared.tsx:64`
- **Scenario**: `runBuild` accumulates bare constants: `typeSpeed = 90` × 59 chars (~5.3s), `+1200`, then per cell `+1650` (think) `+1200` (fill), plus `+4200`/`+1800` for the two question cells, `+600` tail — total ≈ 42s before `phase === "done"`. The footer reads "building" and the status dot pulses amber the whole time; "ready to deploy", "deploy-ready", and the replay button exist only after the 42-second mark.
- **Root cause**: Six timing constants encode a deliberate pacing decision (presumably "let each cell breathe"), but none are named, none have a rationale comment, and the aggregate duration is nowhere stated — so nobody editing one number can know the total they're producing, and nothing records that ~42s was intended rather than accidental.
- **Impact**: Typical scroll-through visitors see two or three cells resolve and leave with the demo apparently stuck "building"; the payoff states are effectively dead UI. Future edits to any one constant silently reshape a 40-second experience.
- **Fix sketch**: Extract named constants (`TYPE_MS`, `THINK_MS`, `ASK_DWELL_MS`, …) with a comment stating the target total; compress to a 12–15s budget (questions dominate — 4200ms dwell can halve); optionally let a click on the matrix or a "skip" affordance jump to the done state (which finding 1's instant path provides for free).

## 5. Micro-labels, badges, and metadata all use `text-base`, flattening the type hierarchy across both showcases
- **Severity**: Medium
- **Agent**: ui_perfectionist
- **Category**: typography-hierarchy-flattened
- **File**: `src/components/feature-sections/MultiProviderAI.tsx:66`
- **Scenario**: Text that is semantically caption/overline-level renders at body size (16px) everywhere in this context: the "PRIMARY ENGINE" / "BRING YOUR OWN MODEL" uppercase badges sit in `py-0.5` pills at `text-base font-semibold`; the model-tier chips (`effort`), `cortical-layers-view` header, "X memories", DepthScale tick numerals, StackLegend labels, matrix footer "cells resolved", and MemoryPill metadata are all `text-base`. In MemoryPill (`MemoryPill.tsx:52-60`) the memory title and its `imp 7` metadata are the *same size*, distinguished only by opacity.
- **Root cause**: Looks like a wholesale `text-xs/sm → text-base` promotion (the matrix components got a proper `FLUID_MONO` clamp in `design-engine-matrix/data.ts:21`, but the memory stack and MultiProviderAI kept flat `text-base`). Uppercase+wide-tracking styles designed for 11–12px are now rendered at 16px inside padding sized for the smaller type.
- **Impact**: No size contrast between primary content and chrome: badges look shouty and overflow their pill vertical rhythm, pill titles don't stand out from their source/importance line, and dense UI (legend, depth ticks, footers) consumes disproportionate space on mobile. The section reads noisier and less crafted than the matrix cards beside it.
- **Fix sketch**: Reintroduce two lower tiers and apply mechanically: `text-xs` (or the existing `FLUID_MONO` clamp) for uppercase badges, mono captions, tick numerals, and pill metadata; `text-sm` for pill titles and chip labels; keep `text-base` for sentences. Reusing `FLUID_MONO` from `design-engine-matrix/data.ts` in the memory stack keeps the two showcases consistent.
