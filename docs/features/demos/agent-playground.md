# Agent Playground
> Marketing demo that simulates a live agent run — a terminal form with example chips that replays a scripted, animated execution trace. · **Route:** dev-only `/preview/agent-playground` (not on the public landing page — see gotchas) · **Status:** Live

## What it does
Lets a visitor type a natural-language instruction (or pick one of four example chips) and watch a Personas agent appear to parse, plan, select tools, and execute — streamed line by line into a faux terminal. It is a self-contained illusion: every "run" is a canned, hand-authored transcript, not a real orchestrator call. The four examples are Gmail triage, PR review, Slack summary, and schedule optimization. Anything not matching an example falls back to a "no scripted simulation matches" message that points the user to the real app.

## How it works
- Four `ExampleChips` render across the top; clicking one fills the input with its prompt and immediately runs that example's transcript. Chips are `disabled` while a run is in flight.
- The `PlaygroundForm` (terminal prompt row) takes free-text. On submit, `handleSubmit` does a loose match: it lowercases the input and finds the first example whose label's first word is contained in the text (e.g. "Triage" → Gmail example). A match replays that transcript; no match replays `noMatchLines`.
- `runSimulation` schedules one `setTimeout` per `SimLine`, accumulating each line's `delay` into a cumulative offset, so lines appear sequentially with authored pacing. Each fired timeout appends its line to `visibleLines` and auto-scrolls the terminal to the bottom. The last line flips `isRunning → false` and `phase → "done"`.
- `phase` (`idle | running | done`) drives the chrome status (`ready`/`executing`/`complete`), the footer "execution complete" chip, the form's Run-vs-Reset button swap, and the terminal's idle placeholder.
- `PlaygroundTerminal` renders visible lines with a per-line fade/translate-in (`AnimatePresence`), plus a blinking `_` cursor while running. Reset clears all timeouts and returns everything to `idle`.

## Key files
| File | Role |
| --- | --- |
| `src/components/sections/agent-playground/index.tsx` | Orchestrator: all state (`phase`, `visibleLines`, `inputValue`, `activeExample`, `isRunning`), `runSimulation` timeout scheduler, chip/submit/reset handlers; lays out chips + `TerminalPanel` |
| `src/components/sections/agent-playground/data.ts` | The four `examples` transcripts and `noMatchLines` fallback (label, icon, brand color, prompt, scripted `SimLine[]`) |
| `src/components/sections/agent-playground/types.ts` | `SimLine` (text/color/delay/indent) and `ExamplePrompt` interfaces |
| `src/components/sections/agent-playground/components/ExampleChips.tsx` | The four selectable prompt chips; active-state tint, disabled-while-running |
| `src/components/sections/agent-playground/components/PlaygroundForm.tsx` | Prompt input row + Run/Running/Reset button |
| `src/components/sections/agent-playground/components/PlaygroundTerminal.tsx` | Scrollable output area, idle placeholder, per-line motion, blinking cursor (its own `useReducedMotion`) |
| `src/app/preview/registry.ts:28` | The only mount point: `"agent-playground"` slug in the dev-only preview registry |

## Data & state
- **Source:** static, hand-authored transcripts in `data.ts` (`examples`, `noMatchLines`). No external data.
- **Stores:** none (no Zustand). All state is local `useState` in `index.tsx`; pending timers held in `timeoutsRef`, terminal node in `terminalRef`.
- **API routes:** none. Fully simulated — no orchestrator/network call despite the "agent executing" framing.
- **Types:** `SimLine`, `ExamplePrompt` in `types.ts`.

## Integration points
- Composed from shared primitives: `SectionWrapper`, `SectionIntro`, `TerminalPanel` (`@/components/primitives`), and `TerminalChrome`.
- Brand theming via `tint()` / `BRAND_VAR` from `@/lib/brand-theme`; entrance animation via `fadeUp` from `@/lib/animations`.
- Icons from `lucide-react` plus the local `Github` brand icon.
- Reachable only through `src/app/preview/[section]/page.tsx`, which mounts registry components in isolation and `notFound()`s in production.

## Conventions & gotchas
- **Not on the public site.** Despite "Status: Live", `<AgentPlayground/>` is *not* rendered on the landing page. The home `#playground` slot uses `PlaygroundSplit` (`src/app/page.tsx:51`), and there is a separate full `/playground` route built from `src/app/playground/TerminalSim.tsx`. `AgentPlayground` is reachable only via the dev-only `/preview/agent-playground` surface (404 in production, `preview/[section]/page.tsx:15`). It is effectively an unshipped/alternate variant.
- **Reduced-motion gating is correct.** `index.tsx` calls `useReducedMotion` and swaps `requestAnimationFrame(scrollTerminal)` for a direct call when reduced; `PlaygroundTerminal` independently gates its line entrance, blinking cursor, and durations. Satisfies `custom-animation/require-animation-gating`.
- **Hardcoded English strings.** The heading "Try it", description, chip labels, transcript text, footer ("Simulated execution", "execution complete"), and placeholder are all literals in JSX/`data.ts` — they do **not** use `useTranslation()`. A `playgroundPage` i18n namespace exists (`en.ts:2174`, with `chromeTitle: 'agent-playground — live'` etc.) but it belongs to the separate `/playground` page, not this component. Promoting `AgentPlayground` to a user-facing surface would violate convention #1 (every user-facing string in `en.ts`, translated to 14 locales).
- **Known race — late timers leak past Reset (open).** `runSimulation`/`handleReset` have no run-ID fence. `clearTimeout` cannot revoke an already-fired-but-not-yet-executed callback, so clicking Reset mid-run can leak a "ghost" line and flip `phase` to `"done"` on an empty terminal. Documented as High in `docs/harness/bug-hunt-2026-05-10/agent-interaction-demos.md` (#3); still present in the code (`index.tsx:38-64, 94-101`).
- **Known glitch — `AnimatePresence key={i}` (open).** `PlaygroundTerminal.tsx:31` keys lines by array index, so a Reset-then-rerun can collide exit/enter animations on the first lines. Documented as Medium (#5); index keys in `AnimatePresence` are an anti-pattern. Fix sketch: prefix keys with a per-run ID.
- **Loose submit matching.** Submit matches only on the first word of an example label (`index.tsx:80-81`), so "review my code" matches the PR example but "summarize my emails" misses Gmail. Intentional for a demo, but easy to trip.

## Related docs
- [Multi-Agent Chat](agents-chat.md)
- [Visual Flow Composer & Playground](flow-composer.md)
- [Feature index](../INDEX.md)
