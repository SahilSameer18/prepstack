import React from "react";
import { FaCheck, FaTimes } from "react-icons/fa";

const EngineeringContrast = () => {
  return (
    <section className="my-24">
      <div className="text-center max-w-2xl mx-auto mb-12">
        <p className="text-xs font-mono uppercase tracking-widest text-[#ffa116] mb-2">
          Architected For Focus
        </p>
        <h2 className="text-3xl sm:text-4xl font-black text-white">
          Why Engineers Choose <span className="text-[#ffa116]">PrepStack</span>
        </h2>
      </div>

      <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
        {/* The Fragmented Way */}
        <div className="p-6 sm:p-8 rounded-2xl bg-[#0e0e0e] border border-red-500/15 relative overflow-hidden">
          <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-red-400 mb-5">
            <FaTimes className="text-xs" /> The Fragmented Way
          </div>
          <ul className="space-y-4 text-sm text-gray-400">
            <li className="flex items-start gap-3">
              <span className="w-1.5 h-1.5 rounded-full bg-red-400/60 mt-2 flex-shrink-0" />
              <span>Jumping across 15 bookmarked YouTube playlists with zero persistent progress tracking.</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="w-1.5 h-1.5 rounded-full bg-red-400/60 mt-2 flex-shrink-0" />
              <span>Unmaintained Google Sheets and messy Notion templates that get abandoned after day 10.</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="w-1.5 h-1.5 rounded-full bg-red-400/60 mt-2 flex-shrink-0" />
              <span>Building generic clone projects (to-do lists, weather widgets) that recruiters skip past.</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="w-1.5 h-1.5 rounded-full bg-red-400/60 mt-2 flex-shrink-0" />
              <span>Memorizing theory definitions without understanding low-level concurrency or system tradeoffs.</span>
            </li>
          </ul>
        </div>

        {/* The PrepStack Way */}
        <div className="p-6 sm:p-8 rounded-2xl bg-[#111] border border-[#ffa116]/30 relative overflow-hidden shadow-xl shadow-black/60">
          <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-[#ffa116] mb-5">
            <FaCheck className="text-xs" /> The PrepStack Way
          </div>
          <ul className="space-y-4 text-sm text-gray-300">
            <li className="flex items-start gap-3">
              <span className="w-1.5 h-1.5 rounded-full bg-[#ffa116] mt-2 flex-shrink-0" />
              <span>Single-roundtrip dashboard tracking every solved problem atomically across all sheets.</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="w-1.5 h-1.5 rounded-full bg-[#ffa116] mt-2 flex-shrink-0" />
              <span>Curated Love Babbar, Striver, and NeetCode problem sets organized by pattern complexity.</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="w-1.5 h-1.5 rounded-full bg-[#ffa116] mt-2 flex-shrink-0" />
              <span>AI system architect generating production-grade specs (schemas, concurrency, latency targets).</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="w-1.5 h-1.5 rounded-full bg-[#ffa116] mt-2 flex-shrink-0" />
              <span>Synthesized OS, DBMS, Networks, and OOPs cheat-sheets designed for real placement rounds.</span>
            </li>
          </ul>
        </div>
      </div>
    </section>
  );
};

export default EngineeringContrast;
