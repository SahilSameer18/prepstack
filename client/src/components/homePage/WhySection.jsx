import React from "react";
import { Check, X } from "@phosphor-icons/react";

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

const WhySection = () => (
  <section aria-labelledby="home-why-heading" className="border-t border-ink/[0.1] pt-16 text-left">
    <p className="font-code text-xs uppercase tracking-[0.14em] text-muted">Why PrepStack</p>
    <h2 id="home-why-heading" className="mt-3 max-w-3xl font-display text-4xl font-black leading-[1.04] tracking-[-0.04em] text-fg sm:text-5xl">
      Not a pile of scattered tabs.
    </h2>
    <p className="mt-5 max-w-xl text-base leading-relaxed text-muted">
      Each tool you use today is good at its own job. What breaks is the part in between: knowing what to do today. You can still solve on LeetCode: PrepStack plans around it and keeps your schedule honest.
    </p>

    <div className="mt-9 grid grid-cols-1 overflow-hidden rounded-2xl border border-ink/[0.1] md:grid-cols-2">
      <div className="bg-card p-6 sm:p-8">
        <h3 className="font-display text-sm font-bold text-muted">The usual way</h3>
        <ul className="mt-4 space-y-3">
          {USUAL.map((line) => (
            <li key={line} className="flex items-start gap-3 text-sm text-muted sm:text-base">
              <X aria-hidden="true" className="mt-1 shrink-0 text-faint" />
              {line}
            </li>
          ))}
        </ul>
      </div>
      <div className="border-t border-ink/[0.1] bg-brand/10 p-6 sm:p-8 md:border-l md:border-t-0">
        <h3 className="font-display text-sm font-bold text-brand">With PrepStack</h3>
        <ul className="mt-4 space-y-3">
          {WITH_US.map((line) => (
            <li key={line} className="flex items-start gap-3 text-sm text-fg-2 sm:text-base">
              <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand/20 text-xs text-brand">
                <Check aria-hidden="true" />
              </span>
              {line}
            </li>
          ))}
        </ul>
      </div>
    </div>
  </section>
);

export default WhySection;
