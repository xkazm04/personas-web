import {
  AlertTriangle,
  CheckCircle2,
  Cpu,
  Gauge,
  Info,
  Plug,
  Server,
  XCircle,
} from "lucide-react";

import type {
  HealthCheckItem,
  HealthCheckStatus,
  HealthSectionKey,
} from "@/lib/mock-dashboard-data";

// Status → dot/text tints + icon. ok=emerald, warn=amber, error=rose, info=cyan
// (the dashboard's standard status ramp).
export const statusStyle: Record<
  HealthCheckStatus,
  { dot: string; text: string; icon: React.ElementType }
> = {
  ok: { dot: "bg-emerald-400", text: "text-emerald-400", icon: CheckCircle2 },
  warn: { dot: "bg-amber-400", text: "text-amber-400", icon: AlertTriangle },
  error: { dot: "bg-rose-400", text: "text-rose-400", icon: XCircle },
  info: { dot: "bg-cyan-400", text: "text-cyan-400", icon: Info },
};

export const sectionIcon: Record<HealthSectionKey, React.ElementType> = {
  runtime: Cpu,
  services: Server,
  resources: Gauge,
  integrations: Plug,
};

export const sectionAccent: Record<HealthSectionKey, "cyan" | "purple" | "emerald" | "amber"> = {
  runtime: "cyan",
  services: "purple",
  resources: "emerald",
  integrations: "amber",
};

const STATUS_RANK: Record<HealthCheckStatus, number> = { error: 3, warn: 2, info: 1, ok: 0 };

/** The worst status across a section's items — drives the section header dot. */
export function worstStatus(items: HealthCheckItem[]): HealthCheckStatus {
  return items.reduce<HealthCheckStatus>(
    (worst, item) => (STATUS_RANK[item.status] > STATUS_RANK[worst] ? item.status : worst),
    "ok",
  );
}
