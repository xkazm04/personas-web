import dynamic from "next/dynamic";
import { Users } from "lucide-react";
import GlowCard from "@/components/GlowCard";
import { fadeUp } from "@/lib/animations";
import { BUDGET_THRESHOLD, type ObservabilityLabels } from "./performanceViewTypes";

const SpendPieChart = dynamic(() => import("@/components/dashboard/ObservabilitySpendPieChart"), { ssr: false });

export function PerformanceSpendCard({
  personaSpend,
  spendPieData,
  labels,
}: {
  personaSpend: { personaId: string; personaName: string; personaColor: string; totalCost: number; budgetUsd?: number | null }[];
  spendPieData: { name: string; value: number; color: string }[];
  labels: ObservabilityLabels;
}) {
  return (
    <GlowCard accent="purple" variants={fadeUp} className="p-5 lg:col-span-2">
      <h3 className="text-base font-semibold text-foreground mb-4 flex items-center gap-2">
        <Users className="h-4 w-4 text-brand-purple" />
        {labels.spendByAgent}
      </h3>
      {spendPieData.length > 0 ? (
        <>
          <div className="flex items-center justify-center">
            <SpendPieChart data={spendPieData} />
          </div>
          <div className="mt-2 space-y-2">
            {personaSpend.map((persona) => <PersonaSpendRow key={persona.personaId} persona={persona} />)}
          </div>
        </>
      ) : (
        <p className="text-sm text-muted-dark py-8 text-center">{labels.noSpendData}</p>
      )}
    </GlowCard>
  );
}

function PersonaSpendRow({ persona }: { persona: { personaName: string; personaColor: string; totalCost: number; budgetUsd?: number | null } }) {
  return (
    <div className="flex items-center gap-2 text-sm">
      <span className="h-2.5 w-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: persona.personaColor }} />
      <span className="flex-1 text-muted truncate">{persona.personaName}</span>
      <span className="tabular-nums text-foreground font-medium">${persona.totalCost.toFixed(2)}</span>
      {persona.budgetUsd && (
        <div className="w-16">
          <div className="h-1 rounded-full bg-white/[0.06] overflow-hidden">
            <div
              className="h-full rounded-full transition-all"
              style={{
                width: `${Math.min(100, (persona.totalCost / persona.budgetUsd) * 100)}%`,
                backgroundColor: persona.totalCost / persona.budgetUsd > BUDGET_THRESHOLD ? "#fbbf24" : persona.personaColor,
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
