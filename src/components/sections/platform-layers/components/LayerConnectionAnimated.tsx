"use client";

import { motion, useTransform, type useSpring } from "framer-motion";
import ConnectionPillar from "./ConnectionPillar";

type Spring = ReturnType<typeof useSpring>;

export default function LayerConnectionAnimated({
  index,
  fromRgb,
  toRgb,
  spread,
}: {
  index: number;
  fromRgb: string;
  toRgb: string;
  spread: Spring;
}) {
  const gap = 120;
  const baseTop = (index + 1) * gap;

  const y = useTransform(spread, (s: number) => {
    const layerOffset = index * gap * s;
    return baseTop - layerOffset * 0.5;
  });

  const height = useTransform(spread, (s: number) => Math.max(gap * s * 0.8, 0));
  const opacity = useTransform(spread, [0.2, 0.6], [0, 0.8]);

  return (
    <motion.div className="absolute left-1/2 -translate-x-1/2 z-0" style={{ top: y, height, opacity }}>
      <ConnectionPillar fromRgb={fromRgb} toRgb={toRgb} progress={1} />
    </motion.div>
  );
}
