import { apiFetch } from "@/lib/api-fetch";
import type { AccentToken, Comment, Feature } from "./local-types";

export const featureIllustrations: Record<string, string> = {
  macos: "/gen/vote/vote-macos.png",
  i18n: "/gen/vote/vote-i18n.png",
  dashboard: "/gen/vote/vote-dashboard.png",
  enterprise: "/gen/vote/vote-enterprise.png",
};

// The `votes` field is a marketing seed displayed before+added to real API vote
// counts. Edit here to change initial display numbers.
export const features: Feature[] = [
  {
    id: "macos",
    title: "macOS Support",
    subtitle: "Native experience",
    description:
      "Full native macOS build with Apple Silicon optimization, Spotlight integration, and menu bar agent controls.",
    accent: "cyan",
    votes: 342,
  },
  {
    id: "i18n",
    title: "Internationalization",
    subtitle: "Global reach",
    description:
      "Multi-language agent instructions, localized UI, and region-aware scheduling for worldwide teams.",
    accent: "purple",
    votes: 189,
  },
  {
    id: "dashboard",
    title: "Web Dashboard",
    subtitle: "Monitor anywhere",
    description:
      "Browser-based dashboard for real-time agent monitoring, execution history, and fleet management from any device.",
    accent: "emerald",
    votes: 276,
  },
  {
    id: "enterprise",
    title: "Enterprise Projects",
    subtitle: "Team-scale ops",
    description:
      "Multi-tenant workspaces, RBAC, audit logs, SSO integration, and shared agent templates across your organization.",
    accent: "amber",
    votes: 214,
  },
];

export const localAccentTokens: Record<Feature["accent"], AccentToken> = {
  cyan: { r: 6, g: 182, b: 212, tw: "brand-cyan" },
  purple: { r: 168, g: 85, b: 247, tw: "brand-purple" },
  emerald: { r: 52, g: 211, b: 153, tw: "brand-emerald" },
  amber: { r: 251, g: 191, b: 36, tw: "brand-amber" },
};

export const LS_AUTHOR_KEY = "personas-comment-author";
export const LS_VOTER_ID_KEY = "personas-voter-id";

export const KOFI_USERNAME = process.env.NEXT_PUBLIC_KOFI_USERNAME ?? "";

export const ANON_ADJECTIVES = ["Swift", "Bright", "Quiet", "Bold", "Keen", "Calm", "Warm", "Sharp"];
export const ANON_NOUNS = ["Fox", "Owl", "Wolf", "Bear", "Hawk", "Lynx", "Hare", "Wren"];

export const BOOST_TIERS = [
  { label: "$5", value: 5, weight: 5 },
  { label: "$15", value: 15, weight: 15 },
  { label: "$25", value: 25, weight: 25 },
] as const;

/**
 * Anonymous voter id. Generated once per browser, stored in localStorage.
 * Used to pair "who voted for what" without requiring auth — both the
 * server (UNIQUE constraint on feature_id + voter_id) and the API
 * validator (`isValidVoterId`) accept the format we mint here.
 */
export function getOrCreateVoterId(): string {
  try {
    const existing = localStorage.getItem(LS_VOTER_ID_KEY);
    if (existing && existing.length >= 16) return existing;
  } catch {
    /* unavailable */
  }
  const id =
    typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
      ? crypto.randomUUID()
      : `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 18)}`;
  try {
    localStorage.setItem(LS_VOTER_ID_KEY, id);
  } catch {
    /* storage full */
  }
  return id;
}

export function getOrCreateAuthor(): string {
  try {
    const existing = localStorage.getItem(LS_AUTHOR_KEY);
    if (existing) return existing;
    const adj = ANON_ADJECTIVES[Math.floor(Math.random() * ANON_ADJECTIVES.length)];
    const noun = ANON_NOUNS[Math.floor(Math.random() * ANON_NOUNS.length)];
    const name = `${adj}${noun}`;
    localStorage.setItem(LS_AUTHOR_KEY, name);
    return name;
  } catch {
    return "Anonymous";
  }
}

/* ── API helpers ───────────────────────────────────────────────────── */

export interface VotesSnapshot {
  counts: Record<string, number>;
  userVotes: Set<string>;
}

export async function fetchVotes(voterId: string, signal?: AbortSignal): Promise<VotesSnapshot> {
  const data = await apiFetch<{ counts?: Record<string, number>; userVotes?: string[] }>(
    `/api/votes?voterId=${encodeURIComponent(voterId)}`,
    { signal },
  );
  return {
    counts: data.counts ?? {},
    userVotes: new Set(data.userVotes ?? []),
  };
}

export async function postVoteToggle(
  featureId: string,
  voterId: string,
  signal?: AbortSignal,
): Promise<"added" | "removed" | "email_saved"> {
  const data = await apiFetch<{ action?: "added" | "removed" | "email_saved" }>(
    "/api/votes",
    { method: "POST", body: { featureId, voterId }, signal },
  );
  return data.action ?? "added";
}

export async function fetchComments(signal?: AbortSignal): Promise<Comment[]> {
  const data = await apiFetch<{ comments?: Comment[] }>("/api/feature-comments", { signal });
  return data.comments ?? [];
}

export async function postComment(
  input: { featureId: string; parentId: string | null; text: string; author: string },
  signal?: AbortSignal,
): Promise<Comment> {
  const data = await apiFetch<{ comment?: Comment }>("/api/feature-comments", {
    method: "POST",
    body: input,
    signal,
  });
  if (!data.comment) throw new Error("POST /api/feature-comments returned malformed body (no .comment)");
  return data.comment;
}

export async function fetchBoostTotals(signal?: AbortSignal): Promise<Record<string, number>> {
  const data = await apiFetch<{ totals?: Record<string, number> }>("/api/feature-boosts", { signal });
  return data.totals ?? {};
}

export async function postBoost(
  input: { featureId: string; voterId: string; weight: number; tierValue: number },
  signal?: AbortSignal,
): Promise<void> {
  await apiFetch<unknown>("/api/feature-boosts", {
    method: "POST",
    body: input,
    signal,
  });
}

export function formatTimeAgo(timestamp: number): string {
  const diff = Date.now() - timestamp;
  const minutes = Math.floor(diff / 60_000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}
