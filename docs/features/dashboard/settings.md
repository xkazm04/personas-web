# Settings
> The dashboard's account and configuration surface — account/sign-out, live cloud-connection status, healing-alert notification toggles (incl. spoken new-review announcements), a BYOM model-provider allow-list, and per-credential rotation status. **Route:** `/dashboard/settings` · **Nav label:** "Settings" · **Status:** Demo-only (mocks)

## What it does
Settings is a two-column grid of glass cards covering five concerns:

- **Account** — shows the signed-in user's avatar (or a monogram fallback), display name, and email, with a **Sign out** button (spinner while signing out).
- **Cloud Connection** — a live status card: a Connecting / Connected / Disconnected pill driven by the orchestrator health check, plus rows for the orchestrator URL (or `mock://demo-data` in demo mode), total/active/idle worker counts, queue length, and active-execution count. The card accent color tracks health (cyan while checking, emerald when ok, amber otherwise).
- **Notifications** — healing-alert severity switches (Critical / High / Medium / Low), a weekly-digest switch, and an "Announce new reviews aloud" voice switch with a **Preview** button that speaks a sample announcement through the Web Speech engine.
- **Model providers** — a BYOM ("bring your own model") allow-list: per-provider switches deciding which model providers the agent fleet may use, with per-provider request counts. Demo-only — this card is hidden when not in demo mode.
- **Credential rotation** (D-C4) — per-credential vault rotation status: a Policy / No-policy chip, an Auto / Manual chip (when a policy exists), an Anomaly chip when an access anomaly is flagged, and the next-rotation ETA (or **Overdue**). Demo-only — hidden when not in demo mode (the vault is local-by-design).

The right-hand cards (`NotificationsCard`, `ModelProvidersCard`, `RotationOverviewCard`) are self-contained client components; the left two (Account, Cloud Connection) are rendered inline in `page.tsx`.

## How it works
**Page composition** — `page.tsx` is a `"use client"` component wrapped in a `motion.div` with `staggerContainer`; each card is a `GlowCard` carrying the `fadeUp` variant. A decorative `bg-settings.png` background sits behind the header at `opacity-[0.12]` with a gradient fade. The header is `SettingsHeader` (silver `GradientText` title + muted subtitle, both from `t.settingsPage`).

**Account + cloud status** (`page.tsx:18-145`) — pulls `user`, `signOut`, `isDemo`, `isSigningOut` from `useAuthStore` and `health`, `status`, `healthChecked`, `fetchStatus`, `fetchHealth` from `useSystemStore`, both via `useShallow`. An effect fires `fetchStatus()` + `fetchHealth()` on mount. The connection pill uses `isChecking = !healthChecked` (neutral "checking" state) and `isConnected = health?.status === "ok"` — the `healthChecked` guard exists specifically so a healthy system doesn't flash a red "Disconnected" error before the first health check resolves (see comment at `page.tsx:46-48`). The orchestrator row prints `mock://demo-data` in demo mode, otherwise `NEXT_PUBLIC_ORCHESTRATOR_URL` or the `notConfigured` string. Worker/queue/execution rows render only when `health`/`status` are present.

**Notification toggles** (`NotificationsCard.tsx`) — severity switches and the weekly-digest switch are **local `useState`** (`sev = { critical, high, medium, low }`, `digest`) — purely in-memory demo state, reset on navigation/reload, not persisted anywhere. The voice toggle is the exception: it reads/writes `useReviewVoiceStore` (`enabled` / `setEnabled`), which **persists to `localStorage`** (`review-voice-enabled`).

**Voice toggle + Preview** — toggling voice on calls `armSpeech()` first (the toggle click is a user gesture, used to wake the Web Speech engine so the first real announcement isn't swallowed by autoplay policy on Safari/iOS) then `setVoiceEnabled(on)`. The **Preview** button (disabled while voice is off) calls `handlePreview` (`NotificationsCard.tsx:38`): it arms speech, grabs the first `pending` review from `useReviewStore` and the first persona from `usePersonaStore`, then calls `emitNewReview(...)` with a `preview-{n}` id (a `useRef` counter, so each preview is a distinct cross-tab de-dup key). The signal travels the in-app pub/sub bus in `src/lib/review-voice.ts`; the `useReviewVoice` hook (mounted once via `SyncedRealtimeProvider`) receives it, composes "New {severity} review from {persona}: {title}", and speaks it — but only if `reviewVoiceStore.enabled` is true. So Preview is a no-op when the toggle is off, both via the disabled button and the enabled-check in the hook.

**Model providers** (`ModelProvidersCard.tsx`) — early-returns `null` when `!isDemo` (BYOM config is device-local, with no Supabase source). In demo mode it seeds local `allowed` state from `MOCK_MODEL_PROVIDERS` (`useState(() => Object.fromEntries(...))`, a lazy initializer per React 19 purity rules), renders one row per provider (name, mono model id, request count when allowed & `requests > 0`), and a `SettingToggle` that flips local `allowed[id]`. State is in-memory only.

**Credential rotation** (`RotationOverviewCard.tsx`) — early-returns `null` when `!isDemo` (like the providers card; the vault is local-by-design with no Supabase source). Renders one row per `MOCK_CREDENTIAL_ROTATIONS` entry (mono secret name + status chips): Policy/No-policy, Auto/Manual (only when a policy exists), an Anomaly chip when `anomaly`, and a right-aligned next-rotation ETA — `Overdue` (rose) when `overdue`, the `—` placeholder when there's no policy, else `Next {nextRotation}`. Read-only (no toggles).

**SettingToggle** (`SettingToggle.tsx`) — the shared switch used by both cards: a controlled `<button role="switch" aria-checked={on} aria-label={label}>` with a sliding knob; cyan when on, glass when off. No internal state — fully driven by `on`/`onChange`.

## Key files
| File | Role |
| --- | --- |
| `src/app/dashboard/settings/page.tsx` | Page entry — grid layout, Account card, live Cloud Connection card; wires `auth`/`system` stores and renders the two section cards |
| `src/app/dashboard/settings/SettingsHeader.tsx` | Header — silver `GradientText` title + subtitle from `t.settingsPage` |
| `src/app/dashboard/settings/settings-sections/NotificationsCard.tsx` | Healing-alert severity + digest toggles (local) and the voice toggle + Preview trigger (persisted) |
| `src/app/dashboard/settings/settings-sections/ModelProvidersCard.tsx` | BYOM provider allow-list (demo-only; hidden when not `isDemo`) |
| `src/app/dashboard/settings/settings-sections/RotationOverviewCard.tsx` | Per-credential rotation status: policy / auto-vs-manual / anomaly / next-rotation (demo-only) |
| `src/app/dashboard/settings/settings-sections/SettingToggle.tsx` | Shared controlled `role="switch"` toggle |
| `src/lib/review-voice.ts` | Framework-free voice bus + Web Speech: `emitNewReview`, `onNewReview`, `armSpeech`, `speak`, `composeAnnouncement`, `localeToSpeechLang` |
| `src/stores/reviewVoiceStore.ts` | Zustand store for the voice `enabled` flag, persisted to `localStorage` (`review-voice-enabled`) |
| `src/hooks/useReviewVoice.ts` | Subscribes to the bus and speaks announcements (mounted via `SyncedRealtimeProvider`) |
| `src/lib/mock-dashboard-data.ts` | `ModelProvider` + `MOCK_MODEL_PROVIDERS`; `CredentialRotation` + `MOCK_CREDENTIAL_ROTATIONS` (5 credentials) |

## Data & state
- **Source:** `MOCK_MODEL_PROVIDERS` (`src/lib/mock-dashboard-data.ts:1236`) — 5 providers: Anthropic Claude (`sonnet-4-6`, allowed, 8,421 req), Anthropic Haiku (`haiku-4-5`, allowed, 3,120), OpenAI (`gpt-4o`, allowed, 1,894), Google Gemini (`gemini-2.0`, off), Meta Llama (`llama-3.3-70b`, off). Cloud-status numbers come from `useSystemStore` (`health`, `status`), which is mock-backed in demo mode (`mockApi`). Account data comes from `useAuthStore.user` (Supabase user / demo user).
- **Stores:** `useAuthStore` (`user`, `signOut`, `isDemo`, `isSigningOut`); `useSystemStore` (`health`, `status`, `healthChecked`, `fetchStatus`, `fetchHealth`); `useReviewVoiceStore` (`enabled`, `setEnabled` — **the only persisted toggle**, localStorage). The Preview handler also reads `useReviewStore` (pending reviews) and `usePersonaStore` (persona names) via `getState()`. Severity, digest, and provider-allow toggles are **local `useState`**, not stored anywhere.
- **API routes:** None in this repo. Live data would flow through the external orchestrator (`NEXT_PUBLIC_ORCHESTRATOR_URL`) via `useSystemStore`'s fetchers, but `/dashboard/*` runs on mocks here.
- **Types:** `ModelProvider` (`id`, `name`, `model`, `allowed`, `requests`, `costUsd`); `NewReviewSignal` (`id`, `title`, `severity`, `personaId`); `VoiceCopy` (`newReviewRequest`, `announcement`, `unknownPersona`, `severity`); `ReviewSeverity` from `src/lib/types`.

## Integration points
- **Dashboard shell:** rendered inside the `/dashboard` layout; nav label is `t.dashboard.settings = "Settings"`.
- **Voice announcer bus:** `NotificationsCard`'s Preview button emits on the same `emitNewReview` bus that `useSyncedRealtime` uses in Supabase mode, so the announcement path is exercised without a live tenant. `useReviewVoice` (the subscriber) is mounted once in `SyncedRealtimeProvider` (`src/components/dashboard/SyncedRealtimeProvider.tsx`), which runs in **every** mode including demo — that's why Preview works here.
- **Voice copy is shared i18n:** the spoken sentence template lives in `t.settingsPage.notifications.voice` (`announcement` with `{severity}`/`{persona}` placeholders, `unknownPersona`, `severity.{critical,warning,info}`) and is consumed by `composeAnnouncement` — so this Settings namespace also drives runtime speech, not just labels.
- **System status:** the Cloud Connection card shares `useSystemStore` with the rest of the dashboard (e.g. overview/health widgets); `fetchStatus`/`fetchHealth` hit mocks in demo mode.
- **Shared primitives:** `GlowCard`, `GradientText`, `Image`; `fadeUp`/`staggerContainer` from `src/lib/animations`; lucide icons (`User`, `Cloud`, `Wifi`, `WifiOff`, `Loader2`, `LogOut`, `Bell`, `Volume2`, `Network`).
- **i18n namespaces:** `t.settingsPage` (title, subtitle, account, cloudConnection, orchestrator, notConfigured, totalWorkers, queueLength, activeExecutions, `notifications.*`, `providers.*`) and `t.common` (signOut, checking, connected, disconnected, active, idle, total).

## Conventions & gotchas
- **Demo-only, mostly in-memory:** only the voice toggle persists (`reviewVoiceStore` → localStorage). The severity switches, weekly-digest switch, and **every model-provider allow toggle reset on reload/navigation** — they are local `useState`. Don't assume any of these surfaces a real setting; there is no backing write. `ModelProvidersCard` returns `null` entirely outside demo mode.
- **Voice toggle persists but is intentionally not reset on sign-out** — `reviewVoiceStore`'s comment notes it's a browser-level preference, not user data. If you ever store *user* settings here, follow the opposite convention (clear on sign-out).
- **Web Speech needs a user gesture:** both the toggle (`handleVoiceToggle`) and Preview call `armSpeech()` from within the click handler to satisfy Safari/iOS autoplay gating. If you add another speech entry point, arm it from inside the gesture or the first utterance may be silently dropped. Speech also de-dupes across tabs via Web Locks keyed on the signal `id` — the `preview-{n}` ref counter exists so repeated previews don't collide on the same lock.
- **React 19 purity:** `ModelProvidersCard` and `NotificationsCard`'s preview-counter use lazy initializers (`useState(() => …)`, `useRef`) rather than impure calls in render. The `previewSeq` ref is mutated inside the click handler, not during render. Keep these patterns when extending.
- **Health-check flash guard:** the Cloud Connection pill keys off `healthChecked`, not `health` alone — removing that guard reintroduces the red "Disconnected" flash on every visit. Leave the neutral "checking" state in place.
- **i18n (14-locale lockstep):** all strings come from `t.settingsPage.*` / `t.common.*`. New keys go into `en.ts` first then hand-translated into all 13 other locales (never English placeholders). Note `t.settingsPage.providers.allowed` exists in the interface but isn't referenced by `ModelProvidersCard` (only `providers.requests` is used) — it's effectively vestigial; keep it in lockstep across locales or remove it from all of them together.
- **Semantic Tailwind tokens:** uses `text-foreground`, `text-muted`, `text-muted-dark`, `border-glass`, `border-glass-hover`, `text-brand-cyan`. Status accents use `emerald-*`/`red-*`/`amber-*` and severity dots use `rose/orange/amber/blue-400` directly (accent usage). Avoid raw hex / `text-white`; `bg-white/[0.03..0.06]` micro-tints are used for hover surfaces.
- **Accessibility:** `SettingToggle` is a proper `role="switch"` with `aria-checked` and an `aria-label`; the decorative background `Image` and avatar use empty `alt=""`. Preserve these when editing.

## Related docs
- [Messages](messages.md)
- [Dashboard shell & chrome](shell-chrome.md)
- [Feature index](../INDEX.md)
