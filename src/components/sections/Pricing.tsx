"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, Zap } from "lucide-react";
import SectionWrapper from "@/components/SectionWrapper";
import GlowCard from "@/components/GlowCard";
import GradientText from "@/components/GradientText";
import { fadeUp, staggerContainer } from "@/lib/animations";

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
  const targetRef = useRef({ x: 0, y: 0, opacity: 0 });
  const currentRef = useRef({ x: 0, y: 0, opacity: 0 });

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const frame = () => {
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

const tiers = [
  {
    name: "Free",
    price: "$0",
    period: "forever",
    accent: "cyan" as const,
    cta: "Download Free",
    href: "#download",
    bestFor: "Solo builders getting started",
    capacity: 10,
    ctaStyle: "border border-white/[0.08] text-muted hover:border-white/[0.15] hover:text-foreground hover:bg-white/[0.02]",
    features: [
      "Unlimited local agents",
      "Local event bus & scheduler",
      "Full observability dashboard",
      "Design engine",
      "Team canvas (local)",
    ],
  },
  {
    name: "Starter",
    price: "$9",
    period: "/mo",
    accent: "cyan" as const,
    cta: "Get Started",
    comingSoon: true,
    bestFor: "Early production workloads",
    capacity: 35,
    ctaStyle: "border border-white/[0.08] text-muted hover:border-white/[0.15] hover:text-foreground hover:bg-white/[0.02]",
    features: [
      "Everything in Free",
      "1 cloud worker",
      "100 cloud executions/mo",
      "500 cloud events/mo",
      "5-min max timeout",
    ],
  },
  {
    name: "Pro",
    price: "$29",
    period: "/mo",
    accent: "purple" as const,
    highlighted: true,
    cta: "Go Pro",
    comingSoon: true,
    bestFor: "Fast-moving individual teams",
    capacity: 65,
    ctaStyle: "bg-brand-purple text-white hover:bg-purple-400 shadow-[0_0_25px_rgba(168,85,247,0.15)]",
    features: [
      "Everything in Starter",
      "3 cloud workers",
      "1,000 executions/mo",
      "10,000 events/mo",
      "Burst auto-scaling",
    ],
  },
  {
    name: "Team",
    price: "$79",
    period: "/mo",
    accent: "emerald" as const,
    cta: "Contact Us",
    href: "mailto:team@personas.dev?subject=Personas Team Plan",
    bestFor: "Multi-user operations",
    capacity: 90,
    ctaStyle: "border border-white/[0.08] text-muted hover:border-white/[0.15] hover:text-foreground hover:bg-white/[0.02]",
    features: [
      "Everything in Pro",
      "5 cloud workers",
      "5,000 executions/mo",
      "Team credential sharing",
      "Member invitations",
    ],
  },
];

export default function Pricing() {
  const [comingSoonToast, setComingSoonToast] = useState<string | null>(null);

  const showComingSoon = (tierName: string) => {
    setComingSoonToast(tierName);
    setTimeout(() => setComingSoonToast(null), 2500);
  };

  return (
    <SectionWrapper id="pricing" dotGrid>
      {/* Coming soon toast */}
      <AnimatePresence>
        {comingSoonToast && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="fixed top-24 left-1/2 -translate-x-1/2 z-50 rounded-full border border-brand-purple/30 bg-black/90 backdrop-blur-xl px-5 py-2.5 shadow-[0_0_30px_rgba(168,85,247,0.15)]"
          >
            <p className="text-sm text-white/80 font-medium">
              {comingSoonToast} plan is coming soon — <a href="#download" className="text-brand-cyan hover:underline">download free</a> to get started today
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Background accents */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div
          className="absolute left-1/2 top-[30%] h-125 w-175 -translate-x-1/2 rounded-full opacity-30"
          style={{ background: "radial-gradient(ellipse, rgba(168,85,247,0.04) 0%, rgba(6,182,212,0.02) 40%, transparent 70%)" }}
        />
      </div>

      <motion.div variants={fadeUp} className="text-center relative">
        <h2 className="text-4xl font-extrabold tracking-tight sm:text-5xl md:text-7xl drop-shadow-md">
          Start free,{" "}
          <span className="inline-block text-5xl sm:text-6xl md:text-[5.5rem] bg-linear-to-b from-white to-white/50 bg-clip-text text-transparent drop-shadow-lg">
            scale
          </span>{" "}
          when ready
        </h2>
        <p className="mx-auto mt-8 max-w-3xl text-lg text-muted-dark leading-relaxed font-light">
          Full-featured desktop app is free forever. Cloud adds 24/7 operation
          and team collaboration.
        </p>
      </motion.div>

      <motion.div
        variants={staggerContainer}
        className="mt-16 grid gap-5 sm:grid-cols-2 lg:grid-cols-4 items-start"
      >
        {tiers.map((tier) => {
          const magneticColor =
            tier.accent === "purple"
              ? "rgba(168,85,247,1)"
              : tier.accent === "emerald"
                ? "rgba(52,211,153,1)"
                : "rgba(6,182,212,1)";

          const card = (
            <MagneticGlowSurface
              key={tier.name}
              color={magneticColor}
              maxOpacity={tier.highlighted ? 0.08 : 0.05}
            >
              <GlowCard
                accent={tier.accent}
                highlighted={tier.highlighted}
                className={`flex flex-col p-5 sm:p-6 relative ${tier.highlighted ? "shimmer-surface" : ""}`}
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

                {/* Background glow for highlighted */}
                {tier.highlighted && (
                  <div className="pointer-events-none absolute inset-0 rounded-2xl overflow-hidden">
                    <div className="absolute -top-20 left-1/2 -translate-x-1/2 h-48 w-48 rounded-full bg-brand-purple/6 blur-3xl" />
                    <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 h-32 w-32 rounded-full bg-brand-cyan/3 blur-3xl" />
                  </div>
                )}

                <div className="relative flex items-center justify-between">
                  <h3 className={`font-semibold ${tier.highlighted ? "text-lg" : ""}`}>{tier.name}</h3>
                  {tier.highlighted && (
                    <div className="h-2 w-2 rounded-full bg-brand-purple shadow-[0_0_8px_rgba(168,85,247,0.6)] animate-glow-border" />
                  )}
                </div>

                <div className="relative mt-5 flex items-baseline gap-1">
                  <span className={`font-bold tracking-tight ${tier.highlighted ? "text-5xl" : "text-4xl"}`}>{tier.price}</span>
                  <span className="text-sm text-muted-dark">{tier.period}</span>
                </div>

                <div className={`mt-2 h-px bg-linear-to-r from-transparent to-transparent ${tier.highlighted ? "via-brand-purple/15" : "via-white/6"}`} />

                <div className="mt-4 rounded-xl border border-white/4 bg-white/1 px-3 py-2">
                  <p className="text-[10px] font-mono uppercase tracking-wider text-muted-dark/70">Best for</p>
                  <p className="mt-1 text-xs text-muted">{tier.bestFor}</p>
                  <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/5">
                    <div
                      className={`h-full rounded-full ${tier.highlighted ? "bg-linear-to-r from-brand-purple to-brand-cyan" : "bg-brand-cyan/50"}`}
                      style={{ width: `${tier.capacity}%` }}
                    />
                  </div>
                  <p className="mt-1 text-[10px] font-mono uppercase tracking-wider text-muted-dark/60">Monthly cloud headroom</p>
                </div>

                <ul className="relative mt-5 flex-1 space-y-3">
                  {tier.features.map((f) => (
                    <li key={f} className="flex items-start gap-2.5 text-sm text-muted group/feat">
                      <div className={`mt-1 flex h-4 w-4 shrink-0 items-center justify-center rounded-full transition-all duration-300 ${
                        tier.highlighted
                            ? "bg-brand-purple/15 ring-1 ring-brand-purple/12 group-hover/feat:ring-brand-purple/25"
                            : "bg-brand-cyan/10 ring-1 ring-brand-cyan/6 group-hover/feat:ring-brand-cyan/15"
                      }`}>
                        <Check className={`h-2.5 w-2.5 ${tier.highlighted ? "text-brand-purple" : "text-brand-cyan"}`} />
                      </div>
                      <span className="transition-colors duration-300 group-hover/feat:text-foreground">{f}</span>
                    </li>
                  ))}
                </ul>

                {tier.href ? (
                  <a
                    href={tier.href}
                    className={`group relative mt-8 block w-full rounded-full text-sm font-medium text-center transition-all duration-300 cursor-pointer overflow-hidden focus-visible:outline-2 focus-visible:outline-offset-2 ${
                      tier.highlighted ? "py-3.5 shadow-[0_0_30px_rgba(168,85,247,0.2)]" : "py-2.5"
                    } ${tier.highlighted ? "focus-visible:outline-brand-purple/50" : "focus-visible:outline-brand-cyan/50"} ${tier.ctaStyle}`}
                  >
                    <div className="absolute inset-0 -translate-x-full bg-linear-to-r from-transparent via-white/10 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
                    <span className="relative">{tier.cta}</span>
                  </a>
                ) : (
                  <button
                    onClick={() => tier.comingSoon && showComingSoon(tier.name)}
                    className={`group relative mt-8 w-full rounded-full text-sm font-medium transition-all duration-300 cursor-pointer overflow-hidden focus-visible:outline-2 focus-visible:outline-offset-2 ${
                      tier.highlighted ? "py-3.5 shadow-[0_0_30px_rgba(168,85,247,0.2)]" : "py-2.5"
                    } ${tier.highlighted ? "focus-visible:outline-brand-purple/50" : "focus-visible:outline-brand-cyan/50"} ${tier.ctaStyle}`}
                  >
                    <div className="absolute inset-0 -translate-x-full bg-linear-to-r from-transparent via-white/10 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
                    <span className="relative">{tier.cta}</span>
                  </button>
                )}
              </GlowCard>
            </MagneticGlowSurface>
          );

          if (tier.highlighted) {
            return (
              <div key={tier.name} className="animated-conic-border p-px rounded-2xl lg:-mt-6 lg:mb-6">
                {card}
              </div>
            );
          }
          return card;
        })}
      </motion.div>

      <motion.div variants={fadeUp} className="mt-10 text-center">
        <div className="mx-auto max-w-3xl rounded-2xl border border-white/4 bg-white/1 px-4 py-3 sm:px-5">
          <p className="text-xs text-muted-dark leading-relaxed">
            All plans require your own Claude subscription (Pro/Max). We never touch your Anthropic bill.
            <span className="mx-2 hidden text-white/6 sm:inline">|</span>
            <span className="text-brand-cyan/50">Bring Your Own Infrastructure</span> — use your own cloud keys for unlimited execution.
          </p>
        </div>
      </motion.div>
    </SectionWrapper>
  );
}
