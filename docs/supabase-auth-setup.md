# Supabase Auth setup (Google sign-in)

This is the one-time configuration that makes "Sign in with Google" work on the
dashboard. The **CSP fix** (allowing the browser to reach Supabase) ships in
code (`next.config.ts` `connect-src` now includes `https://*.supabase.co` and
`wss://*.supabase.co`). Everything below is **project / environment config you
own** — it can't be done from app code.

Project ref in use: `pvfwxilvzjzzjhdcpucu` → `https://pvfwxilvzjzzjhdcpucu.supabase.co`.

---

## 0. The error you saw — and why

```
Refused to connect to 'https://pvfwxilvzjzzjhdcpucu.supabase.co/auth/v1/user'
because it violates the document's Content Security Policy ("connect-src 'self'").
```

The CSP only allowed `'self'` (+ Sentry), so the browser blocked the auth call
before it left the page. **Fixed in this commit.** After deploying/restarting
the dev server, the request will be allowed — then the steps below make the
Supabase side actually accept it.

---

## 1. Environment variables

**Web** (`personas-web/.env.local`):

```
NEXT_PUBLIC_SUPABASE_URL=https://pvfwxilvzjzzjhdcpucu.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon/publishable key>
NEXT_PUBLIC_DATA_SOURCE=supabase        # so the dashboard reads the synced mirror
```

**Desktop** must point at the **same project** (`SUPABASE_URL` / `SUPABASE_ANON_KEY`,
compile-time or env) — same project ⇒ the same Google account resolves to the
same `auth.uid()` on both surfaces.

Find both values in the dashboard: **Project Settings → API** (Project URL +
`anon` `public` key). Restart `next dev` after editing `.env.local`.

---

## 2. Google Cloud — OAuth client (≈5 min)

1. [console.cloud.google.com](https://console.cloud.google.com) → **APIs & Services → Credentials**.
2. **Create credentials → OAuth client ID → Web application**.
3. **Authorized redirect URIs** — add Supabase's callback (NOT the app URL):
   ```
   https://pvfwxilvzjzzjhdcpucu.supabase.co/auth/v1/callback
   ```
4. Create → copy the **Client ID** and **Client secret**.

(If prompted, configure the OAuth consent screen first — External, add your
email as a test user while in "Testing".)

---

## 3. Supabase — enable Google + allow the redirect

**Dashboard path (recommended, zero-risk):**

1. **Authentication → Providers → Google** → toggle **Enabled**, paste the
   Client ID + Client secret from step 2 → **Save**.
2. **Authentication → URL Configuration**:
   - **Site URL**: `http://localhost:3000` (dev) — set to your prod domain for prod.
   - **Redirect URLs** (allow-list) → add:
     ```
     http://localhost:3000/dashboard
     http://localhost:3000/**
     ```
     plus the production equivalents (e.g. `https://app.yourdomain.com/dashboard`).

   The app calls `signInWithOAuth({ redirectTo: <origin>/dashboard })`, so that
   exact URL must be allow-listed or Supabase rejects the round-trip.

That's it — sign-in works after this.

---

## 4. CLI path (optional — "supplement me")

The Supabase CLI isn't installed here (`supabase: command not found`). If you
want to manage this from the CLI instead of the dashboard:

```bash
# install (pick one)
npm i -g supabase            # or: scoop install supabase / brew install supabase

supabase login               # interactive — opens a browser (run yourself)
supabase link --project-ref pvfwxilvzjzzjhdcpucu
```

To push auth config from `supabase/config.toml`:

```toml
[auth]
site_url = "http://localhost:3000"
additional_redirect_urls = ["http://localhost:3000/dashboard"]

[auth.external.google]
enabled = true
client_id = "env(SUPABASE_AUTH_GOOGLE_CLIENT_ID)"
secret    = "env(SUPABASE_AUTH_GOOGLE_SECRET)"
```

```bash
export SUPABASE_AUTH_GOOGLE_CLIENT_ID=...     # from step 2
export SUPABASE_AUTH_GOOGLE_SECRET=...
supabase config push
```

> ⚠️ `supabase config push` overwrites the linked project's auth config with the
> **entire** `config.toml`. If you've configured other auth settings in the
> dashboard, prefer the dashboard path above so you don't clobber them.

---

## 5. Verify

1. Restart the web dev server (picks up the new CSP + `.env.local`).
2. Open `/dashboard` while signed out → the gate shows **Continue with Google**
   and **Try Demo**.
3. Click **Continue with Google** → Google consent → back to `/dashboard`,
   signed in. No CSP error in the console.
4. **New-user check:** a fresh Google account that has never run the desktop
   lands on an **empty** dashboard (no rows yet) — that's expected. Sign into
   the desktop with the same Google account, enable **Settings → Cloud
   Dashboard Sync**, and the data appears under the same `auth.uid()`.

If sign-in still fails after this, check the browser console: a `redirect_uri`
error → step 3.2 (allow-list); a Google `400` → step 2.3 (callback URI);
`Authentication is not configured` in the app → step 1 (`.env.local`).
