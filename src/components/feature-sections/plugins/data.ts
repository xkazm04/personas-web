import {
  Palette,
  Wrench,
  Brain,
  Microscope,
} from "lucide-react";
import { BRAND_VAR } from "@/lib/brand-theme";

import ArtistGrid from "./ArtistGrid";
import DevToolsGrid from "./DevToolsGrid";
import SecondBrain from "./SecondBrain";
import ResearchLifecycle from "./ResearchLifecycle";
import ResearchSources from "./ResearchSources";

import type { PluginDef } from "./types";

export const PLUGINS: PluginDef[] = [
  {
    key: "artist",
    label: "Artist",
    tagline: "Generative art & media studio",
    icon: Palette,
    color: BRAND_VAR.rose,
    variants: [
      {
        key: "grid",
        label: "Style Grid",
        blurb: "Six curated styles · Lucid Origin 1024×1024",
        component: ArtistGrid,
      },
    ],
  },
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
  {
    key: "research-lab",
    label: "Research Lab",
    tagline: "Literature search & hypotheses",
    icon: Microscope,
    color: BRAND_VAR.blue,
    variants: [
      {
        key: "lifecycle",
        label: "Project Lifecycle",
        blurb: "8-stage pipeline from scoping to complete",
        component: ResearchLifecycle,
      },
      {
        key: "sources",
        label: "Literature",
        blurb: "Source board with citations and annotations",
        component: ResearchSources,
      },
    ],
  },
];
