"use client";

import { motion, AnimatePresence } from "framer-motion";

export default function VoteParticles({ color, trigger }: { color: string; trigger: number }) {
  if (trigger === 0) return null;
  const particles = Array.from({ length: 8 }, (_, i) => {
    const angle = (i / 8) * Math.PI * 2 + (i % 2 === 0 ? 0.3 : -0.3);
    const dist = 28 + (i % 3) * 12;
    return { x: Math.cos(angle) * dist, y: Math.sin(angle) * dist, size: 3 + (i % 2) * 2 };
  });
  return (
    <AnimatePresence>
      <motion.span key={trigger} className="pointer-events-none absolute inset-0 z-20">
        {particles.map((p, i) => (
          <motion.span
            key={i}
            className="absolute left-1/2 top-1/2 rounded-full"
            style={{ width: p.size, height: p.size, backgroundColor: color }}
            initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
            animate={{ x: p.x, y: p.y, opacity: 0, scale: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          />
        ))}
      </motion.span>
    </AnimatePresence>
  );
}
