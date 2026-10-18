/**
 * PROTOTYPE copy for the Lab's BROADCAST variant (English-only pending copy,
 * like `src/i18n/pending/labSection.ts`, which it reuses where it fits).
 * Placeholders: {n} a play/round number, {version} a ledger version id,
 * {a}/{b} scores, {gen} a generation, the rest are derived counts.
 */
export interface BroadcastCopy {
  live: string;
  network: string;
  final: string;
  segments: { chat: string; arena: string; evolution: string; eval: string };
  chat: {
    ticker: string;
    coach: string;
    analyst: string;
    play: string;
    wrap: string;
    plays: string;
    playNames: { tooManyUrgent: string; newsletters: string };
    wrapName: string;
    telestrator: string;
    tbd: string;
    statLabel: string;
    statBefore: string;
    statAfter: string;
    statBenchmark: string;
    warmup: string;
    tickerCall: string;
    tickerRead: string;
    tickerApplied: string;
    tickerWrap: string;
    replay: string;
  };
  arena: {
    ticker: string;
    rating: string;
    final: string;
    roundShort: string;
    momentum: string;
    review: string;
    reviewAria: string;
    replayTitle: string;
    decided: string;
    clinch: string;
    margin: string;
    tickerMatchup: string;
    tickerResult: string;
    tickerFinal: string;
    replayMatch: string;
  };
  evolution: {
    ticker: string;
    board: string;
    tbd: string;
    elim: string;
    champion: string;
    vsParent: string;
    founder: string;
    warmup: string;
    tickerGen: string;
    tickerChamp: string;
  };
  eval: {
    ticker: string;
    scout: string;
    ovr: string;
    leagueRank: string;
    rankAria: string;
    attributes: string;
    baselineRef: string;
    tiers: { elite: string; pro: string; starter: string; bench: string };
    tickerCard: string;
  };
}

export const broadcastCopy: BroadcastCopy = {
  live: "Live",
  network: "Lab",
  final: "Final",
  segments: {
    chat: "Coach's huddle",
    arena: "Head to head",
    evolution: "Season bracket",
    eval: "Player card",
  },
  chat: {
    ticker: "Play-by-play",
    coach: "Coach",
    analyst: "Analyst",
    play: "Play {n}",
    wrap: "Final whistle",
    plays: "Plays called",
    playNames: { tooManyUrgent: "Urgency dial", newsletters: "Newsletter screen" },
    wrapName: "Replay check",
    telestrator: "Telestrator: config change",
    tbd: "Waiting for the call",
    statLabel: "Flagged urgent",
    statBefore: "Last 200 runs",
    statAfter: "Replayed 48h",
    statBenchmark: "Benchmark 8–12%",
    warmup: "The huddle is forming…",
    tickerCall: "The coach calls play {n}",
    tickerRead: "The analyst breaks down the tape",
    tickerApplied: "Play {n} is on the board: {lines} config lines changed",
    tickerWrap: "Replay confirms the call. Promote {version}?",
    replay: "Replay huddle",
  },
  arena: {
    ticker: "Match centre",
    rating: "Rtg",
    final: "Final",
    roundShort: "R{n}",
    momentum: "Momentum",
    review: "Reviewing round {n}",
    reviewAria: "Review round {n}",
    replayTitle: "Instant replay",
    decided: "Round {n} decided it",
    clinch: "{version} clinches it {a}–{b}",
    margin: "by {margin}",
    tickerMatchup: "Round {n} is under way",
    tickerResult: "{version} takes round {n}, {a} to {b}",
    tickerFinal: "Final: {version} wins the match {a}–{b}",
    replayMatch: "Replay match",
  },
  evolution: {
    ticker: "Bracket desk",
    board: "Draft board",
    tbd: "TBD",
    elim: "Elim",
    champion: "Champion",
    vsParent: "{delta} gain",
    founder: "Founder",
    warmup: "The founder takes the field",
    tickerGen: "G{gen}: {advance} advance, {elim} eliminated",
    tickerChamp: "Champion crowned at {fitness}, {gain} over the founder",
  },
  eval: {
    ticker: "Post-match",
    scout: "Scout a version",
    ovr: "Ovr",
    leagueRank: "#{rank} of {total}",
    rankAria: "Ranks {rank} of {total} versions in the league",
    attributes: "Attributes",
    baselineRef: "Pre-refinement baseline",
    tiers: { elite: "Elite", pro: "Pro", starter: "Starter", bench: "Bench" },
    tickerCard: "{version} vs the baseline: {delta} overall, #{rank} of {total} in the league",
  },
};
