"use client";

import { motion } from "framer-motion";
import { INK, SOFT, FAINT, PAPER, SOLID, SELF, beat, mix, type SceneProps } from "./scene-kit";

/* Vignettes for file watcher, clipboard, app focus and event - see scenes.ts. */

/** File watcher: a document drops into the watched folder and the folder lights as it lands. */
export function FileScene({ run, tone }: SceneProps) {
  return (
    <>
      <rect x="20" y="16" width="120" height="96" rx="12" stroke={mix(tone, 55)} strokeWidth="1.4" strokeDasharray="4 5" />
      <path d="M34 48 h28 l7 8 h57 v46 h-92 z" fill={PAPER} stroke={INK} strokeWidth="1.6" strokeLinejoin="round" />
      <motion.g {...beat(run, { y: [-74, -74, 0, 0, 0], opacity: [0, 1, 1, 1, 0] }, { y: 0, opacity: 1 }, [0, 0.12, 0.45, 0.9, 1], "easeIn")}>
        <rect x="64" y="34" width="32" height="40" rx="3" fill={SOLID} stroke={INK} strokeWidth="1.5" />
        <path d="M86 34 v8 h10" stroke={INK} strokeWidth="1.2" />
        <rect x="69" y="45" width="16" height="5" rx="1.5" fill={tone} />
        <line x1="69" y1="56" x2="90" y2="56" stroke={SOFT} strokeWidth="2" strokeLinecap="round" />
        <line x1="69" y1="63" x2="86" y2="63" stroke={SOFT} strokeWidth="2" strokeLinecap="round" />
      </motion.g>
      <path d="M30 66 h100 l-6 36 h-88 z" fill={SOLID} stroke={INK} strokeWidth="1.6" strokeLinejoin="round" />
      <motion.path d="M30 66 h100 l-6 36 h-88 z" fill={mix(tone, 34)} stroke={tone} strokeWidth="1.6" strokeLinejoin="round"
        {...beat(run, { opacity: [0, 0, 1, 0.55, 0] }, { opacity: 0.8 }, [0, 0.44, 0.5, 0.8, 1])} />
      <motion.g style={SELF} {...beat(run, { opacity: [0, 0, 1, 0], scale: [0.6, 0.6, 1, 1.3] }, { opacity: 0.9, scale: 1 }, [0, 0.45, 0.52, 0.8])}>
        <path d="M80 58 v-8 M70 60 l-5 -5 M90 60 l5 -5" stroke={tone} strokeWidth="2" strokeLinecap="round" />
      </motion.g>
    </>
  );
}

/** Clipboard: a copied link slides onto the clipboard and the board lights up. */
export function ClipboardScene({ run, tone }: SceneProps) {
  return (
    <>
      <motion.rect x="46" y="22" width="68" height="88" rx="8" fill={PAPER} stroke={tone} strokeWidth="2"
        {...beat(run, { strokeOpacity: [0.15, 0.15, 1, 0.6, 0.15] }, { strokeOpacity: 0.85 }, [0, 0.44, 0.52, 0.8, 1])} />
      <rect x="46" y="22" width="68" height="88" rx="8" stroke={INK} strokeWidth="1.2" strokeOpacity="0.5" />
      <rect x="66" y="15" width="28" height="14" rx="4" fill={SOLID} stroke={INK} strokeWidth="1.6" />
      {[44, 54, 88, 98].map((y, i) => (
        <line key={y} x1="56" y1={y} x2={i % 2 ? 92 : 104} y2={y} stroke={SOFT} strokeWidth="2.4" strokeLinecap="round" />
      ))}
      <motion.g {...beat(run, { x: [64, 64, 0, 0, 0], opacity: [0, 1, 1, 1, 0] }, { x: 0, opacity: 1 }, [0, 0.14, 0.44, 0.9, 1])}>
        <rect x="50" y="62" width="60" height="18" rx="9" fill={mix(tone, 26)} stroke={tone} strokeWidth="1.5" />
        <rect x="56" y="67.5" width="9" height="7" rx="3.5" stroke={tone} strokeWidth="1.6" />
        <rect x="61" y="67.5" width="9" height="7" rx="3.5" stroke={tone} strokeWidth="1.6" />
        <line x1="76" y1="71" x2="102" y2="71" stroke={tone} strokeWidth="2.2" strokeLinecap="round" />
      </motion.g>
      <motion.g {...beat(run, { opacity: [0, 0.9, 0, 0, 0], y: [0, 0, -8, -8, 0] }, { opacity: 0, y: 0 }, [0, 0.12, 0.4, 0.9, 1])}>
        <path d="M128 52 h14 M128 58 h10" stroke={SOFT} strokeWidth="2" strokeLinecap="round" />
      </motion.g>
    </>
  );
}

function Window({ x, y, stroke, fill }: { x: number; y: number; stroke: string; fill: string }) {
  return (
    <g>
      <rect x={x} y={y} width="78" height="54" rx="6" fill={fill} stroke={stroke} strokeWidth="1.5" />
      <line x1={x} y1={y + 13} x2={x + 78} y2={y + 13} stroke={stroke} strokeWidth="1.2" />
      {[7, 13, 19].map((d) => (
        <circle key={d} cx={x + d} cy={y + 6.5} r="1.8" fill={stroke} />
      ))}
    </g>
  );
}

/** App focus: you switch windows; the one you land on comes forward and takes the focus ring. */
export function FocusScene({ run, tone }: SceneProps) {
  return (
    <>
      <motion.g {...beat(run, { opacity: [1, 1, 0.45, 0.45, 1] }, { opacity: 0.45 }, [0, 0.25, 0.45, 0.9, 1])}>
        <Window x={12} y={14} stroke={SOFT} fill={PAPER} />
        <Window x={72} y={22} stroke={SOFT} fill={PAPER} />
      </motion.g>
      <motion.g style={SELF}
        {...beat(run, { x: [-22, -22, 0, 0, -22], y: [-16, -16, 0, 0, -16], scale: [0.9, 0.9, 1.06, 1.06, 0.9], opacity: [0.4, 0.4, 1, 1, 0.4] },
          { x: 0, y: 0, scale: 1.06, opacity: 1 }, [0, 0.25, 0.45, 0.9, 1])}>
        <rect x="37" y="42" width="86" height="62" rx="9" stroke={mix(tone, 45)} strokeWidth="3" />
        <Window x={41} y={46} stroke={tone} fill={SOLID} />
        <rect x="48" y="66" width="30" height="6" rx="2" fill={mix(tone, 55)} />
        <line x1="48" y1="80" x2="108" y2="80" stroke={SOFT} strokeWidth="2" strokeLinecap="round" />
        <line x1="48" y1="88" x2="96" y2="88" stroke={SOFT} strokeWidth="2" strokeLinecap="round" />
      </motion.g>
      <line x1="40" y1="114" x2="120" y2="114" stroke={FAINT} strokeWidth="3" strokeLinecap="round" />
    </>
  );
}

/** Event: another agent broadcasts a named event on the bus; the listening agent catches it and wakes. */
export function EventScene({ run, tone }: SceneProps) {
  return (
    <>
      <line x1="12" y1="96" x2="148" y2="96" stroke={SOFT} strokeWidth="1.5" strokeDasharray="2 5" strokeLinecap="round" />
      <line x1="38" y1="74" x2="38" y2="96" stroke={SOFT} strokeWidth="1.5" />
      <line x1="124" y1="76" x2="124" y2="96" stroke={SOFT} strokeWidth="1.5" />
      <rect x="22" y="42" width="32" height="32" rx="9" fill={PAPER} stroke={INK} strokeWidth="1.6" />
      <circle cx="33" cy="56" r="2.2" fill={INK} />
      <circle cx="43" cy="56" r="2.2" fill={INK} />
      {[0, 1, 2].map((i) => (
        <motion.path key={i} d={`M${60 + i * 9} ${46 - i * 4} a${14 + i * 5} ${14 + i * 5} 0 0 1 0 ${24 + i * 8}`} stroke={INK} strokeWidth="1.6" strokeLinecap="round"
          {...beat(run, { opacity: [0, 0.9, 0, 0] }, { opacity: 0.5 - i * 0.12 }, [0, 0.1 + i * 0.08, 0.3 + i * 0.08, 1])} />
      ))}
      <motion.g {...beat(run, { x: [0, 0, 52, 52, 52], opacity: [0, 1, 1, 0, 0] }, { x: 44, opacity: 1 }, [0, 0.08, 0.45, 0.55, 1])}>
        <path d="M58 52 h16 l5 6 -5 6 h-16 z" fill={mix(tone, 30)} stroke={tone} strokeWidth="1.4" strokeLinejoin="round" />
      </motion.g>
      <motion.rect x="108" y="42" width="34" height="34" rx="10" stroke={tone} strokeWidth="2" fill={mix(tone, 30)}
        {...beat(run, { fillOpacity: [0.1, 0.1, 1, 1, 0.1] }, { fillOpacity: 1 }, [0, 0.46, 0.52, 0.9, 1])} />
      <motion.g {...beat(run, { opacity: [0, 0, 1, 1, 0] }, { opacity: 1 }, [0, 0.48, 0.54, 0.9, 1])}>
        <circle cx="119" cy="57" r="2.4" fill={tone} />
        <circle cx="131" cy="57" r="2.4" fill={tone} />
        <path d="M119 65 q6 4 12 0" stroke={tone} strokeWidth="1.6" strokeLinecap="round" />
      </motion.g>
    </>
  );
}
