import type { Translations } from "@/i18n/en";
import type { Tool, ToolBase } from "./types";

/**
 * The eight real tools: identity only (id, icon, colour). Each tool's name and
 * jobs are translated copy, read from `t.useCasesSection[id]` by `localizeTools`.
 */
export const toolBases: ToolBase[] = [
  {
    id: "gmail",
    icon: { src: "/icons/connectors/gmail.svg" },
    color: "#ea4335",
  },
  {
    id: "slack",
    icon: { src: "/icons/connectors/slack.svg" },
    color: "#4a154b",
  },
  {
    id: "github",
    icon: { src: "/icons/connectors/github.svg" },
    color: "#8b5cf6",
  },
  {
    id: "drive",
    icon: { src: "/icons/connectors/google.svg" },
    color: "#34a853",
  },
  {
    id: "jira",
    icon: { src: "/icons/connectors/jira.svg" },
    color: "#0052cc",
  },
  {
    id: "notion",
    icon: { src: "/icons/connectors/notion.svg" },
    color: "#e6e6e6",
  },
  {
    id: "calendar",
    icon: { src: "/icons/connectors/google-calendar.svg" },
    color: "#06b6d4",
  },
  {
    id: "figma",
    icon: { src: "/icons/connectors/figma.svg" },
    color: "#f24e1e",
  },
];

/** Joins each tool's identity with its translated name and jobs. */
export function localizeTools(copy: Translations["useCasesSection"]): Tool[] {
  return toolBases.map((base) => ({ ...base, name: copy[base.id].name, useCases: copy[base.id].cases }));
}
