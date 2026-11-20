import React from "react";
import { FiCheck, FiX } from "react-icons/fi";
import { CalendarCheck, LinkSimple, PuzzlePiece } from "@phosphor-icons/react";

// Compared with the usual way of preparing, not with named products: every line here is something the app really does.
const USUAL = [
  "LeetCode or a sheet for DSA",
  "Blog posts for CS theory",
  "A chatbot for project ideas",
  "A spreadsheet for the schedule",
];

const WITH_US = [
  "One plan that fits your hours",
  "Sheets, notes and roadmaps that link together",
  "Your resume matched against a job",
  "Progress saved to your account",
];

const REASONS = [
  {
    icon: <CalendarCheck weight="duotone" aria-hidden="true" />,
    title: "The plan is the product",
    text: "It fits your hours, shows what does not fit, brings solved problems back for review, and recovers when you fall behind. A chatbot writes a plan once. It does not keep it honest.",
  },
  {
    icon: <LinkSimple weight="duotone" aria-hidden="true" />,
    title: "One place, linked together",
    text: "The sheets, notes, roadmaps and the resume match point at each other, so the plan always links to something you can open.",
  },
  {
    icon: <PuzzlePiece weight="duotone" aria-hidden="true" />,
    title: "Works with what you already use",
    text: "You can still solve on LeetCode. PrepStack plans around it and keeps your schedule honest.",
  },
];

const WhySection = () => (
  <section aria-labelledby="home-why-heading" className="text-left">
    <h2 id="home-why-heading" className="max-w-3xl font-display text-4xl sm:text-5xl font-black tracking-[-0.04em] leading-[1.04] text-fg">
      Why PrepStack, and not a pile of <span className="text-brand">scattered tabs.</span>
    </h2>
    <p className="mt-5 max-w-xl text-base leading-relaxed text-muted">
      Each tool you use today is good at its own job. What breaks is the part in between: knowing what to do today.
    </p>

    <div className="mt-9 grid grid-cols-1 overflow-hidden rounded-2xl border border-ink/[0.1] md:grid-cols-2">
      <div className="bg-card p-6 sm:p-8">
        <h3 className="font-display text-sm font-bold text-muted">The usual way</h3>
        <ul className="mt-4 space-y-3">
          {USUAL.map((line) => (
            <li key={line} className="flex items-start gap-3 text-sm sm:text-base text-muted">
              <FiX aria-hidden="true" className="mt-1 shrink-0 text-faint" />
              {line}
            </li>
          ))}
        </ul>
      </div>
      <div className="border-t border-ink/[0.1] bg-brand/10 p-6 sm:p-8 md:border-l md:border-t-0">
        <h3 className="font-display text-sm font-bold text-brand">With PrepStack</h3>
        <ul className="mt-4 space-y-3">
          {WITH_US.map((line) => (
            <li key={line} className="flex items-start gap-3 text-sm sm:text-base text-fg-2">
              <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand/20 text-xs text-brand">
                <FiCheck aria-hidden="true" />
              </span>
              {line}
            </li>
          ))}
        </ul>
      </div>
    </div>

    <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-3">
      {REASONS.map((reason) => (
        <div
          key={reason.title}
          className="rounded-2xl border border-ink/[0.1] bg-card p-5 shadow-[0_1px_2px_color-mix(in_srgb,var(--shadow)_14%,transparent),0_16px_30px_-20px_color-mix(in_srgb,var(--shadow)_40%,transparent)]"
        >
          <span className="flex h-11 w-11 items-center justify-center rounded-xl border border-brand/25 bg-brand/10 text-2xl text-brand">
            {reason.icon}
          </span>
          <h3 className="mt-4 font-display text-base font-extrabold tracking-tight text-fg">{reason.title}</h3>
          <p className="mt-2 text-sm leading-relaxed text-muted">{reason.text}</p>
        </div>
      ))}
    </div>

    <p className="mt-5 text-sm text-muted">It is free, with no card. Reading the sheets and notes needs no account.</p>
  </section>
);

export default WhySection;
