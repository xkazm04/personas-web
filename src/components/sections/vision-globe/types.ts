import type { LucideIcon } from "lucide-react";

export interface AgentData {
  name: string;
  icon: LucideIcon;
  status: string;
  executions: number;
  rate: number;
  color: string;
}
