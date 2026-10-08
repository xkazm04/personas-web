# Weekend directions: the Director relays by hand until a signed `channel_say` verb exists

## Context

The headless master reads the operator's voice only from `team_channel_messages` where `author_kind = 'user'` (personas `.claude/skills/appmaster/lib/dbread.mjs`, `operatorChannelSince`, which filters `persona_id = ? and author_kind = 'user'`). No phone path writes such a row today, so the operator on a second device cannot direct an App Master.

## Decision

Operator decision of 2026-10-08, about 11:40 local, relayed by the Director. Until a verb exists, the operator messages the Director through Claude Code Remote Control and the Director relays with `say`. A signed `channel_say` verb is the first weekend build scope: it writes a `team_channel_messages` row with `author_kind` `'user'` for an App Master persona.

This is decided, not landed. `channel_say` is in progress.

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
