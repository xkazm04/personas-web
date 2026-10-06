# Split Screen, One Clock (Agents Chat)
> One customer message forks into a scripted-bot window and an agent window that answer on one shared clock ruler, ending in outcomes and star ratings · **Route:** `/how` section (`#agents-chat`), mounted via `LazyAgentsChat` · **Status:** Live (demo section)

## What it does
On `/how`, this section shows what intelligence buys over rules by sending the **same customer
message** to two systems and playing both replies on **one clock**:

- The message sits on top in a cyan bubble; two branches (rose and emerald) fork from it to the
  tops of two chat windows.
- **Scripted bot** (left, rose, "follows a script") answers in template monospace on square cards
  with a status rail, hits warnings and errors, and ends "Not resolved" (handed to a person,
  sent to finance, half done, all undone).
- **Agent** (right, emerald, "understands the ask") answers in plain speech on soft bubbles,
  resolves the request sooner, and its window lights with one sweep of light when it does.
- Between them a **clock spine** ("one clock") shows the running time, a ruler with 5-second
  marks, a rose tick per scripted reply on the left and an emerald tick per agent reply on the
  right; the agent's ticks end early with a check.
- Each window's footer reveals the outcome, the agent's time ("in 4 s") and a 1-5 star
  customer rating.

Four scenarios (Changed mind, Split refund, Staging setup, Batch recovery) auto-play in turn.
Pills above the art pick one (the playing pill fills with the story's progress); a round
pause/play button turns auto-play off and on.

## How it works
**Story clock.** `useStoryClock` (`shared/useStoryClock.ts:43`) is a reducer of `{ index, t }`
where `t` is story seconds since the customer hit send. While `ticking` (`:50`: not still, the
art visible in a foreground tab via `useIsVisible`, and not finished-while-held) a
`setInterval` every `TICK_MS` (80 ms, `:14`) dispatches a tick of `0.08 * rate` story seconds
(`:52-58`). The section passes `rate: 2.4`, `dwell: 7` and a per-scenario `length` of
`storyEnd(scenario) + OUTRO` (1.6) (`index.tsx:23-33`). The reducer (`:24`) advances to the next
scenario after `length + dwell` unless `held`; when held it stops at `length`. `select(i)`
(`:60`) jumps to a scenario and sets `held` (auto-play off); `toggleHeld` flips it back.
`progress` (`:79`) drives the pill fill.

**What is shown is a pure function of `t`.** No child holds a timer:
- `ChatWindow` (`ChatWindow.tsx:14`) shows the lines whose `at <= t`, a typing indicator when
  the next line is under 1.1 s away, `done` half a second after its last line, and `lit` when the
  agent is done (`:38-42`). The transcript is a `flex-col-reverse` box with a faded top edge
  (`:71`), so once it overflows the newest line pins to the bottom and the window never grows.
- `Bubble` (`Bubble.tsx:12`) styles a line by side (monospace card vs speech bubble) and tone
  (`TONE_COLOR`: neutral, thinking, warning, error, success; `shared/scenarios.ts:113`), with
  its `m:ss` stamp. `Typing` (`:43`) is three dots.
- `ClockSpine` (`ClockSpine.tsx:12`) maps seconds onto a 20 s ruler (`SPAN`, `:6`); the readout
  and playhead stop at the scripted bot's last line (`:15`).
- `Outcome` (`Outcome.tsx:10`) is a reserved-height footer (`:17`) that reveals once `done`.
- `CustomerFork` (`CustomerFork.tsx:11`) is keyed by scenario index (`index.tsx:43`), so the
  bubble rise and the branch fade replay on every scenario.

**Layout.** `SectionWrapper fit="fill"` with `ZOOM_TIERS` (`shared/zoom.ts:11`) setting `--cz`
(1.2 / 1.35 / 1.6, the same height tiers as `data-stage-zoom`); the `figure` is the direct child
of `data-stage-slot` and fills it with `ZOOM_FILL` (`:15`, slot size divided by `--cz`) while
`zoom: var(--cz)` scales it back up, so the DOM-built art renders larger on tall monitors and
still ends exactly at the slot edges. The windows sit in a `md:grid-cols-[1fr_5.5rem_1fr]` grid
(`index.tsx:44`).

## Key files
| File | Role |
| --- | --- |
| `src/components/sections/agents-chat-split/index.tsx` | Section entry: clock, intro, `ScenarioBar`, fork, two windows and the spine |
| `src/components/sections/agents-chat-split/shared/useStoryClock.ts` | Story clock: index + story seconds, visibility/reduced-motion gating, held auto-play |
| `src/components/sections/agents-chat-split/shared/scenarios.ts` | `SCENARIOS` (line timings, tones, star ratings), `storyEnd`, `clockText`, palette, `TONE_COLOR` |
| `src/components/sections/agents-chat-split/shared/ScenarioBar.tsx` | Scenario pills with progress fill + auto-play toggle |
| `src/components/sections/agents-chat-split/shared/zoom.ts` | `ZOOM_TIERS`, `ZOOM_FILL`, `zoomStyle` (height-tier zoom for filling DOM art) |
| `src/components/sections/agents-chat-split/CustomerFork.tsx` | Customer bubble + forked branches |
| `src/components/sections/agents-chat-split/ChatWindow.tsx` | One window: header, reversed transcript, typing, outcome footer, resolve sweep |
| `src/components/sections/agents-chat-split/Bubble.tsx` | One reply (scripted card or agent bubble) + `Typing` dots |
| `src/components/sections/agents-chat-split/ClockSpine.tsx` | Shared clock: readout, ruler, per-side ticks, agent-done check, playhead |
| `src/components/sections/agents-chat-split/Outcome.tsx` | Footer: resolved/not resolved, outcome, agent seconds, star rating |
| `src/components/sections/how-lazy.tsx` (`:55-59`) | `LazyAgentsChat` imports `agents-chat-split` (`ssr: false`, `SectionSkeleton`) |
| `src/app/how/page.tsx` (`:60-62`) | Mounts it in `StageSection id="agents-chat"` |

## Data & state
- **Source:** static. Structure in `SCENARIOS` (`shared/scenarios.ts:36`): per scenario, the
  `at` second and `tone` of each scripted and agent line, and the two star ratings (scripted
  1-2, agent 5). Words in `t.howSections.chat` (`src/i18n/en.ts`): `heading`, `gradient`, `lede`,
  `aria`, labels, and `scenarios[]` (`name`, `message`, `scripted[]`, `agent[]`,
  `scriptedOutcome`, `agentOutcome`), indexed the same way as `SCENARIOS`; `v1` holds the art
  label, window modes, clock label, outcome labels and the rating template. No fetch, no API
  routes.
- **State:** `useReducer` (`index`, `t`) + `held` in `useStoryClock`. No Zustand.
- **Leftover fields:** `Scenario.segments`, `Segment`/`Role` and `track` (`scenarios.ts:17-31`)
  served the prototype round's other two variants; nothing here reads them. `chat.stylised` and
  `chat.replay` copy is unused too (`clock.replay` exists but has no button).

## Integration points
- **`/how`** - `StageSection id="agents-chat" glow="emerald" fromColor="cyan" toColor="emerald"`
  (`how/page.tsx:60`); scroll-map item `AGENTS: CHAT` (`:19`). The component's own
  `SectionWrapper id="agents-chat"` (`index.tsx:38`) carries `aria-label={c.aria}`.
- **Stage fit** - `fit="fill"`: exactly one viewport under the navbar with the intro at the
  shared heading height (`src/styles/stage.css`); the art fills `data-stage-slot`.
- **Shared** - `SectionWrapper`, `SectionIntro`, `useStillMotion`, `useIsVisible`, `BRAND_VAR`
  (all tints via `color-mix`, so every theme keeps its own values), `lucide-react`.
- **Sibling** - the outcomes (47 minutes, 3 business days, 6 services broken, all 200 undone)
  tell the same stories as the race on the section above; see [Off the Rails](agents-timeline.md).

## Conventions & gotchas
- **Replaced 2026-10-06** by the owner-picked winner of the /how prototype review ("Split
  screen, one clock"). The previous merged "Race Log" transcript
  (`src/components/sections/agents-chat/`: `useChatSequence`, `ChatTimelineVariant`,
  `TimelineRaceSummary`, `timeline-utils.ts`) is deleted and lives in git history.
- **i18n - English only, pending translation.** Copy is in `howSections` (listed in
  `PENDING_TRANSLATION`); the 13 other locales fall back to English. Line timings stay in
  `SCENARIOS`, so when translating, keep each `scripted[]`/`agent[]` array the same length as its
  timing array.
- **Reduced motion is the finished story.** Under `useStillMotion`, `t` rests at the scenario's
  length (`useStoryClock.ts:66`), nothing ticks or auto-advances, the pause button is not rendered
  (`ScenarioBar.tsx:44`), bubbles/outcome/stars render without entrances, typing dots sit still and
  the resolve sweep is skipped (`ChatWindow.tsx:109`). The clock also stops off-screen and in a
  hidden tab.
- **Picking a scenario turns auto-play off** until the play button is pressed; the picked one
  plays once and holds on its finished frame.
- **Below `md` the art stacks.** The fork lines and the clock spine are hidden (`CustomerFork.tsx:39`,
  `ClockSpine.tsx:18`) and the zoom tiers are off below the stage. Under 48rem (`useIsMobile`)
  each window reserves a slot for every line of its transcript from the start - unsent lines
  render `invisible`, the typing dots sit in the next slot - so the window is as tall as the whole
  transcript: no line is clipped under the top edge and nothing below moves as lines land
  (`ChatWindow.tsx:76-94`). From 48rem up the windows keep the fixed `h-[26rem]` with the
  bottom-pinned, top-faded transcript.
- **The ruler is 20 s.** `SPAN` is hardcoded (`ClockSpine.tsx:6`); the longest scenario ends at
  18 s. A longer script would clamp its ticks to the bottom.
- **Ratings are data, not validation.** `stars` must stay within 0-5; `Outcome` draws five stars
  and fills the first `stars`.

## Related docs
- [Off the Rails (Agents Timeline)](agents-timeline.md)
- [Agent Playground](agent-playground.md)
- [Feature index](../INDEX.md)
