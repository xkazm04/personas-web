"use client";

import { useMemo, useRef } from "react";
import { FLEET, type FleetAgent } from "../fleet-data";
import type { Att } from "./Building";
import FloorField from "./FloorField";
import { layoutFloor } from "./floor-layout";
import { useFieldSize } from "./useFieldSize";
import type { CityCopy, OfficeCopy } from "./vocab";
import o from "./office.module.css";

interface FloorViewProps {
  scoped: FleetAgent[];
  city: CityCopy;
  copy: OfficeCopy;
  still: boolean;
  att: Att;
  simMs: number;
  setHover: (a: Att) => void;
  setFocus: (a: Att) => void;
  openAgent: (id: string, el: Element) => void;
  openTeam: (id: string) => void;
}

/** Office L0's field: measures itself and lays the floor out to its real size. */
export default function FloorView({ scoped, ...rest }: FloorViewProps) {
  const ref = useRef<HTMLDivElement>(null);
  const size = useFieldSize(ref);
  const F = useMemo(() => (size.w && size.h ? layoutFloor(scoped, FLEET.teams, size.w, size.h) : null), [scoped, size.w, size.h]);
  return (
    <div ref={ref} className={`${o.floor} absolute inset-0 overflow-hidden`}>
      {F && <FloorField F={F} {...rest} />}
    </div>
  );
}
