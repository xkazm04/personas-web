export const content: Record<string, string> = {
  "what-are-pipelines": `
## What Are Pipelines?

A pipeline is a group of agents working together to handle a complex task. Think of it like an assembly line in a factory — each agent does one job and passes the result to the next. This lets you break big problems into small, manageable steps where each agent is a specialist.

For example, a content pipeline might have one agent that researches a topic, another that writes a draft, a third that edits for grammar, and a fourth that formats the final output. Each agent focuses on what it does best.

:::compare
**Single Agent**
Handles one task at a time with one set of instructions. Input goes in, output comes out. If something fails, the whole task fails. Simple to set up, but limited for complex workflows.
---
**Pipeline** [recommended]
Multi-step workflows where each agent is a specialist. Data flows between agents — the output of one feeds the next. Failing steps are pinpointed instantly. Reuse the entire workflow with different inputs.
:::

### Key Points

- **Multi-agent workflows** — combine multiple agents into one cohesive process
- **Data flows between agents** — the output of one step becomes the input of the next
- **Visual editor** — build pipelines by dragging and connecting agents on a canvas
- **Reusable** — run the same pipeline with different inputs anytime

### How It Works

You design a pipeline on the team canvas by placing agents and drawing connections between them. When you run the pipeline, data flows through each agent in order. If a step fails, the pipeline stops and shows you exactly where the problem occurred.

:::tip
Start with a simple two-agent pipeline to learn the basics. You can always add more agents as your workflow grows.
:::
  `,

  "the-team-canvas": `
## The Team Canvas

The team canvas is your visual workspace for building pipelines. It works like a digital whiteboard — you drag agents from your library, place them where you want, and draw connections between them. It's as intuitive as arranging sticky notes.

The canvas gives you a bird's-eye view of your entire workflow. You can zoom in on details, zoom out to see the big picture, and rearrange agents until the flow makes sense. Everything is visual, so you never lose track of how your agents connect.

### Key Points

- **Drag-and-drop** agents onto the canvas from your agent library
- **Draw connections** by clicking and dragging from one agent to another
- **Zoom and pan** to navigate large pipelines comfortably
- **Auto-layout** option to tidy up your canvas with one click

### Building Your First Pipeline

:::steps
1. **Open the Pipelines section** — click \`Pipelines\` in the sidebar and then \`New Pipeline\`
2. **Browse your agent library** — the sidebar panel shows all available agents
3. **Drag agents onto the canvas** — place them in the order they should execute
4. **Draw connections** — click and drag from one agent's output port to the next agent's input port
5. **Arrange left to right** — position agents in execution order for a clear visual flow
6. **Save your pipeline** — click \`Save\` and your pipeline is ready to run
:::

:::tip
Arrange your agents from left to right in the order they execute. This visual flow makes pipelines easy to understand at a glance.
:::
  `,

  "adding-agents-to-a-pipeline": `
## Adding Agents to a Pipeline

Adding agents to a pipeline is as simple as dragging them from your library onto the canvas. Once placed, you can adjust each agent's settings for this specific pipeline — like giving a team member slightly different instructions depending on the project.

An agent can appear in multiple pipelines, and its behavior in each one is independent. This means your "Email Writer" agent can work differently in your marketing pipeline versus your customer support pipeline.

### Key Points

- **Drag from library** — pick any of your existing agents and place it on the canvas
- **Pipeline-specific settings** — customize behavior for each pipeline without changing the original agent
- **Position freely** — place agents anywhere on the canvas and rearrange anytime
- **One agent, many pipelines** — the same agent can participate in different workflows

### How It Works

With the canvas open, find the agent you want in the sidebar library panel. Drag it onto the canvas and drop it in position. Click the placed agent to open its pipeline settings, where you can adjust inputs, outputs, and any pipeline-specific behavior.

:::tip
If you need a slightly different version of an agent for a pipeline, use the pipeline-specific settings instead of modifying the original. This keeps your base agent clean.
:::
  `,

  "connecting-agents-with-data-flow": `
## Connecting Agents with Data Flow

Connections are the lines you draw between agents on the canvas. They tell the pipeline how data should flow — which agent's output feeds into which agent's input. Click on an agent's output port and drag to another agent's input port. A line appears showing the path data will take.

Data flows along these connections like water through pipes. The first agent produces a result, and that result automatically becomes the starting material for the next agent in line.

### Key Points

- **Click and drag** from an output port to an input port to create a connection
- **Data transforms** as it moves — each agent processes what it receives and produces new output
- **Multiple connections** — one agent's output can feed several downstream agents
- **Delete connections** by clicking on the line and pressing Delete

### Connecting Two Agents

:::steps
1. **Locate the output port** — find the small circle on the right edge of the source agent
2. **Click and drag** — hold the mouse button and drag from the output port toward the target agent
3. **Drop on the input port** — release on the small circle on the left edge of the target agent
4. **Verify the connection** — a line appears showing the data path between the two agents
5. **Test the flow** — run the pipeline and click any connection to inspect the data passing through it
:::

:::tip
Keep your connections clean and avoid crossing lines when possible. A well-organized canvas is much easier to debug and modify later.
:::
  `,

  "pipeline-execution": `
## Pipeline Execution

Running a pipeline sends data through your chain of agents from start to finish. When you hit the \`Run\` button, each agent lights up as it processes its step. You can watch the data flow in real time, like watching dominoes fall in sequence.

If everything goes smoothly, you get your final result at the end of the pipeline. If a step fails, the pipeline pauses at that point and shows you exactly what went wrong so you can fix it.

### Key Points

- **Real-time visualization** — watch each agent activate as the pipeline progresses
- **Step-by-step progress** — see the data at each stage of the workflow
- **Error handling** — the pipeline stops at the first failure and highlights the problem
- **Execution time** — see how long each step takes and where bottlenecks are

### How It Works

:::diagram
[Start] --> [Agent 1 processes] --> [Agent 2 processes] --> [Agent 3 processes] --> [Final Result]
:::

Click the green \`Run\` button on the canvas toolbar. Data enters at your starting agent and flows through each connection. Each agent's icon pulses while it's working and turns green when done. The final result appears at the end of the pipeline. Click any step to inspect its input and output.

:::tip
If your pipeline is taking too long, check the execution times for each step. The slowest step is your bottleneck — consider optimizing that agent or switching it to a faster model.
:::
  `,

  "conditional-routing": `
## Conditional Routing

Sometimes your pipeline needs to take different paths depending on the data. Conditional routing lets you set rules that direct data to different agents based on conditions — like sorting mail into different boxes. If the data meets condition A, it goes one way; if condition B, it goes another.

This transforms simple linear pipelines into smart decision-making workflows that handle different scenarios appropriately.

:::feature
**Smart Decision Nodes**
Conditional routing uses plain-language rules — no code required. Write conditions like "if the text contains 'urgent'" and data flows to the right agent automatically.
:::

### Key Points

- **If-then branching** — send data to different agents based on conditions you define
- **Multiple paths** — create two, three, or more branches from a single decision point
- **Default path** — always define a fallback for data that doesn't match any condition
- **Conditions are readable** — written in plain language, not code

### How It Works

On the canvas, add a conditional node between agents. Define your conditions using simple rules like "if the text contains 'urgent'" or "if the amount is greater than 100." Each condition connects to a different downstream agent. When data arrives, the conditional node evaluates it and sends it down the matching path.

:::warning
Always include a default path for data that doesn't match any condition. Without one, unmatched data gets stuck in your pipeline with no way to proceed.
:::
  `,

  "team-members-and-roles": `
## Team Members and Roles

In a pipeline, each agent has a specific role — like members of a project team. One might be the researcher, another the writer, another the reviewer. Defining clear roles helps your agents work together without stepping on each other's toes and makes your pipeline easier to understand.

Roles also help when you're troubleshooting. If the final output has a research error, you know to look at the researcher agent, not the writer.

### Key Points

- **Named roles** — give each agent a descriptive role within the pipeline (researcher, writer, reviewer, etc.)
- **Clear responsibilities** — each role handles a specific part of the workflow
- **Role labels** appear on the canvas so you can see the team structure at a glance
- **Swap agents** — replace one team member with another without rewiring the pipeline

### How It Works

When you place an agent on the canvas, you can assign it a role label. This label appears above the agent icon and describes its function in this pipeline. Roles are purely organizational — they help you and others understand the workflow but don't change how the agent works.

:::tip
Name roles by what they do, not by which agent fills them. This makes it easy to swap in a different agent later if you find a better option.
:::
  `,

  "pipeline-run-history": `
## Pipeline Run History

Every time a pipeline runs, a complete record is saved — timestamps, inputs, outputs, status for each step, and total execution time. This history is your audit trail, letting you review what happened in any past run and understand how your pipeline performed.

Run history is invaluable for troubleshooting ("what went wrong last Tuesday?") and for tracking improvement over time ("are results getting better?").

### Key Points

- **Complete records** — every run is saved with full details for every step
- **Status tracking** — see whether each step succeeded, failed, or was skipped
- **Input/output inspection** — review the data at every point in the pipeline
- **Search and filter** — find specific runs by date, status, or keyword

### How It Works

Open your pipeline and click the \`History\` tab. You'll see a list of all past runs sorted by date. Click any run to expand it and see each step's details. You can compare two runs side by side to understand what's different when results vary.

:::tip
After making changes to a pipeline, compare the next run's results to a previous run. This confirms whether your changes had the intended effect.
:::
  `,

  "pipeline-templates": `
## Pipeline Templates

Templates are pre-built pipelines that give you a working starting point. Instead of designing a workflow from scratch, browse the template library, pick one that matches your goal, and customize it to fit your needs. It's like using a recipe as a starting point and adjusting the ingredients to your taste.

Templates cover common use cases like content creation, data processing, customer support, and reporting. Each one comes with pre-configured agents and connections.

### Key Points

- **Ready-made workflows** for common automation scenarios
- **Fully customizable** — use as-is or modify to fit your needs
- **Best practices built in** — templates follow proven patterns and include error handling
- **Growing library** — new templates are added regularly

### How It Works

Open the \`Pipelines\` section and click \`Templates\`. Browse or search for a template that matches your use case. Click \`Use Template\` to create a new pipeline based on it. The canvas opens with all agents and connections pre-configured. Customize any part and save.

:::tip
Even if no template matches your exact use case, find the closest one. It's usually faster to modify a template than to build from scratch.
:::
  `,

  "debugging-pipeline-issues": `
## Debugging Pipeline Issues

When a pipeline doesn't work as expected, the debugger helps you pinpoint exactly where things went wrong. It highlights the failing step, shows you the data that caused the problem, and lets you inspect every detail of the execution without guesswork.

Most pipeline issues fall into a few categories: bad data flowing between steps, a misconfigured agent, or a connection that's wired incorrectly. The debugger makes all of these easy to identify and fix.

### Key Points

- **Failing step highlighted** — the problem area is marked in red on the canvas
- **Data inspection** — see exactly what data entered and left each step
- **Re-run from failure** — fix the issue and restart from the failed step, not the beginning
- **Connection validation** — check that data shapes match between connected agents

### How It Works

When a pipeline fails, click the red-highlighted step on the canvas. The debug panel shows the input data it received, the error message, and the agent's full output. Fix the issue — whether it's a prompt change, a credential problem, or a data format mismatch — and click \`Retry Step\` to resume from that point.

:::tip
Use the data inspection feature even on successful runs. Seeing what flows between agents helps you optimize your pipeline and catch subtle issues before they become failures.
:::
  `,
};
