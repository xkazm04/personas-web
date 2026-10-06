"use client";

import { useTranslation } from "@/i18n/useTranslation";
import { LayersShell } from "../shared/Shell";
import { CompactList, useWide } from "../shared/Compact";
import { LAYERS } from "../shared/layers";
import LayersLitStack from "./Main";

/** How lab - Built to grow, V1 "Lit stack". Phones get the layers as a stacked list, top layer first. */
export default function HowLabLayersV1() {
  const wide = useWide();
  const c = useTranslation().t.howLab.layers;
  if (wide) return <LayersLitStack />;
  const items = [...LAYERS].reverse().map((l) => ({
    key: l.id,
    brand: l.brand,
    icon: l.icon,
    kicker: c.names[l.id],
    title: c.v1.layers[l.id].title,
    line: c.v1.layers[l.id].line,
  }));
  return (
    <LayersShell lede={c.v1.lede}>
      <CompactList label={c.v1.railLabel} items={items} />
    </LayersShell>
  );
}
