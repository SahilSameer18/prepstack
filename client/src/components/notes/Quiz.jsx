import { useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { Check, X, ArrowCounterClockwise } from "@phosphor-icons/react";
import { scoreQuiz, pick, emptyPicks } from "./quizScoring";
import ProgressRing from "../../pages/DsaSheets/components/ProgressRing";

const LETTERS = ["A", "B", "C", "D"];

// A short multiple-choice quiz. Pick an answer to see whether it was right and why; the score shows when every question is answered.
const Quiz = ({ quiz, onComplete, disabled = false }) => {
  const [picks, setPicks] = useState(() => emptyPicks(quiz));
  const score = scoreQuiz(quiz, picks);
  const calm = useReducedMotion();

  // The study screen receives a score only after every question has been answered.
  function chooseAnswer(question, answer) {
    const next = pick(picks, question, answer);
    setPicks(next);
    const result = scoreQuiz(quiz, next);
    if (result.done) onComplete?.(result.correct);
  }

  return (
    <div className="space-y-6">
      {quiz.map((q, i) => {
        const chosen = picks[i];
        const answered = chosen !== null;
        return (
          <div key={q.question} className="space-y-2.5">
            <p className="font-display text-lg font-bold leading-snug tracking-tight text-fg">{i + 1}. {q.question}</p>
            <div className="grid gap-2">
              {q.options.map((option, o) => {
                const isRight = answered && o === q.answer;
                const isWrongPick = answered && o === chosen && o !== q.answer;
                return (
                  <button
                    key={option}
                    type="button"
                    disabled={answered || disabled}
                    onClick={() => chooseAnswer(i, o)}
                    aria-pressed={chosen === o}
                    className={`flex items-start gap-3 text-left px-4 py-3 min-h-[44px] rounded-xl border text-base transition-colors duration-200 ${
                      isRight ? "border-ok-solid/40 bg-ok-solid/10 text-fg"
                        : isWrongPick ? "border-bad-solid/40 bg-bad-solid/10 text-fg"
                        : "border-ink/[0.1] bg-card text-fg-3 hover:border-ink/[0.22] disabled:hover:border-ink/[0.1]"
                    } ${answered ? "cursor-default" : "cursor-pointer"}`}
                  >
                    <span className="font-ui font-bold text-xs mt-0.5 w-5 shrink-0 text-muted">{LETTERS[o]}</span>
                    <span className="flex-1">{option}</span>
                    {isRight && <motion.span className="mt-0.5 flex shrink-0 text-ok" initial={calm ? false : { scale: 0.5 }} animate={{ scale: 1 }} transition={{ type: "spring", duration: 0.3, bounce: 0.4 }}><Check weight="bold" aria-label="Correct answer" /></motion.span>}
                    {isWrongPick && <motion.span className="mt-0.5 flex shrink-0 text-bad" initial={calm ? false : { scale: 0.5 }} animate={{ scale: 1 }} transition={{ type: "spring", duration: 0.3, bounce: 0.25 }}><X weight="bold" aria-label="Your answer was wrong" /></motion.span>}
                  </button>
                );
              })}
            </div>
            <AnimatePresence initial={false}>
              {answered && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  transition={calm ? { duration: 0.15 } : { height: { type: "spring", duration: 0.3, bounce: 0 }, opacity: { duration: 0.2 } }}
                  className="overflow-hidden"
                >
                  <p className="pt-1 text-sm leading-relaxed text-muted">{q.explanation}</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}

      {score.done && (
        <div className="surface-card fade-in flex flex-wrap items-center justify-between gap-4 border-brand/25 p-5">
          <div className="flex items-center gap-4">
            <ProgressRing size={84} percentage={Math.round((score.correct / score.total) * 100)} solved={score.correct} total={score.total} />
            <p className="font-display text-lg font-bold tracking-tight text-fg">You got {score.correct} of {score.total} right.</p>
          </div>
          <button
            type="button"
            disabled={disabled}
            onClick={() => { setPicks(emptyPicks(quiz)); onComplete?.(null); }}
            className="inline-flex min-h-[44px] cursor-pointer items-center gap-2 text-sm font-semibold text-brand transition-colors hover:text-brand-hover"
          >
            <ArrowCounterClockwise aria-hidden="true" /> Try again
          </button>
        </div>
      )}
    </div>
  );
};

export default Quiz;
