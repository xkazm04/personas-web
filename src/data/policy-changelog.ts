export type PolicyId = "privacy" | "terms" | "cookies";

export type PolicyMeta = {
  latestUpdateIso: string;
  formattedUpdate: string;
  changes: string[];
};

export const POLICY_META: Record<PolicyId, PolicyMeta> = {
  privacy: {
    latestUpdateIso: "2026-04-01",
    formattedUpdate: "April 2026",
    changes: [
      "Clarified that paid cloud tiers may store agent execution metadata to enable scheduling and remote runs.",
      "Specified AES-256-GCM as the encryption standard used for credential storage in your OS keyring.",
      "Named Supabase explicitly as our authentication and cloud storage provider.",
    ],
  },
  terms: {
    latestUpdateIso: "2026-04-01",
    formattedUpdate: "April 2026",
    changes: [
      "Added a 30-day window for cloud data deletion upon termination request.",
      "Clarified that you must hold your own valid subscriptions to any AI providers you connect.",
      "Made explicit that we may suspend cloud accounts only for terms violations, never for inactivity.",
    ],
  },
  cookies: {
    latestUpdateIso: "2026-04-01",
    formattedUpdate: "April 2026",
    changes: [
      "Limited the cookie set to two essentials: authentication session and theme preference.",
      "Reaffirmed no advertising, analytics, or fingerprinting cookies are used.",
      "Documented that Supabase OAuth flows may set strictly functional cookies.",
    ],
  },
};

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
