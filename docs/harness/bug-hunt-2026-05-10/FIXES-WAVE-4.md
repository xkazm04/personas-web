# Bug Hunter Fix Wave 4 — Animation Lifecycle / Observer Cleanup

> 3 commits, 3 findings closed (1 Critical + 2 High).
> Baseline preserved: `tsc --noEmit` 0 → 0 errors.
> **9 of 9 criticals across the entire INDEX are now closed.**

This wave closed the last remaining critical (`useCanvasCompositor`
IntersectionObserver leak across HMR/strict-mode) and applied two
related fixes around timer-cleanup-on-phase-change and
visibility-aware simulation. The wave was deliberately bounded —
Theme D in the INDEX has ~15 findings, but the larger
"shared `useVisibilityPause` primitive applied across all simulations"
refactor was deferred to a focused follow-up; this wave closed the
critical and the two highest-leverage adjacent fixes.

## Commits

| # | Commit | Findings closed | Severity | Files |
|---:|---|---|---|---|
| 1 | `c8042d1` fix(useCanvasCompositor): capture observer refs at mount, don't lazily re-create in cleanup | shared-ui #3 | C | `hooks/useCanvasCompositor.ts` |
| 2 | `8fb84da` fix(terminal-sequence): per-effect timer cleanup, drop shared timeoutRef | platform-architecture #1 | H | `components/sections/platform-command/use-terminal-sequence.ts` |
| 3 | `16b9440` fix(playground-split): cancel simulation on tab hide, refuse to start while hidden | event-bus-showcase (visibility cluster) | H | `components/sections/playground-split/use-playground-simulation.ts` |

## What was fixed

### 1. useCanvasCompositor — observer-recreation leak (commit 1) — CRITICAL

The cleanup path called `getIntersectionObserver()` and
`getResizeObserver()` to `.unobserve(canvas/parent)`. Each is a lazy
singleton: when the module-level slot is null, the getter synthesizes
a brand-new observer. Under React 19 strict-mode double-invoke and
HMR teardown, two compositor cleanups run in sequence — the first
cleanup's "registrations.size === 0" branch nulls the slot, then the
second cleanup's `getIntersectionObserver()` call recreated a fresh
observer just so it could run `.unobserve()` on a canvas that
observer never observed, and that fresh instance was leaked (or, in
the edge case, disconnected at the end of the same cleanup but with
the loop already stopped).

Capture the active observers at mount time into local refs (`ioRef`,
`parentRoRef`). Cleanup uses those refs and skips the unobserve when
the captured ref no longer matches the module-level singleton — i.e.
a peer cleanup already disconnected and nulled it, so unobserving on
a stale handle is a no-op anyway. The "registrations.size === 0"
disconnect block stays unchanged and remains the single owner of the
teardown.

### 2. Terminal sequence — shared timer ref leak (commit 2) — HIGH

The terminal-sequence hook parked its setTimeouts in a single shared
`timeoutRef` that 4 effects (idle→typing warm-up, typing, output,
summary→done) and 3 callbacks (`advanceToNext`, `skipCommand`,
`restart`) all wrote to without clearing first. Phase changes — and
StrictMode double-invokes in dev — overwrote the ref while the prior
timer was still scheduled, so the orphan fired ~delay-ms later and
called `setState` into a phase that had already moved on. Visible
symptoms: judder during typing, "skipped" characters when hovering,
and a double-fire of the summary→done transition.

Each `useEffect` now parks its own timer in a local closure and
clears it from its own cleanup. Phase changes naturally trigger
React's effect cleanup, so `skipCommand` / `restart` no longer need
to manually `clearTimeout` — setting `setPhase` to a new value runs
the old phase's cleanup before the new effect schedules. The
`isActiveRef` mount guard remains so already-fired timers don't call
`setState` after unmount.

### 3. Playground-split — visibility-aware simulation (commit 3) — HIGH

The simulation queued all phase timers up front via Date-based
absolute setTimeouts. When a user started a run and immediately
backgrounded the tab, browser timer throttling let the timers fire
at some platform-specific cadence — but the `elapsedMs` setInterval
kept ticking too — and on refocus the user saw a finished animation
they never watched, with `elapsedMs` at `TOTAL_DURATION_MS`. Worse,
partial progress when throttling was lighter showed a half-played
simulation in a state nobody started.

Subscribe to `usePageVisibility`. When the tab becomes hidden
mid-run, clear all timers and reset to idle — the user can
re-trigger the example when they come back. Refuse to start a new
simulation while `document.hidden` (`handleExampleClick` guard) so a
tab-backgrounded click doesn't queue a race the user can't see.

## Verification table

| Gate | Before wave | After wave |
|---|---:|---:|
| `tsc --noEmit` errors | 0 | 0 |
| Wave-4 commits | 15 (cumulative from waves 1-3) | 18 |
| Critical findings closed (cumulative) | 8 / 9 | **9 / 9** |
| High findings closed (cumulative) | 11 / 75 | 13 / 75 |

## Cumulative status (after wave 4)

- 22 of 178 findings closed (12.4%).
- **🎉 ALL 9 of 9 criticals closed.**
- 13 of 75 highs closed.

| Wave | Theme | Closed |
|---:|---|---:|
| 1 | A. Security / Auth / Vote integrity | 8 |
| 2 | B. State corruption (personas/reviews/event-bus stores) | 7 |
| 3 | C. SSE + streaming reliability | 4 |
| 4 | D. Animation lifecycle / observer cleanup / visibility pause | 3 |
| 5 | E. SSR / hydration / theme + i18n flash | — |
| 6 | F. Data integrity / SEO / ordering | — |
| 7 | G. A11y / focus / scroll-lock / modal lifecycle | — |

## Patterns established (catalogue items 13–15)

13. **Don't call lazy getters from cleanup paths.** When a module-level
    singleton is initialized via a `getX()` lazy getter that synthesizes
    when null, calling that getter from cleanup is a code smell — the
    cleanup might be the very path that's about to null the singleton.
    Capture the active reference at the call-site that needs it (mount,
    in this case) and use the captured ref at cleanup. The cleanup
    becomes idempotent across teardown ordering.
14. **Per-effect timer ownership > shared timer ref.** When a single
    `useRef` is mutated by multiple effects + callbacks, the one that
    wrote last "wins" but the others' pending timers are silently
    orphaned. Each `useEffect` should park its timers in a local closure
    and clear them in its own cleanup; phase changes trigger natural
    React-driven cleanup so callbacks don't need to manually
    `clearTimeout` either. The `isActiveRef` mount guard is still
    useful as a backstop for timers that fired before cleanup ran.
15. **Visibility-pause must be designed in, not retrofitted.** Animation
    code with all-timers-scheduled-up-front (typical "just queue the
    next 6 steps with absolute delays") cannot be cleanly paused
    mid-flight on `visibilitychange`. The viable paths are: (a) cancel
    on hide and let the user re-trigger (what wave-4 chose for
    `playground-split`), or (b) restructure to a frame-driven model
    that consumes its time budget tick-by-tick. Picking the right
    primitive at design time is much cheaper than retrofitting.

## What remains (across the open themes)

- **Theme D follow-ups** — same shape applies to
  `use-pipeline-simulation`, `use-chat-sequence`, `useAutoCycle`-driven
  hooks, and `event-bus-demo`. Each is small but the catalogue's
  pattern 15 says picking the primitive matters more than the
  individual fixes; a `useVisibilityPause()` shared hook is the
  recommended next step for theme D.
- **Theme E (SSR / hydration / theme + i18n flash)** — no criticals;
  4-5 fixes around theme post-hydration FOUC, `<html lang>` hardcoded
  to "en", RTL `dir` not set, i18n English flash on switch. Visible
  user-facing issues; good UX win per fix.
- **Themes F, G** — bigger surface area; data integrity / SEO and
  a11y / focus / scroll-lock.

## Deliberately deferred (out of scope this wave)

- `use-pipeline-simulation` and `use-chat-sequence` visibility-pause —
  same shape as `use-playground-simulation` finding #3 from this
  wave. Skipping for now since the third pattern in the catalogue
  argues for a shared `useVisibilityPause` primitive instead of
  retrofitting each simulation individually.
- `useAutoCycle` and `useLiveStats` lifecycle (animation hooks
  affected by visibility) — separate session, see catalogue item 15.
- `usePolling` infinite-retry behaviour — partially mitigated by the
  wave-3 SSE crash storm fix (since polling fallback only kicks in
  when SSE genuinely fails), but a dedicated retry cap belongs with
  the orchestrator outage detection / toast bus deferred from wave 2.

## What's next?

With all 9 criticals closed and the security / state-corruption /
streaming / animation-cleanup themes addressed, the remaining work
is the long tail: 156 findings across themes E (hydration / FOUC /
i18n parity), F (data integrity, SEO, ordering), G (a11y, focus,
scroll-lock, modal lifecycle), plus the theme-D follow-ups.

Recommended next wave: **Theme E (SSR / hydration / theme + i18n
flash)**. No criticals, but the findings are very visible UX issues
on the public marketing surfaces (theme switching flickers; `<html>`
locale is wrong for SEO and screen readers; Arabic UI doesn't get
RTL). 4-5 fixes; high impact on perceived quality.
