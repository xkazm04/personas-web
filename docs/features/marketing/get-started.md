# Get Started & Download CTA
> The five-step "download to running agents" walkthrough (with per-step animated SVG visuals) plus the download CTA — platform pills, trust signals, and fresh-release detection. · **Route:** `/` (homepage section) · **Status:** Live

## What it does

Two stacked homepage conversion sections that turn an interested visitor into a download:

- **Get Started** (`#get-started`) — a five-step onboarding walkthrough that replaced the old `/tour` page. The steps are **Download & Launch → Connect Your Tools → Create a Persona → Let it work → Improve**. A row of numbered chips selects a step; the content card shows that step's title, time estimate, subtitle, description, a checklist of details, a faint per-step background illustration, and a bespoke **animated SVG visual** on the right (e.g. a connector grid, a persona-builder mock, a live event bus, a fitness-bar evolution chart). The walkthrough **auto-advances** on a timer and pauses on hover or when a chip is clicked.
- **Download CTA** (`#download`) — the closing call-to-action. Shows a version/release badge, heading, subtitle, a three-step "download → connect Claude Code → launch agent" mini-grid, the primary **Download for Windows** button, an "explore capabilities first" link, a privacy reassurance line, and a row of **platform pills** (Windows available; macOS/Linux open a waitlist modal). When a real download URL is configured it also shows **trust signals** (Requires Claude Code · installer size). A recently-dated release makes the version badge **pulse**.

## How it works

**Get Started shell** (`get-started/index.tsx`). `GetStarted` reads `TOUR_STEPS` (`src/data/tour.ts`) and the parallel `STEP_VISUALS` array (`visuals/index.ts`). It drives the active step with `useAutoCycle` (`src/hooks/useAutoCycle.ts`) at `AUTO_ADVANCE_MS` (= `CAROUSEL_INTERVAL_MS.default`, `get-started/data.ts:3`), pausing while `hovered` is true. Clicking a chip calls `setActive(i)` + `setPaused(true)` so it stays on the chosen step. The active step renders inside a `BrandCard` wrapped in `<AnimatePresence mode="wait">` for cross-fade transitions (`index.tsx:64`).

**Step chip** (`StepChip.tsx`). A `<button aria-pressed={isActive}>` showing the step number badge, lucide icon, and (≥`sm`) title. Active state uses inline `tint(brand, …)` styles for the border/background and `BRAND_VAR[brand]` for the icon/number color; inactive uses semantic glass tokens.

**Step content** (`StepContent.tsx`). A two-column grid (`lg:grid-cols-[1.1fr_1fr]`, `min-h-[440px]`). Left column: icon tile, "Step N · {timeEstimate}" mono label, title, italic subtitle, description, and a `Check`-bulleted `details` list — all keyed off `step.*` and themed with `BRAND_VAR`/`tint`. `StepBackdrop` lays a per-step PNG (`/imgs/get-started/step{N}-{dark,light}.png`) under a theme-specific horizontal gradient scrim so text stays legible (separate dark/light artwork + opacity). Right column renders the active `Visual`. The whole panel is a `motion.div` keyed on `step.id` that fades on enter/exit.

**Per-step SVG visuals** (`visuals/`). Five components, one per step, all sharing chrome from `visuals/chrome.tsx` (`VisualFrame`, `VisualBadge`, `VisualRow`, `SURFACE_GLASS`) and typed by `VisualProps` (`{ brand }`):
- `DownloadVisual` — a bobbing download icon (`y: [0,4,0]`, infinite) over Windows/macOS/Linux availability rows that slide in.
- `ConnectVisual` — a "Credential Vault · AES-256" badge over a 3-col grid of connector logos that spring in.
- `CreateVisual` — a prompt box with a blinking cursor (`opacity: [1,0,1]`, infinite) and a generated "PR Digest Persona" card.
- `WorkVisual` — a "Event bus · live" panel (pulsing dot) with five timestamped events; `STATE_COLORS.success` for done, brand color for active.
- `ImproveVisual` — a "Breeding cycle" badge over five fitness bars that grow from `height: 0` to their value.

`STEP_VISUALS` is a **parallel array** indexed by step position (visuals can't live in `/data/` without a JSX→data layering inversion). A dev-only length check logs an error if `STEP_VISUALS.length !== TOUR_STEPS.length` (`visuals/index.ts:33`).

**Release authority** (`src/lib/release.ts`). The one place that answers "is a download live", "which version does the site show" and "is the latest release fresh"; it is the only file in `src/` that reads `NEXT_PUBLIC_DOWNLOAD_URL`, `NEXT_PUBLIC_APP_VERSION`, `NEXT_PUBLIC_RELEASE_TITLE` or `NEXT_PUBLIC_RELEASE_DATE` (`release.test.ts` scans for it). `resolveDownloadUrl(raw)` is the rule — parseable, `https:`, host in `ALLOWED_DOWNLOAD_HOSTS` — returning `{ live: true, url }` or `{ live: false, reason: "unset" | "parse" | "protocol" | "host" }`. `downloadPlan(raw)` builds on it: per-platform status (`windows` is `"download"` only when the URL resolves; `macos`/`linux` are always `"waitlist"`) plus the primary action (`{ kind: "download", href: "/api/download", platform: "windows" }` or `{ kind: "waitlist" }`); `DOWNLOAD_PLAN` is the plan for this build and `ctaHref(plan)` gives a plain link's target (`/api/download` or the `#download-section` wrapper). `SITE_VERSION` is the website's package.json version (next.config.ts maps it; fallback `0.1.0`). `latestRelease(releases)` picks by max date; `isFreshRelease(date, now)` is the seven-day rule. The module never imports `@/data/changelog`, so the navbar can read it on every page without pulling the release history into the global chunk.

**Download CTA shell** (`DownloadCTA.tsx`). Reads the release authority at module scope. `DOWNLOAD_PLAN.primary` is the master switch: it flips the first download step between "Download installer" / "Join waitlist", swaps the primary button between a real `<PrimaryCTA href="/api/download">` (firing `trackDownloadClick("windows")`) and a waitlist-opening button, gates the `DownloadTrustSignals` block, and feeds `useDownloadPlatforms` so the Windows pill becomes "available." Because the plan is built on the same `resolveDownloadUrl` the route enforces, a URL the route refuses renders the waitlist, never "Download for Windows". The badge shows `v{SITE_VERSION} - {RELEASE_TITLE}`.

- **`useDownloadPlatforms(plan)`** (`download-cta/useDownloadPlatforms.ts`) — returns three `Platform` objects (Windows/macOS/Linux) with i18n labels and lucide icons. Each `available` is `plan.platforms[key] === "download"` (today only Windows can be). (Note: this is **not** real client OS sniffing — "platform detection" here is availability flags, not navigator-based detection.)
- **`useFreshRelease(releaseDate)`** (`download-cta/useFreshRelease.ts`) — runs `isFreshRelease` from the release authority (bare `YYYY-MM-DD` is treated as UTC midnight; otherwise `Date.parse`) and returns `true` if the release is < 7 days old. The date it receives is `releasePulseDate(RELEASE_DATE_ENV, latestRelease(RELEASES))`: the `RELEASE_DATE` env wins, and the changelog's latest date is used only when `PULSE_FROM_CHANGELOG` is on — it is **off** (see gotchas). Seeded in a lazy `useState(() => …)` initializer (React 19 purity rule — no `Date.now()` in render) and re-checked every 60s via `setInterval`. When `true`, the version badge gets `animate-badge-pulse`.
- **`PlatformPills`** (`download-cta/PlatformPills.tsx`) — available platforms render as static cyan pills with a glow dot; unavailable ones render as `<button>`s that call `onWaitlist(platform)` (→ opens `WaitlistModal`) and show the "notify me" label.
- **`DownloadStepGrid`** (`download-cta/DownloadStepGrid.tsx`) — three glass tiles for the mini "Step 1/2/3" sequence, `whileInView` stagger; each tile pulses a brand-tinted glow overlay once (its own `STEP_BRANDS = ["cyan","blue","purple"]`, unrelated to `TOUR_STEPS.brand`). Static tints are inline because framer-motion can't interpolate `color-mix()`.
- **`DownloadTrustSignals`** (`download-cta/DownloadTrustSignals.tsx`) — two dotted text signals ("Requires Claude Code" · installer size), rendered only when a download URL exists.

**`/api/download`** (`src/app/api/download/route.ts`). `PrimaryCTA` links here, not directly to the artifact. At module load the route runs `resolveDownloadUrl(RAW_DOWNLOAD_URL)` from the release authority — must be parseable, `https:`, and its host must be in `ALLOWED_DOWNLOAD_HOSTS` (github / personas.app CDNs) — preventing an env-var compromise from turning the route into an open redirect. On success it 302s to the URL; otherwise it redirects to `/#download` (the waitlist fallback). A misconfigured URL (`rejectionMessage` is non-null: parse/protocol/host) logs a warning and a Sentry `captureMessage` once per process; an empty env is the designed waitlist state and reports nothing.

**Arriving at `/#download`.** Thirteen off-home links (blog, guide topics, templates, security, playground, connections, the 404 page, and this route's own fallback) send visitors to `/#download`, but `id="download"` exists only after the `ssr: false`, viewport-gated section mounts, so the browser's fragment scroll and Next's layout-router both used to drop them at the top of the hero. `<LandingHashArrival />` (mounted in `src/app/page.tsx`) resolves the hash through `resolveLandingAddress` (`src/lib/landing-address.ts`) and runs the arrival protocol in `src/hooks/useHashArrival.ts`: it scrolls the always-present `[data-scroll-anchor="download"]` wrapper so the section mounts, lands on the section once it exists, moves focus to `#download-heading`, and holds the position for `REASSERT_MS` while skeletons above resolve. `#download-section` is an alias of the same address. `/#get-started` differs: its always-present wrapper in `page.tsx` renders `id="get-started"` itself (`wrapperId` === `anchorId`), so the mounted `GetStarted` section carries no id (a second one was invalid HTML, and `getElementById` returned whichever came first) and the resolver finds it through `LABELLED_INNER` as `[aria-labelledby="get-started-heading"]` inside the wrapper; `landing-address.test.ts` pins that the id is emitted exactly once. The primary waitlist button (no installer configured) pre-selects the visitor's own OS via `pickWaitlistPlatform(detectPlatformKey(), platforms)`, as the navbar does, instead of always opening the Windows list.

## Key files

| File | Role |
| --- | --- |
| `src/components/sections/get-started/index.tsx` | Get Started section shell; `useAutoCycle` chip/step driver |
| `src/components/sections/get-started/data.ts` | `AUTO_ADVANCE_MS` auto-advance interval |
| `src/components/sections/get-started/StepChip.tsx` | Numbered, brand-tinted step selector button (`aria-pressed`) |
| `src/components/sections/get-started/StepContent.tsx` | Two-column step card + `StepBackdrop` artwork scrim |
| `src/components/sections/get-started/visuals/chrome.tsx` | Shared visual chrome (`VisualFrame`/`VisualBadge`/`VisualRow`/`SURFACE_GLASS`) |
| `src/components/sections/get-started/visuals/types.ts` | `VisualProps` (`{ brand }`) |
| `src/components/sections/get-started/visuals/index.ts` | `STEP_VISUALS` parallel array + dev length assertion |
| `src/components/sections/get-started/visuals/{Download,Connect,Create,Work,Improve}Visual.tsx` | Per-step animated SVG/markup visuals |
| `src/data/tour.ts` | `TOUR_STEPS` content (title/subtitle/details/brand/icon/timeEstimate) |
| `src/components/sections/DownloadCTA.tsx` | Download CTA shell; env switches, primary button, modal |
| `src/components/sections/download-cta/downloadCtaTypes.ts` | `Platform` / `PlatformKey` types |
| `src/components/sections/download-cta/useDownloadPlatforms.ts` | Platform availability list (i18n labels) |
| `src/components/sections/download-cta/useFreshRelease.ts` | < 7-day release freshness flag (badge pulse) |
| `src/components/sections/download-cta/PlatformPills.tsx` | Available pills / waitlist buttons |
| `src/components/sections/download-cta/DownloadStepGrid.tsx` | 3-tile download step sequence with glow pulse |
| `src/components/sections/download-cta/DownloadTrustSignals.tsx` | CLI/installer-size trust line |
| `src/app/api/download/route.ts` | Allowlisted redirect to the release artifact (rule from `release.ts`) |
| `src/lib/release.ts` | Release authority: `resolveDownloadUrl`, `downloadPlan`/`DOWNLOAD_PLAN`, `ctaHref`, `SITE_VERSION`, `latestRelease`, `isFreshRelease`, `releasePulseDate` |
| `src/lib/release.test.ts` | Rule cases + source scans (one env reader, one allowlist, every CTA on the plan, displayed version unchanged) |
| `src/lib/landing-address.ts` | Home address resolver (aliases, inner ids), pure arrival `step()` table, `pickWaitlistPlatform` |
| `src/hooks/useHashArrival.ts` | Arrival runner: seek the wrapper, land + focus, re-assert, cancel on reader scroll |
| `src/components/LandingHashArrival.tsx` | Client leaf mounted in `page.tsx` that resolves the hash on load and on `hashchange` |

## Data & state
- **Source:** Static. Get Started content is `TOUR_STEPS` (`src/data/tour.ts`); visuals' inner data (connectors, prompt, events, fitness bars, platforms) is hardcoded inside each visual component. Download CTA config comes from `NEXT_PUBLIC_*` build-time env vars, read only by `src/lib/release.ts`.
- **Stores:** None (no Zustand). Local component state only: `useAutoCycle` (active index + pause) in Get Started; `waitlistPlatform` and `useFreshRelease`'s `fresh` in Download CTA.
- **API routes:** `GET /api/download` — validated 302 redirect to the artifact, or `/#download` fallback.
- **Types:** `TourStep` (`src/data/tour.ts`), `VisualProps` (`visuals/types.ts`), `Platform` / `PlatformKey` (`download-cta/downloadCtaTypes.ts`), `BrandKey` (`src/lib/brand-theme.ts`).

## Integration points
- **Brand theming:** `BRAND_VAR`, `tint`, `STATE_COLORS`, `BrandKey` from `src/lib/brand-theme.ts` drive every step/visual color (data-driven, so inline styles rather than tokens).
- **Motion primitives:** `useAutoCycle` (which wraps framer-motion's `useReducedMotion`), `fadeUp` (`src/lib/animations.ts`), `SectionWrapper`, `SectionIntro`/`BrandCard` primitives, `SectionHeading`, `GradientText`, `PrimaryCTA`.
- **Waitlist:** unavailable platform pills and the no-URL download button open `WaitlistModal` (see [Waitlist & app download](../community/waitlist-download.md)).
- **Analytics:** `trackDownloadClick("windows")` from `src/lib/analytics.ts` on the real download button.
- **Sentry:** `/api/download` reports invalid `NEXT_PUBLIC_DOWNLOAD_URL` via a once-per-process `captureMessage`.
- **i18n:** Download CTA pulls from `t.downloadSection.*` and `t.common.{step,notifyMe}` (`src/i18n/en.ts`).

## Conventions & gotchas
- **i18n gap (real issue):** `GetStarted`/`StepContent`/`StepChip` and the visuals render **hardcoded English** — the section heading ("From download to"), gradient ("running agents"), description, and all `TOUR_STEPS` strings (titles, subtitles, descriptions, details, time estimates) are not routed through `useTranslation`. `DownloadCTA.tsx` also hardcodes `"Download for Windows"` and `"No signup, no credit card. Runs on your machine. Zero telemetry."` (its own labels live in `t.downloadSection`). This violates the repo's "every user-facing string lives in `en.ts`" rule and is not translated into the other 13 locales. Treat any copy edit here as needing an i18n migration first.
- **Animation gating gap (real issue):** the auto-advance cycle *is* gated (via `useAutoCycle` → `useReducedMotion`), but several **looping/infinite animations run unconditionally** with no reduced-motion short-circuit: `DownloadVisual`'s bobbing icon, `CreateVisual`'s blinking cursor, `WorkVisual`'s `animate-pulse` dot, `DownloadStepGrid`'s repeating glow, and `DownloadCTA`'s `animate-spin-slow` orbit ring. None of these files import `useReducedMotion`. The `custom-animation/require-animation-gating` lint rule only fires on `requestAnimationFrame`/`cancelAnimationFrame`, so these framer-motion/CSS loops slip past it. If you touch these, consider gating them.
- **Parallel-array drift:** `STEP_VISUALS` is positionally aligned with `TOUR_STEPS`. Add/remove a step in only one place and visuals silently misalign — the dev-only `console.error` at `visuals/index.ts:33` is the only guard.
- **Two unrelated brand sets:** `TOUR_STEPS[*].brand` (`cyan/purple/emerald/amber/rose`) themes the Get Started steps; `DownloadStepGrid`'s `STEP_BRANDS` (`cyan/blue/purple`) is a separate local palette — don't conflate them.
- **React 19 purity:** `useFreshRelease` correctly seeds from `Date.now()` in a lazy `useState` initializer (not in render/`useMemo`); `useAutoCycle` uses the prev-state pattern to clamp the index instead of `setState`-in-effect. Preserve both patterns.
- **One rule for "download is live":** with no `NEXT_PUBLIC_DOWNLOAD_URL` — or one `resolveDownloadUrl` rejects — the whole CTA degrades to waitlist mode (button → modal, no trust signals, macOS/Linux/Windows all "notify me"). The hero CTA, the pricing offer CTA and the navbar CTA read the same `DOWNLOAD_PLAN`, and `/api/download` enforces the same resolution, so no surface can offer a download the route refuses. Adding a host means editing `ALLOWED_DOWNLOAD_HOSTS` in `release.ts`, nowhere else.
- **Displayed version is the SITE version (owner decision pending):** the badge and the hero ring render `SITE_VERSION` (the website's package.json, `0.1.0`), not the desktop changelog's latest (`1.1.0`, which `/roadmap` shows). Switching the display to `latestRelease(RELEASES).version` — and turning on `PULSE_FROM_CHANGELOG` so the badge pulses on a new desktop release — is one owner call, not yet made; `release.test.ts` pins the current display. `get-started/visuals/DownloadVisual.tsx` still hardcodes Windows "Available" independent of the plan, for the same reason.
- **Home links must resolve:** `src/lib/landing-address.test.ts` scans every `"/#x"` literal in `src/` and every in-page `href="#x"` in the home sections and fails when one does not resolve to a declared address. It caught "Explore first" pointing at a `#features` id nothing renders; that link now goes to `#use-cases`.
- **Backdrop artwork is decorative:** `StepBackdrop` images use `alt=""` + `aria-hidden` (correct); they require paired `step{N}-dark.png` / `step{N}-light.png` assets under `public/imgs/get-started/`.

## Related docs
- [FAQ](faq.md)
- [Footer](footer.md)
- [Waitlist & app download](../community/waitlist-download.md)
- [Feature index](../INDEX.md)
