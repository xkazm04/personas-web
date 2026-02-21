import Navbar from "@/components/Navbar";
import Hero from "@/components/sections/Hero";
import SocialProof from "@/components/sections/SocialProof";
import WhyAgents from "@/components/sections/WhyAgents";
import Features from "@/components/sections/Features";
import UseCases from "@/components/sections/UseCases";
import EventBusShowcase from "@/components/sections/EventBusShowcase";
import Vision from "@/components/sections/Vision";
import Roadmap from "@/components/sections/Roadmap";
import Pricing from "@/components/sections/Pricing";
import DownloadCTA from "@/components/sections/DownloadCTA";
import Footer from "@/components/sections/Footer";
import SectionSnapScroll from "@/components/SectionSnapScroll";
import TopoBackground from "@/components/TopoBackground";
import ParallaxAccents from "@/components/ParallaxAccents";
import CinematicBreather from "@/components/CinematicBreather";
import type { ReactNode } from "react";

function StageSection({
  children,
  glow,
  showTopLine = true,
  fromColor,
  toColor,
}: {
  children: ReactNode;
  glow: "cyan" | "purple" | "emerald";
  showTopLine?: boolean;
  fromColor?: string;
  toColor?: string;
}) {
  const glowStyle: Record<typeof glow, string> = {
    cyan: "radial-gradient(circle, rgba(6,182,212,0.05) 0%, transparent 65%)",
    purple: "radial-gradient(circle, rgba(168,85,247,0.045) 0%, transparent 65%)",
    emerald: "radial-gradient(circle, rgba(52,211,153,0.04) 0%, transparent 65%)",
  };

  return (
    <section className="relative overflow-hidden">
      {/* Color-coded transition edge — top */}
      {showTopLine && !fromColor && (
        <div className="pointer-events-none absolute inset-x-0 top-0 z-[1] section-line" />
      )}
      {fromColor && (
        <div
          className="pointer-events-none absolute inset-x-0 top-0 z-[1] h-24"
          style={{ background: `linear-gradient(to bottom, ${fromColor}, transparent)` }}
        />
      )}

      {/* Color-coded transition edge — bottom */}
      {toColor && (
        <div
          className="pointer-events-none absolute inset-x-0 bottom-0 z-[1] h-24"
          style={{ background: `linear-gradient(to top, ${toColor}, transparent)` }}
        />
      )}

      <div className="pointer-events-none absolute inset-0">
        <div
          className="absolute left-1/2 top-1/2 h-[720px] w-[720px] -translate-x-1/2 -translate-y-1/2 rounded-full"
          style={{ background: glowStyle[glow] }}
        />
      </div>

      <div className="relative z-[2]">{children}</div>
    </section>
  );
}

export default function Home() {
  return (
    <>
      <Navbar />
      <main className="relative isolate overflow-hidden">
        <SectionSnapScroll />

        {/* Topographic contour background (Direction 2) */}
        <TopoBackground />

        {/* Scroll-driven parallax accents (Direction 5) */}
        <ParallaxAccents />

        {/* Reduced ambient orbs — kept as subtle supplement */}
        <div className="pointer-events-none fixed inset-0 -z-10">
          <div
            className="absolute left-[8%] top-[12%] h-[560px] w-[560px] rounded-full"
            style={{ background: "radial-gradient(circle, rgba(6,182,212,0.04) 0%, transparent 70%)" }}
          />
          <div
            className="absolute right-[8%] top-[36%] h-[520px] w-[520px] rounded-full"
            style={{ background: "radial-gradient(circle, rgba(168,85,247,0.035) 0%, transparent 70%)" }}
          />
        </div>

        {/* Right-side scroll map */}
        <aside className="pointer-events-none fixed right-5 top-1/2 z-40 hidden -translate-y-1/2 lg:flex flex-col items-end gap-2">
          <div className="rounded-full border border-white/[0.06] bg-black/20 px-2.5 py-1 text-[10px] uppercase tracking-[0.2em] text-muted-dark backdrop-blur-sm">
            Scroll Map
          </div>
          <div className="space-y-1.5 text-[10px] font-mono tracking-wider text-muted-dark/80">
            {["HERO", "BUILD", "SYSTEM", "PRICING", "DOWNLOAD"].map((label) => (
              <div key={label} className="flex items-center justify-end gap-2">
                <span>{label}</span>
                <span className="h-px w-4 bg-gradient-to-l from-brand-cyan/35 to-transparent" />
              </div>
            ))}
          </div>
        </aside>

        <Hero />

        <StageSection glow="cyan" showTopLine={false} toColor="rgba(6,182,212,0.04)">
          <SocialProof />
        </StageSection>

        <StageSection glow="purple" fromColor="rgba(6,182,212,0.04)" toColor="rgba(244,63,94,0.04)">
          <WhyAgents />
        </StageSection>

        <StageSection glow="cyan" fromColor="rgba(244,63,94,0.03)" toColor="rgba(6,182,212,0.04)">
          <Features />
        </StageSection>

        <StageSection glow="emerald" fromColor="rgba(6,182,212,0.03)" toColor="rgba(52,211,153,0.04)">
          <UseCases />
        </StageSection>

        {/* Cinematic full-bleed breather (Direction 10) */}
        <CinematicBreather />

        <StageSection glow="cyan" fromColor="rgba(52,211,153,0.03)" toColor="rgba(6,182,212,0.04)">
          <EventBusShowcase />
        </StageSection>

        <StageSection glow="purple" fromColor="rgba(6,182,212,0.03)" toColor="rgba(168,85,247,0.04)">
          <Vision />
        </StageSection>

        <StageSection glow="emerald" fromColor="rgba(168,85,247,0.03)" toColor="rgba(52,211,153,0.04)">
          <Roadmap />
        </StageSection>

        <StageSection glow="purple" fromColor="rgba(52,211,153,0.03)" toColor="rgba(168,85,247,0.04)">
          <Pricing />
        </StageSection>

        <StageSection glow="cyan" fromColor="rgba(168,85,247,0.03)">
          <DownloadCTA />
        </StageSection>
      </main>
      <Footer />
    </>
  );
}
