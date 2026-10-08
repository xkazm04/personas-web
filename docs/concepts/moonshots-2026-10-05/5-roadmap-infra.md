# Moonshot sweep 05 - Roadmap, Voting & Waitlist + Infrastructure & Telemetry

Scout: read-only. Every anchor below was read on `revamp/stage-fit` @ `0a0957b` (2026-10-05).
Never-re-propose sources were skimmed. Where a card sits close to an existing item it says how far past it the card goes.

---

## Server-Side Vote Persistence
Three server primitives behind the community routes: an in-process promise-chain "lock", a temp-file-and-rename JSON store, and an in-memory per-IP limiter. Seven route files use them. files=3

### 5.1A · Append-only community ledger in place of read-modify-write stores
**Slot:** structural  ·  **Size:** L  ·  **Effort:** 6/10  ·  **Impact:** 6/10  ·  **Risk:** 5/10  ·  **Gate:** architecture

#### Summary
Stop editing rows. Write every vote, unvote, boost, comment, request and signup as one immutable event, and compute counts from those events. Then nothing needs a lock, and anonymous visitors no longer need permission to change rows.

#### Description
Every file-store mutation today is a read-modify-write of a whole array (`updateJsonFile`, `src/lib/server/json-file-store.ts:70-82`) behind a lock that exists only inside one process (`src/lib/fileLock.ts:18-27`). The store's own comments admit that two writers mean "last one wins" (`json-file-store.ts:55-57`). The Supabase side keeps the same mutable-row model. `scripts/setup-voting-db.sql:97-100` lets anon UPDATE and DELETE any `feature_votes` row `using (true)`, because unvoting is implemented as a delete. Reads scan every row and count in JS (`src/app/api/votes/route.ts:36,55-60`).

Ship-loop #2 and #13 propose moving stores, and #11 proposes tightening RLS. This card changes the data model, which makes all three easier. The design:
- An append-only `community_events(seq, kind, subject, actor, payload, at)` log.
- The file backend writes newline-delimited JSON (JSONL), appending one line per event instead of rewriting the file.
- Postgres grants INSERT plus SELECT on the counts view only, with no UPDATE or DELETE grant to anyone.
- Counts become projections: last event per (feature, voter) wins, ordered by `seq`.

It reuses `parseJsonBody`, the rate-limit guard and `hasSupabaseEnv()` unchanged.

**Bends:** the Supabase schema (one new table plus a view), which needs the owner. The RLS change is a narrowing, not a loosening.

#### Flow
- Build a projection function plus a vitest suite that replays fixture event streams. This proves the counts match today's toggle semantics.
- Move votes onto the ledger (file JSONL backend) behind the existing route contract.
- Write the Supabase table and view DDL as a script the owner runs, and drop the anon UPDATE/DELETE policies.
- Move boosts (latest tier wins), comments and requests. Waitlist goes last.

#### Expected impact
Operators can deploy to serverless without silent vote loss. Moderation and audit get a replayable history. The voting UI sees no change. What could break: a projection bug changes the displayed counts. The replay tests are the guard against that.

#### Evaluation
Claim: resilience - no lost updates, and no anon mutation grant.
Before: two concurrent toggles in two processes lose one write (`fileLock.ts:18-27`). Anon holds UPDATE and DELETE on every vote row.
After: concurrent toggles become two appended events, and the projection settles them by `seq`. Anon has INSERT only.
Method: simulation. I walked three cases: (1) vote and unvote racing across two instances; (2) a boost re-tier replacing an earlier tier; (3) a re-vote after an unvote. It is falsified if the client UX needs read-your-write before the projection refreshes. The mitigation is to return the projected count in the POST response.
Result: better
Gate: architecture

#### First experiment
Write `projectVotes(events)` plus 10 vitest cases. Convert the current `.data/votes.json` into synthetic events and assert the projection reproduces today's counts.

#### Evidence
- `src/lib/server/json-file-store.ts:70-82` - every mutation rewrites the whole file under `withWriteLock`.
- `src/lib/fileLock.ts:18-27` - the lock is per-process, and its own header describes the lost-update case.
- `scripts/setup-voting-db.sql:97-100` - anon `for update using (true)` and `for delete using (true)`.
- `src/app/api/votes/route.ts:36` - selects every `feature_votes` row on each GET.

### 5.1B · Verifiable vote receipts - a public tally anyone can audit
**Slot:** experience  ·  **Size:** M  ·  **Effort:** 5/10  ·  **Impact:** 5/10  ·  **Risk:** 3/10  ·  **Gate:** direction

#### Summary
After voting, a visitor gets a receipt they can check: a short hash they can look up to confirm their vote is in a published hourly root. The page then shows measured votes separately from the hand-typed seed.

#### Description
Displayed totals mix a typed seed with live counts. `features` seeds of 342/189/276/214 are added to the API counts (`src/components/sections/feature-voting/data.ts:27-30`). The current honesty work only marks this with an "approximately" sign. Nothing lets a visitor confirm their own vote counted.

The repo already ships a pure synchronous SHA-256 that is checked against the published FIPS test vectors (`src/lib/sentry-pii.ts:115`). With card A's event log, each event can be chained by hash, and an hourly Merkle root can be published, for example as a field in the votes GET response. A receipt is `{seq, leafHash}`, kept in localStorage next to the existing `voterId` (`data.ts:63-75`). A small "verify my vote" panel recomputes the proof in the browser. The summary line then splits into "N measured votes (verifiable)" and "plus seed".

**Limit, stated honestly:** this proves inclusion, not one person per vote. The voter ID is still minted by the client (ship-loop #12). New UI strings mean i18n in all 14 locales.

#### Flow
- Prerequisite: card A's ledger, or at least the vote stream.
- Hash-chain the events, and add a `root` and `rootAt` to `GET /api/votes`.
- Store receipts on the client, and add a verify panel that uses only the client-side hash.
- Split the summary copy into measured and seed counts, in 14 locales.

#### Expected impact
Skeptical technical visitors, the audience for a local-first, credential-handling product, can see that the counts are not invented. That measurably supports the site's honesty stance. What could break: publishing roots on a fixed schedule leaks rough vote timing. Hourly batching blurs that.

#### Evaluation
Claim: user - a visitor can independently confirm their vote counted.
Before: there is no confirmation path. The displayed total is seed plus count, and the seed is indistinguishable apart from a "~" sign.
After: a receipt verifies against a published root in the browser, and the seed is shown on its own line.
Method: simulation. I walked three cases: (1) vote, then verify after the next root is published; (2) unvote, where the receipt shows "superseded"; (3) a tampered count, where the root mismatch is detectable by anyone who saved a receipt. It is falsified if fewer than about 1% of voters ever open "verify". Then the value is reputational only.
Result: unmeasurable
Gate: direction

#### First experiment
Hash-chain the existing `.data/votes.json` rows offline, publish one root in a scratch JSON, and verify one receipt with `sha256` in vitest.

#### Evidence
- `src/components/sections/feature-voting/data.ts:27-30` - hand-typed seeds added to live counts.
- `src/lib/sentry-pii.ts:115` - a synchronous SHA-256 already in the client bundle.
- `src/components/sections/feature-voting/data.ts:63-75` - per-browser `voterId`, where a receipt store would live.

---

## Waitlist & App Download
Email waitlist modal plus a `/api/download` redirect to a single env-configured URL. A deploy with no URL falls back to the waitlist. files=9

### 5.2A · One signed release manifest drives the CTA, the updater and the waitlist
**Slot:** structural  ·  **Size:** L  ·  **Effort:** 6/10  ·  **Impact:** 8/10  ·  **Risk:** 5/10  ·  **Gate:** contract

#### Summary
Replace the single `NEXT_PUBLIC_DOWNLOAD_URL` with a published, signed `/releases/v1.json` (artifacts per platform, version, checksum, notes). The site, the desktop auto-updater and the waitlist all read it. When a platform appears in it, that platform's waitlist cohort is released automatically.

#### Description
Download state is resolved once, at module load, from one env var (`src/app/api/download/route.ts:24-25`, `src/lib/release.ts:126-129`). The installer platform is hard-coded as `platform: "windows"` (`release.ts:102,116`). The waitlist already records which platform each person wants (`src/app/api/waitlist/route.ts:241-245`), but nothing ever acts on it.

Shipping macOS today takes an env change, a code change and a redeploy, and the macOS cohort never finds out. The site already publishes one cross-repo contract file the desktop consumes (`public/roadmap/v1.json`). A releases sibling would follow that pattern. Release metadata would be generated by the desktop's release pipeline and signed, matching the registry's `signed-artifacts` and `release-pipeline` subjects. `downloadPlan` and `resolveDownloadUrl` keep their allowlist checks and simply read manifest entries.

This goes past ship-loop #1 ("ship real artifact links") and the declined "hero shows v1.1.0 / changelog pulse" direction. Here the manifest is the source and every surface is derived from it.

**Bends:** a new cross-repo contract, and outbound email (no mail pipeline exists in `src/`).

#### Flow
- Draft the manifest schema with a validator, and change `downloadPlan()` to accept a manifest. Unit-test that no manifest produces today's behaviour.
- Serve a hand-authored manifest. The CTA picks the visitor's platform.
- The desktop release CI writes and signs the manifest. The site verifies the signature at build time.
- A cohort-release job takes signups for a newly listed platform and sends the invitations.

#### Expected impact
Mac and Linux visitors see a real download the day it exists. Waitlist signups finally pay off: measure the invite-to-download conversion per platform. What could break: a bad manifest would advertise a broken artifact. Signature verification plus the existing host allowlist (`release.ts:34`) is the guard.

#### Evaluation
Claim: user - every platform's visitors get a working path on release day.
Before: Windows is the only installer platform in code (`release.ts:102`). Signups for other platforms are write-only.
After: platforms are data. A new manifest entry flips the CTA and releases that cohort.
Method: simulation. I walked three cases: (1) a macOS DMG lands, where today that needs a code change and there is no notification; (2) a yanked release, where the manifest rollback flips the CTA back to the waitlist; (3) no manifest at all, which is identical to today. It is falsified if the desktop updater cannot consume a web-hosted manifest, for example because it needs its own update feed format.
Result: better
Gate: contract

#### First experiment
Write the `releases/v1.json` schema plus `downloadPlan(manifest)` with vitest cases covering 0, 1 and 3 platforms. Do not touch the UI.

#### Evidence
- `src/lib/release.ts:102` - `{ kind: "download"; ...; platform: "windows" }` is a literal type.
- `src/app/api/download/route.ts:24-25` - one URL resolved at module load.
- `src/app/api/waitlist/route.ts:241-245` - `platform` is persisted per signup and never read back.
- `public/roadmap/v1.json:1-3` - the existing precedent for a web-published desktop contract.

### 5.2B · "Your first agent is waiting" - the waitlist becomes a pre-configured install
**Slot:** experience  ·  **Size:** M  ·  **Effort:** 5/10  ·  **Impact:** 7/10  ·  **Risk:** 4/10  ·  **Gate:** direction

#### Summary
At signup the visitor writes one sentence about a job they want automated. The site matches it to a real template config and issues a claim code. On first launch the desktop asks "Have a code?" and the agent is already built.

#### Description
The signup takes only email, platform and early-beta (`src/app/api/waitlist/route.ts:220`). The site has 57 template entries, each with a real YAML `config` (`src/lib/templates.ts:27`, first at `:48`). Today the only way from web to desktop is copying that YAML to the clipboard (`src/app/templates/[id]/TemplateDetail.tsx:65`).

The desktop already imports encrypted workspace bundles ("Your workspace travels with you", `public/roadmap/v1.json:48-50`). The moonshot joins these:
- Signup gets an optional intent field.
- A matcher ranks templates. This can start lexical over `title`, `description` and `serviceFlow`, then move to an LLM.
- The success panel shows "We picked Inbox Triage for you" with that template's service flow.
- The stored claim code resolves to the template ID, or to a bundle.

Waiting becomes setup. **Bends:** a cross-repo desktop change (claim-code entry), a new stored column (Supabase schema), and new UI strings in all 14 locales.

#### Flow
- Add a lexical matcher over the template catalog, unit-tested on 20 hand-written intents. That proves matches are good enough.
- Add the intent field and a "picked for you" success panel, with no persistence yet.
- Persist the claim code, and add an e-mailed or on-screen code.
- Desktop: a first-launch "Have a code?" prompt imports the config.

#### Expected impact
A waitlisted visitor's first minute in the app skips blank-canvas setup. Measure time-to-first-run and day-7 retention for code-holders against non-holders. What could break: a poor match on a vague sentence undermines trust. Always show the pick and offer a "choose another" option.

#### Evaluation
Claim: user - the first session starts from a configured agent.
Before: signup returns a count and a thank-you, and the template YAML reaches the desktop only by clipboard.
After: about 60% of intents map to a correct template (hypothesis), and a code carries it to first launch.
Method: simulation. I walked three intents: "triage my inbox", which matches `gmail-inbox-triage`; "watch my CI and ping Slack", which matches a DevOps template; and "do my taxes", which has no good match and should fall back to the gallery. It is falsified if fewer than half of 20 realistic intents match a sensible template.
Result: unmeasurable
Gate: direction

#### First experiment
Write a 50-line lexical matcher plus a vitest table of 20 intents scored against the template catalog. Ship nothing.

#### Evidence
- `src/app/api/waitlist/route.ts:220` - the body is `{ email, platform, earlyBeta }` only.
- `src/lib/templates.ts:27` - `config: string` (YAML) on every template.
- `src/app/templates/[id]/TemplateDetail.tsx:65` - the clipboard is today's only handoff.
- `public/roadmap/v1.json:48-50` - the desktop already imports portable bundles.

---

## Feature Voting & Comments
Anonymous vote, boost, comment and request widget on `/roadmap#vote`, over a fixed allowlist of four features, with Supabase or file-store routes. files=21

### 5.3A · Requests become roadmap candidates - a clustering pipeline grows the votable set
**Slot:** structural  ·  **Size:** M  ·  **Effort:** 5/10  ·  **Impact:** 6/10  ·  **Risk:** 4/10  ·  **Gate:** direction

#### Summary
Free-text requests and comments are clustered offline, by an LLM batch job, into candidate features. The pipeline proposes them as a single source of truth for allowed features, as a reviewable diff. What visitors can vote on grows out of what visitors ask for.

#### Description
`POST /api/feature-requests` is a write-only sink with no GET (`src/app/api/feature-requests/route.ts:60,78`). The votable set is frozen at four IDs. That set is copied by hand in three places: `feature-boosts/route.ts:24`, `feature-comments/route.ts:14` and `votes/storage.ts:11`. It is mirrored a fourth time in `components/sections/feature-voting/data.ts:27-30`.

The `voting-admin-readback` direction (a token-gated export) was **rejected** because the owner did not want new endpoints. This card adds none. An offline script, run from the owner's machine with the service-role key in a `server-only` module, reads requests and comments, clusters them, and writes a `feature-candidates.json` file plus a proposed edit to one new `features` registry. That registry replaces the four copies. A human merges the edit; nothing is auto-published.

**Bends:** none in the repo. The candidates need copy in 14 locales when promoted, the same cost as any new key.

#### Flow
- Collapse the duplicated allowlists into one `FEATURE_IDS` registry, a refactor with no behaviour change.
- Add a clustering script over a local export: requests, comments, and clusters with example quotes.
- Promoting a candidate means one registry entry, an i18n key in 14 locales, and an illustration slot.
- Optionally, show "N requests merged into this card" on promoted features.

#### Expected impact
The owner sees demand clusters instead of an unread table. Visitors see their request come back as a card. Measure the share of requests mapped to a promoted card. What could break: clustering leaks a requester's text into public copy. Promotion is human-edited, and quotes stay private.

#### Evaluation
Claim: quality - the votable set tracks real demand.
Before: 4 hard-coded IDs, copied in 4 places, and 0 readers of `feature_requests`.
After: 1 registry, and candidates regenerated from all requests on every run.
Method: simulation. I walked three cases: (1) 30 requests where 12 ask for "Linux build", which should cluster into a candidate the four cards do not cover; (2) a spam burst, already throttled by the rate limit, which should cluster as noise; (3) a duplicate of an existing card, which should merge into it. It is falsified if request volume stays under about 20 a month, which is too small to cluster.
Result: unmeasurable
Gate: direction

#### First experiment
Do the allowlist collapse, which is S-sized and valuable alone, plus a row count of `feature_requests` to learn whether there is enough volume.

#### Evidence
- `src/app/api/feature-requests/route.ts:60` - POST is the only export, with no GET.
- `src/app/api/feature-boosts/route.ts:24`, `src/app/api/feature-comments/route.ts:14` - duplicated allowlist literals.
- `src/app/api/votes/storage.ts:11` - a third `ALLOWED_FEATURES`.

### 5.3B · Votes from people who actually run Personas - in-app voting, two tallies
**Slot:** experience  ·  **Size:** L  ·  **Effort:** 7/10  ·  **Impact:** 7/10  ·  **Risk:** 5/10  ·  **Gate:** contract

#### Summary
Let desktop users vote from the in-app roadmap panel the desktop already renders from `v1.json`. Their votes are tied to their synced account. The web page shows "visitors" and "people running Personas" as separate tallies.

#### Description
Voter identity is a `crypto.randomUUID()` in localStorage (`src/components/sections/feature-voting/data.ts:63-75`). Clearing storage gives you a new vote, which ship-loop #12 records as a binding decision. Meanwhile the desktop fetches `personas.so/roadmap/v1.json`, the contract recorded in `docs/parity-backlog/01-marketing-upgrade-EXECUTION.md:61-68`, so the real user base already sees the roadmap but cannot react to it. The voting IDs (`macos`, `i18n`, `dashboard`, `enterprise`) also do not map to the `v1.json` item IDs (`"2"`..`"10"`).

The moonshot:
- Votes cast in the app go through an endpoint that takes the user's Supabase session. The desktop already holds one, since `synced_*` rows default to `auth.uid()` (`scripts/setup-sync-db.sql:37-45`).
- Each vote is stored with `voter_kind = user`.
- The page renders two bars per feature.

This is categorically better signal than anonymous clicks. It goes further than #12: instead of hardening anonymous identity, it adds a second, real identity class.

**Bends:** the `v1` schema (an optional `votable: true` and a vote URL; desktop clients that don't know the field must ignore it), the Supabase schema (`voter_kind`), and the desktop repo.

#### Flow
- Map voting IDs to roadmap item IDs (pairs with the Public Roadmap card A ledger).
- Add a session-authenticated vote endpoint, with one vote per user per item enforced by a unique key.
- Desktop: a vote button on roadmap items.
- Web: two-tally rendering in 14 locales.

#### Expected impact
The product owner can rank work by what paying or active users want. Measure the overlap between the user top-3 and the visitor top-3. What could break: older desktop builds reject an unknown field. The contract notes say schema mismatches fall back to a bundled copy, so test that path first.

#### Evaluation
Claim: quality - roadmap demand is weighted by actual users.
Before: one anonymous tally that can be reset by clearing storage. Desktop users see the roadmap but cannot vote.
After: a user tally with one vote per account, next to the visitor tally.
Method: simulation. I walked three cases: (1) a user votes in-app and the web shows +1 under "users"; (2) the same user votes on the web while signed out, which counts as a visitor and is shown separately; (3) an old desktop build gets the extended `v1.json` and must ignore the extra field. It is falsified if the desktop's schema validator is strict on unknown keys.
Result: unmeasurable
Gate: contract

#### First experiment
In the desktop repo, feed the v1 validator a payload with an extra `votable` field and see whether it falls back.

#### Evidence
- `src/components/sections/feature-voting/data.ts:63-75` - client-minted voter ID.
- `docs/parity-backlog/01-marketing-upgrade-EXECUTION.md:61-68` - the desktop consumes `v1.json` with a fallback on schema mismatch.
- `public/roadmap/v1.json:8-15` - item IDs `"2"`..`"10"`, disjoint from the voting IDs.

---

## Public Roadmap
`/roadmap` renders area cards plus a 15-phase progress bar from static data. `/api/roadmap` reads `roadmap_items` and nothing consumes it. `public/roadmap/v1.json` is a hand-written cross-repo contract. files=12

### 5.4A · One roadmap ledger compiled to the page, v1.json in 14 locales, and the votable set
**Slot:** structural  ·  **Size:** L  ·  **Effort:** 6/10  ·  **Impact:** 8/10  ·  **Risk:** 5/10  ·  **Gate:** contract

#### Summary
Replace four independent roadmap truths with one typed ledger. A build step generates `public/roadmap/v1.json` from it, with all 14 locales filled from the i18n bundles. The progress bar and the voting cards are derived from the same records.

#### Description
Today the roadmap state is written down four times, and the copies disagree:
- `phaseCardData`: 15 phases, where phase 6 "Internationalization" is `completed: true` (`src/data/roadmap-phases.ts:62`).
- `v1.json`: item 4, "Use Personas in your language", is `in_progress` (`public/roadmap/v1.json:10,31-33`).
- The voting widget still invites votes on `i18n` (`src/components/sections/feature-voting/data.ts:28`).
- `roadmap_items` in Supabase is served by a route nothing calls (`src/app/api/roadmap/route.ts:14-17`).

So the desktop app and the website tell users different things about the same feature. `v1.json` also carries a hand-typed `generatedAt` (`:3`) and only `i18n.en` (`:18-19`), although the schema accepts the other 13 locales and the repo maintains all 14 by hand.

The moonshot is one `roadmap.ledger.ts`: `{id, phase?, area?, votable?, status, priority}`, with titles in `roadmapSection`. A `scripts/build-roadmap-v1.mjs` step (beside the existing check scripts) emits v1 with every locale, and a vitest test validates it against the contract constraints. This goes past the rejected `roadmap-v1-json-contract` (publish the file) and the shipped `roadmap-truth-source-metrics` (catalog counts). Here the state itself is derived.

#### Flow
- Add a vitest consistency check across `phaseCardData`, `v1.json` and the voting IDs. It fails today on i18n, and that alone proves the bet.
- Build the ledger and the v1 generator (en only), with a byte-identical diff against the current `v1.json`.
- Fill the 13 locales from the existing `roadmapSection` translations.
- Derive `RoadmapProgress` and the voting `features` from the ledger. Retire or wire `/api/roadmap`.

#### Expected impact
Desktop users in 13 non-English locales get a translated roadmap, and the web and the app stop contradicting each other. What could break: the generator emits a payload the desktop rejects, which triggers the desktop's bundled fallback. Contract tests mirror its constraints.

#### Evaluation
Claim: quality - one roadmap state on every surface.
Before: 4 sources and at least 1 live contradiction (i18n completed vs in progress vs still votable). v1 has 1 of 14 locales.
After: 1 source, contradictions are impossible by construction, and v1 has 14 of 14 locales.
Method: simulation. I walked three cases: (1) flipping Cloud Integration to completed, which today needs edits in 3 files and afterwards needs 1; (2) a Czech desktop user, who today falls back to English and afterwards sees Czech; (3) adding a votable item, which today needs 4 allowlist copies (see the Voting A card) and afterwards needs 1 entry. It is falsified if the phase model and the v1 items cannot share IDs, for example because the owner wants them editorially distinct.
Result: better
Gate: contract

#### First experiment
Write the cross-source consistency test only, and report the contradictions it finds.

#### Evidence
- `src/data/roadmap-phases.ts:62` - phase 6 is marked completed.
- `public/roadmap/v1.json:10` - item 4 is `in_progress`; `:18-19` has only `en`.
- `src/app/api/roadmap/route.ts:14-17` - reads `roadmap_items`; the feature doc confirms there are no consumers.
- `src/lib/seo.ts:4` - `SITE_URL` defaults to `personas.ai` while the desktop hard-codes `personas.so` (contract doc `:61`). Verify the deploy host before any generator work.

### 5.4B · Watch the fleet build it - live agent work under each in-progress roadmap item
**Slot:** experience  ·  **Size:** XL  ·  **Effort:** 8/10  ·  **Impact:** 9/10  ·  **Risk:** 7/10  ·  **Gate:** policy-loosen

#### Summary
Each in-progress roadmap card gets a live strip showing the Personas team's own Fleet sessions working on it: label, state and queue position, updated as the desktop syncs. It is a roadmap that proves the product by being built with it.

#### Description
The roadmap is static (`force-static`, and the doc notes that `revalidate = 3600` refreshes nothing). Item 8 claims "Fleet - supervise many coding sessions" has shipped (`public/roadmap/v1.json:43-45`).

The data plane to show it already exists. `synced_fleet_queue` mirrors each session's `label`, `state`, `rank`, `goal_id` and a desktop-written `synced_at` freshness stamp (`scripts/setup-sync-db.sql:309-325`). It is in the Realtime publication (`df30dad`). It was designed privacy-first: "Deliberately absent: cwd, spawn args, claude session id" (`:308`).

The moonshot:
- A sanitized `public_fleet_showcase` view over one owner account's rows, filtered to sessions whose `goal_id` maps to a roadmap ledger item and whose label passes an allowlist.
- The page subscribes anonymously, with sessions shown live only while `synced_at` is under 45s old (the table's own staleness rule).

Only an AI-orchestration company can put this on its roadmap page.

**Bends, explicitly:** RLS today is `user_id = auth.uid()` (`setup-sync-db.sql:413`), so public read needs a new view or policy, which is a Supabase change outside the repo. It also needs an owner decision to expose real work.

#### Flow
- Build an offline mock: render the strip from a recorded fleet snapshot under one card.
- The owner tags fleet goals with roadmap IDs, and the view returns only tagged and allowlisted rows.
- A client island on `/roadmap` subscribes and degrades to "last seen" when stale.
- Copy in 14 locales, and motion gated by `usePageVisibility` (ambient loop rule).

#### Expected impact
Visitors see evidence instead of promises. Measure time on `/roadmap` and the download/waitlist rate from it. What could break: a mislabeled session leaks internal work. The label allowlist and a default of hiding unmatched sessions are the guard.

#### Evaluation
Claim: user - roadmap claims are backed by visible, current activity.
Before: 0 live signals on `/roadmap`, and "in progress" is a string in `v1.json`.
After: each in-progress item shows N active sessions, with freshness under 45s.
Method: simulation. I walked three cases: (1) a fleet working Cloud Integration, which shows 3 sessions live; (2) the desktop offline, where `synced_at` ages past 45s and the strip shows "last active 2h ago"; (3) an untagged session, which is never shown. It is falsified if the owner's fleet rarely works tagged roadmap goals, which makes the strip empty most of the time.
Result: unmeasurable
Gate: policy-loosen

#### First experiment
Query `synced_fleet_queue` for one week of the owner's rows and count how many sessions could be tagged to a v1 item. That tells whether the strip would ever be lit.

#### Evidence
- `scripts/setup-sync-db.sql:309-325` - fleet queue columns, including `label`, `state` and `goal_id`.
- `scripts/setup-sync-db.sql:305-308` - `synced_at` is the staleness signal, and sensitive fields are excluded.
- `public/roadmap/v1.json:43-45` - Fleet is a shipped roadmap claim.

---

## Build Config & E2E Tests
`next.config.ts` (security headers, CSP), Playwright config (chromium only, 1 worker, CI fails flaky tests), and 18 specs, including a data-driven smoke manifest. The context map still lists 4 deleted specs (download, use-cases, compare, community). files=20

### 5.5A · A render matrix across locale, direction and route - the gate that earns the language switcher
**Slot:** structural  ·  **Size:** L  ·  **Effort:** 6/10  ·  **Impact:** 8/10  ·  **Risk:** 3/10  ·  **Gate:** architecture

#### Summary
Run the existing smoke manifest under all 14 locales, with RTL for Arabic, plus DOM detectors for mojibake, untranslated English and horizontal overflow. The language switcher can then be switched on in production once the matrix is green, not on faith.

#### Description
The repo's hardest rule is that all 14 locales are hand-translated, yet production hides them. `LANGUAGE_SWITCHER_ENABLED` is off because bundles are "incomplete and partly corrupt" (`src/stores/i18nStore.ts:35-42`). No e2e spec ever loads a non-English locale: the three specs that touch i18n import `en` only. Playwright runs one chromium project (`playwright.config.ts:32-34`). The encoding check is static (`package.json:34`) and cannot see how a string renders, for example overflow in German or a broken RTL layout.

The smoke manifest already makes coverage "a data question" (`e2e/smoke-routes.ts:1-10`, 31 routes). The moonshot adds a locale dimension. A fixture sets `personas-language` before load, using the existing `NEXT_PUBLIC_SHOW_LANGUAGE_SWITCHER=true` preview flag. Each page then runs three DOM detectors:
- mojibake byte patterns;
- text nodes identical to the `en` value for the same key (sampled);
- `scrollWidth > clientWidth`, and `dir` correct for `ar`.

The output is a locale-by-route heat table. It reuses the existing runner (no new tool), and the result is the evidence the owner needs to flip the flag per locale.

#### Flow
- Run `/` and `/roadmap` under `ar`, `de` and `ru` with the mojibake detector. That shows whether the detector finds real defects.
- Expand to the 31 routes and 14 locales, sharded and run nightly only (434 loads).
- Write the heat table as a CI artifact.
- Add a per-locale allowlist for the switcher, so each locale is enabled once it is green.

#### Expected impact
The 13 non-English locales the team maintains start reaching users. Measure how many locales are enabled and how many matrix cells are red. What could break: nightly runtime. With `workers: 1` the matrix needs sharding or must sample the route set.

#### Evaluation
Claim: quality - locale defects become visible per route before users see them.
Before: 0 of 13 non-English locales are exercised by e2e, and the switcher is off in production.
After: 434 cells checked nightly, and locales enabled one by one on evidence.
Method: simulation. I walked three cases: (1) the `ar` landing page, where the detector checks `dir="rtl"` and overflow; (2) the `ru` roadmap, where the mojibake detector would catch double-encoded sequences of the kind memory records for `ru`; (3) `de` pricing, where long compounds are checked for overflow. It is falsified if the static encoding check already catches everything the DOM detectors find.
Result: better
Gate: architecture

#### First experiment
One spec with 3 locales, 2 routes and the mojibake plus overflow detectors. Count the hits.

#### Evidence
- `src/stores/i18nStore.ts:35-42` - the switcher is off in production because the bundles are untrusted.
- `playwright.config.ts:32-34` - a single chromium project, with no locale dimension.
- `e2e/smoke-routes.ts:1-10` - the manifest-driven smoke suite (31 `path:` entries).
- `e2e/roadmap.spec.ts:2` - specs import `en` only.

### 5.5B · An evidence pack for every agent-authored commit - review by filmstrip, not by checkout
**Slot:** experience  ·  **Size:** M  ·  **Effort:** 5/10  ·  **Impact:** 7/10  ·  **Risk:** 3/10  ·  **Gate:** direction

#### Summary
On every push, CI maps the changed files to contexts, the contexts to routes, and captures exactly those routes at 375 and 1280 px, in both themes, with and without reduced motion. The result is one HTML pack the owner reads alongside the log before pushing.

#### Description
Most of this repo is written by agents: 224 commits in the last 30 days. The owner's process is "commit; owner pushes after reading the log" (`.claude/CLAUDE.md` Git policy). But the full e2e suite runs only nightly or on manual dispatch (`.github/workflows/ci.yml:88`), and traces exist only on a retry (`playwright.config.ts:29`). So the owner reads prose claims of visual changes with no visual evidence.

The pieces exist:
- `context-map.json` maps every file to a context;
- the smoke manifest maps routes to expectations (`e2e/smoke-routes.ts`);
- Playwright supports viewports, `colorScheme` and `reducedMotion` (already used in `e2e/reduced-motion-hydration.spec.ts:70-73`).

The pack is a static HTML grid per commit, uploaded as a CI artifact. This is dogfooding the product's own idea: agents hand humans a reviewable artifact, not a claim.

**Bends:** CI time on push. Today push runs only typecheck, lint, unit and build.

#### Flow
- Build a local script: `git diff --name-only HEAD~1`, then contexts, then routes, then screenshots in a grid HTML. Run it on 3 recent commits.
- Add a CI job on push with a matrix of 2 viewports, 2 themes and 2 motion settings, uploaded as an artifact.
- Diff against the parent commit's pack, highlighting only changed tiles.
- Optionally, the commit hook adds the pack link to the agent's summary.

#### Expected impact
The owner catches visual regressions before the push instead of in a browser session. The reference memory notes the dev window cannot reach 375px, and Playwright can. Measure regressions found pre-push against post-push. What could break: noisy diffs from animation. Reduced-motion captures are the stable baseline.

#### Evaluation
Claim: user - every commit's visual change is reviewable in under a minute.
Before: 0 visual artifacts per push. Nightly traces appear only on failure or retry.
After: one pack per push covering every affected route across 8 variants.
Method: simulation. I walked three cases: (1) a roadmap tile change, which captures `/roadmap` at 375px and shows the clipped scrim; (2) an en.ts-only change, which maps to many contexts and should be capped to the smoke manifest; (3) a server-only change (`api/*`), which captures no routes. It is falsified if the file-to-route mapping is too coarse, for example if most commits touch shared files that map to every route.
Result: unmeasurable
Gate: direction

#### First experiment
A local script for the last 5 commits that prints the route set each would capture, to test how sharp the mapping is.

#### Evidence
- `.github/workflows/ci.yml:88` - e2e runs only on schedule or dispatch.
- `playwright.config.ts:29` - `trace: "on-first-retry"` only.
- `e2e/reduced-motion-hydration.spec.ts:70-73` - the context-option variant pattern already exists.

---

## Supabase Client
A memoized anon-key client that throws when unconfigured, plus a 1,095-line read-only `ApiClient` over `synced_*` tables (the desktop-to-Supabase mirror). files=2

### 5.6A · A closed-loop command plane - every read-only verb becomes an approval-gated command with a live result
**Slot:** structural  ·  **Size:** L  ·  **Effort:** 6/10  ·  **Impact:** 8/10  ·  **Risk:** 5/10  ·  **Gate:** architecture

#### Summary
Turn the cloud-sync dashboard from look-only into remote control. Each `readOnly()` verb inserts a typed `pending_commands` row. The web watches that row's status over Realtime until the desktop reports `completed` with a `result_ref`.

#### Description
`supabaseApi` throws 501 on 8 verbs (`src/lib/supabaseApi.ts:54,329,361,427-435`). Only `executePersona` writes a command (`:345-392`), and it returns the command ID as an `executionId` with status `"queued"`; nothing ever follows it up. Yet the DDL already accepts `cancel_execution`, `queue_reorder`, `queue_set_lane` and `queue_cancel` (`scripts/setup-sync-db.sql:374-375`). The status lifecycle is `pending, approved, executing, completed` (`:358`), and `result_ref` was just added (`:372`, commit `df30dad`). Realtime publishes `pending_commands`, but the hook watches only 5 tables (`src/hooks/useSyncedRealtime.ts:34-40`).

The moonshot is a `commandPlane.request(type, payload)` helper. It returns a handle whose status streams from a `pending_commands` subscription, and a small `PendingCommandChip` UI shows "awaiting approval on <device>, then running, then done". Cancel and the queue verbs ship first with **no schema change**. Delete, event updates and subscriptions need the CHECK constraint widened, which **bends the Supabase schema** and needs the desktop handler (cross-repo).

#### Flow
- Make `cancelExecution` insert `cancel_execution` and add `pending_commands` to the watched tables. This proves the loop end to end with no DDL.
- Return a command handle from `executePersona` and show the run once `result_ref` lands.
- Add the queue verbs (reorder, lane, cancel) to a fleet view.
- Widen the constraint for delete and update verbs (owner-run migration plus a desktop PR).

#### Expected impact
Signed-in users can steer their desktop fleet from any browser, with approval kept on the device. Measure commands issued and approval latency. What could break: stale approvals. The `expired` status exists (`:358`), so it should surface in the chip.

#### Evaluation
Claim: user - remote actions complete and report back.
Before: 8 verbs throw 501, and `executePersona` is fire-and-forget with no result path.
After: 5 verbs work with no DDL (cancel, run and 3 queue verbs), and every command shows its status live.
Method: simulation. I walked three cases: (1) cancel from the web, which inserts a row the desktop approves, executing then completed, and the chip clears; (2) the desktop is offline, so the row stays `pending`, then `expired`, and the chip says so; (3) a rejected approval, where the chip shows "declined on device". It is falsified if the desktop's handler does not yet process `cancel_execution` despite the constraint allowing it. Check the desktop handler first.
Result: better
Gate: architecture

#### First experiment
Insert a `cancel_execution` row by hand in Supabase and watch whether the desktop picks it up and writes `completed`.

#### Evidence
- `src/lib/supabaseApi.ts:361` - `cancelExecution: async () => readOnly()`.
- `scripts/setup-sync-db.sql:374-375` - the constraint already allows `cancel_execution` and the queue verbs.
- `src/hooks/useSyncedRealtime.ts:34-40` - the watched tables exclude `pending_commands`.

### 5.6B · A live roadmap room - presence and votes propagate to everyone on /roadmap
**Slot:** experience  ·  **Size:** M  ·  **Effort:** 4/10  ·  **Impact:** 6/10  ·  **Risk:** 3/10  ·  **Gate:** direction

#### Summary
Reuse the Supabase Realtime client the dashboard already uses, for anonymous visitors. Presence shows "14 people here now". The vote route broadcasts after each successful write, so other visitors' counts tick live, with no table exposed.

#### Description
The voting section fetches once, on mount (`src/components/sections/feature-voting/index.tsx:35-41`). After that the "Live" pill describes a snapshot. The site already runs a Realtime socket pattern (`src/hooks/useSyncedRealtime.ts:127`), and the CSP already allows `wss://*.supabase.co` (`next.config.ts:46-49`).

Presence and broadcast channels need **no table and no publication change**, so this stays inside the "no Supabase schema change" rule. The important design choice: do not use `postgres_changes` on `feature_votes`, which would expose voter rows to anon. Instead the server route sends a broadcast `{featureId, delta}` after its write succeeds. The client applies the delta, deduplicated against its own optimistic update.

Only the anon key is involved. The card stays inside CLAUDE.md rule 6. New presence copy needs translation into all 14 locales, and the pulse animation must respect `useStillMotion` and `usePageVisibility`.

#### Flow
- Add presence count only, behind `hasSupabaseEnv`, to check concurrency is non-trivial.
- Broadcast server-side from `POST /api/votes` and comments.
- Show a "someone just voted for X" ticker, gated by motion and visibility.
- Use the same channel for "new comment" badges.

#### Expected impact
The roadmap feels inhabited, which makes it more credible to visitors. Measure the vote rate per session with and without the room. What could break: an empty room ("0 here") reads worse than nothing. Show presence only when it is 2 or more.

#### Evaluation
Claim: user - visitors see other people's engagement in real time.
Before: one fetch per page load, and counts are stale until reload.
After: under 1s propagation of votes and comments, plus a presence count.
Method: simulation. I walked three cases: (1) two tabs, where a vote in A shows +1 in B in under 1s; (2) Supabase unconfigured, where the guard leaves today's behaviour; (3) a burst of 50 votes, where the debounce coalesces them, as `useSyncedRealtime`'s 400ms debounce does. It is falsified if concurrent `/roadmap` visitors average under 2, which makes the room always empty.
Result: unmeasurable
Gate: direction

#### First experiment
Add a presence-only counter logged to the console for one week, using Sentry `metrics.gauge`, to measure real concurrency.

#### Evidence
- `src/components/sections/feature-voting/index.tsx:35-41` - a one-shot `Promise.allSettled` on mount.
- `src/hooks/useSyncedRealtime.ts:127` - the existing `supabase.channel(...)` pattern.
- `next.config.ts:46-49` - the CSP already permits Supabase wss.

---

## SEO & Social Metadata
Nine OG image routes, `og.tsx`/`og-frame.tsx` helpers, sitemap, robots, manifest, and `seo.ts` constants. files=15

### 5.7A · A claims and freshness compiler - every public number and date derived, never typed
**Slot:** structural  ·  **Size:** M  ·  **Effort:** 5/10  ·  **Impact:** 7/10  ·  **Risk:** 3/10  ·  **Gate:** architecture

#### Summary
Generate one `public-claims.ts` at build time from the catalogs and git history: integration counts, template counts, per-URL `lastModified`, and the OG subtitle for every entity. Metadata, JSON-LD, OG images and the sitemap read only from it, and a test fails on any hand-typed number.

#### Description
Search-facing copy disagrees with the product:
- `SITE_DESCRIPTION` says "40+ integrations" (`src/lib/seo.ts:9`), and so does the JSON-LD, twice (`src/app/homeJsonLd.ts:21,33`). The catalog ships 125 connectors (`src/data/roadmap-phases.ts:40-41`).
- The templates OG says "Browse 50+" (`src/app/templates/opengraph-image.tsx:10`), against 57 template entries in `src/lib/templates.ts`.
- All 57 `/templates/[id]` pages inherit that one generic card, because `[id]` has no `opengraph-image`.
- The sitemap stamps `lastModified: now` on every URL at every build (`src/app/sitemap.ts:13,17`), so crawlers are told that every guide topic and template changed daily.

This goes past `roadmap-truth-source-metrics` (roadmap counts only) and ship-loop #10 (one string fix). The compiler covers every claim surface. It follows the registry subject `public-claim-provenance`, and supplies per-file `git log -1` dates for `lastModified`. It also adds a per-template OG built on the existing `ogCard` (`src/lib/og.tsx`). Page `metadata` stays English, per the repo decision, so this does not reopen the blocked hreflang item.

#### Flow
- Add a vitest test that greps the metadata surfaces for `\d+\+` and fails. Today it would fail with 4 hits.
- Build a generator that emits counts plus git-based `lastModified` for each sitemap URL.
- Add `templates/[id]/opengraph-image.tsx` from catalog fields.
- Route `seo.ts` and `homeJsonLd.ts` numbers through the claims module.

#### Expected impact
Search snippets and social cards stop understating the product. Crawl budget goes to pages that actually changed. Measure search impressions for template pages and the click-through rate of shared template links. What could break: git dates are unavailable in a shallow CI checkout. Fall back to the build date for missing entries and log the fallback.

#### Evaluation
Claim: quality - public claims match the shipped product.
Before: 4 hand-typed numeric claims (40+, 40+, 40+, 50+), every one stale. Every sitemap URL claims to be modified today. 57 templates share one OG card.
After: 0 typed claims, `lastModified` taken from content history, and 57 entity OG cards.
Method: simulation. I walked three cases: (1) adding connector #126, which updates the description and JSON-LD on the next build with no edits; (2) a guide topic untouched for 3 months, whose `lastModified` stays at its last commit; (3) sharing `/templates/gmail-inbox-triage`, whose card shows its own title and service flow. It is falsified if marketing wants rounded floors such as "100+". Then the compiler rounds down instead of copying, and the claims stay derived.
Result: better
Gate: architecture

#### First experiment
Write the `\d+\+` grep test plus a sitemap `lastModified` derivation for the blog posts only.

#### Evidence
- `src/lib/seo.ts:9` and `src/app/homeJsonLd.ts:21,33` - "40+ integrations".
- `src/app/templates/opengraph-image.tsx:10` - "Browse 50+".
- `src/app/sitemap.ts:13` - `const now = new Date()` is applied to every URL.
- `git ls-files | grep opengraph-image` - 9 routes, none under `templates/[id]`.

### 5.7B · An agent-native site - llms.txt, markdown twins and a read-only MCP endpoint
**Slot:** experience  ·  **Size:** M  ·  **Effort:** 5/10  ·  **Impact:** 7/10  ·  **Risk:** 4/10  ·  **Gate:** direction

#### Summary
Make personas-web the first place an AI assistant learns Personas correctly. Publish an `llms.txt` index, plain-markdown twins of guide topics and templates, and a read-only MCP server exposing `search_templates`, `get_template_config`, `list_connectors` and `search_guide` from the same data modules.

#### Description
The SEO plumbing serves only HTML crawlers. `robots.ts` has one rule set and no AI-agent affordances (`src/app/robots.ts:9-15`). There is no `llms.txt`, `.well-known` file or MCP surface in the tree (`git ls-files`). Yet the site holds exactly the structured knowledge an agent needs:
- 57 templates with real YAML configs (`src/lib/templates.ts:27`);
- 125 connectors;
- about 116 guide topics (`e2e/smoke-routes.ts:20`).

An orchestration company whose users run Claude Code fleets should be operable by those agents. For example, "set up Personas with a GitHub PR reviewer" could fetch the config through MCP.

New routes are **added**, not modified, so the route-path rule holds. The MCP route is a Next route handler that reuses the catalog modules server-side, and the catalogs stay off the client bundle. **Bends:** i18n. Machine surfaces would ship English first. Ask the owner whether rule 1 covers non-visitor output.

#### Flow
- Generate `llms.txt` plus `/templates/[id].md` statically from the catalogs, and check an assistant can cite them.
- Add markdown twins for guide topics (English), and `<link rel="alternate" type="text/markdown">`.
- Add a read-only MCP endpoint (Streamable HTTP) with 4 tools, rate-limited with the existing guard.
- Desktop: "install from personas-web MCP" pulls a template config directly.

#### Expected impact
Developers asking an assistant about Personas get correct, current answers and configs that can be pasted straight in. Measure MCP tool calls and markdown-twin fetches, which are visible as user agents in logs. What could break: scraping load. These are static files plus a rate-limited handler.

#### Evaluation
Claim: user - AI assistants can retrieve accurate Personas setup material.
Before: 0 machine-oriented surfaces, so an assistant must scrape client-rendered HTML.
After: one index, 57 template twins, about 116 guide twins and 4 MCP tools.
Method: simulation. I walked three cases: (1) asking an assistant with web access "how do I triage Gmail with Personas", which should land on the markdown twin and return the exact YAML; (2) an MCP client calling `get_template_config("gmail-inbox-triage")`, which should match `TemplateDetail`'s clipboard content; (3) robots or rate-limit enforcement on a burst. It is falsified if the major assistants ignore `llms.txt` and markdown alternates. The MCP half still stands.
Result: unmeasurable
Gate: direction

#### First experiment
A static `public/llms.txt` plus 3 hand-generated template `.md` files, then ask two assistants with browsing to set up one of them.

#### Evidence
- `src/app/robots.ts:9-15` - a single generic rule set.
- `src/lib/templates.ts:27` - `config: string`, a ready-made payload for agents.
- `src/app/templates/[id]/TemplateDetail.tsx:65` - today's human-only copy path.

---

## Error Monitoring & Analytics
Sentry init across 3 runtimes with a 750-line fail-closed PII scrubber, consent-gated Sentry `metrics.count` events, a page-view tracker, and a 531-line `/api/stats` route whose `useLiveStats` hook has zero consumers. files=10

### 5.8A · A field-performance ratchet - real-user vitals per route beside bundle-budget.json
**Slot:** structural  ·  **Size:** M  ·  **Effort:** 4/10  ·  **Impact:** 7/10  ·  **Risk:** 3/10  ·  **Gate:** architecture

#### Summary
Record LCP, INP and CLS from consenting visitors through the existing consent queue as Sentry distributions, tagged by route. A nightly script pulls the 75th-percentile (p75) figures into `field-budget.json`. The repo gains a ratchet on what users actually feel, not just on bytes.

#### Description
The repo's performance discipline runs in the lab: `bundle-budget.json` caps first-load KB, and CLAUDE.md rule 9 calls it "the only thing that can see bundle weight". The field is dark:
- `tracesSampleRate: 0` (`src/lib/sentry.ts:7`);
- no `useReportWebVitals` anywhere in `src/` (grep returns 0);
- analytics only increments counts (`src/lib/analytics.ts:20-27`).

So the motion-heavy marketing pages have never had an INP measurement. Next 16 documents `useReportWebVitals` (`node_modules/next/dist/docs/01-app/02-guides/analytics.md`). The installed Sentry SDK exposes `metrics.distribution` (`@sentry/core` public-api types). The existing `trackEvent` queue already handles consent and PII (`analytics.ts:29-46`), and its normalized route keys come from `PageViewTracker` (`src/components/PageViewTracker.tsx:11-13`).

This adds no new test runner or bundler. It is one script in the style of `check:bundle`, reading the Sentry API with a read token from env.

#### Flow
- Add `WebVitalsReporter` beside `PageViewTracker`: `distribution(name, value, { route })` through the consent queue.
- After a week, a script prints the p75 per route.
- Add `field-budget.json` plus a `check:field` report in nightly CI. It warns first, then ratchets.
- Link the worst INP routes to their motion components for fixes.

#### Expected impact
The owner learns which sections hurt real interaction, not lab KB. Measure the share of routes with a p75 INP of 200ms or less. What could break: sample sizes with low consent. Report the n beside every p75, and do not gate on cells with n under 50.

#### Evaluation
Claim: performance - real-user responsiveness becomes visible and ratcheted.
Before: 0 field metrics. Budgets are lab KB only.
After: p75 LCP, INP and CLS per route with an n, and a nightly report.
Method: simulation. I walked three cases: (1) the `/` landing page with heavy framer motion, where INP is captured on scroll interactions; (2) the `/dashboard/home` demo, where LCP after the lazy bay is observable; (3) a visitor with no consent, where events queue and are dropped, so they are correctly unmeasured. It is falsified if the consent rate is so low that no route reaches n=50 in 30 days.
Result: better
Gate: architecture

#### First experiment
Add the reporter behind a dev-only flag and log vitals to the console for 5 routes locally. Then check that `metrics.distribution` accepts the call in this SDK build.

#### Evidence
- `src/lib/sentry.ts:7` - `tracesSampleRate: 0`.
- `src/lib/analytics.ts:20-27` - only `metrics.count` is used.
- `bundle-budget.json:1-6` - the lab-only ceiling file.
- `src/components/PageViewTracker.tsx:11-13` - route normalization to reuse as the metric tag.

### 5.8B · Glass-box telemetry - the privacy policy compiled from the code, plus a "what this tab sent" inspector
**Slot:** experience  ·  **Size:** M  ·  **Effort:** 4/10  ·  **Impact:** 6/10  ·  **Risk:** 2/10  ·  **Gate:** direction

#### Summary
Generate the "Website Analytics" section of the privacy policy from the event catalog in `analytics.ts`. Add a live inspector on `/legal` that lists every event this tab queued or sent, and shows the PII scrubber running on text the visitor pastes.

#### Description
The policy says the site collects "basic, anonymous page-view analytics" (`src/app/legal/policies/PrivacyPolicy.tsx:76`). The code exports 8 tracking functions (`src/lib/analytics.ts:50-120`):
- page views;
- download clicks with placement and platform;
- waitlist open, submit and result;
- feature vote, request and comment.

The prose has already drifted from the code. The scrubber is a pure exported function (`scrubPii`, `src/lib/sentry-pii.ts:247`) with 18 named sensitive fields. The pre-consent queue is an in-memory array (`analytics.ts:10`).

A product that asks people to trust it with credentials (the AES-256 vault claim in `src/lib/seo.ts:9`) gains from making its own telemetry inspectable. The pieces:
- A typed `EVENT_CATALOG` (name, attributes, purpose) drives both `trackEvent` and the policy text.
- A small inspector subscribes to the queue and to sends.
- A scrubber sandbox runs entirely in the browser and sends nothing.

**Bends:** policy copy in all 14 locales. The legal hub is currently hardcoded English (ship-loop #18), so this either joins that migration or stays English-only by owner decision.

#### Flow
- Add `EVENT_CATALOG` plus a vitest check that every `track*` maps to a catalog entry.
- Render the policy's analytics list from the catalog.
- Add the inspector panel on `/legal`, a client island fed by the queue and sends.
- Add the scrubber sandbox (paste text, see the redacted result).

#### Expected impact
Privacy-minded developers can verify the claims themselves, and the policy can no longer drift from the code. Measure consent opt-in rate before and after. What could break: the inspector exposes event names that hint at funnel design, which is acceptable and arguably the point.

#### Evaluation
Claim: quality - the published privacy text matches the telemetry code.
Before: the policy names page views only, and the code sends 8 event kinds.
After: the policy list is generated from the catalog, so it matches the code by construction.
Method: simulation. I walked three cases: (1) adding a `trackHeroCta` without a catalog entry, which fails the test; (2) a visitor before consent, whom the inspector shows N queued events not sent; (3) a visitor pasting a stack trace containing an email and home path, who sees `[redacted-user]` and email removal client-side. It is falsified if the owner's counsel requires hand-drafted policy prose. Then the catalog feeds an appendix instead.
Result: better
Gate: direction

#### First experiment
Write `EVENT_CATALOG` plus the catalog-coverage vitest test. Report the policy delta as a list.

#### Evidence
- `src/app/legal/policies/PrivacyPolicy.tsx:76` - "basic, anonymous page-view analytics".
- `src/lib/analytics.ts:50-120` - 8 exported `track*` functions.
- `src/lib/sentry-pii.ts:247` - `scrubPii` is pure and exported, so it is reusable client-side.

---

## Orchestrator API Client & Mock Data
A 24-method `ApiClient` interface with three implementations (orchestrator REST, Supabase mirror, demo mock), dispatched by a Proxy keyed on `isDemo`. About 3,170 lines of hand-authored fixtures. files=8

### 5.9A · A simulated orchestrator - a seeded world engine behind mockApi, where actions have consequences
**Slot:** structural  ·  **Size:** XL  ·  **Effort:** 8/10  ·  **Impact:** 8/10  ·  **Risk:** 5/10  ·  **Gate:** architecture

#### Summary
Replace static fixtures with a deterministic, seeded discrete-event simulator: personas, a scheduler, executions that progress, failures that raise healing issues, and reviews that arrive. `mockApi` becomes a view over the simulator, and every write changes the world.

#### Description
The demo's writes are mostly theatre:
- `executePersona` mints `e-new-${Date.now()}` and never inserts it, so the run vanishes (`src/lib/mockApi.ts:135-138`).
- `cancelExecution` returns `"cancelled"` without changing anything (`:130-133`).
- `deletePersona` is a no-op (`:107-110`).

Only `publishEvent` and `updateEvent` write through (`:157-200`), and each was a separate bug fix, citing `demo-data-plane/network-faithful-mocks` (`:187`). The fixtures are 978 plus 2,193 lines (`mockData.ts`, `mock-dashboard-data.ts`). Coherence keeps breaking: the shipped `home-one-fleet-truth` direction had to merge two disjoint fleets, and `home-living-demo-clock` patched frozen timestamps.

A simulator makes coherence structural. One seed and one clock derive every chart, list and KPI, so a run started from the demo appears in Executions, ticks to completion, updates spend, and may raise a review. It reuses the `ApiClient` contract (`src/lib/api.ts:127-152`) and the seeded LCG pattern (`seededRandom`). It must load lazily: the dashboard routes are already at about 1.4 MB first load (`bundle-budget.json`).

#### Flow
- Build a simulator core with personas, executions and a clock, plus vitest checks that the same seed gives the same world. Then wire `executePersona` and `cancelExecution`.
- Derive observability and spend from simulated executions, and delete the matching fixtures.
- Add reviews, healing issues and events as simulator outputs.
- Retire `mock-dashboard-data.ts` panels one at a time, each tied to a context.

#### Expected impact
Demo visitors can act and see consequences, which is the job a demo exists to do. Measure demo session length and actions per session. What could break: visual regressions in fixture-tuned charts. Migrate panel by panel, each behind a snapshot check.

#### Evaluation
Claim: quality - the demo stays coherent under interaction.
Before: 3 of 5 execution and persona write verbs do nothing, and 2 fixture files can drift apart.
After: 5 of 5 verbs mutate one world, and every panel derives from one seed.
Method: simulation. I walked three cases: (1) Run a persona, which today leaves no trace in Executions and afterwards shows a queued, then running, then completed row with spend +$0.04; (2) cancelling a running execution, which today the list still shows running and afterwards shows cancelled; (3) reloading, where the same seed gives the same starting world, as the determinism direction requires. It is falsified if the dashboard panels need richer data than a simulator can plausibly generate, for example narrative message threads.
Result: better
Gate: architecture

#### First experiment
Build a simulator for executions only: wire `executePersona`, `listExecutions` and `cancelExecution`, then click Run in the demo and see the row appear and complete.

#### Evidence
- `src/lib/mockApi.ts:135-138` - the minted execution ID is never stored.
- `src/lib/mockApi.ts:130-133` - cancel returns a status without mutating anything.
- `src/lib/mockApi.ts:184-200` - the write-through fix already made for events (the pattern to generalize).
- `wc -l` - `mockData.ts` 978, `mock-dashboard-data.ts` 2,193.

### 5.9B · Ask the demo - an agent that drives the dashboard through ApiClient as its tool set
**Slot:** experience  ·  **Size:** L  ·  **Effort:** 7/10  ·  **Impact:** 8/10  ·  **Risk:** 5/10  ·  **Gate:** direction

#### Summary
Add a command bar to the demo dashboard: "Which agent is costing the most this week? Pause it and show me its last failure." An LLM plans over the 24 `ApiClient` methods exposed as tools and executes them against `mockApi`. The UI navigates and highlights as it goes.

#### Description
The `ApiClient` interface (`src/lib/api.ts:127-152`) is already a typed, side-effect-scoped tool surface: 24 methods, each with JSON-serializable inputs and outputs. The Proxy (`api.ts:355-362`) guarantees that a demo session can only hit `mockApi`, so an agent driving the demo cannot touch a real orchestrator. That keeps the "dashboard stays on mocks" constraint intact. Dashboard pages already accept `?focus=<id>` deep links that ring a row (for example `src/app/dashboard/observability/PerformanceView.tsx:29`), which gives the agent a way to point at things.

There is no LLM integration in `src/`. The moonshot adds one server route that holds the model key server-side and streams tool calls. The client executes the tools locally against `mockApi`, so no demo state goes to the server. It then routes to `?focus=` targets. It follows the registry's `agent-addressable-ui` and `mcp-tools` subjects.

**Bends:** a new paid dependency (an LLM API, with a cost cap and rate limit), and new UI strings in all 14 locales. It pairs naturally with card A, because answers are richer when actions have consequences.

#### Flow
- Generate a tool-schema list from the `ApiClient` signatures, with read-only tools first, plus 10 scripted questions answered offline.
- Add a server route with streaming and a client tool executor against `mockApi`.
- Wire the `?focus=` navigation and highlight.
- Add write tools (pause, retry), with a confirm step in the UI.

#### Expected impact
Prospects experience "an agent operating agents" directly, which is the product's thesis, in 30 seconds. Measure command-bar use and the demo-to-waitlist rate. What could break: cost abuse. Mitigate with a per-IP limit through the existing `rateLimitGuard`, a token cap, and canned fallbacks.

#### Evaluation
Claim: user - visitors can operate the demo in natural language.
Before: the demo is click-only, and finding "the costliest agent" takes about 4 navigations (observability, spend, persona, executions).
After: one sentence, about 3 tool calls, and a focused row.
Method: simulation. I walked three questions: (1) "costliest agent", which calls `getObservabilityPersonaSpend`, sorts, then `getPersona` and focuses it; (2) "why did the last run fail", which calls `listExecutions({status:"failed"})` and `getExecution`; (3) "delete everything", where a write tool is gated by confirm and, in the mock, mutates only the visitor's session. It is falsified if the tool round trips exceed about 6 seconds on the median question.
Result: unmeasurable
Gate: direction

#### First experiment
An offline script that turns the `ApiClient` interface into tool JSON schemas, plus one scripted run of question 1 against `mockApi` in vitest with a stubbed planner.

#### Evidence
- `src/lib/api.ts:127-152` - the 24-method typed interface, already the contract for 3 implementations.
- `src/lib/api.ts:355-362` - the demo Proxy keeps tools on `mockApi`.
- `src/app/dashboard/observability/PerformanceView.tsx:29` - an existing `?focus=` deep-link target.

---

## Authentication & User Session
A Zustand auth store with Google OAuth through Supabase plus an in-memory demo session (`MOCK_USER`). The guard is client-only. `src/proxy.ts` redirects mobile users. files=9

### 5.10A · Paired-device identity - the desktop vouches for the web session
**Slot:** structural  ·  **Size:** L  ·  **Effort:** 7/10  ·  **Impact:** 7/10  ·  **Risk:** 6/10  ·  **Gate:** architecture

#### Summary
Make "pair with your desktop" the primary sign-in. The web shows a code or QR. The signed-in desktop approves it through the same approval channel it uses for remote commands. The server then mints a web session for that same user, and a request-time check in `proxy.ts` protects `/dashboard` before any HTML is sent.

#### Description
The only real sign-in is Google OAuth (`src/stores/authStore.ts:211-216`). The gate is a client boolean (`src/components/dashboard/AuthGuard.tsx:39`), which the feature doc itself calls "not an access-control boundary".

`src/proxy.ts` **is a live request hook**: Next 16 renamed middleware to Proxy (`node_modules/next/dist/docs/01-app/01-getting-started/16-proxy.md`), and its matcher covers `/dashboard/:path*` (`src/proxy.ts:43-45`). Note that `docs/features/infrastructure/orchestrator-client-mocks.md` wrongly calls it dormant.

The desktop is already an authenticated Supabase client: every `synced_*` row defaults to `auth.uid()`, and `synced_devices` keys each device to its user (`scripts/setup-sync-db.sql:37-45`). Approval-gated cross-device flows already exist (`pending_commands`, `:349-358`). The registry subject `device-pairing` governs this.

The flow: the web creates a short-lived `pairing_request`. The desktop shows "Approve sign-in from Chrome on Windows?". On approval, a `server-only` route uses the admin client (`src/lib/supabase-admin.ts`) to mint a session. A cookie lets `proxy.ts` do an optimistic check.

**Bends:** the Supabase schema (a new table), the desktop repo, and the session model (cookies alongside localStorage). It is security-sensitive, so it should get a security review before shipping.

#### Flow
- Fix the stale doc, and add an optimistic cookie check to `proxy.ts` for real sessions only (the demo stays client-side).
- Add the pairing request table and the desktop approval prompt, behind a flag.
- Add the server mint route with a 60s expiry, one-time use, and a device-name echo.
- Make pairing the default CTA in `SignInPrompt`, with Google kept as a fallback.

#### Expected impact
Desktop users reach their cloud-sync dashboard in one click on a device they already trust, with no second account flow. Measure pairing success rate and time to dashboard. What could break: phishing of pairing codes. Show the origin and browser on the desktop prompt, plus short TTLs.

#### Evaluation
Claim: resilience - the dashboard gets a request-time identity check, and sign-in is anchored to a trusted device.
Before: a client-only boolean gate, and OAuth is the only real path.
After: a proxy-level optimistic check, and device-approved sessions.
Method: simulation. I walked three cases: (1) a user with the desktop open, who enters a code and is approved within about 5s; (2) a stolen code used after 60s, which is rejected; (3) a demo visitor, who is unaffected because `isDemo` stays client-only and the proxy ignores sessions without a cookie. It is falsified if the minting path needs Supabase admin features the project tier lacks. Check the admin `generateLink` availability first.
Result: better
Gate: architecture

#### First experiment
Add a `console.log` in `src/proxy.ts` and load `/dashboard` under `next dev` to confirm the hook fires in this Next 16 build.

#### Evidence
- `src/stores/authStore.ts:211-216` - Google is the sole provider.
- `src/components/dashboard/AuthGuard.tsx:39` - `if (!isAuthenticated) return <SignInPrompt />`.
- `src/proxy.ts:26,43-45` - exported `proxy` with a `/dashboard` matcher; Next 16 proxy convention doc.
- `scripts/setup-sync-db.sql:37-45` - `synced_devices.user_id` default `auth.uid()`.

### 5.10B · Shared demo rooms - a multiplayer demo that previews Team Workspaces
**Slot:** experience  ·  **Size:** L  ·  **Effort:** 6/10  ·  **Impact:** 7/10  ·  **Risk:** 4/10  ·  **Gate:** direction

#### Summary
"Invite a teammate to this demo" creates a room link. Both people share one demo session over Supabase Realtime broadcast: cursors, who is looking at which panel, and actions replayed on both sides. A sales call or a team evaluation happens inside the product.

#### Description
The demo session is a single in-memory identity (`MOCK_USER`, `src/lib/mockAuth.ts:3-10`), entered through `enterDemo` or `signInAsDemo` (`src/stores/authStore.ts:192-209`). The feature doc notes it does not survive a reload. Team Workspaces is a planned roadmap item: "Build agents together with your team - shared spaces, role permissions, and live dashboards" (`public/roadmap/v1.json:11,35-37`). The demo is the cheapest place to show that future.

The transport exists. The Realtime client is already used (`src/hooks/useSyncedRealtime.ts:127`), and broadcast and presence need **no tables**, so there is no schema change. The demo state is not shared, because mock writes live in each tab's module memory (`src/lib/mockApi.ts:157-200`). So the room broadcasts **operations**, not state, and each tab replays them. That needs deterministic mocks: it is solid on top of the Orchestrator card A simulator, and best-effort without it.

**Bends:** none on data. It needs new UI strings in all 14 locales, and presence motion gated by `useStillMotion` and `usePageVisibility`.

#### Flow
- Presence only: a room ID in the URL, avatars, and "viewing /dashboard/reviews".
- Follow mode: a guest's route follows the host's.
- Broadcast operations for the review verdict and run actions, replayed through `mockApi` on each tab.
- Add role chips (owner and viewer) that preview the Team Workspaces permissions model.

#### Expected impact
Evaluating teams and sales demos become collaborative, and the roadmap's Team Workspaces item gets early validation. Measure rooms created and the demo-to-waitlist rate for room participants. What could break: replicas drift without deterministic mocks. Ship follow mode before shared actions.

#### Evaluation
Claim: user - two people can explore the demo together in real time.
Before: one person per demo. Sharing means screen-sharing, and a reload loses the session.
After: room links, live presence, a follow mode, and replayed actions.
Method: simulation. I walked three cases: (1) the host approves a review and the guest's queue shows it approved via the replayed op; (2) a guest joins late, where state must be rebuilt by replaying the op log, which needs the seed plus the ops; (3) Supabase unconfigured, where the invite button is hidden. It is falsified if concurrent demo pairs are rare, meaning there is no sales motion that would use rooms.
Result: unmeasurable
Gate: direction

#### First experiment
Presence plus follow mode only: two tabs, one Realtime broadcast channel, and the guest's router following the host's. No shared state.

#### Evidence
- `src/lib/mockAuth.ts:3-10` - a single `MOCK_USER` identity.
- `src/stores/authStore.ts:201-209` - `enterDemo` mints an in-memory session.
- `public/roadmap/v1.json:35-37` - Team Workspaces "live dashboards" is planned.
- `src/hooks/useSyncedRealtime.ts:127` - the existing Realtime channel usage.

---

### Side findings (not cards; noted for the coordinator)
- `docs/features/infrastructure/orchestrator-client-mocks.md` says `src/proxy.ts` is dormant. In Next 16, `proxy.ts` is the middleware convention, so the mobile redirect is very likely **live**.
- `src/hooks/useLiveStats.ts` and `/api/stats` (531 lines) have **zero** consumers in `src/`.
- `context-map.json` "Build Config & E2E Tests" lists 4 deleted specs and omits `dashboard-demo.spec.ts`, `smoke.spec.ts`, `smoke-routes.ts` and `stage-fit.spec.ts`.
- `SITE_URL` defaults to `https://personas.ai` (`src/lib/seo.ts:4`), while the desktop's roadmap fetch is hard-coded to `personas.so`.
