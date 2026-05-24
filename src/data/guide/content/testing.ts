export const content: Record<string, string> = {
  "why-test-your-agents": `
## Why Test Your Agents?

Testing is how you keep agents trustworthy as you iterate. Every prompt edit, every model swap, every new tool you add changes the agent's behavior in ways you can't fully predict from reading the diff. Testing turns that uncertainty into evidence: run the new version against representative inputs, compare to the previous version, see whether you improved the things you meant to and didn't regress the things you didn't.

The Lab tab on each agent's editor is where this happens. It has four modes — Arena, A-B, Matrix, Eval — each answering a different question. Arena compares models on the same prompt. A-B compares two prompts on the same model. Matrix tests combinations of prompt components. Eval is the full grid: every prompt × every model.

### Key Points

- **Catch regressions early** — testing after every change is how you avoid "the agent used to work, what did I break?"
- **Compare alternatives systematically** — Arena and A-B let you choose between options with evidence rather than gut feel
- **Generate fitness data** — Lab runs accumulate per-prompt scores that feed genome evolution (Builder tier)
- **Reusable input sets** — test inputs are saved per agent; same prompts, same data, repeatable comparisons

### How It Works

Each Lab mode dispatches the same trigger payload to multiple agent variants (different prompts, different models, or both) in parallel. Outputs are presented side by side with quantitative metadata (duration, cost, token count) and your subjective rating buttons. The results land in the agent's test history and feed forward into fitness scoring.

:::tip
The cheapest moment to catch a prompt regression is right after you wrote it. Make Lab → A-B against the previous prompt version your habit on every prompt edit; the friction is much lower than discovering a regression in production runs three days later.
:::
  `,

  "the-testing-lab-overview": `
## The Testing Lab Overview

The Lab tab on each agent's editor is one workspace with four modes. Pick the mode by what you're trying to learn:

### The Four Modes

:::compare
**Arena**
Same prompt, multiple models. Sends one input through Claude / GPT / Gemini / local in parallel. Best for "which model is right for this agent?"
---
**A-B**
Two prompts, same model. Compare a prompt change against its predecessor under identical conditions. Best for "did this edit improve things?"
---
**Matrix**
Combinatorial. Define prompt components and the matrix tests every combination (3 × 4 = 12 variants). Best for "I have multiple competing ideas — which combo wins?"
---
**Eval**
Full grid: N prompts × M models. The complete picture when you want to optimize prompt *and* model together. Best when a major change is on the table.
:::

### How It Works

Each mode shares the same input picker (manual entry, a paste of structured JSON, or replay of a real past execution from this agent's history) and the same rating UI. Output columns expand for the full trace (model call, tool calls, decision branches) just like a regular execution. Results are saved to test history with the test mode tagged, so you can browse past tests by mode.

For chained agents, the Lab tests just this agent — the upstream is mocked using the input you specified, so you can iterate on one stage of a pipeline without rerunning the whole chain.

:::tip
Most weeks, Arena and A-B are enough. Matrix is for "I have three plausible refactors and want to compare", Eval is for "I'm contemplating a major rewrite or a tier change". Don't reach for the heavy mode by default — the cheaper ones are usually sufficient.
:::
  `,

  "arena-testing": `
## Arena Testing

Arena sends the same prompt and same input to multiple models in parallel, then lays the results out side by side. Costs and durations are shown alongside the outputs so you're comparing on three axes — quality (your judgment), speed (engine-measured), and cost (token-by-token).

The most common use is the model-selection decision: "this agent has been running on Sonnet 4.6, would Haiku 4.5 hold up for 1/30th the cost?" Arena answers that in one test rather than weeks of production observation.

### Key Points

- **Parallel dispatch** — all models run at once; total wall-clock time = the slowest one, not the sum
- **Side-by-side outputs** — full output of each model is visible without switching tabs
- **Cost + duration shown** — under each output, in the same view as the text
- **Rating UI per column** — thumbs-up / thumbs-down / star per model; ratings persist into the agent's fitness data
- **Replay from history** — Arena tests can pull input from any past execution of this agent, so you're testing on real shape

### How It Works

Arena dispatches one execution per selected model using the agent's current prompt and tool configuration. Each execution is independent (separate trace, separate cost accounting) and tagged \`arena\` so it doesn't count against the agent's normal production metrics. Results appear as columns; you rate each column; ratings feed into the per-model fitness data for this agent.

:::tip
Pick 3 models at most per Arena run. More than that and side-by-side reading becomes unwieldy. If you're considering 5+ models, run multiple Arenas pairwise and keep a running mental note of which models won each round.
:::
  `,

  "ab-testing-prompts": `
## A-B Testing Prompts

A-B runs the same input through two prompt variants on the same model, so the only variable is the prompt. This is the right tool for evaluating a prompt edit: load the previous version as A, the new version as B, run on representative inputs, and see which one produces the result you want.

The Lab's version picker integrates with the prompt's version history — you don't need to copy-paste the old version, just pick it from the dropdown. This makes "compare my current draft to last week's working version" a one-click setup.

### Key Points

- **Two prompts, one model, one input** — single-variable comparison
- **Pick from version history** — A or B can be any past version of this agent's prompt
- **Same trace fidelity** — both variants get full execution traces, so you can compare tool-call patterns, not just final output
- **Multiple input rounds** — run the A-B against several different inputs in sequence to test generalization, not just one lucky case
- **Score persists into fitness** — A-B ratings feed the same fitness data Arena and genome use

### How It Works

The A-B engine dispatches both prompts as independent executions and labels them A and B in the results panel. Beyond that, they're regular executions — same trace, same cost accounting, but tagged \`ab_test\` so they're filterable in test history and don't pollute production metrics.

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
Change one thing per A-B round. If B differs from A in *both* format *and* tone *and* length, you can't tell which dimension caused the score change. Make one change, run A-B, accept or reject, then make the next change.
:::
  `,

  "matrix-testing": `
## Matrix Testing

Matrix is combinatorial A-B-C-D-… all at once. You define your prompt as components (intro × instructions × output-format, for instance) and the matrix generates every combination, dispatches them all, and ranks the results by fitness score.

With 3 components of 3 options each that's 27 combinations — way more than you'd test manually but easy for the engine to fan out in parallel. The matrix is most useful when you have multiple competing ideas for how to structure a prompt and want to find the combination that actually performs best rather than the one you guessed at.

### Key Points

- **Define components, get combinations** — the matrix expands the components into all valid combinations
- **Parallel dispatch** — every combo runs simultaneously (subject to provider rate limits)
- **Ranked results** — fitness-scored grid, sorted from best to worst
- **Component-level attribution** — see which components correlate with high scores; useful even when you don't adopt the top winner verbatim
- **Save winning combo** — one-click to set the winning combination as the agent's active prompt

### How It Works

You define each component as a labeled set of variants in the matrix tab. The engine constructs every combination as a renderable prompt and dispatches each as an independent execution. Results are aggregated into a grid ranked by your chosen fitness signal (rating, cost-per-quality, speed, custom). Per-component attribution is computed by averaging fitness across combinations that share that component — so even if no single winner stands out, you learn which intro / instruction style / output format performs best on average.

:::info
With 3 components × 3 options = 27 variants. With 4 × 4 = 256. The matrix can handle large grids but you'll burn through tokens proportionally. Start with 3 × 3 and only expand if the result is genuinely ambiguous.
:::

:::tip
Matrix is most useful right after a major redesign of the prompt. When you're not sure whether the new structure is better than the old, matrix-test 3-4 candidate structures against a few representative inputs — the winner is usually clearer than you'd expect.
:::
  `,

  "eval-testing": `
## Eval Testing

Eval is the full grid: every prompt variant × every model. You pick the prompts (typically 2-3 candidates), pick the models (typically 2-4), and the eval grid runs all combinations and presents a heatmap of scores. The best prompt-model pair is highlighted.

This is the heavyweight mode — most expensive in tokens, most thorough in coverage. Use it when you're making a major decision that affects both axes: "we're considering rewriting the prompt and moving to a cheaper model, can we do both at once and still hit our quality bar?"

### Key Points

- **N prompts × M models** — heatmap of scores across both dimensions
- **Best combination highlighted** — fitness-ranked, with the optimal cell visually called out
- **Per-axis breakdowns** — see whether the prompt change or the model change drove the score change
- **Test-history tagged** — eval runs land in history under the \`eval\` tag for later review
- **One-click adopt** — apply the best combination (prompt version + model selection) to the live agent

### How It Works

Eval dispatches \`prompts × models\` executions in parallel (subject to provider rate limits). Each cell is one independent execution with its own trace. The grid view aggregates by prompt-model pair; you rate cells using the same UI as Arena and A-B; fitness scores roll up into per-cell ranking. The top cell is the recommended combination — adopt it directly from the grid view.

:::warning
Eval is the most expensive mode. 3 prompts × 4 models × 5 inputs = 60 executions, each with its own model call. Run sparingly, on representative input sets, and only when the decision really crosses both axes. For prompt-only decisions, A-B; for model-only decisions, Arena.
:::
  `,

  "rating-and-scoring-results": `
## Rating and Scoring Results

After any Lab test, each output row has rating controls: thumbs-up / thumbs-down for binary judgment, or a 1-5 star scale for nuanced cases. Your ratings feed two things: the agent's per-variant fitness score (used for ranking in matrix and eval, and as the genome-evolution selection pressure on Builder tier), and a personal preference signal across all your testing over time.

The ratings are personal — they encode your judgment of quality, not an objective metric. That's intentional; you're the one who knows whether the agent's output matches what you need, and that's the signal the system optimizes against.

### Key Points

- **Binary or 1-5 star** — pick whichever scale you're comfortable being consistent with
- **Per-output rating** — every test output gets its own row of rating controls; nothing is aggregated automatically until you rate
- **Drives fitness scores** — ratings feed the per-variant fitness signal that Matrix / Eval / genome use
- **Feedback history persists** — every rating you've ever given is stored; useful for "did I rate X higher than Y in past tests?"
- **Consistency matters more than precision** — a 4-star you'd give consistently is more useful than a 5-star you give once and never again

### How It Works

Ratings are stored against the specific execution (trace, prompt version, model, input). The fitness aggregator reads ratings + objective metrics (cost, duration, success) and computes a per-variant fitness score that's used in ranking. Genome evolution (Builder tier) uses ratings as the primary selection pressure for choosing parent prompts to breed.

:::tip
Rate based on what you actually want, not what's technically impressive. A short correct answer often beats a long elaborate one. The system optimizes against your preferences, so honest, consistent ratings produce agents tuned to *your* judgment.
:::
  `,

  "genome-evolution-basics": `
## Genome Evolution Basics

Genome evolution (Builder tier) automatically breeds new prompt variants from your best-rated past tests. Each "generation" mutates and recombines the top-performing prompts from the previous generation; over several generations, the prompts converge on configurations that score consistently better than your starting point. It's evolutionary search with your ratings as the fitness function.

The process is unattended once you start it. You provide the starting prompt and the fitness signal (typically your rating history plus optional objective metrics like cost or duration), set the population size and generation count, and let it run. The agent's normal triggers stay paused during evolution to keep the comparison clean.

:::info
Genome evolution is unattended once kicked off. You set the parameters, the engine creates variations, tests them against your input set, scores them by your ratings, and recombines the winners into the next generation. You review the final population and adopt the winner manually — the system never silently changes your live prompt.
:::

### Key Points

- **Automatic variation + selection** — engine generates mutations of top-performing parents and selects via fitness
- **Generations + populations** — typical config is 5-10 generations of 8-12 variants each
- **Fitness function = your ratings** — primary signal; secondary signals (cost, duration) are configurable weights
- **All generations versioned** — every generated prompt is preserved in the agent's version history; nothing is lost
- **Manual adoption** — the engine never silently swaps your live prompt; you review and adopt the winner

### How It Works

Each generation starts with a parent population. The engine generates child variants via small structured mutations (rewording, reordering sections, adjusting examples, etc.) and crossover (combining segments from two parents). Each child runs against your input set; ratings produce the fitness score; top-scoring children become the parent population for the next generation. After the configured number of generations, you see the final ranked population and can adopt any variant.

### See It In Action

:::usecases
**Email triage tuning**
Current prompt misclassifies 15% of emails
---
Run 5 generations of population 10. End up with a variant that misclassifies 3% — adopt with one click.
===
**Format consistency**
Agent's output format is inconsistent across input shapes
---
Genome evolves on a diverse input set with format-conformance as the fitness signal; output stabilizes.
===
**Cost reduction without quality loss**
You want to find a leaner prompt that still produces good output
---
Add cost-per-token to the fitness function with negative weight; evolution finds shorter prompts that maintain rating.
:::

:::info
Every variant created during evolution is versioned in the agent's prompt history. If adopted variant N+1 turns out to behave badly in production, restoring variant N is one click — no work is lost.
:::

:::tip
Patience pays off. Generation 1 usually isn't dramatically better than your starting prompt — the mutations are small and many are duds. By generation 3-4 the surviving population concentrates on the actual improvements; that's typically when you'll see a clear winner.
:::
  `,

  "running-a-breeding-cycle": `
## Running a Breeding Cycle

A "breeding cycle" is one full evolution run: pick the agent, set the parameters, kick off, wait, review the population, adopt. Each cycle is N generations of M variants tested against your chosen input set. The total cost is roughly \`generations × population × input-count × per-run-cost\` — predictable from the parameters.

The Genome tab on the Lab is the entry point. It opens with default parameters tuned for a representative starting point (5 generations × 10 variants × 5 inputs), which is enough to see meaningful change without burning excessive tokens. Adjust the parameters before kicking off if you want a heavier or lighter cycle.

:::steps
1. **Open Lab → Genome** on the agent you want to evolve
2. **Pick the input set** — manual entry, a saved set, or replay-from-history
3. **Configure fitness weights** — rating weight (primary), cost weight (negative if you want shorter), duration weight (negative if you want faster)
4. **Set generations and population** — 5 × 10 is the default; raise both for harder problems, lower both for quick experiments
5. **Click Start Cycle** — the engine runs unattended; you can leave the app open or come back later
6. **Review the final population** — ranked by fitness, with the trace of each variant available
7. **Adopt the winner** — or any other variant you prefer; the agent's active prompt is updated and the cycle's full population is preserved in version history
:::

### How It Works

Each generation runs in parallel: the engine dispatches all M variants simultaneously (subject to provider rate limits) across the input set, collects results, scores them via fitness function, selects top performers as parents, generates children for the next generation, and continues. The progress UI shows live per-generation best and average fitness so you can see whether the population is improving.

:::tip
Start with a small input set (3-5 representative cases) and the default 5 × 10 cycle. If the result is clearly improved, you're done. If it's ambiguous, expand the input set and run another cycle starting from the previous winner. Iterating cycles often beats one giant cycle.
:::
  `,

  "adopting-evolved-prompts": `
## Adopting Evolved Prompts

When a breeding cycle finishes, you see the final population ranked by fitness with the top variant highlighted. Adopting is one click — the variant becomes the agent's active prompt, the previous active prompt is preserved in version history (so rollback is also one click), and the cycle's full population is also preserved in case you want to adopt a different variant later.

The adopt action runs the same pre-flight check as any other prompt change: setup-status verifies the agent's credentials and tools are still valid, the version is checkpointed in history, and if the agent has scheduled triggers, the next scheduled run uses the adopted variant automatically.

### Key Points

- **One-click adopt** from the ranked population view
- **Previous version preserved** in history; restore is also one click
- **Full population preserved** — any variant from the cycle remains adoptable later
- **Pre-flight check runs** — setup-status verification, credential validation, trigger compatibility
- **Live triggers automatically use the new variant** — no separate "deploy" step

### How to Adopt

:::steps
1. **Wait for the breeding cycle to finish** — usually 10-30 minutes depending on parameters
2. **Open the final population view** — variants ranked by fitness with traces accessible per variant
3. **Read the top variant's prompt** — quick sanity check for unexpected phrasing or weird mutations
4. **Optionally inspect 2nd / 3rd-place variants** — sometimes a slightly lower fitness comes with much shorter / cleaner prompt
5. **Click Adopt** on your choice; pre-flight check runs; agent's active prompt updates atomically
6. **Verify the next live run** — usually a Manual Run with a representative input is the cheapest confirmation that the adopted variant behaves as the test scores promised
:::

:::tip
Read the adopted variant before clicking Adopt. Evolution finds high-fitness prompts, but occasionally a variant scores well by exploiting some quirk of your input set; reading the prompt is the safety check that catches "this would also pass my tests but is weird".
:::
  `,

  "fitness-scoring-explained": `
## Fitness Scoring Explained

Fitness is the single number that drives Matrix / Eval / Genome selection. It combines your manual ratings (primary signal) with objective metrics (cost, duration, success rate, output-length-target conformance, custom signals) into a weighted score. You configure the weights per agent or per test — by default, ratings dominate and objective metrics are tiebreakers.

The score is computed per variant per input, then aggregated across all inputs in the test set to produce one fitness per variant. Variants are ranked by aggregate fitness; that ranking is what the genome selection algorithm consumes and what the Lab UI uses to highlight winners.

### Key Points

- **Single aggregate score per variant** — typically 0.0–1.0 or 0–100 depending on display preference
- **Multiple input sources** — rating (primary), cost, duration, success, output-format conformance, custom fitness functions
- **Per-agent weights** — emphasize what matters; for cost-sensitive agents, weight cost more; for quality-sensitive ones, weight rating more
- **Aggregation across inputs** — variants are scored on each input then averaged, so a variant that's brilliant on one input and broken on another scores worse than a steady mediocre one
- **Transparent breakdown** — click any fitness number to see the per-signal contributions

### How It Works

The fitness aggregator reads execution results (cost, duration, success), rating history (per execution), and any custom fitness signals registered for the agent. Each is normalized to a 0-1 range, multiplied by its configured weight, and summed. The result is the variant's fitness; aggregate across all inputs in the test set is the displayed score.

:::tip
The default weights (90% rating, 10% cost) are tuned for most agents. If you find yourself disagreeing with the system's "winners" in eval / matrix tests, the most useful adjustment is usually to up the rating weight further (95%) so the system trusts your judgment more. Adjust cost weight up for very high-volume agents where token cost is a real concern.
:::
  `,

  "test-history-and-trends": `
## Test History and Trends

Every Lab test you run is preserved in the agent's test history. The history view (Lab → History) shows past tests sorted by date with the mode tag, input set, fitness scores, and the eventual outcome (adopted / rejected / superseded). Click any past test to re-open it in its original mode for re-review or to clone parameters into a new test.

The Trends sub-tab plots agent-level metrics over time — fitness of currently-active prompt, cost-per-run, duration-per-run, business-outcome rate. The plot is annotated with significant events (prompt changes, model swaps, trigger additions) so you can see the impact of each change on the live agent's metrics.

### Key Points

- **Every test preserved** — full input, output, ratings, fitness; nothing is GC'd
- **Mode-tagged** — filter by Arena / A-B / Matrix / Eval / Genome to find a specific past test
- **Trend chart** with auto-annotation at every meaningful change point
- **Compare a past test to current state** — useful for "is the current prompt still better than the one I rejected three weeks ago?"
- **Exportable** — test history exports to CSV for external analysis

### How It Works

Test results are stored in the same execution store as production runs, with the test-mode tag for filtering. The Trends view aggregates from this store; auto-annotations are extracted from the version-history and configuration-history (which are also persistent). Nothing in the history is mutable — past tests are immutable records of what was tested when.

:::tip
The Trends view is the single best place to answer "is my agent actually getting better over time?" Open it once a month; if the fitness trend is flat or declining, the recent changes aren't helping and it's time to think rather than ship more changes.
:::
  `,
};
