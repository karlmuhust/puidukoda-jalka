/** Variant Estonian names → canonical Estonian display name */
const TEAM_ET_ALIASES: Record<string, string> = {
  "Lõuna-Aafrika": "Lõuna-Aafrika Vabariik",
};

/** Canonical Estonian team names → English names */
export const TEAM_ET_TO_EN: Record<string, string> = {
  Mehhiko: "Mexico",
  "Lõuna-Aafrika Vabariik": "South Africa",
  "Lõuna-Korea": "South Korea",
  Tšehhi: "Czech Republic",
  Kanada: "Canada",
  "Bosnia ja Hertsegoviina": "Bosnia & Herzegovina",
  USA: "USA",
  Paraguay: "Paraguay",
  Katar: "Qatar",
  Šveits: "Switzerland",
  Brasiilia: "Brazil",
  Maroko: "Morocco",
  Haiti: "Haiti",
  Šotimaa: "Scotland",
  Austraalia: "Australia",
  Türgi: "Turkey",
  Saksamaa: "Germany",
  "Curaçao": "Curaçao",
  Holland: "Netherlands",
  Jaapan: "Japan",
  Elevandiluurannik: "Ivory Coast",
  Ecuador: "Ecuador",
  Rootsi: "Sweden",
  Tuneesia: "Tunisia",
  Hispaania: "Spain",
  "Cabo Verde": "Cape Verde",
  Belgia: "Belgium",
  Egiptus: "Egypt",
  "Saudi Araabia": "Saudi Arabia",
  Uruguay: "Uruguay",
  Iraan: "Iran",
  "Uus-Meremaa": "New Zealand",
  Prantsusmaa: "France",
  Senegal: "Senegal",
  Iraak: "Iraq",
  Norra: "Norway",
  Argentina: "Argentina",
  Alžeeria: "Algeria",
  Austria: "Austria",
  Jordaania: "Jordan",
  Portugal: "Portugal",
  "DR Kongo": "DR Congo",
  Inglismaa: "England",
  Horvaatia: "Croatia",
  Ghana: "Ghana",
  Panama: "Panama",
  Usbekistan: "Uzbekistan",
  Colombia: "Colombia",
};

/** Champion picks in Estonian → English */
export const CHAMPION_ET_TO_EN: Record<string, string> = {
  Portugal: "Portugal",
  Belgia: "Belgium",
  Hispaania: "Spain",
  Türgi: "Turkey",
  Prantsusmaa: "France",
  Norra: "Norway",
  Brasiilia: "Brazil",
  Holland: "Netherlands",
};

const ALIASES: Record<string, string[]> = {
  "South Korea": ["Korea Republic", "Korea", "South Korea"],
  "Czech Republic": ["Czechia", "Czech Republic"],
  "Bosnia & Herzegovina": [
    "Bosnia and Herzegovina",
    "Bosnia & Herzegovina",
  ],
  USA: ["USA", "United States", "US"],
  "Ivory Coast": ["Ivory Coast", "Côte d'Ivoire", "Cote d'Ivoire"],
  Netherlands: ["Netherlands", "Holland"],
  "DR Congo": ["DR Congo", "Congo DR", "Congo"],
};

export function normalizeTeamEt(name: string): string {
  const trimmed = name.trim();
  return TEAM_ET_ALIASES[trimmed] ?? trimmed;
}

export function normalizeTeam(name: string): string {
  const trimmed = name.trim();
  if (!trimmed) return trimmed;

  for (const [canonical, aliases] of Object.entries(ALIASES)) {
    if (aliases.some((a) => a.toLowerCase() === trimmed.toLowerCase())) {
      return canonical;
    }
    if (canonical.toLowerCase() === trimmed.toLowerCase()) {
      return canonical;
    }
  }

  return trimmed;
}

export function etToEn(teamEt: string): string {
  const canonicalEt = normalizeTeamEt(teamEt);
  return normalizeTeam(TEAM_ET_TO_EN[canonicalEt] ?? canonicalEt);
}

export function teamsMatch(a: string, b: string): boolean {
  return normalizeTeam(a).toLowerCase() === normalizeTeam(b).toLowerCase();
}

/** Order-independent key for API lookup */
export function matchKey(team1: string, team2: string): string {
  const t1 = normalizeTeam(team1).toLowerCase();
  const t2 = normalizeTeam(team2).toLowerCase();
  return [t1, t2].sort().join("|");
}

/** Order-dependent key — home team first (matches spreadsheet & fixtures) */
export function fixtureKey(home: string, away: string): string {
  return `${normalizeTeam(home).toLowerCase()}|${normalizeTeam(away).toLowerCase()}`;
}
