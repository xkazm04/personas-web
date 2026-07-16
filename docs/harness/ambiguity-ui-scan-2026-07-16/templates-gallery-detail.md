# Templates Gallery & Detail — ambiguity+ui scan
> Total: 5 findings (Critical: 0, High: 2, Medium: 3, Low: 0)

## 1. Fallback modal has no dialog semantics or focus management
- **Severity**: High
- **Agent**: ui_perfectionist
- **Category**: modal-a11y-focus-management
- **File**: `src/app/templates/[id]/template-detail/TemplateFallbackModal.tsx:19`
- **Scenario**: A keyboard or screen-reader user clicks "Open in Personas" without the app installed; the fallback modal appears. Focus stays on the trigger button behind the overlay, the screen reader announces nothing, and Tab cycles through the (now visually obscured) page content behind the modal.
- **Root cause**: The modal container is a bare `motion.div` — no `role="dialog"`, no `aria-modal="true"`, no `aria-labelledby` pointing at the `h3`, no initial focus move into the modal, no focus trap, and no focus restore on close. Only Escape (wired in the parent, `TemplateDetail.tsx:104-111`) and backdrop click work.
- **Impact**: WCAG 2.4.3 / 4.1.2 failure on the primary conversion path of the detail page — assistive-tech users may never perceive the modal exists, and keyboard users interact with hidden background content while the overlay blocks pointer access.
- **Fix sketch**: Add `role="dialog" aria-modal="true" aria-labelledby={titleId}` to the panel, `useRef`+`useEffect` to focus the panel (or the Download link) on open and restore focus to the invoker on close, and a minimal Tab-cycle trap (or reuse a shared `Dialog` primitive if one exists elsewhere in the site). Keep the existing Escape/backdrop handlers.

## 2. Deep-link detection leaks timers/listeners and stacks on repeated clicks
- **Severity**: High
- **Agent**: ambiguity_guardian
- **Category**: deep-link-edge-cases
- **File**: `src/app/templates/[id]/TemplateDetail.tsx:88`
- **Scenario**: (a) User clicks "Open in Personas", then navigates back to /templates within 1.5s — the timer fires after unmount and calls `setShowFallback` on an unmounted component. (b) User clicks the button twice quickly: two independent `blur` listeners and two timers coexist; the first click's timer can surface the modal even though the second attempt succeeded, and an orphaned `blur` listener survives on `window`. (c) Browsers/OSes where launching a protocol handler does not blur the window (some Linux WMs, certain mobile in-app browsers) always show the "not installed" modal even when the app opened.
- **Root cause**: `handleOpenInPersonas` creates a `setTimeout` + `window` listener with no unmount cleanup and no guard against concurrent invocations; the inline comment (lines 82-87) documents only the happy path (blur fires or app absent) and the 1500ms threshold, not the multi-click or unmount cases. The dedicated `resetTimerRef` cleanup pattern used for copy state was not applied here.
- **Impact**: Real logic bug on the page's primary CTA: false "install Personas" modals for users who have the app, listener accumulation on window, and state updates after unmount.
- **Fix sketch**: Store `timer`/`onBlur` in refs, clear both at the top of the handler (making clicks idempotent) and in a `useEffect` cleanup on unmount; optionally also listen for `visibilitychange`/`pagehide` as a stronger "app launched" signal, and extend the comment to record why 1500ms and which platforms the heuristic is known not to cover.

## 3. `difficulty` and `complexity` are two undocumented, drifting taxonomies
- **Severity**: Medium
- **Agent**: ambiguity_guardian
- **Category**: dual-taxonomy-ambiguity
- **File**: `src/lib/templates.ts:26`
- **Scenario**: Every template carries both `difficulty` ("Beginner/Intermediate/Advanced") and `complexity` ("basic/professional/enterprise"). The detail hero (`TemplateHero.tsx:31-32`) renders both as adjacent colored pills and `TemplateCard.tsx:39-44` shows both chips side by side — a visitor has no way to tell what distinguishes "Advanced" from "enterprise". The data already drifts: `gmail-meeting-prep` is `difficulty: "Advanced"` yet `complexity: "basic"` (templates.ts:100/117), and all three Gmail templates are "basic" regardless of difficulty.
- **Root cause**: No recorded definition of what each axis means (setup effort? feature tier? pricing tier?) anywhere in `templates.ts`, `templatePageConfig.ts`, or the detail meta module, so authors fill both fields by feel and the gallery filter (`page.tsx:33-38`) filters only on complexity while cards visually emphasize difficulty colors.
- **Impact**: Confusing badge soup for users, inconsistent filtering (complexity filter, difficulty coloring), and content drift that nobody can flag as wrong because "wrong" is undefined.
- **Fix sketch**: Decide and document the semantic of each axis in a comment above `AgentTemplate` (e.g. difficulty = user skill needed, complexity = plan tier); if they're actually one concept, collapse to a single field. At minimum add a lint-style assertion or review pass for combinations like Advanced+basic, and give each pill a `title`/visually distinct label ("Skill: Advanced", "Tier: basic").

## 4. "View details" affordance is hover-only — invisible to keyboard and touch users
- **Severity**: Medium
- **Agent**: ui_perfectionist
- **Category**: hover-only-affordance
- **File**: `src/app/templates/templates-page/TemplateCard.tsx:52`
- **Scenario**: On a phone/tablet (a large share of a marketing site's traffic) or when tabbing through the gallery with a keyboard, the full-card "View details ›" overlay never appears: it is gated purely on `group-hover:opacity-100`. The card link also has no visible focus ring, unlike the category tiles and filter buttons which use `focus-visible:ring-2` (`CategoryTile.tsx:24`, `page.tsx:104`).
- **Root cause**: The overlay and card styles only account for pointer hover; no `group-focus-visible:` variant and no `focus-visible:` ring on the `Link` itself. Additionally the overlay's `bg-black/40` dims the entire card content on hover, hiding the description the user is trying to read.
- **Impact**: Keyboard users get zero focus indication on gallery cards (WCAG 2.4.7), touch users never see the CTA label, and hover users lose card content behind a scrim — inconsistent with the polish level of neighboring components.
- **Fix sketch**: Add `focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-cyan/40` to the `Link`, mirror the overlay with `group-focus-visible:opacity-100`, and consider a lighter treatment (bottom-anchored label bar instead of full-card `bg-black/40`) so hovering reveals the CTA without erasing the card content.

## 5. Trigger/complexity meta duplicated across gallery and detail modules, with divergent styling and a borrowed i18n key
- **Severity**: Medium
- **Agent**: ui_perfectionist
- **Category**: duplicated-config-drift
- **File**: `src/app/templates/[id]/template-detail/templateDetailMeta.ts:3`
- **Scenario**: `triggerIcons` is defined twice with identical content (`templateDetailMeta.ts:3-9` and `templates-page/templatePageConfig.ts:12-18`); `complexityColors` lives only in the detail module while the gallery card renders complexity as a neutral uncolored chip (`TemplateCard.tsx:39`), so the same "enterprise" value is red on the detail page and gray in the gallery. The download CTA's copy button even borrows `t.waitlist.copied` (`TemplateDownloadCta.tsx:31`) while the configuration section uses `t.templatesPage.copied` for the same state.
- **Root cause**: Gallery and detail sub-features each grew a private config module instead of sharing one; nothing enforces parity, and a translation key was reused from an unrelated feature rather than added to the templates namespace.
- **Impact**: Adding a new trigger type (e.g. "email") requires editing two maps or icons silently vanish in one surface; complexity severity coloring is inconsistent between list and detail; a future rewording of the waitlist "Copied" string silently changes the template CTA.
- **Fix sketch**: Merge the two config modules into one shared `src/app/templates/templateMeta.ts` (or extend `src/lib/templates.ts`, which already exports `categoryColors`/`difficultyColors`) exporting `triggerIcons`, `triggerDescriptions`, `complexityColors`, `categoryAccent`; use `complexityColors` on the gallery chip too; switch the CTA to `t.templatesPage.copied`.
