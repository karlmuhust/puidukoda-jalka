import * as XLSX from "xlsx";
import fs from "fs";
import path from "path";
import {
  etToEn,
  fixtureKey,
  normalizeTeamEt,
  CHAMPION_ET_TO_EN,
} from "./teams";
import { parseScore, formatScore } from "./scoring";
import type { PlayerPrediction } from "./types";

const XLS_PATH = path.join(
  process.cwd(),
  "public",
  "jalka_ MM_2026_Muhu Puidukoda.xls"
);

export function parsePredictionsFromXls(): PlayerPrediction[] {
  const buffer = fs.readFileSync(XLS_PATH);
  const wb = XLSX.read(buffer, { type: "buffer" });
  const sheet = wb.Sheets[wb.SheetNames[0]];
  const rows: string[][] = XLSX.utils.sheet_to_json(sheet, {
    header: 1,
    defval: "",
  });

  const header = rows[0] ?? [];
  const players: { name: string; col: number }[] = [];

  for (let i = 4; i < header.length; i += 2) {
    const name = String(header[i] ?? "").trim();
    if (name && name !== "P" && name !== "tulemus") {
      players.push({ name, col: i });
    }
  }

  const playerData: PlayerPrediction[] = players.map((p) => ({
    name: p.name,
    predictions: {},
    champion: null,
  }));

  for (let r = 1; r < rows.length; r++) {
    const row = rows[r];
    const label = String(row[1] ?? "").trim();

    if (label === "meister") {
      players.forEach((p, idx) => {
        const raw = String(row[p.col] ?? "").trim();
        if (raw) {
          playerData[idx].champion =
            CHAMPION_ET_TO_EN[raw] ?? etToEn(raw) ?? raw;
        }
      });
      continue;
    }

    const group = String(row[0] ?? "").trim();
    const team1Et = normalizeTeamEt(String(row[1] ?? "").trim());
    const team2Et = normalizeTeamEt(String(row[2] ?? "").trim());

    if (!group || group.length > 1 || !team1Et || !team2Et) continue;
    if (/^\d/.test(team1Et) || team1Et.includes("Osamaks")) continue;

    const home = etToEn(team1Et);
    const away = etToEn(team2Et);
    const key = fixtureKey(home, away);

    players.forEach((p, idx) => {
      const raw = String(row[p.col] ?? "").trim();
      const score = parseScore(raw);
      if (score) {
        playerData[idx].predictions[key] = {
          home: score.home,
          away: score.away,
          raw: formatScore(score),
        };
      }
    });
  }

  return playerData;
}
