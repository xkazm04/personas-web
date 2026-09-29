import type { CSSProperties, Ref } from "react";
import { useTranslation } from "@/i18n/useTranslation";
import { SITE_VERSION } from "@/lib/release";
import LnIcon from "../shared/LnIcon";

const CART_TINT = { "--ln-c": "var(--ln-c-sky)" } as CSSProperties;
const GRILLE = { position: "absolute", left: "4em", top: "6em", width: "26em", height: "14em" } as CSSProperties;
const SCREEN = { position: "absolute", left: "33em", top: "4em", width: "43em", height: "17em" } as CSSProperties;

/** A cartridge: drawn only, its printed label carries no readable text at this size. */
function Cart() {
  return (
    <div className="ln-cart" style={CART_TINT}>
      <i className="ln-cart-grip" />
      <div className="ln-cart-win">
        <i className="ln-pack ln-l" />
        <i className="ln-pack ln-r" />
        <i className="ln-tape" />
        <i className="ln-reel ln-l" />
        <i className="ln-reel ln-r" />
        <i className="ln-glass" />
      </div>
      <div className="ln-cart-label">
        <div className="ln-cl-top" />
        <LnIcon id="p-ribbon" className="ln-cl-pic" />
      </div>
      <i className="ln-cart-screw ln-a" />
      <i className="ln-cart-screw ln-b" />
    </div>
  );
}

/** The box: a base with foam, the product lying in it and a lid that lifts once. */
export default function DownloadBox({ open, figureRef }: { open: boolean; figureRef: Ref<HTMLElement> }) {
  const { t } = useTranslation();
  const n = t.landingNext.download;
  return (
    <figure ref={figureRef} className={`ln-box${open ? " ln-open" : ""}`} style={{ margin: 0 }} role="img" aria-label={n.figureLabel}>
      <div className="ln-box-base" />
      <div className="ln-box-foam" />
      <div className="ln-box-deck" aria-hidden="true">
        <div className="ln-rig" style={{ height: "60em" }}>
          <div className="ln-rig-slot" />
          <div className="ln-rig-bay">
            <Cart />
          </div>
          <div className="ln-deck">
            <i className="ln-screw ln-s1" />
            <i className="ln-screw ln-s2" />
            <i className="ln-screw ln-s3" />
            <i className="ln-screw ln-s4" />
            <div className="ln-grille" style={GRILLE} />
            <div className="ln-lcd" style={SCREEN} />
            <div className="ln-dial" style={{ right: "5em", top: "22em" }}>
              <i />
            </div>
          </div>
        </div>
      </div>
      <div className="ln-box-lid" aria-hidden="true">
        <div className="ln-lid-mark">
          <LnIcon id="mark" />
          <b>personas</b>
        </div>
        <div className="ln-lid-tag">
          {n.lidTag}
          <em>.</em>
        </div>
        <div className="ln-silk">
          <span>{n.lidDesktop}</span>
          <span>v{SITE_VERSION}</span>
        </div>
      </div>
      <figcaption className="ln-caption" style={{ position: "absolute", right: "4rem", bottom: 0 }}>
        {n.caption}
      </figcaption>
    </figure>
  );
}
