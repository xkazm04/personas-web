import { AlertCircle, ArrowRightLeft, Cpu, DollarSign, Workflow } from "lucide-react";
import type { ElementType } from "react";
import type { KnowledgeType } from "./knowledgeDenseTypes";

export const KNOWLEDGE_TYPE_CONFIG: Record<
  KnowledgeType,
  {
    icon: ElementType;
    labelKey: KnowledgeType;
    color: string;
    textColor: string;
    bgClass: string;
  }
> = {
  tool_sequence: {
    icon: Workflow,
    labelKey: "tool_sequence",
    color: "#06b6d4",
    textColor: "text-cyan-400",
    bgClass: "bg-cyan-500/10",
  },
  failure_pattern: {
    icon: AlertCircle,
    labelKey: "failure_pattern",
    color: "#f43f5e",
    textColor: "text-rose-400",
    bgClass: "bg-rose-500/10",
  },
  cost_quality: {
    icon: DollarSign,
    labelKey: "cost_quality",
    color: "#f59e0b",
    textColor: "text-amber-400",
    bgClass: "bg-amber-500/10",
  },
  model_performance: {
    icon: Cpu,
    labelKey: "model_performance",
    color: "#a855f7",
    textColor: "text-purple-400",
    bgClass: "bg-purple-500/10",
  },
  data_flow: {
    icon: ArrowRightLeft,
    labelKey: "data_flow",
    color: "#10b981",
    textColor: "text-emerald-400",
    bgClass: "bg-emerald-500/10",
  },
};
