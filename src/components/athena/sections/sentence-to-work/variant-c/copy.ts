// PROTOTYPE COPY — extract to src/i18n at assembly
/**
 * Every word in section 4, variant C. Outside the illustration there is only
 * the title trio; everything else here is something the scene itself says.
 *
 * Two rules shaped all of it. First, plain human language only — the request
 * is a sentence a person would actually say out loud, the plan reads like a
 * plan, and the answer that greets you reads like a note left on your desk.
 * Second, the three lights you can read in the sky are word-for-word the three
 * lines you approved, and the three lines that greet you on return are those
 * same three finished — so the visitor never has to be told the connection.
 */

import { Check, Keyboard, Mic, Pencil, type LucideIcon } from "lucide-react";

export const COPY = {
  intro: {
    eyebrow: "Step away",
    heading: "Come back to it",
    gradient: "finished",
  },
  ask: {
    /** Spoken and typed take the identical path — both glyphs, one bubble. */
    micIcon: Mic as LucideIcon,
    keysIcon: Keyboard as LucideIcon,
    waysLabel: "spoken or typed",
    request: "Get the launch ready for Monday.",
    planLabel: "Athena's plan",
    planHint: "change anything",
    editIcon: Pencil as LucideIcon,
    plan: ["Draft the announcement", "Check the numbers", "Line up the replies"] as const,
    confirm: "Looks right — go",
    confirmIcon: Check as LucideIcon,
    confirmed: "Confirmed",
  },
  work: {
    /** Light labels — the same three lines, now running. */
    tasks: ["Draft the announcement", "Check the numbers", "Line up the replies"] as const,
    /** The one that will not guess on your behalf. */
    waiting: "waiting for you",
  },
  presence: {
    you: "you",
  },
  summary: {
    title: "While you were away",
    doneIcon: Check as LucideIcon,
    done: ["Announcement drafted", "Numbers checked", "Replies lined up"] as const,
    more: "and five smaller things",
    wantsTitle: "One thing wants you",
    wantsBody: "Which date should we announce?",
  },
} as const;
