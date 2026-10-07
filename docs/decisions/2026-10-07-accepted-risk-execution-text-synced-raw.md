# ACCEPTED RISK: the desktop mirrors execution text raw to `synced_executions`, and nothing changes until sync leaves a test project

## Context

Security scan `5e21d618` of the desktop remote-control code reported, as finding 3 (high), that the desktop's cloud sync uploads each execution's `input_data` and `output_data` unmodified to the Supabase table `synced_executions`. On personas master (`f64d96ca43` when read), `row_to_execution` and `fetch_executions` in `src-tauri/src/cloud/sync/rows.rs` copy both columns straight from `persona_executions` (the column list is `EXECUTION_COLS`) into `SyncedExecutionRow`. Nothing between the read and the upload touches them.

The other text classes do not behave this way. Notes (`sync/notes.rs`) and chat turns (`sync/athena_chat.rs`, `sync/persona_chat.rs`) pass their text through `redact::project_text`, which masks secrets and then caps length (`CHAT_CONTENT_CAP`, `NOTE_BODY_CAP`, `SHORT_TEXT_CAP` in `sync/redact.rs`). Chat sync is also gated by `chats_enabled` (the "Sync chats" opt-in). Execution rows use neither.

A persona chat turn is itself an execution. So with the master sync toggle on and "Sync chats" off, the text of the user's message and the persona's reply still leaves the machine through `synced_executions`, uncapped and unredacted. Anyone holding the account's web session can read it, and the web Executions view renders it as is.

The behaviour predates the remote-control branch: it comes from the original sync writer (`bcff5df7e0`, "Phase 1a") and was not introduced by `cloud/remote-control-v1`. The scan reported it and did not fix it, because a fix changes what the web Executions view shows, which is a data-path decision for the owner.

The forcing constraint: cloud sync runs only against a test project for now (see the test-project record of the same date).

## Decision

Accepted risk, operator decision of 2026-10-07 (ask `fc9e169c`). Record it, change no code, and revisit only when sync goes beyond a test project. Neither personas nor personas-web changes as a result of this record.

## Alternatives that lost

- **Redact and gate the fields now.** Pass `input_data` and `output_data` through `redact::project_text` with `CHAT_CONTENT_CAP`, and send neither field for chat-turn executions while "Sync chats" is off. This is the scan's recommended fix. It lost for now because the only data at risk today is test data, and it changes what the web Executions view shows.
- **Give execution text its own data class.** A class beside notes and chats, off by default, and written only through the privileged door. It is the larger and cleaner design, and it lost on the same ground: no real user data is exposed yet to justify the work.

## Consequences

- The web Executions view keeps showing execution input and output raw, including persona chat text, until a fix lands.
- **Reopen trigger:** cloud sync pointed at any project other than a test project, or carrying any real user's data. Either one makes this a live exposure and the fix (the first alternative at minimum) must land first.
- The acceptance holds only while sync targets the test project or another test project. Pointing sync elsewhere without reopening this is a breach of the decision, not an application of it.
- When a fix lands, the web Executions view must be checked against the projected, possibly empty, text.
- This record does not supersede the scan's other findings, which are handled separately.

## Evidence

personas: master `f64d96ca43` at read time; original sync writer `bcff5df7e0` (an ancestor of master); code in `src-tauri/src/cloud/sync/rows.rs` (`row_to_execution`, `fetch_executions`, `EXECUTION_COLS`), `sync/redact.rs` (`project_text`, `CHAT_CONTENT_CAP`), `sync/athena_chat.rs` (`chats_enabled`), table list in `sync/mod.rs` (`synced_executions`). Functions are cited by name because run `d7a1bec4` is editing `src-tauri/src/cloud/`. Source: finding 3 of scan `5e21d618`, and the operator's ask `fc9e169c`.
personas-web: none.
