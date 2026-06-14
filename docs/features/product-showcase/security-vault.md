# Security Vault
> Three-pillar showcase of Personas' device-only credential security (encryption, OS keyring, zero cloud) · **Route:** `/features` (deep-dive section) · **Status:** Live

## What it does
Reassures the visitor that Personas never ships secrets to the cloud. A centered
heading ("Your data never *leaves*") and a one-paragraph promise sit above three
tall illustrated cards — the "pillars" — each pairing a generated security image
with a claim: device-only **AES-256-GCM** encryption, **OS-native** keyring
storage (Windows Credential Manager / macOS Keychain / Linux Secret Service), and
**zero cloud storage** (no sync, telemetry, or remote copy). A pulsing shield
accent closes the section. It is a static marketing claim block — no live data,
no interactivity beyond hover.

## How it works
`SecurityVault` is the section shell: a `SectionWrapper id="security"` containing
a stagger-animated heading/paragraph group, then a single `whileInView` fade that
mounts `SecurityVaultPillars`. The pillars module holds a hardcoded `pillars`
array (3 entries) and maps each to a `PillarCard`. Each card is a fixed
`height: 400` flex column: a 230px illustration hero zone (`next/image` with
`fill`, `object-cover`, hover scale + opacity lift), an absolutely-positioned
accent tag (icon + mono kicker) top-left, a bottom gradient fade so body text
never fights the art, a hover radial spotlight, then a body zone with title and
detail. A per-card colored left rail and a closing pulsing `Shield` finish it.
Color, image, icon, and copy all come from the pillar object; styling is mostly
inline `style={{…}}` using `p.color` with hex-alpha suffixes (`${p.color}33`).

On `/features` the section is code-split: `LazySecurityVault`
(`feature-lazy.tsx`) wraps it via `createLazySection(..., { ssr: false })` and the
page mounts it inside `<LazyMount minHeight={760} label="Security">` within a
rose-glow `StageSection id="security"`, so the chunk only hydrates when scrolled
near.

## Key files
| File | Role |
| --- | --- |
| `src/components/feature-sections/SecurityVault.tsx` | Section shell: heading, promise paragraph, mounts pillars |
| `src/components/feature-sections/SecurityVaultPillars.tsx` | `pillars` data, `PillarCard`, shield accent |
| `src/components/feature-sections/feature-lazy.tsx:23` | `LazySecurityVault` code-split wrapper (`ssr: false`) |
| `src/app/features/page.tsx:60` | Mount point inside `StageSection id="security"` + `LazyMount` |
| `public/imgs/features/security/vault-door.png` | Pillar 1 illustration (AES-256-GCM) |
| `public/imgs/features/security/os-keyring.png` | Pillar 2 illustration (OS-native) |
| `public/imgs/features/security/local-shield.png` | Pillar 3 illustration (zero cloud) |
| `src/components/SectionWrapper.tsx` | Stagger/viewport section frame + animation-pause register |
| `src/lib/animations.ts:57` | `fadeUp` / `staggerContainer` variants used by the shell |

## Data & state
- **Source:** fully static — hardcoded `pillars: Pillar[]` array in `SecurityVaultPillars.tsx:24`. **Stores:** none (no Zustand). **API routes:** none. **Types:** local `Pillar` interface (`SecurityVaultPillars.tsx:15`); icons typed `LucideIcon` from `lucide-react`. No props on either component.

## Integration points
- **Consumed by:** `src/app/features/page.tsx` only (via `LazySecurityVault`). Not used on the homepage (`src/app/page.tsx` has no SecurityVault). Anchor `id="security"` is the scroll-map target.
- **Depends on:** `SectionWrapper`, `SectionHeading`, `GradientText`, `fadeUp`/`staggerContainer` from `@/lib/animations`, `next/image`, `lucide-react` (`Lock`, `Fingerprint`, `CloudOff`, `Shield`), three PNGs under `public/imgs/features/security/`.
- **Shared infra (note only, NOT used here):** `CinematicBg.tsx` and `ContextHint.tsx` are shared feature-section helpers used by sibling sections — Security Vault references neither. `feature-lazy.tsx` is the shared lazy-mount barrel and *does* wrap this section.

## Conventions & gotchas
- **i18n violation — all copy is hardcoded English.** The heading ("Your data never leaves"), the promise paragraph (`SecurityVault.tsx:30-35`), and every pillar `title`/`kicker`/`detail` (`SecurityVaultPillars.tsx:24-52`) are literal JSX/data strings. No `useTranslation()` anywhere. CLAUDE.md requires every user-facing string to live in `src/i18n/en.ts` and ship in all 14 locales — this section breaks that rule wholesale. (Sibling note: `docs/features/marketing/features-overview.md` flags the same gap across the `/features` sections.)
- **Reduced-motion not gated.** Neither file imports `useReducedMotion`; 21 sibling feature-section files do. The cards run `whileInView` + `whileHover={{ y: -4 }}`, the shell runs `whileInView`, and the closing shield runs a continuous `animate-ping` (`SecurityVaultPillars.tsx:166`) that never stops or respects `prefers-reduced-motion`. The custom `custom-animation/require-animation-gating` lint rule only fires on `requestAnimationFrame`/`cancelAnimationFrame` (absent here), so this passes lint while still ignoring the motion preference — a real accessibility gap, not a lint catch.
- **Token violations — raw colors / hardcoded dark.** Cards opt out of the theme with `force-dark` and inline hex backgrounds (`rgba(12,14,22,0.7)`), per-pillar hex `color` values (`#f43f5e`, `#ec4899`, `#a855f7`) composed as `${p.color}33`, and `bg-rose-500/10` / `text-rose-500/70` raw Tailwind colors. CLAUDE.md prefers semantic tokens (`text-brand-cyan`, `border-glass`, …) over raw hex. This is a deliberate art-driven dark card design, but it bypasses the token system.
- **Decorative images, correctly hidden.** Each illustration uses `alt=""` + `aria-hidden="true"` (`SecurityVaultPillars.tsx:79,83`) — appropriate since the adjacent title/detail carry the meaning.
- **Hover-only no-op class.** `ContextHint.tsx:26` (shared, not this section) has `hover:text-foreground/60` matching its base `text-foreground/60` — a dead hover (no visual change); noted only because it's in the shared infra list.
- **Magic-number layout coupling.** The left accent rail is pinned with `top-[230px]` to match the hardcoded 230px hero zone height (`SecurityVaultPillars.tsx:76,136`); changing one silently desyncs the rail.
- **Lazy + SSR-off.** `ssr: false` means the section is client-only; the always-rendered `StageSection id="security"` keeps the anchor working for the scroll-map before hydration.

## Related docs
- [Observability Deck](observability-deck.md)
- [Security & compliance page](../content/security.md)
- [Feature index](../INDEX.md)
