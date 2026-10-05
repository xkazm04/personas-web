"use client";

import { memo } from "react";
import { Workflow } from "lucide-react";

import GlowCard from "@/components/GlowCard";
import { useTranslation } from "@/i18n/useTranslation";
import { CHART_PALETTE } from "@/lib/chart-theme";
import type { AthenaActionCost, AthenaOpAction } from "@/lib/mock-dashboard-data";

const ACTION_LABEL_KEY: Record<AthenaOpAction, "chat" | "fleetSpawn" | "canvasControl" | "recall" | "proactiveNudge" | "execTriage" | "msgTriage" | "reviewResolution"> = {
  chat: "chat",
  fleet_spawn: "fleetSpawn",
  canvas_control: "canvasControl",
  recall: "recall",
  proactive_nudge: "proactiveNudge",
  exec_triage: "execTriage",
  msg_triage: "msgTriage",
  review_resolution: "reviewResolution",
};

/**
 * Cost by action type — Athena's turn-ledger spend rolled up into the
 * desktop's op-grammar buckets (chat turns, fleet_spawn, canvas_control,
 * recall, proactive nudges, and the headless triage legs). Each row: label,
 * proportional cost bar, cost, and turn count. Desktop parity: the Activity
 * tab's "Cost by action type" list in the Athena lane.
 */
export const AthenaActionMixCard = memo(function AthenaActionMixCard({
  actions,
}: {
  actions: AthenaActionCost[];
}) {
  const { t } = useTranslation();
  const lp = t.observabilityPage;
  const max = actions.reduce((m, a) => Math.max(m, a.costUsd), 0);

  return (
    <GlowCard accent="cyan" className="p-5 lg:col-span-3">
      <div className="mb-4 flex items-center gap-2">
        <Workflow className="h-4 w-4 text-brand-cyan" />
        <h2 className="text-base font-semibold text-foreground">{lp.athenaActionMix}</h2>
      </div>

      <div className="space-y-2.5">
        {actions.map((entry, i) => {
          const color = CHART_PALETTE[i % CHART_PALETTE.length];
          return (
            <div key={entry.action} className="grid grid-cols-[9.5rem_1fr_auto_auto] items-center gap-x-3">
              <span className="truncate text-sm text-foreground">
                {lp.athenaOps[ACTION_LABEL_KEY[entry.action]]}
              </span>
              <span className="h-1.5 overflow-hidden rounded-full bg-white/[0.05]">
                <span
                  className="block h-full rounded-full"
                  style={{
                    width: `${max > 0 ? Math.max((entry.costUsd / max) * 100, 4) : 0}%`,
                    backgroundColor: color,
                    opacity: 0.7,
                  }}
                />
              </span>
              <span className="w-14 text-right text-sm font-medium tabular-nums text-foreground">
                ${entry.costUsd.toFixed(2)}
              </span>
              <span className="w-20 text-right text-xs tabular-nums text-muted-dark">
                {lp.turnsCount.replace("{count}", String(entry.turns))}
              </span>
            </div>
          );
        })}
      </div>
    </GlowCard>
  );
});
