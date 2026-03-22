"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import { fadeUp, staggerContainer } from "@/lib/animations";
import GradientText from "@/components/GradientText";
import Navbar from "@/components/Navbar";
import Footer from "@/components/sections/Footer";

/* ─────────────────────────────────────────── */
/*  Asset registry                             */
/* ─────────────────────────────────────────── */

type VisualAsset = {
  id: string;
  label: string;
  src: string;
  accent: string;
  width: number;
  height: number;
};

const backgrounds: VisualAsset[] = [
  { id: "circuit", label: "Circuit", src: "/gen/backgrounds/bg-circuit.png", accent: "#06b6d4", width: 1536, height: 512 },
  { id: "energy", label: "Energy Waves", src: "/gen/backgrounds/bg-energy.png", accent: "#06b6d4", width: 1536, height: 512 },
  { id: "stars", label: "Starfield", src: "/gen/backgrounds/bg-stars.png", accent: "#60a5fa", width: 1536, height: 512 },
  { id: "mesh", label: "Mesh Gradient", src: "/gen/backgrounds/bg-mesh.png", accent: "#a855f7", width: 1536, height: 512 },
  { id: "android", label: "Android Head", src: "/gen/backgrounds/bg-android.png", accent: "#06b6d4", width: 1536, height: 512 },
  { id: "datastream", label: "Data Stream", src: "/gen/backgrounds/bg-datastream.png", accent: "#06b6d4", width: 1536, height: 512 },
  { id: "observability", label: "Observability", src: "/gen/backgrounds/bg-observability.png", accent: "#06b6d4", width: 1536, height: 512 },
  { id: "settings", label: "Settings", src: "/gen/backgrounds/bg-settings.png", accent: "#34d399", width: 1536, height: 512 },
  { id: "agents", label: "Agents", src: "/gen/backgrounds/bg-agents.png", accent: "#a855f7", width: 1536, height: 512 },
  { id: "events", label: "Events", src: "/gen/backgrounds/bg-events.png", accent: "#34d399", width: 1536, height: 512 },
];

const patterns: VisualAsset[] = [
  { id: "hexgrid", label: "Hex Grid", src: "/gen/patterns/pat-hexgrid.png", accent: "#06b6d4", width: 512, height: 512 },
  { id: "circuit-pat", label: "Circuit Traces", src: "/gen/patterns/pat-circuit.png", accent: "#a855f7", width: 512, height: 512 },
  { id: "topo", label: "Topographic", src: "/gen/patterns/pat-topo.png", accent: "#06b6d4", width: 512, height: 512 },
  { id: "dots", label: "Dot Matrix", src: "/gen/patterns/pat-dots.png", accent: "#ffffff", width: 512, height: 512 },
  { id: "geo", label: "Geometric", src: "/gen/patterns/pat-geo.png", accent: "#a855f7", width: 512, height: 512 },
  { id: "waves", label: "Wave Interference", src: "/gen/patterns/pat-waves.png", accent: "#34d399", width: 512, height: 512 },
  { id: "neural", label: "Neural Network", src: "/gen/patterns/pat-neural.png", accent: "#06b6d4", width: 512, height: 512 },
  { id: "dna", label: "DNA Helix", src: "/gen/patterns/pat-dna.png", accent: "#a855f7", width: 512, height: 512 },
  { id: "radial", label: "Radial Burst", src: "/gen/patterns/pat-radial.png", accent: "#06b6d4", width: 512, height: 512 },
  { id: "noise", label: "Noise Texture", src: "/gen/patterns/pat-noise.png", accent: "#ffffff", width: 512, height: 512 },
];

type Tab = "backgrounds" | "patterns" | "combine";

/* ─────────────────────────────────────────── */
/*  Sub-components                             */
/* ─────────────────────────────────────────── */

function TabButton({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`relative cursor-pointer px-5 py-2.5 text-sm font-medium tracking-wide transition-all duration-200 rounded-lg ${
        active
          ? "text-white bg-white/[0.06] border border-white/10"
          : "text-white/40 hover:text-white/70 border border-transparent"
      }`}
    >
      {children}
      {active && (
        <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-0.5 rounded-full bg-brand-cyan" />
      )}
    </button>
  );
}

function OpacitySlider({ value, onChange, label }: { value: number; onChange: (v: number) => void; label?: string }) {
  return (
    <div className="flex items-center gap-3">
      {label && <span className="text-xs text-white/40">{label}</span>}
      <span className="text-xs text-white/30 font-mono w-10">{Math.round(value * 100)}%</span>
      <input
        type="range"
        min={0}
        max={100}
        value={Math.round(value * 100)}
        onChange={(e) => onChange(Number(e.target.value) / 100)}
        className="h-1 w-32 appearance-none rounded-full bg-white/10 accent-brand-cyan cursor-pointer [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:bg-brand-cyan"
      />
    </div>
  );
}

function AssetPill({ asset, selected, onClick }: { asset: VisualAsset; selected: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`cursor-pointer px-3 py-1.5 rounded-full text-xs font-medium tracking-wide transition-all duration-200 border ${
        selected
          ? "border-white/20 bg-white/[0.08] text-white"
          : "border-white/[0.04] bg-white/[0.02] text-white/40 hover:text-white/60 hover:border-white/10"
      }`}
      style={selected ? { boxShadow: `0 0 12px ${asset.accent}20` } : undefined}
    >
      <span
        className="inline-block w-2 h-2 rounded-full mr-1.5"
        style={{ backgroundColor: asset.accent, opacity: selected ? 0.8 : 0.3 }}
      />
      {asset.label}
    </button>
  );
}

/* ── Image overlay layer ── */
function ImageLayer({
  asset,
  opacity,
  mode = "cover",
}: {
  asset: VisualAsset;
  opacity: number;
  mode?: "cover" | "tile";
}) {
  if (mode === "tile") {
    return (
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          opacity,
          backgroundImage: `url(${asset.src})`,
          backgroundSize: "512px 512px",
          backgroundRepeat: "repeat",
        }}
      />
    );
  }

  return (
    <div className="absolute inset-0 pointer-events-none" style={{ opacity }}>
      <Image
        src={asset.src}
        alt={asset.label}
        fill
        sizes="100vw"
        className="object-cover"
        priority={false}
      />
    </div>
  );
}

/* ── Big preview ── */
function PreviewCard({
  asset,
  opacity,
  label,
  mode,
}: {
  asset: VisualAsset | null;
  opacity: number;
  label: string;
  mode?: "cover" | "tile";
}) {
  return (
    <div className="relative rounded-xl border border-white/[0.06] bg-background overflow-hidden aspect-[16/9]">
      {asset && <ImageLayer asset={asset} opacity={opacity} mode={mode} />}
      {!asset && (
        <div className="absolute inset-0 flex items-center justify-center text-white/20 text-sm">
          Select a {label} to preview
        </div>
      )}
      {asset && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 z-10">
          <div className="text-white/60 text-lg font-semibold tracking-tight">{asset.label}</div>
          <div className="text-white/25 text-xs font-mono">opacity: {Math.round(opacity * 100)}%</div>
        </div>
      )}
    </div>
  );
}

/* ── Gallery grid ── */
function GalleryGrid({
  items,
  selectedId,
  onSelect,
  opacity,
  mode,
}: {
  items: VisualAsset[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  opacity: number;
  mode?: "cover" | "tile";
}) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {items.map((asset) => {
        const isActive = asset.id === selectedId;
        return (
          <button
            key={asset.id}
            onClick={() => onSelect(asset.id)}
            className={`group relative rounded-xl overflow-hidden aspect-[16/10] cursor-pointer transition-all duration-300 border ${
              isActive
                ? "border-brand-cyan/30 ring-1 ring-brand-cyan/20"
                : "border-white/[0.04] hover:border-white/10"
            }`}
            style={{ background: "#0a0a12" }}
          >
            <ImageLayer asset={asset} opacity={opacity} mode={mode} />
            <div className="absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-black/60 to-transparent z-10">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: asset.accent, opacity: 0.7 }} />
                <span className="text-xs font-medium text-white/70">{asset.label}</span>
              </div>
            </div>
            {isActive && (
              <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-brand-cyan/20 border border-brand-cyan/40 flex items-center justify-center z-10">
                <div className="w-2 h-2 rounded-full bg-brand-cyan" />
              </div>
            )}
          </button>
        );
      })}
    </div>
  );
}

/* ─────────────────────────────────────────── */
/*  Combine Tab                                */
/* ─────────────────────────────────────────── */

function CombineView() {
  const [selectedBg, setSelectedBg] = useState<string | null>("circuit");
  const [selectedPat, setSelectedPat] = useState<string | null>("hexgrid");
  const [bgOpacity, setBgOpacity] = useState(0.15);
  const [patOpacity, setPatOpacity] = useState(0.08);

  const bgAsset = backgrounds.find((b) => b.id === selectedBg) ?? null;
  const patAsset = patterns.find((p) => p.id === selectedPat) ?? null;

  return (
    <div className="space-y-6">
      {/* Live combined preview */}
      <div className="relative rounded-xl border border-white/[0.06] bg-background overflow-hidden aspect-[21/9]">
        {bgAsset && <ImageLayer asset={bgAsset} opacity={bgOpacity} />}
        {patAsset && <ImageLayer asset={patAsset} opacity={patOpacity} mode="tile" />}

        <div className="absolute inset-0 flex flex-col items-center justify-center z-10 gap-4 p-8">
          <h2 className="text-2xl md:text-4xl font-bold tracking-tight text-white/90">
            Sample Page Content
          </h2>
          <p className="text-sm md:text-base text-white/40 max-w-md text-center leading-relaxed">
            Preview how the selected background and pattern combine as page overlays. Adjust opacity sliders to fine-tune the visual treatment.
          </p>
          <div className="flex gap-3 mt-2">
            <span className="px-4 py-2 rounded-lg bg-brand-cyan/10 border border-brand-cyan/20 text-brand-cyan text-sm font-medium">
              Primary Action
            </span>
            <span className="px-4 py-2 rounded-lg bg-white/[0.04] border border-white/[0.06] text-white/50 text-sm">
              Secondary
            </span>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Background selector */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-white/60">Background</h3>
            <OpacitySlider value={bgOpacity} onChange={setBgOpacity} />
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedBg(null)}
              className={`cursor-pointer px-3 py-1.5 rounded-full text-xs font-medium tracking-wide transition-all duration-200 border ${
                selectedBg === null
                  ? "border-white/20 bg-white/[0.08] text-white"
                  : "border-white/[0.04] bg-white/[0.02] text-white/40 hover:text-white/60 hover:border-white/10"
              }`}
            >
              None
            </button>
            {backgrounds.map((bg) => (
              <AssetPill key={bg.id} asset={bg} selected={selectedBg === bg.id} onClick={() => setSelectedBg(bg.id)} />
            ))}
          </div>
        </div>

        {/* Pattern selector */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-white/60">Pattern Overlay</h3>
            <OpacitySlider value={patOpacity} onChange={setPatOpacity} />
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedPat(null)}
              className={`cursor-pointer px-3 py-1.5 rounded-full text-xs font-medium tracking-wide transition-all duration-200 border ${
                selectedPat === null
                  ? "border-white/20 bg-white/[0.08] text-white"
                  : "border-white/[0.04] bg-white/[0.02] text-white/40 hover:text-white/60 hover:border-white/10"
              }`}
            >
              None
            </button>
            {patterns.map((pat) => (
              <AssetPill key={pat.id} asset={pat} selected={selectedPat === pat.id} onClick={() => setSelectedPat(pat.id)} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────── */
/*  Main Page                                  */
/* ─────────────────────────────────────────── */

export default function PlaygroundPage() {
  const [tab, setTab] = useState<Tab>("backgrounds");
  const [selectedBg, setSelectedBg] = useState<string | null>("circuit");
  const [selectedPat, setSelectedPat] = useState<string | null>("hexgrid");
  const [bgOpacity, setBgOpacity] = useState(0.15);
  const [patOpacity, setPatOpacity] = useState(0.1);

  const bgAsset = backgrounds.find((b) => b.id === selectedBg) ?? null;
  const patAsset = patterns.find((p) => p.id === selectedPat) ?? null;

  return (
    <>
      <Navbar />
      <main className="relative min-h-screen bg-[var(--background)] overflow-hidden">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-28 pb-20">
          <motion.div initial="hidden" animate="visible" variants={staggerContainer}>
            {/* Header */}
            <motion.div variants={fadeUp} className="text-center mb-10">
              <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-3">
                <GradientText>Visual Asset Playground</GradientText>
              </h1>
              <p className="text-sm text-white/40 max-w-lg mx-auto">
                Browse 10 AI-generated backgrounds and 10 decorative patterns. Combine layers to find the perfect visual treatment for your pages.
              </p>
            </motion.div>

            {/* Tab navigation */}
            <motion.div variants={fadeUp} className="flex justify-center gap-2 mb-8">
              <TabButton active={tab === "backgrounds"} onClick={() => setTab("backgrounds")}>
                Backgrounds
              </TabButton>
              <TabButton active={tab === "patterns"} onClick={() => setTab("patterns")}>
                Patterns
              </TabButton>
              <TabButton active={tab === "combine"} onClick={() => setTab("combine")}>
                Combine
              </TabButton>
            </motion.div>

            {/* Tab content */}
            <motion.div variants={fadeUp}>
              {tab === "backgrounds" && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg font-semibold text-white/70">Background Scenes</h2>
                    <OpacitySlider value={bgOpacity} onChange={setBgOpacity} />
                  </div>
                  <PreviewCard asset={bgAsset} opacity={bgOpacity} label="background" />
                  <GalleryGrid items={backgrounds} selectedId={selectedBg} onSelect={setSelectedBg} opacity={bgOpacity} />
                </div>
              )}

              {tab === "patterns" && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg font-semibold text-white/70">Decorative Patterns</h2>
                    <OpacitySlider value={patOpacity} onChange={setPatOpacity} />
                  </div>
                  <PreviewCard asset={patAsset} opacity={patOpacity} label="pattern" mode="tile" />
                  <GalleryGrid items={patterns} selectedId={selectedPat} onSelect={setSelectedPat} opacity={patOpacity} mode="tile" />
                </div>
              )}

              {tab === "combine" && <CombineView />}
            </motion.div>
          </motion.div>
        </div>
      </main>
      <Footer />
    </>
  );
}
