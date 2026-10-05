"use client";

import { useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";

import GradientText from "@/components/GradientText";
import { navigateDashboard } from "@/components/dashboard/spa/navigate";
import TourLauncher from "@/components/tour/TourLauncher";
import { useGreeting } from "@/hooks/useGreeting";
import { useTranslation } from "@/i18n/useTranslation";
import { useAuthStore } from "@/stores/authStore";
import { useLiveClock } from "./home-page/useLiveClock";
import { DimDetail } from "./mission/DimDetail";
import { describeDimension, type DimensionView } from "./mission/dimensions";
import { DIMENSION_IDS, isDimensionId, type DimensionId } from "./mission/readings";
import { useMissionReadings } from "./mission/useMissionReadings";
import { WallCell } from "./mission/WallCell";
import { WallDetail } from "./mission/WallDetail";

const HOME = "/dashboard/home";
const hrefFor = (id: DimensionId) => `${HOME}?dim=${id}`;

/** The guided tour's spotlight targets, carried over from the old cockpit regions. */
const TOUR_ANCHORS: Partial<Record<DimensionId, { tourTarget: string }>> = {
  outcomes: { tourTarget: "dashboard-activity" },
  agents: { tourTarget: "dashboard-heatmap" },
  queue: { tourTarget: "dashboard-intelligence" },
  recovery: { tourTarget: "dashboard-fleet" },
  instruments: { tourTarget: "dashboard-instruments" },
};

/**
 * Mission Control, in sync with the desktop app's annunciator wall: eight
 * dimensions of fleet health, each a lamp, a figure and one line of
 * evidence, lit only when it needs you. Opening one (click, or keys 1-8) shows
 * its evidence beside a rail of the other seven; the open dimension lives in
 * the URL (`?dim=`), so it survives a reload and the back button closes it.
 */
export default function MissionControlView() {
  const { t } = useTranslation();
  const copy = t.dashboard.home.mission;
  const user = useAuthStore((state) => state.user);
  const greeting = useGreeting(t.dashboard.greeting);
  const displayName = user?.user_metadata?.full_name?.split(" ")[0] ?? t.dashboard.greetingFallback;

  const now = useLiveClock();
  const { readings, sources, daily, issues } = useMissionReadings(now);
  const dims = DIMENSION_IDS.map((id, index) => describeDimension(id, index, readings, copy, now));

  const param = useSearchParams().get("dim");
  const openId = isDimensionId(param) ? param : null;
  const open = openId ? dims.find((dim) => dim.id === openId) ?? null : null;

  useWallKeys(openId);
  useWallFocus(openId);

  return (
    <div>
      <header className="mb-6 flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h1 className="text-2xl font-bold tracking-tight">
            <GradientText variant="silver">{t.dashboard.missionControl}</GradientText>
          </h1>
          <p className="mt-1 text-base text-muted-dark">
            {greeting}, {displayName} · {copy.windowNote}
          </p>
        </div>
        <TourLauncher tourId="dashboard" />
      </header>

      {open ? (
        <WallDetail
          dims={dims}
          open={open}
          onSelect={(dim: DimensionView) => navigateDashboard(hrefFor(dim.id), { replace: true })}
          onBack={() => navigateDashboard(HOME)}
        >
          <DimDetail id={open.id} readings={readings} sources={sources} daily={daily} issues={issues} />
        </WallDetail>
      ) : (
        <>
          <ul aria-label={copy.wallLabel} data-tour-diagram="dashboard-vitals" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {dims.map((dim) => (
              <li key={dim.id} data-tour-diagram={TOUR_ANCHORS[dim.id]?.tourTarget} className="flex">
                <WallCell dim={dim} onOpen={() => navigateDashboard(hrefFor(dim.id))} />
              </li>
            ))}
          </ul>
          <p className="mt-4 hidden text-sm text-muted-dark md:block">{copy.hint}</p>
        </>
      )}
    </div>
  );
}

/** 1-8 open a dimension, Esc returns to the wall, Up/Down walk the open rail. */
function useWallKeys(openId: DimensionId | null) {
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.metaKey || event.ctrlKey || event.altKey || event.defaultPrevented) return;
      const target = event.target;
      if (target instanceof Element && target.closest("input, textarea, select, [contenteditable='true'], [role='dialog']")) return;

      const digit = Number(event.key);
      if (Number.isInteger(digit) && digit >= 1 && digit <= DIMENSION_IDS.length) {
        event.preventDefault();
        navigateDashboard(hrefFor(DIMENSION_IDS[digit - 1]), { replace: openId !== null });
        return;
      }
      if (!openId) return;
      if (event.key === "Escape") {
        event.preventDefault();
        navigateDashboard(HOME);
      } else if (event.key === "ArrowDown" || event.key === "ArrowUp") {
        event.preventDefault();
        const step = event.key === "ArrowDown" ? 1 : -1;
        const next = (DIMENSION_IDS.indexOf(openId) + step + DIMENSION_IDS.length) % DIMENSION_IDS.length;
        navigateDashboard(hrefFor(DIMENSION_IDS[next]), { replace: true });
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [openId]);
}

/**
 * Keep keyboard focus where the eye goes: onto the detail's heading when a
 * dimension opens, back onto its cell when the wall returns.
 */
function useWallFocus(openId: DimensionId | null) {
  const previous = useRef<DimensionId | null>(openId);
  useEffect(() => {
    const last = previous.current;
    previous.current = openId;
    if (openId === last) return;
    if (openId) {
      document.getElementById("mission-detail-title")?.focus({ preventScroll: true });
    } else if (last) {
      document.querySelector<HTMLElement>(`[data-mission-dim="${last}"]`)?.focus({ preventScroll: true });
    }
  }, [openId]);
}
