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

export const LS_KEY = "personas-voted-features";
export const LS_COMMENTS_KEY = "personas-feature-comments";
export const LS_AUTHOR_KEY = "personas-comment-author";
export const LS_BOOSTS_KEY = "personas-boosted-features";

export const KOFI_USERNAME = process.env.NEXT_PUBLIC_KOFI_USERNAME ?? "";

export const ANON_ADJECTIVES = ["Swift", "Bright", "Quiet", "Bold", "Keen", "Calm", "Warm", "Sharp"];
export const ANON_NOUNS = ["Fox", "Owl", "Wolf", "Bear", "Hawk", "Lynx", "Hare", "Wren"];

export const BOOST_TIERS = [
  { label: "$5", value: 5, weight: 5 },
  { label: "$15", value: 15, weight: 15 },
  { label: "$25", value: 25, weight: 25 },
] as const;

export function readVotedIds(): Set<string> {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return new Set();
    const parsed: unknown = JSON.parse(raw);
    if (Array.isArray(parsed))
      return new Set(parsed.filter((v): v is string => typeof v === "string"));
  } catch {
    /* corrupt or unavailable */
  }
  return new Set();
}

export function writeVotedIds(ids: Set<string>) {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify([...ids]));
  } catch {
    /* storage full */
  }
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

function isValidComment(c: unknown): c is Comment {
  if (typeof c !== "object" || c === null) return false;
  const obj = c as Record<string, unknown>;
  return (
    typeof obj.id === "string" &&
    typeof obj.featureId === "string" &&
    (obj.parentId === null || typeof obj.parentId === "string") &&
    typeof obj.text === "string" &&
    typeof obj.author === "string" &&
    typeof obj.timestamp === "number"
  );
}

export function readComments(): Comment[] {
  try {
    const raw = localStorage.getItem(LS_COMMENTS_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (Array.isArray(parsed)) return parsed.filter(isValidComment);
  } catch {
    /* corrupt */
  }
  return [];
}

export function writeComments(comments: Comment[]) {
  try {
    localStorage.setItem(LS_COMMENTS_KEY, JSON.stringify(comments));
  } catch {
    /* storage full */
  }
}

export function readBoosts(): Record<string, number> {
  try {
    const raw = localStorage.getItem(LS_BOOSTS_KEY);
    if (!raw) return {};
    const parsed: unknown = JSON.parse(raw);
    if (typeof parsed === "object" && parsed !== null)
      return parsed as Record<string, number>;
  } catch {
    /* corrupt */
  }
  return {};
}

export function writeBoosts(boosts: Record<string, number>) {
  try {
    localStorage.setItem(LS_BOOSTS_KEY, JSON.stringify(boosts));
  } catch {
    /* storage full */
  }
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
