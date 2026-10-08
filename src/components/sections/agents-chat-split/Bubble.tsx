"use client";

import { motion } from "framer-motion";
import { AlertTriangle, Check, Lightbulb, X } from "lucide-react";
import { TONE_COLOR, clockText, mix, type Tone } from "./shared/scenarios";

const TEXT = "text-base";

/** One reply. The script answers in template monospace on a square card with
 *  a status rail; the agent answers in plain speech on a soft bubble. The
 *  typography is the difference before a word is read. */
export default function Bubble({ kind, tone, at, text, still }: { kind: "scripted" | "agent"; tone: Tone; at: number; text: string; still: boolean }) {
  const color = TONE_COLOR[tone];
  const scripted = kind === "scripted";
  const Icon = tone === "error" ? X : tone === "warning" ? AlertTriangle : tone === "success" ? Check : tone === "thinking" ? Lightbulb : null;

  return (
    <motion.div
      initial={still ? false : { opacity: 0, y: 12, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      className={`flex shrink-0 items-start gap-2.5 ${scripted ? "rounded-md border-l-2 px-3 py-2" : "rounded-2xl rounded-tl-md px-3.5 py-2.5"}`}
      style={
        scripted
          ? { borderColor: color, background: tone === "neutral" ? "rgba(var(--surface-overlay), 0.05)" : mix(color, 9) }
          : { background: tone === "neutral" ? "rgba(var(--surface-overlay), 0.06)" : mix(color, 12), boxShadow: tone === "success" ? `0 0 24px -8px ${mix(color, 60)}` : undefined }
      }
    >
      {Icon && (
        <span className="mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full" style={{ background: mix(color, 18), color }}>
          <Icon className="h-3 w-3" aria-hidden />
        </span>
      )}
      <span className={`min-w-0 flex-1 leading-snug ${TEXT} ${scripted ? "font-mono tracking-tight" : ""} ${tone === "thinking" ? "italic" : ""}`} style={{ color: tone === "neutral" ? "var(--foreground)" : `color-mix(in srgb, ${color} 55%, var(--foreground))` }}>
        {text}
      </span>
      <span className="mt-1 shrink-0 font-mono text-xs text-muted-dark">{clockText(at)}</span>
    </motion.div>
  );
}

/** Three dots, bouncing while a reply is being written; still dots under reduced motion. */
export function Typing({ color, still }: { color: string; still: boolean }) {
  return (
    <span className="inline-flex h-7 items-center gap-1 rounded-full px-3" style={{ background: mix(color, 10) }} aria-hidden>
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          className="h-1.5 w-1.5 rounded-full"
          style={{ background: color }}
          animate={still ? { opacity: 0.7 } : { opacity: [0.35, 1, 0.35], y: [0, -3, 0] }}
          transition={still ? { duration: 0 } : { duration: 0.9, repeat: Infinity, delay: i * 0.15 }}
        />
      ))}
    </span>
  );
}
