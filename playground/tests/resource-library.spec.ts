import { expect, test, type Locator } from "@playwright/test";
import { textContrast } from "./contrast.js";

const library = "/elea/playground/#/design-lab/resource-library";
const tooltipGuide = "/elea/playground/#/ui/tooltip?edition=precision";

// Finish scrolling before focus because a scroll dismisses a tooltip.
async function focusInView(control: Locator) {
  await control.evaluate(async (element) => {
    element.scrollIntoView({ block: "center", behavior: "instant" });
    await new Promise<void>((resolve) => requestAnimationFrame(() => requestAnimationFrame(() => resolve())));
    (element as HTMLElement).focus({ preventScroll: true });
  });
}

test("resource treatments share a controlled list and filters", async ({ page }) => {
  await page.goto(library);
  const study = page.locator(".resource-study");
  const heading = study.getByRole("heading", { name: "Field library" });
  const results = study.locator(".resource-study__results");
  const treatment = study.getByRole("group", { name: "Treatment" });
  await expect(study.getByRole("status")).toHaveText("7 resources");
  const proposedSize = await heading.evaluate((element) => parseFloat(getComputedStyle(element).fontSize));
  const titles = await results.getByRole("heading").allTextContents();

  await treatment.getByRole("button", { name: "Current" }).press("Enter");
  await expect(treatment.getByRole("button", { name: "Current" })).toHaveAttribute("aria-pressed", "true");
  expect(await heading.evaluate((element) => parseFloat(getComputedStyle(element).fontSize))).toBeLessThan(proposedSize);
  expect(await results.getByRole("heading").allTextContents()).toEqual(titles);

  const pagination = study.getByRole("navigation", { name: "Resource pages" });
  await pagination.getByRole("button", { name: "Next" }).press("Enter");
  await expect(pagination.getByRole("button", { name: "Page 2" })).toHaveAttribute("aria-current", "page");
  await expect(results.getByRole("heading", { name: "Recording the snow line" })).toBeVisible();
  await treatment.getByRole("button", { name: "Proposal" }).press("Enter");
  await expect(pagination.getByRole("button", { name: "Page 2" })).toHaveAttribute("aria-current", "page");

  const search = study.getByRole("searchbox", { name: "Find a resource" });
  await search.fill("snow line");
  await expect(study.getByRole("status")).toHaveText("1 resource");
  await expect(results.getByRole("heading", { name: "Recording the snow line" })).toBeVisible();
  const category = study.getByRole("combobox", { name: "Resource type" });
  await category.press("ArrowDown");
  await page.getByRole("option", { name: "Reports" }).click();
  await expect(study.getByText("No matching resources.")).toBeVisible();
  await study.getByRole("button", { name: "Clear filters" }).press("Enter");
  await expect(study.getByRole("status")).toHaveText("7 resources");
  await expect(pagination.getByRole("button", { name: "Page 1" })).toHaveAttribute("aria-current", "page");
});

test("keyboard overlays and token overrides stay local to the narrow preview", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.emulateMedia({ colorScheme: "light", reducedMotion: "reduce" });
  await page.goto(tooltipGuide);
  const guideTrigger = page.getByRole("button", { name: "Save draft", exact: true });
  const hint = page.getByRole("tooltip");
  const palette = () => hint.evaluate((element) => {
    const style = getComputedStyle(element);
    return [style.backgroundColor, style.color, style.fontSize];
  });

  await focusInView(guideTrigger);
  await expect(hint).toHaveText("Saves a draft without publishing");
  const before = await palette();
  const guideLink = page.getByRole("link", { name: "Edit theme", exact: true });
  const siteAccent = () => guideLink.evaluate((element) => getComputedStyle(element).color);
  const beforeAccent = await siteAccent();
  await page.keyboard.press("Escape");
  await expect(hint).toHaveCount(0);
  await expect(guideTrigger).toBeFocused();

  await page.goto(library);
  const study = page.locator(".resource-study");
  const appearance = study.getByRole("combobox", { name: "Appearance" });
  await appearance.press("ArrowDown");
  await appearance.press("End");
  await appearance.press("Enter");
  await expect(study).toHaveAttribute("data-elea-appearance", "dark");
  await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
  expect(await textContrast(study.getByRole("heading", { name: "Field library" }))).toBeGreaterThanOrEqual(4.5);
  expect(await page.locator("html").evaluate((element) => element.scrollWidth)).toBeLessThanOrEqual(391);

  await study.evaluate((element) => (element as HTMLElement).style.setProperty("--elea-color-surface-inverse", "rgb(31, 46, 63)"));
  const read = study.getByRole("button", { name: "Read resource, Reading a changing glacier" });
  await focusInView(read);
  await expect(hint).toHaveText("Read without leaving the library");
  await expect(read).toHaveAccessibleDescription("Read without leaving the library");
  expect(await hint.evaluate((element) => element.matches(":popover-open"))).toBe(true);
  const bounds = await hint.evaluate((element) => {
    const { x, right } = element.getBoundingClientRect();
    return { x, right };
  });
  expect(bounds.x).toBeGreaterThanOrEqual(8);
  expect(bounds.right).toBeLessThanOrEqual(382);
  await expect(hint).toHaveCSS("background-color", "rgb(31, 46, 63)");

  await page.keyboard.press("Escape");
  await expect(hint).toHaveCount(0);
  await expect(read).toBeFocused();
  await expect(read).toHaveCSS("outline-style", "solid");
  await page.keyboard.press("Enter");
  const dialog = page.getByRole("dialog", { name: "Reading a changing glacier" });
  await expect(dialog.locator("..")).toHaveAttribute("data-elea-theme", "editorial");
  await expect(dialog.locator("..")).toHaveAttribute("data-elea-appearance", "dark");
  await expect(dialog.getByText("A season of observations from the edge of the ice.")).toBeVisible();
  await expect(dialog.getByRole("button", { name: "Close resource" })).toBeFocused();
  await page.keyboard.press("Shift+Tab");
  await expect(dialog.getByRole("button", { name: "Back to resources" })).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(dialog).toHaveCount(0);
  await expect(read).toBeFocused();

  await page.goto(tooltipGuide);
  await focusInView(guideTrigger);
  await expect(hint).toHaveText("Saves a draft without publishing");
  expect(await palette()).toEqual(before);
  expect(await siteAccent()).toBe(beforeAccent);
});
