import { Wrench, Brain } from "lucide-react";
import { BRAND_VAR } from "@/lib/brand-theme";

import DevToolsGrid from "./DevToolsGrid";
import SecondBrain from "./SecondBrain";

import type { PluginDef } from "./types";

export const PLUGINS: PluginDef[] = [
  {
    key: "dev-tools",
    label: "Dev Tools",
    tagline: "Parallel agent fleet, projects, triage",
    icon: Wrench,
    color: BRAND_VAR.cyan,
    variants: [
      {
        key: "athena-fleet",
        label: "Athena Fleet",
        blurb: "A grid of CLIs under Athena's watch — her orb glides to whatever blocks them and answers on-policy",
        component: DevToolsGrid,
      },
    ],
  },
  {
    key: "obsidian-brain",
    label: "Brain",
    tagline: "Your vault, agent-ready",
    icon: Brain,
    color: BRAND_VAR.purple,
    variants: [
      {
        key: "brain",
        label: "Second Brain",
        blurb: "Knowledge graph view — your notes, connected and alive",
        component: SecondBrain,
      },
    ],
  },
];
