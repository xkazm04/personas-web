import { useState } from "react";
import { AlertTriangle, ShieldAlert, ShieldCheck, CircleDot } from "lucide-react";
import type { HealthIssue } from "@/lib/types";

const severityStyles: Record<string, { color: string; bgColor: string; icon: React.ElementType }> = {
  critical: { color: "text-red-400", bgColor: "bg-red-500/10 border-red-500/20", icon: AlertTriangle },
  high: { color: "text-orange-400", bgColor: "bg-orange-500/10 border-orange-500/20", icon: ShieldAlert },
  medium: { color: "text-amber-400", bgColor: "bg-amber-500/10 border-amber-500/20", icon: CircleDot },
  low: { color: "text-blue-400", bgColor: "bg-blue-500/10 border-blue-500/20", icon: CircleDot },
};

export default function HealthIssueRow({ issue }: { issue: HealthIssue }) {
  const sev = severityStyles[issue.severity] ?? severityStyles.low;
  const SevIcon = sev.icon;
  const [age] = useState(() => {
    const diff = Date.now() - new Date(issue.detectedAt).getTime();
    const mins = Math.floor(diff / 60_000);
    return mins < 60 ? `${mins}m ago` : `${Math.floor(mins / 60)}h ago`;
  });

  return (
    <div className={`flex items-start gap-3 rounded-xl border p-3.5 transition-colors ${sev.bgColor}`}>
      <SevIcon className={`mt-0.5 h-4 w-4 flex-shrink-0 ${sev.color}`} />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="text-sm font-medium text-foreground truncate">
            {issue.title}
          </p>
          {issue.status === "auto_fixed" && (
            <span className="flex items-center gap-1 rounded-full border border-emerald-500/20 bg-emerald-500/8 px-2 py-0.5 text-[10px] text-emerald-400">
              <ShieldCheck className="h-2.5 w-2.5" />
              Auto-fixed
            </span>
          )}
          {issue.status === "resolved" && (
            <span className="flex items-center gap-1 rounded-full border border-blue-500/20 bg-blue-500/8 px-2 py-0.5 text-[10px] text-blue-400">
              Resolved
            </span>
          )}
        </div>
        <p className="mt-1 text-xs text-muted-dark line-clamp-2">
          {issue.description}
        </p>
        <div className="mt-2 flex items-center gap-3 text-[10px] text-muted-dark">
          {issue.personaName && <span>{issue.personaName}</span>}
          <span>{age}</span>
          <span className={`uppercase font-medium ${sev.color}`}>{issue.severity}</span>
        </div>
      </div>
    </div>
  );
}
