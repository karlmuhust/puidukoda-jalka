"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { Podium } from "./Podium";
import { LeaderboardTable } from "./LeaderboardTable";
import { MatchResults } from "./MatchResults";
import { FullPredictionTable } from "./FullPredictionTable";
import { FactsTab } from "./FactsTab";
import { TabNav } from "./TabNav";
import { getPollIntervalMs, hasNewFinishedResults } from "@/lib/refresh";
import { TOURNAMENT_ARCHIVED } from "@/lib/config";
import type { LeaderboardData } from "@/lib/types";

type Tab = "leaderboard" | "fulltable" | "facts";

export function Dashboard() {
  const [data, setData] = useState<LeaderboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>("leaderboard");
  const [refreshing, setRefreshing] = useState(false);
  const dataRef = useRef<LeaderboardData | null>(null);

  const fetchData = useCallback(async (force = false) => {
    const isInitial = dataRef.current === null;
    try {
      const res = await fetch(`/api/leaderboard?_=${Date.now()}`, {
        cache: "no-store",
        headers: { Pragma: "no-cache", "Cache-Control": "no-cache" },
      });
      if (!res.ok) throw new Error("Failed to fetch");
      const json: LeaderboardData = await res.json();

      const shouldUpdate =
        force || hasNewFinishedResults(dataRef.current, json);

      if (shouldUpdate) {
        if (!isInitial) setRefreshing(true);
        dataRef.current = json;
        setData(json);
        setError(null);
        if (!isInitial) {
          setTimeout(() => setRefreshing(false), 1500);
        }
      } else {
        dataRef.current = json;
      }
    } catch {
      if (isInitial) setError("Andmete laadimine ebaõnnestus");
    } finally {
      if (isInitial) setLoading(false);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    let timeoutId: ReturnType<typeof setTimeout>;

    const scheduleNext = () => {
      if (cancelled || TOURNAMENT_ARCHIVED) return;
      const interval = dataRef.current
        ? getPollIntervalMs(dataRef.current.matches)
        : 15 * 60 * 1000;
      timeoutId = setTimeout(poll, interval);
    };

    const poll = async (force = false) => {
      await fetchData(force || dataRef.current === null);
      scheduleNext();
    };

    poll(true);

    if (TOURNAMENT_ARCHIVED) {
      return () => {
        cancelled = true;
      };
    }

    const onVisible = () => {
      if (document.visibilityState === "visible") {
        clearTimeout(timeoutId);
        poll(true);
      }
    };
    document.addEventListener("visibilitychange", onVisible);

    const onPageShow = (event: PageTransitionEvent) => {
      if (event.persisted) poll(true);
    };
    window.addEventListener("pageshow", onPageShow);

    return () => {
      cancelled = true;
      clearTimeout(timeoutId);
      document.removeEventListener("visibilitychange", onVisible);
      window.removeEventListener("pageshow", onPageShow);
    };
  }, [fetchData]);

  const finishedCount =
    data?.matches.filter((m) => m.actual !== null).length ?? 0;
  const liveCount =
    data?.matches.filter((m) => m.status === "live" && !m.actual).length ?? 0;

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <div className="w-12 h-12 rounded-full border-2 border-gold/30 border-t-gold animate-spin" />
        <p className="text-white/50 text-sm">Laadin tulemusi...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <p className="text-red-400">{error ?? "Viga"}</p>
        <button
          onClick={() => fetchData(true)}
          className="px-4 py-2 rounded-lg bg-white/10 text-white text-sm hover:bg-white/20 transition-colors"
        >
          Proovi uuesti
        </button>
      </div>
    );
  }

  const statsBar = (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      {[
        { label: "Mängijaid", value: data.players.length },
        { label: "Mänge mängitud", value: finishedCount },
        ...(data.archived
          ? [
              {
                label: "Meister",
                value: data.championActual ?? "—",
                small: true,
              },
            ]
          : [
              {
                label: "Otse praegu",
                value: liveCount,
                highlight: liveCount > 0,
              },
            ]),
        {
          label: data.archived ? "Arhiveeritud" : "Viimati uuendatud",
          value: data.archived
            ? "MM 2026"
            : new Date(data.lastUpdated).toLocaleTimeString("et-EE", {
                hour: "2-digit",
                minute: "2-digit",
              }),
          small: true,
        },
      ].map((stat) => (
        <div
          key={stat.label}
          className="rounded-xl border border-white/10 bg-white/5 backdrop-blur-sm px-4 py-3"
        >
          <p className="text-[10px] uppercase tracking-wider text-white/40 mb-1">
            {stat.label}
          </p>
          <p
            className={`font-black tabular-nums ${
              stat.highlight
                ? "text-red-400 live-pulse"
                : stat.small
                  ? "text-lg text-white/70"
                  : "text-2xl text-white"
            }`}
          >
            {stat.value}
          </p>
        </div>
      ))}
    </div>
  );

  const contentWidth = "max-w-5xl mx-auto px-4 sm:px-6";

  return (
    <div className="space-y-10">
      <div
        className={`flex flex-col items-center gap-3 ${
          activeTab === "fulltable" ? "w-full" : contentWidth
        }`}
      >
        <TabNav active={activeTab} onChange={setActiveTab} />
        {refreshing && (
          <span className="text-[10px] text-gold/70 uppercase tracking-widest">
            Uued tulemused!
          </span>
        )}
      </div>

      {activeTab === "leaderboard" ? (
        <div className={`${contentWidth} space-y-10`}>
          <section>
            <h2 className="text-center text-xs uppercase tracking-[0.3em] text-white/40 mb-6">
              Edetabel
            </h2>
            <Podium players={data.players} />
          </section>

          <section>
            <LeaderboardTable players={data.players} />
          </section>

          <section>
            <h2 className="text-xs uppercase tracking-[0.3em] text-white/40 mb-4">
              Mängud
            </h2>
            <MatchResults matches={data.matches} />
          </section>
        </div>
      ) : activeTab === "facts" ? (
        <section className="w-full">
          <h2 className="text-center text-xs uppercase tracking-[0.3em] text-white/40 mb-6">
            Huvitavad faktid
          </h2>
          <FactsTab data={data} />
        </section>
      ) : (
        <section className="w-full max-w-none">
          <h2 className="text-center text-xs uppercase tracking-[0.3em] text-white/40 mb-6">
            Kõik ennustused
          </h2>
          <FullPredictionTable grid={data.grid} />
        </section>
      )}

      <div
        className={
          activeTab === "fulltable"
            ? "w-full px-4 sm:px-6"
            : `${contentWidth}`
        }
      >
        {statsBar}
      </div>

      {/* Rules footer */}
      <footer
        className={`rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm p-6 text-center ${
          activeTab === "fulltable" ? "w-full px-4 sm:px-6" : contentWidth
        }`}
      >
        <p className="text-xs uppercase tracking-widest text-white/30 mb-3">
          Mängureeglid
        </p>
        <div className="flex flex-wrap justify-center gap-6 text-sm text-white/60">
          <span>
            Täpne tulemus{" "}
            <strong className="text-emerald-400">
              {data.rules.exactScore}p
            </strong>
          </span>
          <span>
            Õige tulemus{" "}
            <strong className="text-sky-400">
              {data.rules.correctResult}p
            </strong>
          </span>
          <span>
            Meister{" "}
            <strong className="text-gold">{data.rules.champion}p</strong>
          </span>
          <span>
            Osamaks{" "}
            <strong className="text-white">{data.rules.entryFee}</strong>
          </span>
        </div>
        <div className="flex flex-wrap justify-center gap-4 mt-3 text-xs text-white/30">
          {data.rules.prizes.map((p) => (
            <span key={p.place}>
              {p.place} koht {p.amount}
            </span>
          ))}
        </div>
        <p className="text-[10px] text-white/20 mt-4">
          {data.archived
            ? "Turniir on lõppenud — edetabel on arhiveeritud"
            : "Tulemused uuenevad automaatselt pärast mängu lõppu · openfootball/worldcup.json · thestatsapi.com"}
        </p>
      </footer>
    </div>
  );
}
