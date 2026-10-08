# Weekend phone origin: Tailscale Serve over private HTTPS

## Context

The phone must open a web build that reads Supabase. Pairing and command signing run in the browser with WebCrypto (`src/lib/commands/signer.ts:43` requires `crypto.subtle`; key generation and signing are at `signer.ts:37` and `:96`; the HMAC pairing proof is at `src/lib/commands/pairing.ts:39`). `crypto.subtle` exists only in a secure context, so the origin must be HTTPS. The brief forbids deploy, push and production data.

The desktop's pairing QR pointed at a hardcoded `https://personas.so/dashboard/settings#pair=` in `src-tauri/src/cloud/pairing.rs` (personas, before `0706c0d811`), and `personas.so` does not resolve (NXDOMAIN). Whoever registered it would receive every QR's pairing secret.

## Decision

Operator decision of 2026-10-08, about 11:40 local, relayed by the Director. Tailscale Serve. The operator installs Tailscale on the desk and the phone. The Director serves a production build of `revamp/stage-fit` with `NEXT_PUBLIC_DATA_SOURCE=supabase` over private HTTPS on a stable `*.ts.net` name. Nothing is deployed or pushed.

## Alternatives that lost

Reconstructed from the constraints; the options the operator was offered are not recorded in this repo.

- **`personas.so`.** Does not resolve, and leaks pairing secrets to whoever registers it.
- **A plain-http LAN address.** Not a secure context, so WebCrypto is unavailable and neither pairing nor signing works.
- **A public deploy.** Forbidden by the brief.

## Consequences

- The phone works only while the tailnet and the Director's served build are up.
- The pairing QR must open the `*.ts.net` origin, not the default. The operator-only pairing origin setting is on personas master as `0706c0d811` (`cloud_pairing_origin_get` / `cloud_pairing_origin_set`; the default stays `https://personas.so` when unset). See [Status, 2026-10-08 evening](#status-2026-10-08-evening) for which run landed it.
- The `*.ts.net` name is not recorded here.

## Evidence

personas-web: `src/lib/commands/signer.ts:37,43,96`; `src/lib/commands/pairing.ts:39`. personas: `0706c0d811` on master (its message states the hardcoded origin and the NXDOMAIN reason); `src-tauri/src/cloud/pairing.rs:52` (`DEFAULT_PAIRING_ORIGIN`). The secure-context requirement is a platform fact, not tested here. Source: the operator's decision relayed by the Director.


## Status, 2026-10-08 evening

The sections above are not edited. Run `afe2afb6` (item B) merged on personas master as `0706c0d811`, `3e3ed19246` and `53d746b537` (verify with `git -C C:/Users/kazda/kiro/personas log --oneline 0706c0d811~1..53d746b537`). The setting is the Pairing address field in the desktop's Paired phones panel.

Open and undecided: when the address is unset, the QR still falls back to `https://personas.so`, which does not resolve, so a user who never sets the address would send pairing secrets to whoever registers that domain. The served `*.ts.net` name is still not recorded.
