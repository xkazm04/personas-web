# Fix Wave 3 — Security & Compliance

> 6 commits, 6 findings closed (4 High, 2 Medium) — and the scan's demoted false-positive Critical (Sentry.metrics) is now defensively neutralized.
> Baseline preserved: tsc 0 → 0; eslint 0 errors/0 warnings on changed files. No unit runner; e2e needs a live server (not run).
> Branch: `vibeman/bug-test-fixes-2026-06-19`. Pre-existing uncommitted changes untouched.

## Commits

| # | Commit | Finding | Severity | Files |
|---|---|---|---|---|
| 1 | `b84b7a8` | shared-types #2 — getClientIp trusts x-vercel-forwarded-for off-platform | High | `lib/server/request.ts` |
| 2 | `27e9393` | error-monitoring #2 — PII scrubber passthrough past depth cap | High | `lib/sentry-pii.ts` |
| 3 | `ddbee35` | error-monitoring #4 — telemetry emit can throw into UI (+ neutralizes demoted Critical) | Medium | `lib/analytics.ts` |
| 4 | `9ef21e5` | visual-flow #1 — decodeFlow doesn't validate wires | High | `flow-composer/data.ts` |
| 5 | `b591bc8` | layout-nav #3 — error.tsx sends unscrubbed errors | Medium | `app/error.tsx` |
| 6 | `8b373ca` | layout-nav #2 — consent no cross-tab sync, can't be revoked | High | `CookieConsent.tsx`, `CookieSettingsButton.tsx` (new), `legal/policies/CookiePolicy.tsx` |

## What was fixed

1. **IP trust ladder.** `getClientIp` returned `x-vercel-forwarded-for` before the `TRUST_PROXY` gate; off-Vercel that header is client-spoofable, so an attacker could forge a fresh IP per request to mint a new rate-limit bucket. Now gated on `VERCEL === "1"` or `TRUST_PROXY`.
2. **PII scrub depth.** `scrubData` returned the raw subtree past `MAX_SCRUB_DEPTH`, leaking emails/UUIDs/denylisted keys nested deeper than 6 — the exact paths the 2026-05-10 fix closed, one level deeper. Now returns `"[redacted-depth]"` at the cap.
3. **Telemetry can't crash UI.** The consent-granted analytics path called `Sentry.metrics.count` un-try/caught while the flush path wrapped it. Extracted `safeCount` used by both. This also defensively closes the scan's contested "Sentry.metrics crash" finding (a missing/throwing metrics API is now swallowed).
4. **Share-flow wire validation.** `decodeFlow` validated node ids but cast `wires` through, so a garbage `#flow=` hash injected dangling wires (collapsing onto one coordinate, unremovable, with an attacker-controlled `label` rendered into the SVG). Now rejects the whole state on any malformed/dangling wire.
5. **Route-error scrub parity.** `error.tsx` sent raw `Sentry.captureException(error)` while `global-error.tsx` scrubs; the route boundary is higher-volume and `beforeSend` doesn't scrub `error.message`/`stack`. Now uses `captureExceptionScrubbed`.
6. **Consent withdrawal + cross-tab.** Consent had no cross-tab sync and no revoke path (GDPR/ePrivacy gap). Added a `storage` listener (sync accept/decline/clear across tabs) and a `reopenCookieConsent()` helper wired to a "Manage cookie preferences" button in the Cookie Policy.

## Verification

| Gate | Before | After |
|---|---|---|
| `tsc --noEmit` | 0 | 0 |
| ESLint (changed files) | n/a | 0 errors, 0 warnings |
| Unit tests | none | none (no runner) |
| Playwright e2e | needs live server | needs live server (not run) |

> `next build` not run per-wave (slow); changes are lib/server + a standard client-in-server-component import (CookiePolicy → CookieSettingsButton), tsc-clean. A full `next build` is planned at campaign end.

## Cumulative status (after Wave 3)

| Wave | Theme | Closed |
|---|---|---|
| 1 | Data correctness & durability | 6 (2C/3H/1M) |
| 2 | Success-theater & state corruption | 6 (6H) |
| 3 | Security & compliance | 6 (4H/2M) |
| **Total** | | **18 (2C/13H/3M)** + demoted Critical neutralized |

Remaining per INDEX: theme F (lifecycle/leaks — incl. the deferred timeline-pause + connection-status), G (time/numeric), J (dead-code), then the dedicated **test-infra** wave (vitest, theme A).
