import React from "react";
import { Link } from "react-router-dom";
import { FiExternalLink } from "react-icons/fi";

const BentoGrid = () => {
  return (
    <section className="relative">
      <div className="text-center max-w-2xl mx-auto mb-14 sm:mb-16">
        <p className="text-xs font-mono uppercase tracking-widest text-[#ffa116] font-semibold mb-3">
          Comprehensive Capabilities
        </p>
        <h2 className="font-display text-3xl sm:text-5xl font-extrabold text-white tracking-tight leading-tight mb-4">
          Everything in one <span className="text-[#ffa116]">engineered studio</span>
        </h2>
        <p className="text-sm sm:text-base text-zinc-400 leading-relaxed">
          From algorithmic mastery to system architecture, low-level theory, and final behavioral rounds.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
        {/* ── Bento 1: Large 2-column Tile - DSA Problem Engine ── */}
        <div className="md:col-span-2 rounded-2xl luxury-card p-6 sm:p-8 flex flex-col justify-between group relative overflow-hidden">
          <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-[#ffa116]/30 to-transparent" />
          <div>
            <div className="flex items-center justify-between mb-5">
              <span className="font-mono text-xs text-[#ffa116] uppercase tracking-wider font-semibold">
                01 · CURATED PROBLEM ENGINE
              </span>
              <Link
                to="/dsa"
                className="font-mono text-xs text-zinc-400 group-hover:text-white flex items-center gap-1.5 transition-colors"
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

            {/* Difficulty breakdown metrics */}
            <div className="grid grid-cols-3 gap-3 max-w-md pt-2">
              <div className="bg-white/[0.02] border border-emerald-500/20 rounded-xl p-3 text-left">
                <div className="text-[10px] font-mono text-emerald-400 font-bold uppercase tracking-wider">
                  Easy
                </div>
                <div className="font-display text-base font-bold text-white mt-1">
                  Pattern Basics
                </div>
                <div className="text-[11px] font-mono text-zinc-500 mt-0.5">Foundational</div>
              </div>
              <div className="bg-white/[0.02] border border-amber-500/20 rounded-xl p-3 text-left">
                <div className="text-[10px] font-mono text-amber-400 font-bold uppercase tracking-wider">
                  Medium
                </div>
                <div className="font-display text-base font-bold text-white mt-1">
                  Core Rounds
                </div>
                <div className="text-[11px] font-mono text-zinc-500 mt-0.5">70% of Interviews</div>
              </div>
              <div className="bg-white/[0.02] border border-rose-500/20 rounded-xl p-3 text-left">
                <div className="text-[10px] font-mono text-rose-400 font-bold uppercase tracking-wider">
                  Hard
                </div>
                <div className="font-display text-base font-bold text-white mt-1">
                  FAANG Bar
                </div>
                <div className="text-[11px] font-mono text-zinc-500 mt-0.5">Advanced Edge-Cases</div>
              </div>
            </div>
          </div>
        </div>

        {/* ── Bento 2: AI System Architect ── */}
        <div className="rounded-2xl luxury-card p-6 sm:p-8 flex flex-col justify-between group relative overflow-hidden">
          <div>
            <div className="flex items-center justify-between mb-5">
              <span className="font-mono text-xs text-[#ffa116] uppercase tracking-wider font-semibold">
                02 · SYSTEM ARCHITECT
              </span>
              <Link
                to="/ai-projects"
                className="font-mono text-xs text-zinc-400 group-hover:text-white flex items-center gap-1.5 transition-colors"
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

            <div className="bg-black/60 border border-white/[0.08] rounded-xl p-3.5 font-mono text-[11px] text-zinc-300 break-words leading-relaxed shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]">
              <span className="text-[#ffa116]">$</span> prepstack spec --distributed --cache redis --p99 5ms
            </div>
          </div>
        </div>

        {/* ── Bento 3: Core CS Internals ── */}
        <div className="rounded-2xl luxury-card p-6 sm:p-8 flex flex-col justify-between group relative overflow-hidden">
          <div>
            <div className="flex items-center justify-between mb-5">
              <span className="font-mono text-xs text-cyan-400 uppercase tracking-wider font-semibold">
                03 · CS FUNDAMENTALS
              </span>
              <Link
                to="/notes"
                className="font-mono text-xs text-zinc-400 group-hover:text-white flex items-center gap-1.5 transition-colors"
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

            <div className="flex flex-wrap gap-2">
              {["Virtual Memory", "B+ Tree Indexing", "TCP Handshake", "ACID Isolation"].map((pill) => (
                <span
                  key={pill}
                  className="px-2.5 py-1 rounded-md bg-white/[0.03] border border-white/[0.08] text-[11px] text-zinc-300 font-mono"
                >
                  {pill}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* ── Bento 4: Structured Roadmaps ── */}
        <div className="rounded-2xl luxury-card p-6 sm:p-8 flex flex-col justify-between group relative overflow-hidden">
          <div>
            <div className="flex items-center justify-between mb-5">
              <span className="font-mono text-xs text-purple-400 uppercase tracking-wider font-semibold">
                04 · MILESTONES
              </span>
              <Link
                to="/roadmaps"
                className="font-mono text-xs text-zinc-400 group-hover:text-white flex items-center gap-1.5 transition-colors"
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

            <div className="flex flex-wrap gap-2">
              {["Frontend", "Backend", "Full Stack", "DevOps"].map((pill) => (
                <span
                  key={pill}
                  className="px-2.5 py-1 rounded-md bg-purple-500/10 border border-purple-500/20 text-[11px] text-purple-300 font-mono"
                >
                  {pill}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* ── Bento 5: Offer Stage Toolkit ── */}
        <div className="rounded-2xl luxury-card p-6 sm:p-8 flex flex-col justify-between group relative overflow-hidden">
          <div>
            <div className="flex items-center justify-between mb-5">
              <span className="font-mono text-xs text-emerald-400 uppercase tracking-wider font-semibold">
                05 · OFFER CLOSING
              </span>
              <Link
                to="/behavioral"
                className="font-mono text-xs text-zinc-400 group-hover:text-white flex items-center gap-1.5 transition-colors"
              >
                Prepare <FiExternalLink className="text-xs text-emerald-400" />
              </Link>
            </div>
            <h3 className="font-display text-xl font-bold text-white tracking-tight mb-2">
              Behavioral &amp; ATS Resume
            </h3>
            <p className="text-sm text-zinc-400 leading-relaxed mb-6">
              Actionable STAR-method behavioral question breakdowns and metric-driven ATS resume bullet frameworks.
            </p>

            <div className="flex flex-wrap gap-2">
              {["STAR Matrix", "XYZ Formula", "Leadership Bar"].map((pill) => (
                <span
                  key={pill}
                  className="px-2.5 py-1 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-[11px] text-emerald-300 font-mono"
                >
                  {pill}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default BentoGrid;
