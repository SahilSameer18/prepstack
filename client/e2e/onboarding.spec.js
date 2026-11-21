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
  await expect(page.getByRole("heading", { name: "Three steps. Then just show up." })).toBeVisible();
  await expect(page.getByText("It shows what fits before your deadline, and what does not.")).toBeVisible();
  // two hero buttons only: the plan, and the account (signed out) or the dashboard (signed in)
  await expect(hero.locator("xpath=..").getByRole("link")).toHaveCount(2);
  await expect(hero.locator("xpath=..").getByRole("link").nth(1)).toContainText("Create Account");
  await hero.click();
  await expect(page).toHaveURL(/\/my-plan/);
});

test("login shows one field focus outline and keeps the password toggle keyboard accessible", async ({ page }) => {
  await page.goto("/login");
  const password = page.getByLabel("Password", { exact: true });
  const wrapper = password.locator("..");
  const idleBorder = await wrapper.evaluate((field) => getComputedStyle(field).borderTopColor);
  await page.getByLabel("Email address").focus();
  await page.keyboard.press("Tab");
  await expect(password).toBeFocused();
  await expect(password).toHaveCSS("outline-style", "none");
  await expect(wrapper).not.toHaveCSS("border-top-color", idleBorder);

  await page.keyboard.press("Tab");
  const toggle = page.getByRole("button", { name: "Show password" });
  await expect(toggle).toBeFocused();
  await expect(toggle).toHaveCSS("outline-style", "solid");
  await page.keyboard.press("Enter");
  await expect(password).toHaveAttribute("type", "text");
});

for (const destination of ["/dashboard", "/my-plan?weeks=9"]) {
  test(`signup returns to ${destination}`, async ({ page }) => {
    if (destination === "/dashboard") {
      await page.goto("/");
      await page.getByRole("link", { name: "Create Account", exact: true }).first().click();
    } else {
      await page.goto(`/register?returnTo=${encodeURIComponent(destination)}`);
    }

    const suffix = String(Date.now());
    await page.getByLabel("Username").fill(`signup_${suffix}`);
    await page.getByLabel("Email address").fill(`signup_${suffix}@example.com`);
    await page.getByLabel("Password", { exact: true }).fill("Passw0rdX");
    await page.locator('button[type="submit"]').click();

    await expect(page).toHaveURL((url) => url.pathname + url.search === destination);
    if (destination === "/dashboard") await expect(page.getByTestId("first-step")).toBeVisible();
  });
}

test("a new user sees a welcome, one next step, and guidance on an empty DSA tab", async ({ page }) => {
  const username = await signUp(page, "fresh");
  await page.goto("/dashboard");
  await expect(page.getByRole("heading", { level: 1 })).toContainText(`Welcome, ${username}`);
  await expect(page.getByRole("heading", { level: 1 })).not.toContainText("Welcome back");
  const next = page.getByTestId("first-step");
  await expect(next).toContainText("Build your study plan");
  await expect(page.getByTestId("dsa-empty-hint")).toContainText("You have not solved anything yet.");
  await expect(page.getByRole("alert")).toHaveCount(0);

  await page.getByRole("tab", { name: /My plan/ }).click();
  await expect(next.getByRole("link", { name: "Build my plan" })).toBeVisible();
  await expect(page.getByRole("navigation", { name: "Study plan tabs" })).toHaveCount(0);
  await page.getByRole("button", { name: "Plan history" }).click();
  await expect(page.getByRole("region", { name: "Plan history" })).toBeVisible();
  await page.getByRole("button", { name: "Back to My plan" }).click();
  await expect(next).toBeVisible();

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

test("a returning learner sees their DSA progress, then can build a plan from My plan", async ({ page }) => {
  await signUp(page, "returning");
  const sheet = (await (await page.request.get(API + "/api/sheets/blind-75")).json()).data;
  const link = sheet.topics[0].problems[0].link;
  expect((await page.request.post(API + "/api/sheets/blind-75/progress", { data: { problemLink: link } })).status()).toBe(200);
  await page.goto("/dashboard");
  await expect(page.getByRole("heading", { level: 1 })).toContainText("Welcome back");
  await expect(page.getByRole("heading", { name: "DSA progress" })).toBeVisible();
  await expect(page.getByTestId("first-step")).toHaveCount(0);
  await expect(page.getByTestId("dsa-empty-hint")).toHaveCount(0);
  await page.getByRole("tab", { name: "My plan" }).click();
  await expect(page.getByTestId("first-step")).toBeVisible();
});

test("a failed reports read leaves a neutral greeting and offers retry", async ({ page }) => {
  const username = await signUp(page, "report_retry");
  const reportRoute = /\/api\/analyzer\?limit=50$/;
  await page.route(reportRoute, (route) => route.fulfill({ status: 503, json: { message: "Reports are temporarily unavailable." } }));
  await page.goto("/dashboard?tab=reports");
  await expect(page.getByRole("heading", { name: "Could not load your role reports" })).toBeVisible();
  await expect(page.getByTestId("first-step")).toHaveCount(0);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(`Hi, ${username}`);

  await page.unroute(reportRoute);
  await page.getByRole("button", { name: /retry|try again/i }).click();
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(`Welcome, ${username}`);
});

test("a signed-in person is not sent to log in when the server cannot be reached", async ({ page }) => {
  const username = await signUp(page, "offline");
  const sessionCheck = /\/api\/auth\/current-user$/;
  await page.route(sessionCheck, (route) => route.abort());
  await page.goto("/dashboard");
  await expect(page.getByRole("heading", { name: "Can't reach the server" })).toBeVisible();
  await expect(page).not.toHaveURL(/\/login/);

  await page.unroute(sessionCheck);
  await page.getByRole("button", { name: /try again/i }).click();
  await expect(page.getByRole("heading", { level: 1 })).toContainText(username);
});

test("the home page and a new user's dashboard fit a phone", async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 800 });
  await signUp(page, "phone");
  for (const path of ["/", "/dashboard"]) {
    await page.goto(path);
    await expect(page.getByRole("link", { name: /Build my (study )?plan/ }).first()).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(375);
  }
  const nextStep = await page.getByTestId("first-step").boundingBox();
  const tabs = await page.getByRole("tablist", { name: "Dashboard sections" }).boundingBox();
  expect(tabs.y + tabs.height).toBeLessThan(nextStep.y);
  expect(nextStep.y + nextStep.height).toBeLessThan(800);
});
