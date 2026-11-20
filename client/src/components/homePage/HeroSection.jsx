import React from "react";
import { Link } from "react-router-dom";
import { FaArrowRight } from "react-icons/fa";
import { FiCalendar, FiShield } from "react-icons/fi";
import { useAuth } from "../../hooks/useAuth";
import HeroProductShowcase from "./HeroProductShowcase";
import Reveal from "../ui/Reveal";

const HeroSection = () => {
  const { user } = useAuth();

  return (
    <section className="pt-3 sm:pt-6 pb-6 sm:pb-12 text-left">
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 xl:gap-12 items-center">
        {/* ── LEFT PANE: Mission, Editorial Typography, Direct CTA (5 Columns) ── */}
        <div className="min-w-0 xl:col-span-5 flex flex-col justify-center space-y-6 sm:space-y-7">
          {/* Left-Aligned High-Contrast Display Headline with Specular Sheen */}
          <Reveal as="h1" onLoad className="font-display text-4xl sm:text-5xl xl:text-[60px] lg:text-[56px] font-black tracking-[-0.04em] text-fg leading-[1.02]">
            Stop grinding blindly.{" "}
            <span className="block mt-1.5 text-brand">
              Engineer your placement.
            </span>
          </Reveal>

          {/* Authoritative Subtitle */}
          <Reveal as="p" onLoad delay={0.12} className="text-sm sm:text-base text-muted leading-relaxed font-normal max-w-lg">
            Set your goal and weekly hours and get a day-by-day study plan, with curated DSA sheets, CS notes and roadmaps in one place instead of 15 scattered tabs.
          </Reveal>

          {/* Action Strip with Hardware Physics */}
          <Reveal onLoad delay={0.22} className="flex flex-wrap items-center gap-3.5 pt-2">
            <Link
              to="/my-plan"
              className="amber-specular-button inline-flex items-center gap-2 font-bold px-6 py-3.5 rounded-xl text-xs sm:text-sm font-display tracking-tight cursor-pointer select-none group"
            >
              Build my study plan{" "}
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
              </Link>
            )}
          </Reveal>

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
        <div className="relative min-w-0 xl:col-span-7 w-full">
          {/* depth: a card peeking out behind the demo, a layered shadow, and an example Today card overlapping the corner */}
          <div aria-hidden="true" className="hidden sm:block absolute inset-x-6 -top-4 bottom-4 rounded-2xl border border-ink/[0.08] bg-card/70 rotate-[2.2deg]" />
          <Reveal onLoad x={36} y={0} delay={0.2} className="relative rounded-2xl shadow-[0_2px_4px_color-mix(in_srgb,var(--shadow)_18%,transparent),0_40px_80px_-28px_color-mix(in_srgb,var(--shadow)_70%,transparent)]">
            <HeroProductShowcase />
          </Reveal>
          <Reveal as="p" onLoad y={10} delay={0.5} className="hidden xl:block absolute -top-14 left-2 -rotate-3 font-hand text-3xl text-fg-2">
            <span aria-hidden="true" className="draw-underline">Prepare. Build. Excel.</span>
          </Reveal>
          {/* decoration from the design reference: a tilted code chip, amber on a dark plate in both themes */}
          <Reveal onLoad spring y={-14} delay={0.85} className="hidden xl:block absolute -bottom-[68px] right-14 -rotate-3 rounded-xl border border-brand-grad-top/25 bg-scrim px-4 py-2.5 font-code text-xs leading-relaxed shadow-[0_24px_40px_-16px_color-mix(in_srgb,var(--shadow)_75%,transparent)]">
            <p className="text-brand-grad-top">
              <span className="opacity-60">while</span> (preparing) <span className="opacity-60">{"{"}</span>
            </p>
            <p className="pl-4 text-brand-grad-hover-top">level++;</p>
            <p className="text-brand-grad-top opacity-60">{"}"}</p>
          </Reveal>
          <Reveal onLoad spring y={-14} delay={0.7} className="hidden xl:block absolute -top-7 -right-5 w-56 rounded-2xl border border-ink/[0.1] bg-card p-4 shadow-[0_2px_4px_color-mix(in_srgb,var(--shadow)_18%,transparent),0_28px_50px_-18px_color-mix(in_srgb,var(--shadow)_75%,transparent)]">
            <div className="flex items-center justify-between text-xs text-muted">
              <span className="flex items-center gap-1.5 font-semibold text-fg-3"><FiCalendar className="text-brand" /> Today</span>
              <span className="rounded-md bg-ink/[0.06] px-1.5 py-0.5">Example</span>
            </div>
            <p className="mt-2 font-display text-sm font-bold text-fg">3 tasks, about 1 h 20 min</p>
            <span className="amber-specular-button pulse-once mt-3 flex items-center justify-center rounded-lg py-2 text-xs font-bold">Start</span>
          </Reveal>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;

