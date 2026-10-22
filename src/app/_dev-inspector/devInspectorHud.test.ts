// The HUD has three renderings while armed over a mapped document: idle (no
// pointer target yet), hovering a stamped element, and hovering an element with
// no stamped ancestor. Idle and "no source" must not read the same, or an
// operator who is hovering is told the tool has not noticed them.
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { InspectorHud } from "./devInspectorUi";

const base = {
  copied: null,
  copyOk: true,
  mappingOn: true,
  crumbs: [],
  defaultLoc: null,
  onCopy: () => {},
};

const render = (extra: { unstamped: boolean }) =>
  renderToStaticMarkup(createElement(InspectorHud, { ...base, ...extra }));

describe("InspectorHud degradation states", () => {
  it("renders idle and hovering-an-unstamped-element differently", () => {
    expect(render({ unstamped: false })).not.toBe(render({ unstamped: true }));
  });

  it("names the absence and does not repeat the idle invitation", () => {
    const empty = render({ unstamped: true });
    expect(empty).toMatch(/No source/);
    expect(empty).not.toMatch(/Hover a component/);
  });

  it("keeps the unmapped banner ahead of both", () => {
    const off = renderToStaticMarkup(
      createElement(InspectorHud, { ...base, mappingOn: false, unstamped: true }),
    );
    expect(off).toMatch(/npm run dev:inspect/);
    expect(off).not.toMatch(/No source/);
  });
});
