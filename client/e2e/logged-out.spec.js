import { test, expect } from "@playwright/test";

const API = "http://localhost:3100";

// Sheets, notes, roadmaps and the behavioral guide are open to everyone. Signed out, a page must read normally, never ask the server for
// personal data, and ask for an account only when the visitor tries to save something.
const PERSONAL = /\/api\/(sheets\/[^/]+\/progress|problem-notes|plan|user|analyzer|projects|usage)/;

function watchPersonalCalls(page) {
  const calls = [];
  page.on("request", (request) => { if (PERSONAL.test(new URL(request.url()).pathname)) calls.push(request.method() + " " + request.url()); });
  return calls;
}

async function expectNoErrorState(page) {
  await expect(page.getByRole("alert")).toHaveCount(0);
  await expect(page.getByText(/failed to load|something went wrong|session expired/i)).toHaveCount(0);
}

test("a signed-out visitor reads a DSA sheet, and is asked to sign in only when ticking or adding a note", async ({ page }) => {
  const calls = watchPersonalCalls(page);
  await page.goto("/dsa/blind-75");
  await expect(page).toHaveURL(/\/dsa\/blind-75$/);
  await page.locator("h2").first().click(); // open the first topic
  const tick = page.getByTitle("Mark as solved").first();
  await expect(tick).toBeVisible();
  await expectNoErrorState(page);
  await expect(page.getByTestId("sign-in-notice")).toHaveCount(0); // nothing is asked until the visitor tries to save

  await tick.click();
  const notice = page.getByTestId("sign-in-notice");
  await expect(notice).toContainText("Sign in to save your progress.");
  await expect(page.getByTitle("Mark as solved").first()).toBeVisible(); // still unticked: nothing was saved
  await expect(notice.getByRole("link", { name: "Sign in" })).toHaveAttribute("href", /\/login\?returnTo=%2Fdsa%2Fblind-75/);

  await notice.getByRole("button", { name: "Close" }).click();
  await expect(notice).toHaveCount(0);
  await page.getByRole("button", { name: /Add approach notes|\+ Note/ }).first().click();
  await expect(page.getByTestId("sign-in-notice")).toBeVisible(); // a note would save nothing, so the box does not open
  expect(calls).toEqual([]);
});

test("a signed-out visitor reads a notes section, and the quiz says its score is not saved", async ({ page }) => {
  const calls = watchPersonalCalls(page);
  const section = (await (await page.request.get(API + "/api/notes/os")).json()).data.sections.find((item) => item.lastChecked && item.quiz?.length);
  await page.goto("/notes/os/" + section.id);
  await expect(page).toHaveURL(new RegExp("/notes/os/" + section.id));
  await expect(page.getByRole("heading", { name: section.title, level: 1 })).toBeVisible();
  await expectNoErrorState(page);
  for (const question of section.quiz) {
    await page.getByRole("button", { name: question.options[question.answer], exact: false }).first().click();
  }
  await expect(page.getByText(`You got ${section.quiz.length} of ${section.quiz.length} right.`)).toBeVisible();
  await expect(page.getByTestId("sign-in-notice")).toContainText("This score is not saved. Sign in to keep track of your progress in My plan.");
  await page.getByRole("button", { name: "Try again" }).click();
  await expect(page.getByTestId("sign-in-notice")).toHaveCount(0);
  expect(calls).toEqual([]);
});

test("the subject page, a roadmap and the behavioral guide open without an account", async ({ page }) => {
  const calls = watchPersonalCalls(page);
  for (const [path, heading] of [["/notes/os", /./], ["/roadmaps/backend", /./], ["/behavioral", /./]]) {
    await page.goto(path);
    await expect(page).toHaveURL(new RegExp(path + "(/|$)"));
    await expect(page.locator("h1").first()).toBeVisible();
    await expect(page.locator("h1").first()).toContainText(heading);
    await expectNoErrorState(page);
  }
  expect(calls).toEqual([]);
});

test("pages that hold personal data or use AI still ask for an account", async ({ page }) => {
  for (const path of ["/dashboard", "/profile", "/my-plan/study", "/analyzer", "/resume", "/ai-projects"]) {
    await page.goto(path);
    await expect(page).toHaveURL(/\/login\?returnTo=/);
  }
});

test("signed in, the same sheet still saves a tick across a reload and opens the note box, with no sign-in message", async ({ page }) => {
  const suffix = String(Date.now());
  const account = await page.request.post(API + "/api/auth/register", {
    data: { username: "open_" + suffix, email: suffix + "@example.com", password: "Passw0rdX" },
  });
  expect(account.status()).toBe(201);
  await page.goto("/dsa/blind-75");
  await page.locator("h2").first().click();
  await page.getByTitle("Mark as solved").first().click();
  await expect(page.getByTitle("Mark as unsolved")).toHaveCount(1);
  await expect(page.getByTestId("sign-in-notice")).toHaveCount(0);
  await page.reload();
  await page.locator("h2").first().click();
  await expect(page.getByTitle("Mark as unsolved")).toHaveCount(1); // the tick was saved to the account
  await page.getByRole("button", { name: /Add approach notes|\+ Note/ }).first().click();
  await expect(page.getByTestId("sign-in-notice")).toHaveCount(0);
});

test("the sign-in message fits a phone", async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 700 });
  await page.goto("/dsa/blind-75");
  await page.locator("h2").first().click();
  await page.getByTitle("Mark as solved").first().click();
  const notice = page.getByTestId("sign-in-notice");
  await expect(notice).toBeVisible();
  const box = await notice.boundingBox();
  expect(box.x).toBeGreaterThanOrEqual(0);
  expect(box.x + box.width).toBeLessThanOrEqual(375);
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(375);
});

test("Ctrl+K opens the jump-to box on any page, finds a page, goes there, and Escape returns focus", async ({ page }) => {
  await page.goto("/roadmaps");
  await page.getByRole("link", { name: "Roadmaps" }).first().focus();
  await page.keyboard.press("Control+k");
  const box = page.getByRole("dialog", { name: "Jump to a page" });
  await expect(box).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(box).toBeHidden();
  await expect(page.getByRole("link", { name: "Roadmaps" }).first()).toBeFocused();

  await page.keyboard.press("Control+k");
  await page.getByRole("combobox", { name: "Jump to a page" }).fill("blind");
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(/\/dsa\/blind-75/);
  await expect(box).toBeHidden();
});

test("with reduced motion the home numbers show their final value at once", async ({ browser }) => {
  const context = await browser.newContext({ reducedMotion: "reduce" });
  const page = await context.newPage();
  await page.goto("/");
  await expect(page.getByText("1,276", { exact: true })).toBeVisible({ timeout: 1000 });
  await context.close();
});
