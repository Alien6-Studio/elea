import { expect, test } from "@playwright/test";

test("the header searches documentation while typing and opens the exact heading", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", error => errors.push(error.message));
  await page.goto("/");
  const search = page.getByRole("search", { name: "Site", exact: true });
  const input = search.getByRole("combobox", { name: "Search the site" });
  await input.fill("Tailwind and shadcn");
  const result = search.getByRole("option", { name: /Tailwind and shadcn/ });
  await expect(result).toHaveAttribute("href", "/components/#tailwind-and-shadcnui");
  await expect(input).toBeFocused();
  await expect(result).toHaveAttribute("aria-selected", "true");
  await input.press("Enter");
  await expect(page).toHaveURL(/\/components\/#tailwind-and-shadcnui$/);
  await expect(page.getByRole("heading", { name: "Tailwind and shadcn/ui" })).toBeVisible();
  expect(errors).toEqual([]);
});

test("keyboard search, clearing and dismissal preserve the field and the shared theme", async ({ page }) => {
  await page.goto("/playground/#/ui?scheme=braise");
  const search = page.getByRole("search", { name: "Site", exact: true });
  const input = search.getByRole("combobox");
  await expect(input).toBeVisible();
  await page.keyboard.press("Control+k");
  await expect(input).toBeFocused();
  await input.fill("unmatchable-destination");
  await expect(search.getByRole("status")).toContainText("No results found");
  await search.getByRole("button", { name: "Clear search" }).click();
  await expect(input).toBeFocused();
  await expect(input).toHaveValue("");
  await input.fill("Sidebar");
  await input.press("Escape");
  await expect(search.getByRole("listbox")).toBeHidden();
  await expect(input).toHaveValue("Sidebar");
  await expect(input).toBeFocused();
  await input.press("ArrowDown");
  await expect(search.getByRole("option", { name: /Sidebar/ }).first()).toHaveAttribute("href", "/playground/#/ui/sidebar?scheme=braise");
  await input.press("Enter");
  await expect(page.getByRole("heading", { name: "Sidebar", level: 1 })).toBeVisible();
  await expect(page).toHaveURL(/#\/ui\/sidebar\?scheme=braise$/);
});

test("mobile inline search finds a palette without diacritics", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 800 });
  await page.goto("/typography/");
  const search = page.getByRole("search", { name: "Site", exact: true });
  const input = search.getByRole("combobox");
  await input.fill("reserve");
  const result = search.getByRole("option", { name: "Réserve Colours", exact: true });
  await expect(result).toBeVisible();
  await expect(page.getByRole("dialog")).toHaveCount(0);
  const [field, panel] = await Promise.all([input.boundingBox(), search.getByRole("listbox").boundingBox()]);
  expect(panel!.y).toBeGreaterThan(field!.y + field!.height);
  expect(panel!.x).toBeGreaterThanOrEqual(0);
  expect(panel!.x + panel!.width).toBeLessThanOrEqual(320);
  await result.click();
  await expect(page).toHaveURL(/#\/colours\?scheme=reserve$/);
});
