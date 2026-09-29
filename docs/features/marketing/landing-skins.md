# Landing (skins)
> The home page's section stack and its footer-switchable looks: the site's own brand by default, plus the "Deck" and "Blueprint" identities from the brand contest · **Route:** `/` · **Status:** Live (Deck and Blueprint are explorations, hidden behind the footer switcher)

## What it does
`/` tells one story top to bottom: what a persona is, six ideas at a glance, five steps to a first agent, a week of runs that heal themselves, ten ways to wake an agent, a team, the always-on companion, why it runs on your machine, then compare, FAQ and download. Each section is built around a drawn, animated illustration in which the idea acts itself out (an agent appearing from a sentence, a failed run retrying and the Overseer writing a note, a gate that opens only when you approve).

The footer carries a small **Personas | Deck | Blueprint** switch (only on `/`). Personas is the site's own brand and follows all 11 site themes. **Deck** re-dresses the same page as warm plastic hardware with an amber display. **Blueprint** re-dresses it as an architect's drawing set (ink on vellum in light themes, white line on cyanotype in dark ones) and swaps the hero art and the six concept illustrations for plotted line drawings. The choice is remembered per browser. Deck and Blueprint are kept as explorations of possible brand directions; Personas is what every visitor sees first.

## How it works
**Composition.** `src/app/page.tsx` renders `LandingSkinScope > LandingHero + lazy sections`, then the site-styled `Pricing` and `FAQ` stage sections, then a second `LandingSkinScope` around `Download`. Below-the-fold landing sections are `next/dynamic({ ssr: false })` exports in `components/landing/lazy.tsx`, mounted by `LazyMount` when the reader approaches. Each ported section owns its address id (`personas`, `concepts`, `get-started`, `runs`, `triggers`, `team-canvas`, `companion`, `private`, `download`); the always-present wrapper carries the legacy alias id (`tools`, `playground`, `pipelines`, `vision`, `download-section`) that external links and the guided tour use. `lib/landing-address.ts` resolves both spellings and the previous landing's ids (`use-cases`, `playground-split`, ...). The tour's `data-tour-diagram` anchors (`tools`, `agent-mind`, `orchestration`, `platform`, `download`) sit on the equivalent new sections.

**Skin contract.** A skin is a token mapping. `stores/landingSkinStore.ts` (zustand `persist`, key `personas-landing-skin`) holds `default | deck | blueprint`; `LandingSkinScope` reads it after hydration (`useHydrated`) and sets `data-landing-skin` on its wrapper, so the server and the hydrating render always paint `default`. `styles/landing-skins.css` documents the rules and defines the unit (`--ln-u`, 1/144 of the width minus the scroll-map gutter, capped by height; 1/39 of the width on phones). Every landing component styles only with `--ln-*` tokens (`landing-skin-default.css` derives them from the site's semantic tokens; `-deck.css` and `-blueprint.css` hold literal values with a `.dark` variant each). No raw colours, no RGB triplets, sizes as `calc(N * var(--ln-u))`, `ln-` class prefix, reading text floored at 16px and everything else at 12px.

**Sections.** Each lives in `components/landing/<name>/` with an `index.tsx` default export, its own CSS, and copy in `t.landingNext.<name>`. Shared primitives are in `landing/shared/` (sprite, `LnKey*`, `LnLed`, `LnSectionHead`, `useAmbientLive`, `useTyper`, `useSeenOnce`). The six concept illustrations run on one engine (`concepts/useSequencer.ts`, `useConceptFigure.ts`, `ConceptFigure.tsx`): the first render is the finished frame, the figure plays once when it first scrolls into view, Replay plays it again, reduced motion keeps the finished frame, and ambient loops run only while on screen in a foreground tab.

**Skin-specific art.** Blueprint's hero is `hero/BlueprintCover.tsx` (the construction drawing of the mark) and its concepts are `concepts/blueprint/*` (chosen by `useLandingSkin()` in `concepts/index.tsx`); everything else is restyled by the `@ blueprint / <name>` blocks in `landing-skin-blueprint.css`.

## Key files
| File | Role |
| --- | --- |
| `src/app/page.tsx` | Composition root: scope, hero, lazy landing sections, Pricing/FAQ, download |
| `src/stores/landingSkinStore.ts` | Persisted skin id, validated on read |
| `src/components/landing/LandingSkinScope.tsx` | Sets `data-landing-skin`, mounts the sprite, exposes `useLandingSkin()` |
| `src/components/landing/LandingSkinSwitcher.tsx` | Footer radio group (renders only on `/`) |
| `src/styles/landing-skins.css` + `landing-skin-{default,deck,blueprint}.css` | Token contract and the three mappings |
| `src/components/landing/shared/*` | Sprite, keys, LEDs, section head, ambient/typer/seen-once hooks, base CSS |
| `src/components/landing/{hero,rack,concepts,setup,runs,triggers,team,companion,nocloud,download}/` | The sections |
| `src/components/landing/concepts/blueprint/*`, `hero/BlueprintCover.tsx`, `landing/blueprint/cover.css` | Blueprint-only artwork |
| `src/lib/landing-address.ts` | Address space: declared ids, aliases, arrival protocol |

## Data & state
- **Copy:** `t.landingNext.*` in `src/i18n/en.ts`, English only (registered in `PENDING_TRANSLATION`; the other 13 locales fall back to English until translated). Blueprint has its own `heroBlueprint` and `conceptsBlueprint` blocks.
- **State:** the skin store above; each section keeps its own local state (selected persona, run frame, trigger, ...). No API of its own: the download section reuses the existing release plan and waitlist hooks, the hero reuses `HeroClient`'s CTA wiring.
- **Persistence:** `localStorage["personas-landing-skin"]`.

## Integration points
- **Footer** mounts the switcher next to the site theme switcher (`sections/footer/FooterCopyright.tsx`).
- **Guided tour** targets the sections through `data-tour-diagram`; its narration still describes the previous visuals (see gotchas).
- **`/preview/<section>`** (dev only, 404 in production) still renders the previous landing's sections (`sections/lazy.tsx` exports are untouched).

## Conventions & gotchas
- The previous landing sections (`Hero`, `UseCases`, `PlaygroundSplit`, `GetStarted`, `OrchestrationHub`, `TeamCanvas`, `Companion`, `VisionGrid`, `DownloadCTA`) are no longer mounted on `/` but are kept (previewable in dev at `/preview/<section>`); `homepage-hero.md` describes them. `e2e/orchestration-hub.spec.ts` is skipped because the hub is mounted on no production page. Decide later whether to delete them.
- The new sections are not `data-stage` sections, so the one-section-per-viewport stage fit no longer covers `/` (Pricing and FAQ still do).
- The guided tour's home steps still speak about the old visuals; the narration and audio need a review pass.
- Pricing and FAQ keep the site styling and sit outside the skin scope; on Deck and Blueprint they read as a change of surface.
- Hardware wording (deck, cartridge, transport, LCD) was deliberately removed from all copy: the artwork is hardware-shaped, the words are about agents.
- The Deck contest prototype's "Kit" theme and design-language page were not ported.
