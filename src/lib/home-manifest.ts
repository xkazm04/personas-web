import type { StageColor } from "@/lib/colors";

/* ── The home page's composition, declared once ─────────────────────
 *
 * `HOME_STAGES` is the single declaration of the stage stack `/` renders after
 * the hero. Everything that used to copy it now reads it:
 *
 *  - `app/page.tsx` renders each row (wrapper, `StageSection`, optional
 *    `LazyMount`), mapping `slug` to its component;
 *  - `/preview/[section]` wraps a slug in the SAME stage when the manifest has
 *    it, so a section is previewed in its production frame;
 *  - `landing-address.ts` derives its wrapper aliases from `wrapperId`;
 *  - `home-manifest.test.ts` pins that `LANDING_SECTIONS` (the scroll map) and
 *    this table cannot drift (this replaced a dev-only `console.warn`).
 *
 * Pure data, no React: node tests import it and the server page and the client
 * preview both read it without crossing a "use client" boundary. `slug` is the
 * section's `/preview/<slug>` name (see `app/preview/derive.ts`).
 */

export interface StageGlow {
  glow: "cyan" | "purple" | "emerald";
  fromColor: StageColor;
  toColor?: StageColor;
}

/** A stage section of the landing. `anchorId` is its declared address (see
 *  `lib/landing-address.ts`); `wrapperId` is the alias that external links and
 *  the guided tour still use. `gate` defers the chunk until the reader nears it. */
export interface HomeStage extends StageGlow {
  slug: string;
  wrapperId?: string;
  anchorId: string;
  gate?: boolean;
}

export const HOME_STAGES: readonly HomeStage[] = [
  { slug: "use-cases",         glow: "emerald", fromColor: "cyan",    toColor: "emerald", wrapperId: "tools",       anchorId: "personas",    gate: true },
  { slug: "playground-split",  glow: "cyan",    fromColor: "emerald", toColor: "cyan",    wrapperId: "playground",  anchorId: "concepts",    gate: true },
  { slug: "get-started",       glow: "emerald", fromColor: "cyan",    toColor: "emerald", anchorId: "get-started", gate: true },
  { slug: "orchestration-hub", glow: "cyan",    fromColor: "emerald", toColor: "cyan",    wrapperId: "pipelines",   anchorId: "triggers",    gate: true },
  { slug: "team-canvas",       glow: "purple",  fromColor: "cyan",    toColor: "purple",  anchorId: "team-canvas", gate: true },
  { slug: "companion",         glow: "purple",  fromColor: "purple",  toColor: "purple",  anchorId: "companion",   gate: true },
  { slug: "vision",            glow: "purple",  fromColor: "purple",  toColor: "purple",  wrapperId: "vision",      anchorId: "private" },
  { slug: "pricing",           glow: "purple",  fromColor: "purple",  toColor: "purple",  wrapperId: "pricing",     anchorId: "pricing" },
  { slug: "faq",               glow: "cyan",    fromColor: "purple",  toColor: "cyan",    anchorId: "faq" },
  { slug: "download-cta",      glow: "cyan",    fromColor: "cyan",                          wrapperId: "download-section", anchorId: "download", gate: true },
];

/** Stage rows by preview slug. */
export const HOME_STAGE_BY_SLUG: ReadonlyMap<string, HomeStage> = new Map(HOME_STAGES.map((s) => [s.slug, s]));

/** External wrapper id -> declared address, for every row whose wrapper differs
 *  from its anchor. */
export const HOME_WRAPPER_ALIASES: Readonly<Record<string, string>> = Object.fromEntries(
  HOME_STAGES.filter((s) => s.wrapperId && s.wrapperId !== s.anchorId).map((s) => [s.wrapperId!, s.anchorId]),
);
