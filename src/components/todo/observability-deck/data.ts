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
import type { ActivityRow, OverviewModule } from "./types";

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

export const agentPool = [
  "PR Reviewer",
  "Email Triage",
  "Slack Digest",
  "Deploy Monitor",
  "Doc Indexer",
  "Meeting Notes",
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
    title: "Executions",
    blurb: "Every run, timed and traced",
    color: BRAND_VAR.emerald,
    filterPrefix: "execution",
  },
  {
    icon: MessageSquare,
    title: "Messages",
    blurb: "Full I/O transcripts per step",
    color: BRAND_VAR.cyan,
    filterPrefix: "message",
  },
  {
    icon: Radio,
    title: "Events",
    blurb: "Bus stream + replay + retries",
    color: BRAND_VAR.purple,
    filterPrefix: "event",
  },
  {
    icon: Brain,
    title: "Memories",
    blurb: "What agents learned, searchable",
    color: BRAND_VAR.amber,
    filterPrefix: "memory",
  },
];

export const rightModules: OverviewModule[] = [
  {
    icon: Activity,
    title: "Activity",
    blurb: "Live lanes across all personas",
    color: BRAND_VAR.rose,
    filterPrefix: "review",
  },
  {
    icon: HeartPulse,
    title: "Health",
    blurb: "Status, healing, dead-letters",
    color: BRAND_VAR.blue,
    filterPrefix: "health",
  },
  {
    icon: Gauge,
    title: "Analytics",
    blurb: "Success rate, duration, cost",
    color: BRAND_VAR.rose,
    filterPrefix: "execution",
  },
  {
    icon: BookOpen,
    title: "Knowledge",
    blurb: "Cross-persona semantic search",
    color: BRAND_VAR.amber,
    filterPrefix: "knowledge",
  },
];
