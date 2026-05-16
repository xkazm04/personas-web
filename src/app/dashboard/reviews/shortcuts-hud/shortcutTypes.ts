export type ShortcutCategory = "Navigation" | "Actions" | "Selection" | "Filters" | "Help";

export interface Shortcut {
  keys: string[];
  description: string;
  category: ShortcutCategory;
}

export const REVIEW_SHORTCUTS: Shortcut[] = [
  { keys: ["J"], description: "Next review", category: "Navigation" },
  { keys: ["K"], description: "Previous review", category: "Navigation" },
  { keys: ["A"], description: "Approve current", category: "Actions" },
  { keys: ["R"], description: "Reject current", category: "Actions" },
  { keys: ["?"], description: "Show all shortcuts", category: "Help" },
];

export const FOOTER_PRIORITY = ["J", "K", "A", "R", "?"];
