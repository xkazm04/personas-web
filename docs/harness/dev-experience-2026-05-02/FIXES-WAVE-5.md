# DX Fix Wave 5 — Terminal primitives + guide-link contract

> 3 atomic commits, 4 findings closed.
> Baseline preserved: 0 TS errors / 0 lint → 0 TS errors / 0 lint. `next build` green.
> Net source diff: 15 files changed, 190 insertions, 100 deletions.

## Commits

| # | Commit | Findings closed | Severity | Files |
|---|---|---|---|---|
| 1 | `9860f76` refactor(primitives): promote BlinkingCursor/TerminalLine/TerminalHistory | P2, P11 | 1 High + 1 Low | 8 modified (5 new, 3 deleted) |
| 2 | `de30cf0` feat(guide-link): add GuideTopicRef + guideHref builder | W1 | High | 3 modified |
| 3 | `4f54da1` fix(guide-links): route through openGuideLink for desktop UX parity | W8 | High | 2 modified |

## What was fixed (grouped by sub-pattern)

### A. Terminal primitives (P2 + P11)
Three terminal-style components (`BlinkingCursor`, `TerminalLine`, `TerminalHistory`) lived inside `platform-command/components/` even though they had no platform-command-specific imports or state. Meanwhile `playground/TerminalSim.tsx` had reinvented the blinking cursor inline as a `_` character with custom opacity animation — visual drift between two terminal demos in the same product.

Promoted all three to `src/components/primitives/terminal/`:
- `BlinkingCursor` relocated unchanged
- `TerminalLine` parameterized: takes flat `text`/`colorClass`/`indent`/`indentPx` props instead of importing `colorClasses` from a sibling `data` module — the primitive doesn't lock into any particular OutputLine shape
- `TerminalHistory` is generic over the line shape; consumer passes its own `colorClasses` Record so the primitive stays portable across sections that use different palettes
- `TerminalOutputLine` type — shared cell shape with `color: string` (open) so each consumer can use its own narrower union

All re-exported from `primitives/index.ts`. Consumers refactored:
- `platform-command/index.tsx` imports from primitives, passes `colorClasses` to `TerminalHistory`, spreads line props to `TerminalLine`
- `playground/TerminalSim.tsx` replaces the inline `_` cursor with `<BlinkingCursor />` for visual consistency
- 3 old component files in `platform-command/components/` deleted

P11's full unification of the playground OutputLine (which uses `type` instead of `color`) is deferred — the new primitives accept either shape via the consumer-supplied `colorClasses` prop, so adopting later is a one-file change.

### B. Canonical GuideTopicRef + guideHref (W1)
The `{label, category, topic}` shape was redefined per consumer (once in `features/types.ts`, once in `vision-grid/data.ts`). Every guide-URL build site repeated the inline template literal `` `/guide/${category}/${topic}` ``. URL scheme changes (e.g. adding a locale prefix) would require touching every consumer by hand.

Added to `lib/guide-link.ts`:
- `GuideTopicRef` — canonical `{label, category, topic}` interface
- `guideHref(ref)` — single source of truth for guide URL construction

Refactored:
- `features/types.ts` re-exports `GuideTopicRef` as `GuideLink` for backward compat (existing imports keep working) and uses the new type in `Feature.guideTopics`
- `vision-grid/data.ts` drops its local `GuideLink` interface and imports `GuideTopicRef` directly

### C. Desktop UX parity for guide links (W8)
`GuideLinks.tsx` (feature cards) and `PlatformCardTile.tsx` (vision grid) both used Next.js `<Link>` for guide-topic deep links. The project has `lib/guide-link.ts` specifically because the desktop app shells the same React tree and intercepts external navigation via the `personas:open-external` CustomEvent — but neither marketing surface was wired to it. Result: feature-card and platform-card guide links opened inside the desktop webview while the in-guide navigation opened externally. A silent UX bug visible only in the desktop build.

Both consumers now use:
```tsx
<button onClick={() => openGuideLink(guideHref(gt))}>...</button>
```

Behavior in web: identical (`window.open` new tab). Behavior in desktop: now matches the rest of the guide system — links open in the system browser, not the webview. PlatformCardTile preserves its `e.stopPropagation()` so clicks don't expand the card behind the guide link.

## Verification table

| Gate | Before Wave 5 | After Wave 5 | Delta |
|---|---:|---:|---:|
| TypeScript errors | 0 | 0 | 0 |
| ESLint problems | 0 | 0 | 0 |
| `next build` exit | 0 | 0 | 0 |
| primitives/ exports | 4 (SectionIntro, BrandCard family, ThemedChip, TerminalPanel) | 7 (+ BlinkingCursor, TerminalLine, TerminalHistory) | +3 |
| guide-link.ts surface | isDesktopApp, openGuideLink | + GuideTopicRef, guideHref | +1 type, +1 fn |
| Desktop UX bugs | Guide links from cards open in-webview | Now open externally | bug fixed |

## Cumulative status (across all waves so far)

| Wave | Theme | Closed |
|---|---|---:|
| 1 | Dead-code purge | 5 |
| 2 | Wrapper sweep + lazy consolidation | 4 |
| 3 | Brand theming unification | 4 |
| 4 | Extract visual primitives | 4 |
| 5 | Terminal primitives + guide-link contract | 4 |

Pattern catalogue: 13 items (11 from prior waves, 2 new). Findings closed total: **21 / 43**.

## Patterns established (additions to the catalogue, items 12–13)

12. **"Generic component locked into a sibling's data module" is a primitive smell** — When a component would be reusable except that it imports a colorClasses/styleClasses/iconMap from a `../data` module, that import is the only thing keeping it section-local. Fix: parameterize over the lookup (pass the Record as a prop, or take a flat resolved value like `colorClass: string`). The component moves to primitives/ and the consumer site grows a few extra props — a lopsided trade in favor of reusability.

13. **A platform-aware utility that consumers don't import is a silent bug** — The project had `lib/guide-link.ts` with `openGuideLink()` for exactly the desktop/web split that GuideLinks.tsx ran into. Existing helpers that solve a problem some-but-not-all consumers face will silently misbehave. Add a lint rule, codeowner note, or consolidating type (like `GuideTopicRef` here) so the helper isn't avoidable. The bug fix isn't writing the helper — it's making sure all paths go through it.

## What remains

| Wave | Theme | Approx count |
|---|---|---:|
| 6 | Index-coupled arrays (latent bugs) | 5 |
| 7 | Hook hygiene + state-machine reducer | 5 |
| 8 (optional) | Data-convention + leftover polish | 12 |
