import { Link } from "react-router-dom";
import PlanChecklist from "../analyzer/PlanChecklist";
import { updatePlanItem } from "../../api/services/planService";
import { dateInIndia } from "../../utils/planBuilder";
import {
  formatPlanMinutes,
  pullForwardItem,
  revisionRoundItems,
  studyChecklistDays,
  studyProgress,
  studyWeeks,
} from "../../utils/studyPlan";

const BUTTON =
  "min-h-[44px] rounded-xl border border-ink/[0.2] px-4 py-2 text-sm text-fg disabled:opacity-50";

// All planning controls live here so Today can remain a small, quiet task list.
export default function StudySchedule({
  plan,
  today,
  readOnly,
  model,
  onStart,
  onDialog,
}) {
  const progress = studyProgress(plan.items);
  const days = studyChecklistDays(plan.items.filter((item) => !item.skipped));
  const weeks = studyWeeks(days, plan.startDate);
  const pull = !readOnly && pullForwardItem(plan, today);
  const round = revisionRoundItems(plan.items);
  const skipped = plan.items.filter((item) => item.skipped);
  const titles = Object.fromEntries(
    plan.items.map((item) => [item.ref, item.topicTitle || item.title]),
  );

  // Opening the task first ensures DSA results and notes quizzes are never bypassed by a tick.
  function toggle(day, index, done) {
    const entry = days.find((row) => row.day === day).items[index];
    const item = plan.items.find((row) => row.id === entry.id);
    if (done) onStart(item);
    else model.runAction(() => updatePlanItem(item.id, { done: false }));
  }

  return (
    <section aria-label="Plan" className="space-y-6">
      <div className="space-y-2 text-sm text-fg-3">
        <h2 className="text-xl font-semibold text-fg">{plan.title}</h2>
        <p>
          {progress.done} of {progress.total} tasks complete ·{" "}
          {formatPlanMinutes(progress.minutes)} completed.
        </p>
        <p>
          {plan.startDate} to {plan.deadline}.
        </p>
        <p>{today?.onTrack?.text}</p>
        {!!plan.coverage?.importOverloads?.length && (
          <p className="text-warn">
            The last report import or rebuild showed {formatPlanMinutes(plan.coverage.importOverloads.reduce((sum, entry) => sum + entry.minutes, 0))} beyond daily budgets. Review your dates and hours before taking on more work.
          </p>
        )}
        {readOnly && (
          <p>
            This plan has finished. You can read it, but its tasks cannot be
            changed.
          </p>
        )}
        {!!plan.coverage?.leftOut?.length && (
          <p className="text-warn">
            {plan.coverage.leftOut.length} syllabus items did not fit. Change
            your hours or rebuild to review coverage.
          </p>
        )}
        {progress.complete && (
          <p role="status">
            Your scheduled material is complete. Due reviews continue until your
            deadline. You can choose a practice round below.
          </p>
        )}
      </div>
      <div className="flex flex-wrap gap-3">
        {!readOnly && (
          <>
            <button
              className={BUTTON}
              disabled={model.busy}
              onClick={() => onDialog("rebuild")}
            >
              Rebuild from today
            </button>
            <button className={BUTTON} onClick={() => onDialog("hours")}>
              Change hours
            </button>
            <button className={BUTTON} onClick={() => onDialog("lighter")}>
              Lighter days
            </button>
            <button className={BUTTON} onClick={() => onDialog("add")}>
              Add a task
            </button>
            {pull && (
              <button className={BUTTON} onClick={() => onDialog("pull", pull)}>
                Pull tomorrow’s first task
              </button>
            )}
          </>
        )}
        {progress.complete && round.length > 0 && (
          <button className={BUTTON} onClick={() => onDialog("revision")}>
            Preview revision round
          </button>
        )}
        <Link className={BUTTON} to="/my-plan">
          Build another plan
        </Link>
        <button className={BUTTON} onClick={() => onDialog("delete")}>
          Delete current plan
        </button>
      </div>
      {model.actionError && (
        <p role="alert" className="text-sm text-bad">
          {model.actionError}
        </p>
      )}
      {weeks.map((week) => (
        <details
          key={week.number}
          open={week.days.some((day) => day.day <= dateInIndia())}
          className="rounded-xl border border-ink/[0.1] p-3"
        >
          <summary className="min-h-[44px] cursor-pointer text-sm font-semibold text-fg">
            Week {week.number} · {week.days[0].label} to{" "}
            {week.days.at(-1).label}
          </summary>
          <PlanChecklist
            days={week.days}
            todayDay={dateInIndia()}
            refTitles={titles}
            readOnly={readOnly}
            onToggle={toggle}
            disabled={model.busy}
            renderActions={
              readOnly
                ? undefined
                : (entry) => (
                    <button
                      type="button"
                      disabled={model.busy}
                      aria-label={`Options: ${entry.task}`}
                      className="min-h-[44px] px-2 text-xs text-brand"
                      onClick={() =>
                        onDialog(
                          "task",
                          plan.items.find((item) => item.id === entry.id),
                        )
                      }
                    >
                      Options
                    </button>
                  )
            }
          />
        </details>
      ))}
      {!!skipped.length && (
        <details className="rounded-xl border border-ink/[0.1] p-4">
          <summary className="min-h-[44px] cursor-pointer text-sm text-fg">
            Skipped tasks ({skipped.length})
          </summary>
          <ul className="space-y-2">
            {skipped.map((item) => (
              <li
                key={item.id}
                className="flex items-center justify-between gap-3 text-sm text-muted"
              >
                <span>{item.title}</span>
                {!readOnly && (
                  <button
                    className="min-h-[44px] text-brand"
                    onClick={() => onDialog("task", item)}
                  >
                    Options
                  </button>
                )}
              </li>
            ))}
          </ul>
        </details>
      )}
    </section>
  );
}
