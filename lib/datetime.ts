const TALLINN_TZ = "Europe/Tallinn";

export function formatKickoffTallinn(kickoffUtc: string): string {
  const date = new Date(kickoffUtc);
  const day = date.toLocaleDateString("et-EE", {
    timeZone: TALLINN_TZ,
    day: "numeric",
    month: "short",
  });
  const time = date.toLocaleTimeString("et-EE", {
    timeZone: TALLINN_TZ,
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
  return `${day} · ${time}`;
}
