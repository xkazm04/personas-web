import { Clapperboard, FileSpreadsheet, FileText, Film, Image as ImageIcon, NotebookPen, Palette, PenLine, ScrollText, Target, type LucideIcon } from "lucide-react";
import type { FeaturesSectionsCopy } from "@/i18n/pending/featuresSections";

type AgentKey = keyof FeaturesSectionsCopy["plugins"]["drive"]["agents"];

/**
 * What the Drive scene's agents export, in landing order. File names are the
 * agents' own output (code, kept here); who made each one is copy. Each file
 * drops into its own slot of the drawer and its row appears in the browser.
 */
export interface DriveFile {
  name: string;
  ext: string;
  size: string;
  agent: AgentKey;
  /** The file's type, in the browser row. */
  icon: LucideIcon;
  /** The agent that exports it, on the chute above its slot. */
  agentIcon: LucideIcon;
  /** Slot centre in the drawer's 420-wide viewBox. */
  x: number;
}

export const FILES: DriveFile[] = [
  { name: "q3-report.pdf", ext: "pdf", size: "2.4 MB", agent: "report", icon: FileText, agentIcon: PenLine, x: 70 },
  { name: "launch-hero.png", ext: "png", size: "1.1 MB", agent: "design", icon: ImageIcon, agentIcon: Palette, x: 140 },
  { name: "warm-leads.csv", ext: "csv", size: "84 KB", agent: "leads", icon: FileSpreadsheet, agentIcon: Target, x: 210 },
  { name: "promo-cut.mp4", ext: "mp4", size: "38 MB", agent: "video", icon: Film, agentIcon: Clapperboard, x: 280 },
  { name: "standup.md", ext: "md", size: "6 KB", agent: "notes", icon: NotebookPen, agentIcon: ScrollText, x: 350 },
];

/** The app version before and after the scene's upgrade beat (stylised). */
export const VERSIONS = { before: "v0.5", after: "v0.6" } as const;

/**
 * One cycle, in beats: files land on beats 0-4, the app updates on beat 5,
 * the drawer holds - every file still there - until the loop restarts.
 */
export const DRIVE_CYCLE = 9;
export const UPDATE_BEAT = FILES.length;
/** Reduced motion / off screen: everything landed, the update done, all kept. */
export const DRIVE_STILL = DRIVE_CYCLE - 2;

export function driveAt(step: number) {
  const phase = step % DRIVE_CYCLE;
  const landed = Math.min(phase + 1, FILES.length);
  const updating = phase === UPDATE_BEAT;
  const updated = phase > UPDATE_BEAT;
  return { phase, landed, updating, updated };
}
