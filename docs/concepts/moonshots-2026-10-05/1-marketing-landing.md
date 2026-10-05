# Moonshot-architect sweep - Marketing & Landing (5 contexts, 10 cards)

Scout notes, read first:
- Anchors are on committed HEAD unless marked. The working tree has an uncommitted landing revamp that deletes `Hero.tsx`/`HeroClient.tsx`, `use-cases/data.ts` and `preview/lab.ts`, so their anchors are cited as `HEAD:` blobs. Uncommitted files are named only as signals, marked `(WIP)`.
- Desktop-repo anchors are prefixed `(desktop)` and are paths in `C:/Users/kazda/kiro/personas`.
- `context-map.json` is stale for two of these contexts. "Why Agents & Use Cases" lists 22 files, but `why-agents/*`, `testimonials.ts`, `AgentArmyGrid` and the rest no longer exist (`git ls-files` shows none). "Homepage & Hero" lists the command-center files, but `page.tsx` now mounts `HeroAmbientIllustration`.
- A side finding outside these contexts, confirmed in code: the web's only desktop deep link, `personas://template/<id>` (`src/app/templates/[id]/TemplateDetail.tsx:89`), has no branch in the desktop's handler (`(desktop) src-tauri/src/boot/deep_link.rs:19-71` handles only auth/callback, share, import/, ref/ and pair). Its ids also share 0 of 57 with the desktop catalog. The link silently does nothing.

---

## Guided Product Tour
Athena's chaptered overlay: spotlight, captions and ElevenLabs narration across home, /features, the demo dashboard and /roadmap. files=17

### 1.1A · Diagram-owned beats on a narration clock
**Slot:** structural  ·  **Size:** L  ·  **Effort:** 6/10  ·  **Impact:** 6/10  ·  **Risk:** 4/10  ·  **Gate:** architecture

#### Summary
Today the tour runs 23 cues on wall-clock timers and drives diagrams by scraping the DOM. Replace that with a cue track bound to the narration's own timeline (word timestamps from the TTS), and with beats that each diagram exports. Then pausing, buffering, a rewritten section or a second language cannot pull the voice and the picture apart.

#### Description
Every in-step action is `setTimeout(a.run, a.atMs)` from step entry (`src/contexts/TourContext.tsx:167-175`). `playing` is not a dependency, so pausing the voice does not pause the diagram. The 46 s dashboard sweep works the same way (`src/hooks/useTourSpotlightSequence.ts:24-35`). Audio start latency is never counted.

Actions reach into other components' DOM:
- `clickByText("Triage my Gmail")` (`src/lib/tour-script.ts:165`) matches the visible text of a translatable label (`src/i18n/en.ts:4973`).
- Trigger clicks go through `data-trigger-id` (`:176-179`).
- Ten platform-card toggles (`:191-226`) and lab tabs (`:288-291`) work the same way.

The WIP revamp is rewriting playground-split and orchestration-hub, so every section rewrite re-breaks the coupling. `tour-anchors.test.ts` catches a missing anchor but not timing. The generator reads only `en.ts` (`scripts/generate-tour-audio.mjs:12-17`), although the configured model is multilingual (`scripts/tour-audio.config.mjs:14-16`).

The moonshot has three parts:
1. Narration strings carry inline markers (`{beat:triggers.schedule}`), which the caption strips. The generator asks the TTS for character alignment and writes `<key>.cues.json`.
2. Diagrams register beats through context (`useTourBeats({ schedule: () => focus("schedule") })`) instead of being clicked.
3. The engine fires beats from `audio.currentTime`, using the rAF that `TourSpotlight` already runs. A virtual clock covers silent steps.

It reuses `useTourAudio`, the stall watchdog, the vm locale loader and `tour-anchors.test.ts`, which is extended to fail when a marker has no registered beat. Constraint: the markers live in `t.tour` across all 14 locales. Per-locale voice (13 x 17 clips) waits for the language switcher to ship.

#### Flow
- Gate step 3's actions on the audio clock and add an e2e test that pauses mid-step.
- Add a beat registry, then migrate orchestration and vision-grid off DOM clicks.
- Generator emits alignment, markers move into `t.tour`, and `atMs` is deleted.
- Per-locale clips when the language switcher ships.

#### Expected impact
Visitors who pause, or who are on slow networks, see the diagram act on the word that names it. Section authors can rewrite a diagram without breaking the tour. It is measured by an e2e assertion that nothing changes during a pause. What could break: alignment drift if narration copy changes without regenerating.

#### Evaluation
Claim: quality - narration and diagram never disagree.
Before: 23 wall-clock cues. Pausing 3 s into step 3: the clicks at 5/7.5/10 s still fire in silence. A 2 s audio start delay on the dashboard sweep: the spotlight leads the voice by 2 s. Step 2 under a non-en locale: the text match no-ops.
After: 0 wall-clock cues. A pause freezes beats. Beats do not depend on locale.
Method: simulation - walked the three cases above. Falsified if the provider's alignment is coarser than about 300 ms.
Result: better
Gate: architecture

#### First experiment
In `useTourAudio`, expose `currentTime`. Re-key step 3's four trigger clicks to it, gated on `playing`. Add a Playwright case that pauses at 3 s and asserts no trigger highlight changes.

#### Evidence
- `src/contexts/TourContext.tsx:167-175` - actions are scheduled at step entry, and `playing` is not in the deps.
- `src/hooks/useTourSpotlightSequence.ts:24-35` - the sweep cues are wall-clock too.
- `src/lib/tour-script.ts:165,176-179,191-226,288-291,319-325` - `grep -c "atMs:"` = 23.
- `scripts/generate-tour-audio.mjs:12-17,41` - the narration source is en.ts only. `public/tour/` holds 17 English mp3s.
- `scripts/tour-audio.config.mjs:14-16` - the multilingual model is already configured.

### 1.1B · Ask Athena: the tour becomes a conversation that drives the page
**Slot:** experience  ·  **Size:** XL  ·  **Effort:** 8/10  ·  **Impact:** 8/10  ·  **Risk:** 7/10  ·  **Gate:** policy-loosen

#### Summary
Let a visitor interrupt the tour with a question. Athena answers from the site's own corpus, with citations, and then acts: she spotlights the diagram, jumps to the guide topic and plays the beat. The tour engine becomes her tool surface. This is something only an agent-orchestration company would put on its own homepage.

#### Description
Today the tour is one-way. `TourCaptionCard` offers play/pause/prev/next/exit/volume and nothing else. A visitor with a question has two options:
- The FAQ, which has 4 entries (`src/i18n/en.ts:3111-3128`).
- Discord, whose invite is a placeholder (`src/lib/constants.ts:38-39`, ship-loop #7).

Meanwhile the site holds 109 guide topics (`src/data/guide/topics.ts`), translated into 13 locale folders. The engine already has the verbs an agent needs:
- Scroll (`useTourScroll`).
- Spotlight a selector (`TourSpotlight`).
- Cross-page navigation (`useTourNavigation`).
- Timed side effects (`TourAction`, `src/lib/tour-script.ts:46-51`).

The landing even simulates hold-to-talk (`src/components/sections/companion/index.tsx:17`).

The moonshot:
- A streaming `/api/athena` route over a build-time retrieval index (guide topics, FAQ, tour narration, changelog).
- Claude with tools `spotlight(diagramId)`, `goTo(route, anchor)`, `runBeat(id)` (card A's registry) and `cite(topicId)`. Tool calls execute client-side through `TourContext`.
- Answers come in the visitor's locale without 14-locale copy work.
- Questions it cannot cite become FAQ candidates, logged without the text's PII.

Constraints bent, stated plainly:
- This is the first model-calling route on the site, and it costs the owner money.
- `src/lib/server/rate-limit.ts` is in-memory per instance (ship-loop #13), so it needs a global daily budget kill switch.
- Questions are user text, so they must never reach Sentry extras.
- The site must disclose that questions go to Anthropic. The FAQ promises the app has zero telemetry (`en.ts:3117-3118`).
- Answers are public claims, so it answers only with a citation and otherwise refuses.

#### Flow
- Q&A box in the caption card, text only, retrieval over English guide content, cite-or-refuse, no tools.
- Add the `spotlight`/`goTo` tools, then the beats (needs card A).
- Log misses into a corpus-gap list.
- Voice: hold-to-talk in, streaming TTS out.

#### Expected impact
The prospect with a blocking question gets an answer in place, with the relevant diagram lit. It is measured by the share of tour sessions that ask, the citation rate, and download_click after an answer. What could break: a confident wrong answer about the product, or cost spikes from abuse.

#### Evaluation
Claim: user - a question asked mid-tour gets a cited answer plus the relevant diagram on screen.
Before: only the 4 FAQ entries can be answered on the page.
After: answers grounded in the 109 guide topics.
Method: simulation - walked three questions against the corpus:
- "Does it run on macOS?" - covered (`src/data/guide/content/getting-started.ts`).
- "Does my data leave my machine?" - covered (`credentials.ts`, `companion.ts`).
- "Is Pro enough or do I need Max?" - 0 guide files mention it. Athena must refuse, and the miss becomes a gap (feeds Features/Pricing card B).
Falsified if retrieval cannot cite at least 2 of these 3.
Result: better
Gate: policy-loosen

#### First experiment
A dev-only route that answers over `src/data/guide/content/*.ts` (English) with cite-or-refuse, wired to a text box in the caption card. Score 20 real prospect questions by hand.

#### Evidence
- `src/i18n/en.ts:3111-3128` - exactly 4 FAQ q/a pairs.
- `src/data/guide/topics.ts` - 109 topic ids. `src/data/guide/locales/` has 13 locale dirs.
- `src/lib/tour-script.ts:46-51,66-104` - the engine already models action, route, scroll and spotlight per step.
- `src/lib/constants.ts:38-39` - the Discord fallback is a placeholder invite.
- `grep -il "Max plan|Claude Max|Pro or Max" src/data/guide/content/*.ts` returns 0 files.

---

## Conversion: Get Started, FAQ & Footer
Bottom of the funnel: the get-started lifecycle art, the download CTA backed by the release authority, the FAQ, the footer, and hash arrival. files=29

### 1.2A · Release plane: the site reads the desktop's signed updater manifest
**Slot:** structural  ·  **Size:** M  ·  **Effort:** 5/10  ·  **Impact:** 7/10  ·  **Risk:** 4/10  ·  **Gate:** contract

#### Summary
Derive every download surface (per-platform availability, artifact URL, release date, notes) from the manifest the desktop's own updater already trusts. Releasing a Mac build would then flip the site's Mac pill without a code edit or a redeploy.

#### Description
`src/lib/release.ts` is an authority computed at build time:
- `DOWNLOAD_PLAN` is evaluated once from `NEXT_PUBLIC_DOWNLOAD_URL` (`:126-129`).
- macOS and Linux are hard-wired to `"waitlist"` whatever ships (`:111-118`).
- The badge shows the website's package.json version (`:133-144`, an open owner decision).
- The freshness pulse is env-dated, and its changelog path sits behind an off flag (`src/components/sections/DownloadCTA.tsx:31-36`).

The desktop's Tauri updater already publishes a signed `latest.json` on GitHub Releases (`(desktop) src-tauri/tauri.conf.json:60-64`). It carries per-platform artifact URLs, the version, `pub_date` and notes. The site and the updater can therefore disagree for as long as nobody edits env and redeploys.

The moonshot is a server-only `releaseManifest()`:
- Fetches `latest.json` with ISR, revalidating every ~10 min. github.com is already allowlisted (`release.ts:34-41`).
- Feeds `downloadPlan(manifest)` per platform. `/api/download?platform=` 302s to that platform's artifact.
- Flips pills to available when a darwin/linux key appears, and dates freshness from `pub_date`.
- Keeps env as override and kill switch.
- Reuses `resolveDownloadUrl`, the `DownloadPlan` shape, the `release.test.ts` source scan, and the `/#download` arrival fallback.

What it bends, stated plainly:
- It adds a runtime dependency on GitHub. On failure it falls back to the env plan.
- It sits next to the declined "show the desktop version" direction (challenge-2026-09-23 followup). The card keeps `SITE_VERSION` on the badge unless the owner flips it, and uses the manifest for availability only.
- It goes further than ship-loop #1 (a navbar decision): the plane makes the decision execute itself.

#### Flow
- Fetch the real `latest.json` and pin it as a fixture test.
- Map platform keys to installers. If the keys point at updater bundles, read the same release's asset list instead.
- Thread the plan to the navbar, hero, pricing and CTA as server props, with no client fetch.
- Per-platform `/api/download`.

#### Expected impact
Mac and Linux visitors get a real download the hour one ships. Releases need no web commit. It is measured as the lag between a GitHub release and the site offering it. What could break: if the manifest lists only updater bundles, the plane must fall back to the asset list.

#### Evaluation
Claim: resilience - site availability follows the shipped release automatically.
Before: 3 platforms, 1 env var. A Mac release changes 0 of 2 pills until `release.ts:115` is edited and redeployed.
After: 3 of 3 platforms follow the manifest within the revalidate window, with zero code edits per release.
Method: simulation - walked three cases:
- A release adds darwin-aarch64: the pill flips.
- GitHub returns 5xx: the env fallback serves and nothing goes down.
- An off-allowlist URL: `resolveDownloadUrl` refuses it.
Falsified if the manifest's macOS entry is only an `.app.tar.gz` update bundle and the release has no matching installer asset.
Result: better
Gate: contract

#### First experiment
Download the live `latest.json` and the release's asset list. Write `releaseManifest.test.ts` against that fixture, and render the derived plan on a dev-only preview.

#### Evidence
- `src/lib/release.ts:111-118` - `macos: "waitlist", linux: "waitlist"` unconditionally.
- `src/lib/release.ts:126-129` - the build-time env plan. `:133-144` - the site version, not the desktop's.
- `src/components/sections/DownloadCTA.tsx:31-36,100-117` - the CTA branches on the build-time plan.
- `(desktop) src-tauri/tauri.conf.json:60-64` - updater endpoint `github.com/xkazm04/personas/releases/latest/download/latest.json`.

### 1.2B · Install with your agent already inside: serve the desktop's gallery contract
**Slot:** experience  ·  **Size:** XL  ·  **Effort:** 8/10  ·  **Impact:** 8/10  ·  **Risk:** 6/10  ·  **Gate:** contract

#### Summary
The desktop already calls personas.ai for gallery import, publish, install counts and referrals, and personas-web serves none of those routes. Serve them, and the download CTA can carry the persona the visitor picked, so first launch opens on their agent instead of an empty app.

#### Description
The desktop side of the loop already exists:
- It handles `personas://import/<slug>` and `personas://ref/<code>` (`(desktop) src-tauri/src/boot/deep_link.rs:43-60`).
- Its gallery base URL defaults to `https://personas.ai` (`(desktop) src-tauri/src/commands/core/gallery.rs:38-44`), the same host as `SITE_URL` (`src/lib/seo.ts:3-4`).
- It calls `GET`/`POST /api/personas/{slug}` (`gallery.rs:144,166`), `/api/personas/publish` (`:107`), `/api/presets/publish` (`:277`) and `/api/referrals` (`:329`).

`src/app/api/` holds download, events, executions, feature-*, orchestrator, roadmap, stats, votes and waitlist, and none of the desktop's endpoints. The web's one deep link is dead (see the scout notes). So the CTA's own three steps, "download, connect Claude Code, launch agent" (`DownloadCTA.tsx:55-59`), hand nothing across the install.

The moonshot has three pieces:
1. A read-only `GET /api/personas/[slug]` serving bundles compiled from the desktop's real template catalog (Use Cases card A).
2. A "Download with this agent" CTA on use-case and template cards. The page stays open, the existing blur-based install detection (`TemplateDetail.tsx:82-102`) notices first launch, and the page offers `personas://import/<slug>`.
3. `/api/referrals` records which landing arm sent the install (Homepage card A). `imported` is the first step of the desktop's activation funnel (`(desktop) src/lib/analytics/activation.ts:31`).

What it bends:
- Install counters and referrals need a Supabase table, which is a schema change outside this repo. Owner call.
- `gallery_import_persona` requires sign-in (`gallery.rs:133-137`). Anonymous import of public bundles is a desktop contract change.
- Publish endpoints stay out of scope at first.

#### Flow
- `GET /api/personas/[slug]` for 1 bundle, plus a dev-desktop round trip.
- A "Download with this agent" CTA plus the first-launch continue prompt.
- Relax auth on the desktop for public imports.
- Referral and arm attribution.

#### Expected impact
A new user's first minute shows their own agent, not a blank canvas. That is measured by the share of installs whose first activation step is `imported`. What could break: if the visitor closes the tab during install, the handoff is lost and the experience degrades to today's.

#### Evaluation
Claim: user - first launch starts with the chosen agent.
Before: 6 desktop-to-site endpoints with 0 served. 1 web deep link, which the desktop does not handle. 0 personas carried through install.
After: import and referral are served. A visitor who picks Inbox Triage installs and lands on it after one confirmation.
Method: simulation - walked three cases: the tab kept open (works), the tab closed (degrades to today), and the user not signed in (blocked until the auth relaxation). Falsified if the desktop owner will not allow unauthenticated public import.
Result: better
Gate: contract

#### First experiment
Copy one desktop template JSON into a route `src/app/api/personas/[slug]/route.ts`, then open `personas://import/<slug>` against a dev desktop with `PERSONAS_WEB_URL=http://localhost:3001`.

#### Evidence
- `(desktop) src-tauri/src/commands/core/gallery.rs:38-44,107,144,166,277,329` - six endpoints on personas.ai.
- `src/lib/seo.ts:3-4` - `SITE_URL` defaults to `https://personas.ai`.
- `ls src/app/api` - no personas/, presets/ or referrals/.
- `src/app/templates/[id]/TemplateDetail.tsx:89` vs `(desktop) deep_link.rs:19-71` - the template link has no handler.
- `(desktop) src/lib/analytics/activation.ts:31` - `ACTIVATION_FUNNEL` starts with `imported`.

---

## Why Agents & Use Cases
The landing's persuasion section: at HEAD, one persona card that picks up jobs from 8 scripted tools. The WIP rewrites it as reels. Why-agents and testimonials are gone, so the map entry is stale. files=22 (map) / 8 (HEAD)

### 1.3A · One template truth: compile the use-case corpus from the desktop catalog
**Slot:** structural  ·  **Size:** L  ·  **Effort:** 6/10  ·  **Impact:** 7/10  ·  **Risk:** 4/10  ·  **Gate:** contract

#### Summary
Replace four hand-written use-case corpora with one compiled from the desktop's real template catalog. Every use case the site shows would then be an agent the product can actually import.

#### Description
Four corpora describe "what agents do":
1. `src/lib/templates.ts` hand-writes 57 `AgentTemplate`s. Their `config` is illustrative YAML such as `trigger: on_new_email` (`:18-32,48-58`), which the desktop cannot import.
2. `t.useCasesSection` hand-writes per-tool jobs, joined by `localizeTools` (`HEAD:src/components/sections/use-cases/data.ts:51-54`).
3. The WIP rewrite adds a copied connector slice (`use-cases/shared/catalog.ts` (WIP)).
4. The desktop's real catalog: 56 schema-v3 JSONs under `(desktop) scripts/templates/<category>/` (37 published). Each carries `persona`, `use_cases` recipe refs, `adoption_questions` and `connectors` (56 of 56).

The web and desktop lists share 0 ids. The hero's template count derives from the web's 57 "so a visitor can count the gallery" (`HEAD:src/components/sections/Hero.tsx:16-20`), but that gallery is not the product's.

The moonshot is a build-time compiler. It follows the zero-dependency loader pattern of `scripts/generate-tour-audio.mjs` and reads the desktop catalog at a pinned commit. It emits a slim, public-fields-only `use-case-corpus.json` with: id, name, description, category, connectors resolved to web connector names through `src/data/connectors.ts` category keys, triggers, and published state. The use-case reels, the hero count, the templates gallery, Use Cases card B and Conversion card B's `/api/personas` all project from it. A drift test with `verifiedAgainst` follows the `src/data/desktop-plugins.ts` precedent.

What it bends:
- `/templates/[id]` belongs to another context, and its ids are external links. Old ids need 308s to their closest match, which touches the route-path wall and needs confirmation.
- Desktop template prose is English. The corpus stays EN-pending, as `useCasesPersona` already is.
- The `persona` payload holds prompt-like identity, so it must never be emitted.

#### Flow
- Compiler script and a stack-fit table printed to the console.
- Landing reels and the hero count read the corpus.
- `/templates` migration with id redirects (other context, owner call).

#### Expected impact
Visitors are only ever sold agents the app ships, and "Run this" becomes possible (Conversion card B). It is measured as corpora 4 to 1 and shared ids 0 to 56. What could break: desktop catalog churn shows up on the landing unreviewed, so pin the commit.

#### Evaluation
Claim: quality - every shown use case is a real, importable template.
Before: 4 corpora and 0 shared ids. The hero counts a list that is not the product's.
After: 1 source and 3+ projections. Every id resolves in the desktop.
Method: simulation - walked three cases:
- The desktop adds a template: it appears after a sync.
- The desktop unpublishes one: it drops out.
- An old `/templates/gmail-inbox-triage` link: 308.
Falsified if the public fields are too thin to tell a use-case story.
Result: better
Gate: contract

#### First experiment
A node script that reads `(desktop) scripts/templates/*/*.json` and prints the slim corpus next to an id diff against `src/lib/templates.ts`.

#### Evidence
- `src/lib/templates.ts:18-32,48-58` - the hand-written shape and the pseudo-config.
- id comparison: web 57, desktop 56, `comm -12` = 0.
- desktop catalog: 56/56 declare connectors. Top connectors: codebase 14, jira 14, notion 14, slack 13, messaging 13, email 11.
- `HEAD:src/components/sections/Hero.tsx:13-24` - the hero count derives from the web list.

### 1.3B · Bring your stack: the section builds the visitor's own fleet
**Slot:** experience  ·  **Size:** M  ·  **Effort:** 5/10  ·  **Impact:** 7/10  ·  **Risk:** 3/10  ·  **Gate:** direction

#### Summary
Turn the scripted reel into a question: "Which tools does your team use?" The visitor picks 3-6 logos, and the section answers "N real agents run on your stack today", assembling that fleet as app-style persona cards.

#### Description
At HEAD the section plays a fixed 8-tool story for every visitor (`HEAD:src/components/sections/use-cases/data.ts:8-49`, driven by `usePersonaPlayback`). The WIP replaces it with reels over a curated slice that is still scripted. The visitor cannot tell the site anything.

The data to answer them already exists. `src/data/connectors.ts` has a `category` vocabulary (`:7-26`: email, messaging...) that matches how desktop templates declare connectors. With card A's corpus, stack fit is a client-side subset test over 56 rows, with no fetch.

Two walked stacks, computed against the real catalog:
- Gmail + Slack + Notion fits **5** agents: ai-contract-reviewer, website-conversion-audit, daily-standup-compiler, email-morning-digest, research-knowledge-curator.
- GitHub + Jira + Slack fits **10**, including qa-guardian, release-manager and security-sentinel.

The empty state names the one connector that unlocks the most agents. The server render shows a default stack, so DOM shape is constant. Reduced motion is the same section without the assembly animation.

What it reuses and bends:
- It reuses the app-shaped `PersonaCard` and `ConnectorIcon` visuals.
- It ends in Conversion card B's "Download with this agent".
- New UI strings must go to all 14 locales, unless the owner keeps them in `PENDING_TRANSLATION` as `useCasesPersona` is.
- The owner's illustration-first preference means the picker must be the illustration, not a form.

#### Flow
- Preview slot: a 12-logo picker, then the count and a list.
- Fleet cards plus a "best next connector" hint.
- Hand off to Conversion card B.
- Replace the scripted reel on `/`, behind an arm (Homepage card A).

#### Expected impact
Prospects see their own week automated, not a generic one. It is measured by picker interaction rate and download_click with a new `use-cases` placement. What could break: a narrow catalog gives niche stacks 0-1 fits, and the empty state must still sell.

#### Evaluation
Claim: user - every visitor gets a stack-specific answer.
Before: 0 visitor inputs, and the same 8 tools for everyone.
After: a per-stack count and fleet. The walked stacks give 5 and 10 agents.
Method: simulation - the two walked stacks above, plus a design-only stack (Figma + Canva) expected near 0, which exercises the empty state. Falsified if most of the top-10 stacks from waitlist answers yield 1 or fewer.
Result: better
Gate: direction

#### First experiment
Feed card A's corpus into a `/preview` slot with a logo picker that prints the fit count and ids. Run it on the 10 most common stacks.

#### Evidence
- `HEAD:src/components/sections/use-cases/data.ts:8-49` - 8 hard-coded tools.
- `src/data/connectors.ts:7-26` - `Connector.category` and the category keys.
- The stack-fit computation over `(desktop) scripts/templates/*/*.json` gave 5 and 10. Connector-count distribution: 0:2, 1:12, 2:14, 3:22, 4:5, 5:1.

---

## Features Overview & Pricing
`/features` (8 hand-built deep-dives), the landing's vision-grid layer stack, and the "Personas is free" bill illustration. files=20

### 1.4A · Real-app specimens: /features renders the shipped desktop UI, replayed from tapes
**Slot:** structural  ·  **Size:** XL  ·  **Effort:** 8/10  ·  **Impact:** 8/10  ·  **Risk:** 6/10  ·  **Gate:** direction

#### Summary
Stop redrawing the product. The desktop already has a harness that mounts real page components on synthetic IPC tapes in a plain browser. Publish its builds per release, and let `/features` sections embed the actual UI, which cannot drift from what ships.

#### Description
`/features` composes 8 hand-built sections (`src/app/features/page.tsx:30-39,62-80`). The `src/components/feature-sections/` tree is 80 files and 7,333 LOC, much of it redrawing desktop screens as marketing mocks. They drift:
- The plugin showcase needed a hand-mirrored manifest after the desktop's Artist removal "landed silently" (`src/data/desktop-plugins.test.ts:29-35`).
- Recorded narration still says "six plugins" (challenge backlog, open).

The desktop harness "mounts ONE module's real page component, inside a frame that reproduces the app shell's geometry, on data replayed from an IPC tape" (`(desktop) scripts/style/page-harness/main.tsx:1-12`):
- It is addressable as `?module=&theme=&tape=`.
- It has synthetic tapes for Fleet, Activity, Home cockpit and more, labelled "Fixture CODE, no personal data" (`fleetTapes.mjs:1-12`, 47 harness files).
- The tape recorder already exists (`(desktop) src/test/automation/ipcTape.ts:1-20`).

The moonshot:
- A desktop release step builds the harness plus curated tapes into a static bundle, served from `public/specimens/`. That is a static asset, not an app route.
- Each `/features` section embeds its surface in a titled, lazy iframe behind `LazyMount`, scale-fit to the stage.
- The tour drives it through card A's beats over postMessage.
- Concept art stays where the UI cannot show the idea.

What it bends:
- The owner's illustration-first direction (memory), hence the direction gate.
- Iframe JS sits outside the `/features` first-load budget (`bundle-budget.json:30`, 1059) but needs its own budget.
- Specimens show the desktop's i18n coverage, not the web's 14 locales.
- The harness must gate motion on the web's rules.

#### Flow
- One Fleet grid specimen in a dev-only preview.
- Desktop CI publishes the specimen bundle per release.
- Replace the Observability deep-dive mock first, since it is the most UI-like.
- A tour beat bridge.

#### Expected impact
Prospects see the real product, and redesigns of the desktop UI reach the site for free. It is measured by mocks retired and drift incidents (2 recorded so far). What could break: the harness pulls Tauri-only modules, or its weight hurts scroll performance on phones.

#### Evaluation
Claim: quality - feature visuals match the shipped UI by construction.
Before: 8 sections with 0 real UI. Drift is caught by hand: Artist, and "six plugins" in audio.
After: 3+ specimens updated per desktop release, with no web edit.
Method: simulation - walked three cases:
- The desktop renames a Fleet column: the specimen updates, the mock would not.
- A 1366x768 stage: needs scale-to-fit of the app-shell frame.
- Reduced motion: the harness must accept a still flag.
Falsified if surfaces touch Tauri APIs before the tape mock installs. `main.tsx` says the harness loads everything after the mock, which is a good sign.
Result: better
Gate: direction

#### First experiment
Vite-build the harness for `fleet/grid` with its synthetic tape. Drop the output into `public/` on a branch and iframe it at stage size. Record transfer size and visual fidelity.

#### Evidence
- `src/app/features/page.tsx:30-39,62-80` - 8 bespoke sections.
- `git ls-files src/components/feature-sections | wc -l` = 80. Total lines = 7,333.
- `src/data/desktop-plugins.test.ts:29-35` - the drift incident that forced a manifest.
- `(desktop) scripts/style/page-harness/main.tsx:1-12`, `fleetTapes.mjs:1-12`, `modules.json` - a real-surface replay harness.

### 1.4B · Plan-fit simulator: will my agents fit my Claude plan?
**Slot:** experience  ·  **Size:** M  ·  **Effort:** 5/10  ·  **Impact:** 8/10  ·  **Risk:** 5/10  ·  **Gate:** direction

#### Summary
The pricing section says the only bill is your Claude plan. Answer the buyer's real next question: will 5 agents running every morning fit in Pro, or do I need Max? Make the bill illustration an instrument, calibrated on measured cost per run.

#### Description
Pricing draws one run and one payment line: Personas is $0, and you pay Anthropic (`src/components/sections/pricing/index.tsx:16-22`; `src/i18n/en.ts:4884,4893`). The FAQ says "unlimited local agents… Create as many agents as you want" (`en.ts:3121-3127`).

That is true of Personas, but the binding ceiling is the plan's rolling 5-hour and 7-day windows. The desktop already reads that live usage from Anthropic's endpoint (`(desktop) src-tauri/src/commands/fleet/claude_usage.rs:1-12`), and even rotates across Claude accounts (`claude_accounts/rotate.rs`). The site says nothing: the guide has 0 mentions of Pro vs Max. The sync schema already records tokens, cost, duration and model per run (`scripts/setup-sync-db.sql:86-113`).

The moonshot:
- The visitor sets agents x cadence x kind (triage, research, code review).
- The bill draws their week: the predicted share of the 5-hour and weekly windows on Pro, Max 5x and Max 20x, as bands.
- It is calibrated from the maker's own fleet (window-% per run by template kind, read off the desktop usage strip).
- Results are published as a dated calibration table with n.

What it bends:
- The FAQ's "zero telemetry" means calibration may come only from the maker's fleet or explicit opt-in, never from users.
- These are claims about another company's plans, which change, so each figure carries its date and n.
- New strings must go to all 14 locales.

#### Flow
- Calibrate: one week of the maker's runs plus window readings.
- A range-only picker (light/medium/heavy) inside BillArt.
- Full inputs and per-plan bands. Feed the "Pro or Max?" gap that Tour card B logs.

#### Expected impact
It removes the last objection between "free" and "download": the plan question. It is measured by pricing download_click and the share of Athena "plan" questions. What could break: Anthropic changing limits makes the bands wrong until recalibrated.

#### Evaluation
Claim: user - a buyer can pick a plan before installing.
Before: 0 plan guidance. Walked "5 agents hourly on Pro": the site says unlimited, while the real 5-hour window share is unknown to the visitor.
After: a per-plan band with a dated n.
Method: simulation - cannot predict figures without calibration data. Falsified if per-run window-% has a coefficient of variation above 1 within a kind, in which case only light/medium/heavy is honest.
Result: unmeasurable
Gate: direction

#### First experiment
Export one week of the maker's `synced_executions` (tokens per run by persona kind) alongside the desktop's 5-hour and 7-day readings. Compute window-% per run and its spread.

#### Evidence
- `src/components/sections/pricing/index.tsx:16-22` - "the only bill is the user's own Claude plan".
- `src/i18n/en.ts:3121-3127` - "unlimited local agents", "Create as many agents as you want".
- `(desktop) src-tauri/src/commands/fleet/claude_usage.rs:1-12` - the desktop reads the real 5h/7d utilisation.
- `scripts/setup-sync-db.sql:86-113` - per-run tokens, cost, duration and model.

---

## Homepage & Hero
`/`: a server composition root that maps a `sections[]` table to stage sections, plus the hero (download CTA, stat row, tour launcher), JSON-LD and hash arrival. files=10

### 1.5A · Landing arms: lab variants ship to real traffic and are judged by outcomes
**Slot:** structural  ·  **Size:** L  ·  **Effort:** 6/10  ·  **Impact:** 8/10  ·  **Risk:** 5/10  ·  **Gate:** architecture

#### Summary
Landing direction is chosen by eye at a pace of about 43 commits a month. Make every section slot carry up to three arms, assigned at the edge, pre-rendered and measured by reach and download clicks. The contest winners would then be decided by visitors.

#### Description
The churn is measurable:
- 43 landing/hero commits since 2026-09-05.
- Two full skins built on 2026-09-29 (`bb17834` and ~25 follow-ups), then removed six days later (`8e62bab`).
- 18 prototypes (hero a1-b3; use-cases, agent-mind, orchestration-hub and get-started v1-v3) registered under `/preview/lab-*` (`HEAD:src/app/preview/lab.ts:7-33`), but preview 404s in production (`src/app/preview/registry.ts:9-11`).

No variant has ever met a visitor. Analytics are consent-gated Sentry metric counts (`src/lib/analytics.ts:12-38`) with a download_click placement (`HEAD:src/components/sections/HeroClient.tsx:25`), but no exposure or section-reach events.

The page is already slot-shaped:
- The `sections[]` table (`src/app/page.tsx:45-56`).
- `LANDING_SECTIONS` (`src/lib/constants.ts:12-24`).
- The alias resolver.

Next 16's proxy lists A/B rewrites as a use case (`node_modules/next/dist/docs/01-app/01-getting-started/16-proxy.md:24`). `src/proxy.ts:43-45` matches only `/dashboard`.

The moonshot:
- `landing-arms.ts` declares arms and weights per slot.
- The proxy sets a sticky cookie on `/` and rewrites to a statically pre-rendered composition. The URL stays `/`, and DOM is constant per arm, so there is no hydration split.
- `trackExposure(slot, arm)`, `trackReach(slot)` via the existing `SectionObserverContext`, and download_click all carry the arm.
- A readout script over the Sentry metrics.

What it bends:
- New internal pre-rendered routes under `src/app` need confirmation per CLAUDE.md.
- Consent-only counting biases the sample.
- Tour anchors and the hash aliases must hold in every arm (extend `tour-anchors.test.ts`).
- Bundle budget per arm.

#### Flow
- Reach events on today's single landing, to learn traffic and the baseline funnel.
- A hero two-arm split through the proxy.
- Arms for any slot, plus the readout.
- The lab promotes straight into arms.

#### Expected impact
The owner stops rebuilding blind, and each revamp gets a number. It is measured as decisions per month with an exposure count attached. What could break: traffic too low for significance, which turns arms into noise.

#### Evaluation
Claim: other (decision quality) - every landing change is judged on visitor outcomes.
Before: 18 variants with 0 exposed. 0 reach events. Choices are made by eye.
After: each slot decision carries exposure, reach and click deltas per arm.
Method: simulation - walked three cases: hero a1 vs current (reach to `#personas`, hero download_click), the consent-rate sample, and the anchor stability of the tour. Falsified if consenting traffic is under about 1k per arm per fortnight, too few to detect a 20% lift. Traffic volume is unknown to the scout.
Result: unmeasurable
Gate: architecture

#### First experiment
Add `trackReach(sectionId)` on the current landing through `SectionObserverContext`. Two weeks of data decide whether arms can ever reach significance.

#### Evidence
- `git log --since=2026-09-05 --oneline | grep -ciE "landing|hero"` = 43. Skins: `bb17834` (09-29) built, `8e62bab` (10-05) removed.
- `HEAD:src/app/preview/lab.ts:7-33` - 18 slots. `src/app/preview/registry.ts:9-11` - dev-only.
- `src/lib/analytics.ts:12-38` - consent-gated `Sentry.metrics.count`, no section events.
- `src/proxy.ts:43-45` - matcher `/dashboard` only. Next docs `16-proxy.md:24` - A/B rewrites.

### 1.5B · Live fleet pulse: the hero shows the maker's real agents working, now
**Slot:** experience  ·  **Size:** L  ·  **Effort:** 6/10  ·  **Impact:** 7/10  ·  **Risk:** 6/10  ·  **Gate:** policy-loosen

#### Summary
Replace the hero's one floored number with live evidence: the maker's own dogfood fleet as a strip, for example "31 runs in 24 h · 3 healed by retry · median 48 s", with anonymized run dots ticking by. A competitor cannot fake this stat.

#### Description
The hero's agents figure has no source:
- `HEAD:src/components/sections/Hero.tsx:21-24`: "nothing in this repo enumerates running agents".
- `/api/stats` floors it at 42 (`src/app/api/stats/route.ts:102-112`).
- That floor is a "deliberate marketing decision" to avoid "embarrassingly low numbers" (`:76-90`).
- The counters file is "written by an external process that doesn't yet exist" (`:18-21`).
- `HeroClient` marks it with ≈ (`HEAD:src/components/sections/HeroClient.tsx:48-53`).

That external process now exists in another shape. The desktop syncs a read projection into the same Supabase project: personas, and executions with status, `retry_of_execution_id`, duration and tokens (`scripts/setup-sync-db.sql:49-113`), published to realtime (`:554`). Access is owner-only under RLS (`:396-410`).

The moonshot:
- A server route aggregates the maker's allowlisted `user_id` through the existing service-role client (`src/lib/supabase-admin.ts`, a `server-only` module), cached for 60 s.
- It returns counts only: runs and status mix, healed retries, median duration, and per-run color plus status dots. It never returns `input_data`, `output_data`, names or errors.
- SSR renders the last snapshot with its timestamp, so DOM is constant.
- The dots loop gates on `useStillMotion` plus `usePageVisibility`.

This goes beyond ship-loop #6, which is a decision about counts: here the count is replaced by live proof.

What it bends:
- The sync security model puts privileged reads in an Edge Function (`setup-sync-db.sql:9-19`), so the owner must sanction a single-user, aggregate-only server read or build the function.
- It needs the desktop sync running daily. The tables were truncated on 2026-10-05 (`df30dad`).

#### Flow
- One SQL aggregate over 7 days of the owner's runs: is it hero-worthy?
- A server aggregate route with cache and snapshot.
- The hero strip, then the dot lane.
- Retire `totalAgents` from the floors.

#### Expected impact
Skeptical visitors see the product working right now, made by people who use it. It is measured by hero download_click before and after, and a floors count of 1 to 0. What could break: a quiet night shows small numbers, so the design must make "quiet" read as honest, not dead.

#### Evaluation
Claim: user - the hero's proof is measured, not floored.
Before: 1 of 3 hero stats is a floor (≈42). 0 live evidence on `/`.
After: 0 floors, and N runs per 24 h measured.
Method: simulation - walked three cases:
- The fleet idle overnight: "quiet" plus the last run time.
- Supabase down: a stale snapshot, labelled.
- A run whose error names a customer: it never leaves, because only aggregates do.
Falsified if the maker's fleet does not run daily. No data was visible to the scout (tables truncated, owner-only RLS).
Result: unmeasurable
Gate: policy-loosen

#### First experiment
One aggregate query over the owner's `synced_executions` for the last 7 days (count, status mix, retries, median `duration_ms`). Decide from the numbers whether they belong above the fold.

#### Evidence
- `src/app/api/stats/route.ts:18-21,76-112` - the floors and the missing writer.
- `HEAD:src/components/sections/Hero.tsx:21-24` - agents are not derivable.
- `scripts/setup-sync-db.sql:9-19,86-113,396-410,554` - the security model, execution columns, owner RLS and realtime.
- `src/lib/supabase-admin.ts:1-14` - the existing server-only service-role client.
