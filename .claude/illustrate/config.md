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
