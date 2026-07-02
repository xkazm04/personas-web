# Build Config & E2E Tests
> Next.js build/runtime config (Sentry, CSP, image formats) plus the 13-spec Playwright suite — the project's only automated test layer. · **Route:** n/a (build/test) · **Status:** Config + Playwright e2e

## What it does
Defines how personas-web builds and runs in production, and how it is verified end-to-end. `next.config.ts` wires Sentry source-map upload, modern image formats, env injection, and a full set of security headers (incl. a hand-tuned CSP). `playwright.config.ts` drives a single-browser (chromium) e2e suite that boots a real production build and exercises the public marketing/content routes through the browser. There is **no unit-test runner** — Playwright is the entire test pyramid here, so anything not reachable by a public route URL is effectively untested.

## How it works
**Build** (`npm run build` → `next build`): `next.config.ts` reads `package.json` for the version, injects `NEXT_PUBLIC_APP_VERSION`/`RELEASE_TITLE`/`RELEASE_DATE` as build-time env, sets `next/image` to emit AVIF→WebP (with allowed qualities `[75, 80]`), and attaches `securityHeaders` to every route via `headers()`. The whole config is wrapped in `withSentryConfig(...)`, which uploads source maps when `SENTRY_ORG`/`SENTRY_PROJECT` (and an auth token) are present and then deletes them so they never ship to the client (`next.config.ts:88-100`).

**Test** (`npm run test:e2e` → `playwright test`): Playwright's `webServer` runs `npm run build && npm run start -- --port 3002` and waits up to 120s for port 3002, with `reuseExistingServer: true` so a dev can keep a server running between runs (`playwright.config.ts:18-23`). Specs hit `baseURL` `http://localhost:3002`, run **serially** (`fullyParallel: false`, `workers: 1`), with `retries: 0` and `trace: "on-first-retry"` (which, with zero retries, means traces effectively never capture — see gotchas). Each spec is a `test.describe` of `page.goto(route)` + role/text/`data-*` assertions.

## Key files
| File | Role |
| --- | --- |
| `next.config.ts` | Build/runtime config: Sentry wrap, image formats, env injection, security headers + CSP |
| `playwright.config.ts` | Test runner config: chromium project, baseURL :3002, `webServer` build-and-start, serial single-worker |
| `e2e/guide.spec.ts` | Largest spec (~25 tests): guide hub/sidebar/category/topic nav, markdown blocks, module badges, JSON-LD |
| `e2e/tour.spec.ts` | Largest describe set: Autopilot tour engine (homepage + /features + /roadmap), deep link, mobile, a11y |
| `e2e/cookie-consent.spec.ts` | Global consent banner: localStorage persistence, Accept All / Essential Only, legal link |
| `e2e/{blog,connections,templates,playground,legal,roadmap}.spec.ts` | Per-route content + filter/search/tab coverage |
| `package.json` scripts | `build` / `start` / `lint` / `typecheck` / `test:unit` / `test:e2e` |

## Data & state
- **Source:** route HTML/DOM served by the production build; guide spec also imports real data (`src/data/guide/topics.ts` `GUIDE_TOPICS`) to assert JSON-LD `numberOfItems`. **Stores:** browser `localStorage` keys asserted directly — `personas-cookie-consent` (`all`/`essential`), `personas-tour-seen` (`1`). **API routes:** none mocked/stubbed by the suite; tests run against the real build (dashboard mocks in `src/lib/mockApi.ts` are never exercised because no spec visits `/dashboard/*`). **Types:** `next` `NextConfig`; Playwright `defineConfig`. Build env types via `NEXT_PUBLIC_*`.

## Integration points
- **Sentry** — `@sentry/nextjs` `withSentryConfig` owns source-map upload; gated on `SENTRY_ORG`/`SENTRY_PROJECT`. CSP `connect-src` only adds `*.sentry.io` when `NEXT_PUBLIC_SENTRY_DSN` is set (`next.config.ts:49`). See Error Monitoring & Analytics doc.
- **Supabase** — CSP whitelists `https://*.supabase.co` + `wss://*.supabase.co` (wildcard per project ref) so REST/Realtime/Google sign-in aren't blocked (`next.config.ts:45-52`). No spec covers the Supabase voting/roadmap flow.
- **next/image** — `formats`/`qualities` must list every `quality=` value used by components (`CinematicBg`/`ImageBackground` use `80`); Next 16 serves only listed qualities.
- **Turbopack** — `turbopack.root` pinned to `__dirname` to disambiguate workspace root.

## Conventions & gotchas
- **(resolved 2026-07-02)** The four stale specs against deleted routes (`community`, `compare`, `download`, `use-cases`) were removed and the drifted templates/guide specs repointed at the current UI — the suite is 10 specs and fully green (2 CSR-bailout skips + 1 nav fixme). If a marketing route or page structure changes again, update its spec in the same change.
- **Coverage gaps that remain.** `dashboard-demo.spec.ts` smoke-covers `/demo` entry, dashboard home, and the `/m` shell via Try Demo — but the other 13 `/dashboard/*` pages, `/preview`, `/security`, and `/how` have no spec, and the roadmap spec only asserts static render text (**the Supabase voting flow is never tested**). Demo mode is in-memory: any `page.goto` resets it, so dashboard specs must re-enter via `/demo` or the sign-in prompt's Try Demo.
- **CI exists as of 2026-07-02** (`.github/workflows/ci.yml`): typecheck/lint/unit/i18n checks/build on push+PR; the Playwright job runs nightly + on dispatch only (full rebuild, ~10 min) and uploads traces on failure.
- **Skipped tests mask known breakage.** `connections.spec.ts` skips two modal tests due to a CSR-bailout (`useSearchParams` → `BAILOUT_TO_CLIENT_SIDE_RENDERING`) hydration flake where `onClick` times out under Playwright. The modal works in a real browser — it's a test-harness limitation, not a product bug, but it leaves the connector modal unverified. `guide.spec.ts` carries a `test.fixme` for the navbar Guide link pending the nav-exposure decision.
- **Flaky-by-design timing waits.** Playground (`Complete` within 15s) and tour auto-advance (`STEP2` within 25s, audio-`ended`-driven) assert on simulated/real-time delays; these are timing-sensitive and the first to flake on a slow CI box. `retries: 1` (with `trace: "on-first-retry"`) records a trace on the first failure.
- **Serial, single-worker, full rebuild.** `workers: 1` + `fullyParallel: false` + a `next build` in `webServer.command` makes the suite slow; `reuseExistingServer` is the local escape hatch (start the server once, re-run specs) and is disabled under `CI` so pipelines never test a stale server.
- **Selector fragility.** Many assertions are loose substring/`/regex/i` `main` text matches (e.g. `toContainText("everything")`, `/Discord|community/i`) that survive copy changes but won't catch a wrong-page render; others hard-code copy ("Our Commitment to Privacy", "bank-grade encryption") and break on wording edits.
- **CSP uses `'unsafe-inline'`/`'unsafe-eval'` for scripts** (`next.config.ts:37`) — required by Next's inline runtime but worth noting as a relaxed policy if tightening security.

## Related docs
- [Error Monitoring & Analytics](error-monitoring-analytics.md)
- [Feature index](../INDEX.md)
