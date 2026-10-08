# Moonshot sweep: Agent Operations Dashboard (5 contexts, 10 cards)

Anchors are against the working tree on `revamp/stage-fit` (the owner's main checkout). The `dashboard/spa` branch
(C:/t/dash-spa) moves the dashboard route code to `src/components/dashboard/views/<view>/` and fleet-playground to
`fleet-monitor/`. It also deletes the Agents grid, `AgentDetail` and `AgentMetrics`, and makes the Board and Night views the
`personas` main view. Every card below still holds after that move, and none of them re-proposes the SPA shell, the
two-level menu, the Personas main view or the Mission Control wall.

Two facts recur in several cards:

- **The real data plane already exists, as a Supabase sync mirror, not the orchestrator.** It has `synced_*` tables for personas,
  executions, messages, memories, knowledge patterns, manual reviews and the fleet queue, realtime on 9 tables
  (commit `df30dad`), and an approval-gated `pending_commands` table that writes from the web to the desktop
  (`scripts/setup-sync-db.sql:349-376`).
- **The demo's fixtures are written by hand and nothing downstream reads them.** Settings writes values no other code reads.
  Executing a persona produces nothing. The knowledge counts cannot be derived from the runs the demo shows.

---

## Messages & Settings
Today this context is two things. The inbox lists persona run reports as threads, with read-state overrides, a threads/list view
toggle and pagination. Settings holds the account card, the cloud status card, notification and voice toggles, the BYOM provider
allow-list and credential rotation. Files: 12.

### 6.1A · Settings becomes the fleet policy that every other surface obeys
**Slot:** structural  ·  **Size:** L  ·  **Effort:** 6/10  ·  **Impact:** 7/10  ·  **Risk:** 4/10  ·  **Gate:** architecture

#### Summary
Turn Settings from a store that only it writes into one typed, versioned **FleetPolicy** document that the demo's surfaces read.
Alert severity filters alerts, the provider allow-list reroutes runs and cost, and the review escalation ladder governs Reviews.
Each edit shows what it will change before it is committed.

#### Description
`settingsStore` persists three fields: `alertSeverity`, `weeklyDigest` and `providerOverrides`
(`src/stores/settingsStore.ts:25-31`, `:40-47`). A grep finds no consumer outside the two Settings cards that write them
(`NotificationsCard.tsx:21-24`, `ModelProvidersCard.tsx:19-20`). The home ticker counts allowed providers straight from the
fixture and ignores the override (`src/app/dashboard/home/home-page/useTickerItems.ts:65`), so switching a provider off changes
nothing anywhere. Nothing produces the weekly digest.

The one policy that does act is the review escalation ladder. It lives somewhere else: under its own localStorage keys inside
`reviewStore` (`src/stores/reviewStore.ts:100-156`). `escalationEnabled` only becomes true if localStorage already says so
(`reviewStore.ts:355`), and no UI anywhere calls `setEscalationEnabled`. So the SLA ladder never runs for a visitor
(`src/app/dashboard/reviews/ReviewsSplitPane.tsx:36`). Today a visitor can flip every switch and learn nothing about how Personas
governs a fleet.

**The moonshot** has five parts:
- **One schema.** A `FleetPolicy` schema covering alerts, digest, providers, the escalation ladder, voice and rotation. Every load
  and write is validated the way `validateEscalationPolicy` already validates the ladder (`src/lib/review-sla.ts`).
- **One store, with history.** A single store, versioned, with a change log.
- **Rendered from the schema.** The Settings page is generated from the schema rather than written card by card.
- **Real consumers.** Health and incident feeds filter by the severity policy. Mock routing and the cost cards honor the provider
  allow-list. Reviews read the ladder.
- **Impact preview.** Before an edit commits, it shows its consequences: "2 pending reviews would auto-approve now", "$X a day
  rerouted", "N alerts hidden".

The policy also exports as JSON, which makes it a candidate contract with the desktop app, the way `roadmap/v1.json` is. The
design reuses the `settingsStore` persistence pattern, `validateEscalationPolicy` and `SettingToggle`.

**Constraints:** New copy has to ship in all 14 locales. In real mode the policy stays device-local, so there is no Supabase schema
change. A synced policy table would be a separate decision for the owner.

#### Flow
- Move the escalation policy and its enabled flag into the policy store, and add a ladder editor to Settings. This proves the bet:
  a setting that visibly changes the Reviews page.
- Make the provider allow-list feed the mock routing and cost selectors and the ticker.
- Make the severity policy filter the health and incident lists. Make the digest toggle produce a weekly digest thread in
  Messages.
- Add the impact preview, the change log and the JSON export.

#### Expected impact
Demo visitors and evaluators see governance as cause and effect: change a policy and the fleet behaves differently. The measure
is how many policy controls have at least one consumer outside Settings. What could break: reviews auto-approving in the middle of
a demo. Keep the ladder off by default and show its state.

#### Evaluation
Claim: user - every Settings control changes at least one other surface.
Before: 0 of the 3 `settingsStore` fields is read outside Settings, and the escalation ladder has 0 UI controls. Walked case:
switching OpenAI off leaves the ticker's provider count unchanged, because `useTickerItems.ts:65` reads the fixture.
After: 6 of 6 policy fields have at least one consumer. A provider switch changes the ticker and the cost card in the same
session.
Method: simulation. Walked three cases:
1. Provider off, then check the ticker.
2. Critical alerts off, then check the health list.
3. Set the info SLA to 60 min with `auto_approve`, then see which pending seeds would resolve.

The prediction is falsified if the impact preview needs special-case code for each surface. That would mean the schema is the
wrong seam.
Result: better
Gate: architecture

#### First experiment
Add the ladder editor and the enabled toggle to the existing Notifications card, calling the existing `reviewStore` setters with
no new store. Confirm that the demo's Reviews header ("Overdue: N") and its auto-approve both react. Takes one day or less.

#### Evidence
- `src/stores/settingsStore.ts:25-31` - the three persisted fields; the only consumers are two Settings cards (grep).
- `src/app/dashboard/home/home-page/useTickerItems.ts:65` - reads `MOCK_MODEL_PROVIDERS.allowed` and ignores `providerOverrides`.
- `src/stores/reviewStore.ts:355` - escalation is enabled only by a localStorage key; `setEscalationEnabled` has no UI caller.
- `src/app/dashboard/reviews/ReviewsSplitPane.tsx:36` - `if (!escalationEnabled) return;`, so the ladder is dormant in the demo.
- `.ai/registry-map.json` - Messages & Settings is mapped to `settings` (strong), state `unknown`.

### 6.1B · The inbox answers back: reply to a persona, and the reply runs
**Slot:** experience  ·  **Size:** L  ·  **Effort:** 6/10  ·  **Impact:** 8/10  ·  **Risk:** 5/10  ·  **Gate:** contract

#### Summary
Make a thread a two-way channel. The operator replies inside the thread. The reply becomes the persona's next instruction: a
`run_persona` command that carries the thread. The persona's answer lands back in the same thread.

#### Description
Today the inbox is read-only. `ThreadDetailModal` renders the parent and its replies as markdown articles and has no composer
(`src/app/dashboard/messages/messages-page/ThreadDetailModal.tsx:55-62`, `:102`). The only write actions are mark-read.

The fixture shows the gap. Reply bodies are written in a human's voice, such as "Approved - going ahead with the suggested
action" (`src/lib/mock-dashboard-data.ts:978-979`). Yet every reply is attributed to the persona (`persona: persona.name`, `:1055`),
because the data model has no author. Messages also ask for actions the inbox cannot take: "Retry budget exceeded, escalating to
human" (`:956`) and "Open the **Lab** to start the comparison" (`:939`).

The real plane already has the door:
- `supabaseApi.executePersona` inserts an approval-gated `pending_commands` row of type `run_persona` with a free-text prompt
  (`src/lib/supabaseApi.ts:360-397`).
- The table's CHECK allows `run_persona` (`scripts/setup-sync-db.sql:374-375`), and its `params` column is jsonb (`:356`).
- `synced_messages` carries `thread_id` and `execution_id` (`:159-176`), so the persona's answer can land back in the thread.

**The moonshot** has four parts:
- **Composer and author.** A composer in the thread, plus an `author` field on every message (operator, persona or system).
- **Suggested replies.** A row of suggestions derived from the message kind: retry, promote the candidate, escalate.
- **Demo mode.** A deterministic scripted responder: the persona answers within seconds with a run report built from the existing
  `messageReportBody` templates.
- **Real mode.** The reply is sent as `run_persona` with `params: {threadId, replyTo}`. The desktop's approval prompt stays the
  safety gate.

The inbox becomes the conversation surface of a multi-agent product, which is something an orchestration company should ship on
its own site.

**Constraints:** Real mode needs the desktop to write its answer with that `thread_id`. That is a contract change across repos,
but not a schema change. This stays off the orchestrator: it uses the Supabase mirror that is already in the tree. Composer copy
ships in all 14 locales.

#### Flow
- Demo: the composer, the `author` field and the scripted responder. This proves whether visitors reply at all.
- Suggested replies by message kind.
- Real mode: `run_persona` with `params.threadId`; the desktop threads its output.
- A live unread nav badge, replacing the constant `MOCK_UNREAD_MESSAGES = 7` (`mock-dashboard-data.ts:1141`).

#### Expected impact
Operators get one place to read a report and act on it. Visitors see agents converse, not just log. The measure is replies per
demo session, and in real mode, commands sent from a thread. What could break: a scripted answer that feels canned. Keep it short
and specific to the message kind.

#### Evaluation
Claim: user - a thread becomes actionable.
Before: 3 handlers (`markThreadRead`, `markAllRead`, `openThread`), and none of them writes to an agent. There is no author field,
so a human reply renders as the persona.
After: a reply plus at least 2 suggested actions per thread, and the persona's answer arrives in the same thread.
Method: simulation. Walked three threads:
1. The "Retry budget exceeded" thread: the suggested "retry with backoff" reply becomes `run_persona` with that prompt.
2. The A/B candidate thread (kind 8): a "promote" reply.
3. The cost-spike thread: an "explain" reply.

The prediction is falsified if the desktop cannot thread its run output into `thread_id` without a schema change.
Result: better
Gate: contract

#### First experiment
Add a composer to `ThreadDetailModal` that appends an operator reply and, after 2 seconds, one scripted persona reply. It runs in
demo mode only, using local state in the same way as the `overrides` map. Then walk 3 sessions and count replies.

#### Evidence
- `src/app/dashboard/messages/messages-page/ThreadDetailModal.tsx:55-62` - the modal renders messages only; there is no input.
- `src/lib/mock-dashboard-data.ts:978-979`, `:1055` - human-voice replies are attributed to the persona.
- `src/lib/supabaseApi.ts:360-397` - the `run_persona` command insert already exists.
- `scripts/setup-sync-db.sql:356`, `:374-375`, `:159-176` - the jsonb `params` column, the allowed command set, and
  `thread_id` on `synced_messages`.

---

## Knowledge Base
Today this context offers three lenses on 8 hand-written patterns and 60 seeded memories: a dense table, a radial cluster graph,
and memory cards with batch conflict resolution. Files: 27.

### 6.2A · Knowledge with provenance: every pattern and memory links to the runs that taught it
**Slot:** structural  ·  **Size:** L  ·  **Effort:** 6/10  ·  **Impact:** 7/10  ·  **Risk:** 4/10  ·  **Gate:** architecture

#### Summary
Give knowledge a lineage. Every pattern carries the executions that evidence it, and every memory carries the pattern or run it was
promoted from. The cluster graph's edges become evidence edges. The demo's knowledge is then compiled from the demo's own run log
instead of being written by hand.

#### Description
Neither display type has room for evidence: `KnowledgePattern` (`src/lib/mock-dashboard-data.ts:214-226`) and `MemoryItem`
(`:442-458`).

The sync contract already carries it:
- `synced_knowledge_patterns` has `last_execution_id`, `pattern_data` and `use_case_id` (`scripts/setup-sync-db.sql:239-257`).
- `synced_memories` has `source_execution_id` (`:220-233`).
- `supabaseApi` maps those fields (`src/lib/supabaseApi.ts:683`, `:716-725`).
- `mapSyncedPattern` and `mapSyncedMemory` then drop them (`src/app/dashboard/knowledge/useKnowledgeData.ts:53-97`).

The demo is worse:
- The 8 patterns claim **1,973 observed runs** (success plus failure counts, `mock-dashboard-data.ts:228+`), but the demo shows
  **12 executions** (`src/lib/mockData.ts:159-452`).
- 60 memories are generated from a pool of **20 titles**, so each title appears 3 times (`:524-560`).
- Conflicts are rolled at random, 12% of memories (`:548`). Each gets a reason, but never the memory it conflicts with.
- The graph's edges are a complete graph per persona (`knowledge-cluster-graph/knowledgeClusterLayout.ts:46-63`). They say "same
  owner", not "learned from".

**The moonshot** has four parts:
- **Evidence fields.** Add `evidence: {executionIds, lastExecutionId, derivedFrom}` to both types.
- **Conflicts as pairs.** A conflict links memory A to memory B and states the scope they overlap on.
- **Lineage graph.** The graph draws lineage: execution to pattern to memory, plus conflict edges between memories. Detail panels
  link to the runs on the Executions page.
- **A deterministic compiler for the demo.** It derives patterns from a seeded execution log, so the counts reconcile with what
  Executions shows. It takes the place of today's dead `derived.ts`.

Real mode only needs the mappers to stop discarding fields, so no schema change is involved.

#### Flow
- Pass `lastExecutionId` and `sourceExecutionId` through both mappers, and add an "evidence" link to both detail panels. This
  proves the bet in real mode at once.
- Link the demo's `kp_*` patterns to the existing `MOCK_EXECUTIONS` ids.
- Model conflicts as pairs, and redraw the graph as a lineage graph.
- Build the seeded learning compiler, replacing the hand-written pattern list.

#### Expected impact
Operators can answer "why does the fleet believe this?" in one click. Evaluators stop seeing figures that cannot be traced. The
measure is the share of knowledge items with at least one evidence id. What could break: the lineage graph's density at 100 or
more patterns. It needs a cap on edges per node.

#### Evaluation
Claim: quality - knowledge is traceable and internally consistent.
Before: 0 of 8 patterns and 0 of 60 memories link to evidence. The patterns claim 1,973 runs against 12 visible executions. There
are 20 distinct memory titles for 60 memories. The synced evidence ids are dropped at `useKnowledgeData.ts:53-97`.
After: 100% of items carry at least one evidence id. The claimed counts can be derived from the visible run log. Every memory has
a distinct title.
Method: simulation. Walked three cases:
1. `kp_4` (1,247 successes): today it has no runs to show.
2. A synced row with a `last_execution_id`: today the id is dropped in the mapper.
3. A memory in conflict: today it has no counterparty.

The prediction is falsified if the desktop's `pattern_data` turns out not to identify the runs behind a pattern beyond the last
one. Then the evidence is one run deep.
Result: better
Gate: architecture

#### First experiment
Pass the two ids through the mappers (pure code, covered by vitest), and render an evidence chip that links to
`/dashboard/executions`. For the demo, map 3 patterns to existing execution ids.

#### Evidence
- `src/app/dashboard/knowledge/useKnowledgeData.ts:53-97` - the mappers drop `lastExecutionId`, `sourceExecutionId` and
  `patternData`.
- `src/lib/supabaseApi.ts:683`, `:716-725` - those fields are already mapped from the sync rows.
- `src/lib/mock-dashboard-data.ts:540-560` - the memories, the 20-title pool and the random 12% conflict roll.
- `src/app/dashboard/knowledge/knowledge-cluster-graph/knowledgeClusterLayout.ts:46-63` - edges are a complete graph per
  persona.

### 6.2B · "What your fleet learned while you were away": a learning time-lapse
**Slot:** experience  ·  **Size:** M  ·  **Effort:** 5/10  ·  **Impact:** 7/10  ·  **Risk:** 3/10  ·  **Gate:** direction

#### Summary
Give Knowledge a time axis. When an operator arrives, they see a diff since their last visit. A scrubber replays the fleet getting
smarter over 120 days: patterns appear, confidence grows, memories get promoted, conflicts arise.

#### Description
Today Knowledge is three static lenses (`src/app/dashboard/knowledge/page.tsx`). Memory `acceptedAt` spans 1 to 120 days
(`src/lib/mock-dashboard-data.ts:540`), but no view renders it; it is only assigned, in `useKnowledgeData.ts:93`. Pattern
`lastSeen` appears only as a relative time.

Nothing shows change. An operator cannot tell what is new, what got stronger, or what was archived. That hides the product's core
promise: agents improve with use.

**The moonshot** has three parts:
- **"Since your last visit" panel.** New patterns, confidence deltas, memories promoted from pending to active, and new conflicts.
  The last-visit marker is a per-viewer convenience kept in localStorage.
- **Time scrubber.** In the cluster graph, nodes are born and grow as they are learned. The table gains a delta column.
- **Narrated summary.** One line, such as "Incident Responder learned 3 routing rules this week; 1 conflicts with an older throttle
  rule."

**History is needed.** The demo can use a seeded confidence history. Real mode has `created_at` and `updated_at` in the sync
contract. Full history needs one of two things. One is a snapshot table, which is a **Supabase schema change the owner must
approve**. The other is deriving history from `synced_executions` over time, which needs no schema change if card A lands.

**Motion is ungated today.** The Knowledge folder has no reduced-motion gating at all (grep for `useStillMotion` and
`useReducedMotion` in `src/app/dashboard/knowledge` returns 0). The scrubber must step through stills under `useStillMotion` and
stop on a hidden tab via `usePageVisibility`. Copy ships in all 14 locales.

#### Flow
- A memory-only time-lapse: a range slider over `acceptedAt`, with counts by type. This proves whether time reads as learning.
- The "since your last visit" panel.
- Graph birth and growth, plus the table's delta column.
- The real-mode history source: derived, or a snapshot table if the owner approves.

#### Expected impact
Returning operators get a daily reason to open Knowledge. Demo visitors see learning instead of a static table. The measure is
return visits to Knowledge and time on the page. What could break: in the demo, fixtures re-seed against `Date.now()`, so every
visit could show the same "new" items. History must be anchored to the seed, not to the visit.

#### Evaluation
Claim: user - change over time becomes visible.
Before: 0 time-based views, and `acceptedAt` is rendered 0 times.
After: a since-your-last-visit diff on load, and a scrubber with 120 daily frames.
Method: simulation. Walked three cases:
1. A visitor returning 3 days later: without a seeded history the diff is empty. This is the falsifier for demo value.
2. A scrub from day 120 to today: the memory count grows from about 1 to 60, with the type mix visible.
3. Reduced motion: stepped frames only.

The prediction is falsified if the seeded history reads as fake. Then the bet pays off only in real mode.
Result: unmeasurable
Gate: direction

#### First experiment
Add an `acceptedAt` range slider to `MemoriesView` that filters `MOCK_MEMORIES` and shows the type counts. Show it to 3 people and
ask what they think happened.

#### Evidence
- `src/app/dashboard/knowledge/useKnowledgeData.ts:93` - `acceptedAt` is assigned here and never rendered.
- `src/lib/mock-dashboard-data.ts:540` - memories are aged 1 to 120 days.
- `scripts/setup-sync-db.sql:239-257` - `created_at` and `updated_at` exist on the synced patterns.
- grep for `useStillMotion|useReducedMotion` in `src/app/dashboard/knowledge` returns 0 hits.

---

## Manual Review Queue
Today this context is a human-in-the-loop queue. It has split-pane and focus modes, a decision ledger with a 5-second undo, SLA
ordering, escalation, bulk actions and spoken announcements. Files: 40 (the most mature surface in the group).

### 6.3A · Earned autonomy: verdict history graduates review classes into scoped, expiring grants
**Slot:** structural  ·  **Size:** XL  ·  **Effort:** 8/10  ·  **Impact:** 9/10  ·  **Risk:** 6/10  ·  **Gate:** architecture

#### Summary
Make the queue learn. Every review gets a typed action. A pure grant engine reads the verdict ledger and proposes **scoped,
expiring auto-approve grants** for classes the human always approves. The grant proposal is itself a review. The queue shrinks as
trust is earned, and the page shows each persona's autonomy ladder.

#### Description
The queue's machinery is excellent:
- The decision ledger (`src/lib/review-ledger.ts:29`, `:82`).
- `writeVerdict`, which records who resolved each item (`src/stores/reviewStore.ts:210`, `:329`).
- One SLA rule (`src/lib/review-sla.ts`).

But the policy that decides what needs a human is **three rules keyed only by severity**:
`EscalationPolicy = Record<ReviewSeverity, EscalationRule>` (`src/lib/types.ts:195-200`), with defaults at `review-sla.ts:41-45`.
Review payloads are prose, a title and a description (`src/lib/mockData.ts:508`, `:522`, `:687`, `:701`). There is no typed action
kind, target or reversibility, so the system cannot learn "you approved 38 of 38 patch-level dependency bumps from PR Review Agent".
Verdicts are recorded and never read back.

The registry's golden path names this exactly. `hitl-approval.md:254` says: "Learn from verdicts. A gate whose approvals run near
100% for months is measuring nothing." Its decision-records technique says an approval binds to a scoped tuple. The registry map
records this context and `hitl-approval` as a `deviation`, now stale.

**The moonshot** has four parts:
- **Typed actions.** Each review carries `action: {kind, target, reversible, blastRadius}`.
- **A pure grant engine.** `proposeGrants(ledger)` groups verdicts by persona, action kind and target class. For each group it
  computes the approval rate, the sample size and the rejection reasons.
- **Grants proposed as reviews.** For example: "PR Review Agent may merge patch bumps in acme/*. 38 of 38 approved over 21 days.
  Expires in 30 days."
- **Grants that can be revoked.** Each grant is audited and revoked automatically on its first rejected or incident-linked
  verdict. Irreversible actions never graduate.

**Constraint bent:** real mode cannot write verdicts at all (`src/lib/supabaseApi.ts:428`, `updateEvent: readOnly`), and the
command CHECK has no verdict or grant type (`scripts/setup-sync-db.sql:374-375`). Real mode therefore needs a new command type,
which is a **Supabase schema change** and an owner decision. The demo-first version stays within every constraint.

#### Flow
- Add `action.kind` to the 6 `manual_review` seeds, and write `proposeGrants` with vitest coverage over a synthetic ledger of 200
  verdicts.
- A read-only "Autonomy candidates" strip on the Reviews page.
- A grant is proposed as a review; once approved, it auto-resolves matching items "by grant", using the existing `resolvedBy`
  sentinel path.
- Expiry, auto-revoke, and a per-persona ladder view. Desktop parity comes as a separate contract.

#### Expected impact
Operators review fewer items, and the ones left carry more judgment, which is the remedy for gate fatigue. The pitch becomes
"agents earn autonomy". The measure is pending volume per week and the approval rate of the items that remain. What could break:
an over-broad grant. Scope it to the tuple, make it expire, and never grant irreversible kinds.

#### Evaluation
Claim: user and quality - the gate learns, and volume drops without losing safety.
Before: 3 policy rules, keyed by severity only, and 0 learned rules. All 6 seeds are prose, with no action kind.
After: rules keyed by persona, action kind and target class. On a synthetic ledger where 40% of the volume comes from 3
always-approved classes, the predicted pending volume drops by about 35% after grants.
Method: simulation. Walked three seeds:
1. The axios dependency bump (warning, PR Review Agent): a graduation candidate.
2. "Add two repos to the digest" (info): a candidate.
3. The Redis restart and the token revoke (critical, irreversible): never graduate.

The prediction is falsified if the desktop's review payloads cannot carry a stable `kind`. Without one the engine has no key.
Result: better
Gate: architecture

#### First experiment
Write the pure `proposeGrants(verdicts, {minN, minRate, windowDays})` function with tests over a synthetic ledger, and render its
output as a read-only strip in the demo. There are no writes. Takes one day or less.

#### Evidence
- `src/lib/types.ts:195-200` - the policy is keyed by severity only.
- `src/lib/mockData.ts:508`, `:687`, `:701` - review payloads are prose titles and descriptions.
- `src/lib/supabaseApi.ts:428` - verdicts are read-only in real mode.
- `../ai-registry/.../hitl-approval/hitl-approval.md:254` - "Learn from verdicts".
- `.ai/registry-map.json` - Manual Review Queue x `hitl-approval` is a `deviation` (stale).

### 6.3B · Hands-free triage: the queue speaks, and you answer out loud
**Slot:** experience  ·  **Size:** M  ·  **Effort:** 5/10  ·  **Impact:** 6/10  ·  **Risk:** 5/10  ·  **Gate:** direction

#### Summary
Close the voice loop. Focus flow reads each card aloud and listens for a small, closed vocabulary of verdicts. Spoken verdicts go
through the existing ledger, so "undo" is a word.

#### Description
Voice today is one-way. `useReviewVoice` speaks "New {severity} review from {persona}: {title}"
(`src/hooks/useReviewVoice.ts:26-37`; `src/lib/review-voice.ts:49`, `:177`). It already has three hard parts done:
- Cross-tab de-duplication through Web Locks (`review-voice.ts:197`).
- A curated, quality-ordered voice list per locale (`src/lib/review-voice-data.ts:9`).
- Locale to speech-language mapping (`review-voice.ts:217`).

Answers, though, are keyboard or click only (`reviews-split-pane/useReviewKeyboardShortcuts.ts:41-47`,
`ReviewsFocusFlow.tsx:85-91`). A grep for `SpeechRecognition` in `src` returns 0 hits.

**The moonshot** is duplex voice in focus flow:
- **Reads the card.** It speaks the title, the blast radius and the due time.
- **Listens for a closed vocabulary.** "Approve", "reject", "skip", "details", "undo", in the active locale.
- **Same verdict door.** Each verdict goes through `decide()`, so the 5-second window (`COMMIT_WINDOW_MS`,
  `src/lib/review-ledger.ts:29`) is the spoken undo.
- **Critical items are never voice-only.** They need a spoken confirmation phrase plus an on-screen confirm.

It serves on-call operators away from the keyboard and users with motor impairments. As a demo moment, it lets a visitor talk to
their fleet.

**Costs and constraints:**
- Firefox does not support `SpeechRecognition`.
- Chrome's recognizer sends audio to a cloud service, so this needs an opt-in and a disclosure.
- The verdict vocabulary must be translated and tested for recognition in each of the 14 locales: a real i18n burden.
- There is a microphone permission prompt.

No new dependencies are needed.

#### Flow
- A Chrome-only prototype behind a flag: a 5-word grammar mapped onto the existing focus handlers.
- Card read-out and spoken undo inside the ledger window.
- Confirmation phrases for critical items, and a per-locale vocabulary with an accuracy check.
- A Settings toggle beside the existing voice switch.

#### Expected impact
On-call triage no longer needs hands or eyes on the keyboard. The demo gets a moment no competitor's site has. The measure is
verdicts given by voice and the misrecognition rate. What could break: a misheard "approve". The confirm gate on critical items and
the undo window are the guardrails.

#### Evaluation
Claim: user - the full focus-flow walk can be done by voice, safely.
Before: 0 voice inputs; triage requires keyboard focus.
After: all 5 pending demo seeds can be resolved by voice. Critical items need a confirm phrase.
Method: simulation. Walked three seeds:
1. The Redis restart (critical): "approve", then the confirm phrase.
2. The Slack digest (info): "approve", then "undo" within 5 seconds.
3. The axios bump: "details", then "reject".

The prediction is falsified if recognition confuses approve with reject more than 1 time in 20 in any shipped locale. In that case,
gate the locale off.
Result: unmeasurable
Gate: direction

#### First experiment
Prototype `webkitSpeechRecognition` in `ReviewsFocusFlow` behind a flag. Record the accuracy of 50 utterances each in English and
Czech.

#### Evidence
- `src/hooks/useReviewVoice.ts:26-37` - output only.
- `src/lib/review-voice.ts:177`, `:197`, `:217` - speak, Web Locks de-duplication, and the locale mapping.
- `src/app/dashboard/reviews/ReviewsFocusFlow.tsx:85-91` - the keyboard verdict handlers that voice would reuse.
- grep for `SpeechRecognition|webkitSpeech` in `src` returns 0 hits.

---

## Agents (Personas) Management
Today this context holds the persona grid and detail, subscriptions, memory actions, avatars and `personaStore`. Files: 18 in
`context-map.json`. 2 of them no longer exist in the tree: `agents-page/ExecuteToast.tsx` and `AgentDetailDrawer.tsx`. On
dash-spa the grid, `AgentDetail` and `AgentMetrics` are removed too, while `personaStore`, `SubscriptionsPanel`,
`MemoryActionsPanel` and `PersonaAvatar` survive.

### 6.4A · The whole persona on the web: Core, spec and change history as one model
**Slot:** structural  ·  **Size:** L  ·  **Effort:** 7/10  ·  **Impact:** 7/10  ·  **Risk:** 5/10  ·  **Gate:** contract

#### Summary
Replace the web's 17-field persona row with one **PersonaSpec**: identity, plus the desktop's living Core (archetype, traits,
conflict style, model tier), plus an operating spec (triggers, steps, budget), plus revisions. All four persona populations in this
repo conform to it.

#### Description
The web's `Persona` has 17 flat fields (`src/lib/types.ts:5-24`). The demo personas' prompts are stubs, such as "You are a senior
code reviewer..." (`src/lib/mockData.ts:58`, `:78`, `:98`, `:118`, `:138`).

The sync contract already carries what makes a Personas persona:
- `core_profile`, described as "Living-agent Core: dials + identity/voice/principles" (`scripts/setup-sync-db.sql:69`, `:76-81`).
- `home_team_id` and `template_category` (`:67-68`).

A grep for those three column names in `src` returns **0 hits**.

The repo holds four persona populations in four shapes:
- 5 `MOCK_PERSONAS` (`mockData.ts:52`).
- 99 `fleet.json` agents (`fleet-playground/fleet-data.ts`, `FleetAgent`: a callsign and a team, with no prompt or Core).
- 57 templates with YAML configs (`src/lib/templates.ts:18-32`).
- The synced personas.

`personaStore`'s mutation path is fully built and has no caller (`src/stores/personaStore.ts:23-49`). On the desktop side, the Core
is `PersonaCoreState`: archetype, traits on 5 axes, conflict style, model tier and effort
(`personas/src/features/agents/sub_glyph/personaCore/types.ts`, outside this repo). The desktop also keeps a per-field persona
change log (`persona_change_log.rs`).

**The moonshot** has four parts:
- **One schema with parsers.** A `PersonaSpec` type, with a parser for each population: the synced row including `core_profile`,
  the template YAML, and the fleet agent.
- **Full demo specs.** The demo roster is authored as complete specs, not stubs.
- **History.** Revisions render as a persona timeline. The dormant optimistic path becomes the edit path, which its own comment
  says it was built for.
- **One source of persona visuals.** Every surface reads hue, team and voice from the spec.

**Constraints:** The desktop owns the Core's shape, so the web must consume a versioned JSON contract, as it does with
`roadmap/v1.json`. The column already exists, so there is no Supabase schema change. Trait labels ship in all 14 locales.

#### Flow
- `parseCoreProfile` and `templateToSpec` with vitest, and the Core's traits shown as chips on an existing persona surface.
- Author the demo roster as full specs, and map the `fleet.json` agents onto them.
- A revision timeline, and the edit path wired through `commitOptimisticUpdate`.
- A versioned Core contract with the desktop.

#### Expected impact
The web stops flattening the product's signature concept, the living agent. Card B and every persona surface get one source. The
measure is synced columns read and persona shapes in the tree. What could break: drift if the desktop renames Core fields without
bumping the contract version.

#### Evaluation
Claim: quality - one persona model, with no dropped contract fields.
Before: 3 synced persona columns, each read 0 times. 4 persona shapes. 5 of 5 demo prompts are one-line stubs.
After: 1 schema that all 4 populations parse into, and 0 dropped columns.
Method: simulation. Walked three cases:
1. Template `gmail-inbox-triage` to a spec: the trigger and steps map cleanly.
2. Fleet agent `IR01` to a spec: name, team and hue map; Core is absent, so it is marked "unknown" rather than invented.
3. A synced row with `core_profile` to a spec.

The prediction is falsified if the fleet agents can only be expressed by inventing fields the desktop model lacks.
Result: better
Gate: contract

#### First experiment
Write `parseCoreProfile(json)` against one real desktop Core export, and render the archetype and traits on a demo persona.

#### Evidence
- `src/lib/types.ts:5-24` - the 17-field `Persona`.
- `scripts/setup-sync-db.sql:67-81` - `core_profile`, `home_team_id` and `template_category` exist in the contract.
- `src/stores/personaStore.ts:23-49` - the dormant mutation path ("no per-persona inline edit/toggle UI yet").
- `src/lib/mockData.ts:58` - a stub `systemPrompt`.
- grep for `core_profile|home_team_id|template_category` in `src` returns 0 hits.

### 6.4B · Hire an agent on the website: from template to a working teammate in the demo fleet
**Slot:** experience  ·  **Size:** XL  ·  **Effort:** 8/10  ·  **Impact:** 9/10  ·  **Risk:** 6/10  ·  **Gate:** direction

#### Summary
Let visitors **hire** an agent in the browser. They pick a template or compose a Core, name it, and give it a trigger. They then
watch it take a desk in the fleet, run, report to Messages and ask for a review. A deep link then takes the same agent home to the
desktop.

#### Description
Today try-before-download stops at reading YAML. The 57 templates end at a `personas://template/{id}` deep link
(`src/app/templates/[id]/TemplateDetail.tsx:83-101`).

In the demo dashboard, "Execute" calls `api.executePersona` (`src/app/dashboard/agents/page.tsx:73`). The mock waits, returns a
queued id and does nothing else (`src/lib/mockApi.ts:135-138`). The run never appears in Executions, Messages or Reviews. This
contrasts with the mock `updateEvent`, which already writes through to the session's data (`mockApi.ts:188-200`).

Personas cannot be created or edited at all (`src/stores/personaStore.ts:33-38`). A `CreateSubscriptionForm` for event triggers
exists (`src/components/dashboard/subscriptions-panel/CreateSubscriptionForm.tsx:24-35`).

**The moonshot** is a five-step "Hire" flow:
1. **Choose.** Pick a template or compose a Core from an archetype and traits.
2. **Materialize.** The new persona enters `personaStore` through the dormant optimistic path.
3. **Take a desk.** It appears on the Board, in the Personas view on dash-spa.
4. **Run.** It runs a seeded script derived from the template's `steps`. It posts its first run report to Messages, and raises a
   review if the template has a gated step such as `draft_reply`.
5. **Take it home.** A deep link hands the spec to the desktop.

This is the 10x conversion path: owning an agent before installing anything.

**Constraints:** This is demo-only by design, with no real execution and no orchestrator. Copy ships in all 14 locales. The flow
must load lazily to respect the dashboard route's bundle ceiling. Full Core composition depends on card A; a template-only hire
does not.

#### Flow
- Make the mock `executePersona` append a synthetic execution and a run-report message to the session's mocks. This alone makes
  "Execute" visibly real.
- A template-only hire, landing in the roster and on the Board.
- A seeded run script from the template's steps, with a review on gated steps.
- A Core composer, and the "take it home" deep link.

#### Expected impact
Visitors experience the product loop (create, run, review) on the site. The template gallery becomes a launchpad. The measures are
hires per demo session, and template clicks to downloads. What could break: templates whose YAML is too thin to script a credible
run. Audit all 57 first.

#### Evaluation
Claim: user - one action produces the whole product loop.
Before: a demo Execute produces 0 downstream artifacts. Walked: Execute on PR Review Agent shows a toast, and Executions, Messages
and Reviews are unchanged. Templates offer 0 in-browser trial.
After: one hire produces 1 persona, at least 1 run, 1 message and at most 1 review, within 30 seconds.
Method: simulation. Walked three cases:
1. `gmail-inbox-triage`: the `on_new_email` trigger, then classify, then `draft_reply`, a gated step that raises a review.
2. A DevOps template with no gated step: a run and a report only.
3. A Core composed with no template: the falsifier, because there are no steps to script.
Result: better
Gate: direction

#### First experiment
Make `mockApi.executePersona` write through to the session: append a `MOCK_EXECUTIONS` row and a message thread. Check that the
existing Execute button now leaves a trail across three pages.

#### Evidence
- `src/lib/mockApi.ts:135-138` - `executePersona` returns `{executionId: "e-new-…", status: "queued"}` and nothing else.
- `src/lib/mockApi.ts:188-200` - the write-through precedent in `updateEvent`.
- `src/app/templates/[id]/TemplateDetail.tsx:89-101` - templates end at a desktop deep link.
- `src/lib/templates.ts:18-32`, `:48-61` - the template has `config` (YAML steps) and `triggers`.

---

## Fleet Playground (prototypes)
Today this context holds two prototypes of a fleet of 10 to 99 agents over a synthetic `fleet.json`: the Board, with a pure seeded
reducer, and the Night shift city, with its own module store. On dash-spa they become the `personas` main view. Files: 50.

### 6.5A · One fleet engine with three feeds: seeded sim, recorded session, live sync mirror
**Slot:** structural  ·  **Size:** XL  ·  **Effort:** 8/10  ·  **Impact:** 9/10  ·  **Risk:** 6/10  ·  **Gate:** architecture

#### Summary
Replace the two separate simulations with one **event-sourced FleetEngine** (state is a fold over events) and one rulebook. Three
interchangeable feeds drive it: the seeded sim, a recorded and anonymized desktop session, and the live Supabase sync mirror.
Board, Night, the Mission Control wall and Home all become projections of it.

#### Description
Two simulations run over the same `fleet.json`, with the same seed `20261001` and **different rule code**:
- The Board's pure reducer (`fleet-playground/board/sim.ts:20-36`, `:150-222`).
- Night's module store (`night/nightStore.ts:43`, `:113`, `:126`, `:138`).

So the two views of "the same fleet" diverge from the first tick. Both are demo-only by construction: `fleet.json` holds 99
synthetic agents in 131,779 bytes (`fleet-data.ts:1-10`). Board decisions (review, retry, answer, read; `sim.ts:28-31`,
`:196-219`) are local reducer actions.

Meanwhile the sync contract now carries a live fleet:
- `synced_fleet_queue`, with rank, lane, state, `persona_id` and `queued_at_ms` (`scripts/setup-sync-db.sql:309-326`).
- `synced_executions` and `synced_personas`, and realtime on 9 tables (commit `df30dad`).
- Phase-2 `pending_commands`, which accepts `queue_reorder`, `queue_set_lane`, `queue_cancel`, `cancel_execution` and
  `run_persona` (`:374-375`).

**The moonshot** is one engine with one rulebook and three feeds:
- **SeededSim.** Today's rules, emitting events.
- **RecordedSession.** A JSON event log exported from the desktop and anonymized: "a real fleet's Tuesday", which can be replayed in
  the demo.
- **SyncMirror.** Synced rows plus realtime, projected into events.

Operator actions become intents. In the demo they are reducer events; in real mode they are `pending_commands`, and the desktop's
approval stays the gate.

**Constraint bent:** the SyncMirror feed takes the fleet view off mocks for signed-in tenants. The owner must loosen "the dashboard
is demo-only" for this view. The feed is Supabase, not the orchestrator. RecordedSession is a new desktop export contract.

#### Flow
- Make Night consume the Board's reducer and delete Night's own rules. A vitest asserts equal counts in both views at simMs plus 60
  seconds.
- Engine API: `fold(events)` and feed adapters. Board and Night become projections.
- RecordedSession: the export format, plus one anonymized desktop day, replayable at 1x to 60x.
- SyncMirror adapter, and decisions sent as `pending_commands`.

#### Expected impact
Demo and real fleets render through one engine, so every visual improvement lands in both. Visitors can watch a real fleet's day.
The measure is rulebooks in the tree, and view-to-view state equality. What could break: the desktop polls about every 15 seconds
(per `df30dad`), so the live feed may look stepped compared with the sim's animation.

#### Evaluation
Claim: quality and resilience - one source of fleet truth that can run on real data.
Before: 2 rulebooks over 1 seed. The failure rules differ: the Board's are at `sim.ts:161-168`, Night's at `nightStore.ts:138`. 0
real-data feeds.
After: 1 rulebook, and `fold(events)` gives identical state in every view. 3 feeds.
Method: simulation. Walked three cases:
1. Switching Board to Night at minute 2 should show the same failed count. Today it does not.
2. A recorded log of 240 timeline events (`fleet.json.timeline`) replayed through `fold`.
3. A `synced_fleet_queue` row with `state: queued` should map to a queued tile.

The prediction is falsified if the queue table lacks the run-progress signal the Board animates. In that case `synced_executions`
must supply it.
Result: better
Gate: architecture

#### First experiment
Drive Night from `simReducer` and remove `nightStore`'s rules. Assert that both views agree on the needs, working and resting
counts after 60 simulated seconds.

#### Evidence
- `src/components/dashboard/fleet-playground/board/sim.ts:50`, `:161-168` - the Board's seed and its failure rules.
- `src/components/dashboard/fleet-playground/night/nightStore.ts:43`, `:126`, `:138` - the same seed with separate rule code.
- `scripts/setup-sync-db.sql:309-326`, `:374-375` - the live fleet queue and the queue command set.
- `node -e` over `fleet.json`: 99 agents, 9 teams, 240 timeline events, 84 channel edges.

### 6.5B · Fleet drills: a flight simulator for running 99 agents
**Slot:** experience  ·  **Size:** L  ·  **Effort:** 6/10  ·  **Impact:** 8/10  ·  **Risk:** 4/10  ·  **Gate:** direction

#### Summary
Give the fleet view stakes. **Drills** are scripted incident scenarios injected into the seeded engine. Each is played against a
clock and scored only from the decision log. A replay at the end shows the operator's choices next to how self-healing would have
handled them.

#### Description
Today the sim injects random trouble: self-heal when `r < 0.1`, a new failure when `r < 0.17`, capped at 6 failed agents
(`fleet-playground/board/sim.ts:161-168`). Operator actions are logged as `decision` events with timestamps (`sim.ts:89-91`,
`:196-219`; `BoardEvent` in `board/model.ts:30-38`). `N` walks the agents that need you (`board/useBoardNav.ts:121`), and urgency
ranking exists (`fleet-playground/attention.ts:20-62`).

But nothing is at stake. A visitor watches and clicks, and the decision log is never read back. Night shift is a showcase with no
drill-down.

**The moonshot** is a drill mode:
- **Scenarios.** For example "Monday 9am review storm", "Upstream API outage cascades through Finance", and "Leaked token at 3am".
  Each is a seed plus an event script, injected through a new `inject` SimAction.
- **Scoring from events only.** Time to first acknowledgement, critical items resolved within SLA, failed agents left idle, and
  trap reviews approved.
- **End card.** The score, a replay of your decisions on the timeline, and how the desktop's self-healing would have resolved the
  same storm.

It doubles as onboarding for real operators and as a marketing hook ("Can you run 99 agents?") with a scorecard that can be shared
and contains no personal data.

**Constraint bent:** scenario narrative is new copy. Playground copy is already English-only on dash-spa (`PENDING_TRANSLATION`),
so launching drills in English first needs the owner's explicit consent, with the 14-locale port to follow. Motion stays gated: the
sim already uses `useStillMotion` and `usePageVisibility`. No backend is needed.

#### Flow
- One scenario, a review storm at scale 30: the `inject` action and a score panel computed from `decision` events.
- Trap items (reviews that should be sent back) so the score measures judgment, not click speed.
- 3 scenarios, the replay, and a shareable scorecard.
- Optional: scenarios recorded from real incidents (with fleet card A's RecordedSession).

#### Expected impact
The fleet page goes from a screensaver to a game with a lesson. The measures are drill completion rate and time on the page, and
for operators, time to acknowledge in later real use. What could break: scores dominated by UI speed. Trap items and SLA-weighted
scoring counter it.

#### Evaluation
Claim: user - the fleet view teaches triage under load.
Before: 0 goals and 0 measured outcomes. `decision` events are written and never read.
After: 3 deterministic scenarios, each scored only from the event log.
Method: simulation. Walked three cases:
1. Review storm at scale 30: 12 reviews over 2 simulated minutes. With `N` plus approve at about 5 seconds each, it can be won.
2. Cascade at 99: needs the cap of 6 failures (`sim.ts:168`) lifted for the scenario.
3. A trap review approved: costs points.

The prediction is falsified if the 3 playtesters score the same whether they read the reviews or not.
Result: unmeasurable
Gate: direction

#### First experiment
One scripted storm through an `inject` action, plus a 3-number score panel. Have 3 people play it, and check whether their scores
separate careful players from fast ones.

#### Evidence
- `src/components/dashboard/fleet-playground/board/sim.ts:161-168` - random failure and self-heal, with the cap of 6.
- `src/components/dashboard/fleet-playground/board/sim.ts:196-219` - decisions are logged as timestamped events.
- `src/components/dashboard/fleet-playground/board/useBoardNav.ts:121` - the `N` walk.
- `src/components/dashboard/fleet-playground/attention.ts:20-62` - the attention and urgency model a score can use.
