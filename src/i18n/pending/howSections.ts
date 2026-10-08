/**
 * Pending-translation copy: the `howSections` namespace, English only (docs/concepts/mobile-revival/PLAN.md M4, M22).
 *
 * It lives outside `en.ts` so that only the routes that render it bundle it: `en.ts` is imported by
 * every route through `useTranslation`. Components import `howSectionsCopy` from here directly; it works in
 * server and client components alike. To translate it, move the interface back into `Translations`
 * and the value into `en` (both in `src/i18n/en.ts`), translate it in the 13 locale files, delete
 * this module and point the consumers at `t.howSections`. See docs/features/platform/internationalization.md.
 */

export interface HowSectionsCopy {
  /** Scroll-map / mobile-TOC labels for the /how sections, in page order. */
  scrollMap: {
    forYou: string;
    timeline: string;
    chat: string;
    layers: string;
    manifesto: string;
    events: string;
  };
  /** The opening "Start here" section: pick a role, see your path through the page. */
  rolePath: {
    aria: string;
    eyebrow: string;
    heading: string;
    gradient: string;
    lede: string;
    pickLabel: string;
    routeLabel: string;
    jump: string;
    /** {role} is the role name. */
    announce: string;
    roles: {
      developer: { name: string; want: string };
      productManager: { name: string; want: string };
      enterprise: { name: string; want: string };
    };
    /** The four sections below, in page order, each with a line per role. */
    stops: {
      title: string;
      developer: string;
      productManager: string;
      enterprise: string;
    }[];
  };
  /** "Your agents. Your rules. Your infrastructure." with a proof under each line. */
  manifesto: {
    aria: string;
    eyebrow: string;
    lines: { agents: string; rules: string; infra: string };
    agents: { kicker: string; prompt: string; agent: string; ready: string };
    rules: { kicker: string; levels: string[]; note: string };
    infra: { kicker: string; device: string; agents: string; keys: string; cloud: string; never: string };
  };
  timeline: {
    heading: { lead: string; gradient: string; trailing: string };
    stylised: string;
    replay: string;
    pause: string;
    resume: string;
    scenariosLabel: string;
    showScenario: string;
    /** The five live race scenarios: rule steps end with the stall stamp. */
    scenarios: {
      name: string;
      trigger: string;
    }[];
    v3: {
      lede: string;
      artLabel: string;
      start: string;
      finish: string;
      rails: string;
      route: string;
      stalled: string;
      announce: string;
      cases: { snag: string; wait: string; waypoints: string[]; result: string }[];
    };
  };
  chat: {
    aria: string;
    heading: string;
    gradient: string;
    lede: string;
    stylised: string;
    customer: string;
    scripted: string;
    agent: string;
    pickLabel: string;
    pause: string;
    resume: string;
    replay: string;
    inSeconds: string;
    scenarios: {
      name: string;
      message: string;
      scripted: string[];
      agent: string[];
      scriptedOutcome: string;
      agentOutcome: string;
    }[];
    v1: {
      artLabel: string;
      scriptedMode: string;
      agentMode: string;
      clock: string;
      resolved: string;
      unresolved: string;
      rating: string;
    };
  };
  layers: {
    eyebrow: string;
    heading: string;
    headingGradient: string;
    headingTrailing: string;
    stylised: string;
    names: { run: string; coordinate: string; design: string; monitor: string };
    v2: {
      lede: string;
      artLabel: string;
      scrubLabel: string;
      play: string;
      pause: string;
      agent: string;
      agents: string;
      sameLaptop: string;
      ledgerLabel: string;
      prompt: string;
      healed: string;
      stops: { when: string; what: string }[];
      layerLines: { run: string; coordinate: string; design: string; monitor: string };
    };
  };
  events: {
    heading: string;
    headingGradient: string;
    description: string;
    v1: {
      illustration: string;
      tabsLabel: string;
      tabLive: string;
      tabLiveHint: string;
      tabLanes: string;
      tabLanesHint: string;
      hub: string;
      inFlight: string;
      waiting: string;
      typical: string;
      perSecond: string;
      delivery: string;
      backlog: string;
      buildFlow: string;
      /** Keyed by the hub route id (gmail-jira, slack-drive, ...). */
      routes: Record<string, string>;
    };
  };
}

export const howSectionsCopy: HowSectionsCopy = {
  scrollMap: {
    forYou: 'START HERE',
    timeline: 'AGENTS: TIMELINE',
    chat: 'AGENTS: CHAT',
    layers: 'PLATFORM: LAYERS',
    manifesto: 'WHAT STAYS YOURS',
    events: 'EVENTS',
  },
  rolePath: {
    aria: 'Start here: how Personas works for you',
    eyebrow: 'Start here',
    heading: 'How Personas works',
    gradient: 'for you',
    lede: 'Tell us who you are. We\'ll show you the four things on this page that matter most to you, and why.',
    pickLabel: 'I am a',
    routeLabel: 'Your path through this page',
    jump: 'Take me there',
    announce: 'Showing the path for {role}.',
    roles: {
      developer: { name: 'Developer', want: 'I build and automate things' },
      productManager: { name: 'Product manager', want: 'I want work to move without chasing it' },
      enterprise: { name: 'Enterprise', want: 'I need it safe, visible and ready to scale' },
    },
    stops: [
      {
        title: 'Rules break, agents adapt',
        developer: 'Stop writing a new if-statement for every edge case. An agent reads the request and finds its own way through.',
        productManager: 'Messy, real-world requests stop stalling in a queue. Work keeps moving even when the case is new.',
        enterprise: 'Fewer odd cases dropped on a person at 2 a.m. Agents handle them and tell you what they did.',
      },
      {
        title: 'Same message, different intelligence',
        developer: 'See why an agent beats a scripted bot on the exact message that breaks your flowchart.',
        productManager: 'Watch one customer message get a real answer instead of a hand-off. That is the experience you ship.',
        enterprise: 'Same customers, fewer escalations: a script and an agent side by side, on one clock.',
      },
      {
        title: 'Built to grow with you',
        developer: 'Start with one agent on your laptop. Add more when you need them, without rewriting what works.',
        productManager: 'Begin with one task this week and grow into a team of agents as the wins pile up.',
        enterprise: 'Go from a pilot to a fleet with monitoring at every step, so you always see what is running.',
      },
      {
        title: 'Agents that talk to each other',
        developer: 'Chain agents with events instead of glue code: one finishes, the next picks up.',
        productManager: 'Hand-offs between tools happen on their own. A new email can become a ticket and a team update.',
        enterprise: 'Connect the tools your teams already use, and keep every hand-off traceable.',
      },
    ],
  },
  manifesto: {
    aria: 'What stays yours',
    eyebrow: 'What stays yours',
    lines: { agents: 'Your agents.', rules: 'Your rules.', infra: 'Your infrastructure.' },
    agents: {
      kicker: 'Designed in plain words',
      prompt: '\u201CEvery Monday, sum up last week\'s support tickets and post the highlights for the team.\u201D',
      agent: 'Weekly ticket digest',
      ready: 'Ready to run',
    },
    rules: {
      kicker: 'You decide how far they go',
      levels: ['Ask me first', 'Act, then tell me', 'Act on its own'],
      note: 'Set it per agent. Change it any time.',
    },
    infra: {
      kicker: 'Runs on your machine',
      device: 'Your computer',
      agents: 'Your agents',
      keys: 'Your keys',
      cloud: 'Anyone else',
      never: 'Keys never leave it',
    },
  },
  timeline: {
    heading: { lead: 'The', gradient: 'Race', trailing: ' Is Already Over' },
    stylised: 'Stylised',
    replay: 'Replay',
    pause: 'Pause',
    resume: 'Resume',
    scenariosLabel: 'Scenarios',
    showScenario: 'Show scenario {n}: {name}',
    scenarios: [
      {
        name: 'Ambiguous email',
        trigger: '"Cancel my order... actually, change the address instead."',
      },
      {
        name: 'Split payment refund',
        trigger: 'A refund for an item paid with a gift card and a credit card.',
      },
      {
        name: 'Staging setup',
        trigger: '"Set up staging just like production, with debug logging on."',
      },
      {
        name: 'Error recovery',
        trigger: 'The payment server goes down in the middle of 200 payments.',
      },
      {
        name: 'VIP legacy discount',
        trigger: 'A VIP asks for a discount but already has a special rate from 2023.',
      },
    ],
    v3: {
      lede: 'Rules run on rails: fast until something blocks the track. An agent sees the snag, finds a way around it and still arrives.',
      artLabel: 'A stylised map: a train on fixed rails stops at a blocked track while an agent\'s route bends around the snag to the same destination.',
      start: 'Request in',
      finish: 'Done',
      rails: 'Fixed rules',
      route: 'Agent',
      stalled: 'Stalled',
      announce: '{name}. Fixed rules: stalled at "{snag}", {wait} Agent: {result}',
      cases: [
        {
          snag: 'Two requests in one email',
          wait: 'waits 47 minutes for a person.',
          waypoints: ['Reads the whole message', 'Spots the real request', 'Updates the address', 'Confirms with the customer'],
          result: 'Address updated.',
        },
        {
          snag: 'Paid with two cards',
          wait: 'waits 3 days for finance.',
          waypoints: ['Splits $40 / $60', 'Refunds the gift card', 'Refunds the credit card', 'Tells the customer'],
          result: 'Both refunds sent.',
        },
        {
          snag: '12 services need hand edits',
          wait: 'half done, 6 services broken.',
          waypoints: ['Lists all 12 services', 'Copies each with debugging', 'Deploys and checks each', 'Confirms all 12 work'],
          result: 'Staging ready.',
        },
        {
          snag: 'Server down at payment 148',
          wait: '147 good payments undone.',
          waypoints: ['Saves progress at 147', 'Waits, then retries', 'Server is back', 'Finishes the rest'],
          result: 'All 200 payments done.',
        },
        {
          snag: 'Already has a special rate',
          wait: 'request denied.',
          waypoints: ['Compares old and new rates', 'Sees 22% beats 15%', 'Writes a personal reply', 'Adds a loyalty perk'],
          result: 'Better rate kept, perk added.',
        },
      ],
    },
  },
  chat: {
    aria: 'The same customer message answered by a scripted bot and by an agent',
    heading: 'Same Message,',
    gradient: 'Different Intelligence',
    lede: 'Same customer message, two very different experiences. See why intelligence matters more than rules.',
    stylised: 'Stylised',
    customer: 'Customer',
    scripted: 'Scripted bot',
    agent: 'Agent',
    pickLabel: 'Pick a customer message',
    pause: 'Pause auto-play',
    resume: 'Resume auto-play',
    replay: 'Replay',
    inSeconds: 'in {n} s',
    scenarios: [
      {
        name: 'Changed mind',
        message: 'Cancel my order #4821… actually, never mind, just change the shipping address to 742 Evergreen Terrace.',
        scripted: [
          'Processing cancellation for order #4821.',
          'Order found. Cancellation started.',
          'Warning: conflicting instructions detected.',
          'I can only handle one request at a time.',
          'Transferred to our team. Expected wait: 47 minutes.',
        ],
        agent: [
          'You changed your mind, so I\'ll keep the order and change the address.',
          'Updating order #4821 to 742 Evergreen Terrace.',
          'Done. It ships to the new address tomorrow.',
        ],
        scriptedOutcome: 'Waiting for a human · 47 min',
        agentOutcome: 'Address changed',
      },
      {
        name: 'Split refund',
        message: 'Refund order #7733. I paid $40 by gift card and $60 by Visa.',
        scripted: [
          'Looking up order #7733.',
          'Refunding to the original payment method.',
          'Error: two payment methods found.',
          'I can\'t split refunds. Creating a ticket.',
          'Sent to finance. About 3 business days.',
        ],
        agent: [
          'Two payment methods, so I\'ll split the refund.',
          '$40 back to your gift card.',
          '$60 back to your Visa ending 4242.',
          'Done. Gift card now, Visa in 2-3 days.',
        ],
        scriptedOutcome: 'Sent to finance · 3 business days',
        agentOutcome: 'Both refunds sent',
      },
      {
        name: 'Staging setup',
        message: 'Set up staging like production, with debug logging on all 12 services.',
        scripted: [
          'Found the “create environment” template.',
          'Production copied. Applying the debug flag.',
          'Warning: 12 services each need their own change.',
          'Error: 47 possible paths. I can\'t decide.',
          'Half done. 6 of 12 services are broken.',
        ],
        agent: [
          'I\'ll list all 12 services first, then change each one.',
          'Cloning every config with debug logging on.',
          'Deploying one by one, health-checking each.',
          'All 12 services live and healthy.',
        ],
        scriptedOutcome: 'Half done · 6 services broken',
        agentOutcome: 'Staging live and healthy',
      },
      {
        name: 'Batch recovery',
        message: 'The payment API threw a 503 halfway through 200 transactions. Fix it.',
        scripted: [
          '147 of 200 transactions processed.',
          'Error: #148 failed. Retrying, 1 of 3.',
          'Error: all 3 retries failed.',
          'Rolling back all 200, even the 147 that worked.',
          'Failed. Someone must redo it by hand.',
        ],
        agent: [
          'The server is briefly down. Saving progress at #147.',
          'Waiting a moment before retrying #148.',
          'Provider is back. Resuming from #148.',
          'All 200 processed. Nothing lost.',
        ],
        scriptedOutcome: 'All 200 undone · redo by hand',
        agentOutcome: 'All 200 done, nothing lost',
      },
    ],
    v1: {
      artLabel: 'Stylised: one customer message forks into two conversations on one clock, a scripted bot on the left and an agent on the right',
      scriptedMode: 'follows a script',
      agentMode: 'understands the ask',
      clock: 'one clock',
      resolved: 'Resolved',
      unresolved: 'Not resolved',
      rating: 'Customer rating: {n} of 5',
    },
  },
  layers: {
    eyebrow: 'How It\'s Built',
    heading: 'Built to',
    headingGradient: 'grow',
    headingTrailing: ' with you',
    stylised: 'Stylised',
    names: { run: 'Run', coordinate: 'Coordinate', design: 'Design', monitor: 'Monitor' },
    v2: {
      lede: 'Start with one helper. A year later, run forty. Same computer, same four layers, nothing new to set up.',
      artLabel: 'Stylised growth scene: agents multiply above one laptop, from a single helper on day one to a fleet of forty after a year, while the laptop underneath stays the same.',
      scrubLabel: 'How far you have grown',
      play: 'Play',
      pause: 'Pause',
      agent: 'agent',
      agents: 'agents',
      sameLaptop: 'Same laptop. No servers.',
      ledgerLabel: 'What carries it',
      prompt: 'Draft the weekly report',
      healed: 'healed',
      stops: [
        { when: 'Day 1', what: 'One helper' },
        { when: 'Week 2', what: 'A chain' },
        { when: 'Month 3', what: 'A team' },
        { when: 'Year 1', what: 'A fleet' },
      ],
      layerLines: {
        run: 'Runs on your computer',
        coordinate: 'One event starts the next',
        design: 'Agents from plain words',
        monitor: 'Watches and heals itself',
      },
    },
  },
  events: {
    heading: 'Agents that',
    headingGradient: 'talk to each other',
    description: 'Your agents share what they finish through one hub. When one is done, the next one starts on its own, with no hand-off from you.',
    v1: {
      illustration: 'Stylised diagram: connected tools send messages into one hub, which passes each one on to the tool or agent that needs it',
      tabsLabel: 'Message hub view',
      tabLive: 'Live connections',
      tabLiveHint: 'who talks to whom',
      tabLanes: 'Performance view',
      tabLanesHint: 'speed and backlog',
      hub: 'Message hub',
      inFlight: 'being sent',
      waiting: 'waiting',
      typical: 'typical delivery',
      perSecond: 'msgs/s',
      delivery: 'delivery',
      backlog: 'waiting',
      buildFlow: 'Try it yourself: build a flow',
      routes: {
        'gmail-jira': 'New email → ticket filed',
        'slack-drive': 'Slack thread → summary saved',
        'github-figma': 'Pull request → design check',
        'calendar-stripe': 'Meeting ends → invoice sent',
      },
    },
  },
};
