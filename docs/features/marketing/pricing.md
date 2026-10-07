# Pricing
> "Personas is free" section: one diagram of who you pay for an agent run · **Route:** `/` homepage section (`#pricing`, nav label "Compare") · **Status:** Live

## What it does
The section a reader reaches under the "Compare" / Pricing anchor on the homepage. It states the offer plainly: **Personas itself is free** (MIT source, every feature, no account or licence key), and the **only bill is the user's own Claude Pro or Max plan, paid to Anthropic**, because agents run through Claude Code on that plan. A wide diagram ("bill") shows one agent run leaving Personas on your computer, passing the Claude Code CLI and reaching Claude at Anthropic; Personas carries a "$0, MIT licence" tag, and the only payment line runs from "Your Claude Pro or Max plan" to Anthropic. Four beat captions (Run starts / On your plan / Claude works / No bill from Personas) play once when in view, with a replay button. A "Get started free" download CTA sits under the diagram.

History: the section used to be an offer band plus six feature-group cards ("Everything is free"). It was replaced on 2026-09-26 by the owner's pick from the /illustrate round 3 ("bill"), without that round's per-run API-price chip (the only thing paid is the user's plan). "Everything is free" over-claimed: a Claude plan is required. There is no local-model (Ollama) path in the shipping app, so the section claims none.

## How it works
`Pricing` (`index.tsx`) renders `SectionWrapper fit="fill" aria-labelledby="compare-heading"` (no id - see gotchas) with a `SectionIntro id="compare-heading"`, one `data-stage-slot` holding the art in a `data-stage-art` box (`--art-ar` = the WIDE layout's 1000/400, max 1000px wide, never taller than the stage slot - `src/styles/stage.css`), and the CTA. The art is `BillArt.tsx`, drawn twice from `billGeometry.ts` (`WIDE` for md+, `TALL` for phones; one is hidden by CSS). Motion is one progress value from `usePlayOnce.ts` (rests at 1 on the server and under reduced motion via `useStillMotion`; plays once in view; replay button). `BillParts.tsx` holds the node, legend, coin, run dot and beat-caption primitives.

## Key files
| File | Role |
| --- | --- |
| `src/components/sections/pricing/index.tsx` | Section: SectionIntro, stage slot with the diagram + replay, download CTA |
| `src/components/sections/pricing/BillArt.tsx` | The "bill" diagram (SVG), words from `pricingSectionCopy` |
| `src/components/sections/pricing/billGeometry.ts` | WIDE / TALL layouts, beat timing (`BEAT_START`), path helpers |
| `src/components/sections/pricing/BillParts.tsx` | Diagram primitives (Node, Legend, Coin, RunDot, WorkPulse, BeatCaption) |
| `src/components/sections/pricing/usePlayOnce.ts` | Play-once progress value with replay, reduced-motion aware |
| `src/i18n/pending/pricingSection.ts` | `pricingSectionCopy` (pending translation: heading, lede, art labels, beats); CTA label still from `compareSection.ctaLabel` |
| `src/components/sections/lazy.tsx` | `LazyPricing` + `PricingSkeleton` (heading, lede, one wide box, CTA) |
| `src/app/page.tsx` | Mounts `LazyPricing` in the homepage section list (`wrapperId: "pricing"`) |

## Data & state
- **Source:** fully static. **Stores:** none. CTA href is `ctaHref(DOWNLOAD_PLAN)` from the release authority `src/lib/release.ts`; the click reports `download_click` with `placement: "pricing"` via `trackDownloadClick` (`src/lib/analytics.ts`). Both are asserted against `index.tsx` by source-scan tests (`analytics.download-click.test.ts`, `release.test.ts`).
- **Copy:** `pricingSectionCopy` is a pending module in `src/i18n/pending/` (English only by owner decision, 2026-09-25; the other locales fall back to English at runtime). Most of `t.compareSection` (offer badges, groups) is now unused - left for a dead-key pass.

## Integration points
- **Stage system** (`src/styles/stage.css`): `fit="fill"`, `data-stage-slot`, `data-stage-art`; one stage high at every desktop size (`e2e/stage-fit.spec.ts`).
- **`PrimaryCTA`** + lucide `Download` - the CTA.
- **`SCROLL_MAP_SECTIONS`** (`src/lib/constants.ts`) - `#pricing` anchor labelled "Compare"; nav `t.nav.pricing` links here.

## Conventions & gotchas
- **Fidelity:** draw only what the app does. Facts behind the diagram (desktop app): Claude Code CLI is the only engine (`engine_kind.rs`); runs use the user's subscription (`cli_process.rs` strips API-key env); MIT `LICENSE`; native Ollama is deferred and not shipping (`src-tauri/engine/src/ollama.rs`). Starter/Team/Builder in the app are UI modes, not price tiers - never draw tiers.
- **Anchor is load-bearing, and the page wrapper owns it:** `id="pricing"` is rendered once, by the always-present stage wrapper in `src/app/page.tsx`; the section carries no id. `/#pricing` resolves through `LABELLED_INNER` in `src/lib/landing-address.ts` to `[data-scroll-anchor="pricing"] [aria-labelledby="compare-heading"]`; `landing-address.test.ts` pins `<SectionWrapper ... aria-labelledby="compare-heading">` and `<SectionIntro id="compare-heading"` in `index.tsx` by regex - keep both in that file.
- **Animation gating:** transform/opacity only, play once, no loops; resting state is the resolved end state.

## Related docs
- [Features Overview](features-overview.md)
- [Feature index](../INDEX.md)
