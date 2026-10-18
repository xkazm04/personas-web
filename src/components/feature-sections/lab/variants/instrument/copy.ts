/**
 * PROTOTYPE copy for the Lab's INSTRUMENT variant: English-only pending copy
 * (see src/i18n/pending/). Words that already exist in `labSectionCopy` are
 * reused from there; only the bench's own vocabulary lives here.
 * {side} is an arena channel (A/B); {version} a ledger version id; {n} a count;
 * {lo}/{hi}/{value} are figures.
 */
export interface InstrumentCopy {
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
    mean: string;
    screenLabel: string;
  };
  evolution: {
    title: string;
    sweep: string;
    resweep: string;
    envelope: string;
    cursor: string;
    fitnessAxis: string;
    screenLabel: string;
  };
  eval: {
    title: string;
    reading: string;
    reference: string;
    needle: string;
    refMark: string;
    screenLabel: string;
  };
}

export const instrumentCopy: InstrumentCopy = {
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
    mean: "mean {value}",
    screenLabel:
      "Each version's six dimension scores for the current input, drawn as two traces. The higher mean wins the round.",
  },
  evolution: {
    title: "Fitness strip chart",
    sweep: "sweeping",
    resweep: "re-sweep",
    envelope: "envelope",
    cursor: "G{gen} · top {value}",
    fitnessAxis: "fitness",
    screenLabel:
      "Fitness of every version by generation. The amber line is the best version's ancestry; the band spans the weakest to the fittest of each generation.",
  },
  eval: {
    title: "Meter bank",
    reading: "Reading",
    reference: "reference",
    needle: "{version} live",
    refMark: "reference mark",
    screenLabel:
      "Six meters, one per scored dimension. Each needle is the live version's score; the tick on each dial is the reference version's score.",
  },
};
