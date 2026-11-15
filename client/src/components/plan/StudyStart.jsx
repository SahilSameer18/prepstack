import { useEffect, useState } from "react";
import Quiz from "../notes/Quiz";
import { notesService } from "../../api/services/notesService";
import { extractError } from "../../utils/extractError";
import {
  isPlanItemDone,
  mockProblems,
  studyMaterial,
} from "../../utils/studyPlan";

// Material opens beside this screen, so answering never loses the learner's current task.
export default function StudyStart({
  item,
  plan,
  mode,
  busy,
  error,
  onBack,
  onFinish,
}) {
  const [quiz, setQuiz] = useState(null);
  const [quizError, setQuizError] = useState("");
  const [score, setScore] = useState(null);
  const [retry, setRetry] = useState(0);
  const material = studyMaterial(item);
  const practice = mode === "practice";
  const review = mode === "review";
  const openParts = plan.items.filter(
    (part) =>
      part.ref === item.ref &&
      part.link === item.link &&
      !part.skipped &&
      !isPlanItemDone(part),
  );
  const needsQuiz =
    item.type === "notes" && (review || practice || openParts.length <= 1);
  const finished = isPlanItemDone(item) && !review && !practice;
  const problems = item.type === "mock" ? mockProblems(plan.items) : [];

  // Load the existing section quiz, not a generated or manually entered score.
  useEffect(() => {
    if (!needsQuiz) return;
    const controller = new AbortController();
    async function loadQuiz() {
      try {
        const subject = item.ref.split(":")[1];
        const sectionId = item.ref.split(":")[2];
        const result = await notesService.getNotesBySubject(
          subject,
          controller.signal,
        );
        const section = result.data.sections.find(
          (entry) => entry.id === sectionId,
        );
        if (section?.quiz?.length !== 5)
          throw new Error(
            "This section does not have its five-question quiz available.",
          );
        if (!controller.signal.aborted) {
          setQuiz(section.quiz);
          setQuizError("");
        }
      } catch (failure) {
        if (!controller.signal.aborted) setQuizError(extractError(failure));
      }
    }
    loadQuiz();
    return () => controller.abort();
  }, [item.ref, needsQuiz, retry]);

  return (
    <section aria-label="Study task" className="mx-auto max-w-3xl space-y-6">
      <button
        type="button"
        disabled={busy}
        onClick={onBack}
        className="min-h-[44px] text-sm text-brand"
      >
        Back to plan
      </button>
      <h2 className="text-2xl font-semibold text-fg">
        {review ? "Review: " : ""}
        {item.title}
        {item.part && ` (part ${item.part.n} of ${item.part.of})`}
      </h2>
      {practice && (
        <p className="text-sm text-muted">
          Practice only. Your saved completions and review dates will not
          change.
        </p>
      )}
      {material && (
        <a
          href={material.path}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex min-h-[44px] items-center text-sm text-brand underline"
        >
          {material.label} (new tab)
        </a>
      )}
      {item.type === "mock" && (
        <div className="space-y-3 text-sm text-fg-3">
          <p>
            Work through these two unfinished core problems. No timer or time
            tracking is used.
          </p>
          {problems.map((problem) => (
            <p key={problem.link}>
              <a
                className="text-brand underline"
                href={problem.link}
                target="_blank"
                rel="noopener noreferrer"
              >
                {problem.title}
              </a>
            </p>
          ))}
          {!problems.length && (
            <p>
              There are fewer than two unfinished core problems. You can skip
              this mock from the Plan tab.
            </p>
          )}
        </div>
      )}
      {review && item.type !== "notes" && (
        <p className="text-sm leading-relaxed text-fg-3">
          Recall the pattern, key idea, complexity and an edge case before
          opening the solution.
        </p>
      )}
      {needsQuiz && !finished && (
        <div className="space-y-4">
          {quizError ? (
            <div role="alert">
              <p className="text-bad">{quizError}</p>
              <button
                type="button"
                onClick={() => setRetry((count) => count + 1)}
                className="min-h-[44px] text-brand"
              >
                Retry quiz
              </button>
            </div>
          ) : !quiz ? (
            <p role="status">Loading section quiz…</p>
          ) : (
            <Quiz quiz={quiz} onComplete={setScore} disabled={busy} />
          )}
        </div>
      )}
      {error && (
        <p role="alert" className="text-sm text-bad">
          {error}
        </p>
      )}
      {finished ? (
        <p className="text-sm text-muted">This item is already complete.</p>
      ) : (
        <div className="flex flex-wrap gap-3">
          {practice ? (
            <button
              type="button"
              onClick={() => onFinish({})}
              className="amber-specular-button min-h-[44px] rounded-xl px-5 py-3 text-on-brand"
            >
              Next practice item
            </button>
          ) : needsQuiz ? (
            <button
              type="button"
              disabled={busy || score === null}
              onClick={() =>
                onFinish(review ? { passed: score >= 4 } : { quizScore: score })
              }
              className="amber-specular-button min-h-[44px] rounded-xl px-5 py-3 text-on-brand disabled:opacity-50"
            >
              {busy
                ? "Saving…"
                : review
                  ? "Save quiz review"
                  : "Save quiz result"}
            </button>
          ) : review ? (
            <>
              <button
                type="button"
                disabled={busy}
                onClick={() => onFinish({ passed: true })}
                className="amber-specular-button min-h-[44px] rounded-xl px-5 py-3 text-on-brand"
              >
                Remembered
              </button>
              <button
                type="button"
                disabled={busy}
                onClick={() => onFinish({ passed: false })}
                className="min-h-[44px] rounded-xl border border-ink/[0.2] px-5 py-3 text-fg"
              >
                Needs practice
              </button>
            </>
          ) : item.type === "dsa" ? (
            [
              ["alone", "Solved alone"],
              ["hints", "With hints"],
              ["solution", "Needed the solution"],
            ].map(([result, label]) => (
              <button
                key={result}
                type="button"
                disabled={busy}
                onClick={() => onFinish({ result })}
                className="min-h-[44px] rounded-xl border border-ink/[0.2] px-5 py-3 text-fg hover:border-brand"
              >
                {label}
              </button>
            ))
          ) : (
            <button
              type="button"
              disabled={busy || (item.type === "mock" && problems.length < 2)}
              onClick={() => onFinish({ done: true })}
              className="amber-specular-button min-h-[44px] rounded-xl px-5 py-3 text-on-brand disabled:opacity-50"
            >
              Complete this {item.part ? "part" : "task"}
            </button>
          )}
        </div>
      )}
    </section>
  );
}
