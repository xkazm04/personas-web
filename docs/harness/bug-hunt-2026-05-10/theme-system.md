# Bug Hunter — Theme System

> Total: 7 findings (Critical: 0, High: 3, Medium: 3, Low: 1)
> Scope: 5 files
> Date: 2026-05-10

## 1. FOUC + theme flash on first-ever visit (random theme races first paint)

- **Severity**: High
- **Category**: Latent failure / FOUC
- **File**: `src/components/ThemeInit.tsx:8`, `src/app/layout.tsx:88,110`, `src/stores/themeStore.ts:117`
- **Scenario**: First-ever visit (no `personas-theme` in localStorage). `<html>` ships from the server with hardcoded `class="dark"` and no `data-theme`, so the browser paints the default `dark-midnight` palette. Then `ThemeInit` mounts in a `useEffect` *after* hydration, runs `initRandomTheme()`, which calls `applyThemeToDOM(<random>)` — the user sees a visible flash from midnight to e.g. `dark-matrix` (green), `light` (white blast), or `light-news` on every cold load.
- **Root cause**: The "random theme on first visit" decision is deferred to a post-hydration `useEffect` instead of being committed via a blocking, pre-paint inline `<script>` in `<head>`. There is also no SSR cookie round-trip to lock the random pick on the server.
- **Impact**: Visible color flash on every first-load (and on any session where localStorage was cleared). On `light*` randoms the flash is from a near-black page to a near-white one — extremely jarring and bad for LCP/CLS-adjacent perceptual stability.
- **Fix sketch**: Move the init logic to a synchronous inline `<script>` injected in `<head>` (before paint) that reads `localStorage.getItem('personas-theme')`, picks a random theme if absent, persists it (so Zustand picks it up), and sets `data-theme` + `dark` class on `documentElement` synchronously. Then `ThemeInit.tsx` becomes a no-op (or only handles the rehydrate-mismatch case). Pair with `suppressHydrationWarning` already on `<html>`.

## 2. Hydration mismatch: server emits `class="dark"` for users on light themes

- **Severity**: High
- **Category**: Hydration mismatch
- **File**: `src/app/layout.tsx:88`, `src/stores/themeStore.ts:43-71`
- **Scenario**: A returning user previously selected `light`, `light-ice`, or `light-news`. The server still renders `<html lang="en" className="dark">`. On hydration, `onRehydrateStorage` fires and `applyThemeToDOM("light")` removes the `dark` class — but only after the first paint already used dark token values (white text on light backgrounds is unreadable for a frame). `suppressHydrationWarning` on `<html>` silences the React warning but does **not** prevent the visual flash or the SSR HTML lying about the class.
- **Root cause**: The `dark` class on `<html>` is hardcoded server-side independent of any theme signal. There is no cookie, header, or pre-paint script to reconcile.
- **Impact**: Flash of wrong palette on every page load for the ~27% of themes that are light variants; momentarily unreadable text; accessibility regression (contrast inversion).
- **Fix sketch**: Same inline `<head>` script as #1 — it should read the persisted theme and write the correct `dark` / no-`dark` class + `data-theme` before React hydrates. Remove the hardcoded `className="dark"` from `<html>` and let the script own it.

## 3. `data-theme` and `.dark` class can desync (multiple-class coexistence)

- **Severity**: Medium
- **Category**: DOM-class management
- **File**: `src/stores/themeStore.ts:49-60`
- **Scenario**: `applyThemeToDOM` toggles `dark` based on `meta.isLight`. If `THEMES.find()` returns `undefined` (e.g. a dev temporarily passed an unregistered ID via `setTheme(... as any)` or via a stale persisted value that bypassed validation), `meta?.isLight` is `falsy` → the function falls into the `else` branch and force-adds `dark`, but `data-theme` was already set to the unknown id. Result: `<html data-theme="bogus" class="dark">` with no matching CSS variables — fully broken visual state, no warning logged.
- **Root cause**: No early-exit / validation inside `applyThemeToDOM`; the function trusts the caller. `setTheme` likewise has no `VALID_THEME_IDS.has(themeId)` guard (the validator only runs in `onRehydrateStorage`).
- **Impact**: Silent broken styling on bad inputs; harder to debug because nothing complains.
- **Fix sketch**: At top of `applyThemeToDOM`, `if (!VALID_THEME_IDS.has(themeId)) { console.warn(...); themeId = "dark-midnight"; }`. Apply the same guard inside `setTheme`. Consider making the function the single source of truth for class management by also doing `el.removeAttribute("data-theme")` for *every* theme that resolves to default, not just the literal string `"dark-midnight"`.

## 4. Default theme `"dark-midnight"` cannot apply tokens via `[data-theme]` (selector never matches)

- **Severity**: Medium
- **Category**: Edge case / token mapping
- **File**: `src/stores/themeStore.ts:49-53`, `src/styles/themes.css` (no `[data-theme="dark-midnight"]` block)
- **Scenario**: `applyThemeToDOM("dark-midnight")` calls `el.removeAttribute("data-theme")`. `themes.css` has rules for every other theme but none for `dark-midnight` — its tokens live in `:root` / `.dark` defaults in `globals.css`. If a future contributor adds a `[data-theme="dark-midnight"] { ... }` block (a totally reasonable refactor) it will *never* apply because the attribute is intentionally removed for that one ID.
- **Root cause**: Implicit "default = remove attribute" coupling between TS and CSS, undocumented in either file. Special-casing the default at the imperative layer instead of always setting `data-theme` to the active id.
- **Impact**: Footgun for future theme work; subtle bugs where `dark-midnight` overrides "vanish" without explanation.
- **Fix sketch**: Always `el.setAttribute("data-theme", themeId)` regardless of id, and provide a `[data-theme="dark-midnight"]` block (can be empty / token-identity) in `themes.css`. Drop the `if (themeId === "dark-midnight")` branch.

## 5. localStorage access throws in private mode / sandboxed iframes — uncaught

- **Severity**: Medium
- **Category**: Edge case / silent failure
- **File**: `src/stores/themeStore.ts:119`, Zustand `persist` middleware
- **Scenario**: In Safari Private Browsing (older versions), some sandboxed iframes, and policy-locked enterprise browsers, `window.localStorage.getItem()` throws `SecurityError` instead of returning `null`. `initRandomTheme` calls it directly with no try/catch. The throw bubbles out of the `useEffect`, gets caught by React and logged as an unhandled error — the random-theme initialization never runs, the persist middleware also fails to rehydrate, and the user is silently stuck on the SSR default forever.
- **Root cause**: No defensive `try/catch` around `localStorage` access. Zustand's persist has its own error handling but the additional `getItem` in `initRandomTheme` is unguarded.
- **Impact**: Theme switcher appears non-functional in private mode (clicks "work" in-memory but never persist); first-visit randomization silently disabled; one error logged per page load.
- **Fix sketch**: Wrap the `getItem` in `try { ... } catch { /* treat as missing */ }` and proceed with the random pick. Also wrap the persist middleware's storage in a safe-storage adapter that no-ops on `SecurityError`.

## 6. Race: rapid theme switches between `set` and DOM class lifecycle

- **Severity**: Medium
- **Category**: Race condition
- **File**: `src/stores/themeStore.ts:88-96, 41-70`
- **Scenario**: User clicks 3 swatches in quick succession (< 300 ms). `applyThemeToDOM` is called 3 times. The `pendingTransitionTimeout` cancellation correctly handles `theme-transitioning`, but the React `set({ themeId })` calls happen *after* `applyThemeToDOM` — if React batches/coalesces (or if a concurrent rerender from a different store update interleaves), the active button highlight in `ThemeSwitcher` (driven by `themeId`) and the actual rendered colors (driven by DOM attribute) can briefly disagree. Worse, if `applyThemeToDOM` is invoked from `onRehydrateStorage` *after* a user-initiated `setTheme` (rehydrate is async), the rehydrated value overwrites the user's pick.
- **Root cause**: DOM mutation is performed imperatively *outside* the store transaction; there is no ordering guarantee between rehydrate completion and user input. Side effect occurs before state commit (`applyThemeToDOM` then `set`), making "intent vs. applied" observable mid-flight.
- **Impact**: Brief swatch/active-state desync; rare "my pick got reverted" bug if the user clicks before rehydration finishes (cold-cache hydration).
- **Fix sketch**: Subscribe to the store with `useThemeStore.subscribe((s) => s.themeId, applyThemeToDOM)` and remove the imperative call from `setTheme`/`shuffleTheme`/`onRehydrateStorage`. State becomes the single source of truth; DOM is a derived effect. Track a "user has picked" flag so rehydrate can't clobber an in-flight click.

## 7. System color-scheme preference change never propagates

- **Severity**: Low
- **Category**: Latent failure
- **File**: `src/stores/themeStore.ts` (entire file — no `prefers-color-scheme` listener)
- **Scenario**: User has never picked a theme. macOS auto-switches to light mode at sunset (or user toggles OS dark mode). The site continues showing whichever random theme was rolled on first visit because randomization is one-shot and persisted forever after the first call. There is no "system" theme option and no `matchMedia('(prefers-color-scheme: light)').addEventListener('change', ...)`.
- **Root cause**: First-visit init is "random and persist forever"; OS preference is never consulted.
- **Impact**: Surprising UX (site stays dark when OS goes light or vice-versa); accessibility miss for users who rely on OS-level light mode for readability. Documented behavior, but unlikely to match user expectation.
- **Fix sketch**: Add a `system` theme option (or an `auto` mode that resolves at apply-time). When `themeId === 'system'`, read `matchMedia` and pick `dark-midnight` or `light`; subscribe to the media-query `change` event to re-apply. Make `system` the default first-visit pick instead of random — use random only when the user explicitly clicks "shuffle".
