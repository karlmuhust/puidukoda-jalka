export interface Score {
  home: number;
  away: number;
}

export interface Prediction {
  home: number;
  away: number;
  raw: string;
}

export interface PlayerPrediction {
  name: string;
  predictions: Record<string, Prediction>; // matchKey → prediction
  champion: string | null;
}

export interface PoolMatch {
  id: string;
  group: string;
  homeEt: string;
  awayEt: string;
  home: string;
  away: string;
  date?: string;
  kickoffUtc?: string;
  round?: string;
  ground?: string;
  actual: Score | null;
  status: "finished" | "live" | "upcoming";
  goals?: { team: string; scorer: string; minute: string }[];
}

export interface PlayerScore {
  name: string;
  total: number;
  exact: number;
  result: number;
  champion: number;
  rank: number;
  championPick: string | null;
}

export type PredictionCellType = "exact" | "result" | "none" | "pending";

export interface PredictionCell {
  raw: string;
  points: number | null;
  type: PredictionCellType;
}

export interface PredictionGridRow {
  matchId: string;
  group: string;
  homeEt: string;
  awayEt: string;
  actual: string | null;
  predictions: Record<string, PredictionCell>;
}

export interface PredictionGrid {
  playerNames: string[];
  rows: PredictionGridRow[];
  championPicks: Record<string, string | null>;
}

export interface LeaderboardData {
  players: PlayerScore[];
  matches: PoolMatch[];
  grid: PredictionGrid;
  championActual: string | null;
  lastUpdated: string;
  rules: {
    exactScore: number;
    correctResult: number;
    champion: number;
    entryFee: string;
    prizes: { place: string; amount: string }[];
  };
}
