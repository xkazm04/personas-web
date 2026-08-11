import type { ComponentType } from "react";
import dynamic from "next/dynamic";

/*
 * The /athena page, section by section, in reading order.
 *
 * A slot holds every variant still in play for one section. When the owner
 * picks a winner, collapse its `variants` to the winning entry and set
 * `locked: true` — the switcher then renders the label instead of a tab bar.
 * Sections under iteration keep their tabs.
 *
 * Kept out of the switcher component so the page's shape is data, and so the
 * component stays under the repo's 200-line rule as the page grows.
 */

export type Variant = {
  id: string;
  label: string;
  note: string;
  Component: ComponentType;
};

export type SectionSlot = {
  id: string;
  title: string;
  locked?: boolean;
  variants: Variant[];
};

export const PAGE: SectionSlot[] = [
  {
    id: "hero",
    title: "Hero",
    locked: true,
    variants: [
      {
        id: "presence",
        label: "Presence ✓",
        note: "winner — locks the page tone",
        Component: dynamic(() => import("@/components/athena/hero/variant-a")),
      },
    ],
  },
  {
    id: "onboarding-partner",
    title: "S3 — Onboarding partner",
    variants: [
      {
        id: "glide",
        label: "A — The Glide (developing)",
        note: "winner in refinement — she sets the workspace up with you",
        Component: dynamic(
          () => import("@/components/athena/sections/onboarding-partner/variant-a"),
        ),
      },
    ],
  },
  {
    id: "fleet-orchestration",
    title: "S4 — Fleet orchestration",
    locked: true,
    variants: [
      {
        id: "decomposition",
        label: "Decomposition ✓",
        note: "winner — the sentence comes apart into the work it implies",
        Component: dynamic(
          () => import("@/components/athena/sections/fleet-orchestration/variant-b"),
        ),
      },
    ],
  },
  {
    id: "her-workshop",
    title: "S5 — Everything she can put to work",
    variants: [
      {
        id: "wall",
        label: "A — The Wall",
        note: "many running at once; one pass, every screen answers",
        Component: dynamic(
          () => import("@/components/athena/sections/her-workshop/variant-a"),
        ),
      },
      {
        id: "workshop",
        label: "B — The Workshop",
        note: "five different instruments, four clocks, one desk",
        Component: dynamic(
          () => import("@/components/athena/sections/her-workshop/variant-b"),
        ),
      },
      {
        id: "fence",
        label: "C — The Fence",
        note: "wildcard: the dial moves, the boundary never does",
        Component: dynamic(
          () => import("@/components/athena/sections/her-workshop/variant-c"),
        ),
      },
    ],
  },
  {
    id: "whole-portfolio",
    title: "S6 — Your whole portfolio",
    locked: true,
    variants: [
      {
        id: "flight",
        label: "The Flight ✓",
        note: "winner — the camera travels, then descends onto the worst one",
        Component: dynamic(
          () => import("@/components/athena/sections/whole-portfolio/variant-a"),
        ),
      },
    ],
  },
  {
    id: "lasting-memory",
    title: "S7 — She grows with you",
    locked: true,
    variants: [
      {
        id: "every-night",
        label: "Every Night, A Little More ✓",
        note: "winner — five ordinary days; talk churns, the shelf only grows",
        Component: dynamic(
          () => import("@/components/athena/sections/lasting-memory/variant-e"),
        ),
      },
    ],
  },
  {
    id: "one-mind",
    title: "S8 — Always the same person",
    locked: true,
    variants: [
      {
        id: "the-return",
        label: "The Return ✓",
        note: "winner — the page arrives instead of fanning out",
        Component: dynamic(
          () => import("@/components/athena/sections/one-mind/variant-c"),
        ),
      },
    ],
  },
];
