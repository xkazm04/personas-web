export const content: Record<string, string> = {
  "installing-personas": `
## Installing Personas

Personas runs on **Windows** today. macOS and Linux builds are on the roadmap — see the cards below for current platform availability.

Getting Personas on your Windows machine takes about a minute. Download the installer, run it, approve the SmartScreen prompt, and the app launches. Updates are delivered automatically in the background, so you'll always have the latest version without doing anything.

:::cards
[available] Windows | The Windows installer is a 53 MB NSIS \`.exe\`. Code-signed, auto-updating, runs on Windows 10 or newer (64-bit). | /imgs/get-started/platform/windows
[roadmap] macOS | Native universal \`.dmg\` for Apple Silicon and Intel is in development. Track progress on the roadmap. | /imgs/get-started/platform/mac
[roadmap] Linux | \`.AppImage\` and \`.deb\` builds for Ubuntu, Debian, Fedora, and Arch are in development. Track progress on the roadmap. | /imgs/get-started/platform/linux
:::

### Precondition: Install Claude Code

Personas builds on top of **Claude Code** for its agent execution engine, so Claude Code needs to be installed first. The Claude Code installer is a single file from Anthropic and takes under a minute.

:::steps
1. **Open the Claude Code installer page** — head to [claude.com/claude-code](https://claude.com/claude-code) and follow the install flow for your platform
2. **Confirm the install** — run \`claude --version\` in a terminal to verify the binary is on your PATH
3. **Continue with Personas below** — Claude Code only needs to be installed once; subsequent Personas updates don't require reinstalling it
:::

:::info
If you already have Claude Code installed for other work, skip this section — Personas will pick up your existing install automatically.
:::

### Windows install

:::steps
1. **Download the installer** — grab the NSIS \`.exe\` from the download page
2. **Double-click to run** — SmartScreen may ask you to confirm the publisher the first time; the installer is code-signed, so it's safe to approve
3. **Approve security prompts** — Windows may ask you to allow the install; this is standard for new desktop software
4. **Tick "Add to PATH"** — optional but recommended so you can launch and script Personas from a terminal
5. **Launch Personas** — the welcome screen opens with a guided tour you can take or skip
:::

After install, the bundled binary is around 90 MB. Auto-updates run silently in the background, delta-only — typically much smaller than the original installer.

The first time the app opens, you land on the welcome screen. From there you can either jump straight into building an agent (Personas will offer to set up an AI provider when you need one) or open the credential vault first if you already have API keys you want to store. Both paths work.

### Verifying your install

Once Personas is installed, you can confirm it's reachable from your terminal. This is handy for scripting, CI integration, or just a quick sanity check after a fresh install.

:::cli
$ personas --version
:::

Print the available flags:

:::cli
$ personas --help
:::

If your shell can't find the \`personas\` command, the desktop launcher still works — the CLI is an optional convenience that the installer wires up only when you tick "Add to PATH" during setup. Re-run the installer and tick that option if you want it later.

:::tip
If you run into a Windows SmartScreen warning, it's your OS being cautious with new software. Approve it and you're all set — the installer is code-signed.
:::
  `,

  "creating-your-first-agent": `
## Creating Your First Agent

Your first agent takes about five minutes from blank slate to working assistant. You have two paths: **start from a template** (recommended for your first agent — the build engine assembles a working configuration from your answers) or **start from scratch** (full manual control). Both end up at the same place: an agent you can run.

If you pick the template path, the build engine kicks off an interactive session. It asks clarifying questions in batches ("what kind of input do you expect?", "where should the output go?", "how often should this run?"), proposes parameters based on your answers, and shows a live preview of the agent it's about to build. You approve at the end, and the agent lands ready to test.

If you pick the from-scratch path, you write the prompt yourself, pick the AI model, attach any tools, and save.

:::steps
1. **Open the Agents page** — sidebar → Agents, or press \`Ctrl+1\` to jump there
2. **Click Create Agent** — pick a path: pick a template, or start blank
3. **Answer the build questions (template path)** — the build engine batches clarifying questions per capability and shows a live preview as your answers shape the agent
4. **Adjust the prompt and tools** — fine-tune the instructions the template produced (or write them from scratch)
5. **Promote when ready** — moves the agent from draft to active; setup-status checks run automatically to flag any unconnected credentials or unconfigured triggers before you can promote
:::

### How It Works

The template path is the fastest way to get a *good* agent (templates are designed and tested by us), but you'll outgrow it. Once you've shipped a couple of template-based agents, you'll start writing prompts directly and treating templates as starting points rather than full solutions.

:::tip
Don't worry about perfecting your first agent. The version history (covered later) means you can experiment freely — every save is a checkpoint you can return to.
:::
  `,

  "understanding-the-interface": `
## Understanding the Interface

The Personas interface has three main regions. The **sidebar** on the left is your top-level navigation — Home, Overview, Agents, Events, Connections, Templates, Plugins, Schedules, Pipeline, Deployment, and Settings. Click a top-level section and a second-level nav appears showing its sub-pages (e.g. clicking Agents reveals All Agents, plus the Editor tabs for the currently-selected agent: Prompt, Connectors, Lab, Activity, Health, Settings).

The center area is the **workspace** where everything actually happens — editing prompts, watching executions, browsing the credential catalog. The **title bar** at the top holds the notification bell (click for the freshest execution detail), the cockpit access ("Talk to Athena"), and the global search. The **bottom strip** shows active executions and any urgent system events.

| Region | What it does |
|------|-------------|
| Sidebar Level 1 | Top-level sections — Home, Overview, Agents, Events, Connections, Templates, Plugins, Schedules, Pipeline, Deployment, Settings |
| Sidebar Level 2 | Context-sensitive sub-nav for the active section |
| Workspace | The main editor / browser / dashboard for whatever section you're on |
| Title bar | Notification bell, cockpit shortcut, global search, app controls |
| Bottom strip | Active executions, system status |

### How It Works

Most of what you do happens by clicking a sidebar item and editing in the workspace. The title-bar notification bell is the one universal shortcut worth memorizing — it always opens the most recent execution detail, no matter where you are. The cockpit shortcut ("Talk to Athena") opens an in-app chat with the companion that can help you build, debug, or just answer questions about your setup.

:::tip
Hover any sidebar icon for a tooltip with the keyboard shortcut. \`Ctrl+1\` through \`Ctrl+9\` jump directly to top-level sections, and \`Ctrl+K\` opens global search so you can find anything by name.
:::
  `,

  "what-is-an-ai-agent": `
## What Is an AI Agent?

An AI agent is a configured AI model with a job. You give it instructions ("read my unread emails and summarize the important ones"), tell it which tools it can use, and trigger it — manually with a button, on a schedule, on an event, or as a step in a pipeline. The agent reads the trigger payload, follows your instructions, calls any tools it needs, and produces an output. Unlike a chatbot, the agent acts: sends the email, writes the file, posts to Slack.

Each agent in Personas is durable — it remembers its setup, its history, its credentials, and (optionally) memories from past runs. You can clone it, version-control its prompt, run it in an arena against alternative prompts to see which performs better, and chain it to other agents to build multi-step workflows.

:::compare
**Chatbot**
You type a question, it replies. Each turn is one-shot. Useful for quick lookups, brainstorming, drafting. No actions, no memory across sessions, no automation.
---
**AI Agent** [recommended]
A persistent configuration with a job. Triggered manually or automatically; uses tools to act; has version-controlled prompt, attached credentials, execution history, and a health indicator. The model is the engine, but the agent is the whole assembly around it.
:::

### How It Works

:::diagram
[Trigger fires] --> [Agent reads input] --> [Model + tools execute] --> [Output dispatched]
:::

The trigger packs an input payload (a webhook body, a clipboard string, a file path, an event from another agent…). The agent reads its prompt, feeds it to the AI model along with the input, and lets the model call attached tools as needed. The final output is dispatched through whatever output channel you configured — back to a UI, written to a file, posted to Slack, or chained as input to the next agent.

:::tip
The fastest way to understand agents is to look at your repetitive weekly tasks and ask: "could this be triggered, instructed, and automated?" If yes, that task is an agent.
:::
  `,

  "running-your-first-automation": `
## Running Your First Automation

Once you've created an agent, you have several ways to start it. The simplest is the manual **Run** button at the top of the agent editor — click it and you'll see the live execution stream in the activity panel. Within a few seconds (or a couple of minutes for slower providers or longer prompts), the output appears.

For repeating work, add a schedule trigger, a webhook trigger, a file-watcher trigger, or a chain trigger so the agent runs on its own. You set the trigger once, the agent does the rest.

:::steps
1. **Open the agent** — find it on the Agents page; the editor opens with the Prompt tab focused
2. **Click Run** — the workspace switches to the Activity tab automatically; you see the prompt being constructed, the model call going out, and tokens streaming back
3. **Watch the live feed** — each agent has its own stream so you can run multiple in parallel without confusion
4. **Review the output** — the activity row expands to show the full prompt, the model response, any tool calls made, the duration, and the cost
5. **Iterate** — change the prompt or settings, save, run again; every run is checkpointed
:::

### How It Works

A run is a single execution: trigger → prompt-construction → model-call → tool-calls → output. Every step is captured in the execution trace, and the run lands in the Activity tab of the Overview page (the global view across all agents) and in the agent's own Activity tab. From either place you can click into the run for the full detail modal.

If a run fails (model error, expired credential, network blip), the agent's health indicator turns yellow or red and the failure is preserved in the trace so you can debug.

:::tip
Your first run is partly about learning what your prompt actually does in practice. If the output isn't what you wanted, the trace shows you exactly what the model received — usually the fix is to clarify or constrain the prompt rather than retry.
:::
  `,

  "choosing-your-ai-provider": `
## Choosing Your AI Provider

Personas supports the major AI providers — **Anthropic** (Claude family), **OpenAI** (GPT family), **Google** (Gemini), and **local models** via Ollama or any OpenAI-compatible endpoint. You can also configure custom providers in Settings → Custom Models. Each agent picks its provider/model independently, so you can run cheap models on routine work and reserve expensive ones for tasks that need them.

Connect a provider once on the Connections page (you'll paste an API key — encrypted in the local vault — or run through OAuth for providers that support it). After that, every agent's model picker shows the configured providers and their models.

:::compare
**Anthropic Claude** [recommended]
Strong instruction-following, long-context reasoning, structured output. Sonnet 4.6 is the default for new agents. Opus models for hardest reasoning, Haiku for speed/cost. Excellent at tool-use loops.
---
**OpenAI GPT**
Broadest ecosystem and the most-tested for many use cases. Solid all-rounder; GPT-4o-class models are strong for general assistant work.
---
**Google Gemini**
Multimodal, large context windows, fast first-token latency. Strong for research / document-processing agents.
---
**Local (Ollama / OpenAI-compatible)**
Runs on your machine — zero data leaves the device. Smaller models, but for low-stakes or private work the trade-off is often worth it.
:::

### How It Works

Once multiple providers are connected, Personas can do automatic failover at the agent level: if your primary provider returns errors above a threshold, the agent's next run uses the configured fallback provider. When the primary recovers, normal rotation resumes. This is configured per-agent in the Editor → Settings tab.

For cost tracking, every run is tagged with provider, model, and token count, so the Overview → Usage tab can break down spending by provider, model, or agent.

### See It In Action

:::usecases
**Model-per-agent strategy**
Your agents have different needs
---
Code-review agent uses Claude Opus (best reasoning); email summarizer uses Haiku (fast and cheap); a personal/private agent runs on Ollama locally.
===
**Provider outage failover**
A provider has a regional outage
---
Affected agents automatically route to the configured fallback; the Health tab shows which agents are running on fallback and surfaces the recovery once the primary comes back.
===
**Cost reduction**
Monthly AI spend creeps up
---
Overview → Usage shows which agents and models dominate the spend. Swap the top-cost agents to a cheaper tier (Sonnet → Haiku, GPT-4o → GPT-4o-mini); the Lab can A-B them first to confirm quality holds.
:::

:::info
Default provider for new agents is set in Settings → Engine. You can override on every agent.
:::

:::tip
Most providers offer free trial credits. Connect two or three and run the same prompt against each in the Lab arena — you'll feel the personality differences and pick a default that fits your style.
:::
  `,

  "starter-vs-team-vs-builder-tiers": `
## Starter vs Team vs Builder Tiers

Personas ships in three tiers. **Starter** is free, local-only, and enough to build real agents and learn the system. **Team** adds collaboration features, cloud deployment, and the full testing lab. **Builder** unlocks the most advanced surfaces — full pipeline orchestration, genome evolution for prompt optimization, and BYOI (bring your own infrastructure) for cloud deployment to your own gateway.

You can change tier at any time. Existing agents stay intact when you downgrade; tier-gated features disable until you upgrade again. No agents or credentials are ever deleted.

:::compare
**Starter (Free)**
Up to 5 agents. Manual + schedule + clipboard triggers. Local-only execution. Basic lab (single-prompt runs, no arena). Single-user. Perfect for learning and personal automation.
---
**Team**
Unlimited agents. All trigger types including webhooks and file watchers. Cloud deployment via the managed orchestrator. Full Lab (arena, A-B, eval grid). Team shared agents. Priority support.
---
**Builder** [recommended]
Everything in Team plus advanced pipelines (conditional routing, team memory), genome evolution (auto-optimize prompts from execution history), and BYOI cloud deploy (host the orchestrator yourself).
:::

### How It Works

Open Settings → Account to see your current tier, usage against tier limits, and the upgrade path. Upgrades activate immediately; downgrades take effect at the next billing cycle so you don't lose access mid-period.

:::tip
Start on Starter. The moment you find yourself hitting an agent-count limit or wanting a webhook trigger, you've found a real use case for upgrading — and you'll know exactly what features pay back the cost.
:::
  `,

  "system-requirements": `
## System Requirements

Personas is a Tauri desktop app — Rust backend, React frontend, local SQLite database — and it's intentionally lightweight. Most of the heavy compute happens on the AI provider's servers, not your machine. The app idles at near-zero CPU and uses a few hundred megabytes of RAM; it scales up only when agents are actively running locally.

The bundled binary is about 90 MB after install. Plugins (Artist for image generation, Obsidian Brain for vector search) can add to that footprint if you enable them.

:::checklist
- Windows 10+, macOS 12+, or Ubuntu 20.04+ (latest version recommended)
- 4 GB RAM minimum (8 GB+ recommended if you use the embeddings / vector-search plugins)
- 1 GB free disk space (more if you enable the Artist plugin's local models)
- Stable broadband — agent execution is bound by the AI provider's API latency
- Any modern dual-core CPU; quad-core or better recommended for parallel multi-agent runs
:::

### How It Works

The app stores its database (\`personas.db\`), credential vault, execution history, and configuration locally in your OS-specific app-data directory. Nothing is uploaded unless you explicitly enable cloud deployment or use a cloud AI provider. Plugins that ship local models (e.g. the Artist plugin's image-gen + Gemini vision) download the model files on first use.

The Windows build uses ONNX Runtime for embedding when the vector-knowledge-base feature is enabled; this is the largest single dependency in that case.

:::tip
If you see the app feel slow during a multi-agent run, open the Health tab — it shows which agents and which dependencies (model calls, tool calls, ONNX inference) are contributing to the load.
:::
  `,

  "keyboard-shortcuts-and-tips": `
## Keyboard Shortcuts and Tips

A few keyboard shortcuts cover most of the friction in the app. \`Ctrl+K\` opens global search (find any agent, page, or setting by name). \`Ctrl+1\`–\`Ctrl+9\` jump to top-level sidebar sections. \`Ctrl+Enter\` runs the focused agent. \`Ctrl+N\` opens the Create Agent flow.

You can customize any binding in Settings → Appearance → Keyboard Shortcuts; defaults follow OS conventions where possible.

### Essential Shortcuts

:::keys
Ctrl+K — Global search (find anything by name)
Ctrl+N — Create a new agent
Ctrl+Enter — Run the focused agent
Ctrl+S — Save changes in the current editor
Ctrl+/ — Toggle the sidebar open/closed
Ctrl+, — Open Settings
Ctrl+? — Show the keyboard shortcut cheat sheet
:::

### Navigation Shortcuts

:::keys
Ctrl+1 — Home
Ctrl+2 — Overview
Ctrl+3 — Agents
Ctrl+4 — Events
Ctrl+5 — Connections
Ctrl+6 — Templates
Ctrl+7 — Plugins
Ctrl+Shift+P — Open the command palette (run any action by name)
:::

### How It Works

The command palette (\`Ctrl+Shift+P\`) is the power-user surface. Type a verb (\`run\`, \`clone\`, \`disable\`, \`open\`) plus the target name, and the palette shows matching actions across your whole workspace. It's faster than navigating manually once you know the names of things.

:::tip
Start with \`Ctrl+K\`. Type a few letters of an agent name and hit Enter — that one shortcut covers maybe 60% of everyday navigation.
:::
  `,

  "where-to-get-help": `
## Where to Get Help

You're never stuck. **In-app help** is the fastest path: the cockpit chat ("Talk to Athena" in the title bar) is an LLM-powered companion that knows your setup, your recent executions, and the product. Ask it questions in plain English and it can also propose configuration changes, link you to the right tab, or open a debug session on a failing run.

For things the in-app companion can't answer, the **guide** (this site) is the long-form reference, the **community Discord** is where you ask other users and the team, and **email support** is for account or billing issues.

| Resource | Best for | Response time |
|----------|----------|---------------|
| Cockpit / Athena (in-app) | Setup questions, debugging, "where is X?" | Instant |
| This Guide | Feature reference and how-tos | Instant |
| Documentation site | Architecture, schema, advanced integrations | Instant |
| Discord community | Tips, recipes, "is anyone else seeing…?" | Minutes |
| Support email | Account, billing, security | Hours |
| Video tutorials | Visual walkthroughs of key flows | Instant |

### How It Works

The cockpit has access to a doctrine — a curated body of knowledge about the product — and to your local state (anonymized). It can search your executions, recommend changes, and even compose inline UI cards to walk you through a fix step by step. If it can't answer, it'll suggest the right external resource.

:::tip
For "I think something's broken" questions, open Athena first and ask "diagnose the last failing run of agent X". The cockpit's debug flow is built for this and usually beats reading logs manually.
:::
  `,
};
