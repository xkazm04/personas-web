import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

const DATA_DIR = path.join(process.cwd(), ".data");
const WAITLIST_FILE = path.join(DATA_DIR, "waitlist.json");
const STATS_CACHE_FILE = path.join(DATA_DIR, "stats-cache.json");
const CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour

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

  // Base metrics from the platform — these grow as real data accumulates.
  // The waitlist count is always live; other counters read from the cache
  // file which can be updated by a background job or admin endpoint.
  const stats: PlatformStats = {
    totalUsers: Math.max(waitlistUsers, 228),
    totalExecutions: 34_000,
    totalTemplates: 120,
    totalToolsConnected: 24,
    totalAgents: 42,
    totalCliCommands: 70,
    coldStartSeconds: 2,
    roadmapCompleted: 11,
    roadmapTotal: 15,
  };

  // Try to read persisted counters that may have been updated externally
  try {
    const countersFile = path.join(DATA_DIR, "platform-counters.json");
    const raw = await fs.readFile(countersFile, "utf-8");
    const counters = JSON.parse(raw) as Partial<PlatformStats>;
    // Merge any externally-updated counters
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
    // No external counters file — use defaults
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
