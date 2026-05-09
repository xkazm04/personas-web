"use client";

import { motion, useTransform, type useSpring } from "framer-motion";
import { layers } from "../data";

type Spring = ReturnType<typeof useSpring>;

export default function StackLabelsAnimated({ spread }: { spread: Spring }) {
  const opacity = useTransform(spread, [0.3, 0.7], [0, 1]);

  return (
    <motion.div
      style={{ opacity }}
      className="hidden lg:flex flex-col items-end gap-3 absolute left-0 top-1/2 -translate-y-1/2 -translate-x-full pr-8 z-10"
    >
      {[...layers].reverse().map((layer, i) => (
        <motion.div
          key={layer.id}
          className="flex items-center gap-2"
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 + i * 0.1, duration: 0.4 }}
          viewport={{ once: true }}
        >
          <span className={`text-base font-mono uppercase tracking-wider ${layer.tw.text} opacity-60`}>
            {layer.label}
          </span>
          <div className="w-6 h-px" style={{ background: `rgba(${layer.rgb}, 0.3)` }} />
        </motion.div>
      ))}
    </motion.div>
  );
}
