import type { BurstRing, Particle } from "./eventBusGeometry";
import { quadBezier } from "./eventBusGeometry";

export function EventBusParticles({
  particles,
  bursts,
  prefersReduced,
}: {
  particles: Particle[];
  bursts: BurstRing[];
  prefersReduced: boolean | null;
}) {
  if (prefersReduced) return null;

  return (
    <>
      {particles.map((particle) => {
        const pos = quadBezier(particle.sourcePos, particle.cp, particle.targetPos, Math.min(particle.t, 1));
        return (
          <g key={particle.id} filter="url(#particleGlow)">
            <circle cx={pos.x} cy={pos.y} r={4} fill={particle.color} opacity={0.25} />
            <circle cx={pos.x} cy={pos.y} r={2} fill={particle.color} opacity={0.9} />
            <circle cx={pos.x} cy={pos.y} r={0.8} fill="white" opacity={0.9} />
          </g>
        );
      })}
      {bursts.map((burst) => (
        <circle key={burst.id} cx={burst.x} cy={burst.y} r={4 + burst.t * 14} fill="none" stroke={burst.color} strokeWidth={1.5 * (1 - burst.t)} opacity={0.6 * (1 - burst.t)} />
      ))}
    </>
  );
}
