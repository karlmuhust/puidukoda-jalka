import { NextResponse } from "next/server";
import { getLeaderboardData } from "@/lib/leaderboard";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Vercel Cron hits this route to pull fresh football data server-side.
 * Set CRON_SECRET in Vercel env vars (Vercel can auto-generate it).
 */
export async function GET(request: Request) {
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret) {
    const auth = request.headers.get("authorization");
    if (auth !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  try {
    await getLeaderboardData();
    return NextResponse.json({
      ok: true,
      syncedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Cron sync error:", error);
    return NextResponse.json({ error: "Sync failed" }, { status: 500 });
  }
}
