// ── Guide → desktop module feed (public/guide/modules/v1.json) ─────────
// TOPIC_MODULE_MAP read backwards. The map answers "where in the desktop app
// is this topic?"; the desktop's contextual help needs the inverse, "which
// topics belong to the screen I am on?". This module builds that inverse as a
// versioned, published contract, the way public/roadmap/v1.json is.
//
// Deliberately pure and import-light: scripts and tests both build the feed
// through here, and the published JSON is pinned to it by
// guide-modules-feed.test.ts (regenerate with scripts/generate-guide-modules.mjs).
// ────────────────────────────────────────────────────────────────────────

import { LANGUAGES } from "@/i18n/localeRelease";
import { DESKTOP_MODULES, TOPIC_MODULE_MAP } from "@/data/guide/desktop-modules";
import { GUIDE_TOPICS } from "@/data/guide/topics";
import { resolveTopicUnit } from "@/data/guide/getLocalized";
import { isTopicVisible } from "@/lib/guide-utils";

export const GUIDE_MODULES_FEED_VERSION = 1;
export const GUIDE_MODULES_FEED_PATH = "public/guide/modules/v1.json";

export interface GuideModulesFeedTopic {
  id: string;
  category: string;
  /** Site-relative guide URL; the desktop appends `?from=<screen.from>`. */
  href: string;
  /** Where the topic lives below the screen, e.g. ["Design"] for Agents → Editor → Design. */
  section: string[];
  /** Title per locale. A locale without a current whole translation carries the English title. */
  titles: Record<string, string>;
}

export interface GuideModulesFeedScreen {
  /** Child id from the sidebar mirror, or a slug of the label for a view that is not a sidebar item (e.g. the agent editor). */
  id: string;
  label: string;
  /** "sidebar": id is a DESKTOP_MODULES child id. "view": id is a slugged label. */
  kind: "sidebar" | "view";
  /** Value for the guide link's `?from=` param: `<moduleId>/<screen id>`. */
  from: string;
  /** Ranked: guide order, which is the curated reading order. */
  topics: GuideModulesFeedTopic[];
}

export interface GuideModulesFeedModule {
  id: string;
  label: string;
  /** `?from=` value when the reader is on the module but no finer screen. */
  from: string;
  /** Every topic of the module across its screens, ranked. */
  topics: GuideModulesFeedTopic[];
  screens: GuideModulesFeedScreen[];
}

export interface GuideModulesFeed {
  schemaVersion: typeof GUIDE_MODULES_FEED_VERSION;
  locales: string[];
  modules: GuideModulesFeedModule[];
}

const slug = (label: string) =>
  label
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

/**
 * Build the feed from the live registries. Hidden (devOnly) topics are
 * excluded exactly as the site excludes them in production: a help link to a
 * topic that renders a 404 is worse than no link.
 */
export async function buildGuideModulesFeed(): Promise<GuideModulesFeed> {
  const locales = LANGUAGES.map((l) => l.id as string);

  const entries = await Promise.all(
    GUIDE_TOPICS.filter((t) => isTopicVisible(t) && TOPIC_MODULE_MAP[t.id]).map(async (topic) => {
      const ref = TOPIC_MODULE_MAP[topic.id];
      const titles: Record<string, string> = {};
      for (const lang of locales) {
        // Same whole-unit contract as the topic page: a stale or partial
        // translation resolves to the current English title.
        const unit = await resolveTopicUnit(
          lang as Parameters<typeof resolveTopicUnit>[0],
          topic.id,
          { title: topic.title, description: topic.description, body: "" },
        );
        titles[lang] = unit.title;
      }
      const item: GuideModulesFeedTopic = {
        id: topic.id,
        category: topic.categoryId,
        href: `/guide/${topic.categoryId}/${topic.id}`,
        section: ref.path.slice(2),
        titles,
      };
      return { item, ref };
    }),
  );

  const modules: GuideModulesFeedModule[] = [];
  for (const mod of DESKTOP_MODULES) {
    const mine = entries.filter((e) => e.ref.moduleId === mod.id);
    if (mine.length === 0) continue;

    const screens: GuideModulesFeedScreen[] = [];
    for (const { item, ref } of mine) {
      const screenLabel = ref.path[1];
      if (!screenLabel) continue;
      const child = mod.children?.find((c) => c.label === screenLabel);
      const id = child?.id ?? slug(screenLabel);
      let screen = screens.find((s) => s.id === id);
      if (!screen) {
        screen = { id, label: screenLabel, kind: child ? "sidebar" : "view", from: `${mod.id}/${id}`, topics: [] };
        screens.push(screen);
      }
      screen.topics.push(item);
    }

    modules.push({
      id: mod.id,
      label: mod.label,
      from: mod.id,
      topics: mine.map((e) => e.item),
      screens,
    });
  }

  return { schemaVersion: GUIDE_MODULES_FEED_VERSION, locales, modules };
}

/** Canonical on-disk form of the feed: stable, diff-friendly, trailing newline. */
export function serializeGuideModulesFeed(feed: GuideModulesFeed): string {
  return JSON.stringify(feed, null, 2) + "\n";
}
