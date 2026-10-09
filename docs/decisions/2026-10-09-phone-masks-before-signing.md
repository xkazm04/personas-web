# The phone masks a say before signing: five calls made porting redact_text

## Context

A `channel_say` carries free text the operator typed or pasted, and the signed command lands in a cloud row. The desk already masks credential-looking tokens in a say when it arrives, but until then the row's params hold whatever the phone sent. Runs `48226f7e` (the port) and `ac09e27a` (the wiring) closed that gap on the phone side. Each made small calls that the commits do not explain. This record keeps them.

## Decision

Five calls.

1. **The phone masks the say before signing.** `redactText` (`src/lib/commands/redactText.ts`, `dccf5776`) is called by `channelSayParams` (`e454b7b9`) after the trim and the typed bound. The signed message is the masked text, so a pasted key never reaches the cloud row. The desk still masks on arrival.
2. **The port is faithful, pinned by a shared fixture.** `fixtures/redact-text-v1.json` is copied byte for byte from personas `ddae928324`: 62 cases, 18477 bytes, LF line endings. The semantics that differ between Rust and JS are fixed to the Rust: every Rust `len()` becomes a UTF-8 byte length through `TextEncoder`; whitespace is Unicode White_Space, not JS `\s` (they differ at U+0085 and U+FEFF); the character class predicates are ASCII-only. The port also needed `key_is_secret` and `value_looks_secret` from `rows.rs`. It adds no dependency.
3. **Two bounds.** The typed text and the masked text are each held to `SAY_MAX_CHARS`, 2000 code points. Masking can lengthen a short value: `DB_PASSWORD=hunter2` becomes `DB_PASSWORD=[redacted]`. The desk bounds the message as it arrives, so the phone checks the masked text too.
4. **The length tests use ordinary words.** Two `channelSay` tests sent `'a'.repeat(2000)`. The density rule masks a dense run of that length to `[redacted]`, and the desk would too. The App Master ruled that the tests change. They now use a `words(n)` helper, and each first asserts that `redactText` leaves its message unchanged. A new test pins `'a'.repeat(2000)` to `[redacted]`.
5. **A known miss stays as it is.** The desk's `redact_text` is not idempotent on 14 of the 62 cases: masking reads an existing `[redacted]` as a bracketed value, so `NAME=[redacted]` is stored as `NAME=[[redacted]]`. The port mirrors this, and the `NOT_IDEMPOTENT` set in `redactText.test.ts` names the 14 cases and asserts that each really is not idempotent. The effect is cosmetic and nothing leaks. The fix belongs to the desk and has not been made.

## Alternatives that lost

- **Masking only on the desk** (call 1). It leaves the key in the signed row's params until the desk's terminal write clears them.
- **A JS-native approximation** (call 2). It would drift from the desk on non-ASCII input, where byte length, whitespace and character classes all differ from their JS defaults.
- **A typed bound only** (call 3). The masked text could then exceed the cap the desk enforces, and the desk would refuse a say the phone had accepted.
- **Exempting dense runs on the phone** (call 4). It would break parity with the desk, which masks them.
- **Fixing the idempotency miss in the port alone** (call 5). It would break the shared fixture, which pins the desk's output.

## Consequences

- Call 3 has an open edge. A say typed under 2000 code points whose masking lengthens it past 2000 is refused with `message_too_long` while the counter reads under the cap. A test pins the exact-2000 case. Fixing the edge needs only copy.
- Call 5 means a say that already contains `[redacted]` after a secret-named key is stored with doubled brackets. This is a display difference only.
- Reopen triggers. If the desk makes `redact_text` idempotent, or changes it in any way, re-copy the fixture, let the port follow it, and drop `NOT_IDEMPOTENT`. Never edit the fixture or the port to make one case pass.
- Not live-verified. No paired phone has sent a masked say to a running desktop. The proof is the 62-case fixture on the phone side and the desk's own test of the same fixture.
- In a checkout with `core.autocrlf=true` the fixture is written with CRLF (18792 bytes) and the LF check in `redactText.test.ts` fails, while the committed blob is correct. That is a checkout effect, not a change to the record.

## Evidence

personas-web: `dccf5776` (port, fixture and tests), `e454b7b9` (wiring and test changes), `758a44b2` (docs). personas: `ddae928324` (the fixture and the desk's test of it). Sources: the `brief.md` and `result.json` files of runs `48226f7e` and `ac09e27a`. Related: [the phone say hardening record](2026-10-08-phone-say-hardening-calls.md) and [the channel_say record](2026-10-08-weekend-directions-channel-say-verb.md).
