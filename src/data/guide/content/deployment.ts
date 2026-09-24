export const content: Record<string, string> = {
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

};
