import { useEffect, useState } from "react";
import { getHistoryPlan, getPlanHistory } from "../../api/services/planService";
import { extractError } from "../../utils/extractError";
import { PlanWeeks } from "./PlanPreview";

// History is fetched separately and never passed to the editable plan components.
export default function StudyHistory({ onClear }) {
  const [reply, setReply] = useState(null);
  const [selected, setSelected] = useState("");
  const [snapshot, setSnapshot] = useState(null);
  const [retry, setRetry] = useState(0);
  useEffect(() => {
    const controller = new AbortController();
    async function load() {
      try {
        const data = selected
          ? await getHistoryPlan(selected, controller.signal)
          : await getPlanHistory(controller.signal);
        if (!controller.signal.aborted) {
          if (selected) setSnapshot({ id: selected, data });
          else setReply({ data });
        }
      } catch (error) {
        if (!controller.signal.aborted) {
          if (selected)
            setSnapshot({ id: selected, error: extractError(error) });
          else setReply({ error: extractError(error) });
        }
      }
    }
    load();
    return () => controller.abort();
  }, [selected, retry]);
  const current = selected
    ? snapshot?.id === selected
      ? snapshot
      : null
    : reply;
  return (
    <section aria-label="Plan history" className="space-y-5">
      <h2 className="text-xl font-semibold text-fg">Read-only plan history</h2>
      {selected && (
        <button
          className="min-h-[44px] text-brand"
          onClick={() => setSelected("")}
        >
          Back to history
        </button>
      )}
      {!current ? (
        <p role="status" className="text-sm text-muted">
          Loading history…
        </p>
      ) : current.error ? (
        <div role="alert" className="text-sm text-bad">
          {current.error}
          <button
            className="ml-3 min-h-[44px] underline"
            onClick={() => setRetry((count) => count + 1)}
          >
            Retry history
          </button>
        </div>
      ) : selected ? (
        <>
          <p className="text-sm text-muted">
            {current.data.plan.title}. Saved snapshot; changes are disabled.
          </p>
          <PlanWeeks
            items={current.data.plan.items}
            startDate={current.data.plan.startDate}
          />
        </>
      ) : (
        <>
          {!current.data.plans.length && (
            <p className="text-sm text-muted">
              No older plans yet. Replacing a plan keeps its snapshot here.
            </p>
          )}
          <ul className="space-y-3">
            {current.data.plans.map((plan) => (
              <li
                key={plan.id}
                className="rounded-xl border border-ink/[0.1] p-4 text-sm text-fg-3"
              >
                <p>
                  {plan.title} · {plan.startDate} to {plan.deadline}
                </p>
                <button
                  className="min-h-[44px] text-brand"
                  onClick={() => setSelected(plan.id)}
                >
                  Read saved plan
                </button>
              </li>
            ))}
          </ul>
          {!!current.data.plans.length && (
            <button className="min-h-[44px] text-sm text-bad" onClick={onClear}>
              Delete plan history
            </button>
          )}
        </>
      )}
    </section>
  );
}
