"use client";

import { useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { sparkSeeds } from "../data";

export function DataParticle({
  pathId,
  color,
  delay,
  duration,
}: {
  pathId: string;
  color: string;
  delay: number;
  duration: number;
}) {
  return (
    <motion.circle
      r={2.5}
      fill={color}
      filter="url(#particleGlow)"
      initial={{ opacity: 0 }}
      animate={{ opacity: [0, 1, 1, 0] }}
      transition={{ duration, delay, repeat: Infinity, repeatDelay: 0.5 }}
    >
      <animateMotion
        dur={`${duration}s`}
        begin={`${delay}s`}
        repeatCount="indefinite"
        fill="freeze"
      >
        <mpath href={`#${pathId}`} />
      </animateMotion>
    </motion.circle>
  );
}

export function SparkEffect({ x, y }: { x: number; y: number }) {
  const sparks = useMemo(
    () =>
      sparkSeeds.map((seed, i) => ({
        angle: (Math.PI * 2 * i) / 6 + seed.angleOff,
        dist: 8 + seed.distOff,
        size: 1 + seed.sizeOff,
      })),
    [],
  );

  return (
    <g>
      {sparks.map((spark, i) => (
        <motion.circle
          key={i}
          cx={x}
          cy={y}
          r={spark.size}
          fill="#f43f5e"
          initial={{ cx: x, cy: y, opacity: 1 }}
          animate={{
            cx: x + Math.cos(spark.angle) * spark.dist,
            cy: y + Math.sin(spark.angle) * spark.dist,
            opacity: [1, 1, 0],
            r: [spark.size, spark.size * 0.5, 0],
          }}
          transition={{
            duration: 0.8,
            repeat: Infinity,
            repeatDelay: 0.3,
            ease: "easeOut",
          }}
        />
      ))}
      <motion.circle
        cx={x}
        cy={y}
        r={4}
        fill="#f43f5e"
        animate={{ r: [4, 8, 4], opacity: [0.8, 0.2, 0.8] }}
        transition={{ duration: 0.6, repeat: Infinity }}
      />
    </g>
  );
}

export function WeldFlash({ x, y }: { x: number; y: number }) {
  return (
    <g>
      <motion.circle
        cx={x}
        cy={y}
        r={3}
        fill="white"
        animate={{ r: [3, 16, 3], opacity: [1, 0.6, 1] }}
        transition={{ duration: 0.4, repeat: Infinity }}
      />
      <motion.circle
        cx={x}
        cy={y}
        r={6}
        fill="none"
        stroke="#06b6d4"
        strokeWidth={2}
        animate={{ r: [6, 24, 6], opacity: [0.8, 0, 0.8] }}
        transition={{ duration: 0.6, repeat: Infinity }}
      />
      <motion.circle
        cx={x}
        cy={y}
        r={3}
        fill="#06b6d4"
        filter="url(#weldGlow)"
        animate={{ opacity: [1, 0.5, 1] }}
        transition={{ duration: 0.3, repeat: Infinity }}
      />
    </g>
  );
}

export function RepairBot({
  pathId,
  duration,
  onComplete,
}: {
  pathId: string;
  duration: number;
  onComplete?: () => void;
}) {
  useEffect(() => {
    const timer = setTimeout(() => onComplete?.(), duration * 1000);
    return () => clearTimeout(timer);
  }, [duration, onComplete]);

  return (
    <g>
      <circle r={5} fill="#fbbf24" filter="url(#repairGlow)">
        <animateMotion dur={`${duration}s`} fill="freeze" repeatCount="1">
          <mpath href={`#${pathId}`} />
        </animateMotion>
      </circle>
      <circle r={3} fill="white">
        <animateMotion dur={`${duration}s`} fill="freeze" repeatCount="1">
          <mpath href={`#${pathId}`} />
        </animateMotion>
      </circle>
      <motion.circle
        r={8}
        fill="none"
        stroke="#fbbf24"
        strokeWidth={1}
        animate={{ r: [5, 12], opacity: [0.6, 0] }}
        transition={{ duration: 0.5, repeat: Infinity }}
      >
        <animateMotion dur={`${duration}s`} fill="freeze" repeatCount="1">
          <mpath href={`#${pathId}`} />
        </animateMotion>
      </motion.circle>
    </g>
  );
}
