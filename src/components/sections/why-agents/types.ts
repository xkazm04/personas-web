import type { ViewerRole } from "@/components/RoleSelector";

export type Scenario = {
  id: string;
  label: string;
  trigger: string;
  workflow: {
    steps: { text: string; status: "ok" | "warn" | "error" }[];
    result: string;
  };
  agent: {
    thoughts: string[];
    actions: string[];
    result: string;
  };
};

export type RoleCopy = {
  tagline: string;
  subtitle: string;
  highlights: readonly string[];
};

export type RoleCopyMap = Record<ViewerRole, RoleCopy>;
