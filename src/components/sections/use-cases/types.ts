export interface ToolIcon {
  src: string;
  fallback?: boolean;
}

export interface Tool {
  id: string;
  name: string;
  icon: ToolIcon;
  color: string;
  useCases: { title: string; desc: string }[];
}

/**
 * Closed union of agent statuses recognized by `statusStyles` /
 * AgentArmyGrid. Adding a new status without updating the styles record
 * is now a tsc error instead of a runtime crash.
 */
export type AgentStatus = "running" | "healing" | "idle";

export interface AgentData {
  name: string;
  iconSrc: string;
  status: AgentStatus;
  executions: number;
  rate: number;
  color: string;
}
