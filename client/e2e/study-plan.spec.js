import { test, expect } from "@playwright/test";

const API = "http://localhost:3100";

test('Phase 1: oversized public previews explain the limit before login or save', async ({page}) => {
  await page.setViewportSize({width:375,height:812});
  const privateCalls = [];
  page.on('request',request=>{if(request.url().includes('/preview/personal'))privateCalls.push(request.url());});
  await page.goto('/my-plan?goalType=placements&sheetSlug=striver-a2z&weeks=52&weekdayHours=3&weekendHours=3&restDay=none&subjects=os,dbms,cn,oops');
  await expect(page.getByRole('alert').filter({hasText:'the most is 600'})).toBeVisible();
  await expect(page.getByRole('button',{name:'Generate my plan'})).toBeDisabled();
  await expect(page.getByRole('link',{name:'Sign in to check your saved progress'})).toBeVisible();
  expect(privateCalls).toEqual([]);
  await assertFits(page);
  await page.screenshot({path:'../.tmp/phase1-limit-phone.png',fullPage:true});
});

test('Phase 1: personal previews include progress and new role tasks have practical objectives', async ({page}) => {
  const {plan} = await createPlan(page,{subjects:[]});
  const first = plan.items.find(item=>item.type==='dsa'&&!item.part);
  expect((await page.request.post(API+'/api/plan/items/'+first.id+'/result',{data:{result:'alone'}})).status()).toBe(200);
  expect((await page.request.delete(API+'/api/plan')).status()).toBe(200);
  const personal = page.waitForResponse(response=>response.url().endsWith('/api/plan/preview/personal')&&response.ok());
  await page.goto('/my-plan?sheetSlug=blind-75&subjects=&weeks=4');
  const response = await personal;
  expect(response.headers()['cache-control']).toContain('no-store');
  expect((await response.json()).data.coverage.alreadySolved).toBeGreaterThan(0);
  await expect(page.getByText('This preview includes your saved sheet progress',{exact:false})).toBeVisible();
  await page.goto('/my-plan?goalType=role&roadmapSlug=frontend&weeks=12&weekdayHours=1&weekendHours=3&restDay=6&style=mixed');
  await expect(page.getByText('How do you like to study?')).toHaveCount(0);
  await expect(page.getByRole('button',{name:'Generate my plan'})).toBeEnabled();
  await page.getByRole('button',{name:'Generate my plan'}).click();
  await expect(page.getByRole('heading',{name:'Your saved plan'})).toBeVisible();
  await page.getByRole('region',{name:'Saved plan',exact:true}).getByRole('link',{name:'Open daily plan',exact:true}).click();
  await expect(page.getByRole('region',{name:'Today',exact:true}).getByRole('button')).toHaveCount(1);
  await page.getByRole('button',{name:/^Start/}).click();
  const task = page.getByRole('region',{name:'Study task'});
  await expect(task.getByRole('heading')).toContainText('Learn:');
  await expect(task).toContainText('After this step');
  await assertFits(page);
  await page.screenshot({path:'../.tmp/phase1-milestone-desktop.png',fullPage:true});
  await page.setViewportSize({width:375,height:812});
  await assertFits(page);
  await page.screenshot({path:'../.tmp/phase1-milestone-phone.png',fullPage:true});
});

test.beforeEach(async ({ page }) => {
  await page.request.post(API + '/__test/clock', { data: {} });
});

test('Recovery phase 2: personal clock, a two-week pause and returning from a sprint', async ({ page }) => {
  await page.request.post(API + '/__test/clock', { data: { now: '2026-11-16T19:00:00Z' } });
  const { plan, body } = await createPlan(page);
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto('/my-plan/study?tab=plan');
  await page.getByRole('button', { name: 'Study day settings', exact: true }).click();
  const dialog = page.getByRole('dialog');
  await dialog.getByLabel('Study day starts at', { exact: false }).fill('4');
  await dialog.getByRole('button', { name: 'Preview change' }).click();
  await expect(dialog).toContainText('Study day changes from 2026-11-17 to 2026-11-16');
  await assertFits(page);
  await dialog.getByRole('button', { name: 'Confirm change' }).click();
  await expect(dialog).toHaveCount(0);
  const state = await page.request.get(API + '/api/plan');
  expect((await state.json()).data.calendar.today).toBe('2026-11-16');
  await page.goto('/my-plan');
  await expect(page.getByLabel('Start date', { exact: true })).toHaveValue('2026-11-16');
  await page.goto('/my-plan/study?tab=plan');
  await page.getByRole('button', { name: 'Pause plan', exact: true }).click();
  await dialog.getByRole('button', { name: 'Preview change' }).click();
  expect((await savedPlan(page)).id).toBe(plan.id);
  await page.screenshot({ path: '../.tmp/recovery-mobile.png', fullPage: true });
  await dialog.getByRole('button', { name: 'Confirm change' }).click();
  await expect(dialog).toHaveCount(0);
  expect(await savedPlan(page)).toBeNull();
  await expect(page.getByRole('button', { name: 'Resume plan', exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Read paused plan', exact: true }).click();
  await dialog.getByRole('button', { name: 'Load saved snapshot' }).click();
  await expect(dialog).toContainText('Paused snapshot');
  await expect(dialog.getByRole('checkbox')).toHaveCount(0);
  await page.keyboard.press('Escape');
  await page.request.post(API + '/__test/clock', { data: { now: '2026-11-30T19:00:00Z' } });
  const sprint = await page.request.post(API + '/api/plan', { data: { ...body, weeks: 1, title: 'Frontend sprint' } });
  expect(sprint.status()).toBe(201);
  const sprintId = (await sprint.json()).data.plan.id;
  await page.reload();
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.getByRole('button', { name: 'Resume plan', exact: true }).click();
  await dialog.getByRole('button', { name: 'Preview change' }).click();
  await expect(dialog).toContainText('after 14 days away');
  await expect(dialog).toContainText('Frontend sprint');
  await expect(dialog).toContainText('read-only History');
  await assertFits(page);
  await page.screenshot({ path: '../.tmp/recovery-desktop.png', fullPage: true });
  await dialog.getByRole('button', { name: 'Confirm change' }).click();
  await expect(dialog).toHaveCount(0);
  expect((await savedPlan(page)).id).toBe(plan.id);
  const history = await page.request.get(API + '/api/plan/history');
  expect((await history.json()).data.plans.some((entry) => entry.id === sprintId)).toBe(true);
  await page.getByRole('button', { name: 'Today', exact: true }).click();
  await expect(page.getByRole('region', { name: 'Today', exact: true }).getByRole('button')).toHaveCount(1);
});

test('Recovery phase 2: review catch-up requires confirmation and handles a rejected save', async ({ page }) => {
  const { user } = await createPlan(page);
  await page.request.post(API + '/__test/scenario', { data: { user, complete: true } });
  await page.goto('/my-plan/study?tab=plan');
  await page.getByRole('button', { name: 'Spread due reviews', exact: true }).click();
  const dialog = page.getByRole('dialog');
  await dialog.getByLabel('Spread reviews over calendar days', { exact: false }).fill('7');
  await dialog.getByRole('button', { name: 'Preview change' }).click();
  await expect(dialog).toContainText('Spread 1 due reviews');
  await page.route('**/api/plan/lifecycle/apply', (route) => route.fulfill({ status: 503, json: { message: 'Recovery temporarily unavailable' } }));
  await dialog.getByRole('button', { name: 'Confirm change' }).click();
  await expect(dialog.getByRole('alert')).toContainText('Recovery temporarily unavailable');
  await page.unroute('**/api/plan/lifecycle/apply');
  await dialog.getByRole('button', { name: 'Preview change' }).click();
  await dialog.getByRole('button', { name: 'Confirm change' }).click();
  await expect(dialog).toHaveCount(0);
  expect((await savedPlan(page)).items[0].reviewStage).toBe(0);
});

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

test('Learning phase 2: optional check, confirmed practice and self-report on desktop and phone', async ({ page }) => {
  const { plan } = await createPlan(page);
  await page.goto('/my-plan/study?tab=plan');
  const learning = page.getByRole('region', { name: 'Learning checks', exact: true });
  await learning.getByText('Optional starting check', { exact: true }).click();
  await learning.getByRole('button', { name: 'I would like practice', exact: true }).click();
  await expect(learning.getByText('Practise the foundations', { exact: false })).toBeVisible();
  const before = await savedPlan(page);
  expect(before.items).toEqual(plan.items);
  await learning.getByRole('button', { name: 'Preview schedule change', exact: true }).click();
  const dialog = page.getByRole('dialog', { name: 'Review learning change' });
  await expect(dialog).toContainText('completed parts are protected');
  expect((await savedPlan(page)).items).toEqual(before.items);
  await assertFits(page);
  await dialog.getByRole('button', { name: 'Apply learning change', exact: true }).click();
  await expect(dialog).toHaveCount(0);
  const applied = await savedPlan(page);
  const practice = applied.items.find((item) => item.learningKind === 'foundation');
  expect(practice).toBeTruthy();
  await page.goto(`/my-plan/study?tab=plan&item=${practice.id}`);
  const task = page.getByRole('region', { name: 'Study task' });
  const save = task.getByRole('button', { name: 'Save practice assessment' });
  await expect(save).toBeDisabled();
  await task.getByRole('button', { name: 'Seen before', exact: true }).click();
  await task.getByLabel('I implemented or demonstrated it independently').check();
  await task.getByLabel('I explained my approach and trade-offs').check();
  await task.getByLabel('I checked ordinary inputs and edge cases').check();
  await task.getByRole('button', { name: 'About right', exact: true }).click();
  await assertFits(page);
  await page.screenshot({ path: '../.tmp/phase2-learning-desktop.png', fullPage: true });
  await page.setViewportSize({ width: 375, height: 812 });
  await assertFits(page);
  await page.screenshot({ path: '../.tmp/phase2-learning-phone.png', fullPage: true });
  // Wait for the actual theme transition, not an arbitrary delay that can
  // capture its viewport-sized snapshot stretched by a full-page screenshot.
  await page.evaluate(() => {
    const start = document.startViewTransition?.bind(document);
    if (!start) return;
    document.startViewTransition = (update) => {
      const transition = start(update);
      window.__testThemeFinished = transition.finished;
      return transition;
    };
  });
  await page.getByRole('button', { name: 'Switch to dark theme' }).click();
  await page.evaluate(() => window.__testThemeFinished);
  await assertFits(page);
  await page.screenshot({ path: '../.tmp/phase2-learning-phone-dark.png', fullPage: true });
  await save.click();
  await expect(task).toHaveCount(0);
  expect((await savedPlan(page)).items.find((item) => item.id === practice.id).doneAt).toBeTruthy();
  await page.goto('/my-plan/study?tab=today');
  await expect(page.getByRole('region', { name: 'Today', exact: true }).getByRole('button')).toHaveCount(1);
});

test('Learning phase 2: optional quiz leaves completion and review dates unchanged', async ({ page }) => {
  const { plan } = await createPlan(page);
  await page.goto('/my-plan/study?tab=plan');
  const learning = page.getByRole('region', { name: 'Learning checks', exact: true });
  await learning.getByText('Optional starting check', { exact: true }).click();
  await learning.getByRole('button', { name: 'Try a section quiz without changing progress' }).click();
  const save = page.getByRole('button', { name: 'Finish starting quiz' });
  await expect(save).toBeDisabled();
  const note = plan.items.find((item) => item.type === 'notes');
  const response = await page.request.get(API + '/api/notes/os');
  const section = (await response.json()).data.sections.find((item) => item.id === note.ref.split(':')[2]);
  for (const question of section.quiz) {
    await page.getByRole('button', { name: question.options[question.answer], exact: false }).click();
  }
  await save.click();
  await expect(page.getByRole('region', { name: 'Study task' })).toHaveCount(0);
  expect((await savedPlan(page)).items).toEqual(plan.items);
});

test('Learning phase 2: keyboard cancel and a stale preview preserve the saved plan', async ({ page }) => {
  await createPlan(page);
  await page.goto('/my-plan/study?tab=plan');
  const learning = page.getByRole('region', { name: 'Learning checks', exact: true });
  await learning.getByText('Optional starting check', { exact: true }).click();
  await learning.getByRole('button', { name: 'I would like practice', exact: true }).click();
  const previewButton = learning.getByRole('button', { name: 'Preview schedule change' });
  await previewButton.click();
  await expect(page.getByRole('dialog')).toBeVisible();
  await expect(page.getByRole('dialog').getByRole('button', { name: 'Cancel', exact: true })).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await expect(previewButton).toBeFocused();
  await previewButton.click();
  await page.request.post(API + '/api/plan/learning/check', { data: { id: 'foundation', outcome: 'independent' } });
  const before = await savedPlan(page);
  await page.getByRole('button', { name: 'Apply learning change' }).click();
  await expect(page.getByRole('dialog').getByRole('alert')).toContainText(/no longer available|changed/);
  expect((await savedPlan(page)).items).toEqual(before.items);
});

test('Learning phase 2: practical role work records assistance without declaring a weak topic after one task', async ({ page }) => {
  const { plan } = await createPlan(page, { goalType: 'role', roadmapSlug: 'frontend', weeks: 12, weekdayHours: 1, weekendHours: 3 });
  const practice = plan.items.find((item) => item.type === 'roadmap' && item.activity === 'practice' && !item.part);
  expect(practice).toBeTruthy();
  await page.goto(`/my-plan/study?tab=plan&item=${practice.id}`);
  await page.getByRole('button', { name: 'Completed with help', exact: true }).click();
  await expect(page.getByRole('region', { name: 'Study task' })).toHaveCount(0);
  expect((await savedPlan(page)).items.find((item) => item.id === practice.id).doneAt).toBeTruthy();
  const learning = await page.request.get(API + '/api/plan/learning');
  const result = (await learning.json()).data;
  expect(result.attempts).toBe(1);
  expect(result.offers.some((offer) => offer.kind === 'repair')).toBe(false);
});

test('Learning recovery: re-added practice moves and completes without changing skipped history', async ({ page }) => {
  await createPlan(page);
  expect((await page.request.post(API + '/api/plan/learning/check', { data: { id: 'foundation', outcome: 'help' } })).ok()).toBe(true);
  async function addPractice() {
    const preview = await page.request.post(API + '/api/plan/learning/preview', { data: { offerId: 'foundation' } });
    expect(preview.ok()).toBe(true);
    const { checksum } = (await preview.json()).data;
    expect((await page.request.post(API + '/api/plan/learning/apply', { data: { offerId: 'foundation', checksum } })).ok()).toBe(true);
    return (await savedPlan(page)).items.find(item => item.learningKind === 'foundation' && !item.skipped);
  }
  const previous = await addPractice();
  expect((await page.request.post(API + `/api/plan/items/${previous.id}/skip`, { data: {} })).ok()).toBe(true);
  const fresh = await addPractice();
  expect(fresh.key).not.toBe(previous.key);
  const nextDay = new Date(fresh.day + 'T12:00:00Z');
  nextDay.setUTCDate(nextDay.getUTCDate() + 1);
  expect((await page.request.patch(API + `/api/plan/items/${fresh.id}`, { data: { day: nextDay.toISOString().slice(0, 10) } })).ok()).toBe(true);
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto(`/my-plan/study?tab=plan&item=${fresh.id}`);
  await page.getByRole('button', { name: 'New to me', exact: true }).click();
  await page.getByRole('button', { name: 'Save practice assessment', exact: true }).click();
  await expect(page.getByRole('region', { name: 'Study task' })).toHaveCount(0);
  const saved = await savedPlan(page);
  expect(saved.items.find(item => item.id === previous.id).skipped).toBe(true);
  expect(saved.items.find(item => item.id === fresh.id).doneAt).toBeTruthy();
  expect(new Set(saved.items.map(item => item.key)).size).toBe(saved.items.length);
  await assertFits(page);
});

test('the schedule comes before settings and adjustments on a phone', async ({ page }) => {
  await createPlan(page);
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto('/my-plan/study?tab=plan');
  const week = page.getByRole('region', { name: 'Plan', exact: true }).locator('details > summary').first();
  await expect(week).toBeVisible();
  const firstWeek = await week.boundingBox();
  for (const name of ['Change hours', 'Study day settings', 'Pause plan']) {
    const action = await page.getByRole('button', { name, exact: true }).boundingBox();
    expect(firstWeek.y).toBeLessThan(action.y);
  }
});

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

test('Recovery phase 1: extend the deadline and complete a distinct substitute', async ({ page }) => {
  const { plan } = await createPlan(page);
  await page.goto('/my-plan/study?tab=plan');
  await page.getByRole('button', { name: 'Rebuild from today' }).click();
  const dialog = page.getByRole('dialog');
  const deadline = new Date(plan.deadline + 'T00:00:00Z');
  deadline.setUTCDate(deadline.getUTCDate() + 14);
  await dialog.getByLabel('Deadline (keep it or choose a later date)').fill(deadline.toISOString().slice(0, 10));
  await dialog.getByRole('button', { name: 'Preview change' }).click();
  await expect(dialog).toContainText('Plan deadline:');
  expect((await savedPlan(page)).deadline).toBe(plan.deadline);
  await dialog.getByRole('button', { name: 'Confirm change' }).click();
  await expect(dialog).toHaveCount(0);
  expect((await savedPlan(page)).deadline).toBe(deadline.toISOString().slice(0, 10));
  const current = await savedPlan(page);
  const original = current.items.find((item) => item.type === 'dsa' && item.title === 'Two Sum');
  await page.getByRole('button', { name: /^Options: Two Sum/ }).first().click();
  await dialog.getByRole('button', { name: 'Find a different problem' }).click();
  await dialog.getByRole('radio').first().check();
  await dialog.getByRole('button', { name: 'Confirm different problem' }).click();
  await expect(dialog).toHaveCount(0);
  const replacement = (await savedPlan(page)).items.find((item) => item.replacesKey === original.key);
  expect(replacement).toBeTruthy();
  await page.goto('/my-plan/study?tab=plan&item=' + replacement.id);
  await page.getByRole('button', { name: 'Solved alone', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Add a task', exact: true })).toBeVisible();
  const after = await savedPlan(page);
  expect(after.items.find((item) => item.id === replacement.id).doneAt).toBeTruthy();
  expect(after.items.find((item) => item.id === original.id)).toMatchObject({ skipped: true, doneAt: null });
});

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
  const studyTabs = page.getByRole('navigation', { name: 'Study plan tabs' });
  for (const row of [tabs, studyTabs]) {
    expect(await row.evaluate((element) => element.scrollWidth <= element.clientWidth)).toBe(true);
  }
  await assertFits(page);
  await page.screenshot({ path: '../.tmp/phase7-mobile.png', fullPage: true });
  await start.click();
  await page.getByRole('button', { name: 'Solved alone', exact: true }).click();
  await expect(page).toHaveURL(/tab=plan&view=today/);
  await expect(today).toBeVisible();
  await tabs.getByRole('tab', { name: /^DSA/ }).click();
  await expect(page.getByRole('heading', { name: 'DSA progress' })).toBeVisible();
  await expect(today).toHaveCount(0);
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
  await expect(page.getByRole('link', { name: 'Open My plan', exact: true })).toBeVisible();
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

test('Reports opens directly to saved reports and the source report can still add tasks to My plan', async ({ page }) => {
  const { user } = await createPlan(page);
  await page.request.delete(API + '/api/plan');
  const report = await createReport(page, user);
  await page.goto('/dashboard?tab=reports');
  const tabs = page.getByRole('tablist', { name: 'Dashboard sections' });
  await expect(tabs.getByRole('tab').first()).toHaveText(/^DSA/);
  const panel = page.getByRole('tabpanel');
  await expect(panel.getByRole('heading', { name: 'Role reports' })).toBeVisible();
  await expect(panel.getByRole('link', { name: 'New report' })).toBeVisible();
  await expect(page.getByRole('region', { name: 'Overview' })).toHaveCount(0);
  await expect(page.getByRole('region', { name: "Today's study plan" })).toHaveCount(0);
  await expect(panel.getByRole('link', { name: /Frontend role connection/ })).toHaveAttribute('href', '/analyzer/' + report);
  await tabs.getByRole('tab', { name: /My plan/ }).click();
  await expect(page.getByRole('link', { name: 'Build my plan' })).toBeVisible();
  await tabs.getByRole('tab', { name: /^Reports/ }).click();
  await panel.getByRole('link', { name: /Frontend role connection/ }).click();
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
  await expect(page.getByRole("link", { name: "Build my plan", exact: true })).toBeVisible();
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

test('Coverage: a tight plan names what is not in it, and the pace choice changes the Medium time', async ({ page }) => {
  await page.goto('/my-plan?goalType=placements&weeks=2&weekdayHours=1&weekendHours=1&restDay=none&style=one-topic&sheetSlug=striver-a2z&subjects=os,dbms,cn');
  await expect(page.getByText('Planned at a standard pace: a Medium problem takes about 70 min.')).toBeVisible();
  await expect(page.getByText('Not in your plan:')).toBeVisible();
  await expect(page.getByText(/Only some of:/)).toBeVisible();
  await expect(page.getByTestId('finish-all')).toContainText(/At these hours, the whole syllabus (would be done by|would take more than)/);
  // the first week reads in plain words: a weekday and date, and the day's total
  await expect(page.getByText(/^\w{3}, \d{1,2} \w{3}$/).first()).toBeVisible();
  await expect(page.getByText(/^\d+ tasks? · /).first()).toBeVisible();
  await page.getByRole('combobox', { name: 'How fast do you solve problems?' }).click();
  await page.getByRole('option', { name: /^Slower/ }).click();
  await expect(page).toHaveURL(/pace=slower/);
  await expect(page.getByText('Planned at a slower pace: a Medium problem takes about 98 min.')).toBeVisible();
  await assertFits(page);
});

test('Coverage and pace on a saved plan: week summaries, the not-included list, and a pace change that needs a preview', async ({ page }) => {
  const { plan } = await createPlan(page, { weeks: 2, weekdayHours: 1, weekendHours: 1, sheetSlug: 'striver-a2z', subjects: ['os', 'dbms', 'cn'] });
  expect(plan.pace).toBe('standard');
  expect(plan.coverage.byGroup.some((group) => group.state === 'none')).toBe(true);
  await page.goto('/my-plan/study?tab=plan');
  await expect(page.getByText(/Standard pace \(a Medium problem takes about 70 min\)/)).toBeVisible();
  await expect(page.getByText(/\d+ syllabus items did not fit\./)).toBeVisible();
  await page.getByText('See what is not in your plan').click();
  await expect(page.getByText('Not in your plan:')).toBeVisible();
  await expect(page.locator('summary', { hasText: /^Week 1/ })).toContainText(/\d+ h|\d+ min/);
  await page.getByRole('button', { name: 'Change pace' }).click();
  const dialog = page.getByRole('dialog');
  await dialog.getByLabel('How fast do you solve problems?').selectOption('slower');
  await dialog.getByRole('button', { name: 'Preview change' }).click();
  await expect(dialog).toContainText('syllabus items will not fit');
  await expect(dialog).toContainText('Not in your plan:');
  expect((await savedPlan(page)).pace).toBe('standard');
  await dialog.getByRole('button', { name: 'Confirm change' }).click();
  await expect(dialog).toHaveCount(0);
  expect((await savedPlan(page)).pace).toBe('slower');
  await expect(page.getByText(/Slower pace \(a Medium problem takes about 98 min\)/)).toBeVisible();
  await assertFits(page);
});

test('The Today screen stays small after the coverage changes: date, count, time, one Start button', async ({ page }) => {
  await createPlan(page, { weeks: 2, weekdayHours: 1, weekendHours: 1, sheetSlug: 'striver-a2z', subjects: ['os', 'dbms', 'cn'] });
  await page.goto('/my-plan/study?tab=today');
  await expect(page.getByRole('button', { name: 'Start', exact: true })).toHaveCount(1);
  await expect(page.getByText(/Not in your plan|Only some of|Change pace|Pace:/)).toHaveCount(0);
});

test('Coverage screens fit a phone: the builder preview, the Plan tab and the pace dialog', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 800 });
  await page.goto('/my-plan?goalType=placements&weeks=2&weekdayHours=1&weekendHours=1&restDay=none&style=one-topic&sheetSlug=striver-a2z&subjects=os,dbms,cn');
  await expect(page.getByText('Not in your plan:')).toBeVisible();
  await assertFits(page);
  await createPlan(page, { weeks: 2, weekdayHours: 1, weekendHours: 1, sheetSlug: 'striver-a2z', subjects: ['os', 'dbms', 'cn'] });
  await page.goto('/my-plan/study?tab=plan');
  await page.getByText('See what is not in your plan').click();
  await assertFits(page);
  await page.getByRole('button', { name: 'Change pace' }).click();
  await assertFits(page);
  await expect(page.getByRole('dialog')).toBeVisible();
});

test('The builder will not generate a plan when no task fits, and says why', async ({ page }) => {
  await page.goto('/my-plan?goalType=bigtech&weeks=1&weekdayHours=0&weekendHours=0.5&restDay=6&style=one-topic&sheetSlug=neetcode-150&subjects=');
  await expect(page.getByText('No task fits these days and hours.')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Generate my plan' })).toBeDisabled();
  await page.goto('/my-plan?goalType=bigtech&weeks=4&weekdayHours=2&weekendHours=3&restDay=6&style=one-topic&sheetSlug=neetcode-150&subjects=');
  await expect(page.getByText('No task fits these days and hours.')).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'Generate my plan' })).toBeEnabled();
});

test('Realistic recovery: partial work, missed days, a five-day pause and a longer deadline', async ({ page }) => {
  const clock = (now) => page.request.post(API + '/__test/clock', { data: { now } });
  await clock('2026-11-16T07:00:00Z');
  const { plan } = await createPlan(page, { weekdayHours: 0.5, weekendHours: 1, restDay: 6, subjects: [] });
  const first = plan.items.find((item) => item.title === 'Two Sum' && item.part?.n === 1);
  expect(first).toBeTruthy();
  await page.goto('/my-plan/study?tab=plan&item=' + first.id);
  await page.getByRole('button', { name: 'Solved alone', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Add a task', exact: true })).toBeVisible();
  const doneAt = (await savedPlan(page)).items.find((item) => item.id === first.id).doneAt;
  expect(doneAt).toBeTruthy();
  await clock('2026-11-24T07:00:00Z');
  await page.goto('/my-plan/study?tab=today');
  const today = page.getByRole('region', { name: 'Today', exact: true });
  await expect(today.getByRole('button')).toHaveCount(1);
  const read = await page.request.get(API + '/api/plan');
  expect((await read.json()).data.today.minutes).toBeLessThanOrEqual(30);
  await page.getByRole('button', { name: 'Plan', exact: true }).click();
  await expect(page.getByText(/overdue tasks remain/)).toBeVisible();
  const dialog = page.getByRole('dialog');
  await page.getByRole('button', { name: 'Pause plan', exact: true }).click();
  await dialog.getByRole('button', { name: 'Preview change' }).click();
  await dialog.getByRole('button', { name: 'Confirm change' }).click();
  await expect(dialog).toHaveCount(0);
  await clock('2026-11-29T07:00:00Z');
  await page.reload();
  await page.getByRole('button', { name: 'Resume plan', exact: true }).click();
  await dialog.getByRole('button', { name: 'Preview change' }).click();
  await expect(dialog).toContainText('after 5 days away');
  await dialog.getByRole('button', { name: 'Confirm change' }).click();
  await expect(dialog).toHaveCount(0);
  const resumed = await savedPlan(page);
  expect(resumed.items.filter((item) => !item.doneAt && !item.skipped)
    .every((item) => new Date(item.day + 'T00:00:00Z').getUTCDay() !== 0)).toBe(true);
  const deadline = new Date(resumed.deadline + 'T00:00:00Z');
  deadline.setUTCDate(deadline.getUTCDate() + 7);
  const newDeadline = deadline.toISOString().slice(0, 10);
  await page.getByRole('button', { name: 'Rebuild from today', exact: true }).click();
  await dialog.getByLabel('Deadline (keep it or choose a later date)').fill(newDeadline);
  await dialog.getByRole('button', { name: 'Preview change' }).click();
  await dialog.getByRole('button', { name: 'Confirm change' }).click();
  await expect(dialog).toHaveCount(0);
  const rebuilt = await savedPlan(page);
  expect(rebuilt.deadline).toBe(newDeadline);
  expect(rebuilt.items.find((item) => item.id === first.id)).toMatchObject({ doneAt, nextReviewDay: null });
  expect(rebuilt.items.filter((item) => item.link === first.link && !item.doneAt)
    .reduce((minutes, item) => minutes + item.plannedMinutes, 0)).toBe(19);
});
