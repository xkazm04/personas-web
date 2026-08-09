// PROTOTYPE COPY — extract to src/i18n at assembly
import { useId } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { BRAND_VAR, tint } from "@/lib/brand-theme";
import { ANNOTATION_DIM, PANEL, SPRING_POP } from "@/components/athena/stage/athena-tokens";
import WorldUI from "./WorldUI";
import { STOPS, WORLD, type Rect } from "./data";

const fg = (pct: number) => `color-mix(in srgb, var(--foreground) ${pct}%, transparent)`;

/** Four corner brackets that SNAP onto the target control at each arrival. */
export function TargetBrackets({ rect, reduced }: { rect: Rect; reduced: boolean }) {
  const pad = 12;
  const len = 20;
  const x0 = rect.x - pad;
  const y0 = rect.y - pad;
  const x1 = rect.x + rect.w + pad;
  const y1 = rect.y + rect.h + pad;
  const corners = [
    `M ${x0} ${y0 + len} V ${y0} H ${x0 + len}`,
    `M ${x1 - len} ${y0} H ${x1} V ${y0 + len}`,
    `M ${x1} ${y1 - len} V ${y1} H ${x1 - len}`,
    `M ${x0 + len} ${y1} H ${x0} V ${y1 - len}`,
  ];
  return (
    <motion.g
      style={{ transformBox: "fill-box", transformOrigin: "50% 50%" }}
      initial={reduced ? false : { opacity: 0, scale: 1.45 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.18 } }}
      transition={SPRING_POP}
    >
      {corners.map((d, i) => (
        <path key={i} d={d} fill="none" stroke={BRAND_VAR.cyan} strokeWidth={3.5} strokeLinecap="round" />
      ))}
    </motion.g>
  );
}

/**
 * Athena inside the world — the site-tour avatar shrunk to the desktop
 * companion's minimized orb (athena_baseline.jpg disc), drawn in world
 * coordinates so the camera's zoom carries her too. She glides stop to
 * stop; her ≤5-word caption floats above her while she's locked on.
 */
export function GuideOrb({
  x,
  y,
  caption,
  captionW,
  locked,
  reduced,
}: {
  x: number;
  y: number;
  caption: string | null;
  captionW: number;
  locked: boolean;
  reduced: boolean;
}) {
  const uid = useId();
  const r = 24;
  return (
    <motion.g
      initial={false}
      animate={{ x, y }}
      transition={reduced ? { duration: 0 } : { duration: 0.9, ease: "easeInOut" }}
    >
      {/* Halo — swells while she holds a control in frame */}
      <motion.circle
        r={r + 14}
        fill={tint("cyan", 22)}
        initial={false}
        animate={
          reduced
            ? { opacity: locked ? 0.9 : 0.5 }
            : locked
              ? { opacity: [0.5, 0.95, 0.5], scale: [1, 1.16, 1] }
              : { opacity: 0.5, scale: 1 }
        }
        transition={locked && !reduced ? { duration: 1.1, repeat: Infinity } : { duration: 0.4 }}
        style={{ transformBox: "fill-box", transformOrigin: "50% 50%" }}
      />
      <clipPath id={`${uid}-orb`}>
        <circle r={r} />
      </clipPath>
      <image
        href="/athena/athena_baseline.jpg"
        x={-r} y={-r} width={r * 2} height={r * 2}
        clipPath={`url(#${uid}-orb)`}
        preserveAspectRatio="xMidYMid slice"
      />
      <circle r={r} fill="none" stroke={tint("cyan", 45)} strokeWidth={2} />
      {/* Caption — her narration, above the orb, only while locked */}
      <AnimatePresence mode="wait">
        {caption && (
          <motion.g
            key={caption}
            initial={reduced ? false : { opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
          >
            <rect
              x={-captionW / 2} y={-r - 58} width={captionW} height={38} rx={19}
              fill="color-mix(in srgb, var(--background) 92%, transparent)"
              stroke={tint("cyan", 35)}
              strokeWidth={1.5}
            />
            <text
              y={-r - 33} textAnchor="middle" fontSize={17}
              fill={BRAND_VAR.cyan} className="font-mono"
            >
              {caption}
            </text>
          </motion.g>
        )}
      </AnimatePresence>
    </motion.g>
  );
}

/** Segmented progress rail — fixed to the frame edge; it does NOT travel. */
export function ProgressRail({
  activeIndex,
  resolved,
  reduced,
}: {
  activeIndex: number;
  resolved: number;
  reduced: boolean;
}) {
  const step = activeIndex >= 0 ? activeIndex + 1 : Math.min(resolved + 1, STOPS.length);
  return (
    <div className="flex items-center gap-3">
      <div className="flex items-center gap-1.5" role="presentation">
        {STOPS.map((s, i) => {
          const isDone = i < resolved;
          const isActive = i === activeIndex;
          return (
            <motion.span
              key={s.id}
              className="h-1.5 w-8 rounded-full sm:w-10"
              style={{ background: isDone || isActive ? BRAND_VAR.cyan : fg(15) }}
              initial={false}
              animate={isActive && !reduced ? { opacity: [0.45, 1, 0.45] } : { opacity: isDone || isActive ? 1 : 0.9 }}
              transition={isActive && !reduced ? { duration: 1.2, repeat: Infinity } : { duration: 0.3 }}
            />
          );
        })}
      </div>
      <span className={`${ANNOTATION_DIM} tabular-nums`}>
        step {step}/{STOPS.length}
      </span>
    </div>
  );
}

/**
 * Reduced-motion stand-in for camera travel: a corner inset map of the
 * whole UI with a viewport rectangle marking where the pinned camera sits.
 * Orientation without movement.
 */
export function InsetMap({ cam }: { cam: { x: number; y: number; zoom: number } }) {
  const vw = WORLD.w / cam.zoom;
  const vh = WORLD.h / cam.zoom;
  return (
    <div className={`${PANEL} w-40 overflow-hidden p-1.5 sm:w-48`}>
      <svg viewBox={`0 0 ${WORLD.w} ${WORLD.h}`} className="h-auto w-full" aria-hidden="true">
        <WorldUI toggleOn={false} deployHot={false} reduced />
        <rect
          x={cam.x - vw / 2} y={cam.y - vh / 2} width={vw} height={vh}
          fill={tint("cyan", 10)} stroke={BRAND_VAR.cyan} strokeWidth={8} rx={12}
        />
      </svg>
    </div>
  );
}
