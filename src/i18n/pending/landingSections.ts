/**
 * Pending-translation copy: the `landingSections` namespace, English only (docs/concepts/mobile-revival/PLAN.md M4, M22).
 *
 * It lives outside `en.ts` so that only the routes that render it bundle it: `en.ts` is imported by
 * every route through `useTranslation`. Components import `landingSectionsCopy` from here directly; it works in
 * server and client components alike. To translate it, move the interface back into `Translations`
 * and the value into `en` (both in `src/i18n/en.ts`), translate it in the 13 locale files, delete
 * this module and point the consumers at `t.landingSections`. See docs/features/platform/internationalization.md.
 */

export interface LandingSectionsCopy {
  hero: {
    line1: string;
    line2: string;
    sub: string;
    aria: string;
    events: string[];
    done: string[];
  };
  featuresHero: {
    line1: string;
    line2: string;
    sub: string;
    aria: string;
    events: string[];
    handled: string;
    yourEvent: string;
    sendEvent: string;
    skipIntro: string;
  };
  useCases: {
    artLabel: string;
    needs: { reach: string; notes: string; book: string; track: string; code: string; pay: string };
    status: string;
    controls: string;
    prevCase: string;
    nextCase: string;
    capabilities: string;
    jobsCount: string;
  };
  agentMind: {
    stylised: string;
    idleHint: string;
    illustration: string;
    wholePlan: string;
    outcomeTitle: string;
    underAttention: string;
    beats: {
      parse: string;
      select: string;
      tools: string;
      execute: string;
      verify: string;
      result: string;
    };
  };
  hub: {
    /** The agent a trigger wakes (V1 fact label, V2/V3 story beat). */
    wakes: string;
  };
  getStarted: {
    replay: string;
    stylised: string;
    v3: {
      agent: string;
      lede: string;
      artLabel: string;
      yours: string;
      yoursLine: string;
      its: string;
      itsLine: string;
      setup: { install: string; describe: string; connect: string };
      day: string;
      dayParts: { coffee: string; meetings: string; lunch: string; focus: string; home: string; asleep: string };
      triggers: { schedule: string; email: string };
      runs: { client: string; invoice: string; overnight: string; digest: string };
      onYourPc: string;
    };
  };
}

export const landingSectionsCopy: LandingSectionsCopy = {
  hero: {
    line1: 'One event in.',
    line2: 'A whole team on it.',
    sub: 'A hive of AI agents on your own machine, coached and always on.',
    aria: 'Animated illustration: events fall onto a honeycomb of AI agents, ripple through a team of cells, and rise again as finished work.',
    events: ['Invoice in', 'New lead', 'Build failed'],
    done: ['Booked', 'Qualified', 'Fixed'],
  },
  featuresHero: {
    line1: 'A crew of AI agents,',
    line2: 'alive on your machine.',
    sub: 'They wake on events, team up, and get it done. Privately.',
    aria: 'Animated illustration: a swarm of AI agents drifting in teams. Whenever an event arrives, the nearest team gathers around it, works it, and lets go.',
    events: ['New email', 'Invoice in', 'PR opened', '9:00 standup', 'File changed', 'Price alert', 'Ticket filed'],
    handled: 'Handled',
    yourEvent: 'Your event',
    sendEvent: 'Send an event',
    skipIntro: 'Skip intro',
  },
  useCases: {
    artLabel: 'Animation: one persona, {persona}, meets one job at a time and picks the tool for it from your connectors.',
    needs: {
      reach: 'Write to a client',
      notes: 'Keep meeting notes',
      book: 'Book the follow-up',
      track: 'Track the tasks',
      code: 'Review the code',
      pay: 'Chase a failed payment',
    },
    status: 'Job {n} of {total}: {need}. Picked {tool} out of {options}.',
    controls: 'Animation playback',
    prevCase: 'Previous job',
    nextCase: 'Next job',
    capabilities: 'Capabilities',
    jobsCount: '{count} of {total} jobs covered',
  },
  agentMind: {
    stylised: 'Stylised simulation · no model is called',
    idleHint: 'Pick a prompt and watch it think',
    illustration: 'Illustration: how the agent works through the selected prompt, from reading it to handing back the result',
    wholePlan: 'Whole plan',
    outcomeTitle: 'What comes back',
    underAttention: 'Now',
    beats: {
      parse: 'Reads what you asked for',
      select: 'Picks the right tools',
      tools: 'Works inside your apps',
      execute: 'Does the work',
      verify: 'Checks its own work',
      result: 'Hands back the outcome',
    },
  },
  hub: {
    wakes: 'Wakes',
  },
  getStarted: {
    replay: 'Replay the animation',
    stylised: 'Stylised illustration',
    v3: {
      agent: 'Your agent',
      lede: 'A few minutes of your day, once. Then it works around the clock while you live yours.',
      artLabel: 'Stylised 24-hour dial. On day one you spend a few minutes at 09:00: install Personas, say what you want, connect Gmail and Slack. Around the dial your day goes on: meetings, lunch, focus time, home, sleep. On the inner ring your agent runs on its own: at 11:20 and 15:45 when new emails land, at 02:10 overnight, and at 08:00 it posts the morning digest to Slack.',
      yours: 'Your few minutes',
      yoursLine: 'Once, on day one.',
      its: 'Its whole day',
      itsLine: 'Every run, on its own.',
      setup: { install: 'Install Personas', describe: 'Say what you want', connect: 'Connect Gmail and Slack' },
      day: 'Day {n}',
      dayParts: { coffee: 'Coffee', meetings: 'Meetings', lunch: 'Lunch', focus: 'Focus time', home: 'Home', asleep: 'Asleep' },
      triggers: { schedule: 'Schedule', email: 'New email' },
      runs: {
        client: 'Client email flagged in Slack',
        invoice: 'Invoice summarized in Slack',
        overnight: 'Overnight email queued for the digest',
        digest: 'Morning digest: 6 highlights posted',
      },
      onYourPc: 'On your PC',
    },
  },
};
