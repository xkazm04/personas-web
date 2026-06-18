# Shared UI Primitives & Illustrations — blended bug-hunter + test-mastery scan
> Total: 5  (Critical: 0, High: 2, Medium: 3, Low: 0)

Scope: 25 primitive/illustration/icon files + their cross-references (`globals.css` focus-ring rule,
`brand-theme.ts`, `colors.ts`, the `platform-command` terminal consumer and its `use-terminal-sequence`
state machine). The 2026-05-10 bug-hunter scan flagged its Critical in animation **hooks**
(`useCanvasCompositor`), not in this file set — those hooks are out of scope here and were verified to be a
separate concern. This pass leans into the test-coverage lens, which is where the highest-value gaps sit:
these are shared primitives with high blast radius and **zero unit-test harness** (Playwright e2e only, and
no e2e exercises a primitive in isolation).

## 1. Pure brand/illustration helpers (hexToRgbTriplet, color-fallback, terminal types) have zero unit harness
- **Severity**: High
- **Lens**: test-mastery
- **Category**: Risk-weighted coverage gap / missing test harness
- **File**: src/lib/colors.ts:40-52, src/components/primitives/terminal/TerminalHistory.tsx:35-59, src/components/primitives/index.ts:1-10
- **Scenario**: `GlowCard` passes a user/data-supplied `color` through `hexToRgbTriplet`, which drives every glow-card border + hover glow across the marketing site. `TerminalHistory` maps each `line.color` through a consumer `colorClasses` Record with a fallback path. Both are pure, fully-branchy, and reused everywhere — yet the project has no vitest/jest runner, only Playwright e2e, none of which exercises a primitive in isolation.
- **Root cause**: Decision (documented in `use-terminal-sequence.ts:41-48`) to defer testability work "because the project has no unit-test runner configured today." The result is that the highest-ROI, lowest-cost-to-test code (deterministic pure functions: `#RGB`/`#RRGGBB`/null/malformed handling; whitespace `pre` + indent math; unknown-color fallback) is entirely unguarded against regression.
- **Impact**: false-confidence test posture — a refactor to `hexToRgbTriplet` (e.g. dropping `#RGB` shorthand support, or off-by-one in `slice`) silently breaks border/glow color on every card and ships green. UX degradation is invisible until a human eyeballs the page.
- **Fix sketch**: Add a lightweight unit runner (vitest — fastest to wire into a Vite/Next project) and seed it with table-driven tests for `hexToRgbTriplet` (3-digit, 6-digit, `#`-prefixed, whitespace, null/undefined, malformed → null), `tint`/`brandShadow` string shape, and `TerminalHistory` unknown-color → `text-muted` fallback. These are 100% LLM-generatable from the existing JSDoc.

## 2. Terminal output lines and history use array-index keys, so the entrance animation never replays on restart
- **Severity**: Medium
- **Lens**: bug-hunter
- **Category**: Key collision / animation correctness
- **File**: src/components/primitives/terminal/TerminalLine.tsx:26-35, src/components/primitives/terminal/TerminalHistory.tsx:29-49, src/components/sections/platform-command/index.tsx:118-128
- **Scenario**: The CLI showcase auto-loops (`summary → done → restart` every ~7s, `use-terminal-sequence.ts:215-235`). On restart, `outputLines`/`history` reset to `[]` then refill from index 0. `TerminalLine` rows are rendered inside `<AnimatePresence>` keyed by `lIdx` (array index).
- **Root cause**: Index keys are stable across the reset (key `0` exists before and after), so React reuses the same fiber/DOM node instead of remounting. Framer Motion's `initial={{opacity:0,y:4}}` entrance only fires on mount — reused nodes skip it. Compounding this, `TerminalLine` defines no `exit` variant, so the `AnimatePresence` wrapper buys nothing on removal. The `index * 0.03` stagger also re-applies to a node that is not actually re-entering.
- **Impact**: UX degradation — the signature "type-out then fade-in line by line" effect plays correctly on first view but degrades to an instant snap on every subsequent loop, and is visually inconsistent depending on whether the viewer arrived before or after the first cycle.
- **Fix sketch**: Key rows by stable content identity (`key={`${currentCommandIndex}:${lIdx}:${line.text}`}` or a per-command run id) so a restart remounts them; add an `exit={{opacity:0}}` to `TerminalLine` so `AnimatePresence` has something to animate. Same content-key fix for `TerminalHistory`'s `hIdx`/`lIdx`.

## 3. TerminalHistory dev-warning dedup is a module-global Set that never resets and is shared across all consumers
- **Severity**: Medium
- **Lens**: bug-hunter
- **Category**: Latent failure / cross-instance state leak
- **File**: src/components/primitives/terminal/TerminalHistory.tsx:6,37-46
- **Scenario**: `TerminalHistory` is a portable primitive meant for "any future agent terminal surface" (per `types.ts`). Two different consumers on the same page each pass their own narrow `colorClasses` palette. Consumer A legitimately uses color token `"command"`; consumer B does NOT define `"command"` in its Record and so should be warned about it.
- **Root cause**: `warnedKeys` is a module-level `Set<string>` keyed only on the color string, not on the consumer/palette identity. Once ANY instance warns about `"command"`, every other instance is permanently silenced for that token. The Set is also never cleared, so during dev HMR the suppression persists across reloads, hiding a genuinely-missing mapping introduced by an edit.
- **Impact**: false-confidence / silent failure — the guard rail that is supposed to catch a consumer forgetting a color mapping (which renders that line as washed-out `text-muted` instead of its intended color) is defeated whenever a sibling terminal already used the same token name. Dev sees no warning; the line renders with the wrong color.
- **Fix sketch**: Key the dedup on `(palette-identity + color)` — e.g. accept an optional `debugId` prop and warn on `` `${debugId}:${line.color}` ``, or fall back to warning unconditionally in dev (the console already de-dupes identical messages per session). At minimum, document that the Set is global so the warning is best-effort.

## 4. GlowCard crashes if `accent` is ever an out-of-union value (no fallback on the accentMap lookup)
- **Severity**: Medium
- **Lens**: bug-hunter
- **Category**: Prop edge case / runtime crash
- **File**: src/components/GlowCard.tsx:58-64
- **Scenario**: A consumer passes `accent` sourced from dynamic/CMS/`hexToBrand`-adjacent data, or a future `BrandAccent` widening (e.g. adding `"rose"` to the union before adding it to `accentMap`). `GlowCard` is one of the most-reused cards on the site.
- **Root cause**: `const colors = accentMap[accent]` assumes `accent` is always one of the 4 keys present in `accentMap` (`cyan|purple|emerald|amber`). The union `BrandAccent` happens to match today, but the lookup has no `?? accentMap.cyan` guard. If `accent` is undefined-at-runtime (TS erased) or the union is widened without updating the map, `colors` is `undefined` and the next line `colors.accentRgb` throws `Cannot read properties of undefined`. Note `BrandKey` has 6 members vs `accentMap`'s 4 — any drift between the two unions becomes a crash, not a type error at the call site if the value is cast/dynamic.
- **Impact**: crash — a single bad/dynamic `accent` prop throws during render and takes down the whole client section/page (no error boundary around marketing cards).
- **Fix sketch**: `const colors = accentMap[accent] ?? accentMap.cyan;` (mirrors the `hexToBrand` "default to cyan" convention used elsewhere) so an unknown accent degrades gracefully instead of crashing.

## 5. SVGFocusRing visibility depends on an undocumented `.svg-focus-parent` direct-child contract that is silent when violated
- **Severity**: Medium
- **Lens**: bug-hunter
- **Category**: Accessibility correctness / fragile implicit contract
- **File**: src/components/SVGFocusRing.tsx:5-61, src/app/globals.css:759-761
- **Scenario**: A new consumer adds `SVGFocusRingRect` inside a focusable SVG node but (a) forgets to put `svg-focus-parent` on the focusable ancestor, or (b) nests the ring more than one level below it, or (c) the focusable element uses `:focus` (mouse/programmatic) rather than `:focus-visible`.
- **Root cause**: The ring is permanently `opacity-0` and is only revealed by the CSS rule `.svg-focus-parent:focus-visible > .svg-focus-ring { opacity: 1 }` — a **direct-child (`>`) combinator** plus a **`:focus-visible`-only** trigger. Nothing in the component signals this requirement; `SVGFocusRing.tsx` has no JSDoc and the class string `svg-focus-ring` is a magic token that must match `globals.css` exactly. Any structural drift (extra `<g>` wrapper between parent and ring, or missing parent class) leaves the ring invisible with no error.
- **Impact**: accessibility regression — keyboard users get no visible focus indicator on SVG-based interactive nodes (HubNode, FlowNodes, KnowledgeGraphNode), a WCAG 2.4.7 failure that ships silently because nothing throws and no test asserts the focus ring renders.
- **Fix sketch**: Document the `svg-focus-parent` + direct-child + `:focus-visible` contract in a JSDoc block on both exports; consider an `e2e` assertion (keyboard-tab a HubNode, assert the ring's computed `opacity` is `1`) since e2e is the only harness available. Long-term, co-locate the trigger so the ring can't be used without its parent class (e.g. a wrapper component).
