import type { ComponentType } from "react";
import dynamic from "next/dynamic";

/**
 * Registry of sections available at /preview/[section]. Mapped by URL slug
 * to a dynamically-imported component.
 *
 * To add a section: add an entry below. The slug becomes the URL
 * (`/preview/{slug}`), the component is rendered inside the preview shell.
 *
 * The preview surface is dev-only — the page returns 404 in production
 * builds — so this registry can include experimental sections without
 * affecting the public site.
 */
export const PREVIEW_REGISTRY: Record<string, ComponentType> = {
  hero: dynamic(() => import("@/components/sections/Hero")),
  vision: dynamic(() => import("@/components/sections/vision-grid")),
  features: dynamic(() => import("@/components/sections/features")),
  pricing: dynamic(() => import("@/components/sections/pricing")),
  faq: dynamic(() => import("@/components/sections/FAQ")),
  "download-cta": dynamic(() => import("@/components/sections/DownloadCTA")),
  "get-started": dynamic(() => import("@/components/sections/get-started")),
  "orchestration-hub": dynamic(() => import("@/components/sections/orchestration-hub")),
  "platform-command": dynamic(() => import("@/components/sections/platform-command")),
  "platform-layers": dynamic(() => import("@/components/sections/platform-layers")),
  "event-bus": dynamic(() => import("@/components/sections/event-bus-showcase")),
  "agent-playground": dynamic(() => import("@/components/sections/agent-playground")),
  "agents-chat": dynamic(() => import("@/components/sections/agents-chat")),
  "agents-timeline": dynamic(() => import("@/components/sections/agents-timeline")),
  "playground-split": dynamic(() => import("@/components/sections/playground-split")),
  "playground-timeline": dynamic(() => import("@/components/sections/playground-timeline")),
  "use-cases": dynamic(() => import("@/components/sections/use-cases")),
  changelog: dynamic(() => import("@/components/sections/Changelog")),
  roadmap: dynamic(() => import("@/components/sections/roadmap")),
  "feature-voting": dynamic(() => import("@/components/sections/feature-voting")),
  footer: dynamic(() => import("@/components/sections/Footer")),
};
// Sections that require runtime props (e.g. connections-catalog needs
// activeCategory + search state) are intentionally excluded — register
// a wrapper here that mounts them with default props if they need
// preview support.

export const PREVIEW_SLUGS = Object.keys(PREVIEW_REGISTRY).sort();
