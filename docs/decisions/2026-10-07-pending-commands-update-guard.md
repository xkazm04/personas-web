# A BEFORE UPDATE trigger on pending_commands: a command never returns to pending and a finished one is final

## Context

`pending_commands` carries one RLS rule, `owner_all`, so any holder of the user's web JWT may UPDATE a row. The desktop refuses a second claim of a signed command, but that defence is a ledger held in process memory (personas `40ce9ea5dc`: "a restart reopens at most the remaining window of envelopes signed before it"). A finished signed row set back to `pending` could therefore run again after a desktop restart, as long as its envelope still verified (exp + 30 s, about 90 s after signing, per the same message). This is the residual of finding 1 of security scan 5e21d618. The personas commit lists "guard pending_commands status transitions server-side" as the web follow-up.

## Decision

A BEFORE UPDATE row trigger, `trg_pending_commands_update_guard`, in `scripts/setup-sync-db.sql` (`02b99cb2`):

- a write that leaves `status` unchanged passes (result, `updated_at` and so on);
- a change to `pending` is refused ("a command never returns to pending");
- a change out of `completed`, `failed`, `rejected` or `expired` is refused ("a % command is final").

The legitimate writers are unaffected: the desktop claims `pending` to `executing` and resolves `pending` or `executing` to `completed`, `failed`, `rejected` or `expired`; the web expires `pending` to `expired`; `approved` stays open for the legacy flow. `scripts/check-sync-schema.mjs` now also parses `create trigger` for `pending_commands` and reports each as present or missing. The refusal the desktop issues on a replay (`rejected` / `replayed`) is rendered in words in the phone chip and chat (`ec56d0e7`, English-only pending `mobile` namespace).

Proof recorded in the commit: a "PGlite transition matrix" in which desktop claim and resolve and web expiry all still pass (`02b99cb2`, Risk and Verified lines).

## Alternatives that lost

- **Rely on the desktop's in-memory ledger alone.** It is the defence this guard backs up; its restart gap is the reason for the record (`40ce9ea5dc`).
- Persisting the desktop ledger, or splitting the RLS policy into separate rules per column or transition: not recorded. No commit or file read for this record shows either was weighed.

## Consequences

- Any future writer that must reopen a command (a retry, a re-queue, an operator reset) is refused by the database and needs a new record that changes the guard. Record the reason there; do not work around it with a service-role update.
- The guard does not stop the web from moving a `pending` row to `expired` or `approved`, and it does not constrain `executing` to be entered only from `pending`; the SQL allows any non-final to non-pending change.
- `replayed` now renders as "Already handled. Your computer will not run the same command twice." instead of "Refused: replayed" (`ec56d0e7`).
- The feature doc `supabase-client.md` describes the guard (`02b99cb2`).

## Evidence

personas-web: `02b99cb2` (trigger, schema-check addition, doc line) and `ec56d0e7` (copy, `chatModel` mapping and test). Both resolve with `git cat-file -e`.
personas: `40ce9ea5dc` resolves (checked read-only with `git -C C:/Users/kazda/kiro/personas cat-file -e`); its message is the source for the in-memory ledger and the restart window.
Not supported by any commit or file in this repo, so not claimed as evidence: the count of 11 cases in the PGlite matrix, and the application of the guard to `pvfw` with `check-sync-schema.mjs` before and after and unchanged non-sync row counts. `02b99cb2` says only "PGlite transition matrix", and the matrix itself is not committed.
