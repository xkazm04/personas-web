// ---------------------------------------------------------------------------
// PersonaSpec parsers — the web's reader for the desktop's living Core.
//
// `synced_personas.core_profile` carries the desktop's `PersonaCore` JSON
// (personas: src-tauri/core/src/models/deliberation.rs, camelCase). The desktop
// owns that shape, so this module consumes it as a versioned contract and
// never invents fields: anything absent stays absent (null / empty), and a
// blob that is not an object is "no Core", not an error.
//
// Tolerance mirrors the Rust side: every field defaults, so a prose-only or
// legacy dial-only blob still yields whatever it did carry.
// ---------------------------------------------------------------------------

/** Bump when the desktop changes the Core's field names or meaning. */
export const PERSONA_CORE_CONTRACT_VERSION = 1;

export type ConflictStyle = "challenger" | "harmonizer" | "analyst" | "pragmatist";

const CONFLICT_STYLES: readonly string[] = ["challenger", "harmonizer", "analyst", "pragmatist"];

export interface PersonaCoreProfile {
  motivation: string;
  stance: string;
  northStarCommitment: string;
  /** Null when the blob names no recognised style (legacy blobs carry ""). */
  conflictStyle: ConflictStyle | null;
  identity: string | null;
  voice: string | null;
  principles: string[];
  constraints: string[];
  decisionPrinciples: string[];
}

function str(v: unknown): string {
  return typeof v === "string" ? v.trim() : "";
}

function optStr(v: unknown): string | null {
  const s = str(v);
  return s === "" ? null : s;
}

function strList(v: unknown): string[] {
  if (!Array.isArray(v)) return [];
  return v.filter((x): x is string => typeof x === "string").map((x) => x.trim()).filter(Boolean);
}

/**
 * Parse `synced_personas.core_profile` (a JSON string, or an already-parsed
 * object) into the Core the web renders. Returns null when there is no usable
 * Core: null/empty/malformed input, or a blob with none of the known content.
 */
export function parseCoreProfile(raw: unknown): PersonaCoreProfile | null {
  let value: unknown = raw;
  if (typeof raw === "string") {
    if (raw.trim() === "") return null;
    try {
      value = JSON.parse(raw);
    } catch {
      return null;
    }
  }
  if (value === null || typeof value !== "object" || Array.isArray(value)) return null;
  const o = value as Record<string, unknown>;

  const style = str(o.conflictStyle);
  const core: PersonaCoreProfile = {
    motivation: str(o.motivation),
    stance: str(o.stance),
    northStarCommitment: str(o.northStarCommitment),
    conflictStyle: CONFLICT_STYLES.includes(style) ? (style as ConflictStyle) : null,
    identity: optStr(o.identity),
    voice: optStr(o.voice),
    principles: strList(o.principles),
    constraints: strList(o.constraints),
    decisionPrinciples: strList(o.decisionPrinciples),
  };

  const hasContent =
    core.motivation !== "" ||
    core.stance !== "" ||
    core.northStarCommitment !== "" ||
    core.conflictStyle !== null ||
    core.identity !== null ||
    core.voice !== null ||
    core.principles.length > 0 ||
    core.constraints.length > 0 ||
    core.decisionPrinciples.length > 0;
  return hasContent ? core : null;
}
