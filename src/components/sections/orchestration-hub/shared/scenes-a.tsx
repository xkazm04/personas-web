"use client";

import { useId } from "react";
import { motion } from "framer-motion";
import { INK, SOFT, FAINT, PAPER, SOLID, SELF, beat, mix, polar, type SceneProps } from "./scene-kit";
import Spin from "./Spin";

/* Vignettes for schedule, polling and webhook - 160x120 stylised scenes,
   each acting out the moment its trigger fires (see scenes.ts). */

const TICKS = Array.from({ length: 12 }, (_, i) => ({ a: polar(62, 60, 27, i * 30), b: polar(62, 60, i % 3 ? 30 : 32, i * 30) }));
const HOUR = polar(62, 60, 15, 240);

/** Schedule: the minute hand sweeps a full hour to 8:00 and the alarm rings as the sun clears the horizon. */
export function ScheduleScene({ run, tone }: SceneProps) {
  const sky = `${useId()}-sky`;
  return (
    <>
      <clipPath id={sky}>
        <rect x="0" y="0" width="160" height="98" />
      </clipPath>
      <line x1="10" y1="98" x2="150" y2="98" stroke={SOFT} strokeWidth="1.5" strokeLinecap="round" />
      <g clipPath={`url(#${sky})`}>
      <motion.g {...beat(run, { y: [10, 10, 0, 0, 10] }, { y: 0 }, [0, 0.45, 0.65, 0.9, 1])}>
        <circle cx="122" cy="98" r="17" fill={mix(tone, 30)} stroke={tone} strokeWidth="1.5" />
        {[-60, -30, 0, 30, 60].map((d) => {
          const p = polar(122, 98, 23, d);
          const q = polar(122, 98, 29, d);
          return <line key={d} x1={p.x} y1={p.y} x2={q.x} y2={q.y} stroke={tone} strokeWidth="1.5" strokeLinecap="round" />;
        })}
      </motion.g>
      </g>
      <circle cx="62" cy="60" r="34" fill={SOLID} />
      <circle cx="62" cy="60" r="34" fill={PAPER} stroke={INK} strokeWidth="2" />
      {TICKS.map(({ a, b }, i) => (
        <line key={i} x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke={i % 3 ? SOFT : INK} strokeWidth={i % 3 ? 1.2 : 2} strokeLinecap="round" />
      ))}
      <line x1="62" y1="60" x2={HOUR.x} y2={HOUR.y} stroke={INK} strokeWidth="3.2" strokeLinecap="round" />
      <Spin x={62} y={60} r={24} {...beat(run, { rotate: [0, 360, 360] }, { rotate: 0 }, [0, 0.55, 1])}>
        <line x1="0" y1="0" x2="0" y2="-24" stroke={tone} strokeWidth="2.4" strokeLinecap="round" />
      </Spin>
      <circle cx="62" cy="60" r="3" fill={tone} />
      <motion.g style={SELF} {...beat(run, { opacity: [0, 0, 1, 0.8, 0], scale: [0.8, 0.8, 1.1, 1, 0.9] }, { opacity: 0.9, scale: 1 }, [0, 0.55, 0.62, 0.85, 1])}>
        <path d="M30 30 a40 40 0 0 1 14 -12" stroke={tone} strokeWidth="2.2" strokeLinecap="round" />
        <path d="M24 38 a48 48 0 0 1 10 -14" stroke={tone} strokeWidth="1.6" strokeLinecap="round" opacity="0.6" />
        <path d="M94 30 a40 40 0 0 0 -14 -12" stroke={tone} strokeWidth="2.2" strokeLinecap="round" />
        <path d="M100 38 a48 48 0 0 0 -10 -14" stroke={tone} strokeWidth="1.6" strokeLinecap="round" opacity="0.6" />
      </motion.g>
    </>
  );
}

const BLIPS = [140, 225, 300].map((d, i) => polar(62, 62, [34, 20, 28][i], d));
const FOUND = polar(62, 62, 30, 62);

/** Polling: a radar sweep circles the source; on the pass it finds a changed item and a new row lands in the list. */
export function PollingScene({ run, tone }: SceneProps) {
  return (
    <>
      {[14, 28, 42].map((r) => (
        <circle key={r} cx="62" cy="62" r={r} stroke={r === 42 ? SOFT : FAINT} strokeWidth="1.2" fill={r === 42 ? PAPER : "none"} />
      ))}
      <line x1="20" y1="62" x2="104" y2="62" stroke={FAINT} />
      <line x1="62" y1="20" x2="62" y2="104" stroke={FAINT} />
      <Spin x={62} y={62} r={42} {...beat(run, { rotate: [0, 360] }, { rotate: 70 }, [0, 1], "linear")}>
        <path d="M0 0 L0 -42 A42 42 0 0 0 -31.2 -28.1 Z" fill={mix(tone, 22)} />
        <line x1="0" y1="0" x2="0" y2="-42" stroke={tone} strokeWidth="2" strokeLinecap="round" />
      </Spin>
      {BLIPS.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r="2.4" fill={SOFT} />
      ))}
      <motion.circle cx={FOUND.x} cy={FOUND.y} r="4" fill={tone} style={SELF}
        {...beat(run, { opacity: [0.3, 0.3, 1, 1, 0.3], scale: [1, 1, 1.4, 1, 1] }, { opacity: 1, scale: 1 }, [0, 0.16, 0.2, 0.7, 1])} />
      <motion.circle cx={FOUND.x} cy={FOUND.y} r="4" stroke={tone} strokeWidth="1.5" style={SELF}
        {...beat(run, { opacity: [0, 0, 0.9, 0], scale: [1, 1, 1, 3.2] }, { opacity: 0.5, scale: 2.2 }, [0, 0.17, 0.2, 0.55])} />
      <rect x="114" y="28" width="38" height="68" rx="5" fill={PAPER} stroke={SOFT} strokeWidth="1.2" />
      {[56, 68, 80].map((y) => (
        <line key={y} x1="120" y1={y} x2="146" y2={y} stroke={SOFT} strokeWidth="2.4" strokeLinecap="round" />
      ))}
      <motion.g {...beat(run, { y: [-6, -6, 0, 0, -6], opacity: [0, 0, 1, 1, 0] }, { y: 0, opacity: 1 }, [0, 0.22, 0.32, 0.9, 1])}>
        <rect x="118" y="36" width="30" height="11" rx="3" fill={mix(tone, 28)} stroke={tone} strokeWidth="1" />
        <circle cx="123" cy="41.5" r="2" fill={tone} />
      </motion.g>
    </>
  );
}

const PATH_X = [54, 71, 87, 101, 114, 114];
const PATH_Y = [50, 34, 29, 36, 54, 54];

/** Webhook: a service sends its payload along the wire and the public endpoint lights the instant it lands. */
export function WebhookScene({ run, tone }: SceneProps) {
  return (
    <>
      {[34, 50, 66].map((y) => (
        <g key={y}>
          <rect x="12" y={y} width="40" height="13" rx="3" fill={PAPER} stroke={SOFT} strokeWidth="1.2" />
          <line x1="18" y1={y + 6.5} x2="34" y2={y + 6.5} stroke={SOFT} strokeWidth="2" strokeLinecap="round" />
          <circle cx="45" cy={y + 6.5} r="1.8" fill={INK} />
        </g>
      ))}
      <path d="M54 50 Q 90 6 114 54" stroke={SOFT} strokeWidth="1.4" strokeDasharray="3 4" />
      <line x1="114" y1="54" x2="118" y2="58" stroke={SOFT} strokeWidth="1.4" />
      <motion.circle cx="130" cy="64" r="17" stroke={tone} strokeWidth="1.5" style={SELF}
        {...beat(run, { opacity: [0, 0, 0.8, 0], scale: [1, 1, 1, 1.8] }, { opacity: 0.35, scale: 1.35 }, [0, 0.5, 0.52, 0.85])} />
      <circle cx="130" cy="64" r="17" fill={SOLID} />
      <motion.circle cx="130" cy="64" r="17" stroke={tone} strokeWidth="2"
        fill={mix(tone, 26)}
        {...beat(run, { fillOpacity: [0.15, 0.15, 1, 1, 0.15] }, { fillOpacity: 1 }, [0, 0.5, 0.55, 0.9, 1])} />
      <path d="M130 55 v11 m-5 -5 l5 5 l5 -5 M122 69 v2.5 a2 2 0 0 0 2 2 h12 a2 2 0 0 0 2 -2 v-2.5" stroke={tone} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
      <motion.g {...beat(run, { x: PATH_X, y: PATH_Y, opacity: [0, 1, 1, 1, 1, 0] }, { x: 96, y: 31, opacity: 1 }, [0, 0.12, 0.24, 0.36, 0.5, 0.56])}>
        <rect x="-10" y="-7" width="20" height="14" rx="3" fill={mix(tone, 30)} stroke={tone} strokeWidth="1.4" />
        <path d="M-10 -5 L0 2 L10 -5" stroke={tone} strokeWidth="1.2" />
      </motion.g>
    </>
  );
}
