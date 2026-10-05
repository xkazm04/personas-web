# Moonshot backlog — 2026-10-05

**114 direction cards, 2 per context, across all 57 contexts in `context-map.json`.**
Produced by `/scan-sweep` with a `moonshot-architect` lens, ideas only. No code was changed.

This is a decision deck, not a work queue. Every card is something only the owner can decide: a
`direction`, an `architecture` move, a `contract` with the desktop repo, or a `policy-loosen` (for
example, the first model call made from the public site). Nothing here is approved to build until it
has a verdict in the table below.

## How to read this

- **Two slots per context.** **A** is a *structural* moonshot: what the system underneath becomes.
  **B** is an *experience* moonshot: what a visitor or operator gets that they can't get today. The
  two slots in a context are always on different seams.
- **Card IDs** read `<file>.<context><slot>`. For example, `4.5B` is file 4, its 5th context, slot B.
- **Each card** (in the group files) has these parts: Summary, Description (with `path:line`
  anchors read on `revamp/stage-fit` @ `0a0957b`, plus `../personas/...` for the desktop repo),
  Flow, Expected impact, Evaluation (Before / After / Method / Result / Gate), **First experiment**
  (≤ 1 day, to test the bet cheaply) and Evidence.
- **Scores** run 1–10: **E**ffort, **I**mpact, **R**isk.
- **Evaluation method.** Almost every card is `Method: simulation`: worked cases with a stated
  falsifier, not a measurement. Treat Impact as a hypothesis. The First experiment is how you'd
  turn it into a figure.
- **Constraint bends are declared.** Some cards ask you to bend a repo rule: a Supabase schema
  change, a new route, live mode instead of mocks, a model call on the site, or an English-first
  launch. Each such card says which rule it bends, under **Description → Constraints**.
- **Verdict column.** Fill it in as you go: `go` / `experiment` / `later` / `no` + reason. A `no`
  becomes a durable never-re-propose for future sweeps.

| Gate | Cards |   | Size | Cards |
|---|---|---|---|---|
| direction | 40 |   | S | 1 |
| architecture | 37 |   | M | 52 |
| contract (desktop repo) | 23 |   | L | 49 |
| policy-loosen | 13 |   | XL | 12 |
| irreversible | 1 | | | |

---

## The twelve themes

The scouts ran independently, one per context group, and still converged. Where four scouts
proposed the same engine without seeing each other's cards, the duplication is itself evidence. Most
of the leverage is in deciding a **theme** once, rather than taking 114 card-by-card calls.

### T1. One seeded "world engine" behind every demo — *four scouts converged*
`2.1A` · `5.9A` · `6.5A` · `8.4A` (plus `3.4A`, `6.1A`, `6.4B` as consumers)

Today the demo is hand-written fixtures that nothing downstream reads:
- "Execute" produces only a toast.
- Settings writes values nobody reads.
- The knowledge base claims 1,973 runs while the demo shows 12 executions.
- Board and Night-shift use the same seed but disagree about the fleet.

The idea is a seeded, deterministic simulator speaking the desktop's event vocabulary, behind
`mockApi` and the realtime seam. Actions would have consequences, and every surface would show the
same fleet. `6.5A` goes furthest, with three feeds (sim / recorded / live sync) on one engine.
**Decide once, then pick one card as the spec.**

### T2. Close the contract the desktop already calls — *highest leverage per line*
`1.2B` · `4.5B` · `2.8B` · `3.2A` · `8.3B` · `5.2B` · `4.5A`

The desktop calls personas-web endpoints that personas-web has never built:
- `GET/POST {base}/api/personas/{slug}`, `/api/personas/publish` and `/api/referrals`
  (`../personas/src-tauri/src/commands/core/gallery.rs:107,144,166`).
- Share URLs at `/p/<slug>`.

Every one of these is a 404 today. Going the other way, the site's only deep link
(`personas://template/<id>`) has no branch in the desktop handler, so it silently does nothing.
Half of this bridge is already built on the desktop side. These cards finish the web half: a public
persona gallery, install-with-agent-inside, and "import this agent" from blog posts and the flow
composer.

### T3. Derive, don't hand-maintain: the desktop as source of truth
`1.3A` · `4.5A` · `4.6A` · `4.7A` · `2.4A` · `2.5A` · `2.7A` · `3.3A` · `3.5A` · `4.2A` · `5.4A` · `5.7A` · `8.6A`

The pattern is the same everywhere: a hand-copied web list drifts from the desktop.
- The 57 web templates share 0 ids with the desktop's 56.
- The catalog has 125 connectors against the desktop's 135.
- The changelog dates are off by three weeks.
- The security claims contradict the desktop's own code.
- 3 of 10 hub trigger ids are misspelled.
- The 6 shared types have drifted.
- The roadmap states disagree across three files.

Each card replaces a hand list with a build-time snapshot of the desktop artefact, plus a drift
gate. `8.6A` (one schema → types, decoders, fixtures) and `2.7A` (every security claim carries a
source line; Impact 9) are the strongest individually.

### T4. Web → desktop remote control over `pending_commands`
`5.6A` · `7.6A` · `8.1A` · `8.1B` · `6.1B` · `7.7B` · `7.2B` · `5.10A`

The sync mirror already has an approval-gated `pending_commands` table
(`scripts/setup-sync-db.sql:349-376`). The web uses almost none of it: cancel and review-resolve
return 501 in live mode even though `cancel_execution` is already allowed. These cards turn the
dashboard, `/m` and push notifications into a real remote for the desktop. `5.10A` (the desktop
vouches for the web session) is the identity layer underneath. **Bends:** live mode instead of the
demo, plus some new command types.

### T5. A model call on the public site — *one policy decision unlocks six cards*
`1.1B` · `2.3B` · `3.6B` · `4.6B` · `5.9B` · `7.3B`

Ask Athena in the tour; the Design Engine taking the visitor's sentence; a live planner behind the
playground's free-text box; a connector dry-run plan; an agent that drives the demo; "grade my
agent". All six need the same new things:
- spend
- a durable rate limit
- disclosure that input goes to Anthropic
- an i18n exception for model output

**Decide the policy once.** If it's yes, build the shared guardrail first and pick one flagship.

### T6. One clock for all motion and scripted demos
`1.1A` · `2.3A` · `3.4A` · `3.6A` · `8.2A` · `8.3A`

The demos run on 26 hand-rolled `setTimeout`/`setInterval` chains, and the tour's 23 cues run on
timers from step entry, so pausing the voice doesn't pause the diagram. Only the hub (`playback.ts`)
and Athena (`stages.ts`) use a pure time model. A shared virtual clock with declared beats makes
every demo seekable, pausable, testable and reduced-motion-correct by construction. `8.2A` is the
platform version and `3.4A` the demo version; they should be one decision.

### T7. Visitor as participant: "break it yourself"
`2.4B` · `3.5B` · `3.2B` · `3.4B` · `2.2B` · `3.3B` · `6.5B` · `2.1B`

The visitor:
- sabotages the night shift
- throws curveballs at a rule table that really runs
- fault-injects their own flow
- approves the human-in-the-loop step
- judges the arena blind
- drills a 99-agent fleet
- seals a real secret in their own browser

Cheap individually, mostly `direction` at risk 3, and they all get much better on top of T1/T6.

### T8. Trust as a feature: the site proves what it claims
`2.6A` · `2.6B` · `5.8B` · `2.7A` · `2.7B` · `5.1B`

A storage register as code, with the cookie and privacy policy rendered from it (`2.6A` and `5.8B`
overlap: merge them). Alongside it:
- a "what this site holds about you" receipt with one-click forget
- a "what this tab sent" inspector
- a firewall-ready egress manifest
- verifiable vote receipts

This is urgent because of defects D3 and D4 below: today the policy pages say things that are false.

### T9. The site readable by agents
`4.2B` · `5.7B` (near-duplicates; merge) · `4.4A`

`llms.txt`, markdown versions of pages, and a read-only MCP resource. Then `4.4A` makes the guide the
desktop's contextual-help backend. This fits an AI-orchestration company, and it's M-sized.

### T10. Agent-run localization and content operations
`4.1A` · `4.1B` · `8.8A` · `8.8B` · `5.5A` · `5.5B`

The guide drift alarm is saturated: 109 of 109 topics are flagged, and the last sync was 686 desktop
commits ago. There are 325 stale and 247 unpinned translation units. These cards hand that loop to a
Personas agent team:
- per-key hash pins
- in-context translation by native speakers
- a locale × direction × route render matrix (`5.5A`, the gate that earns turning the language
  switcher on)
- per-commit screenshot evidence packs (`5.5B`)

### T11. Landing experimentation that reaches real visitors
`1.5A` · `3.1A` · `3.1B` · `8.5A` · `8.5B`

There were 43 landing commits in a month, and none of the 18 lab variants has met a real visitor.
These cards cover:
- outcome-judged arms (`1.5A`)
- one page manifest feeding the page, preview, scroll map and lab (`3.1A`)
- a blind multi-viewport bench (`3.1B`)
- keynote mode, where the stage-fit site plays as a pitch deck (`8.5B`)
- a persistent frame with view transitions (`8.5A`)

### T12. Observability that explains, not just displays
`7.1A/B` · `7.2A` · `7.3A` · `7.4A/B` · `7.5A/B` · `7.7A` · `7.8A/B` · `6.2A/B` · `6.3A` · `7.6B`

Run divergence ("why did this fail when the last one passed?"); click-to-explain spikes; SLOs
derived from history; a routing what-if before retrying a dead letter; incidents computed by
correlation; a health blast radius; knowledge with provenance. Then the big one, `6.3A`, earned
autonomy: verdict history graduates review classes into scoped, expiring grants. The pairs
`6.2B` ≈ `7.6B` ("while you were away") should merge.

### Merge candidates (same idea, two scouts)
`1.2A` ≈ `5.2A` (signed release manifest) · `1.3A` ≈ `4.5A` (templates from the desktop catalog) ·
`1.2B` ≈ `4.5B` (gallery contract) · `1.3B` ≈ `4.7B` (stack composer) · `4.2B` ≈ `5.7B`
(agent-readable site) · `2.6A` ≈ `5.8B` (policy compiled from code) · `5.6A` ≈ `7.6A` ≈ `8.1A`
(command plane) · `3.4A` ≈ `8.2A` (one clock) · `6.2B` ≈ `7.6B` (while you were away) ·
`2.1A` ≈ `5.9A` ≈ `8.4A` ≈ `6.5A` (world engine).

## If you only decide three things

1. **T2: finish the desktop's web contract.** The desktop half exists; today both directions are
   broken (404s one way, a dead deep link the other). It is the most direct route from the site to an
   installed agent.
2. **T1: one world engine for the demo.** Four scouts asked for it independently, and T6, T7 and most
   of T12 get cheaper on top of it.
3. **T5: the policy on model calls from the public site.** One yes or no settles six cards, including
   the three highest-Impact experience bets.

On impact over cost alone, the cheap, high-signal cards are:
- `2.7A` security claims with source lines (I9 / E5 / R5)
- `3.4B` human in the loop (I8 / E5 / R3)
- `4.7B` stack composer (I8 / E5 / R3)
- `7.8A` health derived from sync signals (I8 / E5 / R3)
- `3.3B` hub wakes on the visitor's signals (I8 / E4 / R4)
- `7.8B` blast radius (I7 / E4 / R2)

---

## Defects found on the way (not moonshots)

The scouts were read-only and were asked for directions. These defects came up while they were
grounding cards. Items marked ✔ were re-checked by the coordinator; the rest carry the scout's
anchor and have not been re-verified. They are ordinary fixes, not owner decisions, and most are
S-sized. Run `/scan-sweep --one <context>` to land them through the normal gates.

| # | Defect | Anchor | ✔ |
|---|---|---|---|
| D1 | "Open in Personas" fires `personas://template/<id>`, which has no branch in the desktop deep-link handler (it handles auth/callback, share, import/, ref/, pair). The web's template ids share 0 of 57 with the desktop catalog. The button silently does nothing. | `src/app/templates/[id]/TemplateDetail.tsx:89`; `../personas/src-tauri/src/boot/deep_link.rs:19-61` | ✔ |
| D2 | The desktop calls `/api/personas/{slug}`, `/api/personas/publish` and `/api/referrals` on the site, and builds `/p/<slug>` share URLs. None of these routes exist in `src/app/api`. | `../personas/src-tauri/src/commands/core/gallery.rs:107,144,166` | ✔ |
| D3 | The security page promises "Zero Telemetry … no crash reports … no phone-home behavior whatsoever", but the desktop initialises Sentry at startup when a DSN is set (release builds ship one). This is a false public claim. | `src/data/security.ts:41-50`; `../personas/src-tauri/src/main.rs:46-48` | ✔ |
| D4 | The cookie policy lists two cookies, but theme is stored in localStorage, not a cookie. The site's own `prefer-full` cookie is undeclared, and about 17 localStorage keys (including the voter id and commenter name) are undeclared. | `CookiePolicy.tsx:40-53`; `ViewFullSiteLink.tsx:20` | |
| D5 | In Supabase mode, `getExecution` ignores `offset` and returns the full output, so a running execution's log repeats on every 1s poll. | `src/lib/supabaseApi.ts:349-354` | ✔ |
| D6 | Cancel execution returns 501 in live mode, although the desktop's command allow-list already includes `cancel_execution`. | `src/lib/supabaseApi.ts:361`; `scripts/setup-sync-db.sql:375` | |
| D7 | `/dashboard/health`, `/incidents` and `/director` call mock fetchers with no `isDemo` gate, so a signed-in real tenant sees invented data. | see `7-observability.md` header | |
| D8 | The roadmap disagrees with itself: i18n is "completed" in `src/data/roadmap-phases.ts:62`, `in_progress` in `public/roadmap/v1.json:10`, and still votable in `feature-voting/data.ts:28`. `v1.json` is a live desktop contract. | as listed | |
| D9 | `SITE_URL` defaults to `personas.ai`, but the desktop fetches the roadmap from `personas.so`. | `src/lib/seo.ts:4` | |
| D10 | The site's changelog dates 1.1.0 to 2026-08-07; the desktop tagged v1.1.0 on 2026-07-16. About 353 unreleased desktop bullets appear nowhere on the site. | see `2-showcase-content.md` 2.5A | |
| D11 | The flow composer CTA says "ready to import" and links to `#download`, but `/how` has no `#download` target. | `FlowCTA.tsx:21` | |
| D12 | The demos contradict themselves: the race's timer shows 1.8s while its text says "Resolved in 4 seconds", and "40% faster" is measured against a workflow that ended STUCK. The race says the customer waits "hours", while the chat on the same page says "47 minutes". | see `3-interactive-demos.md` 3.5 / 3.6 | |
| D13 | 3 of the hub's 10 trigger ids differ from the desktop `TriggerKind` (`file`/`focus`/`event` vs `file_watcher`/`app_focus`/`event_listener`). | see `3-interactive-demos.md` 3.3A | |
| D14 | One tour cue clicks a button by its English label, so it does nothing in the other 13 locales. | see `1-marketing-landing.md` 1.1A | |
| D15 | The connector "Try it" terminal plays the same script for every connector, using a `personas run` command the desktop doesn't ship. 88 of 125 connectors have only placeholder use cases, and 10 desktop connectors are missing (the LLM-observability set). | see `4-guide-connectors.md` 4.6 / 4.7 | |
| D16 | The guide parser silently drops unknown or malformed directives. | `parseBlocks.tsx:133-134` | |
| D17 | Settings values have no consumer outside Settings, and the review escalation ladder can never turn on because nothing calls `setEscalationEnabled`. | `src/stores/settingsStore.ts:25-47`; `src/stores/reviewStore.ts:355` | |
| D18 | `useLiveStats` and `/api/stats` (531 lines) have zero consumers. | `src/hooks/useLiveStats.ts` | |
| D19 | `src/lib/types.ts` claims to mirror `personas-cloud` shared types; all 6 shared interfaces have drifted. | `src/lib/types.ts:2` | |
| D20 | The mock data contradicts itself: the Director uses a second set of five agents; a dead-lettered gitlab event says "no subscription matched" next to a matching subscription; 60 memories are built from 20 titles. | see `6-dashboard-ops.md`, `7-observability.md` | |
| D21 | `context-map.json` is stale: 40+ listed paths no longer exist (most removed by `72dae5f`), and live folders are unlisted (`security-vault/`, `memory-layers/`, `multi-provider/`, 4 e2e specs, incident files moved). | per-file headers | |
| D22 | Some feature docs are stale. `proxy.ts` is described as dormant, but it is Next 16's middleware convention and is likely live. `detail-modal.md` says `SetupCTA` is unused, but it is rendered. `security.md`'s FAQ-duplicate note and `healing-circuit.md` are out of date. | `docs/features/...` | |

---

## All cards

Fill in the Verdict column. Full cards live in the group files linked in each heading.

### Marketing & Landing — [1-marketing-landing.md](1-marketing-landing.md)

| ID | Context | Card | Slot | Size | E | I | R | Gate | Verdict |
|---|---|---|---|---|---|---|---|---|---|
| 1.1A | Guided Product Tour | Diagram-owned beats on a narration clock | A·struct | L | 6 | 6 | 4 | architecture | |
| 1.1B | Guided Product Tour | Ask Athena: the tour becomes a conversation that drives the page | B·exp | XL | 8 | 8 | 7 | policy-loosen | |
| 1.2A | Conversion: Get Started, FAQ & Footer | Release plane: the site reads the desktop's signed updater manifest | A·struct | M | 5 | 7 | 4 | contract | |
| 1.2B | Conversion: Get Started, FAQ & Footer | Install with your agent already inside: serve the desktop's gallery contract | B·exp | XL | 8 | 8 | 6 | contract | |
| 1.3A | Why Agents & Use Cases | One template truth: compile the use-case corpus from the desktop catalog | A·struct | L | 6 | 7 | 4 | contract | |
| 1.3B | Why Agents & Use Cases | Bring your stack: the section builds the visitor's own fleet | B·exp | M | 5 | 7 | 3 | direction | |
| 1.4A | Features Overview & Pricing | Real-app specimens: /features renders the shipped desktop UI, replayed from tapes | A·struct | XL | 8 | 8 | 6 | direction | |
| 1.4B | Features Overview & Pricing | Plan-fit simulator: will my agents fit my Claude plan? | B·exp | M | 5 | 8 | 5 | direction | |
| 1.5A | Homepage & Hero | Landing arms: lab variants ship to real traffic and are judged by outcomes | A·struct | L | 6 | 8 | 5 | architecture | |
| 1.5B | Homepage & Hero | Live fleet pulse: the hero shows the maker's real agents working, now | B·exp | L | 6 | 7 | 6 | policy-loosen | |

### Product Showcase + Content Pages — [2-showcase-content.md](2-showcase-content.md)

| ID | Context | Card | Slot | Size | E | I | R | Gate | Verdict |
|---|---|---|---|---|---|---|---|---|---|
| 2.1A | Observability Deck & Security Vault | A seeded fleet simulator that speaks the desktop's event vocabulary | A·struct | L | 6 | 7 | 4 | architecture | |
| 2.1B | Observability Deck & Security Vault | Seal a real secret in the visitor's own browser | B·exp | M | 4 | 7 | 3 | direction | |
| 2.2A | Agent Lab & Plugin Ecosystem | One experiment matrix behind all four Lab tabs | A·struct | M | 5 | 6 | 3 | architecture | |
| 2.2B | Agent Lab & Plugin Ecosystem | Blind-judge arena: the visitor becomes the eval | B·exp | M | 5 | 7 | 4 | direction | |
| 2.3A | Memory Layers & Multi-Provider AI | A scene runtime: illustrations as declared beats, not hand-rolled timelines | A·struct | L | 6 | 6 | 4 | architecture | |
| 2.3B | Memory Layers & Multi-Provider AI | The Design Engine takes the visitor's sentence | B·exp | L | 7 | 9 | 6 | policy-loosen | |
| 2.4A | Self-Healing & Trigger Automation | Healing copy compiled from the desktop's decision table | A·struct | M | 5 | 6 | 3 | contract | |
| 2.4B | Self-Healing & Trigger Automation | "Break it yourself": a night the visitor sabotages | B·exp | M | 5 | 7 | 3 | direction | |
| 2.5A | How It Works & Changelog | Release notes compiled from the desktop's CHANGELOG and tags | A·struct | M | 5 | 7 | 5 | contract | |
| 2.5B | How It Works & Changelog | A role-threaded /how: one request followed through all four demos | B·exp | L | 6 | 7 | 4 | direction | |
| 2.6A | Legal & Policy | A storage register as code, with the cookie policy rendered from it | A·struct | M | 4 | 7 | 3 | architecture | |
| 2.6B | Legal & Policy | A live "what this site holds about you" receipt with one-click forget | B·exp | S | 3 | 6 | 2 | direction | |
| 2.7A | Security & Compliance | Every security claim carries a source line, and a build gate checks it | A·struct | M | 5 | 9 | 5 | contract | |
| 2.7B | Security & Compliance | A firewall-ready egress manifest: every host Personas can reach, and what breaks if you block it | B·exp | M | 5 | 8 | 4 | direction | |
| 2.8A | Blog | The blog joins the guide's content engine: block-rich, linkable, localized | A·struct | L | 6 | 6 | 4 | architecture | |
| 2.8B | Blog | "Import this agent": posts ship the persona they describe, through the desktop's own deep link | B·exp | M | 5 | 8 | 5 | contract | |

### Interactive Demos & Playground — [3-interactive-demos.md](3-interactive-demos.md)

| ID | Context | Card | Slot | Size | E | I | R | Gate | Verdict |
|---|---|---|---|---|---|---|---|---|---|
| 3.1A | Section Preview & Demo Harness | Page manifests: one declaration feeds the page, the preview, the scroll map and the lab | A·struct | L | 6 | 7 | 4 | architecture | |
| 3.1B | Section Preview & Demo Harness | The variant bench: a permanent, blind, multi-viewport review console | B·exp | M | 5 | 7 | 3 | direction | |
| 3.2A | Visual Flow Composer & Playground Page | The composer emits a real Personas bundle the desktop can import | A·struct | L | 7 | 8 | 5 | contract | |
| 3.2B | Visual Flow Composer & Playground Page | Run your flow: the composer becomes a fault-injectable simulator | B·exp | M | 5 | 7 | 3 | direction | |
| 3.3A | Orchestration & Platform Visualizers | A desktop vocabulary snapshot: visualizers derived from the app's generated bindings | A·struct | M | 5 | 7 | 4 | contract | |
| 3.3B | Orchestration & Platform Visualizers | The hub wakes on the visitor's own signals | B·exp | M | 4 | 8 | 4 | direction | |
| 3.4A | Split & Pipeline Playground | One virtual-clock run engine for every scripted demo | A·struct | L | 6 | 7 | 4 | architecture | |
| 3.4B | Split & Pipeline Playground | You are the human in the loop: the demo pauses for your approval and remembers it | B·exp | M | 5 | 8 | 3 | direction | |
| 3.5A | Agent Execution Timeline Race | Measured races: every number on the track comes from a recorded desktop run | A·struct | XL | 8 | 8 | 5 | contract | |
| 3.5B | Agent Execution Timeline Race | Break the workflow yourself: visitor-chosen curveballs against a rule table that really runs | B·exp | M | 5 | 7 | 3 | direction | |
| 3.6A | Agent Playground & Multi-Agent Chat | One scenario corpus for every demo, written and translated once | A·struct | L | 6 | 7 | 3 | architecture | |
| 3.6B | Agent Playground & Multi-Agent Chat | Your sentence, really planned: a live planner behind the free-text box, ending in a real template | B·exp | L | 7 | 9 | 6 | policy-loosen | |

### Guide + Connectors & Templates — [4-guide-connectors.md](4-guide-connectors.md)

| ID | Context | Card | Slot | Size | E | I | R | Gate | Verdict |
|---|---|---|---|---|---|---|---|---|---|
| 4.1A | Localized Guide Content (14 locales) | Self-healing translation loop: work order to re-pinned commit, run by agents | A·struct | L | 6 | 7 | 4 | policy-loosen | |
| 4.1B | Localized Guide Content (14 locales) | The guide ships localized first: SSR locale on /guide, with no route change | B·exp | M | 5 | 7 | 5 | policy-loosen | |
| 4.2A | Guide Data, Content & Search Index | Claim-anchored truth: guide sentences that fail when the desktop changes | A·struct | L | 7 | 8 | 4 | architecture | |
| 4.2B | Guide Data, Content & Search Index | Agent-readable guide: llms.txt, raw markdown, and a Personas MCP resource | B·exp | M | 4 | 7 | 3 | contract | |
| 4.3A | Guide Content Blocks & Markdown | One guide AST: parse once, and every reader consumes the same tree | A·struct | M | 5 | 6 | 3 | architecture | |
| 4.3B | Guide Content Blocks & Markdown | Operable docs: `:::live` blocks that mount the real demo surfaces | B·exp | L | 6 | 7 | 5 | direction | |
| 4.4A | Guide Pages & Navigation | The guide as the desktop's contextual-help backend | A·struct | M | 5 | 7 | 4 | contract | |
| 4.4B | Guide Pages & Navigation | Outcome paths: cross-category curricula with resumable progress | B·exp | M | 4 | 6 | 2 | direction | |
| 4.5A | Templates Gallery & Detail | Templates derived from the desktop's real catalog, with a deep link the app handles | A·struct | L | 6 | 8 | 6 | irreversible | |
| 4.5B | Templates Gallery & Detail | Close the desktop's share loop: the public persona gallery it already calls | B·exp | L | 7 | 9 | 6 | contract | |
| 4.6A | Connector Detail Modal | The modal renders the desktop connector manifest: setup, credentials, and what it cannot do | A·struct | M | 4 | 7 | 3 | architecture | |
| 4.6B | Connector Detail Modal | Plan before you install: describe a job and get this connector's real dry-run plan | B·exp | M | 5 | 7 | 5 | direction | |
| 4.7A | Connectors Catalog | One live capability registry: desktop manifests to every web surface, with a drift gate | A·struct | M | 4 | 6 | 3 | architecture | |
| 4.7B | Connectors Catalog | Stack composer: pick the tools you use and see the agents you could run | B·exp | M | 5 | 8 | 3 | direction | |

### Roadmap/Voting + Infrastructure — [5-roadmap-infra.md](5-roadmap-infra.md)

| ID | Context | Card | Slot | Size | E | I | R | Gate | Verdict |
|---|---|---|---|---|---|---|---|---|---|
| 5.1A | Server-Side Vote Persistence | Append-only community ledger in place of read-modify-write stores | A·struct | L | 6 | 6 | 5 | architecture | |
| 5.1B | Server-Side Vote Persistence | Verifiable vote receipts - a public tally anyone can audit | B·exp | M | 5 | 5 | 3 | direction | |
| 5.2A | Waitlist & App Download | One signed release manifest drives the CTA, the updater and the waitlist | A·struct | L | 6 | 8 | 5 | contract | |
| 5.2B | Waitlist & App Download | "Your first agent is waiting" - the waitlist becomes a pre-configured install | B·exp | M | 5 | 7 | 4 | direction | |
| 5.3A | Feature Voting & Comments | Requests become roadmap candidates - a clustering pipeline grows the votable set | A·struct | M | 5 | 6 | 4 | direction | |
| 5.3B | Feature Voting & Comments | Votes from people who actually run Personas - in-app voting, two tallies | B·exp | L | 7 | 7 | 5 | contract | |
| 5.4A | Public Roadmap | One roadmap ledger compiled to the page, v1.json in 14 locales, and the votable set | A·struct | L | 6 | 8 | 5 | contract | |
| 5.4B | Public Roadmap | Watch the fleet build it - live agent work under each in-progress roadmap item | B·exp | XL | 8 | 9 | 7 | policy-loosen | |
| 5.5A | Build Config & E2E Tests | A render matrix across locale, direction and route - the gate that earns the language switcher | A·struct | L | 6 | 8 | 3 | architecture | |
| 5.5B | Build Config & E2E Tests | An evidence pack for every agent-authored commit - review by filmstrip, not by checkout | B·exp | M | 5 | 7 | 3 | direction | |
| 5.6A | Supabase Client | A closed-loop command plane - every read-only verb becomes an approval-gated command with a live result | A·struct | L | 6 | 8 | 5 | architecture | |
| 5.6B | Supabase Client | A live roadmap room - presence and votes propagate to everyone on /roadmap | B·exp | M | 4 | 6 | 3 | direction | |
| 5.7A | SEO & Social Metadata | A claims and freshness compiler - every public number and date derived, never typed | A·struct | M | 5 | 7 | 3 | architecture | |
| 5.7B | SEO & Social Metadata | An agent-native site - llms.txt, markdown twins and a read-only MCP endpoint | B·exp | M | 5 | 7 | 4 | direction | |
| 5.8A | Error Monitoring & Analytics | A field-performance ratchet - real-user vitals per route beside bundle-budget.json | A·struct | M | 4 | 7 | 3 | architecture | |
| 5.8B | Error Monitoring & Analytics | Glass-box telemetry - the privacy policy compiled from the code, plus a "what this tab sent" inspector | B·exp | M | 4 | 6 | 2 | direction | |
| 5.9A | Orchestrator API Client & Mock Data | A simulated orchestrator - a seeded world engine behind mockApi, where actions have consequences | A·struct | XL | 8 | 8 | 5 | architecture | |
| 5.9B | Orchestrator API Client & Mock Data | Ask the demo - an agent that drives the dashboard through ApiClient as its tool set | B·exp | L | 7 | 8 | 5 | direction | |
| 5.10A | Authentication & User Session | Paired-device identity - the desktop vouches for the web session | A·struct | L | 7 | 7 | 6 | architecture | |
| 5.10B | Authentication & User Session | Shared demo rooms - a multiplayer demo that previews Team Workspaces | B·exp | L | 6 | 7 | 4 | direction | |

### Agent Operations Dashboard — [6-dashboard-ops.md](6-dashboard-ops.md)

| ID | Context | Card | Slot | Size | E | I | R | Gate | Verdict |
|---|---|---|---|---|---|---|---|---|---|
| 6.1A | Messages & Settings | Settings becomes the fleet policy that every other surface obeys | A·struct | L | 6 | 7 | 4 | architecture | |
| 6.1B | Messages & Settings | The inbox answers back: reply to a persona, and the reply runs | B·exp | L | 6 | 8 | 5 | contract | |
| 6.2A | Knowledge Base | Knowledge with provenance: every pattern and memory links to the runs that taught it | A·struct | L | 6 | 7 | 4 | architecture | |
| 6.2B | Knowledge Base | "What your fleet learned while you were away": a learning time-lapse | B·exp | M | 5 | 7 | 3 | direction | |
| 6.3A | Manual Review Queue | Earned autonomy: verdict history graduates review classes into scoped, expiring grants | A·struct | XL | 8 | 9 | 6 | architecture | |
| 6.3B | Manual Review Queue | Hands-free triage: the queue speaks, and you answer out loud | B·exp | M | 5 | 6 | 5 | direction | |
| 6.4A | Agents (Personas) Management | The whole persona on the web: Core, spec and change history as one model | A·struct | L | 7 | 7 | 5 | contract | |
| 6.4B | Agents (Personas) Management | Hire an agent on the website: from template to a working teammate in the demo fleet | B·exp | XL | 8 | 9 | 6 | direction | |
| 6.5A | Fleet Playground (prototypes) | One fleet engine with three feeds: seeded sim, recorded session, live sync mirror | A·struct | XL | 8 | 9 | 6 | architecture | |
| 6.5B | Fleet Playground (prototypes) | Fleet drills: a flight simulator for running 99 agents | B·exp | L | 6 | 8 | 4 | direction | |

### Observability & Event Monitoring — [7-observability.md](7-observability.md)

| ID | Context | Card | Slot | Size | E | I | R | Gate | Verdict |
|---|---|---|---|---|---|---|---|---|---|
| 7.1A | Execution History & Streaming | Run tape: one cursor-safe, typed execution log behind poll, SSE and sync | A·struct | L | 6 | 7 | 4 | contract | |
| 7.1B | Execution History & Streaming | Run divergence: "why did this fail when the last one passed?" | B·exp | L | 6 | 8 | 3 | direction | |
| 7.2A | Leaderboard & Rankings | Standings from snapshots: windowed, task-fair ratings with real movement | A·struct | M | 5 | 7 | 3 | architecture | |
| 7.2B | Leaderboard & Rankings | Champion vs. challenger: replay the leader's real inputs on a rival | B·exp | L | 7 | 8 | 6 | policy-loosen | |
| 7.3A | Director Coaching | One fleet, one judge: a synced verdict ledger that becomes the fleet's quality axis | A·struct | L | 6 | 8 | 5 | contract | |
| 7.3B | Director Coaching | "Grade my agent": the Director as a public, rubric-scored grader on the site | B·exp | XL | 8 | 8 | 7 | policy-loosen | |
| 7.4A | Observability Charts & SLA | Error-budget engine: SLOs derived from the run history, not declared | A·struct | L | 6 | 8 | 4 | architecture | |
| 7.4B | Observability Charts & SLA | Click-to-explain: every spike decomposes itself | B·exp | M | 5 | 7 | 3 | direction | |
| 7.5A | Event Bus & Stream Monitoring | The bus draws itself: topology, swimlane and throughput as projections of the event log | A·struct | L | 6 | 7 | 4 | architecture | |
| 7.5B | Event Bus & Stream Monitoring | Routing what-if: run the dead letter through today's subscriptions before you retry | B·exp | M | 4 | 7 | 3 | direction | |
| 7.6A | Dashboard Home Overview | Fleet remote: the home drives the desktop through approval-gated commands and shows the round trip | A·struct | L | 7 | 9 | 6 | policy-loosen | |
| 7.6B | Dashboard Home Overview | "While you were away": a narrated briefing of everything that changed | B·exp | M | 5 | 7 | 3 | direction | |
| 7.7A | Incidents Inbox | Incidents as a computed ledger: correlate signals instead of authoring incidents | A·struct | L | 7 | 8 | 5 | architecture | |
| 7.7B | Incidents Inbox | Hand it to Athena: agent-run investigation with an approval-gated fix | B·exp | XL | 8 | 9 | 6 | policy-loosen | |
| 7.8A | System Health Panel | Health of the bridge you can actually see: derive the board from sync signals | A·struct | M | 5 | 8 | 3 | architecture | |
| 7.8B | System Health Panel | Blast radius: every failing check shows what it takes down | B·exp | M | 4 | 7 | 2 | direction | |

### Platform, Theming & i18n — [8-platform-i18n.md](8-platform-i18n.md)

| ID | Context | Card | Slot | Size | E | I | R | Gate | Verdict |
|---|---|---|---|---|---|---|---|---|---|
| 8.1A | Mobile App Shell & Views | /m as the remote control for the desktop app, via the pending_commands plane | A·struct | L | 7 | 8 | 6 | contract | |
| 8.1B | Mobile App Shell & Views | Lock-screen approvals: installable /m with Web Push for reviews that need a human | B·exp | L | 6 | 8 | 5 | policy-loosen | |
| 8.2A | Animation & Motion System | One seekable motion clock for every loop on the site | A·struct | XL | 8 | 7 | 6 | architecture | |
| 8.2B | Animation & Motion System | A visitor-owned motion dial: Full / Calm / Still, applied before first paint | B·exp | M | 4 | 6 | 3 | direction | |
| 8.3A | Shared UI Primitives & Illustrations | A scene kernel: SVG art built from tokenized, translated, gated primitives | A·struct | L | 7 | 7 | 4 | architecture | |
| 8.3B | Shared UI Primitives & Illustrations | Every demo ends in something you own: terminal transcripts hand off to the desktop app | B·exp | M | 5 | 8 | 4 | contract | |
| 8.4A | Dashboard Shell, Chrome & Realtime | A demo that is alive: a seeded fleet simulator behind the real realtime seam | A·struct | L | 6 | 8 | 4 | architecture | |
| 8.4B | Dashboard Shell, Chrome & Realtime | The dashboard as an addressable instrument: one action registry for a command palette and for agents | B·exp | L | 6 | 7 | 5 | direction | |
| 8.5A | Layout, Navigation & Page Shell | A persistent site frame: navbar and footer mounted once, with route changes through React ViewTransition | A·struct | L | 6 | 7 | 5 | architecture | |
| 8.5B | Layout, Navigation & Page Shell | Keynote mode: the stage-fit site plays as a narrated, keyboard-driven pitch deck | B·exp | M | 4 | 7 | 3 | direction | |
| 8.6A | Shared Types, Utilities & Hooks | One schema, three planes: generate types, row decoders and demo fixtures from the sync contract | A·struct | L | 7 | 7 | 4 | architecture | |
| 8.6B | Shared Types, Utilities & Hooks | Bring your own fleet: drop a desktop export into the web dashboard, parsed locally and never uploaded | B·exp | M | 5 | 7 | 5 | contract | |
| 8.7A | Theme System | A theme compiler: seeds in, then every variant, the pre-paint list and contrast proofs out | A·struct | M | 5 | 6 | 4 | architecture | |
| 8.7B | Theme System | "See Personas in your brand": the visitor's colour re-skins the site and the demo, shareable by link | B·exp | M | 4 | 7 | 4 | direction | |
| 8.8A | Internationalization (14 locales) | A per-key hash-pinned UI catalog, translated and re-verified by a Personas agent team | A·struct | L | 7 | 8 | 5 | architecture | |
| 8.8B | Internationalization (14 locales) | In-context translation mode: native speakers fix strings on the page they are reading | B·exp | M | 5 | 6 | 5 | policy-loosen | |
