import { fixtureKey } from "./teams";
import { scorePrediction, formatScore } from "./scoring";
import type {
  PlayerPrediction,
  PoolMatch,
  PredictionGrid,
  PredictionCell,
} from "./types";

function buildCell(
  pred: { raw: string; home: number; away: number } | undefined,
  actual: PoolMatch["actual"]
): PredictionCell {
  if (!pred) {
    return { raw: "—", points: null, type: "pending" };
  }
  if (!actual) {
    return { raw: formatScore(pred), points: null, type: "pending" };
  }
  const { points, type } = scorePrediction(pred, actual);
  return { raw: formatScore(pred), points, type };
}

export function buildPredictionGrid(
  playerPredictions: PlayerPrediction[],
  matches: PoolMatch[]
): PredictionGrid {
  const playerNames = playerPredictions.map((p) => p.name);

  const rows = matches.map((match) => {
    const key = fixtureKey(match.home, match.away);
    const predictions: Record<string, PredictionCell> = {};

    for (const player of playerPredictions) {
      predictions[player.name] = buildCell(
        player.predictions[key],
        match.actual
      );
    }

    return {
      matchId: match.id,
      group: match.group,
      homeEt: match.homeEt,
      awayEt: match.awayEt,
      actual: match.actual ? formatScore(match.actual) : null,
      predictions,
    };
  });

  const championPicks: Record<string, string | null> = {};
  for (const player of playerPredictions) {
    championPicks[player.name] = player.champion;
  }

  return { playerNames, rows, championPicks };
}
