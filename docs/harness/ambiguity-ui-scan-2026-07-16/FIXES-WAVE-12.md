# Fix Wave 12 — i18n hardcoded strings (theme T9)

> 3 commits, 3 findings closed (3 High).
> Baseline preserved: tsc 0 → 0 · vitest 64/64 → 64/64 · i18n coverage 100% · i18n encoding OK · 0 regressions.

## Commits

| # | Commit | Finding closed | File(s) |
|---|---|---|---|
| 1 | `b1af559` | dashboard-shell-chrome #2 | StatusBadge.tsx + 14 locale files |
| 2 | `6304edd` | homepage-hero #2 | HeroClient.tsx + 14 locale files |
| 3 | `bcbb7fd` | features-pricing #2 | pricing/index.tsx + 14 locale files |

## What was fixed

1. **StatusBadge labels** — `statusConfig` baked English labels (Queued/Running/Completed/Processed/Failed/Cancelled/Pending/Approved/Rejected) into the most repeated dashboard text (a chip on nearly every list row). Added a `t.dashboardUi.status` map (9 keys) across all 15 locales; the component now resolves the label via `useTranslation`, colour/pulse config unchanged.
2. **Hero CTA + trust line** — the hero was fully translated except the primary CTA label and the trust/privacy line (the two highest-persuasion above-the-fold elements). Added `t.hero.downloadCta` + `t.hero.trustLine` across all 15 locales.
3. **Pricing offer strip + CTA** — the offer badges, offer paragraph, and "Get started free" CTA were hardcoded English next to translated cards. Added `offerBadges`/`offerBody`/`ctaLabel` under `compareSection` across all 15 locales; also fixed the offer CTA's dead `#download` anchor → `#download-section`.

## Method (15-locale parity)

TypeScript enforces key parity via the shared `Translations` type (each locale is typed `: Translations`), and `check:i18n-coverage` re-verifies shape. So each key was added to `en.ts` (interface + values) by hand, then injected into all 13 non-en files via a small idempotent Node codemod that inserts after the section's opening line, seeded with the English string per the repo's parity convention (translations can follow later). New strings are plain ASCII, so `check:i18n-encoding` reports no new corruption over the known baseline debt.

## Verification

| | Before | After |
|---|---|---|
| tsc | 0 | 0 |
| vitest | 64/64 | 64/64 |
| i18n coverage | 100% | 100% |
| i18n encoding | baseline | baseline (no new) |

## Pattern established (catalogue item 22)

22. **Adding an i18n key means all N locale files, seeded, in one commit** — a type-enforced locale system (`: Translations`) makes a partial add a compile error; add the key to the base interface+values, then codemod-inject the English-seeded value into every sibling locale after the section's opening line (idempotent, skip-if-present). Keep seeds ASCII so the encoding gate stays green. Reuse an existing namespace (`dashboardUi`, `hero`, `compareSection`) rather than a new top-level group.

## Deferred within T9 (infra, tracked)

- internationalization #1 (the "100% coverage" gate only checks key *shape*, certifying locales that are 11–17% untranslated English) and #2 (~16,300 baselined mojibake sequences in 9 locales) are localization-*content* / tooling problems, not hardcoded-string fixes — they need a translation pass + an encoding-repair plan, deferred as their own effort.

## What remains

T14/T15 (duplicated source-of-truth, guide/markdown correctness) and the Medium/Low tail, plus deferred sub-items (roadmap product decision, tour pause, terminal no-stop, knowledge type-bucket+legends, small T5 tail, theme rehydrate DOM-write, stats writable-FS, i18n coverage-gate hardening + mojibake). Per INDEX.md.
