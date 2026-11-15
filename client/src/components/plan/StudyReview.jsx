import { useEffect, useState } from "react";
import { getPlanReview } from "../../api/services/planService";
import { dateInIndia } from "../../utils/planBuilder";
import { extractError } from "../../utils/extractError";
import { formatPlanMinutes, studyMaterial } from "../../utils/studyPlan";

// The same list supports starred practice and due recall without adding controls to Today.
export function StudyItemList({
  items,
  onStart,
  review = false,
  readOnly = false,
}) {
  if (!items.length)
    return (
      <p className="text-sm text-muted">
        {review
          ? "No reviews are due."
          : "No starred tasks yet. Star a task from its Plan options."}
      </p>
    );
  return (
    <ul className="space-y-3">
      {items.map((item) => {
        const material = studyMaterial(item);
        return (
          <li
            key={item.id}
            className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-ink/[0.1] p-4 text-sm"
          >
            <div className="min-w-0">
              <p className="break-words text-fg">{item.title}</p>
              {review && (
                <p className="mt-1 text-muted">Due {item.nextReviewDay}</p>
              )}
              {material && (
                <a
                  className="inline-flex min-h-[44px] items-center text-brand"
                  href={material.path}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Open material (new tab)
                </a>
              )}
            </div>
            {(!review || !readOnly) && (
              <button
                className="min-h-[44px] rounded-xl border border-ink/[0.2] px-4 text-brand"
                onClick={() => onStart(item, review ? "review" : "practice")}
              >
                {review ? "Review" : "Practice"}
              </button>
            )}
          </li>
        );
      })}
    </ul>
  );
}

// Weekly totals come from the server so sheet completion overlays agree with the plan.
export default function StudyReview({ plan, readOnly, onStart, onRebuild }) {
  const [week, setWeek] = useState(dateInIndia());
  const [reply, setReply] = useState(null);
  const [retry, setRetry] = useState(0);
  useEffect(() => {
    if (!week) return;
    const controller = new AbortController();
    async function load() {
      try {
        const data = await getPlanReview(week, controller.signal);
        if (!controller.signal.aborted) setReply({ week, data });
      } catch (error) {
        if (!controller.signal.aborted)
          setReply({ week, error: extractError(error) });
      }
    }
    load();
    return () => controller.abort();
  }, [week, retry, plan.updatedAt]);
  const data = reply?.week === week ? reply.data : null;
  const error = reply?.week === week ? reply.error : null;
  const due = plan.items.filter(
    (item) =>
      !item.skipped &&
      item.nextReviewDay &&
      item.nextReviewDay <= dateInIndia(),
  );

  return (
    <section aria-label="Reviews" className="space-y-6">
      <h2 className="text-xl font-semibold text-fg">Due reviews</h2>
      {readOnly && (
        <p className="text-sm text-muted">
          This plan is read-only. Practice starred material or build another
          plan.
        </p>
      )}
      <StudyItemList items={due} onStart={onStart} review readOnly={readOnly} />
      <div className="space-y-4 border-t border-ink/[0.1] pt-6">
        <h2 className="text-xl font-semibold text-fg">Weekly review</h2>
        <label className="block text-sm text-fg-3">
          Choose a day in the week
          <input
            aria-label="Review week"
            className="ml-3 min-h-[44px] max-w-full rounded-xl border border-ink/[0.2] bg-card px-3"
            type="date"
            value={week}
            onChange={(event) => setWeek(event.target.value)}
          />
        </label>
        {error ? (
          <div role="alert" className="text-sm text-bad">
            {error}
            <button
              className="ml-3 min-h-[44px] underline"
              onClick={() => setRetry((count) => count + 1)}
            >
              Retry weekly review
            </button>
          </div>
        ) : !data ? (
          <p role="status" className="text-sm text-muted">
            Loading weekly review…
          </p>
        ) : (
          <>
            <p className="text-sm text-fg-3">
              {data.week.from} to {data.week.to}: {data.summary.completedCount}{" "}
              of {data.summary.plannedCount} tasks complete;{" "}
              {formatPlanMinutes(data.summary.completedMinutes)} of{" "}
              {formatPlanMinutes(data.summary.plannedMinutes)}.{" "}
              {data.summary.movedCount} moved.
            </p>
            <p className="text-sm text-muted">{data.onTrack.text}</p>
            {data.suggestRebuild && !readOnly && (
              <button className="min-h-[44px] text-brand" onClick={onRebuild}>
                Preview a rebuild
              </button>
            )}
            <h3 className="text-sm font-semibold text-fg">Topics to revisit</h3>
            {!data.weakTopics.length && (
              <p className="text-sm text-muted">
                No weak topics recorded this week.
              </p>
            )}
            <ul className="space-y-3">
              {data.weakTopics.map((topic) => (
                <li key={topic.key} className="text-sm text-fg-3">
                  <p>
                    {topic.title} · {topic.reason}
                  </p>
                  {topic.link && (
                    <a
                      className="inline-flex min-h-[44px] items-center text-brand"
                      href={topic.link}
                    >
                      Review material
                    </a>
                  )}
                  {topic.quizLink && (
                    <a
                      className="ml-4 inline-flex min-h-[44px] items-center text-brand"
                      href={topic.quizLink}
                    >
                      Open quiz
                    </a>
                  )}
                </li>
              ))}
            </ul>
          </>
        )}
      </div>
    </section>
  );
}
