import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import { createHash, randomBytes, timingSafeEqual } from "crypto";

const DATA_DIR = path.join(process.cwd(), ".data");
const WAITLIST_FILE = path.join(DATA_DIR, "waitlist.json");
const STATS_CACHE_FILE = path.join(DATA_DIR, "stats-cache.json");
const COUNTERS_FILE = path.join(DATA_DIR, "platform-counters.json");
const HISTORY_FILE = path.join(DATA_DIR, "platform-counters-history.json");
const CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour
const HISTORY_RETENTION_DAYS = 30;
const SERIES_LENGTH = 7;

/**
 * Per-file size caps for reads on this public marketing endpoint.
 *
 * Why: every file here is consumed via fs.readFile(), which loads the
 * full payload into memory. The waitlist file is append-only and grows
 * with user signups; platform-counters.json is written by an external
 * process that doesn't yet exist. A runaway file (organic growth,
 * misbehaving writer, or a 200MB blob from anywhere) would OOM the
 * serverless function on every cache miss and 500 the homepage.
 *
 * We stat() each file before reading and refuse anything beyond these
 * bounds. Bounds are deliberately generous so they never fire under
 * realistic usage, but tight enough to keep memory predictable on a
 * small Node serverless instance.
 *
 * - Waitlist: 5MB ≈ ~25k entries at ~200 bytes each, far above any
 *   realistic pre-launch signup count.
 * - Counters / cache: 64KB — both files are a flat object of <20 keys.
 * - History: 256KB — 30 daily snapshots of the same flat object,
 *   leaves comfortable headroom if the schema grows.
 */
const WAITLIST_MAX_BYTES = 5 * 1024 * 1024;
const COUNTERS_MAX_BYTES = 64 * 1024;
const CACHE_MAX_BYTES = 64 * 1024;
const HISTORY_MAX_BYTES = 256 * 1024;

/**
 * stat() the file first and refuse to read it if it exceeds maxBytes.
 * Returns null for missing files (ENOENT) and for over-cap files —
 * both are treated as "no data" by callers, which then fall through
 * to defaults. Other errors (permissions, I/O) propagate and are
 * caught by the caller's existing try/catch.
 */
async function readBoundedFile(filePath: string, maxBytes: number): Promise<string | null> {
  let info;
  try {
    info = await fs.stat(filePath);
  } catch (err) {
    if ((err as NodeJS.ErrnoException)?.code === "ENOENT") return null;
    throw err;
  }
  if (info.size > maxBytes) {
    console.error(
      `[stats] refusing to read ${path.basename(filePath)}: ${info.size} bytes exceeds ${maxBytes}-byte cap`,
    );
    return null;
  }
  return fs.readFile(filePath, "utf-8");
}

/**
 * CDN-friendly cache header for the normal GET path.
 * - max-age / s-maxage: 1 hour fresh window matches the file cache TTL.
 * - stale-while-revalidate: edges may keep serving the stale value for
 *   up to 10 more minutes while fetching a fresh one in the background,
 *   smoothing the TTL-boundary stampede.
 */
const CACHE_CONTROL_FRESH = "public, max-age=3600, s-maxage=3600, stale-while-revalidate=600";
const CACHE_CONTROL_BYPASS = "no-store";

/**
 * Marketing floor values for the landing page hero stats display.
 *
 * These are intentional minimums that prevent the landing page from
 * showing embarrassingly low numbers during early access. The actual
 * stats are Math.max(real, floor) for "higher is better" metrics. As
 * real usage grows beyond these values, the floors become irrelevant.
 *
 * Trend deltas (trend7d / series) are computed from RAW values stored
 * in platform-counters-history.json, NOT floored values — so the floor
 * never invents fake growth. If raw values stay below the floor, the
 * delta is 0 and no pill is shown.
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

/**
 * Fields where higher is better — `applyFloor` raises the displayed value
 * via Math.max so we never publish anything below the marketing minimum.
 *
 * Lower-is-better metrics (latency, cold-start, error rate, p95) MUST NOT
 * be added here. Math.max on those would inflate them beyond the real
 * value, defeating the entire point of the floor. Add such metrics to
 * the type but leave them out of this set; their MINIMUM_DISPLAY_VALUES
 * entry is still used as the *default* when no real data is present, but
 * the override path will never raise them.
 */
const FLOOR_FIELDS: ReadonlySet<keyof PlatformStats> = new Set([
  "totalUsers",
  "totalExecutions",
  "totalTemplates",
  "totalToolsConnected",
  "totalAgents",
  "totalCliCommands",
  "roadmapCompleted",
  "roadmapTotal",
]);

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

const STAT_KEYS: ReadonlyArray<keyof PlatformStats> = [
  "totalUsers",
  "totalExecutions",
  "totalTemplates",
  "totalToolsConnected",
  "totalAgents",
  "totalCliCommands",
  "coldStartSeconds",
  "roadmapCompleted",
  "roadmapTotal",
];

export type PlatformStatsSeries = Record<keyof PlatformStats, number[]>;

export interface PlatformStatsResponse extends PlatformStats {
  /** Value of each metric 7 days ago (real, not floored). */
  trend7d: PlatformStats;
  /** Last 7 daily snapshots per metric, oldest → newest. */
  series: PlatformStatsSeries;
}

interface HistoryRow extends PlatformStats {
  /** UTC date key in YYYY-MM-DD form. */
  date: string;
}

interface HistoryFile {
  history: HistoryRow[];
}

interface CachedStats {
  response: PlatformStatsResponse;
  cachedAt: number;
}

function todayKey(): string {
  return new Date().toISOString().slice(0, 10);
}

async function getWaitlistCount(): Promise<number> {
  try {
    const raw = await readBoundedFile(WAITLIST_FILE, WAITLIST_MAX_BYTES);
    if (raw === null) return 0;
    const data = JSON.parse(raw) as { entries: unknown[] };
    return data.entries.length;
  } catch {
    return 0;
  }
}

async function readCache(): Promise<CachedStats | null> {
  try {
    const raw = await readBoundedFile(STATS_CACHE_FILE, CACHE_MAX_BYTES);
    if (raw === null) return null;
    const cached = JSON.parse(raw) as Partial<CachedStats>;
    if (
      cached.response &&
      cached.response.series &&
      cached.response.trend7d &&
      typeof cached.cachedAt === "number" &&
      Date.now() - cached.cachedAt < CACHE_TTL_MS
    ) {
      return cached as CachedStats;
    }
    return null;
  } catch {
    return null;
  }
  return null;
}

/**
 * Write `data` as JSON to `targetPath` atomically.
 *
 * Two concurrent requests writing to the same file directly could interleave
 * bytes and produce malformed JSON, which then makes the cache permanently
 * unreadable (readers swallow the parse error and re-aggregate forever). To
 * avoid this we write to a uniquely-named temp file in the same directory and
 * then rename — `rename` is atomic on POSIX and acts as MoveFileEx-replace on
 * Windows, so any successful write produces a fully-formed file. We clean up
 * the temp file if either step fails so we don't leak stale `.tmp.*` files.
 */
async function atomicWriteJson(targetPath: string, data: unknown): Promise<void> {
  const dir = path.dirname(targetPath);
  await fs.mkdir(dir, { recursive: true });
  const tmpPath = path.join(
    dir,
    `${path.basename(targetPath)}.tmp.${process.pid}.${randomBytes(6).toString("hex")}`,
  );
  try {
    await fs.writeFile(tmpPath, JSON.stringify(data, null, 2));
    await fs.rename(tmpPath, targetPath);
  } catch (err) {
    try {
      await fs.unlink(tmpPath);
    } catch {
      // best-effort cleanup; ignore if the temp file never existed
    }
    throw err;
  }
}

async function writeCache(response: PlatformStatsResponse): Promise<void> {
  const cached: CachedStats = { response, cachedAt: Date.now() };
  await atomicWriteJson(STATS_CACHE_FILE, cached);
}

/**
 * Read the underlying RAW counter values (pre-floor). Used both for the
 * displayed stats (after applyFloor) and for the daily history snapshot.
 *
 * NOTE: platform-counters.json is expected to be written by an external
 * process (background job, admin CLI, or CI pipeline) that does NOT yet
 * exist. Until that process is built, raw values come from the waitlist
 * file (totalUsers) and MINIMUM_DISPLAY_VALUES defaults (everything else).
 */
async function readRawCounters(): Promise<PlatformStats> {
  const waitlistUsers = await getWaitlistCount();
  const raw: PlatformStats = { ...MINIMUM_DISPLAY_VALUES, totalUsers: waitlistUsers };

  try {
    const file = await readBoundedFile(COUNTERS_FILE, COUNTERS_MAX_BYTES);
    if (file === null) return raw;
    const counters = JSON.parse(file) as Partial<PlatformStats>;
    for (const key of STAT_KEYS) {
      const v = counters[key];
      if (typeof v !== "number") continue;
      // For totalUsers, counters can only raise the value (preserves the
      // original "waitlist count is a lower bound" behavior). Other metrics
      // are direct overrides — counters can lower them below the default.
      raw[key] = key === "totalUsers" ? Math.max(raw[key], v) : v;
    }
  } catch {
    // No external counters file — keep waitlist count + defaults.
  }

  return raw;
}

function applyFloor(raw: PlatformStats): PlatformStats {
  const result = { ...raw };
  for (const key of FLOOR_FIELDS) {
    result[key] = Math.max(raw[key], MINIMUM_DISPLAY_VALUES[key]);
  }
  return result;
}

async function readHistory(): Promise<HistoryRow[]> {
  try {
    const raw = await readBoundedFile(HISTORY_FILE, HISTORY_MAX_BYTES);
    if (raw === null) return [];
    const file = JSON.parse(raw) as Partial<HistoryFile>;
    if (!Array.isArray(file.history)) return [];
    return file.history
      .filter((row): row is HistoryRow => !!row && typeof row.date === "string")
      .sort((a, b) => a.date.localeCompare(b.date));
  } catch {
    return [];
  }
}

async function writeHistory(history: HistoryRow[]): Promise<void> {
  const file: HistoryFile = { history };
  await atomicWriteJson(HISTORY_FILE, file);
}

/**
 * Append today's raw snapshot to the rolling history file if it isn't
 * already present, then trim to the retention window.
 */
async function appendTodaySnapshotIfMissing(rawCounters: PlatformStats): Promise<HistoryRow[]> {
  const history = await readHistory();
  const today = todayKey();
  const last = history[history.length - 1];

  if (last && last.date === today) return history;

  const updated = history.filter((row) => row.date !== today);
  updated.push({ date: today, ...rawCounters });
  const trimmed = updated.slice(-HISTORY_RETENTION_DAYS);
  await writeHistory(trimmed);
  return trimmed;
}

/**
 * Build the 7-point series and the trend7d (oldest in window) reference
 * from the rolling history. If fewer than 7 rows exist, pad to the left
 * with the earliest known value so the sparkline stays a fixed width.
 */
function buildSeriesAndTrend(
  history: HistoryRow[],
  fallback: PlatformStats,
): { trend7d: PlatformStats; series: PlatformStatsSeries } {
  const recent = history.slice(-SERIES_LENGTH);
  const seed: PlatformStats = recent[0]
    ? { ...recent[0] }
    : { ...fallback };
  const padCount = SERIES_LENGTH - recent.length;
  const padded: PlatformStats[] = [
    ...Array.from({ length: padCount }, () => seed),
    ...recent,
  ];

  const series = STAT_KEYS.reduce((acc, key) => {
    acc[key] = padded.map((row) => row[key]);
    return acc;
  }, {} as PlatformStatsSeries);

  const trend7d = STAT_KEYS.reduce((acc, key) => {
    acc[key] = padded[0][key];
    return acc;
  }, {} as PlatformStats);

  return { trend7d, series };
}

async function aggregateStats(): Promise<PlatformStatsResponse> {
  const raw = await readRawCounters();
  const history = await appendTodaySnapshotIfMissing(raw);
  const display = applyFloor(raw);
  const { trend7d, series } = buildSeriesAndTrend(history, raw);
  return { ...display, trend7d, series };
}

/**
 * Delete the on-disk stats cache file. No-op if it doesn't exist.
 */
async function purgeFileCache(): Promise<void> {
  try {
    await fs.unlink(STATS_CACHE_FILE);
  } catch (err: unknown) {
    if ((err as NodeJS.ErrnoException)?.code !== "ENOENT") throw err;
  }
}

/**
 * Constant-time bearer-token check against STATS_ADMIN_TOKEN.
 * Returns false (and never throws) if the env var is unset — the purge
 * endpoint then refuses to run, which prevents accidental public access.
 */
function isAdminAuthorized(req: NextRequest): boolean {
  const expected = process.env.STATS_ADMIN_TOKEN;
  if (!expected) return false;

  const header = req.headers.get("authorization") ?? "";
  const match = header.match(/^Bearer\s+(.+)$/i);
  const provided = match?.[1] ?? "";

  // Compare SHA-256 digests (always 32 bytes) rather than the raw tokens, so
  // the length check `timingSafeEqual` requires can't leak the token's length
  // via an early return. Different inputs ⇒ different digests ⇒ false.
  const a = createHash("sha256").update(provided).digest();
  const b = createHash("sha256").update(expected).digest();
  return timingSafeEqual(a, b);
}

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const bypassCache =
    url.searchParams.get("nocache") === "1" || url.searchParams.get("fresh") === "1";

  if (!bypassCache) {
    const cached = await readCache();
    if (cached) {
      return NextResponse.json(cached.response, {
        headers: { "Cache-Control": CACHE_CONTROL_FRESH },
      });
    }
  }

  const response = await aggregateStats();
  await writeCache(response);

  return NextResponse.json(response, {
    headers: {
      "Cache-Control": bypassCache ? CACHE_CONTROL_BYPASS : CACHE_CONTROL_FRESH,
    },
  });
}

/**
 * Admin-gated cache purge. Deletes the on-disk file cache and re-aggregates
 * a fresh response so the next public GET (and the CDN edges that pull from
 * here) immediately see the new value.
 *
 * Requires `Authorization: Bearer $STATS_ADMIN_TOKEN`. Returns 503 if the
 * token isn't configured, so this can't be called in environments where
 * purge isn't intended to exist.
 */
export async function DELETE(req: NextRequest) {
  if (!process.env.STATS_ADMIN_TOKEN) {
    return NextResponse.json(
      { error: "Stats purge endpoint is not configured." },
      { status: 503, headers: { "Cache-Control": CACHE_CONTROL_BYPASS } },
    );
  }
  if (!isAdminAuthorized(req)) {
    return NextResponse.json(
      { error: "Unauthorized." },
      { status: 401, headers: { "Cache-Control": CACHE_CONTROL_BYPASS } },
    );
  }

  await purgeFileCache();
  const response = await aggregateStats();
  await writeCache(response);

  return NextResponse.json(
    { purged: true, response },
    { headers: { "Cache-Control": CACHE_CONTROL_BYPASS } },
  );
}

export const POST = DELETE;
