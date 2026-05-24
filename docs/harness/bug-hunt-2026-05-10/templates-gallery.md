# Bug Hunter — Templates Gallery

> Total: 7 findings (Critical: 0, High: 3, Medium: 3, Low: 1)
> Scope: 4 files (+ TemplateDetail.tsx pulled in transitively)
> Date: 2026-05-10

## 1. Dynamic template metadata has no canonical URL, OG image, or metadataBase

- **Severity**: High
- **Category**: SEO / metadata
- **File**: `src/app/templates/[id]/page.tsx:9`
- **Scenario**: Crawl `/templates/gmail-inbox-triage`. The HTML head only contains
  `<title>Inbox Triage — Template</title>` and `<meta name="description">`. There is
  no `<link rel="canonical">`, no `<meta property="og:*">`, no `<meta property="og:image">`,
  no `<meta name="twitter:card">`. Sharing a template URL in Slack/X yields a generic
  unfurl with no preview image, and Google may index the wrong canonical (e.g. with
  trailing slash or query-string variants from referrers).
- **Root cause**: `generateMetadata` returns only `{ title, description }`. The focus
  area called out "dynamic metadata generation per template, canonical URLs, missing
  OG image" — none of these are emitted. There is no `metadataBase` set on the route
  segment either, so any future relative `openGraph.images` would fail to resolve.
- **Impact**: Templates are public marketing surface. Missing OG metadata kills social
  reach; missing canonicals invite duplicate-content de-ranking when the page is linked
  with UTM params or via the category landing crawl. Compare with the JSON-LD block
  inside `TemplateDetail.tsx:155` which *does* hardcode `https://personas.ai/...` —
  that URL is duplicated, not derived, so any prod domain change desyncs.
- **Fix sketch**:
  1. Add `metadataBase: new URL("https://personas.ai")` and an `alternates.canonical`
     of `/templates/${id}` to the returned metadata object.
  2. Add `openGraph: { title, description, type: "article", images: [{ url: \`/api/og/template/${id}\` }] }`
     (or a static fallback) and a matching `twitter` block.
  3. Source the absolute URL from `process.env.NEXT_PUBLIC_SITE_URL` so the JSON-LD
     in `TemplateDetail.tsx` can stop hardcoding `personas.ai`.

## 2. "Clear filters" empty-state ejects the user out of the category they are browsing

- **Severity**: High
- **Category**: Silent failure / UX dead-end
- **File**: `src/app/templates/page.tsx:262-280`
- **Scenario**: Open `/templates`, click the **Communication** tile, switch the
  complexity pill to **Enterprise**, type `xyz123` in search. The grid empties and a
  "No matches" panel offers `Clear filters`. Clicking it executes
  `setActiveCategory(null)` in addition to clearing search/complexity, which rewinds
  the user all the way back to the **category tile picker** — they have lost their
  Communication context and now have to click into Communication again. The button
  copy ("Clear filters") promises a recovery within the current view; the behavior
  performs a full navigation.
- **Root cause**: The inline comment explicitly justifies this:
  `// Also clear the active category — without this the user gets a dead-end empty
  state where Clear Filters promises recovery but the category filter still hides
  every other template.` — i.e. someone noticed that the category itself can be the
  cause of zero results (search/complexity weren't responsible), so they "fixed" it
  by always clearing the category. But the category is never the cause of zero
  results when **only search/complexity** is non-default; the empty state can be
  triggered in a category that has dozens of matching templates.
- **Impact**: Users cannot iteratively refine a filter inside a category. Clearing
  filters silently teleports them out of the category they wanted to browse.
  Symptom of the kind of "silent failure masking real failure" the focus area calls
  out.
- **Fix sketch**: Only clear `activeCategory` if `activeCategory` is the *sole*
  reason the result set is empty — i.e. only when `search === "" && activeComplexity
  === null`. In the common case, just clear search and complexity and stay in the
  category. Better: split into two CTAs ("Clear search/complexity" vs. "Browse all
  categories") so the user picks.

## 3. `notFound()` from a client component runs after the deep-link side effect, leaving a torn-down 404 page mid-redirect

- **Severity**: High
- **Category**: Race condition / latent failure
- **File**: `src/app/templates/[id]/TemplateDetail.tsx:70-72, 110-128`
- **Scenario**: User clicks **Open in Personas** on `/templates/gmail-inbox-triage`.
  `handleOpenInPersonas` sets `window.location.href = "personas://template/..."`,
  starts a 1500 ms timer to show a fallback modal, and registers a `blur` listener.
  Concurrently the user (or a browser back-forward cache restore) navigates to a
  template ID that has been removed in a deploy. The client mounts, the comment in
  the code (lines 64-69) warns that this lookup can return `null` during deploy/HMR
  drift, so `notFound()` fires. The blur listener and `setTimeout` set up in the
  previous render are *not* cleaned up by `notFound()` — there is no `useEffect`
  cleanup wrapping `handleOpenInPersonas`, only the `resetTimerRef` cleanup at lines
  74-81 (which ignores the deep-link timer entirely).
- **Root cause**: Two leaks coexist:
  1. The blur listener and 1500 ms `setTimeout` in `handleOpenInPersonas` are
     orphaned on unmount because they aren't tracked in any ref or cleanup.
  2. `setShowFallback(true)` at line 123 can fire after the component has unmounted
     (notFound, route change, or deep-link succeeded and OS focused the app), which
     in development logs the classic "state update on unmounted component" warning,
     and in production silently no-ops *unless* the user came back via bfcache to
     the same component instance — then a stale modal flashes.
- **Impact**: Stuck modal appears after a successful deep-link if the user toggles
  back to the browser tab within 1500 ms (e.g. macOS focus-follows-mouse). On 404
  flows, listeners leak. Both are reproducible.
- **Fix sketch**: Move the deep-link logic into a `useCallback` that records the
  timer on a ref, and add a single `useEffect` cleanup that clears both
  `resetTimerRef` *and* the deep-link timer + removes the blur listener on unmount.
  Guard `setShowFallback` with a mounted ref or an `AbortSignal`.

## 4. `getStaticParams` does not deduplicate, so a duplicate id crashes at build time but a missing id silently 404s post-deploy

- **Severity**: Medium
- **Category**: Latent failure / orphaned ID
- **File**: `src/lib/template-queries.ts:25-27`, cross-link from
  `src/app/templates/[id]/TemplateDetail.tsx:316-354`
- **Scenario**:
  - **A.** A `templates.ts` edit removes a template referenced by a sibling's
    `getRelatedTemplates` result (none currently, but the architecture invites it
    — for example if `beginnerPickIds` ever points to an id that has been renamed).
    `beginnerPicks` at line 1927 of `templates.ts` filters by id, so a typo there
    silently produces a smaller list with no error. Equivalent risk if
    `getRelatedTemplates` is ever passed an id whose category contains zero other
    templates: the related rail just doesn't render. The user sees no "More like
    this" rail and has no idea anything is wrong.
  - **B.** `getTemplateStaticParams` iterates `templates` directly, not the
    `templatesById` Map. The dedup throw at line 16 fires at module load — fine for
    an SSR/build crash, but if a duplicate slips into a server-only path
    (e.g. `process.env` guards a future build flag and the throw is bypassed), you
    get the second template silently rendering on both `/templates/<id>` paths
    because Next dedupes static params by string equality.
- **Root cause**: Single source of truth (`templates`) used both for the duplicate
  check and for the static-params output, but the static-params output never
  consults the deduped Map. The check is also a hard `throw` — fine for build, but
  there is no warning surface for the softer "orphaned id reference" case
  (`beginnerPickIds`, `beginnerPickReasons`).
- **Impact**: Cross-link to non-existent templates silently degrades content
  surfaces. The duplicate dedup works today but is not enforced by construction.
- **Fix sketch**:
  1. Make `getTemplateStaticParams` use `Array.from(templatesById.values())`.
  2. Add a similar load-time check that every entry in `beginnerPickIds` resolves
     via `templatesById.has(id)`; throw with the offending id if not.
  3. In `getRelatedTemplates`, if the category yields fewer than 1 match, log a
     `console.warn` in dev so authoring catches under-populated categories.

## 5. Hardcoded production URL in JSON-LD will silently mislead crawlers in preview/staging

- **Severity**: Medium
- **Category**: SEO / silent failure
- **File**: `src/app/templates/[id]/TemplateDetail.tsx:155`
- **Scenario**: A staging deploy at `https://staging.personas.ai/templates/...`
  emits `"url": "https://personas.ai/templates/..."` in the SoftwareSourceCode
  JSON-LD. If staging is crawlable (forgotten `noindex` is a common mistake),
  Google sees a JSON-LD entity claiming to live at the prod URL but served from
  staging, which can cause weird canonicalization or duplicate-content signals.
  Same problem on PR preview deployments and on ngrok/localtunnel test URLs.
- **Root cause**: `url: \`https://personas.ai/templates/${template.id}\`` is a
  literal string, not derived from `process.env.NEXT_PUBLIC_SITE_URL` or the
  request origin.
- **Impact**: Silent SEO degradation across non-prod environments; brittle to
  rebrand/domain change.
- **Fix sketch**: Read `process.env.NEXT_PUBLIC_SITE_URL` (with a sensible fallback)
  or pass the canonical URL through from a server component that knows the request
  host. Use the same constant in `generateMetadata` (see finding #1).

## 6. `triggerIcons` lookup silently drops unrecognized triggers in the gallery card

- **Severity**: Medium
- **Category**: Silent failure / missing required field
- **File**: `src/app/templates/page.tsx:13, 62-65`
- **Scenario**: Add a new template with `triggers: ["polling", "custom"]` (or any
  trigger value not in `{schedule, webhook, manual, event, polling}`). On the
  gallery card, the unknown trigger is rendered as `null` — no icon, no fallback
  text, no warning. The user has no way to discover that the template has
  additional triggers. Compare with `TemplateDetail.tsx:227` which uses
  `triggerIcons[t] ?? Zap` (sensible fallback) — so the gallery and detail page
  disagree on whether unknown triggers are visible at all.
- **Root cause**: `Icon ? <Icon … /> : null` returns nothing instead of falling
  back. There is no enum/union enforcing the trigger string set in
  `templates.ts:30` (`triggers: string[]`). The two pages have drifted in handling.
- **Impact**: Latent — every author who adds a new trigger type has to update
  the gallery icon map *and* the detail-page mapping *and* the `triggerDescriptions`
  table, with no compile-time check. Today no template uses an unmapped trigger,
  but the fact that "research-competitive-intel" mixes `["schedule"]` while its
  config YAML says `cron(...)` means there are no automated guarantees the data
  matches the icons.
- **Fix sketch**: (1) Make `AgentTemplate.triggers` typed as `Trigger[]` where
  `Trigger = keyof typeof triggerIcons`. (2) Use a shared `triggerIcons` constant
  exported from `lib/templates.ts` so gallery and detail can't drift. (3) In the
  gallery, fall back to `Zap` (matching the detail page) instead of `null`.

## 7. Gallery's category-empty state is a silent zero, never a load error

- **Severity**: Low
- **Category**: Edge case / silent failure
- **File**: `src/app/templates/page.tsx:145-149, 178-201`
- **Scenario**: If `templates` is ever empty (refactor that lazy-loads the array,
  a JSON fetch substitution, or a build failure that ships an empty module),
  `categoryCounts` becomes `{ DevOps: 0, Communication: 0, … }`. The page still
  renders all 10 category tiles, each with a `0` badge; the subtitle reads
  *"Browse 0 ready-to-use templates…"* (because of `.replace("{count}", "0")`).
  No error UI, no logging. A user clicks a tile and lands in an empty grid that
  doesn't say *why* it's empty.
- **Root cause**: The page treats `templates` as guaranteed non-empty because
  it's a static module today. There is no guard for `templates.length === 0` and
  no graceful copy explaining "no templates available yet". Same risk applies if
  the focus area's hypothetical SWR migration ever lands and the fetch fails:
  SWR errors will be swallowed unless explicitly handled, leaving the gallery
  in a "successfully showing nothing" state.
- **Impact**: Low today (data is static), high if the data source ever changes.
  Worth fixing now while the surface is small.
- **Fix sketch**: Add a top-level guard:
  ```tsx
  if (templates.length === 0) {
    return <EmptyState title="No templates available yet" />;
  }
  ```
  When/if SWR is added, surface the `error` state with a retry CTA rather than
  letting `data ?? []` silently produce an empty gallery.
