export type PolicyId = "privacy" | "terms" | "cookies";

export type PolicyMeta = {
  latestUpdateIso: string;
  formattedUpdate: string;
  changes: string[];
};

export const POLICY_META: Record<PolicyId, PolicyMeta> = {
  privacy: {
    latestUpdateIso: "2026-09-14",
    formattedUpdate: "September 2026",
    changes: [
      "Removed the statement that paid cloud tiers store agent execution metadata. Personas has no paid tiers and does not run agents remotely.",
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
