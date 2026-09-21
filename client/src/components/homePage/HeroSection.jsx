import React from "react";
import { Link } from "react-router-dom";
import { FaArrowRight } from "react-icons/fa";
import { useAuth } from "../../hooks/useAuth";
import HeroProductShowcase from "./HeroProductShowcase";

const HeroSection = () => {
  const { user } = useAuth();

  return (
    <section className="pt-4 sm:pt-8 pb-6 sm:pb-12 text-left">
      <div className="grid lg:grid-cols-12 gap-8 lg:gap-12 items-center">
        {/* ── LEFT PANE: Mission, Editorial Typography, Direct CTA (5 Columns) ── */}
        <div className="lg:col-span-5 flex flex-col justify-center space-y-6 sm:space-y-7">
          {/* Left-Aligned High-Contrast Display Headline */}
          <h1 className="font-display text-4xl sm:text-5xl lg:text-[54px] font-extrabold tracking-[-0.035em] text-white leading-[1.07]">
            Stop grinding blindly.{" "}
            <span className="text-[#ffa116] block mt-1.5">
              Engineer your placement.
            </span>
          </h1>

          {/* Authoritative Subtitle */}
          <p className="text-sm sm:text-base text-zinc-400 leading-relaxed font-normal max-w-lg">
            A unified technical cockpit replacing 15 scattered tabs. Vetted algorithmic patterns, low-level CS internals, and production-grade system blueprints designed for real interview rounds.
          </p>

          {/* Capability Tags */}
          <div className="flex flex-wrap gap-2 pt-1 font-mono text-[11px]">
            <span className="px-2.5 py-1 rounded-md bg-white/[0.03] border border-white/[0.08] text-zinc-300">
              75 Core Patterns
            </span>
            <span className="px-2.5 py-1 rounded-md bg-white/[0.03] border border-white/[0.08] text-zinc-300">
              Atomic DB Sync
            </span>
            <span className="px-2.5 py-1 rounded-md bg-white/[0.03] border border-white/[0.08] text-zinc-300">
              Low-Level CS
            </span>
          </div>

          {/* Action Strip */}
          <div className="flex flex-wrap items-center gap-3.5 pt-2">
            <Link
              to="/dsa"
              className="amber-specular-button inline-flex items-center gap-2 font-bold px-6 py-3.5 rounded-xl text-xs sm:text-sm font-display tracking-tight cursor-pointer"
            >
              Launch Workspace <FaArrowRight className="text-xs" />
            </Link>

            {user ? (
              <Link
                to="/dashboard"
                className="inline-flex items-center gap-1.5 px-5 py-3.5 rounded-xl border border-white/[0.1] bg-white/[0.02] text-zinc-300 hover:bg-white/[0.06] hover:text-white hover:border-white/[0.2] transition-all text-xs sm:text-sm font-medium shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] cursor-pointer"
              >
                Dashboard &rarr;
              </Link>
            ) : (
              <Link
                to="/register"
                className="inline-flex items-center gap-1.5 px-5 py-3.5 rounded-xl border border-white/[0.1] bg-white/[0.02] text-zinc-300 hover:bg-white/[0.06] hover:text-white hover:border-white/[0.2] transition-all text-xs sm:text-sm font-medium shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] cursor-pointer"
              >
                Create Account
              </Link>
            )}
          </div>

          {/* Target Placement Ticker */}
          <div className="pt-4 border-t border-white/[0.06] flex items-center gap-2 font-mono text-[11px] text-zinc-400">
            <span className="text-zinc-500 uppercase tracking-wider font-semibold">Alumni Placements:</span>
            <span className="truncate text-zinc-300">Google · Amazon · Microsoft · Swiggy · Top Startups</span>
          </div>
        </div>

        {/* ── RIGHT PANE: Live Interactive IDE Workbench Cockpit (7 Columns) ── */}
        <div className="lg:col-span-7 w-full">
          <HeroProductShowcase />
        </div>
      </div>
    </section>
  );
};

export default HeroSection;

