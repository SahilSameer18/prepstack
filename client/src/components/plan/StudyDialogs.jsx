import { useState } from "react";
import PlanDialog from "../ui/PlanDialog";
import {
  addPlanItem,
  applyPlanChange,
  previewPlanChange,
  removePlanItem,
  skipPlanItem,
  starPlanItem,
  updatePlanItem,
} from "../../api/services/planService";
import { PACES, dateInIndia, paceMinutes } from "../../utils/planBuilder";
import PlanCoverage from "./PlanCoverage";
import { isPlanItemDone } from "../../utils/studyPlan";
import ProblemSubstitute from './ProblemSubstitute';

const INPUT =
  "min-h-[44px] w-full rounded-xl border border-ink/[0.2] bg-card-hover px-3 py-2 text-fg";
const BUTTON =
  "min-h-[44px] rounded-xl border border-ink/[0.2] px-4 py-2 text-sm text-fg disabled:opacity-50";

// A preview freezes its payload. Editing requires going back and requesting a new preview.
export function StudyChangeDialog({ type, plan, model, onClose }) {
  const currentDay = model.data.calendar?.today || dateInIndia();
  const [weekdayHours, setWeekdayHours] = useState(plan.hoursByWeekday[0]);
  const [weekendHours, setWeekendHours] = useState(plan.hoursByWeekday[5]);
  const [from, setFrom] = useState(
    plan.startDate > currentDay ? plan.startDate : currentDay,
  );
  const [to, setTo] = useState(
    plan.startDate > currentDay ? plan.startDate : currentDay,
  );
  const [hours, setHours] = useState(1);
  const [deadline, setDeadline] = useState(plan.deadline);
  const [pace, setPace] = useState(plan.pace || "standard");
  const [preview, setPreview] = useState(null);
  const [previewing, setPreviewing] = useState(false);
  const [error, setError] = useState("");
  const title =
    type === "hours"
      ? "Change study hours"
      : type === "lighter"
        ? "Plan lighter days"
        : type === "pace"
          ? "Change pace"
          : "Rebuild from today";

  async function requestPreview(event, clearLighterDays = false) {
    event.preventDefault();
    setError("");
    setPreviewing(true);
    const body = { type };
    if (type === 'rebuild') body.deadline = deadline;
    if (type === "hours") Object.assign(body, { weekdayHours, weekendHours });
    if (type === "pace") body.pace = pace;
    if (type === "lighter")
      body.lighterDays = clearLighterDays
        ? []
        : [...plan.lighterDays, { from, to, hours }];
    try {
      const summary = await previewPlanChange(body);
      setPreview({ body, summary });
    } catch (failure) {
      setError(failure.response?.data?.message || failure.message);
    } finally {
      setPreviewing(false);
    }
  }

  async function apply() {
    const body = { ...preview.body, checksum: preview.summary.diff.checksum };
    const result = await model.runAction(() => applyPlanChange(body));
    if (result) onClose();
  }

  return (
    <PlanDialog title={title} onClose={onClose} busy={model.busy || previewing}>
      {preview ? (
        <div className="space-y-4 text-sm text-fg-3">
          <p>Finish date {preview.summary.diff.finishText}.</p>
          {preview.body.deadline && <p>Plan deadline: {preview.body.deadline}.</p>}
          <p>
            {preview.summary.diff.movedItems} items move.{" "}
            {preview.summary.diff.doneProtected} completed items stay protected.
          </p>
          <p>{preview.summary.leftOutCount} syllabus items will not fit.</p>
          {preview.summary.leftOutCount > 0 && (
            <PlanCoverage byGroup={preview.summary.byGroup} />
          )}
          <button
            type="button"
            disabled={model.busy}
            onClick={() => setPreview(null)}
            className={BUTTON}
          >
            Back to settings
          </button>
          <button
            type="button"
            disabled={model.busy}
            onClick={apply}
            className={BUTTON}
          >
            {model.busy ? "Applying…" : "Confirm change"}
          </button>
        </div>
      ) : (
        <form onSubmit={requestPreview} className="space-y-4">
          <p className="text-sm text-muted">
            Nothing changes until you review and confirm the preview. Completed
            and locked work stays protected.
          </p>
          {type === 'rebuild' && (
            <label className="block space-y-2 text-sm">
              Deadline (keep it or choose a later date)
              <input className={INPUT} type="date" min={plan.deadline} value={deadline} required onChange={(event) => setDeadline(event.target.value)} />
              <span className="block text-sm text-muted">A later date gives more room; the preview shows what fits. Completed tasks remain saved.</span>
            </label>
          )}
          {type === "pace" && (
            <label className="block space-y-2 text-sm">
              How fast do you solve problems?
              <select
                className={INPUT}
                value={pace}
                onChange={(event) => setPace(event.target.value)}
              >
                {Object.entries(PACES).map(([value, entry]) => (
                  <option key={value} value={value}>
                    {entry.label}: a Medium problem takes about {paceMinutes(value)} min
                  </option>
                ))}
              </select>
              <span className="block text-sm text-muted">
                A slower pace plans fewer problems in the same time; a faster
                pace plans more. Tasks you already finished do not change.
              </span>
            </label>
          )}
          {type === "hours" && (
            <>
              <label className="block space-y-2 text-sm">
                Hours per weekday
                <input
                  aria-label="New weekday hours"
                  className={INPUT}
                  type="number"
                  min="0"
                  max="12"
                  step="any"
                  required
                  value={weekdayHours}
                  onChange={(event) =>
                    setWeekdayHours(event.target.valueAsNumber)
                  }
                />
              </label>
              <label className="block space-y-2 text-sm">
                Hours per weekend day
                <input
                  aria-label="New weekend hours"
                  className={INPUT}
                  type="number"
                  min="0"
                  max="12"
                  step="any"
                  required
                  value={weekendHours}
                  onChange={(event) =>
                    setWeekendHours(event.target.valueAsNumber)
                  }
                />
              </label>
            </>
          )}
          {type === "lighter" && (
            <>
              <label className="block space-y-2 text-sm">
                From
                <input
                  className={INPUT}
                  type="date"
                  min={plan.startDate}
                  max={plan.deadline}
                  required
                  value={from}
                  onChange={(event) => setFrom(event.target.value)}
                />
              </label>
              <label className="block space-y-2 text-sm">
                To
                <input
                  className={INPUT}
                  type="date"
                  min={from}
                  max={plan.deadline}
                  required
                  value={to}
                  onChange={(event) => setTo(event.target.value)}
                />
              </label>
              <label className="block space-y-2 text-sm">
                Hours per day
                <input
                  className={INPUT}
                  type="number"
                  min="0"
                  max="12"
                  step="any"
                  required
                  value={hours}
                  onChange={(event) => setHours(event.target.valueAsNumber)}
                />
              </label>
              <p className="text-sm text-muted">
                A stretch can last up to 14 days and cannot overlap another
                stretch.
              </p>
              {!!plan.lighterDays.length && (
                <div className="space-y-2 text-sm text-muted">
                  {plan.lighterDays.map((range) => (
                    <p key={range.from}>
                      {range.from} to {range.to}: {range.hours} hours per day.
                    </p>
                  ))}
                  <button
                    type="button"
                    className={BUTTON}
                    disabled={previewing}
                    onClick={(event) => requestPreview(event, true)}
                  >
                    Preview clearing lighter days
                  </button>
                </div>
              )}
            </>
          )}
          <button type="submit" disabled={previewing} className={BUTTON}>
            {previewing ? "Calculating…" : "Preview change"}
          </button>
        </form>
      )}
      {(error || model.actionError) && (
        <p role="alert" className="mt-4 text-sm text-bad">
          {error || model.actionError}
        </p>
      )}
    </PlanDialog>
  );
}

// One task editor keeps action buttons out of every checklist row.
export function StudyTaskDialog({ item, plan, model, onClose }) {
  const [title, setTitle] = useState("");
  const [day, setDay] = useState(item?.day || model.data.calendar?.today || dateInIndia());
  const [minutes, setMinutes] = useState(item?.plannedMinutes || 30);
  const [notice, setNotice] = useState("");
  const [confirmRemove, setConfirmRemove] = useState(false);
  const editable = !item || (!isPlanItemDone(item) && !item.skipped);

  async function save(event) {
    event.preventDefault();
    const changes = {};
    if (item && day !== item.day) changes.day = day;
    if (item && minutes !== item.plannedMinutes)
      changes.plannedMinutes = minutes;
    if (item && !Object.keys(changes).length) {
      onClose();
      return;
    }
    const result = await model.runAction(() =>
      item
        ? updatePlanItem(item.id, changes)
        : addPlanItem({ title, day, plannedMinutes: minutes }),
    );
    if (result) onClose();
  }

  async function toggleSkip() {
    const result = await model.runAction(() =>
      skipPlanItem(item.id, !item.skipped),
    );
    if (!result) return;
    setNotice(
      result.warning
        ? "Skipped. Later topics may need this: " +
            result.warning.laterTopics.join(", ")
        : item.skipped
          ? "Task restored."
          : "Task skipped.",
    );
  }

  async function remove() {
    if (!confirmRemove) {
      setConfirmRemove(true);
      return;
    }
    const result = await model.runAction(() => removePlanItem(item.id));
    if (result) onClose();
  }

  return (
    <PlanDialog
      title={item ? "Task options" : "Add a task"}
      onClose={onClose}
      busy={model.busy}
    >
      <div className="space-y-5">
        {item && <p className="text-sm text-fg-3">{item.title}</p>}
        {editable && (
          <form onSubmit={save} className="space-y-4">
            {!item && (
              <label className="block space-y-2 text-sm">
                Task title
                <input
                  className={INPUT}
                  required
                  maxLength="200"
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                />
              </label>
            )}
            <label className="block space-y-2 text-sm">
              Scheduled day
              <input
                className={INPUT}
                type="date"
                min={plan.startDate}
                max={plan.deadline}
                required
                value={day}
                onChange={(event) => setDay(event.target.value)}
              />
            </label>
            <label className="block space-y-2 text-sm">
              Estimated minutes
              <input
                className={INPUT}
                type="number"
                min="1"
                max="360"
                required
                value={minutes}
                onChange={(event) => setMinutes(event.target.valueAsNumber)}
              />
            </label>
            {item && (
              <p className="text-sm text-muted">
                Move up to three days from {item.plannedDay || item.day}. Moved
                tasks stay locked during rebuilds.
              </p>
            )}
            <button type="submit" disabled={model.busy} className={BUTTON}>
              {model.busy ? "Saving…" : "Save task"}
            </button>
          </form>
        )}
        {item && (
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              disabled={model.busy}
              onClick={() => model.runAction(() => starPlanItem(item.id))}
              className={BUTTON}
            >
              {item.starred ? "Remove star" : "Star for revision"}
            </button>
            <button
              type="button"
              disabled={model.busy || isPlanItemDone(item)}
              onClick={toggleSkip}
              className={BUTTON}
            >
              {item.skipped ? "Restore task" : "Skip task"}
            </button>
            {item.source !== "planner" && (
              <button
                type="button"
                disabled={model.busy}
                onClick={remove}
                className={BUTTON}
              >
                {confirmRemove ? "Confirm remove" : "Remove task"}
              </button>
            )}
          </div>
        )}
        {item?.type === 'dsa' && editable && <ProblemSubstitute item={item} model={model} onClose={onClose} />}
        {notice && (
          <p role="status" className="text-sm text-warn">
            {notice}
          </p>
        )}
        {model.actionError && (
          <p role="alert" className="text-sm text-bad">
            {model.actionError}
          </p>
        )}
      </div>
    </PlanDialog>
  );
}

// Destructive actions and optional practice both require an explicit, reviewable confirmation.
export function StudyConfirmDialog({
  title,
  text,
  label,
  model,
  onConfirm,
  onClose,
}) {
  return (
    <PlanDialog title={title} onClose={onClose} busy={model.busy}>
      <p className="mb-5 text-sm leading-relaxed text-fg-3">{text}</p>
      <button
        type="button"
        disabled={model.busy}
        onClick={onConfirm}
        className={BUTTON}
      >
        {model.busy ? "Working…" : label}
      </button>
      {model.actionError && (
        <p role="alert" className="mt-4 text-sm text-bad">
          {model.actionError}
        </p>
      )}
    </PlanDialog>
  );
}
