import { SWARM_PERSONAS } from "@/lib/mock-dashboard-data";

export function EventBusDefs() {
  return (
    <defs>
      <radialGradient id="hubGradient" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stopColor="rgba(6,182,212,0.25)" />
        <stop offset="60%" stopColor="rgba(6,182,212,0.10)" />
        <stop offset="100%" stopColor="rgba(6,182,212,0.02)" />
      </radialGradient>
      <filter id="hubGlow" x="-50%" y="-50%" width="200%" height="200%">
        <feGaussianBlur in="SourceGraphic" stdDeviation="6" result="blur" />
        <feMerge>
          <feMergeNode in="blur" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>
      <filter id="particleGlow" x="-100%" y="-100%" width="300%" height="300%">
        <feGaussianBlur in="SourceGraphic" stdDeviation="3" result="blur" />
        <feMerge>
          <feMergeNode in="blur" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>
      {SWARM_PERSONAS.map((persona) => (
        <radialGradient key={`grad-${persona.id}`} id={`grad-${persona.id}`} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={persona.color} stopOpacity="0.2" />
          <stop offset="100%" stopColor={persona.color} stopOpacity="0.05" />
        </radialGradient>
      ))}
    </defs>
  );
}
