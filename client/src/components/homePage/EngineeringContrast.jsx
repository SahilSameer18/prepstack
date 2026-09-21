import React from "react";
import { FiCheck, FiX, FiLayers, FiAlertTriangle, FiZap } from "react-icons/fi";

const COMPARISON_ROWS = [
  {
    feature: "Problem Tracking",
    legacy: "Scattered spreadsheets, manual Notion checklists abandoned after 10 days",
    prepstack: "Atomic DB synchronization across Blind 75, NeetCode 150, and Striver SDE",
    latency: "Real-time",
  },
  {
    feature: "Pattern Progression",
    legacy: "Random 500+ LeetCode question grind without understanding underlying heuristics",
    prepstack: "Pattern taxonomy: Two Pointers → Sliding Window → Topo Sort → Dynamic Programming",
    latency: "Curated 75",
  },
  {
    feature: "System Architecture",
    legacy: "Generic clone projects (Netflix clone, to-do list) that recruiters immediately skip",
    prepstack: "Production blueprints: Rate limiters, distributed WAL caches, p99 latency SLAs",
    latency: "FAANG Bar",
  },
  {
    feature: "CS Fundamentals",
    legacy: "Dry, fragmented academic slides without interview focus or memory diagrams",
    prepstack: "OS virtual memory, DBMS B-Trees, TCP handshakes, and exact FAANG debriefs",
    latency: "High-Signal",
  },
];

const EngineeringContrast = () => {
  return (
    <section className="relative text-left">
      <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-16">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.03] border border-white/[0.1] shadow-[inset_0_1px_0_rgba(255,255,255,0.12)] mb-4">
          <FiLayers className="text-xs text-[#ffa116]" />
          <span className="text-[11px] font-mono uppercase tracking-widest text-[#ffa116] font-semibold">
            System Architecture Contrast
          </span>
        </div>
        <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight mb-4">
          Why serious engineers choose <span className="text-[#ffa116]">PrepStack</span>
        </h2>
        <p className="text-sm sm:text-base text-zinc-400 leading-relaxed">
          Interview preparation shouldn't require 15 browser tabs, forgotten Google spreadsheets, and unguided grind.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6 lg:gap-8 max-w-5xl mx-auto">
        {/* ── The Fragmented Grind ── */}
        <div className="p-6 sm:p-8 rounded-2xl bg-[#0a0a0c] border border-red-500/20 shadow-xl relative overflow-hidden flex flex-col justify-between">
          <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-rose-500/30 to-transparent" />

          <div>
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/[0.06]">
              <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-rose-400 font-semibold">
                <FiAlertTriangle className="text-sm" />
                Fragmented Legacy Grind
              </div>
              <span className="text-[10px] font-mono text-zinc-400 px-2 py-0.5 rounded bg-rose-500/10 border border-rose-500/20">
                Low Conversion
              </span>
            </div>

            <ul className="space-y-4 text-sm text-zinc-400">
              <li className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-md bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center shrink-0 mt-0.5">
                  <FiX className="text-xs" />
                </div>
                <span>Jumping across 20+ disconnected YouTube playlists with zero persistent progress tracking.</span>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-md bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center shrink-0 mt-0.5">
                  <FiX className="text-xs" />
                </div>
                <span>Unmaintained spreadsheets and Notion templates that get abandoned by day 10.</span>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-md bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center shrink-0 mt-0.5">
                  <FiX className="text-xs" />
                </div>
                <span>Building generic clone projects (to-do lists, weather apps) that recruiters immediately skip past.</span>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-md bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center shrink-0 mt-0.5">
                  <FiX className="text-xs" />
                </div>
                <span>Memorizing textbook theory without understanding real-world concurrency, deadlocks, or database indexes.</span>
              </li>
            </ul>
          </div>

          <div className="mt-8 pt-4 border-t border-white/[0.06] flex items-center justify-between font-mono text-[11px] text-zinc-500">
            <span>Friction: Context switching &amp; zero persistence</span>
            <span className="text-rose-400 font-mono text-[10.5px] bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/20">
              High Friction
            </span>
          </div>
        </div>

        {/* ── The PrepStack Pipeline ── */}
        <div className="p-6 sm:p-8 rounded-2xl titanium-card relative overflow-hidden flex flex-col justify-between group">
          {/* Subtle top specular horizon */}
          <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-[#ffa116]/50 to-transparent" />

          <div>
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/[0.08]">
              <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-[#ffa116] font-semibold">
                <FiZap className="text-sm text-[#ffa116]" />
                The PrepStack Pipeline
              </div>
              <span className="text-[10px] font-mono font-semibold bg-[#ffa116]/10 px-2 py-0.5 rounded border border-[#ffa116]/25 text-[#ffa116]">
                Engineered High-Signal
              </span>
            </div>

            <ul className="space-y-4 text-sm text-zinc-200">
              <li className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-md bg-[#ffa116]/15 border border-[#ffa116]/30 text-[#ffa116] flex items-center justify-center shrink-0 mt-0.5 shadow-[0_0_8px_rgba(255,161,22,0.3)]">
                  <FiCheck className="text-xs" />
                </div>
                <span>Unified dashboard syncing every solved problem atomically across Blind 75, NeetCode, and Striver.</span>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-md bg-[#ffa116]/15 border border-[#ffa116]/30 text-[#ffa116] flex items-center justify-center shrink-0 mt-0.5 shadow-[0_0_8px_rgba(255,161,22,0.3)]">
                  <FiCheck className="text-xs" />
                </div>
                <span>Curated algorithmic pattern progression (Two Pointers &rarr; Sliding Window &rarr; Graph &rarr; DP).</span>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-md bg-[#ffa116]/15 border border-[#ffa116]/30 text-[#ffa116] flex items-center justify-center shrink-0 mt-0.5 shadow-[0_0_8px_rgba(255,161,22,0.3)]">
                  <FiCheck className="text-xs" />
                </div>
                <span>AI system architect generating production blueprints with latency specs, schemas, and indexing tradeoffs.</span>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-md bg-[#ffa116]/15 border border-[#ffa116]/30 text-[#ffa116] flex items-center justify-center shrink-0 mt-0.5 shadow-[0_0_8px_rgba(255,161,22,0.3)]">
                  <FiCheck className="text-xs" />
                </div>
                <span>Synthesized OS, DBMS, Networks, and OOPs internals with exact interview question debriefs.</span>
              </li>
            </ul>
          </div>

          <div className="mt-8 pt-4 border-t border-white/[0.08] flex items-center justify-between font-mono text-[11px] text-[#ffa116]">
            <span>Advantage: Atomic DB sync &amp; structured patterns</span>
            <span className="font-bold text-[#ffa116] bg-[#ffa116]/10 px-2 py-0.5 rounded border border-[#ffa116]/20 text-[10.5px]">
              Single Source of Truth
            </span>
          </div>
        </div>
      </div>

      {/* ── Architectural Diff Breakdown ── */}
      <div className="mt-8 max-w-5xl mx-auto rounded-2xl titanium-card overflow-hidden">
        <div className="px-5 py-3.5 border-b border-white/[0.08] bg-[#0e0e12] flex items-center justify-between">
          <span className="font-mono text-xs uppercase tracking-wider text-zinc-300 font-semibold flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#ffa116]" />
            Feature-by-Feature Benchmark
          </span>
          <span className="font-mono text-[11px] text-zinc-500">Linear Architecture Standard</span>
        </div>
        <div className="divide-y divide-white/[0.06]">
          {COMPARISON_ROWS.map((row, idx) => (
            <div key={idx} className="p-4 sm:p-5 grid sm:grid-cols-12 gap-3 sm:gap-6 items-center hover:bg-white/[0.02] transition-colors">
              <div className="sm:col-span-3">
                <span className="font-display font-bold text-sm text-white">{row.feature}</span>
                <span className="block font-mono text-[10px] text-[#ffa116] mt-0.5">{row.latency}</span>
              </div>
              <div className="sm:col-span-4 text-xs text-zinc-500 flex items-start gap-2">
                <FiX className="text-rose-400 text-xs shrink-0 mt-0.5" />
                <span>{row.legacy}</span>
              </div>
              <div className="sm:col-span-5 text-xs text-zinc-200 flex items-start gap-2">
                <FiCheck className="text-[#ffa116] text-xs shrink-0 mt-0.5" />
                <span className="font-medium">{row.prepstack}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default EngineeringContrast;
