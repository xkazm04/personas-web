"use client";

import type { ReactNode } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Bot, CloudOff, KeyRound, Laptop, Lock, Sparkles } from "lucide-react";
import { BRAND_VAR, tint, type BrandKey } from "@/lib/brand-theme";
import { fadeUp } from "@/lib/animations";
import { howSectionsCopy } from "@/i18n/pending/howSections";

/** A proof panel beside its statement line, with a connector reaching back
 *  across the column gap to the line it proves. */
function Proof({ brand, kicker, children }: { brand: BrandKey; kicker: string; children: ReactNode }) {
  return (
    <motion.li variants={fadeUp} className="relative flex items-center">
      <span
        aria-hidden
        className="absolute right-full top-1/2 hidden h-px w-[clamp(2rem,5cqw,5rem)] stage:block"
        style={{ background: `linear-gradient(to right, transparent, ${tint(brand, 60)})` }}
      />
      <div
        data-stage-zoom
        className="w-full rounded-2xl border p-4 backdrop-blur-sm stage:py-[clamp(0.6rem,1.8cqh,1rem)]"
        style={{ borderColor: tint(brand, 35), background: "color-mix(in srgb, var(--background) 72%, transparent)" }}
      >
        <p className="mb-3 font-mono text-xs stage:mb-[clamp(0.4rem,1.4cqh,0.75rem)] font-semibold uppercase tracking-[0.2em]" style={{ color: BRAND_VAR[brand] }}>
          {kicker}
        </p>
        {children}
      </div>
    </motion.li>
  );
}

const chip = "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-sm";

function AgentsProof() {
  const a = howSectionsCopy.manifesto.agents;
  return (
    <Proof brand="cyan" kicker={a.kicker}>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <p className="flex-1 rounded-xl border px-3 py-2 text-base italic leading-snug text-foreground/85" style={{ borderColor: "var(--border-glass-hover)" }}>
          {a.prompt}
        </p>
        <ArrowRight aria-hidden className="hidden h-5 w-5 shrink-0 text-muted sm:block" />
        <div className="shrink-0 rounded-xl border px-3 py-2" style={{ borderColor: tint("cyan", 45), background: tint("cyan", 8) }}>
          <p className="flex items-center gap-2 text-base font-semibold text-foreground">
            <Sparkles aria-hidden className="h-4 w-4" style={{ color: BRAND_VAR.cyan }} />
            {a.agent}
          </p>
          <p className="mt-0.5 flex items-center gap-1.5 text-sm" style={{ color: BRAND_VAR.emerald }}>
            <span aria-hidden className="h-1.5 w-1.5 rounded-full" style={{ background: BRAND_VAR.emerald }} />
            {a.ready}
          </p>
        </div>
      </div>
    </Proof>
  );
}

/** The chosen level on the illustrated dial (index into `levels`). */
const CHOSEN = 1;

function RulesProof() {
  const r = howSectionsCopy.manifesto.rules;
  const at = (i: number) => `${(i / (r.levels.length - 1)) * 100}%`;
  return (
    <Proof brand="purple" kicker={r.kicker}>
      <div className="px-2">
        <div aria-hidden className="relative h-6">
          <span className="absolute inset-x-0 top-1/2 h-1 -translate-y-1/2 rounded-full" style={{ background: tint("purple", 18) }} />
          <span className="absolute left-0 top-1/2 h-1 -translate-y-1/2 rounded-full" style={{ width: at(CHOSEN), background: tint("purple", 70) }} />
          {r.levels.map((l, i) => (
            <span
              key={l}
              className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border-2"
              style={{
                left: at(i),
                width: i === CHOSEN ? 22 : 12,
                height: i === CHOSEN ? 22 : 12,
                borderColor: BRAND_VAR.purple,
                background: i <= CHOSEN ? BRAND_VAR.purple : "var(--background)",
                boxShadow: i === CHOSEN ? `0 0 18px ${tint("purple", 55)}` : "none",
              }}
            />
          ))}
        </div>
      </div>
      <ol className="mt-2 grid grid-cols-3 gap-2 text-sm leading-snug">
        {r.levels.map((l, i) => (
          <li
            key={l}
            className={`${i === 0 ? "text-left" : i === r.levels.length - 1 ? "text-right" : "text-center"} ${i === CHOSEN ? "font-semibold text-foreground" : "text-muted"}`}
          >
            {l}
          </li>
        ))}
      </ol>
      <p className="mt-2 text-sm text-muted">{r.note}</p>
    </Proof>
  );
}

function InfraProof() {
  const f = howSectionsCopy.manifesto.infra;
  return (
    <Proof brand="emerald" kicker={f.kicker}>
      <div className="flex flex-wrap items-center gap-3 sm:flex-nowrap">
        <div className="min-w-0 basis-full rounded-xl border px-3 py-2 sm:flex-1 sm:basis-auto" style={{ borderColor: tint("emerald", 45), background: tint("emerald", 7) }}>
          <p className="flex items-center gap-2 text-base font-semibold text-foreground">
            <Laptop aria-hidden className="h-4 w-4" style={{ color: BRAND_VAR.emerald }} />
            {f.device}
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            <span className={`${chip} text-foreground/85`} style={{ borderColor: "var(--border-glass-hover)" }}>
              <Bot aria-hidden className="h-3.5 w-3.5" /> {f.agents}
            </span>
            <span className={`${chip} text-foreground/85`} style={{ borderColor: tint("amber", 45) }}>
              <KeyRound aria-hidden className="h-3.5 w-3.5" style={{ color: BRAND_VAR.amber }} /> {f.keys}
            </span>
          </div>
        </div>
        <div className="flex min-w-[6rem] flex-1 flex-col sm:flex-none items-center gap-1 px-1 text-center">
          <span className="whitespace-nowrap text-xs font-semibold leading-tight" style={{ color: BRAND_VAR.emerald }}>{f.never}</span>
          <span aria-hidden className="relative block h-px w-full border-t-2 border-dashed" style={{ borderColor: tint("emerald", 45) }}>
            <Lock className="absolute left-1/2 top-1/2 h-5 w-5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-background p-0.5" style={{ color: BRAND_VAR.emerald }} />
          </span>
        </div>
        <p className="flex shrink-0 flex-col items-center gap-1 text-sm text-muted">
          <CloudOff aria-hidden className="h-7 w-7" />
          {f.cloud}
        </p>
      </div>
    </Proof>
  );
}

/** One proof per statement line, in the same order and the same rows. */
export default function Proofs({ className }: { className: string }) {
  return (
    <ul className={className}>
      <AgentsProof />
      <RulesProof />
      <InfraProof />
    </ul>
  );
}
