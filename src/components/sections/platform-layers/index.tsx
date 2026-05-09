"use client";

import { useRef, useState } from "react";
import { motion, useScroll, useTransform, useSpring, useReducedMotion } from "framer-motion";
import SectionWrapper from "@/components/SectionWrapper";
import SectionIntro from "@/components/primitives/SectionIntro";
import { fadeUp } from "@/lib/animations";
import { layers } from "./data";
import StackLabelsAnimated from "./components/StackLabelsAnimated";
import LayerConnectionAnimated from "./components/LayerConnectionAnimated";
import LayerAnimated from "./components/LayerAnimated";

export default function PlatformLayers() {
  const containerRef = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = useReducedMotion() ?? false;
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "center center"],
  });

  const rawSpread = useTransform(scrollYProgress, [0, 1], [0, 1]);
  const spread = useSpring(rawSpread, { stiffness: 80, damping: 20 });

  const spreadValues = layers.map((_, i) => {
    const maxSpread = 120;
    return i * maxSpread;
  });

  return (
    <SectionWrapper id="platform-layers" dotGrid>
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-[600px] w-[600px] rounded-full opacity-20"
          style={{
            background:
              "radial-gradient(circle, rgba(168,85,247,0.06) 0%, rgba(6,182,212,0.03) 50%, transparent 70%)",
          }}
        />
      </div>

      <motion.div variants={fadeUp} className="mb-20">
        <SectionIntro
          eyebrow="How It's Built"
          eyebrowBrand="purple"
          heading="Built to"
          gradient="grow"
          trailing=" with you"
          description="Four layers that work together to power your agents — from the interface you see to the cloud that runs them. Scroll to explore."
        />
      </motion.div>

      <div ref={containerRef} className="relative mx-auto max-w-3xl">
        <div className="relative" style={{ height: `${layers.length * 120 + 140}px` }}>
          <StackLabelsAnimated spread={spread} />

          {layers.slice(0, -1).map((layer, i) => {
            const nextLayer = layers[i + 1];
            return (
              <LayerConnectionAnimated
                key={`conn-${layer.id}`}
                index={i}
                fromRgb={layer.rgb}
                toRgb={nextLayer.rgb}
                spread={spread}
              />
            );
          })}

          {layers.map((layer, i) => (
            <LayerAnimated
              key={layer.id}
              layer={layer}
              index={i}
              isHovered={hoveredIndex === i}
              onHover={() => setHoveredIndex(i)}
              onLeave={() => setHoveredIndex(null)}
              spread={spread}
              baseOffset={spreadValues[i]}
              stackHeight={layers.length * 120 + 140}
              prefersReducedMotion={prefersReducedMotion}
            />
          ))}
        </div>
      </div>
    </SectionWrapper>
  );
}
