import { TrendingUp, TrendingDown } from "lucide-react";
import { fadeUp } from "@/lib/animations";
import GlowCard from "@/components/GlowCard";
import Sparkline from "@/components/dashboard/Sparkline";
import { trendColor, type GoodDirection } from "@/components/dashboard/trendColor";

const accentMap = {
  cyan: "text-brand-cyan",
  purple: "text-brand-purple",
  emerald: "text-brand-emerald",
  amber: "text-brand-amber",
};

export default function MetricCard({
  icon: Icon,
  label,
  value,
  trend,
  trendLabel,
  accent,
  sparklineData,
  goodDirection = "up",
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  trend?: number;
  trendLabel?: string;
  accent: "cyan" | "purple" | "emerald" | "amber";
  sparklineData?: number[];
  /**
   * Which direction of change is favorable. `"up"` (default) treats a rise as
   * good (e.g. success rate, executions); `"down"` treats a fall as good
   * (e.g. cost, latency, error rate). The arrow always reflects the numeric
   * direction of the change, while the color reflects whether it is favorable.
   */
  goodDirection?: GoodDirection;
}) {
  // Arrow follows the numeric sign so the tile stays honest about what moved.
  const isRising = (trend ?? 0) >= 0;
  // Color follows favorability so a rise in spend/errors reads as red, not green.
  const trendCls = trendColor(trend ?? 0, { goodDirection });

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
          {isRising ? (
            <TrendingUp className={`h-3 w-3 ${trendCls}`} />
          ) : (
            <TrendingDown className={`h-3 w-3 ${trendCls}`} />
          )}
          <span className={trendCls}>
            {isRising ? "+" : ""}
            {trend.toFixed(1)}%
          </span>
          {trendLabel && <span className="text-muted-dark">{trendLabel}</span>}
        </div>
      )}
    </GlowCard>
  );
}
