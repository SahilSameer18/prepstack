import { Link } from "react-router-dom";

// The dashboard's answer to "what do I do first?" for someone with no plan. It sits above the tabs, never on the Today screen.
export default function FirstStepCard() {
  return (
    <section aria-label="Next step" data-testid="first-step" className="mb-6 flex flex-col gap-4 rounded-2xl border border-brand/25 bg-card p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
      <div className="min-w-0">
        <p className="text-xs font-ui font-semibold tracking-wider text-brand">NEXT STEP</p>
        <h2 className="font-display text-base font-bold text-fg sm:text-lg">Build your study plan</h2>
        <p className="mt-0.5 text-sm text-muted">Choose your goal, your weeks and your daily hours. You see the plan before you save it.</p>
      </div>
      <Link to="/my-plan" className="amber-specular-button inline-flex min-h-[44px] shrink-0 items-center justify-center rounded-xl px-5 py-2.5 text-sm font-bold text-on-brand">
        Build my plan
      </Link>
    </section>
  );
}
