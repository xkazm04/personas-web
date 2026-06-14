# Platform Command
> Animated terminal that types a four-command CLI sequence (Design → Coordinate → Deploy → Monitor) with per-pillar badges, then loops. · **Route:** dev-only `/preview/platform-command` (registered as section `platform-command`; not mounted on the public landing page) · **Status:** Live

## What it does
Renders a glass terminal panel that auto-types a scripted sequence of four `personas …` CLI commands, streams each command's colorized output line-by-line, snapshots finished commands into a scrollback history, shows a closing summary, then restarts on a loop. A row of pillar badges (Design, Coordinate, Deploy, Monitor) tracks progress by dimming/highlighting the active command. Viewers can **Skip** the current command or **Replay** the whole sequence; a footer badge shows `N/4` progress. The animation only starts once the panel scrolls into view and instantly fills (no typing) when the user prefers reduced motion.

## How it works
`PlatformCommand` (index.tsx) is a client component wrapped in `SectionWrapper`. All timing/state lives in `useTerminalSequence(terminalRef)`, a phase machine: `idle → typing → output → (next command | summary) → done → restart`. On entering view (`useInView`, `-100px` margin) it waits a 600ms warm-up, then per-char `setTimeout`s advance `typedText`; per-line `setTimeout`s append `outputLines`. When a command finishes it is pushed into `history`, state resets, and the next command starts — or, after the last command, the summary lines fade in (3s hold), the prompt drops to a blinking cursor (`done`), and after 4s `restart()` loops. Each phase parks its timer in a local effect closure and clears it on cleanup; an `isActiveRef` mount guard prevents post-unmount `setState`. Rendering delegates to shared primitives: `TerminalChrome` (titlebar), `TerminalHistory` (scrollback), `TerminalLine` (animated current-output line), `BlinkingCursor`, plus local `CommandBadge`, `TerminalBackground`, and `TerminalControls`. The scroll container auto-sticks to the bottom unless the user scrolls up >16px.

## Key files
| File | Role |
| --- | --- |
| `src/components/sections/platform-command/index.tsx` | Section component; layout, badge row, terminal panel, scroll-stick effects |
| `src/components/sections/platform-command/use-terminal-sequence.ts` | Phase machine: typing/output timers, history, skip/restart, reduced-motion fast-path |
| `src/components/sections/platform-command/data.ts` | The 4 command scripts, `summaryLines`, `colorClasses`, `commandBrands`, `getTypingDelay()` |
| `src/components/sections/platform-command/types.ts` | `OutputLine`, `CommandSequence`, `TerminalPhase` types |
| `src/components/sections/platform-command/components/CommandBadge.tsx` | Pillar badge (icon + label, brand-tinted via `BRAND_VAR`/`tint`) |
| `src/components/sections/platform-command/components/TerminalControls.tsx` | Footer: progress badge + Skip/Replay buttons |
| `src/components/sections/platform-command/components/TerminalBackground.tsx` | Two ambient radial-gradient blobs (cyan/purple) |
| `src/components/primitives/terminal/{TerminalHistory,TerminalLine,BlinkingCursor}.tsx` | Shared terminal render primitives |
| `src/components/TerminalChrome.tsx` | Shared terminal titlebar (title/status/info) |
| `src/app/preview/registry.ts:25` | Registers the `platform-command` preview slug |

## Data & state
- **Source:** static, hardcoded in `data.ts:4` (`commands: CommandSequence[]`) and `data.ts:89` (`summaryLines`) — no fetch, no i18n (all CLI strings are intentionally literal). **Stores:** none (no Zustand); all state is local to `useTerminalSequence` (`currentCommandIndex`, `typedText`, `outputLines`, `history`, `phase`, `showSummary`). **API routes:** none. **Types:** `OutputLine` / `CommandSequence` / `TerminalPhase` in `types.ts`; history reuses the shared `TerminalOutputLine` shape from `primitives/terminal/types.ts`.

## Integration points
- **Preview harness only:** mounted via `PREVIEW_REGISTRY["platform-command"]` (`src/app/preview/registry.ts:25`), reachable at `/preview/platform-command`, which `notFound()`s in production (`src/app/preview/[section]/page.tsx:15`). It is **not** imported by `src/app/page.tsx` or any production page.
- **Brand theme:** badges and footer pull colors from `@/lib/brand-theme` (`BRAND_VAR`, `tint`, `BrandKey`) keyed by `commandBrands = ["purple","cyan","emerald","amber"]`.
- **Shared primitives:** depends on `TerminalChrome`, `TerminalHistory`, `TerminalLine`, `BlinkingCursor`, `SectionIntro`, `SectionWrapper`, and `fadeUp` from `@/lib/animations`.
- **Icons:** `lucide-react` (`Wand2`, `Zap`, `Cloud`, `Activity`).

## Conventions & gotchas
- **"Live" but dev-only reachable:** despite the Live status, the section currently has no public route — it only renders under the dev-only preview harness. If you expect it on the marketing site, it is not wired in.
- **No i18n:** every visible string (commands, output, badge labels like "Skip"/"Replay", `SectionIntro` copy) is hardcoded English. This violates the repo's "no hardcoded English in JSX" convention but is a deliberate exception for literal CLI/terminal content — keep new strings literal here rather than routing them through `useTranslation()`.
- **Reduced-motion is only partial.** The typing/output state machine correctly short-circuits to instant fill when `useReducedMotion()` is true (`use-terminal-sequence.ts:101`, `:187`). But the *render* primitives still animate unconditionally: `TerminalLine` runs a fade/translate entrance and `BlinkingCursor` runs an infinite opacity blink (`repeat: Infinity`) with no reduced-motion gate. So reduced-motion users avoid the typing crawl but still get line fades and a perpetually blinking cursor. (These use framer-motion `animate`, not raw `requestAnimationFrame`, so the `custom-animation/require-animation-gating` lint rule does not flag them — the gap is real but lint-invisible.)
- **Impure `Math.random()` in render path:** `getTypingDelay()` (`data.ts:109`) calls `Math.random()` and is invoked from inside the typing `useEffect` (not render/`useMemo`), so it stays within the React 19 purity rule — but note it is impure if ever moved into render.
- **State machine spread across 4 effects + 3 callbacks** — flagged for a reducer refactor (deferred; see comment at `use-terminal-sequence.ts:41` and harness doc `platform-showcase.md` #7). Any edit here carries behavioral risk and needs visual verification; there is no unit-test runner.
- **`OutputLine` shape drift:** this feature's `OutputLine` (discriminated by `color`) differs from `/playground`'s (discriminated by `type`). The shared `primitives/terminal/types.ts` `TerminalOutputLine` was introduced to bridge them but both demos still keep their own narrow line types.
- **`advanceToNext` snapshots live `outputLines`, but Skip snapshots `cmd.output`** — two slightly different history-write paths (`use-terminal-sequence.ts:133` vs `:156`); keep them in sync if you change the output rendering.

## Related docs
- [Platform Layers](platform-layers.md)
- [Feature index](../INDEX.md)
