/**
 * The non-word half of section 3 ("Onboarding partner"), variant A: which icon
 * each in-scene control wears, which brand glyph each row carries, and the few
 * indices the scene reads off its own content.
 *
 * Every WORD this section renders lives in `src/i18n` under
 * `athenaPage.onboarding` — nav items, connector rows, template cards and the
 * recent-runs table are ordered lists there, and the arrays below are their
 * structural twins. Same order, same length: change one, change both.
 *
 * Icons split two ways on purpose:
 *   • real products  → the brand SVGs in `public/icons/connectors`, rendered
 *     through `ConnectorIcon` (flattened to one theme-aware tone).
 *   • generic UI affordances (search, bell, clock, chart, sparkles…) → lucide.
 */

import {
  Activity,
  Bell,
  Bot,
  Check,
  ChevronRight,
  Clock3,
  Home,
  KeyRound,
  LayoutTemplate,
  Pencil,
  Plug,
  Search,
  Settings,
  Sparkles,
  type LucideIcon,
} from "lucide-react";

/** The brand glyphs this scene owns (all present in public/icons/connectors). */
const GLYPH = {
  slack: "/icons/connectors/slack.svg",
  github: "/icons/connectors/github.svg",
  notion: "/icons/connectors/notion.svg",
  gmail: "/icons/connectors/gmail.svg",
} as const;

export const SCENE = {
  chrome: {
    searchIcon: Search as LucideIcon,
    bellIcon: Bell as LucideIcon,
    /** One per `athenaPage.onboarding.chrome.nav` entry, same order. */
    navIcons: [Home, Bot, LayoutTemplate, Plug, KeyRound, Settings] as LucideIcon[],
    navActive: 2,
    usagePct: 72,
  },
  canvas: {
    crumbIcon: ChevronRight as LucideIcon,
    /** Which filter chip carries the brand tint. */
    filterActive: 0,
    templateGlyph: GLYPH.slack,
    templateAltGlyph: GLYPH.gmail,
    /** One per recent-runs row: its brand glyph, and whether it has landed. */
    runsRows: [
      { glyph: GLYPH.slack, ok: true },
      { glyph: GLYPH.github, ok: true },
      { glyph: GLYPH.notion, ok: false },
    ],
    slackGlyph: GLYPH.slack,
    /** One per already-connected chip, same order as the i18n chips. */
    chipGlyphs: [GLYPH.github, GLYPH.notion],
    triggerIcon: Clock3 as LucideIcon,
    triggerHintIcon: Pencil as LucideIcon,
    triggerActiveDays: [1, 2, 3, 4, 5] as readonly number[],
    activityIcon: Activity as LucideIcon,
    // The mark a committed choice leaves on the thing that was chosen
    chosenIcon: Check as LucideIcon,
    // Final action — the button commits into its own done state
    actionIcon: Sparkles as LucideIcon,
    actionDoneIcon: Check as LucideIcon,
  },
} as const;
