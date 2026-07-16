# Fix Wave 1 — Reduced-motion "empty section" (theme T4)

> 4 commits, 4 findings closed (1 Critical + 3 High).
> Baseline preserved: tsc 0 → 0 · vitest 64/64 → 64/64 · 0 regressions.

## Commits

| # | Commit | Finding closed | Severity | File |
|---|---|---|---|---|
| 1 | `5532d31` | animation-motion-system #1 | Critical | CinematicBreather.tsx |
| 2 | `00217ce` | observability-deck-security-vault #1 | High | PulseGridDeck.tsx |
| 3 | `a94cea9` | memory-layers-multi-provider #1 | High | designMatrixShared.tsx |
| 4 | `4…` (docs) | animation-motion-system #2 | High | lib/animations.ts |

## What was fixed

1. **CinematicBreather headline** — under `prefers-reduced-motion` the typewriter chars kept `tw-char-hidden` (opacity:0) forever, so the flagship "Your agents. / Your rules. / Your infrastructure." headline was invisible. Now reduced motion renders chars with no hiding class (immediate end-state) and skips the decorative pulse overlay.
2. **PulseGridDeck** — reduced motion early-returned before the sim interval, leaving every lane idle/zero while the chrome still read "streaming / auto-refreshing". Now seeds a deterministic populated snapshot and the labels read "snapshot".
3. **Persona Matrix** — reduced motion never ran the build, leaving 8 pending skeletons and an unreachable replay button. Now sets the resolved end-state (full prompt, all cells filled, phase done) instantly; replay uses the same instant path.
4. **animation-motion-system contract** — added Rule 4 distinguishing decorative ambience (may `return null`) from content-bearing animation (must render the static end-state), the root cause that let all three above ship.

## Verification

| | Before wave | After wave |
|---|---|---|
| tsc errors | 0 | 0 |
| vitest | 64/64 | 64/64 |

## Patterns established (catalogue items 1–2)

1. **Reduced-motion-hides-content** — a motion component that gates by `if (reduced) return null` / never-runs is an a11y regression whenever the animation reveals content. Fix: render the final/static end-state; only pure ambience may return nothing. Grep proactively for `prefersReducedMotion` / `if (reduced) return` in components that render text or data.
2. **Motion label honesty** — when a live-updating surface is frozen for reduced-motion users, its "streaming / live / auto-refreshing" labels become lies. Swap them to a truthful static label ("snapshot") in the same change.

## What remains

Security (T1) deferred for user sign-off. Themes T2, T3, T5–T15 open per INDEX.md wave plan.
