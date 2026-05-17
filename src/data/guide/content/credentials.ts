export const content: Record<string, string> = {
  "how-personas-keeps-your-data-safe": `
## Data Safety

Security is built into Personas from the ground up. API keys, tokens, and passwords live in a local encrypted vault on your own machine — they never leave the device unless an agent explicitly sends them to an AI provider or third-party service during a run. The vault file itself is encrypted with **AES-256-GCM**, and the key that unlocks it is wrapped by your OS-native keyring (Windows DPAPI, macOS Keychain, Linux Secret Service) so plaintext keys never sit on disk.

When you run an agent, the engine decrypts only the specific credentials that agent needs, holds them in memory for the duration of the call, then wipes the plaintext. Logs, traces, and exports never contain raw credential values — anywhere a credential would appear, you see a token reference (\`cred:gmail-work\`) instead.

The vault is browsable from **Connections → Credentials**: each credential shows its label, category, health status, and dependencies. Raw values are never visible after the initial entry — there's ==no "show password" toggle, by design==. If you forget a value, rotate it at the provider and add the new one; the old record can be removed without revealing what it held.

### Key Points

- **AES-256-GCM** — authenticated encryption with field-level isolation; every credential's ciphertext has its own nonce, so a compromise of one record doesn't cascade to others
- **OS keyring–wrapped master key** — DPAPI on Windows, Keychain on macOS, Secret Service on Linux; no master password to type each session, protection comes from your OS account login
- **Tamper-evident** — GCM authentication tags catch any modification; a tampered vault file fails to decrypt with a clear error instead of silently returning garbage
- **Local-only by default** — nothing is uploaded; cloud deploy is opt-in and encrypts in transit via TLS to your chosen orchestrator
- **Token references in logs** — agent traces and exports use credential IDs, not raw secrets
- **Bound to OS account** — copying the vault file to another machine or user account won't make it usable

### How It Works

When the app starts, it asks the OS keyring for the wrapped vault key. The keyring decrypts the wrapping using OS-account-level protections (DPAPI / Keychain / Secret Service) and hands the vault key to the app process in memory. The vault key is never written to disk in plaintext, and the OS keyring is the only place that can produce it.

From there, storing a credential encrypts it with the vault key and writes the ciphertext to local SQLite — each field stored separately, not as one bulk blob. Using a credential during an agent run decrypts it in memory, passes it to the relevant tool or HTTP client, and releases the buffer immediately. The raw value is never logged, never displayed after the initial entry, and never serialized anywhere outside the encrypted vault.

### See It In Action

:::usecases
**Multiple services, isolated credentials**
Your agents talk to Slack, GitHub, and Jira
---
Each credential is encrypted independently with its own random nonce. A compromise of one record doesn't expose the others.
===
**Credential rotation**
A token expires or gets rotated
---
OAuth credentials refresh automatically via the provider's refresh token. Manually-rotated keys you swap on the credential record without restarting anything.
===
**Audit-friendly traces**
You need to prove which credential was used where
---
Every run's trace records the credential ID it used. The actual value never appears; the ID is enough to demonstrate provenance.
:::

:::callout-stack
[info] The vault is bound to your OS user account via the OS keyring. Copying the vault file to a different machine, even with the same OS, won't make it decryptable — the wrapping key lives in the OS keyring and isn't portable.
[warning] If you change your OS account password on macOS or Linux, the keyring may relock the wrapping key. Personas will prompt for the new credential on first run after the change. If the keyring is wiped (factory reset, account deletion), the vault becomes unrecoverable — back up the raw secrets externally if you need disaster recovery beyond the local machine.
[tip] The local-only model is the right default for personal automation. For team / production work where multiple machines need the same credentials, the cloud deploy (Team / Builder tier) replicates vault state via the orchestrator with end-to-end encryption.
:::

:::tip
Vault security is binary: it's either intact (OS account valid, keyring readable) or broken (cannot decrypt). There's no "weak" intermediate state. The most impactful thing you can do beyond Personas itself is run a modern OS version with full-disk encryption — BitLocker on Windows, FileVault on macOS, LUKS on Linux — so the device-level threat model is bounded.
:::
  `,

  "adding-a-new-credential": `
## Adding a New Credential

Open **Connections → Credentials** and click \`Add Credential\`. The picker shows the connector catalog — 40+ pre-configured services across roles like source control, CI/CD, cloud storage, email delivery, payment processing, chat messaging, CRM, AI platforms, error monitoring, incident management, browser automation, and more. Each connector auto-configures its required auth type, fields, validation endpoint, and any service-specific quirks.

If your service isn't in the catalog, **AI Discovery** generates a schema for it on the fly — give it the service name (and optionally a docs URL) and it returns an inferred connector definition you can review, edit, and save. Discovered schemas are cached for reuse, so the second time someone adds the same service it's an instant match.

### Authentication methods

Personas picks the auth flow automatically based on the connector you choose. Four distinct types are supported:

- **API credentials** — the everyday case: API key, personal access token, bot token, or basic auth. Paste the secret into the secure input and save. For connectors that declare one, Personas runs a no-op healthcheck call right after save to confirm the credential works.
- **OAuth** — browser consent flow for services that support it (Google, GitHub, Slack, Linear, HubSpot, Twitter/X, Discord, and many more). Click Connect, sign in to the provider, approve specific scopes, and a scoped token + refresh token land encrypted in the vault. Your password never touches Personas.
- **MCP (Model Context Protocol)** — first-class support for MCP servers as credentials, with \`stdio\` or \`sse\` transport, optional environment variables, and automatic tool discovery from the server's \`tools/list\`.
- **CLI** — shell-based auth for tools that use their own login command (e.g. \`gcloud auth login\`, \`gh auth login\`). Personas drives the command in a subshell and stores the resulting session token.

### Step by step

:::steps
1. **Navigate to Connections → Credentials** — sidebar → Connections, then the Credentials tab
2. **Click Add Credential** — top-right button on the credential list
3. **Pick a connector** — search the catalog by name or filter by role; the picker filters to matches and shows the auth method as a badge
4. **Run the auth flow** — paste the secret, click Connect for OAuth, wire up the MCP server, or run the CLI command depending on the connector's auth method
5. **Name and save** — give the credential a label you'll recognize ("Stripe Live", "Gmail Personal"); the credential is encrypted with AES-256-GCM and persisted (one nonce per field, see [Data safety](/guide/credentials/how-personas-keeps-your-data-safe))
6. **Healthcheck runs automatically** — for connectors that declare one, Personas pings the service with a lightweight no-op call to confirm the credential is live before exposing it to agents
7. **Optional: bind to agents now** — the picker shows agents with matching open capability slots; one-click bind avoids hunting them down later
:::

### OAuth flow in detail

OAuth-supporting services get a one-click **Connect** button instead of a paste-the-key form. The button opens your default browser to the provider's official consent screen — you sign in there using your existing account, review the specific scopes Personas is requesting, and approve to issue a token. The browser window closes automatically, the credential card lists the granted scopes, and you can immediately use it in agents.

Personas requests **scoped tokens** (the minimum permission set for the integration's stated capability — e.g. Gmail read-only for a summarizer agent, Gmail read+send for an auto-reply agent) and refreshes them in the background using long-lived refresh tokens. You'll typically never see expiry messages from OAuth credentials unless the provider invalidates the refresh token (consent revoked, password changed, security event). When that happens, Personas prompts to re-authenticate; one click re-runs the consent flow.

:::tip
For services that offer both OAuth and API-key options (e.g. GitHub, Linear), prefer ==OAuth== when available — scopes are tighter, revocation works from the provider side without rotating an API key, and the consent screen documents exactly what the integration can do.
:::

### MCP servers

Personas treats **Model Context Protocol** servers as first-class credentials. If you already have MCP servers configured in Claude Desktop, Personas auto-discovers them on first run — name, command, args, and env are imported as MCP credentials you can pick up in agent Connectors.

To add a new MCP server manually, pick **MCP** in the Add Credential picker and provide:

- **Package or command** — the npm package name (most servers) or an executable path
- **Transport** — \`stdio\` for local subprocess (the common case) or \`sse\` for HTTP server-sent events
- **Environment variables** — any secrets or config the server expects in its env, stored encrypted alongside the credential

Once saved, the server's \`tools/list\` is queried automatically and the resulting tools appear both in the credential playground (so you can call them by hand to verify) and in the agent's Connectors tab as bindable capabilities.

:::warning
Never paste credentials into agent prompts, code comments, or chat windows. Use the secure credential input field only — anything else risks the raw value being captured in a log, sync, or screenshot.
:::

:::tip
Naming convention matters once you have 20+ credentials. \`<service>-<env>-<account>\` ("stripe-live-main", "gmail-prod-support") makes it instantly clear which credential to pick when you're configuring an agent's Connectors tab.
:::
  `,

  "oauth-setup-walkthrough": `
## OAuth Setup Walkthrough

OAuth is the preferred auth flow for services that support it (Google, GitHub, Slack, Linear, HubSpot, Twitter/X, Discord, etc.). Instead of you typing or pasting an API key, Personas opens a browser window to the provider's official consent screen — you sign in there using your existing credentials, approve the specific scopes Personas is requesting, and the provider returns a scoped access token back to the app. The token lands encrypted in the vault; your password never touches Personas.

Most OAuth tokens are short-lived and paired with a refresh token. Personas uses the refresh token to keep the access token current in the background — you'll typically never see expiry messages from OAuth credentials unless the provider invalidates the refresh token (consent revoked, password changed, security event).

### Step by Step

:::steps
1. **Open Connections → Credentials** — sidebar → Connections → Credentials, then \`Add Credential\`
2. **Pick the service** — the catalog filters by category; OAuth-supporting services show an "OAuth" auth-type badge
3. **Click Connect** — a browser window opens to the provider's consent screen
4. **Sign in and approve scopes** — review the exact permissions requested; approve to issue the token, or deny to cancel
5. **Confirmation lands** — the browser window closes automatically; the credential appears in your vault with the granted scopes listed; you can immediately use it in agents
:::

### How It Works

:::diagram
[Click Connect] --> [Browser opens] --> [Sign in to provider] --> [Approve specific scopes] --> [Token + refresh stored encrypted]
:::

OAuth gives Personas a *scoped* token — it can do exactly what you approved and nothing else. Each connector requests the minimum scopes for the integration's stated functionality (Gmail read-only for a summarizer agent, Gmail read+send for an auto-reply agent, etc.). You can review the granted scopes on the credential card and revoke them entirely from the provider's own security settings if you ever want to.

:::info
OAuth tokens are typically short-lived (minutes to hours) and Personas refreshes them automatically using the long-lived refresh token. If the refresh token itself expires (provider-specific, usually 90 days to never), Personas prompts you to re-authenticate — a one-click re-run of the consent flow.
:::

:::tip
For services where you have both OAuth and API-key options (e.g. OpenAI, Anthropic), OAuth is preferred when available because scopes are tighter and tokens can be revoked from the provider side without rotating an API key. API keys are still fine for headless / programmatic use.
:::
  `,

  "credential-health-checks": `
## Credential Health Checks

Credentials drift over time — tokens expire, keys get rotated upstream, OAuth scopes change. Credential health checks ping each stored credential periodically with a lightweight test call (a no-op API request that costs nothing and tells you whether the credential is still valid). The results surface as a status indicator on the credential card and as alerts when a credential degrades.

The check schedule is configurable. By default, OAuth credentials check daily (because the refresh-token flow needs the credential to be exercised periodically anyway), API-key credentials check weekly. Manual checks can be run anytime from the credential card.

### Key Points

- **Per-credential status** — green (healthy), yellow (expiring soon / scope changed), red (broken / revoked)
- **Configurable cadence** — per-credential overrides if a service rate-limits aggressive checking
- **Manual check** — one-click test from the credential card; useful before deploying a new agent
- **Expiry projection** — for credentials with known expiry dates (signed JWTs, scoped tokens), the status flips to yellow N days before expiry (configurable, default 7)
- **Alert routing** — failures route through the same notification channels you've configured for agents

### How It Works

Each connector defines its own health-check call (the lightest possible request that exercises the credential). The check runs in the background on the configured cadence; results are persisted and update the credential's status. If a check fails, the status flips, the credential card highlights, and dependent agents inherit the warning on their own health indicators — so a broken Gmail credential makes every Gmail-using agent show yellow until you fix it.

:::tip
Run a manual health check before any production deploy or scheduled overnight run. Five seconds now versus a failed run at 3am because a token silently rotated.
:::
  `,

  "auto-credential-browser": `
## Auto-Credential Browser

The auto-credential browser is the catalog-driven onboarding for new credentials. Open Connections → Catalog and you see every connector Personas ships pre-configured: 60+ services as of this writing, organized by category (email, storage, payments, communication, developer tools, CRM, AI providers, etc.). Each connector knows the right auth type, the required fields, the OAuth scopes, the API endpoints, and any service-specific quirks.

When you pick a connector, the wizard walks you through the exact steps for that service — including links to the specific pages in the service's UI where you'd find an API key, or which OAuth scopes to approve, or what permissions matter. For services where Personas can detect a successful connection (most of them), the wizard verifies in real-time before saving.

### Key Points

- **60+ pre-configured connectors** — auth type, fields, scopes, endpoints baked in
- **Service-specific guidance** — direct links to the exact API-key page or settings tab
- **Live validation** — the wizard tests the credential before saving for most services
- **Suggested-for-agent flow** — the catalog can also be entered from an agent's Connectors tab, where it's filtered to connectors matching the open capability slot
- **Request new connectors** — services not yet in the catalog can be requested; for one-offs, use the Generic / Custom connector type

### How It Works

Connector definitions are shipped with the app and updated through the regular release cycle. Each definition declares its auth flow, required fields, validation endpoint, and scope list. When you pick a connector, the wizard reads the definition, renders the matching form, runs the OAuth or API-key flow, and validates before saving. The actual credential value is encrypted at save time using the same path as a manually-added credential.

:::tip
The catalog is also the fastest way to discover what's integrated. If you're considering whether Personas can do X with service Y, search the catalog first — if Y is there with a relevant capability, the integration is one-click.
:::
  `,

  "which-agents-use-which-credentials": `
## Which Agents Use Which Credentials

The Dependencies tab on Connections shows the credential → agent graph. Pick a credential on the left and you see every agent that references it on the right, with the specific capability slot named ("Gmail account for the email-summary agent"). Pick an agent and you see every credential it depends on. The graph is bidirectional — useful for both "what breaks if I rotate this key?" and "which credentials does this agent need before I can promote it?".

The same dependency map drives the build-engine pre-flight check: when you promote an agent, the engine cross-checks every required capability against the vault and flags missing or expired credentials before allowing promote. This is why you almost never get a "credential not found" error at runtime in newly-created agents — the dependency check ran at promote time and caught it.

### Key Points

- **Bidirectional graph** — credential → agents and agent → credentials
- **Capability-slot named** — the dependency tells you not just "this credential is used" but "used as the email-send capability"
- **Pre-flight check** — promote-time validation that uses the same graph
- **Impact preview** — selecting a credential highlights every agent that would be affected by its removal
- **Unused-credential detection** — credentials with zero agent dependencies are surfaced in the Connections summary so you can clean them up

### How It Works

Every agent's Connectors tab stores the credential reference per capability slot. The Dependencies view queries this storage in both directions to render the graph. Credential rotation, expiration, or removal events propagate through the graph: any agent depending on a degraded credential inherits the warning state on its health indicator, so the graph isn't just a static reference — it's a live propagation path.

:::warning
Before rotating or deleting any credential used by an unattended (scheduled / webhook / chain) agent, check the dependency map and update the agents to point at the replacement credential first. The pre-flight check catches you at promote time; for already-promoted agents, the runtime failure is the only signal.
:::

:::tip
A monthly "credential audit" routine: open Connections → Dependencies, sort by oldest, and ask "do I still use this credential?" for the bottom dozen. Unused credentials are surface area for nothing, so removing them is pure cleanup.
:::
  `,

  "refreshing-expired-tokens": `
## Refreshing Expired Tokens

Some credentials are time-bounded by design — OAuth access tokens expire in minutes to hours; service-issued tokens (Slack bot tokens, GitHub PATs) often have N-day or N-year expiries. Personas tracks expiry where the provider publishes it and surfaces a "expiring soon" yellow status some days before the cutoff (configurable, default 7 days).

For OAuth credentials with a refresh token, refresh is automatic and silent in the background. For API keys and tokens that don't refresh, you'll see the yellow warning and the credential card will offer a "Reconnect" or "Replace" button — clicking it opens the same wizard that created the credential.

### Key Points

- **Automatic refresh for OAuth** — refresh token used silently; you don't see this happen
- **Advance warning for non-refresh creds** — yellow status N days before expiry; configurable warning window
- **One-click reconnect** — the credential card has a Reconnect button that re-runs the auth flow
- **Zero-downtime swap** — for credentials with active dependent agents, the new token replaces the old in place; agents pick up the new value on their next run
- **Failure surfaces in agent health** — credentials that fail to refresh make their dependent agents go yellow / red on the Health tab

### How It Works

Refresh runs as part of the same background task that does health checks. For OAuth, the task uses the refresh token to mint a new access token from the provider and updates the credential record. For non-refreshable tokens, the task only updates the expiry projection (so the yellow warning appears at the right time); the actual replacement is a manual action you take when the warning fires.

:::tip
When a yellow expiry warning fires, refresh immediately rather than waiting. Refreshing now is a one-minute task. Letting a scheduled agent fail at 3am because the token expired overnight is much more expensive in unwinding the missed runs.
:::
  `,

  "deleting-credentials-safely": `
## Deleting Credentials Safely

Deleting a credential is permanent — the encrypted record is wiped from the vault and there's no recovery from inside Personas. Before you delete, the credential card shows the dependency check: every agent referencing the credential, in what capability slot, with what the impact would be. You can use the deletion dialog to reassign each dependent agent to a different credential before confirming, so the actual deletion is atomic with the reassignment.

For OAuth credentials, deletion only removes the local stored token — it doesn't revoke access on the provider side. If you also want to revoke on the provider, do that on the provider's security settings page (a link is offered in the deletion dialog for major providers).

### Key Points

- **Permanent and immediate** — no undo; the encrypted record is wiped on confirm
- **Dependency check up front** — see every dependent agent before you confirm
- **Inline reassignment** — point dependent agents at a replacement credential as part of the deletion dialog
- **OAuth providers: local-only delete by default** — provider-side revocation is a separate step (link provided)
- **No-op safe for already-broken credentials** — deleting an expired / revoked credential is always safe; nothing depends on functional state

### How It Works

The deletion dialog reads the same dependency graph as the Dependencies view. When you confirm, the engine first writes any reassignments you specified, then removes the credential record from the vault in a single transaction. If reassignments fail validation (e.g. you tried to point at a credential of the wrong category), the deletion is rolled back and nothing changes.

:::warning
Permanent means permanent. The encrypted record is wiped, and if you didn't write down the raw secret elsewhere, it's gone. If you might need the credential again, back up the raw value externally before deletion.
:::

:::tip
The safest rotation pattern is "add new, reassign all agents, then delete old". Add the replacement credential first, walk the dependency map to reassign dependent agents one by one (or all at once in the reassign dialog), verify everything is healthy, then delete the old credential. This sequence guarantees zero downtime.
:::
  `,

  "connector-catalog": `
## Connector Catalog

The catalog at Connections → Catalog is the curated list of services Personas integrates with out of the box. As of this writing, 60+ connectors across 9 categories, with new connectors added each release based on user demand. Each connector declares its auth type (OAuth, API key, basic auth, bot token), required scopes / capabilities, and the agent-side tool surface it exposes.

When an agent's Connectors tab needs a capability ("email-send", "cloud-storage-write", "chat-message-send"), it queries the catalog for connectors that satisfy that capability, then matches against your vault. If you already have a credential for one of those connectors, it's an immediate match. If not, the catalog offers to add one — opening the same wizard described in the Auto-Credential Browser topic.

### Connector Categories

:::tabs
### Email
Receive, parse, send, and search messages. Triage inboxes, summarize threads, file invoices, route replies.

Supported: **Gmail** (OAuth or app password), **Outlook / Microsoft 365** (OAuth), and any **IMAP / SMTP** provider (server URL + username + password).

### Cloud Storage
Read and write files for agents that ingest documents, save outputs, or sync results to a shared drive.

Supported: **Google Drive**, **Dropbox**, **OneDrive** (OAuth), any **S3-compatible** store like AWS S3, R2, B2, or MinIO (access key + secret), and **Local Drive** for files already on this machine (filesystem path, no credential required).

### Payments
Read transactions, watch for new charges, refund or capture, generate reports.

Supported: **Stripe** with live and test segregation, **PayPal**, **Square** — all via API key.

### Social
Post, schedule, read engagement, run analytics on social accounts.

Supported: **Twitter / X**, **LinkedIn**, **Facebook**, **Mastodon** — all via OAuth.

### Developer Tools
Watch issues, open PRs, attach builds, mirror Sentry alerts into your agent flow.

Supported: **GitHub** and **GitLab** (OAuth or fine-grained PAT), **Jira** and **Linear** (OAuth), and **Sentry** (auth token).

### Communication
Inbound webhooks for triggers, outbound channel-delivery for agent outputs, two-way bot interactions.

Supported: **Slack** and **Microsoft Teams** (OAuth + bot token), **Discord** and **Telegram** (bot token), and the **Generic Webhook** type for any HTTP endpoint (URL only, no credential required).

### CRM
Read contacts, sync deals, automate stage transitions, watch for new leads.

Supported: **Salesforce**, **HubSpot**, **Pipedrive** — OAuth (recommended) or API key.

### AI Providers
The model endpoints your agents call. See **Adding a New Credential** → **AI Provider Quick Start** for per-provider setup detail.

Supported: **Anthropic**, **OpenAI**, **Google Gemini** (API key); **Ollama** for local models (server URL, no key); and **Custom OpenAI-compatible** for vLLM, LM Studio, OpenRouter, and similar (base URL + API key).

### Data
Query databases or arbitrary REST endpoints; results land in agent context as structured input.

Supported: **Postgres**, **Snowflake**, **BigQuery** (connection string or service-account key), **Generic SQL** for any JDBC-style URL, and **Generic HTTP** for REST APIs (base URL + auth headers or bearer token).
:::

### Key Points

- **Capability-based matching** — connectors expose capabilities; agents need capabilities; the catalog matches them
- **Service-specific quirks baked in** — Slack workspace IDs, GitHub PAT scopes, OAuth callback URLs, etc., all pre-configured
- **Auth-type indicators** — at a glance, see which connectors are OAuth vs. API-key vs. local
- **Generic / Custom fallback** — for services not in the catalog, the Generic connector type accepts raw HTTP/REST configuration
- **Channel-delivery connectors** — Slack, Discord, Teams, generic webhook show up here for outbound agent output too (configured per-agent on the Connectors tab)

### How It Works

Connector definitions live in the app and are versioned alongside the binary. The Connectors tab on each agent queries the catalog dynamically — adding a connector to the catalog (in a release) makes it available to existing agents without any per-agent migration. Custom / Generic connectors you configure locally are vault-scoped and don't go through the catalog.

:::tip
The catalog is also a discovery surface. Browse occasionally even when you don't have a specific need — you'll often find an integration that suggests a new automation. The Communication category in particular is rich for output-side use cases (delivering agent results to Slack / Discord / Teams).
:::
  `,
};
