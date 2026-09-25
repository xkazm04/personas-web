import {
  Activity,
  PlayCircle,
  MessageSquare,
  Radio,
  Brain,
  HeartPulse,
  BookOpen,
  Gauge,
} from "lucide-react";
import { BRAND_VAR } from "@/lib/brand-theme";
import type { ActivityRow, AgentId, OverviewModule } from "./types";

export const baseActivity: ActivityRow[] = [
  {
    time: "09:14:22",
    agent: "PR Reviewer",
    event: "execution.completed",
    duration: "2.1s",
    cost: "$0.11",
    color: BRAND_VAR.emerald,
  },
  {
    time: "09:14:18",
    agent: "Email Triage",
    event: "message.sent",
    duration: "340ms",
    cost: "$0.00",
    color: BRAND_VAR.cyan,
  },
  {
    time: "09:14:15",
    agent: "Slack Digest",
    event: "execution.started",
    duration: "—",
    cost: "—",
    color: BRAND_VAR.purple,
  },
];

/** Sample agents in the deck; names are `t.observeSection.agents[id]`. */
export const agentPool: AgentId[] = [
  "prReviewer",
  "emailTriage",
  "slackDigest",
  "deployMonitor",
  "docIndexer",
  "meetingNotes",
];

export const eventPool = [
  "execution.completed",
  "execution.started",
  "message.sent",
  "event.emitted",
  "memory.stored",
  "review.requested",
  "knowledge.indexed",
  "health.checked",
];

export const colorPool = [
  BRAND_VAR.emerald,
  BRAND_VAR.cyan,
  BRAND_VAR.purple,
  BRAND_VAR.amber,
  BRAND_VAR.rose,
  BRAND_VAR.blue,
];

export const leftModules: OverviewModule[] = [
  {
    icon: PlayCircle,
    id: "executions",
    color: BRAND_VAR.emerald,
    filterPrefix: "execution",
  },
  {
    icon: MessageSquare,
    id: "messages",
    color: BRAND_VAR.cyan,
    filterPrefix: "message",
  },
  {
    icon: Radio,
    id: "events",
    color: BRAND_VAR.purple,
    filterPrefix: "event",
  },
  {
    icon: Brain,
    id: "memories",
    color: BRAND_VAR.amber,
    filterPrefix: "memory",
  },
];

export const rightModules: OverviewModule[] = [
  {
    icon: Activity,
    id: "activity",
    color: BRAND_VAR.rose,
    filterPrefix: "review",
  },
  {
    icon: HeartPulse,
    id: "health",
    color: BRAND_VAR.blue,
    filterPrefix: "health",
  },
  {
    icon: Gauge,
    id: "analytics",
    color: BRAND_VAR.rose,
    filterPrefix: "execution",
  },
  {
    icon: BookOpen,
    id: "knowledge",
    color: BRAND_VAR.amber,
    filterPrefix: "knowledge",
  },
];
