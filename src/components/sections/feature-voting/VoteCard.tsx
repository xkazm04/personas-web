"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronUp, ChevronDown, Check, Rocket, ExternalLink } from "lucide-react";
import { fadeUp } from "@/lib/animations";
import { accentTokens, type Feature, type ShippedInfo } from "./types";
import VoteParticles from "./VoteParticles";
import NotifyInput from "./NotifyInput";

export default function VoteCard({
  feature,
  count,
  voted,
  onVote,
  voterId,
  userEmail,
  shippedInfo,
}: {
  feature: Feature;
  count: number;
  voted: boolean;
  onVote: (featureId: string) => void;
  voterId: string | null;
  userEmail: string | null;
  shippedInfo: ShippedInfo | null;
}) {
  const [expanded, setExpanded] = useState(false);
  const [voteBurst, setVoteBurst] = useState(0);
  const t = accentTokens[feature.accent];
  const rgba = (a: number) => `rgba(${t.r},${t.g},${t.b},${a})`;
  const isShipped = !!shippedInfo;

  const handleVote = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isShipped) return;
    setVoteBurst((n) => n + 1);
    onVote(feature.id);
  };

  return (
    <motion.div
      variants={fadeUp}
      whileHover={{ y: -4, transition: { duration: 0.35, ease: "easeOut" } }}
      className={`group relative flex flex-col rounded-2xl border border-glass bg-gradient-to-b from-white/[0.03] to-transparent backdrop-blur-sm transition-all duration-500 hover:border-glass-hover hover:shadow-[0_8px_60px_rgba(0,0,0,0.35)] ${expanded ? "z-20" : "z-0"}`}
    >
      {/* Shipped badge */}
      {isShipped && (
        <div className="absolute top-3 right-3 z-20 flex items-center gap-1 rounded-full border border-brand-emerald/30 bg-brand-emerald/10 px-2.5 py-1 text-sm font-semibold uppercase tracking-wider text-brand-emerald shadow-[0_0_12px_rgba(52,211,153,0.15)]">
          <Rocket className="h-3 w-3" />
          Shipped
        </div>
      )}

      {/* Full-card illustration area */}
      <div className="relative flex flex-1 items-center justify-center py-12 sm:py-16 overflow-hidden rounded-t-2xl">
        <div
          className="pointer-events-none absolute inset-0 transition-opacity duration-700 opacity-0 group-hover:opacity-100"
          style={{
            background: `radial-gradient(circle at 50% 50%, ${rgba(0.14)} 0%, ${rgba(0.05)} 40%, transparent 70%)`,
          }}
        />
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background: `radial-gradient(circle at 50% 50%, ${rgba(0.05)} 0%, transparent 60%)`,
          }}
        />

        {/* Concentric ring decoration */}
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          {[60, 90, 126, 165].map((size) => (
            <div
              key={size}
              className="absolute rounded-full border transition-all duration-700 group-hover:scale-110"
              style={{ width: size, height: size, borderColor: rgba(0.04) }}
            />
          ))}
          <div
            className="absolute rounded-full border opacity-0 scale-90 transition-all duration-700 group-hover:opacity-100 group-hover:scale-100"
            style={{ width: 200, height: 200, borderColor: rgba(0.08) }}
          />
        </div>

        <div className="pointer-events-none absolute inset-0 opacity-[0.018] grid-texture-md" />

        {/* The icon */}
        <div className="relative z-10">
          <div
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-28 w-28 rounded-full opacity-0 blur-3xl transition-opacity duration-500 group-hover:opacity-100"
            style={{ background: rgba(0.35) }}
          />
          <div className="relative transition-opacity duration-500 group-hover:opacity-0">
            <feature.icon className="h-20 w-20 sm:h-24 sm:w-24 text-white/70 drop-shadow-lg" />
          </div>
          <div
            className="absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
            style={{
              color: rgba(1),
              filter: `drop-shadow(0 0 24px ${rgba(0.5)}) drop-shadow(0 0 50px ${rgba(0.25)})`,
            }}
          >
            <feature.icon className="h-20 w-20 sm:h-24 sm:w-24" />
          </div>
        </div>
      </div>

      {/* Bottom action row */}
      <div
        role="button"
        tabIndex={0}
        aria-expanded={expanded}
        className="relative z-10 cursor-pointer"
        onClick={() => setExpanded((v) => !v)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            setExpanded((v) => !v);
          }
        }}
      >
        <div
          className="absolute inset-x-0 top-0 h-px opacity-60"
          style={{ background: `linear-gradient(90deg, transparent, ${rgba(0.2)}, transparent)` }}
        />

        <div className="flex items-center gap-3 px-5 py-4">
          <motion.button
            onClick={handleVote}
            whileTap={!isShipped ? { scale: 0.88 } : undefined}
            transition={{ type: "spring", stiffness: 500, damping: 15 }}
            aria-pressed={voted}
            aria-label={`Vote for ${feature.title}, ${count} votes`}
            disabled={isShipped}
            className="relative flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-medium transition-all duration-300 cursor-pointer shrink-0 disabled:cursor-default disabled:opacity-60"
            style={
              isShipped
                ? {
                    backgroundColor: "rgba(52,211,153,0.1)",
                    borderColor: "rgba(52,211,153,0.25)",
                    color: "rgba(52,211,153,0.9)",
                  }
                : voted
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
            <VoteParticles color={rgba(0.8)} trigger={voteBurst} />
            {isShipped ? (
              <Check className="h-3.5 w-3.5" />
            ) : (
              <ChevronUp
                className={`h-3.5 w-3.5 transition-transform duration-300 ${voted ? "scale-110" : ""}`}
              />
            )}
            <AnimatePresence mode="popLayout">
              <motion.span
                key={count}
                className="tabular-nums"
                initial={{ y: -8, opacity: 0, scale: 1.4 }}
                animate={{ y: 0, opacity: 1, scale: 1 }}
                exit={{ y: 8, opacity: 0, scale: 0.8 }}
                transition={{ type: "spring", stiffness: 400, damping: 20 }}
              >
                {count}
              </motion.span>
            </AnimatePresence>
          </motion.button>

          <h3 className="text-base font-semibold leading-tight flex-1 text-center">{feature.title}</h3>

          <ChevronDown
            className={`h-4 w-4 text-muted-dark/60 shrink-0 transition-transform duration-300 ${expanded ? "rotate-180" : ""}`}
          />
        </div>
      </div>

      {/* Expandable description */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ opacity: 0, scaleY: 0.95 }}
            animate={{ opacity: 1, scaleY: 1 }}
            exit={{ opacity: 0, scaleY: 0.95 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            style={{ transformOrigin: "top" }}
            className="absolute left-0 right-0 bottom-0 translate-y-full z-30 rounded-b-2xl border border-t-0 border-glass-hover bg-[var(--bg-secondary,#0d0d12)] backdrop-blur-xl shadow-[0_12px_40px_rgba(0,0,0,0.5)]"
          >
            <div className="px-4 py-4">
              <div
                className="h-px mb-3 opacity-30"
                style={{ background: `linear-gradient(90deg, transparent, ${rgba(0.15)}, transparent)` }}
              />
              <p className="text-sm leading-relaxed text-muted-dark">
                {feature.description}
              </p>

              {isShipped && shippedInfo && (
                <div className="mt-3 rounded-lg border border-brand-emerald/10 bg-brand-emerald/[0.04] p-3">
                  {voted && (
                    <p className="text-sm font-semibold text-brand-emerald mb-1.5">
                      You asked for this — and we built it!
                    </p>
                  )}
                  <p className="text-sm leading-relaxed text-muted-dark">
                    {shippedInfo.changelog}
                  </p>
                  {shippedInfo.link && (
                    <a
                      href={shippedInfo.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="mt-2 inline-flex items-center gap-1 text-sm font-medium text-brand-emerald hover:text-brand-emerald/80 transition-colors"
                    >
                      Try it now
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  )}
                </div>
              )}

              {voted && !isShipped && voterId && (
                <div className="mt-3 rounded-lg border border-glass bg-white/[0.015] px-3 py-2.5">
                  <NotifyInput
                    featureId={feature.id}
                    voterId={voterId}
                    existingEmail={userEmail}
                  />
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
