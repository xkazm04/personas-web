export const content: Record<string, string> = {
  "installing-personas": `
## Installing Personas

Getting Personas on your computer takes about a minute. Head to the download page, grab the installer for your operating system — Windows, macOS, or Linux — and run it. The installer is a single file with no complicated setup wizard. Just double-click, follow the prompts, and you're done.

Once installed, Personas opens to a welcome screen that walks you through connecting your first AI provider. You can skip this step and do it later, but having a provider connected right away means you can start building agents immediately.

:::steps
1. **Download the installer** — grab the single-file installer for your OS from the official website
2. **Run the installer** — double-click on Windows, drag to Applications on macOS
3. **Approve security prompts** — your OS may ask you to confirm running new software
4. **Launch Personas** — the app opens to a welcome screen with a provider setup wizard
5. **Connect a provider (optional)** — paste an API key to start building agents immediately
:::

:::info
Works on **Windows 10+**, **macOS 12+**, and most modern **Linux** distributions. Updates are automatic — you'll always have the latest version.
:::

:::tip
If you run into a security warning, it's just your operating system being cautious with new software. Approve it and you're all set.
:::
  `,

  "creating-your-first-agent": `
## Creating Your First Agent

Building your first agent is a five-minute journey from a blank slate to a working assistant. Click \`Create Agent\` on the main screen, give your agent a name (like "Email Summarizer" or "Daily Reporter"), and write a short description of what you want it to do.

Next, you'll write your agent's instructions — think of this as explaining a task to a helpful colleague. Be clear and specific. For example: "Read my latest 5 emails and write a one-paragraph summary of each." That's all it takes to get started.

:::steps
1. **Click \`Create Agent\`** — find the button on the home screen or press \`Ctrl+N\`
2. **Name your agent** — choose a name and icon that helps you recognize it at a glance
3. **Write your instructions** — tell the agent what to do in plain language
4. **Select an AI model** — Claude is a great default choice for most tasks
5. **Hit \`Save\`** — your agent is ready to run
:::

### How It Works

When you create an agent, you're essentially writing a job description. The AI model reads your instructions and follows them each time the agent runs. The better your instructions, the better the results.

:::tip
Start simple. You can always add more detail to your instructions later as you see how your agent performs.
:::
  `,

  "understanding-the-interface": `
## Understanding the Interface

The Personas interface is designed to feel familiar, even if you've never used an AI tool before. On the left, you'll find the **sidebar** — your main navigation hub. It lists your agents, pipelines, and key sections like credentials and monitoring. The center area is your **workspace**, where you build and configure things.

At the top, you'll see a search bar and quick-action buttons. The bottom bar shows system status and any running agents. Everything is organized so the things you use most are never more than one or two clicks away.

| Area | What It Does | Where to Find It |
|------|-------------|-------------------|
| Sidebar | Navigate between agents, pipelines, testing, and settings | Left edge of the window |
| Workspace | Build, configure, and view content | Center of the screen |
| Top bar | Search, notifications, and quick actions | Top edge |
| Status bar | Running agents and system health | Bottom edge |

### How It Works

Think of the sidebar as a table of contents and the workspace as the page you're reading. Click something in the sidebar, and it opens in the workspace. You can resize the sidebar or collapse it to get more room. Most actions are also available through keyboard shortcuts.

:::tip
Hover over any icon to see a tooltip explaining what it does. This is a great way to learn the interface as you go.
:::
  `,

  "what-is-an-ai-agent": `
## What Is an AI Agent?

An AI agent is like a smart assistant that follows your instructions to complete tasks automatically. You tell it what to do, give it the tools it needs, and it handles the rest. Unlike a simple chatbot that just answers questions, an agent can take actions — send emails, process files, search the web, and more.

Think of it this way: a chatbot is like asking a friend for advice, while an agent is like hiring an assistant who actually does the work for you. You write the instructions once, and your agent can repeat that task as many times as you need.

| | Chatbot | AI Agent |
|---|---------|----------|
| Interaction | Answers questions | Completes tasks |
| Actions | Suggests | Executes |
| Tools | None | Email, files, web, APIs |
| Automation | Manual only | Scheduled, triggered, or manual |
| Programming | Not needed | Not needed |

### How It Works

You create an agent by describing a task in everyday language. The AI model reads your instructions and carries them out using the tools you've provided. For example, an agent with email access can read your inbox, draft replies, and send them — all based on the rules you set.

:::tip
Start by thinking about a repetitive task you do every week. That's usually the perfect first job for an agent.
:::
  `,

  "running-your-first-automation": `
## Running Your First Automation

You've built your agent — now it's time to see it in action. Open your agent and click the **\`Run\`** button. Your agent will start processing, and you'll see a live feed of what it's doing. Within seconds (or minutes, depending on the task), you'll have results.

It's like pressing play on a recipe — your agent does the cooking while you watch. The results appear in the output panel, where you can read, copy, or save them. If something doesn't look right, you can tweak your instructions and run again.

:::steps
1. **Open your agent** — find it in the sidebar and click to select it
2. **Click the green \`Run\` button** — at the top of the workspace
3. **Watch the live feed** — see your agent work through the task in real time
4. **Review the results** — read, copy, or save the output
5. **Iterate if needed** — adjust your instructions and run again
:::

### How It Works

When you hit run, your instructions are sent to the AI model along with any data or tools the agent needs. The model processes everything and returns the result. The whole cycle typically takes a few seconds to a couple of minutes.

:::tip
Your first run is a learning experience. Don't worry if the output isn't perfect — small adjustments to your instructions usually make a big difference.
:::
  `,

  "choosing-your-ai-provider": `
## Choosing Your AI Provider

AI providers are the engines that power your agents. Personas supports several providers — including Claude (by Anthropic), OpenAI, Google Gemini, and others. Each has different strengths: some are better at creative writing, others excel at analysis or following complex instructions.

You're not locked into one choice. You can assign different providers to different agents, and switch anytime. Most users start with one provider and experiment with others as they get comfortable.

| Provider | Best For | Strengths |
|----------|----------|-----------|
| Claude | Following detailed instructions | Nuance, safety, long context |
| OpenAI (GPT) | General-purpose tasks | Versatility, wide ecosystem |
| Google Gemini | Research and large text | Speed, multimodal input |
| Local models | Privacy-sensitive work | No data leaves your machine |

### How It Works

Go to \`Settings\` and add your provider's API key (a special password that connects your account). Once connected, you'll see the provider as an option when creating or editing agents. You can also set a default provider so new agents use it automatically.

:::tip
Most providers offer free credits for new users. Try a couple before committing to find the best fit for your typical tasks.
:::
  `,

  "starter-vs-team-vs-builder-tiers": `
## Starter vs Team vs Builder Tiers

Personas offers three tiers to match different needs. **Starter** is free and perfect for trying things out — you get access to basic agents, a handful of triggers, and enough features to automate simple tasks. It's a great way to explore without any commitment.

**Team** adds collaboration features, letting multiple people share agents and work together. **Builder** unlocks the most advanced features — complex pipelines, genome evolution, and unlimited triggers. You can upgrade or downgrade anytime, and your agents stay intact.

| Feature | Starter (Free) | Team | Builder |
|---------|----------------|------|---------|
| Agents | Up to 5 | Unlimited | Unlimited |
| Triggers | Manual + Schedule | All types | All types |
| Pipelines | — | Team pipelines | Advanced pipelines |
| Testing | Basic | Full lab | Genome evolution |
| Deployment | Local only | Cloud | Cloud + BYOI |
| Support | Community | Priority | Priority |

### How It Works

Your tier is managed in \`Settings > Subscription\`. Upgrading takes effect immediately — new features appear right away. Downgrading keeps your existing agents but disables tier-specific features until you upgrade again. No data is ever deleted when changing tiers.

:::tip
Start with Starter to learn the basics. You'll know when you need more — that's the right time to upgrade.
:::
  `,

  "system-requirements": `
## System Requirements

Personas is designed to be lightweight and run on most modern computers. You don't need a powerful gaming machine or a fancy setup — if your computer can run a web browser smoothly, it can run Personas.

The app uses minimal resources when idle and scales up only when agents are actively running. Most of the heavy lifting happens on the AI provider's servers, not on your computer.

| Requirement | Minimum | Recommended |
|-------------|---------|-------------|
| OS | Windows 10 / macOS 12 / Ubuntu 20.04+ | Latest version |
| RAM | 4 GB | 8 GB+ |
| Disk Space | 500 MB | 1 GB+ |
| Internet | Stable connection | Broadband |
| CPU | Any modern dual-core | Quad-core |

### How It Works

Personas runs as a desktop application with a local database that stores your agents, credentials, and settings on your own machine. When an agent runs, it communicates with your chosen AI provider over the internet. The results come back and are stored locally.

:::tip
If you notice slowness, check that other apps aren't using too much memory. Closing unused browser tabs is often the quickest fix.
:::
  `,

  "keyboard-shortcuts-and-tips": `
## Keyboard Shortcuts and Tips

Once you learn a few key shortcuts, everyday tasks become almost instant. Instead of clicking through menus, you can create agents, run tasks, and navigate the app with quick key combinations. It's like learning to touch-type — awkward at first, but soon it's second nature.

The shortcuts are designed to be intuitive. Most follow standard patterns you already know from other apps, like \`Ctrl+N\` for new and \`Ctrl+S\` for save.

### Essential Shortcuts

:::keys
Ctrl+N — Create a new agent
Ctrl+Enter — Run the current agent
Ctrl+S — Save your changes
Ctrl+K — Open quick search to find anything
Ctrl+/ — Toggle the sidebar open or closed
Ctrl+, — Open settings
:::

### Navigation Shortcuts

:::keys
Ctrl+1 — Go to Home
Ctrl+2 — Go to Agents
Ctrl+3 — Go to Events
Ctrl+Shift+P — Open command palette
:::

### How It Works

Shortcuts work anywhere in the app. You can also customize them in \`Settings > Keyboard Shortcuts\` if you prefer different combinations. A handy cheat sheet is available anytime by pressing \`Ctrl+?\`.

:::tip
You don't need to memorize everything at once. Start with \`Ctrl+K\` (quick search) — it lets you find and open anything by typing a few letters.
:::
  `,

  "where-to-get-help": `
## Where to Get Help

You're never stuck alone with Personas. There are several ways to get help, whether you prefer reading guides, chatting with other users, or reaching out to the support team directly. Most questions have already been answered somewhere — the trick is knowing where to look.

The community is friendly and active, and the documentation covers everything from beginner basics to advanced techniques.

| Resource | Best For | Response Time |
|----------|----------|---------------|
| This Guide | Feature explanations, how-tos | Instant |
| Discord Community | Quick questions, tips | Minutes |
| Documentation Site | Detailed articles, tutorials | Instant |
| Support Email | Account or technical issues | Hours |
| Video Tutorials | Visual walkthroughs | Instant |

### How It Works

For quick questions, start with the built-in guide or search the Discord community — chances are someone has asked the same thing. For bugs or account issues, the support team typically responds within a few hours.

:::tip
The Discord community is the fastest way to get help. Other users often reply within minutes, and the team monitors it daily.
:::
  `,
};
