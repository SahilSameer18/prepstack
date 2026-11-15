import { useState } from "react";
import {
  getProblemSubstitutes,
  substitutePlanProblem,
} from "../../api/services/planService";
import { extractError } from "../../utils/extractError";

// Another exercise gets a separate identity; the original stays visibly skipped.
export default function ProblemSubstitute({ item, model, onClose }) {
  const [reply, setReply] = useState(null);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Fetch valid, unscheduled choices. Clear the old selection because its
  // preview may no longer match the current plan or sheet progress.
  async function load() {
    setLoading(true);
    setError("");
    setSelected(null);
    try {
      const availableProblems = await getProblemSubstitutes(item.id);
      setReply(availableProblems);
    } catch (failure) {
      const message = extractError(failure);
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  // Save only after confirmation. A failure requires fresh choices rather
  // than retrying a possibly outdated substitution preview.
  async function confirm() {
    const result = await model.runAction(() =>
      substitutePlanProblem(item.id, selected),
    );
    if (result) onClose();
    else setReply(null);
  }

  return (
    <div className="space-y-3 border-t border-ink/[0.1] pt-4 text-sm text-fg-3">
      <button
        type="button"
        disabled={loading || model.busy}
        className="min-h-[44px] text-brand"
        onClick={load}
      >
        {loading ? "Finding problems…" : "Find a different problem"}
      </button>
      {reply && (
        <>
          {!reply.substitutes.length && (
            <p>
              No unscheduled problem in this topic is available. You can keep
              the original or skip it.
            </p>
          )}
          <fieldset disabled={model.busy} className="space-y-2">
            <legend className="mb-2">Choose a separate exercise</legend>
            {reply.substitutes.map((choice) => (
              <label
                key={choice.link}
                className="flex min-h-[44px] items-start gap-3"
              >
                <input
                  type="radio"
                  name="substitute"
                  className="mt-1"
                  checked={selected?.link === choice.link}
                  onChange={() => setSelected(choice)}
                />
                <span>
                  {choice.title} · {choice.difficulty} · {choice.plannedMinutes}{" "}
                  min
                </span>
              </label>
            ))}
          </fieldset>
          {selected && (
            <>
              <p>
                The original and its unfinished parts move to Skipped. The new
                task is scheduled on {item.day}; its estimate may exceed that
                day’s budget. Only the new problem gets solve credit.
              </p>
              <button
                type="button"
                disabled={model.busy}
                className="min-h-[44px] text-brand"
                onClick={confirm}
              >
                Confirm different problem
              </button>
            </>
          )}
        </>
      )}
      {error && (
        <p role="alert" className="text-bad">
          {error}
        </p>
      )}
    </div>
  );
}
