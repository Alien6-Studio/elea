import { readFile } from "node:fs/promises";
import { expect, test, type Locator } from "@playwright/test";
import { textContrast } from "./contrast.js";

const colours = "/elea/playground/#/colours?edition=editorial";
const background = (element: Locator) => element.evaluate(node => getComputedStyle(node).backgroundColor);

test("the colour atlas is one keyboard stop and preserves separate role assignments", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 740 });
  await page.goto(colours + "&brand=2945c7&corners=Round&type=Serif&rhythm=Airy&radius=10px&neutral=slate");
  const families = page.getByRole("tab", { name: "Reference families" });
  await families.click();
  const grid = page.getByRole("grid", { name: "Reference colours" });
  const cell = (name: string) => grid.getByRole("gridcell", { name, exact: true });
  await expect(grid.getByRole("gridcell")).toHaveCount(176);
  await expect(grid.locator('[tabindex="0"]')).toHaveCount(1);
  await expect(cell("Emerald 500")).toHaveAttribute("aria-selected", "true");
  await expect(page.getByRole("region", { name: "Colour roles" }).getByText("Tone 500", { exact: true })).toHaveCount(2);
  await cell("Amber 100").click();
  await page.keyboard.press("ArrowRight");
  await expect(cell("Amber 200")).toBeFocused();
  await expect(cell("Amber 200")).toHaveAttribute("aria-selected", "true");
  await page.keyboard.press("Tab");
  const role = page.getByRole("combobox", { name: "Colour role" });
  await expect(role).toBeFocused();
  const primary = page.getByRole("button", { name: "Use as primary" });
  await primary.click();
  await role.click();
  await page.getByRole("option", { name: "Secondary", exact: true }).click();
  await cell("Iris 600").click();
  await page.getByRole("button", { name: "Use as secondary" }).click();
  await cell("Slate 500").click();
  await expect(page.getByRole("button", { name: "Use for surfaces" })).toHaveCount(0);
  await expect(page).toHaveURL(/primary=amber-200&secondary=iris-600&neutral=slate/);
  await page.reload();
  await families.click();
  await expect(cell("Amber 200")).toHaveAttribute("aria-selected", "true");
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(320);

  const hex = page.getByRole("textbox", { name: "Primary hex" });
  await hex.fill("#304050");
  await hex.press("Enter");
  await expect(page).not.toHaveURL(/primary=amber/);
  await expect(page).toHaveURL(/secondary=iris-600&neutral=slate/);
  await role.click();
  await page.getByRole("option", { name: "Secondary", exact: true }).click();
  await page.getByRole("button", { name: "Reset secondary", exact: true }).click();
  await expect(page).not.toHaveURL(/secondary=iris/);
  await expect(page).toHaveURL(/neutral=slate/);
  await page.getByRole("button", { name: "Reset colours", exact: true }).click();
  await expect(page).not.toHaveURL(/neutral=|primary=|secondary=/);
  await expect(page.getByLabel("Secondary colour", { exact: true })).toHaveValue("#454a70");
  await role.click();
  await page.getByRole("option", { name: "Primary", exact: true }).click();
  await expect(page.getByLabel("Primary colour", { exact: true })).toHaveValue("#2945c7");
  await page.getByRole("link", { name: "Open theme studio", exact: true }).click();
  await expect(page).toHaveURL(/#\/theme\?.*radius=10px.*edition=editorial/);
  await page.getByRole("button", { name: "Settings", exact: true }).click();
  await expect(page.getByRole("radio", { name: "Round" })).toBeChecked();
  await expect(page.getByRole("textbox", { name: "Corner radius" })).toHaveValue("10px");
  await expect(page.getByText("Using your corner radius of 10px.")).toBeVisible();
});

test("a custom warning travels to feedback controls without changing the primary", async ({ page }) => {
  await page.goto(colours + "&primary=ruby-50");
  const role = page.getByRole("combobox", { name: "Colour role" });
  await role.click();
  await expect(page.getByRole("option")).toHaveCount(7);
  await page.getByRole("option", { name: "Warning", exact: true }).click();
  const warning = page.getByRole("textbox", { name: "Warning hex" });
  await warning.fill("FAC21F");
  await warning.press("Enter");
  await expect(page).toHaveURL(/primary=ruby-50/);
  await page.reload();
  const roles = page.getByRole("region", { name: "Colour roles" });
  await expect(roles).toContainText("Ruby 50");
  await expect(roles.locator(".atlas-role--warning")).toHaveCSS("background-color", "rgb(250, 194, 31)");
  const css = decodeURIComponent((await page.getByRole("link", { name: "Download CSS" }).getAttribute("href"))!);
  expect(css).toContain("--elea-color-action-warning:");
  expect(css.toLowerCase()).toContain("#fac21f");
  await page.getByRole("link", { name: "Try buttons" }).click();
  const button = page.getByRole("button", { name: "Warning", exact: true });
  await expect(button).toHaveCSS("background-color", "rgb(250, 194, 31)");
  expect(await textContrast(button)).toBeGreaterThanOrEqual(4.5);
});

for (const mode of ["light", "dark"] as const) {
  test(`exported reference shades render on real controls in ${mode}`, async ({ page }) => {
    await page.emulateMedia({ colorScheme: mode, reducedMotion: "reduce" });
    await page.goto(colours + "&primary=ruby-50&secondary=cobalt-900&neutral=slate");
    await page.getByRole("tab", { name: "Reference families" }).click();
    const grid = page.getByRole("grid", { name: "Reference colours" });
    const shade = (name: string) => background(grid.getByRole("gridcell", { name, exact: true }));
    const [primary, secondary, surface, oppositeSurface] = await Promise.all([
      shade("Ruby 50"), shade("Cobalt 900"),
      shade(mode === "light" ? "Slate 50" : "Slate 950"),
      shade(mode === "light" ? "Slate 950" : "Slate 50"),
    ]);
    const preview = page.getByRole("region", { name: "Colour roles" });
    await expect(preview).toContainText("Ruby 50");
    await expect(preview).toContainText("Cobalt 900");
    const [download] = await Promise.all([
      page.waitForEvent("download"),
      page.getByRole("link", { name: "Download CSS" }).click(),
    ]);
    const path = await download.path();
    if (!path) throw new Error("Expected the exported stylesheet");
    const css = await readFile(path, "utf8");
    expect(css).toContain("--elea-palette-ruby-50");
    expect(css).toContain("--elea-palette-cobalt-900");
    expect(css).toContain("--elea-palette-slate-950");

    await page.getByRole("link", { name: "Open theme studio", exact: true }).click();
    const reader = page.getByRole("region", { name: "Publication preview" }).getByRole("article");
    await expect(reader).toHaveCSS("background-color", surface);
    await page.getByRole("link", { name: "Edit colours", exact: true }).click();
    await page.getByRole("link", { name: "Open themed gallery" }).click();
    await page.getByRole("link", { name: "Button", exact: true }).click();
    const variants = page.locator(".demo").first();
    for (const [name, fill] of [["Primary", primary], ["Secondary", secondary]] as const) {
      const button = variants.getByRole("button", { name, exact: true });
      await expect(button).toHaveCSS("background-color", fill);
      expect(await textContrast(button.locator(".elea-button__label"))).toBeGreaterThanOrEqual(4.5);
      await button.hover();
      await expect(button).not.toHaveCSS("background-color", fill);
      expect(await textContrast(button.locator(".elea-button__label"))).toBeGreaterThanOrEqual(4.5);
    }

    // Load the downloaded stylesheet into an independent host with local appearances.
    const consumer = await page.context().newPage();
    const [tokens, editions, ui] = await Promise.all([
      readFile(new URL(import.meta.resolve("@alien6-studio/elea-tokens/elea.css")), "utf8"),
      readFile(new URL(import.meta.resolve("@alien6-studio/elea-tokens/editions.css")), "utf8"),
      readFile(new URL(import.meta.resolve("@alien6-studio/elea-ui/styles.css")), "utf8"),
    ]);
    await consumer.setContent(`<html data-theme="${mode}"><body>
      <section aria-label="Default buttons">
        <button class="elea-button elea-button--primary">Primary</button>
        <button class="elea-button elea-button--secondary">Secondary</button>
      </section>
      <div data-elea-theme="brand">
        <p id="outer">Article</p>
        <section data-elea-appearance="${mode === "light" ? "dark" : "light"}">
          <p id="local">Article</p>
          <section data-elea-theme="precision"><p id="edition">Article</p><button id="nested-action" class="elea-button elea-button--primary">Save</button></section>
        </section>
      </div>
      <section data-elea-theme="precision" data-elea-appearance="${mode === "light" ? "dark" : "light"}"><p id="sibling">Article</p><button id="sibling-action" class="elea-button elea-button--primary">Save</button></section>
    </body></html>`);
    await consumer.addStyleTag({ content: [tokens, editions, ui, css,
      "p {background:var(--elea-color-surface-default);color:var(--elea-color-text-default)}",
    ].join("\n") });
    for (const name of ["Primary", "Secondary"]) {
      const button = consumer.getByRole("button", { name, exact: true });
      const tone500 = await button.evaluate((element, role) => {
        const swatch = document.createElement("i");
        swatch.style.backgroundColor = `var(--elea-color-${role}-500)`;
        element.append(swatch);
        const color = getComputedStyle(swatch).backgroundColor;
        swatch.remove();
        return color;
      }, name.toLowerCase());
      await expect(button).toHaveCSS("background-color", tone500);
      expect(await textContrast(button)).toBeGreaterThanOrEqual(4.5);
    }
    await expect(consumer.locator("#outer")).toHaveCSS("background-color", surface);
    await expect(consumer.locator("#local")).toHaveCSS("background-color", oppositeSurface);
    expect(await textContrast(consumer.locator("#local"))).toBeGreaterThanOrEqual(4.5);
    const edition = await background(consumer.locator("#sibling"));
    expect(edition).not.toBe(oppositeSurface);
    await expect(consumer.locator("#edition")).toHaveCSS("background-color", edition);
    const ownAction = await background(consumer.locator("#sibling-action"));
    expect(ownAction).not.toBe(primary);
    await expect(consumer.locator("#nested-action")).toHaveCSS("background-color", ownAction);
    await consumer.close();
  });
}
