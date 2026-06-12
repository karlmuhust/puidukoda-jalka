"use client";

import { teamFlag } from "@/lib/flags";
import type { PredictionCell, PredictionGrid } from "@/lib/types";

const CELL_STYLES: Record<PredictionCell["type"], string> = {
  exact: "bg-emerald-500/20 text-emerald-300 ring-1 ring-emerald-500/30",
  result: "bg-sky-500/15 text-sky-300 ring-1 ring-sky-500/20",
  none: "text-white/40",
  pending: "text-white/70",
};

function PredictionBadge({ cell }: { cell: PredictionCell }) {
  return (
    <div className="flex flex-col items-center justify-center gap-0.5">
      <span
        className={`inline-block px-1 py-0.5 rounded font-mono text-[11px] font-semibold tabular-nums leading-none ${CELL_STYLES[cell.type]}`}
      >
        {cell.raw}
      </span>
      {cell.points !== null && cell.points > 0 && (
        <span className="text-[9px] text-white/30 tabular-nums leading-none">
          +{cell.points}p
        </span>
      )}
    </div>
  );
}

export function FullPredictionTable({ grid }: { grid: PredictionGrid }) {
  return (
    <div className="w-full space-y-3">
      <div className="flex flex-wrap justify-center gap-4 px-4 text-xs text-white/40">
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded bg-emerald-500/30 ring-1 ring-emerald-500/40" />
          Täpne (3p)
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded bg-sky-500/25 ring-1 ring-sky-500/30" />
          Õige tulemus (1p)
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded bg-white/10" />
          Ootel / vale
        </span>
      </div>

      <p className="hidden max-[999px]:block text-center text-[10px] text-white/35 px-4">
        Keri horisontaalselt, et näha kõiki mängijaid →
      </p>

      <div className="w-full max-w-none border-y border-white/10 bg-white/5 backdrop-blur-sm">
        <div className="table-scroll-x max-[999px]:overflow-x-auto min-[1000px]:overflow-visible w-full max-w-none overscroll-x-contain">
          <table className="full-prediction-table border-collapse text-xs">
            <colgroup className="min-[1000px]:contents">
              <col className="max-[999px]:w-8 min-[1000px]:w-[36px]" />
              <col className="max-[999px]:w-[108px] min-[1000px]:w-[13%]" />
              <col className="max-[999px]:w-[108px] min-[1000px]:w-[13%]" />
              <col className="max-[999px]:w-14 min-[1000px]:w-[52px]" />
              {grid.playerNames.map((name) => (
                <col
                  key={name}
                  className="max-[999px]:w-14 min-[1000px]:w-auto"
                />
              ))}
            </colgroup>
            <thead>
              <tr className="border-b border-white/10">
                <th className="px-2 py-2.5 text-left text-white/40 font-medium">
                  Gr
                </th>
                <th className="px-2 py-2.5 text-left text-white/40 font-medium">
                  Kodu
                </th>
                <th className="px-2 py-2.5 text-left text-white/40 font-medium">
                  Võõrsil
                </th>
                <th className="px-1 py-2.5 text-center text-white/40 font-medium border-r border-white/10">
                  Tulemus
                </th>
                {grid.playerNames.map((name) => (
                  <th
                    key={name}
                    className="px-0.5 py-2.5 text-center text-white/60 font-semibold whitespace-nowrap min-[1000px]:truncate"
                    title={name}
                  >
                    {name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {grid.rows.map((row, i) => (
                <tr
                  key={row.matchId}
                  className={`border-b border-white/5 ${
                    i % 2 === 0 ? "" : "bg-white/[0.015]"
                  }`}
                >
                  <td className="px-2 py-1.5 font-bold text-white/30 text-center">
                    {row.group}
                  </td>
                  <td
                    className="px-2 py-1.5 text-white/80 whitespace-nowrap min-[1000px]:truncate"
                    title={row.homeEt}
                  >
                    {row.homeEt}
                  </td>
                  <td
                    className="px-2 py-1.5 text-white/80 whitespace-nowrap min-[1000px]:truncate"
                    title={row.awayEt}
                  >
                    {row.awayEt}
                  </td>
                  <td className="px-1 py-1.5 text-center border-r border-white/10">
                    {row.actual ? (
                      <span className="font-mono font-bold text-gold tabular-nums text-[11px]">
                        {row.actual}
                      </span>
                    ) : (
                      <span className="text-white/20">—</span>
                    )}
                  </td>
                  {grid.playerNames.map((name) => (
                    <td key={name} className="px-0.5 py-1.5 text-center">
                      <PredictionBadge cell={row.predictions[name]} />
                    </td>
                  ))}
                </tr>
              ))}

              <tr className="border-t-2 border-gold/20 bg-gold/5">
                <td
                  colSpan={4}
                  className="px-2 py-2 font-semibold text-gold border-r border-white/10"
                >
                  🏆 Meister
                </td>
                {grid.playerNames.map((name) => (
                  <td key={name} className="px-0.5 py-2 text-center">
                    {grid.championPicks[name] ? (
                      <span
                        className="text-[10px] text-white/70 whitespace-nowrap"
                        title={grid.championPicks[name]!}
                      >
                        {teamFlag(grid.championPicks[name]!)}
                      </span>
                    ) : (
                      <span className="text-white/20">—</span>
                    )}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
