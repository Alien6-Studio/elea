import { expect, test } from "@playwright/test";

for (const preference of ["no-preference", "reduce"] as const) {
  test("dialog focus and interrupted exit with " + preference + " motion", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: preference });
    await page.goto("/elea/playground/#/ui/dialog");
    const motion = page.getByRole("switch", { name: "Expressive motion" });
    if (await motion.getAttribute("aria-checked") !== "true") await motion.click();
    await page.addStyleTag({ content: ".elea-dialog-backdrop { --elea-motion-intent-open: 900ms; --elea-motion-intent-close: 900ms; }" });
    const opener = page.getByRole("button", { name: "Share article" });
    const dialog = page.getByRole("dialog", { name: "Share this article" });
    const backdrop = page.locator(".elea-dialog-backdrop");
    await opener.focus();
    await opener.press("Enter");
    await expect(dialog.getByRole("button", { name: "Close" })).toBeFocused();
    if (preference === "no-preference") {
      await expect.poll(() => backdrop.evaluate(node => Number(getComputedStyle(node).opacity))).toBeGreaterThan(0.4);
    }
    await page.keyboard.press("Escape");
    await expect(opener).toBeFocused();
    await expect(dialog).toHaveCount(0);
    expect(await page.evaluate(() => document.body.style.overflow)).not.toBe("hidden");
    if (preference === "no-preference") {
      await expect(backdrop).toHaveAttribute("inert", "");
      await opener.press("Enter");
      await expect(dialog.getByRole("button", { name: "Close" })).toBeFocused();
      await expect(backdrop).toHaveCSS("opacity", "1");
      await page.keyboard.press("Escape");
      await expect(opener).toBeFocused();
    }
    await expect(backdrop).toHaveCount(0);
  });
}

test("a bottom sheet exits through the edge that opened it", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.goto("/elea/playground/#/ui/sheet");
  const motion = page.getByRole("switch", { name: "Expressive motion" });
  if (await motion.getAttribute("aria-checked") !== "true") await motion.click();
  await page.addStyleTag({ content: ".elea-sheet-backdrop { --elea-motion-intent-close: 900ms; }" });
  const open = page.getByRole("button", { name: "bottom", exact: true });
  await open.focus();
  await open.press("Enter");
  const backdrop = page.locator(".elea-sheet-backdrop");
  await expect(backdrop).toHaveCSS("opacity", "1");
  await page.keyboard.press("Escape");
  await expect(open).toBeFocused();
  await expect(backdrop).toHaveAttribute("inert", "");
  await expect(backdrop).toHaveClass(/elea-sheet-backdrop--bottom/);
  await expect(backdrop.locator(".elea-sheet")).toHaveClass(/elea-sheet--bottom/);
  await expect(backdrop).toHaveCount(0);
});
