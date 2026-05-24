# DX Scan — Platform Showcase Sections

> Total: 11 findings (Critical: 1, High: 4, Medium: 4, Low: 2)
> Files read: 31
> Scanner: Dev Experience Engineer

## 1. PipelineShowcase is a 7-line alias for OrchestrationHub — should be deleted, not maintained

- **Severity**: High
- **Category**: Repetition
- **File**: `src/components/sections/PipelineShowcase.tsx:1-8`
- **Scenario**: A developer searching for "the pipeline showcase component" lands on `PipelineShowcase.tsx` and finds it just renders `<OrchestrationHub />`. They then have to figure out (a) whether this aliasing is intentional, (b) whether they should edit `OrchestrationHub` or `PipelineShowcase` to change the rendered output, and (c) what `LazyPipelineShowcase` (used on the homepage with `wrapperId: "pipelines"`) actually shows. The `orchestration-hub/index.tsx` doc-comment even says it was "redesigned from the old single-chain 'Pipelines' concept", confirming that this aliasing is legacy carryover.
- **Root cause**: The "Pipelines" concept was renamed to "Orchestration", but the `PipelineShowcase` component path was kept alive (probably to avoid touching `app/page.tsx` and `lazy.tsx` import names). The result is a phantom file that pretends to be its own section.
- **Impact**: Two grep hits for every change ("which file owns this section?"). New devs assume they are two distinct visualizations and waste 10–20 minutes confirming they aren't. Section catalogs, sitemaps, and screenshot tests are at risk of double-counting.
- **Fix sketch**: Either (a) delete `PipelineShowcase.tsx`, rename `LazyPipelineShowcase` → `LazyOrchestrationHub` in `src/components/sections/lazy.tsx:144,160`, and update the import in `src/app/page.tsx:10`; or (b) keep the lazy export name for URL-anchor stability but change its `import()` to point directly at `@/components/sections/OrchestrationHub`. Either way, drop the file. The `wrapperId: "pipelines"` anchor in `app/page.tsx:138` is what users link to, not the React component name — those are independent.

## 2. Six Terminal* components are siloed inside `platform-command/` despite being generic

- **Severity**: High
- **Category**: Repetition
- **File**: `src/components/sections/platform-command/components/{BlinkingCursor,TerminalLine,TerminalHistory,TerminalBackground,TerminalControls,CommandBadge}.tsx`
- **Scenario**: A developer building a new terminal-style demo (e.g., extending `app/playground/TerminalSim.tsx`, `agent-playground/`, `playground-timeline/`, `agents-chat/`, `vision-globe/`, or `playground-split/PromptEditorPanel.tsx` — all of which already use `TerminalChrome`) wants a blinking cursor or a per-line typed-output animation. They search the codebase, see `BlinkingCursor` only in `platform-command/components/`, and either (a) re-implement it inline (TerminalSim.tsx:137-146 already does — "_" with opacity animation), (b) reach across section boundaries, which feels wrong, or (c) duplicate the OutputLine/colorClasses pattern in their own `data.ts`.
- **Root cause**: When `PlatformCommand.tsx` was refactored into a folder, the sub-components were kept local because they were "platform-command specific" — but in fact `BlinkingCursor`, `TerminalLine`, and `TerminalHistory` are entirely generic and have no platform-command-specific imports. Meanwhile shared terminal scaffolding (`TerminalChrome`, `TerminalPanel`) lives in `src/components/`. The convention is inconsistent: chrome is shared, contents are siloed.
- **Impact**: Each new terminal-style section reimplements typing/cursor/output rendering. The `TerminalSim.tsx` cursor (`_` blinking) and `BlinkingCursor` (rectangle blinking) already disagree visually. As the team ships more demos, drift compounds — and the shared `OutputLine`-with-color type already exists in two shapes (`platform-command/types.ts` vs `app/playground/data.ts`).
- **Fix sketch**: Promote the trio to `src/components/primitives/terminal/` next to `TerminalPanel.tsx`: `BlinkingCursor.tsx`, `TerminalLine.tsx` (accept `colorClass` as prop instead of importing `colorClasses` from `data`), `TerminalHistory.tsx`. Move `OutputLine`/`colorClasses` into a shared `terminal-line.ts`. Leave `TerminalControls`/`CommandBadge` local since they have command-specific props. Refactor `TerminalSim.tsx` to use the same `BlinkingCursor`. Two-hour effort, eliminates a whole class of future drift.

## 3. Layer styling is dual-encoded as both `rgb` strings and Tailwind class bundles

- **Severity**: High
- **Category**: Convention
- **File**: `src/components/sections/platform-layers/data.tsx:5-129`, `types.ts:9-18`
- **Scenario**: To add a fifth layer (or recolor an existing one), a developer must update SIX coordinated values per layer: `color: "emerald"`, `rgb: "52,211,153"`, and a `tw` object containing `border`, `bg`, `text`, `glow`, `labelBg`, `labelBorder`. Get any of them out of sync and the layer's gradient, glow, label, and border stop matching. Yet `BRAND_VAR`/`tint` exists in `src/lib/brand-theme.ts` and provides exactly this color expansion via CSS color-mix.
- **Root cause**: `platform-layers/` was built before (or in parallel with) `brand-theme.ts` adoption. The other sibling sections (orchestration-hub, platform-command, event-bus) use `BRAND_VAR`/`tint(brand, pct)` and a single `brand: BrandKey` field. `platform-layers` is the holdout.
- **Impact**: Every recolor is a 6-line edit per layer with no compile-time guarantee they match. The `rgb` strings hardcode dark-theme RGB values, so the glow/connection-pillar colors silently misrepresent themselves in light themes (light themes use different brand RGBs via CSS vars). A theme-quality bug that cannot be caught by type-checking.
- **Fix sketch**: Replace `rgb`+`tw` with a single `brand: BrandKey` field. Use `tint(layer.brand, 6)` for `bg`, `tint(layer.brand, 20)` for borders, `BRAND_VAR[layer.brand]` for text, and `brandShadow(layer.brand, 40, 8)` for glow. `LayerAnimated.tsx`/`LayerConnectionAnimated.tsx`/`StackLabelsAnimated.tsx` then reference brand-theme helpers instead of pre-baked Tailwind classes — same visual output, theme-correct, ~90 lines of `tw` objects deleted.

## 4. Wrapper-vs-index pattern: 22 one-line re-export files exist purely as Next.js dynamic-import targets

- **Severity**: Medium
- **Category**: Convention
- **File**: `src/components/sections/{OrchestrationHub,PlatformCommand,PlatformLayers,EventBusShowcase,…}.tsx` (22 files, all 1 line)
- **Scenario**: A new contributor opens `OrchestrationHub.tsx`, sees `export { default } from "./orchestration-hub"`, and is briefly confused about which file holds the implementation. They learn the pattern and accept it, then later have to remember "to add a new section, create both `Foo.tsx` AND `foo/index.tsx`". When they forget the wrapper, `lazy.tsx` import paths still work (because `import("@/components/sections/Foo")` would resolve to the folder too), so the wrapper feels superstitious.
- **Root cause**: The wrappers seem to exist only to keep `dynamic(() => import("@/components/sections/Foo"))` calls in `lazy.tsx` and `how-lazy.tsx` looking like flat imports. But Next.js handles folder imports (with index) just fine — `dynamic(() => import("@/components/sections/orchestration-hub"))` works identically and creates the same chunk.
- **Impact**: 22 files of pure boilerplate, doubles the number of "section file" search hits, and creates a new-contributor stumbling block. Also makes refactor tools (rename, find-references) noisier. Roughly +20 minutes of onboarding confusion per developer, recurring forever.
- **Fix sketch**: Delete all 22 wrappers. In `src/components/sections/lazy.tsx` and `how-lazy.tsx`, change `import("@/components/sections/Foo")` to `import("@/components/sections/foo")` (lowercase folder). Add a one-line CONTRIBUTING note: "sections live in `kebab-case/index.tsx`; lazy them via `createLazySection(() => import('@/components/sections/kebab-case'))`." Keep the kebab-case folder as the single source of truth. If any external consumer (storybook? screenshot test?) imports the PascalCase path, fix those references too — `grep -r "components/sections/[A-Z]"` will find them.

## 5. `data.tsx` vs `data.ts` inconsistency is meaningful but undocumented

- **Severity**: Medium
- **Category**: Convention
- **File**: `src/components/sections/platform-layers/data.tsx`, `src/components/sections/features/data.tsx` (only two `.tsx` data files in the repo)
- **Scenario**: A developer opens `platform-layers/data.tsx` looking for trigger/text content and is surprised to find inline JSX `visual` fields (lines 22-31, 50-61, 80-98, 117-127). They wonder whether to inline JSX into other `data.ts` files when adding "rich" content, or whether to move it into a sibling component. There is no rule.
- **Root cause**: The `Layer.visual: ReactNode` field forces the data file to import React/JSX, hence the `.tsx` extension. The convention isn't called out anywhere; it's just a side effect of mixing data and view.
- **Impact**: Mild — but new devs will either (a) put JSX in `data.ts` and break the build, or (b) avoid `ReactNode` data fields and reinvent the visual lookup elsewhere. Either is wasted time.
- **Fix sketch**: Either (a) extract `visual` per layer into `components/LayerVisuals/{deploy,coordinate,design,monitor}.tsx` keyed by `layer.id`, then make `data.ts` pure data (preferred, also lazier-loadable); or (b) document the rule in a `CONTRIBUTING.md` or section README: "data files are `.ts` unless they contain JSX, in which case `.tsx`." Option (a) costs an hour and removes the inconsistency entirely.

## 6. The `*Animated.tsx` suffix is a one-off naming convention

- **Severity**: Medium
- **Category**: Convention
- **File**: `src/components/sections/platform-layers/components/{LayerAnimated,LayerConnectionAnimated,StackLabelsAnimated}.tsx`
- **Scenario**: A developer browsing `platform-layers/components/` sees `LayerAnimated`, `LayerConnectionAnimated`, `StackLabelsAnimated` and `ConnectionPillar` (no suffix). They wonder: "Is `ConnectionPillar` not animated? Are there non-animated versions of `Layer`, `LayerConnection`, `StackLabels` somewhere I should be using on smaller screens / for screenshot tests?" The answer is no — every section in this scan is animated; the suffix says nothing.
- **Root cause**: Likely a refactor artifact — perhaps an earlier `Layer.tsx` existed and was replaced by an animated version without renaming back. The suffix is unique to this folder; no other section uses it.
- **Impact**: Mild — but every developer touching this folder has to mentally parse the suffix and confirm there's no static counterpart. Not a blocker, but it is a convention smell that misleads.
- **Fix sketch**: Drop the suffix in a single rename pass: `LayerAnimated.tsx` → `Layer.tsx`, `LayerConnectionAnimated.tsx` → `LayerConnection.tsx`, `StackLabelsAnimated.tsx` → `StackLabels.tsx`. Update the three imports in `platform-layers/index.tsx`. Five-minute change that removes a question every reader will have.

## 7. `useTerminalSequence` mixes 4 effects + 5 useState pieces with no test harness

- **Severity**: Medium
- **Category**: Testing
- **File**: `src/components/sections/platform-command/use-terminal-sequence.ts:1-174`
- **Scenario**: A developer wants to (a) skip multiple commands at once, (b) reduce the per-line delay for slower devices, or (c) verify the "summary → done → restart" loop fires exactly once per cycle. They open the hook and find a state machine spread across 4 `useEffect` blocks coordinating `phase`, `typedText`, `outputLines`, `history`, `currentCommandIndex`, and `showSummary`, with three `setTimeout`-based transitions and a `isActiveRef` mount guard. There are no tests, and no way to drive the state machine outside React.
- **Root cause**: The state machine logic was inlined as effects rather than extracted into a pure reducer. There's no `usePlatformCommand` test file (or any `__tests__` folder for sections at all in the scanned files).
- **Impact**: Even small changes (skip-all button, reduced motion timing, replay throttle) require manually clicking through the visualization in browser. Race conditions like "user clicks Skip while typing" already had to be handled defensively (`isActiveRef`, manual `clearTimeout`s) and the hook is fragile to further changes.
- **Fix sketch**: Extract the transition logic into a pure reducer: `(state, event) => state` where events are `tick`, `skip`, `restart`, `inViewChanged`. The hook becomes a thin wrapper that schedules `tick` events via `setTimeout`. Add a Vitest unit test that drives the reducer through a full cycle (idle → typing → output → typing → … → summary → done → idle). This unblocks the team to confidently tune timings or add features like "pause on hover" or "step-through mode" without regression risk.

## 8. `swarmTools` filtering in event-bus relies on a hardcoded ID list

- **Severity**: Medium
- **Category**: Ergonomics
- **File**: `src/components/sections/event-bus-showcase/data.ts:59-60`
- **Scenario**: A designer asks to add Linear and Calendly to the swarm visualization. The developer first finds the `EXTENDED_TOOLS` catalogue, adds the entries, runs the page — nothing changes. After grep'ing they find `SWARM_TOOL_IDS` array buried in the section's `data.ts`, hardcoded with 10 tools. They have to update both the catalogue AND this list.
- **Root cause**: `SWARM_TOOL_IDS = ["gmail", "slack", "github", ...]` was the easiest way to "pick the 10 best-recognized tools" but creates a hidden coupling. There is no flag in the tool catalogue (e.g., `inSwarm: true`) saying which tools should appear here.
- **Impact**: Catalogue changes silently fail to propagate. Every "add a tool" task takes 2x as long once you discover the second list.
- **Fix sketch**: Add a `swarmFeatured: true` flag to entries in `src/lib/tool-catalogue.ts` `EXTENDED_TOOLS`. Replace `SWARM_TOOL_IDS` filter with `EXTENDED_TOOLS.filter((t) => t.swarmFeatured)`. Single source of truth, no hidden list. Or, if the swarm intentionally caps at N tools regardless of the catalogue, encode that as `EXTENDED_TOOLS.filter(t => t.swarmFeatured).slice(0, 10)` so it self-documents.

## 9. SwarmView packs SMIL animation math into JSX with no abstraction

- **Severity**: Medium
- **Category**: Ergonomics
- **File**: `src/components/sections/event-bus-showcase/components/SwarmView.tsx:57-132`
- **Scenario**: A developer asked to "make swarm dots travel slower" finds a `swarmTools.map` body computing `delay`, `duration`, `totalCycle`, `kt1`/`kt2`/`kt3`, `pActive`/`pEnd`, `dx`/`dy` inline (8 magic-number expressions per node). They have to read all of it to understand which knob controls speed vs cadence vs travel direction. There are no comments explaining what `0.37`, `4`, `3 + (i % 3)`, or the keyTimes formula represent.
- **Root cause**: The animation calc was author-tuned interactively and never refactored into a named function. The `<animate>` and `<animateTransform>` SMIL elements are also unusual choices in a Framer Motion codebase (every other section uses Framer) — pattern drift.
- **Impact**: The next person changing this file (color, speed, count) will spend 30+ minutes reverse-engineering the math, and the PR will likely break the staggered look. SMIL is also deprecated in some browsers, creating future risk.
- **Fix sketch**: Extract a `computeSwarmTiming(index, total, baseRadius)` helper returning a typed `{ delay, duration, keyTimes, travelKeyTimes, dx, dy }` object with comments. Or — given the rest of the codebase uses Framer Motion — replace the SMIL with `<motion.circle animate={...} transition={...}>` and let Framer drive the staggers via `transition={{ delay: index * 0.37, repeat: Infinity }}`. Both make the file readable and tunable in minutes, not hours.

## 10. EventBusShowcase index.tsx is 215 lines doing tabs + composer + telemetry + intro + legend

- **Severity**: Low
- **Category**: Ergonomics
- **File**: `src/components/sections/event-bus-showcase/index.tsx:31-214`
- **Scenario**: A developer wants to change "the tab bar pill animation" or "the dynamic FlowComposer skeleton". They open `index.tsx` and have to scan 215 lines to find the tab `role="tablist"` block (lines 138-176) interleaved with composer toggle, snapshot subscription, intro, terminal panel, and legend. The tab-keyboard-handling logic and `tabRefs` ref array would be reusable elsewhere but are inlined.
- **Root cause**: Organic growth — features (tabs, composer, FlowComposer dynamic import, telemetry adapter) accreted into the index without extraction into sub-components. By contrast, `platform-command/index.tsx` (162 lines) is the same shape but at least delegated to seven sub-components.
- **Impact**: Slightly slower navigation of the file; the tab-list pattern (with arrow-key handling and animated indicator) is a strong reuse candidate that's currently locked here.
- **Fix sketch**: Extract two components into `event-bus-showcase/components/`: `VariantTabs.tsx` (the tablist with arrow-key handler and animated indicator) and `EventBusToggleHeader.tsx` (the "Try it yourself" composer toggle button). Even better, lift `VariantTabs` into `src/components/primitives/AnimatedTabs.tsx` since the same pattern almost certainly appears in other sections.

## 11. `PROMPTS`-style data shapes vary across terminal demos with no shared type

- **Severity**: Low
- **Category**: Repetition
- **File**: `src/components/sections/platform-command/data.ts:4-87`, `src/app/playground/data.ts` (via TerminalSim.tsx import)
- **Scenario**: A developer adding a new terminal demo elsewhere has to look at both `platform-command/data.ts` (uses `OutputLine.text` + `color` + `indent`) and `app/playground/data.ts` (uses `OutputLine.text` + `type` + `indent`, with `type` mapping to `LINE_COLORS`/`LINE_ICONS`) and pick a convention. The two shapes are 80% the same but disagree on the discriminator (`color` vs `type`) and on whether icons are derived from type or absent.
- **Root cause**: Each terminal demo evolved its own line shape. Without a shared `TerminalLine` primitive, there's no forcing function to converge.
- **Impact**: Small per-instance overhead; bigger systemic risk that each new terminal-style section adds a third or fourth `OutputLine` shape.
- **Fix sketch**: Once `BlinkingCursor`/`TerminalLine`/`TerminalHistory` move to `primitives/terminal/` (finding #2), define a single `TerminalOutputLine = { text: string; color: BrandKey | "muted" | "white"; indent?: number; icon?: string; delay?: number }` and adopt it in both `platform-command/data.ts` and `app/playground/data.ts`. The two demos can keep their own content but at least share the cell shape.
