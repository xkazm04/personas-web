"use client";

import { motion, useTransform, type useSpring } from "framer-motion";
import type { BrandKey } from "@/lib/brand-theme";
import ConnectionPillar from "./ConnectionPillar";

type Spring = ReturnType<typeof useSpring>;

export default function LayerConnection({
  index,
  from,
  to,
  spread,
}: {
  index: number;
  from: BrandKey;
  to: BrandKey;
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
      <ConnectionPillar from={from} to={to} progress={1} />
    </motion.div>
  );
}
