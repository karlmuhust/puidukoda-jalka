import { NextResponse } from "next/server";
import { getLeaderboardData } from "@/lib/leaderboard";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const NO_CACHE_HEADERS = {
  "Cache-Control": "no-store, no-cache, must-revalidate",
  "CDN-Cache-Control": "no-store",
  "Vercel-CDN-Cache-Control": "no-store",
};

export async function GET() {
  try {
    const data = await getLeaderboardData();
    return NextResponse.json(data, { headers: NO_CACHE_HEADERS });
  } catch (error) {
    console.error("Leaderboard error:", error);
    return NextResponse.json(
      { error: "Failed to load leaderboard" },
      { status: 500, headers: NO_CACHE_HEADERS }
    );
  }
}
