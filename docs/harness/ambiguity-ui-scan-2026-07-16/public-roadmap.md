# Public Roadmap — ambiguity+ui scan
> Total: 5 findings (Critical: 0, High: 2, Medium: 3, Low: 0)

## 1. Dead `/api/roadmap` endpoint — Supabase roadmap and rendered roadmap are two disconnected sources of truth
- **Severity**: High
- **Agent**: ambiguity_guardian
- **Category**: dead-endpoint-dual-source-of-truth
- **File**: `src/app/api/roadmap/route.ts:5`
- **Scenario**: A grep across `src/` finds zero consumers of `/api/roadmap` — the roadmap page (`src/app/roadmap/page.tsx`) renders only static/hand-authored data (`areas.ts`, `roadmap-phases.ts`). The route dutifully queries `roadmap_items` from Supabase, logs errors, and returns 502 on failure, but nothing ever fetches it. The context description also claims `shipped_features` is read from Supabase — no such query exists anywhere in these files.
- **Root cause**: The DB-driven roadmap was either abandoned or never wired into the UI, and the decision was not recorded; the route, its `RoadmapItem` type (`src/app/api/roadmap/types.ts`), and presumably the `roadmap_items` table remain as live-looking dead surface.
- **Impact**: Anyone editing `roadmap_items` in Supabase believes they are updating the public roadmap — visitors never see it. Maintainers reading the API code assume the page is dynamic. Two roadmaps silently diverge; the 502 error path and `source: "none"|"error"` discriminator are untested, unreachable code.
- **Fix sketch**: Decide and record: either (a) wire `RoadmapAreas`/a new section to fetch `/api/roadmap` (its `status`/`priority` fields map naturally onto card badges), or (b) delete the route + types + table and note in `areas.ts` that the roadmap is intentionally build-time static. Also correct the context map's `shipped_features` claim.

## 2. `TEMPLATE_TARGETS >= live count` invariant enforced only by a comment — derived bars can exceed 100% and emit invalid ARIA
- **Severity**: High
- **Agent**: ambiguity_guardian
- **Category**: unenforced-invariant-overflow
- **File**: `src/components/sections/roadmap/areas.ts:61`
- **Scenario**: Template numerators are derived from the live catalog at build time (drift-proof by design), but denominators are hand-authored aspirational targets. The comment says "Keep every target >= its live count so a bar never overflows (value <= 1)" — nothing enforces it. The moment the shipped DevOps catalog passes 40 templates, `cat.DevOps / 40 > 1`.
- **Root cause**: A load-bearing invariant lives in a comment instead of code. Downstream, `RevealTile` (`RoadmapAreas.tsx:93-102`) computes `pct = Math.round(value * 100)` and uses it raw: `aria-valuenow={pct}` exceeds `aria-valuemax={100}` (WAI-ARIA violation), `inset(0 ${100 - pct}% 0 0)` gets a negative inset, and the seam animates to `left: >100%` outside the tile.
- **Impact**: The exact success scenario the roadmap celebrates (shipping more than planned) breaks the UI: ">100%" copy, invalid progressbar semantics for screen readers, seam rendered outside its clipped container. It regresses precisely when nobody is looking at this file.
- **Fix sketch**: Clamp at the source — `value: Math.min(1, cat.X / TARGET)` (or clamp once in `RevealTile`/`areaOverall`) and show `detail` as the honest raw `n/target`. Better: a build-time assert in `roadmap-area-counts.ts` that every live count <= its target, so the target gets raised deliberately.

## 3. Context-map drift: `PhaseCard.tsx` is gone, and the 15-phase dataset driving the headline "% complete" is never rendered anywhere
- **Severity**: Medium
- **Agent**: ambiguity_guardian
- **Category**: phantom-file-invisible-progress-basis
- **File**: `src/data/roadmap-phases.ts:21`
- **Scenario**: The context lists `src/components/PhaseCard.tsx` — the file does not exist (the comment at `roadmap-phases.ts:8` confirms the component was removed). `phaseCardData` survives, but grep shows its only consumers are the four derived progress constants; the `name`/`icon`/`scope`/`accent`/`bg` fields of all 15 phases are dead weight, and the phase grid users could once audit is gone.
- **Root cause**: The phase-card UI was deleted without pruning its data file or updating the context map, leaving the public "11 of 15 phases complete / 73%" figure derived from a dataset no visitor can see or verify.
- **Impact**: `RoadmapProgress` presents a precise percentage whose basis is invisible — a visitor cannot learn what "phase 12" is. Maintainers editing card copy/icons in `roadmap-phases.ts` change nothing user-facing. The stale context map sends future scans/agents to a phantom file.
- **Fix sketch**: Either strip `phaseCardData` down to `{phase, name, completed}` (documenting it as the progress ledger, English-only because unrendered), or re-surface the phase list (e.g. a tooltip/expander on `RoadmapProgress` enumerating phases). Update the context map to drop `PhaseCard.tsx` and add `roadmap-area-counts.ts` + `RoadmapIntro.tsx`, which it misses.

## 4. Overall progress bar has no progressbar/meter semantics while its sibling tiles are fully labeled
- **Severity**: Medium
- **Agent**: ui_perfectionist
- **Category**: a11y-inconsistent-progressbar-semantics
- **File**: `src/components/sections/roadmap/components/RoadmapProgress.tsx:52`
- **Scenario**: The headline roadmap bar — the single most informative element on the page ("most informative element first", per `index.tsx`) — is a stack of decorative divs: no `role="progressbar"`, no `aria-valuenow`, nothing groups the "{completed} of {total}" label, the "%" span, and the track. Meanwhile every small `RevealTile` in `RoadmapAreas.tsx:99-103` carries complete, localized progressbar ARIA.
- **Root cause**: The a11y pattern established in `RevealTile` was never back-ported to `RoadmapProgress`; the surrounding text happens to convey the numbers, so the gap is invisible in visual QA.
- **Impact**: Screen-reader users get three disconnected text fragments instead of one announced "Roadmap progress, 73%" widget; the component is inconsistent with the section's own established pattern. Inconsistent semantics on the same page is worse than uniformly plain text.
- **Fix sketch**: Give the track container `role="progressbar"` with `aria-valuemin/max/now={progressPercent}` and a localized `aria-label` (reuse the `barAria` template pattern from `RoadmapAreas`), and mark the shimmer/dot layers `aria-hidden` explicitly.

## 5. Hand-authored fulfillment percentages are visually indistinguishable from measured ones
- **Severity**: Medium
- **Agent**: ui_perfectionist
- **Category**: estimated-vs-derived-presented-identically
- **File**: `src/components/sections/roadmap/areas.ts:122`
- **Scenario**: i18n region coverage (0.88/0.76/0.64/0.58), device readiness (0.92/0.55/0.45/0.25), collaboration (0.95/0.4/0.15) and platform values are editorial estimates — the code comments admit "no clean data source". They render through the same `RevealTile` with the same tabular-nums "%" treatment as the genuinely derived template counts ("13/40"), which the module goes to great lengths to keep drift-proof.
- **Root cause**: The derived-vs-authored distinction is documented for developers (inline comments) but never surfaced in the UI or given an update trigger — nothing prompts revisiting "macOS 0.55" when the macOS build ships.
- **Impact**: The precision of "92%" implies measurement; users and even the team can't tell aspiration from fact on a public page whose whole premise is honest progress. Estimates rot silently (a shipped macOS beta leaves the bar at 55% until someone remembers this file).
- **Fix sketch**: Give authored bars an honest `detail` register (they mostly have one — "In development", "Preview"; the i18n bars do not: add e.g. "est." or drop the % for a phase word), and add a dated `// last reviewed:` convention or a single `AUTHORED_VALUES` block at the top of `areas.ts` so estimates are revisited in one place. No new components needed.
