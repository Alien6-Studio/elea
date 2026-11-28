import { expect, test } from "@playwright/test";

test("territories can be filtered, grouped, removed and submitted with the keyboard", async ({ page, browserName }) => {
  await page.goto("/playground/#/ui/multi-select");
  const field = page.getByRole("combobox", { name: "Territories" });
  await field.click();
  const list = page.getByRole("listbox", { name: "Territories" });
  await expect(list).toHaveAttribute("aria-multiselectable", "true");
  await field.fill("Nor");
  await expect(list.getByRole("option")).toHaveCount(1);
  await field.press("Enter");
  await expect(field).toBeFocused();
  const group = page.getByRole("button", { name: "Select all Nordic territories" });
  // macOS Safari uses Option-Tab to include buttons with its default keyboard navigation settings.
  await field.press(browserName === "webkit" && process.platform === "darwin" ? "Alt+Tab" : "Tab");
  await expect(group).toBeFocused();
  await group.press("Enter");
  await expect(page.getByRole("button", { name: "Remove Denmark" })).toBeVisible();
  await expect(list.getByRole("option", { name: "Estonia" })).toBeDisabled();
  await field.press("Backspace");
  await expect(page.getByRole("button", { name: "Remove Denmark" })).toHaveCount(0);
  await expect(list.getByRole("option", { name: "Estonia" })).toBeEnabled();
  await field.press("Escape");
  await expect(list).toHaveCount(0);
  await expect(field).toBeFocused();
});

test("free tags wrap at phone sizes and can be removed through their named buttons", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 750 });
  await page.goto("/playground/#/ui/multi-select");
  const field = page.getByRole("combobox", { name: "Subjects" });
  const subject = "Underwater".repeat(8);
  await field.fill(subject);
  await page.getByRole("option", { name: `Add “${subject}”` }).click();
  const remove = page.getByRole("button", { name: `Remove ${subject}` });
  await expect(remove).toBeVisible();
  expect(await field.evaluate(element => element.closest(".elea-multi-select")!.scrollWidth <= element.closest(".elea-multi-select")!.clientWidth + 1)).toBe(true);
  await remove.click();
  await expect(remove).toHaveCount(0);
  await expect(field).toBeFocused();
});
