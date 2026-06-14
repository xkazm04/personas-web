// Companion (Athena) guide bodies — English source.
// Keyed by topic id (see ../topics.ts, categoryId "companion").
// Custom blocks rendered by GuideMarkdown: :::steps  :::checklist  :::compare
// :::tip  :::info  (see other content/*.ts for examples).
export const content: Record<string, string> = {
  "meet-athena": `
## Meet Athena

Athena is Personas' built-in companion — always available, always in context. She is not a chatbot bolted on the side. She knows your agents, your goals, your memory, and she can actually operate the app on your behalf.

She lives in two places at once. The **footer avatar** — her animated face in the bottom-right corner — is the entry point: tap it to open the chat panel, or press and hold to dictate a voice message without the panel ever opening. The **floating orb** is her second form: a draggable overlay that floats above your work so she stays reachable wherever you are in the app. When the orb is enabled (the default), the footer summons and dismisses the orb; the orb's own tap opens the full chat panel.

Both surfaces reflect what Athena is doing at a glance. While she is thinking, her avatar shifts posture. While she is speaking, the orb glows with her voice level. When a background task finishes, the orb shows a brief reaction. These are not cosmetic — they tell you her state without making you open the panel.

What Athena can do goes well beyond answering questions. She can answer questions and explain features, yes, but she can also navigate the app for you, run your agents, file memory, propose identity updates, and schedule future check-ins. When autonomous mode is on, she can chain multiple steps together with no clicks from you.

### Key Points

- **Footer avatar** — tap to open/close the chat panel; press and hold to dictate a voice turn from anywhere
- **Floating orb** — draggable overlay, same two gestures; glides to each area during guided walkthroughs
- **Operates the app** — Athena does not just advise; she can navigate routes, run agents, and compose dashboards
- **Always in context** — she reads your memory, goals, and agent state before every reply, so she never starts from zero
- **Starting point** — the topics in this Companion section each go deeper: chatting, voice, memory, proactive check-ins, guided walkthroughs, the Decision Hub, and driving the app by chat

:::tip
If you close the chat panel, Athena keeps working. Background tasks run in the orb, proactive nudges still arrive, and voice replies still play — the panel being closed does not pause her.
:::
  `,

  "chatting-with-athena": `
## Chatting with Athena

Open the panel and Athena greets you with a **welcome screen** — her avatar, a short greeting, and a set of **starter-prompt chips** covering the most common starting points. Click any chip and the message sends immediately; you do not have to type.

For ready-made prompts beyond the starter set, type \`/\` as the first character of an empty message. A **slash palette** opens above the composer with preset prompts you can filter by typing: **get to know me** (the intake interview that bootstraps her memory of you), **show goals**, **what's queued**, **recent decisions**, **live ops**, **memory recap**, and **capabilities**. Arrow keys navigate the list, Enter picks the highlighted item, Escape clears and closes.

When Athena replies she often adds **quick-reply chips** — two to five follow-up prompts that match where the conversation is going. Click one to send it as your next message. Below her latest completed reply you also get three **refine chips**: **Shorter**, **More detail**, and **Code only**. Each one resends your last message with a steering suffix so you can shape the reply without retyping.

The composer stays open while Athena is answering. You can type any time — if your message sounds like a redirect ("actually, stop" or "wait, instead…") it will interrupt the in-flight reply and queue your new request. If it sounds additive ("and also…") it queues behind the current reply and runs after. You will see queued messages as small chips above the composer; you can cancel any of them.

**Autonomous mode** (the ∞ icon in the panel header) lets Athena chain multi-step work on her own. When it is on and she has more to do, she schedules a follow-up turn roughly fifteen seconds later, up to twenty consecutive turns. A slim divider in the transcript marks each autonomous continuation so you can tell at a glance where you left off and where she took over.

### Key Points

- **Welcome screen** — starter chips fire real messages through the same pipeline as typed ones
- **Slash palette** — type \`/\` to browse preset prompts; filter by typing, pick with Enter
- **Quick-reply chips** — 2–5 follow-up options Athena offers at the end of her reply
- **Refine chips** — Shorter / More detail / Code only; below the latest completed reply only
- **Mid-answer redirect** — type while she is answering; classified as interrupt or queue automatically
- **Autonomous mode** — Athena chains up to 20 turns of self-directed work; any message from you cancels the chain

:::tip
The slash palette prompts are translated into all 14 supported languages — if you use Personas in a language other than English, the preset messages arrive in your locale and Athena replies in kind.
:::
  `,

  "voice-and-hold-to-talk": `
## Voice and Hold-to-Talk

Athena supports full two-way voice: you dictate, she transcribes and replies, and her answer plays back in a synthesized voice. Every piece of the pipeline has a privacy option.

### Dictating to Athena

**Press and hold** the footer avatar or the floating orb for roughly a quarter second. A mic badge and a pulse appear, and the interim transcript shows as a caption beside the orb. Release when you are done speaking — the transcript is handed to Athena and the usual reply pipeline runs. The reply streams into the panel and, if a voice engine is configured, plays automatically. The panel never has to open; a voice turn works with it fully collapsed.

The **global keyboard shortcut Cmd/Ctrl+Shift+A** summons Athena from anywhere in the app and starts a voice turn in one keystroke. Press the shortcut again to send, or Esc to cancel without sending. This uses the same session as a hold on the orb — a shortcut mid-walkthrough is the same as an orb hold.

### Speech-to-text engines

Two engines are available, selected in **Companion → Voice** under the STT panel:

:::compare
**Browser (default)**
Uses the Web Speech API in the app's renderer. No setup required. On Windows the audio is forwarded to the OS vendor's cloud speech service — convenient but off-device.
---
**Local Whisper**
On-device transcription via a \`whisper-cli\` sidecar. Audio never leaves your machine. Requires downloading a Whisper model and placing the binary at the expected path (the Voice tab shows the exact location and download status).
:::

### Voice playback engines

When Athena replies, the spoken summary can come from either of two voice engines:

:::compare
**ElevenLabs (cloud)**
High-quality synthesis using an ElevenLabs API credential and a voice ID you choose. Per-voice tuning: stability, similarity, style, and speed. The credential is stored in your vault; the API key never reaches the app's renderer.
---
**Piper (local ONNX)**
On-device synthesis with no network call at synthesis time and no credential needed. Voices are downloaded from a curated catalog of roughly 17 voices across 14 languages. The Voice tab shows which are installed.
:::

### Proactive nudges spoken aloud

Proactive check-ins (goals approaching, agent failures, reminders) can also be spoken — even when the chat panel is closed. Arrival-TTS fires the moment a nudge arrives, using the same engine you have configured. A **Play it again** button in the footer replays the last spoken message if you missed it.

:::tip
If you want voice without any cloud calls at all, pair local Whisper for dictation with Piper for playback. Both run fully on-device. The Voice tab surfaces an install path and model browser for each engine.
:::
  `,

  "athenas-long-term-memory": `
## Athena's Long-Term Memory

Athena remembers you across sessions. She does not start from a blank slate each time you open the panel — she reads her memory of you before every reply and uses it to give answers that fit your actual situation.

### What she remembers

Memory is organized into tiers, each covering a different kind of knowledge:

- **Facts** — things she has learned about you, your projects, and the world. "You prefer concise summaries." "This repo's main branch is master."
- **Procedural preferences** — behavioral rules she has picked up. "When summarizing a long doc, lead with the one-sentence punchline." "For code examples, prefer TypeScript."
- **Goals** — the active goals and target dates she tracks on your behalf.
- **Identity profile** — an evolving \`identity.md\` document that is read into every system prompt. It is the single source of "who are you to Athena right now" and grows by anchored edits, never wholesale rewrites.
- **Episodes** — the conversation history itself, stored as markdown files on your machine. Doctrine (Personas' own reference docs) fills in product knowledge.

### Bootstrapping with the intake interview

On a fresh install Athena runs a short interview automatically — a few focused questions that give her enough to write an initial identity profile. You can re-run the interview any time by selecting **get to know me** from the slash palette or clicking the matching chip on the welcome screen. If an identity profile already exists, she updates it with anchored diffs; she never deletes context you gave her before.

### The Memory browser

Open **Companion → Memory** to see everything Athena knows. The Brain Viewer lists episodes, facts, procedural preferences, goals, and the identity doc — all browsable. Click any entry to read the full content, follow linked memories to related entries, and edit or correct anything that is wrong.

**Corrections are one click.** Each bullet in the identity view has a "That's wrong" affordance. Click it and Athena records the correction as a high-value learning signal and proposes removing the incorrect bullet in a single approval card. You approve and the wrong claim is gone.

### Privacy

The brain data — all five memory tiers — lives on your machine at \`~/.personas/companion-brain/\`. Nothing is stored in a cloud database. If you use the local Whisper STT and Piper TTS engines, no audio leaves your machine either.

:::tip
The intake interview is short (a few minutes) and pays dividends immediately — Athena's first handful of replies after a good intake are noticeably more on-point. Run it before your first real session.
:::
  `,

  "proactive-check-ins": `
## Proactive Check-Ins

Athena does not wait for you to ask. When something worth your attention happens — a deadline approaching, an agent waiting, a reminder you set — she reaches out first. These are proactive check-ins: cards that appear in the chat panel, optionally spoken aloud, without you opening anything.

### What triggers a check-in

Athena evaluates conditions roughly every five minutes. The triggers that can produce a check-in include:

- **Goal target approaching** — an active goal has a target date within 24 hours
- **Backlog aging** — a self-promise commitment has gone unaddressed past a tier threshold (escalating from 1 day to 3 days to 7 days)
- **Cadence due** — a ritual you set (a recurring check-in, a focus window) matches "now"
- **On this day** — a note or reflection from the same calendar day one month, three months, or one year ago, matched to your active goals
- **Agent needs you** — a fleet session failed, has been waiting for input for more than two minutes, or has gone stale
- **Athena's own commitments** — scheduled check-ins Athena proposed and you approved during a conversation, delivered at the exact time she committed to

### Guardrails

The system is designed to be useful without being noisy:

- **Quiet hours** — nudges are held during any quiet window you configure; nothing fires while you have explicitly asked for silence
- **Daily budget** — by default Athena sends at most three nudges per day from the trigger-driven kinds; if you consistently dismiss a type of nudge, the budget for that kind quietly decreases over time
- **Deduplification** — the same trigger for the same subject can only fire once until you resolve it; a failing agent will not produce a new nudge every five minutes

### Acting on a check-in

Each card offers two actions: **Engage** and **Dismiss**. Engaging opens the relevant context — the goal detail, the agent's activity, the memory entry. Dismissing records that you saw it. If voice is configured, the nudge body is spoken the moment it arrives, even with the chat panel closed.

:::info
High, urgent, and critical-severity incidents bypass the daily nudge budget entirely — they are never silenced by frequency caps or quiet hours. Safety-floor items always reach you.
:::

:::tip
Set a quiet-hours ritual in the slash palette (type \`/\` and pick "what's queued" to see your rituals) to define a window where Athena holds all check-ins until the window ends. This is useful for deep-work blocks where you want zero interruption.
:::
  `,

  "guided-walkthroughs": `
## Guided Walkthroughs

When you ask Athena how to do something, she can show you instead of just telling you. Say "show me how to create a persona" or "how do I set up a connector?" and she offers a choice: **Build it for me** (she does the work) or **Show me how to build it** (she walks you through it yourself).

Choose the walkthrough path and the guided tour begins. Athena's orb glides across the screen to the relevant area — you can watch it move. The element she wants you to look at gets a soft glowing ring with corner brackets that lock on to it. The rest of the UI stays fully visible and clickable; nothing is dimmed or blocked. A **caption panel** rides beside the orb with the step narration and controls: Back, Pause, Skip, and Stop.

### How each step works

Each step in a walkthrough narrates what you are looking at and, when there is something to do, waits for you to act. Clicking the highlighted element both advances the tour **and** performs the real action — the tour and the app stay in sync. Some steps are "your turn" beats where auto-advance is paused entirely until you click. Other steps advance automatically after a short dwell once you have read the narration.

The walkthrough is keyboard-driveable: left/right arrows step back and forward, Space pauses and resumes, Escape stops.

### What walkthroughs are available

Athena has authored tours for the surfaces users most commonly ask about:

- **Creating a persona** — the build studio, the sigil's describe-your-persona trigger, and the autonomous build toggle
- **Setting up a connector** — the Vault route, the Add new credential flow, and choosing a connector type
- **Creating a trigger** — the Events hub and the routing canvas Builder
- **Adopting a template** — the template gallery and the Adopt affordance on a template card
- **Triaging an incident** — the Overview Incidents inbox and an incident row
- **Setting up a goal and KPIs** — the Goals board and the KPI dashboard

Each walkthrough closes with a call to action: Start building, Open the catalog, Open the Builder, or Set up a goal — so the "show me how" path leads directly into the "do it" path.

### Point-at and ad-hoc tours

Beyond scripted walkthroughs, Athena can point at individual elements mid-conversation. If you ask "where is the activity feed?" she can flash a glowing ring on it and narrate a single caption without starting a full tour. She can also assemble a short two-to-six-step tour on the fly for "show me around" requests.

:::tip
Athena offers the walkthrough or the build-for-me path automatically when you describe a persona you want — you do not need to know the right phrase. Just describe what you want to build and she will surface both options.
:::
  `,

  "the-decision-hub": `
## The Decision Hub

Some of Athena's actions need your explicit sign-off before they run. When she wants to do something that changes state — run an agent, update your identity profile, schedule a future check-in, spawn fleet sessions — she proposes it as an **approval card**. The card sits in the chat panel until you act on it. Nothing happens until you do.

### What appears as an approval card

The range of actions that surface this way is broad:

- **Running agents** — executing a persona with given inputs, or launching an autonomous one-shot build
- **Memory and identity writes** — updating your identity profile, writing or deleting a fact or procedural preference, writing or updating a goal
- **Future commitments** — a scheduled check-in Athena is proposing ("I'll ping you about this in three days")
- **Project and dev work** — registering a new project, enqueueing a codebase scan
- **Fleet operations** — spawning new Claude Code worker sessions, sending input to a session, killing a session, dispatching a multi-session operation

### Sensitive operations are never auto-approved

Certain categories are **never** auto-approved, even when autonomous mode is on. Identity updates and goal writes require your review every time — Athena can propose them, but she cannot commit them without your click. This is by design: writes that shape who you are to Athena, and goal state that drives proactive check-ins, always have a human in the loop.

### Approve all

When multiple approval cards pile up from the same fleet session — say, a session is waiting on three file writes in a row — the card group shows an **Approve all** button that resolves every approval-type card in that session at once. Guidance requests that need typed answers are never batched; they stay individual.

### Where the hub lives

Approval cards appear inline in the chat panel, above the composer. You can also see pending approvals from your running agent sessions there — anything that is awaiting your decision surfaces in one place rather than scattered across individual agent views.

:::info
If Athena proposes an action and you reject it, she receives the rejection as feedback and can propose an alternative. Rejecting is always safe — no state changes until you approve.
:::
  `,

  "operating-by-chat": `
## Operating the App by Chat

Athena can do more than advise — she can drive the app. Ask her to take you somewhere, open an editor, build a dashboard, or call a connected service, and she does it, flashing the destination so your eye lands on what she just brought up.

### Navigating by voice or text

Ask Athena to open any main section of the app — Overview, Agents, Events, Credentials, Settings, and others — and she switches the sidebar route. The destination's container pulses for a moment so you know where she landed. This works from a voice turn with the panel closed: say "take me to the activity feed" and the app navigates while Athena confirms in chat.

From a specific context, she can go deeper. Ask to "jump into the Lab for the summarizer agent in comparison mode" and she opens that agent's editor pre-selected to the matrix comparison view. The route and mode selection happen in a single action.

### Composing a custom cockpit

When Athena wants to explain something operational — your agent fleet status, a connected service summary, pending approvals — she can compose a **cockpit**: a widget grid on your Home tab that shows the data directly instead of dumping it as chat prose. She assembles the widgets, persists the spec, navigates you there, and the panel confirms with a flash of the cockpit container.

You can also ask her to build you a cockpit explicitly: "put together a dashboard showing my top three agents and any pending reviews." Widgets that prove useful can be pinned permanently with one click.

### The Radar and Sunrise buttons

Two buttons in the companion toolbar give you one-tap access to Athena's two most common operational summaries:

- **Radar** — a fleet review. Athena pre-gathers a digest from your execution store — team health, goal progress, agent performance, Director scores — and reasons over it in a single focused turn. Use this when you want an honest read on how your whole fleet is doing.
- **Sunrise** — a morning brief. Athena summarizes the last 24 hours across Messages, Human Review, and Incidents: how many arrived, what is urgent, what is overdue. Use this to orient yourself at the start of a session.

Both buttons bypass the chat turn for the data-gathering step — your click is the trigger, and the summary streams back into the panel like any other reply.

### "Ask Athena" shortcuts throughout the app

Other parts of Personas surface **Ask Athena** buttons that route context directly to her. The Fleet Optimization card on Mission Control, goal pages, message detail views, and other surfaces all have these. Clicking one sends the relevant context as a voice turn through the always-mounted panel — the orb surfaces briefly, acknowledges receipt, and the turn runs in the background so you stay on the screen you were on.

:::tip
Athena can call your connected services directly in chat — Sentry issues, GitHub pull requests, Slack channels, Gmail threads. Pin a connector in the toolbar and she can fetch from it in a background job, then report the results in her next reply without you leaving the conversation.
:::
  `,
};
