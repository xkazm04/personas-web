# Templates Gallery & Detail
> Browsable gallery of ready-made agent templates (category tiles → cards) plus statically-generated per-template detail pages with YAML highlighting, configuration copy, an install CTA, and SEO/JSON-LD · **Route:** `/templates`, `/templates/[id]` · **Status:** Live

## What it does
A catalog of pre-built AI agent configs a visitor can browse, filter, read, and copy; using one means installing the desktop app. The gallery (`/templates`) opens on a grid of **10 category tiles** (DevOps, Communication, Productivity, Finance, Sales, Support, Research, Marketing, Legal, Security), each with a backdrop image and a live count. Picking a category drills into that category's cards, where a **complexity filter** (All / Basic / Professional / Enterprise) and a free-text **search** (matches title, description, tool, and serviceFlow) narrow the list. Each card shows the service chips, title, description, complexity + difficulty badges, and trigger icons.

A detail page (`/templates/[id]`) shows the template's hero (tool icon, title, description, category/difficulty/complexity badges, key-benefit list, trigger + service chips), the full **YAML config** with hand-rolled syntax highlighting and a copy button, a **download CTA** ("Use this template", "Copy configuration", "Download for Windows"), and up to three **related templates** from the same category. "Use this template" opens an install modal ("Get Personas to use this template") with download + copy actions; it never claims the template opens in the app. Unknown ids render a localized 404.

## How it works
**Gallery** (`page.tsx`, a client component). All templates come from the static `templateList` (the `templates` array minus the heavy `config` string — see Data & state). `categoryCounts` is computed once at module load. State is three `useState`s: `search`, `activeCategory`, `activeComplexity`. When `activeCategory === null` it renders `CategoryTile`s; once a category is picked it renders the filter pills + search box + a `useMemo`-filtered grid of `TemplateCard`s, an `aria-live` result count, and an empty-state with "clear filters". `templates.length` is interpolated into the subtitle via `String(...).replace("{count}", …)`.

**Detail** is split between a server page and a client view. `[id]/page.tsx` is a Server Component: `generateStaticParams()` pre-renders one path per template id (`getTemplateStaticParams`), `generateMetadata()` builds per-template title/description/canonical/OG/Twitter (or `robots: noindex` for an unknown id), and the default export calls `notFound()` for unknown ids then renders `<TemplateDetail templateId={id} />`. **Only the id string is passed across the server→client boundary** — `TemplateDetail` (a client component) re-looks-up the full template via `getTemplateById`, deliberately avoiding serializing the `toolIcon` React component (a lucide function) which would break RSC serialization.

`TemplateDetail` assembles `TemplateJsonLd` + `TemplateHero` + `TemplateConfiguration` (YAML + copy) + `TemplateDownloadCta` + `RelatedTemplates`, plus the `TemplateFallbackModal`. Copy uses `navigator.clipboard.writeText` with a hidden-`<textarea>` + `execCommand("copy")` fallback; success/failure flips `copied`/`copyFailed` flags that auto-reset on a single tracked `setTimeout` (cleared on unmount). **No deep link** (D1, 2026-10-05): the CTA used to fire `personas://template/<id>` behind a 1500 ms blur heuristic, but the desktop's deep-link handler has no `template/` arm and the web template ids share none with the desktop catalog, so the click did nothing. The CTA now calls `openInstall`, which opens the install modal directly. Escape closes the modal via a keydown listener.

**YAML highlighting** (`YamlHighlighter.tsx`) is a dependency-free tokenizer: `tokenizeLine` splits each line on the first *unquoted* `#` (comment), then classifies leading indent, list dashes, `key:` pairs, inline `[arrays]`, quoted strings, numbers, booleans (`true/false/yes/no/null/~`), and plain values, emitting `<span>`s colored by CSS custom properties. `useMemo` keys the tokenization on `code`.

## Key files
| File | Role |
| --- | --- |
| `src/app/templates/page.tsx` | Gallery client page: category tiles → cards, complexity filter, search, empty state |
| `src/app/templates/layout.tsx` | Gallery route metadata (title/description/OG/canonical); `force-static`, `revalidate = 3600` |
| `src/app/templates/templates-page/CategoryTile.tsx` | Category tile: dark/light backdrop image, gradient scrim, count badge |
| `src/app/templates/templates-page/TemplateCard.tsx` | Gallery card: service chips, badges, trigger icons, hover "View details" overlay |
| `src/app/templates/templates-page/templatePageConfig.ts` | `triggerIcons`, `categoryAccent`, `CATEGORY_IMAGES`, `Complexity` type |
| `src/app/templates/[id]/page.tsx` | Server page: `generateStaticParams`, `generateMetadata`, `notFound()` guard |
| `src/app/templates/[id]/not-found.tsx` | Localized 404 for unknown template ids |
| `src/app/templates/[id]/TemplateDetail.tsx` | Client view: copy logic, install modal orchestration |
| `src/app/templates/[id]/YamlHighlighter.tsx` | Dependency-free YAML tokenizer + colored `<pre>` |
| `src/app/templates/[id]/template-detail/TemplateHero.tsx` | Hero: icon, badges, key benefits, trigger/service chips |
| `src/app/templates/[id]/template-detail/TemplateConfiguration.tsx` | Config section heading + copy button + `YamlHighlighter` |
| `src/app/templates/[id]/template-detail/TemplateDownloadCta.tsx` | "Use this template" / "Copy configuration" / "Download" CTA card |
| `src/app/templates/[id]/template-detail/TemplateFallbackModal.tsx` | Install modal, "Get Personas to use this template" (download + copy) |
| `src/app/templates/[id]/template-detail/RelatedTemplates.tsx` | Same-category related cards (≤3) |
| `src/app/templates/[id]/template-detail/TemplateJsonLd.tsx` | `SoftwareSourceCode` JSON-LD via `safeJsonLd` |
| `src/app/templates/[id]/template-detail/templateDetailMeta.ts` | `triggerIcons`, `triggerDescriptions`, `complexityColors` |
| `src/lib/templates.ts` | Source data: `AgentTemplate[]`, `categories`, `templateList`, color maps, beginner picks |
| `src/lib/template-queries.ts` | `getTemplateById`, `getTemplateStaticParams`, `getRelatedTemplates` + duplicate-id guard |

## Data & state
- **Source:** Fully static, hardcoded in `src/lib/templates.ts` — ~50 `AgentTemplate` objects (no network, no DB, no orchestrator). `templateList` is `templates` with the `config` YAML stripped (`Omit<AgentTemplate,"config">`) so the gallery/search bundle stays light; the detail page reaches back to the full `templates` array for `config`. **Stores:** none (no Zustand) — gallery holds `search`/`activeCategory`/`activeComplexity` in `useState`; `TemplateDetail` holds `copied`/`copyFailed`/`showFallback` + a `resetTimerRef`. **API routes:** none. **Types:** `AgentTemplate`, `TemplateListItem`, `Category`, `Difficulty` (`templates.ts`); `Complexity` (`templatePageConfig.ts`); `Token` (`YamlHighlighter.tsx`).
- **Query helpers** (`template-queries.ts`): `getTemplateById` uses a module-level `Map`; `getRelatedTemplates(id, limit=3)` filters same-category, excludes self, slices; `getTemplateStaticParams` maps ids for SSG. A **module-load duplicate-id guard** throws if `templates.length !== Map.size` (see gotchas).
- **Metadata:** gallery `layout.tsx` is `force-static` with hourly `revalidate`; detail `generateMetadata` emits per-template canonical/OG/Twitter and `noindex` for misses; `TemplateJsonLd` emits `schema.org/SoftwareSourceCode`. `SITE_URL` (`src/lib/seo.ts`) is shared so canonical, OG, and JSON-LD agree per deployment.

## Integration points
- **`src/lib/seo.ts`** — `SITE_URL`, `SITE_NAME`, and `safeJsonLd` (which escapes `</script>` and `<!--` to block JSON-LD-borne XSS). Every per-template URL is built from `SITE_URL`.
- **i18n** — all gallery and detail strings route through `useTranslation()` under `t.templatesPage.*` (plus `t.hero.downloadForWindows`, `t.waitlist.copied`, `t.common.close`). `{count}`/`{shown}`/`{total}`/`{category}` placeholders are filled with `String.replace`.
- **Shared chrome** — `Navbar`, `Footer` (`src/components/sections/Footer`), brand icons (`src/components/icons/brand-icons` for GitHub/Figma), `fadeUp`/`staggerContainer` (`src/lib/animations`), lucide icons.
- **Desktop app** — no deep link: the desktop handles only `auth/callback`, `share`, `import/<slug>`, `ref/` and `pair` (`../personas/src-tauri/src/boot/deep_link.rs`). The install modal, the `/#download` link and the download CTA all point at the marketing download flow.
- **Outbound nav** — cards link to `/templates/[id]`; detail back-links to `/templates`; 404 links to `/templates` and `/`.

## Conventions & gotchas
- **Slug uniqueness is enforced at module load, not at authoring.** `template-queries.ts` builds a `Map` by `id` and **throws** if `templates.length !== map.size`, naming the duplicate(s). Without it, a duplicate id silently overwrites in the Map, `generateStaticParams` emits the path twice (Next dedupes), and one template would render on both URLs with no error in prod. Good guard — but note it fires at import time, so a duplicate id breaks the whole build/site, not just one page. Ids are hand-authored strings (e.g. `gmail-inbox-triage`); there is **no slugify step** and no test asserting uniqueness independently of this runtime throw.
- **Two near-duplicate templates already exist** with *different* ids but overlapping intent: `stripe-invoice-reconciler` and `finance-invoice-reconciler` (both "Invoice Reconciler"), and `stripe-revenue-alerting` vs `finance-revenue-alert-monitor`. They pass the id-uniqueness guard but produce duplicate-looking titles/descriptions in search and JSON-LD — a content-dedup issue, not a crash.
- **`triggerIcons` is duplicated** verbatim in both `templates-page/templatePageConfig.ts` and `template-detail/templateDetailMeta.ts`. They can silently drift; a new trigger type must be added in both.
- **SEO/OG.** Detail `generateMetadata` is solid (per-template canonical + `article` OG + Twitter `summary_large_image`, `noindex` on miss) and the comment notes it was *added* to fix social unfurls that previously fell back to layout defaults. **Gap: there is no per-template OG image** — `twitter.card` is `summary_large_image` but no `images` are set on either OG or Twitter, so social cards render with the site-wide default image (or none). The gallery `layout.tsx` OG likewise sets no `images`. Worth adding an OG image route for `/templates/[id]`.
- **JSON-LD `applicationCategory`** is set to the template's *content* category (e.g. "DevOps", "Finance"), not a schema.org `applicationCategory` enum value — harmless but not strictly schema-conformant.
- **No app-installed detection.** The removed deep link relied on a 1500 ms `blur`-vs-no-blur race that could misfire either way. Wiring a real one-click open needs a desktop `template/` arm or a route through `personas://import/<slug>` with ids the desktop knows (moonshot 4.5A).
- **Clipboard fallback** is correct: `navigator.clipboard` → hidden-`textarea` + `execCommand("copy")` → `copyFailed` state. Note `TemplateConfiguration` shows `t.templatesPage.copied`, while the CTA button reuses `t.waitlist.copied` for the same success state — two different i18n keys for one concept.
- **Token rule exceptions.** `CategoryTile` and the card hover overlay use raw `text-white`, `bg-black/40`, and literal `rgba(...)` gradient stops; hero/related cards use raw `toolColor` hex + `${toolColor}15` alpha and a special-case (`#e6e6e6 → #999`) so Notion's near-white icon stays visible on light. These are deliberate image-scrim / brand-color choices that sidestep the semantic-token convention (#2).
- **Animation gating.** This feature uses only framer-motion `variants` (`fadeUp`/`staggerContainer`) and CSS transitions — no `requestAnimationFrame`/canvas — so the `require-animation-gating` rule doesn't apply. No `useReducedMotion` is needed here.
- **React 19 purity.** Counts and tokenization are pure (`useMemo`/module-load); no impure calls in render. `not-found.tsx` is the route-segment 404 used by both `notFound()` calls (page guard and `TemplateDetail` guard).
- **i18n placeholders are string-replaced, not ICU.** `{count}`/`{shown}`/`{total}`/`{category}` are filled via `.replace`; no pluralization (e.g. "1 templates" is possible).

## Related docs
- [Connectors Catalog](catalog.md)
- [SEO & Social Metadata](../infrastructure/seo-metadata.md)
- [Feature index](../INDEX.md)
