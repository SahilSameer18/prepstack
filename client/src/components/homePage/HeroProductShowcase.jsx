import React, { useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { FaArrowRight, FaCheck } from "react-icons/fa";
import { FiCpu, FiCode as FiCodeIcon, FiDatabase, FiTerminal } from "react-icons/fi";

const INITIAL_DEMO_PROBLEMS = [
  { id: 1, title: "Two Sum", category: "Arrays & Hashing", time: "O(n)", diff: "Easy", solved: true },
  { id: 2, title: "LRU Cache", category: "Linked List + Map", time: "O(1)", diff: "Medium", solved: true },
  { id: 3, title: "Trapping Rain Water", category: "Two Pointers", time: "O(n)", diff: "Hard", solved: false },
];

const TABS = [
  { id: 0, name: "DSA Tracker", icon: <FiCodeIcon className="text-xs" />, file: "Blind75.tracker.ts" },
  { id: 1, name: "CS Internals", icon: <FiDatabase className="text-xs" />, file: "OS_Memory.spec.md" },
  { id: 2, name: "System Spec", icon: <FiCpu className="text-xs" />, file: "RateLimiter.arch.yaml" },
];

const HeroProductShowcase = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [demoProblems, setDemoProblems] = useState(INITIAL_DEMO_PROBLEMS);

  const toggleDemoProblem = (id) => {
    setDemoProblems((prev) =>
      prev.map((p) => (p.id === id ? { ...p, solved: !p.solved } : p))
    );
  };

  const solvedCount = demoProblems.filter((p) => p.solved).length;
  const progressPct = Math.round((solvedCount / demoProblems.length) * 100);

  return (
    <div className="relative w-full rounded-2xl border border-white/[0.1] bg-[#0c0c0e] shadow-[0_25px_60px_-15px_rgba(0,0,0,0.9),inset_0_1px_0_rgba(255,255,255,0.12)] overflow-hidden text-left transform-gpu">
      {/* ── WINDOW CHROME ── */}
      <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 border-b border-white/[0.08] bg-[#101014]">
        {/* Workspace status / file path header */}
        <div className="flex items-center gap-2.5">
          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-white/[0.04] border border-white/[0.08] text-zinc-400">
            <FiTerminal className="text-xs text-[#ffa116]" />
            <span className="text-[10px] font-mono tracking-wider text-zinc-400 uppercase">runtime</span>
          </div>
          <span className="hidden sm:inline-block font-mono text-[11px] text-zinc-400 font-medium">
            prepstack-workspace / <span className="text-zinc-200">{TABS[activeTab].file}</span>
          </span>
        </div>

        {/* ── SILKY SEGMENTED CONTROL ── */}
        <div className="relative flex items-center bg-black/50 p-1 rounded-xl border border-white/[0.08]">
          {TABS.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`relative z-10 flex items-center gap-1.5 py-1.5 px-3 sm:px-4 rounded-lg text-xs font-medium transition-colors ${
                  isActive ? "text-[#ffa116]" : "text-zinc-400 hover:text-zinc-200"
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeWorkspaceTab"
                    className="absolute inset-0 bg-[#ffa116]/10 border border-[#ffa116]/30 rounded-lg shadow-sm -z-10"
                    transition={{ type: "spring", stiffness: 450, damping: 35 }}
                  />
                )}
                {tab.icon}
                <span className="font-display">{tab.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── WORKSPACE BODY ── */}
      <div className="p-4 sm:p-7 min-h-[300px] flex flex-col justify-between">
        <AnimatePresence mode="wait">
          {/* Tab 0: DSA Tracker */}
          {activeTab === 0 && (
            <motion.div
              key="dsa"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.2 }}
              className="space-y-4"
            >
              <div className="flex items-center justify-between pb-3 border-b border-white/[0.06]">
                <div>
                  <p className="text-[11px] font-mono uppercase tracking-widest text-[#ffa116] font-semibold">
                    Interactive Preview · Click to solve
                  </p>
                  <h3 className="font-display text-white text-sm sm:text-base font-bold tracking-tight">
                    Blind 75 Core Placement Patterns
                  </h3>
                </div>
                <div className="text-right shrink-0">
                  <span className="font-mono text-xs text-zinc-400">
                    <span className="text-white font-bold">{solvedCount}</span>/{demoProblems.length} Solved
                  </span>
                  <div className="w-20 sm:w-32 h-1.5 bg-white/[0.08] rounded-full mt-1.5 overflow-hidden">
                    <motion.div
                      className="h-full bg-gradient-to-r from-[#ffa116] to-[#f59e0b]"
                      initial={{ width: 0 }}
                      animate={{ width: `${progressPct}%` }}
                      transition={{ duration: 0.35, ease: "easeOut" }}
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2.5">
                {demoProblems.map((problem) => {
                  const diffBadge =
                    problem.diff === "Easy"
                      ? "text-emerald-400 bg-emerald-500/10 border-emerald-500/20"
                      : problem.diff === "Medium"
                      ? "text-amber-400 bg-amber-500/10 border-amber-500/20"
                      : "text-rose-400 bg-rose-500/10 border-rose-500/20";

                  return (
                    <div
                      key={problem.id}
                      onClick={() => toggleDemoProblem(problem.id)}
                      className={`group flex items-center justify-between p-3 rounded-xl border transition-all duration-200 cursor-pointer select-none ${
                        problem.solved
                          ? "bg-white/[0.035] border-white/[0.1] opacity-80"
                          : "bg-white/[0.015] border-white/[0.06] hover:border-white/[0.14] hover:bg-white/[0.025]"
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0 mr-2">
                        <div
                          className={`w-5 h-5 rounded-md flex items-center justify-center border transition-all flex-shrink-0 ${
                            problem.solved
                              ? "bg-[#ffa116] border-[#ffa116] text-black shadow-[0_0_12px_rgba(255,161,22,0.4)]"
                              : "border-white/20 group-hover:border-white/50"
                          }`}
                        >
                          {problem.solved && <FaCheck className="text-[9px]" />}
                        </div>
                        <span
                          className={`text-sm font-medium transition-colors truncate ${
                            problem.solved
                              ? "line-through text-zinc-500"
                              : "text-zinc-200 group-hover:text-white"
                          }`}
                        >
                          {problem.title}
                        </span>
                        <span className="hidden sm:inline-block font-mono text-[11px] text-zinc-500">
                          {problem.category}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <span className="font-mono text-[10px] text-zinc-400 bg-white/[0.04] px-2 py-0.5 rounded border border-white/[0.06]">
                          {problem.time}
                        </span>
                        <span
                          className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${diffBadge}`}
                        >
                          {problem.diff}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          )}

          {/* Tab 1: CS Internals */}
          {activeTab === 1 && (
            <motion.div
              key="cs"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.2 }}
              className="space-y-4"
            >
              <div className="flex items-center justify-between pb-3 border-b border-white/[0.06]">
                <div>
                  <p className="text-[11px] font-mono uppercase tracking-widest text-cyan-400 font-semibold">
                    Core OS Architecture · Placement Cheat-Sheet
                  </p>
                  <h3 className="font-display text-white text-sm sm:text-base font-bold tracking-tight">
                    Virtual Memory, Paging & Mutex Primitives
                  </h3>
                </div>
                <span className="text-xs font-mono px-2.5 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-300">
                  FAANG Essential
                </span>
              </div>

              <div className="bg-black/60 border border-white/[0.08] rounded-xl p-4 font-mono text-xs text-zinc-300 space-y-2.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]">
                <div className="text-zinc-400 uppercase text-[10px] tracking-widest font-semibold flex items-center justify-between">
                  <span>Concurrency &amp; Mutex Locking Model</span>
                  <span className="text-emerald-400">Zero Contention</span>
                </div>
                <div className="text-zinc-300 bg-white/[0.025] p-2.5 rounded-lg border border-white/[0.06] leading-relaxed">
                  acquire_spinlock(mutex) &rarr; write_shared_buffer() &rarr; release_spinlock(mutex)
                </div>
                <div className="pt-2 text-zinc-400 border-t border-white/[0.06] text-[11px] leading-relaxed">
                  <strong className="text-white">Coffman Deadlock Conditions:</strong> Mutual Exclusion, Hold &amp; Wait, No Preemption, Circular Wait.
                </div>
              </div>
            </motion.div>
          )}

          {/* Tab 2: AI System Architect */}
          {activeTab === 2 && (
            <motion.div
              key="ai"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.2 }}
              className="space-y-4"
            >
              <div className="flex items-center justify-between pb-3 border-b border-white/[0.06]">
                <div>
                  <p className="text-[11px] font-mono uppercase tracking-widest text-[#ffa116] font-semibold">
                    Production Project Blueprint
                  </p>
                  <h3 className="font-display text-white text-sm sm:text-base font-bold tracking-tight">
                    Distributed Sliding-Window Rate Limiter
                  </h3>
                </div>
                <span className="text-xs font-mono px-2.5 py-0.5 rounded-full bg-[#ffa116]/10 border border-[#ffa116]/20 text-[#ffa116]">
                  Production Grade
                </span>
              </div>

              <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.08] space-y-3">
                <div className="flex flex-wrap gap-2 text-[11px] font-mono">
                  <span className="px-2.5 py-0.5 rounded bg-blue-500/10 text-blue-300 border border-blue-500/20">Go 1.22</span>
                  <span className="px-2.5 py-0.5 rounded bg-red-500/10 text-red-300 border border-red-500/20">Redis Cluster</span>
                  <span className="px-2.5 py-0.5 rounded bg-purple-500/10 text-purple-300 border border-purple-500/20">Token Bucket</span>
                  <span className="px-2.5 py-0.5 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">p99 &lt; 2ms</span>
                </div>
                <p className="text-zinc-300 text-xs sm:text-sm leading-relaxed">
                  Replaces toy to-do list projects with a high-throughput sliding window rate limiter benchmarked for 50,000 req/sec across distributed clusters.
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── WORKSPACE FOOTER ── */}
        <div className="pt-4 border-t border-white/[0.06] flex items-center justify-between text-xs text-zinc-500 mt-4">
          <span className="font-mono text-[11px] flex items-center gap-2 text-zinc-400">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            Session Telemetry: Synced
          </span>
          <Link
            to={activeTab === 0 ? "/dsa" : activeTab === 1 ? "/notes" : "/ai-projects"}
            className="inline-flex items-center gap-1.5 text-[#ffa116] hover:text-white font-medium transition-colors text-xs shrink-0"
          >
            Launch Full Tool <FaArrowRight className="text-[10px]" />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default HeroProductShowcase;
