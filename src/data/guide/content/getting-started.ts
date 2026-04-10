export const content: Record<string, string> = {
  "installing-personas": `
## Installing Personas

Getting Personas on your computer takes about a minute. Head to the download page, grab the installer for your operating system — Windows, macOS, or Linux — and run it. The installer is a single file with no complicated setup wizard. Just double-click, follow the prompts, and you're done.

Once installed, Personas opens to a welcome screen that walks you through connecting your first AI provider. You can skip this step and do it later, but having a provider connected right away means you can start building agents immediately.

### Key Points

- **One-file installer** — no complex setup process or technical knowledge needed
- Works on **Windows 10+**, **macOS 12+**, and most modern **Linux** distributions
- Updates are automatic — you'll always have the latest version without lifting a finger
- The app is lightweight and runs quietly in the background

### How It Works

Download the installer from the official website, run it, and follow the on-screen instructions. On Windows you might see a security prompt — click "Run anyway" to proceed. On macOS, drag the app to your Applications folder. The whole process takes under 60 seconds.

> **Tip:** If you run into a security warning, it's just your operating system being cautious with new software. Approve it and you're all set.
  `,

  "creating-your-first-agent": `
## Creating Your First Agent

Building your first agent is a five-minute journey from a blank slate to a working assistant. Click \`Create Agent\` on the main screen, give your agent a name (like "Email Summarizer" or "Daily Reporter"), and write a short description of what you want it to do.

Next, you'll write your agent's instructions — think of this as explaining a task to a helpful colleague. Be clear and specific. For example: "Read my latest 5 emails and write a one-paragraph summary of each." That's all it takes to get started.

### Step by Step

- Click the **\`Create Agent\`** button on the home screen
- Choose a name and an icon that helps you recognize your agent at a glance
- Write your instructions in plain language — tell the agent what to do and how
- Select which AI model should power it (Claude is a great default choice)
- Hit **\`Save\`** and your agent is ready to run

### How It Works

When you create an agent, you're essentially writing a job description. The AI model reads your instructions and follows them each time the agent runs. The better your instructions, the better the results.

> **Tip:** Start simple. You can always add more detail to your instructions later as you see how your agent performs.
  `,

  "understanding-the-interface": `
## Understanding the Interface

The Personas interface is designed to feel familiar, even if you've never used an AI tool before. On the left, you'll find the **sidebar** — your main navigation hub. It lists your agents, pipelines, and key sections like credentials and monitoring. The center area is your **workspace**, where you build and configure things.

At the top, you'll see a search bar and quick-action buttons. The bottom bar shows system status and any running agents. Everything is organized so the things you use most are never more than one or two clicks away.

### Key Areas

- **Sidebar** — navigate between agents, pipelines, testing, monitoring, and settings
- **Workspace** — the main content area where you build and configure
- **Top bar** — search, notifications, and quick actions
- **Status bar** — shows running agents and system health at a glance

### How It Works

Think of the sidebar as a table of contents and the workspace as the page you're reading. Click something in the sidebar, and it opens in the workspace. You can resize the sidebar or collapse it to get more room. Most actions are also available through keyboard shortcuts.

> **Tip:** Hover over any icon to see a tooltip explaining what it does. This is a great way to learn the interface as you go.
  `,

  "what-is-an-ai-agent": `
## What Is an AI Agent?

An AI agent is like a smart assistant that follows your instructions to complete tasks automatically. You tell it what to do, give it the tools it needs, and it handles the rest. Unlike a simple chatbot that just answers questions, an agent can take actions — send emails, process files, search the web, and more.

Think of it this way: a chatbot is like asking a friend for advice, while an agent is like hiring an assistant who actually does the work for you. You write the instructions once, and your agent can repeat that task as many times as you need.

### Key Points

- An agent **acts on your behalf** — it doesn't just suggest, it does
- You control exactly what your agent can and can't do using **tools and permissions**
- Agents can run on a schedule, respond to events, or start with a button click
- No programming knowledge required — you write instructions in plain English

### How It Works

You create an agent by describing a task in everyday language. The AI model reads your instructions and carries them out using the tools you've provided. For example, an agent with email access can read your inbox, draft replies, and send them — all based on the rules you set.

> **Tip:** Start by thinking about a repetitive task you do every week. That's usually the perfect first job for an agent.
  `,

  "running-your-first-automation": `
## Running Your First Automation

You've built your agent — now it's time to see it in action. Open your agent and click the **\`Run\`** button. Your agent will start processing, and you'll see a live feed of what it's doing. Within seconds (or minutes, depending on the task), you'll have results.

It's like pressing play on a recipe — your agent does the cooking while you watch. The results appear in the output panel, where you can read, copy, or save them. If something doesn't look right, you can tweak your instructions and run again.

### Step by Step

- Open the agent you want to run from the sidebar
- Click the green **\`Run\`** button at the top of the workspace
- Watch the live activity feed as your agent works through the task
- Review the results in the output panel when it finishes
- If needed, adjust your instructions and run again

### How It Works

When you hit run, your instructions are sent to the AI model along with any data or tools the agent needs. The model processes everything and returns the result. The whole cycle typically takes a few seconds to a couple of minutes.

> **Tip:** Your first run is a learning experience. Don't worry if the output isn't perfect — small adjustments to your instructions usually make a big difference.
  `,

  "choosing-your-ai-provider": `
## Choosing Your AI Provider

AI providers are the engines that power your agents. Personas supports several providers — including Claude (by Anthropic), OpenAI, Google Gemini, and others. Each has different strengths: some are better at creative writing, others excel at analysis or following complex instructions.

You're not locked into one choice. You can assign different providers to different agents, and switch anytime. Most users start with one provider and experiment with others as they get comfortable.

### Key Points

- **Claude** — excellent at following detailed instructions and handling nuance
- **OpenAI (GPT)** — widely used with strong general-purpose capabilities
- **Google Gemini** — great for tasks involving research and large amounts of text
- You can **switch providers** for any agent at any time without losing your setup

### How It Works

Go to \`Settings\` and add your provider's API key (a special password that connects your account). Once connected, you'll see the provider as an option when creating or editing agents. You can also set a default provider so new agents use it automatically.

> **Tip:** Most providers offer free credits for new users. Try a couple before committing to find the best fit for your typical tasks.
  `,

  "starter-vs-team-vs-builder-tiers": `
## Starter vs Team vs Builder Tiers

Personas offers three tiers to match different needs. **Starter** is free and perfect for trying things out — you get access to basic agents, a handful of triggers, and enough features to automate simple tasks. It's a great way to explore without any commitment.

**Team** adds collaboration features, letting multiple people share agents and work together. **Builder** unlocks the most advanced features — complex pipelines, genome evolution, and unlimited triggers. You can upgrade or downgrade anytime, and your agents stay intact.

### What Each Tier Includes

- **Starter (Free)** — up to 5 agents, manual and schedule triggers, basic monitoring
- **Team** — unlimited agents, shared workspaces, team pipelines, priority support
- **Builder** — everything in Team plus genome evolution, advanced testing, BYOI deployment

### How It Works

Your tier is managed in \`Settings > Subscription\`. Upgrading takes effect immediately — new features appear right away. Downgrading keeps your existing agents but disables tier-specific features until you upgrade again. No data is ever deleted when changing tiers.

> **Tip:** Start with Starter to learn the basics. You'll know when you need more — that's the right time to upgrade.
  `,

  "system-requirements": `
## System Requirements

Personas is designed to be lightweight and run on most modern computers. You don't need a powerful gaming machine or a fancy setup — if your computer can run a web browser smoothly, it can run Personas.

The app uses minimal resources when idle and scales up only when agents are actively running. Most of the heavy lifting happens on the AI provider's servers, not on your computer.

### Minimum Requirements

- **Operating System:** Windows 10, macOS 12 (Monterey), or Ubuntu 20.04+
- **RAM:** 4 GB (8 GB recommended for running multiple agents simultaneously)
- **Disk Space:** 500 MB for the app, plus space for your data
- **Internet:** A stable connection is required for AI provider communication

### How It Works

Personas runs as a desktop application with a local database that stores your agents, credentials, and settings on your own machine. When an agent runs, it communicates with your chosen AI provider over the internet. The results come back and are stored locally.

> **Tip:** If you notice slowness, check that other apps aren't using too much memory. Closing unused browser tabs is often the quickest fix.
  `,

  "keyboard-shortcuts-and-tips": `
## Keyboard Shortcuts and Tips

Once you learn a few key shortcuts, everyday tasks become almost instant. Instead of clicking through menus, you can create agents, run tasks, and navigate the app with quick key combinations. It's like learning to touch-type — awkward at first, but soon it's second nature.

The shortcuts are designed to be intuitive. Most follow standard patterns you already know from other apps, like \`Ctrl+N\` for new and \`Ctrl+S\` for save.

### Most Useful Shortcuts

- **\`Ctrl+N\`** — create a new agent
- **\`Ctrl+Enter\`** — run the current agent
- **\`Ctrl+S\`** — save your changes
- **\`Ctrl+K\`** — open the quick search bar to find anything fast
- **\`Ctrl+/\`** — toggle the sidebar open or closed
- **\`Ctrl+,\`** — open settings

### How It Works

Shortcuts work anywhere in the app. You can also customize them in \`Settings > Keyboard Shortcuts\` if you prefer different combinations. A handy cheat sheet is available anytime by pressing \`Ctrl+?\`.

> **Tip:** You don't need to memorize everything at once. Start with \`Ctrl+K\` (quick search) — it lets you find and open anything by typing a few letters.
  `,

  "where-to-get-help": `
## Where to Get Help

You're never stuck alone with Personas. There are several ways to get help, whether you prefer reading guides, chatting with other users, or reaching out to the support team directly. Most questions have already been answered somewhere — the trick is knowing where to look.

The community is friendly and active, and the documentation covers everything from beginner basics to advanced techniques.

### Help Resources

- **This Guide** — the built-in guide covers every feature with clear explanations
- **Discord Community** — chat with other users, share tips, and get quick answers
- **Documentation Site** — detailed articles and tutorials at docs.personas.app
- **Support Email** — reach the team directly for account or technical issues
- **Video Tutorials** — step-by-step walkthroughs on the official YouTube channel

### How It Works

For quick questions, start with the built-in guide or search the Discord community — chances are someone has asked the same thing. For bugs or account issues, the support team typically responds within a few hours.

> **Tip:** The Discord community is the fastest way to get help. Other users often reply within minutes, and the team monitors it daily.
  `,
};
