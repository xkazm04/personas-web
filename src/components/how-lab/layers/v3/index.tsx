"use client";

import { useTranslation } from "@/i18n/useTranslation";
import { LayersShell } from "../shared/Shell";
import { CompactList, useWide } from "../shared/Compact";
import LayersZoom from "./Main";
import { LEVEL_LAYERS } from "./levels";

/** How lab - Built to grow, V3 "Zoom". Phones get the four levels as a list, task to computer. */
export default function HowLabLayersV3() {
  const wide = useWide();
  const c = useTranslation().t.howLab.layers;
  if (wide) return <LayersZoom />;
  const items = c.v3.levels.map((lv, k) => {
    const l = LEVEL_LAYERS[k];
    return { key: l.id, brand: l.brand, icon: l.icon, kicker: `0${k + 1} · ${c.names[l.id]}`, title: lv.name, line: lv.line };
  });
  return (
    <LayersShell lede={c.v3.lede}>
      <CompactList label={c.v3.pathLabel} items={items} />
    </LayersShell>
  );
}
