# Trigger System
> A radial trigger-type wheel that auto-fires and drives a synced detail panel · **Route:** `/features` (deep-dive section) · **Status:** Live

## What it does
Shows the eight ways an agent can be started — Manual, Schedule, Webhook, Clipboard, File Watch, Chain, Event Bus, Polling — laid out as nodes around a circular "wheel". A central hub pulses as triggers periodically "fire" on their own, and the selected trigger's name, description, plain-language detail, and a concrete example (a cron line, a webhook path, a regex, a chain) appear in a detail panel beside the wheel. Visitors can click any node (or the dot strip under the panel) to inspect a specific trigger. The message to the reader: agents run *when and how you want*, and you can mix and match the eight starters for any workflow.

## How it works
The container component (`trigger-system/index.tsx`) holds two pieces of state: `activeTrigger` (the selected index, default `0`) and `firing` (the index currently flashing, or `null`). On mount it starts a self-rescheduling `setTimeout` loop that every 3–5 s picks a random trigger, sets it as both firing and active, and clears the firing flag after 1 s. The wheel and detail panel are pure presentational children driven by those props; `onSelect` lets either child set the active trigger (and cancels any firing flash).

`TriggerWheel` positions nodes trigonometrically: for index `i`, `angle = (i / triggers.length) * 360 - 90` (so node 0 sits at top), and node/label coordinates are computed from that angle at radius 140 (nodes) and 182 (labels) inside a 400×400 box. The active node grows (56 vs 44 px), brightens its icon to the brand color, and gains a brand-tinted glow; a firing node emits an expanding ring pulse. The hub scales and glows on fire. There is no continuous rotation — the wheel is static; motion comes from per-node spring entrance, the periodic fire pulse, and active-state transitions. `TriggerDetail` cross-fades its card on `activeTrigger` change via `AnimatePresence mode="wait"`, keying the `motion.div` on the active index, and renders a clickable progress-dot strip mirroring the active node's brand color.

## Key files
| File | Role |
| --- | --- |
| `src/components/feature-sections/TriggerSystem.tsx` | One-line re-export of `./trigger-system/index` |
| `src/components/feature-sections/trigger-system/index.tsx` | Container: state, auto-fire loop, layout, reduced-motion gating |
| `src/components/feature-sections/trigger-system/data.ts` | The 8 trigger definitions (icon, brand, copy, example) |
| `src/components/feature-sections/trigger-system/types.ts` | `Trigger` interface |
| `src/components/feature-sections/trigger-system/components/TriggerWheel.tsx` | Radial node + label ring, hub pulse, firing ring |
| `src/components/feature-sections/trigger-system/components/TriggerDetail.tsx` | Cross-fading detail card + progress-dot selector |

## Data & state
- **Source:** static, in-repo array `triggers` in `data.ts` (no fetch, no orchestrator call). **Stores:** none — local `useState` in `index.tsx` only (`activeTrigger`, `firing`; timer in a `useRef`). **API routes:** none. **Types:** `Trigger` in `trigger-system/types.ts` (`icon: LucideIcon`, `name`, `brand: BrandKey`, `color`, `desc`, `detail`, `example`); `BrandKey` / `BRAND_VAR` / `tint` from `src/lib/brand-theme.ts`.

## Integration points
- Wrapped by `SectionWrapper` (anchor `id="triggers"`) and `SectionIntro` (primitive heading/description), staggered via `staggerContainer` from `src/lib/animations.ts`.
- Mounted on the `/todo` page (`src/app/todo/page.tsx`) inside a `StageSection` (`glow="cyan"`, anchor target of the `TRIGGERS` breadcrumb). **Not** currently mounted on the live `/features` page — see gotchas.
- Colors resolve through `BRAND_VAR` / `tint` (CSS `color-mix`) so nodes stay theme-consistent; icons are `lucide-react`.

## Conventions & gotchas
- **Copy is hardcoded English, not i18n.** Every user-facing string lives inline: the `heading`/`description` props in `index.tsx:51-54` and all `name`/`desc`/`detail`/`example` fields in `data.ts`. None route through `useTranslation()` / `t.*`. This violates the repo's hard i18n rule (CLAUDE.md §1) — any localization pass must lift this section into `src/i18n/en.ts` and the 13 other locales.
- **Reduced-motion is partially gated.** `index.tsx:25-35` correctly short-circuits the auto-fire loop when `useReducedMotion()` is true, so the periodic pulse stops. However the wheel's entrance/active animations (`TriggerWheel.tsx`) and the detail cross-fade (`TriggerDetail.tsx`) are **not** gated — these children never receive or check `prefersReducedMotion`, so they still animate. The loop uses `setTimeout`, not `requestAnimationFrame`, so the `custom-animation/require-animation-gating` lint rule does not fire here.
- **`Math.random()` is used at runtime but outside render** (`fire()` callback in `index.tsx:19` and the reschedule delay at `:31`), so it does not trip React 19's render-purity rule. Do not move these into render or a `useMemo`.
- **Hardcoded `rgba(255,255,255,...)` values** for inactive icon/label/dot colors (`TriggerWheel.tsx:99`, `:64` in detail) sidestep the semantic-token convention; they assume a dark surface and the panel forces it via `force-dark`. Prefer `text-muted-dark` / `tint(...)` if reworking.
- **Hub fire shadow keys off `triggers[firing ?? 0]`** (`TriggerWheel.tsx:51`) — harmless because the block only renders when `firing !== null`, but the `?? 0` fallback is dead defensiveness.
- Node and label positions share the same angle math but different radii (140 vs 182); if you add a 9th trigger, both rings re-space automatically (`/ triggers.length`), but the 182-radius labels can overflow the 400px box on long names.

## Related docs
- [Self-Healing Circuit](healing-circuit.md)
- [Feature index](../INDEX.md)
