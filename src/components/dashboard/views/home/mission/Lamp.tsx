"use client";

import { useStillMotion } from "@/hooks/useStillMotion";
import type { Verdict } from "./readings";

/** Colour per verdict, from the status tokens only. */
export const VERDICT_TONE: Record<Verdict, { lamp: string; text: string; lit: string }> = {
  ok: { lamp: "bg-status-success", text: "text-status-success", lit: "" },
  watch: {
    lamp: "bg-status-warning",
    text: "text-status-warning",
    lit: "bg-status-warning/[0.07] ring-1 ring-inset ring-status-warning/40",
  },
  yours: {
    lamp: "bg-status-info",
    text: "text-status-info",
    lit: "bg-status-info/[0.07] ring-1 ring-inset ring-status-info/40",
  },
  act: {
    lamp: "bg-status-error",
    text: "text-status-error",
    lit: "bg-status-error/[0.08] ring-1 ring-inset ring-status-error/45",
  },
  pending: { lamp: "border border-dashed border-muted-dark", text: "text-muted-dark", lit: "" },
  failed: { lamp: "bg-status-error/50", text: "text-muted", lit: "" },
  unmeasured: { lamp: "bg-muted-dark/40", text: "text-muted-dark", lit: "" },
};

/** A verdict's status light. Only "act" pulses, and never under reduced motion. */
export function Lamp({ verdict, className = "" }: { verdict: Verdict; className?: string }) {
  const still = useStillMotion();
  const pulse = verdict === "act" && !still ? "animate-pulse" : "";
  return (
    <span
      aria-hidden
      className={`inline-block h-2.5 w-2.5 flex-none rounded-full ${VERDICT_TONE[verdict].lamp} ${pulse} ${className}`}
    />
  );
}
