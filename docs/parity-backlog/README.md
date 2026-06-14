# Personas-Web ↔ Desktop Parity Backlog

**Author:** analysis/design session, 2026-06-14
**Source of truth:** desktop app at `C:\Users\kazda\kiro\personas\` (docs + `src/features/overview`)
**Target:** this repo, `personas-web` (marketing site + `/guide` + demo `/dashboard`)

This backlog is the output of an analysis session that compared the **desktop product's
actual feature set** against **what the website currently presents**. It is split into
three independent work-streams, each meant to be executed by a **separate CLI session**:

| # | Stream | Routes | File |
|---|--------|--------|------|
| 1 | Marketing upgrade — new UI animations + content refresh | `/`, `/features`, `/roadmap` | [`01-marketing-upgrade.md`](./01-marketing-upgrade.md) |
| 2 | Guides update + i18n completeness | `/guide` (note: route is **singular**) | [`02-guides-i18n.md`](./02-guides-i18n.md) |
| 3 | Dashboard sync with desktop `overview` feature | `/dashboard/*`, `/m/*` | [`03-dashboard-sync.md`](./03-dashboard-sync.md) |

Each file is **self-contained**: current state → gap analysis → prioritized backlog →
design notes → conventions to honor → acceptance criteria. Read this README first for
shared context, then open only your stream's file.

---

## Source-of-truth map (desktop)

What each desktop location tells us, and which stream consumes it:

| Desktop location | What it is | Feeds stream |
|---|---|---|
| `docs/features/*` + `docs/concepts/*` + `README.md` | Canonical product feature catalog & terminology | 1, 2 |
| `docs/BACKLOG.md` + `docs/features/live-roadmap/` + `CHANGELOG.md` + `docs/plans/` | Roadmap themes, "recently shipped", forward-looking concepts | 1 (roadmap page) |
| `src/features/overview/**` (+ `docs/architecture/overview*.md`) | The dashboard the web demo should mirror | 3 |

### Headline product capabilities (the 12 the desktop leads with)

Used to judge whether marketing/guides/dashboard reflect the *real* product:

1. Local-first, privacy-by-default orchestration (no cloud account, AES-256-GCM vault in OS keyring)
2. Multi-provider AI with automatic failover + per-run/daily/monthly budget caps
3. Visual multi-agent orchestration (React Flow **team canvas**; event-chain **and** goal-driven DAG)
4. Real-time fleet visibility (Persona Monitor grid, global activity strip, OTel-style tracing)
5. 40+ pre-integrated connectors with semi-automated OAuth credential browser
6. **Companion (Athena)** — always-available assistant, animated avatar, hold-to-talk voice, long-term memory, proactive check-ins
7. DevTools plugin — codebase context map, idea triage, goal-driven task runner, standards compliance
8. 7-type trigger & automation system (manual, cron, webhook, file watcher, clipboard, chain, event)
9. Design review + multi-model testing (Arena, Matrix, genetic optimization, regression)
10. **Director** — longitudinal portfolio coaching (0–5 verdicts, momentum tracking)
11. Deployment: cloud orchestrator, GitHub Actions, GitLab CI/CD, n8n
12. Tiered interface modes (Starter / Team / Builder)

> **Coverage snapshot** — Marketing's `/features` page covers ~8 of these (Design Engine,
> Memory, Healing, Vault, Multi-Provider, Observability, Lab, Plugins). **Companion**,
> **team-canvas orchestration**, **Director**, **connectors-at-scale**, and the
> **deployment/CI-CD** story are under- or un-represented. The dashboard has **no**
> Certification, Incidents, Director, or System-Health surface. See per-stream files.

---

## Cross-cutting items (touch more than one stream — coordinate)

- **CC-1 — Shared roadmap JSON (`public/roadmap/v1.json`).** The desktop `live-roadmap`
  feature is designed to fetch a versioned roadmap JSON (schema v1, all 14 locales inline,
  bundled fallback) from the marketing origin. **That file does not exist in this repo yet**
  (`public/roadmap/` is absent), and the web `/roadmap` page renders from hardcoded
  `src/components/sections/roadmap/areas.ts`. Publishing one canonical JSON that *both* the
  web roadmap page and the desktop app consume is the highest-leverage sync item. Owned by
  **Stream 1**, but verify the desktop's exact fetch URL/schema in
  `personas/docs/features/live-roadmap/` before designing the file. *(Confirm before building —
  the desktop fetch contract is the constraint.)*
- **CC-2 — Canonical terminology.** Marketing copy, guide bodies, and dashboard labels must
  use the product's real names (Athena, Director, team canvas, Persona Monitor, vault,
  certification, recipes, triggers). Stream 1 & 2 both touch copy; agree on a glossary so they
  don't diverge. Pull terms from `personas/docs/features/`.
- **CC-3 — New i18n keys ripple to all 14 locales.** Any new user-facing string added by
  Stream 1 or 3 must be hand-translated into all 13 non-en locales in the **same commit**
  (see Conventions). Budget for it in every stream, not just Stream 2.

---

## Conventions every stream must honor

Pulled from `.claude/CLAUDE.md` and observed repo patterns. **Non-negotiable.**

1. **i18n** — every user-facing string lives in `src/i18n/en.ts`, accessed via
   `useTranslation()` → `t.namespace.key`. New/changed/removed keys propagate to **all 14
   locales in the same commit**, fully **hand-translated** (no English placeholders).
   - ⚠️ **Encoding hazard:** `src/i18n/*.ts` non-en files are UTF-8+BOM with double-encoded
     existing values (mojibake on disk). Anchor edits on pure-ASCII keys, write correct UTF-8,
     don't try to "fix" surrounding corruption.
   - ✅ By contrast, `src/data/guide/locales/**` content files are **clean UTF-8** and hold
     genuine translations (verified). Treat the two trees differently (see Stream 2).
2. **Semantic Tailwind tokens** — `text-foreground`, `bg-surface`, `border-glass`,
   `text-brand-cyan`, etc. No `text-white`/`bg-black`/raw hex. Text opacity `<60` is lint-warned.
3. **Animation gating** — any `requestAnimationFrame`/canvas/GPU-heavy motion **must** import
   and call `useReducedMotion()` from framer-motion and short-circuit when true. Also consult
   `useQualityTier()`/`QualityContext` for heavy work. Enforced by
   `custom-animation/require-animation-gating`.
4. **React 19 purity** — no sync `setState` in `useEffect` bodies (use the prev-state pattern);
   no `Math.random`/`Date.now`/`new Date()` in render or `useMemo` (lazy `useState(() => …)`).
5. **Routes are referenced by external links** — do **not** rename/move route paths under
   `src/app/` without confirmation. Add new routes only when the stream calls for it.
6. **Demo dashboard stays demo** — `/dashboard/*` runs on `src/lib/mockApi.ts` +
   `src/lib/mock-dashboard-data.ts`. Stream 3 extends the mock layer; it does **not** wire real
   orchestrator calls.
7. **Commits** — one atomic change each; message format
   `<area>: <what>` + `Why:` / `Risk:` / `Verified:` lines. Run `npm run typecheck` +
   `npm run lint` before committing; `npm run test:e2e` for behavior-affecting changes.

---

## Established reusable toolkit (so streams build on patterns, not reinvent)

- **Motion primitives** — `src/lib/animations.ts`: `fadeUp`, `fadeIn`, `slideInLeft/Right`,
  `scaleIn`, `staggerContainer(Fast)`, `revealFromBelow`, `pageTransition`, `TRANSITION_*`
  durations.
- **Reveal wrappers** — `src/components/SectionWrapper.tsx` (whileInView, once, registers for
  pause), `src/components/StageSection.tsx` (full-width glow stage), `src/components/LazyMount.tsx`
  (viewport-gated mount with minHeight). ⚠️ Known gotcha: children mounted *after*
  SectionWrapper's one-shot reveal stay invisible on inherited variants — self-drive
  `whileInView` (see `AreaCardShell`).
- **SVG-motion pattern** — `useId()` for def namespacing, `useReducedMotion()` gating, viewport
  `whileInView`, `BRAND_VAR.*` token colors, components kept <200 LOC. Exemplars:
  `command-center-geometry.ts`, `MemoryLayersStack`, `HubRing`, `CircuitBoard`.
- **Dashboard kit** — Recharts (`AreaChart/LineChart/RadarChart/BarChart/PieChart`), themed via
  `src/lib/chart-theme.ts` + `useChartAnimation()`. Reusable: `GlowCard`, `StatBadge`,
  `DataTable`, `PersonaAvatar`, `StatusBadge`, `SkeletonCard`. Custom SVG: event-bus particles,
  knowledge cluster graph, execution heatmap grid.
- **Design references already in repo** — `docs/ui-evolution-playbook.md`,
  `docs/visual-identity.md`, `docs/translation-handoff.md`.

---

## How to use this backlog

1. Open your stream's file. Items are tagged **P0/P1/P2** (priority) with **Impact** and
   **Effort (S/M/L/XL)**.
2. Items are ordered to be shippable independently. Each has scope (files), design notes, and
   acceptance criteria.
3. Re-verify any claim marked *(confirm before building)* against live code — exploration
   over-reports gaps, and this repo is already polished. Check the actual component before
   "upgrading" it.
4. Keep `context-map.json` (repo root) accurate if you change which files a context owns.
