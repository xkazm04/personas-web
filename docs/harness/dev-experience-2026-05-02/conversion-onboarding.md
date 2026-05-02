# DX Scan — Conversion & Onboarding Sections

> Total: 11 findings (Critical: 0, High: 4, Medium: 5, Low: 2)
> Files read: 24 of 25 (MidPageCTA.tsx does not exist on disk — see Finding 1)
> Scanner: Dev Experience Engineer

## 1. MidPageCTA.tsx is referenced in scan list but file is missing

- **Severity**: High
- **Category**: Convention
- **File**: `src/components/sections/MidPageCTA.tsx` (does not exist)
- **Scenario**: A developer told to "edit the mid-page CTA copy" or sent the scan brief looks for `MidPageCTA.tsx`, fails to find it, and has no breadcrumb to discover whether it was deleted, renamed, or never existed. A `Glob` for `*CTA*` returns only `DownloadCTA.tsx` and `connector-modal/components/SetupCTA.tsx`. There is no mid-page CTA component anywhere in `src/components/sections`.
- **Root cause**: Either the component was deleted and the scan harness/file lists were not updated, or it was planned and never built. No `git mv` redirect, no deprecation note, no replacement export. Whoever maintains the scan-target list is out of sync with the codebase.
- **Impact**: Every developer who follows older docs, AI prompts, or copy-paste task lists wastes minutes confirming the file truly is missing. Worse, a new dev may add a *new* `MidPageCTA.tsx` from scratch when the original was intentionally removed in favour of inline CTAs inside other sections, fragmenting the CTA surface area further.
- **Fix sketch**: Decide intent: (a) if a mid-page CTA pattern is wanted, factor `DownloadCTA.tsx` into a reusable `<DownloadCTA variant="full" | "compact">` so a "mid-page" instance is just `<DownloadCTA variant="compact">`, OR (b) drop the reference everywhere (search-and-destroy stale mentions in docs and harness scan configs). Add a `CHANGED.md` or `MIGRATIONS.md` line so the trail isn't lost again.

## 2. `Pricing.tsx` is a one-line re-export — same pattern as `GetStarted.tsx` but not used consistently

- **Severity**: Medium
- **Category**: Convention
- **File**: `src/components/sections/Pricing.tsx:1`, `src/components/sections/GetStarted.tsx:1`
- **Scenario**: A developer opens `Pricing.tsx`, sees `export { default } from "./pricing/index";`, then has to navigate again to `pricing/index.tsx`. Same for `GetStarted.tsx` → `get-started/index.tsx`. Meanwhile `FAQ.tsx`, `Footer.tsx`, `DownloadCTA.tsx` are all single files with no folder. Other folder-based sections (`use-cases/`, `roadmap/`, `comparison-table/`) use the folder convention WITHOUT a top-level shim file. Three different patterns coexist for "section that may have helpers."
- **Root cause**: The folder-based variants were extracted incrementally; the top-level `Pricing.tsx` / `GetStarted.tsx` shims were kept to avoid touching every importer (e.g. `lazy.tsx` does `import("@/components/sections/Pricing")`). The shims were never deleted after the imports were updated, and other folder-extractions did not create shims at all.
- **Impact**: Two extra navigation hops on every "edit pricing" or "edit get-started" task. New devs ask "is `Pricing.tsx` the real one or just a wrapper?" Grep results return both files, doubling noise. Cumulative cost: minutes per week, plus the perpetual ambiguity of "which file is the source of truth?"
- **Fix sketch**: Pick one pattern: either (a) delete the shims and update `lazy.tsx` to import `@/components/sections/pricing` and `@/components/sections/get-started` directly (Next.js will resolve `index.tsx`), OR (b) add shims for *all* folder-based sections and document the convention in `src/components/sections/README.md`. Option (a) is one-time cleanup, option (b) is forever-maintenance — pick (a).

## 3. Three lazy-loading files (`LazySection.tsx`, `lazy.tsx`, `how-lazy.tsx`) with overlapping responsibilities

- **Severity**: High
- **Category**: Repetition
- **File**: `src/components/sections/LazySection.tsx`, `src/components/sections/lazy.tsx`, `src/components/sections/how-lazy.tsx`
- **Scenario**: A developer adding a new lazy-loaded section has to choose between three files and three near-identical patterns: `createLazySection()` from `LazySection.tsx`, the inline `dynamic(...)` calls in `lazy.tsx`, or the inline `dynamic(...)` calls in `how-lazy.tsx`. `lazy.tsx` defines its own bespoke skeletons (Vision, Pricing, FAQ); `how-lazy.tsx` defines another (EventBus); both also wrap calls to `createLazySection()` from `LazySection.tsx`. There's no documented rule for when to use which.
- **Root cause**: `LazySection.tsx` was extracted as the shared helper, but the page-specific files (`lazy.tsx` for landing, `how-lazy.tsx` for /how) were never refactored to fully use it — they still do hand-rolled `dynamic(...)` calls just to wire up custom skeletons. The wrapper functions like `export function LazyVision() { return <VisionSection />; }` are pure boilerplate that adds nothing over re-exporting the dynamic component directly.
- **Impact**: Every "add a lazy section" task forces a 5-minute spelunk through three files. Skeletons drift visually because they live next to each other in `lazy.tsx` but follow different conventions. Bundle splitting decisions (`ssr: true` vs `ssr: false`) are inconsistently applied (`AgentsTimeline` is `ssr: false` while `Vision` is `ssr: true` for no documented reason).
- **Fix sketch**: Extend `createLazySection()` to accept `{ ssr?: boolean }` and remove the bespoke `dynamic(...)` calls in both `lazy.tsx` and `how-lazy.tsx`. Drop the trivial `LazyVision` / `LazyFAQ` etc. wrapper functions — export the lazy component directly. Move skeletons into `lazy/skeletons/` (one file per skeleton) and import them by name. Document the decision tree (when `ssr: true`, when custom skeleton) at the top of `LazySection.tsx`.

## 4. The 5 visuals share ~60% structural code with no shared primitives

- **Severity**: High
- **Category**: Repetition
- **File**: `src/components/sections/get-started/visuals/{Connect,Create,Download,Improve,Work}Visual.tsx`
- **Scenario**: All five visuals are wrapped in `<div className="flex h-full flex-col justify-center gap-{4,5}">`. All five compute `const color = BRAND_VAR[brand]` from the same `VisualProps`. Four of five include a top "badge pill" (`rounded-full border px-4 py-2` with icon + uppercase mono text); each repeats the inline style for `borderColor: "var(--border-glass-hover)"` + `backgroundColor: "rgba(var(--surface-overlay), 0.02)"`. The grid/list rows in Connect/Download/Work use the same inline-style border/background pattern five times across the three files. A developer adding a 6th visual (or adjusting the badge styling globally) has to touch all five files identically.
- **Root cause**: Visuals were authored one at a time and the recurring chrome (badge pill, list row, container) was never factored. The `BrandCard` primitive in `@/components/primitives` solves the surrounding card pattern but not the inner-visual chrome.
- **Impact**: Globally tweaking the "badge pill" look (e.g. tightening padding for mobile) is a 4-file edit. Adding a new visual requires copying ~25 lines of boilerplate from a sibling file. Inline-style strings like `"rgba(var(--surface-overlay), 0.02)"` appear 11+ times across the visuals folder — a search-replace risk.
- **Fix sketch**: Add three primitives in `get-started/visuals/_chrome.tsx` (or `primitives/`): `<VisualFrame>` (the outer flex container), `<VisualBadge icon={Icon} label="...">` (the top pill), `<VisualRow>` (border + transparent bg row used in Download/Work). Have each visual import them. Delete repeated inline styles. Net: each visual file shrinks 30-40%, future visuals are 10 lines instead of 50.

## 5. `STEP_BG_BY_NUMBER` in `StepContent.tsx` duplicates the dark/light image pattern with no helper

- **Severity**: Medium
- **Category**: Repetition
- **File**: `src/components/sections/get-started/StepContent.tsx:10-16`
- **Scenario**: A developer adding a 6th step or replacing artwork has to add another `{ dark: "/imgs/get-started/stepN-dark.png", light: "/imgs/get-started/stepN-light.png" }` entry — the path pattern is mechanical but hand-typed five times today. The two `<img>` tags below also hand-roll the dark/light theme switch with `hidden dark:block` and `block dark:hidden` plus matching gradient overlays — both pairs are wholly duplicated except for opacity numbers and gradient stop percentages.
- **Root cause**: The dark/light image pair pattern wasn't extracted into a small component because it appeared only once per step. But because it appears in *both* layers (image + gradient overlay), it's actually two duplicated pairs in the same component.
- **Impact**: Onboarding artwork changes (very common for marketing) become a 5-line copy-paste plus visual diff to verify the dark and light variants both updated. Risk of forgetting to change one half. The `STEP_BG_BY_NUMBER` map could trivially be a `${step.number}` template, eliminating the lookup entirely.
- **Fix sketch**: Replace the map with `const bg = { dark: \`/imgs/get-started/step${step.number}-dark.png\`, light: \`/imgs/get-started/step${step.number}-light.png\` }`. Extract a `<ThemedBackgroundImage src={bg} darkOpacity={0.2} lightOpacity={0.35} />` component that renders both `<img>` + both gradient overlays. The whole block in `StepContent.tsx:48-80` collapses to one tag.

## 6. `STEP_ICONS` / `STEP_BRAND` arrays parallel `TOUR_STEPS` by index — fragile coupling

- **Severity**: Medium
- **Category**: Convention
- **File**: `src/components/sections/get-started/data.ts:5-11`, `src/components/sections/get-started/visuals/index.ts:16-22`
- **Scenario**: `TOUR_STEPS` lives in `src/data/tour.ts` and has 5 entries. The icon, brand, and visual are stored in three *separate* index-aligned arrays in two different files (`data.ts` and `visuals/index.ts`). A developer reordering steps, adding step 6, or removing step 3 must remember to also reorder/extend three more arrays in two more files — and there is no type guard to catch a mismatch. If `STEP_VISUALS.length !== TOUR_STEPS.length`, you get an `undefined` Visual and a runtime crash on the affected step.
- **Root cause**: The comment in `data.ts:7-10` admits the design intent: "keeps the data source untouched while rendering theme-adaptively." But the chosen mechanism (parallel arrays by index) trades one form of coupling (data file imports React) for a worse form (silent index drift across files).
- **Impact**: The next person who edits steps will likely forget one of these arrays. A unit test would catch it but none exists. The error mode (`undefined.icon` at render time) only fires on the affected step.
- **Fix sketch**: Either (a) move `icon` and `brand` *into* `TOUR_STEPS` as new optional fields (the LucideIcon type + BrandKey are pure TS, no React DOM dependency, so this is safe), or (b) keep the arrays but add a runtime assert + Vitest test: `expect(STEP_ICONS).toHaveLength(TOUR_STEPS.length)`. Option (a) is structurally better; if rejected for the stated "untouched data source" reason, do (b) at minimum.

## 7. `DownloadCTA.tsx` step-card styling is 60+ lines of inline animation config that belongs in a primitive

- **Severity**: Medium
- **Category**: Repetition
- **File**: `src/components/sections/DownloadCTA.tsx:77-134`
- **Scenario**: A developer wanting to reuse the "glowing step pill" treatment elsewhere (the obvious place: a real `MidPageCTA` — see Finding 1) has to copy 50+ lines of inline `variants={{ hidden: ..., visible: { boxShadow: [...], borderColor: [...] } }}`. The `glowColor` ternary (`index === 0 ? cyan : index === 1 ? purple : ...`) is hard-coded by index, defeating brand theming consistency. The `replace("0.5", "0.4")` string-manipulation tricks to derive related colors are an antipattern in a codebase that already has `tint(brand, n)` from `@/lib/brand-theme`.
- **Root cause**: The animation was probably tuned visually in this file and never extracted. The brand-theme helper was imported elsewhere but not here, so the colors are hand-coded as RGBA strings.
- **Impact**: Three problems: (1) cannot reuse this CTA pattern elsewhere without copy-paste; (2) the colors won't theme-switch correctly (light mode uses the same dark-mode hex); (3) any future "add a 4th step" requires adding another `glowColor` branch to the ternary.
- **Fix sketch**: Extract `<GlowingStepCard step={index + 1} brand="cyan" | "purple" | ...>{label}</GlowingStepCard>` into `src/components/primitives/`. Replace the hand-coded RGBA with `tint(brand, n)` calls. Replace the index-keyed ternary with a `brands` array prop on the parent. The DownloadCTA file shrinks by ~50 lines and the primitive is then available for any future CTA.

## 8. `BRAND_VAR.emerald` hardcoded in `WorkVisual.tsx` breaks the brand-prop contract

- **Severity**: Medium
- **Category**: Convention
- **File**: `src/components/sections/get-started/visuals/WorkVisual.tsx:43, 69`
- **Scenario**: `WorkVisual` accepts a `brand: BrandKey` prop but ignores it for "done" states, hardcoding `BRAND_VAR.emerald`. If a future redesign maps step 4 to a different brand color (or adds a "warning" state palette), the result is visually broken — done-state dots and check icons stay green regardless. A developer reading the file sees `const color = BRAND_VAR[brand]` and reasonably assumes all colors derive from `brand`; the emerald hardcoding is a hidden surprise.
- **Root cause**: "Done" semantically means success/green in most UIs, so green felt like a universal choice. But it's inconsistent with the rest of the visuals that derive everything from `brand`, and it isn't named (`BRAND_VAR.emerald` instead of e.g. `STATE_COLORS.success`).
- **Impact**: A latent bug for any future theme change. Cognitive friction every time a developer reads the file ("why emerald here when the brand is amber?"). Sets a precedent — the next visual author may also hardcode whatever color "feels right."
- **Fix sketch**: Add `STATE_COLORS = { success: BRAND_VAR.emerald, warning: BRAND_VAR.amber, error: BRAND_VAR.rose }` to `@/lib/brand-theme`, import that, and use `STATE_COLORS.success`. Now the intent is explicit and centrally tunable. Audit other visuals for similar hardcoded brand bypasses.

## 9. FAQ `useColumns` / `useColumns()` pattern in Footer is unusual — it's not a hook, just a function with a hook inside

- **Severity**: Low
- **Category**: Convention
- **File**: `src/components/sections/Footer.tsx:12-44`
- **Scenario**: `useColumns()` is named like a custom hook but doesn't follow the typical pattern of returning state — it just calls `useTranslation()` then returns a constant. It exists purely so the translation lookup can happen inside a component. A new developer reads `useColumns()` and looks for `useState`/`useEffect` machinery that isn't there.
- **Root cause**: The module-level `columns` constant was hoisted into a function so it could call `useTranslation()`. The `use` prefix was applied because the function calls a hook, satisfying React's rules-of-hooks lint, but it doesn't actually carry hook-like semantics.
- **Impact**: Mild — confusing for readers, but harmless. Sets a confusing convention if copied elsewhere.
- **Fix sketch**: Either rename to `getColumns()` (lint will complain because it calls a hook) or, better, inline the `t` lookups into JSX directly (it's only used in 3 columns, ~12 link entries — flat enough). Or move the structure to a `getColumns(t)` pure function called from inside the component, eliminating the hook-rule trap entirely.

## 10. FAQ illustrations array indexed by question position — drift hazard

- **Severity**: Medium
- **Category**: Convention
- **File**: `src/components/sections/FAQ.tsx:26-33, 109-113`
- **Scenario**: `illustrations[i]` pairs questions to illustrations purely by their array index. If the i18n team adds a new FAQ question, removes one, or reorders them in the translation file, the illustrations silently shift to the wrong questions — and there is no type-system or runtime check. A French/Spanish translator who reorders for cultural reasons will silently break the visual pairing on those locales.
- **Root cause**: Quick-and-dirty pairing during initial implementation. The translation system holds the questions, but illustrations are React components that can't live in i18n JSON.
- **Impact**: Locale-dependent breakage, hard to catch in QA because it requires checking every locale × every FAQ. Adding a 7th question crashes (`illustrations[6]` is undefined → `<FAQCard>` renders no illustration but no error is logged).
- **Fix sketch**: Add an `illustrationKey: "terminal" | "shield" | "pricing" | ...` field to each FAQ entry in the i18n source, then `illustrations[item.illustrationKey]` (a Record, not an array). Or move illustration assignment into `FAQ.tsx` keyed by a stable `q.id` rather than position. Add a Vitest snapshot test that walks all locales and asserts every question has an illustration.

## 11. `AUTO_ADVANCE_MS` is in `data.ts` but actually a UX/timing constant — wrong file

- **Severity**: Low
- **Category**: Ergonomics
- **File**: `src/components/sections/get-started/data.ts:13`
- **Scenario**: A developer wanting to tune the carousel speed grep-searches the codebase for "ms" / "interval" / "advance" and may not find this in `data.ts` (where they'd expect content data, not timing). Other auto-cycling sections (per the comment in `useAutoCycle.ts`: OrchestrationHub, AgentsChat, AgentsTimeline, WhyAgents, PlaygroundTimeline) likely have their own scattered constants.
- **Root cause**: Convenient placement next to the icons/brands that share the same `import` site. The `data.ts` filename, however, signals "content data" not "timing config."
- **Impact**: Minor — but compounds the already-confusing coupling described in Finding 6. Cross-section consistency (do all carousels advance every 7s? 5s? 3s?) is impossible to audit without grepping multiple files.
- **Fix sketch**: Centralize auto-cycle timings in `src/lib/timings.ts` (or extend `lib/animations.ts`) as `export const CAROUSEL_INTERVAL_MS = { default: 7000, fast: 3200, slow: 10000 }`. Each section imports `CAROUSEL_INTERVAL_MS.default` (or named override). Now tuning the brand-wide carousel cadence is one edit. Bonus: add a short Storybook story or `useAutoCycle` JSDoc example showing the recommended values.
