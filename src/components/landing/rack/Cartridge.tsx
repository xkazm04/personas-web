import type { CSSProperties } from "react";
import "./Cartridge.css";
import LnIcon from "../shared/LnIcon";
import { colorVar, type PersonaColor } from "./data";
import type { LnSpriteId } from "../shared/sprite-data";

/**
 * An example persona as a coloured card: two reels, a window and a
 * handwritten label. Purely presentational (no hooks): the reels spin when an
 * ancestor carries `ln-running` inside an `ln-live` scope, so the parent owns
 * the "is it alive" decision. `index` is a two-digit position such as "01".
 */
export default function Cartridge({
  name,
  label,
  glyph,
  color,
  index,
  className,
}: {
  name: string;
  label: string;
  glyph: LnSpriteId;
  color: PersonaColor;
  index: string;
  className?: string;
}) {
  return (
    <div
      className={["ln-cart", className].filter(Boolean).join(" ")}
      style={{ "--ln-c": colorVar(color) } as CSSProperties}
    >
      <i className="ln-cart-grip" />
      <div className="ln-cart-win">
        <i className="ln-pack ln-l" />
        <i className="ln-pack ln-r" />
        <i className="ln-tape" />
        <i className="ln-reel ln-l" />
        <i className="ln-reel ln-r" />
        <i className="ln-glass" />
      </div>
      <div className="ln-cart-label ln-paper">
        <div className="ln-cl-top">
          <span>{index}</span>
          <b>{name}</b>
        </div>
        <p className="ln-cl-hand">{label}</p>
        <LnIcon id={glyph} className="ln-cl-pic" />
      </div>
      <i className="ln-cart-screw ln-a" />
      <i className="ln-cart-screw ln-b" />
    </div>
  );
}
