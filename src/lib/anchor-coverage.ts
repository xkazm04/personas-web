/* ── Anchor coverage: declared vocabulary vs hosts on the live page ──
 *
 * A page declares the locations it offers (`scrollMapItems`: scroll-map dots,
 * mobile TOC, coaching steps). The page hosts some set of elements. Nothing
 * kept the two in agreement: a renamed section left a dot that highlights
 * nothing, with no error anywhere.
 *
 * Pure on purpose (no DOM): the caller passes `hosts`, a predicate answering
 * "does the LIVE document hold this address", so the same comparison runs in
 * the dev-time guard (`useAnchorCoverageGuard`) and in node tests. It reports
 * and never throws; the repair is the anchor, never deleting the declaration.
 */

export interface AnchorGaps {
  /** Declared addresses no host answers: almost always a rename that updated
   *  the markup and not the vocabulary (the dead dot). */
  declaredWithoutHost: string[];
  /** Hosts nobody declared: dead wrapper, or a section readers cannot reach by name. */
  hostedWithoutDeclaration: string[];
}

export function findAnchorGaps(
  declared: readonly string[],
  hosts: (id: string) => boolean,
  hostedIds: readonly string[] = [],
): AnchorGaps {
  const declaredSet = new Set(declared);
  return {
    declaredWithoutHost: [...declaredSet].filter((id) => !hosts(id)),
    hostedWithoutDeclaration: [...new Set(hostedIds)].filter((id) => !declaredSet.has(id)),
  };
}

/** One message per direction, naming the address, the consumer and the page,
 *  because the person who sees it is usually not the one who caused it. */
export function describeAnchorGaps(gaps: AnchorGaps, consumer: string, page: string): string[] {
  return [
    ...gaps.declaredWithoutHost.map(
      (id) => `[anchor-coverage] ${consumer} declares "${id}", which no element on ${page} hosts. Restore the anchor; do not delete the entry.`,
    ),
    ...gaps.hostedWithoutDeclaration.map(
      (id) => `[anchor-coverage] ${page} hosts data-scroll-anchor="${id}", which ${consumer} does not declare: dead markup, or a section readers cannot reach by name.`,
    ),
  ];
}
