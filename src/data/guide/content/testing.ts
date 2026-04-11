export const content: Record<string, string> = {
  "why-test-your-agents": `
## Why Test Your Agents?

Testing is like a dress rehearsal before the big show. It lets you catch mistakes, compare approaches, and verify that your agent does what you expect — all before it matters. A few minutes of testing can save hours of fixing problems later and give you confidence that your automations are reliable.

Without testing, you're relying on hope. With testing, you're relying on evidence. Even a simple test run tells you more than guessing.

### Key Points

- **Catch errors early** — find problems before they affect real work
- **Compare approaches** — see which prompts and models produce the best results
- **Build confidence** — know your agent works correctly before you automate it
- **Improve over time** — testing creates a feedback loop for continuous improvement

### How It Works

Personas offers four testing modes — Arena, A/B, Matrix, and Eval — each answering a different question about your agent. You don't need to use all of them. Start by running your agent once and reviewing the output. As you get more comfortable, explore the advanced testing modes.

:::tip
Make testing a habit, not a chore. Every time you change a prompt, run a quick test to confirm it still works well. This one habit prevents most agent problems.
:::
  `,

  "the-testing-lab-overview": `
## The Testing Lab Overview

The Testing Lab is your workspace for evaluating and improving agents. It offers four distinct testing modes, each designed to answer a different question about your agent's performance. Understanding which mode to use for what situation is the key to effective testing.

Think of the Testing Lab as your agent's training ground. Here's where good agents become great.

### The Four Modes

:::compare
**Arena**
Test your prompt across multiple AI models at once. Send the same task to Claude, GPT, Gemini and see which model wins. Best for finding the right model.
---
**A/B Testing**
Compare two prompt versions side-by-side under identical conditions. Change one thing, measure the impact. Best for improving a specific prompt.
---
**Matrix**
Auto-generate and test dozens of prompt variations by mixing building blocks. Discover unexpected winning combinations you'd never try manually.
---
**Eval**
Test multiple prompts against multiple models in a comprehensive grid. The complete picture when you want to optimize both prompt and model together.
:::

### How It Works

Open the \`Testing Lab\` from the sidebar. Choose a mode based on what you want to learn. Arena is great for choosing a model. A/B testing helps you improve a specific prompt. Matrix explores the space of possibilities. Eval gives you the complete picture when you want to optimize both prompt and model.

:::tip
Start with Arena testing to find the right AI model for your agent, then use A/B testing to refine the prompt. This two-step process covers the most important optimization decisions.
:::
  `,

  "arena-testing": `
## Arena Testing

Arena testing lets you compare your agent across multiple AI models at the same time. Send the same task to Claude, GPT, Gemini, and others, then see which model produces the best result. It's like a talent show where AI models compete, and you pick the winner.

This is the fastest way to find the right model for your specific use case, because different models excel at different types of tasks.

### Key Points

- **Same task, multiple models** — identical input is sent to each model simultaneously
- **Side-by-side comparison** — results appear next to each other for easy evaluation
- **Cost and speed included** — see not just quality, but also how fast and affordable each model is
- **Vote on results** — rate each output to build a record of which models work best for you

### How It Works

Open the Testing Lab, select \`Arena\`, and choose which models to include. Enter your test input (or use a previous execution's data) and click \`Run\`. Results from each model appear side by side. Review them, vote on the best ones, and the system records your preferences.

:::tip
Run Arena tests with 3-4 models rather than every available option. Too many comparisons can be overwhelming. Focus on the top contenders.
:::
  `,

  "ab-testing-prompts": `
## A/B Testing Prompts

A/B testing is the scientific approach to prompt improvement. You create two versions of your prompt — the original and a variation with one specific change — and run them both with the same input. The results show you clearly which version performs better.

This takes the guesswork out of prompt tweaking. Instead of hoping a change helped, you'll know for certain.

### Key Points

- **Two versions, same input** — the only difference is the prompt change you're testing
- **Fair comparison** — both versions run under identical conditions
- **Clear winner** — results make it obvious which version is better
- **Incremental improvement** — change one thing at a time for clear, reliable insights

### How It Works

Open the Testing Lab and select \`A/B Test\`. Load your current prompt as Version A, then create Version B with your proposed change. Run the test with sample input. Both versions execute and their results appear side by side. Rate each result to determine the winner.

:::code-compare
### Version A
Summarize the document.
Keep it short.
---
### Version B
Summarize the document in exactly
3 bullet points. Each bullet should
be one sentence. Start with the
most important finding.
:::

:::warning
Only change one thing between versions. If you change the tone *and* the format *and* the length, you won't know which change made the difference.
:::
  `,

  "matrix-testing": `
## Matrix Testing

Matrix testing automatically generates dozens of prompt variations by mixing and matching building blocks you provide. Instead of manually writing each variation, you define the components — different introductions, different instruction styles, different output formats — and the matrix creates every combination.

It's like trying every combination on a lock instead of guessing. You might discover that a combination you'd never have thought of produces the best results.

### Key Points

- **Automated variation generation** — define building blocks and the system creates all combinations
- **Explore the search space** — discover unexpected winning combinations
- **Time-efficient** — test dozens of variations in the time it would take to write three
- **Ranked results** — variations are sorted from best to worst based on your criteria

:::info
With three components of three options each, you get 27 variations. The matrix handles the combinatorial explosion so you don't have to write each one manually.
:::

### How It Works

Open the Testing Lab and select \`Matrix\`. Define your prompt components — for example, three different introduction styles and four different output formats. The matrix generates all 12 combinations, runs each one with your test input, and ranks the results. Review the top performers and adopt the best.

:::tip
Keep each component small and focused (2-3 options per component). With three components of three options each, you already get 27 variations — more than enough to find winners.
:::
  `,

  "eval-testing": `
## Eval Testing

Eval testing is the most comprehensive mode — it tests multiple prompts against multiple models in a complete grid. Every prompt version runs on every model, giving you a full picture of which combination of prompt and model produces the best results. The results appear in a clear table.

Use Eval when you want to make a major decision about both your prompt and your model at the same time.

### Key Points

- **Prompt x Model grid** — every combination is tested
- **Complete picture** — no blind spots in your evaluation
- **Table view** — results organized in a readable grid with scores
- **Best combination highlighted** — the top-performing prompt+model pair is clearly marked

### How It Works

Open the Testing Lab and select \`Eval\`. Add the prompt versions you want to test and the models you want to compare. Click \`Run\` and the system tests every combination. Results populate a grid table where rows are prompts and columns are models (or vice versa). The best combination is highlighted.

:::warning
Eval testing is the most thorough but also the most expensive mode. Save it for important decisions and use Arena or A/B testing for quick checks.
:::
  `,

  "rating-and-scoring-results": `
## Rating and Scoring Results

After any test runs, you can rate each result with a thumbs up, thumbs down, or a star rating. Your feedback is essential — it teaches the system which outputs match your standards and feeds into the fitness scoring that helps evolve better prompts over time.

Rating is quick and intuitive. You don't need to write detailed reviews — a simple thumbs up or down captures your judgment effectively.

### Key Points

- **Thumbs up/down** — quick binary feedback for each result
- **Star ratings** — more nuanced scoring on a 1-5 scale when you want precision
- **Feedback history** — all your ratings are saved and used to improve future recommendations
- **Consistency matters** — rate results by the same standards each time for reliable insights

:::info
Your ratings are the primary input for fitness scoring and genome evolution. The more consistently you rate, the better the system can optimize prompts for your specific standards.
:::

### How It Works

After a test completes, each result has rating buttons next to it. Click thumbs up for good results and thumbs down for poor ones. For more detail, use the star rating. Your ratings feed into the fitness scoring system, which uses them to identify top-performing prompts and guide evolution.

:::tip
Rate results based on what you actually need, not what's technically impressive. A shorter, simpler answer that's correct is often better than a long, elaborate one that misses the point.
:::
  `,

  "genome-evolution-basics": `
## Genome Evolution Basics

Genome evolution is Personas' most innovative feature — it automatically breeds better prompts over time. Think of it like plant breeding: the best-performing prompts are combined to create offspring that inherit the best traits from each parent. Each generation gets closer to the ideal instructions for your specific task.

You don't need to understand genetics or algorithms. Just set a goal, start the evolution, and let the system find better prompts than you could write manually.

:::info
The evolution process is fully automatic once started. You provide the starting prompt and define what "good" means — the system handles creating variations, testing them, and combining winners across generations.
:::

### Key Points

- **Automatic improvement** — the system creates and tests new prompt variations without your involvement
- **Best traits survive** — high-performing elements are preserved and combined
- **Generational progress** — each cycle produces prompts that outperform the previous generation
- **Human-guided** — you set the goals and rate results; the system handles the rest

### How It Works

You provide a starting prompt and define what "good" means for your use case. The system creates variations, tests them, scores them based on your criteria, and combines the best performers to create a new generation. Over several cycles, the prompts converge on highly optimized instructions.

:::tip
Be patient with evolution. The first generation might not be much better than your original prompt, but by generation three or four, you'll typically see significant improvement.
:::
  `,

  "running-a-breeding-cycle": `
## Running a Breeding Cycle

A breeding cycle is one round of prompt evolution. You start with a population of prompt variations, test them all, score the results, and the system creates the next generation by combining the best performers. Each cycle produces better candidates than the last.

Running a cycle is straightforward — select your agent, set your goals, and click Start. The system handles the rest.

:::steps
1. **Open the Testing Lab** — and select the Genome tab
2. **Choose your agent** — the one whose prompt you want to evolve
3. **Define success criteria** — quality, speed, cost, or a combination
4. **Set the population size** — how many variations per generation
5. **Click Start Cycle** — and let the system work
:::

### How It Works

The system creates variations of your current prompt by making small, strategic changes — rewording instructions, adjusting structure, adding or removing details. Each variation is tested with sample inputs and scored. The top performers are combined to create the next generation. You can run multiple cycles to keep improving.

:::tip
Start with a population size of 8-12 variations. This gives enough diversity to find improvements without being wasteful with AI calls.
:::
  `,

  "adopting-evolved-prompts": `
## Adopting Evolved Prompts

When genome evolution finds a prompt that outperforms your current one, you can adopt it with a single click. Adopting replaces your agent's active prompt with the evolved version, instantly upgrading its performance. Your previous prompt is saved in version history, so you can always go back.

This is the payoff of the evolution process — discovering a prompt that works better than anything you could have written manually.

### Key Points

- **One-click adoption** — promote the winning prompt to production instantly
- **Performance comparison** — see exactly how much better the evolved prompt is
- **Safe rollback** — your previous prompt is saved in version history
- **Preview first** — read and review the evolved prompt before adopting it

### How to Adopt

:::steps
1. **Wait for the breeding cycle to complete** — the top-performing prompt is highlighted
2. **Click the Adopt button** — on the winning prompt variation
3. **Preview the evolved prompt** — read through it to check for unexpected phrasing
4. **Review performance metrics** — compare against your current version's scores
5. **Click Confirm** — to make it your agent's active prompt
:::

:::tip
Always read the evolved prompt before adopting it. The evolution system is smart, but occasionally produces prompts with unexpected phrasing. A quick review ensures quality.
:::
  `,

  "fitness-scoring-explained": `
## Fitness Scoring Explained

Fitness scoring combines multiple factors into one easy-to-read number that tells you how well a prompt performs. Instead of juggling separate metrics for quality, speed, and cost, you get a single score — higher means better.

The scoring system uses your ratings, execution metrics, and success rates to calculate fitness. You don't need to do any math — just rate results honestly and the system does the rest.

### Key Points

- **Single score** — one number that captures overall prompt performance
- **Multiple factors** — combines your ratings, speed, cost, and success rate
- **Customizable weights** — emphasize the factors that matter most to you
- **Comparative** — easily compare prompts by their fitness scores

### How It Works

Each time a prompt variation runs, its result is scored based on your success criteria. Your manual ratings (thumbs up/down, star ratings) are the primary input. These are combined with objective metrics like response time and token cost. The resulting fitness score determines which prompts survive to the next generation in evolution.

:::tip
If you care more about quality than cost, adjust the fitness weights to emphasize your ratings over the cost metric. This ensures evolution optimizes for what matters most to you.
:::
  `,

  "test-history-and-trends": `
## Test History and Trends

Every test you run is saved, building a record that shows how your agents have improved over time. Trend charts visualize this progress, showing whether your changes are moving in the right direction. It's like a report card that tracks your agents' grades week by week.

This long-term view is motivating — you can see concrete evidence of improvement — and practical — you can spot regressions quickly.

### Key Points

- **All tests saved** — complete history of every test run, with inputs, outputs, and scores
- **Trend lines** — visual charts showing improvement (or regression) over time
- **Before/after markers** — see the impact of specific changes on your trend lines
- **Exportable** — download your test history for external analysis or reporting

### How It Works

Open the Testing Lab and click the \`History\` tab. Browse past tests sorted by date, filter by testing mode or agent, and view results for any historical test. The \`Trends\` sub-tab shows charts with your scores over time, with markers for significant events like prompt changes or model switches.

:::tip
Look at your trend lines after every major change. If the line goes up, the change was good. If it goes down, consider reverting. This simple habit keeps your agents improving steadily.
:::
  `,
};
