# Homepage & Hero — ambiguity+ui scan
> Total: 5 findings (Critical: 0, High: 2, Medium: 3, Low: 0)

## 1. Hero Download CTA falls back to a `#download` anchor whose target lives inside an unmounted lazy section
- **Severity**: High
- **Agent**: ambiguity_guardian
- **Category**: broken-fallback-anchor
- **File**: `src/components/sections/HeroClient.tsx:142`
- **Scenario**: When `NEXT_PUBLIC_DOWNLOAD_URL` is unset, the primary hero CTA renders `href="#download"`. The only `id="download"` in the app is inside `DownloadCTA.tsx:40`, which is exported as `LazyDownloadCTA` with `ssr: false` AND wrapped in `LazyMount` (`gate: true` in `page.tsx:58`) — it only mounts when the user scrolls within ~1 viewport of the page bottom. A visitor who lands and immediately clicks Download has no `#download` element in the DOM.
- **Root cause**: The fallback href was chosen against the section's logical id without accounting for the lazy-mount pipeline; only the happy path (env var set → `/api/download`) was considered. The wrapper `div id="download-section"` from `page.tsx` DOES exist at first paint, but the anchor points at the inner, not-yet-mounted id.
- **Impact**: The site's single most important conversion action silently does nothing (no scroll, no navigation, no error) in any deployment missing the env var — exactly the misconfigured case the fallback was meant to save.
- **Fix sketch**: Point the fallback at the always-present wrapper: `href="#download-section"` — or keep `#download` but move the id onto the wrapper div in `page.tsx` and drop `wrapperId: "download-section"`. Optionally add a build-time warning when `NEXT_PUBLIC_DOWNLOAD_URL` is unset.

## 2. Hardcoded English strings in the hero bypass the 14-locale i18n system
- **Severity**: High
- **Agent**: ui_perfectionist
- **Category**: i18n-hardcoded-strings
- **File**: `src/components/sections/HeroClient.tsx:142`
- **Scenario**: A user browsing in any of the 13 non-English locales (`src/i18n/` has ar/bn/cs/de/es/fr/hi/id/ja/ko/ru/vi/zh) sees the hero fully translated via `t.hero.*` — except the primary CTA label `label="Download"` (line 142) and the trust line `"No signup, no credit card. Runs on your machine. Zero telemetry."` (line 160), both hardcoded English literals.
- **Root cause**: Two strings were added directly instead of through the `t.hero` dictionary that every sibling string in the same component uses.
- **Impact**: The two highest-persuasion elements of the page — the download button and the trust/privacy reassurance — are the only untranslated text above the fold, reading as broken localization to most of the world.
- **Fix sketch**: Add `t.hero.downloadCta` and `t.hero.trustLine` keys to `en.ts` and all locale files (seed with English placeholders per repo convention), then reference them at lines 142 and 160.

## 3. "Adoption snapshot" presents documented mock/aspirational numbers as live social proof
- **Severity**: Medium
- **Agent**: ambiguity_guardian
- **Category**: mock-data-as-social-proof
- **File**: `src/components/sections/HeroClient.tsx:39`
- **Scenario**: `heroStats` renders `liveStats.totalAgents` and `` `${liveStats.totalTemplates}+` `` under the heading `t.hero.adoptionSnapshot`. The `useLiveStats` doc contract (`src/hooks/useLiveStats.ts:53-58`) explicitly states `totalExecutions`, `totalTemplates`, `totalAgents` are "Mock/Aspirational … seeded with marketing defaults", and the fallback hardcodes 42 agents / 120 templates. `HeroStatRow.tsx:34` even ships `data-testid="mock-stats"` to production DOM.
- **Root cause**: A decision to display seeded marketing numbers as an "adoption snapshot" was made in the hook's docblock but never resolved into either real data or honest labeling; the hero consumes the values with no provenance distinction from the genuinely-real `totalUsers`.
- **Impact**: Trust risk on a site whose hero literally sells "Zero telemetry" honesty — a curious visitor inspecting the DOM sees `mock-stats`; numbers can also silently contradict other sections if `platform-counters.json` overrides only some values.
- **Fix sketch**: Either (a) restrict the hero row to metrics with real sources (connector count is real — it's `connectors.length`; add real template count at build time), or (b) rename the label away from "adoption" (e.g. "Platform at a glance") and the testid to `hero-stats`, and record the mock/real split in one place the copy owner can see.

## 4. Context map lists three phantom files — a quarter of this context does not exist
- **Severity**: Medium
- **Agent**: ambiguity_guardian
- **Category**: context-map-drift
- **File**: `src/app/template.tsx:1`
- **Scenario**: The "Homepage & Hero" context declares 12 files, but `src/app/template.tsx`, `src/components/sections/SocialProof.tsx`, and `src/components/sections/HeroTransition.tsx` do not exist anywhere in the repo (glob-verified). Any agent, doc, or reviewer navigating from the context map hits dead paths.
- **Root cause**: Files were deleted or renamed (SocialProof's role appears absorbed by `HeroStatRow` + `useLiveStats`; no page transition template survives) without updating the context map.
- **Impact**: Scans and automation silently skip 25% of their declared scope; future work planned against "SocialProof" or "template" will be misdirected; drift compounds (this repo family has prior stale-context incidents).
- **Fix sketch**: Regenerate/edit the context map entry for Homepage & Hero to drop the three phantom paths and add real members (`src/components/LazyMount.tsx`, `src/hooks/useLiveStats.ts`, `src/components/sections/hero/AgentConstellation.tsx`).

## 5. Magic `lg:ml-[500px]` badge nudge couples the text column to the far card's position
- **Severity**: Medium
- **Agent**: ui_perfectionist
- **Category**: magic-number-layout-coupling
- **File**: `src/components/sections/HeroClient.tsx:92`
- **Scenario**: The "public beta" badge is pushed 500px right at `lg` so it visually sits "over the right command-center card". The grid is `lg:grid-cols-[1fr_auto]` inside `max-w-6xl`, so the left column's width — and therefore where 500px lands relative to the right card — varies continuously between the 1024px breakpoint and full width. At 1024–1150px viewports the badge (plus `px-4` padding and a long locale string like German/Russian) can overflow its column or collide with the card rather than align with it.
- **Root cause**: A fixed pixel offset encodes a relationship ("above the card") that belongs to the card's own column; the comment documents intent but not why 500px is correct or at which widths it was validated.
- **Impact**: Misaligned/overflowing badge at common laptop widths and in longer locales; every future copy or layout change to the left column silently invalidates the constant.
- **Fix sketch**: Render the badge inside the right column's card container (absolutely positioned above `CommandCenterIllustration`) at `lg`, keeping the current inline placement below `lg` — the alignment then derives from the element it targets instead of a hand-tuned offset.
