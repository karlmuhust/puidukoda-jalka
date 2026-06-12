import type { PoolMatch } from "./types";

/** How often the browser should poll for fresh football data */
export function getPollIntervalMs(matches: PoolMatch[]): number {
  const live = matches.some((m) => m.status === "live" && !m.actual);
  if (live) return 15_000;

  const now = Date.now();
  const twoHours = 2 * 60 * 60 * 1000;

  const kickoffSoon = matches.some((m) => {
    if (!m.kickoffUtc || m.actual) return false;
    const kickoff = new Date(m.kickoffUtc).getTime();
    return kickoff > now && kickoff - now <= twoHours;
  });
  if (kickoffSoon) return 30_000;

  const kickoffToday = matches.some((m) => {
    if (!m.kickoffUtc || m.actual) return false;
    const kickoff = new Date(m.kickoffUtc);
    const today = new Date();
    return kickoff.toDateString() === today.toDateString();
  });
  if (kickoffToday) return 60_000;

  return 120_000;
}
