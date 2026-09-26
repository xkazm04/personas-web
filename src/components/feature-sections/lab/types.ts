import type { LucideIcon } from "lucide-react";
import type { Translations } from "@/i18n/en";

export type LabTab = "chat" | "arena" | "evolution" | "eval";

type LabCopy = Translations["labSection"];

/** Words live in `labSection` (en.ts); data carries ids and numbers only. */
export type ChatMessageKey = keyof LabCopy["chat"]["messages"];
export type ArenaInputKey = keyof LabCopy["arena"]["inputs"];
export type EvalDimensionKey = keyof LabCopy["eval"]["dimensions"];

export interface TabDef {
  key: LabTab;
  icon: LucideIcon;
  color: string;
}

/** A spoken line names its copy key; an applied diff is config text, kept in code. */
export type ChatMsg =
  | { role: "user" | "assistant"; message: ChatMessageKey; delay: number }
  | { role: "diff"; content: string; delay: number };

export interface Round {
  id: number;
  input: ArenaInputKey;
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
