# Moonshot sweep: Platform Foundation + Theming, i18n & Shared Utilities (scout 08)

Scope: 8 contexts, 16 cards. Read-only scout; tree at `revamp/stage-fit` with a large uncommitted landing-lab
deletion in flight. `context-map.json` is stale for these contexts: 14 listed files no longer exist (e.g.
`src/components/dashboard/StatBadge.tsx`, `AmbientOrbs.tsx`, `ParallaxAccents.tsx`, `TopoBackground.tsx`,
`src/app/m/template.tsx`, `NavbarMobileMenu.tsx`, two illustrations; most were removed by `72dae5f` knip sweep).
Unmerged related work: `dashboard/spa` (`cee0ab7` SPA + two-level menu, `93c322d` Mission Control wall). None of
the cards below re-propose that branch, Cache Components, the deleted section-pause coordinator, hreflang/locale
routing, or any ship-loop / challenge backlog item; where a card sits next to one, it says how it differs.

---

## Mobile App Shell & Views
The `/m` phone shell: three tabs plus an Alerts drill-in over the dashboard's stores. It renders mock fixtures only. files=13 (12 still exist)

### 8.1A · /m as the remote control for the desktop app, via the pending_commands plane
**Slot:** structural  ·  **Size:** L  ·  **Effort:** 7/10  ·  **Impact:** 8/10  ·  **Risk:** 6/10  ·  **Gate:** contract

#### Summary
Turn `/m` from a read-only demo into the phone half of Personas: a typed command outbox over the
`pending_commands` table that the desktop already polls and approves. Every tap gets a live receipt (pending,
then executing, then completed).

#### Description
The write path already exists in the schema, and the web ignores it. `scripts/setup-sync-db.sql:329-347`
documents Phase 2: the web inserts a `pending_commands` row, the desktop leader polls every ~15s, raises an
approval card, and claims the row with a compare-and-set. The allowed verbs are
`run_persona, cancel_execution, queue_reorder, queue_set_lane, queue_cancel` (`:375`), and `df30dad` added
`pending_commands` to the realtime publication (`:544`). The web uses one verb in one place:
`supabaseApi.executePersona` (`src/lib/supabaseApi.ts:364-389`). Two verbs the desktop already accepts
fail with a 501 on the web. `cancelExecution: async () => readOnly()` is at `:361`. Review resolution goes through
`updateEvent` (`src/stores/reviewStore.ts:211`), which is also `readOnly()` (`supabaseApi.ts:428`). So an
operator who is away from the desk can see a review but cannot act on it. That is the one job a phone shell
exists for. Meanwhile `/m` renders fixtures unconditionally (`src/app/m/alerts/page.tsx:22-33`) and badges a
constant (`src/components/mobile/MobileTabBar.tsx:49`).

The moonshot adds a `commands` module: a typed verb registry that mirrors the CHECK constraint, an optimistic
outbox in a Zustand store, and receipt rows streamed back over the existing `useSyncedRealtime` channel
(`src/hooks/useSyncedRealtime.ts:105`). `/m` then gains Cancel run, Reorder queue and Resolve review actions.
It reuses `MobileSheet` for confirmation and `ReviewsFocusFlow` for the swipe UI.

Constraints bent: (1) live Supabase mode, not demo. The demo keeps mocks, and a demo outbox replays receipts
locally. (2) a schema change: widen the CHECK with `review_resolve`. (3) a desktop-repo handler for that verb.

#### Flow
- Wire `cancel_execution` (desktop already accepts it) from `/m` with a realtime receipt chip. This proves the loop end to end.
- Add the queue verbs on a mobile fleet-queue sheet (reads `synced_fleet_queue`).
- Add `review_resolve` to the CHECK and the desktop handler, then make `/m/reviews` act for real.
- Add a demo-mode outbox that simulates receipts so the shell shows the capability without an account.

#### Expected impact
Desktop users who leave their machine can steer it from a phone. Measure command round-trip latency (p50 from
insert to desktop claim) and the share of reviews resolved remotely. Risk: a stale approval card on the desktop
if expiry (1h, `:338`) and the phone's view disagree.

#### Evaluation
Claim: user - an operator away from the desk can act, not just look
Before: 1 of the 5 desktop-accepted verbs is reachable from the web; 0 from `/m`. Cancel and review-resolve throw 501.
After: 5 of 5 (+`review_resolve`) reachable from `/m`, each with a realtime receipt.
Method: simulation - walked (a) cancel a runaway run from the phone: today a 501, under the moonshot one row and a desktop claim within one ~15s poll; (b) resolve a critical review: blocked today by `updateEvent` readOnly; (c) reorder the queue: no web caller today. Falsified if the desktop's approval card makes phone commands feel slower than walking to the desk (>60s median).
Result: unmeasurable
Gate: contract

#### First experiment
Wire `cancelExecution` in `supabaseApi` to insert a `cancel_execution` row, and render its status from a
one-off realtime subscription. Time five round trips against a running desktop.

#### Evidence
- `scripts/setup-sync-db.sql:329-347` - Phase 2 contract: web inserts, desktop polls and approves.
- `scripts/setup-sync-db.sql:375` - accepted verb set; `:544` pending_commands in the realtime publication.
- `src/lib/supabaseApi.ts:361,428` - cancel and updateEvent are `readOnly()` (501).
- `src/lib/supabaseApi.ts:364-389` - the only pending_commands writer (`run_persona`).
- `src/app/m/alerts/page.tsx:22-33`, `src/components/mobile/MobileTabBar.tsx:49` - `/m` is fixture-bound.

### 8.1B · Lock-screen approvals: installable /m with Web Push for reviews that need a human
**Slot:** experience  ·  **Size:** L  ·  **Effort:** 6/10  ·  **Impact:** 8/10  ·  **Risk:** 5/10  ·  **Gate:** policy-loosen

#### Summary
When an agent stops for human approval, the operator's phone buzzes with the review title and severity. One tap
opens the right `/m/reviews` card, without the browser needing to be open.

#### Description
Today, the only reaction to a new review is the voice announcer. `maybeAnnounceNewReview`
(`src/hooks/useSyncedRealtime.ts:57-75`) runs only while a dashboard tab holds the realtime socket open
(`SyncedRealtimeProvider.tsx:17`). Close the tab and the HITL gate waits silently. The deployment pieces for an
installable app point the wrong way. `public/sw.js:1-17` is a tombstone that deliberately unregisters every
service worker. `src/app/manifest.ts:13` sets `start_url: "/"` (the marketing page), not the operator shell.
The routing for a notification tap is already done: `src/proxy.ts:8-17` maps a `/dashboard/reviews` deep link
to `/m/reviews` and keeps the query string. Its comment names "push notification" as a source.

The moonshot has five parts:
- A real service worker scoped to `/m/` only. The tombstone stays for `/`, so old caches still die.
- A second manifest for `/m` (start_url `/m/overview`, display standalone).
- A `push_subscriptions` table.
- A sender: a Supabase database webhook on `synced_manual_reviews` INSERT that calls a small route, with the same `status === "pending"` and seen-id guard logic as `maybeAnnounceNewReview`.
- Notification actions (Approve / Open). Approve rides card A's outbox when it exists; until then the notification only deep-links.

Constraints bent: a new table plus a DB webhook (schema/infra), replacing the deliberate tombstone decision for one
scope, and new user-facing strings ×14 (notification permission prompt, action labels).

#### Flow
- Ship `/m` manifest plus a push-only SW scoped to `/m/`, and a test-push button in Settings. This proves the install and permission funnel.
- Add the INSERT webhook to the sender, notify-only with a deep link to `/m/reviews?id=`.
- Add actionable notifications through card A's outbox.
- Add quiet hours and a severity floor, mirroring `NotificationsCard` settings.

#### Expected impact
Time-to-first-human-touch on a critical review drops from "next time I look" to minutes. Measure the median time
from review INSERT to resolution, and the opt-in rate. Risk: notification spam erodes trust. The severity floor
is not optional.

#### Evaluation
Claim: user - HITL reviews reach a human without an open tab
Before: 0 delivery channels with the tab closed. SW is a tombstone; manifest launches the marketing page.
After: one push channel. A critical review reaches the lock screen within seconds of the desktop sync pass.
Method: simulation - walked (a) operator at lunch, critical review: today unseen until return; (b) tab open but muted: voice only; (c) iOS: Web Push needs the installed PWA, so the install step is the funnel. Falsified if iOS install rates make the channel reach under ~20% of operators.
Result: unmeasurable
Gate: policy-loosen

#### First experiment
Ship a `/m`-scoped manifest and SW with a local `showNotification` triggered by the existing `onNewReview`
listener (`src/lib/review-voice.ts:70`). That validates the install, permission and tap-to-card flow before any
server work.

#### Evidence
- `src/hooks/useSyncedRealtime.ts:57-75` - new-review detection exists, but only feeds an in-tab voice.
- `public/sw.js:1-17` - SW is a deliberate tombstone.
- `src/app/manifest.ts:13` - installs to `/`, not `/m`.
- `src/proxy.ts:8-17,34-37` - deep-link mapping to `/m` views already preserves the query.

---

## Animation & Motion System
Reduced-motion and visibility gating, a quality tier, and two canvas compositors behind the site's ambient motion. files=26 (21 still exist)

### 8.2A · One seekable motion clock for every loop on the site
**Slot:** structural  ·  **Size:** XL  ·  **Effort:** 8/10  ·  **Impact:** 7/10  ·  **Risk:** 6/10  ·  **Gate:** architecture

#### Summary
Replace the site's many private wall clocks with one virtual motion clock. It can be paused, stepped, seeked and
time-scaled. Motion becomes deterministic, which makes it capturable: exact screenshots, tour-synced playback,
authored still poses, and video exports of the visualizers.

#### Description
Each motion system keeps its own time:
- `QualityContext` runs a sampling rAF (`src/contexts/QualityContext.tsx:87,135`).
- `useCanvasCompositor` derives `elapsed` from its own `startTime` (`src/hooks/useCanvasCompositor.ts:47-55,70`).
- `particleHostRegistry` runs a second rAF (`src/components/particle-host/particleHostRegistry.ts:84-89`).
- 54 component files declare framer `repeat: Infinity`, and 9 run SMIL `repeatCount="indefinite"`.

The loop gate can only stop loops (`src/lib/motion/loop-gate.ts:98-103`); it cannot place them at a known time.
The cost shows up wherever someone needs motion to hold still on cue:
- `e2e/tour.spec.ts:21-43` screenshots whatever frame happens to be on screen.
- The fleet "Night shift" is kept "for presentation screenshots and video" (`src/components/dashboard/fleet-playground/FleetPlayground.tsx:21-22`), with no way to render a chosen moment.
- Project memory records that a backgrounded tab freezes framer, so a browser check can "never trust animation state".

framer 13 ships the hook this needs: `MotionGlobalConfig.useManualTiming`
(`node_modules/motion-utils/dist/index.d.ts:11-14`).

The moonshot is a `motionClock` module:
- framer driven by manual timing;
- both compositors reading `clock.now()` instead of rAF timestamps;
- SMIL timelines driven through `useSvgTimelineGate` with `setCurrentTime`;
- a `?t=` / `window.__motion.seek(ms)` hook for e2e and capture.

`useLoopGate` stays the policy; the clock becomes the mechanism. How this differs from the deleted coordinator: no
provider, no per-section registry, one module-level clock.

#### Flow
- Drive both canvas compositors from one clock, then prove a deterministic Playwright screenshot of `/how` at t=2.5s.
- Turn on framer manual timing behind a flag, and run the reduced-motion hydration e2e to confirm no regressions.
- Bring the SMIL timelines in via `useSvgTimelineGate`.
- Add a capture script that steps the clock frame by frame and writes a WebM of any visualizer.

#### Expected impact
Owner and agents get reproducible visual checks; marketing gets clips with no screen recording. Measure
screenshot diff stability (identical pixels across runs). Risk: manual timing applies globally to framer, so a
missed `frame` drive freezes all motion.

#### Evaluation
Claim: quality - motion becomes reproducible
Before: at least 3 independent rAF clocks, 54 framer infinite-loop files and 9 SMIL timelines; screenshot pixels differ run to run.
After: 1 clock. Same seek gives identical pixels across 3 consecutive runs.
Method: simulation - walked (a) tour step screenshot: today timing-dependent, under the clock seek(0) on each step; (b) Night shift video: today a screen recording, then a stepped render; (c) backgrounded-tab verification: the clock advances only when stepped, so the freeze becomes a feature. Falsified if framer's manual timing does not cover layout or `layoutId` animations.
Result: unmeasurable
Gate: architecture

#### First experiment
Route `useCanvasCompositor`'s `elapsed` through a module clock with a `seek()` test hook. Show that two
Playwright screenshots of `CinematicBreather` at the same seek match byte for byte.

#### Evidence
- `src/hooks/useCanvasCompositor.ts:47-55,70` and `src/components/particle-host/particleHostRegistry.ts:84-89` - two private rAF clocks.
- `src/contexts/QualityContext.tsx:87,135` - a third rAF.
- `src/lib/motion/loop-gate.ts:98-103` - the gate can stop loops but not position them.
- grep: 54 files with `repeat: Infinity`, 9 with SMIL indefinite, 20 with `requestAnimationFrame`.
- `node_modules/motion-utils/dist/index.d.ts:11-14` - `MotionGlobalConfig.useManualTiming` exists.

### 8.2B · A visitor-owned motion dial: Full / Calm / Still, applied before first paint
**Slot:** experience  ·  **Size:** M  ·  **Effort:** 4/10  ·  **Impact:** 6/10  ·  **Risk:** 3/10  ·  **Gate:** direction

#### Summary
Give every visitor a motion control next to the theme swatches. It is persisted like the theme, and a pre-paint
script applies it before first paint, the same way the theme is applied. Visitors who never touched an OS setting
can quiet the site, and the site meets WCAG 2.2.2 (Pause, Stop, Hide) everywhere at once.

#### Description
The loop gate was designed with a visitor veto: decider `"user"` ("the visitor pressed a stop control",
`src/lib/motion/loop-gate.ts:14-15,23`). It has zero callers: `userStopped` appears nowhere outside
`loop-gate.ts` and `useLoopGate.ts`. Today the only way to calm the site is the OS-level
`prefers-reduced-motion`, read by `useStillMotion` (`src/hooks/useStillMotion.ts:40-56`, 73 importers).
Most visitors on a hot laptop or in a meeting never touch that setting. The quality tier only drops motion when
frames are already slow.

The moonshot has three parts:
- A `motionPreference` store (`full | calm | still`) that `useStillMotion`'s `subscribe` and `getSnapshot` also read, so all 73 consumers obey with no edits.
- A `data-motion` attribute set by the existing pre-paint script (`src/app/layout.tsx:100-104`). CSS `motion-reduce`-style rules then honour it from the first frame, which avoids the hydration traps that `PageTransition.tsx:20-37` documents.
- A three-state control beside `ThemeSwitcher`.

`calm` keeps data tickers (`resolveTicker`, `loop-gate.ts:69-71`) and entrance reveals, and stops ambient loops.
How this differs from the rejected section-pause coordinator (ArchitectWeb backlog): one global setting with no
providers and no per-surface toggles. It is the same shape as the theme store, which has proven its pre-paint
pattern.

#### Flow
- Store plus pre-paint `data-motion` plus `useStillMotion` reading it, behind a query param. Run the reduced-motion e2e with `?motion=still`.
- Add the switcher UI (3 labels plus 1 aria string, ×14 locales).
- Map `calm` onto `resolveTicker` vs `resolveLoop`.

#### Expected impact
Motion-sensitive visitors without the OS flag get relief, and laptop battery and fans calm down. Measure the dial
adoption rate and the share of sessions in calm/still. Risk: a stored `still` read only after hydration could
flash motion. That is why the pre-paint attribute is step one.

#### Evaluation
Claim: user - motion control without OS settings
Before: 0 on-page controls; the `"user"` decider has 0 callers; 73 hooks read the OS flag only.
After: 1 control governs all 73 consumers plus CSS animations from first paint.
Method: simulation - walked (a) a visitor on a projector who wants it still: today they must change OS settings; (b) a returning visitor with `still` stored: the pre-paint attribute means no motion frame; (c) an Athena `<video>` gated through `useStillMotion` follows automatically. Falsified if any consumer reads framer's `useReducedMotion` directly (82 files still do), so the rollout depends on that migration.
Result: unmeasurable
Gate: direction

#### First experiment
Make `useStillMotion` also return true when `document.documentElement.dataset.motion === "still"`, set via
`?motion=still` in the head script. Count how many landing loops actually stop.

#### Evidence
- `src/lib/motion/loop-gate.ts:14-15,23,49` - `"user"` decider defined; grep shows 0 `userStopped` callers.
- `src/hooks/useStillMotion.ts:40-56` - single SSR-safe read point.
- `src/app/layout.tsx:100-104` - pre-paint script precedent.
- grep: `useStillMotion` 73 files, framer `useReducedMotion` 82 files.

---

## Shared UI Primitives & Illustrations
Brand cards, the terminal panel family, chips, section intros, brand icons and five inline-SVG illustrations. files=25 (21 still exist)

### 8.3A · A scene kernel: SVG art built from tokenized, translated, gated primitives
**Slot:** structural  ·  **Size:** L  ·  **Effort:** 7/10  ·  **Impact:** 7/10  ·  **Risk:** 4/10  ·  **Gate:** architecture

#### Summary
Stop hand-rolling every SVG scene. Ship a small kernel: `<Scene>`, `<Label k>`, brand fills, a still pose, a
focusable node and a gated loop. It makes theming, i18n, focus and motion rules true by construction, and the
`/illustrate` workflow can emit scenes instead of 200-line TSX.

#### Description
The site's art is now its main medium (memory: "illustration-first wow design"), but every scene re-implements
the same conventions, unevenly. 60 component files render `<svg>`. Adoption of each convention:
- 19 use `BRAND_VAR`;
- 9 still use raw hex fills;
- 13 draw `<text>`, and only 5 of those use `useTranslation`;
- 8 apply `transformBox`;
- 4 use `SVGFocusRing`;
- 1 uses `SVG_EYEBROW`.

The base illustrations show the failure plainly. `ShieldIllustration.tsx:22-25` bakes "NO ANALYTICS / NO TRACKING
/ LOCAL ONLY / YOUR DATA" in `rgba(255,255,255,0.2)`. That is English in 14 locales and invisible on the 3 light
themes, because the light-theme inversions in `themes.css` only remap Tailwind `white/N` classes, never SVG
attributes. `AgentGridIllustration.tsx:27` repeats both problems.

The kernel defines:
- fills only as brand keys (`BRAND_VAR`, `tint`; `src/lib/brand-theme.ts:26`);
- text only via an i18n key, with `SVG_EYEBROW` (`src/lib/typography.ts`) as the type ramp;
- an obligatory `stillPose` prop;
- loops only through `useLoopGate` + `useSvgTimelineGate`;
- interactive nodes that carry `SVGFocusRing`.

A lint rule (the repo already ships custom rules under `eslint-rules/`, so this is not a new linter) flags raw
`<svg>` outside the kernel.

#### Flow
- Build the kernel plus a port of the 4 FAQ illustrations (`faqIllustrations.tsx`). Light-theme and `de` screenshots prove the bet.
- Port the 13 text-bearing scenes; their strings land in `en.ts` plus 13 locales.
- Add a lint rule ratchet: count raw-svg files outside the kernel, and only allow it to fall.

#### Expected impact
Light-theme and non-English visitors stop seeing ghost or English art; new scenes cost less. Measure the
convention-conformance count per SVG file. Risk: a kernel too rigid for bespoke compositions, so keep an
escape hatch.

#### Evaluation
Claim: quality - art is theme, locale and motion correct by construction
Before: 13 text-bearing SVG files, 5 translated; 9 raw-hex files; 4 of 60 focusable.
After: every kernel scene translated, themed and still-posed; the raw-svg ratchet trends to 0.
Method: simulation - walked (a) `ShieldIllustration` on `light-news`: today white-on-white at 0.2 alpha; (b) the same in `ja`: English labels; (c) `HealthyShieldIllustration` under reduced motion: SMIL orbit keeps moving (doc gotcha). Falsified if porting a hero-scale scene to the kernel costs more than rewriting it.
Result: unmeasurable
Gate: architecture

#### First experiment
Build `<Scene>` + `<Label>` + `brandFill()` and port `ShieldIllustration`. Screenshot it on `light` and with the
switcher enabled in `cs`.

#### Evidence
- `src/components/illustrations/ShieldIllustration.tsx:22-25`, `AgentGridIllustration.tsx:27` - English text in white rgba.
- grep over `src/components`: 60 svg files; 19 BRAND_VAR, 9 raw hex, 13 `<text>` (5 i18n), 8 transformBox, 4 SVGFocusRing.
- `src/lib/brand-theme.ts:26` - BRAND_VAR, the existing theming seam.

### 8.3B · Every demo ends in something you own: terminal transcripts hand off to the desktop app
**Slot:** experience  ·  **Size:** M  ·  **Effort:** 5/10  ·  **Impact:** 8/10  ·  **Risk:** 4/10  ·  **Gate:** contract

#### Summary
The site's terminals end with a "Generated agent.config" printed as ASCII art. Make that output a real artifact.
Each transcript carries a typed payload, and the `TerminalPanel` footer offers "Open in Personas" and "Copy
config". The visitor goes from watching an agent being built to having it in their app.

#### Description
`TerminalOutputLine` is display-only (`text`, `color`, `indent`, `delay`; `src/components/primitives/terminal/types.ts:12-20`).
The flagship CLI showcase prints a config as box-drawing strings
(`src/components/sections/platform-command/data.ts:14-22`), so nothing in it can be taken away. The panel shell
already has the slot for an action row: `TerminalPanel` exposes `header`/`footer` (doc; `primitives/TerminalPanel.tsx:70`).

The only web-to-app handoff today is wrong. `TemplateDetail.tsx:89` fires `personas://template/<id>`. The
desktop's deep-link router handles `auth/callback`, `share`, `import/<slug>`, `ref/<code>` and `pair`
(`../personas/src-tauri/src/boot/deep_link.rs:19-61`, desktop repo), and has no `template/` branch. The click
therefore opens the app and does nothing. The fallback modal fires only if the app is absent
(`TemplateDetail.tsx:82-100`).

The moonshot:
- extend the terminal type with an optional `artifact: { kind: "gallery-slug" | "share-url" | "config", value }`;
- add a footer action row that resolves to `personas://import/<slug>` (handled by the desktop) or a copyable config;
- fix the template deep link onto that same contract;
- use the existing `ref/` route to carry attribution, so a demo that converts is credited.

#### Flow
- Repoint `TemplateDetail` to `personas://import/<slug>` (or add a desktop `template/` branch). That makes the one existing handoff work.
- Add `artifact` to `TerminalOutputLine` plus an "Open in Personas" footer on platform-command, mapped to a gallery slug.
- Roll out to playground `TerminalSim` and flow-composer, with a Copy-config fallback for visitors who don't have the app.

#### Expected impact
Prospects leave demos with a running agent instead of a memory of one. Measure deep-link clicks per demo view,
and successful imports via the `ref/` code. Risk: a gallery slug that is missing from the desktop catalog fails
silently on the app side.

#### Evaluation
Claim: user - a demo converts into an owned agent
Before: 0 of 8 terminal-consuming surfaces offer a handoff; the 1 existing deep link targets an unrouted path.
After: every terminal surface ends in an import or copy action that resolves to a handled route.
Method: simulation - walked (a) platform-command "email triage" demo: today ASCII only, then Open in Personas imports a gallery persona; (b) template detail: today the app opens with no effect, then it imports; (c) no app installed: the existing fallback modal applies. Falsified if gallery slugs for the showcased demos do not exist on the desktop.
Result: unmeasurable
Gate: contract

#### First experiment
Change `TemplateDetail.tsx:89` to `personas://import/<id>` against a local desktop build, and confirm the
`GALLERY_IMPORT_REQUESTED` path imports it.

#### Evidence
- `src/components/primitives/terminal/types.ts:12-20` - display-only line type.
- `src/components/sections/platform-command/data.ts:14-22` - config shown as ASCII art.
- `src/app/templates/[id]/TemplateDetail.tsx:89` - `personas://template/` deep link.
- `../personas/src-tauri/src/boot/deep_link.rs:19-61` (desktop repo) - handled routes; no `template/`.
- grep: 8 non-primitive files consume TerminalPanel/History/Line.

---

## Dashboard Shell, Chrome & Realtime
The frame around `/dashboard/*`: navbar, the 15-item nav registry, scope bar, error boundary, skeletons, and a realtime hook that only runs in live Supabase mode. files=20 (18 still exist)

### 8.4A · A demo that is alive: a seeded fleet simulator behind the real realtime seam
**Slot:** structural  ·  **Size:** L  ·  **Effort:** 6/10  ·  **Impact:** 8/10  ·  **Risk:** 4/10  ·  **Gate:** architecture

#### Summary
Feed the demo through the same change-event path the live product uses. A seeded, deterministic simulator emits
`synced_*`-shaped INSERT/UPDATE events, so the demo visibly runs: executions start and finish, reviews arrive and
Athena announces them, and badges move.

#### Description
The realtime layer is the dashboard's best-engineered liveness path, and demo visitors never see it run.
`useSyncedRealtime` returns early unless `IS_SUPABASE && isAuthenticated && !isDemo`
(`src/hooks/useSyncedRealtime.ts:28,105`). The table-to-store refetch map (`:77-100`) and the new-review voice
signal (`:57-75`, consumed via `SyncedRealtimeProvider.tsx:17`) are therefore dark in the only mode this repo
ships. The demo is a static world served by `mockApi` (394 lines) over roughly 3,200 lines of fixtures. Badges
are constants: `MOCK_UNREAD_MESSAGES = 7` (`src/lib/mock-dashboard-data.ts:1141`). The shipped
`home-living-demo-clock` direction made timestamps age; this goes further and makes events happen.

The moonshot is a `demoRealtime` source with the same interface as the Supabase channel (`on(table, handler)`).
A seeded scenario script (mulberry-style PRNG plus a timeline) mutates the mock collections that `mockApi`
already mutates (`src/lib/mockApi.ts:180,200`) and emits payloads in the `postgres_changes` shape. The existing
debounced refetch and `maybeAnnounceNewReview` run unchanged. Registry `demo-data-plane` names this pair of
techniques: `network-faithful-mocks` and `seeded-determinism`.

The simulator ticks only through `resolveTicker` (tab hidden or panel off-screen means paused), which respects
the motion and visibility law. Works for both shells, and fits the `dashboard/spa` branch unchanged, because it
sits under the stores.

#### Flow
- Make the realtime hook take a channel factory (Supabase or demo). The demo emits one review INSERT 20s after entry, and the voice announces it. That proves the seam.
- Scenario timeline: a run lifecycle, a healing incident, a message.
- Seed in the URL (`?seed=`) so tours and screenshots are reproducible.
- The tour narration cues off scenario beats instead of fixed copy.

#### Expected impact
Demo visitors see orchestration happen, not a still life. Measure demo dwell time and the share of sessions that
reach an approval. Risk: the scenario contradicts fixture counts (the "one fleet truth" lesson), so derive from
one fleet.

#### Evaluation
Claim: user - the demo behaves like the product
Before: 0 realtime events in demo mode; voice announcer unreachable; message badge constant 7.
After: 1 or more scripted events per ~20s while visible, through the production refetch path.
Method: simulation - walked (a) visitor idles on Overview for 60s: today nothing changes, then a run completes and a review arrives with voice; (b) tab hidden: the ticker pauses, nothing is missed on return because it is a seeded replay; (c) live mode: untouched, same hook with the Supabase factory. Falsified if the refetch-per-event cost janks the demo at the planned rate.
Result: unmeasurable
Gate: architecture

#### First experiment
In demo mode, `setTimeout` one `emitNewReview` plus a `fetchReviews` 20s after entry. Watch whether the badge,
the queue and the voice react together.

#### Evidence
- `src/hooks/useSyncedRealtime.ts:28,105` - realtime gated off in demo.
- `src/hooks/useSyncedRealtime.ts:57-100` - refetch map and review signal, reusable as is.
- `src/lib/mock-dashboard-data.ts:1141` - constant badge source.
- `src/lib/mockApi.ts:180,200` - mock collections are already mutable.

### 8.4B · The dashboard as an addressable instrument: one action registry for a command palette and for agents
**Slot:** experience  ·  **Size:** L  ·  **Effort:** 6/10  ·  **Impact:** 7/10  ·  **Risk:** 5/10  ·  **Gate:** direction

#### Summary
Make every dashboard view and scope a typed action, for example "Executions, persona X, last 7d, compare" or
"Open SLA". Expose the actions to people through a Cmd-K palette and to agents through a machine-readable tool
surface (WebMCP where supported). An agent-orchestration company's dashboard should be drivable by an agent.

#### Description
The shell already holds the vocabulary, in scattered form:
- `navItemDefs` is a typed registry of 15 destinations with a `scoped` flag (`src/components/dashboard/DashboardNavigation.tsx:35-51`), which the layout derives its scope list from (`src/app/dashboard/layout.tsx:14-18`).
- `useDashboardFilterStore` holds `personaId`, `dateRange` and `compareEnabled`, with defensive parsing of untrusted input (`src/stores/dashboardFilterStore.ts:8-40`).
- The SPA branch puts the view in the URL plus `?dim=` (`93c322d`).

There is no command palette (grep for palette/cmdk returns 0). Keyboard access is per-page: Escape handlers in
`DashboardScopeBar.tsx:46` and `Modal.tsx:49`.

The moonshot is a `dashboardActions` registry derived from `navItemDefs` plus filter setters plus per-view verbs
(approve focused review, open incident). Each action has a typed param schema, an i18n label and a
`run(params)`. It powers two things:
1. A Cmd-K palette. It is reachable on `/m` too, as a sheet.
2. Tool registration for in-browser agents, using the experimental WebMCP `navigator.modelContext` when present, and otherwise a `window.personas.actions` JSON manifest. The tools are deterministic with no LLM call; the visitor's own agent does the talking.

Constraint note: no LLM route is added; strings ×14.

#### Flow
- Build the registry from `navItemDefs` plus filter setters, and a palette with 15 navigate actions and 3 scope actions. The bet is proven if keyboard-only navigation of the tour path succeeds.
- Add per-view verbs (review approve/reject via `reviewStore`).
- Register WebMCP tools behind feature detection, and demo it in the guide: "ask your browser agent to find failing agents".

#### Expected impact
Power users gain speed, demo visitors with browser agents see Personas speak their protocol, and
accessibility improves through a single keyboard entry point. Measure palette usage per session and
agent-invoked actions. Risk: WebMCP is pre-standard, so the manifest fallback carries the bet.

#### Evaluation
Claim: user - every view and scope is reachable by name, by hand or by agent
Before: 0 named-action entry points; reaching "SLA for persona X, 7d" takes 3+ pointer steps.
After: 1 palette command or 1 agent tool call.
Method: simulation - walked (a) keyboard user reaching Incidents: today 15 Tab stops through the rail, then 2 keystrokes; (b) browser agent asked "show this week's failures": today it scrapes the DOM, then calls `executions.filter({dateRange:"7d", status:"failed"})`; (c) a scope action on an unscoped view is rejected by the `scoped` flag. Falsified if WebMCP support stays at 0 shipping browsers through 2027.
Result: unmeasurable
Gate: direction

#### First experiment
Generate palette entries from `navItemDefs` (navigate only) on a dev flag. Time keyboard navigation through the
five tour stops against the rail.

#### Evidence
- `src/components/dashboard/DashboardNavigation.tsx:35-51` - typed nav registry with `scoped`.
- `src/app/dashboard/layout.tsx:14-18` - layout already derives behaviour from it.
- `src/stores/dashboardFilterStore.ts:8-40` - scope state with input validation.
- grep: 0 command palette implementations in `src/`.

---

## Layout, Navigation & Page Shell
The root document, the navbar (mounted per page), page and section shells, the desktop stage system, hash arrival, and the error/loading/404 boundaries. files=23 (21 still exist)

### 8.5A · A persistent site frame: navbar and footer mounted once, with route changes through React ViewTransition
**Slot:** structural  ·  **Size:** L  ·  **Effort:** 6/10  ·  **Impact:** 7/10  ·  **Risk:** 5/10  ·  **Gate:** architecture

#### Summary
Mount the chrome once in a route-group layout and stop remounting the whole site on every click. Replace the
pathname-keyed framer wrapper with React's `<ViewTransition>`, which Next 16 enables with no configuration.

#### Description
Every navigation tears down everything:
- `PageTransition` keys a `motion.div` on `usePathname()` (`src/components/PageTransition.tsx:39-52`), mounted at the root (`src/app/layout.tsx:117`). Each route change remounts the full tree.
- The navbar is not in a layout at all. It is mounted per page in 14 files under `src/app` (e.g. `page.tsx:74`, `blog/page.tsx:79`, `guide/layout.tsx:21`) plus `InfoPageLayout.tsx:39`. The footer is mounted in 12.
- So the header's entrance (`initial={{ y: -20, opacity: 0 }}`, `src/components/Navbar.tsx:69-71`) replays on every click, scroll-glass state resets (`:39-44`), and the open download/waitlist state is lost.
- The per-page mount also explains the open finding that Turbopack duplicates the Navbar module (~42 KB) into the `/guide` layout chunk.
- `usePathname` in the root layout is what project memory names as the blocker for Cache Components.

This card does not propose Cache Components. Removing that blocker is a side effect, not the bet.

Next's bundled guide (`node_modules/next/dist/docs/01-app/02-guides/view-transitions.md`) states that view
transitions "work in the App Router with no configuration". Navigations are transitions, so a named
`<ViewTransition>` around the main area crossfades or slides, while the frame persists as a real DOM node.

The moonshot:
- a `src/app/(site)/layout.tsx` route group (URLs unchanged) owns `Navbar`, `Footer` and the `--nav-h` spacer;
- `PageTransition` is deleted;
- reduced motion is honoured in the view-transition CSS (`::view-transition-*` under `prefers-reduced-motion`), so it stays out of JS, which honours the hydration lesson in `PageTransition.tsx:20-37`.

The `dashboard/spa` branch already stopped keying `/dashboard/*` on the full pathname (`cee0ab7`); this extends
the same reasoning to the site.

Constraint bent: page files move under `src/app/(site)/`. Paths are unchanged, but CLAUDE.md asks for
confirmation on route-tree changes.

#### Flow
- Move `/`, `/features` and `/roadmap` into `(site)`, with the navbar in the group layout. Measure navbar remounts per navigation (React Profiler), expecting 0.
- Replace `PageTransition` with `<ViewTransition>`, and rerun `reduced-motion-hydration.spec.ts`.
- Migrate the rest, then delete the per-page `<Navbar />`/`<Footer />` mounts and re-baseline the bundle budget.

#### Expected impact
Navigation feels like an app: the header stays put and state survives. Measure INP on navbar clicks and the
`/guide` chunk size. Risk: pages with bespoke chrome (`error.tsx`, `not-found.tsx`) need an opt-out group.

#### Evaluation
Claim: performance - navigation stops rebuilding the frame
Before: 1 full-tree remount per navigation; Navbar mounted at 15 sites; Footer at 12; navbar entrance replays every click.
After: 0 frame remounts; 1 Navbar and 1 Footer mount site-wide; the `/guide` duplicate chunk is gone.
Method: simulation - walked (a) Home to Features: today header slides in again and scroll-glass resets, then the header persists; (b) open waitlist then navigate: state is lost today, kept after; (c) reduced motion: CSS-only, no JS branch. Falsified if Safari's view-transition differences break the stage layout.
Result: unmeasurable
Gate: architecture

#### First experiment
On a branch, move `/roadmap` into `(site)` with the navbar in the group layout. Record the React Profiler
commits for Home to Roadmap to Home.

#### Evidence
- `src/components/PageTransition.tsx:39-52` and `src/app/layout.tsx:117` - pathname-keyed remount at the root.
- `src/components/Navbar.tsx:69-71` - entrance animation replays on each mount.
- grep: `<Navbar` in 14 files under `src/app`, plus `InfoPageLayout.tsx:39`; `<Footer` in 12.
- `node_modules/next/dist/docs/01-app/02-guides/view-transitions.md` - "work in the App Router with no configuration".

### 8.5B · Keynote mode: the stage-fit site plays as a narrated, keyboard-driven pitch deck
**Slot:** experience  ·  **Size:** M  ·  **Effort:** 4/10  ·  **Impact:** 7/10  ·  **Risk:** 3/10  ·  **Gate:** direction

#### Summary
The site is now one section per viewport at every desktop size. Add a present mode on top of that: arrow keys
step section by section, `?present` hides the chrome, each slide has a URL, and Athena's existing narration can
voice it. The founder pitches on the live product site, and a visitor can sit back and watch it present itself.

#### Description
The stage system already guarantees slide geometry:
- `[data-stage="fill"]` is exactly `100svh - --nav-h` (`src/styles/stage.css:29-30,60-61`);
- it is active at `min-width: 64rem` and `min-height: 37.5rem` (`:44`), with snap alignment per section (`:49,58`);
- `e2e/stage-fit.spec.ts:20-32` checks 5 desktop viewports with `KNOWN_OVERFLOW = {}`, so no section spills.

Addressing is solved too:
- `resolveLandingAddress` maps any hash to a mountable section (`src/lib/landing-address.ts:72`);
- `startArrival` lands on lazily mounted sections reliably (`src/hooks/useHashArrival.ts:55`);
- the order is a registry (`src/lib/constants.ts:12-24`).

The tour stack (`PageShell.tsx:30-37`: `TourProvider` + `TourOverlay`; 17 narration MP3s in `public/tour`) can
voice beats. What is missing is a mode that treats this as a sequence: keys, a progress rail, chrome-off, and
auto-advance.

The moonshot is a `PresentController` mounted by `PageShell`:
- PageDown, arrow keys and Space call `startArrival` on the next `LANDING_SECTIONS` id;
- `?present` sets `data-present` (CSS hides the navbar, ScrollMap and cookie banner);
- `?present&narrate` plays each section's tour audio and advances on `ended`;
- `/features` gets the same treatment via its scroll-map items.

All motion follows the existing gates.

#### Flow
- Add key stepping plus `?present` chrome-off on `/` only. The bet is proven if a 10-minute live pitch runs from a browser tab.
- Add a progress rail and a slide URL (`#slide=n` resolves to `null` in `resolveLandingAddress`; use a distinct param).
- Add narrated auto-play using the tour audio and captions, with a pause on any user input via `isUserScrollIntent`.

#### Expected impact
Sales calls and conference talks run on the real product site; visitors get a guided lean-back mode. Measure
present-mode sessions and completion rate. Risk: sections designed for scrolling reveals may look static as
slides. Reuse `whileInView` and watch the late-mount gotcha.

#### Evaluation
Claim: user - the site doubles as the pitch deck
Before: 0 keyboard section stepping; presenting means manual scrolling with the chrome visible.
After: 11 landing sections stepped by key, chrome-off, each addressable; optional narration.
Method: simulation - walked (a) 1366x657 laptop projector: every section fits by the e2e guarantee; (b) jump to "Pricing" mid-talk: one URL; (c) section not mounted yet: `startArrival` handles the LazyMount wait. Falsified if snap plus arrival fights the key stepping (double scroll).
Result: unmeasurable
Gate: direction

#### First experiment
Add a 30-line keydown handler in `LandingHashArrival` that calls `startArrival(resolveLandingAddress("#"+next))`,
and present the landing once.

#### Evidence
- `src/styles/stage.css:29-30,44,49,58-61` - one-viewport sections with snap.
- `e2e/stage-fit.spec.ts:20-32` - 5 viewports, empty overflow list.
- `src/lib/landing-address.ts:72`, `src/hooks/useHashArrival.ts:55` - addressing plus landing on lazy sections.
- `src/components/PageShell.tsx:30-37` - tour provider plus overlay already on every shell page.

---

## Shared Types, Utilities & Hooks
The domain types (described as a "mirror"), formatters, validators, generic hooks, the scroll lock, and server env/request helpers. files=15

### 8.6A · One schema, three planes: generate types, row decoders and demo fixtures from the sync contract
**Slot:** structural  ·  **Size:** L  ·  **Effort:** 7/10  ·  **Impact:** 7/10  ·  **Risk:** 4/10  ·  **Gate:** architecture

#### Summary
Replace the hand-kept "mirror" with a generator. A single schema produces the web domain types, the Supabase row
decoders and seeded fixture factories, so the mock, live and API planes cannot drift.

#### Description
`src/lib/types.ts:2` claims it "mirrors personas-cloud/packages/shared/src/types.ts". A structural diff run for
this card disagrees. Of the 6 interfaces both files define, all 6 have drifted:
- `Persona` lacks `inferenceProfileId, networkPolicy, permissionPolicy, webhookSecret`;
- `WorkerInfo` has `currentExecutionId` where cloud has `currentExecutionIds` plus 6 more fields;
- `PersonaEvent` lacks retry fields.

Meanwhile the plane the web actually reads live is neither of these. It is the desktop sync DDL
(`scripts/setup-sync-db.sql`, 14 tables), decoded by 8 hand-written row interfaces and mappers in
`src/lib/supabaseApi.ts` (`PersonaRow :102`, `ExecutionRow :145`, `EventRow :190`, … `mapPersona :122`,
`mapExecution :166`). The demo plane is ~3,500 hand-typed lines (`mockApi.ts`, `mock-dashboard-data.ts`,
`mockData.ts`) that must agree with both. Two shipped directions (`home-one-fleet-truth`,
`home-living-demo-clock`) were clean-ups of exactly this drift.

The moonshot is a `scripts/generate-contract.mjs`, a precedent-shaped one-shot generator like
`scripts/generate-connectors.mjs:1-10`. It reads the sync DDL (the live source of truth) and emits:
1. `Row` types plus runtime decoders (hand-rolled guards in the style of `src/lib/validation.ts`, so no zod and no new dependency);
2. a `contract.ts` for the domain types;
3. seeded fixture factories that the mocks compose from.

A drift check in CI fails when the DDL changes and the generated file does not.

#### Flow
- Generate the `synced_manual_reviews` row type plus decoder, and diff it against `ManualReviewRow` (`:223`). Any mismatch found proves the bet.
- Generate all 14 tables; mappers consume decoded rows, and decode failures reach Sentry through the scrubber.
- Fixture factories: `mock-dashboard-data` builds from them, with `?seed=` determinism.
- Run the drift check in `ci.yml` beside the i18n checks.

#### Expected impact
Live-mode bugs from silent column drift surface as decode errors, and the demo cannot show shapes the product
lacks. Measure decode-failure count in Sentry and fixture lines that are hand-typed vs generated. Risk: the DDL
lacks semantic types (enums in CHECKs only), so the generator must parse CHECK lists.

#### Evaluation
Claim: quality - one source of truth for data shape
Before: 6 of 6 shared interfaces drifted from their declared source; 8 hand-written row decoders; ~3,500 hand-typed mock lines.
After: 0 hand-kept row types; drift is a CI failure, not a production surprise.
Method: simulation - walked (a) `df30dad` added `result_ref` and `synced_fleet_queue`: today a manual follow-up, then regenerate; (b) a desktop renames a column: today `mapPersona` silently yields `undefined`, then a decode error with the table name; (c) mock adds a field the DDL lacks: compile error. Falsified if the DDL cannot be parsed reliably without a SQL parser dependency.
Result: unmeasurable
Gate: architecture

#### First experiment
A 100-line script that parses the `create table` blocks in `setup-sync-db.sql` and prints the column sets. Diff
them against the 8 `*Row` interfaces.

#### Evidence
- `src/lib/types.ts:2` - claimed mirror; structural diff shows 6 of 6 shared interfaces drifted.
- `src/lib/supabaseApi.ts:102,145,190,223,270,755,840,959` - hand-written row interfaces.
- `scripts/setup-sync-db.sql:37-349` - the live schema (14 tables).
- `scripts/generate-connectors.mjs:1-10` - generator precedent in this repo.

### 8.6B · Bring your own fleet: drop a desktop export into the web dashboard, parsed locally and never uploaded
**Slot:** experience  ·  **Size:** M  ·  **Effort:** 5/10  ·  **Impact:** 7/10  ·  **Risk:** 5/10  ·  **Gate:** contract

#### Summary
Add a third, local data plane. A visitor drags the desktop app's portability bundle onto `/dashboard`, the
browser validates and normalizes it in memory, and the dashboard renders their real personas, teams, tools and
KPIs. No account is needed and nothing is uploaded.

#### Description
The data plane is already pluggable at one point. `api` is a `Proxy` that dispatches each call to `mockApi`,
`supabaseApi` or `realApi` (`src/lib/api.ts:347-363`). Adding a `bundleApi` is a planned extension point,
not a rewrite. The boundary-validation discipline it needs exists in `src/lib/validation.ts:11,34` (ReDoS-safe,
type-guard style), alongside `sanitizeExternalUrl` for any URL found in a bundle.

The desktop already writes the file. `PortabilityBundle` (`format_version` 2/3) carries `personas`,
`tool_definitions`, `teams`, `kpis`, `dev_projects` and `workspaces` in clear. Credentials travel as metadata only
(`CredentialMetaExport`), and twins and Athena memory travel encrypted
(`../personas/src-tauri/src/commands/core/data_portability/types.rs:15-60`, desktop repo). So a local-only viewer
never touches a secret.

Today the only way to see your own agents on the web is a Supabase account plus the sync writer (live mode), and
the demo shows someone else's fleet. A "drop your bundle" mode bridges the two for evaluators, conference demos
and support ("send me your export"). It is privacy-preserving by construction (File API, in-memory, cleared on
reload).

Constraint note: still off the orchestrator, with no Supabase involvement. It needs a versioned contract with the
desktop's bundle format, and new UI strings ×14.

#### Flow
- Build `bundleApi` for `listPersonas`/`getPersona`, plus a drop zone on the demo entry; render the Agents view from a real export. That proves the bet.
- Add teams and KPIs to the team canvas and observability KPI cards; unsupported methods throw the same 501 as `supabaseApi`.
- Show the export's `export_warnings` surfaced as a banner, keeping the "what was dropped" honesty.
- Add a format-version guard plus a decoder (pairs with card A's generator).

#### Expected impact
Evaluators and existing users see their own fleet on the web in seconds. Measure bundle-drop sessions and their
conversion to waitlist/download. Risk: users may believe the file was uploaded, so the UI must say "stays in this
tab", and the network panel must agree.

#### Evaluation
Claim: user - see your own fleet on the web with zero setup
Before: 2 ways to see agents on the web: someone else's demo, or a Supabase account plus sync.
After: a third way: one file drop, 0 network writes.
Method: simulation - walked (a) a desktop user exports and drops it: personas render via the existing Agents view; (b) a bundle with encrypted twins: shown as "encrypted, not displayed"; (c) a v1 bundle: rejected with a version message. Falsified if the bundle lacks enough runtime data (no executions) to make the dashboard compelling.
Result: unmeasurable
Gate: contract

#### First experiment
Load a real export JSON in a dev page through a hand-written decoder for `personas[]`, and count how many Agents
view fields can be filled.

#### Evidence
- `src/lib/api.ts:347-363` - runtime plane dispatch Proxy.
- `src/lib/validation.ts:11,34` - boundary validator style to extend.
- `../personas/src-tauri/src/commands/core/data_portability/types.rs:15-60` (desktop repo) - bundle shape; credentials metadata-only, twins and Athena encrypted.
- `../personas/src-tauri/src/commands/core/data_portability/export.rs:438-440` - `format_version: 2` and `app_version` stamped.

---

## Theme System
Eleven CSS-variable themes, a persisted store, a pre-paint script, and the brand token helpers. files=7

### 8.7A · A theme compiler: seeds in, then every variant, the pre-paint list and contrast proofs out
**Slot:** structural  ·  **Size:** M  ·  **Effort:** 5/10  ·  **Impact:** 6/10  ·  **Risk:** 4/10  ·  **Gate:** architecture

#### Summary
Generate the 11 themes from one seed table (hue, chroma and a light/dark mode per theme in OKLCH). The output is
full-coverage token blocks, the inline-script id lists, the store registry and a contrast report. Hand-maintained
partial overrides stop being possible.

#### Description
Coverage is uneven by hand:
- `src/styles/tokens.css` defines 60 tokens.
- The `themes.css` blocks override 21-25 each, and five dark themes (`dark-cyan`, `-bronze`, `-frost`, `-purple`, `-pink`) re-skin only 2 of 6 brand colours. So `text-brand-rose` on Bronze is Midnight's rose (doc gotcha, confirmed by count).
- Light themes need 74 `!important` remaps of enumerated `white/N` steps. Any step not listed stays invisible.
- The theme list lives in four places that must agree by hand: the `ThemeId` union and `THEMES` (`src/stores/themeStore.ts:4,24-35`), the inline script's `T`/`L` arrays (`src/app/layout.tsx:102`), `themeKeyMap`, and `SWATCH_PATTERNS` (`src/components/ThemeSwitcher.tsx:15,29`).

The moonshot is `scripts/generate-themes.mjs`, following the in-repo generator precedent:
- `themes.seed.json` holds a seed per theme plus explicit overrides;
- OKLCH ramps produce all 60 tokens per theme;
- light themes get generated glass tokens instead of `!important` class remaps;
- it emits `themes.generated.css` and a `theme-registry.ts` (ids, light set, primary);
- `layout.tsx`, a server component, interpolates that registry into the inline script, so it is no longer a hand copy;
- a vitest pass asserts APCA/WCAG contrast for `foreground`/`muted`/brand-on-background in every theme.

`tokens.css` stays the desktop-shared base (doc: drift-checked with personas-desktop).

#### Flow
- Generate `dark-bronze` only and diff it against the hand block; brand coverage goes from 2/6 to 6/6, which proves the bet.
- Generate all themes, delete the hand blocks, and run the contrast test.
- Interpolate the registry into the pre-paint script.
- Optionally emit the same seeds for the desktop app.

#### Expected impact
Every accent re-skins in every theme, and adding a theme becomes one seed plus i18n keys. Measure brand-token
coverage per theme and the contrast failures caught. Risk: generated palettes lose the hand-tuned character of
Matrix and News, so overrides must stay first-class.

#### Evaluation
Claim: quality - full, proven token coverage per theme
Before: 5 of 10 non-default themes re-skin 2/6 brand colours; 74 `!important` light remaps; theme list kept in 4 places.
After: 10/10 themes at 6/6; 0 remaps; 1 registry; contrast asserted in CI.
Method: simulation - walked (a) `text-brand-rose` on Bronze: today default rose, then a generated bronze-family rose; (b) adding a 12th theme: today edits in 5 files plus CSS, then 1 seed plus i18n; (c) `bg-white/[0.07]` on light: today invisible, then a generated glass token. Falsified if generated ramps fail brand review for more than 3 themes.
Result: unmeasurable
Gate: architecture

#### First experiment
Generate an OKLCH six-brand ramp for Bronze, inject it via devtools on `/features`, and screenshot it next to
today's.

#### Evidence
- `src/styles/themes.css` - per-theme override counts 21-25; 5 dark themes at 2/6 brands; 74 `!important`/white remap lines.
- `src/styles/tokens.css` - 60 canonical tokens.
- `src/stores/themeStore.ts:4,24-35`, `src/app/layout.tsx:102`, `src/components/ThemeSwitcher.tsx:15,29` - the 4-way hand sync.

### 8.7B · "See Personas in your brand": the visitor's colour re-skins the site and the demo, shareable by link
**Slot:** experience  ·  **Size:** M  ·  **Effort:** 4/10  ·  **Impact:** 7/10  ·  **Risk:** 4/10  ·  **Gate:** direction

#### Summary
Let a prospect paste a brand hex (or pick from their logo). The whole site, including the demo dashboard,
re-themes live, and `?brand=` carries it in a link they can send to their team: "this is what our agent ops
console would look like".

#### Description
The architecture already allows this; only the theme source is closed. Every surface paints from CSS variables:
- `BRAND_VAR` and `tint()` are used in 128 TSX files (`src/lib/brand-theme.ts:26`);
- the `@theme inline` map is in `globals.css`;
- switching is one attribute (`applyThemeToDOM`, `src/stores/themeStore.ts:43`);
- the pre-paint script can apply state before first paint (`src/app/layout.tsx:100-104`).

But themes are a closed 11-id union (`themeStore.ts:4`), and the switcher picks among them only. Today a first
visit even gets a random theme (doc).

The moonshot adds a `custom` theme whose tokens are computed client-side from a seed. It uses the card A compiler
function when that exists, and before that a minimal OKLCH mapping of the six brand tokens plus background tint.
The tokens are written as inline custom properties on `<html>`. `?brand=0e7490` is read by the pre-paint
script, so a shared link renders branded from first paint. The switcher gains an "Your brand" swatch with a
colour input, and a contrast guard refuses seeds that fail AA for body text.

What will not follow: 9 SVG files with raw hex and `GlowCard`'s hex accents. The card measures that leak and
pairs it with the scene-kernel card.

#### Flow
- `?brand=` sets the six `--brand-*` vars pre-paint, then the dashboard demo is screenshotted in 3 real brands.
- Add the switcher swatch plus colour input plus contrast guard (strings ×14).
- Add a "Share this view" link that includes the brand; analytics on brand-link opens.

#### Expected impact
Sales conversations get a personalized artifact, and prospects forward it internally. Measure brand-link creation
and opens per created link. Risk: low-contrast seeds and raw-hex leftovers make the site look broken in someone's
brand, so the guard plus the leak count matter.

#### Evaluation
Claim: user - prospects see their own brand on the product
Before: 11 fixed themes; 0 custom; first visit random.
After: any AA-passing seed, from first paint via link; leak surface measured (9 raw-hex SVG files plus GlowCard).
Method: simulation - walked (a) prospect pastes a teal: brand tokens re-skin 128 consumer files; (b) a shared link opened by a colleague: pre-paint applies it, no flash; (c) a yellow seed on light: the contrast guard refuses or darkens it. Falsified if more than 20% of visible accents on Home stay on fixed hex.
Result: unmeasurable
Gate: direction

#### First experiment
Add 6 lines to the pre-paint script that set `--brand-cyan`/`--brand-purple` from `?brand=`. Screenshot `/` and
`/dashboard/home` in three company colours and count the elements that do not change.

#### Evidence
- `src/lib/brand-theme.ts:26` - BRAND_VAR seam; grep shows 128 TSX files use `BRAND_VAR`/`tint(`.
- `src/stores/themeStore.ts:4,43` - closed union; single DOM apply point.
- `src/app/layout.tsx:100-104` - pre-paint application precedent.
- grep: 9 SVG component files with raw hex (the known leak).

---

## Internationalization (14 locales)
A typed `en.ts` source, 13 lazily loaded locales merged over English, and switching gated off in production. files=16

### 8.8A · A per-key hash-pinned UI catalog, translated and re-verified by a Personas agent team
**Slot:** structural  ·  **Size:** L  ·  **Effort:** 7/10  ·  **Impact:** 8/10  ·  **Risk:** 5/10  ·  **Gate:** architecture

#### Summary
Give every UI key the provenance the guide content already has: a source hash per key, a per-locale ledger of
status (current, stale, pending or identical), and an agent pipeline that drains it. Personas would be translating
its own site, with numbers to show for it.

#### Description
The guide has a hash-pinned pipeline:
- `scripts/i18n/emit-source-hashes.mjs:1-6` bakes topic hashes into each locale's `_meta.json`;
- `guide-drift.mjs` and `check-guide-translations.mjs` detect re-translation needs;
- `translate-guide-subagent-prompt.md` drives subagents.

The UI catalog, which every page renders, has none of this. `check-i18n-coverage` is a shape check: it reports
"100% across 13 locales" while 836 keys in 17 namespaces are English-only by decision (`PENDING_TRANSLATION`,
`src/i18n/en.ts:2811`). That is 10,868 locale-key pairs `not-compared` (`report-identical-values`). When an
English value changes, the old translation stays and passes every check, because only shape is compared. At
runtime, `deepMerge` (`src/i18n/useTranslation.ts:29`) silently fills any gap with English. Item 17 in the ship-loop
backlog is a one-time repair. This card is the mechanism that keeps the catalog repaired. Registry subject
`hash-pinned-translation-pipeline` governs it.

The moonshot has three parts:
- A generated `i18n-ledger.json` with key, en hash and per locale `{hash, status}`, maintained by an extension of the guide scripts.
- A CI ratchet on stale and pending counts.
- An agent pipeline (a Personas team: translator, then native-reviewer persona, then the human HITL queue for low-confidence strings), fed only stale or pending keys, with glossary and `accepted-term` rules from `identical-values-lib.mjs`.

Graduating a `PENDING_TRANSLATION` namespace becomes "the ledger shows 0 pending for it in 13 locales".

#### Flow
- Build the ledger for one namespace (`errorBoundary`), editing one English value. CI flags 13 stale pairs today and catches 0, which proves the bet.
- Build the ledger for the whole catalog plus the ratchet in `ci.yml`.
- Run the agent pipeline on one pending namespace across 13 locales, with reviewer scores logged (`translation-quality-measurement`).
- Write the case study for the blog: "Personas translated personas.so".

#### Expected impact
Locales become trustworthy enough to turn the switcher on, and the site demonstrates the product. Measure
stale and pending pairs over time, and reviewer acceptance rate. Risk: the files are mojibake on disk (project
memory), so the ledger must hash decoded values, not bytes.

#### Evaluation
Claim: quality - translation freshness is measured per key
Before: 0 per-key pins in the UI catalog; 10,868 pairs not compared; changed-English staleness is undetectable.
After: every pair carries a status; stale and pending is a CI number that only falls.
Method: simulation - walked (a) edit `t.nav.features` in en: today 13 stale translations pass CI, then 13 stale flags; (b) graduate `pricingSection`: today a manual multi-file edit, then a pipeline run plus review; (c) an identical-to-English brand term: `accepted-term` keeps it green. Falsified if agent translations fail native review more than ~30% of the time for any script family.
Result: unmeasurable
Gate: architecture

#### First experiment
Extend `report-identical-values.mjs` to emit per-key en hashes for one namespace, and store them in a ledger.
Change one English string and show the stale detection.

#### Evidence
- `scripts/i18n/emit-source-hashes.mjs:1-6` - guide-only hash pinning.
- `src/i18n/en.ts:2811` - `PENDING_TRANSLATION`; coverage run: "836 keys in 17 namespaces", "100% across 13 locales".
- `report-identical-values` run: total not-compared 10,868; 77 keys identical in all 13.
- `src/i18n/useTranslation.ts:29` - silent English fallback via `deepMerge`.

### 8.8B · In-context translation mode: native speakers fix strings on the page they are reading
**Slot:** experience  ·  **Size:** M  ·  **Effort:** 5/10  ·  **Impact:** 6/10  ·  **Risk:** 5/10  ·  **Gate:** policy-loosen

#### Summary
Add a `?translate` mode. Every translated string on the page becomes inspectable: its key, English source,
current translation and status. A native-speaking visitor can propose a fix in place, and the proposal enters the
same review queue the product uses for agents.

#### Description
Thirteen locales ship dormant (`LANGUAGE_SWITCHER_ENABLED`, `src/stores/i18nStore.ts:41`). The owner cannot
read most of them, and the files themselves are known-corrupted on disk (project memory). Quality judgment needs
native eyes, and native visitors have no way to help. All UI strings flow through one hook: `useTranslation`
returns `t` (`src/i18n/useTranslation.ts:50`, used by ~260 files). Wrapping `t` in a recording `Proxy` in
translate mode can tag every rendered string with its key path, with no component edits. The roadmap already has
a public, rate-limited submission pattern (`src/app/api/feature-requests`, `getClientIp`/`parseJsonBody` in
`src/lib/server/request.ts`), and the review-queue UI is the product's own (`ReviewsFocusFlow`).

The moonshot:
- translate mode (behind the switcher gate) overlays key chips;
- clicking one opens a sheet with en source, the current value, status (from card A's ledger when present) and "suggest";
- suggestions go to a `translation_suggestions` store;
- the owner's admin view triages them through a reviews-style focus flow;
- accepted suggestions are written into the locale file by a script, with the ledger re-pinned.

Constraints bent: a new Supabase table (schema), a public write endpoint (rate limiting is per-instance today,
backlog #13), and new UI strings ×14.

#### Flow
- Recording-`t` Proxy plus key chips in dev only. The bet is proven if a German speaker finds 10 bad strings in 15 minutes.
- Add the suggestion sheet plus storage (file store in dev, Supabase guarded by `hasSupabaseEnv`).
- Add admin triage in a reviews-style flow, and an accept-to-file script.
- Credit contributors on a `/legal`-adjacent acknowledgements block.

#### Expected impact
The dormant locales get native verification without a vendor, and the community gets a reason to engage. Measure
suggestions per locale and the acceptance rate. Risk: spam or vandalism, so suggestions are never auto-applied.

#### Evaluation
Claim: user - native speakers can verify and fix the locales
Before: 0 in-context paths; locale review means reading mojibake TS files.
After: every rendered string is inspectable and suggestible on its page.
Method: simulation - walked (a) a Czech visitor spots a wrong term in the navbar: today no channel, then a 2-click suggestion; (b) a string from a pending namespace: shown as "not yet translated, propose one"; (c) a hardcoded English string (not via `t`): it shows no chip, which itself maps the ~400 untranslated TSX files. Falsified if traffic from native speakers on the gated preview is too thin to matter (under ~5 suggestions per locale per month).
Result: unmeasurable
Gate: policy-loosen

#### First experiment
In dev, wrap `t` in a Proxy that records accessed paths, and render them as `data-i18n-key` attributes. Count the
strings and keys on `/` and list the visible strings with no key.

#### Evidence
- `src/i18n/useTranslation.ts:50` - single hook all UI strings pass through.
- `src/stores/i18nStore.ts:41` - switcher gate (locales dormant in prod).
- `src/lib/server/request.ts` - `getClientIp`/`parseJsonBody` for a public submission route.
- docs/features/platform/internationalization.md - ~260 of ~670 TSX use `useTranslation`.
