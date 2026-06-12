"use client";

import { teamFlag } from "@/lib/flags";
import type { PlayerScore } from "@/lib/types";

const MEDAL = ["🥇", "🥈", "🥉"];
const HEIGHT = ["h-36", "h-28", "h-24"];
const ORDER = [1, 0, 2]; // 2nd, 1st, 3rd for visual podium

export function Podium({ players }: { players: PlayerScore[] }) {
  const top3 = players.slice(0, 3);
  if (top3.length === 0) return null;

  return (
    <div className="flex items-end justify-center gap-3 sm:gap-6 px-4">
      {ORDER.map((idx) => {
        const player = top3[idx];
        if (!player) return <div key={idx} className="w-24 sm:w-32" />;

        return (
          <div
            key={player.name}
            className="flex flex-col items-center w-24 sm:w-32 animate-fade-up"
            style={{ animationDelay: `${idx * 120}ms` }}
          >
            <span className="text-3xl sm:text-4xl mb-2">{MEDAL[idx]}</span>
            <div className="text-center mb-3">
              <p className="font-bold text-white text-sm sm:text-base truncate w-full">
                {player.name}
              </p>
              <p className="text-2xl sm:text-3xl font-black text-gold tabular-nums">
                {player.total}
              </p>
              <p className="text-xs text-white/50 mt-1">punkti</p>
              {player.championPick && (
                <p className="text-xs text-white/40 mt-1 truncate">
                  {teamFlag(player.championPick)} {player.championPick}
                </p>
              )}
            </div>
            <div
              className={`w-full ${HEIGHT[idx]} rounded-t-xl bg-gradient-to-t ${
                idx === 0
                  ? "from-gold/30 to-gold/10 border-t-2 border-gold/50"
                  : idx === 1
                    ? "from-white/20 to-white/5 border-t-2 border-white/30"
                    : "from-amber-700/30 to-amber-900/10 border-t-2 border-amber-600/30"
              } flex items-center justify-center`}
            >
              <span className="text-4xl sm:text-5xl font-black text-white/10">
                {player.rank}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
