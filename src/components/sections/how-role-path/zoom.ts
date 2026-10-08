import type { CSSProperties } from "react";

/* Height tiers for DOM-built stage art (the same tiers as stage.css
 * `data-stage-zoom`: 1.2 / 1.35 / 1.6). stage.css's attribute zooms a block of
 * natural height; these blocks FILL their slot, so the factor is set as `--cz`
 * on the section and the filling element divides its slot size by it - it
 * renders larger and crisper on tall monitors and still ends exactly at the
 * slot's edges. Below the stage --cz is unset and nothing zooms. (Same shape
 * as the chat section's helper; kept local so the two can move apart.) */

/** On the SectionWrapper: sets --cz per tier. */
export const ZOOM_TIERS =
  "[@media(min-width:64rem)_and_(min-height:56rem)]:[--cz:1.2] [@media(min-width:80rem)_and_(min-height:67.5rem)]:[--cz:1.35] [@media(min-width:100rem)_and_(min-height:78rem)]:[--cz:1.6]";

/** On an element that is the direct child of a data-stage-slot and fills it. */
export const ZOOM_FILL = "stage:h-[calc(100cqh/var(--cz,1))] stage:w-[calc(100cqw/var(--cz,1))]";

export const zoomStyle: CSSProperties = { zoom: "var(--cz, 1)" };
