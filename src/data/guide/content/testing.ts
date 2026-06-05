export const content: Record<string, string> = {
  "why-test-your-agents": `
## Why Test Your Agents?

Testing is how you keep agents trustworthy as you iterate. Every prompt edit, every model swap, every new tool you add changes the agent's behavior in ways you can't fully predict from reading the diff. Testing turns that uncertainty into evidence: run the new version against representative inputs, compare to the previous version, see whether you improved the things you meant to and didn't regress the things you didn't.

The Lab tab on each agent's editor is where this happens. It's a single **Versions & Ratings** table: every prompt version your agent has, crossed with every model you've measured it on — one row per pair, with the live config marked Active. From any row you measure it across models, activate it, diff it against the live version, or hand it to the Athena companion to improve.

### Key Points

- **Catch regressions early** — testing after every change is how you avoid "the agent used to work, what did I break?"
- **Compare alternatives systematically** — Arena and A-B let you choose between options with evidence rather than gut feel
- **Generate fitness data** — Lab runs accumulate per-prompt scores that feed genome evolution (Builder tier)
- **Reusable input sets** — test inputs are saved per agent; same prompts, same data, repeatable comparisons

### How It Works

Measuring a version dispatches the agent's prompt to every selected model in parallel. Each result is scored (tool accuracy, output quality, protocol compliance) and rolled up into a single rating per (version, model) cell, alongside cost and latency. Pin any version as a regression baseline and every other row shows its delta on the same model.

:::tip
The cheapest moment to catch a prompt regression is right after you wrote it. Pin your last known-good version as the baseline; after each edit, measure the new version and read its Δ-vs-baseline column — much lower friction than discovering a regression in production three days later.
:::
  `,

  "the-testing-lab-overview": `
## The Testing Lab Overview

The Lab tab on each agent's editor is one table: prompt **versions** down the side, the **models** you've measured each on across the rows. One row is the live config. Read it top to bottom to answer the only question that matters — "which version + model should ship?"

### What each column tells you

- **Rating** — the weighted composite score (tool accuracy, output quality, protocol compliance) averaged across every measurement of that version + model. The ★ marks the best model for each version.
- **Δ baseline** — once you pin a version as the regression baseline, every row shows how it compares on the same model. A meaningful drop is flagged.
- **Cost** — average spend per measured run, so the model-selection decision weighs quality against price in one place.

### What you do from a row

- **Activate** — make this (version, model) the agent's live config in one click; it sets both the prompt and the model.
- **Measure** — run the version across models (an Arena sweep) to fill in its ratings.
- **Improve** — hand the version to the Athena companion with its weakest metric pre-filled; you say what to focus on, she drafts the next version.
- **Diff** — see exactly what changed between this version's prompt and the live one.

For chained agents, measurement tests just this agent — the upstream is mocked using the input you specified, so you can iterate on one stage of a pipeline without rerunning the whole chain.

:::tip
The everyday loop: edit the prompt → **Measure** → compare the rating to your baseline → **Activate** if it won. Reach for Athena's **Improve** when you're not sure what to change.
:::
  `,

  "arena-testing": `
## Measuring a Version (Arena)

**Measure** is the action behind every rating in the table. Click it on any row and the Arena opens — a roster where you pick the models to put that version's prompt against. It dispatches one run per model in parallel and lays the results out side by side, comparing on three axes: quality (the scored composite), speed (engine-measured), and cost (token-by-token).

The most common use is the model-selection decision: "this version has been running on Sonnet 4.6, would Haiku 4.5 hold up for a fraction of the cost?" Measure answers that in one sweep rather than weeks of production observation, and the scores flow straight back into the version's row.

### Key Points

- **Version-scoped** — Measure runs *that row's* prompt version, not whatever happens to be live, so a row's rating always reflects the version it sits on
- **Parallel dispatch** — every selected model runs at once; wall-clock = the slowest one, not the sum
- **Side-by-side outputs** — full output of each model is visible without switching tabs, with cost + duration under each
- **Scores roll up** — each run is scored (tool accuracy, output quality, protocol compliance) and averaged into the (version, model) cell back in the table
- **Tagged, not counted** — measurement runs are tagged so they don't pollute the agent's production metrics

### How It Works

Measure dispatches one execution per selected model using the chosen version's prompt + the agent's tool configuration. Each execution is independent (separate trace, separate cost accounting). When the sweep finishes, the table's Rating and Cost columns for that version fill in.

:::tip
Pick 3 models at most per sweep — more than that and side-by-side reading gets unwieldy. To compare two *versions*, measure each on the same models, then read their rows (and the Δ-baseline column) in the table.
:::
  `,

  "ab-testing-prompts": `
## Comparing Prompt Versions

To evaluate a prompt edit, you don't need a separate A/B mode — the table *is* the comparison. Measure the old version and the new version on the same model, and their rows sit next to each other with their composite ratings, so the better prompt is the higher number. Because every version is an immutable snapshot in the prompt's history, the comparison is always apples-to-apples on the same model.

### Key Points

- **Same model, two versions** — measure both on the same model and read the two rows; the only variable is the prompt
- **Δ-baseline does the math** — pin the known-good version as the baseline and every other row shows its delta on the same model, so a regression is a red number, not a side-by-side squint
- **Immutable snapshots** — versions never change after creation, so a measurement of v3 is always a measurement of *that* prompt
- **Diff to see why** — the row's Diff action shows exactly what changed between that version's prompt and the live one
- **Scores roll up** — every measurement feeds the same rating data, so comparisons accumulate as you iterate

### How It Works

Each version's prompt is dispatched as independent measurement runs (via the Measure action), scored, and averaged into its (version, model) cell. The table aggregates those cells, marks the best model per version with a ★, and — once a baseline is pinned — computes each row's Δ against the baseline on the matching model.

:::code-compare
### v3 (baseline)
Summarize the document.
Keep it short.
---
### v4 (candidate)
Summarize the document in exactly
3 bullet points. Each bullet should
be one sentence. Start with the
most important finding.
:::

:::warning
Change one thing per version. If v4 differs from v3 in format *and* tone *and* length, the rating tells you it moved but not which dimension caused it. Make one change, measure, Activate if it won, then make the next change.
:::
  `,

  "matrix-testing": `
## Improving a Version with Athena

When a version's rating shows a weakness but you're not sure how to fix it, use the row's **Improve** action. It hands the version to the **Athena** companion with a brief already filled in — the persona, the version, and its weakest measured metric (tool accuracy, output quality, or protocol). You add one line about what to focus on, and Athena drafts the next version for you.

This replaced the old combinatorial "matrix" mode: instead of you hand-defining a grid of prompt components and reading a ranked table, you describe the goal and let the companion propose a concrete next version, which you then measure and Activate if it won.

### Key Points

- **Weakness pre-filled** — Improve reads the row's scores and tells Athena which metric is dragging, so you don't have to diagnose it first
- **You stay in control** — Athena seeds the chat and waits; nothing is drafted until you say what to focus on
- **Closes the loop** — the new version lands in the same table, ready to Measure against the one it came from
- **One change at a time** — because each improvement is a discrete new version, the rating tells you whether it actually helped

### How It Works

Improve opens the Athena chat with a composed brief (persona name + version + weakest metric + the model it was measured on) and pauses on your input. When you send it, Athena proposes a revised prompt as a new version. Measure it, compare its rating to its parent (and to your pinned baseline), and Activate the winner.

:::tip
Reach for Improve when you can see *that* a version is weak but not *why* — the companion is better at turning "protocol compliance is low on opus" into a concrete prompt change than a blank editor is.
:::
  `,

  "eval-testing": `
## The Ratings Table Is the Grid

There's no separate "eval" mode anymore — the Versions & Ratings table *is* the version × model grid. Every version you've measured sits as a row per model, with its composite score; the ★ marks the best model for each version, and the live config is marked Active. The "full grid" you used to assemble by hand is just the accumulated state of the table.

That makes the major both-axes decision — "should we rewrite the prompt *and* move to a cheaper model?" — a matter of reading the table: measure the candidate version on the candidate models, then compare its cells against the incumbent's, weighing the Rating against the Cost column.

### Key Points

- **Versions × models, persistent** — the grid isn't a one-off run; it's the table, and it fills in as you measure
- **Best cell highlighted** — the ★ calls out the top model per version; the Active row marks what's live
- **Quality vs cost in one view** — Rating and Cost columns sit side by side, so the cheap-but-good cell is easy to spot
- **Activate the winner** — one click sets a (version, model) cell as the agent's live config — prompt and model together
- **Δ-baseline for safety** — pin an incumbent and the grid shows every candidate's delta, so a "cheaper model" that quietly regresses shows up red

### How It Works

Each cell is the rolled-up score of the Measure runs for that (version, model) pair. The table aggregates them, ranks models within a version, and — with a baseline pinned — computes deltas on the matching model. Activating a cell rolls that version's prompt live and switches the agent's model to that cell's model in one transaction.

:::warning
Measuring every version on every model gets expensive fast — N versions × M models × your input set, each a real model call. Measure the candidates that matter on the models you'd actually ship, not the whole cartesian product.
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

Breeding and evolution no longer have their own Lab tab — they run **headless, through the Athena companion**. You ask Athena to breed two strong agents or to run an evolution cycle on one, and (after you approve the run, since it's compute-heavy) the same engine does the work in the background. The engine, parameters, and fitness model below are unchanged; only the trigger moved from a panel to a conversation.

:::steps
1. **Ask Athena** — e.g. "breed the Researcher and Summarizer agents" or "run an evolution cycle on the Researcher"
2. **Confirm the parameters** — Athena proposes parents / fitness weights / generations × population; defaults (5 generations × 10 variants) suit most cases
3. **Approve the run** — breeding and evolution are gated behind an approval card because they spawn a heavy background sweep
4. **Let it run unattended** — the engine works in the background; you can keep using the app
5. **Review the offspring** — ranked by fitness; adopt the winner (or any variant) and it lands in the agent's version history, ready to Measure in the table
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

The score is computed per variant per input, then aggregated across all inputs in the test set to produce one fitness per variant. Variants are ranked by aggregate fitness; that ranking is what the genome selection algorithm consumes and what Athena surfaces when she presents the offspring for review.

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
