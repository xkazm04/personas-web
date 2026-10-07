# On the desktop plane the review verdict is unsupported in every tier; the web blocks desk-only reviews before the click and stops notes at 500

## Context

This extends `2026-10-07-desktop-plane-unsupported-actions.md` and `2026-10-07-phone-review-decide-desk-only-and-redacted-notes.md`, neither of which is edited. The first left open "whether offline verdicts on the desktop plane should be disabled too". The second made the desktop refuse a phone `review_decide` for an App Master probation packet or ask (`desk_only`) and redact and cap phone notes at 500 characters (personas `66888d389d`), and left "how the web shows the `desk_only` token" undecided. Three web commits follow from them.

## Decision

**(A) Review verdicts are unsupported in every tier on the desktop plane (`b7ca7aa3`).**

- Constraint: `decideReview` sends `PUT /api/events/:id`, a `not_on_desktop` shape whatever the health, so the verdict cannot succeed offline either.
- Chosen: `desktopUnsupported` in `src/lib/sync/desktopUnsupported.ts` returns true for `reviewVerdict` on the desktop plane in every tier, null included. `pause`, `resume` and `chatSend` still qualify only while online. `useReviewGate` now returns `!commandPlane && !desktopPlane` while not ready, so the gate blocks before and after it is ready.
- Alternative that lost: keep offline verdicts enabled. The earlier record's test asserted `verdictsEnabled("offline", false, true)` is true. It lost because the request is a `not_on_desktop` shape in every tier, so an enabled button could only fail on click. The commit message gives this as the reason.
- Ties: `desktopUnsupported.test.ts` (changed in this commit) pins the table; `docs/features/dashboard/reviews.md` records the gate.

**(B) The web mirrors the desktop's `is_desk_only` before the click (`a27b1c8b`).**

- Constraint: the desktop refuses with `desk_only` (`is_desk_only`, personas `66888d389d`, `src-tauri/src/cloud/review_decide.rs`), but the web never read `context_data`, so it offered Approve and Reject and waited for the refusal.
- Chosen: the `synced_manual_reviews` select in `src/lib/supabaseApi.ts` now carries `context_data`. The mapper reduces it to a `deskOnly` boolean through `isDeskOnlyReview` (`src/lib/commands/deskOnlyReview.ts`) and never forwards the text. `canDecideReview` in `useReviewGate.ts` returns false for a desk-only review; `useReviewBulkActions.ts` skips those reviews in bulk approve and reject (`decidableIds`); three surfaces show the reason: `PhoneReviewCard`, `FocusReviewCard` and `ReviewDetailPanel`. `deskOnly` is an optional field on the review type, so other planes leave it undefined (false).
- Alternatives that lost:
  - Rely only on the desktop's `desk_only` refusal after the click. It lost because the click and the wait were the only signal. The chip from `3a608d68` (`desk_only` reads as words) stays as the backstop for a review the mirror did not flag.
  - Forward `context_data` to the client. It lost because the client needs one boolean; the commit says the mapper never forwards the text.
- Ties: `isDeskOnlyReview` must change together with any change to `PACKET_KIND` or `ASK_SOURCE` in personas (`engine/app_master_probation.rs`, `engine/subscription/attention_decide.rs`); the web holds copies of both constants.

**(C) Both notes boxes stop at `REVIEW_NOTES_KEPT = 500` (`fdb34b0e`).**

- Constraint: the desktop redacts a phone note and cuts it to `PHONE_NOTES_CAP_CHARS = 500`, but the textareas accepted 2000 and silently lost the rest.
- Chosen: `REVIEW_NOTES_KEPT = 500` in `src/lib/commands/reviewDecide.ts` is the `maxLength` of the notes textarea in `PhoneReviewCard` and `ReviewDetailPanel`, each with a helper line (`notesKept`). `REVIEW_NOTES_MAX = 2000` stays the envelope bound that `reviewDecide.ts` throws `notes_too_long` on.
- Alternative that lost: lower the 2000 envelope to 500. The commit keeps 2000 as the envelope bound; the envelope matches what the desktop accepts (`invalid_notes` at 2000 in the earlier record), and only what it keeps is 500. The commit does not record a further reason.
- Ties: `REVIEW_NOTES_KEPT` must follow `PHONE_NOTES_CAP_CHARS` in personas.

## Open (not decided)

- The `notesKept` helper line sits in the English-only pending `mobile` namespace (`src/i18n/pending/mobile.ts`) but is shown on a desktop surface (`ReviewDetailPanel`). That is an open i18n gap.
- **RD-6 is still open in personas** and is being fixed separately. This record does not call it fixed.

## Consequences

- On the desktop plane no verdict control is enabled for reviews, offline or online.
- A desk-only review shows its reason and cannot be decided from the web on any plane; bulk actions skip it.
- A new App Master review kind in personas that the web does not know is not flagged before the click; the desktop's refusal and the chip catch it.
- **Nothing is proven live.** No browser view, no running desktop; the live proofs were parked on 2026-10-07. The evidence is the code and its unit tests (`useReviewGate.test.ts`, `useReviewBulkActions.test.ts`, `deskOnlyReview.test.ts`, `supabaseApi.test.ts`, `desktopUnsupported.test.ts`).

## Evidence

personas-web: `b7ca7aa3` (verdict unsupported in every tier), `a27b1c8b` (desk-only before the click), `fdb34b0e` (notes stop at 500), `3a608d68` (chip label). personas (read only): `66888d389d`.
