"use client";

import { teamFlag } from "@/lib/flags";
import type { PlayerScore } from "@/lib/types";

export function LeaderboardTable({ players }: { players: PlayerScore[] }) {
  return (
    <div className="overflow-x-auto rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-white/10 text-white/50 text-xs uppercase tracking-wider">
            <th className="px-4 py-3 text-left w-12">#</th>
            <th className="px-4 py-3 text-left">Mängija</th>
            <th className="px-4 py-3 text-center">Täpne</th>
            <th className="px-4 py-3 text-center">Tulemus</th>
            <th className="px-4 py-3 text-center">Meister</th>
            <th className="px-4 py-3 text-right">Kokku</th>
            <th className="px-4 py-3 text-left hidden sm:table-cell">Ennustus</th>
          </tr>
        </thead>
        <tbody>
          {players.map((p, i) => (
            <tr
              key={p.name}
              className={`border-b border-white/5 transition-colors hover:bg-white/5 ${
                i < 3 ? "bg-white/[0.03]" : ""
              }`}
            >
              <td className="px-4 py-3">
                <span
                  className={`inline-flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold ${
                    p.rank === 1
                      ? "bg-gold/20 text-gold"
                      : p.rank === 2
                        ? "bg-white/10 text-white/70"
                        : p.rank === 3
                          ? "bg-amber-700/20 text-amber-400"
                          : "text-white/40"
                  }`}
                >
                  {p.rank}
                </span>
              </td>
              <td className="px-4 py-3 font-semibold text-white">{p.name}</td>
              <td className="px-4 py-3 text-center text-emerald-400 tabular-nums">
                {p.exact}
                <span className="text-white/30 text-xs ml-0.5">×3</span>
              </td>
              <td className="px-4 py-3 text-center text-sky-400 tabular-nums">
                {p.result}
                <span className="text-white/30 text-xs ml-0.5">×1</span>
              </td>
              <td className="px-4 py-3 text-center text-gold tabular-nums">
                {p.champion}
                <span className="text-white/30 text-xs ml-0.5">×5</span>
              </td>
              <td className="px-4 py-3 text-right font-black text-lg text-white tabular-nums">
                {p.total}
              </td>
              <td className="px-4 py-3 hidden sm:table-cell text-white/40 text-xs truncate max-w-[140px]">
                {p.championPick ? (
                  <span>
                    {teamFlag(p.championPick)} {p.championPick}
                  </span>
                ) : (
                  "—"
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
