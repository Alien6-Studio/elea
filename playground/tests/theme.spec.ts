import { expect, test, type Locator, type Page } from "@playwright/test";
import { readFile } from "node:fs/promises";
import { textContrast } from "./contrast.js";

const studioPath = "/elea/playground/#/theme";

const coloursPath = "/elea/playground/#/colours";

function cssRgb(hex: string) {
  const channels = hex.slice(1).match(/../g)!.map(pair => Number.parseInt(pair, 16));
  return `rgb(${channels.join(", ")})`;
}

async function expectButtonFills(gallery: Locator, seed: string, accent: string) {
  for (const [name, hex] of [["Primary", seed], ["Secondary", accent]] as const) {
    const button = gallery.getByRole("button", { name, exact: true });
    await expect(button).toHaveCSS(`--elea-color-${name.toLowerCase()}-500`, hex);
    await expect(button).toHaveCSS("background-color", cssRgb(hex));
    expect(await textContrast(button.locator(".elea-button__label"))).toBeGreaterThanOrEqual(4.5);
  }
}

async function selectColourRole(page: Page, name: string) {
  await page.getByRole("combobox", { name: "Colour role" }).click();
  await page.getByRole("option", { name, exact: true }).click();
}

async function setThemeColours(page: Page, colours: { primary?: string; secondary?: string }) {
  await page.getByRole("link", { name: "Edit colours", exact: true }).click();
  if (colours.primary) await page.getByLabel("Primary colour", { exact: true }).fill(colours.primary);
  if (colours.secondary) {
    await selectColourRole(page, "Secondary");
    await page.getByLabel("Secondary colour", { exact: true }).fill(colours.secondary);
  }
  await page.getByRole("link", { name: "Open theme studio", exact: true }).click();
}

test("primary and secondary colours travel independently with the edition", async ({ page }) => {
  await page.goto(studioPath + "?edition=editorial");
  await expect(page.getByRole("grid", { name: "Reference colours" })).toHaveCount(0);
  await expect(page.getByRole("combobox", { name: "Colour role" })).toHaveCount(0);
  await setThemeColours(page, { primary: "#873b76", secondary: "#625078" });
  await expect(page.getByRole("combobox", { name: "Reading typeface" })).toHaveText("Serif");
  await expect(page.getByRole("radio", { name: "Square" })).toBeChecked();
  const preview = page.getByRole("region", { name: "Publication preview" });
  await expect(preview).toHaveCSS("--elea-color-primary-500", "#873b76");
  await expect(preview).toHaveCSS("--elea-color-secondary-500", "#625078");
  const css = decodeURIComponent((await page.getByRole("link", { name: "Download CSS" }).getAttribute("href"))!);
  expect(css).toContain("--elea-color-primary-500: #873b76");
  expect(css).toContain("--elea-color-secondary-500: #625078");
  await page.reload();
  await page.getByRole("link", { name: "Open themed gallery" }).click();
  await page.getByRole("link", { name: "Button", exact: true }).click();
  await expectButtonFills(page.locator(".catalog-demos"), "#873b76", "#625078");
  await page.getByRole("link", { name: "ColorPicker", exact: true }).click();
  await expect(page.getByLabel("Ink colour", { exact: true })).toHaveValue("#873b76");
  await page.getByRole("link", { name: "Edit theme", exact: true }).click();
  await page.getByRole("link", { name: "Edit colours", exact: true }).click();
  await selectColourRole(page, "Secondary");
  await expect(page.getByLabel("Secondary colour", { exact: true })).toHaveValue("#625078");
  await page.getByRole("button", { name: "Reset colours", exact: true }).click();
  await expect(page).toHaveURL(/#\/colours\?edition=editorial$/);
});

test("a custom hex can be corrected and inspected on the mobile colours page", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.emulateMedia({ colorScheme: "dark" });
  await page.goto(coloursPath + "?edition=precision");
  const url = page.url();
  const hex = page.getByRole("textbox", { name: "Primary hex", exact: true });
  await hex.fill("02Z");
  await hex.press("Enter");
  await expect(hex).toHaveAttribute("aria-invalid", "true");
  await expect(page).toHaveURL(url);
  await hex.press("Escape");
  await expect(hex).toHaveValue(/^#08745e$/i);
  await hex.fill("FAF2C3");
  await hex.press("Enter");
  await expect(page.getByLabel("Primary colour", { exact: true })).toHaveValue("#faf2c3");
  await selectColourRole(page, "Secondary");
  const secondary = page.getByRole("textbox", { name: "Secondary hex", exact: true });
  await secondary.fill("152447");
  await secondary.press("Enter");
  await selectColourRole(page, "Primary");
  await page.getByText("Primary scale", { exact: true }).click();
  await expect(page.getByRole("list", { name: "Primary scale" }).getByRole("listitem").filter({ hasText: "#FAF2C3" })).toContainText("500");
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390);
  await page.getByRole("link", { name: "Try buttons" }).click();
  await expectButtonFills(page.locator(".catalog-demos"), "#faf2c3", "#152447");
});

test("an accentless shared theme inherits its host colour until a second colour is chosen", async ({ page }) => {
  await page.goto(studioPath + "?brand=19634e&corners=Soft");
  await page.getByRole("link", { name: "Edit colours", exact: true }).click();
  await selectColourRole(page, "Secondary");
  const swatch = page.getByLabel("Secondary colour", { exact: true });
  await page.evaluate(() => document.documentElement.style.setProperty("--elea-color-secondary-500", "rgb(12 34 56)"));
  await expect(swatch).toHaveValue("#0c2238");
  await expect(page.getByText("The secondary scale is inherited from the surrounding theme.")).toBeVisible();
  const role = page.getByRole("region", { name: "Colour roles" }).locator(".atlas-role--secondary");
  await expect(role).toHaveCSS("background-color", "rgb(12, 34, 56)");
  const css = decodeURIComponent((await page.getByRole("link", { name: "Download CSS" }).getAttribute("href"))!);
  expect(css).not.toContain("--elea-color-secondary-500:");
  await swatch.fill("#516780");
  await expect(page.getByText("Secondary scale", { exact: true })).toBeVisible();
  await expect(page).toHaveURL(/accent=516780/);
  await page.getByRole("button", { name: "Reset secondary", exact: true }).click();
  await expect(swatch).toHaveValue("#0c2238");
  await expect(page).not.toHaveURL(/accent=/);
});

test("Typography shows ELEA Sans and preserves the Studio typeface preference", async ({ page }) => {
  await page.goto(studioPath + "?edition=editorial");
  const siteTypeface = page.getByRole("combobox", { name: "Site typeface", exact: true });
  const readingTypeface = page.getByRole("combobox", { name: "Reading typeface", exact: true });
  const root = page.locator("html");
  const mainNav = page.getByRole("navigation", { name: "Main", exact: true });
  await expect(siteTypeface).toHaveText("ELEA Sans");
  const editionUrl = page.url();
  const download = page.getByRole("link", { name: "Download CSS" });
  const editionCss = await download.getAttribute("href");
  await expect(readingTypeface).toHaveText("Serif");

  const docs = mainNav.getByRole("link", { name: "Docs", exact: true });
  for (const [label, value] of [["Instrument Sans", "instrument"], ["Roboto", "roboto"]] as const) {
    const family = new RegExp(`^"${label} Variable"`);
    await siteTypeface.click();
    await expect(page.getByRole("option", { name: "Source Serif 4", exact: true })).toHaveCount(0);
    await page.getByRole("option", { name: label, exact: true }).click();
    await expect(siteTypeface).toHaveText(label);
    await expect(root).toHaveAttribute("data-site-font", value);
    await expect(docs).toHaveCSS("font-family", family);
    await expect(page).toHaveURL(editionUrl);
    await expect(readingTypeface).toHaveText("Serif");
    expect(await download.getAttribute("href")).toBe(editionCss);

    await page.getByRole("link", { name: "View type specimen" }).click();
    await expect(page).toHaveURL(/\/typography\/$/);
    await expect(docs).toHaveCSS("font-family", /^"ELEA Sans"/);
    await page.reload();
    for (const element of [
      docs,
      page.getByRole("contentinfo").getByRole("link", { name: "Elea", exact: true }),
      page.locator(".type-reading"),
      page.locator(".type-small-caps"),
      page.locator(".type-glyphs").getByText("0123456789", { exact: true }),
      page.getByRole("table", { name: "Weights in roman and italic" }).getByRole("cell").last(),
    ]) await expect(element).toHaveCSS("font-family", /^"ELEA Sans"/);

    await page.goBack();
    await expect(page).toHaveURL(editionUrl);
    await expect(siteTypeface).toHaveText(label);
    await expect(root).toHaveAttribute("data-site-font", value);
    await expect(docs).toHaveCSS("font-family", family);
  }
  await siteTypeface.click();
  await page.getByRole("option", { name: "ELEA Sans", exact: true }).click();
  await expect(root).toHaveAttribute("data-site-font", "elea");
});

test("a saved Source Serif 4 site preference migrates to Roboto", async ({ page }) => {
  await page.goto(studioPath);
  const siteTypeface = page.getByRole("combobox", { name: "Site typeface", exact: true });
  for (const storage of ["local", "session"] as const) {
    await page.evaluate(storage => {
      localStorage.removeItem("elea-site-font");
      sessionStorage.removeItem("elea-site-font-session");
      if (storage === "local") localStorage.setItem("elea-site-font", "source-serif");
      else sessionStorage.setItem("elea-site-font-session", "source-serif");
    }, storage);
    await page.reload();
    await expect(siteTypeface).toHaveText("Roboto");
    await expect(page.locator("html")).toHaveAttribute("data-site-font", "roboto");
    expect(await page.evaluate(() => sessionStorage.getItem("elea-site-font-session") ?? localStorage.getItem("elea-site-font"))).toBe("roboto");
  }
});

async function appearance(locator: Locator) {
  return locator.evaluate((element) => {
    const style = getComputedStyle(element);
    return {
      background: style.backgroundColor,
      foreground: style.color,
      radius: style.borderTopLeftRadius,
      focus: style.getPropertyValue("--elea-color-focus").trim(),
      link: style.getPropertyValue("--elea-color-text-link").trim(),
    };
  });
}

async function readingStyle(locator: Locator) {
  return locator.evaluate((element) => {
    const { fontFamily, fontSize, lineHeight } = getComputedStyle(element);
    return { fontFamily, fontSize, lineHeight };
  });
}

const editions = [
  { name: "Precision", seed: "#08745e", accent: "#465451", surfaces: ["rgb(255, 255, 255)", "rgb(17, 22, 30)"], radius: 6 },
  { name: "Editorial", seed: "#2945c7", accent: "#454a70", surfaces: ["rgb(250, 250, 252)", "rgb(23, 25, 35)"], radius: 0 },
  { name: "Obsidian", seed: "#a15f3e", accent: "#495060", surfaces: ["rgb(249, 250, 251)", "rgb(25, 27, 32)"], radius: 4.5 },
] as const;

for (const colorScheme of ["light", "dark"] as const) {
  test(`shared edition URLs match across Studio, Playground and Gallery in ${colorScheme}`, async ({ page }) => {
    await page.emulateMedia({ colorScheme });
    for (const { name, seed, accent, surfaces, radius } of editions) {
      const background = surfaces[colorScheme === "light" ? 0 : 1];
      await page.goto(studioPath + "?edition=" + name.toLowerCase());
      await expect(page.locator("html")).toHaveCSS("--elea-color-primary-500", "#2926bf");
      const studioReader = page.getByRole("region", { name: "Publication preview" }).getByRole("article");
      await expect(studioReader).toHaveCSS("background-color", background);
      expect(await textContrast(studioReader.locator(".elea-paragraph").first())).toBeGreaterThanOrEqual(4.5);
      const studioStyle = await appearance(studioReader);

      await page.getByRole("link", { name: "Open themed workspace" }).click();
      await expect(page.getByTestId("editor-pane")).toBeVisible();
      await expect(page.getByTestId("preview-toggle")).toHaveCSS("--elea-color-primary-500", seed);
      expect(parseFloat((await appearance(page.getByTestId("preview-toggle"))).radius)).toBeCloseTo(radius, 2);
      const reader = page.getByTestId("viewer-pane").getByRole("article");
      await expect(reader).toHaveCSS("background-color", background);
      expect(await appearance(reader)).toEqual(studioStyle);

      await page.getByRole("navigation", { name: "Main", exact: true }).getByRole("link", { name: "Components", exact: true }).click();
      await page.getByRole("link", { name: "Button", exact: true }).click();
      const gallery = page.locator(".catalog");
      const primary = gallery.getByRole("button", { name: "Primary", exact: true });
      const secondary = gallery.getByRole("button", { name: "Secondary", exact: true });
      await expectButtonFills(gallery, seed, accent);
      await primary.press("Tab");
      await expect(secondary).toBeFocused();
      await expect(secondary).toHaveCSS("outline-width", "2px");
      await page.getByRole("navigation", { name: "Component index" }).getByRole("link", { name: "Dialog", exact: true }).click();
      await gallery.getByRole("button", { name: "Share article", exact: true }).click();
      const dialog = page.getByRole("dialog", { name: "Share this article" });
      await expect(dialog.locator("..")).toHaveAttribute("data-elea-theme", "brand");
      await expect(dialog).toHaveCSS("background-color", background);
      const action = dialog.getByRole("button", { name: "Share", exact: true });
      await expect(action).toHaveCSS("--elea-color-primary-500", seed);
      expect(parseFloat((await appearance(action)).radius)).toBeCloseTo(radius, 2);
      expect(await textContrast(action.locator(".elea-button__label"))).toBeGreaterThanOrEqual(4.5);
      await page.keyboard.press("Escape");

      await page.getByRole("navigation", { name: "Component index" }).getByRole("link", { name: "Toast", exact: true }).click();
      const notifications = page.getByRole("region", { name: "Notifications" });
      await expect(notifications).toHaveAttribute("data-elea-theme", "brand");
      const neutralButton = gallery.getByRole("button", { name: "Neutral", exact: true });
      const buttonFills = new Set([(await appearance(neutralButton)).background]);
      await neutralButton.click();
      const neutral = notifications.locator(".elea-toast--neutral");
      await expect(neutral).toHaveCSS("background-color", background);
      await expect(neutral).toHaveCSS("border-width", "0px");
      await expect(neutral).toHaveCSS("outline-style", "none");
      // An inset or unblurred shadow can paint a frame even with a zero-width border.
      const shadow = await neutral.evaluate(element => getComputedStyle(element).boxShadow);
      expect(shadow).not.toBe("none");
      expect(shadow).not.toMatch(/inset| 0px -?[\d.]+px(?:,|$)/);
      const surfacesByTone = new Set<string>([background]);
      for (const tone of ["Success", "Info", "Warning", "Danger"]) {
        const button = gallery.getByRole("button", { name: tone, exact: true });
        await expect(button.locator(".elea-button__icon svg")).toBeVisible();
        const restingFill = (await appearance(button)).background;
        buttonFills.add(restingFill);
        expect(await textContrast(button), tone).toBeGreaterThanOrEqual(4.5);
        await button.click();
        const toast = notifications.locator(`.elea-toast--${tone.toLowerCase()}`);
        await expect(toast).toHaveCSS("border-width", "0px");
        const icon = toast.locator(".elea-toast__icon");
        await expect(icon.locator("svg")).toBeVisible();
        await expect(icon).toHaveCSS("color", restingFill);
        surfacesByTone.add((await appearance(toast)).background);
        for (const text of await toast.locator(".elea-toast__title, .elea-toast__description").all()) {
          expect(await textContrast(text), tone).toBeGreaterThanOrEqual(4.5);
        }
        expect(await textContrast(icon), tone).toBeGreaterThanOrEqual(3);
      }
      expect(buttonFills.size).toBe(5);
      expect(surfacesByTone.size).toBe(5);

      await page.getByRole("navigation", { name: "Component index" }).getByRole("link", { name: "Field, Input, Textarea" }).click();
      const textarea = gallery.getByRole("textbox", { name: "A longer text" });
      await gallery.getByRole("textbox", { name: "Large", exact: true }).press("Tab");
      await expect(textarea).toBeFocused();
      await expect(textarea).toHaveCSS("outline-style", "solid");
      await expect(textarea).toHaveCSS("outline-width", "2px");
      await expect(textarea).toHaveCSS("outline-offset", "-2px");
      await expect(textarea).toHaveCSS("border-color", "rgba(0, 0, 0, 0)");
      await expect(textarea).toHaveCSS("box-shadow", "none");
    }
  });
}

test("one theme token supplies the warning colour to actions, badges, alerts and portaled toasts", async ({ page }) => {
  await page.emulateMedia({ colorScheme: "light" });
  await page.goto("/elea/playground/#/ui/toast?edition=precision");
  await page.addStyleTag({ content: '[data-elea-theme="brand"] { --elea-color-warning: #984914; }' });
  const warningColour = "rgb(152, 73, 20)";
  const warning = page.getByRole("button", { name: "Warning", exact: true });
  await expect(warning).toHaveCSS("background-color", warningColour);
  await warning.click();
  const notifications = page.getByRole("region", { name: "Notifications" });
  await expect(notifications).toHaveAttribute("data-elea-theme", "brand");
  const toast = notifications.locator(".elea-toast--warning");
  await expect(toast.locator(".elea-toast__icon")).toHaveCSS("color", warningColour);
  const tint = (await appearance(toast)).background;

  const index = page.getByRole("navigation", { name: "Component index" });
  await index.getByRole("link", { name: "Card", exact: true }).click();
  await expect(page.locator(".elea-badge--warning", { hasText: "In review" })).toHaveCSS("color", warningColour);
  await index.getByRole("link", { name: "Alert", exact: true }).click();
  await expect(page.locator(".elea-alert--warning")).toHaveCSS("background-color", tint);
});

for (const colorScheme of ["light", "dark"] as const) {
  test(`brand settings are scoped and the exported CSS reproduces the ${colorScheme} preview`, async ({ page }) => {
    await page.emulateMedia({ colorScheme });
    await page.goto(studioPath + "?edition=obsidian");
    await expect(page.getByRole("heading", { level: 1, name: "Theme studio" })).toBeVisible();
    await expect(page.locator("html")).toHaveAttribute("data-theme", colorScheme);
    await page.addStyleTag({ content: "* { transition: none !important; }" });

    const preview = page.getByRole("region", { name: "Publication preview" });
    const article = preview.getByRole("article");
    const marker = page.getByRole("button", { name: /Switch to the .* theme/ });
    const outside = await appearance(marker);
    await expect(preview).toHaveCSS("--elea-color-primary-500", "#a15f3e");
    const reading = article.locator(".elea-paragraph").first();
    await expect(reading).toHaveCSS("font-size", "16px");
    await expect(reading).toHaveCSS("font-family", /^"ELEA Sans"/);
    await page.getByRole("combobox", { name: "Reading typeface" }).click();
    await page.getByRole("option", { name: "Serif", exact: true }).click();
    await page.getByRole("combobox", { name: "Reading density" }).click();
    await page.getByRole("option", { name: "Airy", exact: true }).click();
    await expect(reading).toHaveCSS("font-size", "20px");
    await expect(reading).toHaveCSS("line-height", "36px");
    const typography = await readingStyle(reading);
    await setThemeColours(page, { primary: "#757575" });
    await page.getByRole("textbox", { name: "Interface font" }).fill("Georgia, serif");
    expect(await textContrast(reading)).toBeGreaterThanOrEqual(4.5);
    expect(await textContrast(preview.locator(".elea-badge"))).toBeGreaterThanOrEqual(4.5);

    const corners = page.getByRole("group", { name: "Corners" });
    await corners.getByRole("radio", { name: "Square" }).check();
    await expect(article).toHaveCSS("border-top-left-radius", "0px");
    await corners.getByRole("radio", { name: "Round" }).check();
    await expect(article).not.toHaveCSS("border-top-left-radius", "0px");
    expect(await appearance(marker)).toEqual(outside);
    const expected = await appearance(article);
    await marker.click();
    await expect.poll(async () => (await appearance(article)).link).not.toBe(expected.link);
    await marker.click();
    await expect.poll(() => appearance(article)).toEqual(expected);

    await page.locator("summary", { hasText: "View CSS" }).click();
    const source = await page.locator("details[open] pre code").innerText();
    const [download] = await Promise.all([
      page.waitForEvent("download"),
      page.getByRole("link", { name: /Download CSS/ }).click(),
    ]);
    expect(download.suggestedFilename()).toBe("elea-brand.css");
    const file = await download.path();
    if (!file) throw new Error("Expected the downloaded CSS file");
    const css = await readFile(file, "utf8");
    expect(css.trim()).toBe(source.trim());

    // Check the generated theme in the workspace and the downloaded file in a separate consumer.
    await page.getByRole("link", { name: "Open themed workspace" }).click();
    const workspaceArticle = page.getByTestId("viewer-pane").getByRole("article");
    await expect.poll(() => appearance(workspaceArticle)).toEqual(expected);
    await expect.poll(() => readingStyle(workspaceArticle.locator(".elea-paragraph").first())).toEqual(typography);

    await page.getByRole("navigation", { name: "Main", exact: true }).getByRole("link", { name: "Components", exact: true }).click();
    await page.getByRole("link", { name: "Button", exact: true }).click();
    const catalogButton = page.getByRole("button", { name: "Primary", exact: true });
    await expect(catalogButton).toBeVisible();

    const consumer = await page.context().newPage();
    const origin = "https://elea-consumer.test";
    const [tokens, ui] = await Promise.all([
      readFile(new URL(import.meta.resolve("@alien6-studio/elea-tokens/elea.css")), "utf8"),
      readFile(new URL(import.meta.resolve("@alien6-studio/elea-ui/styles.css")), "utf8"),
    ]);
    await consumer.route(`${origin}/elea.css`, (route) => route.fulfill({ contentType: "text/css", body: `${tokens}\n${ui}` }));
    await consumer.route(`${origin}/elea-brand.css`, (route) => route.fulfill({ contentType: "text/css", body: css }));
    await consumer.route(`${origin}/`, (route) => route.fulfill({ contentType: "text/html", body: `
      <!doctype html>
      <html lang="en" data-theme="${colorScheme}" style="color-scheme:${colorScheme}">
      <link rel="stylesheet" href="/elea.css">
      <link rel="stylesheet" href="/elea-brand.css">
      <section data-elea-theme="brand">
        <button class="elea-button elea-button--primary elea-button--md">Primary</button>
      </section>
    ` }));
    await consumer.goto(origin);
    const exportedButton = consumer.getByRole("button", { name: "Primary", exact: true });
    expect(await appearance(exportedButton)).toEqual(await appearance(catalogButton));
    expect(await readingStyle(exportedButton)).toEqual(await readingStyle(catalogButton));
    await consumer.close();
  });
}

for (const colorScheme of ["light", "dark"] as const) {
  test(`a customized ${colorScheme} theme follows all component guides, reloads and the return to Studio`, async ({ page }) => {
    await page.emulateMedia({ colorScheme });
    await page.goto(studioPath + "?edition=editorial");
    const header = page.getByRole("navigation", { name: "Main", exact: true });
    const themeSwitch = page.getByTestId("theme-toggle");
    const siteStyle = await appearance(themeSwitch);
    await setThemeColours(page, { primary: "#6750a4", secondary: "#386641" });
    await page.getByRole("radio", { name: "Round", exact: true }).check();
    await page.getByRole("combobox", { name: "Reading density" }).click();
    await page.getByRole("option", { name: "Balanced", exact: true }).click();
    const radius = page.getByRole("textbox", { name: "Corner radius" });
    await radius.fill("10px");
    await expect(radius).toBeFocused();
    await page.getByRole("textbox", { name: "Interface font" }).fill("Georgia, serif");
    const studioUrl = page.url();
    const query = new URL(studioUrl).hash.split("?")[1];
    expect(Object.fromEntries(new URLSearchParams(query))).toMatchObject({
      brand: "6750a4", accent: "386641", corners: "Round", radius: "10px",
      type: "Serif", rhythm: "Balanced", font: "Georgia, serif", edition: "editorial",
    });

    const open = page.getByRole("link", { name: "Open themed gallery" });
    await expect(header.getByRole("link", { name: "Components", exact: true })).toHaveAttribute("href", `/elea/playground/${await open.getAttribute("href")}`);
    await open.press("Enter");
    await expect(page.getByRole("heading", { name: "Components", exact: true })).toBeVisible();
    const previews = page.locator(".gallery__preview");
    await expect(previews).toHaveCount(33);
    const guideCount = await previews.count();
    await expect(previews.first()).toHaveCSS("--elea-color-primary-500", "#6750a4");
    await page.getByRole("link", { name: "Button", exact: true }).click();
    const index = page.getByRole("navigation", { name: "Component index" });
    const demos = page.locator(".catalog-demos");
    const links = index.getByRole("link", { name: /.+/ });
    await expect(links).toHaveCount(guideCount + 1);
    const guides = (await links.allTextContents()).filter((name) => name !== "All components");
    for (const name of guides) {
      const guide = index.getByRole("link", { name, exact: true });
      const target = await guide.getAttribute("href");
      expect(target?.split("?")[1]).toBe(query);
      await guide.click();
      await expect(guide).toHaveAttribute("aria-current", "page");
      await expect(demos).toHaveCSS("--elea-color-primary-500", "#6750a4");
      await expect(demos).toHaveCSS("font-family", "Georgia, serif");
    }
    await page.reload();
    await expect(demos).toHaveCSS("--elea-color-primary-500", "#6750a4");
    expect(await appearance(themeSwitch)).toEqual(siteStyle);

    await index.getByRole("link", { name: "Card", exact: true }).click();
    await demos.getByRole("link", { name: "Button", exact: true }).click();
    await expect(demos.getByRole("heading", { name: "Button", exact: true })).toBeVisible();
    const action = demos.getByRole("button", { name: "Primary", exact: true });
    await expect(action).toHaveCSS("border-radius", "7.5px");
    await expect(action).toHaveCSS("font-family", "Georgia, serif");
    await index.getByRole("link", { name: "Field, Input, Textarea", exact: true }).click();
    const input = demos.getByRole("textbox", { name: "Email", exact: true });
    await input.focus();
    await expect(input).toHaveCSS("outline-width", "2px");
    await expect(input).toHaveCSS("outline-style", "solid");
    await expect(input).toHaveCSS("box-shadow", "none");
    await expect(input).toHaveCSS("border-bottom-width", "2px");
    await input.fill("not-an-email");
    await input.press("Tab");
    await expect(demos.getByRole("alert")).toHaveText("Enter a valid address");

    await index.getByRole("link", { name: "Dialog", exact: true }).click();
    await page.getByRole("switch", { name: "Expressive motion" }).press("Space");
    const opener = demos.getByRole("button", { name: "Open themed dialog" });
    await opener.click();
    const dialog = page.getByRole("dialog", { name: "Themed dialog" });
    await expect(dialog.locator("..")).toHaveAttribute("data-elea-theme", "brand");
    await expect(dialog.getByRole("button", { name: "Done", exact: true })).toHaveCSS("font-family", "Georgia, serif");
    await expect(dialog).toHaveCSS("color-scheme", colorScheme);
    await expect(dialog).toHaveCSS("--elea-motion", "0");
    await page.keyboard.press("Escape");
    await expect(opener).toBeFocused();
    await demos.getByRole("link", { name: "ConfirmField", exact: true }).click();
    await demos.getByRole("button", { name: "Invite", exact: true }).click();
    const popover = page.getByRole("dialog", { name: "Invite a reader" });
    await expect(popover).toHaveCSS("--elea-color-primary-500", "#6750a4");
    await expect(popover.getByRole("textbox", { name: "Email" })).toBeFocused();
    await page.keyboard.press("Escape");

    await index.getByRole("link", { name: "Toast", exact: true }).click();
    await demos.getByRole("button", { name: "Success", exact: true }).click();
    const notifications = page.getByRole("region", { name: "Notifications" });
    await expect(notifications).toHaveAttribute("data-elea-theme", "brand");
    await expect(notifications).toHaveCSS("--elea-color-primary-500", "#6750a4");
    await expect(notifications).toContainText("Article published");

    await page.getByRole("link", { name: "Edit theme", exact: true }).click();
    await expect(page).toHaveURL(studioUrl);
    await expect(page.getByRole("region", { name: "Publication preview" })).toHaveCSS("--elea-color-primary-500", "#6750a4");
    await expect(radius).toHaveValue("10px");
    await expect(page.getByRole("textbox", { name: "Interface font" })).toHaveValue("Georgia, serif");
    await expect(page.getByRole("combobox", { name: "Reading density" })).toHaveText("Balanced");
  });
}

test("an old Precision preset opens in emerald and keeps explicitly customized blue links", async ({ page }) => {
  const oldPrecision = "brand=2854b8&corners=Soft&type=Sans&rhythm=Balanced&accent=40536b&edition=precision";
  const preview = page.getByRole("region", { name: "Publication preview" });
  const gallery = page.getByRole("link", { name: "Open themed gallery" });
  const darkMode = page.getByRole("button", { name: /Switch to the dark theme/ });

  await page.emulateMedia({ colorScheme: "light" });
  await page.goto(`${studioPath}?${oldPrecision}`);
  await expect(preview).toHaveCSS("--elea-color-secondary-500", "#465451");
  await expect(preview).toHaveCSS("--elea-color-primary-500", "#08745e");
  await darkMode.click();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  await expect(preview).toHaveCSS("--elea-color-primary-500", "#08745e");
  await expect(gallery).toHaveAttribute("href", "#/ui?edition=precision");
  await gallery.click();
  await page.getByRole("link", { name: "Button", exact: true }).click();
  await expect(page.getByRole("button", { name: "Primary", exact: true })).toHaveCSS("--elea-color-primary-500", "#08745e");
  await page.getByRole("link", { name: "Edit theme", exact: true }).click();
  await expect(page).toHaveURL(/#\/theme\?edition=precision$/);
  await page.reload();
  await expect(preview).toHaveCSS("--elea-color-primary-500", "#08745e");

  await page.goto(`${studioPath}?${oldPrecision}&radius=10px`);
  await expect(preview).toHaveCSS("--elea-color-secondary-500", "#40536b");
  await expect(preview).toHaveCSS("--elea-color-primary-500", "#2854b8");
  await expect(gallery).toHaveAttribute("href", /brand=2854b8.*radius=10px/);
});

test("settings, preview and expanded CSS fit a 320px viewport", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 740 });
  await page.goto(studioPath);
  const summary = page.locator("summary", { hasText: "View CSS" });
  await summary.click();
  await expect(page.locator("details[open] pre")).toBeVisible();
  const preview = page.getByRole("region", { name: "Publication preview" });
  const article = preview.getByRole("article");
  await expect(article.getByRole("heading", { name: "The glacier notebook" })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(320);
  for (const control of [preview, article, summary]) {
    const box = await control.boundingBox();
    expect(box).toBeTruthy();
    expect(box!.x).toBeGreaterThanOrEqual(0);
    expect(box!.x + box!.width).toBeLessThanOrEqual(320);
  }
  await page.getByRole("button", { name: "Settings", exact: true }).click();
  await expect(preview).toBeHidden();
  await expect(page.getByRole("combobox", { name: "Reading typeface" })).toBeVisible();
  await page.getByRole("combobox", { name: "Reading density" }).click();
  await page.getByRole("option", { name: "Compact", exact: true }).click();
  await page.getByRole("button", { name: "Preview", exact: true }).click();
  await expect(preview).toBeVisible();
  await expect(article.locator(".elea-paragraph").first()).toHaveCSS("font-size", "16px");

  const configuredUrl = page.url();
  await page.getByRole("link", { name: "Open themed gallery" }).click();
  await page.getByRole("link", { name: "Button", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Button", exact: true })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(320);
  await page.getByRole("navigation", { name: "Breadcrumb" }).getByRole("link", { name: "Components" }).click();
  await page.getByRole("link", { name: /Edit theme in Theme Studio/i }).click();
  await expect(page).toHaveURL(configuredUrl);
});

test("a shared theme carries into the editorial workspace and back", async ({ page }) => {
  await page.goto(studioPath + "?edition=editorial");
  await page.getByRole("navigation", { name: "Main", exact: true }).getByRole("link", { name: "Theme studio", exact: true }).click();
  await expect(page).toHaveURL(/#\/theme\?edition=editorial$/);
  await expect(page.getByRole("combobox", { name: "Theme", exact: true })).toHaveText("Custom theme");
  await page.getByRole("radio", { name: "Round", exact: true }).check();
  await expect(page).toHaveURL(/#\/theme\?brand=2945c7&corners=Round&type=Serif&rhythm=Airy&accent=454a70&edition=editorial$/);
  await page.getByRole("link", { name: "Open themed workspace" }).click();
  await expect(page.getByRole("heading", { level: 1, name: "Editorial workspace" })).toBeVisible();
  const previewControl = page.getByTestId("preview-toggle");
  const brand = () => previewControl.evaluate((element) => getComputedStyle(element).getPropertyValue("--elea-color-primary-500").trim());
  await expect.poll(brand).toBe("#2945c7");
  const readerText = page.getByTestId("viewer-pane").locator(".elea-paragraph").first();
  await expect(readerText).toHaveCSS("font-size", "20px");
  await expect(readerText).toHaveCSS("font-family", /serif/i);
  await page.reload();
  await expect.poll(brand).toBe("#2945c7");
  await page.getByRole("link", { name: "Edit theme", exact: true }).click();
  await expect(page).toHaveURL(/edition=editorial$/);
  await expect(page.getByRole("radio", { name: "Round", exact: true })).toBeChecked();

  await page.goto(`${studioPath}?brand=19634e&corners=Soft`);
  await expect(page.getByRole("region", { name: "Publication preview" })).toHaveCSS("--elea-color-primary-500", "#19634e");
  await expect(page.getByRole("combobox", { name: "Reading typeface" })).toHaveText("Serif");
  await expect(page.getByRole("combobox", { name: "Reading density" })).toHaveText("Balanced");
  await page.goto(`${studioPath}?brand=not-a-colour&corners=Round`);
  await expect(page.getByRole("combobox", { name: "Theme", exact: true })).toHaveText("Réserve");
});

test("the Studio previews the reference article while the Playground keeps the editable draft", async ({ page }) => {
  await page.goto(studioPath);
  const preview = page.getByRole("region", { name: "Publication preview" });
  const previewArticle = preview.getByRole("article");
  const openWorkspace = page.getByRole("link", { name: "Open themed workspace" });
  const draftTitle = page.getByTestId("editor-pane").getByRole("textbox", { name: "Your content title..." });
  const workspaceArticle = page.getByTestId("viewer-pane").getByRole("article");
  const editTheme = page.getByRole("link", { name: "Edit theme", exact: true });

  await expect(previewArticle.getByRole("img", { name: "Blue crevasses and white ridges seen from above a glacier" })).toBeVisible();
  await expect(previewArticle.getByText("Members", { exact: true })).toBeVisible();
  await expect(preview.getByRole("button")).toHaveCount(0);
  await expect(preview.getByRole("textbox")).toHaveCount(0);
  const reference = await previewArticle.innerHTML();
  await openWorkspace.click();
  await expect.poll(() => workspaceArticle.innerHTML()).toBe(reference);

  await draftTitle.fill("Ridges and ice");
  await expect(workspaceArticle.getByRole("heading", { name: "Ridges and ice" })).toBeVisible();
  await editTheme.click();
  await expect(previewArticle.getByRole("heading", { name: "The glacier notebook" })).toBeVisible();
  await expect.poll(() => previewArticle.innerHTML()).toBe(reference);
  await openWorkspace.click();
  await expect(draftTitle).toHaveValue("Ridges and ice");
  await expect(workspaceArticle.getByRole("heading", { name: "Ridges and ice" })).toBeVisible();
});

test("a product brings its own second colour, radius and font, shared through the URL", async ({ page }) => {
  await page.goto(studioPath + "?edition=precision");
  const preview = page.getByRole("region", { name: "Publication preview" });
  const article = preview.getByRole("article");
  const badge = article.getByText("Members", { exact: true });
  const radius = page.getByRole("textbox", { name: "Corner radius" });
  const radiusError = page.getByText("Use a length such as 10px or 0.625rem.");
  await radius.fill("10");
  await expect(radiusError).toBeVisible();
  await expect(radius).toBeFocused();
  await expect(radius).toHaveCSS("outline-width", "2px");
  await expect(radius).toHaveCSS("outline-style", "solid");
  await expect(radius).toHaveCSS("outline-offset", "-2px");
  await expect(radius).toHaveCSS("border-top-color", "rgba(0, 0, 0, 0)");
  await radius.blur();
  const errorBorder = await radius.evaluate(async (element) => {
    const style = getComputedStyle(element);
    await Promise.all(element.getAnimations().map(animation => animation.finished));
    return style.borderTopColor;
  });
  await radius.focus();
  await expect(radius).toHaveCSS("outline-color", errorBorder);
  await expect(page).toHaveURL(/#\/theme\?edition=precision$/);
  await radius.fill("10px");
  await expect(radiusError).toHaveCount(0);
  await expect(radius).not.toHaveCSS("outline-color", errorBorder);
  await expect(article).toHaveCSS("border-radius", "5px");
  await page.getByRole("textbox", { name: "Interface font" }).fill("Georgia, serif");
  await expect(badge).toHaveCSS("font-family", "Georgia, serif");
  await setThemeColours(page, { secondary: "#0f766e" });
  await expect(article).toHaveCSS("--elea-color-secondary-500", "#0f766e");
  await expect(page).toHaveURL(/rhythm=Balanced&accent=0f766e&radius=10px&font=Georgia%2C\+serif&edition=precision$/);
  await page.reload();
  await expect(article).toHaveCSS("border-radius", "5px");
  await expect(article).toHaveCSS("--elea-color-secondary-500", "#0f766e");
  await expect(radius).toHaveValue("10px");
  await page.getByRole("link", { name: "Open themed workspace" }).click();
  const editorControl = page.getByTestId("preview-toggle");
  await expect(editorControl).toHaveCSS("font-family", "Georgia, serif");
  await expect(editorControl).toHaveCSS("border-radius", "7.5px");
  await expect(editorControl).toHaveCSS("--elea-color-secondary-500", "#0f766e");
  await page.getByRole("link", { name: "Edit theme", exact: true }).click();
  await page.goto(studioPath + "?edition=precision");
  await expect(radius).toHaveValue("");
  await expect(article).toHaveCSS("border-radius", "4px");
});

for (const colorScheme of ["light", "dark"] as const) {
  test(`editions keep their control scale and Tabs treatment with one identity in ${colorScheme}`, async ({ page }) => {
    test.setTimeout(60_000);
    await page.emulateMedia({ colorScheme });
    const [tokens, ui] = await Promise.all([
      readFile(new URL(import.meta.resolve("@alien6-studio/elea-tokens/elea.css")), "utf8"),
      readFile(new URL(import.meta.resolve("@alien6-studio/elea-ui/styles.css")), "utf8"),
    ]);
    const consumer = await page.context().newPage();
    const origin = "https://elea-editions.test";
    await consumer.route(`${origin}/elea.css`, (route) =>
      route.fulfill({ contentType: "text/css", body: `${tokens}\n${ui}` }));
    const exports = new Map<string, string>();
    let fixedPalette = "";
    await consumer.route(url => url.origin === origin && url.pathname === "/theme.css", (route) => {
      const theme = new URL(route.request().url()).searchParams.get("edition") ?? "";
      return route.fulfill({ contentType: "text/css", body: exports.get(theme) });
    });
    await consumer.route(`${origin}/palette.css`, (route) =>
      route.fulfill({ contentType: "text/css", body: fixedPalette }));
    const tabsMarkup = (label: string, attribute = "") =>
      `<div role="tablist" aria-label="${label}" class="elea-tabs__list" ${attribute}>
        <button class="elea-tabs__tab" role="tab" aria-selected="true">Details</button>
        <button class="elea-tabs__tab" role="tab" aria-selected="false">Revisions</button>
      </div>`;
    await consumer.route(`${origin}/**`, async (route) => {
      const { pathname, searchParams } = new URL(route.request().url());
      if (pathname !== "/") return route.fallback();
      return route.fulfill({ contentType: "text/html", body: `<!doctype html>
        <html lang="en" data-theme="${colorScheme}" style="color-scheme:${colorScheme}">
        <link rel="stylesheet" href="/elea.css">
        <link rel="stylesheet" href="/theme.css?edition=${searchParams.get("edition")}">
        <link rel="stylesheet" href="/palette.css">
        <main data-elea-theme="brand" style="font-family:var(--elea-font-family-sans)">
          <button class="elea-button elea-button--primary elea-button--md">Primary</button>
          <button class="elea-button elea-button--outline elea-button--md">Outline</button>
          <article class="elea-card elea-card--elevated">Article</article>
          ${tabsMarkup("Default")}
          ${tabsMarkup("Explicit", 'data-elea-tabs="underline"')}
        </main>
        <section style="--elea-control-height:46px;--elea-control-font-size:15px;--elea-control-focus-outline:3px dashed green;--elea-control-surface:#eee">
          <div data-elea-theme="brand">
            <input class="elea-ui-input elea-ui-input--sm" aria-label="Host override">
          </div>
        </section>` });
    });
    const fingerprints = [];
    const gallery = page.locator(".catalog-demos");
    const index = page.getByRole("navigation", { name: "Component index" });
    const measure = async (controls: Locator) => {
      await expect(controls.first()).toBeVisible();
      return controls.evaluateAll(elements => elements.map(element => {
        const { height, fontSize } = getComputedStyle(element);
        return { height: parseFloat(height), fontSize: parseFloat(fontSize) };
      }));
    };
    const tabTreatment = (list: Locator) => list.getByRole("tab", { selected: true }).evaluate(tab => {
      const { borderBlockStartWidth, borderInlineEndWidth, boxShadow } = getComputedStyle(tab);
      return { borderBlockStartWidth, borderInlineEndWidth, boxShadow, indicator: getComputedStyle(tab, "::after").display };
    });

    for (const [edition, heights] of [
      ["Precision", [24, 32, 40, 48, 56]],
      ["Editorial", [26, 34, 42, 50, 58]],
      ["Obsidian", [24, 30, 38, 46, 54]],
    ] as const) {
      await page.goto(studioPath + "?edition=" + edition.toLowerCase());
      await setThemeColours(page, { primary: "#364f75", secondary: "#535a66" });
      await page.getByRole("textbox", { name: "Interface font" }).fill("Arial, sans-serif");
      await page.getByRole("combobox", { name: "Reading typeface" }).click();
      await page.getByRole("option", { name: "Sans", exact: true }).click();
      await page.getByRole("combobox", { name: "Reading density" }).click();
      await page.getByRole("option", { name: "Balanced", exact: true }).click();
      await page.getByRole("textbox", { name: "Corner radius" }).fill("8px");
      const [download] = await Promise.all([
        page.waitForEvent("download"),
        page.getByRole("link", { name: /Download CSS/ }).click(),
      ]);
      const file = await download.path();
      if (!file) throw new Error("Expected an exported theme");
      const css = await readFile(file, "utf8");
      exports.set(edition, css);
      if (edition === "Precision") {
        // Use Precision’s entire palette for this separate consumer, including
        // its neutral surfaces and feedback colours.
        fixedPalette = css.replace(/^\s*--elea-(?!color-|brand-)[^;]+;$/gm, "");
      }

      await page.getByRole("link", { name: "Open themed gallery" }).click();
      await page.getByRole("link", { name: "Button", exact: true }).click();
      const sizes = gallery.locator(".demo").filter({ has: page.getByRole("heading", { name: "Sizes and icons" }) });
      const buttons = await measure(sizes.locator("button:not(.elea-button--icon)").filter({ visible: true }));
      expect(buttons.map(control => control.height)).toEqual(heights);
      expect(buttons.map(control => control.fontSize)).toEqual([12, 14, 16, 18, 20]);
      await expect(sizes.getByRole("button", { name: "Add", exact: true })).toHaveCSS("width", "44px");
      await expect(sizes.getByRole("button", { name: "Add item", exact: true })).toHaveCSS("width", `${heights[2]}px`);

      await index.getByRole("link", { name: "Field, Input, Textarea", exact: true }).click();
      const fields = gallery.locator(".demo").filter({ has: page.getByRole("heading", { name: "Textarea and sizes" }) });
      expect(await measure(fields.locator("input"))).toEqual(buttons.slice(1, 4));
      await index.getByRole("link", { name: "Select", exact: true }).click();
      expect(await measure(gallery.getByRole("combobox", { name: "Language", exact: true }).first())).toEqual([buttons[2]]);
      expect(await measure(gallery.getByRole("combobox", { name: "Language, small", exact: true }))).toEqual([buttons[1]]);
      await index.getByRole("link", { name: "Tabs", exact: true }).click();
      const automatic = await tabTreatment(gallery.getByRole("tablist", { name: "Article information" }));
      expect(automatic.indicator).toBe(edition === "Editorial" ? "block" : "none");
      expect(automatic.borderBlockStartWidth).toBe({ Precision: "1px", Editorial: "0px", Obsidian: "2px" }[edition]);
      await expect(gallery.getByRole("tablist", { name: "Article sections" })).toHaveCSS("padding-top", "3px");
      await expect(gallery.getByRole("tablist", { name: "Comments" })).toHaveCSS("column-gap", "0px");

      await consumer.goto(`${origin}/?edition=${edition}`);
      const primary = consumer.getByRole("button", { name: "Primary", exact: true });
      await expect(primary).toHaveCSS("background-color", "rgb(54, 79, 117)");
      await expect(primary).toHaveCSS("font-family", "Arial, sans-serif");
      await expect(primary).toHaveCSS("height", `${heights[2]}px`);
      await expect(consumer.locator("main")).toHaveCSS("--elea-color-surface-default", colorScheme === "light" ? "#ffffff" : "#11161e");
      const renderedTabs = await tabTreatment(consumer.getByRole("tablist", { name: "Default" }));
      expect(renderedTabs).toMatchObject({ indicator: automatic.indicator, borderBlockStartWidth: automatic.borderBlockStartWidth });
      expect((await tabTreatment(consumer.getByRole("tablist", { name: "Explicit" }))).indicator).toBe("block");
      const override = consumer.getByRole("textbox", { name: "Host override" });
      await override.focus();
      await expect(override).toHaveCSS("height", "46px");
      await expect(override).toHaveCSS("font-size", "15px");
      await expect(override).toHaveCSS("background-color", "rgb(238, 238, 238)");
      await expect(override).toHaveCSS("outline-color", "rgb(0, 128, 0)");
      await expect(override).toHaveCSS("outline-style", "dashed");
      await expect(override).toHaveCSS("outline-width", "3px");
      fingerprints.push(await consumer.getByRole("article").evaluate(card => getComputedStyle(card).boxShadow));
    }
    expect(new Set(fingerprints).size).toBe(3);
    await consumer.close();
  });
}
