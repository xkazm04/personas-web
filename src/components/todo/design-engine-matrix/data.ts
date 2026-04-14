import type { CellKey } from "../designMatrixShared";

/* Per-cell Leonardo illustration paths */
export const CELL_IMAGE: Record<CellKey, string> = {
  tasks: "/imgs/features/matrix/tasks.png",
  apps: "/imgs/features/matrix/apps.png",
  triggers: "/imgs/features/matrix/triggers.png",
  messages: "/imgs/features/matrix/messages.png",
  review: "/imgs/features/matrix/review.png",
  memory: "/imgs/features/matrix/memory.png",
  errors: "/imgs/features/matrix/errors.png",
  events: "/imgs/features/matrix/events.png",
};

export const INTENT_IMAGE = "/imgs/features/matrix/intent.png";

/* Fixed cell dimensions — tall enough for every state without reflow */
export const CELL_MIN_HEIGHT = 280;
