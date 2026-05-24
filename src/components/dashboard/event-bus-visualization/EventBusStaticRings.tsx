import type { Point } from "./eventBusGeometry";
import { CX, CY, PERSONA_RADIUS, SOURCE_RADIUS } from "./eventBusGeometry";

export function EventBusStaticRings({ sourcePositions, personaPositions }: { sourcePositions: Point[]; personaPositions: Point[] }) {
  return (
    <>
      {sourcePositions.map((pos, index) => (
        <line key={`src-line-${index}`} x1={pos.x} y1={pos.y} x2={CX} y2={CY} stroke="rgba(255,255,255,0.04)" strokeWidth="1" strokeDasharray="4 6" />
      ))}
      {personaPositions.map((pos, index) => (
        <line key={`per-line-${index}`} x1={CX} y1={CY} x2={pos.x} y2={pos.y} stroke="rgba(255,255,255,0.04)" strokeWidth="1" strokeDasharray="4 6" />
      ))}
      <circle cx={CX} cy={CY} r={PERSONA_RADIUS} fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="0.5" />
      <circle cx={CX} cy={CY} r={SOURCE_RADIUS} fill="none" stroke="rgba(255,255,255,0.02)" strokeWidth="0.5" />
    </>
  );
}
