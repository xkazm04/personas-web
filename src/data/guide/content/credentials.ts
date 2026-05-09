export const content: Record<string, string> = {
  "how-personas-keeps-your-data-safe": `
## How Personas Keeps Your Data Safe

Security is built into Personas from the ground up. Your passwords, API keys, and tokens are stored in an encrypted vault on your own computer — they never leave your device unless you explicitly send them to an AI provider during an agent run.

The encryption uses AES-256, the same standard used by banks and governments. Even if someone gained physical access to your computer, they couldn't read your stored secrets without your master password. You're in full control of your data at all times.

### Key Points

- **Local storage** — your credentials stay on your device, not in the cloud
- **AES-256 encryption** — the gold standard in data protection
- **No third-party access** — only your agents use your credentials, and only when running
- **Open architecture** — you can review exactly what data is sent during each agent run

### How It Works

When you store a credential, it's immediately encrypted and saved to a local vault file. When an agent needs that credential (like an API key to call a service), it's decrypted just long enough to make the call, then locked again. The raw key is never displayed or logged.

### See It In Action

:::usecases
**Team API Management**
Your team uses 15 different services
---
Each team member stores their own credentials locally. Agents use them without ever exposing secrets in logs, code, or chat.
===
**Credential Rotation**
An API token expires
---
Personas detects the expiry, alerts you, and can automatically refresh OAuth tokens — no manual work needed.
===
**Multi-Service Workflows**
An agent needs access to Slack, GitHub, and Jira
---
Each credential is stored separately, encrypted independently, and injected only when the agent needs it.
:::

:::info
If you lose your computer, your credentials remain protected by your OS login. Without your system password, the encrypted vault file is unreadable — it cannot be extracted and decrypted on another machine.
:::

:::warning
Never share your master password or vault file with anyone. These are the keys to all your stored credentials. If you suspect either has been compromised, rotate all stored secrets immediately.
:::

:::tip
Think of the credential vault like a safe deposit box at a bank. Your secrets are locked away and only taken out when needed for a specific job.
:::
  `,

  "adding-a-new-credential": `
## Adding a New Credential

Storing a new credential takes about 30 seconds. Go to the \`Credentials\` section in the sidebar, click \`Add Credential\`, choose the type (API key, password, token, etc.), paste your secret, and give it a descriptive name like "OpenAI API Key" or "Gmail Password."

Your credential is encrypted immediately and ready for your agents to use. You'll be able to assign it to agents from their settings panel.

### Step by Step

:::steps
1. **Navigate to Credentials** — Open the \`Credentials\` section in the sidebar
2. **Click Add Credential** — Hit the \`Add Credential\` button at the top
3. **Select the credential type** — Choose from API key, OAuth token, password, or other types
4. **Paste your secret** — Enter the value into the secure input field
5. **Give it a descriptive name** — Use something recognizable like "Stripe Live Key" or "Gmail Work Account"
6. **Click Save** — Your credential is encrypted with AES-256 and stored in the local vault
:::

### How It Works

The moment you click Save, your credential is encrypted using AES-256 and stored in the local vault. The raw value is never shown again — you'll only see the credential's name and type. To use it, assign it to an agent in that agent's settings.

:::warning
Never paste credentials into chat messages, agent prompts, or unencrypted files. Always use the secure credential input field — it ensures the raw value is encrypted immediately and never logged.
:::

:::tip
Use clear, descriptive names like "Stripe Live Key" or "Gmail Work Account." When you have many credentials, good names save you from guessing which is which.
:::
  `,

  "oauth-setup-walkthrough": `
## OAuth Setup Walkthrough

OAuth lets you connect services like Google, GitHub, and Slack without sharing your password. Instead of typing a password, you click a "Connect" button, sign in through the service's own website, and grant permission. It's the same flow you use when you click "Sign in with Google" on any website.

This is the most secure way to connect services because your password never touches Personas — only a limited access token is stored.

### Step by Step

:::steps
1. **Go to Credentials** — Open the \`Credentials\` section and click \`Add Credential\`
2. **Choose the service** — Select the service you want to connect (Google, GitHub, Slack, etc.)
3. **Click Connect** — A browser window opens to the service's login page
4. **Sign in and approve** — Log in with your account and approve the requested permissions
5. **Confirmation** — The window closes automatically and your credential appears as connected
:::

### How It Works

:::diagram
[Click Connect] --> [Browser opens] --> [Sign in to service] --> [Approve permissions] --> [Token stored securely]
:::

OAuth works like a valet key for your car — it gives limited access without handing over the master key. The service gives Personas a token that allows specific actions (like reading emails) without granting full account access. If you ever want to revoke access, you can do it from the service's security settings.

:::info
OAuth tokens grant limited, scoped access — not full account control. Each service defines exactly which permissions are requested. You can review and revoke these permissions at any time from the service's own security settings page.
:::

:::tip
Some OAuth connections expire periodically. Personas will notify you when a reconnection is needed — it only takes a few seconds.
:::
  `,

  "understanding-the-credential-vault": `
## Understanding the Credential Vault

The credential vault is where all your secrets live — encrypted, local, and under your control. Think of it like a bank safe: even if someone gained access to your computer, they couldn't read the contents without your master password. Every secret is individually wrapped in AES-256 encryption.

The vault file lives on your computer's hard drive. It's never uploaded to the cloud, shared with third parties, or included in backups unless you explicitly choose to.

:::feature
**AES-256-GCM Encryption** color=#a855f7
Every credential is individually encrypted with AES-256-GCM and stored locally. Your master key is derived through the OS-native keyring (Windows DPAPI, macOS Keychain, Linux Secret Service) — it never exists in plaintext on disk.
:::

### Key Points

- **AES-256 encryption** — each credential is individually encrypted
- **Local file** — stored only on your computer, not in the cloud
- **Master password protected** — an additional layer of security for vault access
- **Tamper detection** — the vault detects if anyone has modified it externally

### How It Works

When you add a credential, it's encrypted with a key derived from your master password and stored in the vault file. When an agent needs the credential, the vault decrypts it in memory just long enough to use it, then discards the decrypted version. The vault file itself is never in an unencrypted state.

:::warning
Choose a strong master password that you don't use anywhere else. This single password protects all your stored credentials. If your master password is weak or reused, every secret in the vault is at risk.
:::

:::tip
Choose a strong master password that you don't use anywhere else. This single password protects all your stored credentials.
:::
  `,

  "credential-health-checks": `
## Credential Health Checks

Over time, API keys can expire, permissions can change, and passwords can be rotated. Credential health checks automatically test each stored credential to make sure it still works. This catches problems before they cause your agents to fail unexpectedly.

Think of it as a regular check-up for your connections — a quick test to confirm everything is still valid and working properly.

### Key Points

- **Automatic testing** — health checks run periodically in the background
- **Status indicators** — green (healthy), yellow (expiring soon), red (broken)
- **Proactive alerts** — you're notified before a credential expires, not after
- **One-click fix** — jump directly to the credential that needs attention

### How It Works

Personas periodically sends a small test request to each service to verify the credential works. If a test fails, the credential's status changes and you see an alert. Click the alert to go directly to the credential settings where you can refresh or replace it.

:::tip
Run a manual health check before deploying a new agent that depends on credentials. This ensures everything is working before your agent tries to use it.
:::
  `,

  "auto-credential-browser": `
## Auto-Credential Browser

Setting up credentials for new services can be confusing — each one has different settings, different URLs, and different steps. The auto-credential browser takes the guesswork out of this process. It walks you through each service's setup step by step, like having a tech-savvy friend looking over your shoulder.

Instead of hunting through documentation, you select a service and the browser shows you exactly what to do, where to find your keys, and how to configure the connection.

### Key Points

- **Guided setup** for 40+ popular services
- **Step-by-step instructions** with screenshots for each service
- **Auto-detection** of required fields and settings
- Works with major providers like **Google, AWS, Stripe, Slack**, and many more

### How It Works

When adding a credential, click \`Browse Services\` to open the auto-credential browser. Search or browse for the service you need. The browser shows you a step-by-step guide specific to that service, including where to find your API key and which permissions to grant.

:::tip
Even if you're familiar with a service, the auto-browser is worth checking. It often highlights permissions you might have missed that your agents will need.
:::
  `,

  "which-agents-use-which-credentials": `
## Which Agents Use Which Credentials

As your collection of agents and credentials grows, it's important to know which agents depend on which credentials. The credential usage map gives you a clear picture — select any credential and see every agent that relies on it. Select any agent and see every credential it uses.

This is especially helpful before you delete or rotate a key. You'll know exactly what might be affected and can plan accordingly.

### Key Points

- **Visual dependency map** showing connections between agents and credentials
- **Impact preview** — see which agents would break if a credential is removed
- **Unused credential detection** — find credentials no agent is using anymore
- **Quick navigation** — click any connection to jump to that agent or credential

### How It Works

Go to \`Credentials\` and look at the \`Usage\` column next to each credential. It shows a count of how many agents use it. Click the count to see the full list. You can also view this from an agent's side — open an agent's settings to see all credentials it depends on.

:::warning
Before deleting or rotating a credential, always check its usage map. Removing a credential that active agents depend on will cause those agents to fail on their next run.
:::

:::tip
Before deleting a credential, always check its usage map. Reassign dependent agents to a new credential first to avoid unexpected failures.
:::
  `,

  "refreshing-expired-tokens": `
## Refreshing Expired Tokens

Some services require you to renew your access periodically — like renewing a library card. When a token expires, your agent can no longer connect to that service until you refresh it. Personas makes this as painless as possible by warning you ahead of time and simplifying the refresh process.

Most of the time, refreshing is a one-click operation. For OAuth connections, it's often fully automatic.

### Key Points

- **Advance warnings** — you're notified days before a token expires
- **One-click refresh** for most credential types
- **Automatic refresh** for OAuth connections that support it
- **Zero downtime** — the new token takes effect immediately

### How It Works

When a token is nearing expiration, you'll see a yellow warning on the credential and any agents that use it. Click the warning to open the credential settings, where a \`Refresh\` button handles the renewal. For OAuth credentials, Personas often refreshes the token automatically in the background.

:::tip
If you see a yellow warning on a credential, refresh it right away. A two-minute refresh now prevents a failed agent run later.
:::
  `,

  "deleting-credentials-safely": `
## Deleting Credentials Safely

When you no longer need a credential — maybe you switched services or closed an account — you'll want to remove it cleanly. Personas helps you do this safely by showing which agents depend on the credential before you confirm the deletion.

This prevents accidental breakage. You can reassign dependent agents to a different credential first, so nothing stops working when the old one is removed.

### Key Points

- **Dependency check** — see all agents using this credential before deleting
- **Reassignment option** — point dependent agents to a replacement credential first
- **Permanent removal** — once deleted, the encrypted data is wiped from the vault
- **No undo** — deletion is permanent, so the confirmation step is important

### How It Works

Select a credential and click \`Delete\`. Personas shows a list of all agents that depend on it. If any exist, you can reassign them to another credential right from the deletion dialog. Once all dependencies are cleared (or you confirm you want to proceed anyway), the credential is permanently removed from the vault.

:::warning
Credential deletion is permanent and cannot be undone. The encrypted data is wiped from the vault completely. Make sure you have a backup of the raw secret if you might need it again.
:::

:::tip
If you're rotating a key (replacing old with new), add the new credential first, reassign your agents, and then delete the old one. This ensures zero downtime.
:::
  `,

  "connector-catalog": `
## Connector Catalog

The connector catalog is your one-stop shop for service integrations. It lists 40+ pre-configured connectors for popular services — from email providers and cloud storage to payment processors and social media platforms. Each connector comes with built-in configuration so you don't have to figure out the technical details.

Just pick a service, sign in, and your agents can start using it. New connectors are added regularly based on user requests.

### Connector Categories

| Category | Services | Auth Type |
|---|---|---|
| Email | Gmail, Outlook, IMAP/SMTP | OAuth / Password |
| Cloud Storage | Google Drive, Dropbox, OneDrive, S3 | OAuth / API Key |
| Payments | Stripe, PayPal, Square | API Key |
| Social Media | Twitter/X, LinkedIn, Facebook | OAuth |
| Developer Tools | GitHub, GitLab, Jira, Linear | OAuth / API Key |
| Communication | Slack, Discord, Teams, Telegram | OAuth / Bot Token |
| CRM | Salesforce, HubSpot, Pipedrive | OAuth / API Key |
| AI Providers | OpenAI, Anthropic, Google AI | API Key |

### Key Points

- **40+ pre-built connectors** for popular services
- Categories include **email, storage, payments, social media**, and more
- Each connector includes **guided setup** with clear instructions
- **Request new connectors** if the service you need isn't listed yet

### How It Works

Open the connector catalog from the \`Credentials\` section and browse or search for the service you need. Click on a connector to see what it does and how to set it up. Follow the guided steps to connect your account. Once connected, the service becomes available as a tool for your agents.

:::tip
Browse the catalog even if you don't need a specific service right now. You might discover integrations that inspire new automation ideas you hadn't considered.
:::
  `,
};
