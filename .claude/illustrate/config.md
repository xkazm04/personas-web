# /illustrate overlay - personas-web

Read by the registry skill `illustrate` at start. Every key is optional.

- design_doc: .claude/design.md (dashboard system; the landing reuses its tokens)
- tokens: src/app/globals.css, src/styles/themes.css, src/lib/brand-theme.ts, src/lib/typography.ts
- source_app: C:/Users/mkdol/dolla/personas (the desktop app the site sells; its real screens are the "app style" reference for product-true variants)
- motion_lib: framer-motion; read reduced motion through src/hooks/useStillMotion.ts (SSR-safe, live), never framer's useReducedMotion
- switcher: adapt the skill template to the landing's glass tokens (see src/components/sections/event-bus-showcase/components/VariantTabs.tsx for the existing pill style)
- switcher_visibility: always (prototype branch only; consolidation removes it)
- variants: 3
- dev_url: http://localhost:3918
- gates: npm run typecheck, npm run lint, npx vitest run
- worktree_root: C:/t/ (short paths; the default under .claude/worktrees/ is too deep for Windows)

## Run log

- 2026-09-24 landing round 1 (branch illustrate/landing): hero, vision grid, use-cases,
  3 directions each (hero: persona-card, contact-sheet, night-shift; vision:
  real-surfaces, layer-stack, real-nouns; use-cases: persona-card, sigil-core,
  job-matrix). Gates green (tsc, eslint on touched dirs, vitest 239/239). Capture: 12
  tabs x 2 widths x 2 motion preferences, 0 blank, 0 infinite animations under reduced
  motion (current hero runs 4 loops and current use-cases 1; every variant runs 0).
  Owner decision pending.
- 2026-09-24 owner decision on round 1: hero keeps CURRENT (the abstract ring), use-cases
  takes PERSONA-CARD, platform takes LAYER-STACK; all other variants and the switcher
  deleted. Owner's verdict on the round as a whole: the variants overflowed with
  descriptive text; the goal is an abstracted idea carried by illustration and
  animation, with a dominant visual structure and text labels only as support.
- 2026-09-25 /features round 1 under 1.1.x (picture first): security (sealed-device,
  nested-vault, vault-silhouette), AI models (router, two-sockets, effort-dial), memory
  (sediment, constellation, run-twice). Text inside the art: 4-6 words per variant, runs
  of 1-2 words, 1-5% of the area, against 139-197 words and 19-30 word runs in the
  current sections. Gates green (tsc, eslint, vitest 547/547); 0 blank, 0 loops under
  reduced motion. Owner decision pending.
