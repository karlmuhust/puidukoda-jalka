import type { LeaderboardData, PoolMatch } from "./types";

const FIVE_MIN = 5 * 60 * 1000;
const FIFTEEN_MIN = 15 * 60 * 1000;
const THIRTY_MIN = 30 * 60 * 1000;

/** Poll only often enough to notice when a match has finished */
export function getPollIntervalMs(matches: PoolMatch[]): number {
  const inProgress = matches.some((m) => m.status === "live" && !m.actual);
  if (inProgress) return FIVE_MIN;

  const now = Date.now();
  const matchDay = matches.some((m) => {
    if (!m.kickoffUtc || m.actual) return false;
    const kickoff = new Date(m.kickoffUtc);
    const today = new Date();
    return kickoff.toDateString() === today.toDateString();
  });
  if (matchDay) return FIFTEEN_MIN;

  return THIRTY_MIN;
}

/** True when a match has a new or changed final score */
export function hasNewFinishedResults(
  prev: LeaderboardData | null,
  next: LeaderboardData
): boolean {
  if (!prev) return true;

  for (const m of next.matches) {
    if (!m.actual) continue;
    const pm = prev.matches.find((p) => p.id === m.id);
    if (!pm?.actual) return true;
    if (
      pm.actual.home !== m.actual.home ||
      pm.actual.away !== m.actual.away
    ) {
      return true;
    }
  }

  return false;
}
