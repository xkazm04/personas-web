# ACCEPTED RISK: production `script-src` keeps `'unsafe-inline'`, and the nonce step waits until a deployment is planned

## Context

Scan `d4b90e7a` finding F5 asked for a nonce-based `script-src`. [The SSE and no-eval record](2026-10-09-sse-session-gate-and-production-no-eval.md) removed `'unsafe-eval'` in production (`411aac3f`) and left the nonce step open as call 3. The operator answered ask `f95629a2` on the morning of 2026-10-09 with "Not now, record the risk".

The ask told the operator four things:

- A nonce would make `/dashboard`, its 15 views and `/demo` render on every request.
- It protects only when every entry into the dashboard is a fresh page load.
- A script injected into any static page of the same origin could still use the key. Only a separate controller origin closes that.
- Nothing is deployed. The private Tailscale Serve origin ([the phone-origin record](2026-10-08-weekend-phone-origin-tailscale-serve.md)) was already the plan when he answered.

## Decision

Accepted risk, operator decision of 2026-10-09 (ask `f95629a2`). Record `'unsafe-inline'` as an accepted risk until a deployment of personas-web is planned. Keep the eval refusal (`411aac3f`). Move on to the remaining low findings. No code changes as a result of this record.

## Alternatives that lost

The ask offered these. All three lost for now.

- **A nonce with a separate dashboard root layout.**
- **A nonce with hard links into the dashboard**, so every entry is a fresh page load.
- **A design-only run for a separate controller origin.**

## Consequences

An injected inline script runs on every page, the dashboard included. While a tab is open, it can use the paired phone's non-extractable signing key to sign commands. The key cannot be read out, but it can be used.

What limits this today, each point checked:

- **(a) Production refuses eval.** `script-src` has no `'unsafe-eval'` (`411aac3f`), and `e2e/csp.spec.ts` is the proof. This closes string-to-code paths, not injected inline scripts.
- **(b) No dashboard component renders raw HTML.** `git grep dangerouslySetInnerHTML -- src` finds no hit under `src/components/dashboard`. It finds these, by kind:
  - JSON-LD scripts built with `safeJsonLd`: `src/app/page.tsx`, `src/app/blog/[slug]/page.tsx`, `src/app/blog/layout.tsx`, `src/app/security/layout.tsx`, `src/app/guide/page.tsx`, `src/app/guide/[category]/page.tsx`, `src/app/guide/[category]/[topic]/page.tsx`, `src/app/templates/[id]/template-detail/TemplateJsonLd.tsx`, and a doc comment in `src/lib/seo.ts`.
  - The root layout's theme script, a fixed string (`src/app/layout.tsx`).
  - A constant SVG sprite (`src/components/mobile-landing/hive/Glyphs.tsx`).
  - Shiki's highlighted output on guide pages (`src/components/guide/blocks/CodeFence.tsx`).
- **(c) The desktop's trust check bounds a signed envelope's lifetime.** In personas master `src-tauri/src/cloud/trust.rs`, the function `check` refuses an envelope whose `iat` is further in the future than the clock skew allows, or whose `exp` is more than the maximum age after `iat`. Its constants are `CLOCK_SKEW_SECS` (30) and `MAX_ENVELOPE_AGE_SECS` (5 minutes). It limits how long a stolen envelope works. It does not stop an injected script from signing a new one.

Also:

- The acceptance holds while nothing is deployed. Deploying without reopening this record is a breach of the decision, not an application of it.
- Not live-verified. Points (a) to (c) come from reading the spec, `git grep` and the desktop source.
- **Reopen trigger:** a deployment of personas-web is planned, a dashboard component starts rendering raw HTML, or a third-party script is added to the dashboard.

## Evidence

personas-web: `411aac3f` (no `'unsafe-eval'`, `e2e/csp.spec.ts`), `1daf416c` (the record whose call 3 this answers). personas (read only): function `check` and the constants `CLOCK_SKEW_SECS` and `MAX_ENVELOPE_AGE_SECS` in `src-tauri/src/cloud/trust.rs`, cited by name. Source: scan `d4b90e7a` F5, and the operator's answer to ask `f95629a2`.
