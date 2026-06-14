# Stream 2 — Guides Update + i18n (`/guide`)

**Goal:** Bring the guides in line with the real product and close the i18n gap. Read
`README.md` in this folder first. **Route note:** the brief says `/guides`; the actual route
is **`/guide`** (singular) with `/guide/[category]` and `/guide/[category]/[topic]`.

---

## 1. Current state — the guide is already substantial

The guide system is **well-built and mostly localized**. Do not rebuild it; extend and complete it.

### Information architecture & content storage
- **Routes:** `src/app/guide/page.tsx` (landing: category grid + search + mode toggle) →
  `src/app/guide/[category]/page.tsx` (`CategoryTopics.tsx`) →
  `src/app/guide/[category]/[topic]/page.tsx` (`TopicView.tsx`). Layout adds Navbar + sidebar.
- **Registries:** `src/data/guide/categories.ts` (10 categories) and `src/data/guide/topics.ts`
  (**100 topics**: id, categoryId, title, description, tags, mode, visibility).
- **English bodies:** `src/data/guide/content/{category}.ts` (10 files; markdown strings keyed
  by topic id). Custom blocks: `:::steps`, `:::checklist`, `:::compare`, `:::tip`, `:::info`
  via `GuideMarkdown`.
- **Localized content:** `src/data/guide/locales/{lang}/topics.ts` (titles+descriptions) and
  `src/data/guide/locales/{lang}/content/{category}.ts` (bodies), for all 13 non-en locales.
  Resolution: `src/data/guide/getLocalized.ts` (per-field fallback to English).
- **Utilities:** `src/lib/guide-utils.ts` (mode filter), `src/lib/guide-search.ts` (fuzzy +
  tag scoring), `src/lib/guide-link.ts`.
- **Chrome strings:** `src/i18n/{lang}.ts` under the `guide` namespace (category names, page
  titles, search placeholder).

### The 10 categories / 100 topics
Getting Started (8), Agents & Prompts (12), Triggers & Scheduling (10), Credentials & Security
(7), Pipelines & Teams (12), Testing & Optimization (12), Memories & Knowledge (10),
Monitoring & Costs (11), Deployment & Integrations (10), Troubleshooting (8). All topics have
real, multi-sentence bodies (no headline-only stubs).

### Mode toggle — `GuideModeToggle`
Filters the whole guide by audience via `?mode=` param: **All** / **Simple** (`mode: simple|both`,
~37 topics) / **Power** (`mode: power|both`, ~63 topics).

---

## 2. i18n reality (verified — corrects the first-pass report)

**The locale content is genuine, not English-stubbed.** Verified sample:
`src/data/guide/locales/de/content/getting-started.ts` contains real German prose
("## Personas installieren … dauert etwa eine Minute …"), clean UTF-8 (proper ü/ö/ä). **All 10
content categories exist in `de/` and `ja/`** (the earlier "getting-started + credentials
untranslated" claim was wrong — the files are present and translated).

**⚠️ Encoding split — treat the two trees differently:**
- `src/data/guide/locales/**` → **clean UTF-8**, safe to edit normally.
- `src/i18n/*.ts` (guide *chrome* strings) → the repo-wide **mojibake hazard** applies
  (UTF-8+BOM, double-encoded). Anchor edits on ASCII keys, write correct UTF-8.

**The real gap is a *trailing* one, not a missing-category one.** Verified counts:
`src/data/guide/topics.ts` defines **100** topic ids, but `de/topics.ts` has **98** titles. The
2 newest topics (Deployment: `syncing-desktop-and-cloud`, `cloud-troubleshooting`) lag in the
locale files. Body line-counts also differ (en `getting-started.ts` 294 vs de 237) — partly
language compactness, partly possibly-missing recent topic bodies. **This needs a precise
per-topic completeness audit before sizing** (see G-1).

---

## 3. Coverage gaps (product features lacking guides)

Cross-referencing the desktop `docs/features/` catalog against the 10 categories:

| Product area | Guide coverage | Action |
|---|---|---|
| **Companion (Athena)** — chat, voice, memory, proactive, walkthroughs | None | New category (G-3). |
| **Templates** — browse, adopt, customize, version | Mentioned, no dedicated topics | Topics under Getting Started or new mini-category. |
| **Goals & KPIs** — outcome tracking, KPI proposals | None (Director is 1 topic in Monitoring) | Topics under Monitoring & Costs. |
| **Competition / Arena multi-model** | Testing covers Arena/Matrix; competition mode thin | Expand Testing. |
| **Interface modes** (Starter/Team/Builder) | None | Topic under Getting Started. |
| **Connector-specific setup** (Gmail, Slack, GitHub, …) | Generic credential topics only | Optional connector-setup sub-guides. |
| **Director coaching** | 1 topic under Monitoring | Could expand. |
| Getting Started breadth | 8 topics (thinnest "both"-mode category) | Add onboarding scenarios. |

> Verify each gap against `src/data/guide/topics.ts` before authoring — some may already exist
> under a different title.

---

## 4. Backlog

### Group A — i18n completeness (the core mandate)

- **G-1 · P0 · Impact High · Effort M — Locale completeness audit + report.**
  Write/extend a script (or one-off check) that, for each of the 13 non-en locales, diffs
  `locales/{lang}/topics.ts` against `src/data/guide/topics.ts` (ids present/absent) and each
  `locales/{lang}/content/{cat}.ts` against `content/{cat}.ts` (per-topic keys present/absent).
  Output a per-locale gap table. *Acceptance:* a concrete, per-locale list of missing topic
  titles + missing body keys (this sizes G-2 exactly). Consider keeping the script under
  `scripts/` for ongoing use.

- **G-2 · P0 · Impact High · Effort L — Fill the trailing translation gap.**
  Hand-translate every gap G-1 surfaces (known starting point: the 2 Deployment topics ×13
  locales for titles, plus any lagging bodies). **Hand-translated, no English placeholders.**
  Work locale-by-locale or topic-by-topic; keep `getLocalized.ts` fallback intact so partials
  never break the page. *Acceptance:* every locale's topic-id set == en's; no English body
  served where a locale file exists; spot-check rendering via the locale switcher.

- **G-3 isn't i18n — see Group B. New content must be authored in en first, then translated
  (G-2 discipline applies to anything Group B adds).**

### Group B — Content expansion (new product coverage)

Author English first (`topics.ts` + `content/{cat}.ts`), then translate ×13 (folds into G-2
discipline). Respect `mode` tagging (simple/power/both) and the custom markdown blocks.

- **G-B1 · P1 · Impact High · Effort L — Companion (Athena) guide category.**
  New category in `categories.ts` (icon/color/mode) + ~8–10 topics: meeting Athena, chat &
  starter prompts, hold-to-talk voice, long-term memory/brain, proactive check-ins, guided
  walkthroughs, the decision hub/inbox, operations-by-chat. *Acceptance:* category renders,
  search-indexed, mode-tagged, then translated.

- **G-B2 · P1 · Impact Med · Effort M — Templates topics.**
  Browsing the gallery, adopting a template (questionnaire + vault matching + test-then-promote),
  versioning/sharing. Place under Getting Started or a small Templates category. *Acceptance:*
  topics reflect the real adoption flow; translated.

- **G-B3 · P2 · Impact Med · Effort M — Goals & KPIs topics (Monitoring & Costs).**
  Defining KPIs, measurement types (codebase/derived/connector/manual), proposal scan, pace
  tracking; goals board. *Acceptance:* outcome-measurement story covered; translated.

- **G-B4 · P2 · Impact Low · Effort S — Interface modes + Director expansion.**
  One Getting-Started topic on Starter/Team/Builder tiers; expand the existing Director topic
  into 2–3 (verdict categories, momentum, stale sweep). *Acceptance:* translated.

### Group C — Accuracy & consistency

- **G-C1 · P1 · Impact Med · Effort M — Terminology accuracy pass (CC-2).**
  Reconcile existing 100 topic bodies with current desktop terminology and behavior from
  `personas/docs/features/` (e.g., trigger names, vault wording, Director, recipes). Fix any
  drifted instructions. **Any en edit ripples to 13 locales in the same commit.** *Acceptance:*
  guide instructions match shipped product; locales updated in lockstep.

- **G-C2 · P2 · Impact Low · Effort S — Mode-tag review.**
  Re-check `mode` tags now that new categories exist (Athena = both? Templates = both?).
  *Acceptance:* Simple mode stays genuinely beginner-safe.

---

## 5. Workload sizing notes
- **i18n core (G-1 + G-2):** smaller than a category rebuild — it's a *trailing* gap (≈2 topics
  ×13 + any lagging bodies). G-1 produces the exact number; do it first.
- **Content expansion (Group B):** each new topic = 1 en body + 13 translations. Budget per
  category: Athena ~8–10 topics → ~120+ translation units.
- **Reference:** `docs/translation-handoff.md` already exists in this repo — read it for the
  established translation process/tooling before starting.

## 6. Acceptance gates for the whole stream
- Locale topic-id sets match en; no English served where a locale body exists.
- New strings hand-translated across all 14 locales, same commit; `src/i18n/*.ts` edits respect
  the mojibake hazard (ASCII anchors, correct UTF-8 out).
- `npm run typecheck` clean (the `Translations` interface shape is enforced by tsc).
- Guide renders correctly under the locale switcher for at least 2 non-en locales (spot-check
  de + ja); search still indexes new topics; mode filter still partitions correctly.
