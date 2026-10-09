# The SSE routes need a verified session, and production script-src drops 'unsafe-eval': two calls

## Context

Scan `d4b90e7a` found two holes on the origin that holds a paired phone's non-extractable signing key.

Finding F2: `/api/events/stream` and `/api/executions/[id]/stream` still attached `TEAM_API_KEY` for any anonymous caller. [The proxy-key record](2026-10-07-proxy-key-session-gated.md) gated the REST proxy and left these two routes out of scope.

Finding F5: `script-src` allowed `'unsafe-eval'` on every route. Any script that runs on that origin can use the IndexedDB key, so every script permission counts.

Both fixes merged on `revamp/stage-fit` without a record. This record keeps them and the open nonce step.

## Decision

Two calls, and one item left open.

1. **Both SSE routes are gated the same way as the REST proxy** (`050c9709`, docs `ad0b569c`). The checks run in this order: orchestrator config (503 `orchestrator_not_configured`), then `verifySession` on `x-user-token` (503 `auth_unavailable`, 401 `unauthenticated`), then `ORCHESTRATOR_TARGET=desktop` (501 `not_on_desktop`), then, for executions only, the path check (400 `bad_path`). Only after all of them does the team key go upstream. 13 tests cover it. `ad0b569c` corrects `docs/features/dashboard/events.md` and `executions.md`.
2. **In production, `script-src` is `'self' 'unsafe-inline'`, with no `'unsafe-eval'`** (`411aac3f`). `next dev` keeps `'unsafe-eval'` because React Refresh needs it. `'wasm-unsafe-eval'` was not added. The client bundle has no `eval(`, no `new Function(` and no `WebAssembly`. The only `Function('return this')` hits are unreachable `globalThis` fallbacks in core-js and decimal.js. shiki runs `createJavaScriptRegexEngine` (`src/components/guide/blocks/CodeFence.tsx`). `'unsafe-inline'` stays until the nonce step. `e2e/csp.spec.ts` is the proof.
3. **Open, decided by nobody: the nonce step (F5 part 2).** It is designed and not built. The design puts a `src/proxy.ts` nonce with `'strict-dynamic'` on `/dashboard`, `/dashboard/[view]` and `/demo`, so those 17 pages become dynamic. The root layout's theme script is covered by its hash (`sha256-+qF/kzGcyyX3RuwZ3itFLiN3kTs8SdmZRkT4TsYCL58=`) and does not make the whole site dynamic. The hash cannot join the global policy while static pages need `'unsafe-inline'`, because a CSP2+ browser ignores `'unsafe-inline'` once a hash or nonce is present. The first step belongs to the operator: the dynamic-rendering cost, how every entry into the dashboard gets a fresh document, and the remaining risk that an XSS on any same-origin static page can still use the IndexedDB key. The App Master asked on 2026-10-09. No answer yet.

## Alternatives that lost

- **A token in the EventSource query string** (call 1). It follows from the constraint that `EventSource` sends no header, so the browser cannot send `x-user-token`. No commit or run result shows it was tried. It would put a session token in URLs and logs, so it was not built.
- **Leaving the streams open** (call 1). The commit message names this as the hole. The key went upstream for any anonymous caller. No target the project runs serves either stream, so closing them loses nothing that works.
- **Keeping `'unsafe-eval'` everywhere** (call 2). It is the state before `411aac3f`. The bundle needs no eval, so the permission bought nothing.
- **Adding `'wasm-unsafe-eval'` just in case** (call 2). The run result weighed it and left it out because no WebAssembly runs in the browser.
- **A bare `eval('1')` as the positive control** (call 2). It was tried first. Playwright's `addScriptTag` runs in a DevTools evaluate that CSP exempts, so nothing was reported. The control defers the eval through `setTimeout` and is caught.
- **Building the nonce tonight** (call 3). It follows from the constraint above: it makes 17 pages dynamic, and that cost is the operator's call.

## Consequences

- A third-party script that evals is now refused in production. `e2e/csp.spec.ts` walks every smoke route, a guide topic with a code block, `/m` and the dashboard through `/demo`, and is what catches it. Adding such a script means the spec fails first.
- The Turbopack production gap is open. The proof build was `next build --webpack`, because Turbopack refuses the worktree's junctioned `node_modules`. A static grep of a Turbopack build agreed. A Turbopack production run under the new header has not happened. To close it, run `PLAYWRIGHT_PORT=<free port> npx playwright test e2e/csp.spec.ts` in the main checkout.
- The SSE streams stay unused until a target serves them with a token the browser can send. Today a browser stream request is refused and the UI keeps polling. The desktop serves neither stream, so no working stream was lost.
- `'unsafe-inline'` is still in the policy, so an injected inline script still runs. Call 3 is the step that would change that.
- Not live-verified. The SSE proof is 13 unit tests with a mocked upstream. The CSP proof is the spec against a webpack production build.
- Reopen trigger: a target serves a stream, the nonce step is decided, or the Turbopack run shows a violation.

## Evidence

personas-web: `050c9709` (SSE gate, 13 tests), `ad0b569c` (docs), `411aac3f` (production script-src and `e2e/csp.spec.ts`, 16 passed). Related: `dfc34a4f` retired the phone redirect and is not part of this change. Sources: the `result.json` files of runs `a0eff604` (SSE gate) and `7d08c921` (CSP and the nonce design). Related: [the proxy-key record](2026-10-07-proxy-key-session-gated.md).

## Status, 2026-10-09

The operator decided call 3 as "not now" (ask `f95629a2`). `'unsafe-inline'` stays as an accepted risk until a deployment is planned: [the accepted-risk record](2026-10-09-accepted-risk-unsafe-inline-script-src.md).
The eval refusal (`411aac3f`) stays.
