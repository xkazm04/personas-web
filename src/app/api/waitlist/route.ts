import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

const DATA_DIR = path.join(process.cwd(), ".data");
const WAITLIST_FILE = path.join(DATA_DIR, "waitlist.json");

interface WaitlistEntry {
  email: string;
  platform: string;
  earlyBeta: boolean;
  createdAt: string;
}

interface WaitlistData {
  entries: WaitlistEntry[];
}

async function readWaitlist(): Promise<WaitlistData> {
  try {
    const raw = await fs.readFile(WAITLIST_FILE, "utf-8");
    return JSON.parse(raw) as WaitlistData;
  } catch {
    return { entries: [] };
  }
}

async function writeWaitlist(data: WaitlistData): Promise<void> {
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.writeFile(WAITLIST_FILE, JSON.stringify(data, null, 2));
}

// GET — return counts per platform
export async function GET() {
  const data = await readWaitlist();
  const counts: Record<string, number> = {};
  for (const entry of data.entries) {
    counts[entry.platform] = (counts[entry.platform] || 0) + 1;
  }
  return NextResponse.json({ counts });
}

// POST — add an email to the waitlist
export async function POST(req: NextRequest) {
  let body: { email?: string; platform?: string; earlyBeta?: boolean };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { email, platform, earlyBeta } = body;

  if (!email || typeof email !== "string" || !email.includes("@")) {
    return NextResponse.json({ error: "Valid email is required" }, { status: 400 });
  }

  if (!platform || typeof platform !== "string") {
    return NextResponse.json({ error: "Platform is required" }, { status: 400 });
  }

  const data = await readWaitlist();

  // Check for duplicate
  const exists = data.entries.some(
    (e) => e.email.toLowerCase() === email.toLowerCase() && e.platform === platform
  );
  if (exists) {
    return NextResponse.json({ message: "Already on the waitlist" });
  }

  data.entries.push({
    email: email.trim().toLowerCase(),
    platform,
    earlyBeta: !!earlyBeta,
    createdAt: new Date().toISOString(),
  });

  await writeWaitlist(data);

  const count = data.entries.filter((e) => e.platform === platform).length;
  return NextResponse.json({ message: "Added to waitlist", count });
}
