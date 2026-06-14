# Multi-Provider AI
> The two-engine AI-routing showcase: Claude as the primary agent runtime, Ollama for private/offline BYOM. · **Route:** `/features` (deep-dive section) · **Status:** Live

## What it does
Presents how Personas routes work across AI engines. The narrative is deliberately narrow: **Claude is the primary engine** Personas tunes and trusts, and **Ollama** is the optional bring-your-own-model path for private or offline runs. A code comment in the file states the intent plainly — "Personas runs on Claude Code (primary) and Ollama (optional BYOM)" (`src/components/feature-sections/MultiProviderAI.tsx:16`).

The section renders a centered heading + lead paragraph, then a two-card grid:
- **Claude card** (featured, orange): badged "Primary engine", lists three Claude models with effort tiers — Sonnet 4.6 (`default`), Opus 4.7 (`max`), Haiku 4.5 (`low`) — and notes a Claude Pro/Max subscription requirement (`src/components/feature-sections/MultiProviderAI.tsx:62-107`).
- **Ollama card** (emerald): badged "Bring your own model", four bullet selling points (offline, free/unlimited, per-agent routing, fallback engine) and a mock CLI line `ollama pull llama3.1 · point Personas → localhost:11434` (`src/components/feature-sections/MultiProviderAI.tsx:110-152`).

It is a presentational marketing section — no inputs, no live data, no model calls happen here.

## How it works
Pure presentational client component (`"use client"`). The three Claude models are a module-level `claudeModels` array (`src/components/feature-sections/MultiProviderAI.tsx:18-22`); the Ollama bullets are an inline string array mapped in JSX (`:135-145`). Everything else is static markup.

Motion is framer-motion variants only (no `requestAnimationFrame`, no canvas), so no `useReducedMotion` gating is required by the project's animation contract. The outer `SectionWrapper` drives a one-shot `whileInView` stagger reveal (`src/components/SectionWrapper.tsx:44-59`); inner blocks use `staggerContainer` + `fadeUp` for the heading/lead and `revealFromBelow` for the card grid (`src/components/feature-sections/MultiProviderAI.tsx:27-59`). Cards lift on hover via `whileHover={{ scale: 1.02 }}`.

On `/features` the section is code-split and scroll-gated: `LazyMultiProviderAI` wraps a dynamic import with `{ ssr: false }` and a `SectionSkeleton` fallback (`src/components/feature-sections/feature-lazy.tsx:29-33`), mounted inside a `LazyMount minHeight={760}` under a `StageSection id="multi-provider"` (`src/app/features/page.tsx:64-68`). The anchor id `multi-provider` is also a scroll-map target labeled "AI MODELS" (`src/app/features/page.tsx:24`).

## Key files
| File | Role |
| --- | --- |
| `src/components/feature-sections/MultiProviderAI.tsx` | The whole section — markup, `claudeModels` data, copy, motion |
| `src/app/features/page.tsx` | Mounts it under `StageSection#multi-provider`; defines the scroll-map entry |
| `src/components/feature-sections/feature-lazy.tsx` | `LazyMultiProviderAI` code-split wrapper (`ssr: false`) |
| `src/components/SectionWrapper.tsx` | Section shell + one-shot in-view stagger reveal |
| `src/components/SectionHeading.tsx`, `src/components/GradientText.tsx` | Heading scale + gradient brand text |
| `src/lib/animations.ts` | `fadeUp`, `staggerContainer`, `revealFromBelow` variants |

## Data & state
- **Source:** hardcoded in-component — `claudeModels` array (`:18-22`) and an inline Ollama bullet array (`:135-145`). **Stores:** none (no Zustand, no hooks beyond what `SectionWrapper` registers). **API routes:** none — nothing is fetched and no model is actually called. **Types:** none exported; the model objects are inferred inline.

## Integration points
- **Features page:** rendered via `LazyMultiProviderAI` → `LazyMount` → `StageSection` (`src/app/features/page.tsx:13,64-68`); scroll-map anchor `#multi-provider` (`:24`).
- **Lazy loader:** `createLazySection` / `SectionSkeleton` from `src/components/sections/LazySection` (`src/components/feature-sections/feature-lazy.tsx:3,29-33`).
- **Not on the homepage:** `src/app/page.tsx` does not reference this component or anchor (grep: no match). It is `/features`-only.

## Conventions & gotchas
- **Copy is fully HARDCODED English — not i18n.** The component never imports `useTranslation`; every string (heading, lead, card bodies, badges, bullets, model labels/descriptions, the subscription note, the CLI line) is a literal in JSX. This violates the project's non-negotiable i18n rule (CLAUDE.md §1: every user-facing string lives in `src/i18n/en.ts`). Translating this section means extracting ~20 strings into a new namespace and propagating to all 14 locales.
- **An orphaned i18n namespace already exists** for this feature but is unused and out of sync. `featurePages["multi-provider"]` is declared in the `Translations` interface (`src/i18n/en.ts:889`) with values at `:2059-2063` ("Not locked to one AI" / "Use Claude, OpenAI, Gemini, or run models locally with Ollama…"), and is mirrored across all 13 other locales (`src/i18n/*.ts:1040`). **Nothing in `src/` reads `featurePages`** (grep outside `i18n/` returns no matches), so this block is dead code. Worse, its messaging contradicts the live component: the i18n copy advertises **four** providers (Claude, OpenAI, Gemini, Ollama) with automatic failover, while the shipped component deliberately narrows the story to **two** engines (Claude + Ollama). Do not wire the component to this namespace as-is.
- **`public/imgs/features/multi-provider.png` exists on disk but is referenced nowhere** (grep for `multi-provider.png` across the repo returns no matches; the component renders no `<img>`/`next/image`). Likely a leftover asset — safe to ignore, candidate for cleanup.
- **No reduced-motion gating, and that's correct here:** only variant-based fades/transforms and a hover scale are used (no `requestAnimationFrame`/canvas), so `custom-animation/require-animation-gating` does not apply.
- **Provider claims are marketing, not runtime truth in this repo.** The dashboard is mock-only; this section describes the external orchestrator's behavior, not anything wired up in personas-web. Treat the model list and "fallback when Claude is unavailable" as copy, not config.
- **Lint watch:** several text utilities sit at `text-foreground/70`–`/85`, above the `/60` WCAG floor, so they pass `custom-a11y/no-low-text-opacity`. Keep new strings ≥ `/60`.

## Related docs
- [Memory Layers](memory-layers.md)
- [Design Engine](design-engine.md)
- [Feature index](../INDEX.md)
