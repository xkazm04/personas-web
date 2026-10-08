/**
 * Pending-translation copy: the `memorySection` namespace, English only (docs/concepts/mobile-revival/PLAN.md M4, M22).
 *
 * It lives outside `en.ts` so that only the routes that render it bundle it: `en.ts` is imported by
 * every route through `useTranslation`. Components import `memorySectionCopy` from here directly; it works in
 * server and client components alike. To translate it, move the interface back into `Translations`
 * and the value into `en` (both in `src/i18n/en.ts`), translate it in the 13 locale files, delete
 * this module and point the consumers at `t.memorySection`. See docs/features/platform/internationalization.md.
 */

export interface MemorySectionCopy {
  heading: string;
  headingGradient: string;
  lede: string;
  artLabel: string;
  run1: string;
  run12: string;
  memory: string;
  replay: string;
}

export const memorySectionCopy: MemorySectionCopy = {
  heading: 'Remembers what',
  headingGradient: 'works',
  lede: 'Your agents get better the more they work.',
  artLabel: 'Run 1 wanders, fails twice and loops back; each failure is kept as a memory, and run 12 goes straight to the goal.',
  run1: 'Run 1',
  run12: 'Run 12',
  memory: 'Memory',
  replay: 'Replay the animation',
};
