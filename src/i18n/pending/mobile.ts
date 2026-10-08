/**
 * Pending-translation copy: the `mobile` namespace, English only (docs/concepts/mobile-revival/PLAN.md M4, M22).
 *
 * It lives outside `en.ts` so that only the routes that render it bundle it: `en.ts` is imported by
 * every route through `useTranslation`. Components import `mobileCopy` from here directly; it works in
 * server and client components alike. To translate it, move the interface back into `Translations`
 * and the value into `en` (both in `src/i18n/en.ts`), translate it in the 13 locale files, delete
 * this module and point the consumers at `t.mobile`. See docs/features/platform/internationalization.md.
 */

/** Phone layouts of the dashboard: the command plane (/m revival phase 2, PHASE2-SPEC.md 4.3 + 6.2). */
export interface MobileCopy {
  personas: {
    title: string;
    loading: string;
    empty: string;
    error: string;
    retry: string;
    state: { running: string; paused: string; failed: string; idle: string };
    pausedRunning: string;
    pause: string;
    resume: string;
    pauseLabel: string;
    resumeLabel: string;
    openLabel: string;
    moreLabel: string;
    run: string;
    runTitle: string;
    runPromptLabel: string;
    runPromptHint: string;
    runTooLong: string;
    runSend: string;
    cancelRun: string;
    cancelOldRun: string;
    detailTabsLabel: string;
    tabs: { activity: string; chat: string; direct: string };
    activityLoading: string;
    activityEmpty: string;
    activityError: string;
    runStarted: string;
    runDuration: string;
    runCost: string;
    demoNote: string;
  };
  reach: {
    offlineTitle: string;
    offlineBody: string;
    yourComputer: string;
    neverTitle: string;
    neverBody: string;
    demoTitle: string;
    demoBody: string;
    downloadCta: string;
    linkCopied: string;
    shareFailed: string;
    unpairedTitle: string;
    unpairedBody: string;
    unpairedCta: string;
    desktopUnsupported: string;
  };
  command: {
    pending: string;
    executing: string;
    completed: string;
    failed: string;
    rejected: string;
    replayed: string;
    deskOnly: string;
    expired: string;
  };
  pairing: {
    title: string;
    body: string;
    howTo: string;
    pairing: string;
    pending: string;
    active: string;
    refused: string;
    revoked: string;
    unsupported: string;
    error: string;
    noDevice: string;
    unpair: string;
  };
  /** Chat from the phone: Athena's row and sheet, a persona's Chat tab (PHASE2-SPEC.md 5.2, 5.3). */
  chat: {
    athenaName: string;
    athenaRowHint: string;
    athenaOpenLabel: string;
    threadsLabel: string;
    newChat: string;
    back: string;
    untitled: string;
    updated: string;
    pinned: string;
    loading: string;
    error: string;
    messagesLoading: string;
    messagesError: string;
    retry: string;
    emptyTitle: string;
    emptyBody: string;
    draftAthena: string;
    draftPersona: string;
    threadEmpty: string;
    transcriptLabel: string;
    you: string;
    composerLabel: string;
    send: string;
    tooLong: string;
    disabled: { offline: string; unpaired: string; never: string; desktop: string };
    sending: string;
    thinking: string;
    waiting: string;
    noReply: string;
    runEnded: { failed: string; cancelled: string };
    retrySend: string;
    dismiss: string;
    errors: {
      chat_sync_off: string;
      athena_off: string;
      empty_message: string;
      message_too_long: string;
      bad_params: string;
      not_found: string;
      not_paired: string;
      unsupported: string;
      expired: string;
      replayed: string;
      no_device: string;
      other: string;
      unknown: string;
    };
  };
  /** Directing an App Master from the persona sheet: a `channel_say` (weekend item E). Not a chat: no reply comes back here. */
  say: {
    title: string;
    intro: string;
    label: string;
    count: string;
    tooLong: string;
    send: string;
    delivered: string;
    deliveredAgain: string;
    disabled: { offline: string; unpaired: string; never: string; desktop: string; noDevice: string };
    errors: {
      bad_params: string;
      empty_message: string;
      message_too_long: string;
      not_found: string;
      not_app_master: string;
      rate_limited: string;
      internal_error: string;
      controller_not_paired: string;
      controller_revoked: string;
      expired: string;
      other: string;
      unknown: string;
    };
  };
  /** `/dashboard/reviews` at phone width: decide pending reviews (PLAN M20, PHASE2-SPEC.md 1.6). */
  reviews: {
    loading: string;
    pendingLabel: string;
    decidedTitle: string;
    addNote: string;
    showMore: string;
    showLess: string;
    approveLabel: string;
    rejectLabel: string;
    escalationFailed: string;
    notesKept: string;
    report: string;
    reportLoading: string;
    reportError: string;
    reportRetry: string;
    reportNotSynced: string;
  };
  /** `/dashboard/messages` at phone width: thread list + in-place reader. */
  messages: {
    showMore: string;
    backLabel: string;
    replies: string;
  };
  /** `/dashboard/notes`: the desktop Notepad's goals, read-only (PHASE2-SPEC.md 5.1). */
  notes: {
    nav: string;
    title: string;
    lede: string;
    loading: string;
    error: string;
    retry: string;
    emptyTitle: string;
    emptyBody: string;
    noProject: string;
    goals: string;
    goalsOne: string;
    needsReview: string;
    totalNeedsReview: string;
    unread: string;
    offlineNote: string;
    demoNote: string;
    status: {
      draft: string;
      published: string;
      in_progress: string;
      completed: string;
      scoped: string;
      cut: string;
      shipped: string;
    };
    sheet: {
      status: string;
      planRail: string;
      brainstormRail: string;
      dispatch: { fleet: string; athena_goals: string };
      updated: string;
      reviewsHint: string;
      runSummary: string;
      body: string;
      noBody: string;
    };
  };
}

export const mobileCopy: MobileCopy = {
  personas: {
    title: 'Your agents',
    loading: 'Loading your agents...',
    empty: 'No agents yet. Create one in Personas on your computer.',
    error: 'Couldn\'t load your agents.',
    retry: 'Try again',
    state: { running: 'Running', paused: 'Paused', failed: 'Last run failed', idle: 'Idle' },
    pausedRunning: 'Paused, a run is still going',
    pause: 'Pause',
    resume: 'Resume',
    pauseLabel: 'Pause {name}',
    resumeLabel: 'Resume {name}',
    openLabel: 'Open {name}',
    moreLabel: 'More actions for {name}',
    run: 'Run...',
    runTitle: 'Run {name}',
    runPromptLabel: 'What should it do?',
    runPromptHint: 'Your computer starts the run right away. Follow it in Activity.',
    runTooLong: 'Keep it under {max} characters.',
    runSend: 'Run now',
    cancelRun: 'Cancel run',
    cancelOldRun: 'This run started over a day ago, so this phone may not see it stop.',
    detailTabsLabel: 'Agent details',
    tabs: { activity: 'Activity', chat: 'Chat', direct: 'Direct' },
    activityLoading: 'Loading runs...',
    activityEmpty: 'No runs yet.',
    activityError: 'Couldn\'t load the runs.',
    runStarted: 'Started {ago}',
    runDuration: 'Took {duration}',
    runCost: 'Cost {cost}',
    demoNote: 'Demo: a simulated computer answers these commands.',
  },
  reach: {
    offlineTitle: 'Personas isn\'t running on {device}',
    offlineBody: 'Last seen {ago}. Open it to manage your agents from here.',
    yourComputer: 'your computer',
    neverTitle: 'Connect your computer',
    neverBody: 'Install Personas on your computer and turn on sync in its Settings to manage your agents from this phone.',
    demoTitle: 'Run your own agents',
    demoBody: 'Personas runs on your computer. Send yourself the link and install it there.',
    downloadCta: 'Send the download to my computer',
    linkCopied: 'Link copied. Open it on your computer.',
    shareFailed: 'Couldn\'t share. Open {url} on your computer.',
    unpairedTitle: 'Pair this phone',
    unpairedBody: 'Your computer is online, but this phone isn\'t paired yet. Pair it once to run, pause and cancel your agents, and to chat, from here.',
    unpairedCta: 'How to pair',
    desktopUnsupported: 'Not available over your computer\'s local API. Open the Personas app to do this.',
  },
  command: {
    pending: 'Sending...',
    executing: 'Working...',
    completed: 'Done',
    failed: 'Failed: {reason}',
    rejected: 'Refused: {reason}',
    replayed: 'Already handled. Your computer will not run the same command twice.',
    deskOnly: 'Decide this one at your computer. App Master approvals stay on the desk.',
    expired: 'Your computer didn\'t answer',
  },
  pairing: {
    title: 'Phone control',
    body: 'Pair this browser with Personas on your computer to run, pause, resume and cancel your agents, and to chat with them and Athena, from here.',
    howTo: 'On your computer, open Settings, then Cloud sync, then Pair a phone, and scan the code with this phone.',
    pairing: 'Pairing...',
    pending: 'Waiting for your computer to confirm...',
    active: 'This phone is paired.',
    refused: 'Your computer refused this pairing. Start again from your computer.',
    revoked: 'This phone is no longer paired.',
    unsupported: 'This browser can\'t hold a secure key. Try a current version of Safari or Chrome.',
    error: 'Pairing didn\'t work: {reason}',
    noDevice: 'No synced computer found. Turn on sync in Personas on your computer first.',
    unpair: 'Unpair this phone',
  },
  chat: {
    athenaName: 'Athena',
    athenaRowHint: 'Chat with your companion',
    athenaOpenLabel: 'Chat with Athena',
    threadsLabel: 'Chats',
    newChat: 'New chat',
    back: 'All chats',
    untitled: 'Untitled chat',
    updated: 'Updated {ago}',
    pinned: 'Pinned',
    loading: 'Loading chats...',
    error: 'Couldn\'t load your chats.',
    messagesLoading: 'Loading messages...',
    messagesError: 'Couldn\'t load this chat.',
    retry: 'Try again',
    emptyTitle: 'No chats synced',
    emptyBody: 'Chats stay on your computer unless you choose to sync them. In Personas on your computer, open Settings, then Cloud sync, and turn on Sync chats. It\'s off by default.',
    draftAthena: 'Ask Athena anything. Personas on your computer runs the chat, and the reply syncs back here.',
    draftPersona: 'Send {name} a message. Personas on your computer runs it, and the reply syncs back here.',
    threadEmpty: 'No messages in this chat yet.',
    transcriptLabel: 'Messages with {name}',
    you: 'You',
    composerLabel: 'Message {name}',
    send: 'Send',
    tooLong: 'Too long to send. Keep it under 8 KB.',
    disabled: {
      offline: 'Personas isn\'t running on your computer. Open it to chat from here.',
      unpaired: 'Pair this phone in Settings to chat from here.',
      never: 'Connect your computer to chat from here.',
      desktop: 'Not available over your computer\'s local API. Open the Personas app to do this.',
    },
    sending: 'Sending...',
    thinking: '{name} is thinking...',
    waiting: 'No reply yet. It shows up here once your computer syncs it.',
    noReply: 'No reply. The run {status}.',
    runEnded: { failed: 'failed', cancelled: 'was canceled' },
    retrySend: 'Retry',
    dismiss: 'Dismiss',
    errors: {
      chat_sync_off: 'Chat sync is off on your computer. In Personas, open Settings, then Cloud sync, and turn on Sync chats.',
      athena_off: 'Athena is turned off on your computer. Turn it on in Personas to chat from here.',
      empty_message: 'That message was empty.',
      message_too_long: 'That message is too long. Keep it under 8 KB.',
      bad_params: 'Your computer couldn\'t read that message. Try again.',
      not_found: 'This chat is gone from your computer. Start a new one.',
      not_paired: 'This phone isn\'t paired anymore. Pair it again in Settings.',
      unsupported: 'Update Personas on your computer to chat from your phone.',
      expired: 'Your computer didn\'t answer. Is Personas still open?',
      replayed: 'Already handled. Your computer will not run the same command twice.',
      no_device: 'No synced computer found to send this to.',
      other: 'Couldn\'t send: {reason}',
      unknown: 'Couldn\'t send. Try again.',
    },
  },
  say: {
    title: 'Direct this App Master',
    intro: 'Only a project\'s App Master takes directions, so send this to that project\'s App Master. It reads the direction the next time it wakes up. This isn\'t a chat, so no reply comes back here.',
    label: 'Direction for {name}',
    count: '{count} of {max}',
    tooLong: 'Too long to send. Keep it under {max} characters.',
    send: 'Send direction',
    delivered: 'Delivered. {name} reads it the next time it wakes up.',
    deliveredAgain: 'Already delivered earlier. {name} reads it the next time it wakes up.',
    disabled: {
      offline: 'Personas isn\'t running on your computer. Open it to send a direction from here.',
      unpaired: 'Pair this phone in Settings to send a direction from here.',
      never: 'Connect your computer to send a direction from here.',
      desktop: 'Not available over your computer\'s local API. Open the Personas app to do this.',
      noDevice: 'This agent has no synced computer to send a direction to.',
    },
    errors: {
      bad_params: 'Your computer couldn\'t read that direction. Try again.',
      empty_message: 'Write a direction first. That one was empty.',
      message_too_long: 'That direction is too long. Keep it under {max} characters.',
      not_found: 'This agent is gone from your computer.',
      not_app_master: 'Only a project\'s App Master takes directions. Send this to that project\'s App Master instead.',
      rate_limited: 'This phone sent 10 directions in the last 10 minutes. Wait a few minutes, then send again.',
      internal_error: 'Your computer hit an error saving the direction. Try again.',
      controller_not_paired: 'This phone isn\'t paired with your computer. Pair it again in Settings.',
      controller_revoked: 'This phone is no longer paired. Pair it again in Settings.',
      expired: 'Your computer didn\'t answer. Is Personas still open?',
      other: 'Couldn\'t send: {reason}',
      unknown: 'Couldn\'t send. Try again.',
    },
  },
  reviews: {
    loading: 'Loading reviews...',
    pendingLabel: 'Reviews waiting for you',
    decidedTitle: 'Decided here',
    addNote: 'Add a note',
    showMore: 'Show more',
    showLess: 'Show less',
    approveLabel: 'Approve: {title}',
    rejectLabel: 'Reject: {title}',
    escalationFailed: 'An overdue review couldn\'t be approved automatically ({reason}). It\'s still waiting for you.',
    notesKept: 'The desktop keeps up to {max} characters and removes anything that looks like a credential.',
    report: 'Report',
    reportLoading: 'Loading the report...',
    reportError: 'Couldn\'t load the report.',
    reportRetry: 'Try again',
    reportNotSynced: 'The report hasn\'t synced yet.',
  },
  messages: {
    showMore: 'Show more',
    backLabel: 'Back to the message list',
    replies: '{n} replies',
  },
  notes: {
    nav: 'Notes',
    title: 'Notes',
    lede: 'Your goals from the Notepad in Personas, by project. Read-only here: edit them on your computer.',
    loading: 'Loading your notes...',
    error: 'Couldn\'t load your notes.',
    retry: 'Try again',
    emptyTitle: 'No notes synced',
    emptyBody: 'Notes stay on your computer unless you choose to sync them. In Personas on your computer, open Settings, then Cloud sync, and turn on Sync notes. It\'s off by default.',
    noProject: 'No project',
    goals: '{count} goals',
    goalsOne: '1 goal',
    needsReview: '{count} to review',
    totalNeedsReview: 'Needs review: {count}',
    unread: '{count} unread',
    offlineNote: 'These are your notes as of the last sync.',
    demoNote: 'Demo: sample goals from a simulated computer.',
    status: {
      draft: 'Draft',
      published: 'Published',
      in_progress: 'In progress',
      completed: 'Completed',
      scoped: 'Scoped',
      cut: 'Cut',
      shipped: 'Shipped',
    },
    sheet: {
      status: 'Status',
      planRail: 'Plan',
      brainstormRail: 'Brainstorm',
      dispatch: { fleet: 'Handed to Fleet', athena_goals: 'Handed to Athena' },
      updated: 'Updated {ago}',
      reviewsHint: 'Open the note in Personas on your computer to answer its reviews.',
      runSummary: 'Run summary',
      body: 'Note',
      noBody: 'This note has no body yet.',
    },
  },
};
