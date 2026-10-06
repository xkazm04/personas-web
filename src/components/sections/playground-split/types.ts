import type { LucideIcon } from "lucide-react";
import type { Translations } from "@/i18n/en";

export type PlaygroundCopy = Translations["playgroundSection"];

export interface ToolNode {
  label: string;
  icon: LucideIcon;
}

export interface ResultCapabilities {
  messages: string;
  humanReview: string;
  events: string;
  memories: string;
}

export interface ExamplePrompt {
  /** Stable, untranslated identity (the `t.playgroundSection.examples` key). */
  id: ExampleBase["id"];
  label: string;
  icon: LucideIcon;
  iconColor: string;
  prompt: string;
  intentText: string;
  tools: ToolNode[];
  result: ResultCapabilities;
}

/** A sample prompt before its words are joined in (see `localizeExamples`). */
export interface ExampleBase {
  id: keyof PlaygroundCopy["examples"];
  icon: LucideIcon;
  iconColor: string;
  intentText: string;
  tools: { id: keyof PlaygroundCopy["tools"]; icon: LucideIcon }[];
  /** The emitted event, shown as code. */
  event: string;
}

export type NodeStatus = "pending" | "active" | "done";

export interface FlowNode {
  id: string;
  label: string;
  icon: LucideIcon;
  status: NodeStatus;
  x: number;
  y: number;
  parentId?: string;
  color?: string;
}

export type PlaygroundPhase = "idle" | "running" | "done";

export interface ResultDimension {
  key: keyof ResultCapabilities;
  icon: LucideIcon;
  color: string;
}
