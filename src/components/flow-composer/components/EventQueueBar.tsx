"use client";

import { QUEUE_Y } from "../data";

export default function EventQueueBar({ qGradId }: { qGradId: string }) {
  return (
    <>
      <rect
        x="5"
        y={QUEUE_Y - 4}
        width="90"
        height="8"
        rx="4"
        fill="rgba(255,255,255,0.015)"
        stroke="rgba(255,255,255,0.08)"
        strokeWidth="0.3"
      />
      <rect
        x="5"
        y={QUEUE_Y - 4}
        width="90"
        height="8"
        rx="4"
        fill={`url(#${qGradId})`}
      />
      <text
        x="50"
        y={QUEUE_Y + 1}
        textAnchor="middle"
        dominantBaseline="middle"
        fill="rgba(6,182,212,0.25)"
        fontSize="2.2"
        fontFamily="var(--font-geist-mono)"
        letterSpacing="0.15em"
      >
        EVENT QUEUE
      </text>
      <line
        x1="8"
        y1={QUEUE_Y}
        x2="92"
        y2={QUEUE_Y}
        stroke="rgba(255,255,255,0.03)"
        strokeWidth="0.2"
        strokeDasharray="2 3"
      />
      <polygon
        points={`93,${QUEUE_Y - 1} 95.5,${QUEUE_Y} 93,${QUEUE_Y + 1}`}
        fill="rgba(6,182,212,0.2)"
      />
    </>
  );
}
