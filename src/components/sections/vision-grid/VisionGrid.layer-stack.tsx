"use client";

import { useEffect, useId, useRef, useState } from "react";
import { useAnimationControls, useInView } from "framer-motion";
import GradientText from "@/components/GradientText";
import SectionHeading from "@/components/SectionHeading";
import SectionWrapper from "@/components/SectionWrapper";
import { useStillMotion } from "@/hooks/useStillMotion";
import { STACK_LAYERS, SAMPLE_PERSONA } from "./VisionGrid.layer-stack.data";
import { LayerStackPersonaCard } from "./VisionGrid.layer-stack.card";
import { LayerSlabs } from "./VisionGrid.layer-stack.plates";
import { LayerLabels } from "./VisionGrid.layer-stack.labels";
import { LayerDetail } from "./VisionGrid.layer-stack.detail";

/**
 * Vision grid, "Layer stack" direction: one agent on top, the six platform
 * layers exploded beneath it. Each layer is labelled with its one-line job and
 * the question it answers about that agent; selecting one pulls its slab out
 * of the stack, lights the part of the agent card it is responsible for, and
 * shows its detail.
 *
 * Motion: one reveal. The resting (and server) state is the exploded stack.
 * Only when the stack mounts below the fold, with motion allowed, are the
 * slabs pressed together client-side; they spread once when scrolled into
 * view. Reduced motion: the exploded stack, and selection changes are instant.
 */
export default function VisionGridLayerStack() {
  const uid = useId().replace(/:/g, "");
  const panelId = `${uid}-panel`;
  const [active, setActive] = useState(0);
  const still = useStillMotion();

  const boxRef = useRef<HTMLDivElement>(null);
  const controls = useAnimationControls();
  const inView = useInView(boxRef, { once: true, amount: 0.35 });
  const decided = useRef(false);
  const armed = useRef(false);

  // Arm the entrance once, on the client, only if the stack is still below the fold.
  useEffect(() => {
    if (decided.current || !boxRef.current) return;
    decided.current = true;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce || boxRef.current.getBoundingClientRect().top < window.innerHeight * 0.7) return;
    controls.set("collapsed");
    armed.current = true;
  }, [controls]);

  useEffect(() => {
    if (!armed.current || !(inView || still)) return;
    armed.current = false;
    if (still) controls.set("exploded");
    else void controls.start("exploded");
  }, [inView, still, controls]);

  const layer = STACK_LAYERS[active];
  const names = STACK_LAYERS.map((l) => l.card.title).join(", ");

  return (
    <SectionWrapper id="vision-grid" className="relative overflow-hidden">
      <div className="relative z-10 mx-auto mb-12 max-w-3xl text-center sm:mb-14">
        <SectionHeading>
          The <GradientText>platform</GradientText> behind your agents
        </SectionHeading>
        <p className="mx-auto mt-6 max-w-2xl text-base font-light leading-relaxed text-muted">
          Every agent you run stands on the same six layers. Pick one to see what it is doing for this one.
        </p>
      </div>

      <div className="relative z-10 mx-auto grid max-w-5xl grid-cols-1 items-stretch gap-6 lg:grid-cols-[minmax(0,500px)_minmax(0,1fr)] lg:gap-10">
        <div
          ref={boxRef}
          role="group"
          aria-label={`An "${SAMPLE_PERSONA.name}" agent card with the six layers beneath it, top to bottom: ${names}. Select a layer to see what it does for this agent.`}
          className="relative mx-auto h-[570px] w-full max-w-[500px] [--s:96px] sm:h-[592px] sm:[--s:120px]"
        >
          <div className="absolute inset-x-0 top-0">
            <LayerStackPersonaCard active={layer} />
          </div>
          <LayerSlabs layers={STACK_LAYERS} activeIndex={active} still={still} controls={controls} />
          <LayerLabels
            layers={STACK_LAYERS}
            activeIndex={active}
            onSelect={setActive}
            panelId={panelId}
            idPrefix={uid}
          />
        </div>

        <div className="min-h-[440px] lg:min-h-0">
          <LayerDetail
            layer={layer}
            index={active}
            total={STACK_LAYERS.length}
            panelId={panelId}
            labelledBy={`${uid}-tab-${layer.card.id}`}
            next={STACK_LAYERS[(active + 1) % STACK_LAYERS.length]}
            onNext={() => setActive((active + 1) % STACK_LAYERS.length)}
          />
        </div>
      </div>
    </SectionWrapper>
  );
}
