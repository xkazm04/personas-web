import {
  Brain,
  Clock,
  MessageSquare,
  Plug,
  Radio,
  ShieldAlert,
  Target,
  UserCheck,
  type LucideIcon,
} from "lucide-react";
import type { Translations } from "@/i18n/en";

export type CellKey =
  | "tasks"
  | "apps"
  | "triggers"
  | "review"
  | "messages"
  | "memory"
  | "errors"
  | "events";

type DesignMatrixCopy = Translations["designMatrix"];

/**
 * A matrix cell's identity. Its label, resolved value and question words are
 * translated copy in `t.designMatrix`, joined in by `localizeCells`.
 */
export interface CellBase {
  key: CellKey;
  icon: LucideIcon;
  color: string;
  question?: {
    id: keyof DesignMatrixCopy["questions"];
    picked: number;
  };
}

/** A cell with its translated words. */
export interface CellDef extends Omit<CellBase, "question"> {
  label: string;
  finalValue: string;
  question?: {
    prompt: string;
    options: string[];
    picked: number;
  };
}

export const CELLS: CellBase[] = [
  { key: "tasks", icon: Target, color: "#06b6d4" },
  { key: "apps", icon: Plug, color: "#a855f7" },
  { key: "triggers", icon: Clock, color: "#34d399", question: { id: "triggers", picked: 0 } },
  { key: "review", icon: UserCheck, color: "#fbbf24", question: { id: "review", picked: 1 } },
  { key: "messages", icon: MessageSquare, color: "#60a5fa" },
  { key: "memory", icon: Brain, color: "#ec4899" },
  { key: "errors", icon: ShieldAlert, color: "#f43f5e" },
  { key: "events", icon: Radio, color: "#f97316" },
];

/** Joins each cell's identity with its translated words. */
export function localizeCells(copy: DesignMatrixCopy): CellDef[] {
  return CELLS.map(({ question, ...base }) => ({
    ...base,
    label: copy.cells[base.key].label,
    finalValue: copy.cells[base.key].value,
    question: question && {
      prompt: copy.questions[question.id].prompt,
      options: copy.questions[question.id].options,
      picked: question.picked,
    },
  }));
}
