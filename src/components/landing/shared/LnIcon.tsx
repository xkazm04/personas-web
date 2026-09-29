import type { SVGProps } from "react";
import type { LnSpriteId } from "./sprite-data";

/** A glyph from the landing sprite. Decorative unless a `title` is passed. */
export default function LnIcon({
  id,
  title,
  ...rest
}: { id: LnSpriteId; title?: string } & Omit<SVGProps<SVGSVGElement>, "id">) {
  return (
    <svg aria-hidden={title ? undefined : true} role={title ? "img" : undefined} {...rest}>
      {title ? <title>{title}</title> : null}
      <use href={`#ln-${id}`} />
    </svg>
  );
}
