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
   * {gen} a generation number; {dimensions}/{runs} are counts.
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
    round: string;
    input: string;
    version: string;
    winsAria: string;
    inputs: {
      prodBug: string;
      declineMeeting: string;
      slackSummary: string;
      explainPr: string;
      flakyTest: string;
    };
  };
  evolution: {
    gen: string;
    best: string;
    lineage: string;
    genAxis: string;
    bestLineage: string;
    alive: string;
    culled: string;
  };
  eval: {
    avg: string;
    deltaVsBaseline: string;
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
  /** The bench (lab/bench/): the instrument vocabulary its four channels
   *  add. {n} is a count or channel number; {version} a ledger version id;
   *  {gen} a generation; {lo}/{hi}/{value} are figures. */
  bench: {
    channel: string;
    stylised: string;
    chat: {
      title: string;
      measured: string;
      target: string;
      targetBand: string;
      axis: string;
      before: string;
      after: string;
      deltaPts: string;
      log: string;
      roles: { user: string; assistant: string; diff: string };
      adjust: string;
      tuning: string;
      inBand: string;
      screenLabel: string;
    };
    arena: {
      title: string;
      source: string;
      margin: string;
      tally: string;
      acquiring: string;
      locked: string;
      roundCell: string;
      roundShort: string;
      screenLabel: string;
    };
    evolution: {
      title: string;
      sweep: string;
      resweep: string;
      envelope: string;
      cursor: string;
      screenLabel: string;
    };
    eval: {
      title: string;
      reading: string;
      needle: string;
      refMark: string;
      screenLabel: string;
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
    round: 'Round',
    input: 'Input',
    version: 'Version {version}',
    winsAria: 'Version {version} wins this round',
    inputs: {
      prodBug: 'Urgent bug in prod: draft status update',
      declineMeeting: 'Politely decline a meeting',
      slackSummary: 'Summarize 40 unread Slack msgs',
      explainPr: 'Explain the PR in plain English',
      flakyTest: 'Reply to a flaky test notification',
    },
  },
  evolution: {
    gen: 'Gen',
    best: 'Best',
    lineage: 'Lineage',
    genAxis: 'G{gen}',
    bestLineage: 'best lineage',
    alive: 'alive',
    culled: 'culled',
  },
  eval: {
    avg: 'Avg',
    deltaVsBaseline: 'Δ vs baseline',
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
  bench: {
    channel: "CH{n}",
    stylised: "bench readout",
    chat: {
      title: "Signal tuner",
      measured: "Measured",
      target: "Target",
      targetBand: "{lo}–{hi}%",
      axis: "% flagged urgent · last 48h, hourly",
      before: "before",
      after: "after",
      deltaPts: "Δ {value} pts",
      log: "Operator log",
      roles: { user: "You", assistant: "Agent", diff: "Adjust" },
      adjust: "ADJ {n}",
      tuning: "tuning",
      inBand: "in band",
      screenLabel:
        "Urgent-flag rate over the last 48 hours: 31% before the refinement, 9.2% after it, inside the 8–12% target band.",
    },
    arena: {
      title: "Dual-channel compare",
      source: "Source",
      margin: "Margin",
      tally: "Tally",
      acquiring: "acquiring",
      locked: "locked",
      roundCell: "Show round {n}",
      roundShort: "R{n}",
      screenLabel:
        "Each version's six dimension scores for the current input, drawn as two traces. The higher mean wins the round.",
    },
    evolution: {
      title: "Fitness strip chart",
      sweep: "sweeping",
      resweep: "re-sweep",
      envelope: "envelope",
      cursor: "G{gen} · top {value}",
      screenLabel:
        "Fitness of every version by generation. The amber line is the best version's ancestry; the band spans the weakest to the fittest of each generation.",
    },
    eval: {
      title: "Meter bank",
      reading: "Reading",
      needle: "{version} live",
      refMark: "reference mark",
      screenLabel:
        "Six meters, one per scored dimension. Each needle is the live version's score; the tick on each dial is the reference version's score.",
    },
  },
};
