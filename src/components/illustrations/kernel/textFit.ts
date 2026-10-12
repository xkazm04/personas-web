/**
 * Width estimate for SVG <text> in the monospace eyebrow ramp, used to decide
 * whether a translated label needs squeezing to fit its slot. Wide (CJK / fullwidth)
 * glyphs take a full em; everything else a monospace advance of ~0.6em. It is an
 * estimate on purpose: the real advance depends on the font that loaded, and the
 * only question asked of it is "can this plausibly overflow?".
 */
const MONO_ADVANCE_EM = 0.6;

function isWide(codePoint: number): boolean {
  return (
    (codePoint >= 0x1100 && codePoint <= 0x11ff) ||
    (codePoint >= 0x2e80 && codePoint <= 0xa4cf) ||
    (codePoint >= 0xac00 && codePoint <= 0xd7af) ||
    (codePoint >= 0xf900 && codePoint <= 0xfaff) ||
    (codePoint >= 0xff00 && codePoint <= 0xffef)
  );
}

export function estimateTextWidth(text: string, fontSize: number): number {
  let em = 0;
  for (const ch of text) em += isWide(ch.codePointAt(0) ?? 0) ? 1 : MONO_ADVANCE_EM;
  return em * fontSize;
}

/** `textLength` to apply, or undefined when the text already fits `maxWidth`. */
export function fitTextLength(text: string, fontSize: number, maxWidth: number): number | undefined {
  return estimateTextWidth(text, fontSize) > maxWidth ? maxWidth : undefined;
}
