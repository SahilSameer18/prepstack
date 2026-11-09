import { describe, it, expect } from "vitest";
import { renderToBuffer } from "@react-pdf/renderer";
import ResumeChecklistPDF from "./ResumeChecklistPDF";
import { checklist } from "../../data/resumeGuide";

// The real PDF is drawn here, in Node, from the same data the page uses.
describe("resume checklist PDF", () => {
  it("renders a real PDF that fits on one page", async () => {
    const buffer = await renderToBuffer(<ResumeChecklistPDF origin="https://example.com" />);
    const text = buffer.toString("latin1");
    expect(text.startsWith("%PDF")).toBe(true);
    expect(text.match(/\/Type \/Page\b/g)).toHaveLength(1);
  });

  it("has items in every group, and no group is empty or repeated", () => {
    expect(checklist.length).toBeGreaterThan(0);
    expect(new Set(checklist.map((g) => g.group)).size).toBe(checklist.length);
    for (const g of checklist) expect(g.items.length).toBeGreaterThan(0);
  });
});
