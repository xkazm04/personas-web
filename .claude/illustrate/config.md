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
- stage: sections use the desktop stage system (src/styles/stage.css). A `data-stage-slot` gives the art its MAXIMUM box, not its size: size the art to its content and centre it; never scale a picture up to fill a full-screen slot. Worktree dev servers need `next dev --webpack` (Turbopack rejects the junctioned node_modules).

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
- 2026-09-25 owner decision on the /features round: memory takes RUN-TWICE, AI models
  take ROUTER, security takes NESTED-VAULT; all other variants, the current versions,
  their orphaned helpers and the switcher deleted. All three winners came from the
  picture-first (1.1.x) round.
- 2026-09-25 revamp round (1.1.1, built into the stage-fit slot): team canvas, get
  started, pricing (landing) and healing, lab (/features), three directions each.
  Owner decision: ALL DISCARDED - "huge illustrations representing very little,
  cutting all text leading into no idea what is meant behind. Balancing of
  visual/text part was not successful, so sizing and fidelity of the visual side."
  Branches illustrate/landing-r2 and illustrate/features-r2 deleted. The director's
  brief contributed (art to fill the slot, lede shortened, eyebrow dropped). Skill
  reworked to 1.2.0 (balance, size to content, cold-read and competitor-swap tests,
  SPARSE/TINY-LABELS/TEXT-THIN flags) on registry branch skills/illustrate-balance.
  Keep from the round: builders' source-app checks found the CURRENT team canvas
  (sequential line; the app runs steps in parallel), healing (provider switch and a
  47ms figure it never shows), lab (six-axis radar; the app scores one composite) and
  pricing (UI modes are not price tiers) misrepresent the product.
- 2026-09-25 round 3 under 1.2.0 (after the owner discarded round 2): landing on
  `illustrate/landing-r3` - team-canvas (relay, missions, roster), get-started (handoff,
  first-run, setup-map), pricing (bill, spend, download); /features on
  `illustrate/features-r3` - healing (remedies, run-card, overnight), lab (head-to-head,
  ratings, anatomy). One builder per section. No instrument flags on any variant
  (58-82 words per section, labels 12-18px, 3-42% empty, one stage at 1366x657 and
  1920x960). Cold read by 5 fresh reviewers (each saw 3 variants from different
  sections, switcher hidden): pricing/download 5/5; relay, missions, roster, handoff,
  setup-map, bill, remedies, run-card, overnight 4/5; first-run, spend, head-to-head,
  ratings, anatomy 3/5 - the product-screen variants carried the app's jargon. Builder
  found native Ollama DEFERRED in the app: the live AI-models router ("Private via
  Ollama") and the pricing "BYOM - Claude or local Ollama" bullet over-claim. Review
  page: C:/t/illustrate-r3/review/index.html. Owner decision pending.
