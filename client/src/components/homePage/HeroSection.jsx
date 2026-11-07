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
          {/* Eyebrow */}
          <p className="flex items-center gap-2 font-ui text-sm font-medium text-fg-3">
            <span className="w-1.5 h-1.5 rounded-full bg-brand" />
            Interview prep for software engineers
          </p>

          {/* Left-Aligned High-Contrast Display Headline with Specular Sheen */}
          <h1 className="font-display text-4xl sm:text-5xl lg:text-[54px] font-black tracking-[-0.035em] text-fg leading-[1.06]">
            Stop grinding blindly.{" "}
            <span className="block mt-1.5 bg-gradient-to-r from-brand via-brand-hover to-brand bg-clip-text text-transparent">
              Engineer your placement.
            </span>
          </h1>

          {/* Authoritative Subtitle */}
          <p className="text-sm sm:text-base text-muted leading-relaxed font-normal max-w-lg">
            One place for interview prep: curated DSA sheets, CS notes, roadmaps and AI project ideas, instead of 15 scattered tabs.
          </p>

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

          <Link to="/analyzer" className="inline-block text-sm text-brand hover:underline">New: match your resume to a job with the Role Analyzer &rarr;</Link>

          {/* Target Placement Ticker */}
          <div className="pt-2 flex flex-wrap items-center gap-2 font-ui text-xs text-muted">
            <span className="text-fg-3 font-semibold flex items-center gap-1">
              <FiShield className="text-brand" /> What's covered:
            </span>
            <span className="text-fg-3 font-medium">Blind 75 · NeetCode 150 · Striver SDE · Low-Level CS</span>
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

