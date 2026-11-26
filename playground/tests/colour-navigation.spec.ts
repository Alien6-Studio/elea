import { expect, test, type Locator } from "@playwright/test";
import { textContrast } from "./contrast.js";

const coloursUrl = "/elea/colours/?edition=editorial";
const directions = [
  { name: "Rasance", id: "rasance", primary: "rgb(24, 24, 23)", type: "Sans", density: "Balanced", corners: "Square" },
  { name: "Réserve", id: "reserve", primary: "rgb(41, 38, 191)", type: "Sans", density: "Compact", corners: "Square" },
  { name: "Braise", id: "braise", primary: "rgb(240, 170, 112)", type: "Serif", density: "Airy", corners: "Soft" },
  { name: "Hors champ", id: "hors-champ", primary: "rgb(52, 77, 84)", type: "Sans", density: "Airy", corners: "Soft" },
  { name: "Hors registre", id: "hors-registre", primary: "rgb(238, 118, 46)", type: "Sans", density: "Balanced", corners: "Square" },
  { name: "Échappée", id: "echappee", primary: "rgb(196, 40, 50)", type: "Sans", density: "Compact", corners: "Soft" },
  { name: "Grand bain", id: "grand-bain", primary: "rgb(41, 138, 196)", type: "Sans", density: "Airy", corners: "Square" },
  { name: "Ponctuation", id: "ponctuation", primary: "rgb(237, 187, 40)", type: "Mono", density: "Compact", corners: "Round" },
  { name: "Lisière", id: "lisiere", primary: "rgb(34, 111, 104)", type: "Serif", density: "Airy", corners: "Soft" },
];
const surfaces = {
  light: { paper: "rgb(255, 255, 255)", panel: "rgb(244, 244, 244)", muted: "rgb(232, 232, 232)" },
  dark: { paper: "rgb(21, 21, 21)", panel: "rgb(33, 33, 33)", muted: "rgb(44, 44, 44)" },
};
const roleNames = ["Primary", "Secondary", "Tertiary", "Success", "Info", "Warning", "Danger"] as const;

async function selectNextDirection(carousel: Locator, name: string) {
  await expect(carousel).toBeVisible();
  const choice = carousel.getByRole("button", { name, exact: true });
  if (!await choice.count()) await carousel.getByRole("button", { name: "Next themes" }).click();
  await choice.click();
  return choice;
}

for (const mode of ["light", "dark"] as const) {
  test(`Réserve follows the public journey from the homepage to the Studio in ${mode}`, async ({ page }) => {
    await page.emulateMedia({ colorScheme: mode });
    const primary = "rgb(41, 38, 191)";
    const link = mode === "light" ? "rgb(34, 32, 159)" : "rgb(163, 162, 227)";
    const body = page.locator("body");
    await page.goto("/elea/");
    await expect(body).toHaveCSS("background-color", surfaces[mode].paper);
    await expect(page.getByRole("link", { name: "Explore components" })).toHaveCSS("background-color", primary);
    await page.getByRole("link", { name: "Read the docs" }).click();
    await expect(body).toHaveCSS("background-color", surfaces[mode].paper);
    await expect(page.getByRole("article").getByRole("link", { name: "editorial workspace" })).toHaveCSS("color", link);

    await page.getByRole("navigation", { name: "Main", exact: true }).getByRole("link", { name: "Components", exact: true }).click();
    const buttonGuide = page.getByRole("link", { name: "Button", exact: true });
    const buttonCard = page.getByRole("article").filter({ has: buttonGuide });
    await expect(buttonCard.locator(".gallery__preview")).toHaveCSS("background-color", surfaces[mode].panel);
    await buttonGuide.click();
    await expect(page.getByRole("button", { name: "Primary", exact: true })).toHaveCSS("background-color", primary);
    await page.getByRole("link", { name: "Edit theme", exact: true }).click();
    await expect(page.getByRole("combobox", { name: "Theme", exact: true })).toHaveText("Réserve");
    await expect(page.getByRole("link", { name: "Open themed gallery" })).toHaveCSS("background-color", primary);
    await expect(page.getByRole("region", { name: "Publication preview" }).getByRole("article"))
      .toHaveCSS("background-color", surfaces[mode].paper);
    await page.getByRole("link", { name: "Edit colours", exact: true }).click();
    await expect(page.getByRole("button", { name: "Réserve", exact: true })).toHaveAttribute("aria-pressed", "true");
    await expect(page.getByRole("gridcell", { name: "Primary 500", exact: true })).toHaveCSS("background-color", primary);
  });

  test(`the colour directions paint their action and reading surface in ${mode}`, async ({ page }) => {
    await page.emulateMedia({ colorScheme: mode });
    if (mode === "dark") await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(coloursUrl);
    const choices = page.getByRole("region", { name: "Colour themes" });
    const roles = page.getByRole("region", { name: "Colour roles" });
    for (const direction of directions) {
      const choice = await selectNextDirection(choices, direction.name);
      await choice.locator("img").evaluate((image: HTMLImageElement) => image.decode());
      await expect(choice).toHaveAttribute("aria-pressed", "true");
      await expect(choices.getByRole("button", { pressed: true })).toHaveCount(1);
      await expect(page).toHaveURL(new RegExp("\\?scheme=" + direction.id + "$"));
      await expect(roles.locator(".atlas-role--primary")).toHaveCSS("background-color", direction.primary);
      await expect(roles.getByText("Surface", { exact: true }).locator("..")).toHaveCSS("background-color", surfaces[mode].paper);
    }
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(page.viewportSize()!.width);
  });

  test(`Studio, gallery and Button guides share neutral surfaces in ${mode}`, async ({ page }) => {
    await page.emulateMedia({ colorScheme: mode, reducedMotion: "reduce" });
    const neutral = surfaces[mode];
    await page.goto("/elea/playground/#/theme");
    const theme = page.getByRole("combobox", { name: "Theme", exact: true });
    const reader = page.getByRole("region", { name: "Publication preview" }).getByRole("article");
    for (const profile of directions) {
      await theme.click();
      await page.getByRole("option", { name: profile.name, exact: true }).click();
      await expect(reader).toHaveCSS("background-color", neutral.paper);
      await expect(page.locator(".studio-workbench")).toHaveCSS("background-color", neutral.paper);
      await expect(page.locator("#studio-canvas")).toHaveCSS("background-color", neutral.panel);
      expect(await textContrast(reader.locator(".elea-paragraph").first())).toBeGreaterThanOrEqual(4.5);
      await theme.click();
      const menu = page.getByRole("listbox", { name: "Theme", exact: true });
      await expect(menu).toHaveCSS("background-color", neutral.paper);
      const selected = menu.getByRole("option", { name: profile.name, selected: true });
      await expect(selected).toHaveCSS("background-color", neutral.muted);
      expect(await textContrast(selected)).toBeGreaterThanOrEqual(4.5);
      await page.keyboard.press("Escape");
      await page.getByRole("link", { name: "Open themed gallery", exact: true }).click();
      const card = page.getByRole("article").filter({ has: page.getByRole("link", { name: "Button", exact: true }) });
      await expect(card.locator(".gallery__preview")).toHaveCSS("background-color", neutral.panel);
      await card.getByRole("link", { name: "Button", exact: true }).click();
      const primary = page.getByRole("button", { name: "Primary", exact: true });
      await expect(page.locator(".demo__stage").filter({ has: primary })).toHaveCSS("background-color", neutral.panel);
      await expect(primary).toHaveCSS("background-color", profile.primary);
      expect(await textContrast(primary.locator(".elea-button__label"))).toBeGreaterThanOrEqual(4.5);
      const sizes = page.locator(".demo").filter({ has: page.getByRole("heading", { name: "Sizes and icons" }) });
      const disc = sizes.getByRole("button", { name: "Add", exact: true });
      // The disc is a light control on photography in both appearances.
      await expect(disc).toHaveCSS("background-color", surfaces.light.panel);
      await disc.hover();
      await expect(disc).toHaveCSS("background-color", surfaces.light.muted);
      expect(await textContrast(disc)).toBeGreaterThanOrEqual(3);
      await page.getByRole("link", { name: "Edit theme", exact: true }).click();
    }
  });
}

test("a shared custom surface still takes precedence over the profile", async ({ page }) => {
  const reader = page.getByRole("region", { name: "Publication preview" }).getByRole("article");
  for (const [mode, colour] of [["light", "rgb(247, 232, 225)"], ["dark", "rgb(50, 31, 46)"]] as const) {
    await page.emulateMedia({ colorScheme: mode });
    await page.goto("/elea/playground/#/theme?edition=editorial&scheme=braise&neutral=madder");
    await expect(reader).toHaveCSS("background-color", colour);
    await page.getByRole("link", { name: "Open themed gallery" }).click();
    await page.getByRole("link", { name: /Edit theme in Theme Studio/i }).click();
    await expect(reader).toHaveCSS("background-color", colour);
  }
});

test("a shared direction opens in the studio, and editing one ink preserves the other roles and the surface", async ({ page }) => {
  await page.emulateMedia({ colorScheme: "dark" });
  await page.goto("/elea/colours/?scheme=braise");
  const braise = page.getByRole("button", { name: "Braise", exact: true });
  await expect(braise).toHaveAttribute("aria-pressed", "true");
  const roles = page.getByRole("region", { name: "Colour roles" });
  const sample = (name: string) => roles.locator(".atlas-role--" + name);
  const untouched = ["primary", "secondary", "success", "info", "warning", "danger"];
  const previousFills = await Promise.all(untouched.map(name => sample(name).evaluate(element => getComputedStyle(element).backgroundColor)));
  await page.getByRole("link", { name: "Open theme studio" }).click();
  await expect(page.getByRole("region", { name: "Publication preview" }).getByRole("article"))
    .toHaveCSS("background-color", surfaces.dark.paper);
  await page.getByRole("link", { name: "Edit colours" }).click();
  await page.getByRole("combobox", { name: "Colour role" }).click();
  await page.getByRole("option", { name: "Tertiary", exact: true }).click();
  await page.getByRole("textbox", { name: "Tertiary hex" }).fill("#748191");
  await page.getByRole("textbox", { name: "Tertiary hex" }).press("Enter");
  await page.reload();
  await expect(braise).toHaveAttribute("aria-pressed", "false");
  for (const [index, name] of untouched.entries()) {
    await expect(sample(name)).toHaveCSS("background-color", previousFills[index]!);
  }
  await expect(roles.getByText("Surface", { exact: true }).locator("..")).toHaveCSS("background-color", surfaces.dark.paper);
  await expect(sample("tertiary")).toHaveCSS("background-color", "rgb(116, 129, 145)");
  await page.getByRole("link", { name: "Open theme studio" }).click();
  await expect(page.getByRole("combobox", { name: "Theme", exact: true })).toHaveText("Braise (customised)");
  await page.getByRole("link", { name: "Open themed gallery" }).click();
  await page.getByRole("link", { name: "Button", exact: true }).click();
  await expect(page.getByRole("button", { name: "Tertiary", exact: true }))
    .toHaveCSS("background-color", "rgb(116, 129, 145)");
});

test("the atlas follows the theme and keeps reference families available separately", async ({ page }) => {
  await page.goto(coloursUrl + "&scheme=rasance");
  const atlas = page.getByRole("region", { name: "Colour atlas" });
  const grid = atlas.getByRole("grid", { name: "Theme colours" });
  const primary = grid.getByRole("gridcell", { name: "Primary 500", exact: true });
  const reference = atlas.getByRole("tab", { name: "Reference families" });
  const roles = page.getByRole("region", { name: "Colour roles" });
  const themes = page.getByRole("region", { name: "Colour themes" });
  for (const direction of directions) {
    await selectNextDirection(themes, direction.name);
    await expect(atlas.getByRole("tab", { name: "Theme palette" })).toHaveAttribute("aria-selected", "true");
    await expect(atlas.getByRole("heading", { name: direction.name, exact: true })).toBeVisible();
    await expect(primary).toHaveAttribute("aria-selected", "true");
    await expect(atlas.getByRole("heading", { name: "Primary 500" })).toBeVisible();
    await expect(grid.getByRole("gridcell")).toHaveCount(88);
    for (const name of roleNames) {
      const shown = await roles.locator(".atlas-role--" + name.toLowerCase()).evaluate(el => getComputedStyle(el).backgroundColor);
      await expect(grid.getByRole("gridcell", { name: name + " 500", exact: true })).toHaveCSS("background-color", shown);
    }
    await expect(grid.getByRole("gridcell", { name: "Surface 50", exact: true })).toHaveCSS("background-color", surfaces.light.paper);
    await expect(grid.getByRole("gridcell", { name: "Surface 950", exact: true })).toHaveCSS("background-color", surfaces.dark.paper);
    await primary.focus();
    await primary.press("ArrowDown");
    await expect(grid.getByRole("gridcell", { name: "Secondary 500" })).toBeFocused();
    await reference.click();
    await expect(atlas.getByRole("grid", { name: "Reference colours" }).getByRole("gridcell")).toHaveCount(176);
  }
});

test("the mobile theme carousel browses independently of the applied theme", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(coloursUrl + "&scheme=braise");
  const carousel = page.getByRole("region", { name: "Colour themes" });
  const next = carousel.getByRole("button", { name: "Next themes" });
  const previous = carousel.getByRole("button", { name: "Previous themes" });
  const braise = carousel.getByRole("button", { name: "Braise", exact: true });
  await expect(braise).toHaveAttribute("aria-pressed", "true");
  const show = (name: string) => carousel.getByRole("button", { name: "Show themes starting at " + name, exact: true });
  await expect(show("Braise")).toHaveAttribute("aria-current", "true");
  await show("Hors champ").click();
  await expect(show("Hors champ")).toHaveAttribute("aria-current", "true");
  await expect(carousel.getByRole("button", { name: "Hors champ", exact: true })).toHaveAttribute("aria-pressed", "false");
  await expect(page).toHaveURL(/scheme=braise$/);
  await show("Braise").click();
  await expect(carousel.getByRole("button", { pressed: true })).toHaveCount(1);
  await previous.click();
  const reserve = carousel.getByRole("button", { name: "Réserve", exact: true });
  await expect(reserve).toHaveAttribute("aria-pressed", "false");
  await expect(braise).toHaveCount(0);
  await expect(page).toHaveURL(/scheme=braise$/);
  await next.press("End");
  await expect(carousel.getByRole("button", { name: "Lisière", exact: true })).toBeVisible();
  await previous.press("Home");
  await expect(carousel.getByRole("button", { name: "Rasance", exact: true })).toBeVisible();
  await expect(page).toHaveURL(/scheme=braise$/);
  await next.click();
  await reserve.click();
  await expect(page).toHaveURL(/scheme=reserve$/);
  await expect(reserve).toHaveAttribute("aria-pressed", "true");
});

test("choosing a colour theme in the mobile Studio updates the preview and survives navigation", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.emulateMedia({ colorScheme: "light" });
  await page.goto("/elea/playground/#/theme");
  const selector = page.getByRole("combobox", { name: "Theme", exact: true });
  const preview = page.getByRole("region", { name: "Publication preview" }).getByRole("article");
  await expect(selector).toHaveText("Réserve");
  await selector.click();
  for (const direction of directions) await expect(page.getByRole("option", { name: direction.name, exact: true })).toBeVisible();
  await expect(page.getByRole("option")).toHaveCount(directions.length);
  await page.getByRole("option", { name: "Rasance", exact: true }).click();
  await expect(page).toHaveURL(/\?scheme=rasance$/);
  await expect(preview).toHaveCSS("background-color", surfaces.light.paper);
  await page.reload();
  await expect(selector).toHaveText("Rasance");
  const css = decodeURIComponent((await page.getByRole("link", { name: "Download CSS" }).getAttribute("href"))!);
  expect(css).toContain("--elea-color-primary-500: #181817");
  await page.getByRole("link", { name: "Edit colours" }).click();
  await expect(page.getByRole("button", { name: "Rasance", exact: true })).toHaveAttribute("aria-pressed", "true");
  await page.getByRole("link", { name: "Open theme studio" }).click();
  await selector.click();
  await page.getByRole("option", { name: "Réserve", exact: true }).click();
  await expect(page).toHaveURL(/\?scheme=reserve$/);
  await expect(preview).toHaveCSS("background-color", surfaces.light.paper);
});

test("each Studio profile sets its reading typeface, density and shape", async ({ page }) => {
  await page.goto("/elea/playground/#/theme");
  const selector = page.getByRole("combobox", { name: "Theme", exact: true });
  await expect(page.getByRole("group", { name: "Theme presets" })).toHaveCount(0);
  for (const profile of directions) {
    await selector.click();
    await page.getByRole("option", { name: profile.name, exact: true }).click();
    await expect(selector).toHaveText(profile.name);
    await expect(page.getByRole("combobox", { name: "Reading typeface" })).toHaveText(profile.type);
    await expect(page.getByRole("combobox", { name: "Reading density" })).toHaveText(profile.density);
    await expect(page.getByRole("radio", { name: "Theme shape" })).toBeChecked();
    await expect(page.getByRole("radio", { name: profile.corners })).not.toBeChecked();
  }
});

test("a classic corner or custom radius overrides a profile shape and survives sharing", async ({ page }) => {
  await page.goto("/elea/playground/#/theme?scheme=reserve");
  const signature = page.getByRole("radio", { name: "Theme shape" });
  const square = page.getByRole("radio", { name: "Square", exact: true });
  const radius = page.getByRole("textbox", { name: "Corner radius" });
  const gallery = page.getByRole("link", { name: "Open themed gallery" });
  const imprint = await gallery.evaluate(el => getComputedStyle(el).borderRadius);
  expect(imprint).not.toBe("0px");

  await square.check();
  await expect(page).toHaveURL(/scheme=reserve&corners=Square$/);
  await expect(gallery).toHaveCSS("border-radius", "0px");
  await gallery.click();
  await page.getByRole("link", { name: "Button", exact: true }).click();
  await page.reload();
  await expect(page.getByRole("button", { name: "Primary", exact: true })).toHaveCSS("border-radius", "0px");
  await page.getByRole("link", { name: "Edit theme", exact: true }).click();
  await expect(square).toBeChecked();
  await signature.check();
  await expect(page).toHaveURL(/scheme=reserve$/);

  await radius.fill("12px");
  await expect(page).toHaveURL(/scheme=reserve&radius=12px$/);
  await page.reload();
  await expect(signature).not.toBeChecked();
  await expect(radius).toHaveValue("12px");
  await expect(gallery).toHaveCSS("border-radius", "9px");
  await radius.fill("");
  await expect(signature).toBeChecked();
  await expect(gallery).toHaveCSS("border-radius", imprint);
});

test("a shared colour scheme can carry an independent shape without changing its legacy edition", async ({ page }) => {
  const studio = "/elea/playground/#/theme?edition=precision&scheme=braise";
  const gallery = page.getByRole("link", { name: "Open themed gallery" });
  await page.goto(studio);
  await expect(page.getByRole("radio", { name: "Soft" })).toBeChecked();
  await expect(gallery).toHaveCSS("border-radius", "6px");
  await page.goto(studio + "&shape=reserve");
  await expect(page.getByRole("radio", { name: "Réserve" })).toBeChecked();
  await expect(gallery).toHaveCSS("background-color", "rgb(240, 170, 112)");
  const imprint = await gallery.evaluate(el => getComputedStyle(el).borderRadius);
  expect(imprint).not.toBe("6px");
  await gallery.click();
  await page.getByRole("link", { name: "Button", exact: true }).click();
  await expect(page).toHaveURL(/edition=precision&scheme=braise&shape=reserve$/);
  await page.reload();
  await expect(page.getByRole("button", { name: "Primary", exact: true })).toHaveCSS("border-radius", imprint);
});

test("earlier shared colour schemes still render their own primary and keep their studio link", async ({ page }) => {
  for (const [id, fill] of [
    ["fjord", "rgb(40, 94, 112)"], ["cyanotype", "rgb(36, 77, 113)"],
    ["signal", "rgb(76, 55, 202)"], ["vellum", "rgb(33, 31, 28)"],
  ] as const) {
    await page.goto(coloursUrl + "&scheme=" + id);
    await expect(page.getByRole("region", { name: "Colour roles" }).locator(".atlas-role--primary"))
      .toHaveCSS("background-color", fill);
    await expect(page.getByRole("link", { name: "Open theme studio" }))
      .toHaveAttribute("href", new RegExp("edition=editorial&scheme=" + id + "$"));
  }
});

test("the Colours public URL keeps the palette through navigation and browser history", async ({ page }) => {
  await page.emulateMedia({ colorScheme: "dark" });
  await page.goto("/elea/typography/");
  await page.goto("/elea/colours/?edition=editorial&primary=ruby-700");

  const nav = page.getByRole("navigation", { name: "Main", exact: true });
  const colours = nav.getByRole("link", { name: "Colours", exact: true });
  await expect(page).toHaveURL(/\/playground\/#\/colours\?edition=editorial&primary=ruby-700$/);
  await expect(page).toHaveTitle("Colours · Elea");
  await expect(colours).toHaveAttribute("aria-current", "true");
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  const coloursUrl = page.url();

  await nav.getByRole("link", { name: "Components", exact: true }).click();
  await expect(page).toHaveURL(/#\/ui\?.*primary=ruby-700/);
  await page.goBack();
  await expect(page).toHaveURL(coloursUrl);
  await expect(page.getByRole("heading", { name: "Colours", level: 1 })).toBeVisible();
  await page.goForward();
  await expect(nav.getByRole("link", { name: "Components", exact: true })).toHaveAttribute("aria-current", "true");
  await page.goBack();
  await page.goBack();
  await expect(page).toHaveURL(/\/elea\/typography\/$/);
});
