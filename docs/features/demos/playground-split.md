# Split-View Playground
> An "Agent Mind" homepage demo: pick a sample prompt and watch a syntax-highlighted prompt editor drive a simulated parse → tools → execute → verify → result flowchart, ending in a four-dimension result card. · **Route:** `/` homepage section (anchor `id="playground-split"`, scroll-map/navbar label "Agent Mind"; wrapped in `<div id="playground">`) · **Status:** Live (demo section, fully simulated)

## What it does

On the marketing homepage, the **"The Agent Mind"** section lets a visitor click one of four canned prompts — *Triage my Gmail*, *Review this PR*, *Summarize Slack*, *Optimize my schedule* — and watch the agent "think" in real time across two side-by-side panels:

- **Left — prompt editor** (`prompt-editor`): a faux code editor with line numbers shows the selected prompt with keyword syntax highlighting (cyan keywords like `inbox`, `PR`, `#142`, `calendar`), then reveals the detected intent (e.g. `email_triage + auto_reply`), the selected tools as chips, and — once the run finishes — a green **Result** card.
- **Right — agent mind** (`agent-mind`): an SVG flowchart that animates a fixed pipeline — **Parse Intent → Select Tools → (per-prompt tool nodes) → Execute → Verify → Result** — lighting each node cyan as it goes active and emerald as it completes, with connector lines that draw themselves in.

A header progress bar (cyan→purple→emerald gradient with a glowing comet dot) plus a footer elapsed/remaining timer (`1.4s` / `~2.1s`) telegraph the ~5s run. When it's done, a **Reset** chip appears. The whole thing is a scripted simulation — no model is called and nothing is sent anywhere.

The result card always reports the same four dimensions the platform actually emits: **Message** (drafted action), **Human review** (an approval gate), **Event emitted** (a bus event), and **Memory learned** (a persisted preference) — so the demo doubles as a teaser for those product capabilities.

## How it works

**Composition.** `PlaygroundSplit` (`index.tsx:14`) is the client entry. It calls `usePlaygroundSimulation()` for all state, renders the `ThemedChip` example selector + Reset button, then a `TerminalPanel` whose body is a 2-col grid of `PromptEditorPanel` (left) and `AgentMindPanel` (right). A `reduced` flag from `useReducedMotion() ?? false` (`index.tsx:15`) is threaded down to every animated child.

**Selection → simulation.** Clicking a chip calls `handleExampleClick(i)` (`use-playground-simulation.ts:140`), which sets `activeExample` and runs `runSimulation(idx)`. `runSimulation` (`:58`) validates the index (reporting an invalid index once via `captureExceptionScrubbed`), builds the flow nodes with `buildFlowNodes(example)` (`data.ts:108`), sets `phase: "running"`, starts a 50 ms `setInterval` elapsed-time ticker, and schedules the whole animation **up front** as a chain of `setTimeout`s.

**The scripted timeline.** The step order is `[["parse"], ["select"], toolIds, ["execute"], ["verify"], ["result"]]` (`:92`). For each step, two timers fire: one flips the group's nodes to `status: "active"` after the cumulative `STEP_DELAYS` offset, a second flips them to `"done"` after `STEP_DELAYS[i] * DONE_RATIO` (0.7). `STEP_DELAYS = [500,700,900,800,600,500]` and `TOTAL_DURATION_MS` is their sum plus 0.7× the last step (`:9-13`). The final step's done-timer sets `phase: "done"`, stops the ticker, and pins `elapsedMs` to the total.

**Prompt editor panel** (`PromptEditorPanel.tsx`) renders `TerminalChrome` (status `ready`/`parsing`/`parsed`), a 5-line gutter, the prompt via `SyntaxPrompt`, then progressively reveals the `// Detected intent` line (running/done), the **Selected Tools** chips (spring-staggered), and `ResultCapabilitiesList` (done only). `SyntaxPrompt` (`SyntaxPrompt.tsx`) splits the prompt on a keyword regex and wraps matches in `text-brand-cyan`.

**Agent mind panel** (`AgentMindPanel.tsx`) is an idle placeholder until `phase !== "idle"`, then an SVG (`viewBox 0 0 600 x`) of `ConnectionLine` edges + `FlowNodeCard` nodes. `computeEdges` (`AgentMindPanel.tsx:9`) derives edges from node ids (parse→select, select→each tool, each tool→execute, execute→verify, verify→result). Each `FlowNodeCard` is a `foreignObject` glass card whose border/icon/colour switch on `status` (pending = muted + tool icon, active = cyan + spinner + pulsing ring + shimmer, done = emerald + check); `getStatusColor` (`data.ts:188`) supplies the border/glow classes. `ConnectionLine` draws a cubic bézier and animates `pathLength 0→1` when its target node goes active/done.

**Layout note.** The flow geometry in `buildFlowNodes` is fixed pixel coords (`centerX = 280`, `rowGap = 90`, tool spacing 190). Tool nodes get colours by index (cyan / purple / rose). The first/last node `y` drives `svgHeight`. Note `execute`'s `parentId` is `"tool-merge"` — a node id that never exists, so it's effectively a label-only hint; the real execute-edges are wired by id in `computeEdges`, not by `parentId`.

## Key files

| File | Role |
| --- | --- |
| `src/components/sections/playground-split/index.tsx` | Client entry; selector chips, Reset, `TerminalPanel`, header progress bar + footer timer, 2-col panel grid |
| `src/components/sections/playground-split/use-playground-simulation.ts` | All state + the scripted `setTimeout` timeline, elapsed-time ticker, tab-visibility abort, reset |
| `src/components/sections/playground-split/data.ts` | `examples[]` (4 prompts), `RESULT_DIMENSIONS`, `buildFlowNodes()`, `getStatusColor()`, `SYNTAX_KEYWORDS` |
| `src/components/sections/playground-split/types.ts` | `ExamplePrompt`, `FlowNode`, `NodeStatus`, `PlaygroundPhase`, `ResultCapabilities`, `ResultDimension`, `ToolNode` |
| `src/components/sections/playground-split/components/PromptEditorPanel.tsx` | Left panel: gutter, prompt, intent reveal, tool chips, result list |
| `src/components/sections/playground-split/components/SyntaxPrompt.tsx` | Keyword syntax highlighter (regex split → cyan keyword spans) |
| `src/components/sections/playground-split/components/ResultCapabilitiesList.tsx` | Done-phase Result card mapping `RESULT_DIMENSIONS` → the example's `result` |
| `src/components/sections/playground-split/components/AgentMindPanel.tsx` | Right panel: idle placeholder + SVG flowchart; `computeEdges` derives edges from node ids |
| `src/components/sections/playground-split/components/FlowNodeCard.tsx` | A single SVG `foreignObject` node card; status-driven colour, spinner, pulse ring, shimmer |
| `src/components/sections/playground-split/components/ConnectionLine.tsx` | Bézier edge whose `pathLength` animates in when the target node activates/completes |

## Data & state
- **Source:** 100% static module data. `examples` (4 prompts, each with `prompt`, `intentText`, `tools[]`, and a fixed `result`) and `RESULT_DIMENSIONS` are literal arrays in `data.ts`. No fetch, no Supabase, no orchestrator, no model call — the "execution" is a fixed `setTimeout` script (`TOTAL_DURATION_MS ≈ 4.35s`).
- **Stores:** None (no Zustand). All state is local to `usePlaygroundSimulation`: `activeExample`, `nodes`, `phase` (`idle`|`running`|`done`), `isRunning`, `elapsedMs`, plus `timeoutsRef`/`timerRef` for cleanup. `reduced` is local to `index.tsx`.
- **API routes:** None.
- **Types:** `ExamplePrompt = { label, icon, iconColor, prompt, intentText, tools: ToolNode[], result: ResultCapabilities }`; `ResultCapabilities = { messages, humanReview, events, memories }`; `FlowNode = { id, label, icon, status, x, y, parentId?, color? }`; `NodeStatus = "pending"|"active"|"done"`; `PlaygroundPhase = "idle"|"running"|"done"`; `ResultDimension = { key: keyof ResultCapabilities, label, icon, color }`. (`types.ts`)

## Integration points
- **Homepage mount.** Registered as `LazyPlaygroundSplit` in `src/components/sections/lazy.tsx:149` (`createLazySection(() => import("@/components/sections/playground-split"), SectionSkeleton, { ssr: false })`) and placed as the third homepage section in `src/app/page.tsx:51` with `gate: true`, so it renders inside `<StageSection>` → `<LazyMount minHeight={640}>` and its chunk loads ~1 viewport before scroll. `page.tsx` wraps the stage in `<div id="playground">` (the `wrapperId`), while the section's own `SectionWrapper` emits `id="playground-split"`.
- **Nav anchor.** `playground-split` is the registered landing-section id in `src/lib/constants.ts:15` with label **"Agent Mind"** — it is the scroll-map dot + navbar active-section target (not the outer `playground` wrapper id).
- **`SectionWrapper`.** The body renders inside `SectionWrapper id="playground-split"`, a `whileInView` stagger container that reveals `variants={fadeUp}` children once. The selector row and the diagram wrapper (`data-tour-diagram="agent-mind"`) inherit this one-shot reveal.
- **Shared primitives.** `SectionIntro`, `ThemedChip`, `TerminalPanel` (`@/components/primitives`), `TerminalChrome` (`@/components/TerminalChrome`), the `fadeUp` variant (`@/lib/animations`), `captureExceptionScrubbed` (`@/lib/sentry-pii`), `usePageVisibility` (`@/hooks/usePageVisibility`), and lucide + `@/components/icons/brand-icons` (`Github`) icons.
- **Guided tour hook.** The diagram carries `data-tour-diagram="agent-mind"` (`index.tsx:74`), a hook for the Athena guided tour — see [guided-tour](../marketing/guided-tour.md).
- **Sibling demo.** In `context-map.json` this is bundled with the pipeline-timeline sim under the **"Split & Pipeline Playground"** context; they are independent components and documented separately. See [Pipeline Timeline Playground](playground-timeline.md).

## Conventions & gotchas
- **i18n — NOT wired (real gap).** Despite the repo's 14-locale lockstep rule, this entire section is **hardcoded English** with **no** `useTranslation()` / `t.*` access anywhere under `playground-split/`. The `SectionIntro` heading "The Agent" / gradient "Mind" and its description (`index.tsx:40-42`), the "Split View" / "Executing..." / "execution complete" footer labels, the "Reset" button, every `examples[]` prompt/intent/tool-label/result string in `data.ts`, the `RESULT_DIMENSIONS` labels, the `TerminalChrome` titles/statuses, "Selected Tools", "// Agent instruction", "// Detected intent:", "Select a prompt to begin...", "Agent mind visualization", "Result", etc. are literal English. Localizing means lifting all of it into `src/i18n/en.ts` and hand-translating into the 13 other locales; treat any new string here as the same debt until it's routed through `t.*`.
- **Animation gating is honored.** `index.tsx:15` reads `useReducedMotion()` and threads `reduced` into `PromptEditorPanel`, `AgentMindPanel`, `FlowNodeCard`, and `ConnectionLine`. Under reduced motion: the progress-bar `width`/comet dot transition is disabled and the looping comet is not rendered (`index.tsx:147-162`); `FlowNodeCard` drops its pulse ring + shimmer and zeroes the card entrance duration; `ConnectionLine` sets `pathLength` transition `duration: 0`; the prompt/intent/tool reveals zero their stagger delays. Satisfies `custom-animation/require-animation-gating`.
- **Tab-background abort, not pause.** Because the timeline is fully scheduled up front, a backgrounded tab would silently finish off-screen. `usePlaygroundSimulation` watches `usePageVisibility()`; if the tab hides mid-run it **clears all timers and resets to idle** (`use-playground-simulation.ts:44-56`), and `handleExampleClick` refuses to start while `document.hidden` (`:146`). On return the user must re-trigger — intended UX, documented inline.
- **Timers scheduled up front (cleanup matters).** All `setTimeout`s + the 50 ms interval are stored in `timeoutsRef`/`timerRef` and torn down by `clearAll()` on unmount, reset, re-select, and tab-hide. If you add steps, push their timers into `timeoutsRef` or they'll leak past unmount.
- **`isRunning` guards re-entry.** Chips are `disabled={isRunning}` and `handleExampleClick` early-returns while running, so you can't interrupt a run; **Reset** only appears at `phase === "done"`. To switch prompts mid-run you must let it finish (or it auto-resets if the tab hides).
- **`parentId: "tool-merge"` is a dangling reference.** `buildFlowNodes` gives the `execute` node `parentId: "tool-merge"` (`data.ts:160`), but no `tool-merge` node exists. It's harmless — `computeEdges` ignores `parentId` and wires edges by explicit id lookup — but don't assume `parentId` is the source of truth for edges.
- **React 19 purity.** `Date.now()` is used only inside callbacks/intervals (`runSimulation`), never in render or a `useMemo` factory, so it's compliant. `invalidIdxReported` is a module-level latch so the Sentry report fires at most once per session. If you add time/random to render, use the lazy `useState(() => …)` initializer pattern.
- **Sentry PII.** The one capture path is `captureExceptionScrubbed(...)` for an invalid example index (`:69`); its message contains only `examples.length`, no user data — safe under `sentry-pii` scrubbing.
- **Semantic tokens.** Cards use `border-glass`/`border-glass-hover`, `text-foreground`, `text-muted`/`text-muted-dark`, `text-brand-cyan`/`-emerald`/`-purple`. Raw hex appears only in decorative SVG strokes, the gradient progress bar, and the per-tool/per-dimension `color` data (node ring, result-icon tints) — not in body text. Several text utilities use `/60` opacity (the AA floor); stay at or above `/60`.

## Related docs
- [Pipeline Timeline Playground](playground-timeline.md)
- [Visual Flow Composer & Playground](flow-composer.md)
- [Feature index](../INDEX.md)
