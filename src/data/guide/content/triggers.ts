export const content: Record<string, string> = {
  "how-triggers-work": `
## How Triggers Work

Triggers are the "when" behind your agents. While prompts tell an agent *what* to do, triggers tell it *when* to do it. Think of triggers like alarm clocks — they wake up your agent at the right moment so it can do its job without you pressing a button every time.

Personas offers several trigger types: manual buttons, time-based schedules, webhooks from external services, file watchers, clipboard monitors, chain triggers, and event listeners. You can mix and match them freely.

### Key Points

- Each agent can have **multiple triggers** of different types
- Triggers are **independent** — a schedule trigger and a webhook trigger can both start the same agent
- All triggers can be **tested** before you rely on them
- You can **enable or disable** individual triggers without affecting the agent itself

### How It Works

Open your agent's trigger settings and add the type you want. Configure its conditions (like "every Monday at 9 AM" for a schedule trigger) and save. From that point on, your agent will start automatically whenever the trigger condition is met.

> **Tip:** Start with a manual trigger so you can test your agent on demand. Add automatic triggers once you're confident it works correctly.
  `,

  "manual-triggers": `
## Manual Triggers

Manual triggers are the simplest way to run an agent — you click a button and the agent starts. No schedules, no automation, just on-demand execution whenever you decide it's time. Every agent comes with a manual trigger by default.

This is perfect for tasks you don't want to automate yet, or for agents you only need occasionally. It's also the go-to way to test and debug agents before hooking them up to automatic triggers.

### Key Points

- **One-click execution** — press the Run button and your agent starts immediately
- **No configuration needed** — manual triggers work out of the box
- Great for **testing** agents before adding automatic triggers
- You can pass **custom input** each time you run manually

### How It Works

Open any agent and click the green \`Run\` button. If the agent accepts input, you'll see a text field where you can type or paste data before starting. The agent processes your request and shows results in the output panel. You can run as many times as you like.

> **Tip:** Use manual triggers during development. Once your agent consistently produces good results, add a schedule or webhook trigger to automate it.
  `,

  "schedule-triggers": `
## Schedule Triggers

Schedule triggers run your agents at specific times — hourly, daily, weekly, or on a custom schedule. It's like setting a recurring alarm that tells your agent to wake up and work. Perfect for routine tasks like morning email summaries, end-of-day reports, or weekly data checks.

You set the schedule once, and your agent handles the rest. No need to remember to run it yourself.

### Key Points

- Choose from **preset schedules** (hourly, daily, weekly) or create a custom one
- Set the **exact time** — for example, every weekday at 8:00 AM
- Schedules respect your **timezone** automatically
- You can **pause and resume** a schedule without deleting it

### How It Works

In your agent's trigger settings, select \`Schedule\` and pick a frequency. For daily triggers, choose the time of day. For weekly, pick the day and time. For anything more specific, use the custom schedule builder. Your agent will run automatically at every scheduled time.

> **Tip:** Schedule triggers work best for tasks with predictable timing. For example, you might set up an agent to check your email every morning at 8 AM and send you a summary.
  `,

  "webhook-triggers": `
## Webhook Triggers

A webhook is like a doorbell — when another service rings it, your agent answers. Webhook triggers let external services like Stripe, GitHub, Shopify, or any app that supports webhooks start your agents automatically. When something happens in that service, it sends a signal to your agent.

This is powerful because it means your agents can react to real-world events in real time, without polling or checking constantly.

### Key Points

- Each webhook trigger gets a **unique URL** that external services can call
- The data sent by the external service is **passed to your agent** as input
- Webhooks work with **any service** that supports sending webhooks
- You can add **filters** so your agent only reacts to specific events

### How It Works

Add a webhook trigger to your agent and copy the generated URL. Paste that URL into the external service's webhook settings. Now, whenever that service sends a notification (like a new order, a code push, or a payment), your agent receives the data and starts working.

> **Tip:** Test your webhook by using the built-in \`Send Test\` button before connecting the real service. This confirms everything is wired up correctly.
  `,

  "clipboard-monitor": `
## Clipboard Monitor

The clipboard monitor watches what you copy and starts your agent when it detects matching content. Imagine copying a customer email address and having your agent instantly pull up their account details, or copying a foreign-language paragraph and getting an automatic translation.

It turns your clipboard into a trigger — copy something specific, and your agent springs into action without you switching windows or clicking any buttons.

### Key Points

- Activates when you **copy text** that matches your defined rules
- Rules can match by **keywords**, **patterns**, or **content type** (emails, URLs, numbers)
- Works **silently in the background** while you use other apps
- Results can appear as a **notification** or be stored for later review

### How It Works

Add a clipboard monitor trigger to your agent and define what kind of copied text should activate it. For example, set it to trigger on any text containing "@" to catch email addresses. When you copy matching text anywhere on your computer, your agent receives it and runs.

> **Tip:** Be specific with your matching rules to avoid your agent triggering on every copy-paste. Matching a keyword like "invoice" or a pattern like email addresses keeps things focused.
  `,

  "file-watcher-triggers": `
## File Watcher Triggers

File watcher triggers activate your agent when files are created, modified, or deleted in a folder you choose. Drop a spreadsheet into a folder and your agent processes it automatically. It's like having an assistant who watches your inbox tray and handles each new document as it arrives.

This is ideal for workflows where files arrive at unpredictable times — expense reports, uploaded images, data exports, or anything that lands in a specific folder.

### Key Points

- **Watch any folder** on your computer or connected cloud storage
- Trigger on **new files**, **modified files**, or **deleted files**
- Filter by **file type** (e.g., only .csv files, only images)
- Your agent receives the **file path** and can read the file's contents

### How It Works

Add a file watcher trigger, point it at a folder, and choose which events to watch for. When a matching file event happens, your agent starts with the file information as input. For example, an agent watching a "Reports" folder could automatically summarize every new PDF that appears.

> **Tip:** Create a dedicated "Drop Zone" folder for your agent to watch. This keeps things clean and avoids triggering on files you didn't intend to process.
  `,

  "chain-triggers": `
## Chain Triggers

Chain triggers connect agents in sequence — when one finishes, the next one starts automatically using the previous agent's output. This lets you build assembly lines where each agent handles one step and passes its result forward.

For example, a research agent could gather data, pass it to a writing agent that creates a report, and then a formatting agent polishes the final document. Each agent does its specialty, and the chain connects them seamlessly.

### Key Points

- **Output becomes input** — the result of one agent feeds directly into the next
- Build **multi-step workflows** from simple, focused agents
- Each agent in the chain runs **only after** the previous one succeeds
- If one step fails, the chain **stops and reports** where the problem occurred

### How It Works

In your agent's trigger settings, add a \`Chain\` trigger and select which agent should trigger this one. When that source agent finishes successfully, its output is automatically sent as input to your agent. You can chain as many agents as you need.

> **Tip:** Keep each agent in the chain focused on one specific task. Small, specialized agents are easier to debug and reuse than one massive do-everything agent.
  `,

  "event-based-triggers": `
## Event-Based Triggers

Events are like announcements in your system — when something noteworthy happens, interested agents hear about it and react. Event-based triggers let your agents listen for specific events (like "new user signed up" or "daily report ready") and start working when they occur.

This is the most flexible trigger type. Unlike webhooks (which come from external services) or schedules (which run at set times), events come from within your Personas ecosystem — including from other agents.

### Key Points

- Agents **subscribe** to specific event types they care about
- Events can be **emitted by other agents**, triggers, or pipelines
- One event can trigger **multiple agents** simultaneously
- Events carry **data payloads** that your agent can use

### How It Works

Define the event your agent should listen for (e.g., "report-generated" or "error-detected"). When any part of your system emits that event, all subscribed agents receive it and start running. The event's data payload is passed as input to each triggered agent.

> **Tip:** Events are perfect for building reactive systems. Instead of one monolithic agent, create several focused agents that each respond to relevant events.
  `,

  "combining-multiple-triggers": `
## Combining Multiple Triggers

A single agent can have several triggers active at once — a schedule, a webhook, a manual button, and a clipboard monitor all working together. This means your agent is ready to work no matter how the need arises.

For example, your email summary agent might run every morning at 8 AM (schedule), when you click a button (manual), or when a VIP sends you a message (webhook from your email service). Same agent, multiple ways to start it.

### Key Points

- **No limit** on how many triggers one agent can have
- Different trigger types can **coexist** without interfering with each other
- Each trigger can have its own **conditions and filters**
- You can **enable or disable** triggers individually

### How It Works

Open your agent's trigger settings and add as many triggers as you need. Each one operates independently — a schedule trigger fires at its appointed time regardless of whether a webhook trigger also exists. All triggers feed into the same agent with the same instructions.

> **Tip:** Combine a schedule trigger for regular runs with a manual trigger for on-demand use. This covers both routine needs and unexpected situations.
  `,

  "testing-and-debugging-triggers": `
## Testing and Debugging Triggers

Before you rely on a trigger to start your agents automatically, make sure it works correctly. The trigger tester lets you simulate events and see exactly what would happen — without actually running your agent. This catches problems early and saves you from missed automations.

Debugging a trigger that isn't firing is also straightforward. The trigger log shows every attempt, including those that were filtered out or failed.

### Key Points

- **Simulate any trigger** to see if it would activate your agent
- View the **trigger log** to see every activation attempt, successful or not
- Check **filter conditions** to make sure they match what you expect
- Test webhooks with the built-in **\`Send Test\`** button

### How It Works

Open your trigger's settings and click \`Test\`. For schedule triggers, the tester shows when the next run would occur. For webhooks, it lets you send sample data. For file watchers, it simulates a file event. The result tells you whether the trigger would fire and what data your agent would receive.

> **Tip:** If a trigger isn't firing, check the trigger log first. It often reveals the cause — a filter that's too strict, a missing permission, or a configuration typo.
  `,
};
