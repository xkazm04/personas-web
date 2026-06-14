# Stream 1 — Marketing Upgrade · Execution Plan (verified)

**Companion to [`01-marketing-upgrade.md`](./01-marketing-upgrade.md).** The backlog is the
*intent*; this file is the *verified plan* after checking every claimed gap against live code
on 2026-06-14. The original doc is left intact — read it for full design notes, read this for
what's actually true and the order we'll build in.

> **Why this file exists:** the backlog warned the repo over-reports gaps. Verification
> confirmed the gaps are mostly real but the *specifics* were wrong in ways that change the
> work (especially i18n coverage). Decisions were taken with the repo owner; they're recorded
> below so they aren't re-litigated.

---

## Decisions taken (2026-06-14)

1. **i18n — descope for this stream.** `/features` and ~6 home sections are hardcoded English
   with **no i18n keys at all**. We fix terminology *in place* (hardcoded English) there and
   build **new** sections in hardcoded English too, logging each as **i18n debt** (reversible
   later). Only namespaces that *already* exist stay in strict 14-locale lockstep.
2. **Roadmap data model — dual-track.** Keep the web `/roadmap` fulfillment-bar visualization
   as-is. Separately publish `public/roadmap/v1.json` in the **desktop's items schema** for the
   desktop app to consume. Two sources, lower risk than converging the models.
3. **Changelog source of truth — desktop `CHANGELOG.md`.** Rewrite `src/data/changelog.ts` to
   match real product versions/content (v0.4.0 wave), retiring the divergent web 0.12.0 line.

---

## Verification results (backlog claim → reality)

### Confirmed gaps (genuinely missing — safe to build)
- **Athena** has no home section — only `tour/AthenaCompanion.tsx` (tour-only) +
  `AthenaFleetParts` inside the Plugins feature section.
- **Team-canvas / goal DAG** absent. Orchestration Hub is strictly trigger types orbiting a
  ring (`orchestration-hub/data.ts`).
- **Director** appears only in `/guide` content, never in marketing.
- **Deployment / CI-CD** — absent from `/features`.
- **Tiered modes** — Pricing frames free/self-hosted/open-source; no Starter/Team/Builder.
- **`public/roadmap/v1.json`** does not exist.
- **Budget caps** — *not* mentioned in `MultiProviderAI` (backlog hedged as "implicit"; it's
  actually absent).

### Backlog claims that were WRONG (these reshape the work)
| Backlog said | Reality |
|---|---|
| Use Cases ~9 incl. Stripe | **8 connectors, no Stripe**: Gmail, Slack, GitHub, Drive, Jira, Notion, Calendar, Figma |
| `areas.ts` has 6 areas (i18n, devices, cloud, connectors, observability, performance) | **5 areas**: i18n, devices, **collaboration, platform, templates** |
| Web changelog tracks desktop | Web at **0.12.0 (2026-02-28)**; desktop latest wave **0.4.0 (2026-04)** — different schemes |
| "40+ connectors" | Desktop ships **129** connectors, categorized |
| Web trigger ring matches desktop | Web shows **8** (Polling, App focus, Composite…); desktop ships **7** (Manual, Schedule, Webhook, Clipboard, File Watcher, Chain, Event Listener) |

### The biggest unflagged reality — i18n coverage
- **The entire `/features` page uses ZERO i18n** — all 8 sections hardcoded English.
- **Home sections hardcoded too:** Why Agents, Playground Split, Get Started, Orchestration
  Hub, Vision Grid, Social Proof.
- **`roadmapSection` namespace exists but is unused** — roadmap components hardcode English.
- Namespaces that *are* wired: `hero`, `useCasesSection`, `compareSection`, `faqSection`,
  `downloadSection`, `common`.

### M-D1 contract (verified, precise)
- Desktop fetches **`https://personas.so/roadmap/v1.json`** (hardcoded, no env var), 5s
  timeout, ETag/304 caching, bundled fallback on error/schema-mismatch.
- Schema v1: `{ schemaVersion:1, generatedAt, release:{ version:"roadmap", status, items:[{id,
  type, status, priority, sortOrder}] }, i18n:{ en:{ label, summary, items:{ id:{title,
  description} } }, …13 optional locales } }`.
- Constraints: `schemaVersion` exactly `1`; `release.version` exactly `"roadmap"`; `i18n.en`
  required (others optional → fall back to English); `items` ≥1; every item needs a non-empty
  `i18n.en` title.
- Example payload: `personas/docs/features/live-roadmap/schema/v1.json`.
- **Model mismatch:** web renders fulfillment *bars* (value 0..1/area); desktop schema is a
  roadmap-*items* list. → resolved by **dual-track** (decision 2).

---

## Sequenced plan

### Phase 0 — Terminology truth *(revised M-A1 · P0 · effort M)* — ✅ Phase 0a DONE (2026-06-14)
**Finding:** terminology drift was far smaller than the backlog feared — "Credential Vault" is
accurate (desktop's own `src/features/vault/`), and `changelog.ts` already uses "Team canvas"
+ "Chain trigger." The real defect was an **inconsistent trigger count** across the site:
testimonials stat said **6**, tour bullet said **6**, the tour narration + the (off-route)
features section said **8**, and the hub showed **8**. The desktop's authoritative picker
(`personas/src/lib/utils/platform/triggerConstants.ts`) defines **10** types — manual,
schedule, polling, webhook, event_listener, file_watcher, clipboard, app_focus, chain,
composite. (The README's "7" is an out-of-date simplification.) **Decision: standardize the
whole marketing surface on 10.**

Done:
- **Orchestration Hub** — added the missing **chain** and **manual** nodes (8→10); updated copy
  to "Ten trigger types." `orchestration-hub/{data.ts, index.tsx, HubRing.tsx}`.
- `data/testimonials.ts` stat **6 → 10**; `data/tour.ts` bullet **"Six" → "Ten"**.
- Tour caption narration `step3` **"eight ways" → "ten ways"** across **en + 13 locales**
  (hand-translated number-word in each), plus the e2e assertion in `e2e/tour.spec.ts`.
- Left as-is (out of scope): `feature-sections/trigger-system/` says "eight ways" but is only
  mounted on `/todo` (not `/`, `/features`, `/roadmap`) and is internally consistent.

Verified: `npm run lint` clean (0 errors, only pre-existing warnings); `npm run typecheck`
reports **no errors in changed files** — the 14 failures present are all pre-existing
`incidents` (Stream 3) work in the shared working tree, unrelated to this change.

Not needed this phase: the canonical names (Athena/Director/Team Canvas/Persona Monitor/
Connections/Recipes) are either already correct in copy or refer to features not yet on the
marketing pages (they arrive with their sections in Phases 1–4).

### Phase 1 — Flagship upgrades
- **M-B1 Athena home section** *(P0 · L)* — ✅ DONE (2026-06-14). New `sections/companion/`
  (`index.tsx`, `AthenaOrb.tsx`, `data.ts`). Mounted after Orchestration Hub (`page.tsx`
  sections + `constants.ts` LANDING_SECTIONS → scroll-map/nav entry `companion`; lazy via
  `lazy.tsx` `LazyCompanion`, ssr:false + skeleton). Design: reuses the **real** `/athena/`
  avatar clip inside an SVG orb with breathing glow, rotating guide-ring, and progress-dot arc
  (mirrors the desktop orb's task dots); an auto-cycling capability list recolors the orb and
  drives a "speech" line (the lightweight morph-to-panel). Copy verified against desktop
  `docs/features/companion/` (always-on orb · hold-to-talk voice w/ local Whisper · long-term
  memory you edit · proactive check-ins). Gated: `useReducedMotion` → static poster, no video
  decode, no animation. Hardcoded EN (i18n debt logged below). Verified: `tsc` 0 errors,
  `lint` 0 errors; no e2e hardcodes the scroll-map count.
- **M-C1 Hero motion** *(P1 · L)* — ✅ DONE (2026-06-14). **Finding:** the hero was *not* a
  cinematic still — `sections/hero/CommandCenterIllustration.tsx` already shipped a living
  command-center scene (breathing core, sweeping radar, orbiting satellite, animated
  per-roadmap-phase progress arcs, counter-rotating guide ring), already `useId`/`BRAND_VAR`/
  `transform-box`-correct, already reduced-motion gated and LCP-safe (eager, SSR structure).
  M-C1's acceptance was effectively already met; the backlog over-stated this gap. **Delta
  shipped** (per repo-owner decision — enrich, don't rebuild): the lone satellite became an
  **agent constellation** — 3 dots orbiting at distinct radii/speeds, each tethered to the core
  by a faint pulsing spoke (the "orbiting agents" idea), keeping the meaningful version +
  roadmap-progress center intact. Geometry added to `command-center-geometry.ts` (`AGENTS`);
  rendering extracted to a new `AgentConstellation.tsx` to keep the parent under the 200-line
  rule. Verified: `tsc` 0 errors, `lint` 0 errors (both hero files <200 LOC), motion gated.

**Phase 1 complete** (M-B1 + M-C1). Next per sequencing: Phase 2 (M-B2 team-canvas section +
M-C2 hub event-lane particles).

### Phase 2 — Orchestration story
- **M-B2 Team-canvas section** *(P0 · L)* — ✅ DONE (2026-06-14). New `sections/team-canvas/`
  (`data.ts`, `FlowNode.tsx`, `TeamCanvasFlow.tsx`, `index.tsx`). A horizontal SVG DAG:
  Goal → (Researcher ‖ Analyst, parallel) → Writer → Reviewer. Nodes are React-Flow-style HTML
  cards in SVG `foreignObject` (share the wire coordinate space); a run cascades through stages
  in dependency order — nodes light up, edges flow a marching-dash into each newly-active stage,
  then it replays. A 4-step text legend carries the narrative on small screens. **Distinct from
  the OrchestrationHub** (triggers): the intro/legend frame it as "triggers wake one agent — the
  canvas wires many." Mounted after Orchestration Hub via `page.tsx` + `lazy.tsx`
  (`LazyTeamCanvas`, ssr:false) + `constants.ts` LANDING_SECTIONS (`team-canvas`, anchor = the
  section element, no outer wrapper div). Reduced motion → full pipeline rendered done, no
  cascade/flow. Hardcoded EN (debt logged). **Also fixed a real M-B1 bug:** Companion had both a
  `wrapperId="companion"` outer div *and* `<SectionWrapper id="companion">` (duplicate DOM id) —
  dropped the wrapperId so the section element is the sole anchor (FAQ pattern). Verified: `tsc`
  0 errors, `lint` 0 errors / 0 new warnings, all files <200 LOC.
- **M-C2 Hub event-lane particles** *(P1 · M)* — reuse dashboard event-bus particles; gated.

### Phase 3 — Roadmap content + shared JSON *(together)*
- **M-A3** *(P1 · M)* — rewrite `src/data/changelog.ts` to desktop CHANGELOG (v0.4.0 wave);
  update the **5 actual** `areas.ts` areas to desktop themes.
- **M-D1 dual-track** *(P1 · M)* — author `public/roadmap/v1.json` to schema v1 (en required,
  locale fallback → minimal translation). Web bars page untouched.
- **M-C4** *(P2 · S)* — bars already self-drive `whileInView`; polish only.

### Phase 4 — Remaining sections + polish
- **M-A2 connectors** *(P1 · S–M)* — `useCasesSection` is i18n'd; expand 8 → 129 with a
  categorized "+N more" strip (Communication / Dev / Data / Cloud / Local).
- **M-B3 deploy/CI-CD** *(P2 · M)* · **M-B4 Director teaser** *(P2 · M)* · **M-B5 tiers**
  *(P2 · S, `compareSection`)* · **M-C3 features transitions** *(P2 · M)*.

---

## Acceptance gates (whole stream)
- `npm run typecheck` + `npm run lint` clean (watch animation-gating + low-opacity rules).
- Existing i18n namespaces stay **14-locale lockstep**; new motion calls `useReducedMotion()`.
- No route renames; no raw hex / `text-white` / `bg-black`.
- `npm run test:e2e` green for DOM-structural changes.

## i18n debt ledger
*(append one row per hardcoded section we touch or add, so the descope is reversible)*

| Section / file | Strings | Added/edited in | Status |
|---|---|---|---|
| `orchestration-hub/` (`data.ts`, `index.tsx`) | Section heading/description + 10 trigger labels, descriptions, examples | Phase 0a (hardcoded EN) | Debt — extract to an `orchestrationHub` namespace ×14 later |
| `data/testimonials.ts` (`USAGE_STATS`) | Stat labels ("Trigger types", etc.) | Pre-existing hardcoded; value edited Phase 0a | Debt (pre-existing) |
| `data/tour.ts` (`details`/`subtitle`) | Tour step bullets + subtitles | Pre-existing hardcoded; bullet edited Phase 0a | Debt (pre-existing) — note: the tour *caption narration* (`step3`) IS i18n'd in `src/i18n/*` |
| `sections/companion/` (`index.tsx`, `data.ts`) | Section eyebrow/heading/description + 4 capability labels, blurbs, orb "speech" lines | M-B1 (new, hardcoded EN) | Debt — extract to a `companionSection` namespace ×14 later |
