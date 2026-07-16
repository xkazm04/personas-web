# Waitlist & App Download — ambiguity+ui scan
> Total: 5 findings (Critical: 0, High: 2, Medium: 3, Low: 0)

## 1. Submit-timeout abort leaves the form stuck on "Joining…" forever
- **Severity**: High
- **Agent**: ambiguity_guardian
- **Category**: stuck-loading-on-timeout
- **File**: `src/components/WaitlistModal.tsx:90`
- **Scenario**: User submits their email on a slow/unresponsive connection. After `FETCH_TIMEOUT_MS` (15s) the `setTimeout` fires `controller.abort()`. The catch block does `if (err instanceof DOMException && err.name === "AbortError") return;` — it early-returns without touching state, so `status` stays `"loading"`: the submit button is permanently disabled with a spinner and no error message is ever shown.
- **Root cause**: One AbortError path serves two different intents that were never distinguished: (a) modal closed / re-submit (silence is correct) and (b) request timed out (user needs feedback). The happy path and the close path were handled; the timeout path — the very reason `FETCH_TIMEOUT_MS` exists — was not.
- **Impact**: The exact users most likely to hit a timeout (flaky networks) get a dead form with no retry affordance; they must close and reopen the modal to try again, and most will just leave. Silent conversion loss on the site's primary capture flow.
- **Fix sketch**: Track why the abort happened, e.g. set a `timedOut` flag in the timeout callback (or compare `submitAbortRef.current === controller`). On timeout-abort: `setStatus("error"); setErrorMsg("Request timed out — please try again")`. Keep the silent return only when the modal was closed (`!open` or the controller was superseded).

## 2. Navbar DownloadModal is a live dead end that contradicts the real download flow
- **Severity**: High
- **Agent**: ui_perfectionist
- **Category**: placeholder-shipped-as-cta
- **File**: `src/components/navbar/DownloadModal.tsx:15`
- **Scenario**: A visitor clicks the navbar Download CTA, is asked to "Choose your download", picks "Windows 11 x64" or "AMD x64" — and the modal simply closes (`onClick={onClose}` at line 132). Nothing downloads, no explanation, no waitlist offer.
- **Root cause**: An acknowledged placeholder (JSDoc at line 25) shipped on the highest-intent CTA, and it forks from the canonical flow: `/api/download` (route.ts:73) deliberately falls back to `/#download` "so the UI can show the waitlist modal fallback", while the navbar opens this dummy modal instead. Which flow is canonical was never decided/recorded. The option taxonomy is also incoherent — "Windows 11 x64" vs "AMD x64" are not disjoint choices (AMD chips run the Windows x64 build); real axes would be OS × arch (e.g. Windows x64 / Windows ARM64).
- **Impact**: Highest-intent users experience silent breakage — a click that promises an installer and delivers nothing — which reads as a broken product. Duplicated, diverging download UX (this modal is also hardcoded English and lacks the WaitlistModal's i18n).
- **Fix sketch**: Until builds ship, route the navbar CTA to the existing WaitlistModal (matching the `/api/download` fallback intent) or have each option open the waitlist prefilled with the platform. When builds exist, point options at `/api/download?target=<id>` and fix the taxonomy to OS × architecture. Record the decision in the component doc.

## 3. WaitlistModal never locks body scroll (and duplicates the whole modal shell)
- **Severity**: Medium
- **Agent**: ui_perfectionist
- **Category**: modal-shell-inconsistency
- **File**: `src/components/WaitlistModal.tsx:117`
- **Scenario**: Open the waitlist modal on a scrollable page (especially mobile) and swipe/scroll: the page behind the backdrop scrolls freely. The sibling DownloadModal correctly calls `lockBodyScroll()/unlockBodyScroll()` (DownloadModal.tsx:43,75); WaitlistModal has no scroll lock at all.
- **Root cause**: The overlay/backdrop/focus-trap/Escape/dialog chrome (~70 lines) is copy-pasted between the two modals rather than shared, so fixes applied to one (scroll lock, `z-[60]` vs `z-50`, focusable selector including `input` or not) drift apart.
- **Impact**: Background scroll bleed and scroll-position jumps while typing an email on mobile; two modals that look identical but behave subtly differently; every future modal fix must be made twice.
- **Fix sketch**: Extract a shared `ModalShell` (backdrop, framer-motion enter/exit, `role="dialog"`, focus trap incl. inputs, Escape, previous-focus restore, body scroll lock, z-index) and render both modals through it. Minimum viable fix: add the existing `lockBodyScroll`/`unlockBodyScroll` pair to WaitlistModal's open effect.

## 4. Waitlist UI hardcodes English strings alongside the i18n system it already uses
- **Severity**: Medium
- **Agent**: ui_perfectionist
- **Category**: i18n-partial-coverage
- **File**: `src/components/waitlist-modal/WaitlistSuccessPanel.tsx:46`
- **Scenario**: A non-English visitor opens the waitlist modal: labels wired through `t.*` (placeholder, "Notify me", "Joining…", coming-soon) render localized, but "Share with a friend" (SuccessPanel:48), the next-steps sentences (SuccessPanel:60-61), "Could not copy automatically - copy this link" (SuccessPanel:94), "Get access to unstable builds…" (WaitlistForm:67), "Personas for {label}" / "Join N … waiting" sentence assembly (WaitlistHeader:31,40), and the client validation error "Please enter a valid email address" (WaitlistModal:64) all stay English.
- **Root cause**: The `labels` prop pattern was applied to some strings and abandoned halfway; new copy was added inline without going through `useTranslation`. WaitlistHeader additionally concatenates `Join {count} {peopleWaiting} {platformLabel}`, an ordering that only works for English grammar.
- **Impact**: Mixed-language modal for every non-English locale — worse than fully English because it looks broken rather than merely untranslated; the concatenated count sentence cannot be correctly translated at all.
- **Fix sketch**: Move the remaining strings into the translation catalog and pass them through the existing `labels`/`t` plumbing; replace the header concatenation with a single parameterized template (e.g. `t.waitlist.joinCount` with `{count}`/`{platform}` placeholders).

## 5. Inverted no-op catch in fetchCount silently discards real errors
- **Severity**: Medium
- **Agent**: ambiguity_guardian
- **Category**: inverted-error-guard
- **File**: `src/components/WaitlistModal.tsx:43`
- **Scenario**: The waitlist-count fetch fails for any real reason (network down, 500, malformed JSON). The catch reads `if (!(err instanceof DOMException && err.name === "AbortError")) return;` — i.e. *non-abort* errors take the early `return` and *abort* errors fall through… to nothing. Both branches are no-ops.
- **Root cause**: The guard is inverted from the codebase's own convention (compare `handleSubmit`'s correct `if (err … AbortError) return;` at line 90, presumably before reporting). The original intent — swallow aborts, report/handle real failures (e.g. the `Sentry.captureException` used elsewhere in this file) — is unrecoverable from the code as written, and no comment records what failure handling was intended.
- **Impact**: Today it's dead logic that misleads readers into thinking real errors are handled; any future edit that adds handling "after the guard" will run it for aborts and skip it for genuine failures. Count-fetch failures are invisible in telemetry, and the header quietly shows no social-proof count with no signal why.
- **Fix sketch**: Flip the condition to match handleSubmit: `if (err instanceof DOMException && err.name === "AbortError") return;` then handle the real-error path deliberately (at minimum `Sentry.captureException(err, { tags: { component: "WaitlistModal" } })`; UI already degrades gracefully by leaving `waitlistCount` null).
