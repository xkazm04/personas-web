import { apiFetch } from "@/lib/api-fetch";
import type { AccentToken, Comment, Feature } from "./local-types";

export const featureIllustrations: Record<string, string> = {
  macos: "/gen/vote/vote-macos.png",
  i18n: "/gen/vote/vote-i18n.png",
  dashboard: "/gen/vote/vote-dashboard.png",
  enterprise: "/gen/vote/vote-enterprise.png",
};

// The `votes` field is a marketing seed displayed before+added to real API vote
// counts. Edit here to change initial display numbers. Display copy (title +
// description) lives in i18n under `featureVoting.features[id]` — keyed by `id`,
// which also links to the server-side `ALLOWED_FEATURES` allowlist.
export const features: Feature[] = [
  { id: "macos", accent: "cyan", votes: 342 },
  { id: "i18n", accent: "purple", votes: 189 },
  { id: "dashboard", accent: "emerald", votes: 276 },
  { id: "enterprise", accent: "amber", votes: 214 },
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

/** Localized unit templates for {@link formatTimeAgo} (`{n}` = the amount). */
export interface TimeAgoLabels {
  justNow: string;
  minutes: string;
  hours: string;
  days: string;
}

/**
 * Pure relative-time formatter. Takes localized unit templates so the caller
 * supplies `t.featureVoting.timeAgo`; `{n}` is replaced with the amount.
 */
export function formatTimeAgo(timestamp: number, labels: TimeAgoLabels): string {
  const diff = Date.now() - timestamp;
  const minutes = Math.floor(diff / 60_000);
  if (minutes < 1) return labels.justNow;
  if (minutes < 60) return labels.minutes.replace("{n}", String(minutes));
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return labels.hours.replace("{n}", String(hours));
  const days = Math.floor(hours / 24);
  return labels.days.replace("{n}", String(days));
}
