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

/* Responsive cell height classes — min-h only so content can grow without forcing overflow */
export const CELL_HEIGHT_CLASS = "min-h-[260px] sm:min-h-[320px]";

/* Fluid monospace type that scales between ~11.2px and ~14.4px */
export const FLUID_MONO = "text-[clamp(0.7rem,1.6vw,0.9rem)]";

/* Dimension label type — scales 18px to 30px for calmer mobile rhythm */
export const FLUID_DIMENSION = "text-[clamp(1.125rem,3.2vw,1.875rem)]";
