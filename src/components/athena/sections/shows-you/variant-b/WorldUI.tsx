// PROTOTYPE COPY — extract to src/i18n at assembly
import { motion } from "framer-motion";
import { BRAND_VAR, tint } from "@/lib/brand-theme";

/**
 * The stylized app UI — an SVG "world" (1600×1000) larger than the frame,
 * drawn once in world coordinates and moved by the camera group in index.
 * All labels here are UI labels INSIDE the illustration (allowed words).
 * Pure render: state (toggle flipped, deploy pulsing) arrives as props
 * derived from the deterministic phase upstream.
 */

/** Foreground at a given strength — theme-adaptive, no raw hex. */
const fg = (pct: number) => `color-mix(in srgb, var(--foreground) ${pct}%, transparent)`;

const NAV = [
  { label: "Overview", y: 176 },
  { label: "Connectors", y: 236 },
  { label: "Agents", y: 296 },
  { label: "Settings", y: 356 },
] as const;

const ROWS = [
  { label: "github · synced", y: 648, dot: BRAND_VAR.emerald },
  { label: "slack · synced", y: 708, dot: BRAND_VAR.emerald },
  { label: "postgres · pending", y: 768, dot: BRAND_VAR.amber },
] as const;

const ACTIVITY_BARS = [300, 210, 340, 180, 260] as const;

export default function WorldUI({
  toggleOn,
  deployHot,
  reduced,
}: {
  /** Auto-sync toggle state (flips mid-stop-2). */
  toggleOn: boolean;
  /** Camera is locked on the action button — it pulses. */
  deployHot: boolean;
  reduced: boolean;
}) {
  return (
    <g className="font-mono">
      {/* App window */}
      <rect x={80} y={60} width={1440} height={880} rx={20} fill={fg(3)} stroke={fg(9)} strokeWidth={2} />
      <line x1={80} y1={140} x2={1520} y2={140} stroke={fg(8)} strokeWidth={2} />
      {[0, 1, 2].map((i) => (
        <circle key={i} cx={116 + i * 28} cy={100} r={6} fill={fg(16)} />
      ))}
      <text x={176} y={108} fontSize={19} fill={fg(60)}>
        personas — connectors
      </text>

      {/* Sidebar */}
      <line x1={400} y1={140} x2={400} y2={940} stroke={fg(8)} strokeWidth={2} />
      {NAV.map((item) => {
        const dest = item.label === "Connectors";
        return (
          <g key={item.label}>
            <rect
              x={104} y={item.y} width={272} height={48} rx={10}
              fill={dest ? tint("cyan", 8) : fg(4)}
              stroke={dest ? tint("cyan", 30) : fg(7)}
              strokeWidth={1.5}
            />
            <text x={132} y={item.y + 31} fontSize={19} fill={dest ? BRAND_VAR.cyan : fg(62)}>
              {item.label}
            </text>
          </g>
        );
      })}

      {/* Main heading */}
      <text x={448} y={205} fontSize={30} fontWeight={600} fill={fg(85)} className="font-sans">
        Connectors
      </text>

      {/* Sync card — the auto-sync toggle lives here (stop 2) */}
      <rect x={448} y={240} width={620} height={200} rx={14} fill={fg(3)} stroke={fg(9)} strokeWidth={1.5} />
      <text x={480} y={288} fontSize={20} fill={fg(78)}>Sync</text>
      <text x={480} y={324} fontSize={18} fill={fg(62)}>Auto-sync</text>
      <text x={480} y={350} fontSize={15} fill={fg(48)}>every 5 min</text>
      <rect
        x={968} y={280} width={88} height={40} rx={20}
        fill={toggleOn ? tint("emerald", 30) : fg(8)}
        stroke={toggleOn ? tint("emerald", 55) : fg(14)}
        strokeWidth={2}
      />
      <motion.circle
        cy={300} r={14}
        fill={toggleOn ? BRAND_VAR.emerald : fg(45)}
        initial={false}
        animate={{ cx: toggleOn ? 1034 : 990 }}
        transition={reduced ? { duration: 0 } : { duration: 0.35, ease: "easeOut" }}
      />
      <text x={480} y={412} fontSize={15} fill={fg(48)}>conflict policy · newest wins</text>

      {/* Region card (stop 3) */}
      <rect x={448} y={470} width={620} height={140} rx={14} fill={fg(3)} stroke={fg(9)} strokeWidth={1.5} />
      <text x={480} y={534} fontSize={18} fill={fg(62)}>Region</text>
      <rect x={716} y={494} width={312} height={64} rx={10} fill={fg(4)} stroke={fg(13)} strokeWidth={1.5} />
      <text x={744} y={534} fontSize={19} fill={fg(72)}>eu-west-1</text>
      <path d="M 986 522 l 10 12 l 10 -12" fill="none" stroke={fg(50)} strokeWidth={2.5} strokeLinecap="round" />

      {/* Activity panel */}
      <rect x={1130} y={240} width={390} height={370} rx={14} fill={fg(3)} stroke={fg(9)} strokeWidth={1.5} />
      <text x={1162} y={288} fontSize={18} fill={fg(62)}>Activity</text>
      {ACTIVITY_BARS.map((w, i) => (
        <rect key={i} x={1162} y={318 + i * 46} width={w} height={12} rx={6} fill={i === 0 ? tint("cyan", 25) : fg(8)} />
      ))}

      {/* Connector rows */}
      {ROWS.map((row) => (
        <g key={row.label}>
          <rect x={448} y={row.y} width={620} height={48} rx={10} fill={fg(3)} stroke={fg(7)} strokeWidth={1.5} />
          <circle cx={478} cy={row.y + 24} r={6} fill={row.dot} opacity={0.85} />
          <text x={500} y={row.y + 31} fontSize={17} fill={fg(60)}>{row.label}</text>
        </g>
      ))}

      {/* The action button — the walkthrough's destination (stop 4) */}
      <motion.rect
        x={1276} y={778} width={248} height={104} rx={18}
        fill="none" stroke={BRAND_VAR.cyan} strokeWidth={2.5}
        initial={false}
        animate={
          deployHot
            ? reduced
              ? { opacity: 0.55 }
              : { opacity: [0.15, 0.65, 0.15] }
            : { opacity: 0 }
        }
        transition={deployHot && !reduced ? { duration: 1.2, repeat: Infinity } : { duration: 0.3 }}
      />
      <rect x={1288} y={790} width={224} height={80} rx={14} fill={BRAND_VAR.cyan} />
      <text
        x={1400} y={838} fontSize={24} fontWeight={600} textAnchor="middle"
        fill="var(--background)" className="font-sans"
      >
        Deploy
      </text>
    </g>
  );
}
