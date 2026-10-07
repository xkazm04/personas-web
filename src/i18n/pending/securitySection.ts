/**
 * Pending-translation copy: the `securitySection` namespace, English only (docs/concepts/mobile-revival/PLAN.md M4, M22).
 *
 * It lives outside `en.ts` so that only the routes that render it bundle it: `en.ts` is imported by
 * every route through `useTranslation`. Components import `securitySectionCopy` from here directly; it works in
 * server and client components alike. To translate it, move the interface back into `Translations`
 * and the value into `en` (both in `src/i18n/en.ts`), translate it in the 13 locale files, delete
 * this module and point the consumers at `t.securitySection`. See docs/features/platform/internationalization.md.
 */

export interface SecuritySectionCopy {
  heading: string;
  headingGradient: string;
  lede: string;
  artLabel: string;
  replay: string;
  yourKeys: string;
  rings: {
    keychain: string;
    device: string;
  };
}

export const securitySectionCopy: SecuritySectionCopy = {
  heading: 'Your keys stay',
  headingGradient: 'yours',
  lede: 'Every credential is encrypted on your device and kept in your OS\'s own vault.',
  artLabel: 'Three nested rings, your device, the OS keychain and AES-256-GCM encryption, turn and lock one by one around your keys at the centre.',
  replay: 'Replay the animation',
  yourKeys: 'Your keys',
  rings: {
    keychain: 'OS keychain',
    device: 'Device',
  },
};
