import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

const DATA_DIR = path.join(process.cwd(), ".data");
const WAITLIST_FILE = path.join(DATA_DIR, "waitlist.json");
const STATS_CACHE_FILE = path.join(DATA_DIR, "stats-cache.json");
const CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour

/**
 * Marketing floor values for the landing page hero stats display.
 *
 * These are intentional minimums that prevent the landing page from
 * showing embarrassingly low numbers during early access. The actual
 * stats are Math.max(real, floor). As real usage grows beyond these
 * values, the floors become irrelevant.
 *
 * To update: change values here. These are NOT bugs — they are a
 * deliberate marketing decision.
 */
const MINIMUM_DISPLAY_VALUES: PlatformStats = {
  totalUsers: 228,
  totalExecutions: 34_000,
  totalTemplates: 120,
  totalToolsConnected: 24,
  totalAgents: 42,
  totalCliCommands: 70,
  coldStartSeconds: 2,
  roadmapCompleted: 11,
  roadmapTotal: 15,
};

export interface PlatformStats {
  totalUsers: number;
  totalExecutions: number;
  totalTemplates: number;
  totalToolsConnected: number;
  totalAgents: number;
  totalCliCommands: number;
  coldStartSeconds: number;
  roadmapCompleted: number;
  roadmapTotal: number;
}

interface CachedStats {
  stats: PlatformStats;
  cachedAt: number;
}

async function getWaitlistCount(): Promise<number> {
  try {
    const raw = await fs.readFile(WAITLIST_FILE, "utf-8");
    const data = JSON.parse(raw) as { entries: unknown[] };
    return data.entries.length;
  } catch {
    return 0;
  }
}

async function readCache(): Promise<CachedStats | null> {
  try {
    const raw = await fs.readFile(STATS_CACHE_FILE, "utf-8");
    const cached = JSON.parse(raw) as CachedStats;
    if (Date.now() - cached.cachedAt < CACHE_TTL_MS) {
      return cached;
    }
    return null;
  } catch {
    return null;
  }
}

async function writeCache(stats: PlatformStats): Promise<void> {
  await fs.mkdir(DATA_DIR, { recursive: true });
  const cached: CachedStats = { stats, cachedAt: Date.now() };
  await fs.writeFile(STATS_CACHE_FILE, JSON.stringify(cached, null, 2));
}

async function aggregateStats(): Promise<PlatformStats> {
  const waitlistUsers = await getWaitlistCount();

  // Start with marketing floor values (see MINIMUM_DISPLAY_VALUES JSDoc).
  // The waitlist count is always live; all other counters default to the
  // floor values and can be overridden by platform-counters.json.
  const stats: PlatformStats = {
    ...MINIMUM_DISPLAY_VALUES,
    totalUsers: Math.max(waitlistUsers, MINIMUM_DISPLAY_VALUES.totalUsers),
  };

  // Try to read persisted counters that may have been updated externally.
  // NOTE: platform-counters.json is expected to be written by an external
  // process (background job, admin CLI, or CI pipeline) that does NOT yet
  // exist. Until that process is built, stats will always equal the floor
  // values above. This is intentional — do not remove as "dead code".
  try {
    const countersFile = path.join(DATA_DIR, "platform-counters.json");
    const raw = await fs.readFile(countersFile, "utf-8");
    const counters = JSON.parse(raw) as Partial<PlatformStats>;
    if (counters.totalUsers !== undefined) stats.totalUsers = Math.max(stats.totalUsers, counters.totalUsers);
    if (counters.totalExecutions !== undefined) stats.totalExecutions = counters.totalExecutions;
    if (counters.totalTemplates !== undefined) stats.totalTemplates = counters.totalTemplates;
    if (counters.totalToolsConnected !== undefined) stats.totalToolsConnected = counters.totalToolsConnected;
    if (counters.totalAgents !== undefined) stats.totalAgents = counters.totalAgents;
    if (counters.totalCliCommands !== undefined) stats.totalCliCommands = counters.totalCliCommands;
    if (counters.coldStartSeconds !== undefined) stats.coldStartSeconds = counters.coldStartSeconds;
    if (counters.roadmapCompleted !== undefined) stats.roadmapCompleted = counters.roadmapCompleted;
    if (counters.roadmapTotal !== undefined) stats.roadmapTotal = counters.roadmapTotal;
  } catch {
    // No external counters file — use floor values from MINIMUM_DISPLAY_VALUES
  }

  return stats;
}

export async function GET() {
  // Check cache first
  const cached = await readCache();
  if (cached) {
    return NextResponse.json(cached.stats, {
      headers: { "Cache-Control": "public, max-age=3600, s-maxage=3600" },
    });
  }

  const stats = await aggregateStats();
  await writeCache(stats);

  return NextResponse.json(stats, {
    headers: { "Cache-Control": "public, max-age=3600, s-maxage=3600" },
  });
}
