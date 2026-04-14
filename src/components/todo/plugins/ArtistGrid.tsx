"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { Image as ImageIcon, Sparkles } from "lucide-react";

/* ── Artist · Style Grid with Leonardo illustrations ── */

interface StyleTile {
  label: string;
  color: string;
  image: string;
}

const TILES: StyleTile[] = [
  { label: "Cinematic", color: "#ec4899", image: "/imgs/features/plugins/artist/cinematic.png" },
  { label: "Sketch", color: "#f472b6", image: "/imgs/features/plugins/artist/sketch.png" },
  { label: "3D Render", color: "#c084fc", image: "/imgs/features/plugins/artist/3d.png" },
  { label: "Pixel", color: "#e879f9", image: "/imgs/features/plugins/artist/pixel.png" },
  { label: "Watercolor", color: "#f9a8d4", image: "/imgs/features/plugins/artist/watercolor.png" },
  { label: "Glass", color: "#d8b4fe", image: "/imgs/features/plugins/artist/glass.png" },
];

function StyleTileCard({ tile, i }: { tile: StyleTile; i: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.92 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      transition={{ delay: i * 0.08, duration: 0.45, ease: "easeOut" }}
      whileHover={{ y: -2, scale: 1.02 }}
      className="group relative aspect-square rounded-xl overflow-hidden border cursor-pointer"
      style={{ borderColor: `${tile.color}40` }}
    >
      {/* Leonardo illustration */}
      <Image
        src={tile.image}
        alt=""
        fill
        sizes="(min-width: 1024px) 180px, (min-width: 640px) 33vw, 50vw"
        className="object-cover transition-all duration-700 group-hover:scale-[1.08]"
        aria-hidden="true"
      />
      {/* Bottom gradient scrim for label legibility */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "linear-gradient(180deg, transparent 40%, rgba(0,0,0,0.55) 75%, rgba(0,0,0,0.9) 100%)",
        }}
      />
      {/* Color accent edge */}
      <div
        className="absolute inset-0 pointer-events-none opacity-0 transition-opacity duration-500 group-hover:opacity-100"
        style={{
          boxShadow: `inset 0 0 40px ${tile.color}60`,
        }}
      />

      {/* Label */}
      <div className="absolute bottom-2 left-2.5 right-2.5 flex items-center justify-between">
        <span className="text-base font-mono uppercase tracking-widest font-bold text-foreground drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]">
          {tile.label}
        </span>
        <span
          className="inline-block h-2 w-2 rounded-full shadow-[0_0_8px_currentColor]"
          style={{ backgroundColor: tile.color, color: tile.color }}
        />
      </div>
    </motion.div>
  );
}

export default function ArtistGrid() {
  return (
    <div className="grid md:grid-cols-[1fr_260px] gap-4 p-5">
      <div>
        <div className="flex items-center gap-2 mb-3 text-base font-mono uppercase tracking-widest text-foreground/65">
          <ImageIcon className="h-4 w-4" />
          Creative Studio · 6 styles
        </div>
        <div className="grid grid-cols-3 gap-2">
          {TILES.map((tile, i) => (
            <StyleTileCard key={tile.label} tile={tile} i={i} />
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <div className="text-base font-mono uppercase tracking-widest text-foreground/65 mb-1">
          Prompt
        </div>
        <div className="rounded-lg border border-foreground/[0.08] bg-foreground/[0.02] px-3 py-2.5 font-mono text-base text-foreground/85 leading-relaxed min-h-[96px]">
          A cinematic shot of a cyberpunk alley at dusk, neon reflections on wet pavement, volumetric light.
        </div>

        {/* Style badge */}
        <motion.div
          initial={{ opacity: 0, x: 6 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
          className="flex items-center gap-2 rounded-lg border border-pink-400/30 bg-pink-500/[0.08] px-3 py-2"
        >
          <Sparkles className="h-4 w-4 text-pink-300" />
          <div className="min-w-0 flex-1">
            <div className="text-base font-mono font-bold text-pink-200">
              Cinematic
            </div>
            <div className="text-base font-mono text-foreground/55">
              1 of 6 selected
            </div>
          </div>
        </motion.div>

        <div className="mt-auto rounded-lg border border-pink-400/25 bg-pink-500/[0.06] px-3 py-2.5">
          <div className="text-base font-mono uppercase tracking-widest text-pink-300/80 mb-0.5">
            Engine
          </div>
          <div className="text-base font-mono text-pink-200">
            Lucid Origin · 1024×1024
          </div>
          <div className="text-base font-mono text-foreground/55 mt-0.5">
            ~8s per render
          </div>
        </div>
      </div>
    </div>
  );
}
