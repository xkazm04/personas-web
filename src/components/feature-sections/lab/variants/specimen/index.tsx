"use client";

import type { LabVariantProps } from "../types";
import ChatPlate from "./ChatPlate";
import ArenaPlate from "./ArenaPlate";
import EvolutionPlate from "./EvolutionPlate";
import EvalPlate from "./EvalPlate";

/**
 * PROTOTYPE variant "Specimen": the persona as an organism under study, one
 * field-guide plate per Lab tab. Chat annotates a living cell (each applied
 * diff a grafted mutation), Arena cultures two strains under a split lens,
 * Evolution grows the phylogeny with the best lineage as a living vein, and
 * Eval swells a six-lobed membrane against its ancestor's ghost.
 */
export default function SpecimenVariant(props: LabVariantProps) {
  switch (props.active) {
    case "chat":
      return <ChatPlate {...props} />;
    case "arena":
      return <ArenaPlate {...props} />;
    case "evolution":
      return <EvolutionPlate {...props} />;
    case "eval":
      return <EvalPlate {...props} />;
  }
}
