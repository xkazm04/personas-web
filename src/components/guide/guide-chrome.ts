/**
 * Vertical offsets for the guide's fixed reading chrome.
 *
 * The marketing `Navbar` is `position: fixed` and its height is derived from
 * its content, not from a fixed class: `nav` contributes `py-4` (32px) and the
 * row inside it is a 44px tap-target on mobile / a 54px nav row from `lg` up.
 * Measured against the production build: **76px below `lg`, 86px from `lg`**.
 *
 * Three elements pin themselves under that navbar — `ReadingProgress`,
 * `MobileTopicTOC` and the `GuideSidebar` drawer trigger. They used to each
 * hardcode `60px`, which put them *behind* the navbar and on top of each
 * other. Everything that offsets against the navbar must use the constants
 * below so the bars stack in one predictable band:
 *
 * ```
 *   0 ┌──────────────── Navbar (76 / 86) ────────────────┐
 *  76 ├── reading progress (2px) ────────────────────────┤
 *  78 ├── mobile TOC bar (44px) + sidebar trigger lane ──┤
 * 122 └── page content / TOC panel scrim ────────────────┘
 * ```
 *
 * The values are literal Tailwind classes rather than numbers because Tailwind
 * only compiles utilities it can see as complete strings in the source.
 */

/** Measured navbar height in px — the source of truth for the classes below. */
export const NAVBAR_HEIGHT_PX = { base: 76, lg: 86 } as const;

/** Height of the reading-progress bar in px. */
export const PROGRESS_HEIGHT_PX = 2;

/** Height of the mobile TOC bar (and of the sidebar trigger sharing its band). */
export const MOBILE_CHROME_HEIGHT_PX = 44;

/** Top padding that clears the fixed navbar — used by the guide layout. */
export const CHROME_PAD_NAVBAR = "pt-[76px] lg:pt-[86px]";

/** Desktop sidebar: pinned directly under the navbar, filling the rest. */
export const CHROME_SIDEBAR_STICKY = "top-[86px] h-[calc(100dvh-86px)]";

/** Reading progress bar: flush against the bottom edge of the navbar. */
export const CHROME_TOP_PROGRESS = "top-[76px] lg:top-[86px]";

/** Mobile TOC bar + sidebar trigger: directly below the progress bar (76 + 2). */
export const CHROME_TOP_MOBILE_BAR = "top-[78px]";

/** Scrim / panel below the mobile chrome band (78 + 44). */
export const CHROME_TOP_MOBILE_BELOW = "top-[122px]";

/**
 * Left lane the sidebar trigger occupies inside the mobile chrome band, so the
 * TOC bar's own content starts to the right of it instead of underneath it.
 */
export const CHROME_TRIGGER_LANE = "pl-16";

/** Extra top padding a topic article needs to clear the mobile TOC bar (122 - 76). */
export const CHROME_PAD_TOPIC = "pt-12 lg:pt-0";

/** Desktop on-this-page TOC sticky offset (navbar 86 + 16px breathing room). */
export const CHROME_TOC_STICKY = "top-[102px]";
