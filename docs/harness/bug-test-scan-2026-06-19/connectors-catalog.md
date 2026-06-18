# Connectors Catalog — blended bug-hunter + test-mastery scan
> Total: 5  (Critical: 0, High: 2, Medium: 2, Low: 1)

## 1. Catalog filter/search predicate has zero unit coverage (no unit harness)
- **Severity**: High
- **Lens**: test-mastery
- **Category**: risk-weighted coverage gap
- **File**: src/components/sections/connections-catalog/index.tsx:31-52
- **Scenario**: `filteredConnectors` (the multi-field, case-insensitive search predicate over label/name/summary/category/authType) plus the `categoryCount` reducer are the business-critical heart of the page across 125 connectors, yet the project has NO unit runner (Playwright e2e only) and these pure functions are not extracted or tested. The only coverage is `e2e/connections.spec.ts`, which fills "Slack" and asserts the page still *contains* "Slack" — a tautology that passes even if filtering is completely broken (Slack is in the unfiltered DOM too).
- **Root cause**: Filtering logic is inlined in a client component and there is no `*.test.ts` harness; e2e asserts presence, never absence, so it cannot detect over-matching or empty-result regressions.
- **Impact**: false-confidence test / undetected filter regressions (e.g., a field dropped from the OR-chain, a casing bug) ship green.
- **Fix sketch**: Extract `filterConnectors(connectors, activeCategory, search)` and `countByCategory(connectors)` into `data.ts` as pure functions; add a unit harness (vitest) with cases: exact label, summary substring, authType match, empty result, "all" category, and an *absence* assertion (non-matching connector excluded).

## 2. Primary connector-click → modal interaction is covered only by skipped tests
- **Severity**: High
- **Lens**: bug-hunter
- **Category**: success-theater / disabled coverage on conversion path
- **File**: e2e/connections.spec.ts:29-47
- **Scenario**: The two tests that exercise the core conversion interaction — clicking a connector card to open the detail modal ("What you can do" / "Try it now") — are both `test.skip`, justified as a Playwright-vs-CSR-hydration flake. So the click handler wired in `index.tsx:108` → `page.tsx:40-45` → `ConnectorModal`, and the URL `connector=` round-trip, have no executing assertions at all.
- **Root cause**: `useSearchParams` forces CSR bailout, the click was flaky under Playwright, and the response was to disable rather than stabilize (e.g., wait for hydration / use `data-testid`), leaving the most important path permanently unverified.
- **Impact**: false-confidence test — a broken `onConnectorClick`, modal, or `connector=` param parse ships undetected while the suite is green.
- **Fix sketch**: Re-enable with a hydration wait (`await page.waitForLoadState("networkidle")` + `data-testid="connector-card"` from `ConnectorCard`) or assert the modal via deep-link `/connections?connector=slack` (no click needed), which exercises `useParsedSearchParamState`'s parse directly.

## 3. Connector with an undeclared category is silently unreachable by any filter
- **Severity**: Medium
- **Lens**: bug-hunter
- **Category**: silent failure / data-shape drift
- **File**: src/components/sections/connections-catalog/components/CategorySidebar.tsx:45-71, CatalogFilters.tsx:51-74
- **Scenario**: `connectors.ts` is generated from external builtin JSON. If a regeneration introduces a `category` value not present in the `categories[]` array, the connector is still counted in `total`/`{N} services ready` and appears under "All", but BOTH the sidebar and the mobile filter pills iterate only declared `categories`, so no pill is ever rendered for it. The connector becomes filter-unreachable, and a user narrowing by any category will never surface it.
- **Root cause**: The category list and the connector data are two independent sources with no validation that every `connector.category` ∈ `categories[].key` (unlike `tool-catalogue.ts`, which DOES assert id integrity at module load).
- **Impact**: UX degradation / discoverability loss — connectors silently vanish from category navigation with no error.
- **Fix sketch**: Add a module-load invariant in `connectors.ts` (mirroring TOOL_CATALOGUE's duplicate-id check) that throws if any `connector.category` is not a declared category key; cover it with a unit test once a harness exists.

## 4. URL filter params seed state once on mount — client-side nav leaves filters stale
- **Severity**: Medium
- **Lens**: bug-hunter
- **Category**: stale state / URL-state desync
- **File**: src/hooks/useSearchParamState.ts:16-18, src/app/connections/page.tsx:24-38
- **Scenario**: `useSearchParamState` / `useParsedSearchParamState` read `searchParams.get(key)` only in the lazy `useState` initializer. A full page load of `/connections?category=database` works, but a Next.js client-side navigation to `/connections?category=database&q=slack` (e.g., a future "Browse databases" link or browser Back to a previously-shared filtered URL) does NOT remount the component, so the params are ignored and the catalog shows the stale/default state while the URL claims otherwise. The effect at page.tsx:37 also uses `replaceState`, so Back never restores prior filter state.
- **Root cause**: One-way "read-once" URL→state seeding with no subscription to `searchParams` changes; writeback uses `replaceState` so history holds no filter snapshots.
- **Impact**: UX degradation — deep-linked/shared filtered URLs silently don't apply on in-app navigation; today latent (no internal pre-filtered links exist, confirmed by grep) but a real trap for the next such link.
- **Fix sketch**: Either keep "read-once" but document/guard it, or sync on change: derive state from `searchParams` (or add a `useEffect` keyed on the param) so client-side nav re-applies, and consider `pushState` for shareable filter history.

## 5. ExtendCard "MCP Servers" / "Custom APIs" cards are dead-end (non-interactive)
- **Severity**: Low
- **Lens**: bug-hunter
- **Category**: UX dead-end / non-functional CTA
- **File**: src/components/sections/connections-catalog/components/ExtendCard.tsx:6-34, index.tsx:112-117
- **Scenario**: The two "extend your own" cards render a plus icon with hover affordances (rotate, border highlight, `cursor` implied by motion hover) that strongly signal clickability, but `ExtendCard` accepts no `onClick`/`href` and renders a static `motion.div`. A user clicking "MCP Servers" or "Custom APIs" expecting docs or a setup flow gets nothing.
- **Root cause**: Component was built as a visual placeholder; the interactive intent ("Connect any MCP-compatible AI tool") was never wired to a destination.
- **Impact**: UX degradation — affordance/behavior mismatch on a discoverability surface; no crash.
- **Fix sketch**: Give `ExtendCard` an optional `href` (link to MCP/custom-API docs or the download/setup page) and render as a `Link`/anchor when present; if intentionally static, drop the hover affordances and add `aria-disabled`/non-interactive styling.
