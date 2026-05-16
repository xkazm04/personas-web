export const content: Record<string, string> = {
  "local-vs-cloud-execution": `
## Local vs Cloud Execution

Personas agents run in two places: on your local machine (the desktop app's own engine) or on a remote orchestrator (cloud-managed by us, or BYOI on your own infrastructure). Local is the default and works out of the box; cloud is opt-in (Team / Builder tier) and enables 24/7 availability without your machine being on. The same agent prompt, tools, and credentials work in either environment — switching is a deployment decision, not a redesign.

The deciding factors are typically uptime and observability requirements. Local works great for development, testing, exploratory agents, and anything where you're around to watch the work. Cloud is the right choice for scheduled overnight runs, webhook agents that need to be reachable while you sleep, and any production-grade automation where "my laptop was closed" can't be a failure mode.

:::compare
**Local Execution** [default]
Runs in the desktop app's engine. Available while the app is open. Zero setup. Data and credentials never leave your machine. Full live observability in the same UI you build with. Best for development, testing, supervised work, and anything privacy-sensitive.
---
**Cloud Execution**
Runs on the orchestrator (managed cloud or BYOI). Available 24/7 regardless of your local machine. Setup is one-time. Data and credentials are encrypted in transit to the orchestrator and at rest on it. Results sync to your desktop. Best for schedules, webhooks, and production-grade unattended work.
:::

### How It Works

Local agents are dispatched by the in-app execution engine — same path everything else in the app uses. Cloud agents are deployed: the agent's full configuration (prompt, tools, credentials by reference, triggers) is sent to the orchestrator, which runs a long-lived agent process that handles triggers server-side. Results stream back to the desktop app and appear in the same monitoring views as local runs.

:::tip
Develop and test locally, then deploy what works to the cloud. The local engine has the fastest edit-test loop; the cloud is where you put agents whose schedule or availability matters. You don't have to pick one or the other globally — typical setups have most agents local and a handful of production ones in the cloud.
:::
  `,

  "connecting-to-the-cloud-orchestrator": `
## Connecting to the Cloud Orchestrator

Open Deployment → Cloud Deploy to connect to an orchestrator. Two paths: the **managed orchestrator** (we host it; you authenticate with your account and you're done in 30 seconds) or **BYOI** (you host the orchestrator on your own infrastructure; you point the desktop app at your endpoint and provide an auth key). Either way, connection is one-time per machine and persists across app restarts.

Once connected, every agent's Settings tab gains a "Deploy to cloud" option. Triggering deployment uploads the agent's configuration to the orchestrator and starts a long-lived server-side process for it. Cloud agents appear in the same monitoring views as local ones, tagged with a small cloud icon.

:::steps
1. **Open Deployment → Cloud Deploy** — sidebar → Deployment → Cloud Deploy
2. **Pick environment** — Managed Cloud (one-click sign-in) or BYOI (enter your orchestrator URL + auth key)
3. **For BYOI**: paste the orchestrator URL and the auth token; the wizard runs a connection test and verifies orchestrator version compatibility
4. **For Managed**: click "Sign in"; OAuth flow opens to authenticate against your Personas account
5. **Save** — connection persists; agents now show a "Deploy to cloud" option in their Settings tab
:::

:::warning
Treat the BYOI auth token like any other credential: store it in the vault (Connections → Credentials → Custom), don't paste it into chat or commit it to version control. Whoever holds the token can deploy and undeploy any agent on the orchestrator.
:::

### How It Works

The orchestrator is a long-running server process (one per environment) that holds deployed agent configurations and runs them on schedule, on webhook event, or on demand. Communication between the desktop app and orchestrator is over TLS with mutual auth. Deployed agents' credentials are encrypted at deploy time using the orchestrator's per-tenant key and decrypted only inside the orchestrator process at run time.

:::tip
Test the connection before deploying anything. The wizard's connection test verifies version compatibility and reachability — if it fails, the failure is much easier to diagnose now than after you've tried to deploy three agents.
:::
  `,

  "deploying-an-agent-to-the-cloud": `
## Deploying an Agent to the Cloud

With an orchestrator connected, deploying any agent is one button on its Settings tab. The deploy action packages the agent's full configuration (prompt, tools, credential references, trigger definitions, settings) and sends it to the orchestrator over TLS. The orchestrator validates, sets up the agent, and starts handling its triggers server-side. The first run typically happens within seconds.

Local and cloud copies of the same agent stay in sync via the same auto-sync system that handles all desktop ↔ cloud coordination. You can keep iterating on the agent locally and re-deploy when ready; you don't have to choose between the two environments.

:::steps
1. **Verify orchestrator connection** — Deployment → Cloud Deploy should show "Connected"
2. **Open the agent** — Agents page → the one you want to deploy
3. **Settings tab → Deploy to Cloud** — button in the deployment section
4. **Review the deployment summary** — credentials being shipped, triggers being armed, model selection, failover settings; everything should match what you tested locally
5. **Confirm Deploy** — the orchestrator receives the configuration, validates, sets up the agent; status flips to "Deployed" in seconds
6. **Verify in the dashboard** — Overview → Activity shows the agent with a cloud icon; the next scheduled / webhook event will route to the cloud instance
:::

:::warning
Cloud agents use credentials from the cloud-side vault, not your local vault directly. The deploy action ships credential *references* (encrypted) and the orchestrator resolves them server-side. If a credential is local-only or hasn't been replicated, the deploy will surface a "credential not available in cloud" warning and ask you to either replicate or pick a substitute before completing.
:::

### How It Works

Deployment is atomic: either the orchestrator accepts the entire configuration and the agent goes live, or it rejects (with a specific reason) and nothing changes server-side. Once deployed, the orchestrator owns trigger evaluation — your local app no longer fires schedules / webhooks for that agent (you'd get duplicates otherwise). Manual runs from the desktop app are routed to the cloud instance over the same connection.

:::tip
Deploy scheduled agents first when starting with cloud. They benefit most from 24/7 uptime, and they're the easiest to verify (you'll see the run land on its expected schedule whether your laptop is open or not).
:::
  `,

  "cloud-execution-monitoring": `
## Cloud Execution Monitoring

Cloud agents are visible from the same Overview pages as local agents — same Activity feed, same Health tab, same Usage breakdowns. A small cloud icon distinguishes cloud agents from local. Click into any cloud execution and you get the full trace just like a local run: rendered prompt, model call, tool calls, output, cost.

The desktop app polls the orchestrator continuously while open and subscribes to live event streams while connected, so what you see is the live state with a delay measured in seconds, not minutes. When the app is closed, the orchestrator keeps everything going on its own; opening the app later catches up the local state from the orchestrator's authoritative store.

### Key Points

- **Unified monitoring surface** — local and cloud agents share the same Activity / Health / Usage views
- **Live event streaming** while the desktop is connected; orchestrator-side persistence guarantees nothing is lost when you're offline
- **Cloud icon** distinguishes cloud-resident agents
- **Cost attribution to cloud** — usage charts include both local and cloud spending, broken down by environment
- **Catch-up on reconnect** — opening the app after extended offline time syncs all missed events from the orchestrator

### How It Works

Cloud agents emit the same execution and event records as local ones; the orchestrator stores them server-side and replicates to the desktop app on connect. The Activity feed merges local and cloud event streams in chronological order, so a mixed local + cloud setup looks like one unified view rather than two parallel ones.

:::tip
Set per-day budget caps on cloud agents from day one. Cloud agents have no implicit "I'm watching this happen" check that local manual runs have; the per-day cap is your safety net against a runaway prompt overnight.
:::
  `,

  "github-actions-integration": `
## GitHub Actions Integration

Agents can trigger GitHub Actions workflows via the GitHub tool on their Connectors tab, and GitHub Actions can trigger agents via the standard webhook trigger. The two patterns combine well: a GitHub event (PR opened, push to main, release tagged) fires a webhook that starts a Personas agent, the agent does its thing, and (if needed) the agent triggers a workflow as part of its output.

The GitHub connector ships in the Catalog (Connections → Catalog → Developer Tools → GitHub). Auth is OAuth or a fine-grained PAT — OAuth is preferred when the agent only needs read access; PATs work well for write operations like dispatching workflows.

### Key Points

- **GitHub → Personas via inbound webhook** — standard webhook trigger; configure GitHub to POST to the agent's URL
- **Personas → GitHub via the GitHub tool** — agent can dispatch workflows, comment on PRs, open issues, anything the GitHub API exposes
- **Scoped auth** — OAuth for read-mostly agents, fine-grained PAT for write operations; minimum scopes per agent
- **Live status sync** — agent traces show the workflow_dispatch request and GitHub's response; the agent can wait for the workflow to complete if needed

### How It Works

:::diagram
[GitHub event] --> [Inbound webhook] --> [Agent decides] --> [GitHub tool dispatches workflow] --> [Workflow result back into trace]
:::

The GitHub tool wraps the GitHub REST/GraphQL APIs and exposes high-level actions to the agent: "dispatch workflow", "comment on PR", "open issue", "merge PR", etc. The agent's prompt names the action it should take based on the trigger; the tool handles auth, payload construction, and response handling.

:::warning
Use fine-grained PATs over classic PATs whenever your GitHub plan supports them. Classic PATs grant broad org-wide permissions; fine-grained PATs restrict to specific repositories and specific permission scopes, which dramatically tightens the blast radius if the token ever leaks.
:::

:::tip
Start with a low-stakes workflow as the target — like a "notify Slack" workflow that just posts a message. Once the agent → GitHub Actions handoff is proven, graduate to higher-stakes targets (deploy, release-cut, etc.).
:::
  `,

  "gitlab-ci-cd-integration": `
## GitLab CI/CD Integration

Personas integrates with GitLab in two ways: a direct GitLab plugin that gives agents API-level access (pipeline status, MR comments, issue management), and a GitLab CI YAML export that runs Personas agents as steps inside your existing pipelines. Both ship; pick the one that fits your team's workflow shape.

The plugin (Plugins → GitLab) handles the API-side integration: install, authenticate, and your agents get a \`gitlab\` tool surface with the high-level actions (start pipeline, comment on MR, manage issues). The CI YAML export goes the other direction — your agents become steps in your GitLab CI pipelines, executed by GitLab runners, with results passed forward to subsequent steps.

### Key Points

- **GitLab plugin** — API-level integration; agent uses GitLab as a tool from its Connectors tab
- **CI YAML export** — agent becomes a step in your GitLab pipeline; runs on your GitLab runners
- **Bi-directional** — GitLab events can trigger agents (webhook), and agents can trigger GitLab pipelines (plugin)
- **Token scopes** — use project access tokens or group access tokens scoped to minimum needed permissions
- **Pipeline events as triggers** — \`Pipeline succeeded\`, \`Pipeline failed\`, \`MR merged\` are all consumable via webhook trigger

### How It Works

The plugin uses GitLab API tokens stored in the credential vault. When an agent invokes a GitLab tool action, the engine dispatches the API call, captures the response, and feeds it back as the tool result for the model's next turn.

For CI export: open the agent's Settings tab → Export → GitLab CI YAML. The wizard generates a job definition that wraps the agent in a CI-runnable shape (typically a Docker image with the Personas CLI plus the agent's reference). Commit the generated YAML to your repository's \`.gitlab-ci.yml\`; the agent runs as part of your pipeline alongside any other CI jobs.

:::warning
The exported CI YAML references credential variables for things like AI provider keys. Define these as **masked, protected** GitLab CI/CD variables in your project settings — never hardcode secrets in the YAML file itself, since pipeline YAML lives in your repo and is visible to anyone with read access.
:::

:::tip
The plugin is the lighter-weight option for most teams. CI YAML export is most useful when the agent has to run inside a GitLab runner anyway (network isolation, internal-network resources, compliance-mandated infrastructure) — otherwise the plugin lets you keep the agent in Personas where its observability and debugging are richest.
:::
  `,

  "n8n-workflow-integration": `
## n8n Workflow Integration

n8n is a popular open-source workflow automation tool, and Personas integrates with it bidirectionally. You can import existing n8n workflows into Personas as templates (Templates → n8n Import) — the import wizard parses the workflow JSON and maps n8n nodes to equivalent Personas agents, connectors, and triggers. You can also call Personas agents *from* n8n by using HTTP/webhook nodes to invoke an agent's inbound webhook URL.

The n8n import is one-way and one-time: it brings the workflow's *shape* into Personas, but it doesn't keep the n8n original synced. After import, the imported pipeline is yours to edit independently.

### Key Points

- **n8n → Personas import** — Templates → n8n Import; parses workflow JSON, maps nodes to Personas equivalents
- **Personas → n8n trigger** — n8n's HTTP/webhook nodes can POST to an agent's webhook trigger URL
- **n8n → Personas trigger** — n8n can call a Personas agent webhook as part of an n8n workflow; the agent's response (configurable) flows back to n8n
- **Not synced** — imported pipelines diverge from their n8n source; treat the import as a one-time starting point
- **Mapped node coverage** — the importer handles common nodes (HTTP, function, IF, switch); exotic / community nodes may import as placeholders for manual completion

### How It Works

The import wizard reads the n8n workflow JSON (export from n8n → "Download" on the workflow), maps each node to its closest Personas equivalent (HTTP nodes → tools, function nodes → agents, IF/switch → conditional routing, etc.), and stages the result as a pipeline you preview before accepting. The mapping is best-effort: anything the importer can't map confidently becomes a placeholder with a note for you to fill in.

For the reverse direction, the Personas agent's webhook URL is just a URL — any n8n HTTP node can call it. Pass input as the request body; the agent processes and (optionally) replies synchronously with its output.

:::tip
n8n excels at the "moving data between services" plumbing; Personas excels at the "thinking" — analyzing, deciding, writing. The strongest combined workflows use n8n for orchestration plus Personas agents for AI-powered decision points, rather than trying to do all of one in the other.
:::
  `,

  "byoi-bring-your-own-infrastructure": `
## BYOI — Bring Your Own Infrastructure

BYOI (Builder tier) means you run the orchestrator yourself instead of using our managed cloud. You install the orchestrator software (provided as a Docker image and a Kubernetes Helm chart) on your own infrastructure, configure it to your preferences (auth, storage, networking), and point the desktop app at your orchestrator URL. From that point, deploying agents works identically to managed cloud — they just run on your hardware.

BYOI is the right choice when data sovereignty matters (regulatory environments, customer-data isolation, air-gapped networks), when you have existing infrastructure you want to leverage (rather than paying for managed hosting in addition), or when you want full control over the runtime environment (custom networking, specific availability guarantees, integration with your existing observability stack).

### Key Points

- **Self-hosted orchestrator** — Docker image + Helm chart published per release
- **Data sovereignty** — execution data, credentials, and traces never leave your infrastructure
- **Same agent semantics** — agents deployed to a BYOI orchestrator behave identically to managed cloud
- **Your auth, your storage, your network** — orchestrator integrates with your existing identity provider, database, and network policies
- **Builder-tier feature** — requires Builder subscription for the orchestrator software license

### How It Works

The orchestrator runs as a long-lived server process. The Docker image is self-contained for single-node deployments; the Helm chart supports HA multi-node setups with shared storage. Auth integrates with OIDC providers so you can use your existing SSO; storage uses Postgres (managed or self-hosted); credential vault encryption keys live in your KMS of choice (Vault, AWS KMS, GCP KMS, Azure Key Vault).

Deploying an agent to a BYOI orchestrator is identical to managed cloud from the desktop app's perspective — same UI, same flow, same observability. The orchestrator endpoint is just configured to point at your installation instead of ours.

:::info
BYOI is genuinely infrastructure work. The orchestrator software is well-documented and the Helm chart handles most setup, but you'll still need someone comfortable with running production server software. For teams without that capacity, managed cloud is the better starting point — switch to BYOI later if requirements change.
:::

:::tip
Run BYOI in a staging environment first if you're new to it. The setup guide includes a "minimal local stack" Docker Compose that runs the orchestrator + Postgres + Vault on a single machine — perfect for getting the moving parts working before deploying production hardware.
:::
  `,

  "syncing-desktop-and-cloud": `
## Syncing Desktop and Cloud

When you have agents deployed to a cloud orchestrator, the desktop app keeps state synced between the two automatically. Local edits to a deployed agent (prompt change, settings tweak, credential rotation) push to the orchestrator on save. Cloud-side events (execution results, trigger fires, health changes) sync back to the desktop and appear in monitoring views.

Sync runs in the background continuously while the desktop is connected. When the app is offline, local changes queue and push when reconnected; cloud events accumulate server-side and stream down on reconnect. The status bar shows the sync state with a small indicator (green = fully synced, amber = sync in progress / queued changes, red = sync error needs attention).

### Key Points

- **Bidirectional, automatic** — local changes push on save; cloud events stream down continuously
- **Offline-tolerant** — local changes queue while offline and push on reconnect; cloud preserves events for catch-up
- **Conflict detection** — if the same agent is edited locally and remotely (e.g. by a teammate using the same orchestrator), the desktop prompts to resolve before committing
- **Status indicator** — bottom-bar element shows live sync state
- **Manual sync** — click the indicator for explicit sync trigger; useful right before disconnecting

### How It Works

Sync uses a per-resource version vector. Each agent, credential, trigger, and execution record carries a version that increments on change. Sync is "send my versions, receive any newer ones" — efficient, conflict-aware. Conflicts (rare, but possible in shared-orchestrator setups) surface as a resolution prompt; you pick which version wins or merge manually.

:::tip
Glance at the sync indicator after meaningful changes. Green means it's safe to close the app and trust the cloud has the latest. Amber means changes are in flight — wait a few seconds before disconnecting if you want to be sure.
:::
  `,

  "cloud-troubleshooting": `
## Cloud Troubleshooting

Most cloud issues fall into a small set: orchestrator unreachable (network / firewall / orchestrator down), credential mismatch (a credential the agent uses isn't replicated to the orchestrator side), version mismatch (orchestrator on an older release than the desktop, missing features), or out-of-sync configuration (local has unsaved changes that haven't pushed). The Deployment → Cloud Deploy status page is the single best diagnostic surface — it shows orchestrator health, sync state, and per-agent deployment status with specific failure reasons.

For agent-level issues (agent deployed but not running, runs failing in cloud but succeeding locally), the agent's Health tab shows the same diagnostics for cloud as for local — credential status, recent failure reasons, configuration completeness. The execution trace also shows whether a run executed on cloud or local, so you can isolate "cloud-only" issues quickly.

### Common Issues and Fixes

| Symptom | Likely cause | Fix |
|---|---|---|
| Agent not running on schedule | Orchestrator unreachable, or trigger disabled cloud-side | Check Deployment status; redeploy if trigger state is stale |
| Credential error on first cloud run | Credential not replicated to orchestrator | Deployment → Cloud Deploy → "Sync credentials"; verify agent's Connectors tab |
| Results not appearing on desktop | Sync paused or app offline when run happened | Click sync indicator; events stream down on reconnect |
| Cloud agent slower than local | Different model / provider configured at deploy; or network latency from agent to AI provider | Check the agent's effective config in Cloud Deploy detail view |
| "Version mismatch" error on deploy | Orchestrator on older release | Upgrade orchestrator (BYOI) or wait for managed-cloud rollout |

### How It Works

The Deployment status page polls the orchestrator continuously while the desktop is connected and renders the result as a single dashboard. Each deployed agent has a per-resource status (healthy / degraded / unreachable) with the specific issue named. Most issues have a one-click resolution offered directly from the status row.

:::warning
"Redeploy" is the easiest fix for many cloud issues, but it pushes the *current local state* to the orchestrator. If you have local changes you haven't reviewed (or, on a shared orchestrator, the cloud has changes that haven't reached local), redeploying may overwrite them. Always check sync state first — if amber, resolve sync before redeploying.
:::

:::tip
The most common cloud issue by far is "I forgot to replicate a credential to the cloud vault". Before deploying any agent, the deploy wizard pre-checks credential availability and warns; pay attention to that warning rather than dismissing it, and most cloud-side credential errors disappear.
:::
  `,
};
