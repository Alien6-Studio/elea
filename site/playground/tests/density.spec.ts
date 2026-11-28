import { expect, test } from "@playwright/test";

test("one regional density coordinates a field, rows and portaled actions", async ({ page }, testInfo) => {
  await page.goto("/playground/#/ui/table");
  const region = page.getByRole("region", { name: "Article workspace" });
  const field = region.getByRole("searchbox", { name: "Filter articles" });
  const rowHeader = region.getByRole("rowheader", { name: "Autumn field notes" });
  const action = region.getByRole("button", { name: "Word count" });
  const selector = page.getByRole("combobox", { name: "Region density" });
  const otherCell = page.getByRole("region", { name: "Articles", exact: true }).getByRole("cell").first();
  const siblingPadding = await otherCell.evaluate(cell => getComputedStyle(cell).paddingBlockStart);

  for (const [name, height, rowPadding, gap, menuPadding] of [
    ["Compact", "36px", "8px", "2px", "4px"],
    ["Standard", "40px", "12px", "4px", "8px"],
    ["Comfortable", "44px", "16px", "8px", "12px"],
  ] as const) {
    await selector.click();
    await page.getByRole("option", { name, exact: true }).click();
    await expect(selector).toHaveCSS("min-height", height);
    await selector.click();
    await expect(page.getByRole("option", { name, exact: true })).toHaveCSS("padding-block-start", menuPadding);
    await page.keyboard.press("Escape");
    await expect(field).toHaveCSS("min-height", height);
    await expect(action).toHaveCSS("min-height", height);
    await expect(field.locator("..")).toHaveCSS("row-gap", gap);
    await expect(rowHeader).toHaveCSS("padding-block-start", rowPadding);
    await expect(otherCell).toHaveCSS("padding-block-start", siblingPadding);
    if (name !== "Standard") {
      const path = testInfo.outputPath(name.toLowerCase() + ".png");
      await region.screenshot({ path, animations: "disabled" });
      await testInfo.attach(name, { path, contentType: "image/png" });
    }
    await action.click();
    const dialog = page.getByRole("dialog", { name: "Word count" });
    await expect(dialog.getByRole("button", { name: "Done" })).toHaveCSS("min-height", height);
    await dialog.getByRole("button", { name: "Done" }).click();
  }
});
