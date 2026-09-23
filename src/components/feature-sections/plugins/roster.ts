// Which desktop plugins the /features showcase puts on stage. Component-free on
// purpose: data.ts joins these keys to their demo components, and the contract
// test (src/data/desktop-plugins.test.ts) imports this file under vitest/node.
//
// Every key must be `shipped` in the desktop manifest; the `satisfies` below
// makes a removed or dev-only id a tsc error before it is a test failure.

import {
  DESKTOP_PLUGINS,
  SHIPPED_DESKTOP_PLUGINS,
  type ShippedPluginId,
} from "@/data/desktop-plugins";

export const SHOWCASE_KEYS = ["dev-tools", "obsidian-brain"] as const satisfies readonly ShippedPluginId[];

export type ShowcaseKey = (typeof SHOWCASE_KEYS)[number];

/** The tab open on first paint; the site tour clicks `[data-plugin-key="dev-tools"]`. */
export const DEFAULT_SHOWCASE_KEY: ShowcaseKey = "dev-tools";

/** Throws, naming the id, if any key is not a plugin the desktop ships. */
export function assertShowcaseShipped(keys: readonly string[]): void {
  for (const key of keys) {
    const entry = DESKTOP_PLUGINS.find((p) => p.id === key);
    if (!entry) throw new Error(`Showcase key "${key}" is not a desktop plugin`);
    if (entry.status !== "shipped") {
      throw new Error(`Showcase key "${key}" is ${entry.status} on the desktop and cannot be showcased`);
    }
  }
}

/** The intro's three translated fragments (`t.pluginShowcase`). */
export interface IntroCopy {
  /** Every shipped plugin is on stage. Placeholder: {shipped}. */
  introAll: string;
  /** Some are on stage. Placeholders: {shipped}, {showcased}. */
  introSome: string;
  introTail: string;
}

/** Replace each `{name}` with its value; an unknown placeholder stays visible. */
export function fillTemplate(template: string, vars: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (whole, name: string) =>
    Object.hasOwn(vars, name) ? String(vars[name]) : whole,
  );
}

/**
 * The section intro. Both numbers are computed: `shipped` from the desktop
 * manifest (the fact) and `showcased` from the roster, so the headline cannot
 * state a count nobody derived. The sentence is a translated template; the
 * caller passes its locale's number formatter (digits, not number words, so
 * no locale needs a spell-out table).
 */
export function pluginsIntro(
  copy: IntroCopy,
  showcased: number,
  shipped: number,
  formatNumber: (n: number) => string = String,
): string {
  const vars = { shipped: formatNumber(shipped), showcased: formatNumber(showcased) };
  const lead = fillTemplate(showcased >= shipped ? copy.introAll : copy.introSome, vars);
  return `${lead} ${copy.introTail}`;
}

export const SHOWCASE_COUNTS = {
  showcased: SHOWCASE_KEYS.length,
  shipped: SHIPPED_DESKTOP_PLUGINS.length,
} as const;
