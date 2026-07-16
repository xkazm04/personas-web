# Why Agents & Use Cases — ambiguity+ui scan
> Total: 5 findings (Critical: 0, High: 2, Medium: 3, Low: 0)

> **Context-map drift note**: 12 of the 22 files listed for this context no longer exist — the entire `src/components/sections/why-agents/` directory and `src/data/testimonials.ts` were retired in commit `be0b395` ("marketing/sections: team-canvas variants + retire why-agents / social-proof"). All findings below come from the surviving Use Cases files (10 files, all read). The context map should be refreshed to drop the phantom entries.

## 1. Auto-rotating tool showcase has no pause mechanism and wrong ARIA semantics
- **Severity**: High
- **Agent**: ui_perfectionist
- **Category**: a11y-autoplay-no-pause
- **File**: `src/components/sections/use-cases/useToolSelection.ts:29` (also `ToolButton.tsx:36`, `ToolGrid.tsx:37`)
- **Scenario**: The tool selector autoplays, swapping the selected tool and the entire ToolDetailCard every 4 s. The only ways to stop it are clicking a tool or pressing Escape while focus is inside the toolbar — there is no visible pause/stop control, and Escape is undiscoverable. Additionally the buttons use `role="toolbar"` + `aria-pressed` while actually driving a tab/panel relationship: ToolDetailCard is not linked via `aria-controls`/`role="tabpanel"`, so screen-reader users get no announcement that the panel content changed (silently, every 4 s).
- **Root cause**: Autoplay UX was designed for sighted mouse users; the widget is semantically a tablist but was marked up as a toolbar of toggle buttons, and no pause affordance was added.
- **Impact**: WCAG 2.2.2 (Pause, Stop, Hide) failure for moving/auto-updating content lasting >5 s; cognitively-impaired and screen-reader users cannot read a use-case card before it is replaced, and assistive tech never announces the swap.
- **Fix sketch**: Add a small visible pause/play toggle next to the grid (also stops autoplay on toolbar focus/hover, not just click). Convert to the tabs pattern: `role="tablist"`/`role="tab"` with `aria-selected` + `aria-controls` pointing at the detail card (`role="tabpanel"`, `aria-live="polite"` or focus-safe labelling). Keep the existing roving tabindex — it already matches the tabs pattern.

## 2. Agent status is conveyed by color-only dot; the accessible label exists but is never rendered
- **Severity**: High
- **Agent**: ui_perfectionist
- **Category**: a11y-color-only-status
- **File**: `src/components/sections/use-cases/components/AgentArmyGrid.tsx:89-91`
- **Scenario**: Each agent card shows status (running / healing / idle) solely as a 2×2 px colored dot (emerald / amber / white-20%). `statusStyles` in `data.ts:106` defines a `label` field ("Running", "Healing", "Idle") for exactly this purpose, but AgentArmyGrid renders only `st.dot` — the label is dead data. The success-rate color thresholds (green/amber/red) are likewise color-only, though the % number mitigates that one.
- **Root cause**: The label half of the `statusStyles` record was designed in but never wired to the DOM — no `sr-only` text, `title`, or `aria-label` accompanies the dot.
- **Impact**: WCAG 1.4.1 (Use of Color) failure: color-blind users cannot distinguish running from healing, and screen-reader users get no status information at all. The idle dot (`bg-white/20`) is also near-invisible against the glass card, so even sighted users may not perceive a status exists.
- **Fix sketch**: Render `<span className="sr-only">{st.label}</span>` beside the dot (or a visible tiny text label / tooltip), and give the dot `aria-hidden`. The data is already there — this is a two-line wiring fix.

## 3. Simulated "live" agent telemetry contradicts itself and runs on unexplained magic numbers
- **Severity**: Medium
- **Agent**: ambiguity_guardian
- **Category**: simulation-logic-inconsistency
- **File**: `src/components/sections/use-cases/components/AgentArmyGrid.tsx:22-33`
- **Scenario**: The ticker bumps a random agent's `executions` by 1-3 every 3-5 s regardless of its status — so an agent displaying "Idle" visibly accrues executions, and the "Deploy Monitor" stuck at "healing" both keeps executing and never finishes healing. Meanwhile `rate` (success %) never moves despite thousands of simulated runs. Constants `3000 + Math.random() * 2000`, bump `1-3`, flip probability `0.2`, flash `600 ms`, and rate thresholds `>=90` / `>=80` (line 68) are all bare literals with no rationale.
- **Root cause**: The simulation was tuned for visual liveliness, not internal consistency, and none of the tuning decisions (why 20% flip chance, why healing is exempt, why idle agents still execute) are recorded.
- **Impact**: An attentive prospect evaluating an "agent observability" pitch sees a dashboard whose numbers are self-contradictory — idle-but-executing undermines exactly the credibility this section is meant to build. Future editors can't tell which constants are safe to change.
- **Fix sketch**: Gate the execution bump on `status === "running"` (or flip status *before* bumping), let `healing` occasionally resolve to `running`, and hoist the tuning constants into named exports next to `AUTOPLAY_INTERVAL` in `data.ts` with a one-line comment each (e.g. `TICK_MIN_MS`, `STATUS_FLIP_PROBABILITY`, `RATE_WARN_THRESHOLD`).

## 4. Escape re-enables autoplay — an inverted, undocumented keyboard convention
- **Severity**: Medium
- **Agent**: ambiguity_guardian
- **Category**: surprising-keyboard-behavior
- **File**: `src/components/sections/use-cases/useToolSelection.ts:108-115`
- **Scenario**: A keyboard user browsing tools with arrow keys presses Escape — universally "cancel/stop what's moving" — and instead of stopping anything, the carousel *starts* auto-advancing again (`setAutoplay(true)`), yanking the selection away from the tool they were reading. Conversely, a single manual click disables autoplay permanently for the session (`userClickedRef` is never reset except by this Escape path). Neither decision is documented anywhere, and no UI hints that Escape does this.
- **Root cause**: Escape was repurposed as a hidden "resume autoplay" developer affordance; the click-kills-autoplay-forever policy and this resume path were chosen without recording the reasoning or exposing the state to users.
- **Impact**: Directly violates user expectation (WCAG 2.1 keyboard predictability in spirit); a keyboard user who reflexively hits Escape loses their place. The undiscoverable one-way autoplay state also makes the behavior look buggy ("it stopped cycling and never resumed").
- **Fix sketch**: Make Escape a no-op or have it *stop* autoplay (matching convention). Move "resume" onto the visible pause/play control proposed in finding 1, which also resolves the one-way `userClickedRef` policy. Add a short comment recording the intended autoplay lifecycle (auto → manual on first interaction → resumable via control).

## 5. 1%-granularity progress state re-renders both full toolbars ~25×/s for the whole autoplay lifetime
- **Severity**: Medium
- **Agent**: ui_perfectionist
- **Category**: perf-progress-rerender-fanout
- **File**: `src/components/sections/use-cases/useToolSelection.ts:49-52` (consumers: `ToolGrid.tsx:41-88`, `ToolButton.tsx:50-56`)
- **Scenario**: While autoplay runs (the default state until first click), the rAF loop calls `setProgress` every time progress moves 1% — ~100 state updates per 4 s cycle (~25/s). `progress` is a prop of every `ToolButton`, and `ToolButton` is not memoized, so each update re-renders all 16 button instances (8 desktop + 8 mobile, both always mounted) plus ToolGrid — even though only the single active button's 1-px progress bar actually uses the value.
- **Root cause**: Progress was lifted to React state at the ToolGrid level for one child's bottom bar, fanning a per-frame animation value through the whole subtree.
- **Impact**: Continuous ~25 fps React reconciliation of a motion-heavy subtree on a marketing page competes with framer-motion scroll animations — jank on low-end mobile, wasted battery, and it runs indefinitely for any visitor who never clicks.
- **Fix sketch**: Drive the bar without React state: keep progress in a ref and animate the bar's width via a CSS animation (`animation: fill ${AUTOPLAY_INTERVAL}ms linear`, restarted on `selected` change) or a framer-motion `useMotionValue` passed only to the active button. Alternatively `memo(ToolButton)` and pass `progress` only to the active instance (`isActive ? progress : 0`), cutting re-renders 16×.
