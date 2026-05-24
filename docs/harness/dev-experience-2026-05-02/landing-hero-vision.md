# DX Scan — Landing Page Hero & Vision

> Total: 11 findings (Critical: 1, High: 4, Medium: 5, Low: 1)
> Files read: 28
> Scanner: Dev Experience Engineer

## 1. Two entire Vision variants are dead code shipped in the bundle

- **Severity**: Critical
- **Category**: Ergonomics
- **File**: `src/components/sections/VisionGlobe.tsx:1`, `src/components/sections/VisionHoneycomb.tsx:1`, `src/components/sections/vision-globe/**`, `src/components/sections/vision-honeycomb/**`
- **Scenario**: A developer opens this context expecting to find "three vision visualization variants the user can switch between." They discover three full implementations (Grid, Globe, Honeycomb) totalling ~17 files and ~600 lines. They spend 20–40 minutes tracing imports trying to find the variant switcher — only to realize that `Vision.tsx` hard-codes `<VisionGrid />` and the only other reference to Globe and Honeycomb is each variant's own one-line re-export shim. Both are completely orphaned: nothing in `src/` or `src/app/` imports them.
- **Root cause**: An A/B prototype was spiked, a winner was picked (Grid), and the losers were never deleted. The thin re-export wrappers (`VisionGlobe.tsx` and `VisionHoneycomb.tsx` are 1-line files) were probably the entry points used during the bake-off; once `Vision.tsx` was repointed to `VisionGrid`, no one cleaned up.
- **Impact**: (a) Onboarding friction — every new dev wonders which variant is live, why three exist, and whether any are about to ship. (b) Maintenance tax — TypeScript still type-checks ~17 dead files, lint runs on them, and tree-shaking can fail when these files import shared modules with side effects. (c) The shared `vision-shared/AnimatedCounter` and `useAgentTicker` are *only* used by the dead variants; if the variants go, that whole shared folder goes too.
- **Fix sketch**: Delete `src/components/sections/VisionGlobe.tsx`, `src/components/sections/VisionHoneycomb.tsx`, the entire `vision-globe/` directory, the entire `vision-honeycomb/` directory, and (if confirmed unused elsewhere) the `vision-shared/` directory. Inline `Vision.tsx` into `VisionGrid` directly or replace the wrapper with `export { default } from "./vision-grid"`. If the variants are intentionally retained for an upcoming feature flag, document that in a `docs/` ADR and gate them behind a real switcher so they're at least reachable in dev.

## 2. `initialAgents` array is duplicated byte-for-byte across two data files

- **Severity**: High
- **Category**: Repetition
- **File**: `src/components/sections/vision-globe/data.ts:5-12` and `src/components/sections/vision-honeycomb/data.ts:5-12`
- **Scenario**: A PM asks to rename "PR Reviewer" to "Pull Request Reviewer" and bump executions on three personas. The dev greps, finds two copies, updates one, opens a PR. The visual review on the live page (Grid variant) shows nothing because Grid uses an entirely different data file (`PLATFORM_CARDS`). Confused, dev opens the second hit and updates it too. They never realize neither variant they touched is rendered.
- **Root cause**: When the Honeycomb variant was forked from Globe, the seed agent list was copy-pasted instead of imported. The `AgentData` type is also duplicated identically in both `types.ts` files — Honeycomb just adds two extra fields (`border`, `glow`) on `StatusStyle` and re-declares the entire interface.
- **Impact**: 100% drift risk. Even setting aside finding #1, any team that keeps both variants will eventually see the two demos showing different numbers because someone updated one but not the other. The duplicated `AgentData` type also means any field rename touches two places.
- **Fix sketch**: If the variants survive: lift `initialAgents`, `AgentData`, and the base `StatusStyle` shape into `vision-shared/data.ts` and `vision-shared/types.ts`. Honeycomb extends `StatusStyle` with `border`/`glow` (intersection type or augmented record). If the variants don't survive (recommended per finding #1), this dissolves automatically.

## 3. `AnimatedCounter.tsx` exists at three paths — two are confusing pass-through shims

- **Severity**: Medium
- **Category**: Convention
- **File**: `src/components/sections/vision-shared/AnimatedCounter.tsx`, `src/components/sections/vision-globe/components/AnimatedCounter.tsx`, `src/components/sections/vision-honeycomb/components/AnimatedCounter.tsx`
- **Scenario**: Dev searches `AnimatedCounter` in their editor and sees three results. They open the first one (`vision-globe/components/AnimatedCounter.tsx`) hoping to tweak the animation duration. The whole file is one line: `export { default } from "../../vision-shared/AnimatedCounter";`. They open the next one — same thing. They open the third — finally, the implementation. Now they wonder if they're allowed to import the shared one directly or if they have to go through a shim.
- **Root cause**: The shims are scaffolding from a previous refactor. The original implementation lived in each variant's `components/` folder, then was hoisted to `vision-shared/` but the old paths were kept as compatibility shims. Today, `vision-globe/index.tsx` already imports directly from `vision-shared/AnimatedCounter` (line 11) and only `vision-honeycomb/components/FleetStatusBar.tsx` still uses the shim path (`./AnimatedCounter`) — so the shims aren't even needed for consumers.
- **Impact**: Editor "Go to Definition" jumps through one extra hop. Search-and-replace results triple-count. New devs don't know which file is canonical. Roughly 5 minutes wasted per developer who ever touches this counter.
- **Fix sketch**: Delete both shims. Update `FleetStatusBar.tsx` to import from `../../vision-shared/AnimatedCounter`. (And if finding #1's recommendation lands, the shared one moves under `vision-grid/` or gets deleted entirely since Grid doesn't use it.)

## 4. `Vision.tsx` is a useless one-line wrapper that obscures what's actually shipped

- **Severity**: Medium
- **Category**: Ergonomics
- **File**: `src/components/sections/Vision.tsx:1-7`
- **Scenario**: The lazy loader imports `@/components/sections/Vision`. Vision.tsx imports VisionGrid and renders it. To find the actual JSX, a developer has to follow three jumps: `lazy.tsx` → `Vision.tsx` → `VisionGrid.tsx` (which is also a one-line re-export) → `vision-grid/index.tsx`. Four files, ~5 lines of meaningful code in the first three.
- **Root cause**: Indirection layered for the bake-off in finding #1. Once Grid won, the indirection was never collapsed.
- **Impact**: Slows every "where is this rendered?" investigation by 30–60 seconds. Compounds with finding #1 to make the entire Vision area feel impenetrable.
- **Fix sketch**: Make `lazy.tsx` import `@/components/sections/vision-grid` directly. Delete `Vision.tsx` and `VisionGrid.tsx`. (If `Vision.tsx` must remain as a public surface, at least delete `VisionGrid.tsx` and have `Vision.tsx` import `./vision-grid` directly.)

## 5. Hero badge has a hardcoded `ml-[500px]` that breaks at narrow widths

- **Severity**: High
- **Category**: Convention
- **File**: `src/components/sections/HeroClient.tsx:79`
- **Scenario**: A new dev resizes the browser to a tablet width or runs visual regression tests, and sees the eyebrow badge ("badge text") shoved 500 pixels to the right of its container, often clipped or pushed off-screen. They search for "ml-[500px]" expecting to find a tokenized spacing value, find it inline, and have no idea whether this is intentional layout or a debug artifact.
- **Root cause**: An ad-hoc inline value left over from positional tweaking. The surrounding container uses a `lg:grid-cols-[1fr_auto]` layout with `text-center lg:text-left` — the 500px margin appears to be trying to nudge the badge over the right card on desktop, but it applies at every breakpoint.
- **Impact**: Visible visual bug below the `lg` breakpoint; brittle to any layout change; gives newcomers the impression that the rest of the file's "magic numbers" are also load-bearing — slows confident editing.
- **Fix sketch**: Move the badge out of the text column and into the grid as a dedicated row above the heading, or wrap with `lg:ml-[500px] ml-0` so it only shifts on desktop. Better: use Flexbox alignment instead of fixed pixel offsets. Add a Storybook entry or `data-testid` so the badge gets its own visual regression frame.

## 6. `void useReducedMotion()` looks like a bug or leftover debug

- **Severity**: Medium
- **Category**: Documentation
- **File**: `src/components/sections/vision-globe/index.tsx:18`
- **Scenario**: A dev reading this file sees `void useReducedMotion();` immediately under the function signature with no comment, two lines before `useAgentTicker(initialAgents)` returns its own `prefersReducedMotion`. They wonder if it's a forgotten debugging line, a typo, or an intentional hack to subscribe the component to motion-preference changes. Without a comment, there's no way to tell.
- **Root cause**: Almost certainly an attempt to register the component with framer-motion's reduced-motion observer at the top level so updates fire even though the value is consumed inside `useAgentTicker`. But this is invisible without a comment.
- **Impact**: Anyone refactoring this file may delete the line as dead code, breaking reduced-motion behavior silently. Lint rules may flag it. Newcomers spend 2–5 minutes second-guessing whether to remove it.
- **Fix sketch**: Either delete it (the `useAgentTicker` hook already calls `useReducedMotion`, so the top-level call may be redundant — verify), or add a one-line comment: `// Subscribe component to reduced-motion preference changes; the value is read via useAgentTicker.` If kept, use an underscore variable: `const _ = useReducedMotion();` to make intent clearer than `void`.

## 7. `data.ts` shape is inconsistent across the three variants

- **Severity**: Medium
- **Category**: Convention
- **File**: `src/components/sections/vision-globe/data.ts`, `src/components/sections/vision-honeycomb/data.ts`, `src/components/sections/vision-grid/data.ts`
- **Scenario**: Dev wants to add a new "vision" variant or swap out the demo data. They open all three `data.ts` files expecting a common shape. Globe exports `initialAgents` + `statusStyles` + `CARDINALS` + `agentPosition()`. Honeycomb exports `initialAgents` + `statusStyles` + `HEX_W` + `getHexPositions()` + `hexPath()` + `CONNECTIONS`. Grid exports `PLATFORM_CARDS` of an entirely different shape (`PlatformCard` with `brand`, `images`, `description`, `details`, `guideTopics`).
- **Root cause**: Grid is a fundamentally different concept (six branded marketing cards) co-located under "vision" because of layout placement, not domain. Globe and Honeycomb are the same concept (live agent dashboard) but their data files acquired layout-specific helpers.
- **Impact**: There's no shared mental model for "what does a vision variant look like." Every new variant invents its own data shape. Hard to write a generic test or storybook story across them.
- **Fix sketch**: Rename the Grid context to "platform" since it's not actually a vision variant — `vision-grid/` → `platform-grid/`, `PLATFORM_CARDS` already calls itself that. Then collapse Globe + Honeycomb data into shared agent data + variant-specific layout helpers in their own `layout.ts`. The folder split becomes meaningful: `data.ts` = same domain object across variants; `layout.ts` = variant-specific math.

## 8. `useAgentTicker` has a closure-time pitfall in its scheduler

- **Severity**: Medium
- **Category**: Ergonomics
- **File**: `src/components/sections/vision-shared/useAgentTicker.ts:42-50`
- **Scenario**: The scheduler uses `let timerRef = schedule()` *after* `schedule()` is called, so the first invocation of `schedule()` references `timerRef` before assignment inside its own callback. The pattern relies on hoisting + the fact that `schedule()` returns synchronously before the inner timeout fires. Subtle and easy to break.
- **Root cause**: Self-rescheduling timer pattern written without a `useRef`. Works, but reads as "is this a bug?" to anyone unfamiliar.
- **Impact**: Future maintainer adds an early `tick()` call or rearranges and breaks the cleanup. The cleanup function captures `timerRef` from the latest schedule call, but if the effect re-fires (deps change) only the most recent timer is cleared — a stale tick can still fire.
- **Fix sketch**: Use a `useRef<NodeJS.Timeout | null>(null)` pattern so the cleanup function always sees the current timer. Or wrap with `setInterval` and a jitter offset. Add a unit test that verifies cleanup actually cancels in-flight ticks.

## 9. No Storybook / preview route for the live Vision components

- **Severity**: High
- **Category**: Tooling
- **File**: (project-wide gap; observed across `vision-grid`, `vision-globe`, `vision-honeycomb`)
- **Scenario**: A designer asks to see the Honeycomb variant. The dev's only option is to comment out `Vision.tsx`'s import, repoint it to Honeycomb, run `next dev`, scroll past 8 sections to find Vision, take a screenshot, and revert. To compare all three side-by-side: 3× the work. To test the loading skeleton (`VisionSkeleton` in `lazy.tsx`) requires throttling network or unmounting.
- **Root cause**: No isolated component preview infrastructure. The variants were built in-page, never wired to a sandbox.
- **Impact**: Every visual review or A/B comparison costs 10–20 minutes of code shuffling. Discourages keeping the variants alive (which is partly why finding #1 happened — they got lost). Also blocks visual regression tests at the component level.
- **Fix sketch**: Add a `/preview/vision/[variant]` dev-only route in `src/app/preview/vision/[variant]/page.tsx` that renders any of the three variants based on the URL param. Or adopt Storybook with one story per variant + one for the skeleton. Either way, also expose `/preview/hero` for the hero card so the 3D-tilt and counter behavior can be reviewed without scrolling.

## 10. Stats row of three numbers is duplicated inside `HeroClient.tsx`

- **Severity**: Low
- **Category**: Repetition
- **File**: `src/components/sections/HeroClient.tsx:141-155` and `src/components/sections/HeroClient.tsx:175-186`
- **Scenario**: The same `heroStats.map((stat) => …)` block is rendered twice — once inside the mobile card (`lg:hidden`) and once inside the desktop command-center card. To change "agents" → "active agents" everywhere, the dev edits one place, doesn't notice the second copy is a near-duplicate with slightly different classes (`text-base font-bold` vs `text-xl font-bold`, hover styles only on desktop), and ships a copy where mobile and desktop disagree.
- **Root cause**: Cut-and-paste during the responsive layout pass; the shared bits were never extracted because the wrapping `div` classes diverge.
- **Impact**: One copy will drift from the other. Roughly 10 minutes of cognitive overhead each time the stats row is touched.
- **Fix sketch**: Extract `<HeroStatRow stats={heroStats} variant="mobile" | "desktop" />` into a small co-located component in `hero/HeroStatRow.tsx`. Centralize the per-variant class differences via a discriminated union or a `variant` prop with a tiny lookup.

## 11. `CommandCenterIllustration` and `useId` produce gradient IDs that hydrate-mismatch-risky

- **Severity**: Low
- **Category**: Documentation
- **File**: `src/components/sections/hero/CommandCenterIllustration.tsx:19-20`
- **Scenario**: The component uses `useId()` to namespace SVG gradient IDs (`${uid}-arcGrad`). This is good. But there's no comment explaining *why* — a future maintainer might "simplify" by hardcoding `"arcGrad"`, breaking SSR/CSR consistency or causing collisions if two of these illustrations render on the page.
- **Root cause**: Convention applied silently. Common Next.js gotcha.
- **Impact**: Low until someone refactors. When they do: hard-to-debug hydration warnings or visually broken arcs.
- **Fix sketch**: Add a one-line JSDoc above the `useId()` call: `// Use useId() so SVG gradient/filter IDs stay unique across multiple instances and remain stable across SSR/CSR.` Optionally extract a `useSvgId(name: string)` helper if this pattern repeats across SVG components.
