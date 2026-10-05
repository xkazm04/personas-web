"use client";

import { motion } from "framer-motion";
import { BRAND_VAR } from "@/lib/brand-theme";
import type { LabPlugin, LabPluginKey } from "../shared/roster";
import { CENTER, PLATE, SCENE, TILE, TILE_AT, Z_COLLAPSED, Z_EXPLODED } from "./geometry";
import Plate from "./Plate";
import { AgentsLayer, ConnectorsLayer, PluginsLayer } from "./LayerContents";

/**
 * The exploded view: three plates in one isometric camera. They arrive
 * stacked and spring apart once (the reveal), then a column of light stands
 * on the chosen plugin from your agents to your tools, with a ring rising
 * up it - work leaving an agent, passing through the plugin, reaching out.
 */
export default function IsoStack({
  plugins,
  active,
  exploded,
  lit,
  run,
  still,
}: {
  plugins: LabPlugin[];
  active: LabPluginKey;
  exploded: boolean;
  lit: ReadonlySet<number>;
  run: boolean;
  still: boolean;
}) {
  const z = exploded ? Z_EXPLODED : Z_COLLAPSED;
  const plugin = plugins.find((p) => p.key === active) ?? plugins[0];
  const c = BRAND_VAR[plugin.brand];
  const at = TILE_AT[active];
  const cx = at.x + TILE / 2;
  const cy = at.y + TILE / 2;
  const top = Z_EXPLODED.connectors;
  return (
    <div
      aria-hidden="true"
      className="absolute"
      style={{ left: CENTER.x - PLATE / 2, top: CENTER.y - PLATE / 2, width: PLATE, height: PLATE, transform: SCENE, transformStyle: "preserve-3d" }}
    >
      <Plate z={z.agents} tone="var(--brand-cyan)" still={still} delay={0}>
        <AgentsLayer />
      </Plate>
      <Plate z={z.plugins} tone="var(--brand-purple)" still={still} delay={0.1}>
        <PluginsLayer plugins={plugins} active={active} still={still} />
      </Plate>
      <Plate z={z.connectors} tone="var(--brand-emerald)" still={still} delay={0.2}>
        <ConnectorsLayer lit={lit} />
      </Plate>

      {/* the column of light, standing on the chosen plugin */}
      <motion.div
        className="absolute"
        style={{
          left: cx - 4,
          top: cy - top,
          width: 8,
          height: top,
          transformOrigin: "50% 100%",
          background: `linear-gradient(0deg, color-mix(in srgb, ${c} 10%, transparent), ${c} 50%, color-mix(in srgb, ${c} 10%, transparent))`,
          boxShadow: `0 0 22px ${c}`,
          borderRadius: 4,
        }}
        initial={false}
        animate={{ rotateX: -90, opacity: exploded ? 0.85 : 0 }}
        transition={{ duration: still ? 0 : 0.5, delay: still ? 0 : 0.6 }}
      />
      {/* a ring of light rising through the layers */}
      <motion.div
        className="absolute rounded-full border-2"
        style={{ left: cx - 30, top: cy - 30, width: 60, height: 60, borderColor: c, boxShadow: `0 0 20px ${c}, inset 0 0 14px ${c}` }}
        initial={false}
        animate={run && exploded ? { z: [0, top], opacity: [0, 1, 1, 0] } : { z: Z_EXPLODED.plugins + 40, opacity: still ? 0.9 : 0 }}
        transition={run && exploded ? { duration: 2.4, repeat: Infinity, ease: "easeInOut", times: [0, 0.15, 0.8, 1] } : { duration: 0 }}
      />
    </div>
  );
}
