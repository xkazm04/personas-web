import type { Dispatch } from "react";
import type { LabTab } from "../types";
import type { LedgerAction, LedgerState } from "../ledger";

/** PROTOTYPE contract: every Lab variant renders the body of the active tab
 *  from the same section-owned state. The switcher (VariantStrip) and the
 *  version rail stay in index.tsx. */
export interface LabVariantProps {
  active: LabTab;
  ledger: LedgerState;
  dispatch: Dispatch<LedgerAction>;
}
