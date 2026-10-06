"use client";

import { motion } from "framer-motion";
/** How a conversation was had. */
export type Medium = "typed" | "spoken";

/**
 * The two ways you talk to her, drawn small: a microphone for a conversation
 * you had out loud, a speech bubble with a cursor for one you typed. Sized in
 * `em`, so they ride the label type they sit beside.
 */
export function MediumIcon({ medium }: { medium: Medium }) {
  return (
    <svg
      viewBox="0 0 16 16"
      className="h-[1.05em] w-[1.05em] shrink-0"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {medium === "spoken" ? (
        <>
          <rect x="5.5" y="1.5" width="5" height="8.5" rx="2.5" />
          <path d="M3 7.5a5 5 0 0 0 10 0M8 12.5v2" />
        </>
      ) : (
        <>
          <path d="M2 3.5A1.5 1.5 0 0 1 3.5 2h9A1.5 1.5 0 0 1 14 3.5v6a1.5 1.5 0 0 1-1.5 1.5H7l-3 3v-3h-.5A1.5 1.5 0 0 1 2 9.5z" />
          <path d="M6 5v3" />
        </>
      )}
    </svg>
  );
}

/** Authored bar heights for the voice bar - a sentence's shape, not noise. */
const BARS = [0.35, 0.6, 0.9, 0.55, 1, 0.7, 0.45, 0.85, 0.6, 0.3, 0.75, 0.5, 0.95, 0.4, 0.65];

/**
 * You, speaking. The bars move only while you are talking AND the scene is
 * running; otherwise they hold the sentence's shape, still.
 */
export function VoiceBar({ live }: { live: boolean }) {
  return (
    <span className="flex h-[1.1em] items-center gap-[0.14em]" aria-hidden="true">
      {BARS.map((h, i) => (
        <motion.span
          key={i}
          className="w-[0.13em] rounded-full bg-brand-cyan"
          style={{ height: `${h * 100}%`, originY: 0.5 }}
          initial={false}
          animate={{ scaleY: live ? [1, 0.35 + (i % 3) * 0.2, 1] : 1 }}
          transition={
            live
              ? { duration: 0.5 + (i % 4) * 0.12, repeat: Infinity, ease: "easeInOut" }
              : { duration: 0.3 }
          }
        />
      ))}
    </span>
  );
}
