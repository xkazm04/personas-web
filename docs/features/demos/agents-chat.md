# Multi-Agent Chat
> An auto-cycling marketing demo that races a workflow-bot against an agent-bot through one merged, timestamped transcript — ending in star-rated satisfaction and a "time to outcome" race summary. · **Route:** `/how` section (`#agents-chat`), mounted via `LazyAgentsChat` · **Status:** Live (demo section)

## What it does

On the `/how` ("How It Works") page, this section answers "what does *intelligence* buy you over *rules*?" by replaying the **same customer message** through two competing systems on **one shared clock**:

- **workflow-bot** (rose) — a deterministic pipeline that misreads ambiguity, hits a `WARNING` / `ERROR`, and hands off to humans (47-minute wait, 3 business days, partial deploy).
- **agent-bot** (emerald) — a reasoning system that recognizes the intent, resolves it inline, and finishes far sooner.

Four scenarios ship: *Ambiguous Request*, *Split Refund*, *Staging Setup*, *Batch Recovery*. Each plays back like a live terminal: per-lane **typing indicators** bounce, messages stream in chronologically, then both lanes reveal a **resolved / handed-to-humans** badge plus a 1–5 **star rating**. A footer **race summary** draws two proportional time bars and the speed multiple ("agent reached its outcome 3× sooner").

Scenarios **auto-cycle**. A visitor can jump to any scenario via the top chip row or the bottom progress segments, and pause/resume auto-play. Hovering the transcript pauses it; clicking a chip or segment latches it paused.

## How it works

**Composition.** `AgentsChat` (`index.tsx`) is the only entry. It calls the `useChatSequence()` hook once, bundles the playback snapshot into a `view` object, and renders three things: a `ThemedChip` scenario row, the `ChatTimelineVariant` (the merged "Race Log"), and a `ChatProgressBar` (segments + pause toggle). There is only **one** presentation variant in this section despite the `…Variant` name and the hook's variant-agnostic snapshot type.

**The playback hook (`use-chat-sequence.ts`).** `useChatSequence()` owns all timing state: `activeIndex`, `wfVisibleCount` / `agVisibleCount` (how many messages of each lane are revealed), `wfTyping` / `agTyping`, `showSatisfaction`, plus `paused` and `hovered`. On every `activeIndex` change, `playScenario()` (deferred via `queueMicrotask`, `use-chat-sequence.ts:81`) clears all timers, resets counts to 0, then schedules — **per message** — a "start typing" timer at `i * interval` and a "show message, stop typing" timer at `i * interval + interval * 0.6`. After the longer lane finishes it schedules the satisfaction reveal at `maxMsgs * interval + SATISFACTION_REVEAL_MS`. `interval` is `MSG_INTERVAL_MS` (800 ms), collapsed to **200 ms** under reduced motion (`:45`). All `setTimeout` handles are tracked in `timerRefs` and cleared on scenario change and unmount.

**Auto-cycle.** A separate effect (`:87-95`) sets one `setTimeout(cycleMs)` to advance `activeIndex` modulo `scenarios.length`. It self-cancels when `paused`, `hovered`, **or** `prefersReduced` is true — so reduced-motion users never auto-advance. `cycleMs` comes from `getScenarioCycleMs()` (`data.ts:7`) = `maxMsgs * interval + SATISFACTION_REVEAL_MS + SATISFACTION_DWELL_MS` (1600 ms dwell), and is also handed to the progress bar so its fill duration matches the cycle exactly.

**Merged transcript (`timeline-utils.ts`).** `buildRaceRows(scenario)` flattens both lanes into one array, parses each `"m:ss"` timestamp to seconds (`parseClock`), and sorts chronologically; ties resolve workflow-first so the slower system reads above the agent at identical clocks. `lastRowIndexOf` / `laneStateAt` compute each row's lane rendering: `"through"` (vertical line continues), `"end"` (terminal node here), or `"none"`. This drives the commit-graph "fork into two lanes" visual in `TimelineRow`.

**Rendering (`ChatTimelineVariant.tsx`).** Inside `TerminalChrome` (title `merged-transcript.log`, status `live`→`complete`), the rows live in a **fixed-height `flex-col-reverse` scroll window** (`:110`) so the newest line pins to the bottom and the card never grows taller as the conversation streams — older lines slide up under a top fade mask. A row is `visible` when its `channelIndex < {wf|ag}VisibleCount`; `TimelineRow` animates `height: 0 → auto` with linear easing. The reserved-height typing strip shows a `TypingIndicator` chip per lane while that lane is typing and not yet done. `TimelineRaceSummary` renders the footer time bars when `showSatisfaction` flips true.

**Star ratings & badges.** `TimelineRow` renders, on each lane's last row once `showSatisfaction` is true, a `resolved`/`handed to humans` pill plus `StarRating` (`satisfaction`/5, emerald if resolved else rose). `StarRating` pops each star with a spring stagger.

## Key files

| File | Role |
| --- | --- |
| `src/components/sections/agents-chat/index.tsx` | Section entry; calls `useChatSequence()` once, renders chips + variant + progress bar, wires hover/click-pause |
| `src/components/sections/agents-chat/use-chat-sequence.ts` | Playback hook: per-message typing/reveal timers, satisfaction reveal, auto-cycle, reduced-motion collapse |
| `src/components/sections/agents-chat/data.ts` | `scenarios[]` (4), timing constants (`MSG_INTERVAL_MS=800`, `SATISFACTION_REVEAL_MS=400`, `SATISFACTION_DWELL_MS=1600`), `getScenarioCycleMs()` |
| `src/components/sections/agents-chat/types.ts` | `ChatMessage`, `ChatScenario`, `ChatSequenceView` (the playback snapshot) |
| `src/components/sections/agents-chat/timeline-utils.ts` | `buildRaceRows` (chronological merge), `parseClock`, `lastSeconds`, `lastRowIndexOf`, `laneStateAt` |
| `src/components/sections/agents-chat/components/ChatTimelineVariant.tsx` | "Race Log" view: terminal chrome, fork origin row, fixed-height reversed scroll log, typing strip |
| `src/components/sections/agents-chat/components/TimelineRow.tsx` | One merged row: commit-graph lane cells, tone icon/color, end-of-lane badge + `StarRating` |
| `src/components/sections/agents-chat/components/TimelineRaceSummary.tsx` | Footer "time to outcome" bars (proportional to elapsed seconds) + speed-multiple line |
| `src/components/sections/agents-chat/components/TypingIndicator.tsx` | Three bouncing dots; static under reduced motion |
| `src/components/sections/agents-chat/components/StarRating.tsx` | 1–`maxScore` stars + `score/max` label; spring stagger pop-in |
| `src/components/sections/agents-chat/components/ChatProgressBar.tsx` | Bottom segments (active fills over `cycleMs`), `Chat N of M`, pause/resume toggle |
| `src/components/sections/how-lazy.tsx:55` | `LazyAgentsChat = createLazySection(() => import("…/agents-chat"), SectionSkeleton, { ssr: false })` |
| `src/app/how/page.tsx:56` | Mounts `<LazyAgentsChat />` inside a `StageSection` |

## Data & state
- **Source:** Static module data only — `scenarios` is a literal array in `data.ts`. No fetch, no Supabase, no orchestrator, no mock-API call. All copy is hardcoded English.
- **Stores:** None (no Zustand). All state is local to `useChatSequence()` (counts, typing flags, `showSatisfaction`, `activeIndex`, `paused`, `hovered`) held via `useState`/`useRef` and hoisted in `index.tsx` so the variant and progress bar read one source of truth.
- **API routes:** None.
- **Types:** `ChatMessage = { sender: "bot" | "system"; text; tone: "neutral"|"warning"|"error"|"success"|"thinking"; timestamp }`. `ChatScenario = { id; name; userMessage; workflow: { messages: ChatMessage[]; satisfaction: number }; agent: { … } }`. `ChatSequenceView` = the playback snapshot passed to the variant (`scenario`, both visible counts, both typing flags, `showSatisfaction`). `RaceRow` / `RaceChannel` / `LaneState` live in `timeline-utils.ts`.

## Integration points
- **`/how` mount.** Registered as `LazyAgentsChat` in `how-lazy.tsx:55` (`ssr: false`, `SectionSkeleton` fallback) and placed in `how/page.tsx:56` inside `<StageSection glow="emerald" fromColor="cyan" toColor="emerald">`. Section anchor `id="agents-chat"`; the page scroll-map exposes it as "AGENTS: CHAT" (`how/page.tsx:19`). This is the **only** place the component renders.
- **`SectionWrapper`.** The section body sits in `SectionWrapper` (`id="agents-chat"`, English `aria-label`), a `whileInView` `staggerContainer` that reveals children **once** (`viewport={{ once: true }}`). The chip row, transcript wrapper, and `ChatProgressBar` use `variants={fadeUp}` and inherit that one-shot reveal. `ChatTimelineVariant` is mounted on demand and self-drives its own entrance (no inherited variant) — see its header comment (`ChatTimelineVariant.tsx:19-20`).
- **Shared primitives & libs.** `SectionIntro`, `ThemedChip` (`@/components/primitives`), `TerminalChrome`, `fadeUp` from `src/lib/animations.ts`, and `lucide-react` icons (`User`, `Bot`, `Brain`, `Check`, `X`, `Zap`, `AlertTriangle`, `Timer`, `Star`, `Play`, `Pause`).
- **Context-map bundling.** In `context-map.json` this is grouped with **Agent Playground**; they are independent components and documented separately. See [Agent Playground](agent-playground.md).

## Conventions & gotchas
- **i18n — NOT wired (real gap).** Despite the repo's 14-locale lockstep rule, this entire section is **hardcoded English** with no `useTranslation()` / `t.*` access anywhere under `agents-chat/`. Affected: every scenario string in `data.ts` (`name`, `userMessage`, all message `text`), the `SectionIntro` heading/gradient/description in `index.tsx:46-49`, the section `aria-label` (`:43`), the lane legend / "one clock · two systems" / `customer` / `T+…` labels in `ChatTimelineVariant` + `TimelineRow`, the `resolved` / `handed to humans` / `RESOLVED` / `WARNING` / `ERROR` text, the `TimelineRaceSummary` "Time to outcome" / "agent reached its outcome N× sooner" lines, and the `ChatProgressBar` "Chat N of M" / "Auto-cycling" / "Resume auto-play" strings. Localizing means lifting all of it into `src/i18n/en.ts` and hand-translating into the 13 other locales. Treat any new string here as the same debt.
- **Reduced-motion gating — solid coverage.** `useChatSequence` reads `useReducedMotion()` and (a) collapses `interval` 800→200 ms so playback isn't a long crawl, and (b) **disables auto-cycle entirely** (`:88`). `TypingIndicator`, `StarRating`, `TimelineRow`, `TimelineRaceSummary`, and `ChatProgressBar` each call `useReducedMotion()` and swap to instant/static variants (no bouncing dots, no spring stars, no width tweens, static progress fill). No `requestAnimationFrame` is used, so the `custom-animation` lint rule isn't in play, but the gating is honored regardless.
- **Click-latch vs. hover-resume interaction.** Selecting a chip or progress segment calls `setActiveIndex(i)` **and** `setPaused(true)` — picking a scenario latches paused. But the transcript wrapper's `onMouseLeave` sets `hovered=false`, and `hovered` (not `paused`) is what the cycle effect also checks. Because the cycle is suppressed if **`paused` OR `hovered` OR reduced**, a click leaves it paused until the user hits "Resume auto-play" — moving the mouse out does **not** restart it (unlike the sibling Why-Agents section, where leaving resumes). Worth knowing when debugging cycle state.
- **Fixed-height reversed scroll log is load-bearing.** The `flex-col-reverse` window (`ChatTimelineVariant.tsx:110`) reverses DOM order (first child = visual bottom), which is why `rows.map(...).reverse()` and a trailing `OriginRow` are required, and why the card height never ratchets as messages stream. The typing strip has a reserved `min-h-9` so toggling chips doesn't shift rows. Don't "simplify" the reverse — it's how scroll pins to the newest line natively. The only intentional height change during playback is the `TimelineRaceSummary` expand.
- **Chronological merge ties.** `buildRaceRows` sorts by parsed seconds, then `channelIndex`, then workflow-before-agent. Several scenarios share identical timestamps across lanes (e.g. both end at `0:04`/`0:06`/`0:12`/`0:16`); the workflow-first tiebreak is deliberate so the failing system reads above the resolving one. Timestamps are strings parsed at runtime — keep them `"m:ss"`.
- **React 19 purity.** Clean: no `Math.random` / `Date.now` / `new Date()` in render or memo factories. `playScenario` writes state only inside `setTimeout` callbacks (never synchronously in an effect body), and the initial play is deferred with `queueMicrotask`. `buildRaceRows` / lane indices are wrapped in `useMemo` keyed on `scenario`/`rows`. Follow these patterns if you add timing or derived state.
- **`satisfaction` is per-lane, not validated.** Each lane carries its own `satisfaction: number` rendered as stars; the data hardcodes workflow 1–2, agent 5. `StarRating` clamps nothing beyond `maxScore` stars — keep `satisfaction` within `0..maxScore` (default 5).
- **Semantic tokens.** Uses `border-glass` / `border-glass-hover`, `bg-white/[0.0x]` decorative surfaces, `text-muted` / `text-muted-dark`, and `text-brand-{rose,emerald,cyan,purple,amber}` with opacity modifiers. Note `ChatProgressBar.tsx:53` uses `text-muted-dark/60` (the `/60` floor) — stay at or above `/60` per the `custom-a11y/no-low-text-opacity` rule when editing.

## Related docs
- [Agent Playground](agent-playground.md)
- [Agent Execution Timeline Race](agents-timeline.md)
- [Feature index](../INDEX.md)
