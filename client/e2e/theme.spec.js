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
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true);
  await button.click();
  await expect.poll(() => theme(page)).toBe("dark");
  await context.close();
});
