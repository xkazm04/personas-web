# Bug Hunter — Shared UI Primitives & Animations

> Total: 7 findings (Critical: 1, High: 3, Medium: 2, Low: 1)
> Scope: 16 files (sampled from 33)
> Date: 2026-05-10

## 1. `useTweenedNumber` flashes to 0 on every target change mid-tween

- **Severity**: High
- **Category**: Race condition / animation glitch
- **File**: `src/hooks/useTweenedNumber.ts:21-37`
- **Scenario**: Target changes rapidly (e.g. live-stat number updates from 1,200 → 1,210 → 1,220 every few seconds while a previous tween is still running).
- **Root cause**: When `target` changes, the effect re-runs. It cancels the previous RAF, then starts a new one with `start = performance.now()`. The very next paint sets `setValue(target * easeOutCubic(0))` which equals `0`, **regardless of where the previous tween was**. There is no `from`/`startValue` capture — the hook always interpolates from zero. The initial state `useState(() => shouldAnimate ? 0 : target)` is correct, but every subsequent target change repeats that "from-zero" jump.
- **Impact**: Visible flicker on any live-updating counter (DORA dashboard cards, observability charts). Numbers visibly snap to 0 then climb back, looking like a network hiccup.
- **Fix sketch**: Capture `const from = value` at effect start (or use a ref that mirrors `value`), then interpolate `from + (target - from) * easeOutCubic(t)`. `useAnimatedNumber.ts` already does this correctly — port the pattern.

## 2. `useAutoCycle` can divide by zero / show invalid index when `count` drops to 0

- **Severity**: High
- **Category**: Edge case / runtime error
- **File**: `src/hooks/useAutoCycle.ts:54-83`
- **Scenario**: A list-driving cycle (e.g. WhyAgents, AgentsTimeline) momentarily renders with `count === 0` (loading state, filtered-out result, hot reload removing all items, i18n strings missing).
- **Root cause**: The clamp on line 56 only fires when `count > 0`. If `count === 0` the effect early-returns (line 64) — fine. But `active` stays at its last non-zero value. When `count` flips back to >0, the modulo `(i + 1) % count` recovers, but in the interim, consumers reading `active` (e.g. as an array index) get an out-of-bounds index → `undefined` → render crash. Worse: if `count` becomes a negative number through a parent bug, `Math.max(intervalMs, 16)` still schedules and `% -1 = 0` etc., but `(i + 1) % -3` returns negative — array indexing returns `undefined`.
- **Impact**: When data arrays empty out transiently (e.g. WebSocket reconnect clears feed), consumers using `items[active]` crash with "Cannot read properties of undefined". Silent in dev because count typically stays stable.
- **Fix sketch**: Clamp `active` to `0` whenever `count === 0` and reset to `0` whenever `count` increases from zero. Document that consumers MUST guard `items[active]` against undefined when count can be zero.

## 3. `useCanvasCompositor` cleanup re-creates observer it just nulled (HMR / strict-mode bug)

- **Severity**: Critical
- **Category**: Race condition / observer leak
- **File**: `src/hooks/useCanvasCompositor.ts:205-229`
- **Scenario**: React 19 strict mode double-invokes effects in dev. Two compositor users mount → both run cleanups in sequence on unmount. Also fires during HMR / route transitions where multiple canvases unmount near-simultaneously.
- **Root cause**: Cleanup calls `getIntersectionObserver().unobserve(canvas)` (line 208) and `getResizeObserver().unobserve(parent)` (line 218). Both are getter functions that **lazily create a new observer if the module-level reference is null**. After the LAST registration is removed, the previous cleanup ran lines 224-228 which set both observers to `null` and disconnected them. If two cleanups interleave (registration count goes 2 → 0 in two tear-downs), the second cleanup's `getIntersectionObserver().unobserve(canvas)` instantiates a brand-new observer, then `unobserve` on it is a no-op — but the new observer is now leaked because line 224's `if (registrations.size === 0)` then nulls it without calling `disconnect()` on the freshly created (but never-used) observer. Across a session this leaks IntersectionObservers; the observers also still hold references to the global callback closures.
- **Impact**: Memory leak across page navigations and dev HMR cycles. Every navigation re-creates and abandons IntersectionObservers. Native observer objects are not GC'd quickly because the global callback closures keep the module's `byCanvas`/`registrations` Maps alive.
- **Fix sketch**: In cleanup, read the observer reference into a local first (`const io = intersectionObserver; io?.unobserve(canvas)`) — do NOT call the getter, which has create-side-effects. Same fix at line 218 for `resizeObserver`.

## 4. `useCanvasCompositor` & `ParticleHost` ResizeObserver schedule RAF that survives unmount

- **Severity**: Medium
- **Category**: Latent failure / silent leak
- **File**: `src/hooks/useCanvasCompositor.ts:109-122` and `src/components/ParticleHost.tsx:155-167`
- **Scenario**: Window resize during page navigation; canvas/host unmounts between RO callback firing and the queued RAF running.
- **Root cause**: Both compositors do `new ResizeObserver(entries => { requestAnimationFrame(() => { ... }) })`. The RAF id is **never stored** and never cancelled. If the parent element is removed from the byParent/byHostEl map between callback fire and RAF execution, `byParent.get(entry.target)` returns undefined and the loop no-ops — silent. But the RAF callback still fires once per disconnected RO entry, and each pinned closure prevents GC of the entries array (which itself holds DOM references).
- **Impact**: Minor leak per resize event near unmount boundaries. Not catastrophic but accumulates on a long session with many route changes during window resizing.
- **Fix sketch**: Store the RAF id in a module-level variable, cancel it at the top of the next callback or on observer disconnect. Or read fresh state from the maps inside the RAF instead of capturing `entries` (since entries themselves only need target + bbox).

## 5. `useAnimationPause` registry retains detached DOM elements

- **Severity**: Medium
- **Category**: Memory leak across navigations
- **File**: `src/hooks/useAnimationPause.ts:29-41, 100-114`
- **Scenario**: A client component crashes inside its render (error boundary catches), or React skips its effect cleanup due to an error in another cleanup, or `_registered` keeps an Element from a previous page that didn't call `deregisterAnimationElement`.
- **Root cause**: `_registered: Set<Element>` is a strong reference to DOM nodes. The cleanup in `useAnimationPauseRegister` (line 110) only runs if React reaches it — any swallowed error elsewhere leaves the entry. Also, the observer cleanup at line 86-88 disconnects the IO and nulls `_observer`, but **`_registered` is never cleared**. If the *new* `useAnimationPause` mounts after a route change, line 81 re-observes everything in `_registered` — including elements that were removed from the DOM on the previous page. IntersectionObserver tolerates detached targets (no fire), but the elements are pinned in memory forever.
- **Impact**: Long sessions with many navigations slowly accumulate detached DOM. Each page's animated elements pin themselves in `_registered` until full app reload. Hard to detect without heap snapshot diffing.
- **Fix sketch**: Use `WeakSet` for `_registered` (loses iteration but observer.observe is idempotent and re-mount cycle handles re-observation), or — better — periodically prune entries whose `el.isConnected === false`, or clear `_registered` entirely when `_observer` is nulled (since registrations should re-fire on remount).

## 6. `SectionObserverContext` thrashes observers when `sectionIds` array reference changes

- **Severity**: High
- **Category**: Performance hazard / observer churn
- **File**: `src/contexts/SectionObserverContext.tsx:125-178`
- **Scenario**: Parent passes `sectionIds={["foo","bar"]}` inline (very common pattern), so the array's identity changes every render. Or the array is derived via `.map()` / `.filter()` in the parent without memoization.
- **Root cause**: The effect depends on `sectionIds` (line 178). On every parent render, the effect tears down — calling `unobserve(id)` for every id, disconnecting the MutationObserver, clearing the timeout — then re-runs, re-observing every section, attaching a fresh MutationObserver on `document.body`, and starting a new 30 s timeout. Each cycle also writes `data-section-id` attributes. Combined with the always-running `orderedIdsRef` write effect (line 48, no deps array — runs after every render), this creates a hot loop on parent re-render.
- **Impact**: Layout thrashing on routes that re-render frequently. The MutationObserver on `document.body` with `subtree: true` is *especially* expensive to re-attach. Visible jitter in the ScrollMap/ScrollSpy because the active section briefly resets to null between cleanup and re-observation.
- **Fix sketch**: Stabilize `sectionIds` by joining-and-comparing: derive a string key (`sectionIds.join("|")`) and depend on that, OR document at the consumer that `sectionIds` MUST be memoized. Internally, diff old vs new ids and only observe/unobserve the delta — don't disconnect on every parent render.

## 7. `usePolling` swallows errors silently — endless retry on permanent failures

- **Severity**: Low
- **Category**: Silent failure
- **File**: `src/hooks/usePolling.ts:19-25, 66-75`
- **Scenario**: Polling endpoint returns 500 / 401 / network error every time (auth expired, backend down, CORS blocked).
- **Root cause**: `tick()` wraps the callback in a bare `try/catch {}` that swallows every error. The polling loop continues forever, hitting the failing endpoint at the configured interval. There's no backoff, no max-retry, no error surfacing. Only the `enabled`/`isHidden` flags can stop it.
- **Impact**: Infinite retry storm against a dead/unauthorized endpoint. With `intervalMs=5000` that's 12 req/min/tab forever, even when the user is on a working page that just happens to mount this hook. Fills server logs and burns rate limits silently.
- **Fix sketch**: Track consecutive failures, apply exponential backoff (cap at e.g. 5× intervalMs), and either (a) expose an `error` return value so callers can render a banner, or (b) accept a `maxFailures` option that disables polling after N consecutive errors. At minimum, log the swallowed error in development with a rate-limit so it's discoverable.
