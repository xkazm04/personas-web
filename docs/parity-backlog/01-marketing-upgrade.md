# Stream 1 — Marketing Upgrade (`/`, `/features`, `/roadmap`)

**Goal:** New powerful UI animations + content refresh so the marketing pages reflect the
*actual* product. Read `README.md` in this folder first (shared context + conventions).

**Mandate from the brief:** new powerful UI animations, content updates, on routes `/`,
`/features`, `/roadmap`.

---

## 1. Current state (what exists to build on)

### Homepage `/` — `src/app/page.tsx`
11 lazy-mounted sections, all on the mature `SectionWrapper`/`StageSection`/`LazyMount` +
framer-motion stack:

1. **Hero** (`sections/Hero.tsx` → `HeroClient`) — cinematic illustration, CTA, version badge, `HeroTransition`.
2. **Use Cases** (`sections/use-cases/`) — integration carousel (~9 tools: Gmail, Slack, GitHub, Drive, Jira, Notion, Stripe, Calendar, Figma) with animated SVG connector path.
3. **Why Agents** (`sections/why-agents/`) — scenario comparison carousel (workflow vs agent).
4. **Playground Split** (`sections/playground-split/`).
5. **Get Started** (`sections/get-started/`) — 5-step interactive onboarding.
6. **Orchestration Hub** (`sections/orchestration-hub/`) — radial SVG ring, 8 trigger types orbiting.
7. **Vision / Platform Grid** (`sections/vision-grid/`) — 6 branded cards (Design Engine, Memory, Healing, Security, AI Models, Observability).
8. **Social Proof** (`sections/SocialProof.tsx`) — stats + testimonials + trust badges.
9. **Pricing / Compare** (`sections/pricing/`) — "Free forever / self-hosted / no per-run markup / open source"; 3 FeatureGroupCards from `/guide` categories.
10. **FAQ** (`sections/FAQ.tsx`) — accordion + Discord CTA.
11. **Download CTA** (`sections/DownloadCTA.tsx`) — platform pills, animated rotating dashed-circle bg.

### Features `/features` — `src/app/features/page.tsx`
8 sections, each with a bespoke visualization; scroll-map DESIGN → MEMORY → HEALING → SECURITY
→ AI MODELS → OBSERVE → LAB → PLUGINS:
- **DesignEngine** (`DesignEngineMatrix`), **MemoryLayers** (`MemoryLayersStack`),
  **HealingCircuit** (`CircuitBoard` + `useHealingCycle`), **SecurityVault**,
  **MultiProviderAI**, **ObservabilityDeck**, **Lab**, **Plugins** (which contains a
  `dev-tools-grid/` with **AthenaFleet** parts — the only current Athena/Companion mention).

### Roadmap `/roadmap` — `src/app/roadmap/page.tsx`
3 sections: ROADMAP → VOTE → CHANGELOG:
- **Roadmap fulfillment bars** — `sections/roadmap/`, data **hardcoded** in
  `sections/roadmap/areas.ts` (6 areas: i18n, devices, cloud, connectors, observability,
  performance; per-area `bars[]` with `value` 0..1 + motifs).
- **Feature Voting** — `sections/feature-voting/`, Supabase-backed (anon key, mock fallback),
  boost via Ko-Fi webhook, comments.
- **Changelog Timeline** — `sections/changelog-timeline/`, data in `src/data/changelog.ts`.

### Animation toolkit
See README "Established reusable toolkit". The SVG-motion + `SectionWrapper` + `LazyMount`
patterns are the substrate for every new section below.

### i18n namespaces in play
`nav`, `hero`, `heroTransition`, `sections`, `useCasesSection`, `compareSection`,
`downloadSection`, `faqSection`, `roadmapSection`, `pricing`, `common` (in `src/i18n/en.ts`).

---

## 2. Gap analysis (desktop product vs current marketing)

| Headline desktop capability | Marketing coverage today | Gap |
|---|---|---|
| Companion (**Athena**): avatar, voice, memory, proactive | Only a sub-grid inside Plugins + the site-tour avatar | **No dedicated section.** Strongest missing story. |
| Visual **team canvas** orchestration (goal-driven DAG, parallel steps) | Orchestration Hub shows *triggers* only | Trigger story ≠ multi-agent pipeline story. Missing. |
| **Director** portfolio coaching (0–5 verdicts, momentum) | None | Missing. |
| **40+ connectors** | Use Cases shows ~9 | Under-scaled; no "catalog at a glance". |
| **Deployment / CI-CD** (cloud, GitHub Actions, GitLab, n8n) | None on marketing | Missing enterprise/deploy story. |
| **Tiered modes** (Starter/Team/Builder) | Not framed | Missing; useful for "grows with you". |
| Budget caps / cost control | Implicit in Pricing copy | Could be a concrete differentiator visual. |
| Roadmap content freshness | Hardcoded `areas.ts`; changelog from `src/data/changelog.ts` | Drifts from desktop `BACKLOG.md`/`CHANGELOG.md`; no shared JSON (CC-1). |

> Re-verify before building: this repo is already polished and exploration over-reports gaps.
> Confirm each "missing" against the live page before adding a section.

---

## 3. Backlog

### Group A — Content refresh (lower effort, high trust)

- **M-A1 · P0 · Impact High · Effort M — Headline alignment pass.**
  Audit hero/section copy against the 12 headline capabilities (README) and the desktop
  `docs/features/`. Fix terminology drift (use *Athena*, *Director*, *team canvas*, *Persona
  Monitor*, *vault*, *recipes*). Scope: `src/i18n/en.ts` namespaces above + 13 locale mirrors.
  *Acceptance:* every claim on `/` and `/features` maps to a real, named desktop feature;
  no orphaned/aspirational copy; all 14 locales updated in lockstep.

- **M-A2 · P1 · Impact Med · Effort S — Expand Use Cases connectors.**
  Grow the integration set from ~9 toward the real 40+ (group by Communication / Dev / Data /
  Cloud / Local). Either widen the carousel or add a "+ N more" catalog strip. Scope:
  `sections/use-cases/` + `useCasesSection` i18n. *Acceptance:* connector count visibly
  reflects breadth; new entries translated; carousel autoplay + reduced-motion still gated.

- **M-A3 · P1 · Impact Med · Effort M — Roadmap content sync (see also CC-1/M-D1).**
  Reconcile `sections/roadmap/areas.ts` + `src/data/changelog.ts` with desktop
  `docs/BACKLOG.md` themes and `CHANGELOG.md` (v0.4.0 wave: dynamic templates, daemon v2,
  execution event emitter, Drive redesign; "coming soon": async Athena, mixed-engine,
  KPI-driven orchestration, per-team codebase connectors). *Acceptance:* roadmap areas and
  changelog match the desktop's current reality; "coming soon" themes present.

### Group B — New marketing sections (the missing product stories)

Each follows the existing section anatomy: `LazyMount` + `SectionWrapper`/`StageSection`, a
bespoke <200 LOC SVG-motion visualization, copy in a new i18n namespace × 14 locales.

- **M-B1 · P0 · Impact High · Effort L — Companion (Athena) section.**
  The flagship missing story. Reuse/extend existing `tour/AthenaCompanion.tsx` avatar assets.
  Show: always-available orb, hold-to-talk voice, long-term memory, proactive check-ins.
  Placement: home, after Orchestration Hub or Why Agents. New namespace `companionSection`.
  *Design:* animated orb with progress-dot arc + morph-to-panel (mirror the desktop orb);
  reduced-motion → static poster. *Acceptance:* dedicated section ships; avatar motion gated;
  copy in 14 locales.

- **M-B2 · P0 · Impact High · Effort L — Team-canvas orchestration section.**
  Distinct from triggers. Visualize personas on a node graph wiring into a goal → parallel
  DAG → reviewed output. *Design:* React-Flow-style nodes drawn as SVG-motion (edges animate
  data flow; steps light up in dependency order). New namespace `orchestrationSection`.
  *Acceptance:* clearly communicates multi-agent pipelines vs single triggers.

- **M-B3 · P1 · Impact Med · Effort M — Deployment & CI-CD section (features page).**
  Cloud orchestrator + GitHub Actions + GitLab CI/CD + n8n. Add to `/features` scroll-map
  after PLUGINS, or fold into a "Ship anywhere" block. *Acceptance:* deploy story present;
  logos/badges use semantic tokens.

- **M-B4 · P2 · Impact Med · Effort M — Director coaching teaser.**
  Either a `/features` block or a home strip: longitudinal 0–5 scorecard with momentum
  sparkline. Pairs naturally with ObservabilityDeck. *Acceptance:* coaching concept legible;
  numbers are illustrative, motion gated.

- **M-B5 · P2 · Impact Low · Effort S — Tiered modes framing.**
  Lightweight "Starter → Team → Builder grows with you" treatment (likely within Pricing/Compare
  rather than a new section). *Acceptance:* tier story added without bloating the page.

### Group C — "Powerful UI animation" upgrades (the brief's headline ask)

Build on the SVG-motion pattern; all gated by `useReducedMotion()` + `useQualityTier()`.

- **M-C1 · P1 · Impact High · Effort L — Hero motion upgrade.**
  Elevate the hero from cinematic-still to a living `command-center-geometry` scene (breathing
  core, sweeping radar, orbiting agents that resolve into the product name). Keep <200 LOC,
  `useId` namespacing, BRAND_VAR colors, static poster fallback. *Acceptance:* LCP not
  regressed (hero stays eager/above-fold); zero motion when reduced-motion.

- **M-C2 · P1 · Impact Med · Effort M — Orchestration Hub → live event lanes.**
  Add animated particle lanes between trigger ring and center (echo the desktop event-bus
  visualization) so the hub reads as *live*, not static. Reuse the dashboard event-bus particle
  approach. *Acceptance:* particles gated; hub still autoplays/pauses on hover.

- **M-C3 · P2 · Impact Med · Effort M — Features section transitions polish.**
  Scroll-linked reveals between the 8 feature stages (parallax glow handoff via `StageSection`
  color transitions; stagger the bespoke visualizations on enter). *Acceptance:* smooth
  stage-to-stage handoff; no layout shift; gated.

- **M-C4 · P2 · Impact Low · Effort S — Roadmap fulfillment-bar animation.**
  Animate the `AreaCardShell` bars filling to their `value` on scroll-in (respect the
  late-mount whileInView self-drive gotcha noted in README). *Acceptance:* bars animate once,
  reduced-motion → instant fill.

### Group D — Cross-cutting

- **M-D1 · P1 · Impact High · Effort M — Publish `public/roadmap/v1.json` (CC-1).**
  Create the shared, versioned, 14-locale roadmap JSON the desktop `live-roadmap` consumes, and
  refactor `/roadmap` to render from it (replacing hardcoded `areas.ts`). **Confirm the
  desktop's exact schema/URL in `personas/docs/features/live-roadmap/` first.** *Acceptance:*
  one source drives both web page and desktop app; bundled fallback intact; schema-versioned.

---

## 4. Suggested sequencing

1. M-A1 (terminology truth) → unblocks all new copy.
2. M-B1 (Athena) + M-C1 (hero) → biggest perceived upgrade.
3. M-B2 (orchestration) + M-C2 (event lanes).
4. M-A3 + M-D1 (roadmap content + shared JSON) together.
5. M-B3/B4/B5 + M-C3/C4 polish.

## 5. Acceptance gates for the whole stream
- `npm run typecheck` + `npm run lint` clean (watch the animation-gating + low-opacity rules).
- Every new/changed string present in **all 14** `src/i18n/*.ts`, hand-translated.
- All new motion components import+call `useReducedMotion()`; heavy ones consult quality tier.
- No route renames; no raw hex / `text-white` / `bg-black`.
- `npm run test:e2e` green for any section that changes DOM structure tested by specs.
