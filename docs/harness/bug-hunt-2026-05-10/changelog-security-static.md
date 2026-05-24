# Bug Hunter — Changelog, Security & Static Pages

> Total: 7 findings (Critical: 0, High: 1, Medium: 4, Low: 2)
> Scope: 7 files in scope + 4 supporting files (LegalContent, policy-changelog, format-date, ArchitectureFlow)
> Date: 2026-05-10

---

## 1. Stale homepage Changelog drifts silently from `data/changelog.ts`

- **Severity**: High
- **Category**: Silent failure / data drift
- **File**: `src/components/sections/Changelog.tsx:15-31`
- **Scenario**: A contributor publishes release `0.13.0` by editing `src/data/changelog.ts`. The full `/changelog` page updates, but the homepage "Recent updates" section continues to advertise `0.12.0` as the newest release because `Changelog.tsx` ships its own hardcoded `releases: Release[]` array (lines 15-31).
- **Root cause**: The component intentionally hardcodes a 3-release subset instead of importing `RELEASES` from `@/data/changelog` and slicing. There is no compile-time link between the two arrays.
- **Impact**: Marketing site can show outdated "latest features" for weeks after a real release, and the dates can also fall behind. Worse: the duplicated `Release` interface (line 9-13) lacks `summary` constraints so the two sources can disagree on summary text without any error.
- **Fix sketch**: Replace the hardcoded array with `import { RELEASES } from "@/data/changelog"` and `RELEASES.slice(0, 3)` (or a sort-by-date + slice if order is not guaranteed — see finding #4). Delete the duplicated `Release` interface.

---

## 2. New visitors never see the "Updated" policy badge — silent miss

- **Severity**: Medium
- **Category**: Silent failure / UX assumption
- **File**: `src/data/policy-changelog.ts:63-67`
- **Scenario**: A user visits `/legal` for the very first time after a major privacy-policy update. They expect to see "Updated" / "What changed" affordance — but `hasUnseenUpdate()` returns `false` because `lastSeen === null`, so no badge, no auto-expanded changelog.
- **Root cause**: The deliberate early-return `if (lastSeen === null) return false;` (with comment "don't surprise the user with a 'New' badge") confuses two distinct populations: returning users with no localStorage entry (e.g. cleared cookies, private mode, new device) and brand-new users. Both get treated as "no surprise" — but the returning-user case is precisely when a heads-up is most valuable.
- **Impact**: After GDPR-relevant policy changes, a non-trivial fraction of users (anyone who clears storage / uses a new browser) will never be informed of the change despite the infrastructure being designed to inform them. This is also a compliance smell for any jurisdiction that requires conspicuous notice of material policy changes.
- **Fix sketch**: Distinguish the cases: write a `firstSeenAt` timestamp on first visit (separate key); if `firstSeenAt < latestUpdateIso`, show the badge. Or simpler: use a deployment-time `INITIAL_KNOWN_DATE` constant; `lastSeen ?? INITIAL_KNOWN_DATE < latestUpdateIso`.

---

## 3. RELEASES rendered in array order, not date order — out-of-order timeline

- **Severity**: Medium
- **Category**: Latent failure / data invariant violation
- **File**: `src/app/changelog/page.tsx:84-185`
- **Scenario**: A contributor adds a hotfix `0.11.3` (dated `2026-02-20`) to `RELEASES` by appending it at the bottom of the array (because that's where their cursor was). The "Latest" pill correctly attaches to `0.12.0` (because `latestVersion` is computed by max-date — see lines 42-53), BUT the visual timeline still renders in array order, so users see `0.12.0 → 0.11.2 → 0.11.0 → 0.10.0 → ... → 0.4.0 → 0.11.3` with the hotfix dangling below the oldest 2025 release.
- **Root cause**: Line 84 maps `RELEASES` directly without sorting. The author was aware that array order is unreliable (the same comment at line 39-41 explicitly says "RELEASES has no sort-order invariant") yet only fixed the "Latest" detection — not the rendering order.
- **Impact**: Strange-looking changelog, broken vertical timeline rail, and the in-page anchor map (`scrollMapItems`, lines 30-37) lists versions in array order rather than date order, so the navigator says `0.12.0, 0.11.2, ..., 0.4.0, 0.11.3` and clicking a label jumps unexpectedly.
- **Fix sketch**: `const SORTED_RELEASES = useMemo(() => [...RELEASES].sort((a,b) => Date.parse(b.date) - Date.parse(a.date)), [])` and use `SORTED_RELEASES` everywhere — including for `scrollMapItems`.

---

## 4. Malformed release date silently renders "Invalid Date"

- **Severity**: Medium
- **Category**: Edge case / silent failure
- **File**: `src/lib/format-date.ts:12-31` + `src/data/changelog.ts:24-142`
- **Scenario**: A contributor writes `date: "Feb 28, 2026"` or `date: "2026-2-28"` (no zero-padding) or `"2026-13-45"` in `RELEASES`. TypeScript only enforces `string`. `new Date("Feb 28, 2026" + "T00:00:00Z")` returns Invalid Date, and `toLocaleDateString` on it returns the literal string `"Invalid Date"`.
- **Root cause**: No runtime validation in `formatDateLong` / `formatDateShort`, and no narrower type than `string` for `Release["date"]`. Also affects `latestVersion` (line 42-53): `Date.parse` returns NaN, the `!Number.isNaN(ts)` check silently skips that release, so a malformed date can never become "Latest" even if it's actually newest.
- **Impact**: Production page renders "Invalid Date" next to a release; QA might not notice. Combined with finding #3, the malformed entry also gets ranked at `-Infinity`-equivalent and pushed to the wrong place in any future sort.
- **Fix sketch**: Add a regex guard in `format-date.ts`: `if (!/^\d{4}-\d{2}-\d{2}$/.test(iso)) { console.warn(...); return iso; }`. Or stronger: a build-time validator that imports `RELEASES` and throws on malformed dates. Same fix for `policy-changelog.ts` `latestUpdateIso`.

---

## 5. Duplicate / malformed version creates duplicate React keys & DOM ids

- **Severity**: Medium
- **Category**: Edge case / collision
- **File**: `src/app/changelog/page.tsx:26-27, 87-89, 159`
- **Scenario**: Two scenarios. (a) A contributor accidentally pastes the same version twice (e.g. two `0.11.0` entries during a merge conflict). React renders both, throws a duplicate-key warning, but doesn't crash; both `<motion.div id="release-0-11-0">` elements coexist in the DOM, breaking `document.getElementById` and the `#release-0-11-0` hash anchor — the browser scrolls to whichever comes first regardless of intent. (b) A version like `0-12-0` collides with `0.12.0` after `replace(/\./g, "-")`.
- **Root cause**: `releaseSectionId` (line 26-27) is not injective (only periods → hyphens, no escaping), and `release.version` is used directly as the React key without dedup. The change list also uses `key={j}` (line 159), which is a separate but classic anti-pattern that breaks animation continuity if changes get reordered.
- **Impact**: Anchor links silently land on the wrong release; in extreme cases two `<li id="...">` elements can confuse screen readers. Hard to debug in the wild because no error surfaces.
- **Fix sketch**: Make `releaseSectionId` injective (`release-${encodeURIComponent(version)}`) and assert uniqueness at module load: `if (new Set(RELEASES.map(r=>r.version)).size !== RELEASES.length) throw …`. For change items, prefer a stable id or `${release.version}:${j}:${change.text}`.

---

## 6. `LegalContent` hash parser strips only the first `#`, drops query-like suffixes

- **Severity**: Low
- **Category**: Edge case
- **File**: `src/app/legal/LegalContent.tsx:38-43`
- **Scenario**: A campaign URL like `/legal#cookies?utm_source=newsletter` arrives in the wild (some email clients append tracking params after the fragment). `window.location.hash` is `#cookies?utm_source=newsletter`. After `.replace("#", "")` the value is `cookies?utm_source=newsletter`, which fails `TABS.some((t) => t.id === hash)`, so the page silently falls back to the Privacy tab.
- **Root cause**: Naive hash parsing instead of `decodeURIComponent(window.location.hash.slice(1).split(/[?&]/)[0])`. Same bug appears in the `hashchange` listener (line 78-88) so it also misroutes runtime navigations.
- **Impact**: Marketing/email links targeting the cookies or terms tab silently land on Privacy. Discoverable only through analytics or user reports.
- **Fix sketch**: Tokenize: `const raw = window.location.hash.slice(1).split(/[?&]/)[0]; if (TABS.some(t => t.id === raw)) return raw as TabId;`

---

## 7. `external` channel cards trust a non-runtime-validated URL — no `noreferrer` enforcement on internal links + meaningless GitHub URL

- **Severity**: Low
- **Category**: External link safety / data smell
- **File**: `src/app/community/data.ts:17, 50` and `src/app/community/ChannelCard.tsx:101-116`
- **Scenario**: `GITHUB_URL = "https://github.com"` (line 17) — points at GitHub's homepage, not the project repo. Anyone clicking "View on GitHub" leaves the site on a generic destination. Separately, the `external: boolean` flag is the only thing controlling whether `target="_blank" rel="noopener noreferrer"` is applied; a future contributor who flips `external` to `false` for an external URL drops the `rel` attribute entirely (security regression — opener-tab attack on older browsers, plus `Referer` leakage).
- **Root cause**: (a) Placeholder URL was never replaced with the real repo URL; this is data, not code, so no test catches it. (b) `external` doubles as "open in new tab" AND "is non-relative URL" — two concepts conflated. There is no runtime check that `external && href.startsWith("http")` or that `!external && href.startsWith("/")`.
- **Impact**: Users land on a useless page; CTA promise ("contribute to the project") fails. The `external` boolean coupling is a footgun for future authors.
- **Fix sketch**: Replace `GITHUB_URL` with the real repo URL. Derive `external` from the URL itself: `const isExternal = /^https?:/.test(channel.href);`, then always emit `rel="noopener noreferrer"` for any `target="_blank"` anchor. Add a test/lint that no `CommunityChannel` with `external: true` has an internal href and vice versa.
