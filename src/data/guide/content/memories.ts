export const content: Record<string, string> = {
  "how-agent-memory-works": `
## How Agent Memory Works

Your agents can remember past tasks and learn from experience. Each time an agent runs, it can store useful information — facts, decisions, patterns, and lessons learned. Think of it like a notebook your agent carries from task to task, building up knowledge over time.

This means your agents get smarter the more you use them. An agent that has handled hundreds of customer inquiries will have context about common issues, preferred solutions, and past decisions that a brand-new agent wouldn't know.

### Key Points

- Agents **automatically learn** from each task they complete
- Memories persist **between runs** — your agent remembers previous work
- Each memory is **categorized and ranked** by importance
- You can **review, edit, or delete** any memory at any time

### How It Works

During a run, if the agent encounters something worth remembering — a useful fact, an important decision, or a lesson learned — it creates a memory entry. The next time the agent runs, it can recall relevant memories to make better decisions. You have full control to review and manage what your agent remembers.

> **Tip:** Memory works best when agents have consistent, focused tasks. An agent that always handles expense reports will build more useful memories than one that does a different task each time.
  `,

  "memory-categories": `
## Memory Categories

Memories are organized into five categories, each serving a different purpose. This structure helps your agent recall the right kind of knowledge at the right time — like chapters in a reference book.

Understanding these categories helps you review and manage your agent's knowledge more effectively. Each category tells you not just *what* the agent knows, but *what kind* of knowledge it is.

### The Five Categories

- **Facts** — concrete information your agent has learned (e.g., "The client prefers formal language")
- **Decisions** — choices the agent made and why (e.g., "Chose Express shipping because the order was urgent")
- **Insights** — patterns or observations discovered over multiple runs
- **Learnings** — lessons from mistakes or successes that improve future behavior
- **Warnings** — potential problems or pitfalls to watch out for

### How It Works

When an agent creates a memory, it automatically categorizes it based on the content. Facts are straightforward pieces of information. Decisions record choices with reasoning. Insights capture patterns. Learnings come from reflecting on outcomes. Warnings flag things to avoid.

> **Tip:** Pay special attention to the Warnings category during your reviews. These memories help your agent avoid repeating past mistakes — they're often the most valuable.
  `,

  "importance-levels": `
## Importance Levels

Every memory has an importance score from 1 to 5. A score of 1 means it's routine information, while 5 means it's critical. Important memories are recalled more often, stick around longer, and are given more weight when the agent makes decisions — just like how you remember big life events better than what you had for lunch last Tuesday.

This ranking system keeps your agent focused on what matters most, rather than drowning in trivial details.

### The Scale

- **1 (Routine)** — minor details that might be useful occasionally
- **2 (Useful)** — helpful context that enriches the agent's understanding
- **3 (Important)** — knowledge that regularly influences decisions
- **4 (Very Important)** — key information the agent should almost always consider
- **5 (Critical)** — essential knowledge that must never be forgotten or ignored

### How It Works

Importance is assigned automatically when a memory is created, based on factors like how often the information is referenced and how much it affected outcomes. You can also adjust importance levels manually if you disagree with the automatic assignment.

> **Tip:** If an agent keeps making the same mistake, check if the relevant memory exists and whether its importance level is high enough. Bumping it to 4 or 5 ensures the agent pays attention to it.
  `,

  "searching-agent-memories": `
## Searching Agent Memories

As your agents accumulate knowledge, being able to search their memories becomes essential. Type a keyword or phrase and instantly see every related memory across all your agents. It's like searching your email — fast, simple, and you can filter by category, importance, or date.

Searching helps you understand what your agents know, verify they've learned correctly, and find specific information quickly.

### Key Points

- **Full-text search** — find memories by any keyword or phrase they contain
- **Filter by category** — narrow results to facts, decisions, insights, learnings, or warnings
- **Filter by importance** — show only high-priority or low-priority memories
- **Cross-agent search** — search across all your agents at once or focus on one

### How It Works

Open the \`Memories\` section and type your search query in the search bar. Results appear instantly with the matching text highlighted. Use the filter buttons to narrow down by category, importance level, date range, or specific agent. Click any result to see the full memory with all its context.

> **Tip:** Search for a topic before creating a manual memory. Your agent might already know what you're about to teach it — in which case, you can simply update the existing memory.
  `,

  "creating-memories-manually": `
## Creating Memories Manually

Sometimes you want your agent to know something before it learns on its own — like briefing a new employee on day one. Manual memories let you teach your agents specific facts, preferences, or rules directly, giving them a head start on knowledge they'd otherwise have to discover through experience.

This is especially useful for company-specific information, personal preferences, or critical rules that should never be learned through trial and error.

### Step by Step

- Open the **\`Memories\`** section and click **\`Add Memory\`**
- Choose the **category** (fact, decision, insight, learning, or warning)
- Write the **memory content** in plain language
- Set the **importance level** (1-5)
- Assign it to a **specific agent** or make it available to all agents

### How It Works

The memory you create is added to the agent's knowledge base just like an automatically learned memory. The next time the agent runs, it can access this information alongside everything it has learned on its own. Manual memories are marked with a small icon so you can distinguish them from automatic ones.

> **Tip:** Create a few "Warning" memories for your most critical rules before an agent goes live. For example: "Never share pricing information without manager approval."
  `,

  "memory-tiers-explained": `
## Memory Tiers Explained

Not all memories are created equal, and not all of them need to be immediately accessible. Personas organizes memories into four tiers based on how frequently they're used and how important they are. Think of it like a filing system: the most-used items stay on your desk, less-used ones go in a drawer, and rarely-needed ones are filed in a cabinet.

This tiered system keeps your agent fast and efficient. It recalls the most relevant memories instantly while still having access to older knowledge when needed.

### The Four Tiers

- **Core** — permanent, always-available memories (critical rules and facts)
- **Active** — frequently accessed memories from recent work
- **Working** — memories from the current task or recent sessions
- **Archive** — older memories that haven't been accessed recently but are preserved

### How It Works

Memories move between tiers automatically based on usage patterns. A frequently recalled memory gets promoted to a higher tier; one that hasn't been accessed in a while gradually moves toward archive. You can also manually pin memories to the Core tier to ensure they're always top-of-mind for your agent.

> **Tip:** Pin your most important rules and facts to the Core tier. This guarantees your agent always considers them, regardless of how old they are.
  `,

  "memory-and-execution": `
## Memory and Execution

When your agent starts a new task, it doesn't begin with a blank slate. It automatically recalls relevant memories from previous runs, bringing context, preferences, and lessons learned into the current execution. This makes each run more informed than the last.

The recall process is smart — it doesn't dump every memory at once. Instead, it selects the ones most relevant to the current task, much like how you naturally recall related experiences when facing a familiar situation.

### Key Points

- **Automatic recall** — relevant memories are loaded before each execution
- **Context-aware** — only memories related to the current task are recalled
- **Weighted by importance** — higher-importance memories are more likely to be recalled
- **Memory creation** — new memories may be created during execution based on outcomes

### How It Works

Before your agent processes its task, the memory system scans for relevant entries based on the task's content and context. These memories are provided to the AI model alongside your instructions. After the task completes, the agent evaluates whether anything new was learned and creates memories accordingly.

> **Tip:** If an agent isn't using its memories effectively, check that the memories are categorized and scored correctly. Well-organized memories are recalled more reliably.
  `,

  "reviewing-and-cleaning-memories": `
## Reviewing and Cleaning Memories

Over time, some memories become outdated, incorrect, or redundant. Regular reviews keep your agent's knowledge base accurate and up to date. Think of it as spring cleaning for your agent's brain — clearing out old information so your agent makes decisions based on current, correct knowledge.

A clean memory base leads to better agent performance. An agent that relies on outdated information can make poor decisions without realizing why.

### Key Points

- **Browse all memories** with sorting and filtering options
- **Edit** any memory to correct inaccuracies or update outdated information
- **Delete** memories that are no longer relevant
- **Merge** duplicate or similar memories into one clear entry

### How It Works

Open the \`Memories\` section and browse your agent's memory list. Sort by date, importance, or category to focus your review. Click any memory to edit its content, change its importance level, or delete it. The system also suggests potential duplicates that could be merged.

> **Tip:** Schedule a monthly review of your most active agents' memories. Even 15 minutes of cleanup can noticeably improve an agent's decision-making quality.
  `,

  "exporting-and-importing-memories": `
## Exporting and Importing Memories

You can export your agent's entire memory base to a file — perfect for backups, sharing knowledge between agents, or moving to a new computer. Importing loads a previously exported file and adds those memories to the target agent's knowledge base.

This feature is also great for giving a new agent the benefit of another's experience. Export from your experienced agent, import into the new one, and it starts with a wealth of knowledge instead of a blank slate.

### Key Points

- **Export to file** — save all memories as a portable file you can store or share
- **Import from file** — load memories into any agent on any device
- **Selective export** — choose specific categories or importance levels to export
- **Conflict handling** — duplicates are detected and merged during import

### How It Works

Open an agent's memory settings and click \`Export\`. Choose which memories to include (all, or filtered by category/importance) and save the file. To import, open the target agent's memory settings, click \`Import\`, and select your file. Personas detects duplicates and lets you decide how to handle them.

> **Tip:** Before a major change to an agent's prompt, export its memories as a backup. If the new prompt creates confusion, you can restore the original memories.
  `,

  "memory-best-practices": `
## Memory Best Practices

Getting the most out of agent memory comes down to a few key habits. Like good study habits for a student, the way you structure and maintain memories makes a big difference in how effectively your agents learn and recall information.

Follow these guidelines to build agents that genuinely improve over time rather than accumulating clutter.

### Best Practices

- **Keep agents focused** — an agent with a consistent task builds more useful memories than a generalist
- **Review regularly** — check memories monthly and remove outdated or incorrect entries
- **Use manual memories for critical rules** — don't wait for the agent to learn something the hard way
- **Set appropriate importance levels** — not everything is critical, and that's okay
- **Pin essential knowledge** to the Core tier so it's always available

### How It Works

Good memory management is an ongoing practice, not a one-time setup. Start by creating a few manual memories for your most important rules. Let the agent learn naturally from its runs. Review periodically to correct mistakes and remove outdated information. Adjust importance levels as your understanding of what matters evolves.

> **Tip:** Think of memory management like tending a garden. Regular small efforts — pruning, watering, replanting — produce much better results than occasional big overhauls.
  `,
};
