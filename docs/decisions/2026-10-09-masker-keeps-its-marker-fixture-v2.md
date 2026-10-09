# The masker keeps its own marker, and fixture v2 replaces v1: six calls

## Context

[The phone-masks record](2026-10-09-phone-masks-before-signing.md) left three loose ends. Call 5 was a known miss: the desk's `redact_text` read an existing `[redacted]` as a bracketed value and stored `DB_PASSWORD=[redacted]` as `DB_PASSWORD=[[redacted]]`. Call 3 had an open edge: a say whose masking lengthens it past the cap. A checkout with `core.autocrlf=true` also wrote the fixture with CRLF. On top of that, review notes were still masked only on the desk. Its reopen trigger (the desk changes `redact_text`) has fired. Six calls settled overnight across both repos. This record keeps them.

## Decision

Six calls.

1. **Review notes are masked on the phone before signing** (personas-web `188bec8a`), the same way as the say (`e454b7b9`). A blank note stays null. A typed note over 2000 code points is refused with `notes_too_long`. The note is masked with `redactText`, and a masked note over 2000 is refused again (`src/lib/commands/reviewDecide.ts`, `REVIEW_NOTES_MAX`).
2. **Fixtures are pinned to LF in the repo** (`7aba4178`): `fixtures/*.json text eol=lf` in `.gitattributes`. With `core.autocrlf=true` the byte-exact fixtures were checked out CRLF, so the "LF line endings" test failed on every fresh checkout. That included the merge gate's test run for the docs-only run `3445c2c1`, whose held reason was that failure.
3. **The fix for the known miss went to the desk first** (personas `8fe3fbfb76`). `redact_text` keeps a value that is already the marker. `is_marker(lead, core)` is true when the unwrapped core is exactly `redacted` and the leading wrappers end with `[`. Trailing wrappers are not checked, because an outer unwrap can already have removed them (the JSON case `{"client_secret":"[redacted]"}`). The check sits in both branches of `mask_core` and in the forced branch of `mask_token`. `DB_PASSWORD=redacted` is still masked.
4. **Fixture v2 replaces v1 in both repos.** personas `4dcd9f18b4` holds `fixtures/redact-text-v2.json`: the 62 v1 cases byte-identical and in order, plus 9 new ones (7 already-masked positions and 2 negatives). That is 71 cases, 19979 bytes, blob `30e4030c8607b4cf9c693143a190d4f2c65602a9`. v1 is removed from both repos. personas-web `7018a456` copies v2 byte for byte and adds `isMarker` in the same three places. It replaces `NOT_IDEMPOTENT` with a fixed-point test over every case (`redactText(expected) === expected`). The desk has the same test (`every_fixture_expected_is_a_fixed_point`).
5. **One negative is pinned as the desk outputs it.** `DB_PASSWORD=[redacted]hunter2` becomes `DB_PASSWORD=[[redacted]`. The App Master accepted it. `hunter2` is gone, the output is a fixed point, and it follows the wrapper-keeping rule v1 already pins for a bracketed secret.
6. **The say's "too long" edge was closed with copy only** (`3fccfd41`). `mobileCopy.say.errors.message_too_long` now says that keys hidden as `[redacted]` made the direction longer than the limit. The counter still counts the typed text.

## Alternatives that lost

- **Masking review notes only on the desk** (call 1). It leaves a pasted key in the `pending_commands` row's params until the desk's terminal write.
- **Loosening the LF test to accept CRLF** (call 2). It stops checking byte parity with the desk. Changing one machine's git config also lost: it fixes one checkout and not the repo.
- **Fixing the port alone** (call 3). It breaks the shared fixture, as the earlier record's call 5 said. A wider predicate such as any bracketed value also lost: it would let a bracketed real secret through.
- **Editing v1 in place** (call 4). A stale copy would pass silently, where a version bump fails the test that asserts version 2. Keeping v1 beside v2 also lost: it leaves two sources of truth.
- **A v3 with a special case for the negative** (call 5). It would change both repos for a display difference.
- **Counting the masked text in the live counter** (call 6). It would run the masker on every keystroke and show a number the operator did not type.

## Consequences

- A direction or note already masked on the phone is stored as sent by a desk that carries `8fe3fbfb76`. The desk build cut at personas `57d305c7aa` does not contain it (`git merge-base --is-ancestor 8fe3fbfb76 57d305c7aa` exits 1). Until a newer desk build is installed, the desk still stores `DB_PASSWORD=[[redacted]]`.
- Call 5 means a secret-named key followed by `[redacted]` and more text is stored with a leftover bracket. This is a display difference only.
- Not live-verified. No paired phone has sent a masked say or note to a running desktop. The proof is the 71-case fixture, tested on both sides.
- Reopen trigger: any change to `redact_text` means a new fixture version, copied byte for byte, and the port follows it. Never edit the fixture or the port to make one case pass.

## Evidence

personas-web: `188bec8a` (review notes), `7aba4178` (LF pin), `3fccfd41` (copy), `7018a456` (port follows v2), `06683609` (docs), `e454b7b9` (the say wiring). personas: `8fe3fbfb76` (the rule), `4dcd9f18b4` (fixture v2), `57d305c7aa` (the desk build that lacks the rule). Sources: the `brief.md` and `result.json` files of runs `5a0cfe45`, `6c6a17cd`, `d945989e` and `d221b462`, and the held reason in the `run.json` of `3445c2c1`. Related: [the phone-masks record](2026-10-09-phone-masks-before-signing.md).
