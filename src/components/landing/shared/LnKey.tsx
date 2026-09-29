import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from "react";
import type { LnSpriteId } from "./sprite-data";
import LnIcon from "./LnIcon";

type Tone = "plain" | "signal" | "dark";
type Size = "sm" | "md" | "lg";

interface Common {
  tone?: Tone;
  size?: Size;
  icon?: LnSpriteId;
  children: ReactNode;
  className?: string;
}

function keyClass({ tone = "plain", size = "md", className }: Pick<Common, "tone" | "size" | "className">) {
  return [
    "ln-key",
    tone === "signal" && "ln-key--orange",
    tone === "dark" && "ln-key--black",
    size === "lg" && "ln-key--big",
    size === "sm" && "ln-key--sm",
    className,
  ]
    .filter(Boolean)
    .join(" ");
}

/** A raised, pressable key. Renders an anchor when `href` is given, else a button. */
export function LnKeyButton({
  tone,
  size,
  icon,
  children,
  className,
  ...rest
}: Common & ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button type="button" className={keyClass({ tone, size, className })} {...rest}>
      {icon ? <LnIcon id={icon} /> : null}
      {children}
    </button>
  );
}

export function LnKeyLink({
  tone,
  size,
  icon,
  children,
  className,
  ...rest
}: Common & AnchorHTMLAttributes<HTMLAnchorElement>) {
  return (
    <a className={keyClass({ tone, size, className })} {...rest}>
      {icon ? <LnIcon id={icon} /> : null}
      {children}
    </a>
  );
}
