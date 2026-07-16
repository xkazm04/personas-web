# Legal & Policy — ambiguity+ui scan
> Total: 5 findings (Critical: 0, High: 2, Medium: 3, Low: 0)

## 1. Changelog auto-expand never fires on the landing tab (stale `useState` initializer)
- **Severity**: High
- **Agent**: ambiguity_guardian
- **Category**: stale-state-initializer
- **File**: `src/app/legal/PolicyChangelog.tsx:15`
- **Scenario**: A returning user with an unseen policy update opens `/legal`. `LegalContent` computes `initiallyUnseen` in a post-mount effect (LegalContent.tsx:58-71), so on the changelog's first render `hasUnseenUpdate` is `false`. `useState(hasUnseenUpdate)` captures that initial `false`; when the prop later flips to `true`, state does not follow. The panel only auto-expands on tabs the user *switches to* (remount via `key={activeTab}`), never on the tab they landed on — which is exactly the tab whose update they most need to see.
- **Root cause**: `open` is seeded from a prop that is known to be async-populated, and React `useState` ignores initializer changes on re-render. The documented intent in LegalContent.tsx:50-52 ("Drives the changelog 'New' pill + auto-expand") is silently half-broken.
- **Impact**: The main disclosure mechanism for policy changes (auto-expanded "What changed") never triggers for the initially-active policy; users see the "New" pill but the change list stays collapsed, weakening the notice-of-changes flow the feature exists for.
- **Fix sketch**: In `PolicyChangelog`, sync prop→state with an effect (`useEffect(() => { if (hasUnseenUpdate) setOpen(true); }, [hasUnseenUpdate])`), or in `LegalContent` render the changelog only after `initiallyUnseen` is resolved / key it on `initiallyUnseen.has(activeTab)`.

## 2. Tab switcher has no WAI-ARIA tab semantics or keyboard model
- **Severity**: High
- **Agent**: ui_perfectionist
- **Category**: a11y-tabs-semantics
- **File**: `src/app/legal/LegalContent.tsx:125-153`
- **Scenario**: A screen-reader or keyboard user navigates the Privacy/Terms/Cookies switcher. The controls are plain `<button>`s in a `<div>`: no `role="tablist"`/`role="tab"`, no `aria-selected`, no `aria-controls`, the content container is not a `role="tabpanel"`, and there is no arrow-key navigation or roving tabindex. The active tab is conveyed only by color (cyan vs muted).
- **Root cause**: The component visually implements the tabs pattern but skips the corresponding ARIA pattern; selection state exists only in CSS classes.
- **Impact**: Assistive-technology users get three unlabeled-state buttons with no announced selection and no relationship to the panel that changes beneath them — a real WCAG 4.1.2 (name/role/value) failure on the page that carries legally required disclosures.
- **Fix sketch**: Wrap buttons in `role="tablist"` with `role="tab"`, `aria-selected={isActive}`, `id`s, and `aria-controls` pointing at a `role="tabpanel"` wrapper around the content card; add Left/Right-arrow roving focus. Keep the existing visuals; optionally add a non-color active cue (e.g., underline) for 1.4.1.

## 3. Changelog asserts a term ("never for inactivity") that the Terms document does not contain
- **Severity**: Medium
- **Agent**: ambiguity_guardian
- **Category**: changelog-policy-drift
- **File**: `src/data/policy-changelog.ts:25`
- **Scenario**: The terms changelog entry says "Made explicit that we may suspend cloud accounts only for terms violations, never for inactivity." The actual Termination section (`src/app/legal/policies/TermsOfService.tsx:104-111`) only says accounts may be suspended "if you violate these terms" — it never makes the "never for inactivity" promise the changelog claims was made explicit.
- **Root cause**: `POLICY_META.changes` is a second, hand-maintained source of legal truth with no link or check against the policy prose (the `latestUpdateIso`/`formattedUpdate` pair is the same duplication pattern — two hand-synced encodings of one date).
- **Impact**: The site publishes a user-favorable commitment in the "what changed" UI that the binding document doesn't state — a legal-content mismatch that can mislead users and embarrass the team, and a drift channel for every future revision.
- **Fix sketch**: Align the texts (add the "not for inactivity" sentence to the Termination section, or soften the changelog entry). Derive `formattedUpdate` from `latestUpdateIso` with `Intl.DateTimeFormat`. Add a comment on `changes` stating it must quote/summarize only what the policy actually says.

## 4. Changelog holds only the latest revision, and same-day updates can never be flagged
- **Severity**: Medium
- **Agent**: ambiguity_guardian
- **Category**: single-snapshot-changelog
- **File**: `src/data/policy-changelog.ts:3-37`
- **Scenario**: (a) `PolicyMeta.changes` is a flat array for one revision. When the next update ships, the previous entries must be overwritten — a user who missed two revisions sees only the newest one, though the header says "What changed in this update" as if it were complete notice. (b) `hasUnseenUpdate` compares day-granular ISO strings, and viewing a tab writes `todayIso()` as last-seen (LegalContent.tsx:70,80,95); a policy update published later the same calendar day compares `lastSeen < latestUpdateIso` = false and is never surfaced to that user.
- **Root cause**: The data model has no revision history (no per-entry dates), and "seen" is recorded at day granularity with `<` (exclusive) comparison — undocumented assumptions that updates are rare and never intra-day.
- **Impact**: Incomplete change notice for infrequent visitors and a silent-miss edge on release day — both undermine the feature's purpose of demonstrating transparent policy changes.
- **Fix sketch**: Model `changes` as `{ dateIso, items[] }[]` and render entries newer than `lastSeen`; either store a full timestamp for last-seen or use `<=`-safe versioning (e.g., compare against a monotonically bumped revision number instead of dates).

## 5. Any non-tab hash forcibly yanks the user back to Privacy, and tab switches don't create history
- **Severity**: Medium
- **Agent**: ui_perfectionist
- **Category**: hash-navigation-behavior
- **File**: `src/app/legal/LegalContent.tsx:76-94`
- **Scenario**: The `hashchange` handler maps any unrecognized hash to `"privacy"` via `getInitialTab()`. If a future in-page anchor is linked (e.g., `#managing-cookies`) or the hash is cleared, the view silently jumps to the Privacy tab and even writes `writeLastSeen("privacy", …)`, consuming its "Updated" badge without the user actually reading it. Meanwhile `switchTab` uses `history.replaceState`, so Back after browsing all three tabs leaves the page instead of restoring the previous tab, while an external `hashchange` *does* navigate tabs — two inconsistent navigation models on one page.
- **Root cause**: Unknown hashes are conflated with "default to privacy" (correct for first load, wrong for subsequent hash changes), and the replaceState-vs-hashchange split was never reconciled.
- **Impact**: Surprising tab resets, a falsely-cleared update badge, and back-button behavior that contradicts the deep-linkable-hash affordance the component otherwise supports.
- **Fix sketch**: In the `hashchange` handler, ignore hashes that aren't valid `TabId`s (early return instead of defaulting); only call `writeLastSeen` for genuinely activated tabs; pick one history model — `pushState` in `switchTab` if tabs should be Back-navigable, or keep `replaceState` and drop the hashchange listener's tab-switching.
