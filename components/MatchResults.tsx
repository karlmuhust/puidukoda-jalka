"use client";

import { teamFlag } from "@/lib/flags";
import { formatKickoffTallinn } from "@/lib/datetime";
import { formatScore } from "@/lib/scoring";
import type { PoolMatch } from "@/lib/types";

function ScoreBadge({ score }: { score: { home: number; away: number } }) {
  return (
    <span className="font-mono font-bold text-white text-lg tabular-nums">
      {formatScore(score)}
    </span>
  );
}

function KickoffLabel({ match }: { match: PoolMatch }) {
  if (match.kickoffUtc) {
    return (
      <span className="text-[11px] text-white/50 text-center leading-tight">
        {formatKickoffTallinn(match.kickoffUtc)}
        <span className="block text-[9px] text-white/30">Tallinn</span>
      </span>
    );
  }
  if (match.date) {
    return (
      <span className="text-xs text-white/30">
        {new Date(match.date).toLocaleDateString("et-EE", {
          day: "numeric",
          month: "short",
        })}
      </span>
    );
  }
  return <span className="text-xs text-white/30">—</span>;
}

function MatchRow({ match }: { match: PoolMatch }) {
  const showKickoff = !match.actual;

  return (
    <div className="flex items-center gap-3 px-4 py-3 border-b border-white/5 last:border-0 hover:bg-white/[0.03] transition-colors">
      <span className="w-6 text-xs font-bold text-white/30 shrink-0">
        {match.group}
      </span>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <span className="text-sm text-white/90 truncate">
            {teamFlag(match.home)} {match.homeEt}
          </span>
          {match.actual ? (
            <ScoreBadge score={match.actual} />
          ) : match.status === "live" ? (
            <div className="flex flex-col items-center gap-0.5">
              <span className="live-pulse text-xs font-bold text-red-400 uppercase tracking-wider">
                LIVE
              </span>
              {match.kickoffUtc && (
                <span className="text-[9px] text-white/30">
                  {formatKickoffTallinn(match.kickoffUtc)}
                </span>
              )}
            </div>
          ) : showKickoff ? (
            <KickoffLabel match={match} />
          ) : (
            <span className="text-xs text-white/30">—</span>
          )}
          <span className="text-sm text-white/90 truncate text-right">
            {match.awayEt} {teamFlag(match.away)}
          </span>
        </div>
        {match.ground && (
          <p className="text-[10px] text-white/25 mt-0.5 truncate">
            {match.ground}
          </p>
        )}
      </div>
    </div>
  );
}

export function MatchResults({ matches }: { matches: PoolMatch[] }) {
  const finished = matches.filter((m) => m.actual !== null);
  const live = matches.filter((m) => m.status === "live" && !m.actual);
  const upcoming = matches
    .filter((m) => m.status === "upcoming")
    .sort((a, b) => {
      if (!a.kickoffUtc) return 1;
      if (!b.kickoffUtc) return -1;
      return (
        new Date(a.kickoffUtc).getTime() - new Date(b.kickoffUtc).getTime()
      );
    })
    .slice(0, 6);

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm overflow-hidden">
        <div className="px-4 py-3 border-b border-white/10 flex items-center justify-between">
          <h3 className="font-semibold text-white text-sm">
            Viimased tulemused
          </h3>
          <span className="text-xs text-white/40">{finished.length} mängu</span>
        </div>
        <div className="max-h-80 overflow-y-auto">
          {finished.length === 0 ? (
            <p className="px-4 py-8 text-center text-white/30 text-sm">
              Tulemusi pole veel
            </p>
          ) : (
            finished
              .slice()
              .reverse()
              .slice(0, 12)
              .map((m) => <MatchRow key={m.id} match={m} />)
          )}
        </div>
      </div>

      <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm overflow-hidden">
        <div className="px-4 py-3 border-b border-white/10 flex items-center justify-between">
          <h3 className="font-semibold text-white text-sm">
            {live.length > 0 ? "Otse & tulevased" : "Järgmised mängud"}
          </h3>
          {live.length > 0 && (
            <span className="live-pulse text-xs font-bold text-red-400">
              {live.length} LIVE
            </span>
          )}
        </div>
        <div className="max-h-80 overflow-y-auto">
          {[...live, ...upcoming].length === 0 ? (
            <p className="px-4 py-8 text-center text-white/30 text-sm">
              Rohkem mänge ei ole
            </p>
          ) : (
            [...live, ...upcoming].map((m) => (
              <MatchRow key={m.id} match={m} />
            ))
          )}
        </div>
      </div>
    </div>
  );
}
