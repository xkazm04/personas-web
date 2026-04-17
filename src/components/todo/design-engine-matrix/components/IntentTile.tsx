"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import { USER_PROMPT } from "../../designMatrixShared";
import { INTENT_IMAGE, CELL_MIN_HEIGHT } from "../data";

export default function IntentTile({
  userTyped,
  phase,
  filledCount,
}: {
  userTyped: string;
  phase: "idle" | "running" | "done";
  filledCount: number;
}) {
  const accent = phase === "done" ? "#34d399" : "#a855f7";
  const isActive = phase !== "idle";

  return (
    <motion.div
      className="relative flex flex-col rounded-2xl border-2 overflow-hidden"
      style={{
        minHeight: CELL_MIN_HEIGHT,
        height: CELL_MIN_HEIGHT,
        borderColor: `${accent}60`,
        boxShadow: `0 0 56px ${accent}25, inset 0 0 56px ${accent}10`,
      }}
      animate={{
        boxShadow:
          phase === "running"
            ? [
                `0 0 40px ${accent}25, inset 0 0 40px ${accent}10`,
                `0 0 64px ${accent}40, inset 0 0 64px ${accent}18`,
                `0 0 40px ${accent}25, inset 0 0 40px ${accent}10`,
              ]
            : `0 0 56px ${accent}25, inset 0 0 56px ${accent}10`,
      }}
      transition={{ duration: 2.4, repeat: phase === "running" ? Infinity : 0 }}
    >
      <div
        className={`absolute inset-0 transition-opacity duration-700 ${
          isActive ? "opacity-100" : "opacity-50"
        }`}
      >
        <Image
          src={INTENT_IMAGE}
          alt=""
          fill
          sizes="(min-width: 1024px) 280px, 50vw"
          className="object-cover"
          aria-hidden="true"
        />
        <div
          className="absolute inset-0"
          style={{
            background: `radial-gradient(ellipse at center, rgba(8,8,14,0.1) 0%, rgba(8,8,14,0.55) 55%, rgba(8,8,14,0.92) 100%)`,
          }}
        />
      </div>

      <div className="relative z-10 flex items-start justify-between px-5 pt-5">
        <div
          className="text-base font-mono uppercase tracking-widest font-bold drop-shadow-[0_2px_6px_rgba(0,0,0,0.85)]"
          style={{ color: accent }}
        >
          Intent
        </div>
        <motion.div
          animate={phase === "running" ? { rotate: 360 } : { rotate: 0 }}
          transition={{
            duration: 6,
            repeat: phase === "running" ? Infinity : 0,
            ease: "linear",
          }}
          className="flex h-8 w-8 items-center justify-center rounded-full"
          style={{
            backgroundColor: `${accent}22`,
            boxShadow: `0 0 16px ${accent}50`,
          }}
        >
          <Sparkles className="h-4 w-4" style={{ color: accent }} />
        </motion.div>
      </div>

      <div className="flex-1" />

      <div className="relative z-10 px-5 pb-5 space-y-3">
        <div className="rounded-lg border border-foreground/[0.1] bg-background/60 backdrop-blur-sm px-3 py-2.5 font-mono text-base text-foreground leading-relaxed h-[60px] overflow-hidden">
          {userTyped || (
            <span className="text-foreground/60 italic">
              Describe what your agent should do…
            </span>
          )}
          {phase === "running" && userTyped.length < USER_PROMPT.length && (
            <span className="inline-block h-4 w-[2px] ml-0.5 translate-y-0.5 bg-brand-purple animate-pulse" />
          )}
        </div>

        <div className="flex items-center justify-between">
          <span
            className="text-base font-mono uppercase tracking-wider font-semibold drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]"
            style={{ color: accent }}
          >
            {filledCount}/8 resolved
          </span>
          <div className="h-1.5 w-20 rounded-full bg-foreground/[0.08] overflow-hidden">
            <motion.div
              className="h-full rounded-full"
              style={{ backgroundColor: accent }}
              animate={{ width: `${(filledCount / 8) * 100}%` }}
              transition={{ duration: 0.4 }}
            />
          </div>
        </div>
      </div>
    </motion.div>
  );
}
