# Bug Hunter — Homepage & Hero

> Total: 7 findings (Critical: 0, High: 3, Medium: 3, Low: 1)
> Scope: 11 files (+ traced dependencies: useAutoCycle, useLiveStats, SectionObserverContext, FloatingParticles, /api/download)
> Date: 2026-05-10

## 1. AnimatePresence in GetStarted never fires exit animations (key on wrong node)

- **Severity**: high
- **Category**: silent-failure / animation contract
- **File**: `src/components/sections/get-started/index.tsx:64-71`
- **Scenario**: User clicks a step chip → `active` flips to a new index → `<StepContent>` re-renders with a new `step` prop. The intent is `AnimatePresence mode="wait"` cross-fades the panel out before the next mounts.
- **Root cause**: `AnimatePresence` discriminates mounts/unmounts by inspecting the **`key` prop on its direct child**. The direct child here is `<StepContent>` with no `key`. The `key={step.id}` lives on the `motion.div` *inside* `StepContent` — which AP cannot see. From AP's perspective there is exactly one child whose key never changes, so it treats every step swap as a prop update on the same element; the `exit={{ opacity: 0 }}` transition is never scheduled. With `mode="wait"` AP also gates the next enter on a non-existent exit completion → effectively a snap cut every time.
- **Impact**: Designed cross-fade between steps is silently dead. Auto-cycle (every `AUTO_ADVANCE_MS`) and click-driven step changes both look like hard cuts. No console warning — failure is invisible to QA.
- **Fix sketch**: Push the `key` to the AP child: `<AnimatePresence mode="wait"><StepContent key={step.id} ... /></AnimatePresence>` and drop the inner `key` on the motion.div (or keep both — outer is what matters).

## 2. Hero 3D tilt + scroll hint ignore prefers-reduced-motion

- **Severity**: high
- **Category**: accessibility / animation gating
- **File**: `src/components/sections/HeroClient.tsx:44-59,157-184`
- **Scenario**: User with `prefers-reduced-motion: reduce` (vestibular-disorder accommodation, OS-level setting) loads the homepage. The right-column command center card tilts on mouse-move (rotateX/rotateY springs) and the bottom scroll hint pulses + fades in with a 1.5s delay.
- **Root cause**: HeroClient never reads `useReducedMotion()`. `handleMouseMove` writes to motion values unconditionally; the spring/`useTransform` chain converts mouse delta to 10° rotations regardless of OS preference. `motion.div` with `animate-scroll-hint` and the explicit `animate={{ opacity: 1 }}` opacity tween are also unconditional. Other subcomponents (`FloatingParticles`, `useAutoCycle`) do honour the preference, so the hero is the outlier.
- **Impact**: WCAG 2.3.3 violation. Users get the exact motion they opted out of; can trigger nausea/vertigo. Also a behavioural regression vs the documented project pattern of `motion-safe:` Tailwind variants used elsewhere (e.g. `PrimaryCTA`).
- **Fix sketch**: `const reducedMotion = useReducedMotion();` then no-op `handleMouseMove`/`handleMouseLeave` and skip mounting the `motion.div initial/animate` for the scroll hint when true. Or wrap rotateX/Y with `useTransform(..., reducedMotion ? "0deg" : ...)`.

## 3. DownloadCTA `useIsFresh` causes SSR/client hydration mismatch on the boundary

- **Severity**: medium
- **Category**: hydration / SSR-client divergence
- **File**: `src/components/sections/DownloadCTA.tsx:41-53,96`
- **Scenario**: Release date is exactly 7 days old (the boundary). Server renders at T = 6d 23h 59m 59s elapsed → fresh = `true` → className includes `" animate-badge-pulse"`. Client hydrates ~200 ms later with elapsed > 7d → `useState` initializer evaluates fresh = `false`. React produces a hydration warning and React 19 swaps the entire pill subtree.
- **Root cause**: `useState(() => Date.now() - RELEASE_TIMESTAMP < SEVEN_DAYS_MS)` runs on both server and client with different `Date.now()` values. The class string is computed inline (template literal with conditional), so the rendered HTML differs. `suppressHydrationWarning` is not applied (compare to `Footer.ClientYear` on line 60-63 which does use it for the same reason). Same hazard exists when the user keeps the tab open across the 7-day expiry — but that one is handled by the 60s interval.
- **Impact**: Hydration warning in production logs. React 19 may discard server HTML and re-render the badge, causing a visible flicker. On boundary days the discrepancy is deterministic, not flaky.
- **Fix sketch**: Initialise `fresh` to `false` (or `null`) and set the real value inside `useEffect`, OR add `suppressHydrationWarning` on the badge `span` and ensure the className doesn't change on hydration.

## 4. SectionObserverProvider thrashes observers when sectionIds array identity changes

- **Severity**: medium
- **Category**: race condition / effect dependency
- **File**: `src/contexts/SectionObserverContext.tsx:125-178` and `src/app/page.tsx:24-29`
- **Scenario**: `page.tsx` computes `scrollMapItems` and `sectionIds` at module scope, so identity is stable across renders in production. But the observer effect depends on `[sectionIds, observe, unobserve]`. Any HMR edit, locale switch, or future code that recomputes the array per render (e.g. memoising on an unstable dep) will fire the cleanup on every render: it calls `unobserve(id)` for every id, deletes them from `elementsRef`, then the new effect schedules a fresh `tryRegister()` sweep that races with the lazy-loaded sections still hydrating. During the gap, `activeSectionId` is `null` → scroll-map dots all unfocus.
- **Root cause**: The dep array forces a full unobserve/re-register cycle on any reference change of `sectionIds`. The 30-second MutationObserver also outlives the effect: cleanup disconnects `mutationObs`, but the *previous* `setTimeout` could already have run and disconnected; nothing tracks ownership across re-runs. Compounding issue at line 174-176: cleanup unobserves every id even those that never registered, which is silent because `unobserve` early-returns on `!el`.
- **Impact**: Latent. Becomes real when a future change makes `sectionIds` non-stable (e.g. computed inline in the JSX, or memoised with a per-render dep). Loss of scroll-map active state without any error.
- **Fix sketch**: Memoise `sectionIds` with a structural key (`sectionIds.join(",")`) inside the provider, or document the contract loudly. Better: split the effect — observer creation independent of `sectionIds`, registration sweep keyed on the joined string.

## 5. Waitlist modal exit animation is killed by conditional render

- **Severity**: medium
- **Category**: animation cleanup / mount lifecycle
- **File**: `src/components/sections/DownloadCTA.tsx:243-251`
- **Scenario**: User opens the waitlist modal (clicks an unavailable platform pill), then closes it. `onClose={() => setWaitlistPlatform(null)}` flips state to null on the same tick, and the `{waitlistPlatform && <WaitlistModal ... />}` guard unmounts the component immediately.
- **Root cause**: There is no `<AnimatePresence>` wrapper. If `WaitlistModal` uses `motion.div initial/animate/exit` for backdrop/sheet (overwhelmingly likely given the rest of the codebase), the exit transition cannot run because the DOM node is gone before framer can schedule it. `open={!!waitlistPlatform}` is passed but ignored as a gate — the parent already gated the mount.
- **Impact**: Modal disappears instantly on close instead of fading/sliding out; jarring UX. Pattern is repeated wherever this guard idiom is used. A second click during the missing exit window can also produce a flash of the new `platformIcon` if rapid open/close.
- **Fix sketch**: Wrap `<AnimatePresence>{waitlistPlatform && <WaitlistModal key={waitlistPlatform.key} .../>}</AnimatePresence>`, and rely on `open` prop alone for the modal's internal visibility state, OR delay the `setWaitlistPlatform(null)` by the modal's exit duration.

## 6. useLiveStats malformed-shape Sentry capture leaks API shape, success-theaters errors

- **Severity**: low
- **Category**: silent failure / observability
- **File**: `src/hooks/useLiveStats.ts:84-103`
- **Scenario**: `/api/stats` returns 200 OK but a partial body (older deploy, edge cache returning a previous schema, a proxy stripping fields). Code detects `!data.series || !data.trend7d`, fires `Sentry.captureMessage`, then `return`s — leaving `setStats` un-called.
- **Root cause**: Two issues on the same path. (a) `Sentry.captureMessage` is invoked directly with `extra: { status, shapeKeys }` — bypasses `captureExceptionScrubbed` used in the sibling catch branch. The shape keys could include user-identifiable fields if the endpoint contract drifts. (b) After the warning, `cachedResult` stays `null` and `stats` stays at `FALLBACK_RESPONSE`, but no UI surface knows the data is stale/synthesised. The hero shows fallback `42 agents · 120 templates` as if real. Worse, `warnedOnce` flips to `true`, so the *next* genuine fetch failure (catch branch, line 108) is silently swallowed because of the `if (warnedOnce) return;` guard — one warn quota for two unrelated failure modes.
- **Impact**: Persistent silent fallback with no second-chance telemetry; ops cannot see compounded issues. PII risk from un-scrubbed `shapeKeys`.
- **Fix sketch**: Use `captureExceptionScrubbed` in both branches, give each failure its own latch (`warnedShapeOnce`, `warnedFetchOnce`), and consider exposing a `isFallback: boolean` on the returned object so the UI can dim/footnote synthetic numbers.

## 7. FAQ Discord CTA is a live anchor pointing to `href="#"`

- **Severity**: low
- **Category**: silent failure / dead link in production
- **File**: `src/components/sections/FAQ.tsx:229-234`
- **Scenario**: User scrolls FAQ, doesn't find their question, clicks "Join Discord" CTA at the bottom. The href is the literal string `"#"`. Browser scrolls to top of page; user thinks the click was eaten or that Discord is gated.
- **Root cause**: Placeholder href left in a production-looking CTA. The Footer (line 166) and elsewhere correctly uses `https://discord.gg/personas`. No build-time check distinguishes `href="#"` (real "scroll to top" behaviour) from a forgotten placeholder. The translated label `t.faqSection.joinDiscord` strongly implies a working link in 14 locales.
- **Impact**: Dead conversion CTA at a high-intent point in the funnel (after reading FAQ, ready to commit). Analytics will not surface this — it produces a click event with success.
- **Fix sketch**: Replace with `href="https://discord.gg/personas"` (matching Footer) plus `target="_blank" rel="noopener noreferrer"`. Add an ESLint rule or a unit test that fails on `href="#"` for any element bearing CTA text.
