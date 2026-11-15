import PlanChecklist from "../analyzer/PlanChecklist";
import { planDays } from "../../utils/planBuilder";

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
            className="rounded-xl border border-ink/[0.1] p-4"
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
          className="mt-3 min-h-[44px] text-sm text-brand"
        >
          Retry preview
        </button>
      </div>
    );
  }
  if (!previewReady)
    return (
      <p role="status" className="animate-pulse text-sm text-muted">
        Updating your preview…
      </p>
    );

  const { coverage, week1, finishDate, deadline, notices } = preview.data;
  return (
    <div className="space-y-6">
      <div aria-live="polite" className="border-b border-ink/[0.1] pb-5">
        <p className="font-display text-3xl font-bold text-fg">
          {hours(coverage.plannedMinutes)}{" "}
          <span className="text-base font-normal text-muted">
            of {hours(coverage.syllabusMinutes)}
          </span>
        </p>
        <p className="mt-2 text-sm text-muted">
          of your syllabus fits before {displayDate(deadline)}.
        </p>
        <p className="mt-2 text-xs text-muted">
          Estimated finish:{" "}
          {finishDate ? displayDate(finishDate) : "No tasks scheduled"}.
        </p>
      </div>
      <p className="text-sm leading-relaxed text-fg-3">
        Planned for up to 85% of your available hours: 70% for new work and up
        to 15% for reviews. The rest stays free.
      </p>
      {coverage.leftOutCount > 0 && (
        <p className="rounded-xl border border-warn-solid/25 bg-warn-solid/10 p-3 text-sm leading-relaxed text-warn">
          {coverage.leftOutCount} syllabus items (
          {hours(coverage.leftOutMinutes)}) could not fit. Core topics come
          first; add time or choose a smaller syllabus.
        </p>
      )}
      {notices.includes("early-finish") && (
        <p className="text-sm text-fg-3">
          Your material fits before the deadline. Extra work is not added
          automatically.
        </p>
      )}
      {notices.includes("nothing-to-plan") && (
        <p className="text-sm text-fg-3">
          Nothing remains to schedule with these choices. Include more topics to
          create a plan.
        </p>
      )}
      <div>
        <h3 className="mb-3 text-sm font-semibold text-fg">Your first week</h3>
        {week1.items.length ? (
          <PlanChecklist readOnly days={planDays(week1.items)} />
        ) : (
          <p className="text-sm text-muted">
            No tasks fit with these hours. Adjust your hours or start date.
          </p>
        )}
      </div>
      <p className="border-t border-ink/[0.1] pt-4 text-xs leading-relaxed text-muted">
        This public preview shows week 1 only. Sign in and generate to save all
        weeks. Saved sheet progress is taken into account when your plan is
        created.
      </p>
    </div>
  );
}
