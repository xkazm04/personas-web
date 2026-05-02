# DX Fix Wave 3 — Brand theming unification

> 4 atomic commits, 4 findings closed.
> Baseline preserved: 0 TS errors / 0 lint → 0 TS errors / 0 lint. `next build` green.
> Net source diff: 14 files changed, 175 insertions, 113 deletions.

## Commits

| # | Commit | Findings closed | Severity | Files |
|---|---|---|---|---|
| 1 | `1ebe8b8` refactor(platform-layers): unify on brand-theme helpers | P3 | High | 7 modified |
| 2 | `85f48a3` feat(brand-theme): add STATE_COLORS, fix WorkVisual hardcoding | C8 | Medium | 2 modified |
| 3 | `9e5db6c` refactor(DownloadCTA): brand-tint glow instead of hardcoded RGBA | C7 | Medium | 1 modified |
| 4 | `35dc528` feat(brand-theme): introduce BrandAccent + ACCENT_ICON_CLASSES | W4 | Medium | 5 modified |

## What was fixed (grouped by sub-pattern)

### A. Migrate the brand-theme holdout (P3)
`platform-layers/data.tsx` carried six coordinated styling values per layer (`color`, `rgb`, `tw.{border, bg, text, glow, labelBg, labelBorder}`) — all encoding the same color identity in three different formats. The `rgb` strings hardcoded dark-theme RGB values, so the glow/connection-pillar colors silently misrepresented in light themes. A real theme-correctness bug.

Reduced `Layer` to a single `brand: BrandKey` field. All bg/border/text/glow/overlay values are now derived at render time via `BRAND_VAR`, `tint`, and `brandShadow` from `@/lib/brand-theme`. Light/dark theme switches recolor correctly. Visual JSX inside `data.tsx` was kept intact (out of scope for this finding; covered by Wave 4's primitive-extraction theme).

### B. Semantic state colors (C8)
`WorkVisual.tsx` accepted a `brand: BrandKey` prop but ignored it for "done" states, hardcoding `BRAND_VAR.emerald` in two places. The intent was always semantic ("done means success means green"), not branded. Added `STATE_COLORS = { success, warning, error }` as the canonical place to express semantic state colors. WorkVisual now imports `STATE_COLORS.success` for both done-state usages — same green today, but if the success palette ever moves to a more accessible green, one edit covers all consumers.

### C. brand-tint instead of hand-coded RGBA (C7)
`DownloadCTA.tsx` step-card animation used hand-coded RGBA strings for glow colors and string-replace tricks (`glowColor.replace("0.5", "0.4")`) to derive related alpha values. Replaced with `tint(brand, alpha)` driven by a `STEP_BRANDS: BrandKey[]` array (`["cyan", "blue", "purple"]`) that documents the cool→warm flow intent. Step 1's glow shifted from a custom soft blue-purple `#6D85E0` to `BRAND_VAR.blue` — defensible visual change, theme-correct, no string manipulation.

The broader `<GlowingStepCard>` extraction recommended by the finding is deferred to Wave 4 (where the primitive-extraction theme lives). The brand-theme infrastructure landed here makes the future extraction trivial.

### D. Shared BrandAccent + ACCENT_ICON_CLASSES (W4)
`Feature` carried 4 redundant fields per entry (`iconBg`, `iconColor`, `iconRing`, `iconGlow`) — all mechanical Tailwind class strings derived from `accent`. The `accent` field used a local union literal (`"purple" | "cyan" | "emerald" | "amber"`), and `GlowCard` had its own identical local `AccentColor` type.

Two consolidations land together:
1. `BrandAccent` — narrower marketing-card palette in `brand-theme.ts`, used by both `Feature` and `GlowCard`. Allows `BrandKey` to stay broad (rose, blue) while marketing surfaces enforce the palette.
2. `ACCENT_ICON_CLASSES: Record<BrandKey, { bg, text, ring, glow }>` — single source for the recurring "icon-in-a-rounded-square" Tailwind class bundle. Classes are literal strings so Tailwind's class-scanner sees them at build time.

`Feature` shrinks by 4 fields per entry; `FeatureCardHeader` derives icon classes from `ACCENT_ICON_CLASSES[f.accent]`; `GlowCard` swaps its local `AccentColor` for the imported `BrandAccent`. ScenarioDuel's `ComparisonCard color` prop has the same 8-field redundancy but reaches deeper into ComparisonCard internals — deferred to a future wave; the new infrastructure is ready when that work happens.

## Verification table

| Gate | Before Wave 3 | After Wave 3 | Delta |
|---|---:|---:|---:|
| TypeScript errors | 0 | 0 | 0 |
| ESLint problems | 0 | 0 | 0 |
| `next build` exit | 0 | 0 | 0 |
| brand-theme exports | `BRAND_VAR`, `tint`, `brandShadow`, `brandTextShadow`, `hexToBrand`, `BrandKey` | + `BrandAccent`, `STATE_COLORS`, `ACCENT_ICON_CLASSES` | +3 helpers, +1 type |

## Cumulative status (across all waves so far)

| Wave | Theme | Closed |
|---|---|---:|
| 1 | Dead-code purge | 5 |
| 2 | Wrapper sweep + lazy consolidation | 4 |
| 3 | Brand theming unification | 4 |

Pattern catalogue: 9 items (6 from prior waves, 3 new). Findings closed total: **13 / 43**.

## Patterns established (additions to the catalogue, items 7–9)

7. **Dual-encoded color identity is a theme-correctness bug waiting to fire** — When a piece of data describes its color in multiple formats (a brand key like `"emerald"` AND raw `rgb` strings AND pre-baked Tailwind class bundles), the formats inevitably drift. The pre-baked formats hardcode whatever the original theme variant looked like; light/dark switches misrepresent. Fix: pick the brand key as the single source of truth and derive everything else at render time via `BRAND_VAR`/`tint`/helpers. The cost is a few inline-style attributes; the benefit is theme correctness by construction.

8. **Hardcoded color in a parameterized component is a brand-prop contract violation** — When a component accepts `brand: BrandKey` but bypasses it for some "obvious" semantic case (`done = green`), readers can't tell whether the bypass is intentional state-color or a bug. Fix: introduce `STATE_COLORS = { success, warning, error }` and use it explicitly for state semantics. The hardcode disappears; the intent is named and centrally tunable.

9. **Tailwind class records are the right shape for derived class bundles** — When components want `bg-${brand}-500/10` etc., naive interpolation breaks Tailwind's class scanner (PurgeCSS strips the runtime-built class). Solution: `Record<BrandKey, { bg, text, ring, glow }>` with literal class strings as values. Scanner sees them at build, consumers index by brand key at render. Same pattern works for any "N variants × M slots of literal classes" matrix.

## What remains

| Wave | Theme | Approx count |
|---|---|---:|
| 4 | Extract visual primitives | 5 |
| 5 | Terminal primitives + guide-link contract | 4 |
| 6 | Index-coupled arrays (latent bugs) | 5 |
| 7 | Hook hygiene + state-machine reducer | 5 |
| 8 (optional) | Data-convention + leftover polish | 12 |

Note: Wave 4 will start by completing the deferred `<GlowingStepCard>` extraction from C7 — the brand-theme infrastructure is ready — then move on to the 5 step visuals (`<VisualBadge>`, `<VisualRow>`, etc.), HeroStatRow dedup, and `staggerDelay()` helpers.
