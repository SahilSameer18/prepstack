import { describe, it, expect } from "vitest";
import { scoreQuiz, pick, emptyPicks } from "./quizScoring";

const quiz = [
  { question: "Q1", options: ["a", "b", "c", "d"], answer: 1, explanation: "e1" },
  { question: "Q2", options: ["a", "b", "c", "d"], answer: 3, explanation: "e2" },
  { question: "Q3", options: ["a", "b", "c", "d"], answer: 0, explanation: "e3" },
];

describe("quiz scoring", () => {
  it("starts with nothing answered and no score", () => {
    expect(scoreQuiz(quiz, emptyPicks(quiz))).toEqual({ total: 3, answered: 0, correct: 0, done: false });
  });

  it("counts right answers and says it is done only when every question is answered", () => {
    expect(scoreQuiz(quiz, [1, null, null])).toEqual({ total: 3, answered: 1, correct: 1, done: false });
    expect(scoreQuiz(quiz, [1, 2, 0])).toEqual({ total: 3, answered: 3, correct: 2, done: true });
    expect(scoreQuiz(quiz, [0, 0, 1])).toEqual({ total: 3, answered: 3, correct: 0, done: true });
  });

  it("counts the first option (index 0) as an answer, not as 'nothing picked'", () => {
    expect(scoreQuiz(quiz, [null, null, 0])).toEqual({ total: 3, answered: 1, correct: 1, done: false });
  });

  it("an empty quiz is never 'done'", () => {
    expect(scoreQuiz([], [])).toEqual({ total: 0, answered: 0, correct: 0, done: false });
  });

  it("an answered question cannot be changed, and a new pick leaves the others alone", () => {
    const first = pick(emptyPicks(quiz), 0, 2);
    expect(first).toEqual([2, null, null]);
    expect(pick(first, 0, 1)).toEqual([2, null, null]);
    expect(pick(first, 2, 0)).toEqual([2, null, 0]);
  });
});
