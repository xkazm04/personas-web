"use client";

import { ReferenceLine } from "recharts";
import type { ChartAnnotation as ChartAnnotationType } from "@/lib/mock-dashboard-data";

const annotationStyles: Record<
  ChartAnnotationType["type"],
  { stroke: string; emoji: string }
> = {
  deployment: { stroke: "#06b6d4", emoji: "\u{1F680}" },
  incident: { stroke: "#f43f5e", emoji: "\u26A0\uFE0F" },
  milestone: { stroke: "#34d399", emoji: "\u{1F3AF}" },
};

export default function ChartAnnotations({
  annotations,
}: {
  annotations: ChartAnnotationType[];
}) {
  return (
    <>
      {annotations.map((a) => {
        const style = annotationStyles[a.type];
        return (
          <ReferenceLine
            key={`${a.type}-${a.date}`}
            x={a.date}
            stroke={style.stroke}
            strokeDasharray="4 4"
            strokeOpacity={0.5}
            label={{
              value: `${style.emoji} ${a.label}`,
              position: "top",
              fill: style.stroke,
              fontSize: 10,
            }}
          />
        );
      })}
    </>
  );
}

export { annotationStyles };
export type { ChartAnnotationType };
