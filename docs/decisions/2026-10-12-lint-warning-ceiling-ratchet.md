# 2026-10-12 Lint warnings sit under a ceiling that only goes down; `package.json` owns the number

## Context

`npm run lint` runs ESLint with `--max-warnings`. The reasoning for that ceiling was kept as a long header comment in `eslint.config.mjs`, together with the history of each cleanup. Each cleanup lowered the number in `package.json` and left the comment alone, so the comment now names ceilings that no longer exist. An agent reading the config learns the wrong number. This record keeps the policy and leaves the history to `git log -- package.json`.

## Decision

1. **Two severities.** `error` is for a rule that can see the whole failure it names, where any new instance is a defect (for example `custom-quality/no-confusable-minus`: a U+2212 in source is never intentional). `warn` is for a rule that points the right way but cannot fully see its target, or whose existing hits are tracked debt nobody has scheduled.
2. **A ceiling on warnings.** The `lint` script in `package.json` passes `--max-warnings` set to today's count, so a new warning fails the build. That script is the only place the number lives. No comment, doc or overlay restates it.
3. **The ceiling only goes down.** ESLint passes silently below the ceiling, so whoever fixes a warning lowers the number in `package.json` in the same commit. This is the same ratchet as `scripts/check-i18n-encoding.mjs` with `scripts/i18n-encoding-baseline.json`.
4. **`custom-animation/require-animation-gating` stays `warn`.** It only fires on raw animation-frame and canvas use, so it cannot see the CSS and framer-motion paths behind the failures that motivated it. Promote it once it can. Until then the ceiling stops its count from growing.

## Alternatives rejected

- **Promote every warning to `error`.** That would break the build on day one for debt this policy did not create. The likely response is to delete `--max-warnings` or switch rules off.
- **No ceiling.** Warnings would then grow without anyone owning the next one.

## Follow-up (needs a person)

`eslint.config.mjs` is a gate config that unattended lanes may not edit. Replace its header comment with a one-line pointer to this record. `.claude/architect/config.md` also restates the number in prose. Remove it there the same way.
