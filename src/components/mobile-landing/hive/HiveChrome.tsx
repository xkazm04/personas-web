"use client";

import Image from "next/image";
import { useSwap } from "./useSwap";
import { fill, type MobileLandingCopy } from "./useHiveCopy";

interface Props {
  m: MobileLandingCopy;
  cur: number;
  still: boolean;
  inert: boolean;
  onGo: (i: number) => void;
}

const PIP = "20,12 16,18.9 8,18.9 4,12 8,5.1 16,5.1";
const chapterText = (m: MobileLandingCopy, i: number) => `${String(i + 1).padStart(2, "0")} ${m.chapters[i]}`;

/**
 * The film's chrome: the brand (back to the start), the current chapter's name, and the hex-pip
 * rail. The winner's own light/dark toggle is gone: the page follows the site's theme.
 */
export default function HiveChrome({ m, cur, still, inert, onGo }: Props) {
  const [chap, swapping] = useSwap(chapterText(m, cur), 160, still);
  return (
    <>
      <header className="topbar" inert={inert} aria-hidden={inert || undefined}>
        <a
          className="brand"
          href="#s1"
          aria-label={m.brandHome}
          data-role="m-brand"
          onClick={(e) => {
            e.preventDefault();
            onGo(0);
          }}
        >
          <Image src="/icons/icon-192.png" alt="" width={30} height={30} />
          <span>{m.brand}</span>
        </a>
        <span className={`chap${swapping ? " sw" : ""}`} aria-hidden="true" data-role="m-chap">
          {chap}
        </span>
      </header>
      <nav className="rail" aria-label={m.railLabel} style={{ "--i": cur } as React.CSSProperties} inert={inert} aria-hidden={inert || undefined}>
        {m.chapters.map((name, i) => (
          <button
            key={name}
            className="pip"
            type="button"
            aria-label={fill(m.chapterLabel, { n: i + 1, name })}
            aria-current={i === cur ? "true" : undefined}
            data-role="m-pip"
            onClick={() => onGo(i)}
          >
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <polygon points={PIP} />
            </svg>
          </button>
        ))}
      </nav>
    </>
  );
}
