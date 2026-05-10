# Bug Hunter Fix Wave 5 — SSR / Hydration / Theme + i18n Flash

> 3 commits, 4 findings closed (4 High).
> Baseline preserved: `tsc --noEmit` 0 → 0 errors.

This wave bundled findings around **"decisions about visual identity
that ran *after* hydration produced visible flickers on cold load."**
Theme picking, locale lang/dir attributes, and translation flicker
all shared the same shape: state lived in `localStorage`, but the
React hooks that read it ran post-hydration, so SSR painted the
defaults and then the screen flashed to user state on first frame.
The fix moves the decisions into a tiny inline `<head>` script that
runs synchronously before any body parsing.

## Commits

| # | Commit | Findings closed | Severity | Files |
|---:|---|---|---|---|
| 1 | `c1c2a8c` fix(theme): apply theme + locale pre-paint via inline head script | theme #1, intl #2, intl #3 (paint half) | H+H+H | `app/layout.tsx`, `stores/themeStore.ts` |
| 2 | `3b4a8a1` fix(i18n): set/clear dir=rtl in applyLangAttributes for runtime locale changes | intl #3 (runtime half) | H | `stores/i18nStore.ts` |
| 3 | `b0be40d` fix(i18n): don't flash English while a non-en locale is loading | intl #4 | H | `i18n/useTranslation.ts` |

## What was fixed

### 1. Theme + locale pre-paint init (commit 1)

`ThemeInit`'s `useEffect`-driven `initRandomTheme` ran *after*
hydration. SSR painted with `className="dark"` and an absent
`data-theme` (the defaults baked into the layout JSX) → on first
cold visit, the screen flashed to whatever random theme the script
picked, every time, on every cold load — including white-on-dark
light variants. The same post-hydration timing applied to lang/dir
attributes: `applyLangAttributes` only ran after Zustand persist
rehydrated, so screen readers heard "en" for the first beat even
when the user had Arabic persisted, and Arabic UI rendered LTR.

Move both decisions into a tiny inline `<head>` script that runs
synchronously before any body parsing. Reads `localStorage` for both
the persisted theme (`personas-theme` zustand-persist envelope) and
locale (`personas-i18n-storage`); picks/persists a random theme if
absent; sets `data-theme` + `.dark` class + `lang` + `data-lang` +
`dir="rtl"` for `ar` before paint. `initRandomTheme` becomes a
lift-from-DOM-into-Zustand step so `ThemeSwitcher`'s "selected" badge
reads from the script's decision rather than re-running it. The
script has no module imports, no Zustand involvement, no modern
syntax that would need transpiling — it stays small enough to land
in `<head>` with no runtime cost.

### 2. RTL dir for runtime locale changes (commit 2)

The pre-paint script handles `dir=rtl` on first paint, but runtime
locale changes (LanguageSwitcher click, OAuth redirect, detected-
locale rehydrate) only ran `applyLangAttributes` which set `lang` +
`data-lang` and ignored `dir`. So the user could switch to Arabic
mid-session and the UI stayed LTR until a full reload re-fired the
inline script. Add a small `RTL_LANGUAGES` set and update
`applyLangAttributes` to set or remove `dir="rtl"` accordingly. Kept
in sync (with a comment) with the array hardcoded into the inline
script.

### 3. No English flash on locale switch (commit 3)

`useTranslation` `queueMicrotask`'d `setTranslations(en)`
unconditionally before the loader resolved, so a user switching
from `de` to `ja` saw the entire UI flicker through English for one
frame on first switch (and again on every cold visit until the
bundle was cached). The `en` flicker also fired on initial visit
when the persisted locale wasn't yet in `cache` — defeating the
cache hint and producing a fresh English flash on every reload of an
already-translated UI. Drop the unconditional `en` assignment. Keep
the current translations visible until the requested locale
resolves; the network round-trip is unchanged and a brief stale view
of the prior locale is strictly less jarring than mid-flow English.

## Verification table

| Gate | Before wave | After wave |
|---|---:|---:|
| `tsc --noEmit` errors | 0 | 0 |
| Wave-5 commits | 18 (cumulative from waves 1-4) | 21 |
| Critical findings closed (cumulative) | 9 / 9 | 9 / 9 |
| High findings closed (cumulative) | 13 / 75 | 17 / 75 |

## Cumulative status (after wave 5)

- 26 of 178 findings closed (14.6%).
- 9 of 9 criticals closed.
- 17 of 75 highs closed.

| Wave | Theme | Closed |
|---:|---|---:|
| 1 | A. Security / Auth / Vote integrity | 8 |
| 2 | B. State corruption (personas/reviews/event-bus stores) | 7 |
| 3 | C. SSE + streaming reliability | 4 |
| 4 | D. Animation lifecycle / observer cleanup / visibility pause | 3 |
| 5 | E. SSR / hydration / theme + i18n flash | 4 |
| 6 | F. Data integrity / SEO / ordering | — |
| 7 | G. A11y / focus / scroll-lock / modal lifecycle | — |

## Patterns established (catalogue items 16–17)

16. **Visual identity decisions belong in a pre-paint head script.**
    Anything the user *sees* on first paint that's controlled by
    persisted client state — theme, locale, color scheme, font scale —
    must be applied *before* React hydrates. A useEffect-driven
    "init on mount" guarantees a flash on every cold load. The script
    must be small (no imports, no transpilation), keyed to the same
    storage shape Zustand persist uses, and idempotent with the React
    code that reads it post-hydration. The Zustand store sync becomes
    a lift-from-DOM step rather than a parallel state machine.
17. **"Loading" should keep the prior visible state, not reset to a
    default.** `useTranslation`'s English flash, `usePolling`'s reset-
    to-undefined, and many SWR `keepPreviousData` arguments share a
    shape: when the new state is being fetched, the *prior visible
    state* is almost always the right thing to keep on screen. Reset-
    to-default is occasionally correct (form clear, filter reset) but
    is the wrong default for "switching to a different value of the
    same kind of thing." Look for `setX(defaultValue)` calls inside
    effect dependencies and ask: would the user be less confused
    seeing the *old* value briefly, or the *blank* value briefly?

## What remains

- **Theme F (Data integrity / SEO / ordering)** — blog post order,
  changelog drift, malformed dates, slug uniqueness, roadmap stuck-
  loader, templates SEO. Bigger surface area but no criticals.
- **Theme G (A11y / focus / scroll-lock / modal lifecycle)** — focus
  yank on route navigation, scroll-lock leaks across HMR/concurrent
  overlays, error boundary retry-loop cap, skip-link missing on
  dashboard.
- **Theme D follow-ups** — `use-pipeline-simulation`,
  `use-chat-sequence`, `useAutoCycle`-based hooks; same shape as the
  visibility-pause fix in wave 4 but deferred for the
  `useVisibilityPause` shared primitive instead of one-by-one.

## Deliberately deferred (out of scope this wave)

- Translation parity audit (intl finding #1: locales are ~54% the
  size of `en.ts`). The deepMerge fallback hides which keys are
  missing, but fixing that requires a dedicated content workstream
  (actual translation work) and probably a build-time check that
  fails CI on missing keys. Out of scope for a code-fix wave; flag
  to translation team.
- Theme transition smoothness on locale-only changes — the script
  doesn't add `theme-transitioning` class on first paint, so a cold
  load with persisted non-default theme is a hard cut. That's the
  *correct* behavior for first paint (no transition to fade *from*),
  but worth verifying no consumer depends on the class being set.

Recommended next wave: **Theme F (Data integrity / SEO / ordering)**
or **Theme G (A11y)**. Both are the long tail; either makes a
sensible "polish pass" session. The user can pick.
