# How It Works & Changelog — ambiguity+ui scan
> Total: 5 findings (Critical: 0, High: 2, Medium: 3, Low: 0)

## 1. Role selector on /how is a near no-op that promises personalized content
- **Severity**: High
- **Agent**: ambiguity_guardian
- **Category**: misleading-role-selector
- **File**: `src/app/how/page.tsx:26`
- **Scenario**: A visitor on /how clicks "I am a … Product Manager" or "Enterprise" expecting the explainer to adapt. Nothing in the content changes: `role` only feeds `stageGlow`/`stageColors`, which style just the LAST of four StageSections (the event-bus one, `page.tsx:66`); the other three hardcode their glow/colors. Worse, `enterprise` maps to the exact same values as `developer` (`cyan` / `emerald→cyan`), so selecting Enterprise is literally indistinguishable from Developer.
- **Root cause**: The maps at lines 26–36 were built for a per-role experience that was never wired past one gradient. No comment records whether role-specific content was descoped or is still planned, so the half-connected state reads as intentional.
- **Impact**: Users perform an explicit "tell us who you are" action and get (at most) a subtle recolor — for Enterprise, zero feedback. Erodes trust in the page's interactivity and buries the original intent for future maintainers.
- **Fix sketch**: Either make the role meaningful (role-conditional copy/examples per section, at minimum distinct colors for enterprise) or remove the selector from /how. If keeping the color-only behavior temporarily, apply `glow`/`colors` to all four sections and add a comment recording the descoping decision.

## 2. Scroll-map anchors and deep links target IDs that only exist inside `ssr: false` lazy chunks
- **Severity**: High
- **Agent**: ui_perfectionist
- **Category**: broken-deep-link-anchors
- **File**: `src/components/sections/how-lazy.tsx:43`
- **Scenario**: All four /how sections load via `createLazySection(…, { ssr: false })`, and the anchor IDs (`#agents-timeline`, `#agents-chat`, `#platform-layers`, `#event-bus`) live inside those lazily loaded components (e.g. `agents-timeline/index.tsx:98`). A shared URL like `/how#event-bus` lands on a page whose server HTML contains only skeletons — the target ID does not exist at navigation time, so the browser never scrolls; scroll-map clicks made before a chunk resolves also silently no-op. Secondary effect: `how/layout.tsx` declares `force-static` + OG metadata for SEO, yet the entire page body crawlers receive is placeholder skeletons.
- **Root cause**: Anchor IDs are owned by the deferred components instead of the always-present wrappers; skeletons (`EventBusShowcaseSkeleton`, `SectionSkeleton`) carry no IDs.
- **Impact**: Deep links and the page's own navigation rail are unreliable on first load — a user-facing navigation defect on the page whose whole purpose is guided explanation; SEO value of the static layout is largely wasted.
- **Fix sketch**: Move each `id` (and `scroll-mt`) onto the `StageSection`/wrapper that renders in the initial HTML (e.g. pass `id` through `StageSection` in `how/page.tsx:51-68`), or have `createLazySection` accept an `id` applied to both skeleton and loaded section. Reconsider `ssr: false` for the text-heavy sections.

## 3. "N releases in 90 days" momentum stat never expires and is stale by 4.5 months
- **Severity**: Medium
- **Agent**: ambiguity_guardian
- **Category**: stale-momentum-stat
- **File**: `src/components/sections/Changelog.tsx:24`
- **Scenario**: The homepage badge computes releases within 90 days of the *newest release* (comment at lines 21–23 records this deliberately). Newest release is 2026-02-28; today (2026-07-16) the site still proudly shows "3 releases in 90 days" despite ~4.5 months of silence — the anchoring choice that keeps the stat "meaningful" also makes it evergreen and therefore misleading as a momentum claim.
- **Root cause**: The recorded decision optimized for "never shows 0" without capturing the edge case it creates: an unbounded-staleness marketing claim. No cutoff exists for when the stat should stop rendering.
- **Impact**: Visitors are told the product ships fast when the data says otherwise; if a savvy user cross-checks `/roadmap#changelog`, the claim damages credibility.
- **Fix sketch**: Keep the newest-release anchor but add a freshness gate: hide the badge (or switch copy to "Latest: v0.12.0, Feb 2026") when `Date.now() - newestTime` exceeds ~120 days. One extra condition on the `recentShipCount > 1` render guard at line 40.

## 4. Two competing change-type metadata tables — the exported one is dead
- **Severity**: Medium
- **Agent**: ambiguity_guardian
- **Category**: duplicate-source-of-truth
- **File**: `src/data/changelog.ts:17`
- **Scenario**: `changelog.ts` exports `CHANGE_TYPE_META` (labels + raw hex colors) as the apparent canonical styling map, but nothing in `src/` imports it. The actual renderer defines its own `CHANGE_META` (`changelog-timeline/index.tsx:13`) keyed to `BrandKey` tokens. Adding a fifth `ChangeType` (or renaming a label) requires updating two tables; the hex values in the dead export can silently drift from the brand vars actually shown.
- **Root cause**: The timeline migrated to the `brand-theme` token system but the pre-migration metadata export was left behind with no deprecation note.
- **Impact**: Maintenance trap and false documentation — a contributor extending the changelog will reasonably edit `CHANGE_TYPE_META` and see no effect, or ship inconsistent labels between future consumers.
- **Fix sketch**: Delete `CHANGE_TYPE_META`, or make it the single source: move `CHANGE_META`'s `{ label, brand }` mapping into `changelog.ts` (icons can stay component-side keyed by `ChangeType`) and have the timeline consume it.

## 5. RoleSelector toggle group exposes no pressed state to assistive tech
- **Severity**: Medium
- **Agent**: ui_perfectionist
- **Category**: toggle-state-a11y
- **File**: `src/components/RoleSelector.tsx:57`
- **Scenario**: On /how (`page.tsx:47`), the "I am a …" control is three plain `<button>`s whose active state is conveyed only by color classes and a 20%-opacity animated border. A screen-reader user hears three identical buttons with no indication of which role is selected; keyboard users get no programmatic state either.
- **Root cause**: Buttons omit `aria-pressed` (or `role="radiogroup"`/`aria-checked` semantics), and the visual active treatment is color-only with no text/shape redundancy.
- **Impact**: WCAG 4.1.2 (name/role/value) failure on an interactive control; combined with finding #1's minimal visual feedback, non-sighted and colorblind users cannot tell the selector did anything at all.
- **Fix sketch**: Add `aria-pressed={isActive}` to each button and wrap the group with an accessible label (e.g. `role="group" aria-label="View as"`); consider a non-color active cue (filled background + check or font-weight change), which also helps finding #1.
