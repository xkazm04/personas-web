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

/** Step visuals indexed by step number — consumed by GetStarted index. */
export const STEP_VISUALS = [
  DownloadVisual,
  ConnectVisual,
  CreateVisual,
  WorkVisual,
  ImproveVisual,
];

export type { VisualProps } from "./types";
