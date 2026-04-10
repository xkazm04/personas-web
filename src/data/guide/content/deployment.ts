export const content: Record<string, string> = {
  "local-vs-cloud-execution": `
## Local vs Cloud Execution

Personas agents can run in two places: on your own computer (local) or on a remote server (cloud). **Local execution** is great for testing, private data, and tasks you want to supervise. Your agent runs right on your machine, and you can watch everything in real time.

**Cloud execution** keeps your agents running 24/7, even when your computer is off or you're away. This is ideal for scheduled tasks, webhook-triggered automations, and anything that needs to be always available.

### Key Points

- **Local** — runs on your computer, great for testing and private data, stops when your computer is off
- **Cloud** — runs on remote servers, always available, works even when you're away
- **Same agent** — switch between local and cloud without changing your agent's configuration
- **Mix and match** — some agents can run locally while others run in the cloud

### How It Works

By default, agents run locally. To enable cloud execution, connect to a cloud orchestrator in \`Settings > Deployment\`. Once connected, you can deploy any agent to the cloud with a few clicks. Local and cloud executions use the same prompts, tools, and settings.

> **Tip:** Develop and test locally, then deploy to the cloud once your agent is working well. This gives you the best of both worlds — hands-on control during development and always-on reliability in production.
  `,

  "connecting-to-the-cloud-orchestrator": `
## Connecting to the Cloud Orchestrator

The cloud orchestrator is the service that runs your agents around the clock on remote servers. Connecting once gives your agents the ability to work 24/7 without needing your computer turned on. It's like plugging your agents into a power source that never turns off.

The setup is straightforward — enter your orchestrator credentials and Personas handles the rest.

### Step by Step

- Open **\`Settings > Deployment\`**
- Click **\`Connect Cloud Orchestrator\`**
- Enter your **orchestrator URL** and **authentication key**
- Click **\`Test Connection\`** to verify everything works
- Click **\`Save\`** — your cloud environment is ready

### How It Works

The orchestrator is a server that receives your agent configurations and executes them on your schedule. When you deploy an agent, its prompt, tools, and trigger settings are securely transmitted to the orchestrator. Execution results are synced back to your desktop app automatically.

> **Tip:** Test the connection before deploying any agents. The test button verifies that your credentials are correct and the server is reachable, saving you from troubleshooting deployment issues later.
  `,

  "deploying-an-agent-to-the-cloud": `
## Deploying an Agent to the Cloud

Publishing an agent to the cloud takes just a few clicks. Select an agent, choose your cloud settings (like which region to run in and what resources to allocate), and hit deploy. Within seconds, your agent is live and will keep working on its schedule even when you close the app.

Deployment doesn't remove the agent from your local setup — you can still test and modify it on your desktop.

### Step by Step

- Make sure your **cloud orchestrator** is connected (see "Connecting to the Cloud Orchestrator")
- Open the agent you want to deploy
- Click **\`Deploy to Cloud\`** in the agent's menu
- Review the deployment settings (region, resources, schedule)
- Click **\`Deploy\`** — your agent is live in the cloud

### How It Works

When you deploy, Personas packages your agent's configuration — prompt, tools, credentials, and triggers — and sends it to the cloud orchestrator. The orchestrator creates a running instance of your agent that operates independently. Any changes you make locally can be pushed to the cloud with a single click.

> **Tip:** Deploy agents that need to run on a schedule first. These benefit the most from cloud execution because they need to be available at specific times regardless of whether your computer is on.
  `,

  "cloud-execution-monitoring": `
## Cloud Execution Monitoring

Even though your agents run in the cloud, you can monitor them from the comfort of the Personas desktop app. See live status, costs, execution history, and results — the same information you'd have for local agents. The cloud is just another place your agents live, not a black box.

Everything is synced automatically, so you always see the latest data without any manual refreshing.

### Key Points

- **Same monitoring experience** — cloud and local agents show identical information
- **Live status** — see which cloud agents are currently running
- **Synced results** — execution outputs and logs sync to your desktop automatically
- **Cost tracking** — cloud execution costs are included in your per-agent and per-model views

### How It Works

Open the monitoring dashboard and your cloud agents appear alongside local ones. A small cloud icon distinguishes them. Click any cloud agent to see its full execution history, logs, and costs — everything syncs from the orchestrator to your desktop in real time.

> **Tip:** Set up budget limits for cloud agents just like you would for local ones. Cloud agents running 24/7 can accumulate costs faster than agents you run manually.
  `,

  "github-actions-integration": `
## GitHub Actions Integration

If your team uses GitHub, your Personas agents can trigger GitHub Actions workflows automatically. This bridges the gap between AI-powered decision-making and your team's existing development processes. Your agent could review a pull request, decide it's ready, and kick off the deployment pipeline — all without human intervention.

It's like giving your agent a button that starts your team's standard processes.

### Key Points

- **Trigger workflows** — your agents can start any GitHub Actions workflow
- **Pass data** — send information from your agent to the workflow as parameters
- **Monitor status** — see the workflow's progress and results from within Personas
- **Bi-directional** — GitHub can also trigger your Personas agents via webhooks

### How It Works

Add the GitHub Actions tool to your agent and connect it with your GitHub credentials. In your agent's instructions, describe when and how to trigger workflows. For example: "When you find a critical bug, trigger the hotfix-deploy workflow." The agent uses the GitHub API to start the workflow and can pass along relevant data.

> **Tip:** Start with a non-critical workflow for testing — like a notification pipeline — before connecting agents to production deployment workflows.
  `,

  "gitlab-ci-cd-integration": `
## GitLab CI/CD Integration

Personas can export your agent configurations as GitLab-compatible pipeline YAML files. This means your AI agent setups can run within your existing GitLab CI/CD infrastructure. It bridges the gap between your AI agents and your team's development workflow without requiring anyone to learn a new system.

Your agents and your CI/CD pipelines can work hand-in-hand, each doing what it does best.

### Key Points

- **Export as YAML** — convert agent configurations to GitLab pipeline format
- **Run in your infrastructure** — agents execute within your existing GitLab runners
- **Version controlled** — pipeline files live in your Git repository like any other code
- **Trigger agents from GitLab** — merge events, pipeline completions, or schedules can start your agents

### How It Works

Open an agent and click \`Export > GitLab CI/CD\`. Personas generates a YAML file that defines a GitLab pipeline stage for your agent. Add this file to your repository's CI/CD configuration. When the pipeline runs, your agent executes as a step in the larger workflow.

> **Tip:** Use GitLab CI/CD integration for agents that are part of your development process — code review helpers, documentation generators, or test automation agents.
  `,

  "n8n-workflow-integration": `
## n8n Workflow Integration

If you already use n8n for automation, your Personas agents can plug right in. n8n is a popular workflow automation tool with hundreds of integrations, and connecting it with Personas gives you AI-powered decision-making within your existing automation flows.

This combination is powerful — n8n handles the plumbing (moving data between services), and your Personas agents handle the thinking (analyzing, deciding, writing).

### Key Points

- **Seamless connection** — Personas agents appear as nodes in your n8n workflows
- **Data exchange** — pass data between n8n and your agents in both directions
- **Trigger agents from n8n** — any n8n workflow step can start a Personas agent
- **Return results to n8n** — your agent's output feeds back into the n8n workflow

### How It Works

Install the Personas node in your n8n instance. Configure it with your Personas connection details. In your n8n workflow, add a Personas node wherever you need AI processing. The node sends data to your agent, waits for the result, and passes it along to the next step in your n8n workflow.

> **Tip:** Use Personas agents for the "thinking" steps in your n8n workflows — analyzing data, making decisions, writing text — and let n8n handle the "doing" steps like sending emails or updating databases.
  `,

  "byoi-bring-your-own-infrastructure": `
## BYOI — Bring Your Own Infrastructure

If you prefer to run everything on your own servers — for compliance, cost, or control reasons — BYOI gives you that option. Instead of using the managed cloud orchestrator, you host the execution environment on your own infrastructure. You get all the benefits of cloud execution with none of the vendor lock-in.

This is ideal for organizations with strict data handling requirements or teams that want maximum control over where their agents run.

### Key Points

- **Full control** — run agents on your own servers, your own cloud account, your own rules
- **Data sovereignty** — your data never leaves your infrastructure
- **Same features** — everything works the same as managed cloud, just on your hardware
- **Cost flexibility** — use your existing server capacity instead of paying for managed hosting

### How It Works

Follow the BYOI setup guide in \`Settings > Deployment > Self-Hosted\`. You'll install the orchestrator software on your server, configure it with your preferred settings, and connect it to your Personas desktop app. From that point on, deploying agents works exactly the same — the only difference is where they run.

> **Tip:** BYOI requires some server administration knowledge. If you're not comfortable managing servers, the managed cloud orchestrator is the easier path and works great for most users.
  `,

  "syncing-desktop-and-cloud": `
## Syncing Desktop and Cloud

When you make changes to an agent on your desktop, those changes need to reach the cloud version too. Personas handles this syncing automatically — when you save changes locally, they're pushed to the cloud in the background. This ensures the version running remotely is always up to date.

You can also pull the latest cloud execution results to your desktop, giving you a complete picture of what your agents have been doing while you were away.

### Key Points

- **Automatic sync** — local changes push to the cloud when you save
- **Results sync back** — cloud execution results appear in your local monitoring
- **Conflict detection** — if changes are made in both places, you're alerted to resolve them
- **Offline support** — changes queue up and sync when your connection is restored

### How It Works

Syncing happens in the background whenever your computer is connected to the internet. A small sync indicator in the status bar shows the current state — green means everything is up to date, yellow means syncing is in progress. Click the indicator to see details or manually trigger a sync.

> **Tip:** Check the sync indicator after making important changes. A quick glance confirms that your cloud agents have received the latest updates.
  `,

  "cloud-troubleshooting": `
## Cloud Troubleshooting

If your cloud agent isn't behaving as expected, don't worry — most issues have simple solutions. The most common problems are connection issues (your desktop can't reach the orchestrator), credential problems (a cloud-stored credential has expired), and configuration mismatches (the local and cloud versions are out of sync).

This guide walks you through diagnosing and fixing the most frequent cloud deployment issues.

### Common Issues and Fixes

- **Agent not running** — check that the cloud orchestrator is connected and the agent is deployed
- **Results not syncing** — verify your internet connection and check the sync indicator
- **Credential errors** — re-authenticate credentials that are marked as expired in the cloud
- **Performance issues** — review the cloud execution logs to identify slow steps

### How It Works

Start by checking the \`Deployment\` status page, which shows the health of your cloud connection and all deployed agents. Most issues are visible here — a red indicator tells you something needs attention. Click the indicator for a specific diagnosis and recommended fix.

> **Tip:** When in doubt, try redeploying the problematic agent. This pushes a fresh copy to the cloud and resolves most configuration-related issues.
  `,
};
