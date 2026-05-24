import { AlertCircle, AlertTriangle, Info } from "lucide-react";
import type { ElementType } from "react";
import type { ReviewSeverity } from "@/lib/types";

export const reviewSeverityConfig: Record<
  ReviewSeverity,
  { icon: ElementType; color: string; dotColor: string; accent: "cyan" | "amber" | "purple" }
> = {
  critical: {
    icon: AlertTriangle,
    color: "text-red-400",
    dotColor: "bg-red-400",
    accent: "purple",
  },
  warning: {
    icon: AlertCircle,
    color: "text-amber-400",
    dotColor: "bg-amber-400",
    accent: "amber",
  },
  info: {
    icon: Info,
    color: "text-cyan-400",
    dotColor: "bg-cyan-400",
    accent: "cyan",
  },
};
