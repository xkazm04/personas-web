"use client";

import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import { ChevronDown, Loader2, Play, Power, PowerOff } from "lucide-react";

import GlowCard from "@/components/GlowCard";
import AgentDetail from "@/components/dashboard/AgentDetail";
import AgentMetrics from "@/components/dashboard/AgentMetrics";
import { fadeUp } from "@/lib/animations";
import type { Persona } from "@/lib/types";

import { accentFromColor } from "./agentAccent";
import { PersonaGlyph, imageForPersona } from "./personaVisuals";

/**
 * Variant B — portrait-dominant card: a Leonardo-generated square persona
 * portrait is the hero, with persona name overlaid on its bottom edge and
 * metadata stacked compactly below.
 */
export function AgentCardImage({
  persona,
  expanded,
  executing,
  result,
  labels,
  onExecute,
  onPrefetch,
  onToggleExpanded,
}: {
  persona: Persona;
  expanded: boolean;
  executing: boolean;
  result: "success" | "error" | null;
  labels: { execute: string; executing: string; details: string; statusLive: string; statusOff: string };
  onExecute: (id: string) => void;
  onPrefetch: (id: string) => void;
  onToggleExpanded: () => void;
}) {
  const accent = accentFromColor(persona.color);
  const portrait = imageForPersona(persona.name);
  const tint = persona.color ?? "#06b6d4";

  // Brief outcome ring flashed on the Execute button (~700ms) — emerald on a
  // queued execution, rose on failure — pairing with the toast announcement.
  const resultRing =
    result === "success"
      ? "ring-2 ring-emerald-400/40"
      : result === "error"
        ? "ring-2 ring-rose-400/40"
        : "";

  return (
    <div onMouseEnter={() => onPrefetch(persona.id)}>
      <GlowCard accent={accent} variants={fadeUp} className="flex flex-col overflow-hidden p-0">
        {/* Portrait hero */}
        <div className="relative aspect-square w-full overflow-hidden border-b border-glass">
          {portrait ? (
            <Image
              src={portrait}
              alt=""
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 33vw"
              className="object-cover"
              loading="lazy"
            />
          ) : (
            // Personas without a generated portrait fall back to the icon medallion.
            <div
              className="flex h-full w-full items-center justify-center"
              style={{ backgroundColor: `${tint}14` }}
            >
              <PersonaGlyph name={persona.name} className="h-20 w-20" style={{ color: tint }} />
            </div>
          )}
          {/* Success pulse — a brief emerald glow over the portrait the moment
              a manual execution is accepted. Mounted only while active so each
              success re-triggers the one-shot CSS animation. */}
          {result === "success" && (
            <div
              className="execute-success-pulse pointer-events-none absolute inset-0 z-10"
              style={{ boxShadow: "inset 0 0 36px 4px rgba(52, 211, 153, 0.55)" }}
              aria-hidden="true"
            />
          )}
          {/* Bottom gradient + name overlay */}
          <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-[rgba(8,11,20,0.92)] via-[rgba(8,11,20,0.6)] to-transparent px-5 pb-4 pt-12">
            <div className="flex items-end justify-between gap-2">
              <h3 className="text-lg font-semibold leading-tight text-foreground drop-shadow-md">
                {persona.name}
              </h3>
              <span
                className="inline-flex items-center gap-1 rounded-full border bg-surface/70 px-2 py-0.5 text-sm font-medium backdrop-blur-sm"
                style={{
                  borderColor: persona.enabled ? "rgba(52,211,153,0.35)" : "rgba(255,255,255,0.1)",
                  color: persona.enabled ? "rgb(52, 211, 153)" : "var(--muted-dark)",
                }}
              >
                {persona.enabled ? (
                  <Power className="h-3 w-3" />
                ) : (
                  <PowerOff className="h-3 w-3" />
                )}
                {persona.enabled ? labels.statusLive : labels.statusOff}
              </span>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="flex flex-col gap-3 p-5">
          {persona.description && (
            <p className="line-clamp-2 text-sm text-muted-dark">{persona.description}</p>
          )}
          <AgentMetrics persona={persona} />
          <div className="flex items-center gap-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onExecute(persona.id);
              }}
              disabled={executing}
              aria-busy={executing}
              className={`flex items-center gap-1.5 rounded-lg border border-brand-cyan/20 bg-brand-cyan/10 px-3 py-1.5 text-sm font-medium text-brand-cyan transition-all hover:bg-brand-cyan/20 focus-ring focus-visible:ring-offset-0 disabled:cursor-not-allowed disabled:opacity-70 disabled:hover:bg-brand-cyan/10 ${resultRing}`}
            >
              {executing ? (
                <Loader2 className="h-3 w-3 animate-spin" />
              ) : (
                <Play className="h-3 w-3" />
              )}
              {executing ? labels.executing : labels.execute}
            </button>
            <button
              onClick={onToggleExpanded}
              aria-expanded={expanded}
              aria-controls={`agent-detail-${persona.id}`}
              className="ml-auto flex items-center gap-1 rounded-lg border border-glass bg-white/[0.03] px-3 py-1.5 text-sm font-medium text-muted transition-all hover:bg-white/[0.06] hover:text-foreground focus-ring focus-visible:ring-offset-0"
            >
              {labels.details}
              <ChevronDown className={`h-3 w-3 transition-transform ${expanded ? "rotate-180" : ""}`} />
            </button>
          </div>

          <AnimatePresence>
            {expanded && (
              <motion.div
                id={`agent-detail-${persona.id}`}
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <AgentDetail persona={persona} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </GlowCard>
    </div>
  );
}
