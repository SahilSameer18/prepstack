import { describe, it, expect } from "vitest";
import { behavioralQuestions, CATEGORIES } from "./behavioralQuestions";

describe("the behavioral question bank", () => {
  it("has 50 questions with unique numeric ids, and the first 22 ids from before are all still there", () => {
    expect(behavioralQuestions).toHaveLength(50);
    const ids = behavioralQuestions.map((q) => q.id);
    expect(new Set(ids).size).toBe(50);
    for (let i = 1; i <= 22; i++) expect(ids, `id ${i}`).toContain(i);
    expect(ids.every((id) => Number.isInteger(id))).toBe(true);
  });

  it("has 10 categories with 5 questions each, and every question uses one of them", () => {
    expect(CATEGORIES).toHaveLength(10);
    for (const c of CATEGORIES) expect(behavioralQuestions.filter((q) => q.category === c), c).toHaveLength(5);
    expect(behavioralQuestions.every((q) => CATEGORIES.includes(q.category))).toBe(true);
  });

  it("every question has what the interviewer checks, 4 STAR hints, an example answer and 2 mistakes", () => {
    for (const q of behavioralQuestions) {
      expect(q.question.trim().length, `question ${q.id}`).toBeGreaterThan(10);
      expect(q.checks.trim().length, `checks ${q.id}`).toBeGreaterThan(20);
      expect(q.star, `star ${q.id}`).toHaveLength(4);
      expect(q.star.every((s) => s.trim().length > 5), `star text ${q.id}`).toBe(true);
      expect(q.exampleAnswer.trim().length, `example ${q.id}`).toBeGreaterThan(60);
      expect(q.mistakes, `mistakes ${q.id}`).toHaveLength(2);
      expect(q.mistakes.every((m) => m.trim().length > 10), `mistake text ${q.id}`).toBe(true);
    }
  });

  it("no two questions or example answers are the same", () => {
    expect(new Set(behavioralQuestions.map((q) => q.question)).size).toBe(50);
    expect(new Set(behavioralQuestions.map((q) => q.exampleAnswer)).size).toBe(50);
  });
});
