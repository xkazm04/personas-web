// PROTOTYPE COPY — extract to src/i18n at assembly
/**
 * Every word in section 4, variant A: the SectionIntro trio plus the in-scene
 * labels of the stylized app. Nothing outside the illustration but the trio —
 * everything else here is something a real screen would say.
 *
 * The vocabulary is deliberately the visitor's, not the product's: a request,
 * a plan, steps, "start the work", "working", "your summary". Athena is only
 * ever "Athena".
 */

import {
  ArrowRight,
  Bell,
  FileText,
  Home,
  Inbox,
  Layers,
  ListChecks,
  Mic,
  Pencil,
  Search,
  Settings,
  Sparkles,
  type LucideIcon,
} from "lucide-react";

/** Brand glyphs this scene owns (both present in public/icons/connectors). */
const GLYPH = {
  slack: "/icons/connectors/slack.svg",
  gmail: "/icons/connectors/gmail.svg",
} as const;

export const COPY = {
  intro: {
    eyebrow: "Ask in your own words",
    heading: "One sentence, real",
    gradient: "work",
  },
  chrome: {
    appName: "Personas",
    search: "Search…",
    searchIcon: Search as LucideIcon,
    bellIcon: Bell as LucideIcon,
    rail: [Home, Sparkles, ListChecks, Inbox, Settings] as LucideIcon[],
    railActive: 1,
  },
  composer: {
    label: "New request",
    placeholder: "Ask Athena for anything…",
    /** The sentence that types itself in. Plain words, no product nouns. */
    request: "Tell me what customers complained about last week.",
    micIcon: Mic as LucideIcon,
    /** The one line that says a spoken request takes the identical path. */
    voiceHint: "or just say it",
    sendIcon: ArrowRight as LucideIcon,
    send: "Send",
    sent: "Sent",
    context: [
      { glyph: GLYPH.gmail, label: "Support inbox" },
      { glyph: GLYPH.slack, label: "#support" },
    ],
  },
  plan: {
    title: "Here's the plan",
    hint: "3 steps · yours to edit",
    hintCompact: "yours to edit",
    /** Lands on the beat the plan completes. */
    total: "about 7 minutes",
    editIcon: Pencil as LucideIcon,
    editHint: "edit",
    editedPill: "edited",
    steps: [
      {
        n: "1",
        title: "Gather the tickets",
        icon: Inbox as LucideIcon,
        source: "Support inbox",
        approach: "last 30 days",
        effort: "~2 min",
      },
      {
        n: "2",
        title: "Group the themes",
        icon: Layers as LucideIcon,
        source: "412 tickets",
        /** The chip her correction replaces — the soul of the section. */
        approach: "by product area",
        approachEdited: "by customer impact",
        effort: "~4 min",
      },
      {
        n: "3",
        title: "Write the summary",
        icon: FileText as LucideIcon,
        source: "One page",
        approach: "with examples",
        effort: "~1 min",
      },
    ],
  },
  confirm: {
    icon: Sparkles as LucideIcon,
    idle: "Start the work",
    done: "Work started",
    /** The guarantee, said once, in the place it matters. */
    note: "You decide when it runs",
  },
  board: {
    title: "Work in progress",
    hint: "5 at once",
    hintCompact: "3 at once",
    working: "working",
    done: "done",
    /** Each tile is one piece of the work, running beside the others.
     *  `fill` is where its bar sits mid-run — precomputed, never random. */
    tiles: [
      { label: "Reading tickets", fill: 72 },
      { label: "Tagging themes", fill: 55 },
      { label: "Ranking by impact", fill: 41 },
      { label: "Pulling examples", fill: 63 },
      { label: "Writing the summary", fill: 34 },
    ],
  },
  result: {
    title: "Your summary",
    pill: "ready",
    meta: "6 themes · 412 tickets",
    topLabel: "Biggest theme",
    topValue: "Billing confusion",
  },
} as const;
