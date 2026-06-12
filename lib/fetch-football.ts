const OPENFOOTBALL_URL =
  "https://raw.githubusercontent.com/openfootball/worldcup.json/master/2026/worldcup.json";

const FIXTURES_URL =
  "https://www.thestatsapi.com/world-cup/data/fixtures.json";

/** Live scores — always fetch fresh (no CDN / Data Cache) */
export async function fetchOpenFootballData() {
  const res = await fetch(OPENFOOTBALL_URL, {
    cache: "no-store",
    next: { revalidate: 0 },
    headers: { "Cache-Control": "no-cache" },
  });
  if (!res.ok) throw new Error(`openfootball fetch failed: ${res.status}`);
  return res.json();
}

/** Fixture schedule — re-fetch on each leaderboard request */
export async function fetchFixturesData() {
  const res = await fetch(FIXTURES_URL, {
    cache: "no-store",
    next: { revalidate: 0 },
    headers: { "Cache-Control": "no-cache" },
  });
  if (!res.ok) throw new Error(`fixtures fetch failed: ${res.status}`);
  return res.json();
}
