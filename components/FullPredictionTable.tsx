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

      <div className="w-full border-y border-white/10 bg-white/5 backdrop-blur-sm">
        <div className="overflow-x-auto w-full">
          <table className="w-full min-w-full table-fixed border-collapse text-xs">
            <colgroup>
              <col style={{ width: 36 }} />
              <col style={{ width: "13%" }} />
              <col style={{ width: "13%" }} />
              <col style={{ width: 52 }} />
              {grid.playerNames.map((name) => (
                <col key={name} />
              ))}
            </colgroup>
            <thead>
              <tr className="border-b border-white/10">
                <th className="px-2 py-2.5 text-left text-white/40 font-medium">
                  Gr
                </th>
                <th className="px-2 py-2.5 text-left text-white/40 font-medium">
                   
                </th>
                <th className="px-2 py-2.5 text-left text-white/40 font-medium">
                  
                </th>
                <th className="px-1 py-2.5 text-center text-white/40 font-medium border-r border-white/10">
                  Tulemus
                </th>
                {grid.playerNames.map((name) => (
                  <th
                    key={name}
                    className="px-0.5 py-2.5 text-center text-white/60 font-semibold truncate"
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
                    className="px-2 py-1.5 text-white/80 truncate"
                    title={row.homeEt}
                  >
                    {row.homeEt}
                  </td>
                  <td
                    className="px-2 py-1.5 text-white/80 truncate"
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
                        className="text-[10px] text-white/70 truncate block"
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
