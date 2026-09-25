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
        blurbKey: "athenaFleet",
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
        blurbKey: "brain",
        component: SecondBrain,
      },
    ],
  },
};

export const PLUGINS: PluginDef[] = SHOWCASE_KEYS.map((key) => ({ key, ...DEMOS[key] }));
