/* ── Storage register: every cookie and browser-storage key this site writes ──
 *
 * The Cookie Policy (/legal#cookies) renders its "What we store" list from this
 * array, so the disclosure lives in exactly one place. ePrivacy treats
 * localStorage like a cookie, so both are listed.
 *
 * When you add, rename, or remove a cookie, a localStorage/sessionStorage key or
 * an IndexedDB database anywhere in src/, update this register in the same commit and bump
 * POLICY_META.cookies in src/data/policy-changelog.ts. The user-facing purpose
 * text lives in the `cookiePolicy.purposes` i18n namespace (all 14 locales).
 *
 * Writers, as of 2026-10-06. The site sets no cookie of its own: the only one,
 * prefer-full, left with the old /m view (docs/concepts/mobile-revival/PLAN.md).
 *   personas-cookie-consent ............ src/components/CookieConsent.tsx (COOKIE_CONSENT_KEY)
 *   sb-<project>-auth-token ............ supabase-js default session storage (src/lib/supabase.ts)
 *   personas-theme ..................... src/stores/themeStore.ts (zustand persist)
 *   personas-language .................. src/stores/i18nStore.ts (zustand persist)
 *   personas-tour-volume ............... src/hooks/useTourVolume.ts
 *   dashboard prefs .................... src/stores/{dashboardFilterStore,incidentsFilterStore,settingsStore,
 *                                        reviewStore,reviewVoiceStore}.ts, src/app/dashboard/knowledge/page.tsx
 *   personas-tour-seen ................. src/components/tour/TourLauncher.tsx
 *   personas-legal-last-seen-<policy> .. src/data/policy-changelog.ts
 *   personas-dashboard-last-visit ...... src/app/dashboard/home/home-page/useLastVisit.ts
 *   checklist-<hash> ................... src/components/guide/blocks/Checklist.tsx
 *   personas-voter-id / -comment-author  src/components/sections/feature-voting/data.ts
 *   personas-controller (IndexedDB) .... src/lib/commands/signer.ts (DB_NAME; store "keys", one
 *                                        record "controller": the paired phone's non-extractable
 *                                        Ed25519 key pair, its controller id, the paired desktop's
 *                                        device id and the pairing time). Written only when a phone
 *                                        pairs (controllerPlane.pairController); deleted on unpair.
 *                                        signingSupported() generates a throwaway key it never stores.
 *
 * Nothing is written to sessionStorage, the command plane (src/lib/commands,
 * src/stores/commandStore.ts, src/lib/sync) keeps nothing in localStorage, and
 * the consent-gated website analytics (src/lib/analytics.ts) keep no state on
 * the device.
 */
import type { Translations } from "@/i18n/en";

export type StorageCategory = "necessary" | "preferences" | "functional";
export type StorageMechanism = "cookie" | "localStorage" | "indexedDB";
export type StorageLifetime = keyof Translations["cookiePolicy"]["lifetimes"];
export type StoragePurpose = keyof Translations["cookiePolicy"]["purposes"];

export interface StorageEntry {
  /** Exact key or cookie name. A trailing `*` marks a family of keys. */
  names: string[];
  mechanism: StorageMechanism;
  category: StorageCategory;
  lifetime: StorageLifetime;
  purpose: StoragePurpose;
}

/** Display order of the categories in the policy. */
export const STORAGE_CATEGORIES: StorageCategory[] = ["necessary", "preferences", "functional"];

export const STORAGE_REGISTER: StorageEntry[] = [
  // Strictly necessary
  { names: ["personas-cookie-consent"], mechanism: "localStorage", category: "necessary", lifetime: "untilCleared", purpose: "consent" },
  { names: ["sb-*-auth-token"], mechanism: "localStorage", category: "necessary", lifetime: "untilSignOut", purpose: "authSession" },
  { names: ["personas-controller"], mechanism: "indexedDB", category: "necessary", lifetime: "untilUnpaired", purpose: "pairedPhoneKey" },

  // Preferences
  { names: ["personas-theme"], mechanism: "localStorage", category: "preferences", lifetime: "untilCleared", purpose: "theme" },
  { names: ["personas-language"], mechanism: "localStorage", category: "preferences", lifetime: "untilCleared", purpose: "language" },
  { names: ["personas-tour-volume"], mechanism: "localStorage", category: "preferences", lifetime: "untilCleared", purpose: "tourVolume" },
  {
    names: [
      "personas-dashboard-knowledge-view",
      "dashboard-filter-state",
      "incidents-filter-state",
      "dashboard-settings-prefs",
      "review-escalation-policy",
      "review-escalation-enabled",
      "review-voice-enabled",
    ],
    mechanism: "localStorage",
    category: "preferences",
    lifetime: "untilCleared",
    purpose: "dashboardPrefs",
  },

  // Functional
  { names: ["personas-tour-seen"], mechanism: "localStorage", category: "functional", lifetime: "untilCleared", purpose: "tourSeen" },
  { names: ["personas-legal-last-seen-*"], mechanism: "localStorage", category: "functional", lifetime: "untilCleared", purpose: "policySeen" },
  { names: ["personas-dashboard-last-visit"], mechanism: "localStorage", category: "functional", lifetime: "untilCleared", purpose: "dashboardActivity" },
  { names: ["checklist-*"], mechanism: "localStorage", category: "functional", lifetime: "untilCleared", purpose: "checklist" },
  { names: ["personas-voter-id", "personas-comment-author"], mechanism: "localStorage", category: "functional", lifetime: "untilCleared", purpose: "voting" },
];
