/**
 * Pending-translation copy: the `pricingSection` namespace, English only (docs/concepts/mobile-revival/PLAN.md M4, M22).
 *
 * It lives outside `en.ts` so that only the routes that render it bundle it: `en.ts` is imported by
 * every route through `useTranslation`. Components import `pricingSectionCopy` from here directly; it works in
 * server and client components alike. To translate it, move the interface back into `Translations`
 * and the value into `en` (both in `src/i18n/en.ts`), translate it in the 13 locale files, delete
 * this module and point the consumers at `t.pricingSection`. See docs/features/platform/internationalization.md.
 */

export interface PricingSectionCopy {
  heading: string;
  headingGradient: string;
  lede: string;
  artLabel: string;
  replay: string;
  computer: string;
  tag: string;
  personas: string;
  cli: string;
  anthropic: string;
  claude: string;
  plan: string;
  beats: string[];
}

export const pricingSectionCopy: PricingSectionCopy = {
  heading: 'Personas is',
  headingGradient: 'free',
  lede: "The app, its MIT source and every feature cost nothing, with no account or licence key. Your agents run through Claude Code on your own Claude Pro or Max plan, so the only bill is Anthropic's.",
  artLabel: 'An agent run leaves Personas on your computer, passes the Claude Code CLI and reaches Claude at Anthropic. Personas is tagged $0 with an MIT licence; the only payment line runs from your Claude Pro or Max plan to Anthropic.',
  replay: 'Replay the illustration',
  computer: 'Your computer',
  tag: '$0, MIT licence',
  personas: 'Personas',
  cli: 'Claude Code CLI',
  anthropic: 'Anthropic',
  claude: 'Claude',
  plan: 'Your Claude Pro or Max plan',
  beats: ['Run starts', 'On your plan', 'Claude works', 'No bill from Personas'],
};
