import { Clock, Mouse, Radio, Webhook, Zap, type LucideIcon } from "lucide-react";

export const triggerIcons: Record<string, LucideIcon> = {
  schedule: Clock,
  webhook: Webhook,
  manual: Mouse,
  event: Zap,
  polling: Radio,
};

export const triggerDescriptions: Record<string, string> = {
  schedule: "Runs automatically on a time-based schedule",
  webhook: "Triggered by incoming web requests from external services",
  manual: "Run on-demand with one click from the Personas app",
  event: "Activates when specific events occur in your system",
  polling: "Checks for changes at regular intervals",
};

export const complexityColors: Record<string, string> = {
  basic: "text-emerald-400 border-emerald-400/30 bg-emerald-400/10",
  professional: "text-amber-400 border-amber-400/30 bg-amber-400/10",
  enterprise: "text-red-400 border-red-400/30 bg-red-400/10",
};
