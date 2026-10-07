# M21 governs run and chat: a paired phone may run and chat with a paused persona

## Context

Security scan `5e21d618` reported, as finding 8 (severity low), that a paired phone's `run_persona` starts a paused persona. `execute_persona_inner` never checks `enabled`, while a persona `chat_send` refused `persona_paused` in `persona_chat_send.rs`. The scan's reading: pause is the operator's brake on unprompted spend, and the gap is a policy gap, not a boundary, because the phone could resume the persona first. Its recommended fix was to refuse `persona_paused` for `Authority::Paired` before `execute_persona_inner`, the same rule as `persona_chat_send::plan`. The finding's status in the scan result is `reported`.

The two verbs had already been made to disagree by owner decision M21 (2026-10-07): pause means the persona does not operate in its own role (triggers, schedules, event subscriptions), and an explicit ask still runs. That decision made a paired `chat_send` to a paused persona start its turn (`391844defa`, first landed as `afe3c38733` on `cloud/remote-control-v2`; the persona stays paused). The same message notes that `run_persona` never checked the pause, and that nothing below `plan` refuses a disabled persona. The scan fix then went the other way for run: `adc3370780` refused a paired `run_persona` on a paused persona (`persona_paused`, with a test that failed with the guard disabled). So for a short time chat was allowed and run was refused.

The forcing constraint was that the two explicit verbs needed one rule. The operator was asked (ask `86068d45`).

## Decision

M21 governs both verbs. The operator's answer to ask `86068d45` was "M21 for both", in these words: "M21 governs both verbs. A paired phone may run and chat with a paused agent; remove the paired run_persona pause refusal and its test, record finding 8 as accepted under M21, and align the docs."

- `40d1b691c6` removes `refuse_paused_for_paired` (the guard `adc3370780` added) and its test from `remote_commands.rs`. The run is back. Trust checks, the replay ledger, the approval fingerprint, `review_decide` and every other verb are unchanged, per its message.
- `823491e8f3` aligns the docs: the module docs of `persona_chat_send` and `remote_commands`, the settings feature doc, and the CHANGELOG entry for paired phones ("A paused agent still runs when the phone asks, as it does when you start it here, because pausing stops only what it does on its own").
- Scan `5e21d618` finding 8 is recorded as **accepted** under M21.

A paired phone may therefore run and chat with a paused persona, and the persona stays paused. Pause is no longer a brake against a paired phone: it stops the persona's own triggers, schedules and event subscriptions, not an explicit ask from a signed, paired controller.

## Alternatives that lost

- **Keep the split: chat yes, run no, with only the text corrected.** The state `adc3370780` produced, with the docs fixed to say so. It lost because the operator chose "M21 for both". The reason beyond that answer is not recorded. The M21 message gives the consistency argument for chat ("the same as run_persona, which never checked the pause"), but no commit states why the operator preferred removing the run refusal over keeping it.
- **Refuse both verbs on a paused persona.** Not recorded. No commit or file read for this record shows it was proposed.

## Consequences

- A phone cannot be stopped from starting work on a persona by pausing it. To stop a paired phone, revoke the controller. Pause does not do it.
- Spend: `391844defa` says the chat spend is the same spend M17 already accepts for any paired `chat_send`. A paired run on a paused persona uses the Claude plan like any paired run.
- The scan's own fix for finding 8 is intentionally not applied. Anyone re-running the scan will find the same behaviour; this record and `40d1b691c6` are the answer.
- Reversing this needs a new record and a new guard in `remote_commands.rs`. The web side has no copy of the rule: the personas-web chat composer already treats a paused persona as chat-able (feature doc `personas.md`, "a paused persona still chats, PLAN M21").
- `adc3370780` and `40d1b691c6` both flag "owner security review (remote command plane authority)". Whether that review happened is not recorded.

## Evidence

personas (read only, `git -C C:/Users/kazda/kiro/personas show`): `adc3370780` (refusal, later reverted), `391844defa` and `afe3c38733` (M21 for chat), `40d1b691c6` (removes `refuse_paused_for_paired` and its test), `823491e8f3` (docs and CHANGELOG). Finding 8 is in `.claude/master/personas-web/headless/runs/5e21d618-fe36-4c33-a809-d77e630d69d6/result.json`. The operator's answer to ask `86068d45` is quoted from `40d1b691c6` and the task brief; the ask itself was not read.
personas-web: none changed by this decision.
