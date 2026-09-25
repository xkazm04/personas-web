"use client";

import { motion, useTransform } from "framer-motion";
import { Bot, CheckCircle2 } from "lucide-react";
import { BRAND_VAR, tint } from "@/lib/brand-theme";
import PricingShell, { usePlayOnce } from "./pricingShell";
import { BreakdownBar, Callout, Reveal, beat } from "./Pricing.spend.parts";

/*
 * /illustrate r3 pricing variant "spend" (product-true, real content reduced): the
 * app's own run list for one agent, the selected run's Cost Breakdown and the
 * app's real reframe of it - "≈{cost} if billed to the Anthropic API / included on
 * your Claude subscription" (CostBreakdownBar.tsx, en/agents.json:484). Two page
 * callouts say who is paid: Personas nothing, Anthropic your plan. Sample costs.
 */

const WORDS = {
  lede: "Personas is MIT-licensed, with every feature and no account. Your agents run on your own Claude plan, and the app shows what each run would have cost on the API.",
  artLabel:
    "The Personas app's run list for the Email Morning Digest agent: three runs on Sonnet, Haiku and Opus. The Opus run's cost breakdown reads: about $0.61 if billed to the Anthropic API, included on your Claude subscription. Callouts: Personas costs $0 under the MIT licence with every feature; the plan is paid to Anthropic.",
  persona: "Email Morning Digest",
  breakdown: "Cost Breakdown",
  noteApi: "≈$0.61 if billed to the Anthropic API",
  noteIncluded: "included on your Claude subscription",
  personasTitle: "Personas: $0",
  personasSub: "MIT, every feature",
  paidTitle: "Paid to Anthropic",
  paidSub: "your Claude plan",
} as const;

/** Sample runs: the app's model names; costs are obviously sample values. */
const RUNS = [
  { model: "Sonnet", cost: "$0.18" },
  { model: "Haiku", cost: "$0.03" },
  { model: "Opus", cost: "$0.61" },
] as const;
const SELECTED = 2;
const INPUT_SHARE = 0.36;
const DURATION = 1.6;

export default function PricingSpend() {
  const { ref, p, replay, still } = usePlayOnce(DURATION);
  const selected = useTransform(p, (v) => beat(v, 0.36, 0.44));
  const ring = useTransform(selected, (v) => `inset 0 0 0 1.5px color-mix(in srgb, var(--brand-amber) ${Math.round(55 * v)}%, transparent)`);

  return (
    <PricingShell lede={WORDS.lede} artRef={ref} artLabel={WORDS.artLabel} maxWidth={880} zoom onReplay={replay} still={still}>
      <div className="grid grid-cols-1 gap-x-2 gap-y-6 rounded-2xl border border-glass bg-white/[0.02] p-4 md:grid-cols-[minmax(0,33rem)_minmax(0,17rem)] md:justify-center md:p-3">
        {/* The app card: one agent's runs, the selected run's cost. */}
        <div className="rounded-xl border border-glass bg-background/70 p-5 shadow-lg md:px-4 md:py-3 md:row-span-2">
          <div className="flex items-center gap-2.5 border-b border-glass pb-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg" style={{ backgroundColor: tint("cyan", 16) }}>
              <Bot className="h-4.5 w-4.5" style={{ color: BRAND_VAR.cyan }} aria-hidden />
            </span>
            <span className="text-[15px] font-semibold text-foreground md:text-base">{WORDS.persona}</span>
          </div>

          <ul className="mt-3 space-y-1 md:mt-1.5 md:space-y-0.5">
            {RUNS.map((r, i) => (
              <li key={r.model}>
                <Reveal p={p} from={i * 0.1} to={i * 0.1 + 0.14}>
                  <motion.div
                    className="flex items-center gap-3 rounded-lg px-2.5 py-3.5 md:py-1.5"
                    style={i === SELECTED ? { boxShadow: ring, backgroundColor: tint("amber", 6) } : undefined}
                  >
                    <CheckCircle2 className="h-4 w-4 shrink-0" style={{ color: BRAND_VAR.emerald }} aria-hidden />
                    <span className="rounded-md px-2 py-0.5 text-[13px] font-medium md:text-sm" style={{ color: BRAND_VAR.amber, backgroundColor: tint("amber", 12) }}>
                      {r.model}
                    </span>
                    <span className="ml-auto font-mono text-[13px] text-foreground/90 md:text-sm">{r.cost}</span>
                  </motion.div>
                </Reveal>
              </li>
            ))}
          </ul>

          <Reveal p={p} from={0.42} to={0.5} className="mt-2 space-y-1.5 rounded-lg border border-glass bg-white/[0.02] px-3 py-2.5">
            <div className="hidden font-mono text-[13px] uppercase tracking-wider text-foreground/80 md:block">{WORDS.breakdown}</div>
            <BreakdownBar p={p} inputShare={INPUT_SHARE} />
            <Reveal p={p} from={0.62} to={0.74}>
              <div className="text-xs md:text-sm" style={{ color: BRAND_VAR.emerald }}>
                {WORDS.noteApi}
              </div>
              <div className="text-xs font-semibold md:text-sm" style={{ color: BRAND_VAR.emerald }}>
                {WORDS.noteIncluded}
              </div>
            </Reveal>
          </Reveal>
        </div>

        {/* Page callouts: who is paid. Aligned to the card's header and to the note. */}
        <Reveal p={p} from={0.8} to={0.92} className="self-start md:pt-1">
          <Callout brand="emerald" title={WORDS.personasTitle} sub={WORDS.personasSub} />
        </Reveal>
        <Reveal p={p} from={0.88} to={1} className="self-end md:pb-6">
          <Callout brand="amber" title={WORDS.paidTitle} sub={WORDS.paidSub} />
        </Reveal>
      </div>
    </PricingShell>
  );
}
