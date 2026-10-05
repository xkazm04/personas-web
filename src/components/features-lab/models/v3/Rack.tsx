"use client";

import { useTranslation } from "@/i18n/useTranslation";
import { CLAUDE, FG, LOCAL, mix } from "../shared/motion";
import { ENGINES, MODULE_H, MODULE_Y, NAMES, PORT_X, RACK, type Engine } from "./geometry";

/* The engine side of V3: Claude's rack (three modules) and, apart from it, the
 * Ollama module on this PC. A module's lamp lights while any agent is patched in. */

function Module({ e, used }: { e: Engine; used: number }) {
  const traits = useTranslation().t.featuresLab.models.traits;
  const local = e === "ollama";
  const col = local ? LOCAL : CLAUDE;
  const y = MODULE_Y[e];
  const top = y - MODULE_H / 2;
  const x = RACK.x + 14;
  const w = RACK.w - 28;
  const on = used > 0;
  return (
    <g>
      <rect x={x} y={top} width={w} height={MODULE_H} rx={12} fill="var(--background)" fillOpacity={0.7} stroke={col} strokeOpacity={on ? 0.6 : 0.22} strokeWidth={1.5} />
      <rect x={x} y={top} width={w} height={MODULE_H} rx={12} fill={mix(col, on ? 10 : 3)} />
      {[top + 10, top + MODULE_H - 10].map((sy) => (
        <circle key={sy} cx={x + w - 12} cy={sy} r={2.5} fill={FG} fillOpacity={0.25} />
      ))}
      {[-24, 0, 24].map((dy) => (
        <g key={dy}>
          <circle cx={PORT_X} cy={y + dy} r={9} fill={FG} fillOpacity={0.08} stroke={FG} strokeOpacity={0.3} />
          <circle cx={PORT_X} cy={y + dy} r={4} fill="var(--background)" />
        </g>
      ))}
      <circle cx={PORT_X + 40} cy={y} r={14} fill={col} fillOpacity={on ? 0.25 : 0} />
      <circle cx={PORT_X + 40} cy={y} r={6} fill={on ? col : "none"} stroke={col} strokeOpacity={0.6} strokeWidth={1.5} />
      <text x={PORT_X + 68} y={y + 2} fontSize={30} fontWeight={800} fill={local ? LOCAL : FG}>
        {NAMES[e]}
      </text>
      <text x={PORT_X + 68} y={y + 26} fontSize={16} fontWeight={500} fill={local ? LOCAL : FG} fillOpacity={local ? 0.9 : 0.72}>
        {traits[e]}
      </text>
    </g>
  );
}

export default function Rack({ used }: { used: Record<Engine, number> }) {
  const c = useTranslation().t.featuresLab.models;
  return (
    <g>
      <rect x={RACK.x} y={RACK.claudeTop} width={RACK.w} height={RACK.claudeH} rx={20} fill={mix(CLAUDE, 6)} stroke={CLAUDE} strokeOpacity={0.4} strokeWidth={2} />
      <text x={RACK.x + 22} y={RACK.claudeTop + 42} fontSize={30} fontWeight={800} fill={CLAUDE}>
        Claude
      </text>
      <text x={RACK.x + 136} y={RACK.claudeTop + 40} fontSize={16} fontWeight={500} fill={FG} fillOpacity={0.72}>
        {c.viaClaudeCode}
      </text>

      <rect x={RACK.x} y={RACK.localTop} width={RACK.w} height={RACK.localH} rx={20} fill={mix(LOCAL, 6)} stroke={LOCAL} strokeOpacity={0.55} strokeWidth={2} strokeDasharray="6 6" />
      <text x={RACK.x + 22} y={RACK.localTop + 30} fontSize={15} fontWeight={700} fill={LOCAL} letterSpacing={2.2} style={{ textTransform: "uppercase" }}>
        {c.v3.onThisPc}
      </text>
      {ENGINES.map((e) => (
        <Module key={e} e={e} used={used[e]} />
      ))}
    </g>
  );
}
