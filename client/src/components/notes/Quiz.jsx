import { useState } from "react";
import { FiCheck, FiX, FiRefreshCw } from "react-icons/fi";
import { scoreQuiz, pick, emptyPicks } from "./quizScoring";

const LETTERS = ["A", "B", "C", "D"];

// A short multiple-choice quiz. Pick an answer to see whether it was right and why; the score shows when every question is answered.
const Quiz = ({ quiz }) => {
  const [picks, setPicks] = useState(() => emptyPicks(quiz));
  const score = scoreQuiz(quiz, picks);

  return (
    <div className="space-y-6">
      {quiz.map((q, i) => {
        const chosen = picks[i];
        const answered = chosen !== null;
        return (
          <div key={q.question} className="space-y-2.5">
            <p className="text-fg text-sm sm:text-base font-semibold leading-snug">{i + 1}. {q.question}</p>
            <div className="grid gap-2">
              {q.options.map((option, o) => {
                const isRight = answered && o === q.answer;
                const isWrongPick = answered && o === chosen && o !== q.answer;
                return (
                  <button
                    key={option}
                    type="button"
                    disabled={answered}
                    onClick={() => setPicks((p) => pick(p, i, o))}
                    aria-pressed={chosen === o}
                    className={`flex items-start gap-3 text-left px-4 py-3 min-h-[44px] rounded-xl border text-sm transition-colors ${
                      isRight ? "border-ok-solid/40 bg-ok-solid/10 text-fg"
                        : isWrongPick ? "border-bad-solid/40 bg-bad-solid/10 text-fg"
                        : "border-ink/[0.08] bg-card text-fg-3 hover:border-ink/[0.2] disabled:hover:border-ink/[0.08]"
                    } ${answered ? "cursor-default" : "cursor-pointer"}`}
                  >
                    <span className="font-ui font-bold text-xs mt-0.5 w-5 shrink-0 text-muted">{LETTERS[o]}</span>
                    <span className="flex-1">{option}</span>
                    {isRight && <FiCheck className="text-ok mt-0.5 shrink-0" aria-label="Correct answer" />}
                    {isWrongPick && <FiX className="text-bad mt-0.5 shrink-0" aria-label="Your answer was wrong" />}
                  </button>
                );
              })}
            </div>
            {answered && <p className="text-muted text-xs sm:text-sm leading-relaxed">{q.explanation}</p>}
          </div>
        );
      })}

      {score.done && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-brand/[0.06] border border-brand/20 px-4 py-3">
          <p className="text-fg text-sm font-semibold">You got {score.correct} of {score.total} right.</p>
          <button
            type="button"
            onClick={() => setPicks(emptyPicks(quiz))}
            className="inline-flex items-center gap-2 text-xs font-ui font-semibold text-brand min-h-[44px] cursor-pointer"
          >
            <FiRefreshCw /> Try again
          </button>
        </div>
      )}
    </div>
  );
};

export default Quiz;
