# Fix Wave 10 — Hydration / SSR correctness (theme T11)

> 2 commits, 3 findings closed (3 High).
> Baseline preserved: tsc 0 → 0 · vitest 64/64 → 64/64 · 0 regressions.
> Production `next build` run this wave (SSR/segment behavior isn't tsc-visible).

## Commits

| # | Commit | Findings closed | File(s) |
|---|---|---|---|
| 1 | `1db3162` | orchestration-platform-visualizers #1, blog #1 | event-bus-showcase/index.tsx, blog/[slug]/page.tsx |
| 2 | `a1b97a4` | how-it-works-changelog #2 | StageSection.tsx, how/page.tsx |

## What was fixed

1. **`#flow=` hydration mismatch** — `EventBusShowcase` initialized `composerOpen` from `window.location.hash` inside the `useState` initializer, so a `#flow=` deep link rendered the composer branch on the client while the server HTML had the showcase branch → hydration error + flash on the exact path the hash exists for. Now starts `false` with the hash read in a post-mount effect; `onClose` also preserves the query string when clearing the hash.
2. **Staged-post 404 cached forever** — the blog article segment exported no `revalidate`, so a pre-date 404 for a future-dated post was cached by the full route cache and kept serving after the publish date. Added `revalidate = 3600`, matching the feed route.
3. **`/how` deep-link anchors inside lazy chunks** — the scroll-map / deep-link ids lived only inside `ssr:false` sections, absent from server HTML, so `/how#event-bus` never scrolled on first load and pre-mount scroll-map clicks no-op'd. The ids now sit on the always-present `StageSection` wrappers (`scroll-mt-24` added); the browser scrolls to the first match at every load stage.

## Verification

| | Before | After |
|---|---|---|
| tsc | 0 | 0 |
| vitest | 64/64 | 64/64 |
| next build | — | run this wave |

## Note / tradeoff

The `/how` wrapper ids intentionally match the inner shared components' ids (e.g. `event-bus`). Once a lazy chunk mounts there are two elements with that id; the browser resolves to the first (the outer wrapper), so scrolling stays correct — a validation duplicate-id nit accepted in exchange for deep links that work at first paint. The inner ids are owned by components reused on other pages and can't be dropped per-page.

## Patterns established (catalogue items 18–19)

18. **Never seed branch-selecting state from a browser-only value in the render path** — reading `window.*` in a `useState` initializer diverges the client's first render from the server HTML (a `typeof window` guard hides the crash, not the mismatch). Start with the server value and set the client-only value in a post-mount `useEffect`.
19. **On-demand `notFound()` is cached by the full route cache** — a segment that can render a 404 which must later become live (staged/future-dated content) needs a `revalidate` window, or the 404 persists until redeploy. And deep-link / scroll anchors must live on elements present in the server HTML, not inside `ssr:false` lazy subtrees.

## What remains

T8 dead/unwired surface, T9 i18n, T14/T15, plus deferred sub-items (tour pause, terminal no-stop, knowledge type-bucket+legends, small T5 tail, theme rehydrate DOM-write, stats writable-FS). Per INDEX.md.
