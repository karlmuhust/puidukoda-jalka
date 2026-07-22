import { parsePredictionsFromXls } from "./parse-predictions";
import { fetchLiveMatches, getPoolMatchList, detectChampion } from "./matches";
import { computePlayerScores } from "./scoring";
import { buildPredictionGrid } from "./grid";
import { TOURNAMENT_ARCHIVED, ARCHIVED_CHAMPION } from "./config";
import type { LeaderboardData } from "./types";

export async function getLeaderboardData(): Promise<LeaderboardData> {
  const playerPredictions = parsePredictionsFromXls();
  const poolList = getPoolMatchList();
  const matches = await fetchLiveMatches(poolList);
  const championActual =
    (await detectChampion()) ??
    (TOURNAMENT_ARCHIVED ? ARCHIVED_CHAMPION : null);
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
    archived: TOURNAMENT_ARCHIVED,
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
