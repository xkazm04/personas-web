# Visual Flow Composer & Playground
> Interactive node/wire flow builder (event-bus demo) + standalone agent terminal-sim page · **Route:** `/playground` (page) · `/how` (FlowComposer, inside EventBusShowcase) · **Status:** Live

## What it does
Two distinct interactive demos that both let a visitor "feel" how Personas works in the browser, no install required.

- **Flow Composer** — an SVG canvas where producer integrations (top row) and consumer integrations (bottom row) sit either side of a central **EVENT QUEUE** bar. You drag nodes to reposition, click a producer then a consumer to draw a wire (an event route), hover a node or wire to delete it, add new integrations from a tool sidebar, and **Share** the flow as a URL (the whole graph is base64-encoded into the `#flow=` hash). Animated dots travel each wire through the queue to show events flowing. It opens from a "Try it yourself — build a flow" button inside the message-hub section on `/how`.
- **Agent Playground** (`/playground`) — pick one of six task cards (Triage inbox, Review PR, Summarize Slack, Optimize schedule, Draft release notes, Research competitors) and watch a fake terminal stream the agent "thinking" line by line, with a live elapsed-time counter and a reset button. Pure scripted simulation — no real agent runs.

## How it works
**Flow Composer.** `FlowComposer` (re-exported from `src/components/FlowComposer.tsx` → `flow-composer/index.tsx`) is the view; all state lives in the `useFlowComposer` hook. Node/wire geometry is a fixed `100×100` SVG viewBox: producers at `y=16`, consumers at `y=84`, the queue at `y=50`. The hook holds `nodes`/`wires` arrays, seeds them from the URL hash on first render (`decodeFlow`) or falls back to `DEFAULT_NODES`/`DEFAULT_WIRES`, and debounces writing the encoded state back to the hash (500 ms). Pointer drag updates a node's `x` via a `requestAnimationFrame`-throttled `handlePointerMove`. Wiring is a two-click state machine (`wiringFrom`): first click on a producer arms it, click on a consumer commits a `{from,to,label}` wire (deduped against the freshest state). The render is decomposed into small SVG sub-components: `FlowCanvasDefs` (glow filter, queue gradient, clip), `EventQueueBar`, `FlowWires` (the dashed path + the framer-motion travelling dot + delete hotspot), `NodeConnectors` (faint node→queue tethers), `FlowNodes` (the circles, labels, per-node delete button), plus `FlowHeader`, `ToolSidebar`, `FlowLegend`, and `FlowCTA` (shown once at least one wire exists).

**Playground.** `PlaygroundPage` is a client component with one piece of state — `activePrompt: number | null`. `PromptSelector` renders the six `PROMPTS` cards; clicking one sets the index. `TerminalSim` reacts to the active index: a `useEffect` schedules a chain of `setTimeout`s, appending one scripted `OutputLine` per tick (250–400 ms jittered, 100 ms for blank spacer lines), runs a 100 ms `setInterval` elapsed timer, auto-scrolls, and flips to a "Complete" state on the last line. Reset clears all timeouts and nulls the active index. The reset-on-prop-change uses the React 19 prev-state pattern (`if (active !== prevActive) { … }`) instead of a `setState`-in-effect.

## Key files
| File | Role |
| --- | --- |
| `src/app/playground/page.tsx` | `/playground` page shell: hero, `PromptSelector`, `TerminalSim`, CTA |
| `src/app/playground/layout.tsx` | Route metadata (title/OG/canonical) — note: hardcoded English, see gotchas |
| `src/app/playground/data.ts` | `PROMPTS` scripts, `OutputLine` types, line colors/icons — hardcoded English |
| `src/app/playground/PromptSelector.tsx` | Six task cards; sets active prompt index |
| `src/app/playground/TerminalSim.tsx` | Scripted terminal stream, elapsed timer, reduced-motion gating |
| `src/components/FlowComposer.tsx` | One-line re-export of `flow-composer/index` |
| `src/components/flow-composer/index.tsx` | Composer view: assembles SVG canvas + header/sidebar/legend/CTA |
| `src/components/flow-composer/use-flow-composer.ts` | All composer state: nodes, wires, drag, wiring, hash sync, share |
| `src/components/flow-composer/data.ts` | `TOOL_CATALOGUE` (with icons), SVG constants, defaults, `encode/decodeFlow`, id seeding |
| `src/components/flow-composer/types.ts` | `ToolDef`, `CanvasNode`, `Wire`, `FlowState` |
| `src/components/flow-composer/components/EventQueueBar.tsx` | Central queue bar + label + arrow |
| `src/components/flow-composer/components/FlowWires.tsx` | Dashed route path, animated event dot, wire delete |
| `src/components/flow-composer/components/FlowNodes.tsx` | Node circles, labels, per-node delete, focus rings |
| `src/components/flow-composer/components/NodeConnectors.tsx` | Faint node→queue tether lines |
| `src/components/flow-composer/components/FlowCanvasDefs.tsx` | SVG `<defs>`: glow filter, queue gradient, clip |
| `src/components/flow-composer/components/FlowHeader.tsx` | Title + Add Node / Share / Close buttons |
| `src/components/flow-composer/components/ToolSidebar.tsx` | Integration picker (producer/consumer add) |
| `src/components/flow-composer/components/FlowLegend.tsx` | Three-item interaction legend |
| `src/components/flow-composer/components/FlowCTA.tsx` | "Build this flow in Personas" download CTA |
| `src/components/sections/event-bus-showcase/index.tsx` | Mounts `FlowComposer` (dynamic, `ssr:false`) behind a toggle |

## Data & state
- **Source:** fully client-side, no network. Playground reads the static `PROMPTS` array (`src/app/playground/data.ts`); Flow Composer reads `TOOL_CATALOGUE`/`DEFAULT_NODES`/`DEFAULT_WIRES` (`flow-composer/data.ts`) or a graph decoded from `window.location.hash`. **Stores:** none (no Zustand) — `PlaygroundPage` holds `activePrompt` in `useState`; `TerminalSim` holds `lines/isRunning/isDone/elapsed`; `useFlowComposer` holds `nodes/wires/sidebarOpen/wiringFrom/shareToast/dragNode`. **API routes:** none. **Types:** `OutputLine`/`OutputLineType`/`PromptCard` (playground `data.ts`); `ToolDef`/`CanvasNode`/`Wire`/`FlowState` (flow-composer `types.ts`); `ShareToast` (the hook).
- **Persistence:** the Flow Composer serializes `{nodes,wires}` to the URL hash via `encodeFlow` (`btoa(encodeURIComponent(json))`) and restores via `decodeFlow`, which validates node ids against `/^n\d+$/` and rejects duplicates. `seedNextId` bumps the module-level id counter past any hash-supplied id so `addNode` can't collide with an attacker-chosen `n101`. Share copies the full URL to clipboard with a manual-copy fallback toast when `navigator.clipboard` fails.

## Integration points
- **EventBusShowcase** (`src/components/sections/event-bus-showcase/index.tsx`) is the only mount site for `FlowComposer` — it dynamic-imports it with `ssr:false` + a spinner fallback, and opens it automatically when the page loads with a `#flow=` hash. That showcase renders on **`/how`** via `LazyEventBusShowcase` (`src/app/how/page.tsx:67`), not on the homepage.
- Shared primitives: `TerminalPanel` + `BlinkingCursor` (`src/components/primitives`), `TerminalChrome`, `GradientText`, `SectionHeading`, `SVGFocusRingCircle` (`src/components/SVGFocusRing`), brand icons (`src/components/icons/brand-icons`).
- The Playground page brings its own `Navbar`/`Footer` and links out to `/#download` and `/templates`.

## Conventions & gotchas
- **i18n violation (Flow Composer).** Every user-facing string in the composer is **hardcoded English**, not routed through `useTranslation()`/`en.ts`: e.g. `"Flow Composer"`, the drag/wire instructions, "Add Node"/"Share", `aria-label="Close Flow Composer"`, "Available Integrations", "URL copied to clipboard", "Copy failed — press Ctrl+C", "Build this flow in Personas", the legend strings, and the SVG canvas hints ("Click \"Add Node\" to start building", "EVENT QUEUE"). This breaks the 14-locale rule in `CLAUDE.md` — the whole subtree needs extraction into `en.ts` + 13 hand-translations before it's compliant. The `/playground` page is mostly translated (`t.playgroundPage.*`), but the **`PROMPTS` script text and intent/tool labels in `data.ts` are also hardcoded English** (arguably acceptable as faux-terminal content, but the card `title`/`description` are visible UI), and `layout.tsx` metadata (`title`, `description`, OG) is hardcoded English.
- **Dead / stale code.** `src/lib/tool-catalogue.ts` documents itself as the single source "Both FlowComposer and EventBusShowcase derive their tool lists from this," and exports `CORE_TOOL_IDS` / `CORE_TOOLS` ("The core set used by FlowComposer"). In reality **FlowComposer does not import it** — `flow-composer/data.ts` defines its *own* `TOOL_CATALOGUE` (the one with lucide `icon`s). `CORE_TOOL_IDS`/`CORE_TOOLS` have **no importers in `src/`**, so they are dead exports and the comments are misleading. The two 20-tool lists are duplicated and can drift.
- **Animation gating.** `TerminalSim` correctly imports `useReducedMotion`: it skips the rAF-deferred smooth scroll (direct `scrollTop` set) and disables the elapsed-digit pop animation when reduced. `useFlowComposer`'s `handlePointerMove` uses `requestAnimationFrame` purely as a pointer-move throttle and carries an explicit `// eslint-disable-next-line custom-animation/require-animation-gating` with a justifying comment — intentional, not a miss. **However**, `FlowWires` runs a perpetual `repeat: Infinity` framer-motion dot and `FlowNodes` runs a native SVG `<animate>` pulse on the wiring source ring; neither consults `useReducedMotion`. The lint rule only flags raw `requestAnimationFrame`/`cancelAnimationFrame`, so these slip past it but still violate convention #3 for users who prefer reduced motion.
- **Raw color / token violations.** The SVG layer is full of raw `rgba(...)` and hex fills (queue gradient stops, `tool.color` + `${tool.color}15`, red delete affordances `rgba(239,68,68,…)`, `var(--text-disabled)`/`var(--text-secondary)` are fine but the rgba literals are not semantic tokens). `FlowCTA` uses `bg-black/80` and `text-white` directly (both discouraged by convention #2). `ToolSidebar` uses `bg-black/90`. These are deliberate canvas/brand-color choices but they are token-rule exceptions worth knowing before "fixing."
- **React 19.** Both `TerminalSim` (active→prevActive) and `EventBusShowcase`/`useFlowComposer` follow the prev-state and lazy-`useState(() => …)` patterns; `addNode` deliberately calls `nextId()` *outside* the updater because strict-mode double-invokes updaters. `Math.random()` is used inside the `TerminalSim` effect body (not in render/`useMemo`), which is allowed.
- **Timer cleanup.** `TerminalSim` tracks all `setTimeout` ids in `timeoutsRef` and clears them on reset, prop change, and unmount; the hash-sync and elapsed timers are likewise cleared. No leak, but note the simulation can't be paused — only reset.

## Related docs
- [Orchestration Hub](orchestration-hub.md)
- [Split & Pipeline Playground](playground-split.md)
- [Feature index](../INDEX.md)
