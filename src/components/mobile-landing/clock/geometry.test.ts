import { describe, expect, it } from "vitest";
import { CTA_HOUR, FAQ_HOUR, beatAt, buildKeys, chapterOpacity, cullLabel, dominantChapter, hhmm, hourAt, skyAt, stageLeave, type Timeline } from "./geometry";
import { MOMENT_HOURS, PRICE_HOURS, TOOLS } from "./data";

// A 844px phone column: the six spacers in cqh from clock.module.css (100, 273, 45, 172, 35, 160).
const H = 844;
const SP = [100, 273, 45, 172, 35, 160].map((v) => (v * H) / 100);
function timeline(): Timeline {
  const win = [];
  let top = H; // the sticky stage (100cqh) sits above the first spacer
  for (const h of SP) {
    win.push({ s: top - H, e: top + h - H });
    top += h;
  }
  const faqTop = top;
  const ctaTop = faqTop + 1500;
  return { H, win, faqTop, ctaTop, ctaHeight: 1400, max: ctaTop + 1400 + 400 - H };
}

describe("the day's timeline", () => {
  const tl = timeline();
  const keys = buildKeys(tl, TOOLS.map((t) => t.hour), MOMENT_HOURS, PRICE_HOURS);

  it("starts at 09:00 and walks the tool shifts in order", () => {
    expect(hhmm(hourAt(keys, 0))).toBe("09:00");
    const w = tl.win[1];
    const B = (w.e - w.s) / TOOLS.length;
    TOOLS.forEach((t, i) => expect(hourAt(keys, w.s + i * B + 1)).toBeCloseTo(t.hour, 1));
  });

  it("reads 21:00 at the FAQ and 23:00 at the CTA, matching their big clocks", () => {
    expect(hhmm(hourAt(keys, tl.faqTop - 0.1 * H))).toBe(hhmm(FAQ_HOUR));
    expect(hhmm(FAQ_HOUR)).toBe("21:00");
    expect(hhmm(hourAt(keys, tl.ctaTop + (1400 - H) / 2))).toBe(hhmm(CTA_HOUR));
    expect(hhmm(CTA_HOUR)).toBe("23:00");
  });

  it("only ever turns forward", () => {
    let prev = -Infinity;
    for (let x = 0; x <= tl.max; x += 17) {
      const h = hourAt(keys, x);
      expect(h).toBeGreaterThanOrEqual(prev - 1e-9);
      prev = h;
    }
  });
});

describe("the stage hands over to the FAQ", () => {
  const tl = timeline();
  const unpin = tl.win[5].e;

  it("is whole while pinned and gone before the FAQ reaches mid-screen", () => {
    expect(stageLeave(tl.win, H, unpin - 0.2 * H)).toBe(1);
    // The FAQ's top is at the bottom of the screen at the unpin and rises one px per px scrolled.
    const faqAtMid = tl.faqTop - 0.5 * H;
    expect(stageLeave(tl.win, H, faqAtMid)).toBe(0);
    expect(stageLeave(tl.win, H, unpin + 0.3 * H)).toBe(0);
  });

  it("keeps the pricing chapter as the stage's owner up to the unpin", () => {
    expect(dominantChapter(tl.win, H, unpin)).toBe(3);
    expect(chapterOpacity(tl.win, H, unpin)[3]).toBe(1);
  });
});

describe("beats", () => {
  it("holds each beat, then hands to the next past the hold", () => {
    const w = { s: 0, e: 400 };
    expect(beatAt(w, 4, 10).shown).toBe(0);
    expect(beatAt(w, 4, 95).shown).toBe(1);
    expect(beatAt(w, 4, 399).shown).toBe(3);
  });
});

describe("labels on the turning dial", () => {
  it("hide on the lower half of the face", () => {
    expect(cullLabel(12, 0, 260, 15, 1, 195, false)).toBe(true);
    expect(cullLabel(0, 0, 260, 15, 1, 195, false)).toBe(false);
  });
  it("hide past the column's edge", () => {
    // 3 o'clock sits 260 units right of centre; at 1px per unit that is past a 195px half-column.
    expect(cullLabel(3, 0, 260, 15, 1, 195, false)).toBe(true);
    expect(cullLabel(3, 0, 260, 15, 0.5, 195, false)).toBe(false);
  });
});

describe("the sky", () => {
  it("is night at midnight, day at noon, and warm at dawn and dusk", () => {
    expect(skyAt(0).night).toBe(1);
    expect(skyAt(12).day).toBe(1);
    expect(skyAt(6.6).dawn).toBeGreaterThan(0.9);
    expect(skyAt(18.8).dusk).toBeGreaterThan(0.9);
  });
});
