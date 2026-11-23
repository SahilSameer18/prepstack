import PlanChecklist from "../analyzer/PlanChecklist";
import { Link, useLocation } from 'react-router-dom';
import { PACES, paceMinutes, planDays } from "../../utils/planBuilder";
import PlanCoverage from "./PlanCoverage";
import { SkeletonPlanPreview } from "../ui/Skeletons";

// Format API estimates; no sample numbers are substituted while a request is loading.
function hours(minutes) {
  return `${Math.round(minutes / 6) / 10} h`;
}

function displayDate(day) {
  return new Date(`${day}T00:00:00Z`).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });
}

// Preview and saved plans reuse the same checklist. Ticking belongs to the Phase 6 daily screens.
export function PlanWeeks({ items, startDate }) {
  const weeks = new Map();
  const start = new Date(`${startDate}T00:00:00Z`);
  const mondayOffset = (start.getUTCDay() + 6) % 7;
  for (const item of items) {
    const daysFromStart =
      (new Date(`${item.day}T00:00:00Z`) - start) / 86400000;
    const week = Math.floor((daysFromStart + mondayOffset) / 7) + 1;
    if (!weeks.has(week)) weeks.set(week, []);
    weeks.get(week).push(item);
  }
  const refTitles = Object.fromEntries(
    items.map((item) => [item.ref, item.topicTitle || item.title]),
  );
  return (
    <div className="space-y-3">
      {[...weeks]
        .sort(([a], [b]) => a - b)
        .map(([week, weekItems], index) => (
          <details
            key={week}
            open={index === 0}
            className="rounded-xl border border-ink/[0.1] bg-ink/[0.02] p-4 transition-colors hover:border-ink/[0.2]"
          >
            <summary className="min-h-[44px] cursor-pointer text-sm font-semibold text-fg">
              Week {week}{" "}
              <span className="ml-2 font-normal text-muted">
                {hours(
                  weekItems.reduce(
                    (total, item) => total + item.plannedMinutes,
                    0,
                  ),
                )}{" "}
                estimated
              </span>
            </summary>
            <PlanChecklist
              readOnly
              days={planDays(weekItems)}
              refTitles={refTitles}
            />
          </details>
        ))}
    </div>
  );
}

// Present only a response for the current settings. The hook hides obsolete replies.
export default function PlanPreview({ builder }) {
  const location = useLocation();
  const { preview, previewReady, valid, retry, options, errors } = builder;
  if (!options)
    return <p className="text-sm text-muted">Loading plan choices…</p>;
  if (!valid)
    return (
      <p role="status" className="text-sm leading-relaxed text-muted">
        Check the highlighted fields to see your preview.{" "}
        {Object.values(errors)[0]}
      </p>
    );
  if (preview?.error) {
    return (
      <div role="alert">
        <p className="text-sm text-bad">{preview.error}</p>
        <button
          type="button"
          onClick={retry}
          className="mt-3 min-h-[44px] cursor-pointer text-sm font-semibold text-brand transition-colors hover:text-brand-hover"
        >
          Retry preview
        </button>
      </div>
    );
  }
  if (!previewReady)
    return (
      <div role="status">
        <p className="mb-5 text-sm text-muted">Updating your preview…</p>
        <SkeletonPlanPreview />
      </div>
    );

  const { coverage, week1, finishDate, deadline, notices, pace, saveEligibility, usesSavedProgress } = preview.data;
  return (
    <div className="space-y-6">
      {saveEligibility?.allowed === false && <div role="alert" className="space-y-2 rounded-xl border border-bad-solid/25 bg-bad-solid/10 p-3 text-sm text-bad">
        <p>{saveEligibility.reason}</p>
        {!builder.userId && <p>
          Already solved some of this material?{' '}
          <Link className="underline" to={`/login?returnTo=${encodeURIComponent(location.pathname + location.search)}`}>
            Sign in to check your saved progress
          </Link>.
        </p>}
      </div>}
      <div aria-live="polite" className="border-b border-ink/[0.1] pb-5">
        <p className="font-display text-4xl font-black tracking-tight text-fg">
          {hours(coverage.plannedMinutes)}{" "}
          <span className="text-base font-normal text-muted">
            of {hours(coverage.syllabusMinutes)}
          </span>
        </p>
        <p className="mt-2 text-sm text-muted">
          of your syllabus fits before {displayDate(deadline)}.
        </p>
        <p className="mt-2 text-sm text-muted">
          Estimated finish:{" "}
          {finishDate ? displayDate(finishDate) : "No tasks scheduled"}.
        </p>
      </div>
      <p className="text-sm leading-relaxed text-fg-3">
        Planned for up to 85% of your available hours: 70% for new work and up
        to 15% for reviews. The rest stays free.
      </p>
      <p className="text-sm leading-relaxed text-fg-3">
        Planned at a {(PACES[pace] || PACES.standard).label.toLowerCase()} pace:
        a Medium problem takes about {paceMinutes(pace)} min. You can change
        this later.
      </p>
      {coverage.leftOutCount > 0 && (
        <div className="space-y-3 rounded-xl border border-warn-solid/25 bg-warn-solid/10 p-3">
          <p className="text-sm leading-relaxed text-warn">
            {coverage.leftOutCount} syllabus items (
            {hours(coverage.leftOutMinutes)}) could not fit. Time is shared
            across topics and subjects when it can be. Add time or choose a
            smaller syllabus to cover more; the lists below name what is left out.
          </p>
          {coverage.finishAll && (
            <p className="text-sm leading-relaxed text-fg-3" data-testid="finish-all">
              {coverage.finishAll.tooLong
                ? "At these hours, the whole syllabus would take more than a year."
                : `At these hours, the whole syllabus would be done by ${displayDate(coverage.finishAll.date)} (about ${coverage.finishAll.weeks} weeks), mock blocks included.`}
            </p>
          )}
          <PlanCoverage byGroup={coverage.byGroup} />
        </div>
      )}
      {notices.includes("early-finish") && (
        <p className="text-sm text-fg-3">
          Your material fits before the deadline. Extra work is not added
          automatically.
        </p>
      )}
      {!saveEligibility && notices.includes("nothing-fits") && (
        <p role="alert" className="rounded-xl border border-bad-solid/25 bg-bad-solid/10 p-3 text-sm leading-relaxed text-bad">
          No task fits these days and hours. Add study time or weeks to see a
          plan.
        </p>
      )}
      {!saveEligibility && notices.includes("nothing-to-plan") && (
        <p className="text-sm text-fg-3">
          Nothing remains to schedule with these choices. Include more topics to
          create a plan.
        </p>
      )}
      <div>
        <h3 className="mb-3 font-display text-lg font-bold tracking-tight text-fg">Your first week</h3>
        {week1.items.length ? (
          <PlanChecklist readOnly days={planDays(week1.items)} />
        ) : (
          <p className="text-sm text-muted">
            No tasks fit with these hours. Adjust your hours or start date.
          </p>
        )}
      </div>
      <p className="border-t border-ink/[0.1] pt-4 text-sm leading-relaxed text-muted">
        {usesSavedProgress
          ? 'This preview includes your saved sheet progress and shows the first week. Generate to save all weeks.'
          : 'This public preview shows the first week. Sign in to include your saved sheet progress, then generate to save all weeks.'}
      </p>
    </div>
  );
}
