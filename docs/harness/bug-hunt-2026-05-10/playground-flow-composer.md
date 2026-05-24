# Bug Hunter — Playground & Flow Composer

> Total: 7 findings (Critical: 0, High: 3, Medium: 3, Low: 1)
> Scope: 15 files
> Date: 2026-05-10

## 1. Drag pointer-capture targets a child SVG element that disappears mid-drag, freezing the node

- **Severity**: High
- **Category**: Race condition / animation lifecycle
- **File**: `src/components/flow-composer/index.tsx:141-145` (and re-render in `FlowNodes.tsx:62-83`)
- **Scenario**: User starts dragging a node by pressing on the inner colored `<circle>`/`<text>`. `setDragNode(id)` then triggers a re-render that updates `cx`/`cy` of every child element — but `setPointerCapture` was bound to the specific `e.target` element. Because every keyed `<g>` child re-mounts its inner circle/text on `node.x` change, the captured target's identity stays the same DOM node only as long as React reuses it. If `wiringFrom` toggles or another re-render replaces the captured element (e.g. simultaneous wire creation, or an `AnimatePresence` toast appearing — same React tree), the captured pointer's element no longer fires `pointermove` to the SVG ancestor in some browsers, producing a "stuck" drag where the node freezes mid-canvas. Additionally, `e.target` may be the inner `<text>` "PRODUCER" label rather than the `<g>` — capture on a text node behaves inconsistently across Safari/Firefox.
- **Root cause**: Pointer capture is applied to whatever child the user happened to press on, not to the `<g>` group nor the SVG root. There is no `releasePointerCapture` on `pointerup`, no `pointercancel` handler, and no fallback if the captured element unmounts.
- **Impact**: Stuck drag state (`dragNode !== null`); subsequent clicks no-op because `handleNodeClick` early-returns when `dragNode` is truthy; user must reload page.
- **Fix sketch**: Capture on the SVG root (`svgRef.current.setPointerCapture(e.pointerId)`) instead of `e.target`. Add `onPointerCancel={handlePointerUp}` on the svg. On `handlePointerUp`, also call `releasePointerCapture` defensively.

## 2. Node deletion can leave a dangling `wiringFrom` pointing at the deleted producer; first wire-completion click then silently fizzles

- **Severity**: High
- **Category**: Silent failure / latent state
- **File**: `src/components/flow-composer/use-flow-composer.ts:140-147` and `:149-177`
- **Scenario**: `removeNode` only clears `wiringFrom` when the deleted node *is* the wiring source. But if the source still exists and the user instead deletes its intended consumer mid-wire, then clicks a new consumer, `handleNodeClick` runs `nodes.find((n) => n.id === wiringFrom)?.toolId ?? ""`. That works only because the producer is still present — but consider the inverse: when `wiringFrom` is being deleted via the close button on the source itself, the explicit clear works; however, when the *user* clicks the producer first (sets `wiringFrom`), then opens the sidebar and adds a new node which closes the sidebar and triggers a re-render, then clicks a *different producer* expecting to re-arm wiring, the click hits the second-arm branch (`node.side === "consumer"` is false) and does nothing — `wiringFrom` is never reset, even though the user has visually moved on. Hover state in `FlowNodes` only highlights the original.
- **Root cause**: `handleNodeClick` has only two branches (no `wiringFrom` → producer arms; with `wiringFrom` → consumer completes). Clicking a *second producer* while wiring is active is a no-op with no feedback and no state change.
- **Impact**: User believes the second click re-armed wiring, then their next consumer click attaches the wire to the *wrong* (original) producer.
- **Fix sketch**: When `wiringFrom` is set and the user clicks another producer, either (a) re-arm to that producer, or (b) cancel wiring. Either is better than the current silent no-op. Also surface visual feedback on click of an invalid target.

## 3. Hash sync writes on every drag-frame render, flooding `history.replaceState` and growing the URL unboundedly during drag

- **Severity**: Medium
- **Category**: Race / performance / silent failure
- **File**: `src/components/flow-composer/use-flow-composer.ts:54-66`
- **Scenario**: `handlePointerMove` calls `setNodes` every animation frame during a drag. The `useEffect` watching `[nodes, wires]` fires after every commit, scheduling a 500ms debounced `replaceState`. The debounce *does* coalesce — but during a continuous drag the timer is constantly reset, so **the URL never updates while dragging**. When the user finally pauses, the encoded payload includes whatever transient `x` value the drag landed on. Worse, with many nodes (say 20+) the `JSON.stringify + btoa(encodeURIComponent(...))` runs synchronously inside the effect on *every* node-position state change (not debounced — the encode happens inside the timer, which is fine), but the `useEffect` itself rebuilds the closure on every render. More critically, `replaceState` with extremely long hashes (>64 KB on a large flow) is silently capped by some browsers, corrupting share URLs. There is no length guard.
- **Root cause**: No size cap on encoded payload; debounce timer resets on every `nodes` mutation, so live-drag state is never persisted; encoder runs synchronously on the main thread for huge graphs.
- **Impact**: On a large graph, share URL may exceed browser limits and silently truncate; on a slow device, every drag-end stalls the main thread for tens of ms.
- **Fix sketch**: Skip hash sync while `dragNode` is non-null (only sync on drag-end). Add a max-byte guard on `encoded` before `replaceState` and surface a toast if exceeded.

## 4. `decodeFlow` never validates `wires` — a malformed share URL can render wires pointing at non-existent nodes

- **Severity**: High
- **Category**: Latent failure / malformed graph
- **File**: `src/components/flow-composer/data.ts:87-110`, used at `use-flow-composer.ts:25-43`
- **Scenario**: Decoder validates that `parsed.nodes` is an array with unique `n\d+` IDs, but `parsed.wires` is accepted as long as it is *any* array. An attacker-crafted (or older-version) hash like `{"nodes":[{...n1...}],"wires":[{"from":"n1","to":"n999","label":"x"}]}` decodes successfully. `nodePos("n999")` then returns `{x:50, y:QUEUE_Y}`, drawing a wire from `n1` straight into the queue bar with no consumer endpoint and a hover-clickable region overlapping other UI. Also, `wire.label` is rendered as text without sanitization (SVG `<text>` is safe from XSS, but a 5000-char label corrupts the layout).
- **Root cause**: Validation pass on nodes was added (with comment about ID collision) but never extended to wires.
- **Impact**: Broken visual state from any old/forged share link; wire-removal handler key collision (`${wire.from}-${wire.to}` non-unique if duplicates) causes React key warnings; potential layout DoS with long labels.
- **Fix sketch**: After validating nodes, build the seen-set of node IDs and reject any wire whose `from`/`to` is missing, whose `from` is a consumer, whose `to` is a producer, whose label isn't a string ≤ 64 chars, or whose `(from,to)` pair duplicates another wire.

## 5. Animated wire `<motion.circle>` runs forever — never paused on tab-hidden, offscreen, or during drag — burning CPU on idle pages

- **Severity**: Medium
- **Category**: Animation lifecycle / silent failure
- **File**: `src/components/flow-composer/components/FlowWires.tsx:34-45`
- **Scenario**: Each wire spawns a `motion.circle` with `repeat: Infinity, duration: 2.5`. With N wires, N infinite RAF tweens run continuously. There is no `IntersectionObserver` to pause when the composer scrolls offscreen, no `visibilitychange` listener to pause on hidden tabs, and crucially no pause during a drag — so the moving event-pulse animates against constantly-changing `cx`/`cy` keyframes (because `from.x`/`to.x` change every drag frame), which framer-motion handles by restarting the tween from initial keyframes on every prop change. On a 30-node graph during drag, this triggers thousands of tween-restart operations per second.
- **Root cause**: Animation state is unconditional; keyframe array embeds live drag coordinates as transition props.
- **Impact**: Battery/CPU drain on idle pages; visible jank during drag on large graphs.
- **Fix sketch**: Memoize the keyframe array; pause the animation while `dragNode` is set (pass a `paused` prop); use an `IntersectionObserver` to pause when canvas is offscreen; add `visibilitychange` to pause on hidden tab.

## 6. `handleNodeClick` reads `nodes` from a stale closure when wire-completion races with a node deletion

- **Severity**: Medium
- **Category**: Race condition
- **File**: `src/components/flow-composer/use-flow-composer.ts:149-177`
- **Scenario**: User clicks producer (arms `wiringFrom`); while wiring, another React event (e.g. delete-button click bubbling, or rapid double-click) fires `removeNode(wiringFrom)` between the click on the consumer and the `setWires` updater running. The closure captures `nodes` at click time, so `nodes.find((n) => n.id === wiringFrom)` still returns the deleted node, generating a wire whose `from` references a node that no longer exists. The fresh-state guard `prev.some(...)` is on `wires`, not on `nodes`, so it cannot catch this. The wire is then created but `nodePos(wire.from)` returns the fallback `{x:50, y:QUEUE_Y}`.
- **Root cause**: `setWires` updater doesn't validate that `from` and `to` still exist in current node state.
- **Impact**: Phantom wire pointing at deleted node; survives across re-renders; user must manually delete it, but its `(from,to)` key may not be reachable through hover if both endpoints render off-canvas.
- **Fix sketch**: Use a single state slice `{nodes, wires}` or have `setWires` updater also receive nodes via `setNodes((prevNodes) => { ...; setWires((prevWires) => ...validate against prevNodes...) })` — better, derive: drop the wire creation if either endpoint is missing in latest state.

## 7. ToolSidebar's "Add as consumer" check uses `some(consumer)` but disables main button on `alreadyOnCanvas` regardless of side, hiding the only path to add a `both`-category tool's consumer side

- **Severity**: Low
- **Category**: Edge case / latent UX failure
- **File**: `src/components/flow-composer/components/ToolSidebar.tsx:25-66`
- **Scenario**: For a `category: "both"` tool (e.g. Gmail) that already has a producer node on canvas, `alreadyOnCanvas` is `true` and `tool.category !== "both"` is `false`, so the button stays enabled — clicking it adds *another producer* (because the side derivation is `tool.category === "consumer" ? "consumer" : "producer"`). The "+C" button only appears if no consumer exists yet for that tool. So the user can keep adding producers but the "+C" affordance is small and easily missed; meanwhile, after a consumer is added, the "+C" disappears and the only remaining button silently keeps adding more producers — a visual surprise. Conversely, for a `category: "consumer"` tool that already has a node, the button is disabled and the user cannot add a second consumer of the same type, even though nothing in the data model forbids it.
- **Root cause**: Sidebar conflates "tool already on canvas" with "tool can be added again," and the side-derivation logic ignores user intent.
- **Impact**: Confusing add behavior, especially after `decodeFlow` restores a state with multiple consumers of the same tool — those become unreachable from the UI for further duplication.
- **Fix sketch**: Show two explicit buttons (Add as Producer / Add as Consumer) whose enabled/disabled state is computed per-side, gated by `tool.category`.
