import { motion } from "framer-motion";
import { fadeUp } from "@/lib/animations";
import { BRAND_VAR, tint } from "@/lib/brand-theme";
import { areaOverall, type AreaDef } from "../areas";

/**
 * Shared card chrome for every roadmap-areas variant: icon chip, title,
 * caption, and the area's overall fulfillment in the header — variants only
 * swap the body visualization.
 */
export default function AreaCardShell({
  area,
  children,
}: {
  area: AreaDef;
  children: React.ReactNode;
}) {
  const Icon = area.icon;
  const overall = Math.round(areaOverall(area) * 100);

  return (
    // Self-driven (not inherited variants): these cards mount on demand when
    // the user switches variants, long after SectionWrapper's one-shot
    // hidden→visible pass — inherited variants would leave them stuck at
    // `hidden` (invisible). whileInView re-fires per mount.
    <motion.div
      variants={fadeUp}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      className={`rounded-2xl border border-glass bg-white/[0.02] p-5 backdrop-blur-sm ${
        area.wide ? "md:col-span-2" : ""
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
            style={{ backgroundColor: tint(area.brand, 10), color: BRAND_VAR[area.brand] }}
          >
            <Icon className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-foreground">{area.title}</h3>
            <p className="text-sm text-muted-dark">{area.caption}</p>
          </div>
        </div>
        <span
          className="shrink-0 font-mono text-lg font-bold tabular-nums"
          style={{ color: BRAND_VAR[area.brand], textShadow: `0 0 12px ${tint(area.brand, 45)}` }}
        >
          {overall}%
        </span>
      </div>
      {children}
    </motion.div>
  );
}
