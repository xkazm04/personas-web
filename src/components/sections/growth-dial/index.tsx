"use client";

import { useTranslation } from "@/i18n/useTranslation";
import { LayersShell } from "./shared/Shell";
import { CompactList, useWide } from "./shared/Compact";
import { LAYERS } from "./shared/layers";
import LayersGrowthDial from "./Main";
import { COUNTS } from "./geometry";

/** How lab - Built to grow, V2 "Growth dial". Phones get the four stops as a list. */
export default function HowLabLayersV2() {
  const wide = useWide();
  const v = useTranslation().t.howSections.layers.v2;
  if (wide) return <LayersGrowthDial />;
  const items = LAYERS.map((l, i) => ({
    key: l.id,
    brand: l.brand,
    icon: l.icon,
    kicker: `${v.stops[i].when} · ${COUNTS[i]} ${COUNTS[i] === 1 ? v.agent : v.agents}`,
    title: v.stops[i].what,
    line: v.layerLines[l.id],
  }));
  return (
    <LayersShell lede={v.lede}>
      <CompactList label={v.scrubLabel} items={items} />
    </LayersShell>
  );
}
