"use client";

import { motion, useTransform, type MotionValue } from "framer-motion";
import { AGENT, CYAN, FG, RULES, mix, seg } from "../shared/motion";
import Shape from "./Shape";
import { CENTER, DONE, HOLE_R, HOLE_Y, PIECE_R, SCAN, SHAPES, agentPiece, bump, cluster, holeX, rulesCluster } from "./data";

/* The request as a cluster of shapes. Act one moves the whole cluster as one
 * block (that is all fixed rules can do) and parks it in the waiting tray;
 * act two reads it with a scan, then each piece travels alone. */

const NEUTRAL = { fill: mix(FG, 14), stroke: mix(FG, 60), strokeWidth: 2 };

export function RulesCluster({ c, p }: { c: number; p: MotionValue<number> }) {
  const x = useTransform(p, (v) => rulesCluster(c, v).x);
  const y = useTransform(p, (v) => rulesCluster(c, v).y);
  const scale = useTransform(p, (v) => rulesCluster(c, v).s);
  const rotate = useTransform(p, (v) => rulesCluster(c, v).r);
  const opacity = useTransform(p, (v) => rulesCluster(c, v).o);
  const parked = useTransform(p, (v) => seg(v, 0.38, 0.43));
  return (
    <motion.g style={{ x, y, scale, rotate, opacity }}>
      {cluster(c).map((q) => (
        <g key={q.hole} transform={`translate(${q.ox} ${q.oy})`}>
          <Shape kind={SHAPES[q.hole]} r={PIECE_R} {...NEUTRAL} />
          <motion.g style={{ opacity: parked }}>
            <Shape kind={SHAPES[q.hole]} r={PIECE_R} fill={mix(RULES, 16)} stroke={RULES} strokeWidth={2} />
          </motion.g>
        </g>
      ))}
    </motion.g>
  );
}

function AgentPiece({ c, k, p }: { c: number; k: number; p: MotionValue<number> }) {
  const q = cluster(c)[k];
  const x = useTransform(p, (v) => agentPiece(c, k, v).x);
  const y = useTransform(p, (v) => agentPiece(c, k, v).y);
  const scale = useTransform(p, (v) => agentPiece(c, k, v).s);
  const opacity = useTransform(p, (v) => agentPiece(c, k, v).o);
  const read = useTransform(p, (v) => seg(v, SCAN[1] - 0.04, SCAN[1]));
  return (
    <motion.g style={{ x, y, scale, opacity }}>
      <Shape kind={SHAPES[q.hole]} r={PIECE_R} {...NEUTRAL} />
      <motion.g style={{ opacity: read }}>
        {q.dropped ? (
          <>
            <Shape kind={SHAPES[q.hole]} r={PIECE_R} fill={mix(FG, 6)} stroke={mix(FG, 40)} strokeWidth={2} strokeDasharray="4 5" />
            <line x1={-PIECE_R} y1={PIECE_R} x2={PIECE_R} y2={-PIECE_R} stroke={RULES} strokeWidth={3} strokeLinecap="round" />
          </>
        ) : (
          <Shape kind={SHAPES[q.hole]} r={PIECE_R} fill={mix(AGENT, 30)} stroke={AGENT} strokeWidth={2.5} />
        )}
      </motion.g>
    </motion.g>
  );
}

/** Where the agent read the request: dashed ghosts, and a trail from each piece to its hole. */
function Trails({ c, p }: { c: number; p: MotionValue<number> }) {
  const opacity = useTransform(p, (v) => seg(v, 0.67, 0.73));
  return (
    <motion.g style={{ opacity }} fill="none">
      {cluster(c).map((q) => (
        <g key={q.hole}>
          {!q.dropped && (
            <path
              d={`M ${CENTER.x + q.ox} ${CENTER.y + q.oy + PIECE_R} C ${CENTER.x + q.ox} ${CENTER.y + 70}, ${holeX(q.hole)} ${CENTER.y + 40}, ${holeX(q.hole)} ${HOLE_Y - HOLE_R - 6}`}
              stroke={mix(CYAN, 55)}
              strokeWidth={2}
              strokeDasharray="3 7"
              strokeLinecap="round"
            />
          )}
          <g transform={`translate(${CENTER.x + q.ox} ${CENTER.y + q.oy})`}>
            <Shape kind={SHAPES[q.hole]} r={PIECE_R} stroke={mix(FG, 28)} strokeWidth={1.5} strokeDasharray="4 5" fill="none" />
          </g>
        </g>
      ))}
    </motion.g>
  );
}

/** The outcome card's mirror of the tray: the same shapes, apart and lit. */
export function DoneRow({ c, p }: { c: number; p: MotionValue<number> }) {
  const opacity = useTransform(p, (v) => seg(v, 0.86, 0.9));
  const keep = cluster(c).filter((q) => !q.dropped);
  return (
    <motion.g style={{ opacity }}>
      {keep.map((q, k) => (
        <g key={q.hole} transform={`translate(${DONE.x + DONE.w / 2 + (k - (keep.length - 1) / 2) * 60} ${DONE.y + 176})`}>
          <Shape kind={SHAPES[q.hole]} r={20} fill={mix(AGENT, 30)} stroke={AGENT} strokeWidth={2} />
        </g>
      ))}
    </motion.g>
  );
}

export function AgentPieces({ c, p }: { c: number; p: MotionValue<number> }) {
  const ring = useTransform(p, (v) => 40 + 90 * seg(v, SCAN[0], SCAN[1]));
  const ring2 = useTransform(p, (v) => 40 + 90 * seg(v, SCAN[0] + 0.03, SCAN[1] + 0.03));
  const o = useTransform(p, (v) => bump(v, SCAN[0], SCAN[1]));
  const o2 = useTransform(p, (v) => bump(v, SCAN[0] + 0.03, SCAN[1] + 0.03));
  return (
    <g>
      <motion.circle cx={CENTER.x} cy={CENTER.y} r={ring} fill="none" stroke={CYAN} strokeWidth={2.5} style={{ opacity: o }} />
      <motion.circle cx={CENTER.x} cy={CENTER.y} r={ring2} fill="none" stroke={CYAN} strokeWidth={1.5} strokeDasharray="3 8" style={{ opacity: o2 }} />
      <Trails c={c} p={p} />
      {cluster(c).map((q, k) => (
        <AgentPiece key={q.hole} c={c} k={k} p={p} />
      ))}
    </g>
  );
}
