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
  basic: "text-green-400 border-green-400/30 bg-green-400/10",
  professional: "text-yellow-400 border-yellow-400/30 bg-yellow-400/10",
  enterprise: "text-red-400 border-red-400/30 bg-red-400/10",
};
