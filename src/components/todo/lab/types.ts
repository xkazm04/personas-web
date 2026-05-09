import type { LucideIcon } from "lucide-react";

export type LabTab = "chat" | "arena" | "evolution" | "eval";

export interface TabDef {
  key: LabTab;
  label: string;
  icon: LucideIcon;
  color: string;
  blurb: string;
}

export interface ChatMsg {
  role: "user" | "assistant" | "diff";
  content: string;
  delay: number;
}

export interface Round {
  id: number;
  input: string;
  winner: "A" | "B";
  scoreA: number;
  scoreB: number;
}

export interface GenomeNode {
  id: string;
  gen: number;
  x: number;
  fitness: number;
  parent: string | null;
  alive: boolean;
  best: boolean;
}
