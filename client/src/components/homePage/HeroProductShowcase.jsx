import React, { useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { FaArrowRight, FaCheck, FaPlay, FaCheckCircle } from "react-icons/fa";
import { FiCpu, FiCode as FiCodeIcon, FiDatabase, FiTerminal, FiLayers, FiShield } from "react-icons/fi";

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
  const [isRunningTest, setIsRunningTest] = useState(false);
  const [testResult, setTestResult] = useState(null);
  const [concurrencyMode, setConcurrencyMode] = useState("lockless"); // "mutex" | "lockless"

  const toggleDemoProblem = (id) => {
    setDemoProblems((prev) =>
      prev.map((p) => (p.id === id ? { ...p, solved: !p.solved } : p))
    );
  };

  const runTestBenchmark = () => {
    setIsRunningTest(true);
    setTestResult(null);
    setTimeout(() => {
      setIsRunningTest(false);
      setTestResult({
        runtime: "2ms",
        runtimePercentile: "98.7%",
        memory: "41.2 MB",
        memoryPercentile: "95.1%",
        casesPassed: "48/48",
      });
    }, 450);
  };

  const solvedCount = demoProblems.filter((p) => p.solved).length;
  const progressPct = Math.round((solvedCount / demoProblems.length) * 100);

  return (
    <div className="relative w-full rounded-2xl titanium-card overflow-hidden text-left transform-gpu">
      {/* ── WINDOW CHROME ── */}
      <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 border-b border-white/[0.08] bg-[#0e0e12]">
        {/* Workspace status / file path header */}
        <div className="flex items-center gap-2.5">
          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-white/[0.04] border border-white/[0.08] text-zinc-400">
            <FiTerminal className="text-xs text-[#ffa116]" />
            <span className="text-[10px] font-mono tracking-wider text-zinc-300 font-semibold uppercase">RUNTIME</span>
          </div>
          <span className="hidden sm:inline-block font-mono text-[11px] text-zinc-400 font-medium">
            prepstack-workspace / <span className="text-zinc-200">{TABS[activeTab].file}</span>
          </span>
        </div>

        {/* ── SILKY SEGMENTED CONTROL ── */}
        <div className="relative flex items-center bg-black/60 p-1 rounded-xl border border-white/[0.08]">
          {TABS.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`relative z-10 flex items-center gap-1.5 py-1.5 px-2.5 sm:px-3.5 rounded-lg text-xs font-medium transition-colors ${
                  isActive ? "text-[#ffa116]" : "text-zinc-400 hover:text-zinc-200"
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeWorkspaceTab"
                    className="absolute inset-0 bg-[#ffa116]/12 border border-[#ffa116]/30 rounded-lg shadow-sm -z-10"
                    transition={{ type: "spring", stiffness: 450, damping: 35 }}
                  />
                )}
                {tab.icon}
                <span className="font-display text-[11px] sm:text-xs">{tab.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── WORKSPACE BODY ── */}
      <div className="p-4 sm:p-6 min-h-[340px] flex flex-col justify-between">
        <AnimatePresence mode="wait">
          {/* Tab 0: DSA Tracker */}
          {activeTab === 0 && (
            <motion.div
              key="dsa"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.18 }}
              className="space-y-4"
            >
              <div className="flex items-center justify-between pb-3 border-b border-white/[0.06]">
                <div>
                  <p className="text-[10.5px] font-mono uppercase tracking-widest text-[#ffa116] font-semibold flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#ffa116]" />
                    Interactive Cockpit · Click to toggle
                  </p>
                  <h3 className="font-display text-white text-sm sm:text-base font-bold tracking-tight mt-0.5">
                    Blind 75 Core Placement Patterns
                  </h3>
                </div>
                <div className="text-right shrink-0">
                  <span className="font-mono text-xs text-zinc-400">
                    <span className="text-white font-bold">{solvedCount}</span>/{demoProblems.length} Solved
                  </span>
                  <div className="w-20 sm:w-28 h-1.5 bg-white/[0.08] rounded-full mt-1.5 overflow-hidden">
                    <motion.div
                      className="h-full bg-gradient-to-r from-[#ffa116] to-[#f59e0b]"
                      initial={{ width: 0 }}
                      animate={{ width: `${progressPct}%` }}
                      transition={{ duration: 0.35, ease: "easeOut" }}
                    />
                  </div>
                </div>
              </div>

              {/* Problem Rows */}
              <div className="space-y-2">
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
                      className={`group flex items-center justify-between p-2.5 sm:p-3 rounded-xl border transition-all duration-150 cursor-pointer select-none ${
                        problem.solved
                          ? "bg-white/[0.03] border-white/[0.08] opacity-85"
                          : "bg-white/[0.015] border-white/[0.06] hover:border-white/[0.14] hover:bg-white/[0.025]"
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0 mr-2">
                        <div
                          className={`w-5 h-5 rounded-md flex items-center justify-center border transition-all flex-shrink-0 ${
                            problem.solved
                              ? "bg-[#ffa116] border-[#ffa116] text-black shadow-[0_0_10px_rgba(255,161,22,0.4)]"
                              : "border-white/25 group-hover:border-white/50"
                          }`}
                        >
                          {problem.solved && <FaCheck className="text-[9px]" />}
                        </div>
                        <span
                          className={`text-xs sm:text-sm font-medium transition-colors truncate ${
                            problem.solved
                              ? "line-through text-zinc-500"
                              : "text-zinc-200 group-hover:text-white"
                          }`}
                        >
                          {problem.title}
                        </span>
                        <span className="hidden sm:inline-block font-mono text-[10.5px] text-zinc-500">
                          {problem.category}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <span className="font-mono text-[10px] text-zinc-400 bg-white/[0.04] px-1.5 py-0.5 rounded border border-white/[0.06]">
                          {problem.time}
                        </span>
                        <span className={`text-[10px] font-mono px-2 py-0.5 rounded-md border ${diffBadge}`}>
                          {problem.diff}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Interactive Execution Trigger */}
              <div className="pt-2">
                <div className="flex items-center justify-between">
                  <button
                    type="button"
                    onClick={runTestBenchmark}
                    disabled={isRunningTest}
                    className="titanium-button text-xs font-mono py-1.5 px-3 rounded-lg flex items-center gap-2 cursor-pointer select-none"
                  >
                    <FaPlay className={`text-[9px] text-[#ffa116] ${isRunningTest ? "animate-spin" : ""}`} />
                    <span>{isRunningTest ? "Running Benchmark..." : "Run Test Benchmark"}</span>
                    <span className="kbd-capsule">⌘↵</span>
                  </button>

                  <span className="text-[11px] font-mono text-zinc-500">
                    Engine: V8 Subprocess
                  </span>
                </div>

                {/* Benchmark Output Strip */}
                {testResult && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className="mt-2.5 p-2.5 rounded-lg bg-emerald-950/25 border border-emerald-500/25 font-mono text-[11px] text-emerald-300 flex flex-wrap items-center justify-between gap-2"
                  >
                    <div className="flex items-center gap-2">
                      <FaCheckCircle className="text-emerald-400 text-xs shrink-0" />
                      <span>Passed {testResult.casesPassed} test cases</span>
                    </div>
                    <div className="flex items-center gap-3 text-[10.5px] text-zinc-400">
                      <span>Runtime: <strong className="text-emerald-300">{testResult.runtime}</strong> (Beats {testResult.runtimePercentile})</span>
                      <span>Memory: <strong className="text-emerald-300">{testResult.memory}</strong></span>
                    </div>
                  </motion.div>
                )}
              </div>
            </motion.div>
          )}

          {/* Tab 1: CS Internals Simulator */}
          {activeTab === 1 && (
            <motion.div
              key="cs"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.18 }}
              className="space-y-4"
            >
              <div className="flex items-center justify-between pb-3 border-b border-white/[0.06]">
                <div>
                  <p className="text-[10.5px] font-mono uppercase tracking-widest text-cyan-400 font-semibold flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                    Interactive Kernel Simulator
                  </p>
                  <h3 className="font-display text-white text-sm sm:text-base font-bold tracking-tight mt-0.5">
                    Concurrency &amp; Memory Synchronization
                  </h3>
                </div>

                {/* Concurrency Selector */}
                <div className="flex items-center bg-black/60 p-0.5 rounded-lg border border-white/[0.08] text-[10px] font-mono">
                  <button
                    type="button"
                    onClick={() => setConcurrencyMode("mutex")}
                    className={`px-2 py-1 rounded transition-colors ${
                      concurrencyMode === "mutex" ? "bg-white/[0.1] text-white font-bold" : "text-zinc-400 hover:text-zinc-200"
                    }`}
                  >
                    Mutex Lock
                  </button>
                  <button
                    type="button"
                    onClick={() => setConcurrencyMode("lockless")}
                    className={`px-2 py-1 rounded transition-colors ${
                      concurrencyMode === "lockless" ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-bold" : "text-zinc-400 hover:text-zinc-200"
                    }`}
                  >
                    Atomic CAS
                  </button>
                </div>
              </div>

              {/* Simulation Architecture Diagram */}
              <div className="bg-black/50 border border-white/[0.08] rounded-xl p-3.5 space-y-3 font-mono text-xs">
                <div className="grid grid-cols-3 gap-2 text-center text-[10.5px]">
                  <div className="p-2 rounded-lg bg-zinc-900/80 border border-white/[0.06]">
                    <div className="text-zinc-500 text-[9px] uppercase">Thread 0 (Producer)</div>
                    <div className="text-emerald-400 font-bold mt-1">EMIT_PACKET</div>
                    <div className="text-[9px] text-zinc-400 mt-0.5">CPU Core 0</div>
                  </div>
                  <div className="p-2 rounded-lg bg-zinc-900/80 border border-cyan-500/30 bg-cyan-950/10">
                    <div className="text-zinc-500 text-[9px] uppercase">Shared Barrier</div>
                    <div className="text-cyan-300 font-bold mt-1">
                      {concurrencyMode === "mutex" ? "MUTEX_HELD" : "CAS_EXCHANGE"}
                    </div>
                    <div className="text-[9px] text-zinc-400 mt-0.5">[0x7ffd8a04]</div>
                  </div>
                  <div className="p-2 rounded-lg bg-zinc-900/80 border border-white/[0.06]">
                    <div className="text-zinc-500 text-[9px] uppercase">Thread 1 (Consumer)</div>
                    <div className={concurrencyMode === "mutex" ? "text-amber-400 font-bold mt-1" : "text-emerald-400 font-bold mt-1"}>
                      {concurrencyMode === "mutex" ? "BLOCKED_WAIT" : "DRAIN_BUFFER"}
                    </div>
                    <div className="text-[9px] text-zinc-400 mt-0.5">CPU Core 1</div>
                  </div>
                </div>

                <div className="p-2.5 rounded-lg bg-white/[0.02] border border-white/[0.06] text-[11px] leading-relaxed flex items-center justify-between text-zinc-300">
                  <span>
                    {concurrencyMode === "mutex"
                      ? "⚠️ Kernel context switch triggered: ~1,420ns latency penalty"
                      : "⚡ Zero kernel trap: 4ns hardware atomic exchange without OS preemption"}
                  </span>
                  <span className="font-bold text-zinc-200 shrink-0 ml-2">
                    {concurrencyMode === "mutex" ? "High Contention" : "Lockless 0% Contention"}
                  </span>
                </div>

                <div className="text-[10px] text-zinc-500 pt-1 border-t border-white/[0.05]">
                  <strong className="text-zinc-400">FAANG Question:</strong> "Explain how ring buffers prevent cache bouncing across L1/L2 data lines."
                </div>
              </div>
            </motion.div>
          )}

          {/* Tab 2: System Architecture Spec */}
          {activeTab === 2 && (
            <motion.div
              key="ai"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.18 }}
              className="space-y-4"
            >
              <div className="flex items-center justify-between pb-3 border-b border-white/[0.06]">
                <div>
                  <p className="text-[10.5px] font-mono uppercase tracking-widest text-[#ffa116] font-semibold flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#ffa116]" />
                    Production Architecture Spec
                  </p>
                  <h3 className="font-display text-white text-sm sm:text-base font-bold tracking-tight mt-0.5">
                    Distributed Sliding-Window Rate Limiter
                  </h3>
                </div>
                <span className="text-[10.5px] font-mono px-2.5 py-0.5 rounded-md bg-[#ffa116]/10 border border-[#ffa116]/25 text-[#ffa116] font-bold">
                  Scale: 100k req/s
                </span>
              </div>

              {/* Topology Layers */}
              <div className="space-y-2 font-mono text-xs">
                <div className="p-2.5 rounded-xl bg-white/[0.02] border border-white/[0.08] flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FiLayers className="text-[#ffa116] text-xs" />
                    <span className="text-zinc-200 text-xs">Edge API Gateway</span>
                  </div>
                  <span className="text-[10px] text-zinc-400 bg-white/[0.05] px-2 py-0.5 rounded border border-white/[0.06]">
                    TLS 1.3 Termination · Envoy Proxy
                  </span>
                </div>

                <div className="p-2.5 rounded-xl bg-zinc-900/60 border border-[#ffa116]/30 bg-[#ffa116]/[0.02] flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FiShield className="text-[#ffa116] text-xs" />
                    <span className="text-white text-xs font-semibold">Sliding Window Core</span>
                  </div>
                  <span className="text-[10px] text-[#ffa116] font-mono">
                    Redis Cluster + Lua Script Atomic Eval
                  </span>
                </div>

                <div className="p-2.5 rounded-xl bg-white/[0.02] border border-white/[0.08] flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FiDatabase className="text-cyan-400 text-xs" />
                    <span className="text-zinc-200 text-xs">PostgreSQL WAL Logging</span>
                  </div>
                  <span className="text-[10px] text-zinc-400 bg-white/[0.05] px-2 py-0.5 rounded border border-white/[0.06]">
                    Partitioned by User UUID · Async Sync
                  </span>
                </div>

                <div className="flex items-center justify-between pt-1 px-1 text-[11px] text-zinc-400">
                  <span>Latency SLA: <strong className="text-white">p99 &lt; 2.4ms</strong></span>
                  <span>Fault Tolerance: <strong className="text-white">Multi-AZ Failover</strong></span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── WORKSPACE FOOTER ── */}
        <div className="pt-3.5 border-t border-white/[0.07] flex items-center justify-between text-xs text-zinc-500 mt-3">
          <span className="font-mono text-[11px] flex items-center gap-2 text-zinc-400">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Telemetry: <span className="text-zinc-300">60 FPS · 0ms sync lag</span>
          </span>
          <Link
            to={activeTab === 0 ? "/dsa" : activeTab === 1 ? "/notes" : "/ai-projects"}
            className="inline-flex items-center gap-1.5 text-[#ffa116] hover:text-[#ffb84d] font-semibold transition-colors text-xs shrink-0 select-none group"
          >
            Launch Full Tool{" "}
            <FaArrowRight className="text-[10px] transition-transform duration-150 group-hover:translate-x-0.5" />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default HeroProductShowcase;
