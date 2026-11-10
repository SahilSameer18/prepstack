// Quiz scoring, kept apart from the screen so it can be tested.
// quiz: [{ question, options, answer (index), explanation }]; picks: for each question the option the reader chose, or null.
export const scoreQuiz = (quiz, picks) => {
  const answered = quiz.filter((_, i) => picks[i] !== null && picks[i] !== undefined).length;
  const correct = quiz.filter((q, i) => picks[i] === q.answer).length;
  return { total: quiz.length, answered, correct, done: quiz.length > 0 && answered === quiz.length };
};

// Choose an option for question i. A question that is already answered cannot be changed, so a score cannot be improved by trying again on the spot.
export const pick = (picks, i, option) => (picks[i] === null ? picks.map((p, j) => (j === i ? option : p)) : picks);

export const emptyPicks = (quiz) => quiz.map(() => null);
