import { parsePredictionsFromXls } from "./parse-predictions";
import { fetchLiveMatches, getPoolMatchList, detectChampion } from "./matches";
import { computePlayerScores } from "./scoring";
import { buildPredictionGrid } from "./grid";
import type { LeaderboardData } from "./types";

export async function getLeaderboardData(): Promise<LeaderboardData> {
  const playerPredictions = parsePredictionsFromXls();
  const poolList = getPoolMatchList();
  const matches = await fetchLiveMatches(poolList);
  const championActual = detectChampion(matches);
  const playerScores = computePlayerScores(
    playerPredictions,
    matches,
    championActual
  );
  const grid = buildPredictionGrid(playerPredictions, matches);

  return {
    players: playerScores,
    matches,
    grid,
    championActual,
    lastUpdated: new Date().toISOString(),
    rules: {
      exactScore: 3,
      correctResult: 1,
      champion: 5,
      entryFee: "10 €",
      prizes: [
        { place: "1.", amount: "100 €" },
        { place: "2.", amount: "60 €" },
        { place: "3.", amount: "10 €" },
      ],
    },
  };
}
