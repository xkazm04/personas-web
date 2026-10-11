/**
 * Single registry of votable feature ids. Every server allowlist (votes,
 * boosts, comments) and the client card list (`feature-voting/data.ts`)
 * derive from this tuple. Promoting a feature = one entry here plus its
 * i18n copy (`featureVoting.features[id]`) and an illustration slot.
 */
export const FEATURE_IDS = ["macos", "dashboard", "enterprise"] as const;

export type FeatureId = (typeof FEATURE_IDS)[number];

export const ALLOWED_FEATURES: ReadonlySet<string> = new Set(FEATURE_IDS);
