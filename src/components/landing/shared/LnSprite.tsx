import { LN_SPRITE_SYMBOLS } from "./sprite-data";

/**
 * The landing's SVG symbol sprite (glyphs, key icons, step icons), rendered
 * once by `LandingSkinScope`. Static, trusted markup generated at build time
 * from `sprite-data.ts`; consumers reference it through `<LnIcon id=... />`.
 */
export default function LnSprite() {
  return (
    <svg
      width="0"
      height="0"
      aria-hidden="true"
      focusable="false"
      style={{ position: "absolute" }}
      dangerouslySetInnerHTML={{ __html: `<defs>${LN_SPRITE_SYMBOLS}</defs>` }}
    />
  );
}
