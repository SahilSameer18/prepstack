import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight, CheckCircle, MinusCircle, XCircle } from "@phosphor-icons/react";

// A made-up example of a report, labelled as one: the score, one mark per requirement from the job, and three of the requirement rows.
const MARKS = ["bg-ok-solid", "bg-ok-solid", "bg-warn-solid", "bg-bad-solid", "bg-warn-solid", "bg-bad-solid", "bg-ok-solid"];
const ROWS = [
  { name: "React and component design", label: "Matched", Icon: CheckCircle, tone: "text-ok" },
  { name: "SQL databases", label: "Partly", Icon: MinusCircle, tone: "text-warn" },
  { name: "Docker", label: "Missing", Icon: XCircle, tone: "text-bad" },
];

const AnalyzerShowcase = () => (
  <section aria-labelledby="home-analyzer-heading" className="grid items-center gap-12 border-t border-ink/[0.1] pt-16 text-left lg:grid-cols-[1fr_520px] lg:gap-16">
    <div>
      <p className="font-code text-xs uppercase tracking-[0.14em] text-muted">Role Analyzer</p>
      <h2 id="home-analyzer-heading" className="mt-3 font-display text-4xl font-bold leading-[1.04] tracking-[-0.04em] text-fg sm:text-5xl">
        Does your resume prove what the job asks?
      </h2>
      <p className="mt-5 max-w-md text-lg leading-relaxed text-muted">
        Paste a job and your resume. See, requirement by requirement, what your resume proves, what it only half shows, and what is missing. Then get a plan to close the gaps.
      </p>
      <Link to="/analyzer" className="titanium-button group mt-7 inline-flex min-h-[44px] items-center gap-2 rounded-xl px-6 text-sm font-semibold">
        Try the Role Analyzer <ArrowRight aria-hidden="true" className="transition-transform duration-150 group-hover:translate-x-1" />
      </Link>
      <p className="mt-3 text-sm text-muted">Needs a free account. Your resume is not saved, only the report.</p>
    </div>

    <div className="surface-card p-6 sm:p-7">
      <div className="flex items-center justify-between text-xs text-muted">
        <span className="font-semibold text-fg-3">Evidence match</span>
        <span className="rounded-md bg-ink/[0.06] px-1.5 py-0.5">Example</span>
      </div>
      <div className="mt-3 flex items-baseline gap-3">
        <span className="font-display text-7xl font-black leading-none tracking-tight text-fg">64</span>
        <span className="text-muted">out of 100</span>
      </div>
      <div className="mt-5 flex gap-1.5" aria-hidden="true">
        {MARKS.map((mark, i) => <span key={i} className={`h-2.5 min-w-0 flex-1 rounded-full ${mark}`} />)}
      </div>
      <ul className="mt-5 divide-y divide-ink/[0.1] border-t border-ink/[0.1]">
        {ROWS.map((row) => {
          const Icon = row.Icon;
          return (
            <li key={row.name} className="flex items-center gap-3 py-3.5">
              <Icon weight="duotone" aria-hidden="true" className={`shrink-0 text-2xl ${row.tone}`} />
              <span className="min-w-0 flex-1 font-semibold text-fg">{row.name}</span>
              <span className={`text-sm font-semibold ${row.tone}`}>{row.label}</span>
            </li>
          );
        })}
      </ul>
    </div>
  </section>
);

export default AnalyzerShowcase;
