import { Link } from "react-router-dom";
import { FiTarget } from "react-icons/fi";

const POINTS = [
  "Tell it your goal, your weeks and your hours. It builds a day-by-day schedule.",
  "It shows what fits before your deadline, and what does not.",
  "Fall behind, pause, or change your hours: you see the new schedule before anything changes.",
  "Problems you solve come back for review at fixed gaps.",
];

// The main feature, said plainly on the home page. Free to preview; an account is needed only to save.
const PlanSection = () => (
  <section className="relative mx-auto max-w-5xl text-left" aria-labelledby="home-plan-heading">
    <div className="titanium-card relative overflow-hidden rounded-2xl p-6 sm:p-10">
      <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-brand/40 to-transparent" />
      <span className="mb-4 flex items-center gap-1.5 font-ui text-xs font-semibold uppercase tracking-wider text-brand">
        <FiTarget className="text-sm" /> My plan
      </span>
      <h2 id="home-plan-heading" className="mb-4 font-display text-2xl font-extrabold tracking-tight text-fg sm:text-3xl">
        A study plan that fits your hours
      </h2>
      <ul className="mb-6 space-y-2.5 text-sm leading-relaxed text-fg-3 sm:text-base">
        {POINTS.map((point) => (
          <li key={point} className="flex items-start gap-3">
            <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-brand" />
            <span>{point}</span>
          </li>
        ))}
      </ul>
      <Link to="/my-plan" className="amber-specular-button inline-flex min-h-[44px] items-center rounded-xl px-6 py-3 text-sm font-bold text-on-brand">
        Build my study plan
      </Link>
      <p className="mt-3 text-xs text-muted">Free to preview. Sign in only when you want to save it.</p>
    </div>
  </section>
);

export default PlanSection;
