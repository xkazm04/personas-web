/**
 * PROTOTYPE copy for the Lab "Specimen" variant (English-only pending copy,
 * owner-approved territory). Folded into `src/i18n/pending/labSection.ts`
 * if this variant wins the review. {version} is a ledger version id, {node}
 * a genome specimen code, {n}/{total} are counts.
 */
export interface SpecimenCopy {
  species: string;
  plate: string;
  numerals: { chat: string; arena: string; evolution: string; eval: string };
  strain: string;
  nodeCode: string;
  chat: {
    title: string;
    observing: string;
    stable: string;
    you: string;
    assistant: string;
    mutation: string;
    rateLabel: string;
    rateBefore: string;
    rateAfter: string;
    phases: readonly [string, string, string, string];
    spines: string;
    wall: string;
    lensLabel: string;
  };
  arena: {
    title: string;
    trial: string;
    trialsLabel: string;
    medium: string;
    incubating: string;
    scored: string;
    survives: string;
    fades: string;
    tally: string;
    rating: string;
    noDelta: string;
    note: string;
    dishLabel: string;
  };
  evolution: {
    title: string;
    vein: string;
    withered: string;
    regrow: string;
    treeLabel: string;
  };
  eval: {
    title: string;
    strainVsAncestor: string;
    ghost: string;
    widest: string;
    thinnest: string;
    reassay: string;
    membraneLabel: string;
  };
}

export const specimenCopy: SpecimenCopy = {
  species: "Triagia vigilans",
  plate: "Pl.",
  numerals: { chat: "I", arena: "II", evolution: "III", eval: "IV" },
  strain: "strain {version}",
  nodeCode: "G{gen}·{branch}",
  chat: {
    title: "Culture notebook",
    observing: "grafting",
    stable: "culture stable",
    you: "Field note",
    assistant: "Lab assistant",
    mutation: "Mutation M{n}",
    rateLabel: "flagged urgent",
    rateBefore: "31%",
    rateAfter: "9.2%",
    phases: ["wild type", "M1 · spines trimmed", "M2 · wall grown", "replayed over 48h"],
    spines: "urgency spines",
    wall: "newsletter wall",
    lensLabel: "The persona under the lens: each grafted mutation reshapes the cell",
  },
  arena: {
    title: "Split-lens trial",
    trial: "Trial {n} of {total}",
    trialsLabel: "Pick a trial",
    medium: "Medium",
    incubating: "incubating…",
    scored: "scored",
    survives: "survives",
    fades: "fades",
    tally: "{n} of {total} survived",
    rating: "rating",
    noDelta: "baseline",
    note: "colony size = fitness score",
    dishLabel: "Two strains cultured on the same input; each colony is one trial, the glowing one survived it",
  },
  evolution: {
    title: "Phylogeny",
    vein: "living vein · best lineage",
    withered: "withered",
    regrow: "regrow culture",
    treeLabel: "Phylogenetic tree of the persona across generations, with the best lineage traced",
  },
  eval: {
    title: "Membrane assay",
    strainVsAncestor: "vs ancestor {node}",
    ghost: "ancestor membrane",
    widest: "widest swell",
    thinnest: "thinnest lobe",
    reassay: "re-assay",
    membraneLabel: "Six-lobed membrane: each lobe swells to its score against the ancestor's ghost membrane",
  },
};
