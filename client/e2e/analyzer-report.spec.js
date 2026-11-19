import { test, expect } from "@playwright/test";

const API = "http://localhost:3100";

// The report page: the "evidence match" wording, a note for missing required skills, required skills listed first, and one plain sentence under each requirement.
async function openReport(page) {
  const suffix = String(Date.now());
  const account = await page.request.post(API + "/api/auth/register", { data: { username: "report_" + suffix, email: suffix + "@example.com", password: "Passw0rdX" } });
  expect(account.status()).toBe(201);
  const user = (await account.json()).data.user.id;
  const made = await page.request.post(API + "/__test/report", { data: { user } });
  const { id } = await made.json();
  await page.goto("/analyzer/" + id);
}

test("the report shows an evidence match, a missing required skill on top, and why under each requirement", async ({ page }) => {
  await openReport(page);
  await expect(page.getByText("EVIDENCE MATCH", { exact: true })).toBeVisible();
  await expect(page.getByText("It is not a chance of getting the job.")).toBeVisible();
  const note = page.getByRole("note");
  await expect(note).toContainText("1 required skill is not shown in your resume: Docker");
  await expect(note).toContainText("A high score does not hide this.");

  await page.getByRole("tab", { name: /Skills/ }).click();
  const rows = page.getByRole("tabpanel").getByRole("listitem");
  await expect(rows.first()).toContainText("Docker"); // a missing required skill comes first
  await expect(rows.first()).toContainText("Required: 0 of 3 points. Nothing in your resume shows it.");
  await expect(page.getByText("Required: 3 of 3 points. Your resume shows it.")).toBeVisible();
  await expect(page.getByText("Nice to have: 0.5 of 1 point. Your resume shows it only in part.")).toBeVisible();
});

test("the report fits a phone screen", async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await openReport(page);
  await page.getByRole("tab", { name: /Skills/ }).click();
  await expect(page.getByRole("note")).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true);
  await page.screenshot({ path: "../.tmp/analyzer-report-mobile.png", fullPage: true });
});
