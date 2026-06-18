# Section Preview & Demo Harness — blended bug-hunter + test-mastery scan
> Total: 5  (Critical: 0, High: 2, Medium: 2, Low: 1)

## 1. Public `/demo` entry — the shareable, business-critical demo path — has zero e2e coverage
- **Severity**: High
- **Lens**: test-mastery
- **Category**: missing coverage on business-critical path
- **File**: src/app/demo/page.tsx:21-42 (chain: src/app/features/page.tsx:35, src/components/tour/TourCaptionCard.tsx:136)
- **Scenario**: A visitor follows the `/features` tour bridge or the chapter button to `/demo?tour=1`. The demo must enter mock mode, redirect into `/dashboard/home`, and (per the doc comment) let `TourLauncher` autostart the dashboard tour. This whole funnel — the only "always-on shareable demo" the site offers — is never exercised by any spec.
- **Root cause**: `e2e/` has 13 specs (blog, community, compare, tour, …) and `tour.spec.ts` covers `/`, `/features`, `/roadmap`, and `/?tour=1`, but nothing navigates to `/demo`. The redirect, `enterDemo()` side-effects, query-forwarding, and arrival-at-dashboard are all untested; a regression (e.g. wrong redirect target, dropped query, demo mode not activated) ships silently.
- **Impact**: false-confidence / undetected break of the primary public conversion path — a broken demo redirect would not fail CI.
- **Fix sketch**: Add `e2e/demo.spec.ts`: `goto('/demo?tour=1')` → assert `expect(page).toHaveURL(/\/dashboard\/home\?tour=1/)`, assert a dashboard-only element is visible (demo mode active), and that the tour caption dialog appears (autostart). Add a plain `goto('/demo')` case asserting redirect without query.

## 2. `/demo` redirect effect re-runs `enterDemo()` and `router.replace()` on every `router` identity change
- **Severity**: Medium
- **Lens**: bug-hunter
- **Category**: stale-closure / effect-dependency churn
- **File**: src/app/demo/page.tsx:26-32
- **Scenario**: The `useEffect` lists `[enterDemo, router]` as deps. `useRouter()` may return a new object reference across renders (and React 19 StrictMode double-invokes effects in dev). Each re-run calls `enterDemo()` again (re-minting the mock session and re-setting `initialized:true`) and re-issues `router.replace('/dashboard/home' + search)`.
- **Root cause**: A fire-once "redirect on mount" intent encoded as an effect keyed on non-stable deps, with no run-once guard. `enterDemo` is stable (zustand selector), but `router` is not guaranteed stable; the redirect is idempotent in URL terms but the repeated store writes and `replace` calls are wasteful and can interleave with the dashboard mount.
- **Impact**: UX degradation — redundant store mutation / potential replace re-fire during navigation; benign today but fragile if `enterDemo` ever gains a non-idempotent step.
- **Fix sketch**: Guard with a ref (`const done = useRef(false); if (done.current) return; done.current = true;`) at the top of the effect, or drop `router` from deps with an eslint-disable and a one-shot comment. Capture `window.location.search` once inside the guarded block.

## 3. No test asserts every registered section bare-mounts without crashing — the harness's core invariant is unguarded
- **Severity**: Medium
- **Lens**: test-mastery
- **Category**: coverage gap on registry invariant
- **File**: src/app/preview/registry.ts:15-43 (consumed by src/app/preview/[section]/page.tsx:20-53)
- **Scenario**: The registry maps 21 slugs to `dynamic(() => import(...))`. The whole point of `/preview/[section]` is to mount each section in isolation. If a section is renamed/moved, loses its default export, or starts requiring props/context (the file warns "sections that require runtime props … are intentionally excluded"), the dynamic import resolves to `undefined`/throws and the preview crashes — but only when a human happens to click that slug.
- **Root cause**: The registry is a hand-maintained map with no automated check that (a) each import path resolves and (b) each component renders bare. `PREVIEW_SLUGS` is derived from it, so the index links to whatever is registered, valid or not.
- **Impact**: false-confidence — silent drift between registry and the section components it points at; broken preview entries go unnoticed.
- **Fix sketch**: Add `e2e/preview.spec.ts` that reads `PREVIEW_SLUGS`, loops `goto('/preview/' + slug)`, and asserts the sticky breadcrumb (`'← preview index'`) plus `#main-content`-or-section root is visible and no console/page error fired (`page.on('pageerror', …)`). Runs only in dev (page 404s in prod).

## 4. Context/registry references a `/todo` scratch page that does not exist in the codebase
- **Severity**: Low
- **Lens**: bug-hunter
- **Category**: dead reference / spec drift
- **File**: src/app/todo/page.tsx (absent — no `src/app/todo/` directory)
- **Scenario**: This context (and any nav/doc pointing at the "todo scratch page") lists `src/app/todo/page.tsx`, but the route and directory are gone. Anyone navigating to `/todo` in dev gets a 404; any tooling that enumerates these harness routes hits a missing file.
- **Root cause**: The scratch page was removed without updating the harness context/registry inventory; the demo-harness grouping still claims it.
- **Impact**: minor — stale documentation/route inventory; dead link if anything references `/todo`.
- **Fix sketch**: Either remove `/todo` from the context/harness inventory, or restore a minimal `src/app/todo/page.tsx` if the scratch surface is still wanted. No code change needed if it was an intentional deletion — just sync the registry/docs.

## 5. Unknown-section fallback (helpful slug list) is unreachable in production, masking misconfiguration in dev only
- **Severity**: Low
- **Lens**: bug-hunter
- **Category**: dead branch / asymmetric environment behavior
- **File**: src/app/preview/[section]/page.tsx:15-41
- **Scenario**: When `params.section` has no registry entry, the page renders a friendly "Unknown section" list of available slugs. But the page calls `notFound()` first whenever `NODE_ENV === 'production'`, so in prod every `/preview/*` is a blank 404 — the helpful branch only runs in dev. That is by design (dev-only surface), yet the `!Section` branch also runs the full `PREVIEW_SLUGS.map` Link list, which is only ever seen by a developer who fat-fingers a slug.
- **Root cause**: The 404-in-prod guard makes the entire unknown-section branch dev-only, so it is exercised by no automated test and provides no signal in the environment users actually hit.
- **Impact**: minor — no user impact (intended dev-only), but the fallback branch is effectively untested and contributes to the unguarded-registry gap in finding #3.
- **Fix sketch**: Acceptable as-is given the dev-only contract; if covered, fold an "unknown slug shows available list" assertion into the `e2e/preview.spec.ts` from finding #3 (`goto('/preview/does-not-exist')` → expect "Unknown section").
