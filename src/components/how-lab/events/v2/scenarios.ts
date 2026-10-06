import { Inbox, Package, Users, PenLine, Eye, FlaskConical, BookOpen, Rocket, NotebookPen, ListChecks, Mail, Receipt, type LucideIcon } from "lucide-react";
import type { BrandKey } from "@/lib/brand-theme";
import type { SlotId } from "./geometry";

export type ScenarioId = "email" | "pr" | "meeting";

export interface Scenario {
  id: ScenarioId;
  /** Real tool marks from public/tools. */
  triggerTool: string;
  outputTool: string;
  brand: BrandKey;
  icons: Record<SlotId, LucideIcon>;
}

export const SCENARIOS: readonly Scenario[] = [
  { id: "email", triggerTool: "gmail", outputTool: "gmail", brand: "amber", icons: { a1: Inbox, a2: Package, a3: Users, a4: PenLine } },
  { id: "pr", triggerTool: "github", outputTool: "slack", brand: "purple", icons: { a1: Eye, a2: FlaskConical, a3: BookOpen, a4: Rocket } },
  { id: "meeting", triggerTool: "google-calendar", outputTool: "stripe", brand: "cyan", icons: { a1: NotebookPen, a2: ListChecks, a3: Mail, a4: Receipt } },
];
