# Get Started & Download CTA
> The five-step "download to running agents" walkthrough (with per-step animated SVG visuals) plus the download CTA — platform pills, trust signals, and fresh-release detection. · **Route:** `/` (homepage section) · **Status:** Live

## What it does

Two stacked homepage conversion sections that turn an interested visitor into a download:

- **Get Started** (`#get-started`) — a five-step onboarding walkthrough that replaced the old `/tour` page. The steps are **Download & Launch → Connect Your Tools → Create a Persona → Let it work → Improve**. A row of numbered chips selects a step; the content card shows that step's title, time estimate, subtitle, description, a checklist of details, a faint per-step background illustration, and a bespoke **animated SVG visual** on the right (e.g. a connector grid, a persona-builder mock, a live event bus, a fitness-bar evolution chart). The walkthrough **auto-advances** on a timer and pauses on hover or when a chip is clicked.
- **Download CTA** (`#download`) — the closing call-to-action. Shows a version/release badge, heading, subtitle, a three-step "download → connect CLI → launch agent" mini-grid, the primary **Download for Windows** button, an "explore capabilities first" link, a privacy reassurance line, and a row of **platform pills** (Windows available; macOS/Linux open a waitlist modal). When a real download URL is configured it also shows **trust signals** (Requires Claude CLI · installer size). A recently-dated release makes the version badge **pulse**.

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

**Download CTA shell** (`DownloadCTA.tsx`). Reads four build-time env vars at module scope: `NEXT_PUBLIC_APP_VERSION` (→ `0.1.0` default), `NEXT_PUBLIC_RELEASE_TITLE` (→ "Latest"), `NEXT_PUBLIC_RELEASE_DATE`, `NEXT_PUBLIC_DOWNLOAD_URL`. The presence of `DOWNLOAD_URL` is the master switch: it flips the first download step between "Download installer" / "Join waitlist", swaps the primary button between a real `<PrimaryCTA href="/api/download">` (firing `trackDownloadClick("windows")`) and a waitlist-opening button, gates the `DownloadTrustSignals` block, and feeds `useDownloadPlatforms` so the Windows pill becomes "available."

- **`useDownloadPlatforms(downloadUrl)`** (`download-cta/useDownloadPlatforms.ts`) — returns three `Platform` objects (Windows/macOS/Linux) with i18n labels and lucide icons. Windows `available` mirrors `!!downloadUrl`; macOS/Linux are hardcoded `false`. (Note: this is **not** real client OS sniffing — "platform detection" here is availability flags, not navigator-based detection.)
- **`useFreshRelease(releaseDate)`** (`download-cta/useFreshRelease.ts`) — parses `RELEASE_DATE` (bare `YYYY-MM-DD` is treated as UTC midnight; otherwise `Date.parse`) and returns `true` if the release is < 7 days old. Seeded in a lazy `useState(() => …)` initializer (React 19 purity rule — no `Date.now()` in render) and re-checked every 60s via `setInterval`. When `true`, the version badge gets `animate-badge-pulse`.
- **`PlatformPills`** (`download-cta/PlatformPills.tsx`) — available platforms render as static cyan pills with a glow dot; unavailable ones render as `<button>`s that call `onWaitlist(platform)` (→ opens `WaitlistModal`) and show the "notify me" label.
- **`DownloadStepGrid`** (`download-cta/DownloadStepGrid.tsx`) — three glass tiles for the mini "Step 1/2/3" sequence, `whileInView` stagger; each tile pulses a brand-tinted glow overlay once (its own `STEP_BRANDS = ["cyan","blue","purple"]`, unrelated to `TOUR_STEPS.brand`). Static tints are inline because framer-motion can't interpolate `color-mix()`.
- **`DownloadTrustSignals`** (`download-cta/DownloadTrustSignals.tsx`) — two dotted text signals ("Requires Claude CLI" · installer size), rendered only when a download URL exists.

**`/api/download`** (`src/app/api/download/route.ts`). `PrimaryCTA` links here, not directly to the artifact. The route validates `NEXT_PUBLIC_DOWNLOAD_URL` at module load: must be parseable, `https:`, and its host must be in `ALLOWED_DOWNLOAD_HOSTS` (github / personas.app CDNs) — preventing an env-var compromise from turning the route into an open redirect. On success it 302s to the URL; otherwise it redirects to `/#download` (the waitlist fallback) and logs a Sentry warning once per process.

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
| `src/app/api/download/route.ts` | Allowlisted redirect to the release artifact |

## Data & state
- **Source:** Static. Get Started content is `TOUR_STEPS` (`src/data/tour.ts`); visuals' inner data (connectors, prompt, events, fitness bars, platforms) is hardcoded inside each visual component. Download CTA config comes from `NEXT_PUBLIC_*` build-time env vars.
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
- **Download is env-gated end to end:** with no `NEXT_PUBLIC_DOWNLOAD_URL`, the whole CTA degrades to waitlist mode (button → modal, no trust signals, macOS/Linux/Windows all "notify me"). `/api/download` independently re-validates the URL host, so the button can render while the route still falls back to `/#download`.
- **Backdrop artwork is decorative:** `StepBackdrop` images use `alt=""` + `aria-hidden` (correct); they require paired `step{N}-dark.png` / `step{N}-light.png` assets under `public/imgs/get-started/`.

## Related docs
- [FAQ](faq.md)
- [Footer](footer.md)
- [Waitlist & app download](../community/waitlist-download.md)
- [Feature index](../INDEX.md)
