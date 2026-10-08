# Weekend directions: the Director relays by hand until a signed `channel_say` verb exists

## Context

The headless master reads the operator's voice only from `team_channel_messages` where `author_kind = 'user'` (personas `.claude/skills/appmaster/lib/dbread.mjs`, `operatorChannelSince`, which filters `persona_id = ? and author_kind = 'user'`). No phone path writes such a row today, so the operator on a second device cannot direct an App Master.

## Decision

Operator decision of 2026-10-08, about 11:40 local, relayed by the Director. Until a verb exists, the operator messages the Director through Claude Code Remote Control and the Director relays with `say`. A signed `channel_say` verb is the first weekend build scope: it writes a `team_channel_messages` row with `author_kind` `'user'` for an App Master persona.

`channel_say` has since landed on both sides; see [Status, 2026-10-08 evening](#status-2026-10-08-evening). It was decided, not landed, when this record was written.

## Alternatives that lost

Reconstructed from the constraints; the options the operator was offered are not recorded in this repo.

- **Relaying by hand with no verb, as the standing answer.** Works but depends on the Director and the Remote Control session being reachable; kept only as the stopgap.
- **An unsigned write from the phone.** The phone's commands are signed (`src/lib/commands/signer.ts`); an unsigned path to the master's input would bypass that.

## Consequences

- Until `channel_say` lands, every direction passes through the Director's session.
- When it lands, the phone's Messages view (`f3e8e3d9`) is the natural place to send from; that is not decided here.
- A signed verb needs a desktop-side handler and a web-side command; neither is recorded as done.

## Evidence

personas: `.claude/skills/appmaster/lib/dbread.mjs`, `operatorChannelSince` (line 227 on master). personas-web: `src/lib/commands/signer.ts`; `f3e8e3d9`. The absence of any phone write path to `team_channel_messages` is the Director's finding. Source: the operator's decision relayed by the Director.


## Status, 2026-10-08 evening

The sections above record what was known at about 11:40 local. They are not edited. Since then `channel_say` has landed on both sides.

Landings:

- Desktop half, personas master: `7653b0be85` and `57d305c7aa` (module doc: `git -C C:/Users/kazda/kiro/personas show 57d305c7aa:src-tauri/src/cloud/channel_say.rs`).
- Web half, this repo: `f9b2c1df` (the `pending_commands` SQL CHECK, the `check-sync-schema` line, `CommandVerb`, `src/lib/commands/channelSay.ts` and `api.sayToMaster`) and `d433642b` (a Direct tab on the phone persona sheet, not the Messages view that Consequences guessed).
- Independent security read and desktop docs, personas: `bb48836922` (`docs/features/settings/README.md` and `CHANGELOG`).

Contract: the params are exactly `{message}`. The text is trimmed; 1 to 2000 characters, counted by code point, is allowed, and anything outside that is refused, never cut. It is masked with `redact_text` before it is stored. It writes one `team_channel_messages` row with `author_kind` `'user'`, and the row id is the command id. The result is `{messageId, changed}`. The refusals are `bad_params`, `empty_message`, `message_too_long`, `not_found`, `not_app_master` and `internal_error`. The desktop run decided two details: any non-retired charter (draft, suspended or active) bound to a project or workspace makes a persona an App Master; and a command id that already names a different row fails `internal_error`.

### Known limits at landing

From the security read (`bb48836922`, `docs/features/settings/README.md`, the `channel_say` passage under Remote commands). These are limits, not accepted risks: nobody has accepted them.

- (a) There is no per-controller rate cap.
- (b) The phone's text stays in clear in the pvfw `pending_commands` row, because the desktop masks only its own copy.
- (c) `redact_text` misses some secret shapes, for example a password that is not the last `key=value` pair in a connection string.
- (d) The verb's App Master test is wider than the loops that read the channel, so a say to another chartered agent can report delivered and never be read.
- (e) While an in-app App Master is on and no fresh headless heartbeat holds its project, a say left unanswered for 10 minutes can start one follow-up run through the arrivals lane.

### Migration

The Director ran `npm run db:migrate:sync` against pvfw at about 18:10 local on 2026-10-08. `check-sync-schema` reported `RESULT ok`, including `pending_commands_command_type_check names channel_say: yes` (source: the Director).

Not yet exercised end to end (phone to pvfw to desktop to the master's channel); the first exercise waits on Tailscale.
