"use client";

import BpApprove from "./BpApprove";
import BpHeal from "./BpHeal";
import BpLabel from "./BpLabel";
import BpMemory from "./BpMemory";
import BpPatch from "./BpPatch";
import BpTriggers from "./BpTriggers";
import { BpDefs } from "./bp-parts";
import "./blueprint-concepts.css";

/** The six concept figures as plotted line drawings: the blueprint skin's counterpart of the hardware set. */
export default function BlueprintConcepts() {
  return (
    <>
      <BpDefs />
      <div className="ln-ci-grid">
        <BpLabel />
        <BpPatch />
        <BpMemory />
        <BpHeal />
        <BpTriggers />
        <BpApprove />
      </div>
    </>
  );
}
