export interface ToolIcon {
  src: string;
  fallback?: boolean;
}

/** Tools whose name and jobs live in `t.useCasesSection`. */
export type ToolId = "gmail" | "slack" | "github" | "drive" | "jira" | "notion" | "calendar" | "figma";

export interface ToolBase {
  id: ToolId;
  icon: ToolIcon;
  color: string;
}

export interface Tool extends ToolBase {
  name: string;
  useCases: { title: string; desc: string }[];
}
