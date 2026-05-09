# Translation handoff

Full-coverage translation pass is out of scope for the session that created
this doc. Dashboard sync passes (S.1.x, C.1.x) added ~200 new keys and
pushed English placeholders across 13 non-en locales to keep `tsc` green;
the most-visible surfaces (nav labels, page titles/subtitles, scope bar,
staleness indicator, fleet card, reviews focus mode) have been localized
for real across all 13 locales. The rest still ships English placeholders
and needs a dedicated translation-only pass.

This doc catalogs what's covered, what isn't, how to find the gap, how
to close it, and what to watch for.

---

## 1. Architecture recap

- **Source of truth**: `src/i18n/en.ts` defines `export interface Translations`
  AND `export const en: Translations = { ... }` in the same file.
- **Locales**: 13 non-en files under `src/i18n/{ar,bn,cs,de,es,fr,hi,id,ja,ko,ru,vi,zh}.ts`,
  each starts with `import type { Translations } from './en';` and
  exports `const <code>: Translations = { ... }`.
- **Loader**: `src/i18n/useTranslation.ts` picks the active locale from
  `useI18nStore()` and returns `t`.
- **Contract**: every locale must satisfy the `Translations` shape exactly
  or `tsc` fails. Adding/removing keys without mirroring across all 14
  files breaks the build.

CLAUDE.md rule (kept for reference):
> When adding new keys:
> - Add to `en.ts` first (the source of truth).
> - Add the same keys with English placeholder content to all 13 non-en
>   locales — otherwise `tsc` fails.
> - Do not bulk-migrate translations across all 14 locales beyond adding
>   the minimum English placeholder needed to compile.

The current gap is the downstream consequence of that rule: many keys
sit in non-en files as English text. Real translations are deferred to
a focused pass (this doc is the input to that pass).

---

## 2. Coverage status as of C.1.8

### Fully translated across 13 non-en locales
These are live in `ar, bn, cs, de, es, fr, hi, id, ja, ko, ru, vi, zh`:

- `dashboard.leaderboard`, `dashboard.sla`, `dashboard.messages` (nav labels)
- `dashboard.unreadMessages`, `dashboard.fleetHealth`
- `dashboard.scope.allPersonas`, `personaLabel`, `compare`, `dateRange.custom`
  (`24h` / `7d` / `30d` / `90d` intentionally kept universal)
- `dashboard.staleness.justNow`, `secondsAgo`, `minutesAgo`, `hoursAgo`,
  `daysAgo`, `error`
- `dashboard.fleet.title`, `severity.{urgent,suggested,insight}`,
  `expand`, `collapse`, `dismiss`
- `observabilityPage.title`, `subtitle`, `tabPerformance`, `tabUsage`
- `memoriesPage.title`, `subtitle`
- `leaderboardPage.title`, `subtitle`
- `slaPage.title`, `subtitle`
- `messagesPage.title`, `subtitle`
- `reviewsPage.focus.*` (enter/exit/progress/skip/empty/approve/reject/shortcuts)

### Still English placeholder in 13 non-en locales
Priority order (visible impact, descending):

**memoriesPage** (Knowledge → Memories tab)
- `totalCount`, `filters.{all,throttle,schedule,alert,config,routing}`,
  `status.{active,pending,archived}`, `uses`, `empty`, `seeAll`,
  `conflicts.{count,resolveButton,modalTitle,modalSubtitle,accept,reject,cancel,apply,allResolved}`

**leaderboardPage** (/dashboard/leaderboard)
- `rank`, `composite`, `radarTitle`
- `metrics.{reliability,cost,speed,quality,volume}`
- `trend.{up,down,flat}`

**slaPage** (/dashboard/sla)
- `compliance`, `activeBreaches`, `objectives`, `target`, `current`, `timeInSla`
- `metricType.{availability,latency,successRate}`
- `severity.{minor,major,critical}`
- `breachLog.{title,empty,ongoing,duration}`

**messagesPage** (/dashboard/messages)
- `unread`, `read`, `empty`, `expand`, `collapse`
- `pagination.{prev,next,page}`
- `markAllRead`

**eventsPage** (/dashboard/events — Timeline tab)
- `tabSwimlane`
- `swimlane.{title,subtitle,empty}`

### Not i18n'd at all (hardcoded English in JSX)
These pre-date the dashboard sync passes; CLAUDE.md rule 1 says they're
violations but flagged as known debt. The translation pass should decide
per-file whether to migrate.

- `HealthDigestPanel.tsx` — "System Health", "Health", "All Agents"
- `MemoryActionsPanel.tsx` — "Memory Insights", "suggestion{s}",
  "All suggestions dismissed. Check back later.", aria-label "Dismiss: …"
- `ReviewsSplitPane.tsx` — "All", "Pending", "Approved", "Rejected" filter
  labels; "Select a review" empty state; shortcut kbd labels (J/K/A/R);
  "No reviews in this filter"; bulk-action toolbar strings ("selected",
  "Approve", "Reject", "Cancel", "Select reviews for bulk actions");
  "Processing N reviews"; "Refreshing..."; "Reject selected reviews?"
  confirm dialog
- `KnowledgeDenseTable.tsx` — column headers, filter labels
- `KnowledgeClusterGraph.tsx` — cluster labels, legend
- `/dashboard/knowledge/page.tsx` — "Knowledge Graph" title,
  "Patterns learned from agent executions" subtitle, tab labels
  ("Dense Table", "Graph", "Memories")
- `/dashboard/reviews/page.tsx` — "Manual Reviews" title + subtitle
- Events page — "Test Flow" button, "Event Types" legend label
- Home page — "Recent Activity", "Traffic & Errors", all StatBadge
  labels (they use `t.dashboard.*` already, so partially OK)
- Observability Performance/Usage views — cost anomaly banner prose,
  severity filter chips, "All systems healthy", "Run Analysis",
  "Analyzing...", "Auto-fix applied", "Circuit Breaker", "Auto-fixed",
  "Resolved" status pills
- SettingsPage, AgentsPage, ExecutionsPage — various
- BatchReviewModal — "Conflict" chip label
- FleetOptimizationCard — the `actionLabel` field on mock
  recommendation is English (comes from mock, not i18n)

### Commit trail to re-read for context
```
S.1.1…S.1.12   added all the keys (English placeholders everywhere)
C.1.3           removed healthPage namespace
C.1.4           added observabilityPage, removed dashboard.usage
C.1.5           removed dashboard.memories nav label
C.1.7           translated nav labels + page titles/subtitles
C.1.8           translated scope bar, staleness, fleet card, reviews focus
```

---

## 3. How to audit coverage mechanically

**Grep for orphan English in non-en locale files**:
```bash
# Find any string in a non-en file that still looks like the English original.
# Heuristic: strings containing '{n}' or common English stop-words next to
# uppercase A-Z after typed Unicode.
grep -E "'[A-Z][a-zA-Z ]+'" src/i18n/{ar,bn,cs,de,es,fr,hi,id,ja,ko,ru,vi,zh}.ts \
  | grep -v "'SLA'\|'Personas'\|'Gmail'\|'Slack'\|'GitHub'"
```

**Find hardcoded JSX English**:
```bash
# Phrases that look like UI copy but aren't wrapped in t.*
grep -rnE '"[A-Z][a-z]+ [a-z]+|>[A-Z][a-z]+ [a-z]' src/app/dashboard src/components/dashboard \
  | grep -v 't\.\|className\|import\|//'
```

**Diff two locales against en to see which namespaces differ in structure**:
```bash
node -e "
const en = require('./src/i18n/en.ts'); // won't actually work; illustrative
// better: do this in a typescript check that compares object shapes.
"
```
(Practical approach: run `tsc --noEmit` — if any locale is off-shape it
errors immediately with the exact key path.)

---

## 4. Suggested next pass — "C.2.x/translations-depth"

One commit per namespace, mirrored across all 13 locales, atomic:

| Pass | Namespace | Est. keys × 13 |
|------|-----------|----|
| C.2.1 | memoriesPage deep (filters + status + conflicts) | ~17 × 13 |
| C.2.2 | leaderboardPage deep | ~11 × 13 |
| C.2.3 | slaPage deep | ~21 × 13 |
| C.2.4 | messagesPage deep | ~9 × 13 |
| C.2.5 | eventsPage.swimlane | ~4 × 13 |
| C.2.6 | Hardcoded JSX in reviews/knowledge/observability — migrate to i18n first, then translate | large, multi-commit |

Each commit should:
1. Verify `tsc` + `eslint` pass
2. Preserve `{n}`, `{total}`, `{t}` placeholders verbatim
3. Keep universal tokens (`24h`, `7d`, `30d`, `90d`, `SLA`, `UTC`,
   numeric formats) in Latin/ASCII even in CJK/RTL locales
4. Use single-word translations consistently across locales (e.g. the
   translated nav label for `dashboard.leaderboard` should be the same
   label used in `leaderboardPage.title`)

---

## 5. Translation-quality checklist per locale

Per locale, sanity-check before committing:

- **ar**: RTL handling — verify the scope bar and modal layouts don't
  clip when strings get longer. Universal tokens stay LTR.
- **bn, hi**: test with Devanagari/Bengali font fallback in
  `--font-devanagari` / `--font-bengali` (already configured in
  `tokens.css`).
- **cs**: diacritics render cleanly; some strings are long — check
  button width on badge pills.
- **de**: compound nouns are long (e.g. "Flottenoptimierung") —
  verify home fleet card title doesn't wrap awkwardly.
- **ja, ko**: no spaces between words; watch for text-wrapping regex
  that assumes Latin whitespace.
- **ru**: cyrillic, some compound forms. Cases matter: filter labels
  are typically nominative, button actions are imperative.
- **vi**: diacritics heavy; confirm line-height renders correctly.
- **zh**: simplified by convention here. Number-noun ordering differs
  from English — placeholders like `{n}条` flow better than `{n} items`.

---

## 6. Things to decide before translating more

**Noun vs verb on action labels**: English is often ambiguous
("Compare" = noun or verb). Pick a register per locale and stay
consistent:
- Buttons → imperative verb
- Tab labels → noun
- Badge labels → noun

**Pluralization**: current i18n layer has no pluralization primitive.
Strings like `{n} memories` or `{n} uses` are handled with
`.replace("{n}", …)`. Some languages need different forms for 1 vs
2-4 vs 5+ (ru, cs). Options for the translation pass:
1. Accept slight awkwardness (singular form used even for plurals)
2. Add an `i18n-plural` helper that accepts count + dictionary and
   returns the right form. Would need a small schema change in
   `Translations` (plural keys become `{one: string; few: string;
   many: string}`). Out of scope for placeholder-swap passes.

**Mock data strings**: `MOCK_FLEET_RECOMMENDATION.title`, `summary`,
`detail` all live in `mock-dashboard-data.ts` in English. For the
demo dashboard this is fine (it's demonstrating visual design, not
locale fidelity). If the demo is going to be shown in-locale, these
need to become `t.dashboard.fleetMockData.*` keys. Recommend: leave
English for now, re-evaluate if the marketing team asks for
locale-aware demos.

**Aria labels and alt text**: several components use hardcoded English
for accessibility attributes. Screen readers use the document
language, so these SHOULD be translated. Rough count: ~30 aria-labels
across dashboard. Each should become `aria-label={t.*.*}`.

---

## 7. Branch-out into desktop

The desktop app (`C:\Users\kazda\kiro\personas`) ships its own
translation bundle. The web and desktop `Translations` shapes have
diverged during the sync passes:
- Web added: `observabilityPage`, `memoriesPage`, `leaderboardPage`,
  `slaPage`, `messagesPage`, `reviewsPage.focus`, `eventsPage.swimlane`
- Web removed: `healthPage`, `dashboard.{memories,health,usage,playground}`

Before shipping deep translations, decide whether to align shapes
with desktop (migrate namespace names to match) or treat them as
independent (each app owns its own i18n surface). Recommendation:
independent for now — shared types create cross-repo coupling that
neither app needs yet.

---

## 8. Files to touch during C.2.x

```
src/i18n/en.ts            (source of truth — edits here set contract)
src/i18n/{ar,bn,cs,de,es,fr,hi,id,ja,ko,ru,vi,zh}.ts    (mirror)
src/components/dashboard/*.tsx                           (unhardcoded JSX)
src/app/dashboard/**/page.tsx                            (titles, tabs)
```

Nothing else should change. If any non-i18n change sneaks in, split
it to its own commit.
