import { motion, useReducedMotion } from "framer-motion";

import { tint, type BrandKey } from "@/lib/brand-theme";

const STEP_BRANDS: BrandKey[] = ["cyan", "blue", "purple"];

export function DownloadStepGrid({
  steps,
  stepLabel,
}: {
  steps: string[];
  stepLabel: string;
}) {
  const reduced = useReducedMotion() ?? false;
  return (
    <motion.div
      className="mt-6 mx-auto grid max-w-xl grid-cols-1 gap-2 text-left sm:grid-cols-3"
      initial="hidden"
      whileInView="visible"
      /* `once: true`: the grid used to replay its stagger + glow pulse on every
         scroll past, which reads as a glitch on a static marketing section. */
      viewport={{ once: true, amount: 0.4 }}
      variants={{
        hidden: { transition: { staggerChildren: reduced ? 0 : 0.1 } },
        visible: { transition: { staggerChildren: reduced ? 0 : 0.6 } },
      }}
    >
      {steps.map((step, index) => {
        const brand = STEP_BRANDS[index] ?? "cyan";
        const glowStrong = tint(brand, 50);
        const glowInset = tint(brand, 8);
        const borderOn = tint(brand, 40);

        return (
          <motion.div
            key={step}
            className="relative rounded-xl border border-glass bg-white/[0.015] px-3 py-2"
            variants={{
              hidden: {
                opacity: reduced ? 1 : 0,
                y: reduced ? 0 : 12,
                transition: { duration: reduced ? 0 : 0.3, ease: "easeOut" },
              },
              visible: {
                opacity: 1,
                y: 0,
                transition: { duration: reduced ? 0 : 0.3, ease: "easeOut" },
              },
            }}
          >
            {/* framer-motion can't interpolate color-mix() values, so the
                theme-adaptive tints stay as static styles and only the
                overlay's opacity pulses. */}
            <motion.div
              aria-hidden
              className="pointer-events-none absolute -inset-px rounded-xl"
              style={{
                border: `1px solid ${borderOn}`,
                boxShadow: `0 0 20px ${glowStrong}, inset 0 0 12px ${glowInset}`,
              }}
              /* Reduced motion: the glow pulse is pure decoration, so it stays
                 fully off rather than flashing once. */
              variants={{
                hidden: { opacity: 0 },
                visible: reduced
                  ? { opacity: 0 }
                  : {
                      opacity: [0, 1, 0],
                      transition: { duration: 0.8, ease: "easeInOut" },
                    },
              }}
            />
            <p className="text-base font-mono uppercase tracking-wider text-muted-dark">
              {stepLabel} {index + 1}
            </p>
            <p className="mt-1 text-base text-muted">{step}</p>
          </motion.div>
        );
      })}
    </motion.div>
  );
}
