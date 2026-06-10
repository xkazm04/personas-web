import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { cellStatusText, type CellState } from "./athenaFleetData";

const CELL_STYLE: Record<
  Exclude<CellState, "hidden">,
  { border: string; dot: string; status: string; pulse: boolean }
> = {
  spawning: { border: "border-cyan-400/30", dot: "bg-cyan-400", status: "text-cyan-300/80", pulse: true },
  working: { border: "border-foreground/[0.08]", dot: "bg-blue-400", status: "text-foreground/60", pulse: false },
  awaiting: { border: "border-violet-400/45 bg-violet-500/[0.06]", dot: "bg-violet-400", status: "text-violet-200", pulse: true },
  stale: { border: "border-orange-400/40", dot: "bg-orange-400", status: "text-orange-300/90", pulse: false },
  resolving: {
    border: "border-cyan-400/60 ring-1 ring-cyan-400/40 shadow-[0_0_16px_rgba(34,211,238,0.25)]",
    dot: "bg-cyan-400",
    status: "text-cyan-200",
    pulse: true,
  },
  done: { border: "border-emerald-400/30", dot: "bg-emerald-400", status: "text-emerald-300", pulse: false },
};

/** One CLI session tile; an empty dashed slot until its spawn wave hits. */
export function FleetCell({
  name,
  state,
  ask,
  reduced,
}: {
  name: string;
  state: CellState;
  ask?: string;
  reduced: boolean;
}) {
  if (state === "hidden") {
    return <div className="rounded-lg border border-dashed border-foreground/[0.07]" aria-hidden="true" />;
  }
  const style = CELL_STYLE[state];
  return (
    <motion.div
      initial={reduced ? false : { opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      className={`flex min-w-0 flex-col justify-center gap-0.5 rounded-lg border bg-[#0b0c12] px-2.5 py-1.5 font-mono transition-colors duration-500 ${style.border}`}
    >
      <span className="flex min-w-0 items-center gap-1.5">
        <span
          className={`h-1.5 w-1.5 shrink-0 rounded-full ${style.dot} ${style.pulse ? "animate-pulse" : ""}`}
          aria-hidden="true"
        />
        <span className="min-w-0 truncate text-[10px] text-foreground/85">{name}</span>
      </span>
      <span className={`min-w-0 truncate text-[10px] ${style.status}`}>
        {cellStatusText(state, ask)}
      </span>
    </motion.div>
  );
}

/**
 * Athena as a floating orb — the same avatar the site tour uses
 * (AthenaCompanion's idle loop), shrunk to the desktop companion's minimized
 * orb: she breathes while idle and glides to whichever terminal needs her,
 * narrating each resolution in a caption beside her. Under reduced motion no
 * <video> mounts at all — just the static poster (the desktop's avatar
 * resource discipline).
 */
export function AthenaOrb({
  x,
  y,
  resolving,
  caption,
  reduced,
}: {
  x: number;
  y: number;
  resolving: boolean;
  caption: string | null;
  reduced: boolean;
}) {
  const captionOnLeft = x > 55;
  return (
    <motion.div
      className="pointer-events-none absolute z-10"
      initial={false}
      animate={{ left: `${x}%`, top: `${y}%` }}
      transition={reduced ? { duration: 0 } : { duration: 0.8, ease: "easeInOut" }}
      style={{ left: `${x}%`, top: `${y}%` }}
    >
      <div className="relative -translate-x-1/2 -translate-y-1/2">
        {/* Halo — swells while she works a terminal */}
        <motion.div
          className="absolute -inset-3 rounded-full bg-cyan-400/30 blur-xl"
          initial={false}
          animate={
            reduced
              ? { opacity: resolving ? 0.9 : 0.5 }
              : resolving
                ? { opacity: [0.5, 0.95, 0.5], scale: [1, 1.18, 1] }
                : { opacity: 0.5, scale: 1 }
          }
          transition={
            resolving && !reduced ? { duration: 1.1, repeat: Infinity } : { duration: 0.4 }
          }
        />
        {/* Orb body — the tour avatar, gently breathing while idle */}
        <motion.div
          className="relative h-12 w-12 overflow-hidden rounded-full border border-brand-cyan/40 bg-brand-cyan/5 shadow-[0_0_24px_rgba(34,211,238,0.4)]"
          initial={false}
          animate={reduced ? undefined : { scale: [1, 1.05, 1] }}
          transition={reduced ? undefined : { duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
          aria-hidden="true"
        >
          {reduced ? (
            <Image
              src="/athena/athena_baseline.jpg"
              alt=""
              width={48}
              height={48}
              className="h-full w-full object-cover"
            />
          ) : (
            <video
              src="/athena/athena_idle_loop.mp4"
              poster="/athena/athena_baseline.jpg"
              muted
              loop
              autoPlay
              playsInline
              preload="auto"
              className="absolute inset-0 h-full w-full object-cover"
            />
          )}
        </motion.div>
        {/* Caption — what she just handled, narrated beside her */}
        <AnimatePresence mode="wait">
          {caption && (
            <motion.div
              key={caption}
              initial={reduced ? false : { opacity: 0, x: captionOnLeft ? 4 : -4 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              className={`absolute top-1/2 -translate-y-1/2 whitespace-nowrap rounded-full border border-brand-cyan/30 bg-[#0b0c12]/90 px-2.5 py-1 font-mono text-xs text-cyan-100 backdrop-blur-sm ${
                captionOnLeft ? "right-14" : "left-14"
              }`}
            >
              {caption}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
