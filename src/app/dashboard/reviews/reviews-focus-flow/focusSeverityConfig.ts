import { AlertCircle, AlertTriangle, Info } from "lucide-react";

import type { ReviewSeverity } from "@/lib/types";

export const focusSeverityConfig: Record<
  ReviewSeverity,
  { Icon: React.ElementType; tone: string; pill: string }
> = {
  critical: {
    Icon: AlertTriangle,
    tone: "text-rose-400",
    pill: "border-rose-500/30 bg-rose-500/10 text-rose-300",
  },
  warning: {
    Icon: AlertCircle,
    tone: "text-amber-400",
    pill: "border-amber-500/30 bg-amber-500/10 text-amber-300",
  },
  info: {
    Icon: Info,
    tone: "text-cyan-400",
    pill: "border-cyan-500/25 bg-cyan-500/10 text-cyan-300",
  },
};
