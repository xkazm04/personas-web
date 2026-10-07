"use client";

import { motion } from "framer-motion";
import { Check, Star, UserRound } from "lucide-react";
import { AGENT, SCRIPT, fill, mix } from "./shared/scenarios";
import { howSectionsCopy } from "@/i18n/pending/howSections";

/** A window's footer: what the customer ended up with, and how they rated it.
 *  Reserved height, so the reveal never moves the transcript above it. */
export default function Outcome({ kind, done, text, seconds, stars, still }: { kind: "scripted" | "agent"; done: boolean; text: string; seconds: number; stars: number; still: boolean }) {
  const c = howSectionsCopy.chat;
  const isAgent = kind === "agent";
  const color = isAgent ? AGENT : SCRIPT;
  const Icon = isAgent ? Check : UserRound;

  return (
    <div className="relative flex min-h-[3.75rem] shrink-0 items-center gap-3 border-t px-4 py-2.5" style={{ borderColor: mix(color, 18), background: done ? mix(color, isAgent ? 12 : 8) : "transparent" }}>
      {done && (
        <motion.div
          className="flex min-w-0 flex-1 items-center gap-3"
          initial={still ? false : { opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
        >
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full" style={{ background: mix(color, 22), color }}>
            <Icon className="h-4 w-4" aria-hidden />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block font-mono text-xs uppercase tracking-[0.14em]" style={{ color }}>
              {isAgent ? c.v1.resolved : c.v1.unresolved}
            </span>
            <span className="block text-base font-semibold leading-tight text-foreground">
              {text}
              {isAgent && <span className="font-normal text-muted"> {fill(c.inSeconds, seconds)}</span>}
            </span>
          </span>
          <span className="flex shrink-0 items-center gap-0.5" role="img" aria-label={fill(c.v1.rating, stars)}>
            {[1, 2, 3, 4, 5].map((n) => (
              <motion.span
                key={n}
                initial={still ? false : { scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", stiffness: 420, damping: 18, delay: 0.15 + n * 0.06 }}
              >
                <Star className="h-4 w-4" style={{ color: n <= stars ? color : "var(--muted-dark)", fill: n <= stars ? color : "transparent" }} aria-hidden />
              </motion.span>
            ))}
          </span>
        </motion.div>
      )}
    </div>
  );
}
