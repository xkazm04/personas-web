"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Apple,
  Globe,
  LayoutDashboard,
  Building2,
  ChevronUp,
  Lightbulb,
  Send,
  Check,
} from "lucide-react";
import SectionWrapper from "@/components/SectionWrapper";
import GradientText from "@/components/GradientText";
import { fadeUp, staggerContainer } from "@/lib/animations";
import { trackFeatureVote, trackFeatureRequest } from "@/lib/analytics";

type Feature = {
  id: string;
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  subtitle: string;
  description: string;
  accent: "cyan" | "purple" | "emerald" | "amber";
  votes: number;
};

const features: Feature[] = [
  {
    id: "macos",
    icon: Apple,
    title: "macOS Support",
    subtitle: "Native experience",
    description:
      "Full native macOS build with Apple Silicon optimization, Spotlight integration, and menu bar agent controls.",
    accent: "cyan",
    votes: 342,
  },
  {
    id: "i18n",
    icon: Globe,
    title: "Internationalization",
    subtitle: "Global reach",
    description:
      "Multi-language agent instructions, localized UI, and region-aware scheduling for worldwide teams.",
    accent: "purple",
    votes: 189,
  },
  {
    id: "dashboard",
    icon: LayoutDashboard,
    title: "Web Dashboard",
    subtitle: "Monitor anywhere",
    description:
      "Browser-based dashboard for real-time agent monitoring, execution history, and fleet management from any device.",
    accent: "emerald",
    votes: 276,
  },
  {
    id: "enterprise",
    icon: Building2,
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

/* ── Card ── */

function VoteCard({ feature, rank }: { feature: Feature; rank: number }) {
  const [voted, setVoted] = useState(false);
  const [count, setCount] = useState(feature.votes);
  const t = accentTokens[feature.accent];
  const rgba = (a: number) => `rgba(${t.r},${t.g},${t.b},${a})`;

  const maxVotes = Math.max(...features.map((f) => f.votes)) + 1;
  const barWidth = Math.max((count / maxVotes) * 100, 12);

  const handleVote = () => {
    trackFeatureVote(feature.id, voted ? "undo" : "upvote");
    if (voted) {
      setVoted(false);
      setCount((c) => c - 1);
    } else {
      setVoted(true);
      setCount((c) => c + 1);
    }
  };

  return (
    <motion.div
      variants={fadeUp}
      whileHover={{ y: -4, transition: { duration: 0.35, ease: "easeOut" } }}
      className="group relative flex flex-col overflow-hidden rounded-2xl border border-white/[0.05] bg-gradient-to-b from-white/[0.03] to-transparent backdrop-blur-sm transition-all duration-500 hover:border-white/[0.1] hover:shadow-[0_8px_60px_rgba(0,0,0,0.35)]"
    >
      {/* ── Illustration area (top) ── */}
      <div className="relative flex items-center justify-center py-14 sm:py-16 overflow-hidden">
        {/* Ambient radial glow — rests dim, blooms on hover */}
        <div
          className="pointer-events-none absolute inset-0 transition-opacity duration-700 opacity-0 group-hover:opacity-100"
          style={{
            background: `radial-gradient(circle at 50% 55%, ${rgba(0.12)} 0%, ${rgba(0.04)} 40%, transparent 70%)`,
          }}
        />
        {/* Always-on faint glow so the area isn't fully flat */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background: `radial-gradient(circle at 50% 55%, ${rgba(0.04)} 0%, transparent 60%)`,
          }}
        />

        {/* Concentric ring decoration */}
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          {[72, 104, 140].map((size) => (
            <div
              key={size}
              className="absolute rounded-full border transition-all duration-700 group-hover:scale-110"
              style={{
                width: size,
                height: size,
                borderColor: rgba(0.04),
              }}
            />
          ))}
          {/* Hover-only outer pulse ring */}
          <div
            className="absolute rounded-full border opacity-0 scale-90 transition-all duration-700 group-hover:opacity-100 group-hover:scale-100"
            style={{
              width: 180,
              height: 180,
              borderColor: rgba(0.08),
            }}
          />
        </div>

        {/* Corner grid pattern */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.018]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.06) 1px, transparent 1px)",
            backgroundSize: "20px 20px",
          }}
        />

        {/* The icon — white → accent colour + glow on hover */}
        <div className="relative z-10">
          {/* Glow orb behind icon (only visible on hover) */}
          <div
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-20 w-20 rounded-full opacity-0 blur-2xl transition-opacity duration-500 group-hover:opacity-100"
            style={{ background: rgba(0.35) }}
          />
          {/* White icon — fades out on hover */}
          <div className="relative transition-opacity duration-500 group-hover:opacity-0">
            <feature.icon className="h-14 w-14 sm:h-16 sm:w-16 text-white/70 drop-shadow-lg" />
          </div>
          {/* Coloured duplicate layered on top — fades in on hover */}
          <div
            className="absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
            style={{
              color: rgba(1),
              filter: `drop-shadow(0 0 18px ${rgba(0.5)}) drop-shadow(0 0 40px ${rgba(0.25)})`,
            }}
          >
            <feature.icon className="h-14 w-14 sm:h-16 sm:w-16" />
          </div>
        </div>

        {/* Rank badge */}
        <span
          className="absolute top-4 right-4 font-mono text-[11px] tabular-nums transition-colors duration-500 text-white/15 group-hover:text-white/30"
        >
          #{rank}
        </span>

        {/* Bottom edge fade into metadata area */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-[#0a0a12] to-transparent" />
      </div>

      {/* ── Metadata area (bottom) ── */}
      <div className="relative z-10 flex flex-1 flex-col px-5 pb-5 pt-1">
        {/* Top accent line */}
        <div
          className="absolute inset-x-5 top-0 h-px opacity-40 transition-opacity duration-500 group-hover:opacity-80"
          style={{ background: `linear-gradient(90deg, transparent, ${rgba(0.25)}, transparent)` }}
        />

        <div className="flex items-center gap-2.5 mt-1">
          <h3 className="text-base font-semibold leading-tight">{feature.title}</h3>
          <span
            className="rounded-full border px-2 py-0.5 text-[10px] font-mono uppercase tracking-wider transition-colors duration-500"
            style={{
              borderColor: rgba(0.15),
              backgroundColor: rgba(0.06),
              color: rgba(0.7),
            }}
          >
            {feature.subtitle}
          </span>
        </div>

        <p className="mt-2.5 text-[13px] leading-relaxed text-muted-dark flex-1">
          {feature.description}
        </p>

        {/* Vote bar */}
        <div className="mt-4">
          <div className="relative h-1 rounded-full bg-white/[0.04] overflow-hidden">
            <motion.div
              className="absolute inset-y-0 left-0 rounded-full"
              style={{
                background: `linear-gradient(90deg, ${rgba(0.45)}, ${rgba(0.15)})`,
              }}
              initial={{ width: 0 }}
              whileInView={{ width: `${barWidth}%` }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
            />
          </div>
        </div>

        {/* Vote action row */}
        <div className="mt-3 flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs font-mono text-muted-dark/60">
            <span className="tabular-nums font-medium text-white/70">
              {count.toLocaleString()}
            </span>
            <span>votes</span>
          </div>
          <button
            onClick={handleVote}
            className="flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-xs font-medium transition-all duration-300 cursor-pointer"
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
              className={`h-3.5 w-3.5 transition-transform duration-300 ${
                voted ? "scale-110" : ""
              }`}
            />
            <span>{voted ? "Voted" : "Upvote"}</span>
          </button>
        </div>
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
    trackFeatureRequest();
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

        <div className="relative z-10 p-5">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-cyan/8 ring-1 ring-brand-cyan/15">
              <Lightbulb className="h-4 w-4 text-brand-cyan/70" />
            </div>
            <div>
              <h4 className="text-sm font-semibold">Something else in mind?</h4>
              <p className="text-[11px] text-muted-dark/60 font-mono tracking-wide">
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
                className="w-full rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-2.5 text-sm text-foreground placeholder:text-muted-dark/40 outline-none transition-all duration-300 focus:border-brand-cyan/25 focus:bg-white/[0.03] focus:shadow-[0_0_20px_rgba(6,182,212,0.06)]"
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
                    : "border-white/[0.06] bg-white/[0.02] text-muted-dark/30"
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
        </div>
      </div>
    </motion.div>
  );
}

/* ── Section ── */

export default function FeatureVoting() {
  const sorted = [...features].sort((a, b) => b.votes - a.votes);

  return (
    <SectionWrapper id="vote" dotGrid>
      {/* Background accents */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div
          className="absolute right-[10%] top-[15%] h-[400px] w-[400px] rounded-full opacity-30"
          style={{
            background:
              "radial-gradient(circle, rgba(168,85,247,0.04) 0%, transparent 60%)",
          }}
        />
        <div
          className="absolute left-[5%] bottom-[20%] h-[350px] w-[350px] rounded-full opacity-30"
          style={{
            background:
              "radial-gradient(circle, rgba(6,182,212,0.03) 0%, transparent 60%)",
          }}
        />
      </div>

      {/* Header */}
      <motion.div variants={fadeUp} className="text-center relative">
        <span className="inline-block rounded-full border border-brand-purple/30 bg-brand-purple/10 px-4 py-1.5 text-xs font-semibold tracking-widest uppercase text-brand-purple shadow-[0_0_15px_rgba(168,85,247,0.2)] font-mono mb-6">
          Community
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
        className="mt-16 grid gap-5 sm:grid-cols-2"
      >
        {sorted.map((feature, i) => (
          <VoteCard key={feature.id} feature={feature} rank={i + 1} />
        ))}
      </motion.div>

      {/* Custom feature request */}
      <CustomRequest />

      {/* Footer note */}
      <motion.div variants={fadeUp} className="mt-8 text-center">
        <p className="text-xs font-mono text-muted-dark/50 tracking-wide">
          {sorted.reduce((s, f) => s + f.votes, 0).toLocaleString()} total
          votes cast&ensp;·&ensp;Results reset monthly
        </p>
      </motion.div>
    </SectionWrapper>
  );
}
