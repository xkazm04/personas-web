# Self-Healing Circuit
> Animated circuit-board explainer of the failure → recovery cycle (Detect → Diagnose → Recover → Resolve), looping autonomously · **Route:** `/features` (deep-dive section) · **Status:** Live

## What it does
A self-contained, auto-playing diagram that tells the "fixes itself" story. It renders an infrastructure circuit board — five labelled nodes (API Gateway, Database, Cache, Queue, Slack) wired by glowing traces — and continuously dramatizes one connection failing and being repaired. Each loop ("Cycle #N") breaks a different trace, then walks four stages: **Detect** (red spark at the break), **Diagnose** (amber repair-bot crawls the trace), **Recover** (cyan weld flash), **Resolve** (everything returns to green/healthy). A header status pill, a per-stage description line, a right-hand connection-status panel, and a bottom stage timeline all react to the current stage. It runs on a timer with no user input — purely illustrative motion that conveys autonomous recovery (no 3 AM alerts, no manual restarts).

## How it works
`useHealingCycle` (`useHealingCycle.ts`) is the state machine. It holds `activeStage` (`-1` = idle, `0..3` = the four stages), `brokenConnectionId`, and `cycleIndex`. A single `useEffect` drives a recursive `setTimeout` chain (`useHealingCycle.ts:21-52`): pick the next breakable connection (`breakableConnections` cycled by `currentCycle % 4`), reset `activeStage` to `-1`, then advance one stage at a time — first step after `1200ms`, each later step after `2200ms`; after stage 3 it waits `3500ms` and restarts with the next connection. The hook exposes two pure derivations: `getConnectionStatus(connId)` maps `(brokenConnectionId, activeStage)` → `healthy | broken | diagnosing | repairing` (only the broken connection ever leaves `healthy`), and `getNodeStatus(nodeId)` maps the two endpoints of the broken connection → `error | warning | healing | healthy` by stage.

`index.tsx` composes the UI: a `SectionIntro` heading, then a dark glass card containing `CircuitHeader` (status pill + cycle counter), a flex row of `CircuitBoard` + `StatusPanel`, `StageDescription`, and `StageTimeline`. The broken connection's geometric midpoint (`getPathMidpoint`, parsing numbers out of the SVG path `d` string, `data.ts:128`) is passed down as `breakPoint` so spark/weld effects land on the broken trace.

`CircuitBoard` renders an SVG `viewBox="0 0 660 400"` with a dotted-grid background. `CircuitTraces` draws each connection three times (invisible `<path id>` for `mpath` motion targets, a faint wide halo, a colored core) tinted by status, and conditionally mounts the per-stage effect at `breakPoint`: `DataParticle`s flow along healthy traces; `SparkEffect` (broken), `RepairBot` (diagnosing), `WeldFlash` (repairing) on the broken one. `CircuitNodes` draws each node as a chip with pins, a status dot, a pulsing glow ring when affected, and a label. SVG filters (`particleGlow`, `repairGlow`, `weldGlow`, `nodeGlow`) live in `SvgDefs`.

**Reduced-motion gating** is layered. The whole loop is short-circuited at the source: `useHealingCycle.ts:22` returns before scheduling any timer when `prefersReducedMotion` is true, so `activeStage` stays `-1`, everything reads `healthy`, and no failure ever animates. Every effect component (`effects.tsx`) and node/header/timeline/panel also branches on `useReducedMotion`: `DataParticle` runs its `animateMotion` once with `repeatCount="1"`; `SparkEffect`/`WeldFlash` collapse to a single static glyph; pulsing dots/rings freeze to a constant opacity.

## Key files
| File | Role |
| --- | --- |
| `src/components/feature-sections/HealingCircuit.tsx` | Public entry — re-exports `./healing-circuit/index` |
| `src/components/feature-sections/healing-circuit/index.tsx` | Section composition (intro + glass card + all subcomponents) |
| `src/components/feature-sections/healing-circuit/useHealingCycle.ts` | Failure→recovery state machine + `getConnectionStatus`/`getNodeStatus` |
| `src/components/feature-sections/healing-circuit/data.ts` | `healingStages`, `nodes`, `connections`, `breakableConnections`, color maps, `sparkSeeds`, `getPathMidpoint` |
| `src/components/feature-sections/healing-circuit/types.ts` | `HealingStage`, `CircuitNode`, `Connection`, `ConnectionStatus`, `NodeStatus` |
| `src/components/feature-sections/healing-circuit/components/CircuitBoard.tsx` | SVG canvas (grid bg, `viewBox`), mounts defs/traces/nodes |
| `src/components/feature-sections/healing-circuit/components/CircuitHeader.tsx` | Header: title, animated stage status pill, "Cycle #N" |
| `src/components/feature-sections/healing-circuit/components/CircuitTraces.tsx` | Per-connection trace paths + conditional stage effects |
| `src/components/feature-sections/healing-circuit/components/CircuitNodes.tsx` | Node chips, pins, status dots, affected-glow ring, labels |
| `src/components/feature-sections/healing-circuit/components/StageDescription.tsx` | Animated single-line description of the active stage |
| `src/components/feature-sections/healing-circuit/components/StageTimeline.tsx` | 4-stage progress chips + connector segments + healthy count |
| `src/components/feature-sections/healing-circuit/components/StatusPanel.tsx` | Right rail: per-connection OK/DOWN/SCAN/FIX rows |
| `src/components/feature-sections/healing-circuit/components/SvgDefs.tsx` | `<filter>` defs (particle/repair/weld/node glow) |
| `src/components/feature-sections/healing-circuit/components/effects.tsx` | `DataParticle`, `SparkEffect`, `WeldFlash`, `RepairBot` |

## Data & state
- **Source:** static module constants in `data.ts` (stages, nodes, connections, color maps, deterministic `sparkSeeds`) — no fetch, no mocks, no live data. **Stores:** none (no Zustand); all state is local React state inside `useHealingCycle`. **API routes:** none. **Types:** `HealingStage`, `CircuitNode`, `Connection`, `ConnectionStatus` (`healthy | broken | diagnosing | repairing`), `NodeStatus` (`healthy | error | warning | healing`) in `types.ts`.

## Integration points
- **Lazy mount:** registered as `LazyHealingCircuit` via `createLazySection(() => import("@/components/feature-sections/HealingCircuit"), …, { ssr: false })` (`src/components/feature-sections/feature-lazy.tsx:17`), so it is client-only (no SSR).
- **`/features` page:** mounted inside `<StageSection id="healing-circuit" glow="emerald" …>` wrapped in `<LazyMount minHeight={760} label="Healing">` (`src/app/features/page.tsx:52-56`); the page is `force-static` with `revalidate=3600`. Also a left-nav anchor `{ label: "HEALING", href: "#healing-circuit" }` (`features/page.tsx:22`).
- **Shared primitives:** `SectionWrapper`, `SectionIntro`, and `staggerContainer` from `@/lib/animations`.
- **Product tour:** the inner diagram card carries `data-tour-diagram="healing"` (`index.tsx:54`) — a hook for the guided tour to spotlight it.
- **`force-dark`:** the card opts into the dark color scheme via the `force-dark` class regardless of site theme (`index.tsx:54`).

## Conventions & gotchas
- **i18n violation (real issue):** all copy is hardcoded English, not i18n. The `SectionIntro` heading/description (`index.tsx:39-41`), every `healingStages` `label`/`desc`/`statusLabel` (`data.ts:19-48`), node labels (`data.ts:51-55`), and the literal UI strings — `"Circuit Board — Infrastructure"` (`CircuitHeader.tsx:20`), `"Connection Status"` (`StatusPanel.tsx:37`), `"OK/DOWN/SCAN/FIX"` (`StatusPanel.tsx:17-24`), `"N/M healthy"` (`StageTimeline.tsx:85-88`) — are inline literals. No file imports `useTranslation`. This breaks the non-negotiable rule that all user-facing strings live in `src/i18n/en.ts` across 14 locales. Migrate copy if you touch it; don't add more literals.
- **Reduced motion stops the *story*, not just the motion.** When `prefersReducedMotion` is true the cycle never starts (`useHealingCycle.ts:22`), so the diagram is frozen in the all-healthy state — a reduced-motion user never sees a failure/recovery demonstrated. This is correct gating but worth knowing: there is no static "here's what recovery looks like" fallback frame; the headline still says it fixes itself while nothing visibly breaks.
- **Animation gating is thorough but lint-invisible.** All motion is framer-motion `animate` arrays / SVG `animateMotion`, not `requestAnimationFrame`, so the `custom-animation/require-animation-gating` lint rule wouldn't catch a missing guard here. Gating is nonetheless implemented by hand in every animated component via `useReducedMotion`. Keep that pattern when editing effects.
- **Hardcoded hex colors, not tokens.** Stage/status colors are raw hex (`#f43f5e`, `#fbbf24`, `#06b6d4`, `#34d399`) in `data.ts` and inline `traceColorFor`/`statusColorFor` helpers, and SVG fills use literal `rgba(...)`/`"white"`. This is a deliberate exception to the semantic-Tailwind-token rule (SVG strokes/fills can't use Tailwind classes), but note the same four hex values are duplicated across `data.ts`, `CircuitTraces.tsx`, `StatusPanel.tsx`, and `effects.tsx` — change one, change all.
- **`getPathMidpoint` is a heuristic.** It regex-extracts numbers from the path `d` string and grabs the aligned middle coordinate pair (`data.ts:128-139`); it is not a true geometric path midpoint. It works because all `connections` paths are orthogonal polylines — if you add a curved/`C`/`Q` path, the spark/weld break point may land off the visible trace.
- **`RepairBot.onComplete` is unused.** `RepairBot` accepts and fires an `onComplete` callback after `duration` (`effects.tsx:148-161`), but `CircuitTraces` mounts it without one — stage advancement is driven entirely by `useHealingCycle`'s timers, not by effect completion. The two timings (`2200ms` stage step vs. `2s` bot duration) are tuned to roughly agree but are independent; retune both if you change cadence.
- **Don't rename `connection.id`.** Each `id` doubles as the SVG `<path id>` referenced by `mpath href="#id"` for `DataParticle`/`RepairBot` motion, and as the `breakableConnections` lookup key. Renaming an id in one place silently breaks particle motion.

## Related docs
- [Trigger System](trigger-system.md)
- [Feature index](../INDEX.md)
