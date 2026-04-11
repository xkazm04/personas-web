export const content: Record<string, string> = {
  "creating-a-new-agent": `
## Creating a New Agent

Setting up a new agent is like hiring a new team member — you give them a name, a role, and a set of instructions. Click \`Create Agent\`, pick a name that describes what the agent does (like "Invoice Processor" or "Weekly Reporter"), and choose an icon to make it easy to spot.

You'll also select which AI model powers your agent and what tools it can access. These choices shape your agent's capabilities, but don't worry about getting everything perfect on the first try — you can change any setting later.

:::steps
1. **Click Create Agent** — from the sidebar or home screen
2. **Enter a descriptive name** — and pick an icon
3. **Choose the AI model** — that will power this agent
4. **Write your instructions** — in the prompt editor
5. **Assign any tools** — your agent needs (email, web search, file access, etc.)
6. **Click Save** — to finish
:::

### How It Works

The name and icon are just for you — they help you stay organized as your collection grows. The real magic is in the instructions and tool selection, which tell the AI exactly what to do and what it's allowed to use.

:::tip
Good agent names describe the task, not the technology. "Morning Email Summary" is more useful than "GPT Agent 3."
:::
  `,

  "writing-effective-prompts": `
## Writing Effective Prompts

A prompt is the set of instructions you give your agent. Good prompts are like good recipes — clear, specific, and in the right order. The difference between a mediocre agent and a great one often comes down to how well the prompt is written.

Small changes in wording can have a big impact. Being specific ("summarize in exactly 3 bullet points") works much better than being vague ("give me a summary"). Tell your agent what to do, how to do it, and what the result should look like.

### Key Points

- **Be specific** — say exactly what you want, not roughly what you want
- **Give examples** — show your agent what good output looks like
- **Set the format** — tell it whether you want bullets, paragraphs, tables, etc.
- **Define boundaries** — explain what to skip or avoid, not just what to include
- **Use simple language** — clear instructions work better than fancy wording

### How It Works

Your prompt is sent to the AI model every time the agent runs. The model treats your instructions like a detailed brief and tries to follow them precisely. The more clearly you communicate, the more accurate the results.

:::tip
Write your prompt as if you're explaining the task to a smart but brand-new intern. Assume nothing, explain everything.
:::
  `,

  "simple-vs-structured-prompt-mode": `
## Simple vs Structured Prompt Mode

Personas gives you two ways to write agent instructions. **Simple mode** is a single text box — just type what you want, like writing a note. It's perfect for quick tasks and straightforward agents. Most people start here.

**Structured mode** breaks your prompt into separate sections: identity, instructions, tools, examples, and error handling. This is like filling out a detailed form instead of writing a free-form letter. It helps you think through each aspect of your agent's behavior and produces more reliable results for complex tasks.

| Feature | Simple Mode | Structured Mode |
|---|---|---|
| **Editor** | Single text box | Multiple dedicated sections |
| **Best for** | Quick tasks, simple agents | Complex agents, production use |
| **Speed** | Fast to write | Takes more time upfront |
| **Reliability** | Good for basic tasks | More consistent results |
| **Flexibility** | Free-form, anything goes | Guided, covers all angles |

:::info
You can switch between modes at any time without losing your work. Structured mode reorganizes your simple prompt into sections, and simple mode combines sections back into one text box.
:::

### How It Works

In simple mode, everything goes in one place. In structured mode, each section has a specific purpose — identity defines who the agent is, instructions say what to do, examples show what good output looks like, and error handling covers what to do when things go wrong.

:::tip
Start with simple mode for your first few agents. Once you want more control, switch to structured mode and explore the extra sections.
:::
  `,

  "structured-prompt-sections-explained": `
## Structured Prompt Sections Explained

When you use structured mode, your prompt is split into five sections, each giving your agent a different kind of guidance. Think of it like writing a handbook for a new employee — each chapter covers a different aspect of the job.

This separation makes it easier to update one part without accidentally breaking another. It also helps the AI model understand your intentions more clearly.

### The Five Sections

- **Identity** — who is this agent? Define its personality, expertise, and communication style
- **Instructions** — the core task. What should the agent do, step by step?
- **Tools** — which capabilities does the agent have access to? (email, web search, files, etc.)
- **Examples** — show the agent what great output looks like with real samples
- **Error handling** — what should the agent do when something goes wrong or input is unexpected?

### How It Works

Each section is sent to the AI model as part of a structured prompt. The model reads all sections together but treats each one as a distinct set of guidance. This means you can update your error handling without touching your core instructions.

:::tip
The examples section is the most underused but one of the most powerful. Even one good example can dramatically improve your agent's output quality.
:::
  `,

  "agent-settings-and-limits": `
## Agent Settings and Limits

Settings and limits act as guardrails for your agents — they keep things running smoothly without unexpected surprises. You can control how long an agent runs, how much it's allowed to spend, and how many tasks it can handle at once.

:::info
These are especially important once you start running agents automatically on schedules or triggers. Setting a budget cap, for example, means your agent will never accidentally run up a big bill.
:::

### Key Settings

- **Timeout** — how long the agent is allowed to run before it stops (e.g., 2 minutes)
- **Budget cap** — the maximum amount the agent can spend per run
- **Max turns** — how many back-and-forth exchanges the agent can have with the AI model
- **Concurrency** — how many instances of this agent can run at the same time

### How It Works

Open your agent's settings panel and adjust the sliders or enter values. These limits are enforced every time the agent runs. If an agent hits a limit, it stops gracefully and reports what happened — no data is lost.

:::tip
Start with conservative limits and loosen them as you gain confidence. It's easier to increase a limit than to undo an expensive mistake.
:::
  `,

  "assigning-tools-to-agents": `
## Assigning Tools to Agents

Tools are like apps on a phone — your agent can only use the ones you install. By assigning specific tools, you control exactly what your agent can do. An agent with email access can read and send messages; one with web search can look things up online.

:::warning
This is also a safety feature. An agent can't accidentally modify files if it doesn't have file access, and it can't send emails if it doesn't have email tools. You're always in control of what your agents can and can't touch.
:::

### Available Tool Types

- **Email** — read, draft, and send email messages
- **Web search** — look up information on the internet
- **File access** — read and write files on your computer or cloud storage
- **API calls** — interact with external services and databases
- **Clipboard** — read from and write to your clipboard

### How to Assign Tools

:::steps
1. **Open your agent's settings** — click the gear icon or open the agent detail page
2. **Find the Tools section** — you'll see a list of available tools
3. **Toggle on the tools you need** — and leave the rest off
4. **Connect credentials if prompted** — some tools require authentication (like an email password)
5. **Save your changes** — the agent can now use the assigned tools
:::

:::tip
Only assign the tools your agent actually needs. Fewer tools means fewer things that can go wrong, and your agent stays focused on its job.
:::
  `,

  "prompt-version-history": `
## Prompt Version History

Every time you save your agent's prompt, a snapshot is automatically created. This means you have a complete history of every change you've ever made — like an unlimited undo button. If a tweak makes things worse, you can go back to any previous version with a single click.

You never have to worry about losing a prompt that was working well. Experiment freely, knowing that the version history has your back.

### Key Points

- **Automatic snapshots** — every save creates a new version, no extra steps needed
- **One-click restore** — go back to any previous version instantly
- **Unlimited history** — every version is kept, from the very first save
- Each version is **timestamped** so you know exactly when changes were made

### How It Works

Open your agent and click the \`Version History\` tab. You'll see a list of every saved version with timestamps. Click any version to preview it, and click \`Restore\` to make it the active prompt. The current version is saved before restoring, so you can always switch back.

:::tip
Before making a big change to a working prompt, make a small "checkpoint" save first. This gives you a clean version to return to if the experiment doesn't work out.
:::
  `,

  "comparing-prompt-versions": `
## Comparing Prompt Versions

When you're trying to understand why your agent started behaving differently, comparing prompt versions shows you exactly what changed. The side-by-side view highlights additions in green and removals in red — just like tracking changes in a document.

This is especially helpful when you've made several edits over time and can't remember which one caused a particular improvement or problem.

### Key Points

- **Side-by-side view** — see both versions next to each other with changes highlighted
- **Green highlights** — text that was added in the newer version
- **Red highlights** — text that was removed from the older version
- Compare **any two versions**, not just consecutive ones

### How It Works

Open \`Version History\`, select two versions by checking their boxes, and click \`Compare\`. The diff view appears showing every difference between them. You can use this to understand what changed, decide which version is better, and make informed decisions about future edits.

:::tip
If your agent suddenly got worse, compare the current version to the last known good version. The highlighted differences will point you straight to the cause.
:::
  `,

  "cloning-and-duplicating-agents": `
## Cloning and Duplicating Agents

Cloning creates an exact copy of an agent — same instructions, same tools, same settings. This is the safest way to experiment with changes because your original agent stays completely untouched. If the experiment works, great. If not, just delete the clone.

It's also useful when you want to create a similar agent for a different purpose. Instead of starting from scratch, clone an existing agent and modify just the parts that need to change.

### Key Points

- **Exact copy** — everything is duplicated including prompt, settings, tools, and triggers
- **Independent** — changes to the clone don't affect the original, and vice versa
- **Quick setup** — save time by starting from a proven agent instead of building from zero
- Cloned agents get a **"(Copy)" suffix** so you can tell them apart

### How It Works

Right-click on any agent in the sidebar (or use the three-dot menu) and select \`Clone\`. A new agent appears with the same configuration and a "(Copy)" label. Rename it, make your changes, and you have a new agent ready to go.

:::tip
Use cloning to create A/B test candidates. Clone your agent, change one thing in the clone, and compare their results to see which performs better.
:::
  `,

  "agent-groups-and-organization": `
## Agent Groups and Organization

As your agent collection grows, groups help you stay organized. Think of groups like folders on your computer — they let you categorize agents by project, function, or any system that makes sense to you. You might have a "Marketing" group, a "Finance" group, and a "Personal" group.

You can drag and drop agents between groups, collapse sections you're not using, and rename groups anytime. A well-organized sidebar saves time and reduces confusion.

### Key Points

- **Create groups** to categorize agents by project, team, or purpose
- **Drag and drop** agents between groups to reorganize quickly
- **Collapse groups** you're not currently using to keep the sidebar clean
- **Rename groups** anytime — your agents stay exactly where they are

### How It Works

Right-click in the sidebar and select \`New Group\`. Give it a name and drag agents into it. You can nest groups, reorder them, and rename them freely. Agents can only belong to one group at a time, but you can move them whenever you like.

:::tip
Create a "Testing" group for agents you're still experimenting with. This keeps your production agents separate from works-in-progress.
:::
  `,

  "disabling-and-archiving-agents": `
## Disabling and Archiving Agents

Sometimes you need to stop an agent without deleting it. **Disabling** pauses an agent — all its triggers stop firing and it won't run until you re-enable it. Everything else stays intact: instructions, history, settings. It's like putting an agent on vacation.

**Archiving** goes a step further. It removes the agent from your active sidebar and tucks it away in the archive section. You can restore an archived agent at any time, so nothing is ever truly lost.

### Key Points

- **Disable** — stops all triggers and manual runs; settings and history preserved
- **Archive** — hides the agent from your sidebar; fully restorable at any time
- **Neither option deletes** anything — your work is always safe
- Archived agents don't count toward your active agent limit on lower tiers

### How It Works

Open an agent's three-dot menu and select \`Disable\` or \`Archive\`. Disabled agents show a muted icon in the sidebar. Archived agents move to the \`Archive\` section, accessible from the bottom of the sidebar. To bring one back, find it in the archive and click \`Restore\`.

:::tip
Archive seasonal agents instead of deleting them. When the season comes around again, just restore and they're ready to go.
:::
  `,

  "agent-health-indicators": `
## Agent Health Indicators

Every agent has a small colored dot next to its name that tells you its status at a glance. **Green** means everything is running smoothly. **Yellow** means something needs your attention — maybe a credential is about to expire or a recent run had a warning. **Red** means there's a problem that needs fixing.

These indicators save you from having to check each agent individually. A quick look at your sidebar tells you the health of your entire setup.

### What Each Color Means

| Color | Status | Meaning |
|---|---|---|
| **Green** | Healthy | All recent runs succeeded, no issues detected |
| **Yellow** | Warning | Something may need attention soon (expiring credential, slow performance) |
| **Red** | Error | The agent failed recently or has a configuration problem |
| **Gray** | Inactive | Disabled or never run |

### How It Works

Health is calculated automatically based on recent execution results, credential status, and configuration completeness. Click on the indicator to see a summary of what's causing the current status. From there, you can jump directly to the settings or logs that need attention.

:::tip
Make it a habit to scan your sidebar colors once a day. Catching a yellow indicator early prevents it from becoming a red one.
:::
  `,
};
