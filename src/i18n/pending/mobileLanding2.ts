/**
 * Pending-translation copy: the `mobileLanding2` namespace, English only (docs/concepts/mobile-revival/PLAN.md M4, M22).
 *
 * It lives outside `en.ts` so that only the routes that render it bundle it: `en.ts` is imported by
 * every route through `useTranslation`. Components import `mobileLanding2Copy` from here directly; it works in
 * server and client components alike. To translate it, move the interface back into `Translations`
 * and the value into `en` (both in `src/i18n/en.ts`), translate it in the 13 locale files, delete
 * this module and point the consumers at `t.mobileLanding2`. See docs/features/platform/internationalization.md.
 */

/** /m2 "Around the Clock" phone landing (English only until launch; decision M4/M5). */
export interface MobileLanding2Copy {
  meta: { title: string; description: string };
  chrome: {
    chipAria: string;
    /** Day one, Every tool, While you sleep, All day, Ask the dial, Tomorrow. */
    chapters: string[];
    railLabel: string;
    rail: string[];
    stylized: string;
    scroll: string;
    pillGo: string;
    pillRemind: string;
    themeLabel: string;
  };
  dial: {
    aria: string;
    fixedAria: string;
    dayParts: Record<"asleep" | "coffee" | "meet" | "lunch" | "focus" | "home", string>;
    bill: string;
  };
  hero: {
    label: string;
    lines: string[];
    sub: string;
    legend: string;
    stepAria: string;
    steps: { name: string; body: string[] }[];
  };
  tools: {
    label: string;
    lines: string[];
    personaAria: string;
    personaTitle: string;
    personaSub: string;
    jobsAria: string;
    shift: string;
    beadAria: string;
    items: Record<
      "gmail" | "slack" | "github" | "drive" | "jira" | "notion" | "stripe",
      { name: string; jobs: { title: string; chip?: string; body: string }[] }
    >;
  };
  athena: {
    label: string;
    lines: string[];
    sub: string;
    imgAlt: string;
    momsAria: string;
    momTime: string;
    momAria: string;
    bubble: string;
    moments: { name: string; body: string; line: string }[];
  };
  price: {
    label: string;
    lines: string[];
    zero: string;
    sub: string;
    nodesAria: string;
    beats: string[];
    nodeAria: string;
    nodes: { name: string; short: string; body: string[] }[];
  };
  runs: {
    aria: string;
    kicker: string;
    items: { title: string; trigger: string; body: string[] }[];
  };
  faq: {
    kick: string;
    lines: string[];
    labels: string[];
    of: string;
    count: string;
    prev: string;
    next: string;
    dialAria: string;
    items: { q: string; a: string[] }[];
  };
  cta: {
    kick: string;
    lines: string[];
    sub: string;
    faces: string[];
    remind: string;
    remindFine: string;
    platsAria: string;
    plats: Record<"windows" | "macos" | "linux", { name: string; note: string }>;
    sendTitle: string;
    sendNote: string;
    copy: string;
    share: string;
    manual: string;
    waitlistTitle: string;
    waitlistNote: string;
    emailLabel: string;
    emailPlaceholder: string;
    join: string;
    joining: string;
    joined: string;
    already: string;
    need: string;
    /** The Windows button note while no installer is live (DOWNLOAD_PLAN). */
    platWaitlist: string;
  };
  share: { title: string; text: string };
  toast: { copied: string; shared: string; reminder: string; reminderFailed: string };
  ics: { title: string; description: string; file: string };
  card: {
    back: string;
    note: string;
    jobKicker: string;
    jobExtra: string;
    stepKicker: string;
    momentNote: string;
    nodeKicker: string;
    nodeNote: string;
    persona: { kicker: string; title: string; body: string[] };
  };
  footer: { facts: string; stylized: string };
}

export const mobileLanding2Copy: MobileLanding2Copy = {
  meta: {
    title: 'Say it once, it works all day',
    description: 'Personas is a free desktop app: describe an AI agent in plain words and it works around the clock on your own computer.',
  },
  chrome: {
    chipAria: 'Back to the start of the day',
    chapters: ['Day one', 'Every tool', 'While you sleep', 'All day', 'Ask the dial', 'Tomorrow'],
    railLabel: 'Chapters of the day',
    rail: [
      'Day one, 09:00',
      'One persona, every tool, 09:30 to 17:00',
      'While you sleep, Athena, 22:00',
      'All day, free',
      'Ask the dial, questions',
      'Tomorrow 9:00, get it on your computer',
    ],
    stylized: 'Stylized day',
    scroll: 'Scroll',
    pillGo: 'Get it on your computer',
    pillRemind: 'Add a 9:00 reminder',
    themeLabel: 'Theme',
  },
  dial: {
    aria: 'Stylized 24-hour dial. On day one you spend a few minutes at 09:00: install Personas, say what you want, connect Gmail and Slack. Around the dial your day goes on: meetings, lunch, focus time, home, sleep. On the inner ring your agent runs on its own: at 11:20 and 15:45 when new emails land, at 02:10 overnight, and at 08:00 it posts the morning digest to Slack.',
    fixedAria: 'Free all day: Personas on your computer, Claude Code, Anthropic',
    dayParts: { asleep: 'Asleep', coffee: 'Coffee', meet: 'Meetings', lunch: 'Lunch', focus: 'Focus time', home: 'Home' },
    bill: 'Your Claude plan',
  },
  hero: {
    label: 'Day one',
    lines: ['Say it once.', 'It works', 'all day.'],
    sub: 'Describe an AI agent in plain words. It runs on your own computer, free.',
    legend: 'Your few minutes, once, on day one.',
    stepAria: 'Step {n}: {name}',
    steps: [
      {
        name: 'Install Personas',
        body: [
          'A free installer for Windows, about 12 MB. macOS and Linux are on a waitlist.',
          'No account and no license key. Personas needs Claude Code on your own Claude Pro or Max plan.',
        ],
      },
      {
        name: 'Say what you want',
        body: [
          'Describe an AI agent in plain words. A persona is one agent with its own name, memory and tools.',
          'It keeps that name, icon and color, and you can add tools to it whenever you like.',
        ],
      },
      {
        name: 'Connect Gmail and Slack',
        body: ['Pick the tools it may use. Gmail and Slack first; GitHub, Google Drive, Jira, Notion, Stripe and more when you want them.'],
      },
    ],
  },
  tools: {
    label: 'One persona, every tool',
    lines: ['One persona.', 'Every tool.'],
    personaAria: 'Chief of staff: keeps your inbox, channels, repos and calendar moving. Open details.',
    personaTitle: '{tool} adds 3 jobs',
    personaSub: 'to Chief of staff: same name, icon and color',
    jobsAria: 'Jobs the persona does in this tool',
    shift: '{time} shift',
    beadAria: '{tool}, {time} shift. Jump to it.',
    items: {
      gmail: {
        name: 'Gmail',
        jobs: [
          { title: 'Inbox triage', body: 'Labels, prioritizes and drafts replies for inbound email.' },
          { title: 'Follow-up reminders', chip: 'Follow-ups', body: 'Spots unanswered threads and sends gentle follow-ups.' },
          { title: 'Meeting prep', body: 'Reads upcoming invites, pulls the threads, summarizes context.' },
        ],
      },
      slack: {
        name: 'Slack',
        jobs: [
          { title: 'Channel summarizer', body: 'Digests long channels into a morning summary for you.' },
          { title: 'Standup collector', body: 'Asks each teammate for status and compiles one standup post.' },
          { title: 'Alert router', body: 'Triages incoming alerts and escalates to the right channel.' },
        ],
      },
      github: {
        name: 'GitHub',
        jobs: [
          { title: 'PR reviewer', body: 'Reviews pull requests for bugs, style and missing tests.' },
          { title: 'Issue groomer', body: 'Labels stale issues, asks for more info, suggests duplicates.' },
          { title: 'Release notes', body: 'Writes changelog entries from merged PRs, grouped by impact.' },
        ],
      },
      drive: {
        name: 'Google Drive',
        jobs: [
          { title: 'Doc organizer', body: 'Files documents into folders by content, project and owner.' },
          { title: 'Permissions auditor', body: 'Weekly scan of shared files: flags over-shared docs.' },
          { title: 'Content indexer', body: 'Builds a searchable knowledge base from scattered documents.' },
        ],
      },
      jira: {
        name: 'Jira',
        jobs: [
          { title: 'Sprint planner', body: "Reads velocity history and suggests next sprint's allocation." },
          { title: 'Blocker detector', body: 'Watches ticket dependencies and alerts on a stuck critical path.' },
          { title: 'Status syncer', body: 'Keeps Jira tickets in sync with GitHub PRs.' },
        ],
      },
      notion: {
        name: 'Notion',
        jobs: [
          { title: 'Meeting notes', body: 'Transcribes recordings, extracts action items, links the pages.' },
          { title: 'Wiki gardener', body: 'Finds outdated docs, suggests updates, archives unused pages.' },
          { title: 'Template filler', body: 'Fills project brief templates from intake form responses.' },
        ],
      },
      stripe: {
        name: 'Stripe',
        jobs: [
          { title: 'Payment recovery', body: 'Emails customers with failed charges: retry links, other methods.' },
          { title: 'Revenue alerting', body: 'Watches MRR changes and tells Slack when churn spikes or upgrades surge.' },
          { title: 'Invoice reconciler', body: 'Matches Stripe payouts against your accounting and flags gaps.' },
        ],
      },
    },
  },
  athena: {
    label: 'While you sleep, Athena keeps watch',
    lines: ['While you sleep,', 'she keeps watch.'],
    sub: 'Athena is a companion that floats on your desktop: hold it to talk, it remembers how you work, and it reaches out first.',
    imgAlt: 'Athena, the Personas companion: a luminous portrait with a glowing heart',
    momsAria: 'What Athena does',
    momTime: '{time} · Athena',
    momAria: '{time}, {name}',
    bubble: 'Heads up: 3 runs failed overnight.',
    moments: [
      {
        name: 'Always on, never in the way',
        body: 'A floating companion lives on your desktop, and her animated face is the interface. Drag it anywhere; it survives restarts and quietly pauses when you look away.',
        line: "I'm right here whenever you need me.",
      },
      {
        name: 'Hold to talk',
        body: 'Press and hold to speak: voice in, voice out. Runs on-device with local Whisper, or in your browser. No chat window required.',
        line: "Hold to talk, I'm listening.",
      },
      {
        name: 'Remembers what matters',
        body: "Athena keeps a long-term memory of your identity, goals, and how you work, and you're the editor. She never overwrites; every change is yours to approve.",
        line: 'I remember your goals and how you work.',
      },
      {
        name: 'Reaches out first',
        body: 'She surfaces what needs you (a goal due soon, an aging backlog, runs that failed overnight) and can even schedule her own check-ins.',
        line: 'Heads up: 3 runs failed overnight.',
      },
    ],
  },
  price: {
    label: 'All day, free',
    lines: ['All day.', 'Free.'],
    zero: '$0',
    sub: 'No account, no license key. You only pay for your own Claude plan.',
    nodesAria: 'Where a run goes',
    beats: ['Run starts', 'On your plan', 'Claude works', 'No bill from Personas'],
    nodeAria: '{name}. Open details.',
    nodes: [
      {
        name: 'Your computer',
        short: 'Personas, $0',
        body: [
          'Personas runs here, on your computer: the app, its MIT-licensed source and every feature are free.',
          'No account and no license key. Your agents and run history stay on this machine unless you turn on cloud sync, and your credentials never leave it.',
        ],
      },
      {
        name: 'Claude Code',
        short: 'Runs the agent',
        body: [
          'Claude Code is the command-line tool that runs your agents on your own Claude Pro or Max plan.',
          'Personas hands the run to it. You need Claude Code installed before you launch Personas.',
        ],
      },
      {
        name: 'Anthropic',
        short: "Your plan's bill",
        body: [
          'Claude does the work at Anthropic, and Anthropic bills your Claude Pro or Max plan.',
          'That is the only bill. Personas never touches it. Your prompts go to the AI provider you run, which is Claude via Anthropic.',
        ],
      },
    ],
  },
  runs: {
    aria: '{time}, {title}. Open details.',
    kicker: '{time} · {trigger} · On your PC',
    items: [
      { title: 'Client email flagged in Slack', trigger: 'New email', body: ['A new email lands at 11:20. The agent reads it, sees it is from a client, and flags it in Slack.', 'You did nothing. It runs on your PC.'] },
      { title: 'Invoice summarized in Slack', trigger: 'New email', body: ['An invoice arrives by email at 15:45. The agent summarizes it and posts the summary in Slack.', 'It runs on your PC.'] },
      { title: 'Overnight email queued for the digest', trigger: 'New email', body: ['While you sleep, an email arrives at 02:10. The agent queues it for the morning digest.', 'Nothing needs you yet. It runs on your PC.'] },
      { title: 'Morning digest: 6 highlights posted', trigger: 'Schedule', body: ['On a schedule, at 08:00, the agent posts the morning digest to Slack: six highlights.', 'It runs on your PC.'] },
    ],
  },
  faq: {
    kick: 'Questions',
    lines: ['Ask', 'the dial.'],
    labels: ['Claude Code', 'Telemetry', 'Free?', 'Limits'],
    of: 'of {n}',
    count: '{i} / {n}',
    prev: 'Previous question',
    next: 'Next question',
    dialAria: 'Question dial',
    items: [
      {
        q: 'What is Claude Code and why do I need it?',
        a: [
          "Claude Code is Anthropic's official command-line tool for working with Claude. Personas uses it under the hood to run your agents locally. It handles authentication, model access, and streaming responses.",
          "You'll need an active Claude Pro or Max subscription and Claude Code installed before launching Personas.",
        ],
      },
      {
        q: 'Does Personas collect any telemetry or usage data?',
        a: [
          'Only anonymous diagnostics. Release builds of the desktop app send error reports and anonymous usage signals (app sessions, which sections you open, key actions) to Sentry.',
          'IP addresses, emails, and usernames are stripped first, and your prompts, agent configurations, credentials, and execution logs are never included.',
          'You can turn off usage signals in Settings > Account.',
        ],
      },
      {
        q: 'Is Personas free?',
        a: [
          'Yes. The desktop app is free and open source, with unlimited local agents.',
          'You need your own Claude subscription, and we never touch your Anthropic bill. Think of Personas as the conductor, and Claude as the engine.',
        ],
      },
      { q: 'Are there any limits on the number of agents?', a: ['No. Create as many agents as you want.'] },
    ],
  },
  cta: {
    kick: 'One last thing',
    lines: ['Tomorrow, 9:00,', 'at your computer.'],
    sub: 'A phone cannot install Personas, so book it. Three steps, a few minutes, once.',
    faces: ['Install', 'Connect Claude Code', 'Launch your first agent'],
    remind: 'Put 9:00 in my calendar',
    remindFine: 'Saves a calendar file for the next 9:00, with the link and the three steps. Nothing is uploaded.',
    platsAria: 'Your computer',
    plats: {
      windows: { name: 'Windows', note: 'Installer, about 12 MB' },
      macos: { name: 'macOS', note: 'Waitlist' },
      linux: { name: 'Linux', note: 'Waitlist' },
    },
    sendTitle: 'Send the link to your computer',
    sendNote: 'Share it to yourself, or copy it, and open it on your PC to download the installer.',
    copy: 'Copy link',
    share: 'Share',
    manual: 'Copy this link by hand and open it on your computer:',
    waitlistTitle: 'Join the {platform} waitlist',
    waitlistNote: 'One email when Personas for {platform} is ready. Nothing else.',
    emailLabel: 'Your email',
    emailPlaceholder: 'you@example.com',
    join: 'Join waitlist',
    joining: 'Joining...',
    joined: "You're on the {platform} waitlist.",
    already: 'That address is already on the {platform} waitlist.',
    need: 'Requires Claude Code and your own Claude Pro or Max plan.',
    platWaitlist: 'Waitlist',
  },
  share: {
    title: 'Personas',
    text: 'Install Personas on my computer',
  },
  toast: {
    copied: 'Link copied',
    shared: 'Link shared',
    reminder: 'Reminder saved for {day}, 9:00',
    reminderFailed: 'Could not create the calendar file here',
  },
  ics: {
    title: 'Install Personas on my computer',
    description: 'Install Personas (free) on your computer: {url}\n\n1. Install Personas (Windows installer, about 12 MB)\n2. Connect Claude Code\n3. Launch your first agent\n\nNeeds Claude Code on your own Claude Pro or Max plan.',
    file: 'install-personas-9am.ics',
  },
  card: {
    back: 'Back to the dial',
    note: 'Stylized day: the times are an illustration, not a product claim.',
    jobKicker: '{tool} · {time} shift',
    jobExtra: 'One more job for Chief of staff. Same name, same icon, same color: connecting {tool} only adds jobs.',
    stepKicker: '{time} · Your few minutes, once',
    momentNote: 'Athena is a companion that floats on your desktop. Her portrait is the only real product image on this page.',
    nodeKicker: 'Where a run goes · {n} of 3',
    nodeNote: 'Stylized illustration of where a run goes. Personas is free: the only bill is your own Claude Pro or Max plan, paid to Anthropic.',
    persona: {
      kicker: 'One persona',
      title: 'Chief of staff',
      body: [
        'Keeps your inbox, channels, repos and calendar moving.',
        'A persona is one agent with its own name, memory and tools. This one keeps the same name, the same icon and the same color through every tool. Connecting a tool only adds jobs to this one persona.',
      ],
    },
  },
  footer: {
    facts: 'Personas is free and open source (MIT), with no account and no license key. Agents and run history stay on your computer unless you turn on optional cloud sync, credentials never leave it, and prompts go to the AI provider you run, Claude via Anthropic. The app sends minimal, anonymous error and usage signals, and you can switch usage signals off in Settings.',
    stylized: 'The clock, its times and the day around it are a stylized illustration, not a product claim. Athena\'s portrait is the only real product image on this page.',
  },
};
