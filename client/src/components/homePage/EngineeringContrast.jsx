import React from "react";
import { FaCheck, FaTimes } from "react-icons/fa";

const EngineeringContrast = () => {
  return (
    <section className="relative">
      <div className="text-center max-w-2xl mx-auto mb-14 sm:mb-16">
        <p className="text-xs font-mono uppercase tracking-widest text-[#ffa116] font-semibold mb-3">
          Architecture &amp; Philosophy
        </p>
        <h2 className="font-display text-3xl sm:text-5xl font-extrabold text-white tracking-tight leading-tight mb-4">
          Why serious engineers choose <span className="text-[#ffa116]">PrepStack</span>
        </h2>
        <p className="text-sm sm:text-base text-zinc-400 leading-relaxed">
          Interview prep shouldn't require 15 browser tabs, forgotten Google sheets, and unguided grind.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6 lg:gap-8 max-w-5xl mx-auto">
        {/* ── The Fragmented Grind ── */}
        <div className="p-7 sm:p-9 rounded-2xl bg-[#0b0b0d] border border-white/[0.06] shadow-xl relative overflow-hidden text-left flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/[0.06]">
              <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-rose-400 font-semibold">
                <span className="w-2 h-2 rounded-full bg-rose-400/80" />
                The Fragmented Grind
              </div>
              <span className="text-[10px] font-mono text-zinc-500">Manual / Low Signal</span>
            </div>

            <ul className="space-y-4 text-sm text-zinc-400">
              <li className="flex items-start gap-3.5">
                <div className="w-5 h-5 rounded-md bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center shrink-0 mt-0.5 text-xs font-mono">
                  &times;
                </div>
                <span>Jumping across 20+ disconnected YouTube playlists with zero persistent progress tracking.</span>
              </li>
              <li className="flex items-start gap-3.5">
                <div className="w-5 h-5 rounded-md bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center shrink-0 mt-0.5 text-xs font-mono">
                  &times;
                </div>
                <span>Unmaintained spreadsheets and Notion templates that get abandoned by day 10.</span>
              </li>
              <li className="flex items-start gap-3.5">
                <div className="w-5 h-5 rounded-md bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center shrink-0 mt-0.5 text-xs font-mono">
                  &times;
                </div>
                <span>Building generic clone projects (to-do lists, weather apps) that recruiters immediately skip past.</span>
              </li>
              <li className="flex items-start gap-3.5">
                <div className="w-5 h-5 rounded-md bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center shrink-0 mt-0.5 text-xs font-mono">
                  &times;
                </div>
                <span>Memorizing textbook theory without understanding real-world concurrency, deadlocks, or database indexes.</span>
              </li>
            </ul>
          </div>

          <div className="mt-8 pt-4 border-t border-white/[0.05] font-mono text-[11px] text-zinc-500">
            Outcome: Wasted hours, low interview conversion, high anxiety
          </div>
        </div>

        {/* ── The PrepStack Pipeline ── */}
        <div className="p-7 sm:p-9 rounded-2xl luxury-card relative overflow-hidden text-left flex flex-col justify-between group">
          {/* Subtle top edge glow highlight */}
          <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-[#ffa116]/40 to-transparent" />

          <div>
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/[0.08]">
              <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-[#ffa116] font-semibold">
                <span className="w-2 h-2 rounded-full bg-[#ffa116] shadow-[0_0_8px_#ffa116]" />
                The PrepStack Pipeline
              </div>
              <span className="text-[10px] font-mono text-zinc-400 font-semibold bg-[#ffa116]/10 px-2 py-0.5 rounded border border-[#ffa116]/20 text-[#ffa116]">
                Engineered Workflow
              </span>
            </div>

            <ul className="space-y-4 text-sm text-zinc-200">
              <li className="flex items-start gap-3.5">
                <div className="w-5 h-5 rounded-md bg-[#ffa116]/15 border border-[#ffa116]/30 text-[#ffa116] flex items-center justify-center shrink-0 mt-0.5 text-xs font-mono">
                  &#10003;
                </div>
                <span>Unified dashboard syncing every solved problem atomically across Blind 75, NeetCode, and Striver.</span>
              </li>
              <li className="flex items-start gap-3.5">
                <div className="w-5 h-5 rounded-md bg-[#ffa116]/15 border border-[#ffa116]/30 text-[#ffa116] flex items-center justify-center shrink-0 mt-0.5 text-xs font-mono">
                  &#10003;
                </div>
                <span>Curated algorithmic pattern progression (Two Pointers &rarr; Sliding Window &rarr; Graph &rarr; DP).</span>
              </li>
              <li className="flex items-start gap-3.5">
                <div className="w-5 h-5 rounded-md bg-[#ffa116]/15 border border-[#ffa116]/30 text-[#ffa116] flex items-center justify-center shrink-0 mt-0.5 text-xs font-mono">
                  &#10003;
                </div>
                <span>AI system architect generating production blueprints with latency specs, schemas, and indexing tradeoffs.</span>
              </li>
              <li className="flex items-start gap-3.5">
                <div className="w-5 h-5 rounded-md bg-[#ffa116]/15 border border-[#ffa116]/30 text-[#ffa116] flex items-center justify-center shrink-0 mt-0.5 text-xs font-mono">
                  &#10003;
                </div>
                <span>Synthesized OS, DBMS, Networks, and OOPs internals with exact interview question debriefs.</span>
              </li>
            </ul>
          </div>

          <div className="mt-8 pt-4 border-t border-white/[0.08] font-mono text-[11px] text-[#ffa116] flex items-center justify-between">
            <span>Outcome: Structured mastery &amp; offer-ready confidence</span>
            <span>100% Focused</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default EngineeringContrast;
