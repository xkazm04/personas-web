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

const NUMBER_WORDS = [
  "zero", "one", "two", "three", "four", "five", "six",
  "seven", "eight", "nine", "ten", "eleven", "twelve",
];

const inWords = (n: number) => NUMBER_WORDS[n] ?? String(n);
const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

/**
 * The section intro. Both numbers are computed: `shipped` from the desktop
 * manifest (the fact) and `showcased` from the roster, so the headline cannot
 * state a count nobody derived.
 */
export function pluginsIntro(showcased: number, shipped: number): string {
  const lead =
    showcased >= shipped
      ? `${capitalize(inWords(shipped))} plugins ship with Personas, and every one is at work below.`
      : `${capitalize(inWords(shipped))} plugins ship with Personas, and ${inWords(showcased)} of them are at work below.`;
  return `${lead} Each is a self-contained workspace your agents can drive, sharing the same credentials and composing with the others. Switch a tab to meet another specialist.`;
}

export const SHOWCASE_INTRO = pluginsIntro(SHOWCASE_KEYS.length, SHIPPED_DESKTOP_PLUGINS.length);
