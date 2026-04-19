import {
  Palette,
  Wrench,
  Brain,
  Microscope,
} from "lucide-react";
import { BRAND_VAR } from "@/lib/brand-theme";

import ArtistGrid from "./ArtistGrid";
import DevToolsRunner from "./DevToolsRunner";
import DevToolsLifecycle from "./DevToolsLifecycle";
import ObsidianBrowser from "./ObsidianBrowser";
import ObsidianCloudSync from "./ObsidianCloudSync";
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
    tagline: "Projects, triage, task runner",
    icon: Wrench,
    color: BRAND_VAR.cyan,
    variants: [
      {
        key: "runner",
        label: "Task Runner",
        blurb: "Live queue, streaming output, self-healing actions",
        component: DevToolsRunner,
      },
      {
        key: "lifecycle",
        label: "Goal Lifecycle",
        blurb: "Kanban from idea → scoped → active → shipped",
        component: DevToolsLifecycle,
      },
    ],
  },
  {
    key: "obsidian-brain",
    label: "Obsidian Brain",
    tagline: "Your vault, agent-ready",
    icon: Brain,
    color: BRAND_VAR.purple,
    variants: [
      {
        key: "browser",
        label: "Vault Browser",
        blurb: "Tree + markdown preview with live backlinks",
        component: ObsidianBrowser,
      },
      {
        key: "cloud",
        label: "Cloud Sync",
        blurb: "Google Drive push/pull with live sync log",
        component: ObsidianCloudSync,
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
