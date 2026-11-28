import { expect, test } from "@playwright/test";

test("the disclosure keeps focus and revealed ancestors navigate within the archive", async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 800 });
  await page.goto("/playground/#/ui/breadcrumb");
  const trail = page.getByRole("navigation", { name: "Archive location" });
  const disclosure = trail.getByRole("button", { name: "Earlier sections" });
  await disclosure.focus();
  await disclosure.press("Space");
  await expect(disclosure).toHaveAttribute("aria-expanded", "true");
  await expect(disclosure).toBeFocused();
  await disclosure.press("Tab");
  const parent = trail.getByRole("link", { name: "Periodicals" });
  await expect(parent).toBeFocused();
  await parent.press("Enter");
  await expect(trail.locator('[aria-current="page"]')).toHaveText("Periodicals");
  await page.getByRole("button", { name: "Return to proof" }).click();
  await expect(disclosure).toHaveAttribute("aria-expanded", "false");
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(360);
});
