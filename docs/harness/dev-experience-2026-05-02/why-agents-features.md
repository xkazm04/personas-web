# DX Scan — Why Agents & Feature Showcase

> Total: 10 findings (Critical: 0, High: 4, Medium: 4, Low: 2)
> Files read: 21
> Scanner: Dev Experience Engineer

## 1. `GuideLink` type and `/guide/{cat}/{topic}` URL builder duplicated across modules

- **Severity**: High
- **Category**: Repetition
- **File**: `src/components/sections/features/types.ts:4-8`, `src/components/sections/vision-grid/data.ts:3-13`, `src/components/sections/features/components/GuideLinks.tsx:17`, `src/components/sections/vision-grid/PlatformCardTile.tsx:217`
- **Scenario**: A developer adding a new section that links into the guide copy-pastes the `GuideLink` interface (`{ label, category, topic }`) and the inline template literal `` `/guide/${category}/${topic}` ``. Today this exists in at least two places (features, vision-grid), and a `lib/guide-link.ts` helper *also* exists for desktop-app routing — but `GuideLinks.tsx` doesn't use it, so guide links from feature cards open in-app even when running in the desktop shell.
- **Root cause**: No shared `GuideTopicRef` type or URL builder in `src/lib/`. `guide-link.ts` solves the desktop/web split for navigation but isn't wired into the marketing surfaces, and the type shape was redefined per consumer instead of co-located with `data/guide/types.ts`.
- **Impact**: Every new section that links to guides re-defines the type (3 places now, growing). When the guide URL scheme changes (e.g. adds a locale prefix `/en/guide/...`), every consumer must be updated by hand. Desktop app users see a wrong-window experience for these specific links.
- **Fix sketch**: Add `export type GuideTopicRef = { label: string; categoryId: string; topicId: string }` and `export function guideHref(ref: GuideTopicRef): string` to `src/lib/guide-link.ts`. Have `GuideLinks.tsx` call `openGuideLink(guideHref(gt))` via `onClick` (matching the desktop-aware contract). Re-export `GuideTopicRef` from features and vision-grid types and delete the local copies.

## 2. Wasted measure-pass renders both panels for every scenario on mount

- **Severity**: High
- **Category**: Ergonomics
- **File**: `src/components/sections/why-agents/index.tsx:30-51,123-145`
- **Scenario**: To equalize panel heights across scenario transitions, `WhyAgents` mounts a hidden grid that renders **every** `WorkflowPanel` and **every** `AgentPanel` (5 scenarios × 2 panels = 10 framer-motion subtrees) — each with its own enter animations, even though they're `visibility: hidden`. It then measures `scrollHeight` once in a `useEffect` with `[]` deps and never cleans them up.
- **Root cause**: The "measure tallest variant" pattern was implemented inline instead of via a generalized hook. The hidden subtree is left in the DOM forever, and there's no `ResizeObserver` so the heights stale on font-load, viewport zoom, or i18n copy changes. A first-time reader has to reverse-engineer why two copies of the panels exist.
- **Impact**: 10 invisible framer-motion subtrees sit on the page consuming memory and React reconciliation time on every render. New devs assume the duplicate JSX is a bug and try to delete it. Adding a 6th scenario doubles the measurement subtree without warning.
- **Fix sketch**: Extract a `useMaxPanelHeight<T>(items: T[], render: (item) => ReactNode)` hook that mounts the hidden grid in a `Portal`, measures with `ResizeObserver`, then unmounts (or keeps a singleton off-DOM). Add a one-line comment in `index.tsx` explaining the technique. Bonus: remove animations from the hidden subtree by passing a `static` flag through `WorkflowPanel`/`AgentPanel`.

## 3. `data.ts` vs `data.tsx` inconsistency between sibling sections

- **Severity**: Medium
- **Category**: Convention
- **File**: `src/components/sections/why-agents/data.ts`, `src/components/sections/features/data.tsx`
- **Scenario**: A dev jumping between `why-agents/` and `features/` opens "data" expecting the same file extension and finds a mismatch. `features/data.tsx` is a `.tsx` because it embeds `<DesignVisual />` JSX nodes directly into the `features` array; `why-agents/data.ts` is `.ts` because it carries pure data. Other sections (`pricing/data.ts`, `use-cases/data.ts`, `vision-grid/data.ts`) all use `.ts`, making `features/data.tsx` the lone outlier.
- **Root cause**: Embedding ReactNodes in a "data" module mixes presentation with data and forces the extension change. The convention "data files are pure data" was implicit, never written down.
- **Impact**: Tab autocomplete and `cmd+P` searches for `data.ts` skip the features file. New contributors mirror whichever sibling they opened first, perpetuating drift. Visual components can't be lazy-loaded at the data layer.
- **Fix sketch**: Move `visual: <DesignVisual />` etc. out of `data.tsx` — store `visual: "design"` (a key) and let `features/index.tsx` map keys to components via a `VISUALS` record imported from `components/visuals.tsx`. Rename to `data.ts`. Add a one-paragraph "Conventions" section to a section-level README (or extend `harness-learnings.md`) stating "data files are `.ts` and contain no JSX."

## 4. `Scenario` and `Feature` types share concepts but no shared shape

- **Severity**: Medium
- **Category**: Convention
- **File**: `src/components/sections/why-agents/types.ts:3-16`, `src/components/sections/features/types.ts:10-23`
- **Scenario**: Both modules describe "a card with an icon + title + accent color + body content," but each invents its own field names (`accent` vs none; `iconBg/iconColor/iconRing/iconGlow` vs `color: { iconBg, iconRing, iconText }` in `ComparisonCard`). A dev building a third "showcase" section has no canonical shape to copy.
- **Root cause**: No `src/components/sections/shared/types.ts` (or `lib/section-types.ts`) for cross-section primitives like `BrandAccent = "purple" | "cyan" | ...`, `IconStyle`, `CardCopy`. Each section was built standalone.
- **Impact**: Every new section reinvents accent → tailwind class mapping. The `accent: "purple" | "cyan" | "emerald" | "amber"` literal in `features/types.ts` is hand-mirrored by the unrelated `ComparisonCardColor` palette literals in `ScenarioDuel.tsx`. Brand color changes require touching N files instead of 1.
- **Fix sketch**: Introduce `src/lib/brand-accent.ts` with `type BrandAccent`, `BRAND_ACCENT_CLASSES: Record<BrandAccent, { iconBg, iconRing, iconText, glow, orb, ... }>`. Refactor `features/data.tsx` to store just `accent: "purple"` and derive the classes; do the same for the two `ComparisonCard` color blocks in `ScenarioDuel.tsx`.

## 5. 25+ section files use the same wrapper-re-export pattern with no documented rationale

- **Severity**: Medium
- **Category**: Documentation
- **File**: `src/components/sections/WhyAgents.tsx:1`, `src/components/sections/Features.tsx:1`, plus 23 more (per grep)
- **Scenario**: A new dev opens `WhyAgents.tsx` to fix a typo and finds a one-line `export { default } from "./why-agents/index"`. They wonder: is this for tree-shaking? lazy loading? a refactor mid-flight? Nothing explains it. They eventually find `lazy.tsx` doing dynamic imports of the `PascalCase` paths and infer the convention.
- **Root cause**: The pattern lets `lazy.tsx` (and consumers) keep stable PascalCase import paths while the implementation is a folder with `components/`, `data.ts`, `types.ts`. Useful, but undocumented.
- **Impact**: First contact with the section directory is a confusing wrapper file. Every code review of a "new section" PR repeats the question. Refactoring a section to be folder-based is "magic" — nobody knows the convention exists.
- **Fix sketch**: Either (a) collapse the wrapper by changing `lazy.tsx` to import `@/components/sections/why-agents` directly (Next.js will pick up `index.tsx`) and delete the 25 wrapper files, or (b) keep them and add a 3-line comment at the top of one canonical file plus a sentence in the section-folder README explaining the contract. (a) is the cleaner DX win.

## 6. `scenarios` array imported as a module-level constant inside leaf components

- **Severity**: Medium
- **Category**: Ergonomics
- **File**: `src/components/sections/why-agents/components/ScenarioDuel.tsx:7,20,47`, `ScenarioSelector.tsx:6`, `ScenarioProgress.tsx:6`
- **Scenario**: Four sibling components reach back into `../data` for the `scenarios` constant instead of receiving it as a prop. The parent `index.tsx` already has `scenarios` and a derived `scenario` — but only passes `scenario` (singular) down, forcing children to re-import the whole array.
- **Root cause**: Convenient at first ("just import the data"), but it makes the components untestable in isolation and locks them to one dataset. `ScenarioDuel` even re-derives `scenarios[activeIndex]` twice when it already received `scenario` as a prop.
- **Impact**: Storybook / unit tests can't supply mock scenarios. Adding role-specific scenarios (the `roleCopy` pattern hints this is coming) requires either adding a global state or threading new props late. The double-derivation in `ScenarioDuel` is a latent bug the day someone adds a transform between parent and child.
- **Fix sketch**: Pass `scenarios` (or just `scenarios.length` + `labels` for selector/progress) as props from `index.tsx`. Remove the `import { scenarios }` lines from the four child files. `ScenarioDuel` should accept `workflowChild` / `agentChild` content rather than re-deriving scenario internally.

## 7. Magic positioning math in `ProgressionThread` has no comment or constants

- **Severity**: Medium
- **Category**: Documentation
- **File**: `src/components/sections/features/components/ProgressionThread.tsx:24`
- **Scenario**: The expression `top: i === 0 ? 28 : \`calc(50% + ${(i - 1) * 80 - 40}px)\`` positions the four numbered dots along the dashed thread. There is no explanation of where 28, 80, or 40 come from — they're tied to the heights of cards rendered in `features/index.tsx` (hero card vs grid cards). Tweaking card padding silently misaligns the dots.
- **Root cause**: Layout coupling expressed as inline magic numbers. The thread component "knows" it's being used inside a specific layout but encodes it as opaque arithmetic.
- **Impact**: Any padding/spacing change to feature cards requires re-deriving these numbers by visual trial-and-error. New devs are afraid to touch `features/index.tsx` spacing because of unexplained downstream breakage.
- **Fix sketch**: Replace with named constants (`HERO_DOT_OFFSET_PX = 28`, `GRID_DOT_SPACING_PX = 80`, `GRID_DOT_FIRST_OFFSET_PX = -40`) at the top of the file with a comment diagram showing how they relate to the parent layout. Better: position the dots via CSS grid alignment so they auto-track the cards.

## 8. Inline `<a>`-style guide links bypass the established desktop link contract

- **Severity**: High
- **Category**: Convention
- **File**: `src/components/sections/features/components/GuideLinks.tsx:17`
- **Scenario**: `GuideLinks` uses Next.js `<Link href="...">`, but the project has `src/lib/guide-link.ts` specifically because the desktop app shells the same React tree and needs link clicks routed through `window.dispatchEvent("personas:open-external", ...)`. So feature-card guide links open inside the desktop webview while the rest of the guide system opens them externally.
- **Root cause**: `guide-link.ts` was added later (its docstring says "Platform-agnostic link handler for guide content") and not retrofitted into the marketing components.
- **Impact**: Inconsistent UX between in-guide navigation and feature-card navigation when the site is loaded inside the Personas desktop shell. Easy to miss in code review because the bug only manifests in the desktop build.
- **Fix sketch**: Replace `<Link href={url}>` with `<button onClick={() => openGuideLink(url)}>` (per `guide-link.ts` docstring), or extend `guide-link.ts` to export an `<ExternalLink>` component and use it everywhere `BookOpen` icons appear. Add a lint rule or codeowner note: "`<Link>` to `/guide/...` is forbidden in marketing — use `openGuideLink`."

## 9. Animation delay arithmetic copy-pasted across `AgentPanel` and `WorkflowPanel`

- **Severity**: Low
- **Category**: Repetition
- **File**: `src/components/sections/why-agents/components/AgentPanel.tsx:35,52-54`, `src/components/sections/why-agents/components/WorkflowPanel.tsx:30,56`
- **Scenario**: Both panels compute staggered delays inline: `delay: i * 0.15`, `delay: scenario.workflow.steps.length * 0.15 + 0.1`, `delay: scenario.agent.thoughts.length * 0.2 + scenario.agent.actions.length * 0.12 + 0.1`. Tweaking the rhythm requires recomputing magic numbers in two files.
- **Root cause**: No shared `staggerSequence(items, baseDelay, perItem)` helper. The duel-style "result appears after all steps" pattern is an obvious utility waiting to be extracted.
- **Impact**: Visual rhythm drifts between the two panels over time. Hard to globally tune motion to feel synchronized. Every new step type (e.g. "checks") adds another delay term to maintain.
- **Fix sketch**: Add `function staggerDelay(index: number, base = 0): { delay: number }` and `function nextDelay(prevCount: number, perItem: number, gap: number): number` to `lib/animations.ts`. Replace both panels' inline math with these helpers.

## 10. `cardOrchestrator` uses anonymous index-based variants array `gridCardVariants[i]`

- **Severity**: Low
- **Category**: Ergonomics
- **File**: `src/components/sections/features/data.tsx:21-49`, `src/components/sections/features/index.tsx:75`
- **Scenario**: Each of the three secondary feature cards uses a different motion entrance (slide-left, fade-up, slide-right). The variants live in a 3-element `Variants[]` array, indexed by position in the `features.slice(1).map((f, i) => ...)` loop. Adding a 5th feature throws off the indexing silently — the new card gets `undefined` as its variant.
- **Root cause**: Visual intent ("the middle card slides up; the wings slide inward") is encoded as array order rather than as a property on each feature.
- **Impact**: Reordering features in `data.tsx` re-shuffles the entrance animations without warning. A new contributor adding feature #5 sees no error at compile time and possibly broken animation at runtime. Discoverability of "which animation am I getting" requires reading two files.
- **Fix sketch**: Add an `entrance: "slideLeft" | "fadeUp" | "slideRight"` field on each `Feature` (or compute from a position-aware helper that handles any count). Map keys to variants in `index.tsx`. Either way, the data colocates with the visual intent and the count of features can grow without re-indexing.
