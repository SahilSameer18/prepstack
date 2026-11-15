import { useState } from 'react';
import { Link } from 'react-router-dom';
import { usePlanBuilder } from '../hooks/usePlanBuilder';
import PlanBuilderForm from '../components/plan/PlanBuilderForm';
import PlanPreview, { PlanWeeks } from '../components/plan/PlanPreview';

// Replacement is an explicit choice; viewing a plan never replaces it.
function ExistingPlanNotice({ builder }) {
  if (!builder.activePlan || builder.finished) return null;

  return (
    <div className="space-y-2 text-sm leading-relaxed text-fg-3">
      <p>You already have a plan: <strong>{builder.activePlan.title}</strong>.</p>
      <button
        type="button"
        className="min-h-[44px] text-brand"
        onClick={builder.viewCurrentPlan}
      >
        View saved plan
      </button>
      <Link to="/my-plan/study" className="ml-4 inline-flex min-h-[44px] items-center text-brand">Open daily plan</Link>
      <label className="flex items-start gap-3">
        <input
          type="checkbox"
          className="mt-1 size-4 shrink-0 accent-brand"
          checked={builder.replacing}
          onChange={(event) => builder.setReplacing(event.target.checked)}
        />
        <span>Keep my current plan as history and replace it.</span>
      </label>
    </div>
  );
}

// Show the saved schedule and provide the entry to daily study actions.
function SavedPlanResult({ plan }) {
  if (!plan) return null;

  return (
    <section aria-label="Saved plan" className="mt-10 rounded-2xl border border-brand/30 bg-card p-5 sm:p-7">
      <h2 className="font-display text-2xl font-bold text-fg">Your saved plan</h2>
      <p role="status" className="mt-2 mb-5 text-sm text-muted">
        {plan.title} · {plan.startDate} to {plan.deadline}. All weeks are saved to your account.
      </p>
      <PlanWeeks items={plan.items} startDate={plan.startDate} />
      <Link to="/my-plan/study" className="mt-5 inline-flex min-h-[44px] items-center text-sm text-brand">
        Open daily plan
      </Link>
    </section>
  );
}

// Public entry point: choose settings, inspect the real preview, then sign in to save.
export default function MyPlan() {
  const builder = usePlanBuilder();
  const [shareMessage, setShareMessage] = useState('');

  // The copied URL contains settings only, not account progress or an automatic-save token.
  async function copySettingsLink() {
    const link = `${window.location.origin}/my-plan?${builder.settingsKey}`;
    try {
      await navigator.clipboard.writeText(link);
      setShareMessage('Settings link copied. It contains no account progress.');
    } catch {
      setShareMessage('Copy the address from your browser to share these settings.');
    }
  }

  return (
    <section className="mx-auto max-w-6xl py-6 sm:py-10">
      <header className="mb-10 max-w-2xl">
        <h1 className="font-display text-4xl font-bold tracking-tight text-fg sm:text-5xl">
          Your goal. Your hours.<br />
          <span className="text-brand">One workable plan.</span>
        </h1>
        <p className="mt-5 text-base leading-relaxed text-muted">
          Build a free study plan for placements, a role switch or big-tech interviews.
          See what fits before you sign in.
        </p>
        <p className="mt-3 text-sm text-muted">
          Built from PrepStack’s learning material. Time estimates are a guide, not a promise of results.
        </p>
      </header>

      {builder.optionsError && (
        <div role="alert" className="mb-6 rounded-xl border border-bad-solid/25 p-4 text-sm text-bad">
          {builder.optionsError}
          <button type="button" onClick={builder.retry} className="ml-3 min-h-[44px] underline">
            Retry loading choices
          </button>
        </div>
      )}

      <div className="grid items-start gap-8 lg:grid-cols-[1.1fr_1fr] lg:gap-12">
        <div className="rounded-2xl border border-ink/[0.1] bg-card p-5 sm:p-7">
          {builder.options ? (
            <PlanBuilderForm
              settings={builder.settings}
              options={builder.options}
              errors={builder.errors}
              onChange={builder.updateSettings}
              onGenerate={builder.generate}
              disabled={builder.saving}
            />
          ) : (
            <p role="status" className="text-sm text-muted">Loading the builder…</p>
          )}
          <div className="mt-6 flex flex-wrap gap-x-5 border-t border-ink/[0.1] pt-4">
            <button
              type="button"
              disabled={builder.saving}
              onClick={builder.resetSettings}
              className="min-h-[44px] text-sm text-muted hover:text-fg"
            >
              Reset settings
            </button>
            <button type="button" onClick={copySettingsLink} className="min-h-[44px] text-sm text-brand">
              Copy settings link
            </button>
          </div>
          <p role="status" className="text-xs text-muted">{shareMessage}</p>
        </div>

        <aside aria-label="Plan preview" className="space-y-6 lg:sticky lg:top-24">
          <div className="rounded-2xl border border-ink/[0.12] bg-card p-5 sm:p-7">
            <h2 className="mb-5 font-display text-xl font-bold text-fg">See what fits</h2>
            <PlanPreview builder={builder} />

            <div className="mt-6 space-y-3 border-t border-ink/[0.1] pt-5">
              <ExistingPlanNotice builder={builder} />
              {builder.accountError && (
                <div role="alert" className="text-sm text-bad">
                  {builder.accountError}
                  <button type="button" onClick={builder.retry} className="ml-2 min-h-[44px] underline">
                    Retry
                  </button>
                </div>
              )}
              {builder.saveError && <p role="alert" className="text-sm text-bad">{builder.saveError}</p>}
              <button
                type="submit"
                form="plan-builder"
                disabled={!builder.canGenerate}
                className="amber-specular-button min-h-[48px] w-full rounded-xl px-5 py-3 font-semibold text-on-brand disabled:cursor-not-allowed disabled:opacity-50"
              >
                {builder.saving ? 'Saving your plan…' : 'Generate my plan'}
              </button>
              <p className="text-center text-xs text-muted">
                Free. {builder.userId ? 'Your plan is saved to your account.' : 'Sign in to save. Your settings will carry through.'}
              </p>
            </div>
          </div>
        </aside>
      </div>

      <SavedPlanResult plan={builder.savedPlan} />
    </section>
  );
}
