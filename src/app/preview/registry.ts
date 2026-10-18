import type { ComponentType } from "react";
import dynamic from "next/dynamic";
import * as homeSections from "@/components/sections/lazy";
import * as howSections from "@/components/sections/how-lazy";
import * as athenaSections from "@/components/sections/athena-lazy";
import { buildPreviewRegistry } from "./derive";

/** Placeholder for a section the server page renders itself; see PREVIEW_EXTRAS.roadmap. */
function ServerRenderedSlot() {
  return null;
}

/**
 * Sections available at /preview/[section] (dev-only - both preview routes 404
 * in production).
 *
 * Live sections are DERIVED, not listed: every `Lazy*` export of the tables the
 * public pages load (/, /how, /athena) is previewable under its kebab-cased
 * name (`LazyOrchestrationHub` -> `/preview/orchestration-hub`), rendering the very
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
  hero: dynamic(() => import("@/components/sections/hero-hive")),
  footer: dynamic(() => import("@/components/sections/Footer")),
  // Server-only section (its area counts are derived from the heavy catalogs, and
  // `roadmap-area-counts.ts` is `server-only`): importing it here would drag the
  // catalogs into this client graph. The slug is registered so it is listed and
  // resolvable; the section itself is rendered by the server page and handed to
  // `PreviewSectionMount` as a slot, which wins over this placeholder.
  roadmap: ServerRenderedSlot,
  "feature-voting": dynamic(() => import("@/components/sections/feature-voting")),
  // Preview-only: no page mounts these.
  "platform-command": dynamic(() => import("@/components/sections/platform-command")),
};

export const PREVIEW_REGISTRY: ReadonlyMap<string, ComponentType> = buildPreviewRegistry<ComponentType>(
  [homeSections, howSections, athenaSections],
  PREVIEW_EXTRAS,
);

export const PREVIEW_SLUGS = [...PREVIEW_REGISTRY.keys()].sort();
