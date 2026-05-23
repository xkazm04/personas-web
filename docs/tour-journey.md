# Guided Tour — Journey Script

The "Take the tour" walkthrough drives visitors through three marketing pages.
Each step spotlights a section's **animated diagram** (not its heading) and the
narration reads as one continuous, chronological story. This document is the
review surface for that narration — one paragraph per step. The exact strings
live in `src/i18n/en.ts` under `tour.*` (and are translated into all 14
locales); the step order, targets, and timing live in `src/lib/tour-script.ts`.

Narration audio will be generated from these English lines via ElevenLabs (see
`scripts/tour-audio.config.mjs`).

---

## Homepage — "Watch a goal become work"

**1. Command center** *(diagram: the version arc in the hero card)*
This opening beat sets the frame: Personas is the visitor's local command
center for AI agents. The emphasis is on ownership and privacy — everything
runs on their own machine, under their control — establishing the local-first
promise before any mechanics are shown.

**2. Agent mind** *(diagram: the live "Agent Mind" split-view terminal)*
The story moves from *what it is* to *what it does*. The visitor describes a
goal in plain language and watches the agent parse the request, plan its steps,
and execute — live, in real time. This is the "show, don't tell" moment: the
product visibly thinking.

**3. Orchestration** *(diagram: the radial trigger hub ring)*
The final homepage beat widens the lens to how work actually starts and flows.
Any of eight trigger types can wake an agent, and the orchestrator routes work
between agents, healing itself as it goes. It closes the homepage on the idea
of an autonomous, resilient system rather than a single bot.

---

## /features — "The life of an agent"

**4. Born (design matrix)** *(diagram: the eight-dimension persona matrix)*
The features story is framed as a life cycle. It begins at birth: a single
sentence of intent fills an eight-dimension persona matrix — tasks, memory,
triggers, and more — turning a plain description into a structured, executable
agent.

**5. Learns (memory layers)** *(diagram: the stacked memory layers)*
Next, the agent grows. As it works, lessons and patterns settle into memory
layers, and the agent sharpens with every task. The beat conveys that Personas
agents improve over time rather than staying static.

**6. Heals (healing circuit)** *(diagram: the self-repairing circuit board)*
Then comes resilience. When a step breaks, the circuit doesn't stop — it
diagnoses the failure, repairs the path, and retries on its own. This is the
reassurance beat: failures are handled automatically, without a human in the
loop.

**7. Observed (observability deck)** *(diagram: the live pulse-grid dashboard)*
The features arc closes on visibility. Everything the agents do — every
execution, message, and event — streams live through a single observability
deck, so the visitor is never in the dark about what their agents are doing.

---

## /roadmap — "Now → Next → Shipped"

**8. Now (progress bar)** *(diagram: the phase progress bar)*
The roadmap story is ordered by time. It opens on the present: where the product
is right now, with each phase on the roadmap graded by status as it ships. It
signals active, transparent progress.

**9. Next (vote grid)** *(diagram: the feature-voting grid)*
The middle beat hands agency to the visitor. What comes next is up to them —
they vote on the features they want most, and the top ideas shape what gets
built. This positions the roadmap as participatory, not top-down.

**10. Shipped (changelog timeline)** *(diagram: the changelog timeline)*
The journey ends in the past tense, completing the now → next → shipped arc.
Everything already shipped is laid out in order, newest first — proof that the
momentum shown in the earlier beats is real and ongoing.

---

## Notes for adjustment

- Each line is intentionally ~10–18 words to keep narration clips short and the
  spotlight dwell times comfortable (7–8.5s per step).
- The homepage **command center** diagram is desktop-only; on mobile that beat
  scrolls to the hero without a tight spotlight, but the narration still plays.
- If you reorder or reword any beat, update `src/i18n/en.ts` (English source of
  truth) first, then keep the other 13 locales in lockstep, and re-generate the
  affected audio clip.
