# Moonshot sweep - Product Feature Showcase + Content & Informational Pages

Scout: moonshot-architect lens, 8 contexts, 16 cards. Read-only. Desktop facts were read from the sibling
checkout `../personas` (paths prefixed `personas:`). Context-map drift found along the way: 18 of the file
paths listed across these contexts no longer exist (see each one-liner).

---

## Observability Deck & Security Vault
The `/features` OBSERVE deck (simulated pulse-grid lanes) and the "nested vault" credential illustration. files=18 in the map, 5 of them gone (CinematicBg, ContextHint, SecurityVaultPillars, ActivityFeed, useActivityFeed); the vault art now lives in `security-vault/`, which the map does not list.

### 2.1A · A seeded fleet simulator that speaks the desktop's event vocabulary
**Slot:** structural  ·  **Size:** L  ·  **Effort:** 6/10  ·  **Impact:** 7/10  ·  **Risk:** 4/10  ·  **Gate:** architecture

#### Summary
Replace the deck's `Math.random` ticker and typed headline numbers with one pure, seeded `fleetSim(seed, t)` event generator. It emits the desktop's real event types, the deck's metrics are aggregates of its stream, and any other demo surface can subscribe to it.

#### Description
Today every pulse comes from five `Math.random()` calls inside a `setInterval` (`PulseGridDeck.tsx:83-120`). The four headline metrics are typed constants (`:134-137`) and never reconcile with the lanes. "Active agents 12" sits above six lanes (`observability-deck/data.ts:42-49`). The eight event types (`data.ts:51-59`: `execution.started`, `memory.stored`, `health.checked`...) are invented. Only `execution.completed` matches the desktop's curated vocabulary, and it matches only under separator reconciliation (`personas:src-tauri/engine/src/event_vocabulary.rs:59-105`, which has `execution.finished`, `execution.failed`, `sla.breach.opened`, `circuit_breaker.provider.opened`, `memory_created`...). The deck shows activity, but nothing in it is true, even internally.

The moonshot is a deterministic simulator: a seeded PRNG plus a small agent/run model that yields `(t, agent, eventType, duration, cost)` tuples drawn from the desktop's vocabulary. The deck reads a window of it. Headlines become `successRate = finished / (finished + failed)` over the window, so every number on screen can be recomputed by a viewer. The same seed replays the same night, which makes it testable in vitest and scrubbable later. This goes past the shipped `home-one-fleet-truth` direction, which unified hand-authored *dashboard* fixtures. Here a generator replaces hand-authored fixtures, and marketing surfaces join the same fleet.

It reuses `useLoopGate` (`PulseGridDeck.tsx:67`), `staticSnapshot()` (as `fleetSim(seed, T_END)`), `AgentLane` and `Sparkline` unchanged. No constraint bent. The dashboard keeps its mocks unless the owner opts it in.

#### Flow
- Pure `src/lib/fleet-sim.ts` with a vocabulary table copied from `event_vocabulary.rs` (with a cited source line and a `verifiedAgainst` date, as in `desktop-plugins.ts`)
- Deck consumes it; headline metrics derived; vitest: same seed gives identical windows, and the metrics equal the recomputed aggregates
- Second consumer (the /how event bus, or the healing night) on the same seed

#### Expected impact
A technical visitor who tallies the lanes gets the headline number back. Measured by a derived/typed ratio of 4/4 and a vocabulary match of 8/8. Risk: a real distribution looks less "busy" than random confetti, so the tuning has to stay honest.

#### Evaluation
Claim: quality - every deck figure is derivable and every event type exists in the product
Before: 0/4 headline metrics derived; 1/8 event types in the desktop vocabulary; "12 active agents" over 6 lanes
After: 4/4 derived; 8/8 types from `BUILTIN_EVENT_TYPES`; agent count = lanes
Method: simulation - walked a 60s window by hand (success rate = finished/total; cost sum = lane `$` sum); the prediction is falsified if the derived headlines visibly diverge from lane totals within one viewing
Result: better
Gate: architecture

#### First experiment
Write `fleetSim` (about 80 LOC) plus one vitest that asserts determinism and that the headline aggregates equal the lane sums. Swap it into `PulseGridDeck` behind a const and look at both versions.

#### Evidence
- `src/components/feature-sections/observability-deck/variants/PulseGridDeck.tsx:84-120` - random agent, event, duration and cost per tick
- `.../PulseGridDeck.tsx:134-137` - four typed `AnimatedMetric` targets (96.2, 3.4, 0.14, 12)
- `src/components/feature-sections/observability-deck/data.ts:42-49` - six agents; `:51-59` - eight invented event types
- `personas:src-tauri/engine/src/event_vocabulary.rs:59-105` - the desktop's curated event types

### 2.1B · Seal a real secret in the visitor's own browser
**Slot:** experience  ·  **Size:** M  ·  **Effort:** 4/10  ·  **Impact:** 7/10  ·  **Risk:** 3/10  ·  **Gate:** direction

#### Summary
Turn the vault from an illustration of AES-256-GCM into a live demonstration of it. The visitor types a fake secret, WebCrypto seals it on their device, and the three rings turn as the real steps complete. The page then invites them to open DevTools and watch zero requests leave.

#### Description
The vault animates one `MotionValue` along fixed beat windows (`NestedVaultArt.tsx:12-20`; `SecurityVault.tsx:20-39`). The rings are engraved labels, `RINGS` at `nestedVaultParts.tsx:25-29`: AES-256-GCM, OS keychain, Device. Nothing is encrypted. The section's whole promise, "Your data never leaves", is a picture.

The desktop's real scheme is small and maps one to one. A 32-byte master key is sourced from the OS keychain, with a DPAPI-file fallback (`personas:src-tauri/core/src/crypto.rs:411-417`). `encrypt_for_db` draws a random 12-byte nonce and returns `(ciphertext, nonce)` (`crypto.rs:1244-1256`). The browser can perform the same operations:
- `crypto.getRandomValues` generates a 12-byte nonce.
- `generateKey({name:"AES-GCM",length:256}, extractable:false)` creates a non-extractable key. This is the "device" ring: the key cannot be read out, even by the page.
- `encrypt` produces the ciphertext and its 16-byte tag.

The rings advance on promise resolution instead of a clock. The panel then shows the base64 ciphertext, the nonce and the tag. A "tamper one byte" button makes `decrypt` throw, which demonstrates authenticated encryption. A "Network: 0 requests" chip reads `performance.getEntriesByType("resource")` before and after.

It reuses the art, the `progress` value (driven by real steps rather than `animate`) and the `useStillMotion` gate. Under still motion the steps run without the turn. New strings go through `securitySection` and need 14-locale translation; no constraint bent.

#### Flow
- WebCrypto seal/unseal helper, unit-tested in vitest (Node has `crypto.subtle`)
- Wire the rings to step completion; ciphertext/nonce/tag readout; tamper button
- Resource-count chip, plus copy that points at the desktop's identical call (`encrypt_for_db`)

#### Expected impact
Security-minded visitors get proof rather than a promise. Measure with an interaction rate on the "Seal" control, using the existing analytics. Risk: a visitor pastes a real secret. The copy must say it is never stored, and the input is cleared on unmount.

#### Evaluation
Claim: user - the visitor watches local encryption happen and can verify that nothing is sent
Before: 0 cryptographic operations; ring turns are timed (3.8s linear)
After: 3 real operations per seal; resource-request delta = 0; a one-byte tamper gives a visible auth-tag failure
Method: simulation - walked seal, unseal and tamper-then-unseal against the WebCrypto spec; falsified if any step needs a network fetch or if a non-extractable key cannot be produced in Safari
Result: better
Gate: direction

#### First experiment
A throwaway `/preview` slot: an input, a "Seal" button, and the three outputs plus a tamper toggle. No art. Show it to two people and ask "what did this prove?"

#### Evidence
- `src/components/feature-sections/security-vault/nestedVaultParts.tsx:25-29` - rings are labels
- `src/components/feature-sections/security-vault/NestedVaultArt.tsx:12-20` - timed beats, no operations
- `personas:src-tauri/core/src/crypto.rs:1244-1256` - desktop AES-256-GCM with a 12-byte random nonce
- `personas:src-tauri/core/src/crypto.rs:411-417` - `KeySource::Keychain` / `LocalFallback`

---

## Agent Lab & Plugin Ecosystem
The four-tab Lab (chat, arena, evolution, eval) with its version ledger and rail, plus the two plugin demos projected from the desktop-plugin manifest. files=32. The 2026-09-23 challenge already shipped "one manifest drives the showcase" and "version rail from a ledger"; both cards below go elsewhere.

### 2.2A · One experiment matrix behind all four Lab tabs
**Slot:** structural  ·  **Size:** M  ·  **Effort:** 5/10  ·  **Impact:** 6/10  ·  **Risk:** 3/10  ·  **Gate:** architecture

#### Summary
Extend the ledger's "ratings are never typed" rule from two projections to every number in the Lab. One per-version × per-input × per-dimension score matrix generates the arena rounds, the eval radar, the genome fitness and the chat's quoted run stats. The matrix is shaped like the desktop Lab's result table, so a real export can replace the fixture.

#### Description
The ledger derives ratings from `ARENA_ROUNDS` (`ledger.ts:15-17, 47-52`). Everything else is typed separately and tells a different story:
- The chat refines an *email-triage* persona and ends "9.2% flagged urgent. Want me to promote this?" (`en.ts:5496`).
- The arena tests *dev tasks* (`prodBug`, `declineMeeting`, `flakyTest`; `lab/data.ts:33-37`), and the refined v4.3 *loses* 3-2 (mean 85 vs 88).
- The eval radar shows an unnamed "current" persona averaging 88.7 against a 78.8 baseline (`data.ts:53-59`).
- The genome's best is 94 (`data.ts:50`).

The result is four tabs about three personas, with 32 hand-typed figures. A visitor who reads all four tabs learns that the numbers are decoration.

The moonshot is `experiment.ts`: one persona, N versions (the genome nodes are versions), 5 inputs, 6 dimensions. Each tab becomes a projection:
- **Arena:** per-input dimension means for the two ledger rows.
- **Eval:** per-dimension means of the live version against the baseline row.
- **Genome:** each node's fitness is its version's overall mean.
- **Chat:** the diff and its stats quote the matrix.

The ledger keeps its role and reads its ratings from the matrix. Tests extend `ledger.test.ts` / `genome.test.ts`, for example "the eval radar equals the arena means for liveId". This differs from the shipped rail card, which unified versions and ratings only. Strings stay in the existing namespaces. No constraint bent.

#### Flow
- Author the matrix for the email-triage persona (10 versions × 5 inputs × 6 dims) and derive the arena
- Derive eval and genome; delete `EVAL_DIMENSIONS` and the fitness literals
- Add a cross-tab invariant test; optionally define a JSON shape matching the desktop result table for a later export

#### Expected impact
The Lab reads as one experiment you can follow from tab to tab. Measured as typed display figures going from 32 to 0, with the matrix as the single typed source. Risk: a coherent story can make v4.3 win, and the regression demo has to stay possible on purpose.

#### Evaluation
Claim: quality - every Lab figure derives from one experiment about one persona
Before: 32 typed figures (10 arena + 12 eval + 10 fitness), 2 derived (ratings); 3 personas across 4 tabs
After: 0 typed display figures; 1 persona; a cross-tab invariant is enforced in vitest
Method: simulation - walked v4.2 to v4.3 (arena mean must equal the rail rating, which must equal the genome node fitness) and the activate/rollback rail flow; falsified if the genome's 10 nodes cannot be expressed as versions without inventing a second experiment
Result: better
Gate: architecture

#### First experiment
Build the matrix for the two ledger versions only and derive the arena plus eval from it. Check whether the chat's "promote" claim still holds, then decide whether v4.3 should win.

#### Evidence
- `src/components/feature-sections/lab/data.ts:33-37` - dev-task arena, v4.3 loses on mean
- `src/components/feature-sections/lab/data.ts:40-59` - independent genome fitness and eval scores
- `src/i18n/en.ts:5496` - the chat promotes an email-triage change
- `src/components/feature-sections/lab/ledger.ts:15-17` - the ledger's own "ratings are never typed" rule

### 2.2B · Blind-judge arena: the visitor becomes the eval
**Slot:** experience  ·  **Size:** M  ·  **Effort:** 5/10  ·  **Impact:** 7/10  ·  **Risk:** 4/10  ·  **Gate:** direction

#### Summary
Let the visitor judge the arena. They see two real outputs per input with the versions hidden and pick one. At the end the Lab shows how often they agreed with the LLM judge, and it offers to activate the version *they* preferred through the existing ledger.

#### Description
Today the arena shows only the input line and two numbers (`ArenaTab.tsx:88-90`). The visitor never sees *what* was judged, and the tab auto-advances on a 3.4s interval. Evals are the least intuitive part of agent orchestration, and the Lab asks the visitor to take the scores on faith.

The moonshot captures real outputs offline: run both prompt versions on the 5 inputs with Claude and store them as fixtures. The arena gains a judge mode:
- Two cards per round, labelled only A and B, with the side order shuffled from a seeded value cached in `useState(() => ...)` (React 19 purity).
- The visitor's verdict is the round result.
- At the end, the visitor's tally becomes a third "Your rating" column on the version rail, and an agreement score is shown: "you agreed with the judge 4/5".
- "Activate" dispatches the existing ledger `activate` action.

This makes the Lab's thesis, that your taste becomes the fitness function, something the visitor does rather than reads. It reuses the ledger reducer, `VersionRail`, `ARENA_ROUNDS` (as judge scores) and the `useStillMotion` gate (judge mode has no ambient loop).

**Constraint bent:** about 10 outputs × 14 locales are user-visible prose. The owner must choose between full hand translation (about 140 strings) and shipping outputs as quoted English artifacts with a localized frame. Name this up front.

#### Flow
- Generate the 10 outputs offline and review them; judge mode for one round in `/preview`
- Five rounds, a tally, the agreement score, and the "Your rating" rail column
- Translation decision, then a 14-locale pass

#### Expected impact
Visitors who finish judging understand evals viscerally. Measure the round-5 completion rate and the activate clicks after judging. Risk: real outputs can be close calls, and the visitor may "disagree" with a judge that is right. Frame disagreement as signal, not error.

#### Evaluation
Claim: user - the visitor performs an eval instead of watching one
Before: 0 outputs shown; 0 visitor decisions; the arena auto-plays
After: 10 outputs shown; 5 visitor decisions; agreement % and a visitor rating on the rail
Method: simulation - walked a visitor who picks the judge's winner every round (5/5, rail shows equal ratings) and one who inverts it (0/5, their pick is v4.3, activate flips LIVE); falsified if the outputs are too long to compare within one stage-fit screen
Result: unmeasurable
Gate: direction

#### First experiment
One round, two real outputs and a pick button in a `/preview` slot. Time how long five people take to choose, and whether they read both.

#### Evidence
- `src/components/feature-sections/lab/components/ArenaTab.tsx:88-90` - only the input line is shown; no outputs
- `src/components/feature-sections/lab/ledger.ts:47-52` - ratings come from arena sides (judge scores)
- `src/components/feature-sections/lab/components/ArenaTab.tsx:46-51` - auto-advancing 3.4s interval

---

## Memory Layers & Multi-Provider AI
The "run twice" memory illustration, the Claude/Ollama router, and the Design Engine matrix that opens `/features`. files=19 in the map, 7 of them gone (MemoryLayersStack, `memory-layers-stack/*`, `memoryShared.tsx`); the live art in `memory-layers/` and `multi-provider/` is not listed.

### 2.3A · A scene runtime: illustrations as declared beats, not hand-rolled timelines
**Slot:** structural  ·  **Size:** L  ·  **Effort:** 6/10  ·  **Impact:** 6/10  ·  **Risk:** 4/10  ·  **Gate:** architecture

#### Summary
Six illustrations each re-implement the same "one progress value, rest at 1, play once in view, replay" machine, and they describe their beats only in comments. Make the beats data, a `Scene` of named windows with captions, and give every scene a shared runtime. That one change unlocks scrubbing, keyboard stepping, per-beat screen-reader narration, tour-narration sync and server-rendered stills.

#### Description
The pattern is copied six times:
- `RunTwiceArt.tsx:43-57`
- `MultiProviderAI.tsx:17-37`
- `SecurityVault.tsx:20-39`
- `HealingCircuit.shell.tsx:51-74`
- `pricing/usePlayOnce.ts:17`
- `get-started/shared/motion.ts:23`

Each holds `useMotionValue(1)`, an `useInView` once-play, a `useStillMotion` pin and a replay ref. The beats themselves are prose. For example, `NestedVaultArt.tsx:12-20` lists "0.20-0.40 inner ring (AES-256-GCM) turns" as a comment. A screen-reader user gets one summary `aria-label` per art (`RunTwiceArt` role=img; overnight `artLabel`). Tour narration cannot follow a beat, because beats do not exist as values.

The moonshot is `defineScene({ duration, beats: [{ id, window:[a,b], captionKey }] })` plus a `useScene(scene)` runtime. The runtime owns:
- **Play-once and replay:** the duplicated logic, moved into one place.
- **A scrub rail:** a thin range input, which is also the keyboard affordance.
- **Narration:** an `aria-live` caption that announces each beat as `p` crosses it.
- **Still frames:** `p = 1` stays the server and still-motion frame; `sceneFrame(id)` gives any beat's still for OG cards or a reduced-motion "step through" mode.
- **Tour sync:** the tour can seek a scene to a beat.

Existing art components keep their drawing code and receive `p`. No constraint bent. Captions are new strings in each section namespace and must be translated into all 14 locales.

#### Flow
- `useScene` with play/replay/still parity, migrate the memory art, and diff its behaviour in a vitest of the beat math
- Captions and scrub rail on memory + router; tour step `memory` seeks a beat
- Migrate the vault, healing, pricing and get-started instances; delete the duplicates

#### Expected impact
Reduced-motion and screen-reader visitors get the story beat by beat instead of a single frozen frame. Owners author illustrations as data. Measure the drop from 6 copies to 1 runtime and the number of beats with captions. Risk: a scrub rail on every art adds chrome, so make it hover/focus-revealed.

#### Evaluation
Claim: quality - one illustration runtime, with beats addressable by people and by the tour
Before: 6 hand-rolled play machines; beats exist only as comments; 1 aria-label per art
After: 1 runtime; about 24 named beats across 6 scenes, each with a caption, scrubbable and seekable
Method: simulation - walked the memory art (4 beats A-D), the vault (6 beats) and still-motion (p=1, step mode); falsified if any art reads DOM layout during play, since the beats assume pure `p` mapping
Result: better
Gate: architecture

#### First experiment
Port only `RunTwiceArt` to `useScene` with its four beats, a caption line and a scrub input in `/preview`. Count the LOC removed and try it with NVDA.

#### Evidence
- `src/components/feature-sections/memory-layers/RunTwiceArt.tsx:43-57` - duplicate play machine
- `src/components/feature-sections/MultiProviderAI.tsx:17-37` - same machine
- `src/components/feature-sections/HealingCircuit.shell.tsx:51-74` - `useOncePlay`, a third copy
- `src/components/feature-sections/security-vault/NestedVaultArt.tsx:12-20` - beats as comments
- grep `useMotionValue(1)` gives 6 files (the 4 above plus `sections/pricing/usePlayOnce.ts:17` and `sections/get-started/shared/motion.ts:23`)

### 2.3B · The Design Engine takes the visitor's sentence
**Slot:** experience  ·  **Size:** L  ·  **Effort:** 7/10  ·  **Impact:** 9/10  ·  **Risk:** 6/10  ·  **Gate:** policy-loosen

#### Summary
"One sentence. One matrix." should mean *your* sentence. The visitor types what they want an agent to do. A server route asks Claude for the eight cells plus up to two clarifying questions as structured output, and the existing state machine renders the reply live: thinking, asking, answered, filled.

#### Description
Today the engine types one fixed prompt (`designMatrixShared.tsx:53`, `t.designMatrix.userPrompt`) through about 40 seconds of `setTimeout` choreography:
- 58 chars × 90ms of typing
- 8 × (1650 + 1200) ms of thinking and filling
- 2 × (4200 + 1800) ms of asking and answering

(`designMatrixShared.tsx:70-116`.) The cells and their two questions are fixed (`designMatrixCells.ts:51-60`). The desktop does this for real: build sessions persist `resolved_cells_json` dimensions and `UserAnswer`s (`personas:src-tauri/src/commands/design/build_sessions.rs:209`). This is the one place on the site where Personas could *be* the product for 30 seconds instead of describing it.

The moonshot replaces `runBuild`'s timers with a stream reader. `POST /api/design` calls Claude Haiku with a schema matching `CellKey` × `{ value, question?: { prompt, options[] } }`, and each parsed cell dispatches the same `setCell` transitions the timers do now. The visitor answers the questions for real, which re-prompts. The fixed prompt stays as the default and as the reduced-motion and no-JS frame. The model answers in the visitor's locale.

**Constraints bent:** a new API route (an addition, not a renamed path), a server-only `ANTHROPIC_API_KEY`, per-request spend, and abuse exposure. The repo's rate limiter is in-memory per instance (ship-loop #13), so a durable limit is a prerequisite. The site also stops being "no model calls".

#### Flow
- Route plus schema, called from a `/preview` matrix behind a flag; measure latency to first cell
- Stream into `setCell`; answerable questions; cost cap and durable rate limit
- Promote to `/features` with the fixed prompt as fallback; optional "continue in Personas" handoff

#### Expected impact
The top of `/features` becomes a working demo. Measure the custom-prompt rate, matrix completions and the downstream download/waitlist clicks. Risk: a bad or unsafe sentence produces an embarrassing matrix, so add a moderation pass and a refusal cell.

#### Evaluation
Claim: user - the visitor sees their own agent designed, not a canned one
Before: 1 fixed prompt; about 40s of scripted timers; 0 model calls
After: any prompt; first cell in about 2-3s (Haiku, streamed); 8 cells plus up to 2 real questions
Method: simulation - walked "triage my inbox" (matches the fixture), "post a daily standup summary to Slack" (apps=Slack, triggers=schedule) and a nonsense prompt (needs a refusal path); falsified if structured output cannot reliably fill all 8 cells for vague prompts
Result: unmeasurable
Gate: policy-loosen

#### First experiment
A local script that sends 20 real sentences through the cell schema with Haiku. Count how many give 8 sensible cells and record p50 latency and cost per call.

#### Evidence
- `src/components/feature-sections/designMatrixShared.tsx:53` - one fixed prompt
- `src/components/feature-sections/designMatrixShared.tsx:70-116` - timer choreography (90 / 1650 / 4200 / 1800 / 1200 ms)
- `src/components/feature-sections/design-matrix/designMatrixCells.ts:51-60` - 8 cells, 2 fixed questions
- `personas:src-tauri/src/commands/design/build_sessions.rs:209` - the desktop's real resolved-cells build sessions
- `src/app/api/` - no LLM route exists (download, events, executions, feature-*, orchestrator, roadmap, stats, votes, waitlist)

---

## Self-Healing & Trigger Automation
The `/features` healing section, an `/illustrate` switcher between the "current" circuit board and the "overnight" strip while the owner's pick is pending (`HealingCircuit.tsx:7-16`). files=24 in the map, 6 of them gone: the whole trigger-system was deleted in 72dae5f, and triggers now live in the homepage orchestration hub, outside this context.

### 2.4A · Healing copy compiled from the desktop's decision table
**Slot:** structural  ·  **Size:** M  ·  **Effort:** 5/10  ·  **Impact:** 6/10  ·  **Risk:** 3/10  ·  **Gate:** contract

#### Summary
The desktop's healing policy is a pure, documented, 31-test decision table. Have a desktop test emit it as `healing-policy.v1.json`, and make the site's healing section render from that file. Every fix the site claims is then something `diagnose()` actually returns.

#### Description
Both variants hand-copy the policy:
- **Overnight** types `"wait 30s"`, `"2× limit"` and `"resume in 10m"` into a `WORDS` const and cites `core/src/healing.rs` only in a comment (`HealingCircuit.overnight.tsx:12-13, 29-33`).
- **Current** claims "Retry in 30s with fallback provider" (`healing-circuit/data.ts:38`). The desktop has no provider fallback in healing, and the multi-provider doc records that the failover chain is Claude-only.

The real policy (`personas:src-tauri/core/src/healing.rs:18-36`) works like this:
- **RateLimit:** backoff of `30s << consecutive_failures`, capped at `MAX_BACKOFF_SECS = 300` (`:109-110, :343`).
- **Timeout:** the limit doubles, capped.
- **ApiError:** a durable resume at 10/20/30 min (`:476-480`).
- **Credential:** an unconditional `CreateIssue`.
- **Transient process failures:** `5 << n`, capped at 30s (`:610`).

When the desktop retunes any of these, the site drifts silently.

The moonshot: a desktop test walks `diagnose()` over every `FailureCategory` × retry/consecutive grid and writes the outcomes (action, delay, cap, issue title) to JSON. The site vendors that file, with `verifiedAgainst` provenance as in `src/data/desktop-plugins.ts`, and its copy templates fill from it. A vitest fails if a rendered fix has no row in the table.

**Constraint bent:** a cross-repo artifact contract. The desktop must own the emitter, and someone must re-vendor the file on each desktop sync.

#### Flow
- Hand-transcribe the 12 categories into a typed site table with source line refs; the overnight variant reads from it
- Desktop-side emitter test writes the JSON; the site vendors it; a vitest maps rendered fixes to rows
- Delete the "fallback provider" claim; the current variant's stage text derives from the table

#### Expected impact
The healing story stays true after a desktop retune. Measure hand-typed policy values in the healing section going to 0. Risk: the table's precision ("120s after 2 consecutive failures") can overload the art, so keep the art simple and put the precision in the caption.

#### Evaluation
Claim: quality - every healing claim on the site is a row of the shipped policy
Before: 4 hand-typed fix descriptions plus 1 false claim (provider fallback); 0 imported values
After: 0 typed policy values; a drift test fails when `MAX_BACKOFF_SECS` or the ApiError schedule changes
Method: simulation - walked RateLimit with consecutive=0 (30s), consecutive=2 (120s, per the doc example at `healing.rs:54-55`) and Credential (an issue, no retry) through the proposed table; falsified if `diagnose()` needs runtime-only KB inputs that cannot be enumerated
Result: better
Gate: contract

#### First experiment
Transcribe the table into `src/data/healing-policy.ts` with line citations and swap the overnight `WORDS.fixes` for it. Count every claim that changed.

#### Evidence
- `src/components/feature-sections/HealingCircuit.overnight.tsx:29-33` - fixes typed by hand
- `src/components/feature-sections/healing-circuit/data.ts:38` - "fallback provider" claim
- `personas:src-tauri/core/src/healing.rs:18-36` - documented decision table; `:306` pure `diagnose()`; 31 `fn test_`
- `src/data/desktop-plugins.ts` - existing `source` + `verifiedAgainst` provenance pattern to reuse

### 2.4B · "Break it yourself": a night the visitor sabotages
**Slot:** experience  ·  **Size:** M  ·  **Effort:** 5/10  ·  **Impact:** 7/10  ·  **Risk:** 3/10  ·  **Gate:** direction

#### Summary
Hand the overnight strip to the visitor. They click any of the 12 scheduled runs and choose how it fails: rate limit, timeout, 5xx, 401, network or unknown. Then they press "run the night". The strip replays Personas' response to each failure, and the 07:00 card shows exactly what is left for them.

#### Description
The overnight variant is one fixed night: failures at slots 2, 6 and 10 plus a 401 at slot 11 (`HealingCircuit.overnight.parts.tsx:16-26`). It plays once (`useOncePlay`, `HealingCircuit.shell.tsx:51-74`). The current variant is worse for reduced-motion users: its loop never starts (`useHealingCycle.ts:22`), so they see a healthy board under a headline that says it "fixes itself". Neither lets the visitor test the claim, and testing a claim is the only thing that makes "self-healing" believable.

The moonshot makes `RUNS` state: `useReducer` over `{ slot, failure? }`. A pure `nightOutcome(runs)` applies the policy table (card A's, or a hand-typed table until then). It handles:
- escalation: three rate limits in a row back off 30s, then 60s, then 120s;
- a retry that itself fails;
- the moment the 07:00 card fills.

The art keeps its `p` sweep. Pills, retries and the handoff line read from `nightOutcome` instead of constants. Reduced motion renders the outcome statically, which is meaningful, unlike today's empty board. A "worst night" preset and a share link (`?night=` encoding) let the visitor show a colleague. No constraint bent. The failure-type labels are new 14-locale strings.

#### Flow
- `nightOutcome` pure function plus vitest; drive the existing strip from a fixed `runs` (no UI change)
- Click-to-fail pills with a type picker; the morning card lists N issues
- Presets and a share query; reduced-motion static outcome

#### Expected impact
Skeptical operators get to try to break the product. Measure interaction rate and the proportion of visitors who reach a night with at least 2 morning issues. Risk: an honest policy shows that some failures always reach a human, but that is the point of the card.

#### Evaluation
Claim: user - the visitor tests self-healing against failures they chose
Before: 1 fixed night (4 failures); 0 visitor inputs; the current variant shows 0 failures under reduced motion
After: 12 slots × 6 failure types; outcomes computed; a reduced-motion static outcome
Method: simulation - walked three consecutive rate limits (escalating backoff, all fixed), a 401 at 00:30 (one issue at 07:00), and every run timing out twice (the cap is hit, then issues appear); falsified if the strip cannot show escalation legibly at 12 pills per 52em
Result: unmeasurable
Gate: direction

#### First experiment
Make `FAILS` and `HANDOFF` a `useState` and add a click handler that cycles a pill through ok, rate limit and 401 in `/preview`. Watch whether people press replay.

#### Evidence
- `src/components/feature-sections/HealingCircuit.overnight.parts.tsx:16-26` - fixed failure slots
- `src/components/feature-sections/healing-circuit/useHealingCycle.ts:22` - reduced motion means no failure is ever shown
- `src/components/feature-sections/HealingCircuit.tsx:7-16` - owner pick between variants still open (build on the winner)

---

## How It Works & Changelog
`/how`, four `ssr:false` demos behind a role selector, plus `RELEASES` (`src/data/changelog.ts`) feeding the `/roadmap#changelog` timeline. files=6.

### 2.5A · Release notes compiled from the desktop's CHANGELOG and tags
**Slot:** structural  ·  **Size:** M  ·  **Effort:** 5/10  ·  **Impact:** 7/10  ·  **Risk:** 5/10  ·  **Gate:** contract

#### Summary
The owner already decided that the desktop `CHANGELOG.md` is the changelog's source of truth. Nothing enforces that, and the two have diverged. Build the compiler: desktop tags and `CHANGELOG.md` sections in, `RELEASES` out, with a drift gate.

#### Description
`RELEASES` is hand-authored (`changelog.ts:29+`). Its newest entry is "1.1.0, 2026-08-07". The desktop's `v1.1.0` tag is dated 2026-07-16. The desktop `CHANGELOG.md` has no 1.x section at all: everything since `[0.4.0]` (`personas:CHANGELOG.md:425`) sits in one `[Unreleased]` block (`:9`) holding about 353 top-level bullets. The desktop has had about 4,860 commits since `v1.1.0`. So the site's entries for 0.13 through 1.1.0 are a synthesis that no file in either repo backs. Everything the desktop shipped in August and September is invisible on the site.

The moonshot is `scripts/compile-changelog.mjs`. It reads the vendored desktop `CHANGELOG.md`, maps Keep-a-Changelog headings to `ChangeType` (Added→feature, Changed→improvement, Fixed→fix, Removed/BREAKING→breaking) and the bold lead sentence of each bullet to `text`, and emits `src/data/changelog.generated.ts`. A check script, in the same family as the existing `check-*.mjs`, fails when the vendored file is newer than the generated one.

The desktop side has to start cutting versioned sections at tag time. **That is the contract this card asks the owner for:** a one-line release-checklist change in the other repo.

This is distinct from the declined "changelog-driven release pulse" (`release.ts:185-193`, the hero badge). That decision was about the badge, not about where release notes come from. It reuses `latestRelease`, `CHANGE_TYPE_META` and the timeline untouched. i18n: release-note prose is already English-only data, so no new UI strings.

#### Flow
- Compiler over the current `[Unreleased]` block into a single "Unreleased" release card; compare with what the site shows
- Desktop cuts 1.2.0 at its next tag; generated `RELEASES` replaces the hand-authored file; drift check in `npm run` and CI
- Selection rule (top-N bullets per release by lead-sentence length or a `**`-lead filter) so the timeline stays readable

#### Expected impact
Prospects see what shipped this month, not in July. Measure the gap between the latest desktop change and its appearance on the site. Risk: about 350 raw bullets are internal-voiced (`/devlog`, `ledger.jsonl`), so the compiler needs a curation rule or a `public:` marker.

#### Evaluation
Claim: quality - release notes cannot lag or diverge from the shipped app
Before: about 353 desktop Unreleased bullets, 0 on site; site 1.1.0 dated 22 days after the real tag; 0 provenance
After: lag of one build; every release card traceable to a CHANGELOG section
Method: simulation - walked the Artist/Research Lab removal (`CHANGELOG.md` Removed, mapped to a breaking item) and an "Added" bullet with a bold lead; falsified if more than half the bullets need hand rewriting to be public-facing
Result: better
Gate: contract

#### First experiment
Run a 60-line compiler over today's desktop `CHANGELOG.md` and print the would-be "Unreleased" card. Show the owner how many of the 353 bullets survive a `**lead**` filter.

#### Evidence
- `src/data/changelog.ts:29-33` - hand-typed 1.1.0, dated 2026-08-07
- `personas:CHANGELOG.md:9` `[Unreleased]` and `:425` `[0.4.0] — 2026-04` - no 1.x sections; `git log -1 v1.1.0` gives 2026-07-16
- memory `project_marketing_stream_decisions.md` item 3 - "Changelog source of truth = desktop CHANGELOG.md"
- `src/lib/release.ts:185-193` - the declined pulse is a separate decision

### 2.5B · A role-threaded /how: one request followed through all four demos
**Slot:** experience  ·  **Size:** L  ·  **Effort:** 6/10  ·  **Impact:** 7/10  ·  **Risk:** 4/10  ·  **Gate:** direction

#### Summary
"I am a: Developer / PM / Enterprise" should change what the page shows, not just its colours. Each role picks one concrete request, which the page follows through all four demos in order:
1. It races a workflow in the timeline.
2. It is negotiated in chat.
3. It descends the platform layers.
4. It fires on the event bus.

A persistent "following: #4821" ribbon ties the four together.

#### Description
The role selector recolours two props of the last section and nothing else (`how/page.tsx:26-41, 71`). Its labels are hardcoded English (`RoleSelector.tsx:17-39, 49-51`). The four demos are separate shows with separate casts. The timeline and the chat happen to share a scenario id, `ambiguous-email` (`agents-timeline/data.ts:18`, `agents-chat/data.ts:22`), and the event bus runs Gmail→Jira-style pairs (`event-bus-showcase/data.ts:10-48`). The page that should answer "how does it work" never shows one thing working end to end.

The moonshot is a `HowScenario` spine: `{ id, role, request, timelineScenarioId, chatScenarioId, layerPath[], busPair }`. It is held in page state with the role and passed to each lazy demo as an initial-scenario prop. Each demo already has scenario arrays and cyclers, so this is "start at" plus "hold", not a rewrite.

The spines would be:
- **Developer:** a flaky-test PR.
- **PM:** the ambiguous customer email that already exists.
- **Enterprise:** an access-review request routed through human approval.

Platform layers highlight the path that request takes, and the event bus pins its producer/consumer pair. The role and spine sync to `?role=` for sharing (read after mount, as `IllustrationSwitcher` does).

No route change. The role labels move to `en.ts` along with new spine strings in all 14 locales, which is a real translation cost to name.

#### Flow
- Spine type, and pass `initialScenarioId` to timeline and chat for the PM role (the data already exists)
- Developer and enterprise spines; layer-path highlight; bus pair pin; ribbon
- `?role=` deep link; localize the selector

#### Expected impact
A visitor who picks a role sees their kind of problem solved in four views. Measure role-switch rate and scroll depth to `#event-bus`. Risk: forcing every demo onto one request can over-constrain good standalone scenarios. Keep "cycle others" one click away.

#### Evaluation
Claim: user - the role changes the story, and the four demos tell one story
Before: role changes 2 colour props in 1 of 4 sections; 0 content changes; 2 of 4 demos share a scenario only by accident
After: role changes the scenario in 4/4 sections; one request id is visible throughout
Method: simulation - walked the PM spine (order #4821 ambiguity, then chat resolution, then the memory/tools layers, then a gmail→jira bus event) and a role switch mid-scroll; falsified if the platform-layers demo has no per-request path to highlight
Result: unmeasurable
Gate: direction

#### First experiment
Pass `initialScenarioId="ambiguous-email"` into timeline and chat when the PM role is picked, and add the ribbon. Ask three people whether the page now explains one thing.

#### Evidence
- `src/app/how/page.tsx:26-41, 71` - role maps only to glow and gradient colours
- `src/components/RoleSelector.tsx:17-39, 49-51` - hardcoded English role labels and "I am a"
- `src/components/sections/agents-timeline/data.ts:18` and `src/components/sections/agents-chat/data.ts:22` - shared `ambiguous-email` id

---

## Legal & Policy
`/legal` hub (privacy, terms, cookies), with a localStorage "seen" changelog per policy. files=7.

### 2.6A · A storage register as code, with the cookie policy rendered from it
**Slot:** structural  ·  **Size:** M  ·  **Effort:** 4/10  ·  **Impact:** 7/10  ·  **Risk:** 3/10  ·  **Gate:** architecture

#### Summary
Every cookie and localStorage key the site writes is declared once in a typed register: key, purpose, lifetime, category, which surface writes it. All writes go through it. The Cookie Policy's list renders from the register, and a vitest fails the build if code writes an undeclared key.

#### Description
The Cookie Policy says the site uses "only two essential cookies: sign-in session and theme" (`CookiePolicy.tsx:15, 40-53`). The changelog repeats it ("Limited the cookie set to two essentials", `policy-changelog.ts:24-31`). The code tells a different story:
- **Cookie:** the one cookie the site itself sets is `prefer-full` (`mobile/ViewFullSiteLink.tsx:20`, read in `proxy.ts:27`), and it is not listed.
- **Theme:** stored in localStorage `personas-theme` (`themeStore.ts:38`), not in a cookie.
- **Other storage:** at least 16 more keys, all undeclared. They include `personas-voter-id`, a persistent identifier, and `personas-comment-author`, a name (`feature-voting/data.ts:43-44`). There are also tour, cookie-consent, language and dashboard prefs (`constants.ts:32-36`, `stores/*`).

ePrivacy treats localStorage like cookies. Today the policy is a hand-typed claim about code that nobody re-reads.

The moonshot is `src/lib/site-storage.ts`, exporting `STORAGE_REGISTER` and typed `siteStorage.get/set` plus `setCookie`. Keys are a union type derived from the register, so an undeclared key is a tsc error. A vitest scans `src/` for raw `localStorage.`, `sessionStorage.` and `document.cookie` outside the module (a ratchet, like `check-i18n-encoding`). The Cookie Policy's "what we store" table maps the register. `POLICY_META.cookies.latestUpdateIso` gets a test: register changed means policy date bumped.

i18n: legal prose is already English-only (known debt). The register's purpose strings join that debt or start it properly. No constraint bent.

#### Flow
- Register plus vitest scan in report mode; the count of undeclared keys becomes the ratchet
- Migrate writers (about 17 sites); Cookie Policy table renders from the register; fix the theme/cookie wording
- Date-bump test tying register changes to `POLICY_META`

#### Expected impact
The policy becomes true by construction. Undeclared storage keys go from about 18 to 0. Risk: an honest list (voter id, comment author) needs a consent and purpose decision the owner may not have made.

#### Evaluation
Claim: quality - the cookie/storage disclosure equals what the code writes
Before: policy declares 2 "cookies"; code writes 1 undeclared cookie plus about 17 localStorage keys (1 overlapping, mislabelled)
After: 18 declared entries; 0 raw writes outside the module; policy table generated
Method: simulation - walked `prefer-full` (becomes a register row, "functional, 1 year"), `personas-voter-id` (row: "identifier, voting integrity") and a new key added without registration (tsc error); falsified if Supabase's own `sb-*-auth-token` write cannot be wrapped (then register it as third-party, observed only)
Result: better
Gate: architecture

#### First experiment
The vitest scan alone, in report mode. Print every storage and cookie write in `src/` with file:line, and hand the list to the owner next to the policy text.

#### Evidence
- `src/app/legal/policies/CookiePolicy.tsx:40-53` - two "essential cookies", theme listed as a cookie
- `src/components/mobile/ViewFullSiteLink.tsx:20` - `document.cookie = "prefer-full=1; ... max-age=31536000"`
- `src/components/sections/feature-voting/data.ts:43-44` - voter id and comment-author keys
- `src/stores/themeStore.ts:38` - theme is localStorage
- `src/data/policy-changelog.ts:24-31` - "Limited the cookie set to two essentials"

### 2.6B · A live "what this site holds about you" receipt with one-click forget
**Slot:** experience  ·  **Size:** S  ·  **Effort:** 3/10  ·  **Impact:** 6/10  ·  **Risk:** 2/10  ·  **Gate:** direction

#### Summary
On `/legal#cookies` the visitor sees a receipt read from their own browser: every personas-web key that exists right now, its value class ("identifier", "preference", "a name you typed"), its purpose, and a delete button. A "Forget me on this device" button wipes them all.

#### Description
Today the policy's answer to "what do you hold?" is "You can clear cookies anytime in your browser settings" (`CookiePolicy.tsx:19`). That is generic advice from a company whose whole pitch is "your data never leaves". The hub already reads the visitor's browser for something: per-policy last-seen dates (`policy-changelog.ts:37-41`, `LegalContent` seen-tracking). It just never shows the visitor what it found.

The moonshot is a client `StorageReceipt` component mounted after hydration, so SSR renders a placeholder and DOM shape stays stable. For each register row (card A, or a hand list until then) it checks presence via the storage module and shows:
- the key;
- the purpose;
- a redacted value preview: `personas-voter-id: 7f3a…`, `personas-comment-author: "J…"`;
- the age where known;
- a delete button.

"Forget me" clears all of them plus the `prefer-full` cookie, then reloads. It shows the count, for example "removed 6 items". For the Supabase session it offers "sign out" rather than a raw delete.

Supabase's own cookies and Sentry's in-memory state get an honest "set by a third party; here's how to clear" row. This is the only-a-privacy-company move: the disclosure is a working instrument, not a paragraph. New strings: about 15 UI keys in 14 locales. Legal prose stays English (existing debt).

#### Flow
- Receipt over a hand list of the 18 keys; redaction rules; per-row delete
- Forget-me plus reload; sign-out row for the auth session
- Switch to card A's register when it lands

#### Expected impact
Privacy-sensitive visitors can verify the policy against their own device in 10 seconds. Measure receipt views and forget-me clicks. Risk: wiping `personas-cookie-consent` re-prompts the banner. Say so before the click.

#### Evaluation
Claim: user - the visitor can see and erase exactly what the site stored on their device
Before: 0 visibility; the instruction is "use browser settings"
After: N present keys listed with purpose; per-key delete; one-click forget
Method: simulation - walked a first-time visitor (theme, consent and language keys present: 3 rows), a voter who commented (adds voter id and author: 5 rows) and forget-me (all removed, banner returns); falsified if any key's purpose cannot be stated without legal review
Result: unmeasurable
Gate: direction

#### First experiment
A `/preview` slot listing `Object.keys(localStorage)` filtered by the known prefixes, with delete buttons. Use it yourself after a dashboard session and count the surprises.

#### Evidence
- `src/app/legal/policies/CookiePolicy.tsx:19` - "clear cookies anytime in your browser settings"
- `src/data/policy-changelog.ts:37-41` - the hub already reads per-visitor storage
- `src/lib/constants.ts:32-36`, `src/stores/i18nStore.ts:44`, `src/components/tour/TourLauncher.tsx:11` - keys a receipt would list

---

## Security & Compliance
`/security`: pillars, architecture flow, compliance rows and FAQ, all static claims in `src/data/security.ts`. files=7. The FAQ JSON-LD is now derived from `SECURITY_FAQS` (`layout.tsx:20-30`); the feature doc's "hand-maintained duplicate" gotcha is stale.

### 2.7A · Every security claim carries a source line, and a build gate checks it
**Slot:** structural  ·  **Size:** M  ·  **Effort:** 5/10  ·  **Impact:** 9/10  ·  **Risk:** 5/10  ·  **Gate:** contract

#### Summary
Turn `security.ts` from prose into a claims ledger. Each pillar bullet, FAQ answer and architecture line becomes a `Claim { text, source: "personas:<path>:<line>", verifiedAgainst }`. A check script greps the vendored desktop facts and fails the build when a claim's anchor disappears or contradicts it. The first run will force real corrections.

#### Description
The page states absolutes the desktop contradicts:
- **Crash reporting.** The page says "No crash reporting (Sentry, Bugsnag, etc.)" and "no phone-home behavior whatsoever" (`security.ts:41-50`), and the Privacy Policy says "zero telemetry by default" (`PrivacyPolicy.tsx:13, 32`). In the desktop, release builds embed `SENTRY_DSN` (`personas:.github/workflows/release.yml:195`) and Rust initializes Sentry with session tracking (`personas:src-tauri/src/main.rs:46-48, 97-113`). The frontend's Sentry and analytics are opt-in via a first-use consent checkbox (`personas:docs/devops/guide-error-reporting.md:334`). Opt-in reporting is defensible; "no crash reporting" is false.
- **AI providers.** The architecture flow says "Direct API calls to Anthropic, OpenAI, Google" (`security.ts:191`), while the `/features` router tells the Claude + Ollama story (`multi-provider-ai.md`).
- **Connector count.** "40+ connectors" (`security.ts:64`) is typed.

For an enterprise reader, one false absolute discredits the page.

The moonshot applies the registry's `public-claim-provenance` golden path ("provenance-as-a-build-gate", "promise-only-what-ships") to the riskiest page on the site. It reuses the `source` + `verifiedAgainst` pattern already proven in `src/data/desktop-plugins.ts`. A `scripts/check-security-claims.mjs` (same family as `check-*.mjs`; no new runner) runs against a vendored `desktop-facts.json` (CSP, Cargo features, consent flag), so CI does not need the sibling repo. Copy is still English-only (known i18n debt).

**What the owner must accept:** the claim changes ("opt-in crash reporting, off until you say yes") and the cross-repo contract.

#### Flow
- Audit: annotate every claim with a desktop anchor or "unverified" and list contradictions for the owner
- Fix contradicted copy (Sentry, providers, counts); claims ledger type
- Vendored facts plus check script in CI; refresh on desktop sync

#### Expected impact
Security reviewers stop finding the contradiction themselves. Measure claims with a source (0 to 100%) and contradicted claims (at least 2 today, to 0). Risk: the honest version is less absolute, and marketing must accept "opt-in" wording.

#### Evaluation
Claim: quality - no security claim on the site contradicts the shipped desktop
Before: 0 claims sourced; at least 2 contradicted (crash reporting, provider list); 1 typed count
After: 100% sourced or explicitly marked aspirational; CI fails on a removed anchor
Method: simulation - walked the Sentry claim (desktop `sentry::init` plus release DSN means the claim must change), AES-256-GCM (`crypto.rs:1244`, holds) and "no relay servers" (gallery calls `personas.ai`, `gallery.rs:38-43`, which needs scoping: no relay for *model calls*); falsified if most claims cannot be anchored to a file at all
Result: better
Gate: contract

#### First experiment
A one-day audit table: every claim in `security.ts`, with a desktop file:line or "none" and a verdict (holds / contradicted / unanchored). Hand it to the owner before any code.

#### Evidence
- `src/data/security.ts:41-50` - "No crash reporting (Sentry, Bugsnag, etc.)", "no phone-home"
- `personas:src-tauri/src/main.rs:46-48` - `sentry::init` before anything else; `:112` `auto_session_tracking: true`
- `personas:.github/workflows/release.yml:195` - release builds embed `SENTRY_DSN`
- `src/data/security.ts:191` - "Anthropic, OpenAI, Google"
- registry `knowledge/software-engineering/ui-surfaces/published-surfaces/public-claim-provenance/public-claim-provenance.md` - techniques `provenance-as-a-build-gate`, `promise-only-what-ships`

### 2.7B · A firewall-ready egress manifest: every host Personas can reach, and what breaks if you block it
**Slot:** experience  ·  **Size:** M  ·  **Effort:** 5/10  ·  **Impact:** 8/10  ·  **Risk:** 4/10  ·  **Gate:** direction

#### Summary
Replace the abstract four-box architecture flow with the actual network surface: each outbound destination the desktop can contact, why, whether it is optional, and a "block it" toggle that shows which feature degrades. Add a download of the allowlist that a security team can paste into a firewall. "Air-gap capable" becomes a procedure.

#### Description
`ArchitectureFlow` draws four layers with pulse connectors and hover details (`ArchitectureFlow.tsx:7, 155-162`; `ARCHITECTURE_LAYERS`, `security.ts:190-194`). It names no host. The desktop's webview declares its egress precisely, `connect-src` in `personas:src-tauri/tauri.conf.json:43`:
- `raw.githubusercontent.com`
- `gist.githubusercontent.com`
- `github.com`
- `*.ingest.sentry.io`
- `*.somafm.com`
- `www.youtube.com`
- `*.googlevideo.com`

The Rust side adds more. The gallery talks to `PERSONAS_WEB_URL`, default `https://personas.ai` (`gallery.rs:38-43`). The updater has an endpoint (`tauri.conf.json` `plugins.updater`). Model calls go to the provider. An enterprise reviewer's real job is "what do I allow, and what stops working if I don't". The page answers neither.

The moonshot is `EGRESS` rows: `{ host, purpose, initiator: webview|core, optional, degradesFeature, source }`, sourced from the vendored desktop facts (shared with card A, but a separate seam: this one is a new visitor artifact).

On the page:
- **A reworked flow:** "Your machine" on the left; one line per host on the right, grouped required / optional / opt-in.
- **Block toggles:** dim a line and show its consequence, for example "block `*.somafm.com`: the focus radio is silent", or "block `*.ingest.sentry.io`: opt-in crash reports are dropped, nothing else changes".
- **"Download allowlist"** emits a text/CSV file. Strings are 14-locale work. No route changes.

#### Flow
- Hand-built `EGRESS` table from CSP plus a Rust grep, each row cited; render as a list under the current flow
- Block toggles with consequences; allowlist download
- Generate from vendored facts (card A's pipeline); retire the abstract layer cards

#### Expected impact
An enterprise evaluator leaves with a deployable allowlist instead of a reassurance. Measure allowlist downloads. Risk: listing YouTube and SomaFM in a security page invites questions. Answering them on the page is cheaper than answering them in a deal review.

#### Evaluation
Claim: user - a reviewer can configure their firewall from the page and predict the impact
Before: 0 hosts named; 4 abstract layers
After: about 10 hosts with purpose, initiator, optionality and degradation; a downloadable allowlist
Method: simulation - walked a "model-only" profile (allow the provider only: gallery import, radio, video and crash reports degrade, agents run), a full air-gap with Ollama (allow none: what still works) and a Sentry-only block; falsified if Rust-side egress cannot be enumerated statically (dynamic connector URLs would need a "user-configured endpoints" row)
Result: unmeasurable
Gate: direction

#### First experiment
Grep the desktop for `reqwest`/`Client::new` hosts plus the CSP line. Produce the table in a doc, and ask one enterprise-minded reader whether they could deploy from it.

#### Evidence
- `personas:src-tauri/tauri.conf.json:43` - webview `connect-src` host list
- `personas:src-tauri/src/commands/core/gallery.rs:38-43` - core-side host `https://personas.ai`
- `src/data/security.ts:190-194` - four abstract layers, no hosts
- `src/app/security/ArchitectureFlow.tsx:155-162` - the flow component to rework

---

## Blog
`/blog` index, `/blog/[slug]` articles, RSS. Eleven posts live in a 640-line TS array and render through a line-based mini-parser. files=14.

### 2.8A · The blog joins the guide's content engine: block-rich, linkable, localized
**Slot:** structural  ·  **Size:** L  ·  **Effort:** 6/10  ·  **Impact:** 6/10  ·  **Risk:** 4/10  ·  **Gate:** architecture

#### Summary
Retire the blog's bespoke parser and render posts with the guide's engine. That gives posts `parseBlocks`, `:::` custom blocks, a heading TOC, copy-link anchors, code fences, tables and inline links. Posts also join the guide's per-locale content and translation-status pipeline, so the blog stops being the site's only English-only long-form surface.

#### Description
`BlogArticleContent` (`BlogArticleContent.tsx:26+`) understands `##`/`###`, `- `, `1. `, a whole-line `*italic*`, `**bold**` and `` `code` ``. It cannot render a **link** (a blog that cannot link), an image, a code fence or a table (`docs/features/content/blog.md:65`). Eleven posts sit in `src/data/blog.ts` (640 lines). The guide already has the engine:
- `GuideMarkdown` → `parseBlocks` (`src/components/guide/guide-markdown/parseBlocks.tsx:24`) with about 16 block types;
- outline extraction and copy anchors;
- a localized content tree (`src/data/guide/locales/`, `getLocalized.ts`, `translation-status.ts`) and audit scripts (`scripts/guide-i18n-audit.mjs`, `check-guide-content.mjs`).

The blog duplicates a worse version of all of it, and its posts can never be translated or cross-linked into topics.

The moonshot extracts the renderer into a shared `ContentBody` (guide and blog consumers) and moves posts to one module per post, mirroring `src/data/guide/content/*`. Both the blog chrome (`t.blogPage`, already 14 locales) and the bodies then go through `getLocalized`, with the guide's translation notice when a locale lags. The build-time slug/date validator (`blog.ts:607`) is kept. RSS and OG stay English by design.

This fits the registry's `long-form-reading-surface` subject (the map's top match for Blog). Translating 11 posts × 13 locales is the cost. Either stage it, using the guide's "translation pending" notice, or the owner bends the "every user-visible string ships translated" rule for long-form posts explicitly.

#### Flow
- Render one post through `GuideMarkdown`; diff the output visually; add a link and a code fence
- Shared `ContentBody`; posts as modules; TOC plus anchors on articles
- Locale tree plus translation-status for posts; staged translation

#### Expected impact
Posts can teach (code, tables, links into `/guide`) and reach non-English visitors. Measure supported constructs (6 to about 20), links per post and localized post count. Risk: guide blocks are client-rendered, and the article page is a server route today. Keep the SSR-safe plain-markdown path.

#### Evaluation
Claim: quality - one long-form engine with links, blocks and localization for both guide and blog
Before: 6 constructs, 0 inline links possible, 0/13 locales for 11 posts; 2 parsers in the repo
After: 1 engine (about 20 constructs), links and TOC on posts, a translation-status-tracked locale tree
Method: simulation - walked a tutorial post with a CLI step (becomes a `:::cli` block), a hard-wrapped paragraph (today: N `<p>` tags; guide: one paragraph) and an unknown construct (both fall back to a paragraph); falsified if guide-specific chrome (module badges, Find-in-App) cannot be separated from the parser
Result: better
Gate: architecture

#### First experiment
Swap `BlogArticleContent` for `GuideMarkdown` on one article in a branch, then list every visual regression and every newly working construct.

#### Evidence
- `src/app/blog/[slug]/blog-article/BlogArticleContent.tsx:26` - the line-walker renderer
- `src/components/guide/guide-markdown/parseBlocks.tsx:24` - the guide's block parser
- `src/data/guide/getLocalized.ts`, `src/data/guide/translation-status.ts`, `scripts/guide-i18n-audit.mjs` - the existing localization pipeline
- `src/data/blog.ts` - 640 lines, 11 `slug:` entries

### 2.8B · "Import this agent": posts ship the persona they describe, through the desktop's own deep link
**Slot:** experience  ·  **Size:** M  ·  **Effort:** 5/10  ·  **Impact:** 8/10  ·  **Risk:** 5/10  ·  **Gate:** contract

#### Summary
Every tutorial or use-case post carries the actual persona bundle it walks through, and ends with "Import into Personas". That button is a `personas://import/<slug>` link that the desktop already handles. To make it work, the site serves the read half of the desktop's gallery contract (`GET /api/personas/<slug>` returning `{ bundle }`), which the desktop already calls but this site does not implement.

#### Description
The desktop's deep-link handler routes `personas://import/<slug>` to `gallery_import_persona` (`personas:src-tauri/src/boot/deep_link.rs:43-51`). That function fetches `GET {PERSONAS_WEB_URL}/api/personas/{slug}`, defaulting to `https://personas.ai`, the same default as the site's `SITE_URL` (`src/lib/seo.ts:3-4`). It reads `detail.bundle` and imports it (`personas:src-tauri/src/commands/core/gallery.rs:38-43, 127-160`), then best-effort POSTs an install counter. `src/app/api/` has no `personas` route, so this contract is unserved today.

Meanwhile blog posts end in generic cross-links (`BlogArticleCrossLinks.tsx`: `/#get-started`, `/templates`). A reader who just read "how to build an inbox-triage agent" has to rebuild it by hand.

The moonshot:
- Each post can declare `bundleSlug`. Bundles are static JSON in the repo, exported from the desktop's own export. No Supabase schema change, because static files are enough for the read path.
- `GET /api/personas/[slug]` serves `{ bundle }`. The POST counter is a no-op 204 until the owner wants counts.
- The article renders an "Import into Personas" block with the deep link, plus a fallback ("Don't have Personas? Download") using the same OS-focus handling `TemplateDetail.tsx:83-89` already does.

**Constraint bent:** a new API route (an addition, not a path change, but it needs the owner's confirmation), plus a bundle-format contract with the desktop's `import_persona_from_value`. Import requires a signed-in desktop (`require_auth_sync`).

#### Flow
- One static bundle plus the GET route; test with a desktop dev build (`PERSONAS_WEB_URL=localhost`)
- `bundleSlug` on posts; Import block plus fallback; e2e for the route shape
- Optional: the same route serves templates (and fixes the templates page's unhandled `personas://template/` scheme, outside this context)

#### Expected impact
Readers go from article to running agent in one click. Track import-click to download conversion. Risk: bundle-schema drift breaks imports silently. Add a vitest that validates bundles against a vendored schema.

#### Evaluation
Claim: user - a reader can install the agent a post describes
Before: 0 importable posts; desktop import endpoint unimplemented on the site (404)
After: N posts with bundles; route returns `{ bundle }`; deep link opens the import
Method: simulation - walked the desktop path (deep link, emit `GALLERY_IMPORT_REQUESTED`, GET returns 200 `{bundle}`, `import_persona_from_value`) and a reader without the app (fallback to download); falsified if `import_persona_from_value` rejects bundles exported by a different desktop version
Result: unmeasurable
Gate: contract

#### First experiment
Add a static `/api/personas/demo` route returning one exported bundle. Point a local desktop at it with `PERSONAS_WEB_URL` and click `personas://import/demo`.

#### Evidence
- `personas:src-tauri/src/boot/deep_link.rs:43-51` - `personas://import/<slug>` handler
- `personas:src-tauri/src/commands/core/gallery.rs:38-43` - host `PERSONAS_WEB_URL`, default `https://personas.ai`
- `personas:src-tauri/src/commands/core/gallery.rs:152-160` - expects `detail.bundle`
- `src/lib/seo.ts:3-4` - site default is also `https://personas.ai`
- `src/app/api/` listing - no `personas` route
