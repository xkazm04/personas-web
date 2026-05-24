# Bug Hunter — Public Roadmap

> Total: 7 findings (Critical: 0, High: 3, Medium: 3, Low: 1)
> Scope: 9 files
> Date: 2026-05-10

## 1. Loader spinner stuck forever after 8s timeout

- **Severity**: High
- **Category**: Silent failure / dangling UI state
- **File**: `src/components/sections/roadmap/index.tsx:58-61`
- **Scenario**: Supabase pool is slow / Vercel function cold-start exceeds 8s. The fetch is aborted by `controller.abort()` from the timeout. The `.catch` swallows the AbortError, then `.finally` runs:
  ```
  if (!controller.signal.aborted) setLoading(false);
  ```
  Since the signal IS aborted, `setLoading(false)` never runs.
- **Root cause**: The guard inverts intent — it was meant to skip `setLoading(false)` only on unmount-driven aborts (where the component is gone), but it can't distinguish unmount from the 8s-timeout abort because both call `controller.abort()`. Result: timeout path leaves `loading=true` permanently.
- **Impact**: A small spinner (`<Loader2>`) remains visible above the roadmap content for the entire session every time Supabase exceeds 8s. The fallback items render below it, but the UI lies — it still claims to be loading.
- **Fix sketch**: Use a separate flag to disambiguate. E.g. `let didTimeout = false; setTimeout(() => { didTimeout = true; controller.abort(); }, 8000)` and in `.finally`, run `setLoading(false)` whenever `didTimeout` OR fetch resolved, only skipping on unmount (track via a `mounted` ref).

## 2. API route never sets `Cache-Control` — CDN may serve stale JSON for hours

- **Severity**: High
- **Category**: Caching / staleness
- **File**: `src/app/api/roadmap/route.ts:8-27`
- **Scenario**: `GET /api/roadmap` returns `NextResponse.json(...)` with no headers. On Vercel, route handlers default to `s-maxage=0` BUT some edge configs and middleware add `public, max-age=...`; more importantly there is no `dynamic = "force-dynamic"` or explicit `revalidate` export, so behavior on Next.js 16 is implicit. After a roadmap edit in Supabase, browsers and intermediate proxies may serve stale JSON for an unspecified window with no way to bust it.
- **Root cause**: Caching policy is undeclared. Next.js 16 Route Handlers without `dynamic`/`revalidate` exports default to dynamic, but downstream caches (browser, CDN, ISP) cannot tell when to revalidate without explicit `Cache-Control`.
- **Impact**: Recently-shipped items don't appear; recently-removed items linger; "in_progress" count drifts from reality. The whole point of dynamic Supabase reads is defeated.
- **Fix sketch**: Add `export const dynamic = "force-dynamic"` and `return NextResponse.json(payload, { headers: { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300" } })` (or `no-store` if freshness is paramount).

## 3. Unknown `status` / `priority` values from Supabase crash `RoadmapCard`

- **Severity**: High
- **Category**: Edge case / silent schema drift
- **File**: `src/components/sections/roadmap/components/RoadmapCard.tsx:29-31`, `data.ts:13-31`
- **Scenario**: Someone adds a new roadmap row with `status = "shipped"` (or `"in-progress"` with a hyphen, mirroring `roadmap-phases.ts`). The API doesn't validate, returns the row. Client does:
  ```ts
  const status = statusConfig[item.status]; // undefined
  const statusColor = brandColor(status.brand); // TypeError: Cannot read 'brand' of undefined
  ```
- **Root cause**: No runtime validation of the Supabase response against `RoadmapItem` enum. TypeScript types are erased at runtime; Supabase will happily return any row.
- **Impact**: A single row with an unexpected enum value crashes the entire roadmap section (React error boundary or white-on-white). Worse — it would not happen in dev (where the seed data is clean) but only in prod after a content editor adds a new status.
- **Fix sketch**: Filter unknown values in the API or in the client mapping: `if (!statusConfig[item.status]) return null` (or coalesce to `"planned"`). Ideally validate with a Zod schema in the route handler before returning.

## 4. `r.json()` parses 502 error body as success — pollutes UI state

- **Severity**: Medium
- **Category**: Silent failure
- **File**: `src/components/sections/roadmap/index.tsx:41-52`
- **Scenario**: Supabase column rename (e.g. `name` → `title`) causes route to hit the `error` branch and return `NextResponse.json({ items: [], source: "error" }, { status: 502 })`. Client's `fetch().then(r => r.json())` does NOT check `r.ok` — it parses the 502 body as `RoadmapResponse`. Since `data.source === "error"` (not `"supabase"`), neither branch sets `emptyFromSource` nor updates `items`. State remains `loading=true` until... well, see finding #1.
- **Root cause**: Missing `if (!r.ok) throw ...` after `fetch`. The "error" source string was added but the client never branches on it.
- **Impact**: On any Supabase schema breakage, the UI shows fallback items + a perpetual spinner with no error indication for the user, and no way for ops to notice (the 502 only shows in browser devtools).
- **Fix sketch**: Add `if (!r.ok) throw new Error(...)` after fetch, and add a third visible state for `data.source === "error"` (e.g. a small "Couldn't load latest" caption) so the failure is observable.

## 5. `null`/missing `sort_order` produces blank index badges and unstable order

- **Severity**: Medium
- **Category**: Edge case / silent failure
- **File**: `src/components/sections/roadmap/components/RoadmapCard.tsx:63`, `route.ts:19`
- **Scenario**: An editor adds a row in Supabase and forgets `sort_order` (column allows NULL). The API's `.order("sort_order", { ascending: true })` puts NULLs first by Supabase default. In `RoadmapCard`:
  ```tsx
  <div className="...font-mono text-base font-bold text-muted shrink-0">
    {item.sort_order}
  </div>
  ```
  Renders an empty badge (no value) where the number "1" would be — leaves a visually empty pill at top of the timeline.
- **Root cause**: No fallback in render; no NULLS LAST in the query; no validation in route.
- **Impact**: Confusing visual artifact and unstable timeline ordering whenever a row is missing `sort_order`. Multiple null rows shuffle randomly between requests (Supabase doesn't guarantee secondary sort).
- **Fix sketch**: `.order("sort_order", { ascending: true, nullsFirst: false })`, and in render `{item.sort_order ?? index + 1}`. Add server-side filter `WHERE sort_order IS NOT NULL` if NULLs should be hidden.

## 6. Static page `revalidate = 3600` does not refresh dynamic roadmap data

- **Severity**: Medium
- **Category**: Caching / mental model trap
- **File**: `src/app/roadmap/page.tsx:9-10`
- **Scenario**: Page declares `export const dynamic = "force-static"; export const revalidate = 3600;`. A reader assumes "the roadmap revalidates every hour." It does not — the page shell is static, but `<Roadmap />` is a client component that fetches `/api/roadmap` on mount. The `revalidate = 3600` value is meaningless here because nothing on the page uses Next.js data caching (no `fetch` in a Server Component, no `unstable_cache`).
- **Root cause**: Mismatch between declared revalidation intent and actual data flow. The data is fetched on every client mount, not every hour.
- **Impact**: Operators may believe stale data has at most a 1h TTL when it actually depends on the API's (undefined) cache headers and on browser cache. The opposite is also possible — they assume "force-static" implies "snapshot at build time" and worry the roadmap is frozen.
- **Fix sketch**: Either remove `revalidate` (it's a no-op here) or move data fetching server-side (`async` Server Component) to make `revalidate = 3600` meaningful, and remove the client-side `useEffect` fetch entirely (also fixes findings #1, #4).

## 7. `RoadmapProgress` is decoupled from Supabase data — public progress lies after a ship

- **Severity**: Low
- **Category**: Latent failure / coupling
- **File**: `src/components/sections/roadmap/components/RoadmapProgress.tsx:7-13`, `src/data/roadmap-phases.ts:260-266`
- **Scenario**: The `Phase X of Y complete` progress bar reads from `phaseCardData` (hardcoded array). The card list below it reads from Supabase. When a feature ships, an editor flips `status=completed` in Supabase but forgets to flip `completed: true` in `roadmap-phases.ts` (or vice versa). The two displays now disagree on the same page — bar says "8 of 15 complete" while the cards show 9 completed items.
- **Root cause**: Two sources of truth (Supabase rows vs static `phaseCardData`) for overlapping concepts (`Phase` ↔ `RoadmapItem`).
- **Impact**: Inconsistency erodes trust on the public roadmap. Marketing-sensitive numbers (progress %) drift from reality between deploys even when DB is current.
- **Fix sketch**: Compute progress in the API from `roadmap_items` (`completed` count / total) and pass to `RoadmapProgress` as a prop, or document that `phaseCardData` is the source of truth and demote Supabase rows to "current items in flight only."
