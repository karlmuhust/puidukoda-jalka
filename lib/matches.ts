import {
  matchKey,
  fixtureKey,
  normalizeTeam,
  normalizeTeamEt,
  etToEn,
} from "./teams";
import {
  fetchOpenFootballData,
  fetchFixturesData,
} from "./fetch-football";
import type { PoolMatch, Score } from "./types";

interface OpenFootballMatch {
  round?: string;
  date?: string;
  time?: string;
  team1: string;
  team2: string;
  score?: { ft: [number, number]; ht?: [number, number] };
  goals1?: { name: string; minute: string }[];
  goals2?: { name: string; minute: string }[];
  group?: string;
  ground?: string;
}

interface OpenFootballData {
  matches: OpenFootballMatch[];
}

interface StatsFixture {
  matchNumber: number;
  date: string;
  kickoffUtc: string;
  stage: string;
  group?: string;
  homeTeam: string;
  awayTeam: string;
  stadium: string;
  hostCity: string;
}

interface StatsFixturesData {
  fixtures: StatsFixture[];
}

function toScore(ft: [number, number], team1: string, team2: string, homeTeam: string): Score {
  const homeIsTeam1 = normalizeTeam(team1) === normalizeTeam(homeTeam);
  if (homeIsTeam1) return { home: ft[0], away: ft[1] };
  return { home: ft[1], away: ft[0] };
}

export async function fetchLiveMatches(
  poolTeams: { homeEt: string; awayEt: string; group: string }[]
): Promise<PoolMatch[]> {
  const [ofData, fixData] = await Promise.all([
    fetchOpenFootballData().catch(() => ({ matches: [] } as OpenFootballData)),
    fetchFixturesData().catch(() => ({ fixtures: [] } as StatsFixturesData)),
  ]);

  const apiMatches = new Map<string, OpenFootballMatch>();
  for (const m of ofData.matches) {
    apiMatches.set(matchKey(m.team1, m.team2), m);
  }

  const fixtureMap = new Map<string, StatsFixture>();
  for (const f of fixData.fixtures) {
    fixtureMap.set(matchKey(f.homeTeam, f.awayTeam), f);
  }

  const now = new Date();

  return poolTeams.map((pool, i) => {
    const home = etToEn(pool.homeEt);
    const away = etToEn(pool.awayEt);
    const key = matchKey(home, away);
    const api = apiMatches.get(key);
    const fixture = fixtureMap.get(key);

    let actual: Score | null = null;
    let status: PoolMatch["status"] = "upcoming";
    const goals: PoolMatch["goals"] = [];

    if (api?.score?.ft) {
      actual = toScore(api.score.ft, api.team1, api.team2, home);
      status = "finished";
      api.goals1?.forEach((g) =>
        goals.push({ team: api.team1, scorer: g.name, minute: g.minute })
      );
      api.goals2?.forEach((g) =>
        goals.push({ team: api.team2, scorer: g.name, minute: g.minute })
      );
    } else if (fixture) {
      const kickoff = new Date(fixture.kickoffUtc);
      if (kickoff <= now) status = "live";
    }

    return {
      id: fixtureKey(home, away),
      group: pool.group,
      homeEt: normalizeTeamEt(pool.homeEt),
      awayEt: normalizeTeamEt(pool.awayEt),
      home,
      away,
      date: api?.date ?? fixture?.date,
      kickoffUtc: fixture?.kickoffUtc,
      round: api?.round ?? fixture?.stage,
      ground: api?.ground ?? fixture?.stadium,
      actual,
      status,
      goals,
    };
  });
}

export function getPoolMatchList(): { homeEt: string; awayEt: string; group: string }[] {
  const pairs: { homeEt: string; awayEt: string; group: string }[] = [
    { group: "A", homeEt: "Mehhiko", awayEt: "Lõuna-Aafrika Vabariik" },
    { group: "A", homeEt: "Lõuna-Korea", awayEt: "Tšehhi" },
    { group: "B", homeEt: "Kanada", awayEt: "Bosnia ja Hertsegoviina" },
    { group: "D", homeEt: "USA", awayEt: "Paraguay" },
    { group: "B", homeEt: "Katar", awayEt: "Šveits" },
    { group: "C", homeEt: "Brasiilia", awayEt: "Maroko" },
    { group: "C", homeEt: "Haiti", awayEt: "Šotimaa" },
    { group: "D", homeEt: "Austraalia", awayEt: "Türgi" },
    { group: "E", homeEt: "Saksamaa", awayEt: "Curaçao" },
    { group: "F", homeEt: "Holland", awayEt: "Jaapan" },
    { group: "E", homeEt: "Elevandiluurannik", awayEt: "Ecuador" },
    { group: "F", homeEt: "Rootsi", awayEt: "Tuneesia" },
    { group: "H", homeEt: "Hispaania", awayEt: "Cabo Verde" },
    { group: "G", homeEt: "Belgia", awayEt: "Egiptus" },
    { group: "H", homeEt: "Saudi Araabia", awayEt: "Uruguay" },
    { group: "G", homeEt: "Iraan", awayEt: "Uus-Meremaa" },
    { group: "I", homeEt: "Prantsusmaa", awayEt: "Senegal" },
    { group: "I", homeEt: "Iraak", awayEt: "Norra" },
    { group: "J", homeEt: "Argentina", awayEt: "Alžeeria" },
    { group: "J", homeEt: "Austria", awayEt: "Jordaania" },
    { group: "K", homeEt: "Portugal", awayEt: "DR Kongo" },
    { group: "L", homeEt: "Inglismaa", awayEt: "Horvaatia" },
    { group: "L", homeEt: "Ghana", awayEt: "Panama" },
    { group: "K", homeEt: "Usbekistan", awayEt: "Colombia" },
    { group: "A", homeEt: "Tšehhi", awayEt: "Lõuna-Aafrika Vabariik" },
    { group: "B", homeEt: "Šveits", awayEt: "Bosnia ja Hertsegoviina" },
    { group: "B", homeEt: "Kanada", awayEt: "Katar" },
    { group: "A", homeEt: "Mehhiko", awayEt: "Lõuna-Korea" },
    { group: "D", homeEt: "USA", awayEt: "Austraalia" },
    { group: "C", homeEt: "Šotimaa", awayEt: "Maroko" },
    { group: "C", homeEt: "Brasiilia", awayEt: "Haiti" },
    { group: "D", homeEt: "Türgi", awayEt: "Paraguay" },
    { group: "F", homeEt: "Holland", awayEt: "Rootsi" },
    { group: "E", homeEt: "Saksamaa", awayEt: "Elevandiluurannik" },
    { group: "E", homeEt: "Ecuador", awayEt: "Curaçao" },
    { group: "F", homeEt: "Tuneesia", awayEt: "Jaapan" },
    { group: "H", homeEt: "Hispaania", awayEt: "Saudi Araabia" },
    { group: "G", homeEt: "Belgia", awayEt: "Iraan" },
    { group: "H", homeEt: "Uruguay", awayEt: "Cabo Verde" },
    { group: "G", homeEt: "Uus-Meremaa", awayEt: "Egiptus" },
    { group: "J", homeEt: "Argentina", awayEt: "Austria" },
    { group: "I", homeEt: "Prantsusmaa", awayEt: "Iraak" },
    { group: "I", homeEt: "Norra", awayEt: "Senegal" },
    { group: "J", homeEt: "Jordaania", awayEt: "Alžeeria" },
    { group: "K", homeEt: "Portugal", awayEt: "Usbekistan" },
    { group: "L", homeEt: "Inglismaa", awayEt: "Ghana" },
    { group: "L", homeEt: "Panama", awayEt: "Horvaatia" },
    { group: "K", homeEt: "Colombia", awayEt: "DR Kongo" },
    { group: "B", homeEt: "Šveits", awayEt: "Kanada" },
    { group: "B", homeEt: "Bosnia ja Hertsegoviina", awayEt: "Katar" },
    { group: "C", homeEt: "Šotimaa", awayEt: "Brasiilia" },
    { group: "C", homeEt: "Maroko", awayEt: "Haiti" },
    { group: "A", homeEt: "Tšehhi", awayEt: "Mehhiko" },
    { group: "A", homeEt: "Lõuna-Aafrika Vabariik", awayEt: "Lõuna-Korea" },
    { group: "E", homeEt: "Curaçao", awayEt: "Elevandiluurannik" },
    { group: "E", homeEt: "Ecuador", awayEt: "Saksamaa" },
    { group: "F", homeEt: "Jaapan", awayEt: "Rootsi" },
    { group: "F", homeEt: "Tuneesia", awayEt: "Holland" },
    { group: "D", homeEt: "Türgi", awayEt: "USA" },
    { group: "D", homeEt: "Paraguay", awayEt: "Austraalia" },
    { group: "I", homeEt: "Norra", awayEt: "Prantsusmaa" },
    { group: "I", homeEt: "Senegal", awayEt: "Iraak" },
    { group: "H", homeEt: "Cabo Verde", awayEt: "Saudi Araabia" },
    { group: "H", homeEt: "Uruguay", awayEt: "Hispaania" },
    { group: "G", homeEt: "Egiptus", awayEt: "Iraan" },
    { group: "G", homeEt: "Uus-Meremaa", awayEt: "Belgia" },
    { group: "L", homeEt: "Panama", awayEt: "Inglismaa" },
    { group: "L", homeEt: "Horvaatia", awayEt: "Ghana" },
    { group: "K", homeEt: "Colombia", awayEt: "Portugal" },
    { group: "K", homeEt: "DR Kongo", awayEt: "Usbekistan" },
    { group: "J", homeEt: "Alžeeria", awayEt: "Austria" },
    { group: "J", homeEt: "Jordaania", awayEt: "Argentina" },
  ];
  return pairs;
}

export async function detectChampion(): Promise<string | null> {
  try {
    const ofData = (await fetchOpenFootballData()) as OpenFootballData;
    const final = ofData.matches.find(
      (m) => m.round?.toLowerCase() === "final"
    );
    if (!final?.score) return null;

    const result = final.score.et ?? final.score.ft;
    if (!result) return null;

    const [s1, s2] = result;
    if (s1 > s2) return normalizeTeam(final.team1);
    if (s2 > s1) return normalizeTeam(final.team2);
    return null;
  } catch {
    return null;
  }
}
