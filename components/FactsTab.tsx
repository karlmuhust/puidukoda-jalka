"use client";

import { computeFacts } from "@/lib/facts";
import type { LeaderboardData } from "@/lib/types";

export function FactsTab({ data }: { data: LeaderboardData }) {
  const facts = computeFacts(data);

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 space-y-4">
      {facts.map((fact, i) => (
        <article
          key={fact.title}
          className="group rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm p-5 sm:p-6 transition-colors hover:bg-white/[0.07] animate-fade-up"
          style={{ animationDelay: `${i * 60}ms` }}
        >
          <div className="flex items-start gap-4">
            <span className="text-3xl sm:text-4xl shrink-0 select-none">
              {fact.icon}
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-3 mb-1">
                <h3 className="font-bold text-white text-base sm:text-lg">
                  {fact.title}
                </h3>
                {fact.stat && (
                  <span className="shrink-0 text-xs font-bold uppercase tracking-wider text-gold/80 bg-gold/10 border border-gold/20 rounded-full px-2.5 py-1">
                    {fact.stat}
                  </span>
                )}
              </div>
              <p className="text-sm text-white/60 leading-relaxed">
                {fact.description}
              </p>
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}
