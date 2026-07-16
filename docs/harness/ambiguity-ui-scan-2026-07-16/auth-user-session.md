# Authentication & User Session — ambiguity+ui scan
> Total: 5 findings (Critical: 0, High: 1, Medium: 3, Low: 1)

## 1. Session-expiry sign-out and demo entry bypass `clearUserScopedCaches` — the stale-data mode-switch has no contract
- **Severity**: High
- **Agent**: ambiguity_guardian
- **Category**: stale-cache-on-auth-transition
- **File**: `src/stores/authStore.ts:155`
- **Scenario**: `clearUserScopedCaches()` is invoked from exactly one place: the `finally` of `signOut()` (line 264). Two other auth transitions change the identity behind the data without clearing anything: (a) `onAuthStateChange` firing with `session === null` (token expiry, sign-out in another tab, server-side revocation) flips `isAuthenticated` to false at lines 155–169 but leaves personaStore/eventStore/executionStore/SWR fully populated; (b) `signInAsDemo()` / `enterDemo()` (lines 181–195) mint the mock session on top of whatever caches exist. Concrete path: real session expires → AuthToast appears → user clicks "Try demo" on the SignInPrompt → demo mode renders the previous real account's personas, executions, messages and leaderboard until each consumer happens to refetch — and consumers keyed only on `isAuthenticated` never refetch at all, since it goes false→true across the transition without a remount.
- **Root cause**: The cache-clearing contract is implicit ("signOut clears caches") rather than attached to the actual state transition ("identity or isDemo changed"). Prior scans flagged the symptom in leaderboard/messages; this store owns the switch, and nothing here — no subscription, no version counter, no clear-on-`isDemo`-flip — gives consumers a signal to react to `isDemo` changes. `clearUserCaches.ts` even documents "Called on auth transitions (logout, user switch)" — but user-switch and expiry paths don't call it.
- **Impact**: Cross-identity data bleed: previous account's user-scoped data visible after expiry and inside demo mode; demo data can likewise linger into a subsequent real session that authenticates via `onAuthStateChange` (OAuth redirect) rather than via `signOut`.
- **Fix sketch**: Centralize the contract in the store: in the `onAuthStateChange` handler, call `clearUserScopedCaches()` whenever `wasAuthenticated && !nowAuthenticated`, or more robustly whenever `session?.user?.id` differs from the previous `user?.id`. Also call it at the top of `signInAsDemo`/`enterDemo`. Document in `clearUserCaches.ts` that the store — not callers — owns invocation on every identity/isDemo flip.

## 2. AuthToast steals focus, auto-dismisses its own action button after a fixed 8 s, and swallows Escape globally
- **Severity**: Medium
- **Agent**: ui_perfectionist
- **Category**: toast-focus-and-timing-a11y
- **File**: `src/components/AuthToast.tsx:17`
- **Scenario**: When `sessionExpired` flips true, the effect at lines 21–48 forcibly moves keyboard focus to the toast's "Sign in" button, and a second effect (line 17) dismisses the whole toast after a hard-coded 8000 ms. A user mid-form-entry loses focus without warning; a slower keyboard or screen-reader user has 8 seconds to act on the only recovery affordance before it vanishes (WCAG 2.2.1 Timing Adjustable — content with an interactive control should not auto-expire on a fixed timer). The document-level Escape handler also calls `event.stopPropagation()`, which can starve other Escape listeners (open modals/menus) while the toast is visible.
- **Root cause**: `role="alert"` + `aria-live="assertive"` already announces the message; the additional focus steal treats a passive status region like a modal. The 8 s constant is a magic number with no recorded reasoning and no pause-on-hover/focus behavior.
- **Impact**: Keyboard/AT users can be yanked out of their task and then lose the sign-in affordance before reacting; nested Escape-driven UI misbehaves while the toast is up.
- **Fix sketch**: Drop the automatic `focus()` (keep `role="alert"` for announcement); cancel the dismiss timer while the toast contains focus or hover (or remove auto-dismiss entirely since a manual dismiss button exists); replace `stopPropagation` with a plain handler; name the timeout (`SESSION_TOAST_DISMISS_MS`) with a comment if it stays.

## 3. RoleSelector conveys the selected role by color alone — no `aria-pressed`/radiogroup semantics
- **Severity**: Medium
- **Agent**: ui_perfectionist
- **Category**: selection-state-not-programmatic
- **File**: `src/components/RoleSelector.tsx:57`
- **Scenario**: The three role buttons (lines 53–77) render identical accessible names ("Developer", "Product Manager", "Enterprise") whether active or not; the active state is expressed only via Tailwind color/glow classes and a decorative motion ring. A screen-reader user tabbing through hears three plain buttons with no indication of which is selected; a colorblind user must infer selection from subtle tint differences. The `Icon` at line 66 also lacks `aria-hidden`, and each `RoleDef.color` hex (lines 22–36) is defined but never used — dead config that invites drift from the `activeClasses` colors it duplicates.
- **Root cause**: A single-select control implemented as free buttons without `aria-pressed` (or `role="radiogroup"`+`role="radio"`/`aria-checked`), and state styling not backed by any programmatic attribute.
- **Impact**: WCAG 4.1.2 (Name, Role, Value) and 1.4.1 (Use of Color) gaps on a control that personalizes the page's content; unused `color` field is a maintenance trap.
- **Fix sketch**: Add `aria-pressed={isActive}` to each button (or wrap in `role="radiogroup"` with `aria-checked`), add `aria-hidden="true"` to the icons, and either use `role.color` (e.g. for the indicator ring) or delete the field. Group label: tie the "I am a" span to the group via `aria-label`.

## 4. Optimistic session reads Supabase's private localStorage key format — undocumented, silently-failing coupling
- **Severity**: Medium
- **Agent**: ambiguity_guardian
- **Category**: undocumented-external-contract
- **File**: `src/stores/authStore.ts:106`
- **Scenario**: Lines 106–110 derive a `projectRef` by regexing `NEXT_PUBLIC_SUPABASE_URL` (`/\/\/([^.]+)/`) and read `localStorage.getItem(\`sb-${projectRef}-auth-token\`)`. Both the key template and the "first URL label = project ref" assumption are internal supabase-js conventions, not public API: a supabase-js upgrade that changes the storage key, a custom `storageKey` in `getSupabase()`'s client options, or a self-hosted/custom-domain URL (where the first label isn't the ref) all make the lookup miss — silently, because every failure path just falls through.
- **Root cause**: A performance optimization (avoid skeleton flash) piggybacks on an unversioned third-party storage detail; the code documents the tamper-validation reasoning thoroughly (lines 101–104, 10–17) but records nothing about why this key shape is assumed stable or how the fallback degrades.
- **Impact**: Not a correctness bug today — `getSession()` still authoritatively resolves — but the optimization can rot into a permanent no-op (skeleton flash returns for every user) with zero signal, and a future custom-domain deployment quietly loses the fast path. Anyone debugging "why is the optimistic path dead" has no breadcrumb.
- **Fix sketch**: Derive the key from one shared constant next to `getSupabase()` (ideally pass an explicit `storageKey` to `createClient` and export it), and add a one-line comment stating the supabase-js version whose convention is mirrored plus the graceful-degradation guarantee. Optionally log a dev-only warning when a Supabase URL is configured but no matching key is found.

## 5. `AnimatePresence` around AuthToast can never play the exit animation
- **Severity**: Low
- **Agent**: ui_perfectionist
- **Category**: dead-exit-animation
- **File**: `src/components/AuthProvider.tsx:24`
- **Scenario**: `<AnimatePresence><AuthToast /></AnimatePresence>` (lines 24–26) always has the same child; AuthToast decides visibility internally by returning `null` (`AuthToast.tsx:50`). AnimatePresence only animates exit when a direct child is removed from its children list, so the `exit={{ y: 80, opacity: 0 }}` variant on the motion.div (`AuthToast.tsx:59`) is dead code — on dismiss/timeout the toast blinks out instantly instead of sliding down.
- **Root cause**: Conditional rendering lives inside the child instead of in the AnimatePresence parent — a known framer-motion contract that isn't visible at the call site.
- **Impact**: Polish only: entrance animates, exit hard-pops, which reads as jank next to the rest of the animated dashboard; also misleads future readers into thinking exit is handled.
- **Fix sketch**: Lift the condition: subscribe to `sessionExpired` in AuthProvider and render `{sessionExpired && <AuthToast />}` inside AnimatePresence (AuthToast then drops its own early return), or remove AnimatePresence and the `exit` prop to stop implying an animation that never runs.
