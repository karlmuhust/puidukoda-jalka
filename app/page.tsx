import { Dashboard } from "@/components/Dashboard";

export const dynamic = "force-dynamic";

export default function Home() {
  return (
    <div className="min-h-screen pitch-bg">
      {/* Hero */}
      <header className="relative overflow-hidden border-b border-white/10">
        <div className="absolute inset-0 bg-gradient-to-b from-pitch-light/20 to-transparent pointer-events-none" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-gold/5 rounded-full blur-3xl pointer-events-none" />

        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 pt-10 pb-8 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-gold/30 bg-gold/10 text-gold text-xs font-medium uppercase tracking-widest mb-4">
            <span className="live-pulse w-1.5 h-1.5 rounded-full bg-gold inline-block" />
            Live edetabel
          </div>
          <h1 className="text-4xl sm:text-5xl font-black text-white tracking-tight">
            Muhu Puidukoda
          </h1>
          <p className="text-lg sm:text-xl text-white/50 mt-1 font-light">
            Jalgpalli MM 2026 ennustusmäng
          </p>
          <div className="flex items-center justify-center gap-3 mt-4 text-2xl">
            <span>🇺🇸</span>
            <span>🇲🇽</span>
            <span>🇨🇦</span>
          </div>
        </div>
      </header>

      <main className="w-full py-10">
        <Dashboard />
      </main>
    </div>
  );
}
