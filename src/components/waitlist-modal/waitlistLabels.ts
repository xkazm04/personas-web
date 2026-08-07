import type { Translations } from "@/i18n/en";
import type { WaitlistPanelLabels } from "./WaitlistSuccessPanel";
import type { WaitlistErrorLabels } from "./waitlistUtils";

/**
 * Label bundles for the waitlist modal's three child components.
 *
 * These live outside `WaitlistModal.tsx` so the modal stays under the
 * `custom-quality/max-tsx-lines` budget, and so every user-facing string in the
 * flow is visible in one place — the modal itself renders no literal copy.
 */

export function waitlistHeaderLabels(t: Translations, platformLabel: string) {
  return {
    // `{platform}` is resolved here; `{count}` stays in `joinCount` because the
    // header styles the number and splits the sentence around it.
    title: t.waitlist.title.replace("{platform}", platformLabel),
    joinCount: t.waitlist.joinCount.replace("{platform}", platformLabel),
    comingSoon: t.pricing.comingSoon,
    closeLabel: t.common.close,
  };
}

export function waitlistFormLabels(t: Translations) {
  return {
    emailPlaceholder: t.waitlist.emailPlaceholder,
    earlyBeta: t.waitlist.earlyBeta,
    earlyBetaHint: t.waitlist.earlyBetaHint,
    joining: t.waitlist.joining,
    notifyMe: t.common.notifyMe,
  };
}

export function waitlistPanelLabels(t: Translations): WaitlistPanelLabels {
  return {
    duplicate: t.waitlist.duplicate,
    success: t.waitlist.success,
    copied: t.waitlist.copied,
    close: t.common.close,
    next: t.common.next,
    spotSaved: t.waitlist.spotSaved,
    spotAlreadySaved: t.waitlist.spotAlreadySaved,
    betaFlagged: t.waitlist.betaFlagged,
    emailUseOnly: t.waitlist.emailUseOnly,
    announceWhere: t.waitlist.announceWhere,
    roadmapLink: t.waitlist.roadmapLink,
    share: t.waitlist.share,
    manualCopy: t.waitlist.manualCopy,
  };
}

export function waitlistErrorLabels(t: Translations): WaitlistErrorLabels {
  return {
    invalidEmail: t.waitlist.invalidEmail,
    errorRateLimited: t.waitlist.errorRateLimited,
    errorInvalidPlatform: t.waitlist.errorInvalidPlatform,
    errorRetryable: t.waitlist.errorRetryable,
    errorGeneric: t.waitlist.errorGeneric,
  };
}
