import type { ComponentType } from "react";
import dynamic from "next/dynamic";
import * as homeSections from "@/components/sections/lazy";
import * as howSections from "@/components/sections/how-lazy";
import * as athenaSections from "@/components/sections/athena-lazy";
import { buildPreviewRegistry } from "./derive";

/**
 * Sections available at /preview/[section] (dev-only - both preview routes 404
 * in production).
 *
 * Live sections are DERIVED, not listed: every `Lazy*` export of the tables the
 * public pages load (/, /how, /athena) is previewable under its kebab-cased
 * name (`LazyTeamCanvas` -> `/preview/team-canvas`), rendering the very
 * component production mounts - same skeleton, same `ssr` flag. Export a new
 * `Lazy*` section and it appears here; `registry.test.ts` pins that.
 *
 * Only this module (and the client `PreviewMount` that imports it) may read the
 * tables as namespaces: they are "use client" modules, so a server component
 * would see client references instead of enumerable exports.
 */

/**
 * Previewable sections that are NOT reached through a lazy table: page-level
 * direct mounts (hero + footer on /, roadmap + feature-voting on /roadmap) and
 * components with no public mount at all. An extra may not reuse a live
 * section's slug - `buildPreviewRegistry` throws.
 *
 * Sections that require runtime props (e.g. connections-catalog needs
 * activeCategory + search state) are intentionally absent - register a wrapper
 * that mounts them with default props if they need preview support.
 */
export const PREVIEW_EXTRAS: Record<string, ComponentType> = {
  hero: dynamic(() => import("@/components/sections/Hero")),
  footer: dynamic(() => import("@/components/sections/Footer")),
  roadmap: dynamic(() => import("@/components/sections/roadmap")),
  "feature-voting": dynamic(() => import("@/components/sections/feature-voting")),
  // Preview-only: no page mounts these.
  features: dynamic(() => import("@/components/sections/features")),
  "platform-command": dynamic(() => import("@/components/sections/platform-command")),
  "agent-playground": dynamic(() => import("@/components/sections/agent-playground")),
  "playground-timeline": dynamic(() => import("@/components/sections/playground-timeline")),
  changelog: dynamic(() => import("@/components/sections/Changelog")),
};

export const PREVIEW_REGISTRY: ReadonlyMap<string, ComponentType> = buildPreviewRegistry<ComponentType>(
  [homeSections, howSections, athenaSections],
  PREVIEW_EXTRAS,
);

export const PREVIEW_SLUGS = [...PREVIEW_REGISTRY.keys()].sort();
