import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { MOCK_SLA_BREACHES } from "./mock-dashboard-data";

// Imported lazily inside each case so the source-scan guard below runs whether
// or not the module exists yet.
const threads = () => import("./incidentThreads");

const SRC = path.resolve(__dirname, "..");
const read = (rel: string) => readFileSync(path.join(SRC, rel), "utf8");
const hrefs = (links: { href: string }[]) => links.map((l) => l.href);

describe("buildIncidentThreads", () => {
  it("joins the Slack circuit-break's four fragments into one thread", async () => {
    const { buildIncidentThreads, DEMO_INCIDENT_FIXTURES } = await threads();
    const all = buildIncidentThreads(DEMO_INCIDENT_FIXTURES);
    const slack = all.find((t) => t.members.some((m) => m.id === "in_slack"));
    expect(slack?.members.map((m) => m.id)).toEqual(
      expect.arrayContaining(["in_slack", "hi_2", "br_1", "sla_5"]),
    );
  });

  it("keeps every member that has a persona on ONE persona (fixture self-consistency)", async () => {
    const { DEMO_THREADS } = await threads();
    expect(DEMO_THREADS.length).toBeGreaterThan(0);
    for (const thread of DEMO_THREADS) {
      const personas = new Set(thread.members.map((m) => m.persona).filter((p) => p !== null));
      expect(personas.size, thread.key).toBe(1);
    }
  });
});

describe("relatedTo", () => {
  it("links a breach to its other-route siblings in fixed route order", async () => {
    const { relatedTo, DEMO_THREADS } = await threads();
    expect(hrefs(relatedTo(DEMO_THREADS, "br_1"))).toEqual([
      "/dashboard/observability?focus=hi_2",
      "/dashboard/health?focus=in_slack",
    ]);
  });

  it("fabricates no link for an uncaused or unknown id", async () => {
    const { relatedTo, DEMO_THREADS } = await threads();
    expect(relatedTo(DEMO_THREADS, "hi_6")).toEqual([]);
    expect(relatedTo(DEMO_THREADS, "nope")).toEqual([]);
  });

  it("emits only hrefs that land on a real route and a known fixture id", async () => {
    const { relatedTo, DEMO_THREADS, DEMO_FOCUS_IDS } = await threads();
    const emitted = DEMO_THREADS.flatMap((t) => t.members.flatMap((m) => relatedTo(DEMO_THREADS, m.id)));
    expect(emitted.length).toBeGreaterThan(0);
    for (const link of emitted) {
      const url = new URL(link.href, "https://x.test");
      expect(existsSync(path.join(SRC, "app", url.pathname, "page.tsx")), link.href).toBe(true);
      expect(DEMO_FOCUS_IDS.has(url.searchParams.get("focus") ?? ""), link.href).toBe(true);
    }
  });
});

describe("relatedWithinSla", () => {
  it("derives the target -> breach join from persona + metric, not a declared key", async () => {
    const { relatedWithinSla, DEMO_INCIDENT_FIXTURES } = await threads();
    const target = DEMO_INCIDENT_FIXTURES.slaTargets.find((t) => t.id === "sla_3");
    const breach = DEMO_INCIDENT_FIXTURES.slaBreaches.find((b) => b.id === "br_3");
    expect(target && "causeKey" in target).toBe(false);
    expect(breach?.causeKey).toBeUndefined();
    expect(relatedWithinSla(DEMO_INCIDENT_FIXTURES, "sla_3")).toEqual(["br_3"]);
  });
});

describe("resolveFocus", () => {
  it("allow-lists the untrusted ?focus= value against known ids", async () => {
    const { resolveFocus, DEMO_FOCUS_IDS } = await threads();
    expect(resolveFocus("br_1", DEMO_FOCUS_IDS)).toBe("br_1");
    expect(resolveFocus("<img onerror>", DEMO_FOCUS_IDS)).toBeNull();
    expect(resolveFocus("__proto__", DEMO_FOCUS_IDS)).toBeNull();
    expect(resolveFocus(null, DEMO_FOCUS_IDS)).toBeNull();
  });
});

describe("initialBreachLogState", () => {
  it("opens the focused breach with no severity filter hiding it", async () => {
    const { initialBreachLogState } = await threads();
    expect(initialBreachLogState(MOCK_SLA_BREACHES, "br_1")).toEqual({ filter: "all", openId: "br_1" });
    expect(initialBreachLogState(MOCK_SLA_BREACHES, "hi_2")).toEqual({ filter: "all", openId: null });
  });

  it("keeps today's default when nothing is focused (guard)", async () => {
    const { initialBreachLogState } = await threads();
    expect(initialBreachLogState(MOCK_SLA_BREACHES, null)).toEqual({ filter: "all", openId: null });
  });
});

describe("focusHref", () => {
  it("builds the focused deep link, and Home triage uses it", async () => {
    const { focusHref } = await threads();
    expect(focusHref("slaBreach", "br_1")).toBe("/dashboard/sla?focus=br_1");
    const triage = read("app/dashboard/home/home-page/useTriageQueue.ts");
    expect(triage).toMatch(/focusHref\("slaBreach"/);
    expect(triage).toMatch(/focusHref\("healthIssue"/);
    expect(triage).not.toMatch(/["']\/dashboard\/(sla|observability)["']/);
  });
});

describe("Health actions (guard)", () => {
  it("keeps the Configure/Install toast path unchanged", () => {
    const page = read("app/dashboard/health/page.tsx");
    expect(page).toMatch(
      /const verb = item\.action === "install" \? labels\.toast\.installed : labels\.toast\.configured;/,
    );
    expect(page).toMatch(/message: `\$\{item\.name\} \$\{verb\}`/);
  });
});
