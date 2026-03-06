import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

// ---------------------------------------------------------------------------
// Admin-only endpoint to mark a feature as shipped and retrieve voter emails.
//
// In production, wire this to an email service (Resend, SendGrid, etc.)
// to actually send "Your feature shipped!" emails to each voter.
// ---------------------------------------------------------------------------

const ADMIN_SECRET = process.env.ADMIN_SECRET ?? "dev-secret";

const DATA_DIR = path.join(process.cwd(), ".data");
const SHIPPED_FILE = path.join(DATA_DIR, "shipped.json");
const VOTES_FILE = path.join(DATA_DIR, "votes.json");

interface ShippedEntry {
  feature_id: string;
  changelog: string;
  link: string;
  shipped_at: string;
}

interface ShippedData {
  entries: ShippedEntry[];
}

interface VoteEntry {
  feature_id: string;
  voter_id: string;
  email?: string;
  created_at: string;
}

interface VotesData {
  entries: VoteEntry[];
}

async function readShipped(): Promise<ShippedData> {
  try {
    const raw = await fs.readFile(SHIPPED_FILE, "utf-8");
    return JSON.parse(raw) as ShippedData;
  } catch {
    return { entries: [] };
  }
}

async function writeShipped(data: ShippedData): Promise<void> {
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.writeFile(SHIPPED_FILE, JSON.stringify(data, null, 2));
}

async function readVotes(): Promise<VotesData> {
  try {
    const raw = await fs.readFile(VOTES_FILE, "utf-8");
    return JSON.parse(raw) as VotesData;
  } catch {
    return { entries: [] };
  }
}

function hasSupabase(): boolean {
  return !!(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
}

async function getSupabaseClient() {
  const { getSupabase } = await import("@/lib/supabase");
  return getSupabase();
}

// ---------------------------------------------------------------------------
// POST — mark a feature as shipped + return voter emails for notification
// ---------------------------------------------------------------------------

export async function POST(req: NextRequest) {
  // Simple admin auth via secret header
  const authHeader = req.headers.get("x-admin-secret");
  if (authHeader !== ADMIN_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: {
    featureId?: string;
    changelog?: string;
    link?: string;
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { featureId, changelog, link } = body;

  if (!featureId || typeof featureId !== "string") {
    return NextResponse.json(
      { error: "featureId is required" },
      { status: 400 },
    );
  }
  if (!changelog || typeof changelog !== "string") {
    return NextResponse.json(
      { error: "changelog is required" },
      { status: 400 },
    );
  }

  const shippedEntry: ShippedEntry = {
    feature_id: featureId,
    changelog,
    link: link || "",
    shipped_at: new Date().toISOString(),
  };

  // --- Supabase path ---
  if (hasSupabase()) {
    const sb = await getSupabaseClient();

    // Upsert shipped entry
    const { error: shipErr } = await sb
      .from("shipped_features")
      .upsert(shippedEntry, { onConflict: "feature_id" });

    if (shipErr) {
      return NextResponse.json(
        { error: "Failed to mark as shipped" },
        { status: 500 },
      );
    }

    // Get voter emails for this feature
    const { data: voters } = await sb
      .from("feature_votes")
      .select("email")
      .eq("feature_id", featureId)
      .not("email", "is", null);

    const emails = [
      ...new Set(
        (voters ?? [])
          .map((v: { email: string | null }) => v.email)
          .filter(Boolean) as string[],
      ),
    ];

    // TODO: Integrate email service (Resend, SendGrid) to send notifications
    // For now, return the list so it can be processed externally

    return NextResponse.json({
      message: `Feature "${featureId}" marked as shipped`,
      notifiableEmails: emails,
      emailCount: emails.length,
      shipped: shippedEntry,
    });
  }

  // --- Filesystem fallback ---
  const [shippedData, votesData] = await Promise.all([
    readShipped(),
    readVotes(),
  ]);

  // Upsert: replace if exists, add if not
  const existingIdx = shippedData.entries.findIndex(
    (e) => e.feature_id === featureId,
  );
  if (existingIdx !== -1) {
    shippedData.entries[existingIdx] = shippedEntry;
  } else {
    shippedData.entries.push(shippedEntry);
  }
  await writeShipped(shippedData);

  // Collect voter emails
  const emails = [
    ...new Set(
      votesData.entries
        .filter((e) => e.feature_id === featureId && e.email)
        .map((e) => e.email!),
    ),
  ];

  return NextResponse.json({
    message: `Feature "${featureId}" marked as shipped`,
    notifiableEmails: emails,
    emailCount: emails.length,
    shipped: shippedEntry,
  });
}
