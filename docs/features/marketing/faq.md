# FAQ
> Accordion FAQ section with a two-column card grid, per-item SVG illustrations, and a Discord support CTA. · **Route:** `/` (homepage section) · **Status:** Live

## What it does

Answers common pre-install questions (Claude CLI requirement, telemetry, pricing, BYOI, local vs. cloud, agent limits) in an expandable accordion, then funnels anyone still stuck to the Discord community.

- Renders a centered header ("Frequently *asked*", gradient on the second word) and subtitle.
- Lays the questions out in a **two-column grid** (`md+`); each question is a collapsed card. Clicking a card toggles a panel that reveals a per-question **illustration** (an `aspect-video` SVG) above the answer text. The chevron rotates 180° when open.
- Each card opens/closes independently — there is no single-open ("accordion") constraint; multiple panels can be open at once.
- Closes with a **Discord CTA** card ("Still have questions?" + "Join Discord" button) linking to the community invite.

All copy (heading, subtitle, every Q/A, CTA strings) comes from i18n. Illustrations are local SVG components mapped by position, not by content — see gotchas.

## How it works

`FAQ()` (`src/components/sections/FAQ.tsx:87`) pulls `t.faqSection` from `useTranslation()` and builds a `FAQItem[]` by mapping each `questions[i]` to `{ question, answer, illustration }`, where `illustration = FAQ_ILLUSTRATIONS_BY_POSITION[i] ?? FALLBACK_ILLUSTRATION` (`FAQ.tsx:92`). It splits the list at `Math.ceil(len/2)` into `leftColumn`/`rightColumn` and renders each into a `space-y-4` column inside an `md:grid-cols-2` grid.

Each `FAQCard` (`FAQ.tsx:16`) owns its own `open` boolean (`useState`). The trigger is a `<button>` with `aria-expanded` / `aria-controls`; the panel is a `motion.div` with `role="region"` + `aria-labelledby`, animated open/closed via `AnimatePresence` (`initial={false}`) using `height: 0 → auto` and `opacity`. The chevron is a separate `motion.div` rotating on `TRANSITION_FAST`.

**Roving keyboard navigation.** `FAQ` keeps a `buttonRefs` array (`FAQ.tsx:100`) and a `handleKeyDown(index)` handler (`FAQ.tsx:109`) that moves focus with arrow keys, branching on `useIsMobile()`:
- **Mobile (single stacked column, `<md`):** Up/Down wrap through all items in reading order; Home/End jump to first/last.
- **Desktop (two columns, `md+`):** Up/Down stay *within* a column (wrap at column ends); Left/Right cross between columns; Home/End jump to column start/end. This keeps focus order matching the on-screen spatial layout instead of the DOM order.

Section motion comes from `SectionWrapper` (`whileInView` `staggerContainer`, `once: true`); cards and header/CTA are `fadeUp` children. The `<section id="faq">` is labelled by the header's `id="faq-heading"` via `aria-labelledby`.

## Key files

| File | Role |
| --- | --- |
| `src/components/sections/FAQ.tsx` | Section root: i18n→`FAQItem[]` mapping, column split, roving keyboard nav, `FAQCard` accordion. |
| `src/components/sections/faq/FAQHeader.tsx` | Centered heading (`GradientText` on the gradient word) + subtitle; owns `id="faq-heading"`. |
| `src/components/sections/faq/FAQDiscordCTA.tsx` | "Still have questions?" card with `DiscordIcon` and an external link to `DISCORD_INVITE_URL`. |
| `src/components/sections/faq/faqIllustrations.tsx` | `FAQItem` type, `FAQ_ILLUSTRATIONS_BY_POSITION` array, `FALLBACK_ILLUSTRATION`, and `warnOnFaqIllustrationDrift()`. |
| `src/components/illustrations/*Illustration.tsx` | The six static SVG illustrations (Terminal, Shield, Pricing, CloudInfra, LocalCloud, AgentGrid). |
| `src/i18n/en.ts` (`faqSection`, line ~1307) | Source of truth for all copy: `heading`, `headingGradient`, `subtitle`, `questions[]`, and CTA strings. |

## Data & state
- **Source:** `t.faqSection` from `useTranslation()` — `heading`, `headingGradient`, `subtitle`, `questions: {q,a}[]`, `stillQuestions`, `discordSubtitle`, `joinDiscord` (interface at `src/i18n/en.ts:170`, en values at `:1307`). **Stores:** none (no Zustand). **API routes:** none — fully static. **Types:** `FAQItem` (`faqIllustrations.tsx:9`); translation shape `Translations.faqSection`.
- **Local state:** per-card `open: boolean`; `buttonRefs` ref array for focus; `useIsMobile()` (matchMedia, `<768px`) selects the keyboard-nav mode.
- **Constants:** `DISCORD_INVITE_URL` (`src/lib/constants.ts:36`) = `NEXT_PUBLIC_DISCORD_INVITE_URL` env or `https://discord.gg/personas` fallback.

## Integration points
- **i18n lockstep:** adding/removing a FAQ requires editing `questions[]` in all 14 locales (the array length is the shape) **and** updating `FAQ_ILLUSTRATIONS_BY_POSITION` to keep counts aligned.
- **Discord:** the CTA link target is shared via `DISCORD_INVITE_URL`; overridable per-deploy through env.
- **Illustrations:** reuses the shared `src/components/illustrations/` SVGs (also used elsewhere on the marketing site).
- **Animation primitives:** `fadeUp`, `staggerContainer`, `TRANSITION_FAST`, `TRANSITION_NORMAL` from `src/lib/animations.ts`; `SectionWrapper` for the in-view reveal.

## Conventions & gotchas
- **Illustration↔question coupling is positional, not semantic.** `FAQ_ILLUSTRATIONS_BY_POSITION` (`faqIllustrations.tsx:15`) maps array *index* → SVG. Reorder or insert a question and the illustrations silently shift out of sync with the copy (e.g. the pricing SVG lands on a non-pricing answer). `warnOnFaqIllustrationDrift()` (`faqIllustrations.tsx:26`) only `console.warn`s on a **count mismatch** in non-production — it cannot catch a reorder, and a too-short list just falls back to the Terminal SVG with no warning.
- **a11y — illustrations have no accessible name.** The SVGs are decorative but carry no `role="img"`/`aria-label` *and* no `aria-hidden="true"`, so screen readers may surface their raw `<text>` content (e.g. "$ claude --version", "✓ 3 agents running") inside the answer region with no context. Consider `aria-hidden` on the illustration wrapper (`FAQ.tsx:71-75`).
- **a11y — panel is a sibling of its trigger, not a child group.** Each card is a standalone disclosure (`aria-expanded`/`aria-controls` on the button, `role="region"`/`aria-labelledby` on the panel). There is no `role="list"`/listitem or a single accordion group, so this reads as N independent disclosures, not a grouped accordion — intentional, but note it if changing semantics.
- **a11y — keyboard nav is custom and 2D.** Arrow-key focus movement is hand-rolled (`FAQ.tsx:109`) and *branches on viewport width* via `useIsMobile()`. The desktop Left/Right cross-column logic assumes exactly the `Math.ceil(len/2)` split; changing the column split or grid breakpoint (`md:grid-cols-2` vs. the `768px` in `useIsMobile`) will desync focus order from layout. SSR snapshot of `useIsMobile` is `false` (desktop), so first paint uses the two-column key map.
- **No reduced-motion gate needed here.** The illustrations are static SVGs (no `requestAnimationFrame`/canvas), and card/section motion uses framer-motion `variants` + `SectionWrapper`, which the global pause/reduced-motion handling covers — so this section does not import `useReducedMotion` directly, and the `custom-animation/require-animation-gating` rule does not apply.
- **Semantic tokens throughout** (`border-glass`, `text-muted-dark`, `text-foreground/75`, `text-brand-purple`, `focus-visible:ring-brand-cyan/40`). The answer text uses `/75` opacity (above the `/60` WCAG-AA lint floor).

## Related docs
- [Get Started & Download CTA](get-started.md)
- [Footer](footer.md)
- [Feature index](../INDEX.md)
