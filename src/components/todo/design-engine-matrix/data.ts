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

/* Responsive cell height classes — taller to accommodate doubled dimension typography */
export const CELL_HEIGHT_CLASS = "min-h-[260px] sm:min-h-[320px] h-[260px] sm:h-[320px]";

/* Fluid monospace type that scales between 12px and 16px */
export const FLUID_MONO = "text-[clamp(0.75rem,2vw,1rem)]";

/* Doubled dimension label type — scales 24px to 32px */
export const FLUID_DIMENSION = "text-[clamp(1.5rem,4vw,2rem)]";
