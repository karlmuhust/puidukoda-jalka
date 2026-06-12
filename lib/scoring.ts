import { fixtureKey } from "./teams";
import type { PlayerPrediction, PoolMatch, Score, PlayerScore } from "./types";

export function formatScore(score: Score): string {
  return `${score.home}:${score.away}`;
}

export function parseScore(raw: string): Score | null {
  if (!raw || typeof raw !== "string") return null;
  const cleaned = raw.trim().replace(/:/g, "-");
  const match = cleaned.match(/^(\d+)\s*[-–]\s*(\d+)$/);
  if (!match) return null;
  return { home: parseInt(match[1], 10), away: parseInt(match[2], 10) };
}

export function getResult(score: Score): "home" | "away" | "draw" {
  if (score.home > score.away) return "home";
  if (score.home < score.away) return "away";
  return "draw";
}

export function scorePrediction(
  predicted: Score,
  actual: Score
): { points: number; type: "exact" | "result" | "none" } {
  if (predicted.home === actual.home && predicted.away === actual.away) {
    return { points: 3, type: "exact" };
  }
  if (getResult(predicted) === getResult(actual)) {
    return { points: 1, type: "result" };
  }
  return { points: 0, type: "none" };
}

export function computePlayerScores(
  players: PlayerPrediction[],
  matches: PoolMatch[],
  championActual: string | null
): PlayerScore[] {
  const finishedMatches = matches.filter((m) => m.actual !== null);

  const scores: PlayerScore[] = players.map((player) => {
    let exact = 0;
    let result = 0;
    let champion = 0;

    for (const match of finishedMatches) {
      const key = fixtureKey(match.home, match.away);
      const pred = player.predictions[key];
      if (!pred || !match.actual) continue;

      const { points, type } = scorePrediction(pred, match.actual);
      if (type === "exact") exact += 1;
      else if (type === "result") result += 1;
    }

    if (
      championActual &&
      player.champion &&
      player.champion.toLowerCase() === championActual.toLowerCase()
    ) {
      champion = 1;
    }

    const total = exact * 3 + result * 1 + champion * 5;

    return {
      name: player.name,
      total,
      exact,
      result,
      champion,
      rank: 0,
      championPick: player.champion,
    };
  });

  scores.sort((a, b) => b.total - a.total);
  scores.forEach((s, i) => {
    s.rank = i + 1;
  });

  return scores;
}
