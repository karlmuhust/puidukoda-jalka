"use client";

type Tab = "leaderboard" | "fulltable";

export function TabNav({
  active,
  onChange,
}: {
  active: Tab;
  onChange: (tab: Tab) => void;
}) {
  const tabs: { id: Tab; label: string; icon: string }[] = [
    { id: "leaderboard", label: "Edetabel", icon: "🏆" },
    { id: "fulltable", label: "Täistabel", icon: "📋" },
  ];

  return (
    <div className="flex justify-center">
      <div className="inline-flex rounded-xl border border-white/10 bg-white/5 p-1 backdrop-blur-sm">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-all ${
              active === tab.id
                ? "bg-gold/20 text-gold shadow-sm"
                : "text-white/50 hover:text-white/80 hover:bg-white/5"
            }`}
          >
            <span>{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>
    </div>
  );
}
