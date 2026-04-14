import { TrendingUp, TrendingDown } from "lucide-react";
import { fadeUp } from "@/lib/animations";
import GlowCard from "@/components/GlowCard";
import Sparkline from "@/components/dashboard/Sparkline";

const accentMap = {
  cyan: "text-cyan-400",
  purple: "text-purple-400",
  emerald: "text-emerald-400",
  amber: "text-amber-400",
};

export default function MetricCard({
  icon: Icon,
  label,
  value,
  trend,
  trendLabel,
  accent,
  sparklineData,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  trend?: number;
  trendLabel?: string;
  accent: "cyan" | "purple" | "emerald" | "amber";
  sparklineData?: number[];
}) {
  return (
    <GlowCard accent={accent} variants={fadeUp} className="p-5">
      <div className="flex items-center gap-2 mb-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-white/[0.04]">
          <Icon className={`h-4 w-4 ${accentMap[accent]}`} />
        </div>
        <span className="text-sm font-medium text-muted-dark uppercase tracking-wider">
          {label}
        </span>
        {sparklineData && sparklineData.length > 1 && (
          <div className="ml-auto">
            <Sparkline data={sparklineData} accent={accent} width={56} height={20} />
          </div>
        )}
      </div>
      <p className="text-2xl font-bold tracking-tight tabular-nums text-foreground">
        {value}
      </p>
      {trend !== undefined && (
        <div className="mt-2 flex items-center gap-1 text-sm">
          {trend >= 0 ? (
            <TrendingUp className="h-3 w-3 text-emerald-400" />
          ) : (
            <TrendingDown className="h-3 w-3 text-red-400" />
          )}
          <span className={trend >= 0 ? "text-emerald-400" : "text-red-400"}>
            {trend >= 0 ? "+" : ""}
            {trend.toFixed(1)}%
          </span>
          {trendLabel && <span className="text-muted-dark">{trendLabel}</span>}
        </div>
      )}
    </GlowCard>
  );
}
