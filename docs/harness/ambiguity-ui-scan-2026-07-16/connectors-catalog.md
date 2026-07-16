# Connectors Catalog — ambiguity+ui scan
> Total: 5 findings (Critical: 1, High: 1, Medium: 3, Low: 0)

## 1. Connector cards are click-only divs — completely unreachable by keyboard and invisible to assistive tech
- **Severity**: Critical
- **Agent**: ui_perfectionist
- **Category**: keyboard-inaccessible-interactive-card
- **File**: `src/components/sections/connections-catalog/components/ConnectorCard.tsx:22`
- **Scenario**: A keyboard or screen-reader user tabs through /connections trying to open a connector's detail modal. The card is a `motion.div` with `onClick` and `cursor-pointer` but no `role`, no `tabIndex`, no keydown handler, and no accessible name — it never receives focus, and AT announces nothing interactive. The entire primary interaction of the page (opening ConnectorModal, which also drives the shareable `?connector=` URL) is mouse-only.
- **Root cause**: Interactivity was added to a presentational card via `onClick` on a div instead of rendering a `<button>`/`<a>` (or at minimum `role="button"` + `tabIndex={0}` + Enter/Space handling + `aria-label`).
- **Impact**: WCAG 2.1.1 (Keyboard) and 4.1.2 (Name, Role, Value) failures on the page's core interaction; keyboard users cannot open any of the ~100 connector details at all.
- **Fix sketch**: Make the card's root (or an inner overlay element spanning the card) a real `<button type="button">` styled to fill the card, with `aria-label={`${c.label} connector details`}`; keep `motion.div` as the visual wrapper. Add `:focus-visible` ring matching the hover border treatment. Apply the same to the clickable "Clear filters" flow if it grows.

## 2. `monogram` fallback exists on every connector but is never rendered — missing icon SVGs leave a blank white pill
- **Severity**: High
- **Agent**: ambiguity_guardian
- **Category**: built-but-unwired-fallback
- **File**: `src/components/sections/connections-catalog/components/ConnectorCard.tsx:82`
- **Scenario**: A connector whose `/tools/<icon>.svg` is absent (e.g. `personas_messages`, `personas_database`, `local_drive`, `generic_webhook` — all declared with no `icon` field, so the path defaults to `/tools/<name>.svg`) renders its card. Both `onError` handlers just set `display: none`, so the 36px white pill stays as an empty white circle with a brand-tinted ring around nothing.
- **Root cause**: `src/data/connectors.ts:13` defines and populates a `monogram` (two-letter code) for all ~100 connectors — clearly designed as the icon fallback — but no component ever reads it. The error path was written happy-path-first ("hide the broken image") and the intended fallback was never wired.
- **Impact**: Built-in/local connectors (ironically the ones highlighted as zero-setup) look broken/unfinished; the field is dead weight that misleads future maintainers into thinking a fallback exists.
- **Fix sketch**: Track `imgFailed` state in ConnectorCard; on error render `<span className="font-mono text-xs font-bold" style={{ color: c.color }}>{c.monogram}</span>` inside the pill instead of hiding, and skip the oversized background image entirely. Alternatively verify at generation time (generate-connectors.mjs) that every referenced SVG exists.

## 3. Desktop sidebar and mobile pills disagree on category order and active styling
- **Severity**: Medium
- **Agent**: ui_perfectionist
- **Category**: cross-breakpoint-inconsistency
- **File**: `src/components/sections/connections-catalog/components/CategorySidebar.tsx:19`
- **Scenario**: On desktop (`lg:`) the fixed sidebar sorts categories alphabetically (`localeCompare`) and always highlights the active item cyan (`baseBtnStyle` uses `BRAND_VAR.cyan` and a cyan gradient line regardless of the category's `accent`), though the adjacent dot does use the brand accent. On mobile, `CatalogFilters.tsx:51` renders the same categories in `categories[]` declaration order (curated: Messaging, Email, Notifications, …) with the full brand-accent treatment (border, bg, text). Resize the window and the same catalog presents two different orderings and two different active-color languages.
- **Root cause**: Two components independently render the same data with no shared ordering decision or shared "active category chip" primitive; the sidebar's alphabetical sort and cyan-only highlight are undocumented one-off choices.
- **Impact**: Users switching between devices (or resizing) lose spatial memory of where a category lives; the accent system (cyan/purple/emerald/amber per category) is half-applied, diluting the visual taxonomy the data deliberately encodes.
- **Fix sketch**: Pick one ordering (export a `sortedCategories` from `src/data/connectors.ts` or sort in the parent and pass down) and use it in both components; have the sidebar's active text/line use `BRAND_VAR[brand]` like the pills do. Consider extracting a small shared `CategoryLabel` (dot + label + count) used by both.

## 4. Search matches internal raw values, not the text users actually see
- **Severity**: Medium
- **Agent**: ambiguity_guardian
- **Category**: search-fields-vs-display-mismatch
- **File**: `src/components/sections/connections-catalog/index.tsx:43`
- **Scenario**: The card displays "Personal Access Token" (via `friendlyAuthType`, `data.ts:7`) and the category label "Project Management". A user searches the string they just read — "personal access token" or "access token" — and gets "No services found", because the filter matches raw `c.authType` ("PAT") and raw `c.category` (the key `project_management`, so "project management" only matches by accident of the underscore… it doesn't: `"project_management".includes("project management")` is false). Meanwhile searching the internal jargon "pat" over-matches every summary containing "pat" as a substring.
- **Root cause**: The filter predicate was written against the data model's raw fields with no recorded decision about which user-visible surfaces should be searchable; `friendlyAuthType` and `categories[].label` were added later for display only.
- **Impact**: Searches typed verbatim from on-screen text return empty results — the worst search failure mode on a catalog whose whole job is findability.
- **Fix sketch**: Build the haystack from display strings: include `friendlyAuthType(c.authType)` and the resolved `categories.find(...)?.label` alongside label/name/summary (precompute a lowercase `searchText` per connector in a `useMemo` keyed on nothing, since data is static). Drop raw-key matching or keep it additively.

## 5. Two parallel "canonical" tool registries with conflicting brand data, and the catalog counts contradict themselves on one page
- **Severity**: Medium
- **Agent**: ambiguity_guardian
- **Category**: duplicate-source-of-truth
- **File**: `src/lib/tool-catalogue.ts:14`
- **Scenario**: `tool-catalogue.ts` calls itself the "Canonical tool / integration registry", yet the Connectors Catalog (this context is described as "backed by the tool catalogue") uses a completely separate registry, `src/data/connectors.ts`, with conflicting entries — e.g. GitHub is `#8b5cf6` in the catalogue but `#1F2937` in connectors; Slack, Discord, Docker, Redis, MongoDB, Kubernetes, Vercel all exist in both with independently maintained colors/names. Meanwhile within the connections page itself, `layout.tsx:11` floors the count to the nearest 5 for honesty ("N+"), while `index.tsx:72` renders the exact `connectors.length` followed by "+" ("127+ services" when exactly 127 exist — the overclaim the layout comment explicitly set out to avoid) next to a badge stating the exact count ("127 services ready").
- **Root cause**: `connectors.ts` is generated from the desktop app's builtin JSON (header comment, `connectors.ts:47`) while `tool-catalogue.ts` is hand-curated for homepage visualizations; nothing documents which wins or links them, and the marketing-count rule ("floor to 5, add +") was applied in metadata but not in the hero copy.
- **Impact**: Brand colors for the same tool differ between the homepage showcases and the catalog; the context map's claim is drift; the hero simultaneously over- and exactly-states the count, undermining the documented honesty rule.
- **Fix sketch**: Document the relationship at the top of both files (connectors.ts = generated catalog truth; tool-catalogue.ts = homepage viz subset) and have tool-catalogue derive shared entries' `color` from connectors by `name`/`id` where they overlap. Export the `INTEGRATION_COUNT` floor-to-5 helper from a shared module and use it in `index.tsx`'s "`N`+ services" description (keep the exact count only in the "services ready" badge).
