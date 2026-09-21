import React, { useState } from "react";
import { Link } from "react-router-dom";
import { FiExternalLink, FiCopy, FiCheck, FiCpu, FiCode, FiLayers, FiCompass, FiAward } from "react-icons/fi";

const BentoGrid = () => {
  const [copiedSpec, setCopiedSpec] = useState(false);

  const handleCopySpec = () => {
    navigator.clipboard?.writeText("prepstack spec --template=distributed-cache --scale=100k");
    setCopiedSpec(true);
    setTimeout(() => setCopiedSpec(false), 2000);
  };

  return (
    <section className="relative text-left">
      <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-16">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.03] border border-white/[0.1] shadow-[inset_0_1px_0_rgba(255,255,255,0.12)] mb-4">
          <FiLayers className="text-xs text-[#ffa116]" />
          <span className="text-[11px] font-mono uppercase tracking-widest text-[#ffa116] font-semibold">
            Unified Suite Architecture
          </span>
        </div>
        <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight mb-4">
          Everything in one <span className="text-[#ffa116]">engineered studio</span>
        </h2>
        <p className="text-sm sm:text-base text-zinc-400 leading-relaxed">
          From algorithmic mastery to distributed system specifications, low-level theory, and final behavioral rounds.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
        {/* ── Bento 1: Large 2-column Tile - DSA Problem Engine ── */}
        <div className="md:col-span-2 rounded-2xl titanium-card p-6 sm:p-8 flex flex-col justify-between group relative overflow-hidden">
          <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-[#ffa116]/40 to-transparent" />
          <div>
            <div className="flex items-center justify-between mb-5">
              <span className="font-mono text-xs text-[#ffa116] uppercase tracking-wider font-semibold flex items-center gap-1.5">
                <FiCode className="text-sm" /> CURATED PROBLEM ENGINE
              </span>
              <Link
                to="/dsa"
                className="font-mono text-xs text-zinc-400 group-hover:text-white flex items-center gap-1.5 transition-colors select-none"
              >
                View Sheets <FiExternalLink className="text-xs text-[#ffa116]" />
              </Link>
            </div>

            <h3 className="font-display text-2xl sm:text-3xl font-extrabold text-white tracking-tight mb-3">
              Blind 75, NeetCode 150 &amp; Striver SDE
            </h3>
            <p className="text-sm text-zinc-400 max-w-xl mb-6 leading-relaxed">
              No random question dumps. Follow vetted algorithmic pattern progressions with zero-lag optimistic state updates and direct platform deep-links.
            </p>

            {/* Pattern Progress Visualizer */}
            <div className="space-y-3 pt-1">
              <div className="flex items-center justify-between text-xs font-mono text-zinc-400">
                <span>Coverage: <strong className="text-white">100% Core Patterns</strong></span>
                <span className="text-[#ffa116]">Optimal Space/Time Focus</span>
              </div>
              <div className="h-2 w-full bg-white/[0.06] rounded-full overflow-hidden flex">
                <div className="h-full bg-emerald-500 w-[30%]" title="Easy Patterns (30%)" />
                <div className="h-full bg-amber-500 w-[50%]" title="Medium Patterns (50%)" />
                <div className="h-full bg-rose-500 w-[20%]" title="Hard Patterns (20%)" />
              </div>

              {/* Difficulty breakdown metrics */}
              <div className="grid grid-cols-3 gap-3 pt-2">
                <div className="bg-white/[0.02] border border-emerald-500/20 rounded-xl p-3">
                  <div className="text-[10px] font-mono text-emerald-400 font-bold uppercase tracking-wider">
                    Easy (30%)
                  </div>
                  <div className="font-display text-sm sm:text-base font-bold text-white mt-0.5">
                    Pattern Roots
                  </div>
                  <div className="text-[10.5px] font-mono text-zinc-500">HashMaps · Two Pointers</div>
                </div>

                <div className="bg-white/[0.02] border border-amber-500/20 rounded-xl p-3">
                  <div className="text-[10px] font-mono text-amber-400 font-bold uppercase tracking-wider">
                    Medium (50%)
                  </div>
                  <div className="font-display text-sm sm:text-base font-bold text-white mt-0.5">
                    Core Rounds
                  </div>
                  <div className="text-[10.5px] font-mono text-zinc-500">Sliding Window · Graphs</div>
                </div>

                <div className="bg-white/[0.02] border border-rose-500/20 rounded-xl p-3">
                  <div className="text-[10px] font-mono text-rose-400 font-bold uppercase tracking-wider">
                    Hard (20%)
                  </div>
                  <div className="font-display text-sm sm:text-base font-bold text-white mt-0.5">
                    FAANG Bar
                  </div>
                  <div className="text-[10.5px] font-mono text-zinc-500">Interval DP · Topological</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── Bento 2: AI System Architect ── */}
        <div className="rounded-2xl titanium-card p-6 sm:p-8 flex flex-col justify-between group relative overflow-hidden">
          <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-[#ffa116]/30 to-transparent" />
          <div>
            <div className="flex items-center justify-between mb-5">
              <span className="font-mono text-xs text-[#ffa116] uppercase tracking-wider font-semibold flex items-center gap-1.5">
                <FiCpu className="text-sm" /> SYSTEM ARCHITECTURE STUDIO
              </span>
              <Link
                to="/ai-projects"
                className="font-mono text-xs text-zinc-400 group-hover:text-white flex items-center gap-1.5 transition-colors select-none"
              >
                Generate <FiExternalLink className="text-xs text-[#ffa116]" />
              </Link>
            </div>

            <h3 className="font-display text-xl font-bold text-white tracking-tight mb-2">
              Recruiter-Grade Projects
            </h3>
            <p className="text-sm text-zinc-400 leading-relaxed mb-6">
              AI-generated production specs detailing schemas, concurrency bottlenecks, and real engineering trade-offs.
            </p>

            {/* Micro Terminal with Copy Trigger */}
            <div className="bg-black/70 border border-white/[0.08] rounded-xl p-3.5 font-mono text-[11px] text-zinc-300 relative group/terminal shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]">
              <div className="flex items-center justify-between text-zinc-500 pb-2 mb-2 border-b border-white/[0.06] text-[10px]">
                <span>ARCH_CLI</span>
                <button
                  type="button"
                  onClick={handleCopySpec}
                  className="hover:text-white transition-colors flex items-center gap-1 cursor-pointer"
                >
                  {copiedSpec ? <FiCheck className="text-emerald-400" /> : <FiCopy />}
                  <span>{copiedSpec ? "Copied" : "Copy"}</span>
                </button>
              </div>
              <div className="leading-relaxed">
                <span className="text-[#ffa116]">$</span> prepstack spec --distributed --cache redis --p99 5ms
              </div>
              <div className="text-zinc-500 text-[10px] mt-1.5">
                &rarr; Generated 12 architectural diagrams &amp; Docker manifests
              </div>
            </div>
          </div>
        </div>

        {/* ── Bento 3: Core CS Internals ── */}
        <div className="rounded-2xl titanium-card p-6 sm:p-8 flex flex-col justify-between group relative overflow-hidden">
          <div>
            <div className="flex items-center justify-between mb-5">
              <span className="font-mono text-xs text-cyan-400 uppercase tracking-wider font-semibold flex items-center gap-1.5">
                <FiLayers className="text-sm" /> LOW-LEVEL CS INTERNALS
              </span>
              <Link
                to="/notes"
                className="font-mono text-xs text-zinc-400 group-hover:text-white flex items-center gap-1.5 transition-colors select-none"
              >
                Explore <FiExternalLink className="text-xs text-cyan-400" />
              </Link>
            </div>
            <h3 className="font-display text-xl font-bold text-white tracking-tight mb-2">
              Low-Level CS Internals
            </h3>
            <p className="text-sm text-zinc-400 leading-relaxed mb-6">
              Synthesized deep dives on Operating Systems, DBMS indexing, TCP/IP sockets, and OOP design patterns.
            </p>

            <div className="space-y-2">
              {[
                { name: "Virtual Memory & Paging", tag: "OS Kernel", latency: "TLB Hit 1ns" },
                { name: "B+ Tree Clustered Index", tag: "DBMS", latency: "log(N) Disk IO" },
                { name: "TCP 3-Way Handshake", tag: "Networks", latency: "SYN / ACK" },
              ].map((item, idx) => (
                <div key={idx} className="flex items-center justify-between p-2 rounded-lg bg-white/[0.02] border border-white/[0.06] text-xs font-mono">
                  <span className="text-zinc-300 truncate mr-2">{item.name}</span>
                  <span className="text-[10px] text-cyan-400 bg-cyan-500/10 px-1.5 py-0.5 rounded shrink-0">
                    {item.latency}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Bento 4: Structured Roadmaps ── */}
        <div className="rounded-2xl titanium-card p-6 sm:p-8 flex flex-col justify-between group relative overflow-hidden">
          <div>
            <div className="flex items-center justify-between mb-5">
              <span className="font-mono text-xs text-purple-400 uppercase tracking-wider font-semibold flex items-center gap-1.5">
                <FiCompass className="text-sm" /> CAREER ROADMAPS
              </span>
              <Link
                to="/roadmaps"
                className="font-mono text-xs text-zinc-400 group-hover:text-white flex items-center gap-1.5 transition-colors select-none"
              >
                Roadmaps <FiExternalLink className="text-xs text-purple-400" />
              </Link>
            </div>
            <h3 className="font-display text-xl font-bold text-white tracking-tight mb-2">
              Engineered Roadmaps
            </h3>
            <p className="text-sm text-zinc-400 leading-relaxed mb-6">
              Step-by-step career pathways from core language fundamentals to high-scale production systems.
            </p>

            {/* Interactive Milestone Nodes */}
            <div className="space-y-2.5 font-mono text-xs">
              <div className="flex items-center gap-3 p-2 rounded-lg bg-purple-950/20 border border-purple-500/25 text-purple-200">
                <span className="w-2 h-2 rounded-full bg-purple-400 animate-pulse" />
                <span className="truncate">Stage 1: Core DSA &amp; Complexity</span>
              </div>
              <div className="flex items-center gap-3 p-2 rounded-lg bg-white/[0.02] border border-white/[0.06] text-zinc-400">
                <span className="w-2 h-2 rounded-full bg-zinc-600" />
                <span className="truncate">Stage 2: Low-Level OS &amp; Concurrency</span>
              </div>
              <div className="flex items-center gap-3 p-2 rounded-lg bg-white/[0.02] border border-white/[0.06] text-zinc-400">
                <span className="w-2 h-2 rounded-full bg-zinc-600" />
                <span className="truncate">Stage 3: Distributed System Scalability</span>
              </div>
            </div>
          </div>
        </div>

        {/* ── Bento 5: Offer Stage Toolkit ── */}
        <div className="rounded-2xl titanium-card p-6 sm:p-8 flex flex-col justify-between group relative overflow-hidden">
          <div>
            <div className="flex items-center justify-between mb-5">
              <span className="font-mono text-xs text-emerald-400 uppercase tracking-wider font-semibold flex items-center gap-1.5">
                <FiAward className="text-sm" /> BEHAVIORAL &amp; RESUME STUDIO
              </span>
              <Link
                to="/behavioral"
                className="font-mono text-xs text-zinc-400 group-hover:text-white flex items-center gap-1.5 transition-colors select-none"
              >
                Prepare <FiExternalLink className="text-xs text-emerald-400" />
              </Link>
            </div>
            <h3 className="font-display text-xl font-bold text-white tracking-tight mb-2">
              Behavioral &amp; ATS Resume
            </h3>
            <p className="text-sm text-zinc-400 leading-relaxed mb-6">
              Actionable STAR-method behavioral breakdowns and metric-driven Google XYZ resume bullet frameworks.
            </p>

            <div className="p-3 rounded-xl bg-emerald-950/20 border border-emerald-500/25 space-y-2 text-xs">
              <div className="text-[10.5px] font-mono uppercase text-emerald-400 font-semibold">
                Google XYZ Formula
              </div>
              <div className="text-zinc-300 text-[11px] leading-relaxed">
                "Reduced API p99 latency by <strong className="text-emerald-300">42%</strong> by introducing a Redis write-through cache cluster."
              </div>
              <div className="text-[10px] font-mono text-zinc-500 pt-1 border-t border-emerald-500/20">
                STAR Method: Situation &rarr; Task &rarr; Action &rarr; Result
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default BentoGrid;
