import type { LeaderboardData } from "./types";

/** English champion pick → Estonian partitive (for "ennustasid X maailmameistriks") */
const CHAMPION_EN_PARTITIVE: Record<string, string> = {
  Portugal: "Portugali",
  Belgium: "Belgia",
  Spain: "Hispaania",
  Turkey: "Türgi",
  France: "Prantsusmaa",
  Norway: "Norra",
  Brazil: "Brasiilia",
  Netherlands: "Hollandi",
};

/** English champion pick → Estonian nominative */
const CHAMPION_EN_NOMINATIVE: Record<string, string> = {
  Portugal: "Portugal",
  Belgium: "Belgia",
  Spain: "Hispaania",
  Turkey: "Türgi",
  France: "Prantsusmaa",
  Norway: "Norra",
  Brazil: "Brasiilia",
  Netherlands: "Holland",
};

function championPartitive(en: string | null): string {
  if (!en) return en ?? "";
  return CHAMPION_EN_PARTITIVE[en] ?? en;
}

function championNominative(en: string | null): string {
  if (!en) return en ?? "";
  return CHAMPION_EN_NOMINATIVE[en] ?? en;
}

export type FactTone = "highlight" | "unlucky" | "fall";

export interface Fact {
  icon: string;
  title: string;
  description: string;
  stat?: string;
  tone: FactTone;
}

function topEntry(
  counts: Record<string, number>
): [string, number] | null {
  const entries = Object.entries(counts).filter(([, v]) => v > 0);
  if (entries.length === 0) return null;
  return entries.sort((a, b) => b[1] - a[1])[0];
}

function getResult(score: string): "home" | "away" | "draw" {
  const [h, a] = score.split(":").map(Number);
  if (h > a) return "home";
  if (h < a) return "away";
  return "draw";
}

function goalDistance(predicted: string, actual: string): number {
  const [ph, pa] = predicted.split(":").map(Number);
  const [ah, aa] = actual.split(":").map(Number);
  return Math.abs(ph - ah) + Math.abs(pa - aa);
}

function rankPlayers(
  players: LeaderboardData["players"],
  compare: (a: LeaderboardData["players"][0], b: LeaderboardData["players"][0]) => number
): Map<string, number> {
  const sorted = [...players].sort(compare);
  return new Map(sorted.map((player, index) => [player.name, index + 1]));
}

function shuffleFacts(facts: Fact[], seed: string): Fact[] {
  const shuffled = [...facts];
  let state = 0;
  for (let i = 0; i < seed.length; i++) {
    state = (state * 31 + seed.charCodeAt(i)) >>> 0;
  }
  for (let i = shuffled.length - 1; i > 0; i--) {
    state = (state * 1103515245 + 12345) >>> 0;
    const j = state % (i + 1);
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export function computeFacts(data: LeaderboardData): Fact[] {
  const { players, grid, championActual } = data;
  const finishedRows = grid.rows.filter((row) => row.actual);

  const wrongWinner: Record<string, number> = {};
  const closeMiss: Record<string, number> = {};
  const zeroCount: Record<string, number> = {};
  const nearMiss: Record<string, number> = {};
  const loneWolfCounts: Record<string, number> = {};
  const drawCounts: Record<string, number> = {};

  for (const player of players) {
    wrongWinner[player.name] = 0;
    closeMiss[player.name] = 0;
    zeroCount[player.name] = 0;
    nearMiss[player.name] = 0;
  }

  for (const row of finishedRows) {
    const actual = row.actual!;
    const actualResult = getResult(actual);
    const exactPlayers = Object.entries(row.predictions)
      .filter(([, cell]) => cell.type === "exact")
      .map(([name]) => name);

    if (exactPlayers.length === 1) {
      loneWolfCounts[exactPlayers[0]] =
        (loneWolfCounts[exactPlayers[0]] ?? 0) + 1;
    }

    for (const [name, cell] of Object.entries(row.predictions)) {
      if (!cell.raw || cell.raw === "—") continue;

      const [ph, pa] = cell.raw.split(":").map(Number);
      if (ph === pa) drawCounts[name] = (drawCounts[name] ?? 0) + 1;

      if (cell.type === "result") nearMiss[name]++;
      if (cell.type === "none") {
        zeroCount[name]++;
        if (goalDistance(cell.raw, actual) === 1) closeMiss[name]++;
        const predResult = getResult(cell.raw);
        if (
          predResult !== actualResult &&
          predResult !== "draw" &&
          actualResult !== "draw"
        ) {
          wrongWinner[name]++;
        }
      }
    }
  }

  let bestStreak = { name: "", length: 0 };
  let worstStreak = { name: "", length: 0 };
  for (const player of players) {
    let currentHot = 0;
    let currentCold = 0;
    for (const row of finishedRows) {
      const cell = row.predictions[player.name];
      if (cell?.points && cell.points > 0) {
        currentHot++;
        currentCold = 0;
        if (currentHot > bestStreak.length) {
          bestStreak = { name: player.name, length: currentHot };
        }
      } else if (cell?.raw && cell.raw !== "—") {
        currentCold++;
        currentHot = 0;
        if (currentCold > worstStreak.length) {
          worstStreak = { name: player.name, length: currentCold };
        }
      } else {
        currentHot = 0;
        currentCold = 0;
      }
    }
  }

  const matchExactCounts = finishedRows.map((row) => {
    const exactPlayers = Object.entries(row.predictions)
      .filter(([, cell]) => cell.type === "exact")
      .map(([name]) => name);

    return {
      label: `${row.homeEt} vs ${row.awayEt}`,
      actual: row.actual!,
      exact: exactPlayers.length,
      exactPlayers,
      total: Object.values(row.predictions).reduce(
        (sum, c) => sum + (c.points ?? 0),
        0
      ),
    };
  });
  const easiestExact = [...matchExactCounts].sort(
    (a, b) => b.exact - a.exact
  )[0];

  const scoreCounts: Record<string, number> = {};
  for (const row of grid.rows) {
    for (const cell of Object.values(row.predictions)) {
      if (cell.raw && cell.raw !== "—") {
        scoreCounts[cell.raw] = (scoreCounts[cell.raw] ?? 0) + 1;
      }
    }
  }
  const popularScore = topEntry(scoreCounts);

  const championPickCounts: Record<string, number> = {};
  for (const pick of Object.values(grid.championPicks)) {
    if (pick) championPickCounts[pick] = (championPickCounts[pick] ?? 0) + 1;
  }
  const popularChampion = topEntry(championPickCounts);
  const wrongChampionPicks = Object.entries(championPickCounts)
    .filter(([team]) => team !== championActual)
    .sort((a, b) => b[1] - a[1]);

  const exactRank = rankPlayers(
    players,
    (a, b) => b.exact - a.exact || b.total - a.total
  );

  const exactLeader = topEntry(
    Object.fromEntries(players.map((p) => [p.name, p.exact]))
  );
  const resultLeader = topEntry(
    Object.fromEntries(players.map((p) => [p.name, p.result]))
  );
  const oracle = topEntry(loneWolfCounts);
  const championCorrect = players.filter((p) => p.champion > 0);

  const highlights: Fact[] = [];
  const unlucky: Fact[] = [];
  const fallers: Fact[] = [];

  if (exactLeader) {
    highlights.push({
      icon: "🎯",
      title: "Täpsusmees",
      description: `${exactLeader[0]} tabas ${exactLeader[1]} mängu täpse tulemusega (3p) — rohkem kui keegi teine.`,
      stat: `${exactLeader[1]}× täpne`,
      tone: "highlight",
    });
  }

  if (resultLeader) {
    highlights.push({
      icon: "📊",
      title: "Tulemuse guru",
      description: `${resultLeader[0]} sai ${resultLeader[1]} korda õige tulemuse (1p). Stabiilseim mängija.`,
      stat: `${resultLeader[1]}× tulemus`,
      tone: "highlight",
    });
  }

  if (championActual && championCorrect.length > 0) {
    highlights.push({
      icon: "🏆",
      title: "Meistriennustajad",
      description: `${championCorrect.map((p) => p.name).join(", ")} ennustasid ${championPartitive(championActual).toLowerCase()} maailmameistriks (+5p).`,
      stat: `${championCorrect.length} õiget`,
      tone: "highlight",
    });
  }

  if (oracle) {
    highlights.push({
      icon: "🔮",
      title: "Orakel",
      description: `${oracle[0]} oli ainus täpse tabajaga ${oracle[1]} mängul — keegi teine ei julgenud sama ennustada.`,
      stat: `${oracle[1]}× ainus`,
      tone: "highlight",
    });
  }

  if (bestStreak.length > 1) {
    highlights.push({
      icon: "⚡",
      title: "Kuum seeria",
      description: `${bestStreak.name} sai punkte ${bestStreak.length} mängu järjest — pikim punktide seeria turniiril.`,
      stat: `${bestStreak.length} mängu`,
      tone: "highlight",
    });
  }

  if (easiestExact && easiestExact.exact > 0) {
    highlights.push({
      icon: "⚽",
      title: "Lihtsaim tabamus",
      description: `${easiestExact.label} (${easiestExact.actual}) — täpse skoori tabasid: ${easiestExact.exactPlayers.join(", ")}.`,
      stat: `${easiestExact.exact}/17`,
      tone: "highlight",
    });
  }

  if (popularScore) {
    highlights.push({
      icon: "📋",
      title: "Lemmikskoor",
      description: `Kõige populaarsem ennustus oli ${popularScore[0]} — ${popularScore[1]} korda 1224 prognoosi seas.`,
      stat: `${popularScore[1]}×`,
      tone: "highlight",
    });
  }

  const zeroKing = topEntry(zeroCount);
  if (zeroKing) {
    unlucky.push({
      icon: "🫠",
      title: "Nullipärlane",
      description: `${zeroKing[0]} sai ${zeroKing[1]} mängult null punkti — rohkem tühje tulemusi kui kellelgi teisel.`,
      stat: `${zeroKing[1]}× null`,
      tone: "unlucky",
    });
  }

  const closeMissKing = topEntry(closeMiss);
  if (closeMissKing && closeMissKing[1] > 0) {
    unlucky.push({
      icon: "😩",
      title: "Peaaegu tabas",
      description: `${closeMissKing[0]} oli ${closeMissKing[1]} korral ühe värava kaugusel täpsest skoorist, aga sai ikkagi 0p.`,
      stat: `${closeMissKing[1]}× peaaegu`,
      tone: "unlucky",
    });
  }

  const wrongWinnerKing = topEntry(wrongWinner);
  if (wrongWinnerKing && wrongWinnerKing[1] > 0) {
    unlucky.push({
      icon: "🔀",
      title: "Vale tiib",
      description: `${wrongWinnerKing[0]} ennustas ${wrongWinnerKing[1]} korda vale võitjat — tulemus oli teistpidi.`,
      stat: `${wrongWinnerKing[1]}× vale`,
      tone: "unlucky",
    });
  }

  if (worstStreak.length > 1) {
    unlucky.push({
      icon: "🥶",
      title: "Külmutus",
      description: `${worstStreak.name} sai ${worstStreak.length} mängu järjest null punkti — turniiri külmem seeria.`,
      stat: `${worstStreak.length} mängu`,
      tone: "unlucky",
    });
  }

  const nearMissKing = topEntry(nearMiss);
  if (nearMissKing && nearMissKing[1] > 0) {
    unlucky.push({
      icon: "👰",
      title: "Alati peigmees",
      description: `${nearMissKing[0]} tabas ${nearMissKing[1]} korda õige tulemuse, aga mitte täpset skoori — 1p asemel 3p.`,
      stat: `${nearMissKing[1]}× peaaegu`,
      tone: "unlucky",
    });
  }

  if (wrongChampionPicks.length > 0) {
    const [team, count] = wrongChampionPicks[0];
    const victims = players
      .filter((p) => p.championPick === team)
      .map((p) => p.name)
      .join(", ");
    unlucky.push({
      icon: "💔",
      title: "Vale meister",
      description: `${count} mängijat ennustasid ${championPartitive(team).toLowerCase()} maailmameistriks, aga meister oli ${championNominative(championActual)}. ${victims} jäi ilma +5p-st.`,
      stat: `${count}× ${championPartitive(team)}`,
      tone: "unlucky",
    });
  }

  const fallCandidates = players
    .map((player) => ({
      player,
      exactRank: exactRank.get(player.name) ?? player.rank,
      fallByExact: player.rank - (exactRank.get(player.name) ?? player.rank),
    }))
    .filter((entry) => entry.fallByExact > 0);

  const biggestExactFaller = [...fallCandidates].sort(
    (a, b) => b.fallByExact - a.fallByExact
  )[0];
  if (biggestExactFaller && biggestExactFaller.fallByExact > 0) {
    const { player, exactRank: exactRankValue, fallByExact } = biggestExactFaller;
    fallers.push({
      icon: "📉",
      title: "Täpsuse kuningas, edetabeli sulusepp",
      description: `${player.name} tabas enim 3-punktilisi (${player.exact}×), aga on edetabelis alles ${player.rank}. kohal — täpsus ei toonud medalit.`,
      stat: `#${exactRankValue} → #${player.rank}`,
      tone: "fall",
    });
  }

  const championFaller = [...players]
    .filter((p) => p.champion === 0 && p.championPick)
    .sort((a, b) => b.total - a.total)[0];
  if (championFaller) {
    fallers.push({
      icon: "😤",
      title: "Meistri möödapanek maksis kätte",
      description: `${championFaller.name} sai ${championFaller.total}p, aga vale meister (${championNominative(championFaller.championPick)}) maksis talle 5p — oleks olnud ${championFaller.total + 5}p.`,
      stat: `-${5}p`,
      tone: "fall",
    });
  }

  const drawLover = topEntry(drawCounts);
  if (drawLover) {
    unlucky.push({
      icon: "🤝",
      title: "Viigi usku",
      description: `${drawLover[0]} ennustas ${drawLover[1]} viiki — rohkem kui keegi teine, aga tegelikke viike oli vaid 20.`,
      stat: `${drawLover[1]}× viik`,
      tone: "unlucky",
    });
  }

  if (popularChampion) {
    highlights.push({
      icon: "👑",
      title: "Populaarseim meister",
      description: `${popularChampion[1]} mängijat ennustasid ${championPartitive(popularChampion[0]).toLowerCase()} maailmameistriks.${
        popularChampion[0] === championActual ? " Ja see töötas!" : ""
      }`,
      stat: `${popularChampion[1]}× ${championPartitive(popularChampion[0])}`,
      tone: "highlight",
    });
  }

  return shuffleFacts(
    [...highlights, ...unlucky, ...fallers],
    `${data.championActual ?? "mm"}-${data.players.length}-${data.matches.length}`
  );
}
