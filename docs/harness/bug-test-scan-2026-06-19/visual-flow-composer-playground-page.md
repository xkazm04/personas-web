# Visual Flow Composer & Playground Page — blended bug-hunter + test-mastery scan
> Total: 5  (Critical: 0, High: 2, Medium: 3, Low: 0)

## 1. `decodeFlow` validates node ids but never validates wires — hash-restored flows can reference phantom nodes
- **Severity**: High
- **Lens**: bug-hunter
- **Category**: input validation / state corruption
- **File**: src/components/flow-composer/data.ts:87-110 (consumed by src/components/flow-composer/use-flow-composer.ts:24-43)
- **Scenario**: A user opens a shared `#flow=...` URL (the explicit feature of the Share button). The hash decodes to a state whose `nodes` array passes the id/dup check, but whose `wires` array contains entries whose `from`/`to` point at ids not present in `nodes` (e.g. hand-edited or a flow that was shared, then had nodes deleted before re-encoding edge cases), or whose `from`/`to`/`label` are non-strings.
- **Root cause**: The decoder hardened the `nodes` array (id shape + dedup) after the prior scan, but `wires` is cast straight through (`return parsed as {...}`) with zero validation. The design assumes wires are always internally consistent with nodes, which a hostile/garbage hash breaks. `nodePos` silently falls back to `{x:50, y:QUEUE_Y}` for any unknown id, so every dangling wire collapses onto the same coordinate and `wire.label` (an attacker-controlled string) renders directly into the SVG.
- **Impact**: state corruption / UX degradation — phantom overlapping wires drawn to (50, QUEUE_Y), `removeWire` keyed on `(from,to)` cannot cleanly target overlapping dangles, and a non-string `label`/`from` propagates into the React key `` `${wire.from}-${wire.to}` `` and the encode round-trip. No crash, but the composer renders a corrupt, partially-unremovable graph from untrusted input.
- **Fix sketch**: In `decodeFlow`, after building the validated node-id `Set`, filter/reject wires: require `typeof w.from === "string" && typeof w.to === "string" && typeof w.label === "string"` and `seen.has(w.from) && seen.has(w.to)`; drop (or reject the whole state) on any failure before the `as` cast.

## 2. No unit harness for the share-encode/decode invariants — the one untrusted-input boundary in this feature is e2e-only and effectively untested
- **Severity**: High
- **Lens**: test-mastery
- **Category**: coverage gap on a security/data-integrity boundary
- **File**: src/components/flow-composer/data.ts:79-110 (`encodeFlow`/`decodeFlow`/`seedNextId`)
- **Scenario**: `decodeFlow` is the only function in this whole context that parses untrusted external input (a URL hash). It carries hand-written security comments ("cannot collide with an attacker-chosen id", "reject duplicate node ids") — i.e. it encodes real invariants — yet there is zero test asserting any of them, and there is no unit runner at all. The e2e suite (`e2e/playground.spec.ts`) covers only the playground page and never loads `#flow=`, never mounts FlowComposer.
- **Root cause**: The project has Playwright e2e only; pure logic with security-critical branches (malformed base64, non-array nodes/wires, bad id shape, duplicate ids, the encode→decode round-trip, `seedNextId` max bump) has no fast harness, so regressions in these branches ship silently. The prior bug-hunter scan added the hardening but no gate to keep it.
- **Impact**: false-confidence / latent-regression — Finding #1's gap, and any future loosening of the id regex or dedup, would pass CI undetected.
- **Fix sketch**: Add a unit runner (vitest) and a small batch over `data.ts`: round-trip `encodeFlow(decodeFlow(x))` identity, `decodeFlow` returns `null` for `atob`-garbage / non-array nodes / bad-id / duplicate-id, `seedNextId` advances `_nextId` past the max `n<digits>` and ignores malformed ids. These are pure and LLM-generatable; they lock the exact invariants the comments promise.

## 3. TerminalSim elapsed clock disagrees with the hard-coded "Complete in X.Xs" result line
- **Severity**: Medium
- **Lens**: bug-hunter
- **Category**: timing bug / success theater (false data)
- **File**: src/app/playground/TerminalSim.tsx:77-108 ; src/app/playground/data.ts:68,89,110,131,153,173
- **Scenario**: A visitor runs any prompt. The header clock (`elapsed`, ticked every 100ms from `runStart`) measures real wall-clock time until the last `setTimeout` fires. The final output line is static text like `"Complete in 6.7s"` (Research competitors) or `"Complete in 2.9s"` (Optimize schedule). The actual schedule is `sum(per-line delays)` where each non-empty line is `250 + Math.random()*150` ms — roughly 4.0–5.0s for every prompt regardless of its baked number.
- **Root cause**: Two independent notions of "elapsed" exist: a live timer driven by random per-line delays, and a hard-coded duration string in the data. Nothing ties the random schedule to the advertised number, so the live clock and the printed "Complete in N.Xs" routinely diverge (e.g. clock reads ~4.6s while text claims 6.7s, or claims 2.9s while the clock already passed it).
- **Impact**: UX degradation / credibility — a demo whose own on-screen stopwatch contradicts its printed result undercuts the "watch the agent think" pitch. Visible on every run of the headline interactive feature.
- **Fix sketch**: Either freeze the displayed clock to the prompt's declared duration on completion (parse/move the number into `PromptCard`), or drop the static "Complete in" text and render `Complete in ${(elapsed/1000).toFixed(1)}s` from the live timer so the two always agree.

## 4. `addNode` x-position only spaces against the last node in array order, so new nodes silently stack on top of each other
- **Severity**: Medium
- **Lens**: bug-hunter
- **Category**: edge case / layout state
- **File**: src/components/flow-composer/use-flow-composer.ts:121-138
- **Scenario**: User adds several nodes of one side, drags some around, then adds more (or adds via the sidebar after a hash-restored flow). New x = `min(92, (last-in-array node's x) + 18)`. Because it keys off the *array-order last* node's x — not the max x, and not collision-aware — once any node sits near x≥74, every subsequent add clamps to 92 and they pile up at the exact same coordinate. Dragging a node then adding another can also place the new one left of or directly over existing nodes.
- **Root cause**: The placement heuristic assumes nodes are appended left-to-right and never repositioned, so "last element + 18" approximates a free slot. Drag (`handlePointerMove` mutates `x`) and the 92-clamp both break that assumption; there is no overlap check.
- **Impact**: UX degradation — overlapping node cards become individually unclickable/undeletable (the delete "x" hit-targets coincide), making added nodes appear to "not add" or be stuck. Low-frequency but reachable in normal exploration.
- **Fix sketch**: Compute slot from the max x of same-side nodes (`Math.max(...existing.map(n=>n.x))`), and if the clamped result equals an existing node's x, nudge to the first free gap (or distribute evenly across 8–92).

## 5. FlowComposer drag/wire interactions and hash share/restore have zero automated coverage on a business-critical demo path
- **Severity**: Medium
- **Lens**: test-mastery
- **Category**: coverage gap on a key conversion surface
- **File**: src/components/flow-composer/index.tsx (whole component) ; src/components/flow-composer/use-flow-composer.ts:100-181
- **Scenario**: FlowComposer is the headline "Try it yourself — build a flow" interactive on the event-bus marketing section and is the thing the Share/CTA ("Build this flow in Personas") funnels from. No e2e test mounts it: add-node, producer→consumer wiring, the wire-dedup guard (use-flow-composer.ts:169-172), remove-node-cascades-wires (142-147), keyboard activation (Enter/Space), and the share-toast manual-fallback path (68-90) are all unverified.
- **Root cause**: e2e exists only for the standalone /playground page; the composer lives behind a "compose" toggle in the event-bus showcase and was never added to the Playwright suite, leaving the interactive conversion path (wiring + share URL) untested end-to-end.
- **Impact**: false-confidence — a regression in wiring, the duplicate-wire dedup, the remove cascade, or clipboard fallback would ship invisibly on a primary demo/CTA path. Also leaves Findings #1/#4 with no behavioral safety net.
- **Fix sketch**: Add an `e2e/flow-composer.spec.ts`: open the showcase compose mode, add a producer + consumer, wire them (assert one wire + CTA "ready to import"), click the same pair twice (assert no duplicate wire), remove a node (assert its wires vanish), and load a known-good `#flow=` URL asserting restored node/wire counts.
