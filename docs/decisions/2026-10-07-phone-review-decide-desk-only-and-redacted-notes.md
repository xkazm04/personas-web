# `review_decide` from a phone is desk-only for App Master packets and asks, and phone notes are redacted and capped

## Context

Security scan `3842c3af` looked at the `review_decide` verb (owner decision M20) on personas `823491e8f3` and reported seven findings:

- **RD-1 (high).** With no prompt at the desktop, a paired phone could decide an App Master probation packet. Approve moves autopilot from suggest to full; reject retires the App Master.
- **RD-2 (high).** A paired phone could answer an App Master `accept_ideas` ask, which accepts or rejects every listed idea and wakes the App Master.
- **RD-3 (medium).** A phone approval resumes a held team assignment, which spends, and the `review_decision.*` bus event can trigger the runs of subscribed personas.
- **RD-4 (medium).** Phone notes (at most 2000 characters, not redacted, no label) become standing memory, a team channel line, the bus payload, idea reject reasons and the kp lifecycle note.
- **RD-5 (low).** `Validation` prose leaked into the cloud row. The scan fixed this itself in `de010aa4fa`: a resolution error now leaves as `internal_error` (or `not_found` when the review is gone), never as the chokepoint's prose that names the review id.
- **RD-6 (low).** If the re-read after the commit fails in `record_review_decision`, the side effects are skipped.
- **RD-7 (low).** The sync nudge mirrors the whole review row, with no redaction, to `synced_manual_reviews`.

The forcing constraint: `review_decide` runs the desk's own resolution (`resolve_manual_review`), so a phone decision fires every side effect a desk decision does, including the probation reaction (`react_to_app_master_probation`) and the ask reaction (`react_to_app_master_ask`). The App Master raised one risk ask with three options: (1) "Desk only for App Master; redact phone notes", (2) "Also held team steps; no phone notes", (3) "Accept as M20 intent" (no code change; record RD-1 to RD-4 and RD-7 as accepted risk).

## Decision

The operator chose option (1) on 2026-10-07 at 13:03Z. It is built in personas `66888d389d` (an ancestor of master, which was at that commit when read):

- `plan()` in `src-tauri/src/cloud/review_decide.rs` refuses with the closed token `desk_only` when the review's `context_data.kind` equals `PACKET_KIND` (an App Master probation packet) or `context_data.source` equals `ASK_SOURCE` (every ask kind, not only `accept_ideas`). Absent or non-JSON `context_data` is an ordinary review.
- The check runs after the persona binding check, so an unknown or foreign review id still answers `not_found`. It runs before the already-decided check and before any write; `resolve` is never called (a test panics if it is).
- Notes keep the 2000-character envelope bound (`invalid_notes`). They then pass through `redact_text` and are cut to `PHONE_NOTES_CAP_CHARS = 500` characters (characters, not bytes), ending with the truncation marker, before they are stored.
- What the phone sees: `failure_message` returns a `Validation` text as is, and the command is finished `Failed` with that text as `error_message`, so the row ends `failed` with `error_message` `desk_only`.
- A phone can no longer cause an App Master ask's failure line (the "Not applied" note `apply_ask_verdicts` appends to the review's notes), because it can no longer decide an ask: `react_to_app_master_ask` is reached only through `resolve_manual_review`, which `plan()` now stops short of.

How each finding stands:

- **RD-1, RD-2:** closed for the phone.
- **RD-3:** accepted as M20 intent, by the operator's choice of (1) over (2). A phone approval still resumes a held team step, and bus-triggered runs remain.
- **RD-4:** narrowed, not closed. Notes are redacted and capped, but they still become standing memory with no "from paired phone" label.
- **RD-5:** fixed by `de010aa4fa`.
- **RD-7:** the review row is still mirrored unredacted; `66888d389d` does not touch it. The operator's choice named RD-3 only, so the App Master records RD-7 as accepted risk on the same terms as the execution-text record (`2026-10-07-accepted-risk-execution-text-synced-raw.md`): it holds while sync runs only against the test project `pvfw` (`2026-10-07-pvfw-is-the-test-supabase-project.md`), and is revisited when sync goes beyond a test project.

## Alternatives that lost

- **(2) Also held team steps; no phone notes.** Would have refused `desk_only` for reviews that gate a held team step as well, so a phone approval could not resume one (closing RD-3), and would have dropped phone notes entirely instead of redacting and capping them (closing RD-4). It lost because the operator chose (1). The reasons are not recorded; the ask records only the choice.
- **(3) Accept as M20 intent.** No code change; RD-1 to RD-4 and RD-7 recorded as accepted risk. It lost for the same reason: the operator chose (1).

## Open (not decided)

- **RD-6 is not fixed.** In `record_review_decision` (`src-tauri/src/commands/design/reviews.rs`), `update_status` commits and the `get_by_id` re-read follows with `?`. If the re-read fails, `resolve_manual_review` returns before any side effect, so the status is written and the reaction is skipped. Nothing in `66888d389d` changes it.
- How the web shows the `desk_only` token is not part of this record.
- Whether RD-3 and the missing "from paired phone" label on notes (RD-4) get a later fix is not decided.

## Consequences

- A paired phone cannot approve or reject an App Master probation packet or ask. They are decided at the desk. A phone that tries gets a `failed` command with `desk_only`, and the review stays pending.
- Phone notes lose anything credential-looking and are at most 500 characters. The web's notes field may still accept 2000; the stored text will be shorter.
- A phone approval of an ordinary review still resumes a held team step and publishes `review_decision.*`. Anyone relying on a phone not being able to spend must not rely on this decision.
- Reopen trigger for RD-7: cloud sync pointed at any project other than a test project, or carrying any real user's data.
- **Not live-verified.** No paired phone has sent a `desk_only` command to a running desktop; the evidence is the code and its unit tests.

## Evidence

personas (read only, `git -C C:/Users/kazda/kiro/personas show`): `66888d389d` (desk-only, redact and cap; also makes `sync::redact` `pub(crate)` and adds a CHANGELOG line), `de010aa4fa` (closed token for a resolution error), `823491e8f3` (the scanned commit). Code at `66888d389d`: `src-tauri/src/cloud/review_decide.rs` (`PHONE_NOTES_CAP_CHARS` line 60, `phone_notes` 64, `is_desk_only` 79, `invalid_notes` 112, `desk_only` refusal 132-133, `closed` 197; tests `a_probation_packet_is_desk_only_and_never_resolved` 476, `every_app_master_ask_is_desk_only` 498); `src-tauri/src/cloud/remote_commands.rs` (`failure_message` 576-585, `Resolution::Failed` with `error_message` 673-681, `review_decide` arm and `notify_dirty` 862-874); `src-tauri/src/commands/design/reviews.rs` (`record_review_decision` 1268-1277, `resolve_manual_review` 1289, ask reaction and probation reaction within 1289-1360, ask failure note 1525-1530). Source: scan `3842c3af` and the operator's answer to the App Master's ask as given in the task brief; neither was read directly.
personas-web: none changed by this decision.
