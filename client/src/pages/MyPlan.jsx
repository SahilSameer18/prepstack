import { useState } from 'react';
import { Link } from 'react-router-dom';
import { usePlanBuilder } from '../hooks/usePlanBuilder';
import PlanBuilderForm from '../components/plan/PlanBuilderForm';
import PlanPreview, { PlanWeeks } from '../components/plan/PlanPreview';
import PageBackdrop from '../components/ui/PageBackdrop';
import Reveal from '../components/ui/Reveal';

// Replacement is an explicit choice; viewing a plan never replaces it.
function ExistingPlanNotice({ builder }) {
  if (!builder.activePlan || builder.finished) return null;

  return (
    <div className="space-y-3 rounded-xl border border-ink/[0.1] bg-ink/[0.03] p-4 text-sm leading-relaxed text-fg-3">
      <p>You already have a plan: <strong className="text-fg">{builder.activePlan.title}</strong>.</p>
      <div className="flex flex-wrap items-center gap-x-5">
        <button
          type="button"
          className="min-h-[44px] cursor-pointer font-semibold text-brand transition-colors hover:text-brand-hover"
          onClick={builder.viewCurrentPlan}
        >
          View saved plan
        </button>
        <Link to="/my-plan/study" className="inline-flex min-h-[44px] items-center font-semibold text-brand transition-colors hover:text-brand-hover">Open daily plan</Link>
      </div>
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
    <section aria-label="Saved plan" className="surface-card fade-in mt-10 border-brand/30 p-5 sm:p-7">
      <h2 className="font-display text-3xl font-bold tracking-tight text-fg">Your saved plan</h2>
      <p role="status" className="mb-5 mt-2 text-sm text-muted">
        {plan.title} · {plan.startDate} to {plan.deadline}. All weeks are saved to your account.
      </p>
      <PlanWeeks items={plan.items} startDate={plan.startDate} />
      <Link to="/my-plan/study" className="mt-5 inline-flex min-h-[44px] items-center text-sm font-semibold text-brand transition-colors hover:text-brand-hover">
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
    <div className="relative">
      <PageBackdrop />
      <section className="relative z-10 mx-auto max-w-6xl pb-12 pt-2">
        <Reveal as="header" onLoad className="mb-10 max-w-2xl">
          <h1 className="font-display text-4xl font-black leading-[1.04] tracking-[-0.04em] text-fg sm:text-5xl lg:text-6xl">
            Your goal. Your hours.<br />
            One workable plan.
          </h1>
          <p className="mt-5 text-base leading-relaxed text-muted">
            Build a free study plan for placements, a role switch or big-tech interviews.
            See what fits before you sign in.
          </p>
          <p className="mt-3 text-sm text-muted">
            Built from PrepStack’s learning material. Time estimates are a guide, not a promise of results.
          </p>
        </Reveal>

        {builder.optionsError && (
          <div role="alert" className="mb-6 rounded-xl border border-bad-solid/25 bg-bad-solid/10 p-4 text-sm text-bad">
            {builder.optionsError}
            <button type="button" onClick={builder.retry} className="ml-3 min-h-[44px] underline">
              Retry loading choices
            </button>
          </div>
        )}

        <div className="grid items-start gap-8 lg:grid-cols-[1.1fr_1fr] lg:gap-12">
          <Reveal onLoad delay={0.08} className="surface-card p-5 sm:p-7">
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
                className="min-h-[44px] cursor-pointer text-sm text-muted transition-colors hover:text-fg"
              >
                Reset settings
              </button>
              <button type="button" onClick={copySettingsLink} className="min-h-[44px] cursor-pointer text-sm font-semibold text-brand transition-colors hover:text-brand-hover">
                Copy settings link
              </button>
            </div>
            <p role="status" className="text-sm text-muted">{shareMessage}</p>
          </Reveal>

          <Reveal as="aside" onLoad delay={0.16} className="space-y-6 lg:sticky lg:top-24" aria-label="Plan preview">
            <div className="surface-card p-5 sm:p-7">
              <h2 className="mb-5 font-display text-2xl font-bold tracking-tight text-fg">See what fits</h2>
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
                  className="amber-specular-button min-h-[52px] w-full cursor-pointer rounded-xl px-5 py-3 font-bold text-on-brand disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {builder.saving ? 'Saving your plan…' : 'Generate my plan'}
                </button>
                <p className="text-center text-sm text-muted">
                  Free. {builder.userId ? 'Your plan is saved to your account.' : 'Sign in to save. Your settings will carry through.'}
                </p>
              </div>
            </div>
          </Reveal>
        </div>

        <SavedPlanResult plan={builder.savedPlan} />
      </section>
    </div>
  );
}
