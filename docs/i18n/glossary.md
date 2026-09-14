# personas-web translation glossary

Seeded 2026-09-14 with **only what the tree already fixes**. Nothing here was chosen
for this file: every entry is copied from a list that already existed, and its source
is named. Terms the source itself contradicts are recorded as **UNRESOLVED** and stay
that way until the owner decides. A translator or subagent must never resolve them.

Consumers: `scripts/i18n/translate-guide-subagent-prompt.md` (guide translation).
Related, and deliberately different: `docs/i18n/copy-contract.json` `terms.accept` is
the English copy gate's **acceptance list** (spellings the copy checker allows). It is
not a termbase and records no target renderings.

## 1. Do not translate: brand names

Source: `scripts/i18n/translate-guide-subagent-prompt.md`, "DO NOT translate".

| Term | Note in source |
| --- | --- |
| Personas | |
| Claude | |
| Anthropic | |
| Athena | the cockpit chatbot |
| Cockpit | |
| Director | |

## 2. Do not translate: third-party product names

Source: same prompt section.

OpenAI, Google, Gemini, Ollama, GitHub, GitLab, Slack, Discord, Microsoft Teams, n8n,
Stripe, Sentry, Linear, HubSpot, Salesforce, Pipedrive, Twitter/X, LinkedIn, Facebook,
Mastodon, Telegram, Twilio.

## 3. Do not translate: technical terms

Source: same prompt section.

API, CLI, JSON, HTTPS, HTTP, URL, REST, GraphQL, cron, webhook, OAuth, PAT, SQLite,
Postgres, Snowflake, BigQuery, S3, DPAPI, Keychain, Vault, KMS, OIDC, SSO, TLS, Docker,
Kubernetes, Helm, BYOI, KpiTile, AES-256-GCM, GCM, SHA, ONNX.

## 4. Context-dependent: trigger-type labels

Source: same prompt section. Keep verbatim **only** when used as a trigger-type label;
translate when the same word is ordinary prose ("schedule triggers run at configured
times" is fully translated).

Manual, Schedule, Webhook, Clipboard, File Watcher, Chain, Event-Based.

## 5. Tiers, pricing and cloud deployment: none (owner decision 2026-09-14)

**Decision:** there are no paid plans, tiers or prices, and no cloud deployment (no
cloud orchestrator, no BYOI, no remote execution, no 24/7 hosted runs). The desktop app
is free and open source and runs agents on the user's own machine. A translator must
not introduce any of these, and must report any English unit that still carries one.

| Set | Names as written | State |
| --- | --- | --- |
| A | Local / Cloud / Enterprise, with feature rows "Everything in Free" and "Everything in Pro" | **Removed** from `src/i18n/*.ts` (`pricing.*` except `comingSoon`, which the waitlist modal renders) |
| B | Starter, Pro, Team ("Cloud plans (Starter, Pro, Team)"; "Pro and Team plans") | **Removed** from the FAQ in all 14 locales; the FAQ JSON-LD follows `en.faqSection` |
| C | Starter, Team, Builder ("Builder tier", "Team / Builder tier") | **Removed** from the guide bodies in English and all 13 locales |
| D | Cloud execution, cloud orchestrator, BYOI, cloud deploy | **Removed:** seven guide topics, the FAQ BYOI and local-vs-cloud answers, the features card, the terminal demo step, the roadmap bar, blog and changelog passages |

"Cloud" still correctly names third-party services: a cloud AI provider, cloud storage
connectors, a synced cloud folder, an OS vendor's cloud speech service.

Not a tier set: `roadmap.bars.solo` / `team` / `enterprise` (Solo, Team, Enterprise)
are collaboration-phase labels on the roadmap.

## 6. Product names: Claude Code

The Anthropic command-line tool Personas requires is **Claude Code** (owner decision
2026-09-14; formerly written "Claude CLI"). Do not translate it; do not write "Claude CLI".
