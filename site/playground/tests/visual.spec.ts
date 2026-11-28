import { expect, test, type Page } from "@playwright/test";

function stage(page: Page, title: string) {
  return page.locator(".demo").filter({ has: page.getByRole("heading", { name: title, exact: true }) }).locator(".demo__stage");
}

async function openGuide(page: Page, path: string, scheme: string, mode: "light" | "dark") {
  await page.emulateMedia({ colorScheme: mode });
  await page.goto("/playground/#/ui/" + path + "?scheme=" + scheme);
  await expect(page.locator("html")).toHaveAttribute("data-theme", mode);
  await expect(page.getByRole("combobox", { name: "Site theme", exact: true })).toHaveText(scheme === "reserve" ? "Réserve" : "Rasance");
  await page.evaluate(() => document.fonts.ready);
}

for (const [scheme, mode] of [["reserve", "light"], ["rasance", "dark"]] as const) {
  test(scheme + " action silhouettes in " + mode + " appearance", async ({ page }) => {
    await openGuide(page, "button", scheme, mode);
    await expect(stage(page, "Variants")).toHaveScreenshot("button-" + scheme + "-" + mode + ".png");
  });
}

test("phone field shows both keyboard focus and the validation error", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await openGuide(page, "field", "reserve", "dark");
  const field = stage(page, "A validated field");
  const email = field.getByRole("textbox", { name: /Email/ });
  await email.pressSequentially("incomplete");
  await expect(email).toBeFocused();
  await expect(email).toHaveAttribute("aria-invalid", "true");
  await expect(field.getByText("Enter a valid address")).toBeVisible();
  await expect(field).toHaveScreenshot("field-reserve-dark-phone.png");
});

test("phone stepper distinguishes completed, current and upcoming steps", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await openGuide(page, "stepper", "rasance", "light");
  const section = page.getByRole("navigation", { name: "Proof sections" });
  await expect(section.getByRole("button", { name: "Images", exact: true })).toHaveAttribute("aria-current", "step");
  await expect(section).toHaveScreenshot("stepper-rasance-light-phone.png");
});
