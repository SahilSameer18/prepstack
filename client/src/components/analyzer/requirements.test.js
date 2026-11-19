import { describe, it, expect } from "vitest";
import { orderRequirements, missingRequired, requirementName } from "./requirements";

const r = (text, importance, status, skillKey = "none") => ({ text, importance, status, skillKey });

describe("orderRequirements", () => {
  it("puts missing required skills first, then partial and met required ones, then the nice-to-have ones with their gaps first", () => {
    const list = [
      r("Git", "nice", "met"), r("React", "must", "met"), r("Kubernetes", "nice", "missing"), r("Docker", "must", "missing"),
      r("Jest", "nice", "partial"), r("Node.js", "must", "partial"),
    ];
    expect(orderRequirements(list).map((x) => x.text)).toEqual(["Docker", "Node.js", "React", "Kubernetes", "Jest", "Git"]);
  });

  it("keeps the report's own order inside a group and does not change the list it is given", () => {
    const list = [r("B", "must", "missing"), r("A", "must", "missing"), r("C", "must", "missing")];
    const copy = [...list];
    expect(orderRequirements(list).map((x) => x.text)).toEqual(["B", "A", "C"]);
    expect(list).toEqual(copy);
  });

  it("treats an unknown status like a gap-free one instead of crashing", () => {
    expect(orderRequirements([r("A", "must", "weird"), r("B", "must", "missing")]).map((x) => x.text)).toEqual(["A", "B"]);
  });
});

describe("missingRequired", () => {
  it("lists only required skills that are missing, never nice-to-have or partly met ones", () => {
    const list = [r("Docker", "must", "missing"), r("Redis", "nice", "missing"), r("Node.js", "must", "partial"), r("React", "must", "met")];
    expect(missingRequired(list).map((x) => x.text)).toEqual(["Docker"]);
  });
  it("is empty when every required skill has some proof", () => {
    expect(missingRequired([r("React", "must", "met"), r("Node.js", "must", "partial")])).toEqual([]);
  });
});

describe("requirementName", () => {
  it("uses the catalog skill when there is one, otherwise the job's own words", () => {
    expect(requirementName(r("Experience with containers", "must", "missing", "Docker"))).toBe("Docker");
    expect(requirementName(r("Experience with containers", "must", "missing", "none"))).toBe("Experience with containers");
    expect(requirementName({ text: "Kafka" })).toBe("Kafka");
  });
});
