export type PolicyId = "privacy" | "terms" | "cookies";

export type PolicyMeta = {
  latestUpdateIso: string;
  formattedUpdate: string;
  changes: string[];
};

export const POLICY_META: Record<PolicyId, PolicyMeta> = {
  privacy: {
    latestUpdateIso: "2026-10-06",
    formattedUpdate: "October 2026",
    changes: [
      "Added \"Optional cloud sync\": what the desktop app copies to your account when you turn sync on, the separate Sync notes and Sync chats switches (both off by default), how note and chat text is masked and capped, what turning a switch off deletes, and where the data is stored.",
      "Added \"Paired phones\": what a phone you pair can do without a click on your computer, what it cannot do, the signing key it keeps, and how to revoke it.",
      "Corrected the statements that nothing the desktop app creates is ever sent to our servers. That holds unless you turn on cloud sync; credentials are never sent either way.",
      "The policy is now available in all 14 site languages.",
      "Corrected the statement that the desktop app has zero telemetry. Release builds send anonymous error reports and usage signals to Sentry; the new section lists what is sent, what is never sent, and how to turn it off.",
      "Corrected the statement that Sentry runs on this website only. It also receives the desktop app's error reports and usage signals.",
      "Clarified that website analytics run only after you choose \"Accept All\", and that agent prompts go directly to the AI provider you choose.",
    ],
  },
  terms: {
    latestUpdateIso: "2026-09-14",
    formattedUpdate: "September 2026",
    changes: [
      "Removed the description of optional paid cloud tiers. Personas has no paid tiers and does not run agents remotely.",
    ],
  },
  cookies: {
    latestUpdateIso: "2026-10-06",
    formattedUpdate: "October 2026",
    changes: [
      "Listed the signing key a phone keeps in its browser database (IndexedDB) after you pair it with the desktop app. It signs the phone's commands so your computer can check where they came from, and it is deleted when you unpair the phone.",
      "Removed the prefer-full cookie. It belonged to a mobile view that has been retired, so the site now sets no cookies of its own.",
      "Corrected the claim that the site uses two cookies. The sign-in session and theme live in local storage, not cookies.",
      "Listed every cookie and local storage key the site writes, by purpose, with its lifetime, including the voting ID and comment nickname that were missing.",
      "Clarified that analytics store nothing on your device and run only after you choose \"Accept All\".",
    ],
  },
};

/**
 * A policy's "Last updated" month ("October 2026") in the reader's language.
 * UTC so the month never slips a day; falls back to the English label.
 */
export function formatPolicyMonth(policyId: PolicyId, language: string): string {
  const meta = POLICY_META[policyId];
  try {
    return new Intl.DateTimeFormat(language, { month: "long", year: "numeric", timeZone: "UTC" }).format(
      new Date(`${meta.latestUpdateIso}T00:00:00Z`),
    );
  } catch {
    return meta.formattedUpdate;
  }
}

const STORAGE_KEY_PREFIX = "personas-legal-last-seen-";

export function getStorageKey(policyId: PolicyId): string {
  return `${STORAGE_KEY_PREFIX}${policyId}`;
}

export function readLastSeen(policyId: PolicyId): string | null {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage.getItem(getStorageKey(policyId));
  } catch {
    return null;
  }
}

export function writeLastSeen(policyId: PolicyId, isoDate: string): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(getStorageKey(policyId), isoDate);
  } catch {
    // private mode / quota — silently ignore
  }
}

export function hasUnseenUpdate(policyId: PolicyId, lastSeen: string | null): boolean {
  // No previous visit recorded — treat as a first visit; don't surprise the user with a "New" badge.
  if (lastSeen === null) return false;
  return lastSeen < POLICY_META[policyId].latestUpdateIso;
}
