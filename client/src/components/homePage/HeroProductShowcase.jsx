import React, { useState } from "react";
import { Link } from "react-router-dom";
import { FaArrowRight, FaCheck } from "react-icons/fa";
import { FiCpu, FiCode as FiCodeIcon, FiDatabase } from "react-icons/fi";

const INITIAL_DEMO_PROBLEMS = [
  { id: 1, title: "Two Sum", category: "Arrays & Hashing", difficulty: "Easy", solved: true },
  { id: 2, title: "LRU Cache", category: "Linked List & Hash Map", difficulty: "Medium", solved: true },
  { id: 3, title: "Trapping Rain Water", category: "Two Pointers", difficulty: "Hard", solved: false },
];

const HeroProductShowcase = () => {
  const [activeTab, setActiveTab] = useState(0); // 0: DSA, 1: CS Notes, 2: AI Architect
  const [demoProblems, setDemoProblems] = useState(INITIAL_DEMO_PROBLEMS);

  const toggleDemoProblem = (id) => {
    setDemoProblems((prev) =>
      prev.map((p) => (p.id === id ? { ...p, solved: !p.solved } : p))
    );
  };

  const solvedCount = demoProblems.filter((p) => p.solved).length;
  const progressPct = Math.round((solvedCount / demoProblems.length) * 100);

  return (
    <div className="relative mx-auto max-w-4xl w-full rounded-2xl border border-white/[0.08] bg-[#0d0d0d] shadow-2xl shadow-black/80 overflow-hidden text-left">
      {/* Workspace Preview Header - Responsive Segmented Control */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 px-3.5 sm:px-6 py-3 border-b border-white/[0.08] bg-[#121212]">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#ffa116]" />
          <span className="font-mono text-[11px] sm:text-xs font-semibold text-gray-300 uppercase tracking-wider">
            Workspace Preview
          </span>
        </div>

        {/* Tab Switcher: Full width 3-col grid on mobile, zero horizontal scroll */}
        <div className="grid grid-cols-3 gap-1 bg-black/60 p-1 rounded-xl border border-white/[0.08] w-full sm:w-auto">
          <button
            type="button"
            onClick={() => setActiveTab(0)}
            className={`flex items-center justify-center gap-1.5 py-1.5 px-2 sm:px-3.5 rounded-lg text-[11px] sm:text-xs font-semibold transition-all ${
              activeTab === 0
                ? "bg-[#ffa116]/15 text-[#ffa116] border border-[#ffa116]/30 shadow-sm"
                : "text-gray-400 hover:text-white"
            }`}
          >
            <FiCodeIcon className="text-[11px]" />
            <span>DSA</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab(1)}
            className={`flex items-center justify-center gap-1.5 py-1.5 px-2 sm:px-3.5 rounded-lg text-[11px] sm:text-xs font-semibold transition-all ${
              activeTab === 1
                ? "bg-[#ffa116]/15 text-[#ffa116] border border-[#ffa116]/30 shadow-sm"
                : "text-gray-400 hover:text-white"
            }`}
          >
            <FiDatabase className="text-[11px]" />
            <span>CS Notes</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab(2)}
            className={`flex items-center justify-center gap-1.5 py-1.5 px-2 sm:px-3.5 rounded-lg text-[11px] sm:text-xs font-semibold transition-all ${
              activeTab === 2
                ? "bg-[#ffa116]/15 text-[#ffa116] border border-[#ffa116]/30 shadow-sm"
                : "text-gray-400 hover:text-white"
            }`}
          >
            <FiCpu className="text-[11px]" />
            <span>AI Ideas</span>
          </button>
        </div>
      </div>

      {/* Tab Body */}
      <div className="p-4 sm:p-6 min-h-[290px] flex flex-col justify-between">
        {/* Tab 0: Interactive DSA Tracker */}
        {activeTab === 0 && (
          <div className="space-y-3">
            <div className="flex items-center justify-between pb-2.5 border-b border-white/[0.06]">
              <div>
                <p className="text-[10px] font-mono uppercase tracking-widest text-[#ffa116]">
                  Interactive Demo · Tap to Solve
                </p>
                <h3 className="text-white text-xs sm:text-base font-bold">
                  Core SDE Placement Problems
                </h3>
              </div>
              <div className="text-right shrink-0">
                <span className="font-mono text-[11px] sm:text-xs text-gray-400">
                  {solvedCount}/{demoProblems.length} Solved
                </span>
                <div className="w-16 sm:w-28 h-1.5 bg-white/[0.08] rounded-full mt-1 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-[#ffa116] to-[#ff8c00] transition-all duration-300"
                    style={{ width: `${progressPct}%` }}
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              {demoProblems.map((problem) => {
                const diffColor =
                  problem.difficulty === "Easy"
                    ? "text-emerald-400 bg-emerald-500/10 border-emerald-500/20"
                    : problem.difficulty === "Medium"
                    ? "text-amber-400 bg-amber-500/10 border-amber-500/20"
                    : "text-rose-400 bg-rose-500/10 border-rose-500/20";

                return (
                  <div
                    key={problem.id}
                    onClick={() => toggleDemoProblem(problem.id)}
                    className={`group flex items-center justify-between p-2.5 sm:p-3 rounded-xl border transition-all cursor-pointer select-none ${
                      problem.solved
                        ? "bg-white/[0.04] border-white/[0.12]"
                        : "bg-white/[0.015] border-white/[0.06] hover:border-white/[0.12]"
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0 mr-2">
                      <div
                        className={`w-4 h-4 rounded flex items-center justify-center border transition-all flex-shrink-0 ${
                          problem.solved
                            ? "bg-[#ffa116] border-[#ffa116] text-black"
                            : "border-white/20 group-hover:border-white/40"
                        }`}
                      >
                        {problem.solved && <FaCheck className="text-[8px]" />}
                      </div>
                      <span
                        className={`text-xs sm:text-sm font-medium transition-colors truncate ${
                          problem.solved
                            ? "line-through text-gray-500"
                            : "text-gray-200 group-hover:text-white"
                        }`}
                      >
                        {problem.title}
                      </span>
                    </div>

                    <span
                      className={`text-[9px] sm:text-[10px] font-mono px-2 py-0.5 rounded-full border shrink-0 ${diffColor}`}
                    >
                      {problem.difficulty}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Tab 1: Core CS Internals */}
        {activeTab === 1 && (
          <div className="space-y-3">
            <div className="flex items-center justify-between pb-2.5 border-b border-white/[0.06]">
              <div>
                <p className="text-[10px] font-mono uppercase tracking-widest text-cyan-400">
                  Operating Systems Cheat-Sheet
                </p>
                <h3 className="text-white text-xs sm:text-base font-bold">
                  Virtual Memory & Synchronization
                </h3>
              </div>
              <span className="text-[10px] sm:text-xs font-mono px-2 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 shrink-0">
                Core Round
              </span>
            </div>

            <div className="bg-black/60 border border-white/[0.08] rounded-xl p-3 sm:p-4 font-mono text-[11px] sm:text-xs text-gray-300 space-y-2">
              <div className="text-emerald-400">
                // Critical Section Lock Guarantee
              </div>
              <div className="text-gray-300 bg-white/[0.03] p-2 rounded border border-white/[0.05] leading-relaxed">
                acquire(mutex) &rarr; execute_safe() &rarr; release(mutex)
              </div>
              <div className="pt-2 text-gray-400 border-t border-white/[0.06] text-[10px] sm:text-[11px] leading-relaxed">
                <strong className="text-white">Deadlock 4 Conditions:</strong> Mutual Exclusion, Hold & Wait, No Preemption, Circular Wait.
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: AI Project Architect */}
        {activeTab === 2 && (
          <div className="space-y-3">
            <div className="flex items-center justify-between pb-2.5 border-b border-white/[0.06]">
              <div>
                <p className="text-[10px] font-mono uppercase tracking-widest text-[#ffa116]">
                  AI Architecture Generator
                </p>
                <h3 className="text-white text-xs sm:text-base font-bold">
                  Distributed Rate Limiter Service
                </h3>
              </div>
              <span className="text-[10px] sm:text-xs font-mono px-2 py-0.5 rounded-full bg-[#ffa116]/10 border border-[#ffa116]/20 text-[#ffa116] shrink-0">
                Advanced
              </span>
            </div>

            <div className="p-3 sm:p-4 rounded-xl bg-white/[0.02] border border-white/[0.08] space-y-2.5">
              <div className="flex flex-wrap gap-1.5 text-[10px] sm:text-[11px] font-mono">
                <span className="px-2 py-0.5 rounded bg-blue-500/10 text-blue-300 border border-blue-500/20">Go 1.22</span>
                <span className="px-2 py-0.5 rounded bg-red-500/10 text-red-300 border border-red-500/20">Redis</span>
                <span className="px-2 py-0.5 rounded bg-purple-500/10 text-purple-300 border border-purple-500/20">Token Bucket</span>
                <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">Docker</span>
              </div>
              <p className="text-gray-300 text-xs sm:text-sm leading-relaxed">
                Replaces generic clone projects with a high-throughput sliding window rate limiter capable of handling 50k RPS.
              </p>
            </div>
          </div>
        )}

        {/* Window Footer Navigation */}
        <div className="pt-3 border-t border-white/[0.06] flex items-center justify-between text-xs text-gray-500 mt-3">
          <span className="font-mono text-[10px] sm:text-[11px] truncate mr-2">
            {activeTab === 0
              ? "Atomic DB Progress Sync"
              : activeTab === 1
              ? "Synthesized CS Notes"
              : "Structured System Spec"}
          </span>
          <Link
            to={activeTab === 0 ? "/dsa" : activeTab === 1 ? "/notes" : "/ai-projects"}
            className="inline-flex items-center gap-1 text-[#ffa116] hover:text-white font-medium transition-colors text-xs shrink-0"
          >
            Launch <FaArrowRight className="text-[10px]" />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default HeroProductShowcase;
