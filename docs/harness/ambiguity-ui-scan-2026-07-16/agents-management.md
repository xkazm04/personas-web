# Agents (Personas) Management — ambiguity+ui scan
> Total: 5 findings (Critical: 0, High: 2, Medium: 2, Low: 1)

## 1. Subscription mutations are happy-path-only: failures give zero feedback and surface as unhandled rejections
- **Severity**: High
- **Agent**: ambiguity_guardian
- **Category**: happy-path-mutation-no-error-feedback
- **File**: `src/components/dashboard/subscriptions-panel/SubscriptionCard.tsx:27`
- **Scenario**: User toggles, deletes, or creates a subscription while the API is down or returns 4xx/5xx. `handleToggle`/`handleDelete` (SubscriptionCard.tsx:27-44) and `handleSubmit` (CreateSubscriptionForm.tsx:28-42) all use `try/finally` with no `catch`, and the store methods (`eventStore.ts` createSubscription/updateSubscription/deleteSubscription:248-268) rethrow. Every handler is invoked as `void handleX()`.
- **Root cause**: Only the success path was designed. The rejected promise escapes through the `void`-ed call, so it becomes an unhandled promise rejection; the `finally` resets the spinner (and `setConfirmDelete(false)`) making the operation look completed.
- **Impact**: On a failed delete the confirm UI collapses back to the trash icon with the card still present — user can't tell if it worked; on a failed toggle nothing changes and nothing explains why; on a failed create the form stays open with no message. Contrast: the same page's persona fetch carefully distinguishes error vs empty (personaStore.personasError), and manual execution has ExecuteToast — subscriptions are the one mutation surface with no error state at all.
- **Fix sketch**: Add `catch` in each handler setting a local error message (inline text in CreateSubscriptionForm; a small toast or inline `text-red-400` line in SubscriptionCard, reusing the ExecuteToast pattern). Keep `finally` for spinner reset; on delete failure keep `confirmDelete` open so the user can retry.

## 2. MemoryActionsPanel dismiss button is keyboard-focusable but invisible (opacity-0 without focus reveal)
- **Severity**: High
- **Agent**: ui_perfectionist
- **Category**: a11y-hidden-focusable-control
- **File**: `src/components/dashboard/MemoryActionsPanel.tsx:143`
- **Scenario**: A keyboard user tabs through the Memory Insights cards. The per-card dismiss (X) button has `opacity-0 ... group-hover:opacity-100` — it only becomes visible on mouse hover, but it remains in the tab order.
- **Root cause**: Hover-reveal styling was added without the matching `focus-visible:opacity-100` (or `group-focus-within:opacity-100`), so visibility is coupled to a pointer-only interaction.
- **Impact**: Focus lands on an invisible control: the focus ring floats over apparently empty space, and screen-magnifier/keyboard users can't tell what they're about to activate. Fails WCAG 2.4.7 (focus visible) in practice; the good `aria-label` doesn't help sighted keyboard users.
- **Fix sketch**: Add `focus-visible:opacity-100` (and/or `group-focus-within:opacity-100`) alongside `group-hover:opacity-100` on the button at line 143. Same pattern should be audited wherever `opacity-0 group-hover:opacity-100` appears.

## 3. Falsy-zero rendering bugs: `durationMs && …` paints a stray "0", and a $0 budget cap is silently hidden
- **Severity**: Medium
- **Agent**: ambiguity_guardian
- **Category**: falsy-zero-semantics
- **File**: `src/components/dashboard/AgentDetail.tsx:128`
- **Scenario**: (a) An execution completes with `durationMs === 0` (sub-millisecond or backend rounds down): `{exec.durationMs && (<span>…)}` short-circuits to the number `0`, which JSX renders as a literal "0" glyph in the row. (b) A persona configured with `maxBudgetUsd: 0` (a legitimate "no spend allowed" cap): `AgentMetrics.tsx:66` gates the chip with truthiness (`persona.maxBudgetUsd ? …`) even though line 49-50 deliberately builds the string with `!= null` — the two checks disagree, and the chip never renders.
- **Root cause**: Truthiness used where `!= null` was meant; whether 0 is a valid value for these fields was never decided/recorded — the code embodies both answers at once (AgentMetrics builds "$0.00" then refuses to show it, forcing a `budget!` non-null assertion as a smell marker).
- **Impact**: Visual glitch ("0" artifact) in the executions list, and a zero-budget persona looks like it has no budget constraint at all — the opposite of the truth, on a chip whose stated purpose is communicating constraints.
- **Fix sketch**: `{exec.durationMs != null && (…)}` in AgentDetail; `{budget != null && <Metric … value={budget} …/>}` in AgentMetrics (dropping the `!` assertions). Record in a one-line comment whether 0 is a valid budget/duration.

## 4. Expand/filter controls expose no state to assistive tech (missing aria-expanded / aria-pressed)
- **Severity**: Medium
- **Agent**: ui_perfectionist
- **Category**: a11y-missing-state-semantics
- **File**: `src/app/dashboard/agents/agents-page/AgentCardImage.tsx:133`
- **Scenario**: A screen-reader user activates the "Details" button on an agent card, or the All/Active/Disabled filter in the subscriptions toolbar. The Details button's expanded state is conveyed only by a rotated chevron (`AgentCardImage.tsx:138`); the toolbar's selected filter (`SubscriptionsToolbar.tsx:26-42`) only by a background-color class. Neither button carries `aria-expanded`, `aria-pressed`, or an `aria-controls` link to the revealed region.
- **Root cause**: State is styled visually (rotate-180, bg-white/[0.08]) without the parallel ARIA attribute, even though the codebase is otherwise a11y-aware (ExecuteToast has role/aria-live, execute button has aria-busy).
- **Impact**: SR users hear "Details, button" with no idea whether it's open, and "All, button / Active, button" with no idea which filter is applied — on the two primary disclosure/filter interactions of this context.
- **Fix sketch**: `aria-expanded={expanded}` (+ `aria-controls` on the AnimatePresence region's id) on the Details button; `aria-pressed={filterEnabled === key}` on each toolbar segment (or role="radiogroup"/"radio"). Add a `focus-ring` class to the toolbar buttons, which are the only buttons in this context without one.

## 5. Context drift + magic visual mappings: listed AgentDetailDrawer.tsx doesn't exist, and accents/portraits key on 4 hard-coded hexes and exact mock names
- **Severity**: Low
- **Agent**: ambiguity_guardian
- **Category**: context-drift-and-magic-mappings
- **File**: `src/app/dashboard/agents/agents-page/agentAccent.ts:1`
- **Scenario**: (a) The context map lists `src/components/dashboard/AgentDetailDrawer.tsx`, which does not exist (inline expansion via `AgentDetail` replaced it); the doc comment in `AgentMetrics.tsx:40` still says it's "used by both AgentCard and AgentDetailDrawer" — neither component exists. (b) `agentAccent.ts:1-6` recognizes exactly four hex strings with no comment on where they come from; `personaVisuals.tsx` keys icons/portraits on exact persona display names. Any persona with a fifth color or a renamed persona silently degrades to cyan/Bot/no-portrait.
- **Root cause**: The card was rebuilt (drawer → inline `AgentDetail`) without updating the context map or stale comments; the color/name whitelists encode the mock-fixture universe — personaVisuals says so, agentAccent doesn't.
- **Impact**: Scanners and newcomers navigate to a phantom component; a data-driven persona (or an edited mock name) silently loses its accent/portrait with no signal that the mapping is exhaustive-by-fixture rather than general.
- **Fix sketch**: Update the context map and the AgentMetrics comment to name the real consumers (AgentCardImage + AgentDetail). In agentAccent.ts, add a one-line comment stating the four hexes mirror the persona color options in the mock fixtures and that cyan is the deliberate fallback; consider deriving accent from nearest-hue instead of exact-match if real persona colors are expected.
