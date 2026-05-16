import { CX, CY } from "./eventBusGeometry";

export function EventBusHub({ prefersReduced }: { prefersReduced: boolean | null }) {
  return (
    <>
      <g filter="url(#hubGlow)">
        <circle cx={CX} cy={CY} r={34} fill="url(#hubGradient)">
          {!prefersReduced && <animate attributeName="r" values="34;36;34" dur="3s" repeatCount="indefinite" />}
        </circle>
        <circle cx={CX} cy={CY} r={30} fill="rgba(6,182,212,0.06)" stroke="rgba(6,182,212,0.25)" strokeWidth="1">
          {!prefersReduced && <animate attributeName="r" values="30;31;30" dur="3s" repeatCount="indefinite" />}
        </circle>
        <circle cx={CX} cy={CY} r={38} fill="none" stroke="rgba(6,182,212,0.12)" strokeWidth="0.5">
          {!prefersReduced && <animate attributeName="r" values="38;40;38" dur="3s" repeatCount="indefinite" />}
        </circle>
      </g>
      <text x={CX} y={CY + 1} textAnchor="middle" dominantBaseline="central" fill="rgba(6,182,212,0.7)" fontSize="9" fontWeight="700" fontFamily="monospace" letterSpacing="2">
        BUS
      </text>
    </>
  );
}
