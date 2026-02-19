"use client";

const particles = Array.from({ length: 30 }, (_, i) => ({
  id: i,
  left: `${(i * 3.33 + (i * 7.3) % 10) % 100}%`,
  size: 1.5 + ((i * 2.7) % 3),
  delay: (i * 0.27) % 10,
  duration: 5 + ((i * 2.1) % 8),
  color:
    i % 4 === 0
      ? "rgba(6,182,212,0.3)"
      : i % 4 === 1
        ? "rgba(168,85,247,0.2)"
        : i % 4 === 2
          ? "rgba(52,211,153,0.15)"
          : "rgba(96,165,250,0.12)",
  blur: i % 5 === 0 ? 1 : 0,
}));

export default function FloatingParticles() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {particles.map((p) => (
        <div
          key={p.id}
          className="animate-float absolute rounded-full"
          style={{
            left: p.left,
            bottom: "-10px",
            width: p.size,
            height: p.size,
            backgroundColor: p.color,
            animationDelay: `${p.delay}s`,
            animationDuration: `${p.duration}s`,
            filter: p.blur ? `blur(${p.blur}px)` : undefined,
          }}
        />
      ))}
    </div>
  );
}
