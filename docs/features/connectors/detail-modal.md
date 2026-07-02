# Connector Detail Modal
> Per-connector detail overlay showing capabilities, a fake terminal "live preview", and a setup CTA, opened by clicking a card in the connectors catalog · **Route:** modal (opened from `/connections`) · **Status:** Live

## What it does
Clicking any connector card on `/connections` opens a centered modal over a blurred backdrop. It shows the connector's logo, label, category, auth type, and summary; a numbered "What you can do" list of its use cases (each with a copyable-looking CLI `command`); and a "Try it now" toggle that reveals a simulated terminal streaming a plausible run of the first use case. The connector's brand `color` tints every accent (border glow, badges, terminal cursor, success lines). Close via the X button, the Escape key, or clicking the backdrop. The open connector is reflected in the URL (`?connector=<name>`), so a detail view is shareable/deep-linkable and survives reload.

## How it works
`ConnectorModal` (`index.tsx`) is a controlled component: it renders nothing when `connector` is `null` and the overlay when a `Connector` is passed. The parent page owns the open/close state. `AnimatePresence` wraps a backdrop `motion.div` (fade) and a content `motion.div` (spring scale+slide); `onClick={onClose}` on the backdrop plus `e.stopPropagation()` on the content gives click-outside-to-close.

State lives in `index.tsx`: `showSimulator` (try-it toggle) and `simKey` (a counter that force-remounts the terminal). When the `connector` prop changes, a render-phase prev-state guard (`index.tsx:23-27`, the CLAUDE.md React 19 pattern) resets `showSimulator` to `false` and bumps `simKey` so the previous connector's simulator never bleeds into the next. Escape is handled by a `keydown` listener (`index.tsx:36-39`); body scroll is locked via the counted `lockBodyScroll`/`unlockBodyScroll` util on mount and released on unmount (`index.tsx:41-47`).

Composition (top to bottom): `ConnectorModalHeader` → divider → `UseCaseList` → divider → `TryItToggle`. The header (`ConnectorModalHeader.tsx`) loads `/tools/<icon>.svg` via `next/image` and falls back to the connector `monogram` on error, with its own prev-state reset of `imgError` so a missing icon on one connector doesn't latch the fallback for the rest (`ConnectorModalHeader.tsx:17-21`). `UseCaseList` maps `connector.useCases` to numbered cards. `TryItToggle` is a single full-width button with an animated pill switch; toggling on bumps `simKey` again and expands an `AnimatePresence` height animation that mounts `TerminalSimulator`.

`TerminalSimulator` (`TerminalSimulator.tsx`) fakes a CLI run: `generateSimOutput(connector)` builds ~7 timestamped lines from `useCases[0].command`/`title`/`label`, and an effect schedules `setTimeout`s (delays 0→3800 ms) to append each line, auto-scrolling the container and blinking a brand-colored cursor until the last line lands. Command lines, the "All done!" success line, and the "Finished" line get special styling.

## Key files
| File | Role |
| --- | --- |
| `src/components/sections/connector-modal/index.tsx` | Modal shell: AnimatePresence, backdrop/content, Escape + scroll-lock, connector-change reset, composition |
| `src/components/sections/connector-modal/components/ConnectorModalHeader.tsx` | Logo (SVG→monogram fallback), label, category badge, auth-type badge, summary |
| `src/components/sections/connector-modal/components/UseCaseList.tsx` | "What you can do" numbered cards with title/description/`command` code line |
| `src/components/sections/connector-modal/components/TryItToggle.tsx` | "Try it now" pill toggle + height-animated reveal that mounts the simulator |
| `src/components/sections/connector-modal/components/TerminalSimulator.tsx` | Fake streaming terminal: timed `setTimeout` line append, auto-scroll, blinking cursor (blink gated on `useReducedMotion` — static block when reduced) |
| `src/components/sections/connector-modal/components/SetupCTA.tsx` | **Orphaned** — 3-step setup strip + "Set up … in Personas" link to `/#download` (not imported anywhere) |
| `src/components/sections/connector-modal/components/CopyButton.tsx` | **Orphaned here** — clipboard button w/ legacy fallback; the modal does not use it (the catalog's copy is a different component) |
| `src/lib/bodyScrollLock.ts` | Counted, HMR-safe `lockBodyScroll`/`unlockBodyScroll` used by the shell |
| `src/data/connectors.ts` | `Connector` / `ConnectorUseCase` types, `categories`, and the static connector list |
| `src/app/connections/page.tsx` | Owns `selectedConnector` (URL-synced) and renders `<ConnectorModal>` |

## Data & state
- **Source:** static — the entire connector dataset is the hand/generated `connectors` array in `src/data/connectors.ts`; the terminal output is fabricated client-side from `useCases[0]`. No live data, no orchestrator call. **Stores:** none (no Zustand). Open/close state is `selectedConnector` in `connections/page.tsx`, seeded from and written back to the `?connector=` URL param via `useParsedSearchParamState` + a `history.replaceState` effect (`page.tsx:26-38`). Modal-internal state (`showSimulator`, `simKey`, `imgError`) is local `useState`. **API routes:** none. **Types:** `Connector`, `ConnectorUseCase`, `ConnectorCategory` (`src/data/connectors.ts`).

## Integration points
- **Sole opener:** `ConnectionsCatalog` → `ConnectorCard` `onClick` → `onConnectorClick(c)` → `setSelectedConnector(c)` in `page.tsx:40-45`. Despite the brief's question, the use-cases marketing section does **not** open this modal — `connections/page.tsx` is the only mount site in `src/`.
- **Deep-linking:** `?connector=<name>` is parsed back to a `Connector` on load, so the modal can open from a shared URL; closing clears the param.
- **Setup link target:** `SetupCTA` (if wired) would link to `/#download`. As shipped, the modal has no setup CTA rendered — see gotcha.
- Depends on `/public/tools/<icon|name>.svg` assets for logos and on `bodyScrollLock` (shared with other overlays — the counted lock prevents premature unlock when stacked).

## Conventions & gotchas
- **`SetupCTA` and `CopyButton` are dead code in this folder.** `index.tsx` imports only `ConnectorModalHeader`, `UseCaseList`, and `TryItToggle`. `SetupCTA` is imported nowhere (grep confirms), so the documented "setup CTA" is **not actually on screen** — the modal ends at the try-it toggle. `CopyButton` here is also unused; the catalog/guide use a *different* `CopyButton` (`src/components/guide/blocks/CopyButton.tsx`). The use-case `command`s render as plain `<code>` with **no copy button**, so the "copy buttons" feature is effectively absent in the live modal. Wiring `SetupCTA`/`CopyButton` back in (or deleting them) is a real cleanup task.
- **No i18n — all copy is hardcoded English.** "What you can do", "Try it now", "See a preview of how this connector works", "Live preview", "Connects via …", the `aria-label`s ("Close connector details"), and every `SetupCTA`/`CopyButton` string bypass `useTranslation()`/`t.*`. This violates CLAUDE.md §1; a localization pass must lift them into `src/i18n/en.ts` + all 13 other locales.
- **Reduced motion is NOT gated.** No component imports `useReducedMotion`. The backdrop fade, content spring, per-line entrance, the **infinitely repeating** cursor blink (`TerminalSimulator.tsx:85-90`), and the toggle pill spring all run regardless of `prefers-reduced-motion`. The `custom-animation/require-animation-gating` lint rule only flags `requestAnimationFrame`/`cancelAnimationFrame`, so these `setTimeout`/framer-motion loops slip past it silently. A motion-sensitive user still sees the full animation.
- **No focus trap and no focus restore.** The modal locks scroll and handles Escape, but Tab focus can leave the dialog into the page behind it, focus is not moved into the modal on open, and nothing returns focus to the originating card on close. The wrapper is also a `motion.div` with no `role="dialog"`/`aria-modal`/`aria-labelledby`. This is the biggest a11y gap — screen-reader and keyboard-only users are not contained.
- **Raw color hex everywhere (by design, but note it).** `connector.color` is interpolated into inline `style` (`${color}60`, `${color}15`, etc.) for glows/badges/cursor. This is intentional brand tinting from data, not a semantic-token violation — but it's why these components can't be themed via Tailwind tokens alone.
- **`bg-black/70`, `text-white`, low-opacity whites.** The backdrop and several elements use raw `bg-black/70`, `text-white`, and `white/[0.02–0.08]` utilities instead of semantic tokens (`bg-background`, `text-foreground`), brushing against CLAUDE.md §2. `text-white/60` in `SetupCTA` sits exactly at the WCAG `/60` floor.
- **React 19 purity is respected.** `new Date()` in `generateSimOutput` runs inside the `useEffect`, not in render or a `useMemo` factory (`TerminalSimulator.tsx:8-25`); the connector-change and `imgError` resets use the prev-state-in-render pattern, not `setState` in an effect. Keep impurities out of render if you touch these.
- **`simKey` is load-bearing.** It remounts `TerminalSimulator` so the timed sequence restarts cleanly on every toggle-on and on connector switch; the keys `sim-${simKey}`/`terminal-${simKey}` both depend on it. Don't drop it when refactoring the toggle.
- **`useCases` is a non-empty tuple** (`[ConnectorUseCase, ...ConnectorUseCase[]]`), so `useCases[0]` is always safe — the simulator and try-it copy rely on that guarantee.

## Related docs
- [Connectors Catalog](catalog.md)
- [Feature index](../INDEX.md)
