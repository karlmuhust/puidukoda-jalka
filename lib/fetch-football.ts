const OPENFOOTBALL_URL =
  "https://raw.githubusercontent.com/openfootball/worldcup.json/master/2026/worldcup.json";

const FIXTURES_URL =
  "https://www.thestatsapi.com/world-cup/data/fixtures.json";

/** Live scores — always fetch fresh (no CDN / Data Cache) */
export async function fetchOpenFootballData() {
  const res = await fetch(OPENFOOTBALL_URL, { cache: "no-store" });
  if (!res.ok) throw new Error(`openfootball fetch failed: ${res.status}`);
  return res.json();
}

/** Fixture schedule — changes rarely; short revalidate is fine on Vercel */
export async function fetchFixturesData() {
  const res = await fetch(FIXTURES_URL, { next: { revalidate: 3600 } });
  if (!res.ok) throw new Error(`fixtures fetch failed: ${res.status}`);
  return res.json();
}
