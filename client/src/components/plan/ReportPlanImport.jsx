import { useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  applyReportPlan,
  previewReportPlan,
} from "../../api/services/planService";
import { extractError } from "../../utils/extractError";
import { formatPlanMinutes } from "../../utils/studyPlan";
import { PlanWeeks } from "./PlanPreview";

const BUTTON =
  "min-h-[44px] rounded-xl border border-ink/[0.2] px-4 py-2 text-sm text-fg disabled:opacity-50";
const WEEKDAYS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

// Inline, explicit consent: opening or previewing a report never changes a plan.
export default function ReportPlanImport({ reportId }) {
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState("merge");
  const [preview, setPreview] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);
  const writing = useRef(false);

  function changeMode(value) {
    setMode(value);
    setPreview(null);
    setError("");
  }

  async function requestPreview() {
    if (writing.current) return;
    writing.current = true;
    setBusy(true);
    setError("");
    try {
      const result = await previewReportPlan(reportId, mode);
      setPreview(result);
    } catch (failure) {
      setError(extractError(failure));
    } finally {
      writing.current = false;
      setBusy(false);
    }
  }

  async function apply() {
    if (writing.current) return;
    writing.current = true;
    setBusy(true);
    setError("");
    try {
      await applyReportPlan(reportId, preview);
      setSaved(true);
      setOpen(false);
    } catch (failure) {
      setError(extractError(failure));
      // A refused/stale preview needs fresh consent, not a blind retry of a write.
      setPreview(null);
    } finally {
      writing.current = false;
      setBusy(false);
    }
  }

  if (saved)
    return (
      <div role="status" className="mt-5 text-sm text-fg-3">
        Report tasks added. Your report checklist stays separate.
        <Link
          to="/dashboard?tab=plan&view=plan"
          className="ml-3 inline-flex min-h-[44px] items-center text-brand"
        >
          Open My plan
        </Link>
      </div>
    );

  return (
    <section
      aria-label="Add report to My plan"
      className="mt-5 space-y-4 border-y border-ink/[0.1] py-4"
    >
      {!open ? (
        <button type="button" className={BUTTON} onClick={() => setOpen(true)}>
          Add to My plan
        </button>
      ) : (
        <>
          <fieldset disabled={busy} className="space-y-3 text-sm text-fg-3">
            <legend className="mb-3 font-semibold text-fg">
              Add this report to My plan
            </legend>
            <label className="flex min-h-[44px] items-center gap-3">
              <input
                type="radio"
                name="report-plan-mode"
                checked={mode === "merge"}
                onChange={() => changeMode("merge")}
              />
              Merge with my current plan (recommended)
            </label>
            <label className="flex min-h-[44px] items-center gap-3">
              <input
                type="radio"
                name="report-plan-mode"
                checked={mode === "replace"}
                onChange={() => changeMode("replace")}
              />
              Replace with this report’s schedule
            </label>
            <p className="text-muted">
              With no current plan, this creates one from the report’s days.
              Completed report tasks are left out. Report checkboxes and My plan
              results remain separate.
            </p>
          </fieldset>
          {preview && (
            <div
              aria-label="Report plan preview"
              className="space-y-4 text-sm text-fg-3"
            >
              <p>
                {preview.addedCount} new tasks · {preview.omittedCount}{" "}
                completed or already covered tasks left out.
              </p>
              <p>
                {preview.startDate} to {preview.deadline}.{" "}
                {preview.doneProtected} completed tasks stay protected
                {mode === "replace"
                  ? " in your old plan’s read-only history"
                  : " in your current plan"}
                . Sheet progress stays saved.
              </p>
              {preview.createsPlan && (
                <p>
                  Study hours: {preview.hoursByWeekday[0]} per weekday,{" "}
                  {preview.hoursByWeekday[5]} per weekend day. Rest day:{" "}
                  {preview.restDay === null
                    ? "none"
                    : WEEKDAYS[preview.restDay]}
                  . You can change hours from Plan.
                </p>
              )}
              {!!preview.overloadMinutes && (
                <div className="space-y-2 text-warn">
                  <p>
                    These tasks exceed daily budgets by{" "}
                    {formatPlanMinutes(preview.overloadMinutes)} in total.
                    Confirm only if this extra work is manageable, or cancel and
                    change your hours first.
                  </p>
                  <ul>
                    {preview.overloads.map((entry) => (
                      <li key={entry.day}>
                        {entry.day}: over by {formatPlanMinutes(entry.minutes)}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              <PlanWeeks items={preview.items} startDate={preview.startDate} />
              <button
                type="button"
                className={BUTTON}
                disabled={busy}
                onClick={apply}
              >
                {busy ? "Saving…" : "Confirm add to My plan"}
              </button>
            </div>
          )}
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              className={BUTTON}
              disabled={busy}
              onClick={requestPreview}
            >
              {busy
                ? "Please wait…"
                : preview
                  ? "Refresh preview"
                  : "Preview changes"}
            </button>
            <button
              type="button"
              className={BUTTON}
              disabled={busy}
              onClick={() => {
                setOpen(false);
                setPreview(null);
                setError("");
              }}
            >
              Cancel
            </button>
          </div>
          {error && (
            <p role="alert" className="text-sm text-bad">
              {error}
            </p>
          )}
        </>
      )}
    </section>
  );
}
