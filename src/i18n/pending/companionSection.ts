/**
 * Pending-translation copy: the `companionSection` namespace, English only (docs/concepts/mobile-revival/PLAN.md M4, M22).
 *
 * It lives outside `en.ts` so that only the routes that render it bundle it: `en.ts` is imported by
 * every route through `useTranslation`. Components import `companionSectionCopy` from here directly; it works in
 * server and client components alike. To translate it, move the interface back into `Translations`
 * and the value into `en` (both in `src/i18n/en.ts`), translate it in the 13 locale files, delete
 * this module and point the consumers at `t.companionSection`. See docs/features/platform/internationalization.md.
 */

export interface CompanionSectionCopy {
  heading: string;
  headingGradient: string;
  headingTrailing: string;
  description: string;
  avatarAlt: string;
  capabilities: {
    always: {
      label: string;
      blurb: string;
      line: string;
    };
    voice: {
      label: string;
      blurb: string;
      line: string;
    };
    memory: {
      label: string;
      blurb: string;
      line: string;
    };
    proactive: {
      label: string;
      blurb: string;
      line: string;
    };
  };
}

export const companionSectionCopy: CompanionSectionCopy = {
  heading: 'Meet',
  headingGradient: 'Athena',
  headingTrailing: ', always on',
  description: 'A persistent orb that lives on your desktop \u2014 hold it to talk, it remembers how you work, and it reaches out before you have to ask.',
  avatarAlt: 'Athena, the Personas companion',
  capabilities: {
    always: {
      label: 'Always on, never in the way',
      blurb: 'A floating orb lives on your desktop \u2014 her animated face is the interface. Drag it anywhere; it survives restarts and quietly pauses when you look away.',
      line: 'I\'m right here whenever you need me.',
    },
    voice: {
      label: 'Hold to talk',
      blurb: 'Press and hold the orb to speak \u2014 voice in, voice out. Runs on-device with local Whisper, or in your browser. No chat window required.',
      line: 'Hold to talk \u2014 I\'m listening.',
    },
    memory: {
      label: 'Remembers what matters',
      blurb: 'Athena keeps a long-term memory of your identity, goals, and how you work \u2014 and you\'re the editor. She never overwrites; every change is yours to approve.',
      line: 'I remember your goals and how you work.',
    },
    proactive: {
      label: 'Reaches out first',
      blurb: 'She surfaces what needs you \u2014 a goal due soon, an aging backlog, runs that failed overnight \u2014 and can even schedule her own check-ins.',
      line: 'Heads up \u2014 3 runs failed overnight.',
    },
  },
};
