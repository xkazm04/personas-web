"use client";

import IllustrationSwitcher from "@/components/illustrate/IllustrationSwitcher";
import Current from "./MultiProviderAI.current";
import V_router from "./MultiProviderAI.router";
import V_two_sockets from "./MultiProviderAI.two-sockets";
import V_effort_dial from "./MultiProviderAI.effort-dial";

/* /illustrate prototype (1.1.0, picture first): current + three directions. */
const VARIANTS = [
  { key: "current", label: "Current", hint: "Two engine cards", Component: Current },
  { key: "router", label: "Router", hint: "Each task flows to the right engine", Component: V_router },
  { key: "two-sockets", label: "Two sockets", hint: "One runtime, two engines plugged in", Component: V_two_sockets },
  { key: "effort-dial", label: "Effort dial", hint: "Task weight turns the model dial", Component: V_effort_dial },
];

export default function MultiProviderAI() {
  return <IllustrationSwitcher section="ai-models" variants={VARIANTS} props={{}} />;
}
