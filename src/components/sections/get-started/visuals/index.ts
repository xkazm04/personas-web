import { TOUR_STEPS } from "@/data/tour";
import { DownloadVisual } from "./DownloadVisual";
import { ConnectVisual } from "./ConnectVisual";
import { CreateVisual } from "./CreateVisual";
import { WorkVisual } from "./WorkVisual";
import { ImproveVisual } from "./ImproveVisual";

export {
  DownloadVisual,
  ConnectVisual,
  CreateVisual,
  WorkVisual,
  ImproveVisual,
};

/**
 * Step visuals indexed by step position — consumed by GetStarted index.
 * The icon and brand fields moved into TOUR_STEPS itself (see C6 fix);
 * visual stays as a parallel array because importing JSX-component
 * references into a /data/ file would be a layering inversion.
 *
 * The dev-only assertion below catches the silent index-drift bug if
 * TOUR_STEPS gains/loses an entry without a matching update here.
 */
export const STEP_VISUALS = [
  DownloadVisual,
  ConnectVisual,
  CreateVisual,
  WorkVisual,
  ImproveVisual,
];

if (process.env.NODE_ENV !== "production" && STEP_VISUALS.length !== TOUR_STEPS.length) {
  // eslint-disable-next-line no-console
  console.error(
    `[get-started] STEP_VISUALS.length (${STEP_VISUALS.length}) does not match TOUR_STEPS.length (${TOUR_STEPS.length}). The visuals will be misaligned with their step content. Add or remove a Visual to match.`,
  );
}

export type { VisualProps } from "./types";
