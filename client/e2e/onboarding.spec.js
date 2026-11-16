import { test, expect } from "@playwright/test";

const API = "http://localhost:3100";

async function signUp(page, label) {
  const suffix = String(Date.now()) + Math.floor(Math.random() * 1000);
  const username = `${label}_${suffix}`;
  const account = await page.request.post(API + "/api/auth/register", {
    data: { username, email: suffix + "@example.com", password: "Passw0rdX" },
  });
  expect(account.status()).toBe(201);
  return username;
}

test("the home page leads with the study plan and says what it does", async ({ page }) => {
  await page.goto("/");
  const hero = page.getByRole("link", { name: /Build my study plan/ }).first();
  await expect(hero).toHaveAttribute("href", "/my-plan");
  await expect(page.getByRole("heading", { name: "A study plan that fits your hours" })).toBeVisible();
  await expect(page.getByText("It shows what fits before your deadline, and what does not.")).toBeVisible();
  // two hero buttons only: the plan, and the account (signed out) or the dashboard (signed in)
  await expect(hero.locator("xpath=..").getByRole("link")).toHaveCount(2);
  await expect(hero.locator("xpath=..").getByRole("link").nth(1)).toContainText("Create Account");
  await hero.click();
  await expect(page).toHaveURL(/\/my-plan/);
});

test("a new user sees a welcome, one next step, and guidance on an empty DSA tab", async ({ page }) => {
  const username = await signUp(page, "fresh");
  await page.goto("/dashboard");
  await expect(page.getByRole("heading", { level: 1 })).toContainText(`Welcome, ${username}`);
  await expect(page.getByRole("heading", { level: 1 })).not.toContainText("Welcome back");
  const next = page.getByTestId("first-step");
  await expect(next).toContainText("Build your study plan");
  await expect(page.getByTestId("dsa-empty-hint")).toContainText("You have not solved anything yet.");
  await expect(page.getByRole("alert")).toHaveCount(0);

  // the My plan tab says the same thing in plain words, without mentioning old plans a new user cannot have
  await page.getByRole("tab", { name: /My plan/ }).click();
  await expect(page.getByText(/You have no current plan\. Choose your goal/)).toBeVisible();
  await expect(page.getByText(/Older plans/)).toHaveCount(0);

  await page.goto("/dashboard");
  await next.getByRole("link", { name: "Build my plan" }).click();
  await expect(page).toHaveURL(/\/my-plan$/);
});

test("once someone has a plan, the next-step card and the welcome message are gone", async ({ page }) => {
  await signUp(page, "planned");
  const made = await page.request.post(API + "/api/plan", {
    data: { goalType: "placements", style: "one-topic", weeks: 4, weekdayHours: 4, weekendHours: 4, restDay: null, sheetSlug: "blind-75", subjects: ["os"] },
  });
  expect(made.status()).toBe(201);
  await page.goto("/dashboard?tab=dsa");
  await expect(page.getByRole("heading", { level: 1 })).toContainText("Welcome back");
  await expect(page.getByTestId("first-step")).toHaveCount(0);
});

test("a returning user with progress but no plan is not welcomed as new, and still gets the next-step card", async ({ page }) => {
  await signUp(page, "returning");
  const sheet = (await (await page.request.get(API + "/api/sheets/blind-75")).json()).data;
  const link = sheet.topics[0].problems[0].link;
  expect((await page.request.post(API + "/api/sheets/blind-75/progress", { data: { problemLink: link } })).status()).toBe(200);
  await page.goto("/dashboard");
  await expect(page.getByRole("heading", { level: 1 })).toContainText("Welcome back");
  await expect(page.getByTestId("first-step")).toBeVisible();
  await expect(page.getByTestId("dsa-empty-hint")).toHaveCount(0);
});

test("the home page and a new user's dashboard fit a phone", async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 800 });
  await signUp(page, "phone");
  for (const path of ["/", "/dashboard"]) {
    await page.goto(path);
    await expect(page.getByRole("link", { name: /Build my (study )?plan/ }).first()).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(375);
  }
});
