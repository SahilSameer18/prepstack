import React from "react";
import { Link } from "react-router-dom";
import { FaArrowRight } from "react-icons/fa";
import { FiCommand, FiShield } from "react-icons/fi";
import { useAuth } from "../../hooks/useAuth";
import HeroProductShowcase from "./HeroProductShowcase";

const HeroSection = () => {
  const { user } = useAuth();

  return (
    <section className="pt-3 sm:pt-6 pb-6 sm:pb-12 text-left">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
        {/* ── LEFT PANE: Mission, Editorial Typography, Direct CTA (5 Columns) ── */}
        <div className="min-w-0 lg:col-span-5 flex flex-col justify-center space-y-6 sm:space-y-7">
          {/* Product Purpose Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.03] border border-white/[0.1] shadow-[inset_0_1px_0_rgba(255,255,255,0.12)] w-fit text-left">
            <span className="w-1.5 h-1.5 rounded-full bg-[#ffa116]" />
            <span className="font-mono text-[10.5px] uppercase tracking-wider text-zinc-300 font-semibold">
              Software Engineering Placement Suite
            </span>
            <span className="text-zinc-600">·</span>
            <span className="text-[11px] text-zinc-400 font-medium">DSA · Systems · CS Core</span>
          </div>

          {/* Left-Aligned High-Contrast Display Headline with Specular Sheen */}
          <h1 className="font-display text-4xl sm:text-5xl lg:text-[54px] font-black tracking-[-0.035em] text-white leading-[1.06]">
            Stop grinding blindly.{" "}
            <span className="block mt-1.5 bg-gradient-to-r from-[#ffa116] via-[#ffb84d] to-[#ffa116] bg-clip-text text-transparent">
              Engineer your placement.
            </span>
          </h1>

          {/* Authoritative Subtitle */}
          <p className="text-sm sm:text-base text-zinc-400 leading-relaxed font-normal max-w-lg">
            A unified technical cockpit replacing 15 scattered tabs. Vetted algorithmic patterns, low-level CS internals, and production-grade system blueprints engineered for real technical rounds.
          </p>

          {/* Capability Tags */}
          <div className="flex flex-wrap items-center gap-2 pt-1 font-mono text-[11px]">
            <span className="px-2.5 py-1 rounded-lg bg-zinc-900/80 border border-white/[0.08] text-zinc-300 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#ffa116]" />
              75 Core Patterns
            </span>
            <span className="px-2.5 py-1 rounded-lg bg-zinc-900/80 border border-white/[0.08] text-zinc-300 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
              Atomic DB Sync
            </span>
            <span className="px-2.5 py-1 rounded-lg bg-zinc-900/80 border border-white/[0.08] text-zinc-300 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              Low-Level CS
            </span>
          </div>

          {/* Action Strip with Hardware Physics */}
          <div className="flex flex-wrap items-center gap-3.5 pt-2">
            <Link
              to="/dsa"
              className="amber-specular-button inline-flex items-center gap-2 font-bold px-6 py-3.5 rounded-xl text-xs sm:text-sm font-display tracking-tight cursor-pointer select-none group"
            >
              Launch Workspace{" "}
              <FaArrowRight className="text-xs transition-transform duration-150 group-hover:translate-x-1" />
            </Link>

            {user ? (
              <Link
                to="/dashboard"
                className="titanium-button inline-flex items-center gap-2 px-5 py-3.5 rounded-xl text-xs sm:text-sm font-medium cursor-pointer select-none"
              >
                Dashboard
                <span className="kbd-capsule">G &rarr; D</span>
              </Link>
            ) : (
              <Link
                to="/register"
                className="titanium-button inline-flex items-center gap-2 px-5 py-3.5 rounded-xl text-xs sm:text-sm font-medium cursor-pointer select-none"
              >
                Create Account
                <span className="kbd-capsule">Tab</span>
              </Link>
            )}
          </div>

          {/* Target Placement Ticker */}
          <div className="pt-4 border-t border-white/[0.07] flex flex-wrap items-center gap-2 font-mono text-[11px] text-zinc-400">
            <span className="text-zinc-500 uppercase tracking-wider font-semibold flex items-center gap-1">
              <FiShield className="text-[#ffa116]" /> Curriculum Scope:
            </span>
            <span className="text-zinc-300 font-medium">Blind 75 · NeetCode 150 · Striver SDE · Low-Level CS</span>
          </div>
        </div>

        {/* ── RIGHT PANE: Live Interactive IDE Workbench Cockpit (7 Columns) ── */}
        <div className="min-w-0 lg:col-span-7 w-full">
          <HeroProductShowcase />
        </div>
      </div>
    </section>
  );
};

export default HeroSection;

