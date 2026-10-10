/**
 * Pending-translation copy: the `mobileLanding` namespace, English only (docs/concepts/mobile-revival/PLAN.md M4, M22).
 *
 * It lives outside `en.ts` so that only the routes that render it bundle it: `en.ts` is imported by
 * every route through `useTranslation`. Components import `mobileLandingCopy` from here directly; it works in
 * server and client components alike. To translate it, move the interface back into `Translations`
 * and the value into `en` (both in `src/i18n/en.ts`), translate it in the 13 locale files, delete
 * this module and point the consumers at `t.mobileLanding`. See docs/features/platform/internationalization.md.
 */

/** /m phone landing, "Hive Reels" (src/components/mobile-landing/hive). English only until the designs settle (PLAN.md decision M4). */
export interface MobileLandingCopy {
  metaTitle: string;
  metaDescription: string;
  brand: string;
  brandHome: string;
  railLabel: string;
  back: string;
  chapters: string[];
  chapterLabel: string;
  illustrationTag: string;
  hero: {
    kicker: string;
    line1: string;
    line2a: string;
    line2b: string;
    sub: string;
    artLabel: string;
    pickLabel: string;
    events: { ev: string; done: string }[];
    trust: string;
  };
  useCases: {
    title: string;
    lede: string;
    needs: string[];
    reelLabel: string;
    tapHint: string;
    openJobs: string;
    driveShort: string;
    personaName: string;
    personaLine: string;
    jobsUnit: string;
    prev: string;
    next: string;
    replay: string;
    status: string;
    sheetLabel: string;
    adds: string;
    hop: string;
  };
  athena: {
    title: string;
    sub: string;
    lensLabel: string;
    portraitAlt: string;
    note: string;
    caps: Record<'always' | 'voice' | 'memory' | 'proactive', { label: string; blurb: string; line: string }>;
  };
  pricing: {
    title: string;
    sub: string;
    beats: string[];
    artLabel: string;
    replay: string;
    computer: string;
    zero: string;
    personas: string;
    license: string;
    cli: string;
    cliSub: string;
    anthropic: string;
    claude: string;
    planLines: string[];
    onlyBill: string;
  };
  faq: {
    title: string;
    tiles: string[];
    sheetLabel: string;
    index: string;
    prev: string;
    next: string;
  };
  cta: {
    title: string;
    sub: string;
    artLabel: string;
    platformsLabel: string;
    emailLabel: string;
    emailPlaceholder: string;
    hintWin: string;
    hintMac: string;
    hintLin: string;
    copyLink: string;
    reminder: string;
    reminderLabel: string;
    steps: string[];
    fine: string;
    go: string;
    goLabel: string;
    send: string;
    sendSub: string;
    shared: string;
    copied: string;
    sentSub: string;
    join: string;
    joinSub: string;
    joining: string;
    joined: string;
    alreadyJoined: string;
    toastCopied: string;
    toastShared: string;
    manual: string;
    manualLabel: string;
    reminderToast: string;
    reminderFail: string;
    reminderTitle: string;
    reminderBody: string;
    shareTitle: string;
    shareText: string;
    /** The Windows hint while no installer is live (DOWNLOAD_PLAN): it is on the waitlist too. */
    hintWaitlist: string;
  };
}

export const mobileLandingCopy: MobileLandingCopy = {
  metaTitle: 'Design AI agents, run them on your computer',
  metaDescription: 'Personas is a free desktop app for designing AI agents in plain words and running them on your own computer. See how it works, then send the link to your computer.',
  brand: 'Personas',
  brandHome: 'Personas, back to the start',
  railLabel: 'Chapters',
  back: 'Back',
  chapters: ['Intro', 'Use cases', 'Athena', 'Free', 'Questions', 'Get it'],
  chapterLabel: 'Chapter {n}: {name}',
  illustrationTag: 'Stylized illustration',
  hero: {
    kicker: 'Free desktop app for AI agents',
    line1: 'One event in.',
    line2a: 'A whole team',
    line2b: 'on it.',
    sub: "Describe an AI agent in plain words. It runs on your own computer, and it's free.",
    artLabel: 'Animated illustration: events fall onto a honeycomb of AI agents, ripple through a team of cells, and rise again as finished work.',
    pickLabel: 'Pick an event and watch the team work',
    events: [
      { ev: 'Invoice in', done: 'Booked' },
      { ev: 'New lead', done: 'Qualified' },
      { ev: 'Build failed', done: 'Fixed' },
    ],
    trust: 'Free. No account. Runs on your computer.',
  },
  useCases: {
    title: 'One persona, many tools.',
    lede: 'A persona is one agent with its own name, memory and tools.',
    needs: ['Write to a client', 'Keep meeting notes', 'Book the follow-up', 'Track the tasks', 'Review the code', 'Chase a failed payment'],
    reelLabel: 'Tool reel: each job lands on the right tool',
    tapHint: 'Tap for its jobs',
    openJobs: 'Open the {tool} jobs',
    driveShort: 'Drive',
    personaName: 'Chief of staff',
    personaLine: 'Same name, same icon, same color through every tool.',
    jobsUnit: 'jobs',
    prev: 'Previous job',
    next: 'Next job',
    replay: 'Replay this job',
    status: 'Job {n} of 6: {need}. Picked {tool} out of 9.',
    sheetLabel: 'Tool jobs',
    adds: '{tool} adds 3 jobs to Chief of staff',
    hop: 'Hop to another tool',
  },
  athena: {
    title: 'Meet Athena, always on.',
    sub: 'A glowing companion that floats on your computer. Hold it to talk. It remembers how you work, and it reaches out before you ask.',
    lensLabel: 'Athena. Press and hold to talk (a demo: this page uses no microphone)',
    portraitAlt: 'Athena, the Personas companion',
    note: 'Press and hold her portrait to talk. A demo: this page uses no microphone.',
    caps: {
      always: { label: 'Always on', blurb: 'Her animated face is the interface. Drag her anywhere; she survives restarts and quietly pauses when you look away.', line: "I'm right here whenever you need me." },
      voice: { label: 'Hold to talk', blurb: 'Press and hold to speak: voice in, voice out. It runs on your computer with local Whisper, so no chat window is needed.', line: "Hold to talk. I'm listening." },
      memory: { label: 'Remembers', blurb: 'She keeps a long-term memory of your goals and how you work. You are the editor: she never overwrites, and every change is yours to approve.', line: 'I remember your goals and how you work.' },
      proactive: { label: 'Reaches out first', blurb: 'She surfaces what needs you, like a goal due soon or runs that failed overnight, and can even schedule her own check-ins.', line: 'Heads up: 3 runs failed overnight.' },
    },
  },
  pricing: {
    title: 'Personas is free.',
    sub: 'No account, no license key. The app and its open-source code cost nothing. You only pay for your own Claude Pro or Max plan.',
    beats: ['Run starts', 'On your plan', 'Claude works', 'No bill from Personas'],
    artLabel: 'An agent run leaves Personas on your computer, passes the Claude Code CLI and reaches Claude at Anthropic. Personas is tagged $0 with an MIT license; the only payment line runs from your Claude Pro or Max plan to Anthropic.',
    replay: 'Replay',
    computer: 'Your computer',
    zero: '$0',
    personas: 'Personas',
    license: 'MIT license',
    cli: 'Claude Code',
    cliSub: 'CLI',
    anthropic: 'Anthropic',
    claude: 'Claude',
    planLines: ['Your Claude', 'Pro or Max', 'plan'],
    onlyBill: 'The only bill',
  },
  faq: {
    title: 'Questions, answered.',
    tiles: ['What is Claude Code, and why do I need it?', 'Does Personas collect usage data?', 'Is Personas free?', 'Is there a limit on agents?'],
    sheetLabel: 'Answer',
    index: 'Question {n} of {total}',
    prev: 'Previous',
    next: 'Next',
  },
  cta: {
    title: 'Take it to your computer.',
    sub: "Personas is a desktop app, so this phone can't install it. Send yourself the link and finish in three steps.",
    artLabel: 'Stylized illustration: a phone sends a packet of light, the download link, to a computer.',
    platformsLabel: 'The computer you will install on',
    emailLabel: 'Your email',
    emailPlaceholder: 'you@example.com',
    hintWin: 'Windows has a free installer, about 12 MB. Send the link to yourself, then open it on your computer.',
    hintMac: 'macOS is on a waitlist for now. Leave your email and we will tell you when it is ready.',
    hintLin: 'Linux is on a waitlist for now. Leave your email and we will tell you when it is ready.',
    copyLink: 'Copy link',
    reminder: 'Add a reminder',
    reminderLabel: 'Download a calendar reminder (.ics) to install Personas on your computer',
    steps: ['Install', 'Connect Claude Code', 'Launch your first agent'],
    fine: 'Requires Claude Code. No signup, no credit card.',
    go: 'Get it on your computer',
    goLabel: 'Get it on your computer: jump to the last chapter',
    send: 'Send the link to my computer',
    sendSub: 'Share it or copy it, then open it there',
    shared: 'Link sent',
    copied: 'Link copied',
    sentSub: 'Open it on your computer',
    join: 'Join the {platform} waitlist',
    joinSub: 'No installer yet',
    joining: 'Joining...',
    joined: "You're on the {platform} waitlist",
    alreadyJoined: 'You were already on the {platform} waitlist',
    toastCopied: 'Link copied. Open it on your computer.',
    toastShared: 'Sent. Open it on your computer.',
    manual: "Copying isn't allowed here. Copy this link by hand:",
    manualLabel: 'The link to open on your computer',
    reminderToast: 'Reminder downloaded. Open it to add it to your calendar.',
    reminderFail: "Couldn't create the reminder file here.",
    reminderTitle: 'Install Personas on my computer',
    reminderBody: 'Open {url} on your computer. Personas is free; it needs Claude Code and your own Claude Pro or Max plan.',
    shareTitle: 'Personas',
    shareText: 'A free desktop app for designing AI agents in plain words. Open this on your computer.',
    hintWaitlist: 'The Windows installer is not out yet. Leave your email and we will tell you when it is ready.',
  },
};
