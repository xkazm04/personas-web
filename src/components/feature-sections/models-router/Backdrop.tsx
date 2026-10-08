"use client";

import { CLAUDE, FG, LOCAL } from "./shared/motion";
import { CLOUD, MACHINE, PORT } from "./geometry";
import { featuresSectionsCopy } from "@/i18n/pending/featuresSections";

/* The two places of V1: your machine (emerald, a lit device with a dotted floor)
 * and Claude (warm haze) beyond the machine's single port. */

export function Defs() {
  return (
    <defs>
      <radialGradient id="mv1-local" cx="40%" cy="55%" r="65%">
        <stop offset="0" stopColor={LOCAL} stopOpacity={0.14} />
        <stop offset="1" stopColor={LOCAL} stopOpacity={0} />
      </radialGradient>
      <radialGradient id="mv1-cloud" cx="45%" cy="45%" r="70%">
        <stop offset="0" stopColor={CLAUDE} stopOpacity={0.2} />
        <stop offset="1" stopColor={CLAUDE} stopOpacity={0} />
      </radialGradient>
      <radialGradient id="mv1-halo-c" cx="50%" cy="50%" r="50%">
        <stop offset="0" stopColor={CLAUDE} stopOpacity={0.45} />
        <stop offset="1" stopColor={CLAUDE} stopOpacity={0} />
      </radialGradient>
      <radialGradient id="mv1-halo-l" cx="50%" cy="50%" r="50%">
        <stop offset="0" stopColor={LOCAL} stopOpacity={0.45} />
        <stop offset="1" stopColor={LOCAL} stopOpacity={0} />
      </radialGradient>
      <linearGradient id="mv1-port" x1="0" x2="1" y1="0" y2="0">
        <stop offset="0" stopColor={LOCAL} />
        <stop offset="1" stopColor={CLAUDE} />
      </linearGradient>
      <pattern id="mv1-dots" width="22" height="22" patternUnits="userSpaceOnUse">
        <circle cx="11" cy="11" r="1.2" fill={FG} fillOpacity={0.12} />
      </pattern>
    </defs>
  );
}

export function Backdrop() {
  const c = featuresSectionsCopy.models;
  const m = MACHINE;
  const k = CLOUD;
  return (
    <g>
      {/* Claude, beyond the machine */}
      <rect x={k.x} y={k.y} width={k.w} height={k.h} rx={30} fill="url(#mv1-cloud)" />
      <rect x={k.x} y={k.y} width={k.w} height={k.h} rx={30} fill="none" stroke={CLAUDE} strokeOpacity={0.3} strokeWidth={1.5} strokeDasharray="2 7" strokeLinecap="round" />
      <text x={k.x + 34} y={k.y + 58} fontSize={38} fontWeight={800} fill={CLAUDE} letterSpacing={-0.5}>
        Claude
      </text>
      <text x={k.x + 184} y={k.y + 56} fontSize={17} fontWeight={500} fill={FG} fillOpacity={0.72}>
        {c.viaClaudeCode}
      </text>

      {/* Your machine */}
      <rect x={m.x} y={m.y} width={m.w} height={m.h} rx={30} fill={FG} fillOpacity={0.025} />
      <rect x={m.x} y={m.y} width={m.w} height={m.h} rx={30} fill="url(#mv1-dots)" />
      <rect x={m.x} y={m.y} width={m.w} height={m.h} rx={30} fill="url(#mv1-local)" />
      <rect x={m.x} y={m.y} width={m.w} height={m.h} rx={30} fill="none" stroke={LOCAL} strokeOpacity={0.55} strokeWidth={2.5} />
      <rect x={m.x + 6} y={m.y + 6} width={m.w - 12} height={m.h - 12} rx={25} fill="none" stroke={LOCAL} strokeOpacity={0.14} strokeWidth={1} />
      <text x={m.x + 30} y={m.y + 50} fontSize={16} fontWeight={700} fill={LOCAL} letterSpacing={2.4} style={{ textTransform: "uppercase" }}>
        {c.yourMachine}
      </text>

      {/* The machine's one way out */}
      <rect x={PORT[0] - 7} y={PORT[1] - 30} width={14} height={60} rx={7} fill="var(--background)" />
      <rect x={PORT[0] - 5} y={PORT[1] - 26} width={10} height={52} rx={5} fill="url(#mv1-port)" fillOpacity={0.9} />
    </g>
  );
}
