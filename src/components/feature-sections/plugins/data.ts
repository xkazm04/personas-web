import { Wrench, Brain } from "lucide-react";
import { BRAND_VAR } from "@/lib/brand-theme";

import DevToolsGrid from "./DevToolsGrid";
import SecondBrain from "./SecondBrain";
import { SHOWCASE_KEYS } from "./roster";

import type { PluginDef, PluginKey } from "./types";

/**
 * The demo for each showcased plugin. Keyed by the roster, so adding a key to
 * SHOWCASE_KEYS without a demo here (or a demo for a key the roster lacks) is
 * a type error.
 */
const DEMOS: Record<PluginKey, Omit<PluginDef, "key">> = {
  "dev-tools": {
    label: "Dev Tools",
    taglineKey: "devTools",
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
  "obsidian-brain": {
    label: "Brain",
    taglineKey: "brain",
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
};

export const PLUGINS: PluginDef[] = SHOWCASE_KEYS.map((key) => ({ key, ...DEMOS[key] }));
