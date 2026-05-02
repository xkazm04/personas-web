# DX Fix Wave 4 — Extract visual primitives

> 4 atomic commits, 4 findings closed.
> Baseline preserved: 0 TS errors / 0 lint → 0 TS errors / 0 lint. `next build` green.
> Net source diff: 12 files changed, 265 insertions, 146 deletions.

## Commits

| # | Commit | Findings closed | Severity | Files |
|---|---|---|---|---|
| 1 | `d12699a` refactor(get-started): extract VisualFrame/VisualBadge/VisualRow chrome | C4 | High | 6 modified (1 new) |
| 2 | `78939dc` refactor(get-started): drop STEP_BG map, extract StepBackdrop helper | C5 | Medium | 1 modified |
| 3 | `fdbae86` refactor(hero): extract HeroStatRow to dedupe mobile/desktop stats | L10 | Low | 2 modified (1 new) |
| 4 | `47dfe26` feat(animations): add staggerDelay/nextDelay; refactor why-agents panels | W9 | Low | 3 modified |

## What was fixed (grouped by sub-pattern)

### A. Step visual chrome (C4)
The 5 step visuals (Connect/Create/Download/Improve/Work) shared:
- An outer flex column container (all 5; gap variation `gap-4` vs `gap-5`)
- A "badge pill" — rounded-full border + bg + icon + uppercase mono label (Connect, Improve)
- A "bordered row" with same border + bg pattern (Connect grid items, Download platform list)
- The exact inline-style block `borderColor: "var(--border-glass-hover)"` + `backgroundColor: "rgba(var(--surface-overlay), 0.02)"` repeated 11+ times

New `src/components/sections/get-started/visuals/chrome.tsx` exports:
- `SURFACE_GLASS` — the recurring inline-style const
- `<VisualFrame gap?>` — outer flex column
- `<VisualBadge icon label color align?>` — top pill
- `<VisualRow>` — bordered horizontal row

Each visual got noticeably shorter and a future "add a 6th visual" task is ~10 lines instead of ~50. Visuals are visually unchanged — every refactor was structural.

### B. STEP_BG template + StepBackdrop helper (C5)
The `STEP_BG_BY_NUMBER` map was a 5-entry hand-typed lookup that just paired step number with the predictable filename pattern `/imgs/get-started/stepN-{dark,light}.png`. Pure mechanical naming — the lookup added zero value.

Replaced with inline template literals scoped to a new `StepBackdrop` helper component co-located in `StepContent.tsx`. The backdrop bundles the dark `<img>`, light `<img>`, and the two gradient overlay divs (different opacity per theme) into one place — previously these were inlined as 4 sibling elements with the dark/light pair pattern duplicated twice. Adding a 6th step is `<StepBackdrop stepNumber={6} />` plus the two `.png` files.

### C. HeroStatRow dedup (L10)
The 3-up "agents / connectors / templates" row was rendered twice in `HeroClient.tsx` — once mobile-only with `text-base font-bold` chrome, once inside the desktop command-center panel with `text-xl font-bold` and hover styles. The shared bits had been cut-and-pasted during the responsive layout pass and would inevitably drift on the next stat-rename.

Extracted to `src/components/sections/hero/HeroStatRow.tsx` with a `variant: "mobile" | "desktop"` prop. The `data-testid="mock-stats"` selector moved onto the component so existing tests keep working.

### D. Stagger helpers (W9)
WhyAgents' AgentPanel and WorkflowPanel both computed staggered framer-motion delays inline:
```ts
delay: i * 0.15
delay: scenario.workflow.steps.length * 0.15 + 0.1
delay: thoughts.length * 0.2 + actions.length * 0.12 + 0.1
```

Two helpers in `lib/animations.ts`:
- `staggerDelay(index, perItem)` → `index * perItem`
- `nextDelay(prevCount, perItem, gap?)` → `prevCount * perItem + gap`

Both panels refactored with named per-list constants (`THOUGHT_STAGGER`, `ACTION_STAGGER`, `STEP_STAGGER`, `RESULT_GAP`). The chained delay in AgentPanel is now compositional:
```ts
const resultDelay =
  nextDelay(thoughtCount, THOUGHT_STAGGER) +
  nextDelay(actionCount, ACTION_STAGGER, RESULT_GAP);
```

Visual rhythm preserved exactly. Future cross-panel rhythm tuning is one constant per file or one helper edit.

### E. Deferred (no-op): C7 GlowingStepCard primitive
The C7 finding (DownloadCTA glowing step cards) was closed in Wave 3 with the brand-tint refactor. The finding's secondary recommendation — extract a reusable `<GlowingStepCard>` primitive — was deferred because there's currently only one consumer (DownloadCTA itself). The original second consumer mentioned in the finding ("MidPageCTA") was confirmed not to exist in W1.4. Per the "no abstraction without a second consumer" principle, the inline brand-tint version from Wave 3 is the right shape until a second use case appears. The brand-theme infrastructure (`tint`, `STATE_COLORS`, `BrandKey`) is in place to make extraction trivial when needed.

## Verification table

| Gate | Before Wave 4 | After Wave 4 | Delta |
|---|---:|---:|---:|
| TypeScript errors | 0 | 0 | 0 |
| ESLint problems | 0 | 0 | 0 |
| `next build` exit | 0 | 0 | 0 |
| Source primitives added | (baseline) | + chrome.tsx, + HeroStatRow.tsx, + StepBackdrop (inline) | +2 files, +1 inline helper |
| lib/animations.ts helpers | 7 transition presets, 8 variants | + staggerDelay, nextDelay | +2 helpers |

## Cumulative status (across all waves so far)

| Wave | Theme | Closed |
|---|---|---:|
| 1 | Dead-code purge | 5 |
| 2 | Wrapper sweep + lazy consolidation | 4 |
| 3 | Brand theming unification | 4 |
| 4 | Extract visual primitives | 4 |

Pattern catalogue: 11 items (9 from prior waves, 2 new). Findings closed total: **17 / 43**.

## Patterns established (additions to the catalogue, items 10–11)

10. **"Recurring inline-style block + class wrapper" is a primitive waiting to happen** — When the same `style={{ borderColor: ..., backgroundColor: ... }}` block appears 8+ times across sibling files, a typed const (e.g. `SURFACE_GLASS`) plus 1-3 thin component wrappers (`<VisualFrame>`, `<VisualBadge>`, `<VisualRow>`) eliminates a search-replace risk and makes each consumer ~30% shorter. The bar for extraction here isn't "can I make a component with N props?" — it's "do these copies all need to evolve together?" If yes, extract; if they're coincidentally similar today but might diverge tomorrow, leave them.

11. **Magic-number staggers compose better with named constants and tiny helpers** — Inline arithmetic like `delay: prev.length * 0.2 + i * 0.12 + 0.1` reads like a bug ("why these numbers?") and resists global tuning. Two two-line helpers (`staggerDelay`, `nextDelay`) plus per-list named constants make the same math compositional and self-documenting. The helpers are not for everyone-everywhere — they're for the case where chained sequence delays span multiple lists.

## What remains

| Wave | Theme | Approx count |
|---|---|---:|
| 5 | Terminal primitives + guide-link contract | 4 |
| 6 | Index-coupled arrays (latent bugs) | 5 |
| 7 | Hook hygiene + state-machine reducer | 5 |
| 8 (optional) | Data-convention + leftover polish | 12 |
