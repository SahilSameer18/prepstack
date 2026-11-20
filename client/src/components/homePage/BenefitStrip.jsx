import React from "react";
import { BookOpenText, Briefcase, CalendarCheck, CodeBlock } from "@phosphor-icons/react";

// Four plain promises under the hero. No counts, so nothing here can go out of date.
const BENEFITS = [
  { icon: <CalendarCheck weight="duotone" aria-hidden="true" />, title: "A plan for your hours", text: "Put in your goal, weeks and daily hours. Get a day-by-day plan." },
  { icon: <CodeBlock weight="duotone" aria-hidden="true" />, title: "Curated DSA sheets", text: "Blind 75, NeetCode 150 and Striver, with your progress saved." },
  { icon: <BookOpenText weight="duotone" aria-hidden="true" />, title: "Revise CS concepts", text: "OS, DBMS, networks, OOP and system design in simple words." },
  { icon: <Briefcase weight="duotone" aria-hidden="true" />, title: "Ace the interview", text: "Roadmaps, behavioral questions and a resume-to-job match." },
];

const BenefitStrip = () => (
  <div className="xl:-mt-12 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-y-8 xl:gap-y-0 border-y border-ink/[0.1] py-8 xl:divide-x xl:divide-ink/[0.1]">
    {BENEFITS.map(({ icon, title, text }) => (
      <div key={title} className="flex items-start gap-4 xl:px-7 xl:first:pl-0 xl:last:pr-0">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-brand/25 bg-brand/10 text-2xl text-brand">
          {icon}
        </span>
        <div>
          <h3 className="font-display text-sm font-bold text-fg">{title}</h3>
          <p className="mt-1 text-sm leading-relaxed text-muted">{text}</p>
        </div>
      </div>
    ))}
  </div>
);

export default BenefitStrip;
