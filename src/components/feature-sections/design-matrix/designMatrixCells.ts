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

export type CellKey =
  | "tasks"
  | "apps"
  | "triggers"
  | "review"
  | "messages"
  | "memory"
  | "errors"
  | "events";

export interface CellDef {
  key: CellKey;
  label: string;
  icon: LucideIcon;
  color: string;
  finalValue: string;
  question?: {
    prompt: string;
    options: string[];
    picked: number;
  };
}

export const CELLS: CellDef[] = [
  {
    key: "tasks",
    label: "Tasks",
    icon: Target,
    color: "#06b6d4",
    finalValue: "Triage inbox + draft replies for urgent",
  },
  {
    key: "apps",
    label: "Apps & Services",
    icon: Plug,
    color: "#a855f7",
    finalValue: "Gmail - Slack",
  },
  {
    key: "triggers",
    label: "When It Runs",
    icon: Clock,
    color: "#34d399",
    finalValue: "Every 15 minutes",
    question: {
      prompt: "How often should I check?",
      options: ["Every 15 min", "Every hour", "Real-time webhook"],
      picked: 0,
    },
  },
  {
    key: "review",
    label: "Human Review",
    icon: UserCheck,
    color: "#fbbf24",
    finalValue: "Approve drafts before sending",
    question: {
      prompt: "Send automatically or wait for approval?",
      options: ["Auto-send", "Approve first", "Ask only for urgent"],
      picked: 1,
    },
  },
  {
    key: "messages",
    label: "Messages",
    icon: MessageSquare,
    color: "#60a5fa",
    finalValue: "Post digest to #triage-inbox",
  },
  {
    key: "memory",
    label: "Memory",
    icon: Brain,
    color: "#ec4899",
    finalValue: "Learns sender priorities over time",
  },
  {
    key: "errors",
    label: "Errors",
    icon: ShieldAlert,
    color: "#f43f5e",
    finalValue: "Retry 3x then alert on Slack",
  },
  {
    key: "events",
    label: "Events",
    icon: Radio,
    color: "#f97316",
    finalValue: "Emits email.processed",
  },
];

export const USER_PROMPT =
  "Triage my Gmail inbox and draft replies for urgent emails.";
