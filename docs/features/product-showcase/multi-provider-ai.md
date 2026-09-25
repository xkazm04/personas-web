# Multi-Provider AI
> "Router" illustration of the two-engine AI routing story: tasks of different weight go to the matching Claude model; the locked private task stays on your machine with Ollama. · **Route:** `/features` (deep-dive section) · **Status:** Live

## What it does
Presents how Personas routes work across AI engines. The narrative is deliberately narrow: **Claude is the primary engine**, and **Ollama** is the user-chosen path for private or offline runs. Under the heading "Powered by **Claude**. Private via **Ollama**." and the lede "Two engines, one consistent agent runtime.", one SVG shows a machine ("Local") holding a queue rail and a router, and a Claude box beside it with three stations — **Haiku**, **Sonnet**, **Opus**. Four task tokens of different sizes leave the rail in a deliberately mixed order: the heavy one docks at Opus, the light one at Haiku, the default one at Sonnet, and a **locked** token turns off to the **Ollama** station inside the machine. Each lane lights as it is used and its station ring swells on docking. A replay button in the corner re-plays it.

It is a presentational marketing section — no inputs, no live data, no model calls happen here.

## How it works
`MultiProviderAI.tsx` (default export `MultiProviderAIRouter`, an `/illustrate` "router" variant) is a `SectionWrapper(fit="fill", id="multi-provider")` with an intro (`data-section-intro` / `data-section-lede`) and a `data-stage-slot` holding the art frame. The heading is one template (`aiModelsSection.heading`) split on `{claude}` / `{ollama}`; those slots render as `GradientText` product names (`MultiProviderAI.tsx:19`, `:49-57`).

One framer `MotionValue` `p` (0..1) drives the whole drawing over `DURATION = 3.6`s (`:17`). It starts at `1` (every task docked) for the server render and first paint; `useInView(ref, { once: true, amount: 0.4 })` calls `play()` (reset to 0, `animate` to 1) once, and the replay button calls it again. Under still motion `play()` pins `p` to 1 instead.

`RouterArt` renders one `Layout` from `routerGeometry.ts`: `WIDE` (1000×440, `md:` and up) or `TALL` (mobile), both mounted with `hidden`/`md:hidden`. Each `Token` (`TOKENS`, `routerGeometry.ts:55-60`) has its own window (`start`, `TOKEN_SPAN = 0.4`); `tokenQ` maps `p` to the token's progress, `tokenAt` moves it along the rail then a cubic Bézier into its lane, `laneLit` lights the lane once it enters, and `dockPulse` swells the station ring near the end.

**Stage fit (desktop).** The frame is `data-stage-art` with `--art-ar: 1040/480` (the wide router plus its padding, `MultiProviderAI.tsx:67-69`), so on the stage (`src/styles/stage.css`) it is `min(100%, slot height × 1040/480)` wide — it fills a laptop's stage and grows on a monitor instead of staying a 1024px strip.

## Key files
| File | Role |
| --- | --- |
| `src/components/feature-sections/MultiProviderAI.tsx` | Section shell: templated heading, lede, progress value + in-view play, replay, stage slot/art frame |
| `src/components/feature-sections/multi-provider/RouterArt.tsx` | The SVG for one layout: machine + "Local" label, Claude box, rail, lanes, stations, tokens (lock icon on the private one), lane labels |
| `src/components/feature-sections/multi-provider/routerGeometry.ts` | `WIDE`/`TALL` layouts, `TOKENS`, `tokenQ`/`tokenAt`/`laneLit`/`dockPulse`/`laneD` |
| `src/app/features/page.tsx` | Mounts it under `StageSection#multi-provider`; defines the scroll-map entry |
| `src/components/feature-sections/feature-lazy.tsx` | `LazyMultiProviderAI` code-split wrapper (`ssr: false`) |
| `src/components/SectionWrapper.tsx` | Section shell (`fit` → `data-stage`) |
| `src/components/SectionHeading.tsx`, `src/components/GradientText.tsx` | Heading scale + gradient brand text |

## Data & state
- **Source:** static — geometry and tokens in `routerGeometry.ts`; copy in the `aiModelsSection` namespace of `src/i18n/en.ts` (`heading` template, `lede`, `artLabel`, `replay`, `local`). **Stores:** none. **API routes:** none — nothing is fetched and no model is actually called. **Types:** `LaneKey`, `Lane`, `Layout`, `Token` exported from `routerGeometry.ts`.

## Integration points
- **Features page:** rendered via `LazyMultiProviderAI` → `LazyMount minHeight={760}` → `StageSection id="multi-provider"` (`src/app/features/page.tsx:84-88`); scroll-map anchor `#multi-provider`, labelled "AI MODELS" (`:46`).
- **Lazy loader:** `createLazySection` / `SectionSkeleton` from `src/components/sections/LazySection` (`src/components/feature-sections/feature-lazy.tsx:3,29-33`).
- **Not on the homepage:** `/features`-only.

## Conventions & gotchas
- **i18n — migrated, English-only for now.** All copy lives in `t.aiModelsSection` (`MultiProviderAI.tsx` and `RouterArt.tsx`). Product/model names (`Claude`, `Ollama`, `Haiku`, `Sonnet`, `Opus`) stay literals on purpose. `aiModelsSection` is listed in `PENDING_TRANSLATION` in `en.ts`, so the 13 other locales fall back to English until it is translated.
- **An orphaned i18n namespace still exists** and contradicts the section. `featurePages["multi-provider"]` (`src/i18n/en.ts:1335` interface, `:3804` values: "Not locked to one AI" / "Use Claude, OpenAI, Gemini, or run models locally with Ollama… automatically switch…") is mirrored across all locales but **nothing in `src/` outside `i18n/` reads `featurePages`**. It advertises four providers with automatic failover; the shipped art tells the two-engine story, and `RouterArt.tsx:19-20` notes Ollama is a user-chosen lane, not an automatic fallback (the app's failover chain is Claude-only). Do not wire the component to that namespace as-is.
- **Animation gating — followed.** `useStillMotion` (`MultiProviderAI.tsx:24`) pins `p` to 1; the drawing's DOM shape never changes. One-shot, not an ambient loop.
- **Colour tokens.** Claude is drawn in `text-orange-500 dark:text-orange-400` and Ollama in `text-emerald-600 dark:text-emerald-400` (raw Tailwind palette, `RouterArt.tsx:22-24`) rather than brand tokens; the frame uses `border-glass` with a `bg-white/[0.02]` fill.
- **Provider claims are marketing, not runtime truth in this repo.** The dashboard is mock-only; this section describes the desktop app's behaviour, not anything wired up in personas-web.
- **Lint watch:** the replay button sits at `text-foreground/60`, exactly the WCAG floor for `custom-a11y/no-low-text-opacity`. Keep new strings ≥ `/60`.

## Related docs
- [Memory Layers](memory-layers.md)
- [Design Engine](design-engine.md)
- [Feature index](../INDEX.md)
