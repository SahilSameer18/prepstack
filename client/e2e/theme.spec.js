import { test, expect } from "@playwright/test";

const theme = (page) => page.evaluate(() => document.documentElement.getAttribute("data-theme"));

test("the theme follows the system, switches with the navbar button and is remembered", async ({ browser }) => {
  const context = await browser.newContext({ colorScheme: "dark" });
  const page = await context.newPage();
  await page.goto("/");
  expect(await theme(page)).toBe("dark");

  await page.getByRole("button", { name: "Switch to light theme" }).click();
  await expect.poll(() => theme(page)).toBe("light");
  expect(await page.evaluate(() => localStorage.getItem("prepstack-theme"))).toBe("light");
  expect(await page.evaluate(() => getComputedStyle(document.body).backgroundColor)).not.toBe("rgb(6, 6, 8)");

  await page.reload();
  expect(await theme(page)).toBe("light"); // set before the first paint, no flash of the dark theme
  await expect(page.getByRole("button", { name: "Switch to dark theme" })).toBeVisible();
  await context.close();
});

test("the theme button fits the phone navbar and the page does not scroll sideways", async ({ browser }) => {
  const context = await browser.newContext({ colorScheme: "light", viewport: { width: 375, height: 800 } });
  const page = await context.newPage();
  await page.goto("/");
  const button = page.getByRole("button", { name: "Switch to dark theme" });
  await expect(button).toBeVisible();
  const hero = page.getByRole('link', { name: 'Build my study plan', exact: true }).first();
  await expect(hero).toBeInViewport();
  const target = await button.boundingBox();
  expect(target.width).toBeGreaterThanOrEqual(44);
  expect(target.height).toBeGreaterThanOrEqual(44);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true);
  await button.click();
  await expect.poll(() => theme(page)).toBe("dark");
  await context.close();
});

for (const colorScheme of ['light', 'dark']) {
  test(`homepage descriptions stay readable on tablets in ${colorScheme} mode`, async ({ browser }) => {
    const context = await browser.newContext({ colorScheme, reducedMotion: 'reduce' });
    const page = await context.newPage();
    await page.goto('/');
    const row = page.getByRole('link', { name: /^DSA sheets Blind 75/ });
    const description = row.getByText('Blind 75, NeetCode 150, Striver and more, with your progress saved.', { exact: true });
    for (const width of [640, 768, 1024, 1280]) {
      await page.setViewportSize({ width, height: 900 });
      expect((await description.boundingBox()).width).toBeGreaterThan(200);
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    }
    await context.close();
  });
}
