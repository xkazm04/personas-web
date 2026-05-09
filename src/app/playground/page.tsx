"use client";

import { useEffect, useRef, useState } from "react";
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
  { id: "circuit", label: "Circuit", src: "/gen/backgrounds/bg-circuit.avif", accent: "#06b6d4", width: 1536, height: 512 },
  { id: "energy", label: "Energy Waves", src: "/gen/backgrounds/bg-energy.avif", accent: "#06b6d4", width: 1536, height: 512 },
  { id: "stars", label: "Starfield", src: "/gen/backgrounds/bg-stars.avif", accent: "#60a5fa", width: 1536, height: 512 },
  { id: "mesh", label: "Mesh Gradient", src: "/gen/backgrounds/bg-mesh.avif", accent: "#a855f7", width: 1536, height: 512 },
  { id: "android", label: "Android Head", src: "/gen/backgrounds/bg-android.avif", accent: "#06b6d4", width: 1536, height: 512 },
  { id: "datastream", label: "Data Stream", src: "/gen/backgrounds/bg-datastream.avif", accent: "#06b6d4", width: 1536, height: 512 },
  { id: "observability", label: "Observability", src: "/gen/backgrounds/bg-observability.avif", accent: "#06b6d4", width: 1536, height: 512 },
  { id: "settings", label: "Settings", src: "/gen/backgrounds/bg-settings.avif", accent: "#34d399", width: 1536, height: 512 },
  { id: "agents", label: "Agents", src: "/gen/backgrounds/bg-agents.avif", accent: "#a855f7", width: 1536, height: 512 },
  { id: "events", label: "Events", src: "/gen/backgrounds/bg-events.avif", accent: "#34d399", width: 1536, height: 512 },
];

const patterns: VisualAsset[] = [
  { id: "hexgrid", label: "Hex Grid", src: "/gen/patterns/pat-hexgrid.avif", accent: "#06b6d4", width: 512, height: 512 },
  { id: "circuit-pat", label: "Circuit Traces", src: "/gen/patterns/pat-circuit.avif", accent: "#a855f7", width: 512, height: 512 },
  { id: "topo", label: "Topographic", src: "/gen/patterns/pat-topo.avif", accent: "#06b6d4", width: 512, height: 512 },
  { id: "dots", label: "Dot Matrix", src: "/gen/patterns/pat-dots.avif", accent: "#ffffff", width: 512, height: 512 },
  { id: "geo", label: "Geometric", src: "/gen/patterns/pat-geo.avif", accent: "#a855f7", width: 512, height: 512 },
  { id: "waves", label: "Wave Interference", src: "/gen/patterns/pat-waves.avif", accent: "#34d399", width: 512, height: 512 },
  { id: "neural", label: "Neural Network", src: "/gen/patterns/pat-neural.avif", accent: "#06b6d4", width: 512, height: 512 },
  { id: "dna", label: "DNA Helix", src: "/gen/patterns/pat-dna.avif", accent: "#a855f7", width: 512, height: 512 },
  { id: "radial", label: "Radial Burst", src: "/gen/patterns/pat-radial.avif", accent: "#06b6d4", width: 512, height: 512 },
  { id: "noise", label: "Noise Texture", src: "/gen/patterns/pat-noise.avif", accent: "#ffffff", width: 512, height: 512 },
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
          : "text-muted-dark hover:text-muted border border-transparent"
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
      {label && <span className="text-xs text-muted-dark">{label}</span>}
      <span className="text-xs text-muted-dark font-mono w-10">{Math.round(value * 100)}%</span>
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

function AssetPill({
  asset,
  selected,
  onClick,
  onHoverStart,
  onHoverEnd,
}: {
  asset: VisualAsset;
  selected: boolean;
  onClick: () => void;
  onHoverStart?: () => void;
  onHoverEnd?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      onMouseEnter={onHoverStart}
      onMouseLeave={onHoverEnd}
      onFocus={onHoverStart}
      onBlur={onHoverEnd}
      className={`cursor-pointer px-3 py-1.5 rounded-full text-xs font-medium tracking-wide transition-all duration-200 border ${
        selected
          ? "border-white/20 bg-white/[0.08] text-white"
          : "border-white/[0.04] bg-white/[0.02] text-muted-dark hover:text-muted hover:border-white/10"
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
  // Patterns are authored at 512×512, so previewing them in 16/9 distorts the
  // sample tile. Use a 4/3 frame for tile mode; cover backgrounds keep 16/9.
  const aspect = mode === "tile" ? "aspect-[4/3]" : "aspect-[16/9]";
  return (
    <div className={`relative rounded-xl border border-white/[0.06] bg-background overflow-hidden ${aspect}`}>
      {asset && <ImageLayer asset={asset} opacity={opacity} mode={mode} />}
      {!asset && (
        <div className="absolute inset-0 flex items-center justify-center text-muted-dark text-sm">
          Select a {label} to preview
        </div>
      )}
      {asset && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 z-10">
          <div className="text-muted text-lg font-semibold tracking-tight">{asset.label}</div>
          <div className="text-muted-dark text-xs font-mono">opacity: {Math.round(opacity * 100)}%</div>
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
  // Pattern tiles are authored 1:1 (512×512); show them square so the tile
  // isn't horizontally stretched. Cover backgrounds stay 16:10.
  const tileAspect = mode === "tile" ? "aspect-square" : "aspect-[16/10]";
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {items.map((asset) => {
        const isActive = asset.id === selectedId;
        return (
          <button
            key={asset.id}
            onClick={() => onSelect(asset.id)}
            className={`group relative rounded-xl overflow-hidden ${tileAspect} cursor-pointer transition-all duration-300 border ${
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
                <span className="text-xs font-medium text-muted">{asset.label}</span>
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

type SlotState = {
  bg: string | null;
  pat: string | null;
  bgOpacity: number;
  patOpacity: number;
};

type HoveredAsset = { type: "bg" | "pat"; id: string | null };

const SLOT_LABEL: Record<"A" | "B", { tone: string; ring: string; chip: string }> = {
  A: {
    tone: "text-brand-cyan",
    ring: "ring-brand-cyan/30",
    chip: "bg-brand-cyan/10 border-brand-cyan/30",
  },
  B: {
    tone: "text-[#a855f7]",
    ring: "ring-[#a855f7]/30",
    chip: "bg-[#a855f7]/10 border-[#a855f7]/30",
  },
};

function SlotControls({
  slot,
  state,
  onChange,
  onHoverChange,
}: {
  slot: "A" | "B";
  state: SlotState;
  onChange: (next: Partial<SlotState>) => void;
  onHoverChange: (h: HoveredAsset | null) => void;
}) {
  const tone = SLOT_LABEL[slot];
  return (
    <div className={`rounded-xl border border-white/[0.06] bg-white/[0.015] p-4 space-y-4`}>
      <div className="flex items-center gap-2">
        <span
          className={`inline-flex h-6 w-6 items-center justify-center rounded-md border ${tone.chip} ${tone.tone} text-xs font-mono font-bold`}
        >
          {slot}
        </span>
        <span className="text-xs uppercase tracking-wider text-muted-dark">Slot {slot}</span>
      </div>

      {/* Background */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-medium text-muted">Background</h3>
          <OpacitySlider value={state.bgOpacity} onChange={(v) => onChange({ bgOpacity: v })} />
        </div>
        <div className="flex flex-wrap gap-1.5">
          <button
            onClick={() => onChange({ bg: null })}
            onMouseEnter={() => onHoverChange({ type: "bg", id: null })}
            onMouseLeave={() => onHoverChange(null)}
            className={`cursor-pointer px-3 py-1.5 rounded-full text-xs font-medium tracking-wide transition-all duration-200 border ${
              state.bg === null
                ? "border-white/20 bg-white/[0.08] text-white"
                : "border-white/[0.04] bg-white/[0.02] text-muted-dark hover:text-muted hover:border-white/10"
            }`}
          >
            None
          </button>
          {backgrounds.map((bg) => (
            <AssetPill
              key={bg.id}
              asset={bg}
              selected={state.bg === bg.id}
              onClick={() => onChange({ bg: bg.id })}
              onHoverStart={() => onHoverChange({ type: "bg", id: bg.id })}
              onHoverEnd={() => onHoverChange(null)}
            />
          ))}
        </div>
      </div>

      {/* Pattern */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-medium text-muted">Pattern</h3>
          <OpacitySlider value={state.patOpacity} onChange={(v) => onChange({ patOpacity: v })} />
        </div>
        <div className="flex flex-wrap gap-1.5">
          <button
            onClick={() => onChange({ pat: null })}
            onMouseEnter={() => onHoverChange({ type: "pat", id: null })}
            onMouseLeave={() => onHoverChange(null)}
            className={`cursor-pointer px-3 py-1.5 rounded-full text-xs font-medium tracking-wide transition-all duration-200 border ${
              state.pat === null
                ? "border-white/20 bg-white/[0.08] text-white"
                : "border-white/[0.04] bg-white/[0.02] text-muted-dark hover:text-muted hover:border-white/10"
            }`}
          >
            None
          </button>
          {patterns.map((pat) => (
            <AssetPill
              key={pat.id}
              asset={pat}
              selected={state.pat === pat.id}
              onClick={() => onChange({ pat: pat.id })}
              onHoverStart={() => onHoverChange({ type: "pat", id: pat.id })}
              onHoverEnd={() => onHoverChange(null)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function resolveSlotAssets(slot: SlotState, hovered: HoveredAsset | null) {
  const bgId = hovered?.type === "bg" ? hovered.id : slot.bg;
  const patId = hovered?.type === "pat" ? hovered.id : slot.pat;
  return {
    bg: bgId ? backgrounds.find((b) => b.id === bgId) ?? null : null,
    pat: patId ? patterns.find((p) => p.id === patId) ?? null : null,
  };
}

function CombineView() {
  const [compareMode, setCompareMode] = useState(false);
  const [slotA, setSlotA] = useState<SlotState>({
    bg: "circuit",
    pat: "hexgrid",
    bgOpacity: 0.15,
    patOpacity: 0.08,
  });
  const [slotB, setSlotB] = useState<SlotState>({
    bg: "mesh",
    pat: "topo",
    bgOpacity: 0.18,
    patOpacity: 0.06,
  });
  const [dividerPos, setDividerPos] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const [hoveredAsset, setHoveredAsset] = useState<HoveredAsset | null>(null);
  const previewRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isDragging) return;
    const onMove = (e: MouseEvent) => {
      const el = previewRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const pct = ((e.clientX - rect.left) / rect.width) * 100;
      setDividerPos(Math.max(8, Math.min(92, pct)));
    };
    const onUp = () => setIsDragging(false);
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
  }, [isDragging]);

  // Hover sync: a hovered pill previews on every visible panel.
  const a = resolveSlotAssets(slotA, hoveredAsset);
  const b = resolveSlotAssets(slotB, hoveredAsset);

  return (
    <div className="space-y-6">
      {/* Mode toggle */}
      <div className="flex items-center justify-between">
        <div className="text-xs text-muted-dark">
          {compareMode
            ? "Drag the divider to compare Slot A and Slot B side-by-side."
            : "Layer one background and pattern. Toggle compare to evaluate two combinations at once."}
        </div>
        <button
          onClick={() => setCompareMode((v) => !v)}
          className={`group flex items-center gap-2.5 px-3 py-1.5 rounded-full border text-xs font-medium tracking-wide transition-all duration-200 cursor-pointer ${
            compareMode
              ? "border-brand-cyan/30 bg-brand-cyan/10 text-brand-cyan"
              : "border-white/[0.06] bg-white/[0.02] text-muted-dark hover:text-muted hover:border-white/10"
          }`}
          aria-pressed={compareMode}
        >
          <span
            className={`relative inline-flex h-4 w-7 items-center rounded-full transition-colors ${
              compareMode ? "bg-brand-cyan/30" : "bg-white/10"
            }`}
          >
            <span
              className={`inline-block h-3 w-3 transform rounded-full transition-transform ${
                compareMode ? "translate-x-3.5 bg-brand-cyan" : "translate-x-0.5 bg-white/70"
              }`}
            />
          </span>
          Compare A/B
        </button>
      </div>

      {/* Live preview (single or split) */}
      <div
        ref={previewRef}
        className={`relative rounded-xl border border-white/[0.06] bg-background overflow-hidden aspect-[21/9] ${
          isDragging ? "select-none" : ""
        }`}
      >
        {/* Slot A panel — clipped to left in compare mode */}
        <div
          className="absolute inset-0"
          style={compareMode ? { clipPath: `inset(0 ${100 - dividerPos}% 0 0)` } : undefined}
        >
          {a.bg && <ImageLayer asset={a.bg} opacity={slotA.bgOpacity} />}
          {a.pat && <ImageLayer asset={a.pat} opacity={slotA.patOpacity} mode="tile" />}
        </div>

        {/* Slot B panel — clipped to right (compare mode only) */}
        {compareMode && (
          <div className="absolute inset-0" style={{ clipPath: `inset(0 0 0 ${dividerPos}%)` }}>
            {b.bg && <ImageLayer asset={b.bg} opacity={slotB.bgOpacity} />}
            {b.pat && <ImageLayer asset={b.pat} opacity={slotB.patOpacity} mode="tile" />}
          </div>
        )}

        {/* Sample content overlay */}
        <div className="absolute inset-0 flex flex-col items-center justify-center z-10 gap-4 p-8 pointer-events-none">
          <h2 className="text-2xl md:text-4xl font-bold tracking-tight text-foreground">
            Sample Page Content
          </h2>
          <p className="text-sm md:text-base text-muted-dark max-w-md text-center leading-relaxed">
            Preview how the selected background and pattern combine as page overlays. Adjust opacity sliders to fine-tune the visual treatment.
          </p>
          <div className="flex gap-3 mt-2">
            <span className="px-4 py-2 rounded-lg bg-brand-cyan/10 border border-brand-cyan/20 text-brand-cyan text-sm font-medium">
              Primary Action
            </span>
            <span className="px-4 py-2 rounded-lg bg-white/[0.04] border border-white/[0.06] text-muted text-sm">
              Secondary
            </span>
          </div>
        </div>

        {/* Slot badges */}
        {compareMode && (
          <>
            <div className="absolute top-3 left-3 z-20 px-2 py-1 rounded-md bg-black/50 backdrop-blur border border-brand-cyan/30 text-[10px] font-mono font-bold tracking-widest text-brand-cyan pointer-events-none">
              A
            </div>
            <div className="absolute top-3 right-3 z-20 px-2 py-1 rounded-md bg-black/50 backdrop-blur border border-[#a855f7]/30 text-[10px] font-mono font-bold tracking-widest text-[#a855f7] pointer-events-none">
              B
            </div>
            {hoveredAsset?.id && (
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-20 px-3 py-1 rounded-full bg-black/60 backdrop-blur border border-white/15 text-[10px] font-mono tracking-wider text-muted pointer-events-none">
                hovering: {hoveredAsset.type === "bg" ? "bg" : "pattern"} ·{" "}
                {(hoveredAsset.type === "bg" ? backgrounds : patterns).find(
                  (x) => x.id === hoveredAsset.id,
                )?.label ?? hoveredAsset.id}
              </div>
            )}
          </>
        )}

        {/* Divider handle */}
        {compareMode && (
          <div
            role="separator"
            aria-orientation="vertical"
            aria-valuenow={Math.round(dividerPos)}
            className="absolute top-0 bottom-0 z-30 cursor-ew-resize group"
            style={{ left: `${dividerPos}%`, transform: "translateX(-50%)", width: "28px" }}
            onMouseDown={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
          >
            <div
              className={`absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-px transition-colors ${
                isDragging ? "bg-brand-cyan" : "bg-white/30 group-hover:bg-brand-cyan/60"
              }`}
            />
            <div
              className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/60 backdrop-blur border flex items-center justify-center transition-colors ${
                isDragging
                  ? "border-brand-cyan/60"
                  : "border-white/20 group-hover:border-brand-cyan/40"
              }`}
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-muted"
              >
                <polyline points="9 6 3 12 9 18" />
                <polyline points="15 6 21 12 15 18" />
              </svg>
            </div>
          </div>
        )}
      </div>

      {/* Controls */}
      {compareMode ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <SlotControls slot="A" state={slotA} onChange={(c) => setSlotA((s) => ({ ...s, ...c }))} onHoverChange={setHoveredAsset} />
          <SlotControls slot="B" state={slotB} onChange={(c) => setSlotB((s) => ({ ...s, ...c }))} onHoverChange={setHoveredAsset} />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Background */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-muted">Background</h3>
              <OpacitySlider value={slotA.bgOpacity} onChange={(v) => setSlotA((s) => ({ ...s, bgOpacity: v }))} />
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setSlotA((s) => ({ ...s, bg: null }))}
                onMouseEnter={() => setHoveredAsset({ type: "bg", id: null })}
                onMouseLeave={() => setHoveredAsset(null)}
                className={`cursor-pointer px-3 py-1.5 rounded-full text-xs font-medium tracking-wide transition-all duration-200 border ${
                  slotA.bg === null
                    ? "border-white/20 bg-white/[0.08] text-white"
                    : "border-white/[0.04] bg-white/[0.02] text-muted-dark hover:text-muted hover:border-white/10"
                }`}
              >
                None
              </button>
              {backgrounds.map((bg) => (
                <AssetPill
                  key={bg.id}
                  asset={bg}
                  selected={slotA.bg === bg.id}
                  onClick={() => setSlotA((s) => ({ ...s, bg: bg.id }))}
                  onHoverStart={() => setHoveredAsset({ type: "bg", id: bg.id })}
                  onHoverEnd={() => setHoveredAsset(null)}
                />
              ))}
            </div>
          </div>

          {/* Pattern */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-muted">Pattern Overlay</h3>
              <OpacitySlider value={slotA.patOpacity} onChange={(v) => setSlotA((s) => ({ ...s, patOpacity: v }))} />
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setSlotA((s) => ({ ...s, pat: null }))}
                onMouseEnter={() => setHoveredAsset({ type: "pat", id: null })}
                onMouseLeave={() => setHoveredAsset(null)}
                className={`cursor-pointer px-3 py-1.5 rounded-full text-xs font-medium tracking-wide transition-all duration-200 border ${
                  slotA.pat === null
                    ? "border-white/20 bg-white/[0.08] text-white"
                    : "border-white/[0.04] bg-white/[0.02] text-muted-dark hover:text-muted hover:border-white/10"
                }`}
              >
                None
              </button>
              {patterns.map((pat) => (
                <AssetPill
                  key={pat.id}
                  asset={pat}
                  selected={slotA.pat === pat.id}
                  onClick={() => setSlotA((s) => ({ ...s, pat: pat.id }))}
                  onHoverStart={() => setHoveredAsset({ type: "pat", id: pat.id })}
                  onHoverEnd={() => setHoveredAsset(null)}
                />
              ))}
            </div>
          </div>
        </div>
      )}
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
              <p className="text-sm text-muted-dark max-w-lg mx-auto">
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
                    <h2 className="text-lg font-semibold text-muted">Background Scenes</h2>
                    <OpacitySlider value={bgOpacity} onChange={setBgOpacity} />
                  </div>
                  <div className="sticky top-24 z-20 bg-[var(--background)]/80 backdrop-blur-sm">
                    <PreviewCard asset={bgAsset} opacity={bgOpacity} label="background" />
                  </div>
                  <GalleryGrid items={backgrounds} selectedId={selectedBg} onSelect={setSelectedBg} opacity={bgOpacity} />
                </div>
              )}

              {tab === "patterns" && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg font-semibold text-muted">Decorative Patterns</h2>
                    <OpacitySlider value={patOpacity} onChange={setPatOpacity} />
                  </div>
                  <div className="sticky top-24 z-20 bg-[var(--background)]/80 backdrop-blur-sm">
                    <PreviewCard asset={patAsset} opacity={patOpacity} label="pattern" mode="tile" />
                  </div>
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
