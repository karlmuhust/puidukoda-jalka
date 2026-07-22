import { NextResponse } from "next/server";
import { getLeaderboardData } from "@/lib/leaderboard";
import { TOURNAMENT_ARCHIVED } from "@/lib/config";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const NO_CACHE_HEADERS = {
  "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0",
  Pragma: "no-cache",
  Expires: "0",
  "CDN-Cache-Control": "no-store",
  "Vercel-CDN-Cache-Control": "no-store",
};

const ARCHIVED_HEADERS = {
  "Cache-Control": "public, max-age=86400, stale-while-revalidate=604800",
};

export async function GET() {
  try {
    const data = await getLeaderboardData();
    const headers = data.archived ? ARCHIVED_HEADERS : NO_CACHE_HEADERS;
    return NextResponse.json(data, { headers });
  } catch (error) {
    console.error("Leaderboard error:", error);
    return NextResponse.json(
      { error: "Failed to load leaderboard" },
      { status: 500, headers: NO_CACHE_HEADERS }
    );
  }
}
