import type { Dispatch } from "react";
import type { LabTab } from "../types";
import type { LedgerAction, LedgerState } from "../ledger";

/** What the bench reads from the section: the active tab and the one version
 *  ledger (with its dispatch). The tab switcher and the version rail stay in
 *  the section root (lab/index.tsx). */
export interface BenchProps {
  active: LabTab;
  ledger: LedgerState;
  dispatch: Dispatch<LedgerAction>;
}
