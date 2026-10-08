import type { BrandKey } from "@/lib/brand-theme";
import type { GuideTopicRef } from "@/lib/guide-link";
import type { VisionStackCopy } from "@/i18n/pending/visionStack";

/**
 * The six platform cards: identity, colour, art and guide links. Every title,
 * description, detail and guide-link label is translated copy in
 * `visionStackCopy.layers[id]`.
 */

export type PlatformCardId = keyof VisionStackCopy["layers"];

export interface PlatformCard {
  id: PlatformCardId;
  brand: BrandKey;
  images: { dark: string; light: string };
  /** Guide deep-links; the link text is `visionStackCopy.layers[id].guide`. */
  guideTopics?: Omit<GuideTopicRef, "label">[];
}

export const PLATFORM_CARDS: PlatformCard[] = [
  {
    id: "credential-vault",
    brand: "purple",
    images: {
      dark: "/imgs/platform/credential-vault-dark.png",
      light: "/imgs/platform/credential-vault-light.png",
    },
    guideTopics: [{ category: "credentials", topic: "how-personas-keeps-your-data-safe" }],
  },
  {
    id: "templates",
    brand: "cyan",
    images: {
      dark: "/imgs/platform/templates-dark.png",
      light: "/imgs/platform/templates-light.png",
    },
    guideTopics: [{ category: "getting-started", topic: "browsing-templates" }],
  },
  {
    id: "byom",
    brand: "emerald",
    images: {
      dark: "/imgs/platform/byom-dark.png",
      light: "/imgs/platform/byom-light.png",
    },
    guideTopics: [{ category: "agents-prompts", topic: "creating-a-new-agent" }],
  },
  {
    id: "monitoring",
    brand: "rose",
    images: {
      dark: "/imgs/platform/monitoring-dark.png",
      light: "/imgs/platform/monitoring-light.png",
    },
    guideTopics: [{ category: "troubleshooting", topic: "self-healing-explained" }],
  },
  {
    id: "lab",
    brand: "amber",
    images: {
      dark: "/imgs/platform/lab-dark.png",
      light: "/imgs/platform/lab-light.png",
    },
    guideTopics: [{ category: "testing", topic: "running-a-breeding-cycle" }],
  },
  {
    id: "orchestration",
    brand: "cyan",
    images: {
      dark: "/imgs/platform/orchestration-dark.png",
      light: "/imgs/platform/orchestration-light.png",
    },
    guideTopics: [{ category: "triggers", topic: "how-triggers-work" }],
  },
];
