/**
 * Pending-translation copy: the `aiModelsSection` namespace, English only (docs/concepts/mobile-revival/PLAN.md M4, M22).
 *
 * It lives outside `en.ts` so that only the routes that render it bundle it: `en.ts` is imported by
 * every route through `useTranslation`. Components import `aiModelsSectionCopy` from here directly; it works in
 * server and client components alike. To translate it, move the interface back into `Translations`
 * and the value into `en` (both in `src/i18n/en.ts`), translate it in the 13 locale files, delete
 * this module and point the consumers at `t.aiModelsSection`. See docs/features/platform/internationalization.md.
 */

export interface AiModelsSectionCopy {
  heading: string;
  lede: string;
  artLabel: string;
  replay: string;
  local: string;
}

export const aiModelsSectionCopy: AiModelsSectionCopy = {
  heading: 'Powered by {claude}. Private via {ollama}.',
  lede: 'Two engines, one consistent agent runtime.',
  artLabel: 'Tasks of different weight pass through one router: light, default and heavy ones go to Claude Haiku, Sonnet and Opus, while a locked private task stays on your machine with Ollama.',
  replay: 'Replay animation',
  local: 'Local',
};
