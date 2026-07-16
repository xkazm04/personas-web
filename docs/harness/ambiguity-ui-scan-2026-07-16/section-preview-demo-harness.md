# Section Preview & Demo Harness — ambiguity+ui scan
> Total: 5 findings (Critical: 0, High: 1, Medium: 3, Low: 1)

## 1. Prototype-chain slugs crash the preview route (`/preview/constructor`)
- **Severity**: High
- **Agent**: ambiguity_guardian
- **Category**: prototype-pollution-lookup
- **File**: `src/app/preview/[section]/page.tsx:20`
- **Scenario**: In dev, navigate to `/preview/constructor`, `/preview/toString`, or `/preview/hasOwnProperty`. `PREVIEW_REGISTRY[section]` resolves through `Object.prototype`, returning a truthy function/method that is not a React component.
- **Root cause**: `PREVIEW_REGISTRY` is a plain object literal (`src/app/preview/registry.ts:15`), so bracket lookup with an arbitrary URL param inherits prototype members; the `if (!Section)` guard only checks falsiness, so `Object` (the constructor) passes and gets mounted as `<Section />`, throwing a render error instead of the friendly "Unknown section" page.
- **Impact**: Unhandled render crash (dev error overlay / 500) from harness input that the route explicitly tries to handle gracefully; the "Available:" fallback never renders for these slugs.
- **Fix sketch**: Resolve via `Object.hasOwn(PREVIEW_REGISTRY, section) ? PREVIEW_REGISTRY[section] : undefined`, or build the registry with `Object.create(null)` / a `Map`. One-line change at the lookup site.

## 2. Demo entry is happy-path only — a failed redirect strands users on an eternal spinner
- **Severity**: Medium
- **Agent**: ambiguity_guardian
- **Category**: happy-path-only-redirect
- **File**: `src/app/demo/page.tsx:26`
- **Scenario**: `/demo` is the public, shareable demo link. If `enterDemo()` throws (store rehydration edge), or `router.replace` to `/dashboard/home` fails/aborts (chunk load error, dashboard route error boundary), the effect has no fallback and the page shows a spinner forever.
- **Root cause**: The `useEffect` assumes both calls always succeed; there is no try/catch, no timeout, and no manual "Open the demo" link as an escape hatch. The `typeof window !== "undefined"` guard inside a client `useEffect` (line 30) is dead code that further signals unexamined assumptions about the execution environment.
- **Impact**: The most marketing-critical entry point (linked from `/features`) can dead-end with zero recovery affordance, and the failure is invisible (no error text, nothing to click).
- **Fix sketch**: Wrap the effect body in try/catch; on failure (or after a ~5s timeout) render a fallback with an explicit `<Link href="/dashboard/home">Open the demo</Link>` and error text. Drop the redundant `typeof window` check.

## 3. Unknown-section fallback returns HTTP 200 — inconsistent 404 semantics within the same route
- **Severity**: Medium
- **Agent**: ambiguity_guardian
- **Category**: soft-404-inconsistency
- **File**: `src/app/preview/[section]/page.tsx:22`
- **Scenario**: In dev, `/preview/does-not-exist` renders a helpful "Unknown section" page with a 200 status, while the same file calls `notFound()` for the production case (line 15) and the index page's doc comment promises 404 behavior.
- **Root cause**: The decision "unknown slug = friendly listing page, not a 404" is implemented but never recorded; the two branches of the same handler encode opposite philosophies (hard `notFound()` vs. soft 200) with no comment explaining why unknown slugs deserve different treatment than production access.
- **Impact**: Tooling that checks response status (link checkers, smoke tests, the harness itself) sees dead preview links as healthy; future maintainers can't tell whether 200 was intentional or an oversight.
- **Fix sketch**: Keep the helpful listing but move it into a `not-found.tsx` for the segment (Next serves it with a real 404 status), or add a one-line comment recording that 200-with-listing is deliberate DX.

## 4. Demo loading state is silent to assistive tech and lacks a main landmark
- **Severity**: Medium
- **Agent**: ui_perfectionist
- **Category**: a11y-loading-announcement
- **File**: `src/app/demo/page.tsx:34`
- **Scenario**: A screen-reader user opens `/demo`. The spinner is `aria-hidden` (correct) but the loading text is a bare `<span>` inside plain `<div>`s — no `role="status"`/`aria-live`, so nothing is announced before the redirect; there is also no `<main id="main-content">`, unlike the preview pages, so the site-wide skip link target is missing on this page.
- **Root cause**: The transient page was styled visually but the announcement and landmark conventions used elsewhere in the app (`main id="main-content"` in `src/app/preview/page.tsx:16`) weren't carried over.
- **Impact**: AT users experience a silent page followed by an unannounced context change to the dashboard — disorienting on the primary public demo entry.
- **Fix sketch**: Wrap content in `<main id="main-content">` and give the text container `role="status"` (implicit `aria-live="polite"`), e.g. `<div role="status" className="flex items-center gap-3 text-muted">`.

## 5. Sticky preview breadcrumb overlays the top of the section under review
- **Severity**: Low
- **Agent**: ui_perfectionist
- **Category**: preview-chrome-overlap
- **File**: `src/app/preview/[section]/page.tsx:45`
- **Scenario**: Reviewing viewport-height sections (hero, platform-command) in the harness: the `sticky top-0 z-50` bar permanently covers the top ~40px of the section and stacks above section-owned fixed chrome (e.g. `z-40` CategorySidebar in connections-catalog), so what you review is not what ships.
- **Root cause**: The harness chrome shares the page's stacking/scroll context with the section instead of being offset or dismissible; z-50 was picked without reference to the z-index scale used by sections (40/100).
- **Impact**: Visual QA of exactly the region the tool exists to inspect (hero top edges, sticky navs, full-bleed backgrounds) is skewed; subtle spacing bugs at the viewport top can pass review.
- **Fix sketch**: Make the bar non-sticky (plain block above the section), or add a small "hide chrome" toggle / render it as a bottom-anchored bar so the section's top edge renders exactly as in production.
