# Changelog

All notable changes to **personas-web** are documented here.

Format: [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).
Versioning: [Semantic Versioning](https://semver.org/).

## [Unreleased]

### Added

- OSS-release foundation: `README.md` (product overview, quickstart, env table,
  commands, conventions, repo layout), `LICENSE` (MIT), `.env.example`
  covering all 14 public + server env vars, `package.json` description /
  license / keywords / helper scripts (`typecheck`, `test:e2e`).
- Populated `.claude/CLAUDE.md` with real project conventions (i18n, semantic
  tokens, animation gating, React 19 rules, Sentry PII, commit format,
  out-of-scope behaviors).
- Missing `heroTransition` i18n namespace in `en.ts` and the 13 non-en
  locales (English placeholders for non-en pending translation).

### Changed

- React 19 compiler compliance (`react-hooks/set-state-in-effect`,
  `react-hooks/purity`): refactored reset-on-prop-change patterns across 9
  components (TerminalSim, UndoToast, connector-modal, useConnectorPath,
  ArenaTab, ChatTab, DevToolsRunner, AnimatedMetric, Checklist) to use the
  prev-state-in-render idiom, lazy `useState` initializers, or
  `setTimeout(0)` deferral. Cached `Math.random` per-instance in NeuralArm
  via a lazy initializer.
- `eslint.config.mjs`: respect the `_`-prefix convention for unused vars
  (argsIgnorePattern / varsIgnorePattern / caughtErrorsIgnorePattern /
  destructuredArrayIgnorePattern = `^_`).
- Avatar images (`/dashboard/settings`, dashboard navbar) swapped from
  `<img>` to `next/image` with `unoptimized` — Supabase-hosted URLs don't
  benefit from per-request optimization at these sizes.
- WCAG-AA contrast: raised 100 `text-*/<60` opacity modifiers to `/60`
  across 56 files (original violation was 95 instances; the sweep also
  touched 5 in contexts the rule didn't flag but the author pattern
  intended). Two decorative exceptions in `features/` preserved per
  author-marked `eslint-disable-next-line` directives.
- Animation gating: imported and called `useReducedMotion` in 9 files
  using `requestAnimationFrame` so the custom
  `require-animation-gating` contract is enforced; meaningful reduced-motion
  branches added to useAnimatedNumber, useCanvasCompositor, QualityContext,
  PhaseCardStrip, useToolSelection, and RaceTimer.
- Wrapped array-default values (`data?.x ?? []`) in `useMemo` in dashboard
  pages (`home`, `observability`, `usage`) to stop downstream `useMemo`
  invalidations on every render. Reshaped `Checklist` hydration to use
  `Array.from({ length: items.length }, …)` so the effect dep set stays
  stable.

### Removed

- 31 dead imports across 17 files (icons, hooks, components no longer
  referenced). Two underscore-renamed no-op parameters (`_personaId` in
  `mockApi.executePersona`, `_config` in `templates.ts` templateList
  destructure).
- Two stale `eslint-disable-next-line jsx-a11y/interactive-supports-focus`
  directives in `ToolGrid.tsx` (rule no longer fires for the flagged
  patterns).

### Fixed

- 4 TypeScript errors in `HeroTransition.tsx` referencing a missing i18n
  namespace — now compiles clean.
- 10 React 19 compiler lint errors (9 × `set-state-in-effect`, 1 ×
  `purity`) across the components listed above.

### Security

- No change: Sentry PII scrubbing (`src/lib/sentry-pii.ts`), security
  headers (`next.config.ts`), Supabase anon-key-only client usage, and
  `.env*` gitignore rules already met the bar at session start.
- Known: `npm audit` flags 1 high-severity transitive `picomatch` advisory
  in build-time deps (`@rollup/plugin-commonjs`). Not exposed to runtime;
  `npm audit fix` pending a dep-upgrade pass.

### Quality gates (end of session)

- `npx tsc --noEmit`: 0 errors
- `npm run lint`: 0 errors, 0 warnings
- `npm run build`: green (123 routes)
- `npx playwright test`: not re-run this session (12 specs in `e2e/`)

---

## [0.1.0]

Pre-release baseline. See `git log` for history prior to changelog
adoption.
