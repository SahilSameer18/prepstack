import { Link } from "react-router-dom";
import { FiCheck } from "react-icons/fi";
import { CalendarCheck } from "@phosphor-icons/react";

const POINTS = [
  "Tell it your goal, your weeks and your hours. It builds a day-by-day schedule.",
  "It shows what fits before your deadline, and what does not.",
  "Fall behind, pause, or change your hours: you see the new schedule before anything changes.",
  "Problems you solve come back for review at fixed gaps.",
];

// An example of what the Today screen looks like: the day, the tasks, the time and one Start button. Made-up tasks, labelled as an example.
const EXAMPLE_TASKS = [
  { title: "Two Sum", kind: "DSA problem", time: "20 min" },
  { title: "ACID properties", kind: "CS notes", time: "25 min" },
  { title: "Review: Binary Search", kind: "Review", time: "15 min" },
];

const PlanSection = () => (
  <section aria-labelledby="home-plan-heading" className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center text-left">
    <div className="lg:col-span-6 min-w-0">
      <span className="flex h-12 w-12 items-center justify-center rounded-xl border border-brand/25 bg-brand/10 text-3xl text-brand">
        <CalendarCheck weight="duotone" aria-hidden="true" />
      </span>
      <h2 id="home-plan-heading" className="mt-5 font-display text-4xl sm:text-5xl font-black tracking-[-0.04em] leading-[1.04] text-fg">
        A study plan that <span className="text-brand">fits your hours.</span>
      </h2>
      <ul className="mt-6 space-y-3">
        {POINTS.map((point) => (
          <li key={point} className="flex items-start gap-3 text-sm sm:text-base text-fg-3">
            <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand/15 text-xs text-brand">
              <FiCheck aria-hidden="true" />
            </span>
            {point}
          </li>
        ))}
      </ul>
      <Link to="/my-plan" className="amber-specular-button mt-7 inline-flex min-h-[44px] items-center rounded-xl px-6 py-3 text-sm font-bold">
        Build my study plan
      </Link>
      <p className="mt-3 text-xs text-muted">Free to preview. Sign in only when you want to save it.</p>
    </div>

    <div className="lg:col-span-6 min-w-0">
      <div className="mx-auto w-full max-w-md rounded-2xl border border-ink/[0.1] bg-card p-5 sm:p-6 shadow-[0_2px_4px_color-mix(in_srgb,var(--shadow)_16%,transparent),0_30px_60px_-26px_color-mix(in_srgb,var(--shadow)_60%,transparent)]">
        <div className="flex items-center justify-between text-xs text-muted">
          <span className="font-semibold text-fg-3">Today</span>
          <span className="rounded-md bg-ink/[0.06] px-1.5 py-0.5">Example</span>
        </div>
        <p className="mt-3 font-display text-xl font-extrabold tracking-tight text-fg">3 tasks, about 1 h</p>
        <ul className="mt-4 divide-y divide-ink/[0.08] rounded-xl border border-ink/[0.08]">
          {EXAMPLE_TASKS.map((task) => (
            <li key={task.title} className="flex items-center justify-between gap-3 px-3.5 py-3 text-sm">
              <span className="min-w-0">
                <span className="block truncate font-medium text-fg">{task.title}</span>
                <span className="block text-xs text-muted">{task.kind}</span>
              </span>
              <span className="shrink-0 text-xs text-muted">{task.time}</span>
            </li>
          ))}
        </ul>
        <span className="amber-specular-button mt-5 flex items-center justify-center rounded-xl py-3 text-sm font-bold">Start</span>
      </div>
    </div>
  </section>
);

export default PlanSection;
