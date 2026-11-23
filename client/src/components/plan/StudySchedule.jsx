import StudyLearning from './StudyLearning';
import { Link } from "react-router-dom";
import { CaretDown, DotsThree } from "@phosphor-icons/react";
import PlanChecklist from "../analyzer/PlanChecklist";
import ProgressMarks from "../ui/ProgressMarks";
import { updatePlanItem } from "../../api/services/planService";
import { PACES, dateInIndia, paceMinutes } from "../../utils/planBuilder";
import PlanCoverage from "./PlanCoverage";
import {
  formatPlanDate,
  formatPlanMinutes,
  pullForwardItem,
  revisionRoundItems,
  studyChecklistDays,
  studyProgress,
  studyWeeks,
  weekSummary,
} from "../../utils/studyPlan";

const BUTTON =
  "inline-flex min-h-[44px] items-center rounded-xl border border-ink/[0.2] bg-card px-4 py-2 text-sm font-medium text-fg transition-colors hover:border-ink/[0.4] disabled:opacity-50";
const DANGER = "inline-flex min-h-[44px] items-center rounded-xl px-3 py-2 text-sm font-medium text-bad transition-colors hover:bg-bad-solid/10 disabled:opacity-50";

// A labelled group of actions: every action stays visible, grouped by what it is for.
const Group = ({ label, children }) => (
  <div>
    <p className="mb-2.5 font-code text-xs uppercase tracking-[0.14em] text-muted">{label}</p>
    <div className="flex flex-wrap gap-2">{children}</div>
  </div>
);

// All planning controls live here so Today can remain a small, quiet task list.
export default function StudySchedule({
  plan,
  today,
  readOnly,
  model,
  onStart,
  onDialog,
  recoveryControls,
}) {
  const progress = studyProgress(plan.items);
  const days = studyChecklistDays(plan.items.filter((item) => !item.skipped));
  const weeks = studyWeeks(days, plan.startDate);
  const currentDay = model.data.calendar?.today || dateInIndia();
  // Confirmed effort feedback changes the estimate as well as the chosen pace.
  const effortFactor = plan.estimateFactors?.dsa || 1;
  const mediumMinutes = Math.round(paceMinutes(plan.pace) * effortFactor);
  const overdue = plan.items.filter((item) => !item.doneAt && !item.solvedOnSheet && !item.skipped && item.day < currentDay);
  const pull = !readOnly && pullForwardItem(plan, today, currentDay);
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
    <section aria-label="Plan" className="space-y-8">
      <div className="space-y-3 text-sm text-fg-3">
        <h2 className="font-display text-3xl font-bold tracking-tight text-fg">{plan.title}</h2>
        <p className="font-code text-sm leading-relaxed text-muted">
          {progress.done} of {progress.total} tasks complete · {formatPlanMinutes(progress.minutes)} completed ·{" "}
          {formatPlanDate(plan.startDate, true)} to {formatPlanDate(plan.deadline, true)}
          {!plan.fromReport && <>
            {' '}· {(PACES[plan.pace] || PACES.standard).label} pace (a Medium problem takes about {mediumMinutes} min)
            {effortFactor !== 1 && ' after your effort adjustment'}
          </>}
        </p>
        {today?.onTrack?.text && <p className="font-medium text-fg">{today.onTrack.text}</p>}
        {!readOnly && overdue.length > 0 && (
          <p>
            {overdue.length} overdue {overdue.length === 1 ? 'task' : 'tasks'} remain in the schedule.
            Open a task’s options to move it or rebuild to fit the remaining work.
          </p>
        )}
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
            your hours or pace, or rebuild with a later deadline, to cover more.
          </p>
        )}
        {!!plan.coverage?.leftOut?.length && !!plan.coverage?.byGroup?.length && (
          <details className="border-y border-ink/[0.1]">
            <summary className="flex min-h-[44px] cursor-pointer items-center text-sm font-semibold text-fg">
              See what is not in your plan
            </summary>
            <PlanCoverage byGroup={plan.coverage.byGroup} className="pt-2" />
          </details>
        )}
        {progress.complete && (
          <p role="status">
            Your scheduled material is complete. Due reviews continue until your
            deadline. You can choose a practice round below.
          </p>
        )}
      </div>
      {model.actionError && (
        <p role="alert" className="text-sm text-bad">
          {model.actionError}
        </p>
      )}
      <div className="border-t border-ink">
      {weeks.map((week) => (
        <details
          key={week.number}
          open={week.days.some((day) => day.day <= currentDay)}
          className="group border-b border-ink/[0.1]"
        >
          <summary className="flex min-h-[44px] cursor-pointer list-none items-center gap-4 py-5 [&::-webkit-details-marker]:hidden">
            {(() => {
              const weekItems = week.days.flatMap((day) => day.items);
              const weekDone = weekItems.filter((item) => item.done).length;
              return weekItems.length > 0 ? (
                <span className="order-2 ml-auto hidden w-40 shrink-0 sm:block">
                  <ProgressMarks value={weekDone} total={weekItems.length} max={14} label={`Week ${week.number}: ${weekDone} of ${weekItems.length} tasks done`} />
                </span>
              ) : null;
            })()}
            <span className="order-1 min-w-0">
              <span className="block font-display text-lg font-bold text-fg">
                Week {week.number} <span className="ml-2 text-sm font-normal text-fg-3">{week.days[0].label} to {week.days.at(-1).label}</span>
              </span>
              <span className="mt-1 block text-sm font-normal text-muted">
                {weekSummary(week)}
              </span>
            </span>
            <CaretDown aria-hidden="true" className="order-3 shrink-0 max-sm:ml-auto text-base text-muted transition-transform duration-300 group-open:rotate-180 group-open:text-brand" />
          </summary>
          <PlanChecklist
            days={week.days}
            todayDay={currentDay}
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
                      className="flex h-11 w-11 cursor-pointer items-center justify-center rounded-lg text-xl text-muted transition-colors hover:bg-ink/[0.05] hover:text-fg"
                      onClick={() =>
                        onDialog(
                          "task",
                          plan.items.find((item) => item.id === entry.id),
                        )
                      }
                    >
                      <DotsThree weight="bold" aria-hidden="true" />
                    </button>
                  )
            }
          />
        </details>
      ))}
      </div>
      {!!skipped.length && (
        <details className="border-y border-ink/[0.1]">
          <summary className="flex min-h-[44px] cursor-pointer items-center text-sm font-medium text-fg">
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
                    className="min-h-[44px] cursor-pointer font-semibold text-brand transition-colors hover:text-brand-hover"
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
      {/* Show the work before its maintenance controls. Every action stays available below. */}
      <section aria-label="Plan settings" className="space-y-6">
        <h3 className="font-display text-xl font-bold text-fg">Adjust your plan</h3>
        {recoveryControls}
        {!readOnly && <StudyLearning plan={plan} model={model} onStart={onStart} />}
        <div className="grid gap-x-8 gap-y-6 sm:grid-cols-2 lg:grid-cols-4">
          {!readOnly && (
            <Group label="Adjust">
              <button className={BUTTON} onClick={() => onDialog("hours")}>
                Change hours
              </button>
              {!plan.fromReport && (
                <button className={BUTTON} onClick={() => onDialog("pace")}>
                  Change pace
                </button>
              )}
              <button className={BUTTON} onClick={() => onDialog("lighter")}>
                Lighter days
              </button>
            </Group>
          )}
          {!readOnly && (
            <Group label="Tasks">
              <button className={BUTTON} onClick={() => onDialog("add")}>
                Add a task
              </button>
              {pull && (
                <button className={BUTTON} onClick={() => onDialog("pull", pull)}>
                  Pull tomorrow’s first task
                </button>
              )}
            </Group>
          )}
          {(
            <Group label="Recovery">
              {readOnly && <button className={BUTTON} disabled={model.busy} onClick={() => onDialog('rebuild')}>Extend deadline</button>}
              {!readOnly && (
                <button
                  className={BUTTON}
                  disabled={model.busy}
                  onClick={() => onDialog("rebuild")}
                >
                  Rebuild from today
                </button>
              )}
              {progress.complete && round.length > 0 && (
                <button className={BUTTON} onClick={() => onDialog("revision")}>
                  Preview revision round
                </button>
              )}
            </Group>
          )}
          <Group label="Plan">
            <Link className={BUTTON} to="/my-plan">
              Build another plan
            </Link>
            <button className={DANGER} onClick={() => onDialog("delete")}>
              Delete current plan
            </button>
          </Group>
        </div>
      </section>
    </section>
  );
}
