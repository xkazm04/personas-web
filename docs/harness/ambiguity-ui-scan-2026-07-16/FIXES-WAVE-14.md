# Fix Wave 14 — Medium/Low tail: accessibility cluster

> 3 commits, 15 findings closed (14 Medium + 1 Low), the largest coherent Medium/Low cluster.
> Baseline preserved: tsc 0 → 0 · vitest 71/71 · 0 regressions. Branch `vibeman/medlow-a11y`.
> Executed by 3 parallel edit-only subagents (disjoint files); orchestrator gated + committed centrally.

## Triage that led here

The 146 Medium/Low findings don't cluster by the agents' (139 near-unique) category slugs. Re-clustered by title keyword: **a11y ≈ 24** (largest), magic-number/clarity ≈ 19 (mostly "add a comment"), i18n-hardcoded ≈ 16, dead/unwired ≈ 8, loading/error ≈ 7, context-map-drift ≈ 6, duplicate-SoT ≈ 5, responsive ≈ 5, plus ~53 diverse singletons. The a11y cluster is the highest value-per-fix (concrete WCAG wins, low risk, no product decisions), so it went first.

## Commits

| # | Commit | Findings | Surface |
|---|---|---|---|
| 1 | `473111d` | animation-motion #5, auth-user-session #3, conversion #5, templates #4, why-agents #4 | marketing sections |
| 2 | `891301a` | agents-management #4, dashboard-home #4, messages #3, manual-review #5, public-roadmap #4 | dashboard |
| 3 | `535839d` | guide-pages-nav #3, layout-nav #5, shared-ui #4, shared-types #2, observability-charts #5 | guide + shared primitives |

## Highlights

- **Non-color state**: ScrollMap (`aria-current`+bold), RoleSelector (aria-pressed + Check icon), heatmap cells (role=img + aria-labels + sr-only totals), Sparkline (role=img summary), RoadmapProgress (role=progressbar).
- **Keyboard/roles**: ReviewRow click-div → real button; footer column toggle → button w/ aria-expanded; AgentCard disclosure aria-expanded; TemplateCard "view details" now reveals on focus.
- **Dialog semantics + focus**: ModuleBadge (dropped false aria-modal, real focus mgmt), MobilePageTOC (role=dialog + focus trap), ShortcutHint (aria-expanded/haspopup + Escape).
- **Shared hook fix**: `useFocusTrap` moved its Tab listener from the container to `document`, so its recovery branches actually fire once focus escapes — safe for all 7 consumers (ConfirmDialog, BatchReviewModal, Modal, MobileSheet, connector-modal, ShortcutsOverlayDialog, MobilePageTOC).
- **Behavior fix**: use-cases Escape stopped *restarting* autoplay (inverted); it now stops motion, resume via the visible Pause/Play control.

## Verification

| | Before | After |
|---|---|---|
| tsc | 0 | 0 |
| vitest | 71/71 | 71/71 |

## Known tradeoff

Dashboard aria-labels (#2 batch) use inline English rather than new i18n keys — localizing each would touch all 15 locale files. An accessible English name beats no name; flagged for a future i18n sweep.

## Medium/Low tail remaining (~131) — recommendation

- **context-map drift (6)**: not repo code — the Vibeman context map lists phantom/renamed files. Best fixed by re-running Vibeman's context scan (re-derives each context's real file list), not blind edits. Recommend a `refresh_context` / rescan pass.
- **magic-number/clarity (19)**: mostly "document this constant" — low user value; do opportunistically.
- **i18n-hardcoded (16)**: same harness as Wave 12; a batch worth doing if broad localization matters.
- **dead/unwired (8), loading/error (7), duplicate-SoT (5), responsive (5), + singletons**: diminishing returns; cherry-pick by user-visible impact.
