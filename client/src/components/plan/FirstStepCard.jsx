import { Link } from "react-router-dom";

// The first-plan action is shared by DSA onboarding and the empty plan workspace.
export default function FirstStepCard() {
  return (
    <section aria-label="Next step" data-testid="first-step" className="mb-6 flex flex-col gap-4 rounded-2xl border border-brand/25 bg-card p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
      <div className="min-w-0">
        <h2 className="font-display text-xl font-extrabold tracking-tight text-fg sm:text-2xl">Build your study plan</h2>
        <p className="mt-1 text-sm text-muted">Pick your goal and available hours. Preview what fits before your deadline.</p>
      </div>
      <Link to="/my-plan" className="amber-specular-button inline-flex min-h-[44px] shrink-0 items-center justify-center rounded-xl px-5 py-2.5 text-sm font-bold text-on-brand">
        Build my plan
      </Link>
    </section>
  );
}
