# Security Vault
> "Nested vault" illustration of Personas' device-only credential security: three concentric seals (device, OS keychain, AES-256-GCM) turn and lock around your keys · **Route:** `/features` (deep-dive section) · **Status:** Live

## What it does
Reassures the visitor that Personas never ships secrets to the cloud. A centered
heading ("Your data never *leaves*") and a one-line promise ("Every credential is
encrypted on your device and kept in your OS's own vault.") sit above a single
animated vault door. A key drops through three aligned openings to the centre;
then the inner ring (**AES-256-GCM**), the middle ring (**OS keychain**) and the
outer ring (**Device**) each turn and click into a latch, one after another; the
door bolts shoot into the frame on both sides and the key glows — *sealed*. A
replay button in the corner re-plays it. No live data.

## How it works
`SecurityVault.tsx` (default export `SecurityVaultNestedVault`, an `/illustrate`
1.1.0 "nested-vault" variant) is a `SectionWrapper(fit="fill", id="security")`
with a stagger-animated intro (`data-section-intro` / `data-section-lede`) and a
`data-stage-slot` holding the art frame. One framer `MotionValue` `progress`
(0..1) drives every beat over `DURATION = 3.8`s (`SecurityVault.tsx:20`); it rests
at `1` (the sealed end state) for the server render and reduced motion, and plays
`0 → 1` once when the frame is in view (`useInView`, `amount: 0.35`). The replay
button bumps a `run` counter that re-runs the effect.

`NestedVaultArt` draws the SVG (viewBox 760×480 around the vault centre) and maps
`progress` onto beats (`NestedVaultArt.tsx:13-20`): key drop 0–0.20, inner ring
0.20–0.40, middle ring 0.40–0.60, outer ring 0.60–0.80, bolts 0.80–0.92, key glow
0.90–1.00. Ring specs (radius, width, brand colour, turn, beat window, engraved
label) are the `RINGS` table in `nestedVaultParts.tsx:25-29`; `Ring` renders one
ring with its opening, notch and engraved label on a text path, and `Bolts` one
side's frame and sliding bolts.

**Stage fit (desktop).** The art frame carries `data-stage-art` with
`--art-ar: 19/12` (`SecurityVault.tsx:70-71`), so on the stage
(`src/styles/stage.css`) it is `min(100%, slot height × 19/12)` wide — as wide as
the stage allows, never taller than the screen, and growing on a monitor. Frame
radius is `rounded-2xl`.

## Key files
| File | Role |
| --- | --- |
| `src/components/feature-sections/SecurityVault.tsx` | Section shell: heading, lede, progress value + in-view play, replay button, stage slot/art frame |
| `src/components/feature-sections/security-vault/NestedVaultArt.tsx` | The SVG: background, bezel, door face, secret halo, rings, key + "Your keys" label |
| `src/components/feature-sections/security-vault/nestedVaultParts.tsx` | `W`/`H`, `RINGS` spec table, `Ring`, `Bolts`, `rotateStyle` |
| `src/components/feature-sections/feature-lazy.tsx:23` | `LazySecurityVault` code-split wrapper (`ssr: false`) |
| `src/app/features/page.tsx:78-82` | Mount point inside `StageSection id="security"` + `LazyMount` |
| `src/components/SectionWrapper.tsx` | Section frame (`fit` → `data-stage`) + animation-pause register |
| `src/lib/animations.ts` | `fadeUp` / `staggerContainer` variants used by the intro |

## Data & state
- **Source:** fully static — ring geometry in `RINGS`; copy in the `securitySection` namespace of `src/i18n/en.ts` (heading, lede, `artLabel`, `replay`, `yourKeys`, `rings.keychain`, `rings.device`). **Stores:** none. **API routes:** none. **Local state:** the `progress` `MotionValue` and a `run` counter for replay. No props.

## Integration points
- **Consumed by:** `src/app/features/page.tsx` only (via `LazySecurityVault`, inside `<LazyMount minHeight={760} label="Security">` in a rose-glow `StageSection id="security"`). Not used on the homepage. Anchor `id="security"` is the scroll-map target.
- **Depends on:** `SectionWrapper`, `SectionHeading`, `GradientText`, `fadeUp`/`staggerContainer`, `useStillMotion`, `BRAND_VAR`/`tint` from `@/lib/brand-theme`, `lucide-react` (`KeyRound`, `RotateCcw`).
- No guided-tour step targets this section.

## Conventions & gotchas
- **i18n — migrated, English-only for now.** All copy lives in `t.securitySection`. The inner ring's engraving `AES-256-GCM` is a deliberate literal (`{ literal: ... }` in `RINGS`), the other two rings take `{ key: ... }` into `securitySection.rings`. `securitySection` is listed in `PENDING_TRANSLATION` in `en.ts`, so the 13 other locales fall back to English until it is translated.
- **Animation gating — followed.** The gate is `useStillMotion` (`SecurityVault.tsx:23`): when still, `progress` is pinned to 1 and the replay button is `disabled`. DOM shape is constant (only the motion value differs). One-shot, not an ambient loop.
- **Tokens.** SVG colours come from `BRAND_VAR` / `tint()` and `var(--foreground)` / `var(--background)`; the frame uses `border-glass`. `bg-white/[0.02]` on the frame and `bg-white/[0.03]` on the replay button are raw-colour exceptions.
- **`useId`-scoped SVG ids.** Gradient and label-path ids are suffixed with a sanitised `useId()` so two instances cannot collide; the blur filter id `nv-soft` is not scoped.
- **Unused assets.** `public/imgs/features/security/{vault-door,os-keyring,local-shield}.png` (the previous pillar-card art) are no longer referenced from `src/`.
- **Lazy + SSR-off.** `ssr: false` means the section is client-only; the always-rendered `StageSection id="security"` keeps the anchor working for the scroll-map before hydration.

## Related docs
- [Observability Deck](observability-deck.md)
- [Security & compliance page](../content/security.md)
- [Feature index](../INDEX.md)
