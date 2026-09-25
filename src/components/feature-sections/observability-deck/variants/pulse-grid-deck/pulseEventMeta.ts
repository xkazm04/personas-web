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

/** Icon and colour per event; the short status word is `t.observeSection.eventShort[type]`. */
export const EVENT_META: Record<EventType, { icon: typeof CheckCircle2; color: string }> = {
  "execution.completed": {
    icon: CheckCircle2,
    color: BRAND_VAR.emerald,
  },
  "execution.started": {
    icon: PlayCircle,
    color: BRAND_VAR.cyan,
  },
  "message.sent": {
    icon: MessageCircle,
    color: BRAND_VAR.cyan,
  },
  "event.emitted": {
    icon: Radio,
    color: BRAND_VAR.purple,
  },
  "memory.stored": {
    icon: Brain,
    color: BRAND_VAR.amber,
  },
  "review.requested": {
    icon: ShieldAlert,
    color: BRAND_VAR.rose,
  },
  "knowledge.indexed": {
    icon: Brain,
    color: BRAND_VAR.amber,
  },
  "health.checked": {
    icon: Activity,
    color: BRAND_VAR.blue,
  },
};
