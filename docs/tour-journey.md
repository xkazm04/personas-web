# Guided Tour — Journey Script

The "Take the tour" walkthrough is a self-driving, narrated story. Each step
spotlights a section's **animated diagram** and, where useful, **manipulates
that diagram live** (clicking buttons / triggers / cards in time with the
words). The homepage tour ends by offering to **continue into /features**.

This document is the review surface for the narration — one paragraph per step.
The exact strings live in `src/i18n/en.ts` under `tour.*` (translated into all
14 locales); step order, targets, timings, and the per-step `actions` live in
`src/lib/tour-script.ts`. Narration audio is generated from these English lines
via ElevenLabs (`scripts/tour-audio.config.mjs`) into `public/tour/`. The intro
greeting and all homepage + /features clips are generated; /roadmap is still on
its dwell timers.

---

## Intro — Athena's greeting *(welcome pop-up, no diagram)*

Before the first step, a welcome pop-up introduces the guide. Athena's
companion visualization reacts to her spoken greeting (`public/tour/intro.mp3`):
"Project loaded. Hello, Commander — my name is Athena, and I'll assist you in
getting familiar with Personas." The greeting plays once and waits — it never
auto-advances; the visitor clicks **Begin** to start the steps or **Skip** to
dismiss. The greeting line is audio-only; the pop-up's on-screen copy is
`tour.introTitle` / `tour.introBody`.

---

## Homepage — "Meet a persona, then watch it work"

**1. Tools** *(diagram: the use-cases tool web; auto-cycling)*
The opening beat introduces the core idea: a persona is a single AI agent with
one stable identity and a composable set of skills. Give it the tools it needs
— Gmail, Slack, GitHub, your calendar — and it learns to act across all of
them. The diagram cycles through those tools on its own: one persona, many
jobs, all working together.

**2. Agent Mind** *(diagram: the Agent-Mind split terminal — clicks "Triage my Gmail")*
Now the persona is given a goal in plain language. As this step opens, the tour
clicks the "Triage my Gmail" example so the simulation runs live: the agent
reads the request, detects intent, breaks it into steps, plans its approach,
and then executes — showing every move (Select Tools → Execute → Verify →
Result) as it goes. Narration walks through that thought process in real time.

**3. Orchestration** *(diagram: the radial trigger hub — highlights four triggers in turn)*
This beat explains how agents wake up. As the narration names them, the tour
highlights four trigger types in sequence — Schedule, Event, Polling, Webhook —
each lighting its node and detail panel. The point: any of eight signals can
wake an agent, and the orchestrator routes each one to the right agent, healing
itself if a step fails.

**4. Platform** *(diagram: all six platform cards — opens each in sequence)*
This beat reveals the foundation. The spotlight frames the full 3×2 card grid,
and the tour opens the six cards one at a time as they're named: the encrypted
Vault, ready-made Templates, bring-your-own-model (BYOM), live Monitoring, the
experimentation Lab, and team Orchestration. The message: everything rests on
one platform built for trust and scale — six pillars, one place.

**5. Download** *(diagram: the Download call-to-action)*
The closing beat is the call to action: Personas runs on your own machine
through Claude Code — Anthropic's command-line tool — so you stay private and
in control. Download the installer for Windows 11, connect the CLI, and the
first agent is live in minutes.

**Bridge** *(no diagram — a confirm prompt)*
After the five beats, the tour asks whether the visitor wants to go deeper,
feature by feature. "Show me the features" navigates to `/features?tour=1`,
which auto-starts the features tour; "Maybe later" ends the tour.

---

## /features — "The life of an agent"

**6. Born (design matrix)** *(diagram: the eight-dimension persona matrix)*
The features story is a life cycle, beginning at birth: a single sentence of
intent fills an eight-dimension persona matrix — tasks, memory, triggers,
review, and more — and a vague idea becomes a structured, executable agent.

**7. Learns (memory layers)** *(diagram: the stacked memory layers)*
Next the agent grows. Each task leaves a trace; the lessons that matter rise
into its memory layers while noise settles to the bottom, so the agent gets
sharper and more context-aware the more it works.

**8. Heals (healing circuit)** *(diagram: the self-repairing circuit board)*
Then comes resilience. When a step fails, the circuit diagnoses what went
wrong, repairs the path, and retries on its own — no 3 a.m. alerts, no manual
restarts, the workflow simply keeps moving.

**9. Observed (observability deck)** *(diagram: the live pulse-grid dashboard)*
The agent's working life is on view: every execution, message, event, and
memory streams live through one observability deck, with sparklines, costs, and
status in real time — full transparency, zero setup.

**10. Refined in the Lab (refinement workspace)** *(diagram: the Lab tabs)*
Great agents are rarely right the first time, so the Lab is where you refine
them — chat to coach, fight two versions in the arena, evolve across
generations, or score on the dimensions that matter. Every kept improvement is
versioned and reversible.

**11. Extended with Plugins (Dev Tools)** *(diagram: the plugin card — selects Dev Tools)*
The closing features beat shows the six bundled plugins; the tour selects Dev
Tools so its card is on screen — a persona turned coding teammate that runs
tasks, reads output, and iterates. Switching a tab meets another specialist,
all sharing the same credentials and memory.

---

## /roadmap — "Now → Next → Shipped"

**12. Now (progress bar)** *(diagram: the phase progress bar)*
The roadmap opens on the present: where the product is right now, with each
phase graded by status as it ships.

**13. Next (vote grid)** *(diagram: the feature-voting grid)*
The middle beat hands agency to the visitor — vote on the features you want
most, and the top ideas shape what gets built.

**14. Shipped (changelog timeline)** *(diagram: the changelog timeline)*
The journey ends in the past tense: everything already shipped, laid out in
order, newest first — proof the momentum is real.

---

## Notes for adjustment

- Homepage and /features steps now auto-advance on their audio clip's `ended`
  event; the `dwellMs` values in `tour-script.ts` remain as the fallback used
  when a clip fails to load (or autoplay is blocked). /roadmap has no audio yet
  and still advances purely on its dwell timers.
- The homepage manipulations are **click-driven**: a diagram may auto-play on
  its own until the tour reaches it and (re)starts it. The Tools and
  Orchestration diagrams auto-cycle; Agent Mind and Platform are driven purely
  by the tour's clicks.
- If you reorder/reword a beat, update `src/i18n/en.ts` first, keep the other
  13 locales in lockstep, adjust the matching `actions`/`dwellMs` in
  `tour-script.ts`, and re-generate the affected audio clip.
