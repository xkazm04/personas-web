"use client";

import { useRef, useEffect, useCallback } from "react";
import { motion } from "framer-motion";

function TypewriterLine({
  text,
  className,
  baseDelay = 0,
  charStep = 0.03,
  pulseAfter = false,
}: {
  text: string;
  className: string;
  baseDelay?: number;
  charStep?: number;
  pulseAfter?: boolean;
}) {
  const chars = Array.from(text);
  const revealDuration = chars.length * charStep;
  return (
    <span className={`block ${className}`}>
      {chars.map((char, index) => (
        <motion.span
          key={`${text}-${index}-${char}`}
          initial={{ opacity: 0, y: 8 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ delay: baseDelay + index * charStep, duration: 0.18, ease: "easeOut" }}
          className="inline-block"
        >
          {char === " " ? "\u00A0" : char}
        </motion.span>
      ))}
      {pulseAfter && (
        <motion.span
          className="absolute inset-0 pointer-events-none bg-linear-to-r from-brand-cyan/0 via-brand-cyan/20 to-brand-purple/0 mix-blend-screen"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: [0, 0.15, 0] }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ delay: baseDelay + revealDuration + 0.12, duration: 1.2, ease: "easeInOut" }}
        />
      )}
    </span>
  );
}

/* ── Ambient particle field ── */

const PARTICLE_COUNT = 25;
const BASE_SPEED = 0.3; // px per frame

interface Particle {
  x: number;
  y: number;
  r: number;
  opacity: number;
  speed: number;
}

function AmbientParticles() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const rafRef = useRef<number>(0);
  const inViewRef = useRef(false);

  const initParticles = useCallback((w: number, h: number) => {
    particlesRef.current = Array.from({ length: PARTICLE_COUNT }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      r: 1 + Math.random() * 1.5,
      opacity: 0.03 + Math.random() * 0.05,
      speed: BASE_SPEED + Math.random() * 0.2,
    }));
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      const rect = canvas.parentElement!.getBoundingClientRect();
      canvas.width = rect.width;
      canvas.height = rect.height;
      if (particlesRef.current.length === 0) initParticles(rect.width, rect.height);
    };
    resize();
    window.addEventListener("resize", resize);

    // Pause when off-screen
    const observer = new IntersectionObserver(
      ([entry]) => { inViewRef.current = entry.isIntersecting; },
      { threshold: 0.1 },
    );
    observer.observe(canvas);

    const draw = () => {
      rafRef.current = requestAnimationFrame(draw);
      if (!inViewRef.current || document.hidden) return;

      const { width: w, height: h } = canvas;
      ctx.clearRect(0, 0, w, h);

      for (const p of particlesRef.current) {
        p.y -= p.speed;
        // Respawn at bottom
        if (p.y + p.r < 0) {
          p.y = h + p.r;
          p.x = Math.random() * w;
        }
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,255,255,${p.opacity})`;
        ctx.fill();
      }
    };
    rafRef.current = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener("resize", resize);
      observer.disconnect();
    };
  }, [initParticles]);

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none absolute inset-0"
      aria-hidden="true"
    />
  );
}

export default function CinematicBreather() {
  return (
    <section className="relative flex min-h-[50vh] items-center justify-center overflow-hidden px-4">
      {/* Full-bleed animated gradient */}
      <div className="absolute inset-0 cinematic-gradient" />

      {/* Ambient particle field */}
      <AmbientParticles />

      {/* Noise overlay */}
      <div className="noise absolute inset-0" />

      {/* Edge fades into surrounding sections */}
      <div className="absolute inset-0 bg-linear-to-b from-background via-transparent to-background" />
      <div className="absolute inset-x-0 top-0 h-32 bg-linear-to-b from-background to-transparent" />
      <div className="absolute inset-x-0 bottom-0 h-32 bg-linear-to-t from-background to-transparent" />

      {/* Decorative side lines */}
      <div className="pointer-events-none absolute left-[10%] top-1/2 hidden h-px w-24 -translate-y-1/2 bg-linear-to-r from-transparent to-brand-cyan/15 lg:block" />
      <div className="pointer-events-none absolute right-[10%] top-1/2 hidden h-px w-24 -translate-y-1/2 bg-linear-to-l from-transparent to-brand-purple/15 lg:block" />

      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-80px" }}
        variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.15, delayChildren: 0.1 } } }}
        className="relative z-10 text-center"
      >
        <h2 className="text-4xl font-black leading-[1.15] tracking-tight sm:text-6xl md:text-8xl lg:text-[7rem] drop-shadow-2xl">
          <TypewriterLine text="Your agents." baseDelay={0.05} className="text-white drop-shadow-md" />
          <TypewriterLine
            text="Your rules."
            baseDelay={0.55}
            className="mt-3 bg-linear-to-r from-brand-cyan via-blue-400 to-brand-purple bg-clip-text text-transparent drop-shadow-lg"
          />
          <span className="relative mt-3 inline-block">
            <TypewriterLine
              text="Your infrastructure."
              baseDelay={1.05}
              className="text-white/70 font-light tracking-wide drop-shadow-[0_0_20px_rgba(255,255,255,0.1)]"
              pulseAfter
            />
          </span>
        </h2>
      </motion.div>
    </section>
  );
}
