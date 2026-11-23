import { useEffect, useState } from "react";
import { Link } from 'react-router-dom';
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
  const [effort, setEffort] = useState('');
  const [familiar, setFamiliar] = useState(null);
  const [rubric, setRubric] = useState({ independent: false, explained: false, tested: false });
  const [quiz, setQuiz] = useState(null);
  const [quizError, setQuizError] = useState("");
  const [score, setScore] = useState(null);
  const [retry, setRetry] = useState(0);
  const material = studyMaterial(item);
  const check = mode === "check";
  const practice = mode === "practice";
  function finish(payload) {
    onFinish({ ...payload, ...(effort ? { effort } : {}) });
  }
  const review = mode === "review";
  const openParts = plan.items.filter(
    (part) =>
      part.ref === item.ref &&
      part.link === item.link &&
      !part.skipped &&
      !isPlanItemDone(part),
  );
  const needsQuiz =
    item.type === "notes" && (review || practice || check || openParts.length <= 1);
  const finished = isPlanItemDone(item) && !review && !practice && !check;
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
        className="min-h-[44px] cursor-pointer text-sm font-semibold text-brand transition-colors hover:text-brand-hover"
      >
        Back to plan
      </button>
      <h2 className="font-display text-3xl font-bold tracking-tight text-fg">
        {review ? "Review: " : ""}
        {item.title}
        {item.part && ` (part ${item.part.n} of ${item.part.of})`}
      </h2>
      {(practice || check) && (
        <p className="text-sm text-muted">
          Practice only. Your saved completions and review dates will not
          change.
        </p>
      )}
      {item.objective && <p className="text-sm leading-relaxed text-fg-3">{item.objective}</p>}
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
      {item.type === 'dsa' && <details className="space-y-3 text-sm text-muted">
        <summary className="min-h-[44px] cursor-pointer font-semibold text-brand">Can’t access this problem?</summary>
        {(item.alternatives || []).map((resource) => <p key={resource.url}><a className="text-brand underline" href={resource.url} target="_blank" rel="noopener noreferrer">{resource.title} (new tab)</a></p>)}
        {!!item.alternatives?.length && <p>These cover the same exercise. You can record your original result after practising there.</p>}
        <Link className="inline-flex min-h-[44px] items-center font-semibold text-brand transition-colors hover:text-brand-hover" to="/my-plan/study?tab=plan">Choose a different exercise from the original task’s Plan options</Link>
      </details>}
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
                className="min-h-[44px] cursor-pointer font-semibold text-brand transition-colors hover:text-brand-hover"
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
      {item.learningKind && !practice && (
        <PracticeRubric busy={busy || finished} familiar={familiar} onFamiliar={setFamiliar} rubric={rubric} onRubric={setRubric} />
      )}
      {!finished && !practice && !check && (
        <EffortFeedback busy={busy} value={effort} onChange={setEffort} />
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
          {item.learningKind && !practice ? (
            <button type="button" disabled={busy || familiar === null} onClick={() => finish({ ...rubric, familiar })} className="amber-specular-button min-h-[44px] rounded-xl px-5 py-3 text-on-brand disabled:opacity-50">Save practice assessment</button>
          ) : practice ? (
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
                finish(review ? { passed: score >= 4 } : { quizScore: score })
              }
              className="amber-specular-button min-h-[44px] rounded-xl px-5 py-3 text-on-brand disabled:opacity-50"
            >
              {busy
                ? "Saving…"
                : review
                  ? "Save quiz review"
                  : check ? "Finish starting quiz" : "Save quiz result"}
            </button>
          ) : review ? (
            <>
              <button
                type="button"
                disabled={busy}
                onClick={() => finish({ passed: true })}
                className="amber-specular-button min-h-[44px] rounded-xl px-5 py-3 text-on-brand"
              >
                Remembered
              </button>
              <button
                type="button"
                disabled={busy}
                onClick={() => finish({ passed: false })}
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
                onClick={() => finish({ result })}
                className="min-h-[44px] rounded-xl border border-ink/[0.2] px-5 py-3 text-fg hover:border-brand"
              >
                {label}
              </button>
            ))
          ) : item.type === 'roadmap' && ['practice', 'checkpoint', 'project'].includes(item.activity) ? (
            // Practical role work needs an outcome too; a completion tick alone
            // cannot tell the follow-up policy whether help was needed.
            [['alone', 'Completed independently'], ['hints', 'Completed with help']].map(([result, label]) => (
              <button type="button" key={result} disabled={busy}
                onClick={() => finish({ done: true, result })}
                className="min-h-[44px] rounded-xl border border-ink/[0.2] px-5 py-3 text-fg hover:border-brand">
                {label}
              </button>
            ))
          ) : (
            <button
              type="button"
              disabled={busy || (item.type === "mock" && problems.length < 2)}
              onClick={() => finish({ done: true })}
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

const EVIDENCE_BUTTON = 'min-h-[44px] rounded-xl border border-ink/[0.2] px-4 text-sm text-fg aria-pressed:border-brand aria-pressed:text-brand';
const RUBRIC_LABELS = {
  independent: 'I implemented or demonstrated it independently',
  explained: 'I explained my approach and trade-offs',
  tested: 'I checked ordinary inputs and edge cases',
};

// A learner can honestly save an unsuccessful attempt. Checked boxes describe
// the attempt; they are not a required claim of success or an automatic grade.
function PracticeRubric({ busy, familiar, onFamiliar, rubric, onRubric }) {
  return (
    <fieldset disabled={busy} className="space-y-3 text-sm text-fg-3">
      <legend className="mb-3 font-semibold text-fg">Record your own assessment</legend>
      <p>This is self-reported practice. It does not mark the original sheet problem solved.</p>
      <div className="flex flex-wrap gap-2" role="group" aria-label="Question familiarity">
        <button type="button" aria-pressed={familiar === false} className={EVIDENCE_BUTTON} onClick={() => onFamiliar(false)}>New to me</button>
        <button type="button" aria-pressed={familiar === true} className={EVIDENCE_BUTTON} onClick={() => onFamiliar(true)}>Seen before</button>
      </div>
      {Object.entries(RUBRIC_LABELS).map(([key, label]) => (
        <label key={key} className="flex min-h-[44px] items-center gap-3">
          <input type="checkbox" className="h-4 w-4 shrink-0 accent-brand" checked={rubric[key]} onChange={(event) => onRubric({ ...rubric, [key]: event.target.checked })} />
          {label}
        </label>
      ))}
    </fieldset>
  );
}

function EffortFeedback({ busy, value, onChange }) {
  const choices = [['less', 'Less effort'], ['about', 'About right'], ['more', 'More effort']];
  return (
    <fieldset disabled={busy} className="space-y-3">
      <legend className="text-sm text-muted">Compared with the estimate, study effort felt: (optional)</legend>
      <div className="flex flex-wrap gap-2">
        {choices.map(([choice, label]) => (
          <button type="button" key={choice} aria-pressed={value === choice}
            onClick={() => onChange(value === choice ? '' : choice)} className={EVIDENCE_BUTTON}>
            {label}
          </button>
        ))}
      </div>
    </fieldset>
  );
}
