import type { LucideIcon } from "lucide-react";

export interface OutputLine {
  text: string;
  color: "cyan" | "emerald" | "amber" | "purple" | "white" | "muted" | "rose";
  indent?: number;
  delay?: number;
}

export interface CommandSequence {
  command: string;
  icon: LucideIcon;
  pillar: string;
  output: OutputLine[];
}

export type TerminalPhase =
  | "idle"
  | "typing"
  | "output"
  | "pause"
  | "summary"
  | "done";
