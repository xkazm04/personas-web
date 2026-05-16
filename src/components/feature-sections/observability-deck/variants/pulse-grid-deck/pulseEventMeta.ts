import {
  Activity,
  Brain,
  CheckCircle2,
  MessageCircle,
  PlayCircle,
  Radio,
  ShieldAlert,
} from "lucide-react";

import { BRAND_VAR } from "@/lib/brand-theme";

import type { EventType } from "./pulseGridTypes";

export const EVENT_META: Record<EventType, { icon: typeof CheckCircle2; short: string; color: string }> = {
  "execution.completed": {
    icon: CheckCircle2,
    short: "done",
    color: BRAND_VAR.emerald,
  },
  "execution.started": {
    icon: PlayCircle,
    short: "run",
    color: BRAND_VAR.cyan,
  },
  "message.sent": {
    icon: MessageCircle,
    short: "msg",
    color: BRAND_VAR.cyan,
  },
  "event.emitted": {
    icon: Radio,
    short: "evt",
    color: BRAND_VAR.purple,
  },
  "memory.stored": {
    icon: Brain,
    short: "mem",
    color: BRAND_VAR.amber,
  },
  "review.requested": {
    icon: ShieldAlert,
    short: "rev",
    color: BRAND_VAR.rose,
  },
  "knowledge.indexed": {
    icon: Brain,
    short: "kb",
    color: BRAND_VAR.amber,
  },
  "health.checked": {
    icon: Activity,
    short: "ok",
    color: BRAND_VAR.blue,
  },
};
