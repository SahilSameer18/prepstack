import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "@phosphor-icons/react";

const STEPS = [
  { n: "01", title: "Tell us your goal and hours", text: "Pick a goal, your weeks and the hours you really have. It builds a day-by-day schedule." },
  { n: "02", title: "Get one plan, day by day", text: "It shows what fits before your deadline, and what does not." },
  { n: "03", title: "Tick, review, catch up", text: "Problems you solve come back for review at fixed gaps. Fall behind, pause, or change your hours: you see the new schedule before anything changes." },
];

const HowItWorks = () => (
  <section aria-labelledby="home-how-heading" className="pt-2 text-left">
    <p className="font-code text-xs uppercase tracking-[0.14em] text-muted">How it works</p>
    <h2 id="home-how-heading" className="mt-3 max-w-3xl font-display text-4xl font-black leading-[1.04] tracking-[-0.04em] text-fg sm:text-5xl">
      Three steps. Then just show up.
    </h2>
    <ol className="mt-10 grid divide-y divide-ink/[0.1] lg:grid-cols-3 lg:divide-x lg:divide-y-0">
      {STEPS.map((step) => (
        <li key={step.n} className="py-7 lg:px-7 lg:py-2 lg:first:pl-0 lg:last:pr-0">
          <span className="font-code text-sm text-brand">{step.n}</span>
          <p className="mt-3 font-display text-2xl font-extrabold tracking-tight text-fg">{step.title}</p>
          <p className="mt-2 leading-relaxed text-muted">{step.text}</p>
        </li>
      ))}
    </ol>
    <Link to="/my-plan" className="group mt-8 inline-flex min-h-[44px] items-center gap-2 font-display text-sm font-bold text-brand">
      Build my study plan <ArrowRight aria-hidden="true" className="transition-transform duration-150 group-hover:translate-x-1" />
    </Link>
    <p className="mt-1 text-sm text-muted">Free to preview. Sign in only when you want to save it.</p>
  </section>
);

export default HowItWorks;
