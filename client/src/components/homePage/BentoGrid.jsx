import React from "react";
import { Link } from "react-router-dom";
import { FiExternalLink } from "react-icons/fi";

const BentoGrid = () => {
  return (
    <section className="my-24">
      <div className="text-center max-w-2xl mx-auto mb-14">
        <p className="text-xs font-mono uppercase tracking-widest text-[#ffa116] mb-2">
          System Capabilities
        </p>
        <h2 className="text-3xl sm:text-4xl font-black text-white">
          Everything in One <span className="text-[#ffa116]">Engineered Suite</span>
        </h2>
      </div>

      <div className="grid md:grid-cols-3 gap-5">
        {/* Bento 1: Large 2-column Tile - DSA Problem Engine */}
        <div className="md:col-span-2 rounded-2xl bg-[#0e0e0e] border border-white/[0.08] p-6 sm:p-8 flex flex-col justify-between hover:border-white/[0.18] transition-all group">
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="font-mono text-xs text-[#ffa116] uppercase tracking-wider">
                01 · CURATED PROBLEM ENGINE
              </span>
              <Link
                to="/dsa"
                className="text-xs text-gray-400 group-hover:text-white flex items-center gap-1 transition-colors"
              >
                View Sheets <FiExternalLink className="text-xs" />
              </Link>
            </div>
            <h3 className="text-2xl font-bold text-white mb-2">
              Striver SDE, NeetCode 150 & Love Babbar
            </h3>
            <p className="text-sm text-gray-400 max-w-lg mb-6 leading-relaxed">
              No random problem dumps. Pattern-based progression from arrays to dynamic programming, with instant atomic progress synchronization.
            </p>

            {/* Difficulty distribution breakdown */}
            <div className="grid grid-cols-3 gap-3 max-w-md pt-2">
              <div className="bg-white/[0.02] border border-emerald-500/20 rounded-xl p-3 text-center">
                <div className="text-xs font-mono text-emerald-400 font-bold uppercase">Easy</div>
                <div className="text-base font-bold text-white mt-0.5">Foundational</div>
              </div>
              <div className="bg-white/[0.02] border border-amber-500/20 rounded-xl p-3 text-center">
                <div className="text-xs font-mono text-amber-400 font-bold uppercase">Medium</div>
                <div className="text-base font-bold text-white mt-0.5">Interview Core</div>
              </div>
              <div className="bg-white/[0.02] border border-rose-500/20 rounded-xl p-3 text-center">
                <div className="text-xs font-mono text-rose-400 font-bold uppercase">Hard</div>
                <div className="text-base font-bold text-white mt-0.5">FAANG Bar</div>
              </div>
            </div>
          </div>
        </div>

        {/* Bento 2: AI Project Architect */}
        <div className="rounded-2xl bg-[#0e0e0e] border border-white/[0.08] p-6 sm:p-8 flex flex-col justify-between hover:border-white/[0.18] transition-all group">
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="font-mono text-xs text-[#ffa116] uppercase tracking-wider">
                02 · AI ARCHITECT
              </span>
              <Link
                to="/ai-projects"
                className="text-xs text-gray-400 group-hover:text-white flex items-center gap-1 transition-colors"
              >
                Generate <FiExternalLink className="text-xs" />
              </Link>
            </div>
            <h3 className="text-xl font-bold text-white mb-2">
              Recruiter-Grade Ideas
            </h3>
            <p className="text-sm text-gray-400 leading-relaxed mb-6">
              Structured Gemini model generation providing architectural rationale, database choices, and recruiter talking points.
            </p>

            <div className="bg-[#080808] border border-white/[0.06] rounded-xl p-3 font-mono text-xs text-gray-400">
              <span className="text-[#ffa116]">$</span> prepstack generate --stack MERN --complexity advanced
            </div>
          </div>
        </div>

        {/* Bento 3: Core CS Internals */}
        <div className="rounded-2xl bg-[#0e0e0e] border border-white/[0.08] p-6 sm:p-8 flex flex-col justify-between hover:border-white/[0.18] transition-all group">
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="font-mono text-xs text-cyan-400 uppercase tracking-wider">
                03 · EXAM & INTERVIEW READY
              </span>
              <Link
                to="/notes"
                className="text-xs text-gray-400 group-hover:text-white flex items-center gap-1 transition-colors"
              >
                Read <FiExternalLink className="text-xs" />
              </Link>
            </div>
            <h3 className="text-xl font-bold text-white mb-2">
              Core CS Internals
            </h3>
            <p className="text-sm text-gray-400 leading-relaxed mb-4">
              Concise, deep technical coverage of Operating Systems, DBMS, Computer Networks, and OOPs.
            </p>

            <div className="flex flex-wrap gap-1.5">
              {["OS Concurrency", "B+ Trees", "TCP Sockets", "Polymorphism"].map((pill) => (
                <span
                  key={pill}
                  className="px-2.5 py-1 rounded-lg bg-white/[0.03] border border-white/[0.06] text-xs text-gray-300 font-mono"
                >
                  {pill}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Bento 4: Structured Roadmaps */}
        <div className="rounded-2xl bg-[#0e0e0e] border border-white/[0.08] p-6 sm:p-8 flex flex-col justify-between hover:border-white/[0.18] transition-all group">
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="font-mono text-xs text-purple-400 uppercase tracking-wider">
                04 · TRAJECTORIES
              </span>
              <Link
                to="/roadmaps"
                className="text-xs text-gray-400 group-hover:text-white flex items-center gap-1 transition-colors"
              >
                Explore <FiExternalLink className="text-xs" />
              </Link>
            </div>
            <h3 className="text-xl font-bold text-white mb-2">
              Role-Based Roadmaps
            </h3>
            <p className="text-sm text-gray-400 leading-relaxed mb-4">
              Curated learning paths mapped from foundational milestones to production-grade deployment skills.
            </p>

            <div className="flex flex-wrap gap-1.5">
              {["Frontend", "Backend", "Full Stack", "DevOps"].map((pill) => (
                <span
                  key={pill}
                  className="px-2.5 py-1 rounded-lg bg-white/[0.03] border border-white/[0.06] text-xs text-purple-300 font-mono"
                >
                  {pill}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Bento 5: Final Round Toolkit */}
        <div className="rounded-2xl bg-[#0e0e0e] border border-white/[0.08] p-6 sm:p-8 flex flex-col justify-between hover:border-white/[0.18] transition-all group">
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="font-mono text-xs text-emerald-400 uppercase tracking-wider">
                05 · OFFER STAGE
              </span>
              <Link
                to="/behavioral"
                className="text-xs text-gray-400 group-hover:text-white flex items-center gap-1 transition-colors"
              >
                Prepare <FiExternalLink className="text-xs" />
              </Link>
            </div>
            <h3 className="text-xl font-bold text-white mb-2">
              HR & Resume Toolkit
            </h3>
            <p className="text-sm text-gray-400 leading-relaxed mb-4">
              STAR method frameworks for behavioral rounds and actionable ATS resume guides tailored for SDE profiles.
            </p>

            <div className="flex flex-wrap gap-1.5">
              {["STAR Method", "ATS Metrics", "Conflict Resolution"].map((pill) => (
                <span
                  key={pill}
                  className="px-2.5 py-1 rounded-lg bg-white/[0.03] border border-white/[0.06] text-xs text-emerald-300 font-mono"
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
