"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronUp,
  ChevronDown,
  Lightbulb,
  Send,
  Check,
  MessageCircle,
  Reply,
  CornerDownRight,
  Rocket,
  ExternalLink,
} from "lucide-react";
import Image from "next/image";
import SectionWrapper from "@/components/SectionWrapper";
import GradientText from "@/components/GradientText";
import { fadeUp, staggerContainer } from "@/lib/animations";
import { trackFeatureVote, trackFeatureRequest, trackFeatureComment } from "@/lib/analytics";

/* ── Leonardo AI-generated illustrations ── */
const featureIllustrations: Record<string, string> = {
  macos: "/gen/vote/vote-macos.png",
  i18n: "/gen/vote/vote-i18n.png",
  dashboard: "/gen/vote/vote-dashboard.png",
  enterprise: "/gen/vote/vote-enterprise.png",
};

type Feature = {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  accent: "cyan" | "purple" | "emerald" | "amber";
  votes: number;
};

interface Comment {
  id: string;
  featureId: string;
  parentId: string | null;
  text: string;
  author: string;
  timestamp: number;
}

// ── Vote seed strategy ────────────────────────────────────────────────
// The `votes` field on each feature is a marketing seed value displayed
// before (and added to) real API vote counts. The API (votes/route.ts)
// returns ONLY real engagement counts — no server-side seeds. The
// displayed total is: seed + real votes. This is the single source of
// truth for seed values. To change initial display numbers, edit here.
// ──────────────────────────────────────────────────────────────────────
const features: Feature[] = [
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

/* ── Per-accent colour tokens (raw rgba values for inline styles) ── */

const accentTokens: Record<
  Feature["accent"],
  { r: number; g: number; b: number; tw: string }
> = {
  cyan:    { r: 6,   g: 182, b: 212, tw: "brand-cyan"    },
  purple:  { r: 168, g: 85,  b: 247, tw: "brand-purple"  },
  emerald: { r: 52,  g: 211, b: 153, tw: "brand-emerald" },
  amber:   { r: 251, g: 191, b: 36,  tw: "brand-amber"   },
};

/* ── localStorage persistence ── */

const LS_KEY = "personas-voted-features";

function readVotedIds(): Set<string> {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return new Set();
    const parsed: unknown = JSON.parse(raw);
    if (Array.isArray(parsed)) return new Set(parsed.filter((v): v is string => typeof v === "string"));
  } catch { /* corrupt or unavailable */ }
  return new Set();
}

function writeVotedIds(ids: Set<string>) {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify([...ids]));
  } catch { /* storage full or unavailable */ }
}

/* ── Comment localStorage persistence ── */

const LS_COMMENTS_KEY = "personas-feature-comments";
const LS_AUTHOR_KEY = "personas-comment-author";

const ANON_ADJECTIVES = ["Swift", "Bright", "Quiet", "Bold", "Keen", "Calm", "Warm", "Sharp"];
const ANON_NOUNS = ["Fox", "Owl", "Wolf", "Bear", "Hawk", "Lynx", "Hare", "Wren"];

function getOrCreateAuthor(): string {
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

function readComments(): Comment[] {
  try {
    const raw = localStorage.getItem(LS_COMMENTS_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (Array.isArray(parsed)) return parsed.filter(isValidComment);
  } catch { /* corrupt or unavailable */ }
  return [];
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

function writeComments(comments: Comment[]) {
  try {
    localStorage.setItem(LS_COMMENTS_KEY, JSON.stringify(comments));
  } catch { /* storage full or unavailable */ }
}

/* ── Boost localStorage persistence ── */

const LS_BOOSTS_KEY = "personas-boosted-features";
const KOFI_USERNAME = process.env.NEXT_PUBLIC_KOFI_USERNAME ?? "";

function readBoosts(): Record<string, number> {
  try {
    const raw = localStorage.getItem(LS_BOOSTS_KEY);
    if (!raw) return {};
    const parsed: unknown = JSON.parse(raw);
    if (typeof parsed === "object" && parsed !== null) return parsed as Record<string, number>;
  } catch { /* corrupt or unavailable */ }
  return {};
}

function writeBoosts(boosts: Record<string, number>) {
  try {
    localStorage.setItem(LS_BOOSTS_KEY, JSON.stringify(boosts));
  } catch { /* storage full or unavailable */ }
}

const BOOST_TIERS = [
  { label: "$5", value: 5, weight: 5 },
  { label: "$15", value: 15, weight: 15 },
  { label: "$25", value: 25, weight: 25 },
] as const;

function formatTimeAgo(timestamp: number): string {
  const diff = Date.now() - timestamp;
  const minutes = Math.floor(diff / 60_000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

/* ── Comment input ── */

function CommentInput({
  onSubmit,
  placeholder,
  accentRgba,
  autoFocus = false,
}: {
  onSubmit: (text: string) => void;
  placeholder: string;
  accentRgba: (a: number) => string;
  autoFocus?: boolean;
}) {
  const [value, setValue] = useState("");

  const handleSubmit = () => {
    const trimmed = value.trim();
    if (!trimmed) return;
    onSubmit(trimmed);
    setValue("");
  };

  return (
    <div className="flex gap-2">
      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => { if (e.key === "Enter") handleSubmit(); }}
        placeholder={placeholder}
        autoFocus={autoFocus}
        maxLength={280}
        className="flex-1 rounded-lg border border-white/[0.06] bg-white/[0.02] px-3 py-1.5 text-xs text-foreground placeholder:text-muted-dark outline-none transition-all duration-300 focus:border-white/[0.12] focus:bg-white/[0.03]"
      />
      <button
        onClick={handleSubmit}
        disabled={!value.trim()}
        className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border transition-all duration-300 cursor-pointer"
        style={
          value.trim()
            ? { borderColor: accentRgba(0.25), backgroundColor: accentRgba(0.1), color: accentRgba(1) }
            : { borderColor: "rgba(255,255,255,0.06)", backgroundColor: "rgba(255,255,255,0.02)", color: "var(--muted-dark)" }
        }
      >
        <Send className="h-3 w-3" />
      </button>
    </div>
  );
}

/* ── Single comment ── */

function CommentBubble({
  comment,
  accentRgba,
  onReply,
  depth = 0,
}: {
  comment: Comment;
  accentRgba: (a: number) => string;
  onReply: (parentId: string) => void;
  depth?: number;
}) {
  return (
    <div className={depth > 0 ? "ml-4 pl-3 border-l border-white/[0.04]" : ""}>
      <div className="py-1.5">
        <div className="flex items-center gap-2 mb-0.5">
          <span
            className="text-[10px] font-semibold font-mono tracking-wide"
            style={{ color: accentRgba(0.7) }}
          >
            {comment.author}
          </span>
          <span className="text-[9px] text-muted-dark/50 font-mono">
            {formatTimeAgo(comment.timestamp)}
          </span>
        </div>
        <p className="text-xs leading-relaxed text-muted-dark">{comment.text}</p>
        <button
          onClick={() => onReply(comment.id)}
          className="mt-1 flex items-center gap-1 text-[10px] text-muted-dark/40 hover:text-muted-dark/70 transition-colors cursor-pointer"
        >
          <Reply className="h-2.5 w-2.5" />
          Reply
        </button>
      </div>
    </div>
  );
}

/* ── Threaded comments for a feature ── */

function CommentThread({
  featureId,
  comments,
  onAddComment,
  accentRgba,
}: {
  featureId: string;
  comments: Comment[];
  onAddComment: (featureId: string, text: string, parentId: string | null) => void;
  accentRgba: (a: number) => string;
}) {
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const featureComments = comments.filter((c) => c.featureId === featureId);
  const topLevel = featureComments.filter((c) => c.parentId === null);
  const replies = featureComments.filter((c) => c.parentId !== null);

  const getReplies = (parentId: string) =>
    replies.filter((c) => c.parentId === parentId).sort((a, b) => a.timestamp - b.timestamp);

  const handleReply = (parentId: string) => {
    setReplyingTo((prev) => (prev === parentId ? null : parentId));
  };

  return (
    <div className="space-y-1">
      {topLevel.length === 0 && (
        <p className="text-[10px] text-muted-dark/40 font-mono py-1">
          No comments yet. Be the first to share your thoughts.
        </p>
      )}
      {topLevel.sort((a, b) => a.timestamp - b.timestamp).map((comment) => (
        <div key={comment.id}>
          <CommentBubble
            comment={comment}
            accentRgba={accentRgba}
            onReply={handleReply}
          />
          {/* Replies */}
          {getReplies(comment.id).map((reply) => (
            <CommentBubble
              key={reply.id}
              comment={reply}
              accentRgba={accentRgba}
              onReply={handleReply}
              depth={1}
            />
          ))}
          {/* Reply input */}
          <AnimatePresence>
            {replyingTo === comment.id && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden ml-4 pl-3 border-l border-white/[0.04]"
              >
                <div className="flex items-center gap-1 mb-1.5 mt-1">
                  <CornerDownRight className="h-2.5 w-2.5 text-muted-dark/30" />
                  <span className="text-[10px] text-muted-dark/40 font-mono">Replying</span>
                </div>
                <CommentInput
                  onSubmit={(text) => {
                    onAddComment(featureId, text, comment.id);
                    setReplyingTo(null);
                  }}
                  placeholder="Write a reply..."
                  accentRgba={accentRgba}
                  autoFocus
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      ))}

      {/* Top-level comment input */}
      <div className="pt-2">
        <CommentInput
          onSubmit={(text) => onAddComment(featureId, text, null)}
          placeholder="Add a comment..."
          accentRgba={accentRgba}
        />
      </div>
    </div>
  );
}

/* ── Card ── */

function VoteCard({
  feature,
  initialVoted,
  onToggleVote,
  comments,
  onAddComment,
  boostCount,
  onBoost,
  showBoostUI,
}: {
  feature: Feature;
  initialVoted: boolean;
  onToggleVote: (featureId: string, voted: boolean) => void;
  comments: Comment[];
  onAddComment: (featureId: string, text: string, parentId: string | null) => void;
  boostCount: number;
  onBoost: (featureId: string, tier: number) => void;
  showBoostUI: boolean;
}) {
  const [voted, setVoted] = useState(initialVoted);
  const [count, setCount] = useState(feature.votes + (initialVoted ? 1 : 0));
  const [showTiers, setShowTiers] = useState(false);
  const [imgLoaded, setImgLoaded] = useState(false);

  // Sync with hydrated votedIds (initial render has empty set, useEffect fills it)
  useEffect(() => {
    queueMicrotask(() => {
      setVoted(initialVoted);
      setCount(feature.votes + (initialVoted ? 1 : 0));
    });
  }, [initialVoted, feature.votes]);
  const [expanded, setExpanded] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const t = accentTokens[feature.accent];
  const rgba = (a: number) => `rgba(${t.r},${t.g},${t.b},${a})`;
  const commentCount = comments.filter((c) => c.featureId === feature.id).length;

  const handleVote = (e: React.MouseEvent) => {
    e.stopPropagation();
    trackFeatureVote(feature.id, voted ? "undo" : "upvote");
    const newVoted = !voted;
    setVoted(newVoted);
    setCount((c) => c + (newVoted ? 1 : -1));
    onToggleVote(feature.id, newVoted);
  };

  return (
    <motion.div
      variants={fadeUp}
      whileHover={{ y: -4, transition: { duration: 0.35, ease: "easeOut" } }}
      className="group relative flex flex-col overflow-hidden rounded-2xl border border-white/[0.05] bg-gradient-to-b from-white/[0.03] to-transparent backdrop-blur-sm transition-all duration-500 hover:border-white/[0.1] hover:shadow-[0_8px_60px_rgba(0,0,0,0.35)]"
    >
      {/* ── Full-card illustration area ── */}
      <div className="relative flex flex-1 items-center justify-center py-20 sm:py-24 overflow-hidden">
        {/* Faint accent placeholder glow (visible while image loads) */}
        <div
          className="pointer-events-none absolute inset-0 transition-opacity duration-700"
          style={{
            opacity: imgLoaded ? 0 : 1,
            background: `radial-gradient(circle at 50% 50%, ${rgba(0.06)} 0%, transparent 60%)`,
          }}
        />

        {/* Leonardo AI-generated illustration with lazy load + fade-in */}
        {featureIllustrations[feature.id] && (
          <div
            className="absolute inset-0 transition-opacity duration-700 ease-out"
            style={{ opacity: imgLoaded ? 1 : 0 }}
          >
            <Image
              src={featureIllustrations[feature.id]}
              alt={feature.title}
              fill
              sizes="(max-width: 640px) 100vw, 50vw"
              loading="lazy"
              className="object-cover opacity-60 group-hover:opacity-90 transition-opacity duration-700"
              onLoad={() => setImgLoaded(true)}
            />
          </div>
        )}

        {/* Gradient fade edges */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background: `linear-gradient(to bottom, transparent 40%, rgba(10,10,18,0.9) 100%), radial-gradient(circle at 50% 50%, transparent 30%, rgba(10,10,18,0.6) 100%)`,
          }}
        />
        {/* Accent glow on hover */}
        <div
          className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700"
          style={{
            background: `radial-gradient(circle at 50% 60%, ${rgba(0.12)} 0%, transparent 60%)`,
          }}
        />
      </div>

      {/* ── Bottom action row: Upvote + Feature Name ── */}
      <div
        className="relative z-10 cursor-pointer"
        onClick={() => setExpanded((v) => !v)}
      >
        {/* Top accent line */}
        <div
          className="absolute inset-x-0 top-0 h-px opacity-60"
          style={{ background: `linear-gradient(90deg, transparent, ${rgba(0.2)}, transparent)` }}
        />

        <div className="flex items-center gap-3 px-4 py-3">
          <button
            onClick={handleVote}
            className="flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-all duration-300 cursor-pointer shrink-0"
            style={
              voted
                ? {
                    backgroundColor: rgba(0.15),
                    borderColor: rgba(0.3),
                    color: rgba(1),
                    boxShadow: `0 0 20px ${rgba(0.2)}`,
                  }
                : {
                    backgroundColor: "rgba(255,255,255,0.03)",
                    borderColor: "rgba(255,255,255,0.06)",
                    color: "var(--muted-dark)",
                  }
            }
          >
            <ChevronUp
              className={`h-3.5 w-3.5 transition-transform duration-300 ${voted ? "scale-110" : ""}`}
            />
            <span className="tabular-nums">{count}</span>
          </button>

          <h3 className="text-sm font-semibold leading-tight flex-1 text-center">{feature.title}</h3>

          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowComments((v) => !v);
              if (!showComments) setExpanded(true);
            }}
            className="flex items-center gap-1 rounded-full border px-2 py-1 text-[10px] font-medium transition-all duration-300 cursor-pointer shrink-0"
            style={
              showComments
                ? { borderColor: rgba(0.2), backgroundColor: rgba(0.08), color: rgba(0.8) }
                : { borderColor: "rgba(255,255,255,0.06)", backgroundColor: "rgba(255,255,255,0.02)", color: "var(--muted-dark)" }
            }
          >
            <MessageCircle className="h-3 w-3" />
            {commentCount > 0 && <span className="tabular-nums">{commentCount}</span>}
          </button>

          {/* Boost button */}
          {showBoostUI && (
            <div className="relative shrink-0">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowTiers((v) => !v);
                }}
                className="flex items-center gap-1 rounded-full border px-2 py-1 text-[10px] font-medium transition-all duration-300 cursor-pointer"
                style={
                  boostCount > 0
                    ? { borderColor: rgba(0.25), backgroundColor: rgba(0.1), color: rgba(0.9) }
                    : { borderColor: "rgba(255,255,255,0.06)", backgroundColor: "rgba(255,255,255,0.02)", color: "var(--muted-dark)" }
                }
              >
                <Rocket className="h-3 w-3" />
                {boostCount > 0 && <span className="tabular-nums">{boostCount}</span>}
              </button>

              {/* Tier popover */}
              <AnimatePresence>
                {showTiers && (
                  <motion.div
                    initial={{ opacity: 0, y: 4, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 4, scale: 0.95 }}
                    transition={{ duration: 0.15 }}
                    className="absolute bottom-full right-0 mb-2 flex items-center gap-1.5 rounded-xl border border-white/[0.08] bg-background/95 backdrop-blur-xl px-2.5 py-2 shadow-2xl z-20"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <span className="text-[9px] text-muted-dark/60 font-mono mr-1">Boost</span>
                    {BOOST_TIERS.map((tier) => (
                      <a
                        key={tier.value}
                        href={`https://ko-fi.com/${KOFI_USERNAME}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={() => {
                          onBoost(feature.id, tier.weight);
                          setShowTiers(false);
                        }}
                        className="rounded-lg border px-2.5 py-1 text-[11px] font-medium transition-all duration-200 hover:scale-105 cursor-pointer"
                        style={{
                          borderColor: rgba(0.2),
                          backgroundColor: rgba(0.06),
                          color: rgba(0.9),
                        }}
                      >
                        {tier.label}
                      </a>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}

          <ChevronDown
            className={`h-4 w-4 text-muted-dark shrink-0 transition-transform duration-300 ${expanded ? "rotate-180" : ""}`}
          />
        </div>

        {/* Expandable description */}
        <AnimatePresence>
          {expanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="overflow-hidden"
            >
              <div className="px-4 pb-4">
                <div
                  className="h-px mb-3 opacity-30"
                  style={{ background: `linear-gradient(90deg, transparent, ${rgba(0.15)}, transparent)` }}
                />
                <p className="text-[13px] leading-relaxed text-muted-dark">
                  {feature.description}
                </p>

                {/* Threaded comments */}
                <AnimatePresence>
                  {showComments && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25, ease: "easeOut" }}
                      className="overflow-hidden"
                    >
                      <div
                        className="h-px mt-3 mb-3 opacity-30"
                        style={{ background: `linear-gradient(90deg, transparent, ${rgba(0.15)}, transparent)` }}
                      />
                      <div className="flex items-center gap-1.5 mb-2">
                        <MessageCircle className="h-3 w-3 text-muted-dark/50" />
                        <span className="text-[10px] font-semibold text-muted-dark/50 font-mono tracking-wider uppercase">
                          Discussion
                        </span>
                      </div>
                      <CommentThread
                        featureId={feature.id}
                        comments={comments}
                        onAddComment={onAddComment}
                        accentRgba={rgba}
                      />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

/* ── Custom feature request ── */

function CustomRequest() {
  const [value, setValue] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = () => {
    if (!value.trim()) return;
    trackFeatureRequest(value.trim());
    setSubmitted(true);
    setValue("");
  };

  return (
    <motion.div variants={fadeUp} className="mt-6 mx-auto max-w-2xl">
      <div className="relative overflow-hidden rounded-2xl border border-white/[0.05] bg-gradient-to-br from-white/[0.025] to-transparent backdrop-blur-sm transition-all duration-500 hover:border-white/[0.08]">
        {/* Grid texture */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.015]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.06) 1px, transparent 1px)",
            backgroundSize: "20px 20px",
          }}
        />
        {/* Top shine */}
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />

        <div className="relative z-10 p-4">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-cyan/8 ring-1 ring-brand-cyan/15">
              <Lightbulb className="h-4 w-4 text-brand-cyan/70" />
            </div>
            <div>
              <h4 className="text-sm font-semibold">Something else in mind?</h4>
              <p className="text-[11px] text-muted-dark font-mono tracking-wide">
                Suggest a feature
              </p>
            </div>
          </div>

          <div className="flex gap-2.5">
            <div className="relative flex-1">
              <input
                type="text"
                value={value}
                onChange={(e) => {
                  setValue(e.target.value);
                  if (submitted) setSubmitted(false);
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleSubmit();
                }}
                placeholder="Describe the feature you'd like to see..."
                className="w-full rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-2.5 text-sm text-foreground placeholder:text-muted-dark outline-none transition-all duration-300 focus:border-brand-cyan/25 focus:bg-white/[0.03] focus:shadow-[0_0_20px_rgba(6,182,212,0.06)]"
              />
              {/* Focus glow accent under the input */}
              <div className="pointer-events-none absolute inset-x-4 -bottom-px h-px bg-gradient-to-r from-transparent via-brand-cyan/0 to-transparent transition-all duration-300 peer-focus:via-brand-cyan/20" />
            </div>
            <button
              onClick={handleSubmit}
              disabled={!value.trim() && !submitted}
              className={`flex h-[42px] w-[42px] shrink-0 items-center justify-center rounded-xl border transition-all duration-300 cursor-pointer ${
                submitted
                  ? "border-brand-emerald/30 bg-brand-emerald/15 text-brand-emerald shadow-[0_0_15px_rgba(52,211,153,0.15)]"
                  : value.trim()
                    ? "border-brand-cyan/25 bg-brand-cyan/10 text-brand-cyan hover:bg-brand-cyan/15 hover:shadow-[0_0_15px_rgba(6,182,212,0.15)]"
                    : "border-white/[0.06] bg-white/[0.02] text-muted-dark"
              }`}
            >
              {submitted ? (
                <Check className="h-4 w-4" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </button>
          </div>

          {/* Submitted confirmation */}
          {submitted && (
            <motion.p
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-3 text-xs text-brand-emerald/70 font-mono tracking-wide"
            >
              Thanks! Your suggestion has been recorded.
            </motion.p>
          )}

          {/* Sponsor link */}
          {KOFI_USERNAME && (
            <div className="mt-3 flex items-center justify-end">
              <a
                href={`https://ko-fi.com/${KOFI_USERNAME}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-[10px] font-mono text-muted-dark/50 hover:text-brand-cyan/70 transition-colors"
              >
                <Rocket className="h-3 w-3" />
                Sponsor this request
                <ExternalLink className="h-2.5 w-2.5" />
              </a>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

/* ── Section ── */

export default function FeatureVoting() {
  const [votedIds, setVotedIds] = useState<Set<string>>(new Set());
  const [comments, setComments] = useState<Comment[]>([]);
  const [boosts, setBoosts] = useState<Record<string, number>>({});

  // Hydrate from localStorage after mount (avoids SSR mismatch)
  useEffect(() => {
    queueMicrotask(() => {
      setVotedIds(readVotedIds());
      setComments(readComments());
      setBoosts(readBoosts());
    });
  }, []);

  const handleToggleVote = useCallback((featureId: string, voted: boolean) => {
    setVotedIds((prev) => {
      const next = new Set(prev);
      if (voted) next.add(featureId);
      else next.delete(featureId);
      writeVotedIds(next);
      return next;
    });
  }, []);

  const handleAddComment = useCallback((featureId: string, text: string, parentId: string | null) => {
    const author = getOrCreateAuthor();
    const newComment: Comment = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      featureId,
      parentId,
      text,
      author,
      timestamp: Date.now(),
    };
    trackFeatureComment(featureId, parentId ? "reply" : "add");
    setComments((prev) => {
      const next = [...prev, newComment];
      writeComments(next);
      return next;
    });
  }, []);

  const handleBoost = useCallback((featureId: string, weight: number) => {
    setBoosts((prev) => {
      const next = { ...prev, [featureId]: (prev[featureId] ?? 0) + weight };
      writeBoosts(next);
      return next;
    });
  }, []);

  const totalBoosts = Object.values(boosts).reduce((s, v) => s + v, 0);
  const sorted = [...features].sort((a, b) => b.votes - a.votes);

  return (
    <SectionWrapper id="vote">
      {/* Header */}
      <motion.div variants={fadeUp} className="text-center relative">
        <span className="inline-block rounded-full border border-brand-purple/30 bg-brand-purple/10 px-4 py-1.5 text-xs font-semibold tracking-widest uppercase text-brand-purple shadow-[0_0_15px_rgba(168,85,247,0.2)] font-mono mb-6">
          Community
        </span>
        <span className="ml-2 inline-block rounded-full border border-white/[0.08] bg-white/[0.04] px-2.5 py-1 text-[10px] font-mono tracking-wider uppercase text-muted-dark/60 mb-6">
          Demo
        </span>
        <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl md:text-6xl drop-shadow-md">
          Vote for{" "}
          <GradientText className="drop-shadow-lg">what&apos;s next</GradientText>
        </h2>
        <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-dark leading-relaxed font-light">
          Help us prioritize. Pick the features that matter most to you
          and shape the future of Personas.
        </p>
      </motion.div>

      {/* Cards grid */}
      <motion.div
        variants={staggerContainer}
        className="mt-16 grid gap-6 sm:grid-cols-2"
      >
        {sorted.map((feature) => (
          <VoteCard
            key={feature.id}
            feature={feature}
            initialVoted={votedIds.has(feature.id)}
            onToggleVote={handleToggleVote}
            comments={comments}
            onAddComment={handleAddComment}
            boostCount={boosts[feature.id] ?? 0}
            onBoost={handleBoost}
            showBoostUI={!!KOFI_USERNAME}
          />
        ))}
      </motion.div>

      {/* Custom feature request */}
      <CustomRequest />

      {/* Footer note */}
      <motion.div variants={fadeUp} className="mt-8 text-center">
        <p className="text-xs font-mono text-muted-dark tracking-wide">
          {(sorted.reduce((s, f) => s + f.votes, 0) + votedIds.size).toLocaleString()} total
          votes&ensp;·&ensp;{comments.length} comment{comments.length !== 1 ? "s" : ""}{totalBoosts > 0 && <>&ensp;·&ensp;{totalBoosts} boost{totalBoosts !== 1 ? "s" : ""}</>}&ensp;·&ensp;Stored in your browser
        </p>
        <p className="mt-1.5 text-[10px] text-muted-dark/60 font-mono tracking-wide">
          Demo mode &mdash; votes and comments are saved locally and are not shared with other users
        </p>
      </motion.div>
    </SectionWrapper>
  );
}
