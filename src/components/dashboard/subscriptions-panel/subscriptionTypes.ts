import type { PersonaEventSubscription } from "@/lib/types";

export type EnrichedSubscription = PersonaEventSubscription & {
  personaName?: string;
  personaIcon?: string;
  personaColor?: string;
};

export type SubscriptionFilter = "all" | "active" | "disabled";
