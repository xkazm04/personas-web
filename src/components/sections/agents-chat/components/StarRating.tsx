"use client";

import { motion, useReducedMotion } from "framer-motion";
import { Star } from "lucide-react";

export default function StarRating({
  score,
  maxScore = 5,
  color,
}: {
  score: number;
  maxScore?: number;
  color: string;
}) {
  const prefersReduced = useReducedMotion();

  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: maxScore }).map((_, i) => (
        <motion.div
          key={i}
          initial={prefersReduced ? undefined : { opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={
            prefersReduced
              ? { duration: 0 }
              : { delay: i * 0.1, type: "spring", stiffness: 300 }
          }
        >
          <Star
            className={`h-3.5 w-3.5 ${i < score ? color : "text-muted-dark"}`}
            fill={i < score ? "currentColor" : "none"}
          />
        </motion.div>
      ))}
      <span className={`ml-1.5 text-base font-mono ${color}`}>
        {score}/{maxScore}
      </span>
    </div>
  );
}
