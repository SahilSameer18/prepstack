import React, { useState } from "react";
import { ArrowRight } from "@phosphor-icons/react";
import { Link } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import homeFacts from "../../data/homeFacts.json";
import Reveal from "../ui/Reveal";

// The hero is the planner's idea in one picture: choose how many weeks you have and see them as one mark per day.
// Study days are amber, rest days stay faint. The numbers are arithmetic on two stated assumptions, not a promise.
const STUDY_DAYS_PER_WEEK = 5; // assumption
const MINUTES_PER_PROBLEM = 40; // assumption
const BLIND_75 = homeFacts.perSheet["blind-75"]; // the real size of the Blind 75 sheet
const WEEK_CHOICES = [4, 8, 12];

const problemsThatFit = (weeks, hoursPerDay) =>
  Math.min(BLIND_75, Math.floor((weeks * STUDY_DAYS_PER_WEEK * hoursPerDay * 60) / MINUTES_PER_PROBLEM));

const HeroSection = () => {
  const { user } = useAuth();
  const [weeks, setWeeks] = useState(8);
  const days = weeks * 7;

  return (
    <section className="pb-4 pt-2 text-left sm:pt-6">
      <Reveal as="p" onLoad className="font-code text-xs uppercase tracking-[0.14em] text-muted">Free · no card · reading is open</Reveal>
      <div className="relative">
        <Reveal as="h1" onLoad delay={0.05} className="mt-5 max-w-3xl font-display text-4xl font-bold leading-[1.02] tracking-[-0.045em] text-fg sm:text-6xl lg:text-[68px]">
          <span className="block font-medium text-fg-3">Stop grinding blindly.</span>
          <span className="block">Engineer your placement.</span>
        </Reveal>
        {/* the two personal touches, kept together in the empty space beside the headline */}
        <div className="absolute right-4 top-2 hidden w-60 xl:block">
          <Reveal as="p" onLoad y={10} delay={0.5} className="-rotate-3 font-hand text-3xl text-fg-2">
            <span aria-hidden="true" className="draw-underline">Prepare. Build. Excel.</span>
          </Reveal>
          <Reveal onLoad spring y={-14} delay={0.85} className="ml-6 mt-8 w-fit -rotate-3 rounded-xl border border-brand-grad-top/25 bg-scrim px-4 py-2.5 font-code text-xs leading-relaxed shadow-[0_24px_40px_-16px_color-mix(in_srgb,var(--shadow)_75%,transparent)]">
            <p className="text-brand-grad-top">
              <span className="opacity-60">while</span> (preparing) <span className="opacity-60">{"{"}</span>
            </p>
            <p className="pl-4 text-brand-grad-hover-top">level++;</p>
            <p className="text-brand-grad-top opacity-60">{"}"}</p>
          </Reveal>
        </div>
      </div>

      <Reveal onLoad delay={0.12} className="mt-5 max-w-2xl">
        <p className="text-base leading-relaxed text-fg-3 sm:text-lg">
          A day-by-day study plan for your hours, with DSA practice, CS notes and reviews. Preview what fits before you save.
        </p>
        <div className="mt-5 flex flex-wrap items-center gap-5">
          <Link
            to={`/my-plan?weeks=${weeks}`}
            className="amber-specular-button group inline-flex min-h-[48px] items-center gap-2 rounded-xl px-6 py-3.5 font-display text-sm font-bold tracking-tight"
          >
            Build my study plan <ArrowRight aria-hidden="true" className="transition-transform duration-200 group-hover:translate-x-1" />
          </Link>
          <Link to={user ? "/dashboard" : "/register"} className="inline-flex min-h-[44px] items-center text-sm font-medium text-fg-3 transition-colors hover:text-fg">
            {user ? "Open dashboard" : "Create account"} &rarr;
          </Link>
        </div>
      </Reveal>

      <Reveal onLoad delay={0.2} className="mt-8 border-t border-ink/[0.1] pt-6">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div role="group" aria-labelledby="hero-weeks-label">
            <p id="hero-weeks-label" className="font-code text-xs uppercase tracking-[0.14em] text-muted">How many weeks until your placement drive?</p>
            <div className="mt-3 flex gap-2">
              {WEEK_CHOICES.map((w) => (
                <button
                  key={w}
                  type="button"
                  onClick={() => setWeeks(w)}
                  aria-pressed={w === weeks}
                  className={`min-h-[44px] cursor-pointer whitespace-nowrap rounded-lg border px-3 font-code text-sm transition-colors sm:px-4 ${w === weeks ? "border-brand/50 bg-brand/15 font-semibold text-brand" : "border-ink/[0.2] bg-card text-fg-3 hover:border-ink/[0.4] hover:text-fg"}`}
                >
                  {w} weeks
                </button>
              ))}
            </div>
          </div>
          <p className="font-code text-6xl font-medium leading-none tracking-[-0.05em] text-fg sm:text-8xl">
            {days}
            <span className="ml-3 text-2xl text-muted sm:text-3xl">days</span>
          </p>
        </div>

        {/* one mark per day; 14 columns on a phone (two weeks a row), 28 on wider screens (four weeks a row) */}
        <div aria-hidden="true" className="mt-6 grid min-h-[92px] grid-cols-[repeat(14,minmax(0,1fr))] content-start gap-[4px] sm:grid-cols-[repeat(28,minmax(0,1fr))] sm:gap-[5px]">
          {Array.from({ length: days }, (_, i) => {
            const study = i % 7 < STUDY_DAYS_PER_WEEK;
            return (
              <i
                key={i}
                className={`aspect-square rounded-[3px] transition-colors duration-200 ${study ? "bg-brand-grad-top" : "border border-ink/[0.16]"}`}
              />
            );
          })}
        </div>

        <div className="mt-8 flex flex-wrap items-center justify-between gap-6">
          <p aria-live="polite" className="max-w-2xl text-base leading-relaxed text-fg-3">
            {weeks} weeks is {weeks * STUDY_DAYS_PER_WEEK} study days. At 1 hour a day, about {problemsThatFit(weeks, 1)} of the {BLIND_75} Blind 75 problems fit.
            <span className="mt-1 block font-code text-xs text-muted">Assumes {STUDY_DAYS_PER_WEEK} study days a week and {MINUTES_PER_PROBLEM} minutes a problem. Rest days are the faint marks.</span>
          </p>
        </div>
      </Reveal>
    </section>
  );
};

export default HeroSection;
