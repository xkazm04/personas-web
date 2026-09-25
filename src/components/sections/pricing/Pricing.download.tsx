"use client";

import { motion, useTransform, type MotionValue } from "framer-motion";
import { Coins, Download, KeyRound, Sparkles } from "lucide-react";
import { BRAND_VAR, tint } from "@/lib/brand-theme";
import { useTranslation } from "@/i18n/useTranslation";
import { FEATURE_GROUPS } from "./data";
import PricingShell, { usePlayOnce } from "./pricingShell";
import { Reveal, beat } from "./Pricing.spend.parts";

/*
 * /illustrate r3 pricing variant "download" (spatial): what ships free vs what you
 * plug in. One download box holds the six capability groups (the /guide
 * categories, t.compareSection.groups) under a "$0, MIT licence, no account"
 * stamp; one cable plugs in Claude on your own Pro or Max plan, paid to Anthropic
 * (cli_process.rs: runs use the subscription); a dashed port takes optional keys
 * billed by their own services (settings.json: Qwen Cloud; athena.json: ElevenLabs).
 */

const WORDS = {
  lede: "One free download holds every feature, MIT-licensed, with no account or licence key. The one thing you plug in is Claude: your own Pro or Max plan, paid to Anthropic.",
  artLabel:
    "A download box labelled Personas holds six feature groups - Agents & Prompts, Orchestration, Pipelines & Teams, Credentials & Security, Monitoring, Testing Lab - stamped $0, MIT licence, no account. A cable plugs in Claude Pro or Max, paid to Anthropic; a dashed port takes your own optional API keys, such as Qwen Cloud or ElevenLabs, which those services bill.",
  box: "Personas",
  stamp: "$0, MIT licence, no account",
  claude: "Claude Pro or Max",
  claudeSub: "paid to Anthropic",
  keys: "Your own API keys",
  keysSub: "Qwen Cloud, ElevenLabs",
} as const;

const DURATION = 3.4;

/** The cable from a port on the box to an outside card; a pulse runs from the card into the box. */
function Cable({ p, dashed, from, to }: { p: MotionValue<number>; dashed?: boolean; from: number; to: number }) {
  const draw = useTransform(p, (v) => beat(v, from, to));
  const pulse = useTransform(p, (v) => beat(v, to, to + 0.12));
  const x = useTransform(pulse, (v) => `${(1 - v) * 100}%`);
  const opacity = useTransform(pulse, (v) => (v > 0 && v < 1 ? 1 : 0));
  const color = dashed ? tint("blue", 55) : BRAND_VAR.amber;
  return (
    <div aria-hidden className="relative flex h-8 w-px shrink-0 items-center justify-center self-center md:h-px md:w-16">
      <motion.span
        className="absolute inset-0 origin-top md:origin-left"
        style={{ scale: draw, backgroundImage: dashed ? `repeating-linear-gradient(90deg, ${color} 0 6px, transparent 6px 11px)` : undefined, backgroundColor: dashed ? undefined : color }}
      />
      <span className="absolute -left-1.5 top-1/2 hidden h-2.5 w-2.5 -translate-y-1/2 rounded-full md:block" style={{ backgroundColor: color }} />
      {!dashed && <motion.span className="absolute top-1/2 hidden h-2.5 w-2.5 -translate-y-1/2 rounded-full md:block" style={{ left: x, opacity, backgroundColor: BRAND_VAR.amber, boxShadow: `0 0 10px ${BRAND_VAR.amber}` }} />}
    </div>
  );
}

export default function PricingDownload() {
  const { t } = useTranslation();
  const { ref, p, replay, still } = usePlayOnce(DURATION);
  const stampScale = useTransform(p, (v) => 1.25 - 0.25 * beat(v, 0.44, 0.56));
  const stampOpacity = useTransform(p, (v) => beat(v, 0.44, 0.52));

  return (
    <PricingShell lede={WORDS.lede} artRef={ref} artLabel={WORDS.artLabel} maxWidth={960} zoom onReplay={replay} still={still}>
      <div className="flex flex-col items-stretch rounded-2xl border border-glass bg-white/[0.02] p-4 md:flex-row md:items-center md:p-6">
        {/* The download: everything inside ships free. */}
        <div className="min-w-0 flex-1 rounded-xl border-2 p-4 md:p-5" style={{ borderColor: tint("emerald", 45), backgroundColor: tint("emerald", 4) }}>
          <div className="mb-4 flex flex-wrap items-center gap-x-3 gap-y-2">
            <Download className="h-5 w-5" style={{ color: BRAND_VAR.emerald }} aria-hidden />
            <span className="text-lg font-bold text-foreground">{WORDS.box}</span>
            <motion.span
              className="ml-auto rounded-full border px-3 py-1 text-sm font-bold"
              style={{ scale: stampScale, opacity: stampOpacity, color: BRAND_VAR.emerald, borderColor: BRAND_VAR.emerald, backgroundColor: tint("emerald", 14) }}
            >
              {WORDS.stamp}
            </motion.span>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:gap-4">
            {FEATURE_GROUPS.map((g, i) => {
              const Icon = g.icon;
              return (
                <Reveal key={g.id} p={p} from={i * 0.06} to={i * 0.06 + 0.14}>
                  <div className="flex h-full flex-col items-start gap-2.5 rounded-lg border px-3.5 py-4 md:flex-row md:items-center md:py-5" style={{ borderColor: tint(g.brand, 40), backgroundColor: tint(g.brand, 8) }}>
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg" style={{ backgroundColor: tint(g.brand, 18) }}>
                      <Icon className="h-6 w-6" style={{ color: BRAND_VAR[g.brand] }} aria-hidden />
                    </span>
                    <span className="text-[13px] font-semibold leading-tight text-foreground md:text-sm">{t.compareSection.groups[g.id].title}</span>
                  </div>
                </Reveal>
              );
            })}
          </div>
        </div>

        {/* What plugs in from outside: the one required plan, and optional keys. */}
        <div className="flex flex-col gap-3 md:w-72 md:shrink-0 md:gap-5">
          <div className="flex flex-col md:flex-row md:items-center">
            <Cable p={p} from={0.58} to={0.72} />
            <Reveal p={p} from={0.64} to={0.76} className="flex-1">
              <div className="rounded-xl border-2 px-4 py-5" style={{ borderColor: tint("amber", 55), backgroundColor: tint("amber", 10) }}>
                <div className="flex items-center gap-2 text-base font-bold" style={{ color: BRAND_VAR.amber }}>
                  <Sparkles className="h-4.5 w-4.5" aria-hidden />
                  {WORDS.claude}
                </div>
                <div className="mt-1 flex items-center gap-1.5 text-sm text-foreground/85">
                  <Coins className="h-4 w-4" style={{ color: BRAND_VAR.amber }} aria-hidden />
                  {WORDS.claudeSub}
                </div>
              </div>
            </Reveal>
          </div>
          <div className="flex flex-col md:flex-row md:items-center">
            <Cable p={p} dashed from={0.84} to={0.94} />
            <Reveal p={p} from={0.86} to={1} className="flex-1">
              <div className="rounded-xl border-2 border-dashed px-4 py-5" style={{ borderColor: tint("blue", 45) }}>
                <div className="flex items-center gap-2 text-base font-semibold text-foreground/90">
                  <KeyRound className="h-4 w-4" style={{ color: BRAND_VAR.blue }} aria-hidden />
                  {WORDS.keys}
                </div>
                <div className="mt-1 flex items-center gap-1.5 text-sm text-foreground/80">
                  <Coins className="h-4 w-4" style={{ color: BRAND_VAR.blue }} aria-hidden />
                  {WORDS.keysSub}
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </div>
    </PricingShell>
  );
}
