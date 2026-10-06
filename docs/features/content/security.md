# Security & Compliance
> The `/security` marketing page: pillar grid, compliance rows, a vertical architecture data-flow diagram, and a security FAQ — all selling Personas' local-first privacy story. · **Route:** `/security` · **Status:** Live (static)

## What it does
Public-facing security & privacy page that argues "your agents run and your keys stay on your machine": agents and run history are stored locally, credentials never leave the machine, and prompts go only to the AI provider the user chooses (Claude by Anthropic), or nowhere with a local Ollama model. Do not reintroduce "your data never leaves your machine": agent prompts do leave it, for the model provider, and optional cloud sync (off by default) copies agents, runs and, behind their own opt-ins, notes and chats (with Athena and with the user's agents) to the user's Supabase rows. Five stacked sections (scroll-map nav: SECURITY → ARCHITECTURE → COMPLIANCE → FAQ → CTA):

- **Pillar grid** — four security pillars (Local-First Architecture, AES-256-GCM Credential Vault, Minimal, Anonymous Telemetry, Air-Gap Capable), each a card with icon, blurb, and a checklist of bullet details.
- **Architecture data-flow diagram** — a vertical stack of four layers (Your AI Provider → Personas Engine → Encrypted Vault → Your Machine), joined by animated SVG "pulse" connectors that travel up the chain; each layer card expands a detail line on hover.
- **Compliance rows** — six expandable rows (GDPR, HIPAA, SOC 2, Data Residency, Data Portability, Right to Erasure) inside a terminal panel, each tagged with a status pill (Simplified / N/A / Built-in) and a "what you don't need to worry about" checklist. A legend above maps each status color to its meaning.
- **Security FAQ** — five expandable Q&A accordion rows.
- **CTA** — "Download Free" link to `/#download`.

## How it works
`SecurityPage` (`src/app/security/page.tsx:30`) composes everything inside `PageShell` + `SectionWrapper`. All copy is **hardcoded English in JSX and data files** — this page does not use `useTranslation()` (see gotchas). Content lives in `src/data/security.ts` as four exported arrays; components map over them.

The page is a Client Component (`"use client"`, `page.tsx:1`) because every interactive child uses `useState`/framer-motion. `SectionWrapper` (`src/components/SectionWrapper.tsx:44`) provides the one-shot `whileInView` stagger reveal that drives the `fadeUp` variants on the headings and the pillar cards.

- **Pillar grid** — `SecurityPillarsGrid` (`src/app/security/security-page/SecurityPillarsGrid.tsx:9`) maps `SECURITY_PILLARS`. Icon names are strings in the data, resolved via a `PILLAR_ICONS` lookup (`SecurityPillarsGrid.tsx:7`) with a `Shield` fallback (`:13`). Per-pillar accent `color` is applied inline (icon tint, check marks). Cards inherit the `fadeUp` stagger from the parent `SectionWrapper`.
- **Architecture diagram** — `ArchitectureFlow` (`src/app/security/ArchitectureFlow.tsx:155`) calls `useReducedMotion()` once (`:156`) and threads the result down. It maps `ARCHITECTURE_LAYERS`, rendering a `PulseConnector` before every layer after the first (`:162`) and a `LayerCard` for each. `LayerCard` (`:94`) self-drives a `whileInView` opacity/translate reveal with a per-index stagger delay (`:113`), and tracks `hovered` state to expand a `LAYER_DETAILS` line (`ArchitectureFlow.tsx:7`) via `AnimatePresence`. Detail copy lives in the component (`LAYER_DETAILS`), separate from the short `description` in the data.
- **Compliance rows** — `ComplianceRow` (`src/app/security/security-page/ComplianceRow.tsx:25`) is an accordion `<button>` + `AnimatePresence` region. Status pill styling comes from `STATUS_STYLES` (`ComplianceRow.tsx:13`), which is also re-exported and consumed by `page.tsx:85` to render the legend above the panel. Unknown statuses fall back to `UNKNOWN_STATUS_STYLE` (`ComplianceRow.tsx:19`).
- **FAQ** — `SecurityFAQItem` (`src/app/security/security-page/SecurityFAQItem.tsx:5`) is the same accordion pattern over `SECURITY_FAQS`.
- **SEO** — `layout.tsx` sets page `metadata` and injects a `FAQPage` JSON-LD blob (`src/app/security/layout.tsx:17`) via `safeJsonLd`. The JSON-LD is **derived** from `SECURITY_FAQS` (`mainEntity: SECURITY_FAQS.map(...)`), the same list the accordion renders, so the structured data cannot drift from the page.

## Key files
| File | Role |
| --- | --- |
| `src/app/security/page.tsx` | Page composition: 5 sections, scroll-map, status legend, CTA |
| `src/app/security/layout.tsx` | `metadata` + `FAQPage` JSON-LD injection |
| `src/app/security/ArchitectureFlow.tsx` | Data-flow diagram: animated SVG pulse connectors + hover-expand layer cards; `useReducedMotion` gate |
| `src/app/security/security-page/SecurityPillarsGrid.tsx` | Four-pillar card grid; string→icon lookup |
| `src/app/security/security-page/ComplianceRow.tsx` | One expandable compliance row + exported `STATUS_STYLES` (also used by the legend) |
| `src/app/security/security-page/SecurityFAQItem.tsx` | One expandable FAQ accordion row |
| `src/data/security.ts` | All content: `SECURITY_PILLARS`, `COMPLIANCE_POINTS`, `ARCHITECTURE_LAYERS`, `SECURITY_FAQS` + their interfaces |

## Data & state
- **Source:** static arrays in `src/data/security.ts` (no fetch, no API). · **Stores:** none — local `useState` only (`open`/`hovered` per accordion/card). · **API routes:** none. · **Types:** `SecurityPillar`, `CompliancePoint` (+ `status: "simplified" | "not-applicable" | "built-in"`), `ArchitectureLayer`, `SecurityFAQ`, all in `src/data/security.ts:3-157`; `StatusStyle` is local to `ComplianceRow.tsx:7`. The JSON-LD FAQ array is a separate literal in `layout.tsx`.

## Integration points
- **`STATUS_STYLES`** is exported from `ComplianceRow.tsx` and imported by `page.tsx:18` to render the compliance status legend — keep label/color/meaning in sync with the rows.
- **CTA** links to `/#download` (homepage download anchor) — a cross-page route reference (`page.tsx:139`).
- **Scroll-map** anchors (`#security`, `#architecture`, `#compliance`, `#security-faq`, `#security-cta`) must match the `SectionWrapper id`s; `PageShell` consumes `scrollMapItems` for in-page nav.
- **`TerminalPanel`** (`@/components/primitives`) wraps the compliance and FAQ lists (`page.tsx:98,117`).
- **Shared primitives:** `GradientText`, `SectionHeading`, `SectionWrapper`, `PageShell`, `Navbar`, `Footer`, and the `fadeUp`/`staggerContainer` variants from `@/lib/animations`.

## Conventions & gotchas
- **i18n: NOT compliant.** This page violates the repo's hard i18n rule — every string is hardcoded English in JSX (`page.tsx`) and in `src/data/security.ts`, with no `useTranslation()` / `t.namespace.key` access and no `en.ts` keys. `LAYER_DETAILS` (`ArchitectureFlow.tsx:7`) and `STATUS_STYLES` meanings (`ComplianceRow.tsx:13`) are also hardcoded. If this page is meant to ship localized, it needs a full migration into `en.ts` + all 13 locales. Treat as a known debt, not a pattern to copy.
- **Reduced-motion gating:** `ArchitectureFlow`, `ComplianceRow`, and `SecurityFAQItem` all correctly import and honor `useReducedMotion`. When reduced, the SVG pulse `<rect>` + `<animateTransform>` is **not rendered at all** (`ArchitectureFlow.tsx:47`), layer cards mount fully visible (`:108`), and accordions skip the height animation (`duration: 0`). The static line (`:39`) always renders. Pillar grid has no rAF/canvas motion (only `fadeUp`), so no gate needed there.
- **One source of FAQ truth:** `SECURITY_FAQS` (data) drives both the visible accordion and `layout.tsx`'s `FAQPage` JSON-LD. Edit the data, not the layout. (It used to be a hand-maintained duplicate.)
- **Layer detail copy is split:** short `description` lives in `ARCHITECTURE_LAYERS` (data), long hover `detail` lives in `LAYER_DETAILS` (component) keyed by `layer.name`. Renaming a layer silently drops its hover detail.
- **Claims that should map to real infra (verify before publishing):** the page asserts hard technical guarantees — "AES-256-GCM", "OS-native keyring (Windows DPAPI / macOS Keychain / Secure Enclave / Linux libsecret)", "minimal, anonymous telemetry", "air-gap capable", "Ollama/LM Studio local LLM", "40+ connectors", "no relay servers", "credentials never in plaintext". These are marketing copy in this repo, not derived from the orchestrator. Any change to the real desktop product's crypto/keyring/telemetry posture must be reflected here by hand.
- **Telemetry claim is sourced from the desktop (corrected 2026-10-05).** The page used to promise "Zero Telemetry … no crash reports … no phone-home behavior whatsoever". The desktop's release builds send Sentry error reports (Rust core + frontend) and anonymous usage signals (Release-Health sessions, `feature_visit`, `interaction`, `session_summary`, one-time `conversion` milestones with a random install id); PII is stripped and there are no traces or replays. Sources: `../personas/docs/devops/guide-error-reporting.md`, `src-tauri/src/main.rs` `sentry_options()`, `src/lib/sentry.ts`. The user switch (first-use consent checkbox + Settings > Account, `src/lib/telemetryPreference.ts`) gates only the **frontend** Sentry init and analytics (`src/main.tsx`); the Rust `sentry::init` does not read it, which is why the copy says native crash reports are "not covered by that switch yet". Re-check all three anchors before changing the pillar, the telemetry FAQ, `PrivacyPolicy.tsx`, or the landing FAQ / trust lines in `src/i18n/*.ts`.
- **Cloud sync qualifies the local-only claims (corrected 2026-10-06).** The page used to say execution logs are "never uploaded or synced", that Personas "has no cloud infrastructure", that uninstalling leaves "no cloud residue" and that nobody can view your agents remotely. Desktop cloud sync (shipped in v1.1.0, off by default; `src-tauri/src/cloud/sync/` in the desktop repo) copies agents incl. instructions and runs incl. input/output to the user's RLS-owned Supabase rows; notes and chats with Athena and with personas sync behind their own opt-ins (M19; persona chats since desktop `d059085817`); a paired phone can run/pause/resume/cancel and chat with Athena or with a persona that is not paused, with no desktop prompt (M17). The pillar, GDPR/HIPAA/SOC 2/Data Residency/Right to Erasure rows and three FAQs now say "with cloud sync off (the default)" or name the sync path; the full disclosure lives in the Privacy Policy (`legal.md`). Credentials never sync, so "your keys stay on your machine" stays true. The compliance rows still describe the default (sync off); re-check them if sync ever becomes default-on.
- **Provider list is Claude + Ollama.** The desktop's only CLI engine is Claude Code (`src-tauri/core/src/engine_kind.rs`) with Ollama/LiteLLM/Qwen as profile providers; the old "Anthropic, OpenAI, Google" list was wrong. Keep it in step with `/features` (`multi-provider-ai.md`).
- **Distinct from the homepage Security Vault showcase** — that is an animated marketing showcase component; this `/security` route is the static long-form page. Don't conflate the two.
- **Accessibility:** accordions use `aria-expanded`/`aria-controls` + `role="region"`/`aria-labelledby` (good); SVG connectors are `aria-hidden`. Sections carry `aria-label`s.

## Related docs
- [Security Vault (showcase)](../product-showcase/security-vault.md)
- [Legal & Policy](legal.md)
- [Feature index](../INDEX.md)
