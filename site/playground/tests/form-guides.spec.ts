import { expect, test } from "@playwright/test";

const catalog = "/playground/#/ui";

for (const colorScheme of ["light", "dark"] as const) {
  test(`calendar selection crosses a leap day in ${colorScheme}`, async ({ page }) => {
    await page.emulateMedia({ colorScheme });
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(`${catalog}/calendar?edition=editorial`);
    const grid = page.getByRole("grid", { name: "Publication date" });
    await expect(grid.getByRole("button", { name: /19 February 2028/ })).toBeDisabled();
    const start = grid.getByRole("button", { name: /28 February 2028/ });
    await start.click();
    await start.press("ArrowRight");
    const leapDay = grid.getByRole("button", { name: /29 February 2028/ });
    await expect(leapDay).toBeFocused();
    await expect(page.getByText("2028-02-28", { exact: true })).toBeVisible();
    await leapDay.press("Enter");
    await expect(grid.getByRole("gridcell", { selected: true }).getByRole("button")).toHaveAccessibleName(/29 February 2028/);
    await leapDay.press("ArrowRight");
    await expect(grid.getByRole("button", { name: /, 1 March 2028$/ })).toBeFocused();
    await expect(page.getByRole("button", { name: "Next month" })).toBeDisabled();
    await page.getByRole("button", { name: "Clear date" }).click();
    await expect(grid.getByRole("gridcell", { selected: true })).toHaveCount(0);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  });

  test(`combobox filters while retaining the committed collection in ${colorScheme}`, async ({ page }) => {
    await page.emulateMedia({ colorScheme });
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(`${catalog}/combobox?edition=obsidian`);
    const input = page.getByRole("combobox", { name: "Collection" });
    await expect(input).toHaveValue("");
    await expect(input).toHaveAttribute("placeholder", "Search collections…");
    await input.fill("GLACIER");
    await expect(page.getByRole("option")).toHaveCount(2);
    await expect(page.getByRole("option", { name: "Glacier survey archive" })).toBeDisabled();
    await input.press("Enter");
    await expect(input).toHaveValue("Glacier notebooks");
    await expect(page.locator('input[type="hidden"][name="collection"]')).toHaveValue("ice");
    await input.fill("not found");
    await expect(page.getByText("No matching collections", { exact: true })).toBeVisible();
    await input.press("Escape");
    await expect(input).toBeFocused();
    await expect(input).toHaveValue("Glacier notebooks");
    await expect(input).toHaveAttribute("aria-expanded", "false");
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  });
}
