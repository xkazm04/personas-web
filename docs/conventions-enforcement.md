# Which non-negotiable is enforced by what

`.claude/CLAUDE.md` states the repo's numbered conventions. This page says, for each one,
what fails mechanically when it is broken and what is left to the agent's own care, so an
agent knows where a green run proves something and where it proves nothing.

Levels:

- **gate**: a check fails CI (or the pre-push hook) when the rule is broken.
- **partial**: a check covers part of the rule; the column on the right names the rest.
- **care**: nothing mechanical checks it; only review does.

`src/lib/conventionsEnforcement.test.ts` keeps this table joined to CLAUDE.md. It fails
`test:unit` when a numbered convention has no row (or a row names a convention that is
gone), and when an enforcer named here does not exist: a missing file, an unknown
`npm run` script, or an eslint rule id that `eslint.config.mjs` does not register.

## Conventions

| # | Convention | Level | Enforced by | Left to the agent |
|---|---|---|---|---|
| 1 | i18n | partial | `npm run typecheck` (every locale implements the `Translations` shape of `src/i18n/en.ts`); `npm run check:i18n-coverage` and `npm run check:i18n-encoding` (CI, pre-push); `npm run check:i18n-ledger` (CI); `npm run copy:check` (pre-push, pending English copy) | Hardcoded English in JSX, `aria-label`, `alt` or `metadata`: `npm run report:i18n-hardcoded` only reports it. Whether a translation is a real translation and not English pasted in. |
| 2 | Semantic Tailwind tokens | partial | `custom-a11y/no-low-text-opacity` (`eslint-rules/no-low-text-opacity.js`), under the lint warning ceiling | `text-white`, `bg-black` and raw hex colours: no rule. |
| 3 | Animation gating | partial | `custom-animation/require-animation-gating` (`eslint-rules/require-animation-gating.js`): `requestAnimationFrame` and `<canvas>` need a gate | framer-motion and CSS motion, reduced-motion values deciding markup, stillness for infinite loops, and pausing ambient loops on a hidden tab. Prefer `src/hooks/useStillMotion.ts`. |
| 4 | React 19 rules | gate | `npm run lint`: the React hooks and purity rules that `eslint-config-next` ships (errors, not warnings) | The prev-state reset pattern is the fix the rule asks for; choosing it is still care. |
| 5 | Sentry PII | partial | `src/lib/no-raw-sentry-capture.test.ts` (no raw `Sentry.captureException` outside an allowlist); `src/lib/sentry-pii.test.ts` (what the scrubber removes) | Whether a new `extra` or breadcrumb shape carries a field the scrubber does not know. |
| 6 | Supabase | partial | `src/lib/serviceRoleServerOnly.test.ts` (the service_role key is read only in `import "server-only"` modules, never under a `NEXT_PUBLIC_` name); `next build` (a client import of a server-only module fails) | Guarding every Supabase call behind an env check and falling back to mocks. |
| 7 | Commits | partial | `scripts/check-ai-change.mjs` in `.github/workflows/ai-change-gate.yml` reports the `<pass-id>/<area>:` format and a misnamed conventional type, as advice only | One atomic change per commit. The format itself never fails a run. |
| 8 | Client/server boundary | gate | `src/lib/sitemapRoutesHaveMetadata.test.ts` (every sitemap route has metadata); `next build` (a `"use client"` page exporting `metadata` fails) | Pushing `"use client"` down to the interactive leaf. |
| 9 | Bundle budget | gate | `npm run check:bundle` in CI, against `bundle-budget.json` | Deferring a heavy import rather than re-baselining. |
| 10 | Dashboard loading tiers | care | none | The T0 to T3 tiers in `docs/features/dashboard/loading-orchestration.md`. |
| G | Git policy | gate | `.claude/settings.json` `permissions.deny` (no `--no-verify`, no force-push); `scripts/check-ai-change.mjs` fails an agent commit that writes under `.claude/` | Not pushing and not opening a PR unless asked. |

## Lint rules no numbered convention names

`eslint.config.mjs` also registers `custom-zustand/no-multi-zustand-selector` (one
selector per store hook), `custom-quality/max-tsx-lines` (200-line `.tsx` files) and
`custom-quality/no-confusable-minus` (an error, not a warning). They hold code-health
rules CLAUDE.md does not number.

## Candidates for a cheap gate

The **care** rows, and the right-hand column of the **partial** rows, are where a lint rule
or spec would pay off first:

- raw colour utilities (`text-white`, `bg-black`, hex) as a lint rule beside
  `custom-a11y/no-low-text-opacity`;
- the dashboard loading tiers: a spec that every view under
  `src/components/dashboard/views/` mounts its deep content through `Deferred`;
- unguarded Supabase calls: a spec that every `getSupabase` / `getSupabaseAdmin` caller
  checks the env helper first.
