/**
 * Pure derivation behind the /preview harness registry (`registry.ts`).
 *
 * The live pages load their sections through lazy-section tables
 * (`sections/lazy.tsx`, `how-lazy.tsx`, `athena-lazy.tsx`): each `Lazy*` export
 * is a `next/dynamic` component with its production skeleton and `ssr` flag.
 * The harness previews those exact components rather than re-wrapping the
 * import, so a new live section is previewable the moment it is exported, and
 * the preview renders with the same `ssr` setting production uses.
 *
 * Kept free of React/Next imports so `registry.test.ts` can run it in node.
 */

/**
 * `LazyEventBusShowcase` -> `event-bus-showcase`, `LazyDownloadCTA` ->
 * `download-cta`, `LazyFAQ` -> `faq`. Anything not shaped `Lazy<Name>` is not
 * a section and yields `null`.
 */
export function previewSlug(exportName: string): string | null {
  const match = /^Lazy([A-Z][A-Za-z0-9]*)$/.exec(exportName);
  if (!match) return null;
  return match[1]
    .replace(/([a-z0-9])([A-Z])/g, "$1-$2")
    .replace(/([A-Z]+)([A-Z][a-z])/g, "$1-$2")
    .toLowerCase();
}

/**
 * Slug -> component for every `Lazy*` export of the live tables, plus the named
 * preview-only extras. A `Map`, so a URL segment such as `constructor` cannot
 * resolve through `Object.prototype`. Throws on a slug collision, so an extra can
 * never shadow (and re-wrap with a different `ssr`) a live section.
 */
export function buildPreviewRegistry<C>(
  liveTables: readonly Readonly<Record<string, C>>[],
  previewExtras: Readonly<Record<string, C>>,
): ReadonlyMap<string, C> {
  const registry = new Map<string, C>();
  const add = (slug: string, component: C, origin: string) => {
    if (registry.has(slug)) {
      throw new Error(`[preview] duplicate section slug "${slug}" (${origin})`);
    }
    registry.set(slug, component);
  };
  for (const table of liveTables) {
    for (const [name, component] of Object.entries(table)) {
      const slug = previewSlug(name);
      if (slug) add(slug, component, `live export ${name}`);
    }
  }
  for (const [slug, component] of Object.entries(previewExtras)) {
    add(slug, component, "preview extra");
  }
  return registry;
}
