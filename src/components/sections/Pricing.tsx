"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, Zap, Building } from "lucide-react";
import SectionWrapper from "@/components/SectionWrapper";
import GlowCard from "@/components/GlowCard";
import GradientText from "@/components/GradientText";
import SectionHeading from "@/components/SectionHeading";
import { fadeUp, staggerContainer } from "@/lib/animations";
import { PRICING_TIERS } from "@/data/pricing";

function MagneticGlowSurface({
  color,
  maxOpacity,
  children,
}: {
  color: string;
  maxOpacity: number;
  children: ReactNode;
}) {
  const ref = useRef<HTMLDivElement | null>(null);
  const rafRef = useRef<number | null>(null);
  const inViewRef = useRef(false);
  const targetRef = useRef({ x: 0, y: 0, opacity: 0 });
  const currentRef = useRef({ x: 0, y: 0, opacity: 0 });

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // Visibility gating — only run RAF when in viewport
    const io = new IntersectionObserver(
      ([entry]) => {
        inViewRef.current = entry.isIntersecting;
        if (entry.isIntersecting && rafRef.current === null) {
          rafRef.current = requestAnimationFrame(frame);
        }
      },
      { threshold: 0.1 },
    );
    io.observe(el);

    const frame = () => {
      if (!inViewRef.current || document.hidden) {
        rafRef.current = null;
        return;
      }

      currentRef.current.x += (targetRef.current.x - currentRef.current.x) * 0.18;
      currentRef.current.y += (targetRef.current.y - currentRef.current.y) * 0.18;
      currentRef.current.opacity += (targetRef.current.opacity - currentRef.current.opacity) * 0.14;

      el.style.setProperty("--magnetic-x", `${currentRef.current.x}px`);
      el.style.setProperty("--magnetic-y", `${currentRef.current.y}px`);
      el.style.setProperty("--magnetic-opacity", `${currentRef.current.opacity}`);

      rafRef.current = requestAnimationFrame(frame);
    };

    rafRef.current = requestAnimationFrame(frame);
    return () => {
      io.disconnect();
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, []);

  return (
    <div
      ref={ref}
      onMouseMove={(event) => {
        const rect = event.currentTarget.getBoundingClientRect();
        targetRef.current.x = event.clientX - rect.left;
        targetRef.current.y = event.clientY - rect.top;
        targetRef.current.opacity = maxOpacity;
      }}
      onMouseLeave={() => {
        targetRef.current.opacity = 0;
      }}
      className="relative"
      style={{
        ["--magnetic-x" as string]: "50%",
        ["--magnetic-y" as string]: "50%",
        ["--magnetic-opacity" as string]: 0,
      }}
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 rounded-2xl transition-opacity duration-300"
        style={{
          opacity: "var(--magnetic-opacity)",
          background: `radial-gradient(200px circle at var(--magnetic-x) var(--magnetic-y), ${color}, transparent 70%)`,
        }}
      />
      {children}
    </div>
  );
}

const tiers = PRICING_TIERS;

const ACCENT_STYLES = {
  purple: {
    magnetic: "rgba(168,85,247,1)",
    divider: "via-brand-purple/15",
    capacity: "bg-linear-to-r from-brand-purple to-brand-cyan",
    checkBg: "bg-brand-purple/15 ring-1 ring-brand-purple/12 group-hover/feat:ring-brand-purple/25",
    checkIcon: "text-brand-purple",
    focus: "focus-visible:outline-brand-purple/50",
  },
  amber: {
    magnetic: "rgba(251,191,36,1)",
    divider: "via-brand-amber/15",
    capacity: "bg-linear-to-r from-brand-amber to-brand-purple",
    checkBg: "bg-brand-amber/15 ring-1 ring-brand-amber/12 group-hover/feat:ring-brand-amber/25",
    checkIcon: "text-brand-amber",
    focus: "focus-visible:outline-brand-amber/50",
  },
  cyan: {
    magnetic: "rgba(6,182,212,1)",
    divider: "via-white/6",
    capacity: "bg-brand-cyan/50",
    checkBg: "bg-brand-cyan/10 ring-1 ring-brand-cyan/6 group-hover/feat:ring-brand-cyan/15",
    checkIcon: "text-brand-cyan",
    focus: "focus-visible:outline-brand-cyan/50",
  },
} as const;

export default function Pricing() {
  const [comingSoonToast, setComingSoonToast] = useState<string | null>(null);

  const showComingSoon = (tierName: string) => {
    setComingSoonToast(tierName);
    setTimeout(() => setComingSoonToast(null), 2500);
  };

  return (
    <SectionWrapper id="pricing" aria-labelledby="pricing-heading">
      {/* Coming soon toast */}
      <AnimatePresence>
        {comingSoonToast && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="fixed top-24 left-1/2 -translate-x-1/2 z-50 rounded-full border border-brand-purple/30 bg-black/90 backdrop-blur-xl px-4 py-2.5 shadow-[0_0_30px_rgba(168,85,247,0.15)]"
          >
            <p className="text-sm text-white/80 font-medium">
              {comingSoonToast} plan is coming soon — <a href="#download" className="text-brand-cyan hover:underline">download free</a> to get started today
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div variants={fadeUp} className="text-center relative">
        <SectionHeading id="pricing-heading">
          Start free,{" "}
          <span className="inline-block bg-linear-to-b from-white to-white/50 bg-clip-text text-transparent drop-shadow-lg">
            scale
          </span>{" "}
          when ready
        </SectionHeading>
        <p className="mx-auto mt-8 max-w-3xl text-lg text-muted-dark leading-relaxed font-light">
          Full-featured desktop app is free forever. Cloud adds 24/7 operation
          and team collaboration.
        </p>

      </motion.div>

      <motion.div
        variants={staggerContainer}
        className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 max-w-5xl mx-auto items-start"
      >
        {tiers.map((tier) => {
          const styles = ACCENT_STYLES[tier.accent];

          return (
            <MagneticGlowSurface
              key={tier.name}
              color={styles.magnetic}
              maxOpacity={tier.highlighted ? 0.08 : 0.05}
            >
              <GlowCard
                accent={tier.accent}
                highlighted={tier.highlighted}
                className="flex flex-col p-5 sm:p-6 relative"
              >
                {/* Popular badge */}
                {tier.highlighted && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 z-20">
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-brand-purple/40 bg-brand-purple/20 px-4 py-1.5 text-[10px] font-bold tracking-wider uppercase text-brand-purple backdrop-blur-sm shadow-[0_0_20px_rgba(168,85,247,0.2)]">
                      <Zap className="h-3 w-3" />
                      Most Popular
                    </span>
                  </div>
                )}
                {/* Enterprise badge */}
                {tier.name === "Enterprise" && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 z-20">
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-brand-amber/40 bg-brand-amber/15 px-4 py-1.5 text-[10px] font-bold tracking-wider uppercase text-brand-amber backdrop-blur-sm shadow-[0_0_20px_rgba(251,191,36,0.15)]">
                      <Building className="h-3 w-3" />
                      Enterprise
                    </span>
                  </div>
                )}

                <div className="relative flex items-center justify-between">
                  <h3 className={`font-semibold ${tier.highlighted ? "text-lg" : ""}`}>{tier.name}</h3>
                </div>

                <div className="relative mt-4 flex items-baseline gap-1">
                  <span className={`font-bold tracking-tight ${tier.highlighted ? "text-5xl" : "text-4xl"}`}>{tier.price}</span>
                  <span className="text-sm text-muted-dark">{tier.period}</span>
                </div>

                <div className={`mt-2 h-px bg-linear-to-r from-transparent to-transparent ${styles.divider}`} />

                <div className="mt-4 rounded-xl border border-white/4 bg-white/1 px-3 py-2">
                  <p className="text-[10px] font-mono uppercase tracking-wider text-muted-dark">Best for</p>
                  <p className="mt-1 text-xs text-muted">{tier.bestFor}</p>
                  <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/5">
                    <div
                      className={`h-full rounded-full ${styles.capacity}`}
                      style={{ width: `${tier.capacity}%` }}
                    />
                  </div>
                  <p className="mt-1 text-[10px] font-mono uppercase tracking-wider text-muted-dark">Monthly cloud headroom</p>
                </div>

                <motion.ul
                  className="relative mt-4 flex-1 space-y-3.5"
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  variants={{
                    hidden: {},
                    visible: {
                      transition: {
                        staggerChildren: 0.08,
                        delayChildren: tier.highlighted ? 0.2 : 0,
                      },
                    },
                  }}
                >
                  {tier.features.map((f) => (
                    <motion.li
                      key={f}
                      variants={{
                        hidden: { opacity: 0, x: -10 },
                        visible: { opacity: 1, x: 0, transition: { duration: 0.3 } },
                      }}
                      className="flex items-start gap-2.5 text-sm text-muted group/feat"
                    >
                      <div className={`mt-1 flex h-4 w-4 shrink-0 items-center justify-center rounded-full transition-all duration-300 ${styles.checkBg}`}>
                        <Check className={`h-2.5 w-2.5 ${styles.checkIcon}`} />
                      </div>
                      <span className="transition-colors duration-300 group-hover/feat:text-foreground">{f}</span>
                    </motion.li>
                  ))}
                </motion.ul>

                {(() => {
                  const pyClass = tier.highlighted ? "py-3.5" : "py-3";
                  const base = `group relative mt-8 w-full rounded-full text-sm font-medium transition-all duration-300 cursor-pointer overflow-hidden focus-visible:outline-2 focus-visible:outline-offset-2 ${pyClass} ${styles.focus} ${tier.ctaStyle}`;

                  return tier.href ? (
                    <a href={tier.href} className={`block text-center ${base}`}>
                      <div className="absolute inset-0 -translate-x-full bg-linear-to-r from-transparent via-white/10 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
                      <span className="relative">{tier.cta}</span>
                    </a>
                  ) : (
                    <button onClick={() => tier.comingSoon && showComingSoon(tier.name)} className={base}>
                      <div className="absolute inset-0 -translate-x-full bg-linear-to-r from-transparent via-white/10 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
                      <span className="relative">{tier.cta}</span>
                    </button>
                  );
                })()}
              </GlowCard>
            </MagneticGlowSurface>
          );
        })}
      </motion.div>

      <motion.div variants={fadeUp} className="mt-10 text-center">
        <div className="mx-auto max-w-5xl rounded-2xl border border-white/4 bg-white/1 px-4 py-3 sm:px-6">
          <p className="text-xs text-muted-dark leading-relaxed">
            All plans require your own Claude subscription (Pro/Max). We never touch your Anthropic bill.
            {/* eslint-disable-next-line custom-a11y/no-low-text-opacity -- decorative separator */}
            <span className="mx-2 hidden text-white/6 sm:inline">|</span>
            <span className="text-brand-cyan/70">Bring Your Own Infrastructure</span> — use your own cloud keys for unlimited execution.
          </p>
        </div>
      </motion.div>
    </SectionWrapper>
  );
}
