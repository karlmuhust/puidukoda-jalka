import type { LeaderboardData } from "./types";

export interface Fact {
  icon: string;
  title: string;
  description: string;
  stat?: string;
}

function topBy<T>(
  items: T[],
  score: (item: T) => number,
  label: (item: T) => string
): { name: string; value: number } | null {
  if (items.length === 0) return null;
  const sorted = [...items].sort((a, b) => score(b) - score(a));
  return { name: label(sorted[0]), value: score(sorted[0]) };
}

export function computeFacts(data: LeaderboardData): Fact[] {
  const { players, grid, championActual } = data;
  const finishedRows = grid.rows.filter((r) => r.actual);

  const exactLeader = topBy(
    players,
    (p) => p.exact,
    (p) => p.name
  );
  const resultLeader = topBy(
    players,
    (p) => p.result,
    (p) => p.name
  );

  const matchExactCounts = finishedRows.map((row) => ({
    label: `${row.homeEt} vs ${row.awayEt}`,
    actual: row.actual!,
    exact: Object.values(row.predictions).filter((c) => c.type === "exact")
      .length,
    total: Object.values(row.predictions).reduce(
      (sum, c) => sum + (c.points ?? 0),
      0
    ),
  }));
  const easiestExact = [...matchExactCounts].sort(
    (a, b) => b.exact - a.exact
  )[0];

  const impossibleMatches = matchExactCounts.filter((m) => m.total === 0);
  const sampleImpossible = impossibleMatches[0];

  const highestScoring = [...finishedRows]
    .map((row) => {
      const [h, a] = row.actual!.split(":").map(Number);
      const totalPoints = Object.values(row.predictions).reduce(
        (sum, c) => sum + (c.points ?? 0),
        0
      );
      return {
        label: `${row.homeEt} vs ${row.awayEt}`,
        actual: row.actual!,
        goals: h + a,
        totalPoints,
      };
    })
    .sort((a, b) => b.goals - a.goals)[0];

  const scoreCounts: Record<string, number> = {};
  for (const row of grid.rows) {
    for (const cell of Object.values(row.predictions)) {
      if (cell.raw && cell.raw !== "—") {
        scoreCounts[cell.raw] = (scoreCounts[cell.raw] ?? 0) + 1;
      }
    }
  }
  const popularScore = Object.entries(scoreCounts).sort(
    (a, b) => b[1] - a[1]
  )[0];

  const loneWolfCounts: Record<string, number> = {};
  for (const row of finishedRows) {
    const exactPlayers = Object.entries(row.predictions)
      .filter(([, c]) => c.type === "exact")
      .map(([name]) => name);
    if (exactPlayers.length === 1) {
      loneWolfCounts[exactPlayers[0]] =
        (loneWolfCounts[exactPlayers[0]] ?? 0) + 1;
    }
  }
  const oracle = Object.entries(loneWolfCounts).sort(
    (a, b) => b[1] - a[1]
  )[0];

  const championCorrect = players.filter((p) => p.champion > 0);
  const championPickCounts: Record<string, number> = {};
  for (const pick of Object.values(grid.championPicks)) {
    if (pick) championPickCounts[pick] = (championPickCounts[pick] ?? 0) + 1;
  }
  const popularChampion = Object.entries(championPickCounts).sort(
    (a, b) => b[1] - a[1]
  )[0];

  const bestWithoutChampion = [...players]
    .filter((p) => p.champion === 0)
    .sort((a, b) => b.total - a.total)[0];

  let bestStreak = { name: "", length: 0 };
  for (const player of players) {
    let current = 0;
    for (const row of finishedRows) {
      const cell = row.predictions[player.name];
      if (cell && cell.points && cell.points > 0) {
        current++;
        if (current > bestStreak.length) {
          bestStreak = { name: player.name, length: current };
        }
      } else {
        current = 0;
      }
    }
  }

  const drawCounts: Record<string, number> = {};
  for (const row of grid.rows) {
    for (const [name, cell] of Object.entries(row.predictions)) {
      if (!cell.raw || cell.raw === "—") continue;
      const [h, a] = cell.raw.split(":").map(Number);
      if (h === a) drawCounts[name] = (drawCounts[name] ?? 0) + 1;
    }
  }
  const drawLover = Object.entries(drawCounts).sort(
    (a, b) => b[1] - a[1]
  )[0];

  const facts: Fact[] = [];

  if (exactLeader && exactLeader.value > 0) {
    facts.push({
      icon: "🎯",
      title: "Täpsusmees",
      description: `${exactLeader.name} tabas ${exactLeader.value} mängu täpse tulemusega (3p). Enam kui keegi teine!`,
      stat: `${exactLeader.value}× täpne`,
    });
  }

  if (resultLeader && resultLeader.value > 0) {
    facts.push({
      icon: "📊",
      title: "Tulemuse guru",
      description: `${resultLeader.name} sai ${resultLeader.value} õige tulemuse punkti (1p). Stabiilseim ennustaja!`,
      stat: `${resultLeader.value}× tulemus`,
    });
  }

  if (championActual && championCorrect.length > 0) {
    facts.push({
      icon: "🏆",
      title: "Meistriennustajad",
      description: `${championCorrect.length} mängijat (${championCorrect.map((p) => p.name).join(", ")}) ennustasid ${championActual} meistriks ja said +5p.`,
      stat: `${championCorrect.length} õiget`,
    });
  }

  if (easiestExact && easiestExact.exact > 0) {
    facts.push({
      icon: "⚽",
      title: "Kõige lihtsam tabamus",
      description: `${easiestExact.label} (${easiestExact.actual}) — ${easiestExact.exact} mängijat tabas täpse tulemuse.`,
      stat: `${easiestExact.exact}/17 täpset`,
    });
  }

  if (impossibleMatches.length > 0 && sampleImpossible) {
    facts.push({
      icon: "🤯",
      title: "Kõigi pettis",
      description: `${impossibleMatches.length} mängus ei saanud keegi ühtegi punkti. Näiteks ${sampleImpossible.label} (${sampleImpossible.actual}).`,
      stat: `${impossibleMatches.length} mängu`,
    });
  }

  if (highestScoring) {
    facts.push({
      icon: "🔥",
      title: "Golefest",
      description: `${highestScoring.label} lõppes ${highestScoring.actual}-ga — turniiri resultatiivseim mäng (${highestScoring.goals} väravat).`,
      stat: `${highestScoring.goals} väravat`,
    });
  }

  if (popularScore) {
    facts.push({
      icon: "📋",
      title: "Lemmuskoor",
      description: `Enim ennustatud tulemus oli ${popularScore[0]} — kokku ${popularScore[1]} korda 1224 ennustuse seas.`,
      stat: `${popularScore[1]}×`,
    });
  }

  if (oracle) {
    facts.push({
      icon: "🔮",
      title: "Orakel",
      description: `${oracle[0]} oli ainus, kes tabas täpse tulemuse ${oracle[1]} mängul — keegi teine ei julgenud sama ennustada.`,
      stat: `${oracle[1]}× ainus`,
    });
  }

  if (bestWithoutChampion) {
    facts.push({
      icon: "😤",
      title: "Peaaegu meister",
      description: `${bestWithoutChampion.name} sai ${bestWithoutChampion.total}p ilma meistri punktideta — oleks olnud ${bestWithoutChampion.total + 5}p meistri tabamisega.`,
      stat: `${bestWithoutChampion.total}p`,
    });
  }

  if (bestStreak.length > 1) {
    facts.push({
      icon: "⚡",
      title: "Kuum seeria",
      description: `${bestStreak.name} sai punkte ${bestStreak.length} mängu järjest — pikim punktide seeria turniiril.`,
      stat: `${bestStreak.length} mängu`,
    });
  }

  if (drawLover) {
    facts.push({
      icon: "🤝",
      title: "Viigi entusiast",
      description: `${drawLover[0]} ennustas viiki ${drawLover[1]} korral — rohkem kui keegi teine. (Tegelikke viike oli 20.)`,
      stat: `${drawLover[1]}× viik`,
    });
  }

  if (popularChampion) {
    facts.push({
      icon: "👑",
      title: "Populaarseim meister",
      description: `${popularChampion[1]} mängijat panid ${popularChampion[0]}-le — enim hääli meistri ennustuses.${
        popularChampion[0] === championActual ? " Ja see töötas!" : ""
      }`,
      stat: `${popularChampion[1]}× ${popularChampion[0]}`,
    });
  }

  return facts.slice(0, 10);
}
