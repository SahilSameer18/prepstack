import { test, expect } from "@playwright/test";

const API = "http://localhost:3100";

// Every test uses its own account in the disposable database and the real HTTP API.
async function createPlan(page, overrides = {}) {
  const suffix = String(Date.now());
  const account = await page.request.post(API + "/api/auth/register", {
    data: {
      username: "browser_" + suffix,
      email: suffix + "@example.com",
      password: "Passw0rdX",
    },
  });
  expect(account.status()).toBe(201);
  const user = (await account.json()).data.user.id;
  const body = {
    goalType: "placements",
    style: "one-topic",
    weeks: 4,
    weekdayHours: 4,
    weekendHours: 4,
    restDay: null,
    sheetSlug: "blind-75",
    subjects: ["os"],
    ...overrides,
  };
  const response = await page.request.post(API + "/api/plan", { data: body });
  expect(response.status()).toBe(201);
  return { user, body, plan: (await response.json()).data.plan };
}

async function savedPlan(page) {
  const response = await page.request.get(API + "/api/plan");
  expect(response.ok()).toBe(true);
  return (await response.json()).data.plan;
}

async function assertFits(page) {
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
}

async function createReport(page, user) {
  const response = await page.request.post(API + '/__test/report', { data: { user } });
  expect(response.ok()).toBe(true);
  return (await response.json()).id;
}

test('Phase 7: dashboard uses one calm goal-plan Today and preserves nested navigation', async ({ page }) => {
  const { user } = await createPlan(page);
  await createReport(page, user);
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto('/dashboard');
  const tabs = page.getByRole('tablist', { name: 'Dashboard sections' });
  await expect(tabs.getByRole('tab').first()).toHaveText(/My plan/);
  await expect(tabs.getByRole('tab', { name: /My plan/ })).toHaveAttribute('aria-selected', 'true');
  const today = page.getByRole('region', { name: 'Today', exact: true });
  const start = today.getByRole('button', { name: 'Start', exact: true });
  await expect(start).toBeVisible();
  expect((await start.boundingBox()).y + (await start.boundingBox()).height).toBeLessThan(812);
  await expect(today.getByRole('button')).toHaveCount(1);
  await assertFits(page);
  await page.screenshot({ path: '../.tmp/phase7-mobile.png', fullPage: true });
  await start.click();
  await page.getByRole('button', { name: 'Solved alone', exact: true }).click();
  await expect(page).toHaveURL(/tab=plan&view=today/);
  await expect(today).toBeVisible();
  await tabs.getByRole('tab', { name: /^DSA/ }).click();
  await expect(page.getByRole('region', { name: 'Overview' }).getByRole('button', { name: /Plan tasks/ })).toContainText('1');
  await expect(page.getByRole('region', { name: "Today's study plan" })).toHaveCount(0);
  await page.setViewportSize({ width: 1440, height: 900 });
  await tabs.getByRole('tab', { name: /My plan/ }).click();
  await page.getByRole('button', { name: 'Plan', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Rebuild from today' })).toBeVisible();
  await assertFits(page);
  await page.screenshot({ path: '../.tmp/phase7-desktop.png', fullPage: true });
  await tabs.getByRole('tab', { name: /My plan/ }).focus();
  await page.keyboard.press('ArrowRight');
  await expect(tabs.getByRole('tab', { name: /^DSA/ })).toBeFocused();
  await page.keyboard.press('Home');
  await expect(tabs.getByRole('tab', { name: /My plan/ })).toBeFocused();
});

test('Phase 7: report merge and replacement require a fresh preview and preserve history', async ({ page }) => {
  const { user, plan } = await createPlan(page);
  const report = await createReport(page, user);
  const dsa = plan.items.find((item) => item.type === 'dsa' && !item.part);
  await page.request.post(API + '/api/plan/items/' + dsa.id + '/result', { data: { result: 'alone' } });
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto('/analyzer/' + report);
  await page.getByRole('button', { name: 'Add to My plan', exact: true }).click();
  await expect(page.getByRole('radio', { name: /Merge with/ })).toBeChecked();
  await page.getByRole('button', { name: 'Preview changes', exact: true }).click();
  await expect(page.getByLabel('Report plan preview')).toContainText('3 new tasks');
  await assertFits(page);
  await page.screenshot({ path: '../.tmp/phase7-import-mobile.png', fullPage: true });
  await page.setViewportSize({ width: 1440, height: 900 });
  await assertFits(page);
  await page.screenshot({ path: '../.tmp/phase7-import-desktop.png', fullPage: true });
  await page.setViewportSize({ width: 375, height: 812 });
  expect((await savedPlan(page)).items.length).toBe(plan.items.length);
  await page.request.post(API + '/api/plan/items', { data: { title: 'Added after preview', day: plan.startDate, plannedMinutes: 15 } });
  await page.getByRole('button', { name: 'Confirm add to My plan' }).click();
  await expect(page.getByRole('alert')).toContainText('changed');
  await page.getByRole('button', { name: 'Preview changes', exact: true }).click();
  await page.getByRole('button', { name: 'Confirm add to My plan' }).click();
  await expect(page.getByRole('link', { name: 'Open My plan', exact: true })).toBeVisible();
  const merged = await savedPlan(page);
  expect(merged.id).toBe(plan.id);
  expect(merged.items.find((item) => item.id === dsa.id).doneAt).toBeTruthy();
  expect(merged.items.filter((item) => item.source === 'analyzer:' + report)).toHaveLength(3);
  await assertFits(page);
  await page.goto('/analyzer/' + report);
  await page.getByRole('button', { name: 'Add to My plan', exact: true }).click();
  await page.getByRole('radio', { name: /Replace with/ }).check();
  await page.getByRole('button', { name: 'Preview changes', exact: true }).click();
  await page.getByRole('button', { name: 'Cancel', exact: true }).click();
  expect((await savedPlan(page)).id).toBe(plan.id);
  await page.getByRole('button', { name: 'Add to My plan', exact: true }).click();
  await page.getByRole('button', { name: 'Preview changes', exact: true }).click();
  await page.getByRole('button', { name: 'Confirm add to My plan' }).click();
  const replacement = await savedPlan(page);
  expect(replacement.id).not.toBe(plan.id);
  const history = await page.request.get(API + '/api/plan/history/' + plan.id);
  expect(history.status()).toBe(200);
  expect((await history.json()).data.plan.items.find((item) => item.id === dsa.id).doneAt).toBeTruthy();
  await page.getByRole('link', { name: 'Open My plan', exact: true }).click();
  await page.getByRole('button', { name: 'Rebuild from today' }).click();
  const dialog = page.getByRole('dialog');
  await dialog.getByRole('button', { name: 'Preview change' }).click();
  await dialog.getByRole('button', { name: 'Confirm change' }).click();
  await expect(dialog).toHaveCount(0);
  expect((await savedPlan(page)).items).toHaveLength(3);
});

test('Phase 7: no goal plan keeps DSA first and falls back to the latest report', async ({ page }) => {
  const { user } = await createPlan(page);
  await page.request.delete(API + '/api/plan');
  const report = await createReport(page, user);
  await page.goto('/dashboard');
  const tabs = page.getByRole('tablist', { name: 'Dashboard sections' });
  await expect(tabs.getByRole('tab').first()).toHaveText(/^DSA/);
  await expect(page.getByRole('region', { name: "Today's study plan" })).toContainText('Frontend role connection');
  await tabs.getByRole('tab', { name: /My plan/ }).click();
  await expect(page.getByRole('link', { name: 'Build your plan' })).toBeVisible();
  await page.goto('/analyzer/' + report);
  await page.getByRole('button', { name: 'Add to My plan', exact: true }).click();
  await page.getByRole('button', { name: 'Preview changes', exact: true }).click();
  await page.getByRole('button', { name: 'Confirm add to My plan' }).click();
  await page.getByRole('link', { name: 'Open My plan', exact: true }).click();
  await expect(tabs.getByRole('tab').first()).toHaveText(/My plan/);
  expect((await savedPlan(page)).items).toHaveLength(3);
});

test("mobile Today, real DSA result, retry, custom tasks and keyboard dialogs", async ({
  page,
}) => {
  await page.setViewportSize({ width: 375, height: 812 });
  const { plan } = await createPlan(page);
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("/my-plan/study");
  const today = page.getByRole("region", { name: "Today", exact: true });
  const start = today.getByRole("button", { name: "Start", exact: true });
  await expect(start).toBeVisible();
  expect((await start.boundingBox()).y).toBeLessThan(600);
  await expect(today.getByRole("button")).toHaveCount(1);
  await assertFits(page);
  await page.screenshot({ path: "../.tmp/today-mobile.png", fullPage: true });

  // A rejected result must remain on its task and must not become a local completion.
  const dsa = plan.items.find((item) => item.type === "dsa" && !item.part);
  await page.goto("/my-plan/study?tab=plan&item=" + dsa.id);
  await page.route("**/api/plan/items/*/result", (route) =>
    route.fulfill({
      status: 503,
      json: { message: "Connection interrupted. Try again." },
    }),
  );
  await page.getByRole("button", { name: "Solved alone", exact: true }).click();
  await expect(page.getByRole("alert")).toContainText("Connection interrupted");
  expect(
    (await savedPlan(page)).items.find((item) => item.id === dsa.id).doneAt,
  ).toBeNull();
  await page.unroute("**/api/plan/items/*/result");
  await page.getByRole("button", { name: "Solved alone", exact: true }).click();
  await expect(
    page.getByRole("button", { name: "Add a task", exact: true }),
  ).toBeVisible();
  const done = (await savedPlan(page)).items.find((item) => item.id === dsa.id);
  expect(done.result).toBe("alone");
  expect(done.nextReviewDay).toBeTruthy();

  await page.getByRole("button", { name: "Add a task", exact: true }).click();
  const dialog = page.getByRole("dialog");
  await expect(
    dialog.getByRole("button", { name: "Cancel", exact: true }),
  ).toBeFocused();
  await dialog.getByLabel("Task title").fill("Explain closures aloud");
  await dialog.getByLabel("Estimated minutes").fill("25");
  await dialog.getByRole("button", { name: "Save task" }).click();
  await expect(dialog).toHaveCount(0);
  await expect(
    page.getByRole("button", { name: "Add a task", exact: true }),
  ).toBeFocused();
  const custom = (await savedPlan(page)).items.find(
    (item) => item.title === "Explain closures aloud",
  );
  expect(custom.plannedMinutes).toBe(25);
  await page
    .getByRole("button", { name: /Options: Explain closures aloud/ })
    .click();
  await dialog.getByRole("button", { name: "Star for revision" }).click();
  await expect(
    dialog.getByRole("button", { name: "Remove star" }),
  ).toBeVisible();
  await dialog.getByRole("button", { name: "Skip task", exact: true }).click();
  await expect(
    dialog.getByRole("button", { name: "Restore task" }),
  ).toBeVisible();
  await dialog.getByRole("button", { name: "Restore task" }).click();
  const tomorrow = new Date(custom.day + "T00:00:00Z");
  tomorrow.setUTCDate(tomorrow.getUTCDate() + 1);
  await dialog
    .getByLabel("Scheduled day")
    .fill(tomorrow.toISOString().slice(0, 10));
  await dialog.getByLabel("Estimated minutes").fill("30");
  await dialog.getByRole("button", { name: "Save task" }).click();
  await expect(dialog).toHaveCount(0);
  expect(
    (await savedPlan(page)).items.find((item) => item.id === custom.id),
  ).toMatchObject({ locked: true, plannedMinutes: 30 });

  await page.getByRole("button", { name: "Change hours", exact: true }).click();
  await dialog.getByLabel("New weekday hours").fill("3");
  await dialog.getByRole("button", { name: "Preview change" }).click();
  await expect(
    dialog.getByRole("button", { name: "Confirm change" }),
  ).toBeVisible();
  expect((await savedPlan(page)).hoursByWeekday[0]).toBe(4);
  await assertFits(page);
  await dialog.getByRole("button", { name: "Confirm change" }).click();
  await expect(dialog).toHaveCount(0);
  expect((await savedPlan(page)).hoursByWeekday[0]).toBe(3);
  expect(
    (await savedPlan(page)).items.find((item) => item.id === dsa.id).doneAt,
  ).toBe(done.doneAt);
  await page.getByRole("button", { name: "Lighter days", exact: true }).click();
  await dialog.getByRole("button", { name: "Preview change" }).click();
  await dialog.getByRole("button", { name: "Confirm change" }).click();
  await expect(dialog).toHaveCount(0);
  expect((await savedPlan(page)).lighterDays).toHaveLength(1);
  await page.getByRole("button", { name: "Lighter days", exact: true }).click();
  await dialog
    .getByRole("button", { name: "Preview clearing lighter days" })
    .click();
  await dialog.getByRole("button", { name: "Confirm change" }).click();
  await expect(dialog).toHaveCount(0);
  expect((await savedPlan(page)).lighterDays).toHaveLength(0);
  await page
    .getByRole("button", { name: "Rebuild from today", exact: true })
    .click();
  await page.keyboard.press("Escape");
  await expect(dialog).toHaveCount(0);
  await expect(
    page.getByRole("button", { name: "Rebuild from today", exact: true }),
  ).toBeFocused();
  expect(errors).toEqual([]);
});

test("existing notes quiz is required before saving its score", async ({
  page,
}) => {
  const { plan } = await createPlan(page);
  const note = plan.items.find((item) => item.type === "notes" && !item.part);
  expect(note).toBeTruthy();
  await page.goto("/my-plan/study?tab=plan&item=" + note.id);
  const save = page.getByRole("button", { name: "Save quiz result" });
  await expect(save).toBeDisabled();
  const response = await page.request.get(API + "/api/notes/os");
  const section = (await response.json()).data.sections.find(
    (item) => item.id === note.ref.split(":")[2],
  );
  for (const question of section.quiz) {
    await page
      .getByRole("button", {
        name: question.options[question.answer],
        exact: false,
      })
      .click();
  }
  await expect(save).toBeEnabled();
  await page.getByRole("button", { name: "Try again" }).click();
  await expect(save).toBeDisabled();
  for (const question of section.quiz) {
    await page
      .getByRole("button", {
        name: question.options[question.answer],
        exact: false,
      })
      .click();
  }
  await save.click();
  await expect(
    page.getByRole("button", { name: "Add a task", exact: true }),
  ).toBeVisible();
  expect(
    (await savedPlan(page)).items.find((item) => item.id === note.id).quizScore,
  ).toBe(5);
});

test("due reviews advance once; revision practice changes no saved item", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  const { user } = await createPlan(page);
  const fixture = await page.request.post(API + "/__test/scenario", {
    data: { user, complete: true },
  });
  expect(fixture.ok()).toBe(true);
  await page.goto("/my-plan/study?tab=reviews");
  await page.getByRole("button", { name: "Review", exact: true }).click();
  await page.getByRole("button", { name: "Needs practice" }).click();
  await expect(
    page.getByText("No reviews are due.", { exact: true }),
  ).toBeVisible();
  await expect(page.getByText(/Review saved/)).toBeVisible();
  const before = await savedPlan(page);
  await page.getByRole('button', { name: 'Practice this problem' }).click();
  await page.getByRole('button', { name: 'Next practice item' }).click();
  expect((await savedPlan(page)).items).toEqual(before.items);
  await page.getByRole("button", { name: "Plan", exact: true }).click();
  await page.screenshot({ path: "../.tmp/plan-desktop.png", fullPage: true });
  await page.getByRole("button", { name: "Preview revision round" }).click();
  await expect(page.getByRole("dialog")).toContainText("practice only");
  await page.getByRole("button", { name: "Start revision round" }).click();
  await expect(page.getByRole("region", { name: "Study task" })).toContainText(
    "Practice only",
  );
  await page.getByRole("button", { name: "Next practice item" }).click();
  await expect(
    page.getByRole("heading", { name: "Practice round complete" }),
  ).toBeVisible();
  expect((await savedPlan(page)).items).toEqual(before.items);
  await assertFits(page);
});

test("replaced and expired plans are readable; clearing history keeps an active plan", async ({
  page,
}) => {
  const { body, plan } = await createPlan(page);
  const replacement = await page.request.post(API + "/api/plan", {
    data: { ...body, replace: true },
  });
  expect(replacement.status()).toBe(201);
  await page.goto("/my-plan/study?tab=history");
  await page.getByRole("button", { name: "Read saved plan" }).click();
  await expect(page.getByText(/Saved snapshot/)).toBeVisible();
  await expect(
    page.getByRole("region", { name: "Plan history" }).getByRole("checkbox"),
  ).toHaveCount(0);
  await page.getByRole("button", { name: "Back to history" }).click();
  await page
    .getByRole("button", { name: "Delete plan history", exact: true })
    .click();
  await page.getByRole("button", { name: "Confirm delete history" }).click();
  await expect(page.getByText(/No older plans yet/)).toBeVisible();
  expect((await savedPlan(page)).id).not.toBe(plan.id);
  await page.getByRole("button", { name: "Plan", exact: true }).click();
  await page
    .getByRole("button", { name: "Delete current plan", exact: true })
    .click();
  await page.getByRole("button", { name: "Confirm delete plan" }).click();
  await expect(page.getByText(/You have no current plan/)).toBeVisible();
});

test("expired plans expose no task edits and history errors can be retried", async ({
  page,
}) => {
  const { user } = await createPlan(page);
  await page.request.post(API + "/__test/scenario", {
    data: { user, expired: true },
  });
  await page.goto("/my-plan/study");
  await expect(page.getByText(/This plan has finished/)).toBeVisible();
  await expect(page.getByRole("checkbox")).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Add a task" })).toHaveCount(0);
  await page.getByRole('button', { name: 'Today', exact: true }).click();
  const today = page.getByRole('region', { name: 'Today', exact: true });
  await expect(today.getByRole('button')).toHaveCount(1);
  await expect(today.getByRole('button', { name: 'Start', exact: true })).toBeDisabled();
  await page.route("**/api/plan/history", (route) =>
    route.fulfill({ status: 503, json: { message: "History unavailable" } }),
  );
  await page.getByRole("button", { name: "History", exact: true }).click();
  await expect(page.getByRole("alert")).toContainText("History unavailable");
  await page.unroute("**/api/plan/history");
  await page.getByRole("button", { name: "Retry history" }).click();
  await expect(
    page.getByRole("button", { name: "Read saved plan" }),
  ).toBeVisible();
});
