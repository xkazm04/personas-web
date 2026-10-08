/**
 * Pending-translation copy: the `labSection` namespace, English only (docs/concepts/mobile-revival/PLAN.md M4, M22).
 *
 * It lives outside `en.ts` so that only the routes that render it bundle it: `en.ts` is imported by
 * every route through `useTranslation`. Components import `labSectionCopy` from here directly; it works in
 * server and client components alike. To translate it, move the interface back into `Translations`
 * and the value into `en` (both in `src/i18n/en.ts`), translate it in the 13 locale files, delete
 * this module and point the consumers at `t.labSection`. See docs/features/platform/internationalization.md.
 */

/**
   * /features Lab. {version} is a version id (v4.2) or an arena side (A/B);
   * {gen} a generation number; {dimensions}/{runs} are counts. The applied
   * diffs in the chat are config text and stay in code.
   */
export interface LabSectionCopy {
  heading: string;
  headingGradient: string;
  lede: string;
  tabs: {
    chat: { label: string; blurb: string };
    arena: { label: string; blurb: string };
    evolution: { label: string; blurb: string };
    eval: { label: string; blurb: string };
  };
  chat: {
    title: string;
    applying: string;
    synced: string;
    appliedDiff: string;
    placeholder: string;
    replay: string;
    messages: {
      tooManyUrgent: string;
      tighten: string;
      newsletters: string;
      preFilter: string;
      replayResult: string;
    };
  };
  arena: {
    title: string;
    round: string;
    input: string;
    version: string;
    win: string;
    lose: string;
    winsAria: string;
    losesAria: string;
    fitnessScore: string;
    fighting: string;
    roundComplete: string;
    inputs: {
      prodBug: string;
      declineMeeting: string;
      slackSummary: string;
      explainPr: string;
      flakyTest: string;
    };
  };
  evolution: {
    title: string;
    gen: string;
    best: string;
    lineage: string;
    genAxis: string;
    bestLineage: string;
    alive: string;
    culled: string;
    breed: string;
  };
  eval: {
    title: string;
    avg: string;
    deltaVsBaseline: string;
    current: string;
    baseline: string;
    footer: string;
    dimensions: {
      accuracy: string;
      clarity: string;
      tone: string;
      latency: string;
      cost: string;
      safety: string;
    };
  };
}

export const labSectionCopy: LabSectionCopy = {
  heading: 'The',
  headingGradient: 'Lab',
  lede: 'Four ways to make your personas better: chat with them, fight them against each other, evolve them across generations, or score them on the dimensions that matter. Every improvement you keep is versioned and reversible.',
  tabs: {
    chat: { label: 'Chat', blurb: 'Refine your persona by talking to it' },
    arena: { label: 'Arena', blurb: 'Two prompts enter, one wins' },
    evolution: { label: 'Evolution', blurb: 'Breed better prompts across generations' },
    eval: { label: 'Eval', blurb: 'Score personas across 6 dimensions' },
  },
  chat: {
    title: 'Refinement chat',
    applying: 'applying changes',
    synced: 'synced',
    appliedDiff: 'applied diff',
    placeholder: 'Tell the agent what to change…',
    replay: 'replay',
    messages: {
      tooManyUrgent: 'The triage agent is labeling too many emails as urgent. Dial it back.',
      tighten: "Got it. Looking at your last 200 runs, 31% were flagged urgent. Industry benchmark for this pattern is 8–12%. I'll tighten the urgency criteria.",
      newsletters: "Also stop flagging newsletters even if they say 'urgent' in the subject.",
      preFilter: 'Added a newsletter pre-filter. Anything with List-Unsubscribe headers or sender in marketing-domains list is now excluded from urgency scoring.',
      replayResult: 'Replaying the last 48h against the new config… 9.2% flagged urgent. Want me to promote this?',
    },
  },
  arena: {
    title: 'Prompt arena',
    round: 'Round',
    input: 'Input',
    version: 'Version {version}',
    win: 'win',
    lose: 'lose',
    winsAria: 'Version {version} wins this round',
    losesAria: 'Version {version} loses this round',
    fitnessScore: 'fitness score',
    fighting: 'fighting…',
    roundComplete: 'round complete',
    inputs: {
      prodBug: 'Urgent bug in prod: draft status update',
      declineMeeting: 'Politely decline a meeting',
      slackSummary: 'Summarize 40 unread Slack msgs',
      explainPr: 'Explain the PR in plain English',
      flakyTest: 'Reply to a flaky test notification',
    },
  },
  evolution: {
    title: 'Genome tree',
    gen: 'Gen',
    best: 'Best',
    lineage: 'Lineage',
    genAxis: 'G{gen}',
    bestLineage: 'best lineage',
    alive: 'alive',
    culled: 'culled',
    breed: 'breed next gen',
  },
  eval: {
    title: 'Eval radar',
    avg: 'Avg',
    deltaVsBaseline: 'Δ vs baseline',
    current: 'current',
    baseline: 'baseline',
    footer: '{dimensions} dimensions · {runs} sample runs',
    dimensions: {
      accuracy: 'Accuracy',
      clarity: 'Clarity',
      tone: 'Tone',
      latency: 'Latency',
      cost: 'Cost',
      safety: 'Safety',
    },
  },
};
