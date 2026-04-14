import {
  Clock,
  Globe,
  Clipboard,
  FolderOpen,
  Link,
  Radio,
  Timer,
  MousePointerClick,
} from "lucide-react";
import { BRAND_VAR } from "@/lib/brand-theme";
import type { Trigger } from "./types";

export const triggers: Trigger[] = [
  {
    icon: MousePointerClick,
    name: "Manual",
    brand: "cyan",
    color: BRAND_VAR.cyan,
    desc: "On-demand from the UI",
    detail: "Click to run instantly. Supports dry-run mode and custom JSON input.",
    example: "\"Run my PR reviewer now\"",
  },
  {
    icon: Clock,
    name: "Schedule",
    brand: "purple",
    color: BRAND_VAR.purple,
    desc: "Time-based schedule",
    detail:
      "Set any schedule — every hour, daily, weekly, or custom. Background scheduler checks every 5 seconds.",
    example: "0 9 * * MON-FRI",
  },
  {
    icon: Globe,
    name: "Webhook",
    brand: "emerald",
    color: BRAND_VAR.emerald,
    desc: "Incoming web requests",
    detail: "Receives data from any web service, with request logging and replay.",
    example: "POST /webhook/deploy",
  },
  {
    icon: Clipboard,
    name: "Clipboard",
    brand: "amber",
    color: BRAND_VAR.amber,
    desc: "Clipboard monitor",
    detail:
      "Watches for specific text patterns you define. Captures text, URLs, and JSON from clipboard.",
    example: "/^JIRA-\\d+/",
  },
  {
    icon: FolderOpen,
    name: "File Watch",
    brand: "rose",
    color: BRAND_VAR.rose,
    desc: "File changes",
    detail: "Watches folders for new or changed files. Triggers on create, modify, or delete.",
    example: "~/Downloads/*.csv",
  },
  {
    icon: Link,
    name: "Chain",
    brand: "blue",
    color: BRAND_VAR.blue,
    desc: "Chain to next agent",
    detail: "One agent's output feeds into the next. Seamless handoff between agents.",
    example: "Triage → Classify → Route",
  },
  {
    icon: Radio,
    name: "Event Bus",
    brand: "purple",
    color: BRAND_VAR.purple,
    desc: "Custom events",
    detail: "Listens for specific events in your system. Failed events are saved for retry.",
    example: "on: deploy.failed",
  },
  {
    icon: Timer,
    name: "Polling",
    brand: "cyan",
    color: BRAND_VAR.cyan,
    desc: "Regular check-ins",
    detail: "Checks at regular intervals, skips duplicates. Prevents redundant runs automatically.",
    example: "Every 60s: check API",
  },
];
