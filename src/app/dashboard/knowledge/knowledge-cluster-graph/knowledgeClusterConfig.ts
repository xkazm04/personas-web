import { AlertCircle, ArrowRightLeft, Cpu, DollarSign, Workflow } from "lucide-react";
import type { ElementType } from "react";
import type { KnowledgePattern } from "@/lib/mock-dashboard-data";

export type KnowledgeType = KnowledgePattern["knowledgeType"];

export interface NodePosition {
  x: number;
  y: number;
}

export const KNOWLEDGE_CLUSTER_TYPE_CONFIG: Record<
  KnowledgeType,
  {
    icon: ElementType;
    labelKey: KnowledgeType;
    color: string;
    textColor: string;
    bgClass: string;
    clusterAngle: number;
  }
> = {
  tool_sequence: {
    icon: Workflow,
    labelKey: "tool_sequence",
    color: "#06b6d4",
    textColor: "text-cyan-400",
    bgClass: "bg-cyan-500/10",
    clusterAngle: 0,
  },
  failure_pattern: {
    icon: AlertCircle,
    labelKey: "failure_pattern",
    color: "#f43f5e",
    textColor: "text-rose-400",
    bgClass: "bg-rose-500/10",
    clusterAngle: 72,
  },
  cost_quality: {
    icon: DollarSign,
    labelKey: "cost_quality",
    color: "#f59e0b",
    textColor: "text-amber-400",
    bgClass: "bg-amber-500/10",
    clusterAngle: 144,
  },
  model_performance: {
    icon: Cpu,
    labelKey: "model_performance",
    color: "#a855f7",
    textColor: "text-purple-400",
    bgClass: "bg-purple-500/10",
    clusterAngle: 216,
  },
  data_flow: {
    icon: ArrowRightLeft,
    labelKey: "data_flow",
    color: "#10b981",
    textColor: "text-emerald-400",
    bgClass: "bg-emerald-500/10",
    clusterAngle: 288,
  },
};

export const PERSONA_COLORS: Record<string, string> = {
  ResearchAgent: "#06b6d4",
  CodeReviewer: "#34d399",
  DataProcessor: "#fbbf24",
  NotifyBot: "#a855f7",
  ReportGen: "#f43f5e",
};
